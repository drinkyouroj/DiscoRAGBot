import api from './api';

// Description: Get scraped URLs list
// Endpoint: GET /api/urls
// Request: { page?: number, limit?: number, sortBy?: string, sortOrder?: string }
// Response: { urls: Array<{ _id: string, url: string, title: string, scrapedDate: string, status: 'processing' | 'ready' | 'failed', preview: string }>, pagination: { page: number, limit: number, total: number, pages: number } }
export const getUrls = async (params?: { page?: number; limit?: number; sortBy?: string; sortOrder?: string }) => {
  console.log("Fetching URLs list", params);
  try {
    const response = await api.get('/api/urls', { params });
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
}

// Description: Add a new URL for scraping
// Endpoint: POST /api/urls/scrape
// Request: { url: string }
// Response: { success: boolean, message: string, urlId: string }
export const scrapeUrl = async (url: string) => {
  console.log(`Scraping URL: ${url}`);
  try {
    const response = await api.post('/api/urls/scrape', { url });
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
}

// Description: Re-scrape an existing URL
// Endpoint: POST /api/urls/:id/rescrape
// Request: { id: string }
// Response: { success: boolean, message: string }
export const rescrapeUrl = async (id: string) => {
  console.log(`Re-scraping URL with id: ${id}`);
  try {
    const response = await api.post(`/api/urls/${id}/rescrape`);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
}

// Description: Delete a scraped URL
// Endpoint: DELETE /api/urls/:id
// Request: { id: string }
// Response: { success: boolean, message: string }
export const deleteUrl = async (id: string) => {
  console.log(`Deleting URL with id: ${id}`);
  try {
    const response = await api.delete(`/api/urls/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
}