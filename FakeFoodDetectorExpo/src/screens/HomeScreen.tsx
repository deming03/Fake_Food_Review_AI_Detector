import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { RootStackParamList } from '../types';
import { parseGoogleMapsUrl, isValidUrl } from '../utils/helpers';
import { useAuth } from '../contexts/AuthContext';
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

interface Restaurant {
  id: string;
  name: string;
  rating: number;
  address: string;
}

interface Location {
  latitude: number;
  longitude: number;
}

interface SelectedRestaurant {
  id?: number;
  name?: string;
  latitude: number;
  longitude: number;
  rating?: number;
  type?: string;
}

const HomeScreen: React.FC = () => {
  const [restaurantUrl, setRestaurantUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<SelectedRestaurant | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'link' | 'search' | 'map'>('link');
  const [searchResults, setSearchResults] = useState<Restaurant[]>([]);
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user, logout } = useAuth();

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

  const handleLogout = () => {
    Alert.alert(
      '🚪 Sign Out',
      `Are you sure you want to sign out${user?.name ? `, ${user.name}` : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              showToast.success('Successfully signed out!');
            } catch (error) {
              showToast.error('Failed to sign out');
            }
          }
        }
      ]
    );
  };

  const handleSearchRestaurants = async () => {
    if (!searchQuery.trim()) {
      showToast.error('Please enter a restaurant name');
      return;
    }

    setIsLoading(true);
    try {
      // Mock search results - in real app, this would call Places API
      const mockResults = [
        { id: '1', name: `${searchQuery} - Downtown`, rating: 4.5, address: '123 Main St' },
        { id: '2', name: `${searchQuery} - Mall`, rating: 4.2, address: '456 Oak Ave' },
        { id: '3', name: `${searchQuery} - Uptown`, rating: 3.9, address: '789 Pine Rd' },
      ];
      setSearchResults(mockResults);
      showToast.success(`Found ${mockResults.length} restaurants!`);
    } catch (error) {
      showToast.error('Failed to search restaurants');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFromMap = (selection: SelectedRestaurant) => {
    setSelectedLocation(selection);
    if (selection.name) {
      showToast.success(`${selection.name} selected! Ready to analyze.`);
    } else {
      showToast.success('Location selected! Ready to analyze.');
    }
  };

  const handleAnalyzeFromMethod = async () => {
    setIsLoading(true);
    
    try {
      let analysisData;
      
      if (activeTab === 'link' && restaurantUrl.trim()) {
        if (!isValidUrl(restaurantUrl)) {
          showToast.error('Please enter a valid URL link');
          return;
        }
        const parseResult = parseGoogleMapsUrl(restaurantUrl);
        if (!parseResult.isValid) {
          showToast.error('Please enter a valid Google Maps restaurant link');
          return;
        }
        analysisData = { restaurantUrl };
      } else if (activeTab === 'search' && searchQuery.trim() && searchResults.length > 0) {
        // For search, we'll create a mock restaurant URL for now
        const selectedRestaurant = searchResults[0];
        analysisData = { 
          restaurantUrl: `https://maps.google.com/?cid=mock_${selectedRestaurant.id}`,
          restaurantName: selectedRestaurant.name
        };
      } else if (activeTab === 'map' && selectedLocation) {
        // For map selection, create a mock restaurant URL with coordinates
        analysisData = { 
          restaurantUrl: `https://maps.google.com/?q=${selectedLocation.latitude},${selectedLocation.longitude}`,
          coordinates: selectedLocation
        };
      } else {
        showToast.error('Please select a restaurant to analyze');
        return;
      }

      navigation.navigate('Analysis', analysisData);
    } catch (error) {
      showToast.error('Failed to start analysis');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Welcome Header */}
      <Animatable.View animation="fadeInDown" style={styles.welcomeHeader}>
        <Text style={styles.welcomeText}>Welcome back, {user?.name || 'User'}! 👋</Text>
        <Text style={styles.subtitleText}>Find and analyze restaurants with AI</Text>
      </Animatable.View>

      {/* Search Method Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'link' && styles.activeTab]}
          onPress={() => setActiveTab('link')}
        >
          <Ionicons name="link-outline" size={20} color={activeTab === 'link' ? 'white' : Colors.primary} />
          <Text style={[styles.tabText, activeTab === 'link' && styles.activeTabText]}>Link</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'search' && styles.activeTab]}
          onPress={() => setActiveTab('search')}
        >
          <Ionicons name="search-outline" size={20} color={activeTab === 'search' ? 'white' : Colors.primary} />
          <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>Search</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'map' && styles.activeTab]}
          onPress={() => setActiveTab('map')}
        >
          <Ionicons name="map-outline" size={20} color={activeTab === 'map' ? 'white' : Colors.primary} />
          <Text style={[styles.tabText, activeTab === 'map' && styles.activeTabText]}>Map</Text>
        </TouchableOpacity>
      </View>

      {/* Search Content Based on Active Tab */}
      <Animatable.View 
        key={activeTab} 
        animation="fadeIn" 
        duration={300} 
        style={styles.searchContent}
      >
        {activeTab === 'link' && (
          <ModernCard 
            title="🔗 Google Maps Link" 
            subtitle="Paste restaurant link from Google Maps"
            icon="link"
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
        )}

        {activeTab === 'search' && (
          <ModernCard 
            title="🔍 Search by Name" 
            subtitle="Search and select restaurant by name"
            icon="search"
          >
            <EnhancedTextInput
              placeholder="Enter restaurant name..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              icon="restaurant-outline"
            />
            <View style={styles.inputActions}>
              <AnimatedButton
                title="Search"
                onPress={handleSearchRestaurants}
                variant="outline"
                icon="search"
                loading={isLoading && activeTab === 'search'}
              />
            </View>
            
            {searchResults.length > 0 && (
              <View style={styles.searchResults}>
                <Text style={styles.resultsTitle}>Found Restaurants:</Text>
                {searchResults.map((restaurant) => (
                  <TouchableOpacity
                    key={restaurant.id}
                    style={styles.resultItem}
                    onPress={() => showToast.info(`Selected: ${restaurant.name}`)}
                  >
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultName}>{restaurant.name}</Text>
                      <Text style={styles.resultAddress}>{restaurant.address}</Text>
                    </View>
                    <View style={styles.resultRating}>
                      <Ionicons name="star" size={16} color="#FFD700" />
                      <Text style={styles.ratingText}>{restaurant.rating}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ModernCard>
        )}

        {activeTab === 'map' && (
          <ModernCard 
            title="🗺️ Restaurant Map" 
            subtitle="Swipe map & click restaurants to analyze"
            icon="map"
          >
            <View style={styles.mapContainer}>
              <WebView
                style={styles.webMap}
                source={{
                  html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                            body, html { 
                                margin: 0; 
                                padding: 0; 
                                height: 100%; 
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                position: relative;
                            }
                            .map-container { 
                                height: 100%; 
                                width: 100%; 
                                position: relative;
                            }
                            .google-map {
                                width: 100%;
                                height: 100%;
                                border: none;
                            }
                            .restaurant-overlay {
                                position: absolute;
                                top: 10px;
                                left: 10px;
                                right: 10px;
                                background: rgba(255, 255, 255, 0.95);
                                border-radius: 8px;
                                padding: 10px;
                                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                                z-index: 1000;
                                max-height: 120px;
                                overflow-y: auto;
                            }
                            .restaurant-list {
                                display: flex;
                                flex-direction: column;
                                gap: 8px;
                            }
                            .restaurant-item {
                                display: flex;
                                align-items: center;
                                justify-content: space-between;
                                padding: 8px;
                                background: #f8f9fa;
                                border-radius: 6px;
                                cursor: pointer;
                                transition: all 0.2s;
                            }
                            .restaurant-item:hover {
                                background: #FF6B35;
                                color: white;
                                transform: scale(1.02);
                            }
                            .restaurant-item.selected {
                                background: #28a745;
                                color: white;
                            }
                            .restaurant-info {
                                display: flex;
                                flex-direction: column;
                                flex: 1;
                            }
                            .restaurant-name {
                                font-weight: bold;
                                font-size: 14px;
                            }
                            .restaurant-details {
                                font-size: 12px;
                                opacity: 0.8;
                            }
                            .select-btn {
                                background: #FF6B35;
                                color: white;
                                border: none;
                                padding: 4px 8px;
                                border-radius: 4px;
                                font-size: 12px;
                                cursor: pointer;
                            }
                            .selected .select-btn {
                                background: white;
                                color: #28a745;
                            }
                            .map-toggle {
                                position: absolute;
                                bottom: 10px;
                                right: 10px;
                                background: #FF6B35;
                                color: white;
                                border: none;
                                padding: 8px 12px;
                                border-radius: 20px;
                                font-size: 12px;
                                cursor: pointer;
                                z-index: 1001;
                                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                            }
                        </style>
                    </head>
                    <body>
                        <div class="map-container">
                            <!-- Google Maps Embed (No API Key Required) -->
                            <iframe 
                                class="google-map"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d50623.97744683817!2d-122.46743158134768!3d37.77490577520967!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80859a6d00690021%3A0x4a501367f076adff!2sSan%20Francisco%2C%20CA%2C%20USA!5e0!3m2!1sen!2sus!4v1697887434567!5m2!1sen!2sus"
                                allowfullscreen="" 
                                loading="lazy" 
                                referrerpolicy="no-referrer-when-downgrade">
                            </iframe>
                            
                            <!-- Restaurant Selection Overlay -->
                            <div class="restaurant-overlay">
                                <div class="restaurant-list" id="restaurantList">
                                    <!-- Restaurants will be populated by JavaScript -->
                                </div>
                            </div>
                            
                            <button class="map-toggle" onclick="toggleMapView()">Switch View</button>
                        </div>
                        
                        <script>
                            let selectedRestaurant = null;
                            
                            // San Francisco Restaurants
                            const restaurants = [
                                { 
                                    id: 1, 
                                    name: "Golden Gate Bistro", 
                                    lat: 37.7749, 
                                    lng: -122.4194, 
                                    rating: 4.5,
                                    type: "American Cuisine",
                                    embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3154.0127!2d-122.4194!3d37.7749!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80858064!2sGolden%20Gate%20Bistro!5e0!3m2!1sen!2sus!4v1697887434567!5m2!1sen!2sus"
                                },
                                { 
                                    id: 2, 
                                    name: "Fisherman's Wharf Seafood", 
                                    lat: 37.8080, 
                                    lng: -122.4177, 
                                    rating: 4.2,
                                    type: "Seafood Restaurant",
                                    embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3152.8127!2d-122.4177!3d37.8080!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80858064!2sFishermans%20Wharf!5e0!3m2!1sen!2sus!4v1697887434567!5m2!1sen!2sus"
                                },
                                { 
                                    id: 3, 
                                    name: "Union Square Cafe", 
                                    lat: 37.7879, 
                                    lng: -122.4075, 
                                    rating: 4.7,
                                    type: "Italian Dining",
                                    embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.2127!2d-122.4075!3d37.7879!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80858064!2sUnion%20Square!5e0!3m2!1sen!2sus!4v1697887434567!5m2!1sen!2sus"
                                },
                                { 
                                    id: 4, 
                                    name: "Mission District Tacos", 
                                    lat: 37.7599, 
                                    lng: -122.4148, 
                                    rating: 4.3,
                                    type: "Mexican Food",
                                    embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3154.8127!2d-122.4148!3d37.7599!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80858064!2sMission%20District!5e0!3m2!1sen!2sus!4v1697887434567!5m2!1sen!2sus"
                                }
                            ];
                            
                            function initRestaurantList() {
                                const listContainer = document.getElementById('restaurantList');
                                
                                restaurants.forEach(restaurant => {
                                    const item = document.createElement('div');
                                    item.className = 'restaurant-item';
                                    item.onclick = () => selectRestaurant(restaurant);
                                    
                                    item.innerHTML = \`
                                        <div class="restaurant-info">
                                            <div class="restaurant-name">🍽️ \${restaurant.name}</div>
                                            <div class="restaurant-details">⭐ \${restaurant.rating}/5 • \${restaurant.type}</div>
                                        </div>
                                        <button class="select-btn">Select</button>
                                    \`;
                                    
                                    listContainer.appendChild(item);
                                });
                            }
                            
                            function selectRestaurant(restaurant) {
                                // Remove previous selection
                                document.querySelectorAll('.restaurant-item').forEach(item => {
                                    item.classList.remove('selected');
                                });
                                
                                // Mark as selected
                                event.currentTarget.classList.add('selected');
                                selectedRestaurant = restaurant;
                                
                                // Update map to show restaurant location
                                const mapIframe = document.querySelector('.google-map');
                                mapIframe.src = restaurant.embedUrl;
                                
                                // Send to React Native
                                window.ReactNativeWebView.postMessage(JSON.stringify({
                                    type: 'restaurantSelected',
                                    id: restaurant.id,
                                    name: restaurant.name,
                                    latitude: restaurant.lat,
                                    longitude: restaurant.lng,
                                    rating: restaurant.rating,
                                    type: restaurant.type
                                }));
                            }
                            
                            let viewIndex = 0;
                            const mapViews = [
                                "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d50623.97744683817!2d-122.46743158134768!3d37.77490577520967!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80859a6d00690021%3A0x4a501367f076adff!2sSan%20Francisco%2C%20CA%2C%20USA!5e0!3m2!1sen!2sus!4v1697887434567!5m2!1sen!2sus",
                                "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12656.018905957537!2d-122.42290485954279!3d37.77492877426654!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80859a6d00690021%3A0x4a501367f076adff!2sDowntown%20San%20Francisco!5e1!3m2!1sen!2sus!4v1697887434567!5m2!1sen!2sus"
                            ];
                            
                            function toggleMapView() {
                                viewIndex = (viewIndex + 1) % mapViews.length;
                                document.querySelector('.google-map').src = mapViews[viewIndex];
                            }
                            
                            // Initialize on load
                            window.onload = initRestaurantList;
                        </script>
                    </body>
                    </html>
                  `
                }}
                onMessage={(event) => {
                  try {
                    const data = JSON.parse(event.nativeEvent.data);
                    if (data.type === 'restaurantSelected') {
                      handleSelectFromMap({
                        id: data.id,
                        name: data.name,
                        latitude: data.latitude,
                        longitude: data.longitude,
                        rating: data.rating,
                        type: data.type
                      });
                    }
                  } catch (error) {
                    console.log('Error parsing map message:', error);
                  }
                }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                renderLoading={() => (
                  <View style={styles.mapLoading}>
                    <Ionicons name="map" size={40} color={Colors.primary} />
                    <Text style={styles.mapLoadingText}>Loading Interactive Map...</Text>
                  </View>
                )}
              />
            </View>
            <View style={styles.mapInstructions}>
              <Ionicons name="list" size={16} color={Colors.primary} />
              <Text style={styles.mapInstructionsText}>
                🍽️ Select restaurants from the overlay list above the Google Map
              </Text>
            </View>
            {selectedLocation && (
              <View style={styles.selectedLocationInfo}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                <View style={styles.locationDetails}>
                  {selectedLocation.name ? (
                    <>
                      <Text style={styles.restaurantName}>{selectedLocation.name}</Text>
                      <Text style={styles.restaurantType}>
                        {selectedLocation.type} • ⭐ {selectedLocation.rating}/5.0
                      </Text>
                      <Text style={styles.coordinates}>
                        📍 {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.locationText}>
                      Custom Location: {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
                    </Text>
                  )}
                </View>
                <TouchableOpacity 
                  style={styles.clearLocationButton}
                  onPress={() => setSelectedLocation(null)}
                >
                  <Ionicons name="close-circle" size={20} color={Colors.error} />
                </TouchableOpacity>
              </View>
            )}
          </ModernCard>
        )}
      </Animatable.View>

      {/* Analysis Button */}
      <View style={styles.analysisSection}>
        <AnimatedButton
          title="🔍 Analyze Restaurant"
          onPress={handleAnalyzeFromMethod}
          loading={isLoading}
          disabled={isLoading}
          icon="analytics"
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <View style={styles.quickActions}>
          <AnimatedButton
            title="Analysis History"
            onPress={handleOpenHistory}
            variant="outline"
            icon="time-outline"
          />
          <AnimatedButton
            title="How to Use"
            onPress={handleHowToUse}
            variant="outline"
            icon="help-circle-outline"
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  welcomeHeader: {
    padding: 20,
    paddingTop: 10,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitleText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#f8f8f8',
    borderRadius: 25,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  activeTab: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  activeTabText: {
    color: 'white',
  },
  searchContent: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  inputActions: {
    marginTop: 15,
    alignItems: 'center',
  },
  analysisSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchResults: {
    marginTop: 20,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 10,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  resultAddress: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  resultRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  mapContainer: {
    marginTop: 15,
    borderRadius: 12,
    overflow: 'hidden',
    height: 300,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  webMap: {
    flex: 1,
    borderRadius: 10,
  },
  mapLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    gap: 10,
  },
  mapLoadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  mapInstructions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
    padding: 8,
    backgroundColor: '#e8f4fd',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  mapInstructionsText: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  selectedLocationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
    padding: 12,
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.success,
  },
  locationDetails: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 2,
  },
  restaurantType: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  coordinates: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  locationText: {
    fontSize: 14,
    color: Colors.text,
  },
  clearLocationButton: {
    padding: 4,
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
});

export default HomeScreen;