const mongoose = require('mongoose');

const globalBotSettingsSchema = new mongoose.Schema({
  // Global bot configuration (single document)
  welcomeMessage: {
    type: String,
    default: 'Welcome! I\'m here to help you with any questions about our knowledge base.'
  },
  defaultLanguage: {
    type: String,
    enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'],
    default: 'en'
  },
  activeFeatures: [{
    type: String,
    enum: ['file_search', 'url_scraping', 'manual_entries', 'analytics', 'citations']
  }],
  responseTimeout: {
    type: Number,
    min: 5,
    max: 300,
    default: 30 // seconds
  },
  maxConversationLength: {
    type: Number,
    min: 1,
    max: 100,
    default: 10 // number of messages
  },
  botStatus: {
    online: {
      type: Boolean,
      default: true
    },
    knowledgeBaseSize: {
      type: Number,
      default: 0
    },
    lastActivity: {
      type: Date,
      default: Date.now
    },
    version: {
      type: String,
      default: '2.1.0'
    }
  },
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
globalBotSettingsSchema.pre('save', function(next) {
  if (!this.isNew) {
    this.updatedAt = Date.now();
  }
  next();
});

// Update the updatedAt field before updating
globalBotSettingsSchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const GlobalBotSettings = mongoose.model('GlobalBotSettings', globalBotSettingsSchema);

module.exports = GlobalBotSettings;