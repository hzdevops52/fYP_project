// backend/routes/courses.js
const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const PDF = require('../models/PDF');
const auth = require('../middleware/auth');

// @route   GET /api/courses
// @desc    Get all courses
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const courses = await Course.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    // Get PDF count for each course
    const coursesWithCount = await Promise.all(
      courses.map(async (course) => {
        const pdfCount = await PDF.countDocuments({ course: course._id });
        return {
          ...course.toObject(),
          pdfCount
        };
      })
    );

    res.json(coursesWithCount);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/courses/:id
// @desc    Get single course
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('createdBy', 'name');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Get all PDFs for this course
    const pdfs = await PDF.find({ course: course._id })
      .populate('uploader', 'name')
      .sort({ createdAt: -1 });

    res.json({
      ...course.toObject(),
      pdfs
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/courses
// @desc    Create a new course
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, category } = req.body;

    // Check if course already exists
    let course = await Course.findOne({ name });
    if (course) {
      return res.status(400).json({ message: 'Course already exists' });
    }

    course = new Course({
      name,
      description,
      category,
      createdBy: req.user._id
    });

    await course.save();
    res.status(201).json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/courses/:id
// @desc    Update a course
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, category } = req.body;

    let course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the creator
    if (course.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    course.name = name || course.name;
    course.description = description || course.description;
    course.category = category || course.category;

    await course.save();
    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/courses/:id
// @desc    Delete a course
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the creator
    if (course.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await course.deleteOne();
    res.json({ message: 'Course deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;