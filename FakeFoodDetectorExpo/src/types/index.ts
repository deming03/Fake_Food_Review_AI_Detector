export interface Restaurant {
  id: string;
  name: string;
  address: string;
  placeId?: string;
  googleMapsUrl: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  helpfulCount?: number;
  isDetectedAsFake?: boolean;
  fakeScore?: number;
}

export interface AnalysisResult {
  id: string;
  restaurantId: string;
  credibilityScore: number;
  totalReviewsAnalyzed: number;
  fakeReviewsDetected: number;
  suspiciousPatterns: string[];
  analysisDate: string;
  reviews: Review[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Authentication Stack
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

// Main App Stack (authenticated users)
export type RootStackParamList = {
  MainTabs: undefined;
  Home: undefined;
  Analysis: {
    restaurantUrl: string;
    restaurantName?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  Results: {
    analysisResult: AnalysisResult;
  };
  History: undefined;
  Profile: undefined;
  Settings: undefined;
  SearchResults: {
    query: string;
    location?: string;
  };
  OnboardingFlow: undefined;
};

// Combined navigation type
export type AppNavigationParamList = AuthStackParamList & RootStackParamList;
