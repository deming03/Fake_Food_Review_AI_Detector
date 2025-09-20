import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Review } from '../types';
import { getCredibilityColor, getCredibilityDescription, formatDate } from '../utils/helpers';

type ResultsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Results'>;
type ResultsScreenRouteProp = RouteProp<RootStackParamList, 'Results'>;

const ResultsScreen: React.FC = () => {
  const navigation = useNavigation<ResultsScreenNavigationProp>();
  const route = useRoute<ResultsScreenRouteProp>();
  const { analysisResult } = route.params;

  const handleGoHome = () => {
    navigation.navigate('Home');
  };

  const handleViewHistory = () => {
    navigation.navigate('History');
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
              <Text style={styles.fakeLabelText}>SUSPICIOUS</Text>
            </View>
          )}
        </View>
      </View>
      <Text style={styles.reviewText}>{review.text}</Text>
      {review.fakeScore !== undefined && (
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>
            Fake Score: {Math.round(review.fakeScore * 100)}%
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎯 Analysis Results</Text>
        <Text style={styles.subtitle}>AI Review Authenticity Report</Text>
      </View>

      {/* Credibility Score Card */}
      <View style={styles.scoreCard}>
        <View style={styles.scoreHeader}>
          <Text style={styles.scoreTitle}>Credibility Score</Text>
          <Text
            style={[
              styles.score,
              { color: getCredibilityColor(analysisResult.credibilityScore) },
            ]}
          >
            {analysisResult.credibilityScore}/100
          </Text>
        </View>
        <Text
          style={[
            styles.scoreDescription,
            { color: getCredibilityColor(analysisResult.credibilityScore) },
          ]}
        >
          {getCredibilityDescription(analysisResult.credibilityScore)}
        </Text>
        <View style={styles.scoreBarContainer}>
          <View style={styles.scoreBar}>
            <View
              style={[
                styles.scoreBarFill,
                {
                  width: `${analysisResult.credibilityScore}%`,
                  backgroundColor: getCredibilityColor(analysisResult.credibilityScore),
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Summary Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{analysisResult.totalReviewsAnalyzed}</Text>
          <Text style={styles.statLabel}>Reviews Analyzed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#F44336' }]}>
            {analysisResult.fakeReviewsDetected}
          </Text>
          <Text style={styles.statLabel}>Suspicious Reviews</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#4CAF50' }]}>
            {analysisResult.totalReviewsAnalyzed - analysisResult.fakeReviewsDetected}
          </Text>
          <Text style={styles.statLabel}>Authentic Reviews</Text>
        </View>
      </View>

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

      {/* Reviews Section */}
      <View style={styles.reviewsSection}>
        <Text style={styles.reviewsTitle}>📝 Review Details</Text>
        <Text style={styles.reviewsSubtitle}>
          Showing {Math.min(10, analysisResult.reviews.length)} of {analysisResult.reviews.length} reviews
        </Text>
        
        {analysisResult.reviews.slice(0, 10).map((review, index) =>
          renderReview(review, index)
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleGoHome}>
          <Text style={styles.primaryButtonText}>🏠 Analyze Another Restaurant</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleViewHistory}>
          <Text style={styles.secondaryButtonText}>📊 View History</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Analysis completed on {formatDate(analysisResult.analysisDate)}
        </Text>
        <Text style={styles.footerText}>
          Powered by AI • Fake Food Review Detector
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  scoreCard: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  score: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  scoreDescription: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  scoreBarContainer: {
    marginTop: 10,
  },
  scoreBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginBottom: 15,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  patternsCard: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  patternsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  patternItem: {
    marginBottom: 5,
  },
  patternText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  reviewsSection: {
    marginHorizontal: 15,
    marginBottom: 15,
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  reviewsSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  reviewCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  fakeReviewCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
    backgroundColor: '#FFF5F5',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  reviewInfo: {
    flex: 1,
  },
  reviewAuthor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  ratingContainer: {
    alignItems: 'flex-end',
  },
  rating: {
    fontSize: 16,
    marginBottom: 5,
  },
  fakeLabel: {
    backgroundColor: '#F44336',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fakeLabelText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  reviewText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 10,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  actionsContainer: {
    marginHorizontal: 15,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 2,
  },
});

export default ResultsScreen;
