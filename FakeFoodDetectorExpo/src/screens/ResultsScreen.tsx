import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Review } from '../types';
import { getCredibilityColor, getCredibilityDescription, formatDate } from '../utils/helpers';

type ResultsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Results'>;
type ResultsScreenRouteProp = RouteProp<RootStackParamList, 'Results'>;

const { width } = Dimensions.get('window');

// Theme colors
const THEME = {
  primary: '#FF6B35',
  secondary: '#4CAF50',
  danger: '#F44336',
  warning: '#FF9800',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#1a1a1a',
  textSecondary: '#666666',
  border: '#E0E0E0',
};

const RestaurantInfo: React.FC<{ analysisResult: any }> = ({ analysisResult }) => {
  return (
    <View style={styles.restaurantCard}>
      <Text style={styles.restaurantTitle}>
        🍽️ {analysisResult.restaurantName || 'Restaurant Analysis'}
      </Text>
      {analysisResult.restaurantAddress && (
        <Text style={styles.restaurantAddress}>
          📍 {analysisResult.restaurantAddress}
        </Text>
      )}
      <View style={styles.restaurantMeta}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Original Rating</Text>
          <Text style={styles.metaValue}>
            {analysisResult.originalRating ? `${analysisResult.originalRating}/5 ⭐` : 'N/A'}
          </Text>
        </View>
        <View style={styles.metaDivider} />
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Reviews Analyzed</Text>
          <Text style={styles.metaValue}>{analysisResult.totalReviewsAnalyzed}</Text>
        </View>
      </View>
    </View>
  );
};

const SmoothCircularScore: React.FC<{ score: number }> = ({ score }) => {
  const size = 160;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = score / 100;
  
  const color = getCredibilityColor(score);
  
  // Create smooth gradient marks
  const marks = Array.from({ length: 100 }, (_, i) => {
    const angle = (i * 3.6) - 90; // 3.6 degrees per mark (360/100)
    const markRadius = radius + 8;
    const x = size / 2 + markRadius * Math.cos(angle * Math.PI / 180);
    const y = size / 2 + markRadius * Math.sin(angle * Math.PI / 180);
    
    const isActive = i <= score;
    const opacity = isActive ? Math.max(0.3, 1 - (i - score + 20) / 40) : 0.1;
    
    return { x, y, isActive, opacity, angle };
  });

  return (
    <View style={styles.smoothCircularContainer}>
      <View style={[styles.smoothCircular, { width: size, height: size }]}>
        {/* Background circle */}
        <View style={[styles.backgroundCircle, { 
          width: size - strokeWidth, 
          height: size - strokeWidth,
          borderColor: THEME.border,
          borderWidth: 2,
        }]} />
        
        {/* Progress indicators */}
        {marks.map((mark, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              {
                position: 'absolute',
                left: mark.x - 2,
                top: mark.y - 2,
                backgroundColor: mark.isActive ? color : THEME.border,
                opacity: mark.opacity,
                transform: [{ scale: mark.isActive && mark.opacity > 0.7 ? 1.2 : 0.8 }],
              },
            ]}
          />
        ))}
        
        {/* Center content */}
        <View style={[styles.centerContent, { backgroundColor: color + '15' }]}>
          <Text style={[styles.scoreNumber, { color }]}>{score}</Text>
          <Text style={[styles.scoreLabel, { color }]}>TRUTH SCORE</Text>
          <View style={[styles.scoreBadge, { backgroundColor: color }]}>
            <Text style={styles.scoreBadgeText}>
              {score >= 80 ? 'EXCELLENT' : score >= 60 ? 'GOOD' : score >= 40 ? 'FAIR' : 'POOR'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const EnhancedAnalytics: React.FC<{ analysisResult: any }> = ({ analysisResult }) => {
  const totalReviews = analysisResult.totalReviewsAnalyzed;
  const fakeReviews = analysisResult.fakeReviewsDetected;
  const realReviews = totalReviews - fakeReviews;
  
  // Calculate real rating without fake reviews
  const authentRecords = analysisResult.reviews.filter((review: Review) => !review.isDetectedAsFake);
  const realRating = authentRecords.length > 0 
    ? (authentRecords.reduce((sum: number, review: Review) => sum + review.rating, 0) / authentRecords.length).toFixed(1)
    : analysisResult.originalRating || 'N/A';

  const authenticPercentage = Math.round((realReviews / totalReviews) * 100);
  const fakePercentage = Math.round((fakeReviews / totalReviews) * 100);

  return (
    <View style={styles.analyticsCard}>
      <Text style={styles.analyticsTitle}>📊 Detailed Analytics</Text>
      
      {/* Main Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={[styles.statBox, { backgroundColor: THEME.primary + '15' }]}>
          <Text style={[styles.statNumber, { color: THEME.primary }]}>{totalReviews}</Text>
          <Text style={styles.statLabel}>Total Reviews</Text>
        </View>
        
        <View style={[styles.statBox, { backgroundColor: THEME.danger + '15' }]}>
          <Text style={[styles.statNumber, { color: THEME.danger }]}>{fakeReviews}</Text>
          <Text style={styles.statLabel}>Fake Reviews</Text>
        </View>
        
        <View style={[styles.statBox, { backgroundColor: THEME.secondary + '15' }]}>
          <Text style={[styles.statNumber, { color: THEME.secondary }]}>{realReviews}</Text>
          <Text style={styles.statLabel}>Real Reviews</Text>
        </View>
        
        <View style={[styles.statBox, { backgroundColor: THEME.warning + '15' }]}>
          <Text style={[styles.statNumber, { color: THEME.warning }]}>{realRating}⭐</Text>
          <Text style={styles.statLabel}>True Rating</Text>
        </View>
      </View>

      {/* Percentage Breakdown */}
      <View style={styles.percentageSection}>
        <Text style={styles.percentageTitle}>Review Composition</Text>
        <View style={styles.percentageBars}>
          <View style={styles.percentageRow}>
            <View style={styles.percentageInfo}>
              <View style={[styles.percentageIndicator, { backgroundColor: THEME.secondary }]} />
              <Text style={styles.percentageLabel}>Authentic ({authenticPercentage}%)</Text>
            </View>
            <View style={styles.percentageBar}>
              <View style={[styles.percentageBarFill, { 
                width: `${authenticPercentage}%`, 
                backgroundColor: THEME.secondary 
              }]} />
            </View>
          </View>
          
          <View style={styles.percentageRow}>
            <View style={styles.percentageInfo}>
              <View style={[styles.percentageIndicator, { backgroundColor: THEME.danger }]} />
              <Text style={styles.percentageLabel}>Suspicious ({fakePercentage}%)</Text>
            </View>
            <View style={styles.percentageBar}>
              <View style={[styles.percentageBarFill, { 
                width: `${fakePercentage}%`, 
                backgroundColor: THEME.danger 
              }]} />
            </View>
          </View>
        </View>
      </View>

      {/* Key Insights */}
      <View style={styles.insightsContainer}>
        <Text style={styles.insightsTitle}>🔍 Key Insights</Text>
        <View style={styles.insightItem}>
          <Text style={styles.insightBullet}>•</Text>
          <Text style={styles.insightText}>
            {fakePercentage > 30 ? 'High' : fakePercentage > 15 ? 'Moderate' : 'Low'} level of suspicious activity detected
          </Text>
        </View>
        <View style={styles.insightItem}>
          <Text style={styles.insightBullet}>•</Text>
          <Text style={styles.insightText}>
            Without fake reviews, rating would be {realRating} stars
          </Text>
        </View>
        <View style={styles.insightItem}>
          <Text style={styles.insightBullet}>•</Text>
          <Text style={styles.insightText}>
            AI analyzed {totalReviews} reviews using advanced pattern detection
          </Text>
        </View>
      </View>
    </View>
  );
};

const ResultsScreen: React.FC = () => {
  const navigation = useNavigation<ResultsScreenNavigationProp>();
  const route = useRoute<ResultsScreenRouteProp>();
  const { analysisResult } = route.params;
  const [showAllReviews, setShowAllReviews] = useState(false);
  
  const displayedReviews = showAllReviews ? analysisResult.reviews : analysisResult.reviews.slice(0, 5);

  const handleGoHome = () => {
    // Reset to Home screen to clear the navigation stack
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  const handleViewHistory = () => {
    // Reset to History screen to clear the navigation stack
    navigation.reset({
      index: 0,
      routes: [{ name: 'History' }],
    });
  };

  const renderReview = (review: Review, index: number) => (
    <View
      key={review.id}
      style={[
        styles.reviewCard,
        review.isDetectedAsFake && styles.fakeReviewCard,
      ]}
    >
      <View style={styles.reviewHeader}>
        <View style={styles.reviewInfo}>
          <Text style={styles.reviewAuthor}>{review.author}</Text>
          <Text style={styles.reviewDate}>{formatDate(review.date)}</Text>
        </View>
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>{'⭐'.repeat(review.rating)}</Text>
          {review.isDetectedAsFake && (
            <View style={styles.fakeLabel}>
              <Text style={styles.fakeLabelText}>🚨 SUSPICIOUS</Text>
            </View>
          )}
        </View>
      </View>
      
      <Text style={styles.reviewText}>{review.text}</Text>
      
      {review.isDetectedAsFake && (
        <View style={styles.aiDetectionContainer}>
          <Text style={styles.aiDetectionTitle}>🤖 AI Detection Results:</Text>
          <Text style={styles.aiDetectionReason}>
            {(review as any).detectionReason || "Flagged for suspicious patterns in language structure and content"}
          </Text>
        </View>
      )}
      
      {review.fakeScore !== undefined && (
        <View style={styles.scoreContainer}>
          <View style={styles.confidenceBar}>
            <View style={[
              styles.confidenceBarFill, 
              { 
                width: `${Math.round(review.fakeScore * 100)}%`,
                backgroundColor: review.fakeScore > 0.6 ? '#F44336' : review.fakeScore > 0.3 ? '#FF9800' : '#4CAF50'
              }
            ]} />
          </View>
          <Text style={styles.confidenceLabel}>
            AI Confidence: {Math.round(review.fakeScore * 100)}%
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔍 TRUTH BITE Analysis</Text>
        <Text style={styles.subtitle}>AI-Powered Review Authenticity Report</Text>
      </View>

      {/* 1. Restaurant Information First */}
      <RestaurantInfo analysisResult={analysisResult} />

      {/* 2. Truth Score Section */}
      <View style={styles.scoreSection}>
        <SmoothCircularScore score={analysisResult.credibilityScore} />
        <View style={styles.scoreDescription}>
          <Text
            style={[
              styles.scoreDescriptionText,
              { color: getCredibilityColor(analysisResult.credibilityScore) },
            ]}
          >
            {getCredibilityDescription(analysisResult.credibilityScore)}
          </Text>
          <Text style={styles.scoreSubtext}>
            Analysis completed with high confidence
          </Text>
        </View>
      </View>

      {/* 3. Enhanced Analytics */}
      <EnhancedAnalytics analysisResult={analysisResult} />

      {/* Suspicious Patterns */}
      {analysisResult.suspiciousPatterns.length > 0 && (
        <View style={styles.patternsCard}>
          <Text style={styles.patternsTitle}>🚨 Suspicious Patterns Detected</Text>
          {analysisResult.suspiciousPatterns.map((pattern, index) => (
            <View key={index} style={styles.patternItem}>
              <Text style={styles.patternText}>• {pattern}</Text>
            </View>
          ))}
        </View>
      )}

      {/* 4. Reviews Analysis (Limited Display) */}
      <View style={styles.reviewsSection}>
        <View style={styles.reviewsSectionHeader}>
          <Text style={styles.reviewsTitle}>🤖 AI Review Analysis</Text>
          <View style={styles.reviewsCounter}>
            <Text style={styles.reviewsCounterText}>
              {displayedReviews.length}/{analysisResult.reviews.length}
            </Text>
          </View>
        </View>
        <Text style={styles.reviewsSubtitle}>
          Detailed AI analysis of individual reviews
        </Text>
        
        {displayedReviews.map((review, index) =>
          renderReview(review, index)
        )}
        
        {/* View More Button */}
        {analysisResult.reviews.length > 5 && (
          <TouchableOpacity 
            style={[styles.viewMoreButton, { 
              backgroundColor: showAllReviews ? THEME.border : THEME.primary 
            }]}
            onPress={() => setShowAllReviews(!showAllReviews)}
          >
            <Text style={[styles.viewMoreText, { 
              color: showAllReviews ? THEME.textSecondary : THEME.surface 
            }]}>
              {showAllReviews 
                ? '👆 Show Less Reviews' 
                : `👇 View ${analysisResult.reviews.length - 5} More Reviews`
              }
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Action Buttons with Theme Colors */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.primaryButton, { backgroundColor: THEME.primary }]} 
          onPress={handleGoHome}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonIcon}>🔍</Text>
            <Text style={styles.primaryButtonText}>Analyze Another Restaurant</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.secondaryButton, { 
            backgroundColor: THEME.surface, 
            borderColor: THEME.primary 
          }]} 
          onPress={handleViewHistory}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonIcon}>📊</Text>
            <Text style={[styles.secondaryButtonText, { color: THEME.primary }]}>View Analysis History</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Analysis completed on {formatDate(analysisResult.analysisDate)}
        </Text>
        <Text style={styles.footerText}>
          Powered by TRUTH BITE AI • Protecting Diners Since 2024
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  header: {
    alignItems: 'center',
    padding: 25,
    backgroundColor: THEME.surface,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: THEME.text,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: THEME.textSecondary,
    marginTop: 5,
    fontWeight: '500',
  },

  // Restaurant Info Card
  restaurantCard: {
    backgroundColor: THEME.surface,
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 20,
    padding: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  restaurantTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.text,
    marginBottom: 8,
  },
  restaurantAddress: {
    fontSize: 14,
    color: THEME.textSecondary,
    marginBottom: 15,
    lineHeight: 20,
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.text,
  },
  metaDivider: {
    width: 1,
    height: 30,
    backgroundColor: THEME.border,
    marginHorizontal: 15,
  },

  // Smooth Circular Score
  scoreSection: {
    backgroundColor: THEME.surface,
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  smoothCircularContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  smoothCircular: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backgroundCircle: {
    position: 'absolute',
    borderRadius: 1000,
    borderStyle: 'dashed',
  },
  progressDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  centerContent: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: THEME.border,
  },
  scoreNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreBadgeText: {
    fontSize: 10,
    color: THEME.surface,
    fontWeight: 'bold',
  },
  scoreDescription: {
    alignItems: 'center',
  },
  scoreDescriptionText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  scoreSubtext: {
    fontSize: 14,
    color: THEME.textSecondary,
    textAlign: 'center',
  },

  // Enhanced Analytics
  analyticsCard: {
    backgroundColor: THEME.surface,
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 20,
    padding: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  analyticsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.text,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 12,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: THEME.textSecondary,
    textAlign: 'center',
  },
  percentageSection: {
    marginBottom: 20,
  },
  percentageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.text,
    marginBottom: 12,
  },
  percentageBars: {
    gap: 10,
  },
  percentageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  percentageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 150,
  },
  percentageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  percentageLabel: {
    fontSize: 14,
    color: THEME.textSecondary,
  },
  percentageBar: {
    flex: 1,
    height: 6,
    backgroundColor: THEME.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginLeft: 10,
  },
  percentageBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  insightsContainer: {
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.text,
    marginBottom: 12,
  },
  insightItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  insightBullet: {
    fontSize: 14,
    color: THEME.primary,
    marginRight: 8,
    fontWeight: 'bold',
  },
  insightText: {
    fontSize: 14,
    color: THEME.textSecondary,
    flex: 1,
    lineHeight: 20,
  },

  // Patterns Card
  patternsCard: {
    backgroundColor: THEME.surface,
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 5,
    borderLeftColor: THEME.primary,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  patternsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.text,
    marginBottom: 10,
  },
  patternItem: {
    marginBottom: 8,
  },
  patternText: {
    fontSize: 14,
    color: THEME.textSecondary,
    lineHeight: 20,
  },

  // Reviews Section
  reviewsSection: {
    marginHorizontal: 15,
    marginBottom: 20,
  },
  reviewsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.text,
  },
  reviewsCounter: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  reviewsCounterText: {
    color: THEME.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
  reviewsSubtitle: {
    fontSize: 14,
    color: THEME.textSecondary,
    marginBottom: 15,
  },
  reviewCard: {
    backgroundColor: THEME.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  fakeReviewCard: {
    borderLeftWidth: 5,
    borderLeftColor: THEME.danger,
    backgroundColor: THEME.danger + '08',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewInfo: {
    flex: 1,
  },
  reviewAuthor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.text,
  },
  reviewDate: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginTop: 2,
  },
  ratingContainer: {
    alignItems: 'flex-end',
  },
  rating: {
    fontSize: 16,
    marginBottom: 8,
  },
  fakeLabel: {
    backgroundColor: THEME.danger,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  fakeLabelText: {
    fontSize: 10,
    color: THEME.surface,
    fontWeight: 'bold',
  },
  reviewText: {
    fontSize: 14,
    color: THEME.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  aiDetectionContainer: {
    backgroundColor: THEME.warning + '15',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: THEME.warning,
  },
  aiDetectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: THEME.warning,
    marginBottom: 4,
  },
  aiDetectionReason: {
    fontSize: 12,
    color: THEME.textSecondary,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  scoreContainer: {
    marginTop: 8,
  },
  confidenceBar: {
    height: 4,
    backgroundColor: THEME.border,
    borderRadius: 2,
    marginBottom: 4,
    overflow: 'hidden',
  },
  confidenceBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  confidenceLabel: {
    fontSize: 11,
    color: THEME.textSecondary,
    fontWeight: '500',
    textAlign: 'right',
  },

  // View More Button
  viewMoreButton: {
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 15,
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Action Buttons
  actionsContainer: {
    marginHorizontal: 15,
    marginBottom: 25,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  primaryButton: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  primaryButtonText: {
    color: THEME.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    padding: 25,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: THEME.textSecondary,
    textAlign: 'center',
    marginBottom: 3,
    lineHeight: 18,
  },
});

export default ResultsScreen;

