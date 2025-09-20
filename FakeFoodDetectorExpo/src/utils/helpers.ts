import { Restaurant } from '../types';

/**
 * 验证URL是否有效
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * 解析Google Maps URL，提取餐厅信息
 */
export const parseGoogleMapsUrl = (url: string): { isValid: boolean; restaurant?: Partial<Restaurant> } => {
  if (!isValidUrl(url)) {
    return { isValid: false };
  }

  // 检查是否为Google Maps、Google Share URL或Google Search URL
  const isGoogleMapsUrl = url.includes('maps.google') || 
                         url.includes('goo.gl') || 
                         url.includes('maps.app.goo.gl') ||
                         url.includes('share.google') ||
                         (url.includes('google.com') && (url.includes('/maps') || url.includes('#vhid=') || url.includes('place_id='))) ||
                         (url.includes('google.com/search?q='));
  
  if (!isGoogleMapsUrl) {
    return { isValid: false };
  }

  try {
    const urlObj = new URL(url);
    
    // 尝试从URL中提取餐厅名称
    let restaurantName = 'Unknown Restaurant';
    
    // Handle share.google URLs (they redirect, so no name in URL)
    if (url.includes('share.google')) {
      restaurantName = 'Restaurant (from Google Share link)';
    }
    // Handle Google search URLs with place IDs OR restaurant names
    else if (url.includes('google.com/search')) {
      // Try to extract from search query
      const queryParam = urlObj.searchParams.get('q');
      if (queryParam) {
        restaurantName = decodeURIComponent(queryParam.replace(/\+/g, ' '));
      } else {
        restaurantName = 'Restaurant (from Google Search)';
      }
    }
    // 方法1: 从路径中提取 (traditional Maps URLs)
    else {
      const pathMatch = urlObj.pathname.match(/\/place\/([^\/]+)/);
      if (pathMatch) {
        restaurantName = decodeURIComponent(pathMatch[1].replace(/\+/g, ' '));
      }
      
      // 方法2: 从查询参数中提取
      const queryParam = urlObj.searchParams.get('query') || urlObj.searchParams.get('q');
      if (queryParam) {
        restaurantName = queryParam;
      }
    }

    return {
      isValid: true,
      restaurant: {
        name: restaurantName,
        googleMapsUrl: url,
        address: 'Address will be fetched during analysis'
      }
    };
  } catch (error) {
    return { isValid: false };
  }
};

/**
 * 格式化日期
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

/**
 * 获取可信度颜色
 */
export const getCredibilityColor = (score: number): string => {
  if (score >= 80) return '#4CAF50'; // 绿色 - 高可信度
  if (score >= 60) return '#FF9800'; // 橙色 - 中等可信度
  return '#F44336'; // 红色 - 低可信度
};

/**
 * 获取可信度描述
 */
export const getCredibilityDescription = (score: number): string => {
  if (score >= 80) return 'High Credibility';
  if (score >= 60) return 'Medium Credibility';
  return 'Low Credibility';
};

/**
 * 模拟延迟（用于演示）
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * 截断文本
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
