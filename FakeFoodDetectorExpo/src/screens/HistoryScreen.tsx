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
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { RootStackParamList, AnalysisResult } from '../types';
import apiClient from '../services/api';
import { getCredibilityColor, getCredibilityDescription, formatDate } from '../utils/helpers';
import { Colors, ModernCard, AnimatedButton } from '../components/EnhancedUI';
import { SafeLinearGradient as LinearGradient } from '../components/SafeLinearGradient';
import { useTheme } from '../contexts/ThemeContext';

type HistoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'History'>;

const HistoryScreen: React.FC = () => {
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigation = useNavigation<HistoryScreenNavigationProp>();
  const { colors } = useTheme();

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
    <Animatable.View animation="fadeInUp" duration={600}>
      <ModernCard
        onPress={() => handleViewResult(item)}
        variant="highlighted"
      >
        <View style={styles.itemHeader}>
          <LinearGradient
            colors={[getCredibilityColor(item.credibilityScore) + '20', getCredibilityColor(item.credibilityScore) + '10']}
            style={styles.scoreContainer}
          >
            <Text
              style={[
                styles.score,
                { color: getCredibilityColor(item.credibilityScore) },
              ]}
            >
              {item.credibilityScore}
            </Text>
            <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>TRUTH SCORE</Text>
          </LinearGradient>
          <View style={styles.itemInfo}>
            <Text style={[styles.date, { color: colors.text }]}>📅 {formatDate(item.analysisDate)}</Text>
            <Text
              style={[
                styles.credibilityLabel,
                { color: getCredibilityColor(item.credibilityScore) },
              ]}
            >
              🔍 {getCredibilityDescription(item.credibilityScore)}
            </Text>
          </View>
        </View>
        
        <View style={styles.itemStats}>
          <View style={styles.statItem}>
            <LinearGradient
              colors={[Colors.primary + '20', Colors.primary + '10']}
              style={styles.statBadge}
            >
              <Ionicons name="document-text" size={16} color={Colors.primary} />
              <Text style={[styles.statNumber, { color: Colors.primary }]}>{item.totalReviewsAnalyzed}</Text>
            </LinearGradient>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
          <View style={styles.statItem}>
            <LinearGradient
              colors={[Colors.error + '20', Colors.error + '10']}
              style={styles.statBadge}
            >
              <Ionicons name="warning" size={16} color={Colors.error} />
              <Text style={[styles.statNumber, { color: Colors.error }]}>
                {item.fakeReviewsDetected}
              </Text>
            </LinearGradient>
            <Text style={styles.statLabel}>Suspicious</Text>
          </View>
          <View style={styles.statItem}>
            <LinearGradient
              colors={[Colors.success + '20', Colors.success + '10']}
              style={styles.statBadge}
            >
              <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
              <Text style={[styles.statNumber, { color: Colors.success }]}>
                {item.totalReviewsAnalyzed - item.fakeReviewsDetected}
              </Text>
            </LinearGradient>
            <Text style={styles.statLabel}>Authentic</Text>
          </View>
        </View>

        {item.suspiciousPatterns.length > 0 && (
          <View style={styles.patternsPreview}>
            <LinearGradient
              colors={[Colors.warning + '15', Colors.warning + '10']}
              style={styles.patternsContainer}
            >
              <Ionicons name="alert-circle" size={16} color={Colors.warning} />
              <Text style={styles.patternsText}>
                {item.suspiciousPatterns.length} suspicious pattern(s) detected
              </Text>
            </LinearGradient>
          </View>
        )}
      </ModernCard>
    </Animatable.View>
  );

  const renderEmptyState = () => (
    <Animatable.View animation="fadeIn" duration={800} style={styles.emptyContainer}>
      <LinearGradient
        colors={[colors.primary + '20', colors.secondary + '20']}
        style={[styles.emptyIconContainer, { borderColor: colors.primary + '40' }]}
      >
        <Ionicons name="analytics-outline" size={60} color={colors.primary} />
      </LinearGradient>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No Analysis History Yet</Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        🚀 Start analyzing restaurant reviews to build your truth detection history
      </Text>
      <AnimatedButton
        title="🔍 Start First Analysis"
        onPress={() => navigation.navigate('Home')}
        icon="home-outline"
      />
    </Animatable.View>
  );

  if (isLoading) {
    return (
      <LinearGradient
        colors={[colors.background, colors.surface]}
        style={styles.loadingContainer}
      >
        <Animatable.View animation="pulse" iterationCount="infinite" duration={1000}>
          <LinearGradient
            colors={[colors.primary + '30', colors.secondary + '30']}
            style={styles.loadingIconContainer}
          >
            <Ionicons name="analytics" size={40} color={colors.primary} />
          </LinearGradient>
        </Animatable.View>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading Analysis History...</Text>
        <Text style={[styles.loadingSubtext, { color: colors.textSecondary }]}>🔍 Gathering your truth detection results</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[colors.background, colors.surface]}
      style={styles.container}
    >
      {/* Header */}
      <LinearGradient
        colors={[colors.surface, colors.surfaceLight]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={[styles.headerIcon, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="time" size={32} color={colors.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: colors.text, textShadowColor: colors.glow }]}>📊 Analysis History</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {analysisHistory.length > 0 
                ? `${analysisHistory.length} truth detection result${analysisHistory.length > 1 ? 's' : ''}`
                : 'Ready to track your analyses'
              }
            </Text>
          </View>
        </View>
      </LinearGradient>

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
            colors={[colors.primary]}
            tintColor={colors.primary}
            progressBackgroundColor={colors.surface}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 15,
    backgroundColor: Colors.primary + '20',
    padding: 10,
    borderRadius: 15,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    textShadowColor: Colors.glow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.primary + '40',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  listContainer: {
    padding: 15,
    paddingBottom: 120, // Extra space for bottom navigation
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  
  // Item Styles
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  scoreContainer: {
    alignItems: 'center',
    marginRight: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 15,
    minWidth: 80,
  },
  score: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '600',
    letterSpacing: 1,
  },
  itemInfo: {
    flex: 1,
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
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
    borderTopColor: Colors.cardBorder,
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 4,
    gap: 6,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  patternsPreview: {
    marginTop: 12,
  },
  patternsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 8,
  },
  patternsText: {
    fontSize: 12,
    color: Colors.warning,
    fontWeight: '600',
    flex: 1,
  },
  
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: Colors.primary + '40',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
});

export default HistoryScreen;
