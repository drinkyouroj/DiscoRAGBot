const mongoose = require('mongoose');

const botSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  personality: {
    type: String,
    enum: ['professional', 'friendly', 'technical', 'casual'],
    default: 'friendly'
  },
  customPersonality: {
    type: String,
    default: 'I am a helpful Discord bot that provides accurate information from our knowledge base. I aim to be friendly and approachable while maintaining professionalism.'
  },
  tone: {
    type: String,
    enum: ['formal', 'conversational', 'helpful', 'concise'],
    default: 'conversational'
  },
  responseLength: {
    type: String,
    enum: ['short', 'medium', 'long'],
    default: 'medium'
  },
  responseFormat: {
    type: String,
    enum: ['plain', 'bullets', 'numbered', 'mixed'],
    default: 'mixed'
  },
  confidenceThreshold: {
    type: Number,
    min: 0.1,
    max: 1.0,
    default: 0.7
  },
  includeCitations: {
    type: Boolean,
    default: true
  },
  enabledChannels: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false
});

// Update the updatedAt field before saving
botSettingsSchema.pre('save', function(next) {
  if (!this.isNew) {
    this.updatedAt = Date.now();
  }
  next();
});

// Update the updatedAt field before updating
botSettingsSchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const BotSettings = mongoose.model('BotSettings', botSettingsSchema);

module.exports = BotSettings;