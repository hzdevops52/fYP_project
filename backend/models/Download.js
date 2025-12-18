// backend/models/Download.js
const mongoose = require('mongoose');

const downloadSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pdf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PDF',
    required: true
  },
  downloadedAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index to track unique downloads
downloadSchema.index({ user: 1, pdf: 1, downloadedAt: 1 });

module.exports = mongoose.model('Download', downloadSchema);