const axios = require("axios");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const { fromPath } = require("pdf2pic");
const Tesseract = require("tesseract.js");

const OLLAMA_URL = "http://127.0.0.1:11434/api/generate";
const MODEL = "llama3.2:1b";
const TIMEOUT = 180000; // 3 minutes

/* ------------------ Utils ------------------ */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ------------------ Ollama Warmup ------------------ */

const warmUpOllama = async () => {
  try {
    await axios.post(
      OLLAMA_URL,
      {
        model: MODEL,
        prompt: "hello",
        stream: false,
        options: { num_predict: 5 },
      },
      { timeout: 30000 }
    );
    console.log("🔥 Ollama warmed up");
  } catch {
    console.warn("⚠️ Ollama warmup skipped");
  }
};

warmUpOllama();

/* ------------------ Ollama Call ------------------ */

const callOllama = async (prompt, maxTokens = 300, retry = true) => {
  try {
    const response = await axios.post(
      OLLAMA_URL,
      {
        model: MODEL,
        prompt,
        stream: false,
        options: {
          temperature: 0.6,
          num_predict: maxTokens,
          num_ctx: 2048,
        },
      },
      { timeout: TIMEOUT }
    );

    return response.data.response || "";
  } catch (err) {
    // Retry once on timeout
    if (retry && err.code === "ECONNABORTED") {
      console.warn("⏱️ Ollama timeout — retrying once...");
      return callOllama(prompt, Math.floor(maxTokens * 0.7), false);
    }

    console.error("❌ Ollama error:", err.message);
    throw new Error(`AI processing failed: ${err.message}`);
  }
};

/* ------------------ PDF Text Extraction ------------------ */

const extractPDFText = async (pdfPath, maxPages = 5) => {
  try {
    const buffer = fs.readFileSync(pdfPath);
    const parsed = await pdfParse(buffer);

    if (parsed.text && parsed.text.trim().length > 100) {
      console.log(`✅ PDF text extracted (${parsed.text.length} chars)`);
      return parsed.text.slice(0, 15000);
    }

    console.log("⚠️ No text found — using OCR");

    const tempDir = `/tmp/pdf-ocr-${Date.now()}`;
    fs.mkdirSync(tempDir, { recursive: true });

    const convert = fromPath(pdfPath, {
      density: 150,
      saveFilename: "page",
      savePath: tempDir,
      format: "png",
      width: 1200,
      height: 1600,
    });

    let ocrText = "";
    const pages = Math.min(maxPages, 3);

    for (let i = 1; i <= pages; i++) {
      try {
        console.log(`📄 OCR page ${i}/${pages}`);
        const page = await convert(i);
        const result = await Tesseract.recognize(page.path, "eng", {
          logger: () => {},
        });
        ocrText += result.data.text + "\n\n";
        await sleep(500); // prevent CPU overload
      } catch {
        break;
      }
    }

    fs.rmSync(tempDir, { recursive: true, force: true });

    return ocrText.slice(0, 15000);
  } catch (err) {
    console.error("❌ PDF extraction error:", err);
    throw new Error("Failed to extract text from PDF");
  }
};

/* ------------------ AI Features ------------------ */

const generateSummary = async (text) => {
  const shortText = text.slice(0, 4000);
  const prompt = `Summarize the following text in exactly 5 sentences:\n\n${shortText}`;
  return callOllama(prompt, 200);
};

const extractKeyPoints = async (text) => {
  const shortText = text.slice(0, 4000);
  const prompt = `List 5 key points from the following text as bullet points:\n\n${shortText}`;
  return callOllama(prompt, 250);
};

const generateQuiz = async (text, numberOfQuestions = 5) => {
  // Use sufficient text for context
  const analysisText = text.slice(0, 8000);
  
  // Simplified, more direct prompt
  const prompt = `Create ${numberOfQuestions} multiple choice questions from this text.

Return as JSON array only:
[{"question":"What is discussed?","options":["A","B","C","D"],"correctAnswer":0,"explanation":"Why"}]

Text:
${analysisText}`;

  try {
    console.log("🎯 Attempting AI quiz generation...");
    const response = await callOllama(prompt, 1500);
    
    // Multiple parsing attempts
    let parsed = tryParseJSON(response);
    
    if (parsed && Array.isArray(parsed) && parsed.length > 0) {
      const validQuestions = validateAndCleanQuestions(parsed, numberOfQuestions);
      
      if (validQuestions.length > 0) {
        console.log(`✅ AI generated ${validQuestions.length} valid questions`);
        return validQuestions;
      }
    }
    
    console.log("⚠️ AI parse failed, using intelligent fallback");
    return generateIntelligentQuiz(text, numberOfQuestions);
    
  } catch (error) {
    console.error("❌ Quiz error:", error.message);
    return generateIntelligentQuiz(text, numberOfQuestions);
  }
};

// Helper function to try parsing JSON
const tryParseJSON = (response) => {
  // Try 1: Direct parse
  try {
    const parsed = JSON.parse(response);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {}
  
  // Try 2: Extract array
  const arrayMatch = response.match(/\[\s*\{[\s\S]*?\}\s*\]/);
  if (arrayMatch) {
    try {
      return JSON.parse(arrayMatch[0]);
    } catch (e) {}
  }
  
  // Try 3: Clean and extract
  const cleaned = response
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .replace(/\n/g, ' ')
    .trim();
  
  const match = cleaned.match(/\[[\s\S]*\]/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch (e) {}
  }
  
  return null;
};

// Helper to validate questions
const validateAndCleanQuestions = (questions, limit) => {
  return questions
    .filter(q => 
      q &&
      q.question &&
      q.question.length > 10 &&
      Array.isArray(q.options) &&
      q.options.length === 4 &&
      q.options.every(opt => opt && opt.length > 1) &&
      typeof q.correctAnswer === 'number' &&
      q.correctAnswer >= 0 &&
      q.correctAnswer < 4
    )
    .slice(0, limit);
};

// Intelligent quiz generator from actual content
const generateIntelligentQuiz = (text, numberOfQuestions) => {
  console.log("🧠 Creating content-based quiz questions");
  
  const questions = [];
  
  // Extract key information
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 40 && s.length < 300);
  
  const paragraphs = text
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 100);
  
  // Extract potential topics/keywords
  const words = text.toLowerCase().split(/\W+/);
  const wordFreq = {};
  words.forEach(word => {
    if (word.length > 5) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });
  
  const commonWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);
  
  // Question Type 1: Main Topic Questions
  if (paragraphs.length > 0) {
    const mainParagraph = paragraphs[0];
    const topic = commonWords[0] || "main topic";
    
    questions.push({
      question: `What is the primary focus of this document?`,
      options: [
        `Discussion about ${topic} and related concepts`,
        "Historical events from ancient times",
        "Mathematical equations and formulas",
        "Fictional story and characters"
      ],
      correctAnswer: 0,
      explanation: `The document primarily discusses ${topic} based on content analysis.`
    });
  }
  
  // Question Type 2: Content Comprehension
  for (let i = 0; i < Math.min(2, sentences.length); i++) {
    const sentence = sentences[i];
    const words = sentence.split(/\s+/);
    
    if (words.length > 8) {
      // Create a fill-in-the-blank style question
      const keywordIndex = Math.floor(words.length / 2);
      const keyword = words[keywordIndex];
      const questionText = sentence.replace(keyword, "______");
      
      // Generate distractors
      const otherWords = commonWords.filter(w => w !== keyword.toLowerCase());
      
      questions.push({
        question: `Complete the statement from the document: "${questionText.substring(0, 100)}..."`,
        options: [
          keyword,
          otherWords[0] || "different",
          otherWords[1] || "alternative",
          otherWords[2] || "unrelated"
        ],
        correctAnswer: 0,
        explanation: `The correct word from the document is "${keyword}".`
      });
    }
  }
  
  // Question Type 3: True/False converted to multiple choice
  if (sentences.length > 3) {
    const factSentence = sentences[2] || sentences[0];
    
    questions.push({
      question: `Which statement is found in the document?`,
      options: [
        factSentence.substring(0, 80) + "...",
        "The opposite of what is stated",
        "Information not mentioned",
        "Unrelated content"
      ],
      correctAnswer: 0,
      explanation: "This statement appears directly in the document."
    });
  }
  
  // Question Type 4: Detail Questions
  if (commonWords.length > 3) {
    questions.push({
      question: `Which of these terms is discussed in the document?`,
      options: [
        commonWords[0],
        "quantum entanglement",
        "medieval architecture", 
        "abstract expressionism"
      ],
      correctAnswer: 0,
      explanation: `"${commonWords[0]}" is a key term in the document.`
    });
  }
  
  // Question Type 5: Structure/Format
  const hasNumbers = /\d+/.test(text);
  const hasBullets = /[•\-\*]/.test(text);
  
  questions.push({
    question: `What format elements are present in this document?`,
    options: [
      hasNumbers && hasBullets ? "Both numbered and bulleted lists" : 
      hasNumbers ? "Numbered lists or data" :
      hasBullets ? "Bulleted lists" : "Continuous text paragraphs",
      "Only images and diagrams",
      "Musical notation",
      "Programming code exclusively"
    ],
    correctAnswer: 0,
    explanation: "Based on document structure analysis."
  });
  
  console.log(`✅ Created ${questions.length} intelligent questions`);
  return questions.slice(0, numberOfQuestions);
};



const chatWithPDF = async (text, userQuestion) => {
  const shortText = text.slice(0, 4000);
  const prompt = `Answer the question using ONLY the text below.

Text:
${shortText}

Question:
${userQuestion}

Answer:`;

  return callOllama(prompt, 300);
};

/* ------------------ Exports ------------------ */

module.exports = {
  extractPDFText,
  generateSummary,
  extractKeyPoints,
  generateQuiz,
  chatWithPDF,
};
