const BotSettings = require('../models/BotSettings.js');

class BotSettingsService {
  static async createOrUpdate(userId, settingsData) {
    try {
      console.log('Creating/updating bot settings for user:', userId);
      
      const settings = await BotSettings.findOneAndUpdate(
        { userId },
        { ...settingsData, userId },
        { 
          new: true, 
          upsert: true,
          runValidators: true
        }
      );
      
      console.log('Bot settings created/updated successfully for user:', userId);
      return settings;
    } catch (err) {
      console.error('Error creating/updating bot settings:', err);
      throw new Error(`Database error while creating/updating bot settings: ${err.message}`);
    }
  }

  static async getByUserId(userId) {
    try {
      console.log('Fetching bot settings for user:', userId);
      
      const settings = await BotSettings.findOne({ userId });
      
      if (!settings) {
        console.log('No bot settings found for user, returning defaults:', userId);
        // Return default settings if none exist
        return {
          personality: 'friendly',
          customPersonality: 'I am a helpful Discord bot that provides accurate information from our knowledge base. I aim to be friendly and approachable while maintaining professionalism.',
          tone: 'conversational',
          responseLength: 'medium',
          responseFormat: 'mixed',
          confidenceThreshold: 0.7,
          includeCitations: true,
          enabledChannels: ['general', 'help', 'support']
        };
      }
      
      console.log('Bot settings found for user:', userId);
      return settings;
    } catch (err) {
      console.error('Error fetching bot settings:', err);
      throw new Error(`Database error while fetching bot settings: ${err.message}`);
    }
  }

  static async update(userId, updateData) {
    try {
      console.log('Updating bot settings for user:', userId, 'with data:', Object.keys(updateData));
      
      const settings = await BotSettings.findOneAndUpdate(
        { userId },
        updateData,
        { 
          new: true,
          runValidators: true
        }
      );
      
      if (!settings) {
        throw new Error('Bot settings not found for user');
      }
      
      console.log('Bot settings updated successfully for user:', userId);
      return settings;
    } catch (err) {
      console.error('Error updating bot settings:', err);
      throw new Error(`Database error while updating bot settings: ${err.message}`);
    }
  }

  static async delete(userId) {
    try {
      console.log('Deleting bot settings for user:', userId);
      
      const result = await BotSettings.deleteOne({ userId });
      
      console.log('Bot settings deletion result for user:', userId, 'deleted:', result.deletedCount);
      return result.deletedCount === 1;
    } catch (err) {
      console.error('Error deleting bot settings:', err);
      throw new Error(`Database error while deleting bot settings: ${err.message}`);
    }
  }
}

module.exports = BotSettingsService;