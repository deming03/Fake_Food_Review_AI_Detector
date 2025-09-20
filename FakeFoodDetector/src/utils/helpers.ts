// Google Maps URL parsing utility
export const parseGoogleMapsUrl = (url: string): { isValid: boolean; placeId?: string; placeName?: string } => {
  try {
    // 基础URL验证
    if (!url.includes('maps.google') && !url.includes('goo.gl')) {
      return { isValid: false };
    }

    // 尝试提取place_id
    const placeIdMatch = url.match(/place_id:([a-zA-Z0-9_-]+)/);
    if (placeIdMatch) {
      return {
        isValid: true,
        placeId: placeIdMatch[1],
      };
    }

    // 尝试提取地点名称
    const placeNameMatch = url.match(/place\/([^/]+)/);
    if (placeNameMatch) {
      return {
        isValid: true,
        placeName: decodeURIComponent(placeNameMatch[1].replace(/\+/g, ' ')),
      };
    }

    return { isValid: true }; // 是Google Maps链接，但可能需要进一步处理
  } catch (error) {
    return { isValid: false };
  }
};

// Format date
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

// Calculate credibility color
export const getCredibilityColor = (score: number): string => {
  if (score >= 80) return '#4CAF50'; // Green - High credibility
  if (score >= 60) return '#FF9800'; // Orange - Medium credibility
  if (score >= 40) return '#FF5722'; // Red - Low credibility
  return '#F44336'; // Deep red - Very low credibility
};

// Format credibility level
export const getCredibilityLevel = (score: number): string => {
  if (score >= 80) return 'High Credibility';
  if (score >= 60) return 'Medium Credibility';
  if (score >= 40) return 'Low Credibility';
  return 'Very Low Credibility';
};

// Validate URL format
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Generate random ID (for development use)
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Truncate long text
export const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};
