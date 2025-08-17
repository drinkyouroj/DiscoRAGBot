const express = require('express');
const GlobalBotSettingsService = require('../services/globalBotSettingsService.js');
const { authenticateToken } = require('./middleware/auth.js');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/bot-configuration - Get global bot configuration
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/bot-configuration - User:', req.user._id);
    console.log('GET /api/bot-configuration - Starting to fetch global settings');

    const settings = await GlobalBotSettingsService.getGlobalSettings();
    console.log('GET /api/bot-configuration - Settings retrieved, preparing response');

    const response = {
      success: true,
      config: {
        welcomeMessage: settings.welcomeMessage,
        defaultLanguage: settings.defaultLanguage,
        activeFeatures: settings.activeFeatures,
        responseTimeout: settings.responseTimeout,
        maxConversationLength: settings.maxConversationLength
      }
    };

    console.log('GET /api/bot-configuration - Sending response with status 200');
    res.status(200).json(response);
  } catch (error) {
    console.error('GET /api/bot-configuration - Error occurred:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// PUT /api/bot-configuration - Update global bot configuration
router.put('/', async (req, res) => {
  try {
    console.log('PUT /api/bot-configuration - User:', req.user._id, 'Data:', Object.keys(req.body));
    console.log('PUT /api/bot-configuration - Request body:', JSON.stringify(req.body, null, 2));

    const {
      welcomeMessage,
      defaultLanguage,
      activeFeatures,
      responseTimeout,
      maxConversationLength
    } = req.body;

    const updateData = {};
    if (welcomeMessage !== undefined) updateData.welcomeMessage = welcomeMessage;
    if (defaultLanguage !== undefined) updateData.defaultLanguage = defaultLanguage;
    if (activeFeatures !== undefined) updateData.activeFeatures = activeFeatures;
    if (responseTimeout !== undefined) updateData.responseTimeout = responseTimeout;
    if (maxConversationLength !== undefined) updateData.maxConversationLength = maxConversationLength;

    console.log('PUT /api/bot-configuration - Update data prepared:', Object.keys(updateData));

    if (Object.keys(updateData).length === 0) {
      console.log('PUT /api/bot-configuration - No valid fields provided');
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update'
      });
    }

    const settings = await GlobalBotSettingsService.updateGlobalSettings(updateData);
    console.log('PUT /api/bot-configuration - Settings updated successfully');

    const response = {
      success: true,
      message: 'Global bot configuration updated successfully',
      config: {
        welcomeMessage: settings.welcomeMessage,
        defaultLanguage: settings.defaultLanguage,
        activeFeatures: settings.activeFeatures,
        responseTimeout: settings.responseTimeout,
        maxConversationLength: settings.maxConversationLength
      }
    };

    console.log('PUT /api/bot-configuration - Sending success response with status 200');
    res.status(200).json(response);
  } catch (error) {
    console.error('PUT /api/bot-configuration - Error occurred:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/bot-configuration/status - Get bot status
router.get('/status', async (req, res) => {
  try {
    console.log('GET /api/bot-configuration/status - User:', req.user._id);
    console.log('GET /api/bot-configuration/status - Starting to fetch bot status');

    const status = await GlobalBotSettingsService.getBotStatus();
    console.log('GET /api/bot-configuration/status - Status retrieved successfully');

    const response = {
      success: true,
      status: status
    };

    console.log('GET /api/bot-configuration/status - Sending response with status 200');
    res.status(200).json(response);
  } catch (error) {
    console.error('GET /api/bot-configuration/status - Error occurred:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// PUT /api/bot-configuration/status - Update bot status
router.put('/status', async (req, res) => {
  try {
    console.log('PUT /api/bot-configuration/status - User:', req.user._id, 'Data:', Object.keys(req.body));
    console.log('PUT /api/bot-configuration/status - Request body:', JSON.stringify(req.body, null, 2));

    const {
      online,
      knowledgeBaseSize,
      version
    } = req.body;

    const statusData = {};
    if (online !== undefined) statusData.online = online;
    if (knowledgeBaseSize !== undefined) statusData.knowledgeBaseSize = knowledgeBaseSize;
    if (version !== undefined) statusData.version = version;

    console.log('PUT /api/bot-configuration/status - Status data prepared:', Object.keys(statusData));

    if (Object.keys(statusData).length === 0) {
      console.log('PUT /api/bot-configuration/status - No valid status fields provided');
      return res.status(400).json({
        success: false,
        message: 'No valid status fields provided for update'
      });
    }

    const status = await GlobalBotSettingsService.updateBotStatus(statusData);
    console.log('PUT /api/bot-configuration/status - Status updated successfully');

    const response = {
      success: true,
      message: 'Bot status updated successfully',
      status: status
    };

    console.log('PUT /api/bot-configuration/status - Sending success response with status 200');
    res.status(200).json(response);
  } catch (error) {
    console.error('PUT /api/bot-configuration/status - Error occurred:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;