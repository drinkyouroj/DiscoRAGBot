const express = require('express');
const router = express.Router();
const AnalyticsService = require('../services/analyticsService');
const { authenticateToken } = require('./middleware/auth');

// Get usage statistics
router.get('/usage', authenticateToken, async (req, res) => {
  try {
    console.log('Analytics usage endpoint called by user:', req.user._id);
    const stats = await AnalyticsService.getUsageStatistics(req.user._id);
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error in analytics usage endpoint:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get content analytics
router.get('/content', authenticateToken, async (req, res) => {
  try {
    console.log('Analytics content endpoint called by user:', req.user._id);
    const analytics = await AnalyticsService.getContentAnalytics(req.user._id);
    
    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Error in analytics content endpoint:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get recent questions
router.get('/questions', authenticateToken, async (req, res) => {
  try {
    console.log('Analytics questions endpoint called by user:', req.user._id);
    const limit = parseInt(req.query.limit) || 20;
    const questions = await AnalyticsService.getRecentQuestions(req.user._id, limit);
    
    res.json({
      success: true,
      questions
    });
  } catch (error) {
    console.error('Error in analytics questions endpoint:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create sample data for testing (development only)
router.post('/sample-data', authenticateToken, async (req, res) => {
  try {
    console.log('Creating sample analytics data for user:', req.user._id);
    await AnalyticsService.createSampleData(req.user._id);
    
    res.json({
      success: true,
      message: 'Sample analytics data created successfully'
    });
  } catch (error) {
    console.error('Error creating sample analytics data:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;