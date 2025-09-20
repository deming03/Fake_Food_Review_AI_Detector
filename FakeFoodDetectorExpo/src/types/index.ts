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

export type RootStackParamList = {
  Home: undefined;
  Analysis: {
    restaurantUrl: string;
  };
  Results: {
    analysisResult: AnalysisResult;
  };
  History: undefined;
};
