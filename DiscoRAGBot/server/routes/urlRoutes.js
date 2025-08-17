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

    try {
      console.log(`About to call UrlScrapingService.scrapeUrl for ${url}`);
      const scrapedUrl = await UrlScrapingService.scrapeUrl(url, req.user._id);
      console.log(`UrlScrapingService.scrapeUrl completed successfully for ${url}`);

      res.json({
        success: true,
        message: 'URL added for scraping',
        urlId: scrapedUrl._id
      });
    } catch (serviceError) {
      console.error('UrlScrapingService error:', serviceError);
      console.error('Service error name:', serviceError.name);
      console.error('Service error message:', serviceError.message);
      console.error('Service error stack:', serviceError.stack);

      // Even if the service fails, we should try to create a basic record
      // This ensures the API doesn't fail completely
      try {
        console.log(`Attempting fallback URL creation for ${url}`);
        const ScrapedUrl = require('../models/ScrapedUrl');
        
        const fallbackData = {
          url,
          userId: req.user._id,
          status: 'failed',
          title: 'Failed to Process',
          content: 'Unable to process this URL due to system limitations',
          preview: 'Processing failed - please try again later',
          errorMessage: serviceError.message
        };
        console.log(`Fallback data to be saved:`, JSON.stringify(fallbackData, null, 2));

        const fallbackUrl = new ScrapedUrl(fallbackData);
        console.log(`Created fallback ScrapedUrl instance, about to save...`);

        const savedFallbackUrl = await fallbackUrl.save();
        console.log(`Created fallback URL record: ${savedFallbackUrl._id}`);
        console.log(`Saved fallback record:`, JSON.stringify(savedFallbackUrl.toObject(), null, 2));

        res.json({
          success: true,
          message: 'URL added for scraping',
          urlId: savedFallbackUrl._id
        });
      } catch (fallbackError) {
        console.error('Fallback URL creation also failed:', fallbackError);
        console.error('Fallback error name:', fallbackError.name);
        console.error('Fallback error message:', fallbackError.message);
        console.error('Fallback error stack:', fallbackError.stack);
        if (fallbackError.errors) {
          console.error('Fallback validation errors:', JSON.stringify(fallbackError.errors, null, 2));
        }
        res.status(500).json({ error: 'Failed to process URL - please try again' });
      }
    }
  } catch (error) {
    console.error('Error in POST /api/urls/scrape:', error);
    console.error('Route error name:', error.name);
    console.error('Route error message:', error.message);
    console.error('Route error stack:', error.stack);
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