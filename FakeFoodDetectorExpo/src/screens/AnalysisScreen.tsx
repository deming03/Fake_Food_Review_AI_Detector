import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, AnalysisResult } from '../types';
import { restaurantApi } from '../services/api';

type AnalysisScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Analysis'>;
type AnalysisScreenRouteProp = RouteProp<RootStackParamList, 'Analysis'>;

const AnalysisScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const navigation = useNavigation<AnalysisScreenNavigationProp>();
  const route = useRoute<AnalysisScreenRouteProp>();
  const { restaurantUrl } = route.params;

  const progressAnim = new Animated.Value(0);
  const pulseAnim = new Animated.Value(1);

  const steps = [
    'Parsing restaurant URL...',
    'Fetching restaurant reviews...',
    'Running AI authenticity analysis...',
    'Detecting suspicious patterns...',
    'Calculating credibility score...',
    'Generating detailed report...',
  ];

  useEffect(() => {
    startAnalysis();
    startPulseAnimation();
  }, []);

  const startPulseAnimation = () => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(pulse);
    };
    pulse();
  };

  const startAnalysis = async () => {
    try {
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(steps[i]);
        setProgress((i + 1) / steps.length);
        
        // Animate progress bar
        Animated.timing(progressAnim, {
          toValue: (i + 1) / steps.length,
          duration: 500,
          useNativeDriver: false,
        }).start();

        // Simulate step duration
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Call the API to get analysis results
      const response = await restaurantApi.analyzeRestaurant(restaurantUrl);
      
      if (response.success && response.data) {
        navigation.replace('Results', { analysisResult: response.data });
      } else {
        throw new Error(response.error || 'Analysis failed');
      }
    } catch (error) {
      Alert.alert(
        'Analysis Failed',
        error instanceof Error ? error.message : 'An unexpected error occurred',
        [
          {
            text: 'Try Again',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.icon}>🔍</Text>
        </Animated.View>

        <Text style={styles.title}>AI Analysis in Progress</Text>
        <Text style={styles.subtitle}>Analyzing restaurant reviews for authenticity</Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
        </View>

        <View style={styles.stepContainer}>
          <Text style={styles.stepText}>{currentStep}</Text>
        </View>

        <View style={styles.stepsListContainer}>
          {steps.map((step, index) => (
            <View key={index} style={styles.stepItem}>
              <View
                style={[
                  styles.stepIndicator,
                  {
                    backgroundColor: progress > index / steps.length ? '#4CAF50' : '#E0E0E0',
                  },
                ]}
              >
                {progress > index / steps.length ? (
                  <Text style={styles.checkmark}>✓</Text>
                ) : (
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  {
                    color: progress > index / steps.length ? '#333' : '#999',
                    fontWeight: progress > index / steps.length ? '600' : 'normal',
                  },
                ]}
              >
                {step}
              </Text>
            </View>
          ))}
        </View>

        <ActivityIndicator size="large" color="#FF6B35" style={styles.loader} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 30,
  },
  icon: {
    fontSize: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  stepContainer: {
    marginBottom: 30,
  },
  stepText: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
    textAlign: 'center',
  },
  stepsListContainer: {
    width: '100%',
    marginBottom: 30,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepNumber: {
    color: '#666',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepLabel: {
    fontSize: 14,
    flex: 1,
  },
  loader: {
    marginTop: 20,
  },
});

export default AnalysisScreen;
