import React from 'react';
import { View, ViewStyle, Platform } from 'react-native';

// Ultra-safe LinearGradient component that handles all edge cases
interface SafeLinearGradientProps {
  colors: string[];
  style?: ViewStyle;
  children?: React.ReactNode;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

export const SafeLinearGradient: React.FC<SafeLinearGradientProps> = ({ 
  colors, 
  style, 
  children, 
  start, 
  end 
}) => {
  // For web platform, always use solid color to prevent BVLinearGradient errors
  if (Platform.OS === 'web') {
    console.log('Web platform detected, using solid color fallback');
    return (
      <View style={[style, { backgroundColor: colors[0] || '#FF6B35' }]}>
        {children}
      </View>
    );
  }

  // For native platforms, try to use LinearGradient
  try {
    // Dynamic import to prevent web issues
    const ExpoLinearGradient = require('expo-linear-gradient');
    if (ExpoLinearGradient && ExpoLinearGradient.LinearGradient) {
      const LinearGradient = ExpoLinearGradient.LinearGradient;
      return (
        <LinearGradient 
          colors={colors} 
          style={style} 
          start={start} 
          end={end}
        >
          {children}
        </LinearGradient>
      );
    } else {
      throw new Error('LinearGradient not available');
    }
  } catch (error) {
    console.warn('LinearGradient failed, using solid color fallback:', error);
    // Fallback to solid color using first color
    return (
      <View style={[style, { backgroundColor: colors[0] || '#FF6B35' }]}>
        {children}
      </View>
    );
  }
};

export default SafeLinearGradient;
