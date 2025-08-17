import api from './api';

// Description: Get manual entries list
// Endpoint: GET /api/manual-entries
// Request: {}
// Response: { entries: Array<{ _id: string, title: string, content: string, category: string, tags: string[], createdDate: string, updatedDate: string }> }
export const getManualEntries = () => {
  console.log("Fetching manual entries list")
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        entries: [
          {
            _id: '1',
            title: 'Bot Setup Instructions',
            content: 'Step-by-step guide to setting up the Discord bot in your server. First, create a new application in the Discord Developer Portal...',
            category: 'Setup',
            tags: ['bot', 'setup', 'discord'],
            createdDate: '2024-01-15T10:30:00Z',
            updatedDate: '2024-01-15T10:30:00Z'
          },
          {
            _id: '2',
            title: 'Common Troubleshooting Steps',
            content: 'If the bot is not responding, check the following: 1. Verify bot permissions, 2. Check server status, 3. Review logs...',
            category: 'Troubleshooting',
            tags: ['troubleshooting', 'help', 'debug'],
            createdDate: '2024-01-14T15:45:00Z',
            updatedDate: '2024-01-14T16:00:00Z'
          },
          {
            _id: '3',
            title: 'API Rate Limits',
            content: 'Discord API has rate limits that must be respected. The bot implements automatic rate limiting to prevent issues...',
            category: 'Technical',
            tags: ['api', 'rate-limits', 'technical'],
            createdDate: '2024-01-13T09:20:00Z',
            updatedDate: '2024-01-13T09:20:00Z'
          }
        ]
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/manual-entries');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}

// Description: Create a new manual entry
// Endpoint: POST /api/manual-entries
// Request: { title: string, content: string, category: string, tags: string[] }
// Response: { success: boolean, message: string, entryId: string }
export const createManualEntry = (data: { title: string; content: string; category: string; tags: string[] }) => {
  console.log("Creating manual entry:", data.title)
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Manual entry created successfully',
        entryId: Math.random().toString(36).substr(2, 9)
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post('/api/manual-entries', data);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}

// Description: Update a manual entry
// Endpoint: PUT /api/manual-entries/:id
// Request: { id: string, title: string, content: string, category: string, tags: string[] }
// Response: { success: boolean, message: string }
export const updateManualEntry = (id: string, data: { title: string; content: string; category: string; tags: string[] }) => {
  console.log(`Updating manual entry with id: ${id}`)
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Manual entry updated successfully'
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.put(`/api/manual-entries/${id}`, data);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}

// Description: Delete a manual entry
// Endpoint: DELETE /api/manual-entries/:id
// Request: { id: string }
// Response: { success: boolean, message: string }
export const deleteManualEntry = (id: string) => {
  console.log(`Deleting manual entry with id: ${id}`)
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Manual entry deleted successfully'
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.delete(`/api/manual-entries/${id}`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}