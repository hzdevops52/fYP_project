const mongoose = require("mongoose");

const PDFSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    savedFileName: { type: String }, // ✅ Remove required
    title: { type: String, required: true },
    filePath: { type: String, required: true },
    fileSize: { type: Number },
    subject: { type: String, default: "General" },
    pages: { type: Number, default: 1 },
    summary: { type: String },
    keyPoints: { type: String },
    textLength: { type: Number },
    downloads: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PDF", PDFSchema);