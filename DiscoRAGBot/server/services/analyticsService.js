const BotInteraction = require('../models/BotInteraction');
const AnalyticsCache = require('../models/AnalyticsCache');

class AnalyticsService {
  
  static async getUsageStatistics(userId) {
    try {
      console.log('Fetching usage statistics for user:', userId);
      
      const cacheKey = `usage_stats_${userId}`;
      const cached = await AnalyticsCache.findOne({ 
        cacheKey, 
        expiresAt: { $gt: new Date() } 
      });
      
      if (cached) {
        console.log('Returning cached usage statistics');
        return cached.data;
      }

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get daily, weekly, monthly counts
      const [dailyCount, weeklyCount, monthlyCount] = await Promise.all([
        BotInteraction.countDocuments({
          user: userId,
          timestamp: { $gte: today }
        }),
        BotInteraction.countDocuments({
          user: userId,
          timestamp: { $gte: weekAgo }
        }),
        BotInteraction.countDocuments({
          user: userId,
          timestamp: { $gte: monthAgo }
        })
      ]);

      // Get top users (by Discord username)
      const topUsers = await BotInteraction.aggregate([
        {
          $match: {
            user: userId,
            timestamp: { $gte: weekAgo }
          }
        },
        {
          $group: {
            _id: '$discordUsername',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 5
        },
        {
          $project: {
            username: '$_id',
            count: 1,
            _id: 0
          }
        }
      ]);

      // Get peak hours
      const peakHours = await BotInteraction.aggregate([
        {
          $match: {
            user: userId,
            timestamp: { $gte: weekAgo }
          }
        },
        {
          $project: {
            hour: { $hour: '$timestamp' }
          }
        },
        {
          $group: {
            _id: '$hour',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 10
        },
        {
          $project: {
            hour: '$_id',
            count: 1,
            _id: 0
          }
        }
      ]);

      const stats = {
        daily: dailyCount,
        weekly: weeklyCount,
        monthly: monthlyCount,
        topUsers,
        peakHours
      };

      // Cache for 1 hour
      await AnalyticsCache.findOneAndUpdate(
        { cacheKey },
        {
          cacheKey,
          data: stats,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
          lastUpdated: new Date()
        },
        { upsert: true }
      );

      console.log('Usage statistics calculated and cached');
      return stats;
      
    } catch (error) {
      console.error('Error fetching usage statistics:', error);
      throw new Error(`Failed to fetch usage statistics: ${error.message}`);
    }
  }

  static async getContentAnalytics(userId) {
    try {
      console.log('Fetching content analytics for user:', userId);
      
      const cacheKey = `content_analytics_${userId}`;
      const cached = await AnalyticsCache.findOne({ 
        cacheKey, 
        expiresAt: { $gt: new Date() } 
      });
      
      if (cached) {
        console.log('Returning cached content analytics');
        return cached.data;
      }

      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // Get top topics
      const topTopics = await BotInteraction.aggregate([
        {
          $match: {
            user: userId,
            timestamp: { $gte: monthAgo }
          }
        },
        {
          $unwind: '$topics'
        },
        {
          $group: {
            _id: '$topics',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 10
        },
        {
          $project: {
            topic: '$_id',
            count: 1,
            _id: 0
          }
        }
      ]);

      // Get source utilization
      const sourceUtilization = await BotInteraction.aggregate([
        {
          $match: {
            user: userId,
            timestamp: { $gte: monthAgo }
          }
        },
        {
          $unwind: '$sourcesUsed'
        },
        {
          $group: {
            _id: {
              name: '$sourcesUsed.sourceName',
              type: '$sourcesUsed.sourceType'
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 10
        },
        {
          $project: {
            source: '$_id.name',
            type: {
              $switch: {
                branches: [
                  { case: { $eq: ['$_id.type', 'File'] }, then: 'file' },
                  { case: { $eq: ['$_id.type', 'ScrapedUrl'] }, then: 'url' },
                  { case: { $eq: ['$_id.type', 'ManualEntry'] }, then: 'manual' }
                ],
                default: 'unknown'
              }
            },
            count: 1,
            _id: 0
          }
        }
      ]);

      // Get knowledge gaps (questions with no helpful feedback or marked as not helpful)
      const knowledgeGaps = await BotInteraction.aggregate([
        {
          $match: {
            user: userId,
            timestamp: { $gte: monthAgo },
            $or: [
              { helpful: false },
              { helpful: null, sourcesUsed: { $size: 0 } }
            ]
          }
        },
        {
          $group: {
            _id: '$question',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 10
        },
        {
          $project: {
            question: '$_id',
            count: 1,
            _id: 0
          }
        }
      ]);

      const analytics = {
        topTopics,
        sourceUtilization,
        knowledgeGaps
      };

      // Cache for 2 hours
      await AnalyticsCache.findOneAndUpdate(
        { cacheKey },
        {
          cacheKey,
          data: analytics,
          expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
          lastUpdated: new Date()
        },
        { upsert: true }
      );

      console.log('Content analytics calculated and cached');
      return analytics;
      
    } catch (error) {
      console.error('Error fetching content analytics:', error);
      throw new Error(`Failed to fetch content analytics: ${error.message}`);
    }
  }

  static async getRecentQuestions(userId, limit = 20) {
    try {
      console.log('Fetching recent questions for user:', userId, 'limit:', limit);
      
      const questions = await BotInteraction.find({ user: userId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .select('question answer discordUsername timestamp category helpful')
        .lean();

      const formattedQuestions = questions.map(q => ({
        _id: q._id.toString(),
        question: q.question,
        answer: q.answer,
        user: q.discordUsername,
        timestamp: q.timestamp.toISOString(),
        category: q.category,
        helpful: q.helpful
      }));

      console.log(`Found ${formattedQuestions.length} recent questions`);
      return formattedQuestions;
      
    } catch (error) {
      console.error('Error fetching recent questions:', error);
      throw new Error(`Failed to fetch recent questions: ${error.message}`);
    }
  }

  // Helper method to create sample data for testing
  static async createSampleData(userId) {
    try {
      console.log('Creating sample analytics data for user:', userId);
      
      const sampleInteractions = [
        {
          user: userId,
          discordUserId: '123456789',
          discordUsername: 'john_doe',
          question: 'How do I add the bot to my server?',
          answer: 'To add the bot to your server, you need to create an invite link with the necessary permissions...',
          category: 'setup',
          topics: ['bot setup', 'permissions'],
          sourcesUsed: [{
            sourceName: 'discord-bot-guide.pdf',
            sourceType: 'File',
            relevanceScore: 0.9
          }],
          responseTime: 1200,
          helpful: true,
          complexity: 'simple',
          questionLength: 35,
          answerLength: 150,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
        },
        {
          user: userId,
          discordUserId: '987654321',
          discordUsername: 'jane_smith',
          question: 'Why is the bot not responding to commands?',
          answer: 'There are several reasons why the bot might not respond. First, check if the bot has the necessary permissions...',
          category: 'troubleshooting',
          topics: ['troubleshooting', 'permissions'],
          sourcesUsed: [{
            sourceName: 'Bot Setup Instructions',
            sourceType: 'ManualEntry',
            relevanceScore: 0.8
          }],
          responseTime: 2100,
          helpful: true,
          complexity: 'moderate',
          questionLength: 42,
          answerLength: 200,
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
        },
        {
          user: userId,
          discordUserId: '456789123',
          discordUsername: 'dev_user',
          question: 'What are the rate limits for the Discord API?',
          answer: 'Discord API has different rate limits depending on the endpoint...',
          category: 'technical',
          topics: ['api limits', 'technical'],
          sourcesUsed: [{
            sourceName: 'Discord Developer Docs',
            sourceType: 'ScrapedUrl',
            relevanceScore: 0.95
          }],
          responseTime: 800,
          helpful: null,
          complexity: 'complex',
          questionLength: 48,
          answerLength: 180,
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
        }
      ];

      await BotInteraction.insertMany(sampleInteractions);
      console.log('Sample analytics data created successfully');
      
    } catch (error) {
      console.error('Error creating sample data:', error);
      throw new Error(`Failed to create sample data: ${error.message}`);
    }
  }
}

module.exports = AnalyticsService;