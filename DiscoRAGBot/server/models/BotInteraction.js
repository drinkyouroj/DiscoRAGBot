const mongoose = require('mongoose');

const botInteractionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  discordUserId: {
    type: String,
    required: true,
    index: true
  },
  discordUsername: {
    type: String,
    required: true
  },
  question: {
    type: String,
    required: true,
    index: 'text'
  },
  answer: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['setup', 'troubleshooting', 'technical', 'development', 'general'],
    default: 'general',
    index: true
  },
  topics: [{
    type: String,
    index: true
  }],
  sourcesUsed: [{
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'sourcesUsed.sourceType'
    },
    sourceType: {
      type: String,
      enum: ['File', 'ScrapedUrl', 'ManualEntry']
    },
    sourceName: String,
    relevanceScore: {
      type: Number,
      min: 0,
      max: 1
    }
  }],
  responseTime: {
    type: Number, // in milliseconds
    required: true
  },
  helpful: {
    type: Boolean,
    default: null // null = no feedback, true = helpful, false = not helpful
  },
  complexity: {
    type: String,
    enum: ['simple', 'moderate', 'complex'],
    default: 'moderate',
    index: true
  },
  questionLength: {
    type: Number,
    required: true
  },
  answerLength: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for analytics queries
botInteractionSchema.index({ timestamp: -1 });
botInteractionSchema.index({ user: 1, timestamp: -1 });
botInteractionSchema.index({ category: 1, timestamp: -1 });
botInteractionSchema.index({ topics: 1, timestamp: -1 });
botInteractionSchema.index({ helpful: 1, timestamp: -1 });

const BotInteraction = mongoose.model('BotInteraction', botInteractionSchema);

module.exports = BotInteraction;