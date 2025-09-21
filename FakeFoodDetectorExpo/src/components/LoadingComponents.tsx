import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import * as Animatable from 'react-native-animatable';
// Removed react-native-skeleton-placeholder to avoid BVLinearGradient errors

const { width } = Dimensions.get('window');

// 🎭 Enhanced Progress Indicator
export const EnhancedProgressBar: React.FC<{ progress: number; label?: string }> = ({ progress, label }) => {
  return (
    <Animatable.View animation="fadeInUp" style={styles.progressContainer}>
      {label && <Text style={styles.progressLabel}>{label}</Text>}
      <View style={styles.progressTrack}>
        <Animatable.View 
          animation="pulse" 
          iterationCount="infinite"
          style={[styles.progressFill, { width: `${progress}%` }]} 
        />
      </View>
      <Text style={styles.progressText}>{Math.round(progress)}%</Text>
    </Animatable.View>
  );
};

// 🦴 Skeleton Screen for Restaurant Cards
export const RestaurantCardSkeleton: React.FC = () => {
  return (
    <View style={styles.skeletonCard}>
      <View style={[styles.skeletonImage, styles.skeletonBg]} />
      <View style={styles.skeletonContent}>
        <View style={[styles.skeletonTitle, styles.skeletonBg]} />
        <View style={[styles.skeletonSubtitle, styles.skeletonBg]} />
        <View style={[styles.skeletonRating, styles.skeletonBg]} />
      </View>
    </View>
  );
};

// 🦴 Skeleton Screen for Analysis Results
export const AnalysisResultSkeleton: React.FC = () => {
  return (
    <View style={styles.skeletonContainer}>
      {/* Score Circle Skeleton */}
      <View style={[styles.skeletonCircle, styles.skeletonBg]} />
      
      {/* Text Lines Skeleton */}
      <View style={styles.skeletonTextContainer}>
        <View style={[styles.skeletonLongText, styles.skeletonBg]} />
        <View style={[styles.skeletonMediumText, styles.skeletonBg]} />
        <View style={[styles.skeletonShortText, styles.skeletonBg]} />
      </View>
      
      {/* Cards Skeleton */}
      <View style={styles.skeletonCardsContainer}>
        <View style={[styles.skeletonSmallCard, styles.skeletonBg]} />
        <View style={[styles.skeletonSmallCard, styles.skeletonBg]} />
      </View>
    </View>
  );
};

// ✨ Animated Loading Dots
export const LoadingDots: React.FC<{ size?: number; color?: string }> = ({ 
  size = 8, 
  color = '#FF6B35' 
}) => {
  return (
    <View style={styles.dotsContainer}>
      {[0, 1, 2].map((index) => (
        <Animatable.View
          key={index}
          animation="pulse"
          iterationCount="infinite"
          duration={800}
          delay={index * 200}
          style={[
            styles.dot,
            { 
              width: size, 
              height: size, 
              backgroundColor: color,
              borderRadius: size / 2 
            }
          ]}
        />
      ))}
    </View>
  );
};

// 🌀 Spinning Loader
export const SpinningLoader: React.FC<{ size?: number; color?: string }> = ({ 
  size = 40, 
  color = '#FF6B35' 
}) => {
  return (
    <Animatable.View
      animation="rotate"
      iterationCount="infinite"
      duration={1000}
      style={[
        styles.spinner,
        { 
          width: size, 
          height: size, 
          borderColor: `${color}20`,
          borderTopColor: color,
          borderRadius: size / 2
        }
      ]}
    />
  );
};

const styles = StyleSheet.create({
  // Progress Bar Styles
  progressContainer: {
    width: '100%',
    marginVertical: 20,
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  progressTrack: {
    width: '100%',
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginTop: 8,
  },
  
  // Skeleton Styles
  skeletonCard: {
    flexDirection: 'row',
    margin: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  skeletonBg: {
    backgroundColor: '#EAEAEA',
  },
  skeletonImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  skeletonContent: {
    flex: 1,
    marginLeft: 12,
  },
  skeletonTitle: {
    width: '80%',
    height: 16,
    marginBottom: 8,
  },
  skeletonSubtitle: {
    width: '60%',
    height: 14,
    marginBottom: 8,
  },
  skeletonRating: {
    width: '40%',
    height: 12,
  },
  
  skeletonContainer: {
    padding: 20,
    alignItems: 'center',
  },
  skeletonCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  skeletonTextContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  skeletonLongText: {
    width: '80%',
    height: 16,
    marginBottom: 8,
  },
  skeletonMediumText: {
    width: '60%',
    height: 14,
    marginBottom: 8,
  },
  skeletonShortText: {
    width: '40%',
    height: 12,
  },
  skeletonCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  skeletonSmallCard: {
    width: '45%',
    height: 100,
    borderRadius: 8,
  },
  
  // Loading Dots Styles
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  dot: {
    marginHorizontal: 4,
  },
  
  // Spinner Styles
  spinner: {
    borderWidth: 3,
    alignSelf: 'center',
    marginVertical: 20,
  },
});
