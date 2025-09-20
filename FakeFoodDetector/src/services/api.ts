import axios from 'axios';
import { Restaurant, AnalysisResult, ApiResponse } from '../types';

// AWS API Gateway base URL (will be updated when configuring AWS)
const API_BASE_URL = 'https://your-api-gateway-url/dev'; // To be updated

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30秒超时
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token etc
apiClient.interceptors.request.use(
  (config) => {
    // Auth logic can be added here
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - unified error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API methods
export const restaurantApi = {
  // Analyze restaurant reviews
  analyzeRestaurant: async (googleMapsUrl: string): Promise<ApiResponse<AnalysisResult>> => {
    try {
      const response = await apiClient.post('/analyze', {
        googleMapsUrl,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Analysis failed',
      };
    }
  },

  // Get analysis result
  getAnalysisResult: async (analysisId: string): Promise<ApiResponse<AnalysisResult>> => {
    try {
      const response = await apiClient.get(`/analysis/${analysisId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get results',
      };
    }
  },

  // Get analysis history
  getAnalysisHistory: async (): Promise<ApiResponse<AnalysisResult[]>> => {
    try {
      const response = await apiClient.get('/history');
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get history records',
      };
    }
  },
};

export default apiClient;
