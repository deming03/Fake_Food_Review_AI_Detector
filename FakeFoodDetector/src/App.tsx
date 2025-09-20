import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar, Platform } from 'react-native';

import HomeScreen from './screens/HomeScreen';
import AnalysisScreen from './screens/AnalysisScreen';
import ResultsScreen from './screens/ResultsScreen';
import HistoryScreen from './screens/HistoryScreen';
import { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <NavigationContainer>
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
          headerBackTitleVisible: false,
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
