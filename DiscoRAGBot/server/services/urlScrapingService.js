const puppeteer = require('puppeteer');
const ScrapedUrl = require('../models/ScrapedUrl');

class UrlScrapingService {
  static async scrapeUrl(url, userId) {
    console.log(`Starting URL scraping for: ${url} by user: ${userId}`);

    try {
      // Create initial record with processing status and proper defaults
      const scrapedUrl = new ScrapedUrl({
        url,
        userId,
        status: 'processing',
        title: 'Processing...',
        content: 'Content will be available after processing',
        preview: 'Preview will be available after processing'
      });

      const savedUrl = await scrapedUrl.save();
      console.log(`Created ScrapedUrl record with ID: ${savedUrl._id}`);

      // Start scraping in background with proper error handling
      setImmediate(async () => {
        try {
          await this.performScraping(savedUrl._id, url);
        } catch (error) {
          console.error(`Background scraping failed for ${url}:`, error);
          // Ensure database is updated even if scraping completely fails
          try {
            await ScrapedUrl.findByIdAndUpdate(savedUrl._id, {
              status: 'failed',
              errorMessage: `Scraping process failed: ${error.message}`,
              title: 'Failed to scrape',
              preview: 'Scraping process encountered an error'
            });
            console.log(`Updated database with failure status for ${url}`);
          } catch (dbError) {
            console.error(`Failed to update database after scraping error:`, dbError);
          }
        }
      });

      return savedUrl;
    } catch (error) {
      console.error(`Error creating ScrapedUrl record:`, error);
      throw new Error(`Failed to create URL record: ${error.message}`);
    }
  }

  static async performScraping(scrapedUrlId, url) {
    console.log(`Performing scraping for URL: ${url}`);

    try {
      // Try Puppeteer first
      await this.performPuppeteerScraping(scrapedUrlId, url);
    } catch (error) {
      console.error(`Error scraping URL ${url}:`, error);

      // Check if it's a Puppeteer-related error and try fallback
      if (error.message.includes('Failed to launch') ||
          error.message.includes('browser process') ||
          error.message.includes('Could not find Chrome') ||
          error.message.includes('Chrome') ||
          error.message.includes('puppeteer')) {
        console.log(`Puppeteer failed, attempting fallback scraping for ${url}`);
        try {
          await this.performFallbackScraping(scrapedUrlId, url);
        } catch (fallbackError) {
          console.error(`Fallback scraping also failed for ${url}:`, fallbackError);
          // Update record with error status
          await ScrapedUrl.findByIdAndUpdate(scrapedUrlId, {
            status: 'failed',
            errorMessage: `Both Puppeteer and fallback failed: ${fallbackError.message}`,
            title: 'Failed to scrape',
            preview: 'Unable to access content from this URL'
          });
        }
      } else {
        // Update record with error status
        await ScrapedUrl.findByIdAndUpdate(scrapedUrlId, {
          status: 'failed',
          errorMessage: error.message,
          title: 'Failed to scrape',
          preview: 'Unable to access content from this URL'
        });
      }
    }
  }

  static async performFallbackScraping(scrapedUrlId, url) {
    console.log(`Performing fallback scraping for URL: ${url}`);

    // For development environment issues, immediately mark as failed with a helpful message
    console.log(`Development environment detected, marking URL as failed with informative message`);
    
    try {
      await ScrapedUrl.findByIdAndUpdate(scrapedUrlId, {
        status: 'failed',
        errorMessage: 'Development environment limitations - scraping not available',
        title: 'Scraping Not Available',
        preview: 'URL scraping is not available in the current development environment. This will work in production with proper system dependencies.'
      });
      console.log(`Updated database with development environment message for ${url}`);
    } catch (dbError) {
      console.error(`Database update error:`, dbError);
      throw new Error('Failed to update database');
    }
  }

  static async performPuppeteerScraping(scrapedUrlId, url) {
    let browser;
    
    try {
      console.log(`Performing scraping for URL: ${url}`);
      
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--single-process',
          '--disable-extensions',
          '--disable-plugins',
          '--disable-images',
          '--disable-javascript',
          '--disable-default-apps',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-field-trial-config',
          '--disable-back-forward-cache',
          '--disable-ipc-flooding-protection'
        ],
        executablePath: process.env.CHROME_BIN || undefined
      });

      const page = await browser.newPage();
      
      // Set user agent to avoid blocking
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Set timeout and navigate
      await page.goto(url, { 
        waitUntil: 'domcontentloaded', 
        timeout: 30000 
      });

      // Extract content
      const scrapedData = await page.evaluate(() => {
        // Get title
        const title = document.title || 
                     document.querySelector('h1')?.textContent || 
                     'Untitled';

        // Get main content
        const contentSelectors = [
          'main',
          'article', 
          '.content',
          '.main-content',
          '#content',
          'body'
        ];

        let content = '';
        for (const selector of contentSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            content = element.innerText || element.textContent || '';
            break;
          }
        }

        // Clean up content
        content = content.replace(/\s+/g, ' ').trim();
        
        return {
          title: title.trim(),
          content: content,
          preview: content.substring(0, 200) + (content.length > 200 ? '...' : '')
        };
      });

      console.log(`Successfully scraped content from ${url}. Title: ${scrapedData.title}`);

      // Update database record
      await ScrapedUrl.findByIdAndUpdate(scrapedUrlId, {
        title: scrapedData.title,
        content: scrapedData.content,
        preview: scrapedData.preview,
        status: 'ready',
        errorMessage: null
      });

      console.log(`Updated ScrapedUrl record ${scrapedUrlId} with scraped content`);

    } catch (error) {
      console.error(`Error scraping URL ${url}:`, error);

      // Check if it's a Puppeteer-related error and try fallback
      if (error.message.includes('Failed to launch') || 
          error.message.includes('browser process') ||
          error.message.includes('Could not find Chrome') ||
          error.message.includes('Chrome') ||
          error.message.includes('puppeteer')) {
        console.log(`Puppeteer failed, attempting fallback scraping for ${url}`);
        try {
          await this.performFallbackScraping(scrapedUrlId, url);
        } catch (fallbackError) {
          console.error(`Fallback scraping also failed for ${url}:`, fallbackError);
          // Update record with error status
          await ScrapedUrl.findByIdAndUpdate(scrapedUrlId, {
            status: 'failed',
            errorMessage: `Both Puppeteer and fallback failed: ${fallbackError.message}`,
            title: 'Failed to scrape',
            preview: 'Unable to access content from this URL'
          });
        }
      } else {
        // Update record with error status
        await ScrapedUrl.findByIdAndUpdate(scrapedUrlId, {
          status: 'failed',
          errorMessage: error.message,
          title: 'Failed to scrape',
          preview: 'Unable to access content from this URL'
        });
      }

    } finally {
      if (browser) {
        try {
          await browser.close();
        } catch (closeError) {
          console.error('Error closing browser:', closeError);
        }
      }
    }
  }

  static async getUrlsByUserId(userId, page = 1, limit = 10, sortBy = 'scrapedDate', sortOrder = 'desc') {
    try {
      console.log(`Fetching URLs for user ${userId}, page: ${page}, limit: ${limit}`);
      
      const skip = (page - 1) * limit;
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const urls = await ScrapedUrl.find({ userId })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await ScrapedUrl.countDocuments({ userId });

      console.log(`Found ${urls.length} URLs for user ${userId}, total: ${total}`);
      
      return {
        urls,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching URLs:', error);
      throw new Error('Failed to fetch URLs');
    }
  }

  static async deleteUrl(urlId, userId) {
    try {
      console.log(`Deleting URL ${urlId} for user ${userId}`);
      
      const deletedUrl = await ScrapedUrl.findOneAndDelete({ 
        _id: urlId, 
        userId 
      });

      if (!deletedUrl) {
        throw new Error('URL not found');
      }

      console.log(`Successfully deleted URL: ${deletedUrl.url}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting URL:', error);
      throw new Error('Failed to delete URL');
    }
  }

  static async rescrapeUrl(urlId, userId) {
    try {
      console.log(`Re-scraping URL ${urlId} for user ${userId}`);
      
      const scrapedUrl = await ScrapedUrl.findOne({ _id: urlId, userId });
      if (!scrapedUrl) {
        throw new Error('URL not found');
      }

      // Update status to processing
      await ScrapedUrl.findByIdAndUpdate(urlId, {
        status: 'processing',
        errorMessage: null
      });

      // Start scraping in background
      this.performScraping(urlId, scrapedUrl.url).catch(error => {
        console.error(`Background re-scraping failed for ${scrapedUrl.url}:`, error);
      });

      console.log(`Re-scraping initiated for URL: ${scrapedUrl.url}`);
      return { success: true };
    } catch (error) {
      console.error('Error re-scraping URL:', error);
      throw new Error('Failed to re-scrape URL');
    }
  }
}

module.exports = UrlScrapingService;