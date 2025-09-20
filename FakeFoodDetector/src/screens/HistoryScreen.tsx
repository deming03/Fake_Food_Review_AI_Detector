import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, AnalysisResult } from '../types';
import { restaurantApi } from '../services/api';
import { getCredibilityColor, getCredibilityLevel, formatDate } from '../utils/helpers';

type HistoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'History'>;

const HistoryScreen: React.FC = () => {
  const [historyData, setHistoryData] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<HistoryScreenNavigationProp>();

  // 当页面获得焦点时刷新数据
  useFocusEffect(
    React.useCallback(() => {
      loadHistory();
    }, [])
  );

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      // TODO: 调用真实API
      // const result = await restaurantApi.getAnalysisHistory();
      
      // 模拟历史数据
      const mockHistory: AnalysisResult[] = [
        {
          id: 'analysis_1',
          restaurantId: 'restaurant_001',
          credibilityScore: 78,
          totalReviewsAnalyzed: 156,
          fakeReviewsDetected: 12,
          suspiciousPatterns: ['发现多个评论使用相似词汇'],
          analysisDate: '2024-01-20T10:30:00.000Z',
          reviews: [],
        },
        {
          id: 'analysis_2',
          restaurantId: 'restaurant_002',
          credibilityScore: 45,
          totalReviewsAnalyzed: 89,
          fakeReviewsDetected: 34,
          suspiciousPatterns: ['存在短时间内大量好评', '部分评论缺乏具体细节'],
          analysisDate: '2024-01-19T15:45:00.000Z',
          reviews: [],
        },
        {
          id: 'analysis_3',
          restaurantId: 'restaurant_003',
          credibilityScore: 92,
          totalReviewsAnalyzed: 234,
          fakeReviewsDetected: 3,
          suspiciousPatterns: [],
          analysisDate: '2024-01-18T09:20:00.000Z',
          reviews: [],
        },
      ];

      setHistoryData(mockHistory);
    } catch (error) {
      Alert.alert('Loading Failed', 'Unable to get history records, please try again later');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  const handleItemPress = (item: AnalysisResult) => {
    navigation.navigate('Results', { analysisResult: item });
  };

  const handleDeleteItem = (itemId: string) => {
    Alert.alert(
      'Delete Record',
      'Are you sure you want to delete this analysis record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setHistoryData(prev => prev.filter(item => item.id !== itemId));
          },
        },
      ]
    );
  };

  const renderHistoryItem = ({ item }: { item: AnalysisResult }) => {
    const credibilityColor = getCredibilityColor(item.credibilityScore);
    const credibilityLevel = getCredibilityLevel(item.credibilityScore);

    return (
      <TouchableOpacity
        style={styles.historyItem}
        onPress={() => handleItemPress(item)}
      >
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <View style={styles.scoreContainer}>
              <View style={[styles.scoreCircle, { backgroundColor: credibilityColor }]}>
                <Text style={styles.scoreText}>{item.credibilityScore}</Text>
              </View>
              <View style={styles.scoreDetails}>
                <Text style={[styles.credibilityLevel, { color: credibilityColor }]}>
                  {credibilityLevel}
                </Text>
                <Text style={styles.analysisDate}>
                  {formatDate(item.analysisDate)}
                </Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteItem(item.id)}
          >
            <Text style={styles.deleteButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.itemStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{item.totalReviewsAnalyzed}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#FF3B30' }]}>
              {item.fakeReviewsDetected}
            </Text>
            <Text style={styles.statLabel}>Fake</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {item.suspiciousPatterns.length}
            </Text>
            <Text style={styles.statLabel}>Patterns</Text>
          </View>
        </View>

        {item.suspiciousPatterns.length > 0 && (
          <View style={styles.patternsPreview}>
            <Text style={styles.patternsText} numberOfLines={2}>
              🚨 {item.suspiciousPatterns[0]}
              {item.suspiciousPatterns.length > 1 && ` +${item.suspiciousPatterns.length - 1} more`}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📊</Text>
      <Text style={styles.emptyTitle}>No History Records</Text>
      <Text style={styles.emptySubtitle}>Start your first restaurant review analysis!</Text>
      <TouchableOpacity
        style={styles.startButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.startButtonText}>Start Analysis</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📚 Analysis History</Text>
        <Text style={styles.subtitle}>View previous analysis results</Text>
      </View>

      <FlatList
        data={historyData}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#FF6B35']}
          />
        }
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
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
  listContainer: {
    padding: 20,
    flexGrow: 1,
  },
  historyItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  itemInfo: {
    flex: 1,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  scoreText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreDetails: {
    flex: 1,
  },
  credibilityLevel: {
    fontSize: 16,
    fontWeight: '600',
  },
  analysisDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  deleteButton: {
    padding: 10,
  },
  deleteButtonText: {
    fontSize: 18,
  },
  itemStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    paddingVertical: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  patternsPreview: {
    backgroundColor: '#FFF3F2',
    borderRadius: 6,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#FF3B30',
  },
  patternsText: {
    fontSize: 12,
    color: '#FF3B30',
    lineHeight: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  startButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HistoryScreen;
