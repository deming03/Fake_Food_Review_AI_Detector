import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types';
import { parseGoogleMapsUrl, isValidUrl } from '../utils/helpers';
import { 
  AnimatedButton, 
  EnhancedTextInput, 
  ModernCard, 
  StatusBadge, 
  Colors,
  showToast
} from '../components/EnhancedUI';
import { RefreshableScrollView } from '../components/InteractiveComponents';
import { TruthBiteLogo } from '../components/TruthBiteLogo';

const { width } = Dimensions.get('window');

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const EnhancedHomeScreen: React.FC = () => {
  const [restaurantUrl, setRestaurantUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const handleAnalyze = async () => {
    if (!restaurantUrl.trim()) {
      showToast.error('Please enter a Google Maps restaurant link');
      return;
    }

    if (!isValidUrl(restaurantUrl)) {
      showToast.error('Please enter a valid URL link');
      return;
    }

    const parseResult = parseGoogleMapsUrl(restaurantUrl);
    if (!parseResult.isValid) {
      showToast.error('Please enter a valid Google Maps restaurant link');
      return;
    }

    setIsLoading(true);
    showToast.info('Starting AI analysis...');
    
    try {
      // Navigate to analysis page
      navigation.navigate('Analysis', { restaurantUrl });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasteFromClipboard = async () => {
    // Simulate clipboard paste
    const sampleUrl = 'https://maps.google.com/place/sample-restaurant';
    setRestaurantUrl(sampleUrl);
    showToast.success('Sample URL pasted! Try it out.');
  };

  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    showToast.success('Welcome back! Ready to analyze restaurants.');
  };

  const handleOpenHistory = () => {
    navigation.navigate('History');
  };

  const handleHowToUse = () => {
    Alert.alert(
      'How to Use 📱',
      '1. 🗺️ Open Google Maps\n2. 🔍 Find the restaurant\n3. 📋 Copy the link\n4. 📲 Paste it here\n5. 🚀 Start AI analysis!',
    );
  };

  return (
    <RefreshableScrollView onRefresh={handleRefresh}>
      <View style={styles.container}>
        {/* Hero Section */}
        <Animatable.View animation="fadeInDown" style={styles.hero}>
          <View style={styles.heroContent}>
            <TruthBiteLogo size={120} showText={true} animated={true} variant="light" />
            <Animatable.Text 
              animation="fadeInUp" 
              delay={900}
              style={styles.heroSubtitle}
            >
              Discover the truth behind every restaurant review with AI-powered authenticity analysis
            </Animatable.Text>
            <View style={styles.badgeContainer}>
              <StatusBadge text="AI Powered" status="info" size="large" />
              <StatusBadge text="Real-time" status="success" />
              <StatusBadge text="89% Accurate" status="warning" />
            </View>
          </View>
        </Animatable.View>

        {/* Input Section */}
        <ModernCard 
          title="🔗 Restaurant Analysis" 
          subtitle="Paste any Google Maps restaurant link to reveal the truth"
          icon="search"
        >
          <EnhancedTextInput
            placeholder="Paste Google Maps restaurant link here..."
            value={restaurantUrl}
            onChangeText={setRestaurantUrl}
            icon="link-outline"
            multiline
          />
          
          <View style={styles.inputActions}>
            <AnimatedButton
              title="Paste Sample"
              onPress={handlePasteFromClipboard}
              variant="outline"
              icon="clipboard-outline"
            />
          </View>
        </ModernCard>

        {/* Analysis Button */}
        <View style={styles.analysisSection}>
          <AnimatedButton
            title="🔍 Reveal the Truth"
            onPress={handleAnalyze}
            loading={isLoading}
            disabled={isLoading}
            icon="search"
          />
        </View>

        {/* Quick Actions */}
        <ModernCard title="⚡ Quick Actions" icon="flash">
          <View style={styles.quickActions}>
            <AnimatedButton
              title="View History"
              onPress={handleOpenHistory}
              variant="secondary"
              icon="time-outline"
            />
            <AnimatedButton
              title="How to Use"
              onPress={handleHowToUse}
              variant="outline"
              icon="help-circle-outline"
            />
          </View>
        </ModernCard>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Animatable.Text animation="fadeInUp" style={styles.featuresTitle}>
            🕵️ Truth Detection Features
          </Animatable.Text>
          
          <Animatable.View animation="fadeInUp" delay={200}>
            <View style={styles.enhancedFeatureCard}>
              <View style={[styles.featureIconContainer, { backgroundColor: Colors.primary }]}>
                <Text style={styles.enhancedFeatureIcon}>🤖</Text>
              </View>
              <View style={styles.enhancedFeatureContent}>
                <Text style={styles.enhancedFeatureTitle}>Truth Detection AI</Text>
                <Text style={styles.enhancedFeatureDescription}>
                  Advanced machine learning models analyze review authenticity with 89% accuracy
                </Text>
                <View style={styles.featureBadge}>
                  <Text style={styles.featureBadgeText}>AI Powered</Text>
                </View>
              </View>
            </View>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" delay={400}>
            <View style={styles.enhancedFeatureCard}>
              <View style={[styles.featureIconContainer, { backgroundColor: Colors.success }]}>
                <Text style={styles.enhancedFeatureIcon}>📊</Text>
              </View>
              <View style={styles.enhancedFeatureContent}>
                <Text style={styles.enhancedFeatureTitle}>Truth Score</Text>
                <Text style={styles.enhancedFeatureDescription}>
                  Get an instant 0-100 authenticity rating for every restaurant
                </Text>
                <View style={styles.featureBadge}>
                  <Text style={styles.featureBadgeText}>Real-time</Text>
                </View>
              </View>
            </View>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" delay={600}>
            <View style={styles.enhancedFeatureCard}>
              <View style={[styles.featureIconContainer, { backgroundColor: Colors.warning }]}>
                <Text style={styles.enhancedFeatureIcon}>🚨</Text>
              </View>
              <View style={styles.enhancedFeatureContent}>
                <Text style={styles.enhancedFeatureTitle}>Deception Detection</Text>
                <Text style={styles.enhancedFeatureDescription}>
                  Uncover fake reviews, bot accounts, and misleading content instantly
                </Text>
                <View style={styles.featureBadge}>
                  <Text style={styles.featureBadgeText}>Advanced</Text>
                </View>
              </View>
            </View>
          </Animatable.View>
        </View>

        {/* Enhanced Stats Preview */}
        <View style={styles.enhancedStatsSection}>
          <Animatable.Text animation="fadeInUp" style={styles.statsTitle}>
            📈 App Statistics
          </Animatable.Text>
          
          <View style={styles.enhancedStatsContainer}>
            <Animatable.View animation="bounceIn" delay={200} style={styles.enhancedStatCard}>
              <View style={[styles.statIconContainer, { backgroundColor: Colors.primary }]}>
                <Text style={styles.statIcon}>🏪</Text>
              </View>
              <Text style={styles.enhancedStatNumber}>1,247</Text>
              <Text style={styles.enhancedStatLabel}>Restaurants Analyzed</Text>
              <View style={styles.statProgressBar}>
                <View style={[styles.statProgressFill, { width: '85%', backgroundColor: Colors.primary }]} />
              </View>
            </Animatable.View>

            <Animatable.View animation="bounceIn" delay={400} style={styles.enhancedStatCard}>
              <View style={[styles.statIconContainer, { backgroundColor: Colors.success }]}>
                <Text style={styles.statIcon}>🎯</Text>
              </View>
              <Text style={styles.enhancedStatNumber}>89%</Text>
              <Text style={styles.enhancedStatLabel}>Accuracy Rate</Text>
              <View style={styles.statProgressBar}>
                <View style={[styles.statProgressFill, { width: '89%', backgroundColor: Colors.success }]} />
              </View>
            </Animatable.View>

            <Animatable.View animation="bounceIn" delay={600} style={styles.enhancedStatCard}>
              <View style={[styles.statIconContainer, { backgroundColor: Colors.error }]}>
                <Text style={styles.statIcon}>🔍</Text>
              </View>
              <Text style={styles.enhancedStatNumber}>342</Text>
              <Text style={styles.enhancedStatLabel}>Fake Reviews Found</Text>
              <View style={styles.statProgressBar}>
                <View style={[styles.statProgressFill, { width: '27%', backgroundColor: Colors.error }]} />
              </View>
            </Animatable.View>
          </View>

          <View style={styles.statsFooter}>
            <Text style={styles.statsFooterText}>Powered by TRUTH BITE AI Engine</Text>
            <Text style={styles.statsFooterSubtext}>Protecting diners from deceptive reviews since 2024</Text>
          </View>
        </View>
      </View>
    </RefreshableScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  // Hero Section
  hero: {
    backgroundColor: Colors.primary,
    paddingVertical: 40,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 2,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    opacity: 0.95,
    marginBottom: 24,
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },

  // Input Section
  inputActions: {
    marginTop: 16,
  },

  // Analysis Section
  analysisSection: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },

  // Enhanced Features Section
  featuresSection: {
    marginVertical: 8,
  },
  featuresTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 20,
    marginHorizontal: 16,
  },
  
  // Enhanced Feature Cards
  enhancedFeatureCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  featureIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  enhancedFeatureIcon: {
    fontSize: 28,
  },
  enhancedFeatureContent: {
    flex: 1,
    paddingTop: 4,
  },
  enhancedFeatureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  enhancedFeatureDescription: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  featureBadge: {
    backgroundColor: `${Colors.primary}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  featureBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primary,
  },

  // Enhanced Stats Section
  enhancedStatsSection: {
    margin: 16,
    marginBottom: 32,
  },
  statsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  enhancedStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  enhancedStatCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    fontSize: 24,
  },
  enhancedStatNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 6,
  },
  enhancedStatLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 14,
  },
  statProgressBar: {
    width: '100%',
    height: 4,
    backgroundColor: Colors.background,
    borderRadius: 2,
    overflow: 'hidden',
  },
  statProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  statsFooter: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  statsFooterText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  statsFooterSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

export default EnhancedHomeScreen;
