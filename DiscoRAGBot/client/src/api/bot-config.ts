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
// Endpoint: GET /api/bot-configuration/status
// Request: {}
// Response: { success: boolean, status: { online: boolean, knowledgeBaseSize: number, lastActivity: string, version: string } }
export const getBotStatus = async () => {
  try {
    console.log("Fetching bot status");
    const response = await api.get('/api/bot-configuration/status');
    return response.data;
  } catch (error: any) {
    console.error("Error fetching bot status:", error);
    throw new Error(error?.response?.data?.message || error.message);
  }
}

// Description: Get global bot configuration
// Endpoint: GET /api/bot-configuration
// Request: {}
// Response: { success: boolean, config: { welcomeMessage: string, defaultLanguage: string, activeFeatures: string[], responseTimeout: number, maxConversationLength: number } }
export const getGlobalBotConfig = async () => {
  try {
    console.log("Fetching global bot configuration");
    const response = await api.get('/api/bot-configuration');
    return response.data;
  } catch (error: any) {
    console.error("Error fetching global bot configuration:", error);
    throw new Error(error?.response?.data?.message || error.message);
  }
}

// Description: Update global bot configuration
// Endpoint: PUT /api/bot-configuration
// Request: { welcomeMessage: string, defaultLanguage: string, activeFeatures: string[], responseTimeout: number, maxConversationLength: number }
// Response: { success: boolean, message: string, config: object }
export const updateGlobalBotConfig = async (config: any) => {
  try {
    console.log("Updating global bot configuration");
    const response = await api.put('/api/bot-configuration', config);
    return response.data;
  } catch (error: any) {
    console.error("Error updating global bot configuration:", error);
    throw new Error(error?.response?.data?.message || error.message);
  }
}