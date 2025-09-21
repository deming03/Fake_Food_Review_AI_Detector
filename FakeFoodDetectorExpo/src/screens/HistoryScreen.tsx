import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, AnalysisResult } from '../types';
import apiClient from '../services/api';
import { getCredibilityColor, getCredibilityDescription, formatDate } from '../utils/helpers';

type HistoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'History'>;

const HistoryScreen: React.FC = () => {
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigation = useNavigation<HistoryScreenNavigationProp>();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await apiClient.getAnalysisHistory();
      if (response.success && response.data) {
        setAnalysisHistory(response.data);
      } else {
        Alert.alert('Error', response.error || 'Failed to load history');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load analysis history');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadHistory();
  };

  const handleViewResult = (analysisResult: AnalysisResult) => {
    navigation.navigate('Results', { analysisResult });
  };

  const renderHistoryItem = ({ item }: { item: AnalysisResult }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => handleViewResult(item)}
    >
      <View style={styles.itemHeader}>
        <View style={styles.scoreContainer}>
          <Text
            style={[
              styles.score,
              { color: getCredibilityColor(item.credibilityScore) },
            ]}
          >
            {item.credibilityScore}
          </Text>
          <Text style={styles.scoreLabel}>Score</Text>
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.date}>{formatDate(item.analysisDate)}</Text>
          <Text
            style={[
              styles.credibilityLabel,
              { color: getCredibilityColor(item.credibilityScore) },
            ]}
          >
            {getCredibilityDescription(item.credibilityScore)}
          </Text>
        </View>
      </View>
      
      <View style={styles.itemStats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{item.totalReviewsAnalyzed}</Text>
          <Text style={styles.statLabel}>Reviews</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#F44336' }]}>
            {item.fakeReviewsDetected}
          </Text>
          <Text style={styles.statLabel}>Suspicious</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#4CAF50' }]}>
            {item.totalReviewsAnalyzed - item.fakeReviewsDetected}
          </Text>
          <Text style={styles.statLabel}>Authentic</Text>
        </View>
      </View>

      {item.suspiciousPatterns.length > 0 && (
        <View style={styles.patternsPreview}>
          <Text style={styles.patternsText}>
            🚨 {item.suspiciousPatterns.length} suspicious pattern(s) detected
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📊</Text>
      <Text style={styles.emptyTitle}>No Analysis History</Text>
      <Text style={styles.emptyText}>
        Start analyzing restaurant reviews to see your history here
      </Text>
      <TouchableOpacity
        style={styles.startButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.startButtonText}>Start Analysis</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📊 Analysis History</Text>
        <Text style={styles.subtitle}>
          {analysisHistory.length} analysis result(s)
        </Text>
      </View>

      <FlatList
        data={analysisHistory}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          analysisHistory.length === 0 && styles.emptyListContainer,
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#FF6B35']}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 15,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  historyItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  scoreContainer: {
    alignItems: 'center',
    marginRight: 20,
  },
  score: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  itemInfo: {
    flex: 1,
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  credibilityLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  patternsPreview: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFF3E0',
    borderRadius: 6,
  },
  patternsText: {
    fontSize: 12,
    color: '#F57C00',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  startButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HistoryScreen;
