import api from './api';

// Description: Login user functionality
// Endpoint: POST /api/auth/login
// Request: { email: string, password: string }
// Response: { accessToken: string, refreshToken: string }
export const login = async (email: string, password: string) => {
  try {
    console.log('Frontend: Attempting login for:', email);
    const response = await api.post('/api/auth/login', { email, password });
    console.log('Frontend: Login response received:', { success: !!response.data.accessToken });
    return response.data;
  } catch (error) {
    console.error('Frontend: Login error:', error);
    console.error('Frontend: Error response:', error?.response?.data);
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Register user functionality
// Endpoint: POST /api/auth/register
// Request: { email: string, password: string }
// Response: { email: string }
export const register = async (email: string, password: string) => {
  try {
    console.log('Frontend: Attempting registration for:', email);
    const response = await api.post('/api/auth/register', {email, password});
    console.log('Frontend: Registration response received:', { success: !!response.data.email });
    return response.data;
  } catch (error) {
    console.error('Frontend: Registration error:', error);
    console.error('Frontend: Error response:', error?.response?.data);
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Logout
// Endpoint: POST /api/auth/logout
// Request: {}
// Response: { success: boolean, message: string }
export const logout = async () => {
  try {
    return await api.post('/api/auth/logout');
  } catch (error) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};