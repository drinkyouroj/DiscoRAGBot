import api from './api';

// Description: Get bot configuration
// Endpoint: GET /api/users/bot-settings
// Request: {}
// Response: { success: boolean, config: { personality: string, customPersonality: string, tone: string, responseLength: string, responseFormat: string, confidenceThreshold: number, includeCitations: boolean, enabledChannels: string[] } }
export const getBotConfig = async () => {
  try {
    console.log("Fetching bot configuration");
    const response = await api.get('/api/users/bot-settings');
    return response.data;
  } catch (error: any) {
    console.error("Error fetching bot configuration:", error);
    throw new Error(error?.response?.data?.message || error.message);
  }
}

// Description: Update bot configuration
// Endpoint: POST /api/users/bot-settings
// Request: { personality: string, customPersonality: string, tone: string, responseLength: string, responseFormat: string, confidenceThreshold: number, includeCitations: boolean, enabledChannels: string[] }
// Response: { success: boolean, message: string, config: object }
export const updateBotConfig = async (config: any) => {
  try {
    console.log("Updating bot configuration");
    const response = await api.post('/api/users/bot-settings', config);
    return response.data;
  } catch (error: any) {
    console.error("Error updating bot configuration:", error);
    throw new Error(error?.response?.data?.message || error.message);
  }
}

// Description: Get bot status
// Endpoint: GET /api/bot/status
// Request: {}
// Response: { status: { online: boolean, knowledgeBaseSize: number, lastActivity: string, version: string } }
export const getBotStatus = () => {
  console.log("Fetching bot status")
  // Mocking the response - this will be implemented in a later task
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        status: {
          online: true,
          knowledgeBaseSize: 1247,
          lastActivity: '2024-01-15T14:30:00Z',
          version: '2.1.0'
        }
      });
    }, 300);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/bot/status');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}