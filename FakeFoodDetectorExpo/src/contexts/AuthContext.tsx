import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'google' | 'email';
  preferences?: {
    analysisSettings?: {
      sensitivity: 'low' | 'medium' | 'high';
      autoAnalyze: boolean;
    };
    notifications?: {
      resultsReady: boolean;
      weeklyReports: boolean;
    };
  };
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored auth on app start
  useEffect(() => {
    checkStoredAuth();
  }, []);

  const checkStoredAuth = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const storedToken = await AsyncStorage.getItem('auth_token');
      
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error checking stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Email/password login
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await authAPI.login(email, password);
      
      // Mock login for now
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockUser: User = {
        id: 'user_' + Date.now(),
        email,
        name: email.split('@')[0],
        provider: 'email',
        preferences: {
          analysisSettings: {
            sensitivity: 'medium',
            autoAnalyze: true,
          },
          notifications: {
            resultsReady: true,
            weeklyReports: false,
          },
        },
      };

      // Store user and token
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      await AsyncStorage.setItem('auth_token', 'mock_token_' + Date.now());
      
      setUser(mockUser);
    } catch (error) {
      throw new Error('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  // Google login
  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement Google OAuth
      // const response = await GoogleSignin.signIn();
      
      // Mock Google login for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockUser: User = {
        id: 'google_user_' + Date.now(),
        email: 'user@gmail.com',
        name: 'Google User',
        avatar: 'https://via.placeholder.com/100',
        provider: 'google',
        preferences: {
          analysisSettings: {
            sensitivity: 'medium',
            autoAnalyze: true,
          },
          notifications: {
            resultsReady: true,
            weeklyReports: true,
          },
        },
      };

      // Store user and token
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      await AsyncStorage.setItem('auth_token', 'google_token_' + Date.now());
      
      setUser(mockUser);
    } catch (error) {
      throw new Error('Google login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Registration
  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await authAPI.register(email, password, name);
      
      // Mock registration for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newUser: User = {
        id: 'new_user_' + Date.now(),
        email,
        name,
        provider: 'email',
        preferences: {
          analysisSettings: {
            sensitivity: 'medium',
            autoAnalyze: false,
          },
          notifications: {
            resultsReady: true,
            weeklyReports: false,
          },
        },
      };

      // Store user and token
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      await AsyncStorage.setItem('auth_token', 'new_token_' + Date.now());
      
      setUser(newUser);
    } catch (error) {
      throw new Error('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('auth_token');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Update profile
  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    
    try {
      const updatedUser = { ...user, ...updates };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Profile update error:', error);
      throw new Error('Failed to update profile');
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    loginWithGoogle,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
