import axios from 'axios';
import { Restaurant, AnalysisResult, ApiResponse } from '../types';
import { delay } from '../utils/helpers';

// AWS API Gateway base URL (will be updated when configuring AWS)
const API_BASE_URL = 'https://your-api-gateway-url/dev'; // To be updated

// For Expo testing, we'll use mock data
const USE_MOCK_DATA = true; // Set to false when backend is ready

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock data for testing
const mockAnalysisResult: AnalysisResult = {
  id: 'analysis_' + Date.now(),
  restaurantId: 'restaurant_' + Date.now(),
  credibilityScore: 78,
  totalReviewsAnalyzed: 156,
  fakeReviewsDetected: 12,
  suspiciousPatterns: [
    'Detected overly simple reviews',
    'Found reviews with excessive exclamation marks',
    'Identified potential promotional bias'
  ],
  analysisDate: new Date().toISOString(),
  reviews: [
    {
      id: 'review_1',
      author: 'John D.',
      rating: 5,
      text: 'Amazing food and great service! The pasta was incredible and the atmosphere was perfect. Highly recommend!',
      date: '2024-01-15',
      helpfulCount: 8,
      isDetectedAsFake: false,
      fakeScore: 0.2
    },
    {
      id: 'review_2',
      author: 'Sarah M.',
      rating: 5,
      text: 'Best restaurant ever!!!! So good!!!',
      date: '2024-01-14',
      helpfulCount: 1,
      isDetectedAsFake: true,
      fakeScore: 0.9
    },
    {
      id: 'review_3',
      author: 'Mike R.',
      rating: 4,
      text: 'Good food overall, though service was a bit slow. The main course was well-prepared and the dessert was excellent. Would visit again.',
      date: '2024-01-13',
      helpfulCount: 15,
      isDetectedAsFake: false,
      fakeScore: 0.1
    },
    {
      id: 'review_4',
      author: 'Lisa K.',
      rating: 5,
      text: 'Perfect perfect perfect! Love it!',
      date: '2024-01-12',
      helpfulCount: 2,
      isDetectedAsFake: true,
      fakeScore: 0.8
    }
  ]
};

// API methods
export const restaurantApi = {
  // Analyze restaurant reviews
  analyzeRestaurant: async (googleMapsUrl: string): Promise<ApiResponse<AnalysisResult>> => {
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await delay(3000);
      return {
        success: true,
        data: mockAnalysisResult,
      };
    }

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
    if (USE_MOCK_DATA) {
      await delay(1000);
      return {
        success: true,
        data: mockAnalysisResult,
      };
    }

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
    if (USE_MOCK_DATA) {
      await delay(1000);
      return {
        success: true,
        data: [mockAnalysisResult],
      };
    }

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
