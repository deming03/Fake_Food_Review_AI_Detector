// 餐厅相关类型定义
export interface Restaurant {
  id: string;
  name: string;
  address: string;
  googleMapsUrl: string;
  rating?: number;
  totalReviews?: number;
}

// 评论类型定义
export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  isDetectedAsFake?: boolean;
  fakeScore?: number; // 0-1 之间，1表示最可能是假评论
}

// AI分析结果类型
export interface AnalysisResult {
  id: string;
  restaurantId: string;
  credibilityScore: number; // 0-100 可信度评分
  totalReviewsAnalyzed: number;
  fakeReviewsDetected: number;
  suspiciousPatterns: string[];
  analysisDate: string;
  reviews: Review[];
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 导航参数类型
export type RootStackParamList = {
  Home: undefined;
  Analysis: {
    restaurantUrl?: string;
  };
  Results: {
    analysisResult: AnalysisResult;
  };
  History: undefined;
};
