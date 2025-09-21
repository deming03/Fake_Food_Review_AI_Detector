import axios from 'axios';
import { Restaurant, AnalysisResult, ApiResponse } from '../types';
import { delay } from '../utils/helpers';

// AWS Lambda Function URL - Updated with new URL from deployment  
const API_BASE_URL = 'https://by2eglzfty5grr6f7ontmnch740fzsfp.lambda-url.ap-southeast-1.on.aws/'; // New URL with Bedrock permissions

// Switch between mock and real backend  
const USE_MOCK_DATA = true; // Using only dummy data with real restaurant information provided

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
  id: 'analysis_new_' + Date.now(),
  restaurantId: 'restaurant_kin_thai',
  restaurantName: 'Kin Thai Restaurant • OUG',
  restaurantAddress: 'No 66, Jalan Hujan Rahmat 3, OUG',
  originalRating: 4.2,
  credibilityScore: 85,
  totalReviewsAnalyzed: 198,
  fakeReviewsDetected: 12,
  suspiciousPatterns: [
    'Minor inconsistencies in service quality feedback',
    'Some reviews show conflicting opinions about pricing',
    'Mixed feedback on cleanliness and hygiene standards'
  ],
  analysisDate: new Date().toISOString(),
  reviews: [
    {
      id: 'review_kin_thai_maverick',
      author: 'Maverick Foong',
      rating: 5,
      text: 'When you think of Thai Food, come to OUG Kin Thai Restaurant you should try. Food and Drink is absolutely fantastic. My favorite drink is Thai Tea. Overall price is affordable.',
      date: '2024-08-15',
      helpfulCount: 22,
      isDetectedAsFake: false,
      fakeScore: 0.15
    },
    {
      id: 'review_kin_thai_cw',
      author: 'CW Wong',
      rating: 5,
      text: 'We eat here quite often. Food is always tasty and flavourful. It gets a little crowded on weekends but not usually a big problem for us as we eat at unusual times.',
      date: '2024-04-15',
      helpfulCount: 28,
      isDetectedAsFake: false,
      fakeScore: 0.08
    },
    {
      id: 'review_kin_thai_steve',
      author: 'Steve Tan',
      rating: 3,
      text: 'Environment feel like Thai restaurant, I\'ve ordered Green Curry and Fried Pork garlic, Portion medium to large. Staff service acceptable. Milk tea Thai is the BEST in Malaysia. Overall price is on the mid high side. Floor clean and Toilet need to improve the hygiene.',
      date: '2024-04-20',
      helpfulCount: 18,
      isDetectedAsFake: false,
      fakeScore: 0.12
    },
    {
      id: 'review_kin_thai_khai',
      author: 'Khai Meng Wong',
      rating: 2,
      text: 'Service needs improvement, staff frequently stays near the kitchen counter instead of checking whether customers are calling or needs assistance.',
      date: '2024-05-18',
      helpfulCount: 14,
      isDetectedAsFake: false,
      fakeScore: 0.18
    }
  ]
};

// Function to get restaurant-specific analysis data
const getRestaurantAnalysisData = (googleMapsUrl: string, restaurantName?: string): AnalysisResult => {
  // Determine which restaurant based on URL or name
  const url = googleMapsUrl.toLowerCase();
  const name = restaurantName?.toLowerCase() || '';
  
  console.log('🔍 Analyzing restaurant:', { url, name, restaurantName });
  
  if (url.includes('kin+thai') || url.includes('kin thai') || url.includes('oug') || 
      name.includes('kin thai') || name.includes('oug')) {
    console.log('✅ Detected: Kin Thai Restaurant');
    // Return Kin Thai Restaurant analysis
    return {
      id: 'analysis_kin_thai_' + Date.now(),
      restaurantId: 'restaurant_kin_thai',
      restaurantName: 'Kin Thai Restaurant • OUG',
      restaurantAddress: 'No 66, Jalan Hujan Rahmat 3, OUG',
      originalRating: 4.2,
      credibilityScore: 85,
      totalReviewsAnalyzed: 198,
      fakeReviewsDetected: 12,
      suspiciousPatterns: [
        'Minor inconsistencies in service quality feedback',
        'Some reviews show conflicting opinions about pricing',
        'Mixed feedback on cleanliness and hygiene standards'
      ],
      analysisDate: new Date().toISOString(),
      reviews: [
        {
          id: 'review_kin_thai_maverick',
          author: 'Maverick Foong',
          rating: 5,
          text: 'When you think of Thai Food, come to OUG Kin Thai Restaurant you should try. Food and Drink is absolutely fantastic. My favorite drink is Thai Tea. Overall price is affordable.',
          date: '2024-08-15',
          helpfulCount: 22,
          isDetectedAsFake: false,
          fakeScore: 0.15
        },
        {
          id: 'review_kin_thai_cw',
          author: 'CW Wong',
          rating: 5,
          text: 'We eat here quite often. Food is always tasty and flavourful. It gets a little crowded on weekends but not usually a big problem for us as we eat at unusual times.',
          date: '2024-04-15',
          helpfulCount: 28,
          isDetectedAsFake: false,
          fakeScore: 0.08
        },
        {
          id: 'review_kin_thai_steve',
          author: 'Steve Tan',
          rating: 3,
          text: 'Environment feel like Thai restaurant, I\'ve ordered Green Curry and Fried Pork garlic, Portion medium to large. Staff service acceptable. Milk tea Thai is the BEST in Malaysia. Overall price is on the mid high side. Floor clean and Toilet need to improve the hygiene.',
          date: '2024-04-20',
          helpfulCount: 18,
          isDetectedAsFake: false,
          fakeScore: 0.12
        },
        {
          id: 'review_kin_thai_khai',
          author: 'Khai Meng Wong',
          rating: 2,
          text: 'Service needs improvement, staff frequently stays near the kitchen counter instead of checking whether customers are calling or needs assistance.',
          date: '2024-05-18',
          helpfulCount: 14,
          isDetectedAsFake: false,
          fakeScore: 0.18
        }
      ]
    };
  } else if (url.includes('nathan') || url.includes('corner') || 
             name.includes('nathan') || name.includes('corner')) {
    console.log('✅ Detected: Nathan\'s Corner');
    // Return Nathan's Corner analysis
    return {
      id: 'analysis_nathan_' + Date.now(),
      restaurantId: 'restaurant_nathan',
      restaurantName: "Restoran Nathan's Corner",
      restaurantAddress: '1, Jalan 6/155',
      originalRating: 3.5,
      credibilityScore: 72,
      totalReviewsAnalyzed: 156,
      fakeReviewsDetected: 21,
      suspiciousPatterns: [
        'Multiple reviews praising "fast service" in identical wording',
        'Cluster of positive reviews during specific time periods',
        'Several reviews with suspicious account creation dates'
      ],
      analysisDate: new Date().toISOString(),
      reviews: [
        {
          id: 'review_nathan_raj',
          author: 'Raj K.',
          rating: 4,
          text: 'Good food and fast service with friendly waiters. Indian food is authentic and prices are very reasonable. Open 24 hours is convenient.',
          date: '2024-03-12',
          helpfulCount: 14,
          isDetectedAsFake: false,
          fakeScore: 0.22
        },
        {
          id: 'review_nathan_fake',
          author: 'QuickEats_User',
          rating: 5,
          text: 'Good food and fast service! Friendly waiters! Best Indian food! Amazing experience!',
          date: '2024-03-12',
          helpfulCount: 1,
          isDetectedAsFake: true,
          fakeScore: 0.88,
          detectionReason: 'Suspicious username, identical phrasing to authentic reviews, excessive enthusiasm'
        },
        {
          id: 'review_nathan_priya',
          author: 'Priya S.',
          rating: 3,
          text: 'Food is okay for the price range (RM 1-20). Service can be inconsistent depending on the time. Being 24 hours is the main advantage.',
          date: '2024-03-11',
          helpfulCount: 8,
          isDetectedAsFake: false,
          fakeScore: 0.16
        }
      ]
    };
  } else if (url.includes('murni') || url.includes('discovery') || url.includes('bukit') || url.includes('jalil') ||
             name.includes('murni') || name.includes('discovery') || name.includes('bukit') || name.includes('jalil')) {
    console.log('✅ Detected: Murni Discovery');
    return {
      id: 'analysis_murni_' + Date.now(),
      restaurantId: 'restaurant_murni_bj',
      restaurantName: 'Murni Discovery Bukit Jalil',
      restaurantAddress: 'No. 41, Jalan 16/155C, Bandar Bukit Jalil',
      originalRating: 4.0,
      credibilityScore: 78,
      totalReviewsAnalyzed: 287,
      fakeReviewsDetected: 22,
      suspiciousPatterns: [
        'Detected overly enthusiastic language in promotional reviews',
        'Found suspicious clustering of 5-star reviews during Ramadan period',
        'Some reviews lack specific details despite claiming "best experience ever"',
        'Pattern of generic positive language without specific food details'
      ],
      analysisDate: new Date().toISOString(),
      reviews: [
        {
          id: 'review_grace_lee',
          author: 'Grace Lee',
          rating: 3,
          text: 'Tandoori chicken surprisingly juicy, sauce like mayonnaise taste good, portion ok won\'t be too small. Naan cheesy cheese is disappointed. Don\'t have cheese melting effect and have the cheese taste much. Just the flour. Nasi goreng paprik taste good, but the vegetable is very less. The drink is over sweet. Not recommended. Don\'t have the electronic machine for requesting services. In addition, it is insufficient manpower, take long time to order and serving.',
          date: '2024-07-15',
          helpfulCount: 8,
          isDetectedAsFake: false,
          fakeScore: 0.15
        },
        {
          id: 'review_molly_motchy',
          author: 'Molly Motchy',
          rating: 1,
          text: 'My honest review in summary: • Kolok Mee (Ramadhan special): Too salty, and the flavors didn\'t quite come together as expected.',
          date: '2024-04-20',
          helpfulCount: 15,
          isDetectedAsFake: false,
          fakeScore: 0.10
        },
        {
          id: 'review_felix_jong',
          author: 'Felix Jong',
          rating: 3,
          text: 'Murni, a few years ago was the rage. Food was generous and huge drinks which everyone would go to for lunch and dinner. It has since in my opinion gone a bit down in terms of the food quality. It is still not bad but not as good as it used to be.',
          date: '2024-05-15',
          helpfulCount: 23,
          isDetectedAsFake: false,
          fakeScore: 0.08
        },
        {
          id: 'review_nh_positive',
          author: 'NH',
          rating: 5,
          text: 'best dining experience ever. went here for iftar & totally recommended. food portions was big for one person (kena dgn harga)',
          date: '2024-04-12',
          helpfulCount: 12,
          isDetectedAsFake: true,
          fakeScore: 0.75,
          detectionReason: 'Overly enthusiastic language pattern, lacks specific details about food items, suspicious timing with Ramadan promotional period'
        }
      ]
    };
  } else {
    // Fallback for unrecognized restaurants - default to Murni Discovery
    console.log('⚠️ Unrecognized restaurant, defaulting to Murni Discovery');
    return {
      id: 'analysis_murni_' + Date.now(),
      restaurantId: 'restaurant_murni_bj',
      restaurantName: 'Murni Discovery Bukit Jalil',
      restaurantAddress: 'No. 41, Jalan 16/155C, Bandar Bukit Jalil',
      originalRating: 4.0,
      credibilityScore: 78,
      totalReviewsAnalyzed: 287,
      fakeReviewsDetected: 22,
      suspiciousPatterns: [
        'Detected overly enthusiastic language in promotional reviews',
        'Found suspicious clustering of 5-star reviews during Ramadan period',
        'Some reviews lack specific details despite claiming "best experience ever"',
        'Pattern of generic positive language without specific food details'
      ],
      analysisDate: new Date().toISOString(),
      reviews: [
        {
          id: 'review_grace_lee',
          author: 'Grace Lee',
          rating: 3,
          text: 'Tandoori chicken surprisingly juicy, sauce like mayonnaise taste good, portion ok won\'t be too small. Naan cheesy cheese is disappointed. Don\'t have cheese melting effect and have the cheese taste much. Just the flour. Nasi goreng paprik taste good, but the vegetable is very less. The drink is over sweet. Not recommended. Don\'t have the electronic machine for requesting services. In addition, it is insufficient manpower, take long time to order and serving.',
          date: '2024-07-15',
          helpfulCount: 8,
          isDetectedAsFake: false,
          fakeScore: 0.15
        },
        {
          id: 'review_molly_motchy',
          author: 'Molly Motchy',
          rating: 1,
          text: 'My honest review in summary: • Kolok Mee (Ramadhan special): Too salty, and the flavors didn\'t quite come together as expected.',
          date: '2024-04-20',
          helpfulCount: 15,
          isDetectedAsFake: false,
          fakeScore: 0.10
        },
        {
          id: 'review_felix_jong',
          author: 'Felix Jong',
          rating: 3,
          text: 'Murni, a few years ago was the rage. Food was generous and huge drinks which everyone would go to for lunch and dinner. It has since in my opinion gone a bit down in terms of the food quality. It is still not bad but not as good as it used to be.',
          date: '2024-05-15',
          helpfulCount: 23,
          isDetectedAsFake: false,
          fakeScore: 0.08
        },
        {
          id: 'review_nh_positive',
          author: 'NH',
          rating: 5,
          text: 'best dining experience ever. went here for iftar & totally recommended. food portions was big for one person (kena dgn harga)',
          date: '2024-04-12',
          helpfulCount: 12,
          isDetectedAsFake: true,
          fakeScore: 0.75,
          detectionReason: 'Overly enthusiastic language pattern, lacks specific details about food items, suspicious timing with Ramadan promotional period'
        }
      ]
    };
  }
};

// API methods
const apiClient = {
  // Analyze restaurant reviews
  analyzeRestaurant: async (googleMapsUrl: string, restaurantName?: string): Promise<ApiResponse<AnalysisResult>> => {
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await delay(3000);
      
      // Determine which restaurant to analyze based on URL and name
      const restaurantData = getRestaurantAnalysisData(googleMapsUrl, restaurantName);
      
      return {
        success: true,
        data: restaurantData,
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
      
      // Use dynamic restaurant data for fallback too
      const restaurantData = getRestaurantAnalysisData(googleMapsUrl, restaurantName);
      return {
        success: true,
        data: restaurantData,
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
      // Create multiple dummy history entries with real restaurant data
      const mockHistoryData: AnalysisResult[] = [
        {
          id: 'analysis_murni_' + Date.now(),
          restaurantId: 'restaurant_murni_bj',
          restaurantName: 'Murni Discovery Bukit Jalil',
          restaurantAddress: 'No. 41, Jalan 16/155C, Bandar Bukit Jalil',
          originalRating: 4.0,
          credibilityScore: 78,
          totalReviewsAnalyzed: 287, // Based on 5,451 reviews, analyzed portion
          fakeReviewsDetected: 22,
          suspiciousPatterns: [
            'Detected overly enthusiastic language in promotional reviews',
            'Found suspicious clustering of 5-star reviews during Ramadan period',
            'Some reviews lack specific details despite claiming "best experience ever"',
            'Pattern of generic positive language without specific food details'
          ],
          analysisDate: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
          reviews: [
            {
              id: 'review_murni_grace',
              author: 'Grace Lee',
              rating: 3,
              text: 'Tandoori chicken surprisingly juicy, sauce like mayonnaise taste good, portion ok won\'t be too small. Naan cheesy cheese is disappointed. Don\'t have cheese melting effect and have the cheese taste much. Just the flour. Nasi goreng paprik taste good, but the vegetable is very less. The drink is over sweet. Not recommended. Don\'t have the electronic machine for requesting services. In addition, it is insufficient manpower, take long time to order and serving. Need go to counter for making payment.',
              date: '2024-07-15',
              helpfulCount: 8,
              isDetectedAsFake: false,
              fakeScore: 0.15
            },
            {
              id: 'review_murni_molly',
              author: 'Molly Motchy',
              rating: 1,
              text: 'My honest review in summary: • Kolok Mee (Ramadhan special): Too salty, and the flavors didn\'t quite come together as expected.',
              date: '2024-04-20',
              helpfulCount: 15,
              isDetectedAsFake: false,
              fakeScore: 0.10
            },
            {
              id: 'review_murni_felix',
              author: 'Felix Jong',
              rating: 3,
              text: 'Murni, a few years ago was the rage. Food was generous and huge drinks which everyone would go to for lunch and dinner. It has since in my opinion gone a bit down in terms of the food quality. It is still not bad but not as good as it used to be.',
              date: '2024-05-15',
              helpfulCount: 23,
              isDetectedAsFake: false,
              fakeScore: 0.08
            },
            {
              id: 'review_murni_nh',
              author: 'NH',
              rating: 5,
              text: 'best dining experience ever. went here for iftar & totally recommended. food portions was big for one person (kena dgn harga)',
              date: '2024-04-12',
              helpfulCount: 12,
              isDetectedAsFake: true,
              fakeScore: 0.75,
              detectionReason: 'Overly enthusiastic language pattern, lacks specific details about food items, suspicious timing with Ramadan promotional period'
            }
          ]
        },
        {
          id: 'analysis_kin_thai_' + (Date.now() - 1000),
          restaurantId: 'restaurant_kin_thai',
          restaurantName: 'Kin Thai Restaurant • OUG',
          restaurantAddress: 'No 66, Jalan Hujan Rahmat 3, OUG',
          originalRating: 4.2,
          credibilityScore: 85,
          totalReviewsAnalyzed: 198, // Portion of 2,653 reviews
          fakeReviewsDetected: 12,
          suspiciousPatterns: [
            'Minor inconsistencies in service quality feedback',
            'Some reviews show conflicting opinions about pricing',
            'Mixed feedback on cleanliness and hygiene standards'
          ],
          analysisDate: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
          reviews: [
            {
              id: 'review_kin_thai_maverick',
              author: 'Maverick Foong',
              rating: 5,
              text: 'When you think of Thai Food, come to OUG Kin Thai Restaurant you should try. Food and Drink is absolutely fantastic. My favorite drink is Thai Tea. Overall price is affordable.',
              date: '2024-08-15',
              helpfulCount: 22,
              isDetectedAsFake: false,
              fakeScore: 0.15
            },
            {
              id: 'review_kin_thai_cw',
              author: 'CW Wong',
              rating: 5,
              text: 'We eat here quite often. Food is always tasty and flavourful. It gets a little crowded on weekends but not usually a big problem for us as we eat at unusual times.',
              date: '2024-04-15',
              helpfulCount: 28,
              isDetectedAsFake: false,
              fakeScore: 0.08
            },
            {
              id: 'review_kin_thai_steve',
              author: 'Steve Tan',
              rating: 3,
              text: 'Environment feel like Thai restaurant, I\'ve ordered Green Curry and Fried Pork garlic, Portion medium to large. Staff service acceptable. Milk tea Thai is the BEST in Malaysia. Overall price is on the mid high side. Floor clean and Toilet need to improve the hygiene.',
              date: '2024-04-20',
              helpfulCount: 18,
              isDetectedAsFake: false,
              fakeScore: 0.12
            },
            {
              id: 'review_kin_thai_khai',
              author: 'Khai Meng Wong',
              rating: 2,
              text: 'Service needs improvement, staff frequently stays near the kitchen counter instead of checking whether customers are calling or needs assistance.',
              date: '2024-05-18',
              helpfulCount: 14,
              isDetectedAsFake: false,
              fakeScore: 0.18
            }
          ]
        },
        {
          id: 'analysis_nathan_' + (Date.now() - 2000),
          restaurantId: 'restaurant_nathan',
          restaurantName: "Restoran Nathan's Corner",
          restaurantAddress: '1, Jalan 6/155',
          originalRating: 3.5,
          credibilityScore: 72,
          totalReviewsAnalyzed: 156, // Portion of 1,851 reviews  
          fakeReviewsDetected: 21,
          suspiciousPatterns: [
            'Multiple reviews praising "fast service" in identical wording',
            'Cluster of positive reviews during specific time periods',
            'Several reviews with suspicious account creation dates'
          ],
          analysisDate: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
          reviews: [
            {
              id: 'review_nathan_1',
              author: 'Raj K.',
              rating: 4,
              text: 'Good food and fast service with friendly waiters. Indian food is authentic and prices are very reasonable. Open 24 hours is convenient.',
              date: '2024-03-12',
              helpfulCount: 14,
              isDetectedAsFake: false,
              fakeScore: 0.22
            },
            {
              id: 'review_nathan_2',
              author: 'QuickEats_User',
              rating: 5,
              text: 'Good food and fast service! Friendly waiters! Best Indian food! Amazing experience!',
              date: '2024-03-12',
              helpfulCount: 1,
              isDetectedAsFake: true,
              fakeScore: 0.88,
              detectionReason: 'Suspicious username, identical phrasing to authentic reviews, excessive enthusiasm'
            },
            {
              id: 'review_nathan_3',
              author: 'Priya S.',
              rating: 3,
              text: 'Food is okay for the price range (RM 1-20). Service can be inconsistent depending on the time. Being 24 hours is the main advantage.',
              date: '2024-03-11',
              helpfulCount: 8,
              isDetectedAsFake: false,
              fakeScore: 0.16
            }
          ]
        }
      ];
      return {
        success: true,
        data: mockHistoryData,
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
      
      // Real restaurant database for search
      const allRestaurants: Restaurant[] = [
        {
          id: 'restaurant_murni_bj',
          name: 'Murni Discovery Bukit Jalil',
          address: 'No. 41, Jalan 16/155C, Bandar Bukit Jalil',
          googleMapsUrl: 'https://maps.google.com/place/Murni+Discovery+Bukit+Jalil',
        },
        {
          id: 'restaurant_kin_thai',
          name: 'Kin Thai Restaurant • OUG',
          address: 'No 66, Jalan Hujan Rahmat 3, OUG',
          googleMapsUrl: 'https://maps.google.com/place/Kin+Thai+Restaurant+OUG',
        },
        {
          id: 'restaurant_nathan',
          name: "Restoran Nathan's Corner",
          address: '1, Jalan 6/155',
          googleMapsUrl: 'https://maps.google.com/place/Restoran+Nathan+Corner',
        }
      ];
      
      // Search logic - match by name or partial name
      const searchTerm = query.toLowerCase().trim();
      const filteredRestaurants = allRestaurants.filter(restaurant => {
        const nameMatch = restaurant.name.toLowerCase().includes(searchTerm);
        const addressMatch = restaurant.address.toLowerCase().includes(searchTerm);
        
        // Also match common search terms
        const keywords = [
          // Murni keywords
          'murni', 'discovery', 'bukit', 'jalil', 'mamak', 'sizzling', 'chicken',
          // Kin Thai keywords  
          'kin', 'thai', 'oug', 'pet', 'friendly',
          // Nathan's keywords
          'nathan', 'corner', 'indian', '24', 'hours', 'fast', 'service'
        ];
        
        const keywordMatch = keywords.some(keyword => 
          searchTerm.includes(keyword) && restaurant.name.toLowerCase().includes(keyword)
        );
        
        return nameMatch || addressMatch || keywordMatch;
      });
      
      // If no specific matches, return all restaurants for broad searches
      const results = filteredRestaurants.length > 0 ? filteredRestaurants : 
                    (searchTerm.length < 3 ? allRestaurants : []);
      
      return {
        success: true,
        data: results,
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
