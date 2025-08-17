const express = require('express');
const UrlScrapingService = require('../services/urlScrapingService');
const { requireUser } = require('./middleware/auth');

const router = express.Router();

// Add logging middleware
router.use((req, res, next) => {
  console.log(`URL routes - ${req.method} ${req.originalUrl} - User: ${req.user ? req.user._id : 'Not authenticated'}`);
  next();
});

// Validate URL format
const validateUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch (error) {
    return false;
  }
};

// GET /api/urls - Get all scraped URLs for authenticated user
router.get('/', requireUser, async (req, res) => {
  try {
    console.log(`GET /api/urls - User: ${req.user._id}`);
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'scrapedDate';
    const sortOrder = req.query.sortOrder || 'desc';

    const result = await UrlScrapingService.getUrlsByUserId(
      req.user._id, 
      page, 
      limit, 
      sortBy, 
      sortOrder
    );

    res.json({
      urls: result.urls,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error in GET /api/urls:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/urls/scrape - Add a new URL for scraping
router.post('/scrape', requireUser, async (req, res) => {
  try {
    console.log(`POST /api/urls/scrape - User: ${req.user._id}`);
    
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    if (!validateUrl(url)) {
      return res.status(400).json({ error: 'Please enter a valid URL starting with http:// or https://' });
    }

    console.log(`Initiating scraping for URL: ${url}`);
    const scrapedUrl = await UrlScrapingService.scrapeUrl(url, req.user._id);

    res.json({
      success: true,
      message: 'URL added for scraping',
      urlId: scrapedUrl._id
    });
  } catch (error) {
    console.error('Error in POST /api/urls/scrape:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/urls/:id/rescrape - Re-scrape an existing URL
router.post('/:id/rescrape', requireUser, async (req, res) => {
  try {
    console.log(`POST /api/urls/${req.params.id}/rescrape - User: ${req.user._id}`);
    
    await UrlScrapingService.rescrapeUrl(req.params.id, req.user._id);

    res.json({
      success: true,
      message: 'URL re-scraping initiated'
    });
  } catch (error) {
    console.error('Error in POST /api/urls/:id/rescrape:', error);
    
    if (error.message === 'URL not found') {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/urls/:id - Delete a scraped URL
router.delete('/:id', requireUser, async (req, res) => {
  try {
    console.log(`DELETE /api/urls/${req.params.id} - User: ${req.user._id}`);
    
    await UrlScrapingService.deleteUrl(req.params.id, req.user._id);

    res.json({
      success: true,
      message: 'URL deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /api/urls/:id:', error);
    
    if (error.message === 'URL not found') {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;