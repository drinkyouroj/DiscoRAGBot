const mongoose = require('mongoose');

const scrapedUrlSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: false,
    default: 'Processing...'
  },
  content: {
    type: String,
    required: false,
    default: 'Content will be available after processing'
  },
  preview: {
    type: String,
    required: false,
    default: 'Preview will be available after processing'
  },
  status: {
    type: String,
    enum: ['processing', 'ready', 'failed'],
    default: 'processing'
  },
  scrapedDate: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  errorMessage: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
scrapedUrlSchema.index({ userId: 1, scrapedDate: -1 });
scrapedUrlSchema.index({ url: 1, userId: 1 });

module.exports = mongoose.model('ScrapedUrl', scrapedUrlSchema);