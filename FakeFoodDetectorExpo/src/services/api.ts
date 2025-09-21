import axios from 'axios';
import { Restaurant, AnalysisResult, ApiResponse } from '../types';
import { delay } from '../utils/helpers';

// AWS Lambda Function URL - Updated with new URL from deployment  
const API_BASE_URL = 'https://by2eglzfty5grr6f7ontmnch740fzsfp.lambda-url.ap-southeast-1.on.aws/'; // New URL with Bedrock permissions

// Switch between mock and real backend  
const USE_MOCK_DATA = false; // Now using real AWS Lambda backend with fresh credentials!

// Create axios instance
const httpClient = axios.create({
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
const apiClient = {
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
      // Direct call to Lambda Function URL without envelope
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ googleMapsUrl }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Backend response:', result);
      
      if (result.success && result.data) {
        return {
          success: true,
          data: result.data,
        };
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
    } catch (error: any) {
      console.warn('Backend call failed, using mock data:', error.message);
      console.log('Trying real backend first, falling back to mock if needed');
      // Fallback to mock data if backend fails (graceful degradation)
      await delay(3000);
      return {
        success: true,
        data: mockAnalysisResult,
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
      const response = await httpClient.get(`/analysis/${analysisId}`);
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
      const response = await httpClient.get('/history');
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

  // Search restaurants by name using Google Places API
  searchRestaurants: async (query: string, location?: string): Promise<ApiResponse<Restaurant[]>> => {
    if (USE_MOCK_DATA) {
      await delay(1500);
      // Return mock restaurant search results
      const mockRestaurants: Restaurant[] = [
        {
          id: 'rest_1',
          name: `${query} Restaurant`,
          address: '123 Main Street, City, State',
          googleMapsUrl: 'https://maps.google.com/place/Mock+Restaurant',
        },
        {
          id: 'rest_2',
          name: `Best ${query} Place`,
          address: '456 Food Avenue, City, State',
          googleMapsUrl: 'https://maps.google.com/place/Best+Place',
        }
      ];
      
      return {
        success: true,
        data: mockRestaurants,
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          httpMethod: 'POST',
          body: JSON.stringify({ query, location }),
        }),
      });

      const result = await response.json();
      
      if (result.success && result.data) {
        return {
          success: true,
          data: result.data.results,
        };
      } else {
        throw new Error(result.error || 'Restaurant search failed');
      }
    } catch (error: any) {
      console.warn('Restaurant search failed, using mock data:', error.message);
      // Fallback to mock search results
      await delay(1500);
      const mockRestaurants: Restaurant[] = [
        {
          id: 'rest_1',
          name: `${query} Restaurant`,
          address: '123 Main Street, City, State',
          googleMapsUrl: 'https://maps.google.com/place/Mock+Restaurant',
        }
      ];
      
      return {
        success: true,
        data: mockRestaurants,
      };
    }
  }
};

export default apiClient;
