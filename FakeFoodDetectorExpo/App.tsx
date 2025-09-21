import React, { useEffect } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, Platform, Linking, View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

// Authentication
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';

// Main App Screens
import HomeScreen from './src/screens/HomeScreen';
import AnalysisScreen from './src/screens/AnalysisScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';

import { RootStackParamList, AuthStackParamList } from './src/types';
import { Colors, showToast } from './src/components/EnhancedUI';

const AuthStack = createStackNavigator<AuthStackParamList>();
const MainStack = createStackNavigator<RootStackParamList>();
const BottomTab = createBottomTabNavigator();

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

// Loading Component
const LoadingScreen: React.FC = () => (
  <View style={{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  }}>
    <ActivityIndicator size="large" color={Colors.primary} />
    <Text style={{
      marginTop: 20,
      fontSize: 16,
      color: Colors.textSecondary,
    }}>Loading TRUTH BITE...</Text>
  </View>
);

// Authentication Stack Navigator
const AuthNavigator: React.FC = () => (
  <AuthStack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: Colors.background },
    }}
  >
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
    <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </AuthStack.Navigator>
);

// Main App Stack Navigator (for authenticated users)
const MainNavigator: React.FC = () => {
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      showToast.success('Successfully signed out!');
    } catch (error) {
      console.error('Logout error:', error);
      showToast.error('Failed to sign out');
    }
  };


  const LogoutButton = () => (
    <TouchableOpacity 
      style={{ 
        marginRight: 15, 
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 25,
        backgroundColor: '#FF6B35',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        minWidth: 44,
        minHeight: 44,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onPress={handleLogout}
      activeOpacity={0.8}
    >
      <Ionicons name="log-out-outline" size={20} color="white" />
    </TouchableOpacity>
  );


  // Bottom Tab Navigator for main screens
  const BottomTabNavigator = () => (
    <BottomTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          height: 70,
          borderRadius: 35,
          marginHorizontal: 20,
          marginBottom: 30,
          position: 'absolute',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 12,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.3)',
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 5,
        },
      }}
    >
      <BottomTab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <BottomTab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />
      <BottomTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <BottomTab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </BottomTab.Navigator>
  );

  return (
    <MainStack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#f5f5f5' },
      }}
    >
      <MainStack.Screen 
        name="MainTabs" 
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      />
      <MainStack.Screen 
        name="Analysis" 
        component={AnalysisScreen}
        options={{
          headerShown: true,
          title: 'Revealing Truth...',
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
          headerRight: () => <LogoutButton />,
        }}
      />
      <MainStack.Screen 
        name="Results" 
        component={ResultsScreen}
        options={{
          headerShown: true,
          title: 'Truth Report',
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
          headerRight: () => <LogoutButton />,
        }}
      />
    </MainStack.Navigator>
  );
};


// Main App Navigation Component (handles auth state)
const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Only handle deep linking for authenticated users
    if (!isAuthenticated) return;

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
  }, [isAuthenticated]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? <MainNavigator /> : <AuthNavigator />;
};

// Root App Component with Authentication Provider
const App: React.FC = () => {
  const linking = {
    prefixes: [prefix, 'truthbite://'],
    config: {
      screens: {
        Login: 'login',
        Register: 'register',
        ForgotPassword: 'forgot-password',
        Home: '',
        Analysis: 'analyze',
        Results: 'results',
        History: 'history',
        Profile: 'profile',
        Settings: 'settings',
      },
    },
  };

  return (
    <AuthProvider>
      <NavigationContainer linking={linking}>
        <StatusBar 
          barStyle="dark-content" 
          backgroundColor="#ffffff" 
          translucent={Platform.OS === 'android'}
        />
        <AppNavigator />
        <Toast />
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
