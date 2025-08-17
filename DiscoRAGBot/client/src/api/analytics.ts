import api from './api';

// Description: Get usage statistics
// Endpoint: GET /api/analytics/usage
// Request: {}
// Response: { stats: { daily: number, weekly: number, monthly: number, topUsers: Array<{ username: string, count: number }>, peakHours: Array<{ hour: number, count: number }> } }
export const getUsageStats = () => {
  console.log("Fetching usage statistics")
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        stats: {
          daily: 127,
          weekly: 892,
          monthly: 3456,
          topUsers: [
            { username: 'john_doe', count: 45 },
            { username: 'jane_smith', count: 38 },
            { username: 'dev_user', count: 32 },
            { username: 'support_team', count: 28 },
            { username: 'admin_user', count: 24 }
          ],
          peakHours: [
            { hour: 9, count: 23 },
            { hour: 10, count: 31 },
            { hour: 11, count: 28 },
            { hour: 14, count: 35 },
            { hour: 15, count: 42 },
            { hour: 16, count: 38 }
          ]
        }
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/analytics/usage');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}

// Description: Get content analytics
// Endpoint: GET /api/analytics/content
// Request: {}
// Response: { analytics: { topTopics: Array<{ topic: string, count: number }>, sourceUtilization: Array<{ source: string, type: string, count: number }>, knowledgeGaps: Array<{ question: string, count: number }> } }
export const getContentAnalytics = () => {
  console.log("Fetching content analytics")
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        analytics: {
          topTopics: [
            { topic: 'bot setup', count: 89 },
            { topic: 'permissions', count: 67 },
            { topic: 'troubleshooting', count: 54 },
            { topic: 'api limits', count: 43 },
            { topic: 'commands', count: 38 }
          ],
          sourceUtilization: [
            { source: 'discord-bot-guide.pdf', type: 'file', count: 156 },
            { source: 'Discord Developer Docs', type: 'url', count: 134 },
            { source: 'Bot Setup Instructions', type: 'manual', count: 98 },
            { source: 'api-documentation.docx', type: 'file', count: 87 },
            { source: 'Discord.js Guide', type: 'url', count: 76 }
          ],
          knowledgeGaps: [
            { question: 'How to handle voice channels?', count: 12 },
            { question: 'Custom emoji management', count: 8 },
            { question: 'Webhook integration', count: 6 },
            { question: 'Database backup procedures', count: 5 }
          ]
        }
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/analytics/content');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}

// Description: Get recent questions
// Endpoint: GET /api/analytics/questions
// Request: {}
// Response: { questions: Array<{ _id: string, question: string, answer: string, user: string, timestamp: string, category: string, helpful: boolean | null }> }
export const getRecentQuestions = () => {
  console.log("Fetching recent questions")
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        questions: [
          {
            _id: '1',
            question: 'How do I add the bot to my server?',
            answer: 'To add the bot to your server, you need to create an invite link with the necessary permissions...',
            user: 'john_doe',
            timestamp: '2024-01-15T14:30:00Z',
            category: 'setup',
            helpful: true
          },
          {
            _id: '2',
            question: 'Why is the bot not responding to commands?',
            answer: 'There are several reasons why the bot might not respond. First, check if the bot has the necessary permissions...',
            user: 'jane_smith',
            timestamp: '2024-01-15T14:25:00Z',
            category: 'troubleshooting',
            helpful: true
          },
          {
            _id: '3',
            question: 'What are the rate limits for the Discord API?',
            answer: 'Discord API has different rate limits depending on the endpoint. For most endpoints, you can make...',
            user: 'dev_user',
            timestamp: '2024-01-15T14:20:00Z',
            category: 'technical',
            helpful: null
          },
          {
            _id: '4',
            question: 'How to set up slash commands?',
            answer: 'Slash commands are registered through the Discord API. You need to define the command structure...',
            user: 'support_team',
            timestamp: '2024-01-15T14:15:00Z',
            category: 'development',
            helpful: false
          }
        ]
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/analytics/questions');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}