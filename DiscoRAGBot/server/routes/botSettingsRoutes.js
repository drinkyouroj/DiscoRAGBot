const express = require('express');
const BotSettingsService = require('../services/botSettingsService.js');
const { requireUser } = require('./middleware/auth.js');

const router = express.Router();

// All routes require authentication
router.use(requireUser);

// GET /api/users/bot-settings - Get user's bot settings
router.get('/bot-settings', async (req, res) => {
  try {
    console.log('GET /api/users/bot-settings - User:', req.user._id);
    
    const settings = await BotSettingsService.getByUserId(req.user._id);
    
    res.json({
      success: true,
      config: settings
    });
  } catch (error) {
    console.error('Error fetching bot settings:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST /api/users/bot-settings - Create or update user's bot settings
router.post('/bot-settings', async (req, res) => {
  try {
    console.log('POST /api/users/bot-settings - User:', req.user._id, 'Data:', Object.keys(req.body));
    
    const {
      personality,
      customPersonality,
      tone,
      responseLength,
      responseFormat,
      confidenceThreshold,
      includeCitations,
      enabledChannels
    } = req.body;

    // Validate required fields
    if (confidenceThreshold !== undefined && (confidenceThreshold < 0.1 || confidenceThreshold > 1.0)) {
      return res.status(400).json({
        success: false,
        message: 'Confidence threshold must be between 0.1 and 1.0'
      });
    }

    const settingsData = {};
    if (personality !== undefined) settingsData.personality = personality;
    if (customPersonality !== undefined) settingsData.customPersonality = customPersonality;
    if (tone !== undefined) settingsData.tone = tone;
    if (responseLength !== undefined) settingsData.responseLength = responseLength;
    if (responseFormat !== undefined) settingsData.responseFormat = responseFormat;
    if (confidenceThreshold !== undefined) settingsData.confidenceThreshold = confidenceThreshold;
    if (includeCitations !== undefined) settingsData.includeCitations = includeCitations;
    if (enabledChannels !== undefined) settingsData.enabledChannels = enabledChannels;

    const settings = await BotSettingsService.createOrUpdate(req.user._id, settingsData);
    
    res.json({
      success: true,
      message: 'Bot settings saved successfully',
      config: settings
    });
  } catch (error) {
    console.error('Error creating/updating bot settings:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// PATCH /api/users/bot-settings - Update specific fields of user's bot settings
router.patch('/bot-settings', async (req, res) => {
  try {
    console.log('PATCH /api/users/bot-settings - User:', req.user._id, 'Data:', Object.keys(req.body));
    
    const {
      personality,
      customPersonality,
      tone,
      responseLength,
      responseFormat,
      confidenceThreshold,
      includeCitations,
      enabledChannels
    } = req.body;

    // Validate confidence threshold if provided
    if (confidenceThreshold !== undefined && (confidenceThreshold < 0.1 || confidenceThreshold > 1.0)) {
      return res.status(400).json({
        success: false,
        message: 'Confidence threshold must be between 0.1 and 1.0'
      });
    }

    const updateData = {};
    if (personality !== undefined) updateData.personality = personality;
    if (customPersonality !== undefined) updateData.customPersonality = customPersonality;
    if (tone !== undefined) updateData.tone = tone;
    if (responseLength !== undefined) updateData.responseLength = responseLength;
    if (responseFormat !== undefined) updateData.responseFormat = responseFormat;
    if (confidenceThreshold !== undefined) updateData.confidenceThreshold = confidenceThreshold;
    if (includeCitations !== undefined) updateData.includeCitations = includeCitations;
    if (enabledChannels !== undefined) updateData.enabledChannels = enabledChannels;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update'
      });
    }

    const settings = await BotSettingsService.update(req.user._id, updateData);
    
    res.json({
      success: true,
      message: 'Bot settings updated successfully',
      config: settings
    });
  } catch (error) {
    console.error('Error updating bot settings:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE /api/users/bot-settings - Delete user's bot settings
router.delete('/bot-settings', async (req, res) => {
  try {
    console.log('DELETE /api/users/bot-settings - User:', req.user._id);
    
    const deleted = await BotSettingsService.delete(req.user._id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Bot settings not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Bot settings deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting bot settings:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;