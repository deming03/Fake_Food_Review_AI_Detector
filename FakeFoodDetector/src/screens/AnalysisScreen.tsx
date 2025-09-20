import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, AnalysisResult } from '../types';
import { restaurantApi } from '../services/api';

type AnalysisScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Analysis'>;
type AnalysisScreenRouteProp = RouteProp<RootStackParamList, 'Analysis'>;

const AnalysisScreen: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const navigation = useNavigation<AnalysisScreenNavigationProp>();
  const route = useRoute<AnalysisScreenRouteProp>();

  const { restaurantUrl } = route.params || {};

  useEffect(() => {
    if (restaurantUrl) {
      startAnalysis();
    }
  }, [restaurantUrl]);

  const startAnalysis = async () => {
    if (!restaurantUrl) {
      Alert.alert('Error', 'Missing restaurant link');
      navigation.goBack();
      return;
    }

    setIsAnalyzing(true);
    const steps = [
      'Parsing restaurant information...',
      'Scraping review data...',
      'Performing AI analysis...',
      'Generating analysis report...',
      'Analysis complete!',
    ];

    try {
      // 模拟分析过程
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(steps[i]);
        setProgress((i + 1) / steps.length);
        await new Promise<void>(resolve => setTimeout(() => resolve(), 2000)); // Simulate processing time
      }

      // 调用实际API (目前使用模拟数据)
      const result = await performAnalysis(restaurantUrl);
      
      if (result.success && result.data) {
        navigation.replace('Results', { analysisResult: result.data });
      } else {
        const errorMessage = 'error' in result ? (result.error || 'Analysis failed') : 'Analysis failed';
        throw new Error(typeof errorMessage === 'string' ? errorMessage : 'Analysis failed');
      }
    } catch (error: any) {
      Alert.alert('Analysis Failed', error.message || 'Please try again later');
      navigation.goBack();
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 实际分析函数 (目前返回模拟数据)
  const performAnalysis = async (url: string) => {
    // TODO: 这里将调用真实的API
    // const result = await restaurantApi.analyzeRestaurant(url);
    
    // 模拟分析结果
    const mockResult: AnalysisResult = {
      id: 'analysis_' + Date.now(),
      restaurantId: 'restaurant_001',
      credibilityScore: Math.floor(Math.random() * 40) + 60, // 60-100之间的随机分数
      totalReviewsAnalyzed: 156,
      fakeReviewsDetected: 12,
      suspiciousPatterns: [
        '发现多个评论使用相似词汇',
        '存在短时间内大量好评',
        '部分评论缺乏具体细节',
      ],
      analysisDate: new Date().toISOString(),
      reviews: [
        {
          id: 'review_1',
          author: '张**',
          rating: 5,
          text: '非常好吃，服务态度也很好，推荐大家来试试！',
          date: '2024-01-15',
          isDetectedAsFake: true,
          fakeScore: 0.85,
        },
        {
          id: 'review_2',
          author: '李**',
          rating: 4,
          text: '菜品味道不错，环境也很舒适，就是人有点多，需要等位。价格合理，会再来的。',
          date: '2024-01-14',
          isDetectedAsFake: false,
          fakeScore: 0.15,
        },
        // 可以添加更多模拟评论
      ],
    };

    return {
      success: true,
      data: mockResult,
    };
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Analysis',
      'Are you sure you want to cancel the current analysis?',
      [
        { text: 'Continue Analysis', style: 'cancel' },
        { 
          text: 'Cancel', 
          onPress: () => navigation.goBack(),
          style: 'destructive' 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔍 Analyzing</Text>
        <Text style={styles.subtitle}>AI is analyzing restaurant review authenticity</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
      </View>

      <View style={styles.statusContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.statusText}>{currentStep}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Analysis includes:</Text>
        <View style={styles.infoList}>
          <Text style={styles.infoItem}>✓ Review language pattern analysis</Text>
          <Text style={styles.infoItem}>✓ User behavior pattern detection</Text>
          <Text style={styles.infoItem}>✓ Time distribution anomaly identification</Text>
          <Text style={styles.infoItem}>✓ Content similarity comparison</Text>
          <Text style={styles.infoItem}>✓ Sentiment analysis validation</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.cancelButton} 
        onPress={handleCancel}
        disabled={!isAnalyzing}
      >
        <Text style={styles.cancelButtonText}>Cancel Analysis</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  progressContainer: {
    marginBottom: 40,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 18,
    fontWeight: '600',
    color: '#FF6B35',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  statusText: {
    fontSize: 16,
    color: '#333',
    marginTop: 15,
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoList: {
    gap: 8,
  },
  infoItem: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AnalysisScreen;
