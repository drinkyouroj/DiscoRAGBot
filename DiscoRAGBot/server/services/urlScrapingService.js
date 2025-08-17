const puppeteer = require('puppeteer');
const ScrapedUrl = require('../models/ScrapedUrl');

class UrlScrapingService {
  static async scrapeUrl(url, userId) {
    console.log(`Starting URL scraping for: ${url} by user: ${userId}`);
    
    // Create initial record with processing status
    const scrapedUrl = new ScrapedUrl({
      url,
      userId,
      status: 'processing'
    });
    
    const savedUrl = await scrapedUrl.save();
    console.log(`Created ScrapedUrl record with ID: ${savedUrl._id}`);

    // Start scraping in background (don't await)
    this.performScraping(savedUrl._id, url).catch(error => {
      console.error(`Background scraping failed for ${url}:`, error);
    });

    return savedUrl;
  }

  static async performScraping(scrapedUrlId, url) {
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
        await this.performFallbackScraping(scrapedUrlId, url);
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

  static async performFallbackScraping(scrapedUrlId, url) {
    try {
      console.log(`Performing fallback scraping for URL: ${url}`);

      // Simple HTTP request fallback using built-in modules
      const https = require('https');
      const http = require('http');

      const client = url.startsWith('https:') ? https : http;
      console.log(`Using ${url.startsWith('https:') ? 'HTTPS' : 'HTTP'} client for ${url}`);

      return new Promise((resolve, reject) => {
        console.log(`Starting HTTP request to ${url}`);

        let requestCompleted = false;
        let timeoutId;

        try {
          console.log(`About to create HTTP request for ${url}`);
          
          const request = client.get(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000
          }, (response) => {
            console.log(`RESPONSE CALLBACK TRIGGERED for ${url}, status: ${response.statusCode}`);

            if (requestCompleted) {
              console.log(`Request already completed for ${url}, ignoring response callback`);
              return;
            }
            clearTimeout(timeoutId);

            let data = '';

            response.on('data', (chunk) => {
              data += chunk;
              console.log(`DATA EVENT: Received ${chunk.length} bytes from ${url}, total: ${data.length} bytes`);
            });

            response.on('end', async () => {
              console.log(`RESPONSE END EVENT for ${url}`);
              try {
                if (requestCompleted) {
                  console.log(`Request already completed for ${url}, ignoring end event`);
                  return;
                }
                requestCompleted = true;

                console.log(`Response complete for ${url}, total data length: ${data.length} bytes`);

                // Simple HTML parsing to extract title and content
                const titleMatch = data.match(/<title[^>]*>([^<]+)<\/title>/i);
                const title = titleMatch ? titleMatch[1].trim() : 'Untitled';
                console.log(`Extracted title: "${title}" from ${url}`);

                // Remove HTML tags and extract text content
                const textContent = data
                  .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                  .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                  .replace(/<[^>]+>/g, ' ')
                  .replace(/\s+/g, ' ')
                  .trim();

                const preview = textContent.substring(0, 200) + (textContent.length > 200 ? '...' : '');
                console.log(`Extracted content length: ${textContent.length} chars, preview: "${preview.substring(0, 50)}..."`);

                console.log(`Updating database record ${scrapedUrlId} with scraped content`);
                await ScrapedUrl.findByIdAndUpdate(scrapedUrlId, {
                  title: title,
                  content: textContent,
                  preview: preview,
                  status: 'ready',
                  errorMessage: null
                });

                console.log(`Fallback scraping successful for ${url}`);
                resolve();
              } catch (parseError) {
                console.error(`Error parsing fallback content for ${url}:`, parseError);
                await ScrapedUrl.findByIdAndUpdate(scrapedUrlId, {
                  status: 'failed',
                  errorMessage: 'Failed to parse content',
                  title: 'Failed to scrape',
                  preview: 'Unable to parse content from this URL'
                });
                reject(parseError);
              }
            });

            response.on('error', async (error) => {
              console.log(`RESPONSE ERROR EVENT for ${url}:`, error);
              if (requestCompleted) return;
              requestCompleted = true;
              clearTimeout(timeoutId);

              console.error(`Response error for ${url}:`, error);
              await ScrapedUrl.findByIdAndUpdate(scrapedUrlId, {
                status: 'failed',
                errorMessage: error.message,
                title: 'Failed to scrape',
                preview: 'Error reading response from this URL'
              });
              reject(error);
            });
          });

          console.log(`HTTP request object created for ${url}`);

          request.on('error', async (error) => {
            console.log(`REQUEST ERROR EVENT for ${url}:`, error);
            if (requestCompleted) return;
            requestCompleted = true;
            clearTimeout(timeoutId);

            console.error(`Fallback scraping request error for ${url}:`, error);
            await ScrapedUrl.findByIdAndUpdate(scrapedUrlId, {
              status: 'failed',
              errorMessage: error.message,
              title: 'Failed to scrape',
              preview: 'Unable to access content from this URL'
            });
            reject(error);
          });

          request.on('timeout', async () => {
            console.log(`REQUEST TIMEOUT EVENT for ${url}`);
            if (requestCompleted) return;
            requestCompleted = true;

            console.error(`Request timeout for ${url}`);
            request.destroy();
            await ScrapedUrl.findByIdAndUpdate(scrapedUrlId, {
              status: 'failed',
              errorMessage: 'Request timeout',
              title: 'Failed to scrape',
              preview: 'Request timed out while accessing this URL'
            });
            reject(new Error('Request timeout'));
          });

          request.on('close', () => {
            console.log(`REQUEST CLOSE EVENT for ${url}`);
          });

          request.on('finish', () => {
            console.log(`REQUEST FINISH EVENT for ${url}`);
          });

          // Set up manual timeout as backup
          timeoutId = setTimeout(async () => {
            console.log(`MANUAL TIMEOUT TRIGGERED for ${url} after 15 seconds`);
            if (requestCompleted) {
              console.log(`Request already completed for ${url}, ignoring manual timeout`);
              return;
            }
            requestCompleted = true;

            console.error(`Fallback scraping timeout for ${url} after 15 seconds`);
            request.destroy();

            await ScrapedUrl.findByIdAndUpdate(scrapedUrlId, {
              status: 'failed',
              errorMessage: 'Request timeout after 15 seconds',
              title: 'Failed to scrape',
              preview: 'Request timed out while accessing this URL'
            });
            reject(new Error('Request timeout'));
          }, 15000);

          console.log(`HTTP request initiated for ${url}, timeout set for 15 seconds`);

        } catch (requestError) {
          console.error(`ERROR CREATING HTTP REQUEST for ${url}:`, requestError);

          ScrapedUrl.findByIdAndUpdate(scrapedUrlId, {
            status: 'failed',
            errorMessage: `Failed to create request: ${requestError.message}`,
            title: 'Failed to scrape',
            preview: 'Unable to create HTTP request for this URL'
          }).then(() => {
            reject(requestError);
          }).catch(dbError => {
            console.error(`Database update error:`, dbError);
            reject(requestError);
          });
        }
      });

    } catch (error) {
      console.error(`OUTER FALLBACK SCRAPING ERROR for ${url}:`, error);
      await ScrapedUrl.findByIdAndUpdate(scrapedUrlId, {
        status: 'failed',
        errorMessage: error.message,
        title: 'Failed to scrape',
        preview: 'Unable to access content from this URL'
      });
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