import api from './api';

// Description: Get usage statistics
// Endpoint: GET /api/analytics/usage
// Request: {}
// Response: { success: boolean, stats: { daily: number, weekly: number, monthly: number, topUsers: Array<{ username: string, count: number }>, peakHours: Array<{ hour: number, count: number }> } }
export const getUsageStats = async () => {
  console.log("Fetching usage statistics")
  try {
    const response = await api.get('/api/analytics/usage');
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || error.message);
  }
}

// Description: Get content analytics
// Endpoint: GET /api/analytics/content
// Request: {}
// Response: { success: boolean, analytics: { topTopics: Array<{ topic: string, count: number }>, sourceUtilization: Array<{ source: string, type: string, count: number }>, knowledgeGaps: Array<{ question: string, count: number }> } }
export const getContentAnalytics = async () => {
  console.log("Fetching content analytics")
  try {
    const response = await api.get('/api/analytics/content');
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || error.message);
  }
}

// Description: Get recent questions
// Endpoint: GET /api/analytics/questions
// Request: {}
// Response: { success: boolean, questions: Array<{ _id: string, question: string, answer: string, user: string, timestamp: string, category: string, helpful: boolean | null }> }
export const getRecentQuestions = async () => {
  console.log("Fetching recent questions")
  try {
    const response = await api.get('/api/analytics/questions');
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || error.message);
  }
}

// Description: Create sample analytics data for testing
// Endpoint: POST /api/analytics/sample-data
// Request: {}
// Response: { success: boolean, message: string }
export const createSampleData = async () => {
  console.log("Creating sample analytics data")
  try {
    const response = await api.post('/api/analytics/sample-data');
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || error.message);
  }
}