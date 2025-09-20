import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
// Temporarily disable charts to fix BVLinearGradient error
// import { LineChart, PieChart, BarChart, ProgressChart } from 'react-native-chart-kit';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

// 📊 Credibility Score Circle Chart (Simple Version)
export const CredibilityScoreChart: React.FC<{ score: number; size?: number }> = ({ 
  score, 
  size = 150 
}) => {
  const getScoreColor = () => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    return '#F44336';
  };

  const circumference = 2 * Math.PI * (size / 3);
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <Animatable.View animation="zoomIn" style={styles.scoreContainer}>
      <View style={[styles.circleContainer, { width: size, height: size }]}>
        <View style={[styles.circleBackground, { 
          width: size - 20, 
          height: size - 20, 
          borderRadius: (size - 20) / 2,
          borderWidth: 8,
          borderColor: '#E0E0E0'
        }]} />
        <View style={[styles.circleProgress, { 
          width: size - 20, 
          height: size - 20, 
          borderRadius: (size - 20) / 2,
          borderWidth: 8,
          borderColor: getScoreColor(),
          transform: [{ rotate: '-90deg' }]
        }]} />
        <View style={styles.scoreOverlay}>
          <Text style={[styles.scoreText, { color: getScoreColor() }]}>{score}</Text>
          <Text style={styles.scoreLabel}>Truth Score</Text>
        </View>
      </View>
    </Animatable.View>
  );
};

// 📈 Review Sentiment Analysis Chart (Simple Version)
export const SentimentChart: React.FC<{ data: any }> = ({ data }) => {
  const sentimentData = data.sentiment || [65, 25, 10];
  const labels = ['Positive', 'Neutral', 'Negative'];
  const colors = ['#4CAF50', '#FF9800', '#F44336'];

  return (
    <Animatable.View animation="fadeInUp" delay={200} style={styles.chartContainer}>
      <Text style={styles.chartTitle}>📈 Review Sentiment Analysis</Text>
      <View style={styles.simpleBarChart}>
        {sentimentData.map((value: number, index: number) => (
          <View key={index} style={styles.barContainer}>
            <View style={styles.barColumn}>
              <View 
                style={[
                  styles.bar, 
                  { 
                    height: `${value}%`, 
                    backgroundColor: colors[index] 
                  }
                ]} 
              />
            </View>
            <Text style={styles.barLabel}>{labels[index]}</Text>
            <Text style={styles.barValue}>{value}%</Text>
          </View>
        ))}
      </View>
    </Animatable.View>
  );
};

// 🥧 Fake vs Real Reviews Distribution (Simple Version)
export const ReviewDistributionChart: React.FC<{ fakeCount: number; realCount: number }> = ({ 
  fakeCount, 
  realCount 
}) => {
  const total = fakeCount + realCount;
  const realPercentage = Math.round((realCount / total) * 100);
  const fakePercentage = Math.round((fakeCount / total) * 100);

  return (
    <Animatable.View animation="fadeInUp" delay={400} style={styles.chartContainer}>
      <Text style={styles.chartTitle}>🥧 Review Distribution</Text>
      <View style={styles.simplePieChart}>
        <View style={styles.pieContainer}>
          <View style={[styles.pieSegment, { 
            backgroundColor: '#4CAF50',
            flex: realCount 
          }]} />
          <View style={[styles.pieSegment, { 
            backgroundColor: '#F44336',
            flex: fakeCount 
          }]} />
        </View>
      </View>
      <View style={styles.distributionStats}>
        <View style={styles.statItem}>
          <View style={[styles.statDot, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.statText}>Real: {realCount} ({realPercentage}%)</Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statDot, { backgroundColor: '#F44336' }]} />
          <Text style={styles.statText}>Fake: {fakeCount} ({fakePercentage}%)</Text>
        </View>
      </View>
    </Animatable.View>
  );
};

// 📊 Statistics Dashboard Cards
export const StatsDashboard: React.FC<{ stats: any }> = ({ stats }) => {
  const statsData = [
    {
      title: 'Total Reviews',
      value: stats.totalReviews || 127,
      icon: '📝',
      color: '#2196F3',
    },
    {
      title: 'Avg Rating',
      value: `${stats.avgRating || 4.2}/5`,
      icon: '⭐',
      color: '#FF9800',
    },
    {
      title: 'Suspicious',
      value: stats.suspiciousCount || 8,
      icon: '🚨',
      color: '#F44336',
    },
    {
      title: 'Confidence',
      value: `${stats.confidence || 89}%`,
      icon: '🎯',
      color: '#4CAF50',
    },
  ];

  return (
    <View style={styles.dashboardContainer}>
      <Text style={styles.dashboardTitle}>📊 Analysis Statistics</Text>
      <View style={styles.statsGrid}>
        {statsData.map((stat, index) => (
          <Animatable.View
            key={stat.title}
            animation="bounceIn"
            delay={index * 100}
            style={[styles.statCard, { borderLeftColor: stat.color }]}
          >
            <Text style={styles.statIcon}>{stat.icon}</Text>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statTitle}>{stat.title}</Text>
            </View>
          </Animatable.View>
        ))}
      </View>
    </View>
  );
};

// 📈 Trend Analysis Chart (Simple Version)
export const TrendChart: React.FC<{ data: any }> = ({ data }) => {
  const trendData = data.trends || [20, 45, 28, 80, 65, 43];
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  return (
    <Animatable.View animation="fadeInUp" delay={600} style={styles.chartContainer}>
      <Text style={styles.chartTitle}>📈 Credibility Trend</Text>
      <View style={styles.simpleTrendChart}>
        {trendData.map((value: number, index: number) => (
          <View key={index} style={styles.trendColumn}>
            <View style={styles.trendBarContainer}>
              <View 
                style={[
                  styles.trendBar, 
                  { height: `${value}%` }
                ]} 
              />
            </View>
            <Text style={styles.trendLabel}>{labels[index]}</Text>
          </View>
        ))}
      </View>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  // Score Chart Styles
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 20,
  },
  circleContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBackground: {
    position: 'absolute',
  },
  circleProgress: {
    position: 'absolute',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  scoreOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },

  // Simple Bar Chart Styles
  simpleBarChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 200,
    marginTop: 20,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barColumn: {
    height: 150,
    width: 40,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 5,
  },
  barLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  barValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },

  // Simple Pie Chart Styles
  simplePieChart: {
    alignItems: 'center',
    marginVertical: 20,
  },
  pieContainer: {
    flexDirection: 'row',
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
  },
  pieSegment: {
    height: '100%',
  },

  // Simple Trend Chart Styles
  simpleTrendChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 150,
    marginTop: 20,
  },
  trendColumn: {
    alignItems: 'center',
    flex: 1,
  },
  trendBarContainer: {
    height: 100,
    width: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  trendBar: {
    width: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 10,
    minHeight: 5,
  },
  trendLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },

  // Chart Container Styles
  chartContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 16,
  },

  // Distribution Stats
  distributionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },

  // Dashboard Styles
  dashboardContainer: {
    margin: 16,
  },
  dashboardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});
