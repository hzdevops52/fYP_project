// backend/routes/pdfs.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const PDF = require('../models/PDF');
const Download = require('../models/Download');
const auth = require('../middleware/auth');
const upload = require('../config/multer');

// @route   GET /api/pdfs
// @desc    Get all PDFs
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { course, search } = req.query;
    let query = {};

    if (course) {
      query.course = course;
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const pdfs = await PDF.find(query)
      .populate('uploader', 'name')
      .populate('course', 'name category')
      .sort({ createdAt: -1 });

    res.json(pdfs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/pdfs/:id
// @desc    Get single PDF
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const pdf = await PDF.findById(req.params.id)
      .populate('uploader', 'name email')
      .populate('course', 'name category');

    if (!pdf) {
      return res.status(404).json({ message: 'PDF not found' });
    }

    // Increment views
    pdf.views += 1;
    await pdf.save();

    res.json(pdf);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/pdfs/upload
// @desc    Upload a PDF
// @access  Private
router.post('/upload', auth, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF file' });
    }

    const { title, description, course, tags } = req.body;

    const pdf = new PDF({
      title,
      description,
      filePath: req.file.path,
      fileName: req.file.filename,
      fileSize: req.file.size,
      course,
      uploader: req.user._id,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    });

    await pdf.save();
    
    const populatedPdf = await PDF.findById(pdf._id)
      .populate('uploader', 'name')
      .populate('course', 'name');

    res.status(201).json(populatedPdf);
  } catch (error) {
    console.error(error);
    // Delete uploaded file if database save fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/pdfs/download/:id
// @desc    Download a PDF
// @access  Private
router.get('/download/:id', auth, async (req, res) => {
  try {
    const pdf = await PDF.findById(req.params.id);

    if (!pdf) {
      return res.status(404).json({ message: 'PDF not found' });
    }

    const filePath = path.join(__dirname, '..', pdf.filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Increment download count
    pdf.downloadCount += 1;
    await pdf.save();

    // Record download
    const download = new Download({
      user: req.user._id,
      pdf: pdf._id
    });
    await download.save();

    // Send file
    res.download(filePath, pdf.fileName);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/pdfs/:id
// @desc    Update PDF details
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let pdf = await PDF.findById(req.params.id);

    if (!pdf) {
      return res.status(404).json({ message: 'PDF not found' });
    }

    // Check if user is the uploader
    if (pdf.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, description, tags } = req.body;

    pdf.title = title || pdf.title;
    pdf.description = description || pdf.description;
    if (tags) {
      pdf.tags = tags.split(',').map(tag => tag.trim());
    }

    await pdf.save();
    
    const updatedPdf = await PDF.findById(pdf._id)
      .populate('uploader', 'name')
      .populate('course', 'name');

    res.json(updatedPdf);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/pdfs/:id
// @desc    Delete a PDF
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const pdf = await PDF.findById(req.params.id);

    if (!pdf) {
      return res.status(404).json({ message: 'PDF not found' });
    }

    // Check if user is the uploader
    if (pdf.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '..', pdf.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await pdf.deleteOne();
    res.json({ message: 'PDF deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;