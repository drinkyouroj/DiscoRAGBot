const GlobalBotSettings = require('../models/GlobalBotSettings.js');

class GlobalBotSettingsService {
  static async getGlobalSettings() {
    try {
      console.log('Fetching global bot settings');

      let settings = await GlobalBotSettings.findOne();

      if (!settings) {
        console.log('No global bot settings found, creating defaults');
        // Create default settings if none exist
        settings = new GlobalBotSettings({
          welcomeMessage: 'Welcome! I\'m here to help you with any questions about our knowledge base.',
          defaultLanguage: 'en',
          activeFeatures: ['file_search', 'url_scraping', 'manual_entries', 'analytics', 'citations'],
          responseTimeout: 30,
          maxConversationLength: 10,
          botStatus: {
            online: true,
            knowledgeBaseSize: 0,
            lastActivity: new Date(),
            version: '2.1.0'
          }
        });
        await settings.save();
      }

      console.log('Global bot settings retrieved successfully');
      return settings;
    } catch (err) {
      console.error('Error fetching global bot settings:', err);
      throw new Error(`Database error while fetching global bot settings: ${err.message}`);
    }
  }

  static async updateGlobalSettings(updateData) {
    try {
      console.log('Updating global bot settings with data:', Object.keys(updateData));

      // Validate responseTimeout if provided
      if (updateData.responseTimeout !== undefined && (updateData.responseTimeout < 5 || updateData.responseTimeout > 300)) {
        throw new Error('Response timeout must be between 5 and 300 seconds');
      }

      // Validate maxConversationLength if provided
      if (updateData.maxConversationLength !== undefined && (updateData.maxConversationLength < 1 || updateData.maxConversationLength > 100)) {
        throw new Error('Max conversation length must be between 1 and 100 messages');
      }

      let settings = await GlobalBotSettings.findOne();

      if (!settings) {
        console.log('No global settings found, creating new with provided data');
        settings = new GlobalBotSettings(updateData);
      } else {
        // Update existing settings
        Object.keys(updateData).forEach(key => {
          if (key === 'botStatus' && typeof updateData[key] === 'object') {
            // Merge botStatus object
            settings.botStatus = { ...settings.botStatus.toObject(), ...updateData[key] };
          } else {
            settings[key] = updateData[key];
          }
        });
      }

      await settings.save();

      console.log('Global bot settings updated successfully');
      return settings;
    } catch (err) {
      console.error('Error updating global bot settings:', err);
      throw new Error(`Database error while updating global bot settings: ${err.message}`);
    }
  }

  static async updateBotStatus(statusData) {
    try {
      console.log('Updating bot status with data:', Object.keys(statusData));

      let settings = await GlobalBotSettings.findOne();

      if (!settings) {
        // Create default settings if none exist
        settings = new GlobalBotSettings();
      }

      // Update bot status
      settings.botStatus = { ...settings.botStatus.toObject(), ...statusData };
      settings.botStatus.lastActivity = new Date();

      await settings.save();

      console.log('Bot status updated successfully');
      return settings.botStatus;
    } catch (err) {
      console.error('Error updating bot status:', err);
      throw new Error(`Database error while updating bot status: ${err.message}`);
    }
  }

  static async getBotStatus() {
    try {
      console.log('Fetching bot status');

      const settings = await this.getGlobalSettings();
      
      console.log('Bot status retrieved successfully');
      return settings.botStatus;
    } catch (err) {
      console.error('Error fetching bot status:', err);
      throw new Error(`Database error while fetching bot status: ${err.message}`);
    }
  }
}

module.exports = GlobalBotSettingsService;