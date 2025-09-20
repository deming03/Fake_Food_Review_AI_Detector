import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl, 
  PanGestureHandler,
  State
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { Colors, showToast } from './EnhancedUI';

// 🔄 Pull-to-Refresh Scroll View
export const RefreshableScrollView: React.FC<{
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  refreshing?: boolean;
}> = ({ children, onRefresh, refreshing = false }) => {
  const [isRefreshing, setIsRefreshing] = useState(refreshing);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
      showToast.success('Data refreshed successfully!');
    } catch (error) {
      showToast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <ScrollView
      style={styles.scrollView}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={Colors.primary}
          colors={[Colors.primary]}
          progressBackgroundColor={Colors.surface}
        />
      }
    >
      {children}
    </ScrollView>
  );
};

// 👆 Swipeable Card Component
export const SwipeableCard: React.FC<{
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: {
    icon: string;
    color: string;
    label: string;
  };
  rightAction?: {
    icon: string;
    color: string;
    label: string;
  };
}> = ({ children, onSwipeLeft, onSwipeRight, leftAction, rightAction }) => {
  const [translateX, setTranslateX] = useState(0);

  const onGestureEvent = (event: any) => {
    setTranslateX(event.nativeEvent.translationX);
  };

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX } = event.nativeEvent;
      
      if (translationX > 100 && onSwipeRight) {
        onSwipeRight();
        showToast.info(rightAction?.label || 'Right swipe action');
      } else if (translationX < -100 && onSwipeLeft) {
        onSwipeLeft();
        showToast.info(leftAction?.label || 'Left swipe action');
      }
      
      setTranslateX(0);
    }
  };

  return (
    <View style={styles.swipeContainer}>
      {/* Left Action */}
      {leftAction && translateX < -50 && (
        <Animatable.View animation="fadeIn" style={[styles.swipeAction, styles.leftAction]}>
          <Ionicons name={leftAction.icon as any} size={24} color="white" />
          <Text style={styles.swipeActionText}>{leftAction.label}</Text>
        </Animatable.View>
      )}
      
      {/* Right Action */}
      {rightAction && translateX > 50 && (
        <Animatable.View animation="fadeIn" style={[styles.swipeAction, styles.rightAction]}>
          <Ionicons name={rightAction.icon as any} size={24} color="white" />
          <Text style={styles.swipeActionText}>{rightAction.label}</Text>
        </Animatable.View>
      )}

      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <Animatable.View 
          style={[
            styles.swipeableCard,
            { transform: [{ translateX: translateX * 0.3 }] }
          ]}
        >
          {children}
        </Animatable.View>
      </PanGestureHandler>
    </View>
  );
};

// 🎚️ Animated Slider Component
export const AnimatedSlider: React.FC<{
  value: number;
  onValueChange: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  label?: string;
}> = ({ 
  value, 
  onValueChange, 
  minimumValue = 0, 
  maximumValue = 100, 
  step = 1,
  label 
}) => {
  const handlePanGesture = (event: any) => {
    const { translationX } = event.nativeEvent;
    const newValue = Math.min(
      maximumValue,
      Math.max(minimumValue, value + (translationX / 3))
    );
    onValueChange(Math.round(newValue / step) * step);
  };

  const percentage = ((value - minimumValue) / (maximumValue - minimumValue)) * 100;

  return (
    <View style={styles.sliderContainer}>
      {label && <Text style={styles.sliderLabel}>{label}</Text>}
      <View style={styles.sliderTrack}>
        <View style={[styles.sliderFill, { width: `${percentage}%` }]} />
        <PanGestureHandler onGestureEvent={handlePanGesture}>
          <Animatable.View 
            style={[styles.sliderThumb, { left: `${percentage}%` }]}
            animation="pulse"
            iterationCount="infinite"
            duration={2000}
          />
        </PanGestureHandler>
      </View>
      <Text style={styles.sliderValue}>{value}</Text>
    </View>
  );
};

// 🃏 Flip Card Component
export const FlipCard: React.FC<{
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  isFlipped?: boolean;
  onFlip?: () => void;
}> = ({ frontContent, backContent, isFlipped = false, onFlip }) => {
  return (
    <View style={styles.flipCardContainer}>
      {!isFlipped ? (
        <Animatable.View 
          animation="flipInY" 
          style={styles.flipCard}
          onTouchEnd={onFlip}
        >
          {frontContent}
        </Animatable.View>
      ) : (
        <Animatable.View 
          animation="flipInY" 
          style={styles.flipCard}
          onTouchEnd={onFlip}
        >
          {backContent}
        </Animatable.View>
      )}
    </View>
  );
};

// 📊 Interactive Progress Ring
export const InteractiveProgressRing: React.FC<{
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  onPress?: () => void;
}> = ({ 
  progress, 
  size = 100, 
  strokeWidth = 8, 
  color = Colors.primary,
  onPress 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <Animatable.View 
      animation="bounceIn" 
      style={styles.progressRingContainer}
      onTouchEnd={onPress}
    >
      <View style={styles.progressRing}>
        {/* Background Circle */}
        <View 
          style={[
            styles.progressCircle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: `${color}20`,
            }
          ]} 
        />
        
        {/* Progress Circle */}
        <View 
          style={[
            styles.progressCircle,
            styles.progressCircleActive,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: color,
              transform: [{ rotate: '-90deg' }],
            }
          ]} 
        />
        
        {/* Center Content */}
        <View style={styles.progressCenter}>
          <Text style={[styles.progressText, { color }]}>{Math.round(progress)}%</Text>
        </View>
      </View>
    </Animatable.View>
  );
};

// 🎨 Color Picker Component
export const ColorPicker: React.FC<{
  colors: string[];
  selectedColor: string;
  onColorSelect: (color: string) => void;
}> = ({ colors, selectedColor, onColorSelect }) => {
  return (
    <View style={styles.colorPicker}>
      {colors.map((color, index) => (
        <Animatable.View
          key={color}
          animation="bounceIn"
          delay={index * 100}
        >
          <View
            style={[
              styles.colorOption,
              { backgroundColor: color },
              selectedColor === color && styles.selectedColor
            ]}
            onTouchEnd={() => onColorSelect(color)}
          />
        </Animatable.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  // Scroll View Styles
  scrollView: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Swipeable Card Styles
  swipeContainer: {
    position: 'relative',
    marginVertical: 8,
  },
  swipeableCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  swipeAction: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  leftAction: {
    left: 0,
    backgroundColor: Colors.error,
  },
  rightAction: {
    right: 0,
    backgroundColor: Colors.success,
  },
  swipeActionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },

  // Slider Styles
  sliderContainer: {
    marginVertical: 16,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: Colors.textLight,
    borderRadius: 3,
    position: 'relative',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  sliderThumb: {
    width: 20,
    height: 20,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    position: 'absolute',
    top: -7,
    marginLeft: -10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  sliderValue: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 8,
  },

  // Flip Card Styles
  flipCardContainer: {
    perspective: 1000,
  },
  flipCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Progress Ring Styles
  progressRingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRing: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircle: {
    position: 'absolute',
    borderStyle: 'solid',
  },
  progressCircleActive: {
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  progressCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Color Picker Styles
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: Colors.text,
    borderWidth: 3,
  },
});
