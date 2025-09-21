import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Animatable from 'react-native-animatable';
import { RootStackParamList } from '../types';
import { parseGoogleMapsUrl } from '../utils/helpers';
import apiClient from '../services/api';
import { 
  EnhancedProgressBar,
  AnalysisResultSkeleton,
  LoadingDots,
  SpinningLoader
} from '../components/LoadingComponents';
import {
  CredibilityScoreChart,
  SentimentChart,
  ReviewDistributionChart,
  StatsDashboard,
  TrendChart
} from '../components/DataVisualization';
import { 
  ModernCard, 
  StatusBadge, 
  Colors,
  showToast
} from '../components/EnhancedUI';

const { width } = Dimensions.get('window');

type AnalysisScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Analysis'>;
type AnalysisScreenRouteProp = RouteProp<RootStackParamList, 'Analysis'>;

const AnalysisScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const navigation = useNavigation<AnalysisScreenNavigationProp>();
  const route = useRoute<AnalysisScreenRouteProp>();
  
  const { restaurantUrl, restaurantName } = route.params;

  useEffect(() => {
    startAnalysis();
  }, []);

  const startAnalysis = async () => {
    try {
      // Parse the restaurant URL
      const parseResult = parseGoogleMapsUrl(restaurantUrl);
      if (!parseResult.isValid) {
        setError('Invalid restaurant URL');
        return;
      }

      // Simulate analysis steps with enhanced progress
      const steps = [
        { step: 'Parsing restaurant URL...', progress: 10 },
        { step: 'Fetching restaurant data...', progress: 25 },
        { step: 'Collecting reviews...', progress: 40 },
        { step: 'Running AI analysis...', progress: 60 },
        { step: 'Detecting suspicious patterns...', progress: 80 },
        { step: 'Generating credibility score...', progress: 95 },
        { step: 'Analysis complete!', progress: 100 },
      ];

      for (const { step, progress: stepProgress } of steps) {
        setCurrentStep(step);
        setProgress(stepProgress);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // Get analysis result
      const response = await apiClient.analyzeRestaurant(restaurantUrl, restaurantName);
      
      if (response.success && response.data) {
        const analysisData = response.data;
        setAnalysisResult(analysisData);
        showToast.success('Analysis completed successfully!');
        
        // Navigate to results after a short delay
        setTimeout(() => {
          navigation.replace('Results', { 
            analysisResult: analysisData
          });
        }, 2000);
      } else {
        throw new Error(response.error || 'Analysis failed');
      }

    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'Analysis failed');
      showToast.error('Analysis failed. Please try again.');
    }
  };

  if (error) {
    return (
      <ScrollView style={styles.container}>
        <ModernCard title="❌ Analysis Error" variant="warning">
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.helpText}>Please check your URL and try again.</Text>
        </ModernCard>
      </ScrollView>
    );
  }

  if (progress === 100 && analysisResult) {
    return (
      <ScrollView style={styles.container}>
        {/* Success State with Preview */}
        <Animatable.View animation="bounceIn">
          <ModernCard title="✅ Truth Revealed!" variant="success">
            <Text style={styles.successText}>
              The truth about this restaurant has been revealed!
            </Text>
            <StatusBadge text="Redirecting to results..." status="info" />
          </ModernCard>
        </Animatable.View>

        {/* Preview Results */}
        <ModernCard title="📊 Truth Score Preview">
          <View style={styles.previewContainer}>
            <CredibilityScoreChart score={analysisResult.credibilityScore} size={120} />
            <View style={styles.previewStats}>
              <Text style={styles.previewScore}>
                {analysisResult.credibilityScore}% Authentic
              </Text>
              <Text style={styles.previewDetails}>
                {analysisResult.totalReviewsAnalyzed} reviews analyzed
              </Text>
              <Text style={styles.previewDetails}>
                {analysisResult.fakeReviewsDetected} suspicious reviews found
              </Text>
            </View>
          </View>
        </ModernCard>

        {/* Loading Dots */}
        <View style={styles.loadingContainer}>
          <LoadingDots size={12} color={Colors.primary} />
          <Text style={styles.loadingText}>Preparing your truth report...</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Analysis Header */}
      <Animatable.View animation="fadeInDown">
        <ModernCard title="🕵️ TRUTH BITE Analysis" icon="analytics">
          <Text style={styles.analysisUrl}>{restaurantUrl}</Text>
          <StatusBadge 
            text={progress < 100 ? "Analyzing..." : "Complete"} 
            status={progress < 100 ? "info" : "success"} 
          />
        </ModernCard>
      </Animatable.View>

      {/* Progress Section */}
      <ModernCard>
        <EnhancedProgressBar 
          progress={progress} 
          label={currentStep}
        />
        
        {/* Spinning Loader */}
        <View style={styles.loaderContainer}>
          <SpinningLoader size={50} color={Colors.primary} />
        </View>
      </ModernCard>

      {/* Analysis Steps */}
      <ModernCard title="🔍 Truth Detection Process">
        <View style={styles.stepsContainer}>
          {[
            { icon: '🔗', text: 'URL Parsing', done: progress > 10 },
            { icon: '📊', text: 'Data Collection', done: progress > 25 },
            { icon: '🕵️', text: 'Review Analysis', done: progress > 60 },
            { icon: '🧠', text: 'AI Detection', done: progress > 80 },
            { icon: '✅', text: 'Results Generation', done: progress >= 100 },
          ].map((step, index) => (
            <Animatable.View
              key={index}
              animation={step.done ? "bounceIn" : "fadeIn"}
              delay={index * 200}
              style={[
                styles.stepItem,
                step.done && styles.stepCompleted
              ]}
            >
              <Text style={styles.stepIcon}>{step.icon}</Text>
              <Text style={[
                styles.stepText,
                step.done && styles.stepTextCompleted
              ]}>
                {step.text}
              </Text>
              {step.done && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </Animatable.View>
          ))}
        </View>
      </ModernCard>

      {/* Skeleton Loading for Results */}
      {progress > 50 && (
        <Animatable.View animation="fadeInUp">
          <ModernCard title="📋 Preparing Truth Report...">
            <AnalysisResultSkeleton />
          </ModernCard>
        </Animatable.View>
      )}

      {/* Fun Facts During Loading */}
      <ModernCard title="💡 Did You Know?" variant="highlighted">
        <Text style={styles.funFact}>
          🕵️ TRUTH BITE's AI engine analyzes over 50 different patterns in review text, including writing style, sentiment consistency, and timing patterns to uncover deceptive content with 89% accuracy!
        </Text>
      </ModernCard>

      {/* Loading Animation */}
      <View style={styles.bottomLoader}>
        <LoadingDots size={10} color={Colors.secondary} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Analysis Header
  analysisUrl: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 12,
    fontFamily: 'monospace',
  },

  // Progress Section
  loaderContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },

  // Steps
  stepsContainer: {
    marginTop: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.background,
    borderRadius: 8,
    marginBottom: 8,
  },
  stepCompleted: {
    backgroundColor: `${Colors.success}15`,
  },
  stepIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  stepTextCompleted: {
    color: Colors.text,
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 18,
    color: Colors.success,
    fontWeight: 'bold',
  },

  // Success State
  successText: {
    fontSize: 16,
    color: Colors.success,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },

  // Preview
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  previewStats: {
    flex: 1,
    marginLeft: 20,
  },
  previewScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  previewDetails: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },

  // Loading
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 12,
  },

  // Fun Facts
  funFact: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
    textAlign: 'center',
  },

  // Error
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 12,
  },
  helpText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // Bottom
  bottomLoader: {
    alignItems: 'center',
    paddingVertical: 30,
  },
});

export default AnalysisScreen;
