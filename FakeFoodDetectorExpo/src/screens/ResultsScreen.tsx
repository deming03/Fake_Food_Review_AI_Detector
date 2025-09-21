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
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { RootStackParamList, Review } from '../types';
import { getCredibilityColor, getCredibilityDescription, formatDate } from '../utils/helpers';
import { Colors, ModernCard, AnimatedButton } from '../components/EnhancedUI';
import { SafeLinearGradient as LinearGradient } from '../components/SafeLinearGradient';
import { useTheme } from '../contexts/ThemeContext';

type ResultsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Results'>;
type ResultsScreenRouteProp = RouteProp<RootStackParamList, 'Results'>;

const { width } = Dimensions.get('window');

const RestaurantInfo: React.FC<{ analysisResult: any; colors: any }> = ({ analysisResult, colors }) => {
  return (
    <Animatable.View animation="fadeInUp" duration={600}>
      <ModernCard variant="highlighted">
        <LinearGradient
          colors={[colors.primary + '20', colors.secondary + '10']}
          style={styles.restaurantHeader}
        >
          <Ionicons name="restaurant" size={32} color={colors.primary} />
          <View style={styles.restaurantInfo}>
            <Text style={[styles.restaurantTitle, { color: colors.text }]}>
              {analysisResult.restaurantName || 'Restaurant Analysis'}
            </Text>
            {analysisResult.restaurantAddress && (
              <Text style={[styles.restaurantAddress, { color: colors.textSecondary }]}>
                📍 {analysisResult.restaurantAddress}
              </Text>
            )}
          </View>
        </LinearGradient>
        
        <View style={styles.restaurantMeta}>
          <View style={styles.metaItem}>
            <LinearGradient
              colors={[colors.warning + '20', colors.warning + '10']}
              style={styles.metaBadge}
            >
              <Ionicons name="star" size={16} color={colors.warning} />
              <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Original Rating</Text>
            </LinearGradient>
            <Text style={[styles.metaValue, { color: colors.text }]}>
              {analysisResult.originalRating ? `${analysisResult.originalRating}/5 ⭐` : 'N/A'}
            </Text>
          </View>
          
          <View style={styles.metaItem}>
            <LinearGradient
              colors={[colors.primary + '20', colors.primary + '10']}
              style={styles.metaBadge}
            >
              <Ionicons name="documents" size={16} color={colors.primary} />
              <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Reviews Analyzed</Text>
            </LinearGradient>
            <Text style={[styles.metaValue, { color: colors.text }]}>
              {analysisResult.totalReviewsAnalyzed}
            </Text>
          </View>
        </View>
      </ModernCard>
    </Animatable.View>
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
          borderColor: Colors.cardBorder,
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
                backgroundColor: mark.isActive ? color : Colors.cardBorder,
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

const EnhancedAnalytics: React.FC<{ analysisResult: any; colors: any }> = ({ analysisResult, colors }) => {
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
    <Animatable.View animation="fadeInUp" duration={600}>
      <ModernCard variant="highlighted">
        <Text style={[styles.analyticsTitle, { color: colors.text }]}>📊 Detailed Analytics</Text>
      
      {/* Main Stats Grid */}
      <View style={styles.statsGrid}>
        <LinearGradient
          colors={[colors.primary + '20', colors.primary + '10']}
          style={styles.statBox}
        >
          <Ionicons name="document-text" size={20} color={colors.primary} />
          <Text style={[styles.statNumber, { color: colors.primary }]}>{totalReviews}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Reviews</Text>
        </LinearGradient>
        
        <LinearGradient
          colors={[colors.error + '20', colors.error + '10']}
          style={styles.statBox}
        >
          <Ionicons name="warning" size={20} color={colors.error} />
          <Text style={[styles.statNumber, { color: colors.error }]}>{fakeReviews}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Fake Reviews</Text>
        </LinearGradient>
        
        <LinearGradient
          colors={[colors.success + '20', colors.success + '10']}
          style={styles.statBox}
        >
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text style={[styles.statNumber, { color: colors.success }]}>{realReviews}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Real Reviews</Text>
        </LinearGradient>
        
        <LinearGradient
          colors={[colors.warning + '20', colors.warning + '10']}
          style={styles.statBox}
        >
          <Ionicons name="star" size={20} color={colors.warning} />
          <Text style={[styles.statNumber, { color: colors.warning }]}>{realRating}⭐</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>True Rating</Text>
        </LinearGradient>
      </View>

      {/* Percentage Breakdown */}
      <View style={styles.percentageSection}>
        <Text style={[styles.percentageTitle, { color: colors.text }]}>Review Composition</Text>
        <View style={styles.percentageBars}>
          <View style={styles.percentageRow}>
            <View style={styles.percentageInfo}>
              <View style={[styles.percentageIndicator, { backgroundColor: colors.success }]} />
              <Text style={[styles.percentageLabel, { color: colors.textSecondary }]}>Authentic ({authenticPercentage}%)</Text>
            </View>
            <View style={[styles.percentageBar, { backgroundColor: colors.cardBorder }]}>
              <View style={[styles.percentageBarFill, { 
                width: `${authenticPercentage}%`, 
                backgroundColor: colors.success 
              }]} />
            </View>
          </View>
          
          <View style={styles.percentageRow}>
            <View style={styles.percentageInfo}>
              <View style={[styles.percentageIndicator, { backgroundColor: colors.error }]} />
              <Text style={[styles.percentageLabel, { color: colors.textSecondary }]}>Suspicious ({fakePercentage}%)</Text>
            </View>
            <View style={[styles.percentageBar, { backgroundColor: colors.cardBorder }]}>
              <View style={[styles.percentageBarFill, { 
                width: `${fakePercentage}%`, 
                backgroundColor: colors.error 
              }]} />
            </View>
          </View>
        </View>
      </View>

      {/* Key Insights */}
      <View style={[styles.insightsContainer, { borderTopColor: colors.cardBorder }]}>
        <Text style={[styles.insightsTitle, { color: colors.text }]}>🔍 Key Insights</Text>
        <View style={styles.insightItem}>
          <Text style={[styles.insightBullet, { color: colors.primary }]}>•</Text>
          <Text style={[styles.insightText, { color: colors.textSecondary }]}>
            {fakePercentage > 30 ? 'High' : fakePercentage > 15 ? 'Moderate' : 'Low'} level of suspicious activity detected
          </Text>
        </View>
        <View style={styles.insightItem}>
          <Text style={[styles.insightBullet, { color: colors.primary }]}>•</Text>
          <Text style={[styles.insightText, { color: colors.textSecondary }]}>
            Without fake reviews, rating would be {realRating} stars
          </Text>
        </View>
        <View style={styles.insightItem}>
          <Text style={[styles.insightBullet, { color: colors.primary }]}>•</Text>
          <Text style={[styles.insightText, { color: colors.textSecondary }]}>
            AI analyzed {totalReviews} reviews using advanced pattern detection
          </Text>
        </View>
      </View>
      </ModernCard>
    </Animatable.View>
  );
};

const ResultsScreen: React.FC = () => {
  const navigation = useNavigation<ResultsScreenNavigationProp>();
  const route = useRoute<ResultsScreenRouteProp>();
  const { analysisResult } = route.params;
  const [showAllReviews, setShowAllReviews] = useState(false);
  const { colors } = useTheme();
  
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
    <Animatable.View 
      key={review.id} 
      animation="fadeInUp" 
      delay={index * 100}
      duration={600}
      style={styles.reviewCard}
    >
      <ModernCard 
        variant={review.isDetectedAsFake ? 'warning' : 'default'}
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
      </ModernCard>
    </Animatable.View>
  );

  return (
    <LinearGradient
      colors={[colors.background, colors.surface]}
      style={styles.container}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <LinearGradient
          colors={[colors.surface, colors.surfaceLight]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <LinearGradient
              colors={[colors.primary + '30', colors.secondary + '20']}
              style={[styles.headerIcon, { borderColor: colors.primary + '40' }]}
            >
              <Ionicons name="shield-checkmark" size={32} color={colors.primary} />
            </LinearGradient>
            <View style={styles.headerText}>
              <Text style={[styles.title, { color: colors.text, textShadowColor: colors.glow }]}>🔍 TRUTH BITE Analysis</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>AI-Powered Review Authenticity Report</Text>
            </View>
          </View>
        </LinearGradient>

      {/* 1. Restaurant Information First */}
      <RestaurantInfo analysisResult={analysisResult} colors={colors} />

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
      <EnhancedAnalytics analysisResult={analysisResult} colors={colors} />

      {/* Suspicious Patterns */}
      {analysisResult.suspiciousPatterns.length > 0 && (
        <Animatable.View animation="fadeInUp" duration={600} style={styles.patternsCard}>
          <ModernCard variant="warning">
            <Text style={[styles.patternsTitle, { color: colors.text }]}>🚨 Suspicious Patterns Detected</Text>
            {analysisResult.suspiciousPatterns.map((pattern, index) => (
              <View key={index} style={styles.patternItem}>
                <LinearGradient
                  colors={[colors.warning + '15', colors.warning + '10']}
                  style={styles.patternBadge}
                >
                  <Ionicons name="alert-circle" size={16} color={colors.warning} />
                  <Text style={[styles.patternText, { color: colors.textSecondary }]}>{pattern}</Text>
                </LinearGradient>
              </View>
            ))}
          </ModernCard>
        </Animatable.View>
      )}

      {/* 4. Reviews Analysis (Limited Display) */}
      <View style={styles.reviewsSection}>
        <View style={styles.reviewsSectionHeader}>
          <Text style={[styles.reviewsTitle, { color: colors.text }]}>🤖 AI Review Analysis</Text>
          <View style={[styles.reviewsCounter, { backgroundColor: colors.primary }]}>
            <Text style={styles.reviewsCounterText}>
              {displayedReviews.length}/{analysisResult.reviews.length}
            </Text>
          </View>
        </View>
        <Text style={[styles.reviewsSubtitle, { color: colors.textSecondary }]}>
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
        <AnimatedButton
          title="🔍 Analyze Another Restaurant"
          onPress={handleGoHome}
          icon="home"
        />
        <AnimatedButton
          title="📊 View Analysis History"
          onPress={handleViewHistory}
          variant="outline"
          icon="analytics"
        />
      </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Analysis completed on {formatDate(analysisResult.analysisDate)}
          </Text>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Powered by TRUTH BITE AI • Protecting Diners Since 2024
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Extra space for bottom navigation
  },
  header: {
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 2,
    borderColor: Colors.primary + '40',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    letterSpacing: 0.5,
    textShadowColor: Colors.glow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },

  // Restaurant Info Card
  restaurantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 15,
    marginBottom: 15,
  },
  restaurantInfo: {
    flex: 1,
    marginLeft: 15,
  },
  restaurantTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 6,
  },
  restaurantAddress: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  restaurantMeta: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 8,
    gap: 6,
  },
  metaLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
  },

  // Smooth Circular Score
  scoreSection: {
    marginHorizontal: 15,
    marginBottom: 20,
    alignItems: 'center',
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
    borderColor: Colors.cardBorder,
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
    color: Colors.surface,
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
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // Enhanced Analytics  
  analyticsCard: {
    marginHorizontal: 15,
    marginBottom: 20,
  },
  analyticsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
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
    gap: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  percentageSection: {
    marginBottom: 20,
  },
  percentageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
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
    color: Colors.textSecondary,
  },
  percentageBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.cardBorder,
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
    borderTopColor: Colors.cardBorder,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  insightItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  insightBullet: {
    fontSize: 14,
    color: Colors.primary,
    marginRight: 8,
    fontWeight: 'bold',
  },
  insightText: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },

  // Patterns Card
  patternsCard: {
    marginHorizontal: 15,
    marginBottom: 20,
  },
  patternsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 10,
  },
  patternItem: {
    marginBottom: 8,
  },
  patternBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  patternText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    flex: 1,
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
    color: Colors.text,
  },
  reviewsCounter: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  reviewsCounterText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
  reviewsSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 15,
  },
  reviewCard: {
    marginBottom: 12,
  },
  fakeReviewCard: {
    borderLeftWidth: 5,
    borderLeftColor: Colors.error,
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
    color: Colors.text,
  },
  reviewDate: {
    fontSize: 12,
    color: Colors.textSecondary,
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
    backgroundColor: Colors.error,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  fakeLabelText: {
    fontSize: 10,
    color: Colors.surface,
    fontWeight: 'bold',
  },
  reviewText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  aiDetectionContainer: {
    backgroundColor: Colors.warning + '15',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
  },
  aiDetectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.warning,
    marginBottom: 4,
  },
  aiDetectionReason: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  scoreContainer: {
    marginTop: 8,
  },
  confidenceBar: {
    height: 4,
    backgroundColor: Colors.cardBorder,
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
    color: Colors.textSecondary,
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
  footer: {
    alignItems: 'center',
    padding: 25,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 3,
    lineHeight: 18,
  },
});

export default ResultsScreen;

