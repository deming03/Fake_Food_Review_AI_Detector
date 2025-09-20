import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { parseGoogleMapsUrl, isValidUrl } from '../utils/helpers';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const [restaurantUrl, setRestaurantUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const handleAnalyze = async () => {
    if (!restaurantUrl.trim()) {
      Alert.alert('Error', 'Please enter a Google Maps restaurant link');
      return;
    }

    if (!isValidUrl(restaurantUrl)) {
      Alert.alert('Error', 'Please enter a valid URL link');
      return;
    }

    const parseResult = parseGoogleMapsUrl(restaurantUrl);
    if (!parseResult.isValid) {
      Alert.alert('Error', 'Please enter a valid Google Maps restaurant link');
      return;
    }

    setIsLoading(true);
    try {
      // 导航到分析页面
      navigation.navigate('Analysis', { restaurantUrl });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasteFromClipboard = async () => {
    // Clipboard functionality to be added
    Alert.alert('Info', 'Clipboard feature will be added in future versions');
  };

  const handleOpenHistory = () => {
    navigation.navigate('History');
  };

  const handleHowToUse = () => {
    Alert.alert(
      'How to Use',
      '1. Open Google Maps\n2. Find the restaurant to analyze\n3. Copy the restaurant link\n4. Paste into the input field\n5. Click "Start Analysis" button',
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🕵️ Fake Review Detector</Text>
        <Text style={styles.subtitle}>AI-Powered Restaurant Review Authenticity Analysis</Text>
      </View>

      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Google Maps Restaurant Link:</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Paste Google Maps restaurant link..."
          value={restaurantUrl}
          onChangeText={setRestaurantUrl}
          multiline
          numberOfLines={3}
          autoCapitalize="none"
          keyboardType="url"
        />
        <TouchableOpacity
          style={styles.pasteButton}
          onPress={handlePasteFromClipboard}
        >
          <Text style={styles.pasteButtonText}>📋 Paste from Clipboard</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.analyzeButton, isLoading && styles.buttonDisabled]}
        onPress={handleAnalyze}
        disabled={isLoading}
      >
        <Text style={styles.analyzeButtonText}>
          {isLoading ? '⏳ Analyzing...' : '🔍 Start Analysis'}
        </Text>
      </TouchableOpacity>

      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.actionButton} onPress={handleOpenHistory}>
          <Text style={styles.actionButtonText}>📊 History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleHowToUse}>
          <Text style={styles.actionButtonText}>❓ How to Use</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Key Features:</Text>
        <Text style={styles.infoItem}>• AI-powered review authenticity analysis</Text>
        <Text style={styles.infoItem}>• Display credibility score (0-100)</Text>
        <Text style={styles.infoItem}>• Mark suspicious fake reviews</Text>
        <Text style={styles.infoItem}>• Analyze review patterns and trends</Text>
        <Text style={styles.infoItem}>• Save historical analysis results</Text>
      </View>
    </ScrollView>
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
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
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
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pasteButton: {
    backgroundColor: '#007AFF',
    borderRadius: 6,
    padding: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  pasteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  analyzeButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  actionButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    flex: 0.48,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  infoSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
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
  infoItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default HomeScreen;
