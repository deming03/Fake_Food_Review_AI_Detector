import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar, Platform, Linking } from 'react-native';
import Toast from 'react-native-toast-message';

import HomeScreen from './src/screens/EnhancedHomeScreen';
import AnalysisScreen from './src/screens/EnhancedAnalysisScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import { RootStackParamList } from './src/types';

const Stack = createStackNavigator<RootStackParamList>();

// URL configuration for deep linking
  const prefix = 'truthbite://';

/**
 * Validate if a URL is from Google Maps
 */
const isValidGoogleMapsURL = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Common Google Maps domains
    const validDomains = [
      'maps.google.com',
      'www.google.com',
      'google.com',
      'maps.app.goo.gl',
      'goo.gl'
    ];
    
    // Check if hostname matches any valid Google Maps domain
    const isValidDomain = validDomains.some(domain => 
      hostname === domain || hostname.endsWith('.' + domain)
    );
    
    // Additional check for Google Maps specific paths and parameters
    const path = urlObj.pathname.toLowerCase();
    const search = urlObj.search.toLowerCase();
    
    // Block only truly generic links, but allow restaurant-specific ones
    if (hostname.includes('share.google')) {
      // Allow share.google links as they often redirect to Maps
      console.log('Allowing share.google link (likely Maps redirect)');
      return true;
    }
    
    if (hostname.includes('google.com') && path.includes('/search')) {
      // Allow ALL search URLs with any query parameter
      const hasPlaceId = search.includes('place_id') || 
                        url.includes('#vhid=') || 
                        url.includes('#place/') ||
                        search.includes('ludocid=');
      
      // Allow any search with q parameter (any restaurant/food search)
      const queryParam = urlObj.searchParams.get('q');
      const hasAnyQuery = queryParam && queryParam.trim().length > 0;
      
      if (hasPlaceId || hasAnyQuery) {
        console.log('Allowing search URL:', hasPlaceId ? 'has place ID' : 'has search query');
        return true;
      } else {
        console.log('Blocking search URL without any query');
        return false;
      }
    }
    
    // Check for valid Google Maps paths
    const isGoogleMapsPath = 
      (hostname.includes('maps.google.com')) ||
      (hostname.includes('google.com') && path.includes('/maps/place/')) ||
      (hostname.includes('google.com') && path.includes('/maps') && search.includes('place_id')) ||
      (hostname.includes('goo.gl') && (path.includes('maps') || path.length > 5)) ||
      (hostname.includes('maps.app.goo.gl'));
    
    console.log('URL validation:', {
      url,
      hostname,
      path,
      isValidDomain,
      isGoogleMapsPath,
      result: isValidDomain && isGoogleMapsPath
    });
    
    return isValidDomain && isGoogleMapsPath;
    
  } catch (error) {
    console.error('Error validating URL:', error);
    return false;
  }
};

const App: React.FC = () => {
  useEffect(() => {
    // Handle deep linking when app is already open
    const handleDeepLink = (event: any) => {
      console.log('Deep link received - full event:', event);
      
      // Try different ways to get the URL
      let url = null;
      if (typeof event === 'string') {
        url = event;
      } else if (event && typeof event.url === 'string') {
        url = event.url;
      } else if (event && typeof event === 'object') {
        // Sometimes the URL is nested differently
        url = event.url || event.URL || event.href;
      }
      
      console.log('Extracted URL:', url);
      
      // Only show alerts for actual shortcut usage (contains "/--/analyze")
      if (!url || typeof url !== 'string') {
        console.log('No valid URL - probably just normal Expo opening');
        return;
      }
      
      // Check if this is actually from our shortcut (not just normal Expo opening)
      if (!url.includes('/--/analyze')) {
        console.log('Normal Expo app opening, not from shortcut');
        return;
      }
      
      // This is definitely from our shortcut!
      console.log('🎉 Shortcut detected! Parsing URL:', url);
      
      try {
        const urlParts = url.split('?');
        if (urlParts.length > 1) {
          const urlParams = new URLSearchParams(urlParts[1]);
          const googleMapsUrl = urlParams.get('url');
          if (googleMapsUrl) {
            console.log('Received URL from shortcut:', googleMapsUrl);
            
            // Validate if it's actually a Google Maps URL
            if (isValidGoogleMapsURL(googleMapsUrl)) {
              console.log('✅ Valid Google Maps URL detected');
              alert(`🎉 VALID RESTAURANT LINK!\n\nGoogle Maps URL received:\n${googleMapsUrl}\n\n🤖 Ready for AI analysis!`);
              // TODO: Navigate to analysis screen with this URL
            } else {
              console.log('❌ Not a Google Maps URL');
              alert(`❌ INVALID LINK\n\nThis app only analyzes Google Maps restaurant links.\n\nReceived: ${googleMapsUrl}\n\nPlease share a Google Maps restaurant page instead.`);
            }
          } else {
            console.log('Shortcut worked but no URL parameter');
            alert('🎉 iOS Shortcut Works!\n\nApp opened successfully via automation!\n\n(No URL parameter - check shortcut config)');
          }
        } else {
          alert('🎉 iOS Shortcut Works!\n\nApp opened successfully via automation!');
        }
      } catch (error) {
        console.error('Error parsing shortcut URL:', error);
        alert('🎉 iOS Shortcut Works!\n\nApp opened via automation but URL parsing failed!');
      }
    };

    // Listen for deep links (only NEW shortcut invocations)
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Note: Removed getInitialURL() check to prevent re-processing same URL on reloads
    // The addEventListener above will handle real new shortcut invocations

    return () => {
      subscription?.remove();
    };
  }, []);

  const linking = {
    prefixes: [prefix, 'truthbite://'],
    config: {
      screens: {
        Home: '',
        Analysis: 'analyze',
        Results: 'results',
        History: 'history',
      },
    },
  };

  return (
    <NavigationContainer linking={linking}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#ffffff" 
        translucent={Platform.OS === 'android'}
      />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#ffffff',
            elevation: 2,
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 4,
          },
          headerTintColor: '#333333',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
          headerBackTitle: '',
          cardStyle: { backgroundColor: '#f5f5f5' },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            title: 'TRUTH BITE',
            headerStyle: {
              backgroundColor: '#FF6B35',
            },
            headerTintColor: '#ffffff',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 20,
            },
          }}
        />
        <Stack.Screen 
          name="Analysis" 
          component={AnalysisScreen}
          options={{
            title: 'Revealing Truth...',
            headerLeft: () => null, // Prevent user from going back during analysis
          }}
        />
        <Stack.Screen 
          name="Results" 
          component={ResultsScreen}
          options={{
            title: 'Truth Report',
            headerLeft: () => null, // Prevent user from accidentally returning to analysis page
          }}
        />
        <Stack.Screen 
          name="History" 
          component={HistoryScreen}
          options={{
            title: 'Analysis History',
          }}
        />
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>
  );
};

export default App;
