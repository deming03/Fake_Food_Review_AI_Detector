import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart, PieChart, BarChart, ProgressChart } from 'react-native-chart-kit';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

// 📊 Credibility Score Circle Chart
export const CredibilityScoreChart: React.FC<{ score: number; size?: number }> = ({ 
  score, 
  size = 150 
}) => {
  const data = {
    data: [score / 100]
  };

  const getScoreColor = () => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    return '#F44336';
  };

  return (
    <Animatable.View animation="zoomIn" style={styles.scoreContainer}>
      <ProgressChart
        data={data}
        width={size}
        height={size}
        strokeWidth={12}
        radius={size / 3}
        chartConfig={{
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          color: (opacity = 1) => getScoreColor(),
        }}
        hideLegend={true}
      />
      <View style={styles.scoreOverlay}>
        <Text style={[styles.scoreText, { color: getScoreColor() }]}>{score}</Text>
        <Text style={styles.scoreLabel}>Credibility</Text>
      </View>
    </Animatable.View>
  );
};

// 📈 Review Sentiment Analysis Chart
export const SentimentChart: React.FC<{ data: any }> = ({ data }) => {
  const chartData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [{
      data: data.sentiment || [65, 25, 10]
    }]
  };

  return (
    <Animatable.View animation="fadeInUp" delay={200} style={styles.chartContainer}>
      <Text style={styles.chartTitle}>📈 Review Sentiment Analysis</Text>
      <BarChart
        data={chartData}
        width={screenWidth - 40}
        height={200}
        yAxisLabel=""
        yAxisSuffix="%"
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(255, 107, 53, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        style={styles.chart}
      />
    </Animatable.View>
  );
};

// 🥧 Fake vs Real Reviews Distribution
export const ReviewDistributionChart: React.FC<{ fakeCount: number; realCount: number }> = ({ 
  fakeCount, 
  realCount 
}) => {
  const total = fakeCount + realCount;
  const data = [
    {
      name: 'Real Reviews',
      population: realCount,
      color: '#4CAF50',
      legendFontColor: '#333',
      legendFontSize: 14,
    },
    {
      name: 'Fake Reviews',
      population: fakeCount,
      color: '#F44336',
      legendFontColor: '#333',
      legendFontSize: 14,
    },
  ];

  return (
    <Animatable.View animation="fadeInUp" delay={400} style={styles.chartContainer}>
      <Text style={styles.chartTitle}>🥧 Review Distribution</Text>
      <PieChart
        data={data}
        width={screenWidth - 40}
        height={200}
        chartConfig={{
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
      <View style={styles.distributionStats}>
        <View style={styles.statItem}>
          <View style={[styles.statDot, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.statText}>Real: {realCount} ({Math.round(realCount/total*100)}%)</Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statDot, { backgroundColor: '#F44336' }]} />
          <Text style={styles.statText}>Fake: {fakeCount} ({Math.round(fakeCount/total*100)}%)</Text>
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

// 📈 Trend Analysis Chart
export const TrendChart: React.FC<{ data: any }> = ({ data }) => {
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      data: data.trends || [20, 45, 28, 80, 65, 43],
      strokeWidth: 3,
    }]
  };

  return (
    <Animatable.View animation="fadeInUp" delay={600} style={styles.chartContainer}>
      <Text style={styles.chartTitle}>📈 Credibility Trend</Text>
      <LineChart
        data={chartData}
        width={screenWidth - 40}
        height={200}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(255, 107, 53, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        bezier
        style={styles.chart}
      />
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
