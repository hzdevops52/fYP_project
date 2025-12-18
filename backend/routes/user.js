// backend/routes/user.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const PDF = require('../models/PDF');
const Download = require('../models/Download');
const auth = require('../middleware/auth');

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    // Get statistics
    const uploadCount = await PDF.countDocuments({ uploader: req.user._id });
    const downloadCount = await Download.countDocuments({ user: req.user._id });

    res.json({
      user,
      stats: {
        uploads: uploadCount,
        downloads: downloadCount
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findById(req.user._id);

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    user.name = name || user.name;
    user.email = email || user.email;

    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/user/uploads
// @desc    Get user's uploaded PDFs
// @access  Private
router.get('/uploads', auth, async (req, res) => {
  try {
    const pdfs = await PDF.find({ uploader: req.user._id })
      .populate('course', 'name category')
      .sort({ createdAt: -1 });

    res.json(pdfs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/user/downloads
// @desc    Get user's download history
// @access  Private
router.get('/downloads', auth, async (req, res) => {
  try {
    const downloads = await Download.find({ user: req.user._id })
      .populate({
        path: 'pdf',
        populate: {
          path: 'course',
          select: 'name category'
        }
      })
      .sort({ downloadedAt: -1 });

    res.json(downloads);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;