import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, Review } from '../types';
import { getCredibilityColor, getCredibilityLevel, formatDate } from '../utils/helpers';

type ResultsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Results'>;
type ResultsScreenRouteProp = RouteProp<RootStackParamList, 'Results'>;

const ResultsScreen: React.FC = () => {
  const navigation = useNavigation<ResultsScreenNavigationProp>();
  const route = useRoute<ResultsScreenRouteProp>();

  const { analysisResult } = route.params;

  const handleShare = async () => {
    try {
      const shareContent = `🕵️ Restaurant Review Analysis Results\n` +
        `Credibility Score: ${analysisResult.credibilityScore}/100\n` +
        `Reviews Analyzed: ${analysisResult.totalReviewsAnalyzed}\n` +
        `Suspected Fake Reviews: ${analysisResult.fakeReviewsDetected}\n` +
        `\n#FakeReviewDetector`;

      await Share.share({
        message: shareContent,
        title: 'Restaurant Review Analysis Results',
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleNewAnalysis = () => {
    navigation.navigate('Home');
  };

  const renderReviewItem = (review: Review, index: number) => (
    <View key={review.id} style={[
      styles.reviewItem,
      review.isDetectedAsFake && styles.fakeReviewItem
    ]}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewAuthor}>
          <Text style={styles.authorName}>{review.author}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</Text>
          </View>
        </View>
        <Text style={styles.reviewDate}>{formatDate(review.date)}</Text>
      </View>
      
      <Text style={styles.reviewText}>{review.text}</Text>
      
      {review.isDetectedAsFake && (
        <View style={styles.fakeIndicator}>
          <Text style={styles.fakeIndicatorText}>
            ⚠️ Suspected Fake Review (Confidence: {Math.round((review.fakeScore || 0) * 100)}%)
          </Text>
        </View>
      )}
    </View>
  );

  const credibilityColor = getCredibilityColor(analysisResult.credibilityScore);
  const credibilityLevel = getCredibilityLevel(analysisResult.credibilityScore);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📊 Analysis Results</Text>
        <Text style={styles.subtitle}>{formatDate(analysisResult.analysisDate)}</Text>
      </View>

      <View style={styles.scoreContainer}>
        <View style={[styles.scoreCircle, { borderColor: credibilityColor }]}>
          <Text style={[styles.scoreNumber, { color: credibilityColor }]}>
            {analysisResult.credibilityScore}
          </Text>
          <Text style={styles.scoreMax}>/100</Text>
        </View>
        <Text style={[styles.scoreLabel, { color: credibilityColor }]}>
          {credibilityLevel}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{analysisResult.totalReviewsAnalyzed}</Text>
          <Text style={styles.statLabel}>Total Reviews</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#FF3B30' }]}>
            {analysisResult.fakeReviewsDetected}
          </Text>
          <Text style={styles.statLabel}>Suspected Fake</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#34C759' }]}>
            {analysisResult.totalReviewsAnalyzed - analysisResult.fakeReviewsDetected}
          </Text>
          <Text style={styles.statLabel}>Authentic</Text>
        </View>
      </View>

      {analysisResult.suspiciousPatterns.length > 0 && (
        <View style={styles.patternsContainer}>
          <Text style={styles.patternsTitle}>🚨 Suspicious Patterns Detected:</Text>
          {analysisResult.suspiciousPatterns.map((pattern, index) => (
            <Text key={index} style={styles.patternItem}>• {pattern}</Text>
          ))}
        </View>
      )}

      <View style={styles.reviewsContainer}>
        <Text style={styles.reviewsTitle}>
          Review Details ({analysisResult.reviews.length > 0 ? `Showing ${Math.min(analysisResult.reviews.length, 10)}` : 'No data'})
        </Text>
        {analysisResult.reviews.slice(0, 10).map(renderReviewItem)}
        
        {analysisResult.reviews.length > 10 && (
          <Text style={styles.moreReviews}>
            {analysisResult.reviews.length - 10} more reviews...
          </Text>
        )}
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>📤 Share Results</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.newAnalysisButton} onPress={handleNewAnalysis}>
          <Text style={styles.newAnalysisButtonText}>🔍 New Analysis</Text>
        </TouchableOpacity>
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  scoreContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 20,
    padding: 30,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  scoreNumber: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  scoreMax: {
    fontSize: 16,
    color: '#666',
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  patternsContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  patternsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 10,
  },
  patternItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    lineHeight: 20,
  },
  reviewsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  reviewItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  fakeReviewItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewAuthor: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  ratingContainer: {
    marginTop: 2,
  },
  rating: {
    fontSize: 12,
    color: '#FFD700',
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  reviewText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  fakeIndicator: {
    backgroundColor: '#FFF3F2',
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: '#FFD3D0',
  },
  fakeIndicatorText: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '500',
  },
  moreReviews: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 10,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 12,
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  shareButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  newAnalysisButton: {
    flex: 1,
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  newAnalysisButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ResultsScreen;
