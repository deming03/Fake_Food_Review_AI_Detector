import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar, Platform, Linking } from 'react-native';

import HomeScreen from './src/screens/HomeScreen';
import AnalysisScreen from './src/screens/AnalysisScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import { RootStackParamList } from './src/types';

const Stack = createStackNavigator<RootStackParamList>();

// URL configuration for deep linking
const prefix = 'fakefooddetector://';

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
            console.log('Google Maps URL from shortcut:', googleMapsUrl);
            alert(`🎉 SHORTCUT SUCCESS!\n\nReceived restaurant URL:\n${googleMapsUrl}`);
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
    prefixes: [prefix, 'fakefooddetector://'],
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
            title: 'Fake Review Detector',
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
            title: 'Analyzing',
            headerLeft: () => null, // Prevent user from going back during analysis
          }}
        />
        <Stack.Screen 
          name="Results" 
          component={ResultsScreen}
          options={{
            title: 'Analysis Results',
            headerLeft: () => null, // Prevent user from accidentally returning to analysis page
          }}
        />
        <Stack.Screen 
          name="History" 
          component={HistoryScreen}
          options={{
            title: 'History',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
