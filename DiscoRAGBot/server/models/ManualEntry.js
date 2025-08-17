const mongoose = require('mongoose');

const manualEntrySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 30
  }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  createdDate: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedDate: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false,
  timestamps: false
});

// Update the updatedDate field before saving
manualEntrySchema.pre('save', function(next) {
  if (!this.isNew) {
    this.updatedDate = new Date();
  }
  next();
});

// Update the updatedDate field before updating
manualEntrySchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedDate: new Date() });
  next();
});

const ManualEntry = mongoose.model('ManualEntry', manualEntrySchema);

module.exports = ManualEntry;