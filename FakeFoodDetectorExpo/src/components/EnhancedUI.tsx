import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

// 🎨 Dark Mode Color Palette
export const DarkColors = {
  primary: '#00D9FF',      // Electric cyan
  primaryLight: '#33E1FF',
  primaryDark: '#00BFE6',
  secondary: '#7C3AED',    // Purple tech
  secondaryLight: '#A78BFA',
  accent: '#FF0080',       // Neon pink
  success: '#00E676',      // Electric green
  warning: '#FFB300',
  error: '#FF1744',
  background: '#0A0B0F',   // Dark tech background
  surface: '#1A1D23',     // Dark surface
  surfaceLight: '#252932', // Lighter surface
  text: '#FFFFFF',         // White text
  textSecondary: '#A0A8B8', // Light gray
  textLight: '#6B7280',    // Dimmed text
  shadow: 'rgba(0, 0, 0, 0.4)',
  cardBorder: '#2D3748',   // Subtle border
  glow: 'rgba(0, 217, 255, 0.3)', // Cyan glow
};

// 🌅 Light Mode Color Palette
export const LightColors = {
  primary: '#0080FF',      // Professional blue
  primaryLight: '#3399FF',
  primaryDark: '#0066CC',
  secondary: '#6366F1',    // Indigo
  secondaryLight: '#818CF8',
  accent: '#F59E0B',       // Amber
  success: '#10B981',      // Emerald
  warning: '#F59E0B',
  error: '#EF4444',
  background: '#F8FAFC',   // Light background
  surface: '#FFFFFF',      // White surface
  surfaceLight: '#F1F5F9', // Light gray surface
  text: '#1F2937',         // Dark text
  textSecondary: '#6B7280', // Gray text
  textLight: '#9CA3AF',    // Light gray text
  shadow: 'rgba(0, 0, 0, 0.1)',
  cardBorder: '#E5E7EB',   // Light border
  glow: 'rgba(0, 128, 255, 0.2)', // Blue glow
};

// 🎨 Dynamic Colors - Export based on theme
export let Colors = DarkColors; // Default to dark mode

export const updateTheme = (isDarkMode: boolean) => {
  Colors = isDarkMode ? DarkColors : LightColors;
};

// 🎭 Animated Button Component
export const AnimatedButton: React.FC<{
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
}> = ({ title, onPress, variant = 'primary', icon, loading = false, disabled = false }) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return [styles.button, styles.secondaryButton];
      case 'outline':
        return [styles.button, styles.outlineButton];
      default:
        return [styles.button, styles.primaryButton];
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return [styles.buttonText, styles.outlineButtonText];
      default:
        return [styles.buttonText, styles.primaryButtonText];
    }
  };

  return (
    <Animatable.View animation="fadeInUp" duration={600}>
      <TouchableOpacity
        style={[getButtonStyle(), disabled && styles.disabledButton]}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <Animatable.View animation="rotate" iterationCount="infinite">
            <Ionicons name="refresh" size={20} color="white" />
          </Animatable.View>
        ) : (
          <View style={styles.buttonContent}>
            {icon && <Ionicons name={icon as any} size={20} color={variant === 'outline' ? Colors.primary : 'white'} />}
            <Text style={[getTextStyle(), icon && { marginLeft: 8 }]}>{title}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animatable.View>
  );
};

// 📱 Enhanced Input Field
export const EnhancedTextInput: React.FC<{
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  icon?: string;
  multiline?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}> = ({ placeholder, value, onChangeText, icon, multiline = false, onFocus, onBlur }) => {
  return (
    <Animatable.View animation="fadeInUp" duration={600} style={styles.inputContainer}>
      {icon && (
        <View style={styles.inputIcon}>
          <Ionicons name={icon as any} size={20} color={Colors.textSecondary} />
        </View>
      )}
      <TextInput
        style={[styles.textInput, icon && styles.textInputWithIcon, multiline && styles.multilineInput]}
        placeholder={placeholder}
        placeholderTextColor={Colors.textLight}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </Animatable.View>
  );
};

// 🏷️ Modern Card Component
export const ModernCard: React.FC<{
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  icon?: string;
  onPress?: () => void;
  variant?: 'default' | 'highlighted' | 'warning' | 'success';
}> = ({ title, subtitle, children, icon, onPress, variant = 'default' }) => {
  const getCardStyle = () => {
    switch (variant) {
      case 'highlighted':
        return [styles.card, styles.highlightedCard];
      case 'warning':
        return [styles.card, styles.warningCard];
      case 'success':
        return [styles.card, styles.successCard];
      default:
        return styles.card;
    }
  };

  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <Animatable.View animation="fadeInUp" duration={600}>
      <CardWrapper style={getCardStyle()} onPress={onPress} activeOpacity={0.9}>
        {(title || icon) && (
          <View style={styles.cardHeader}>
            {icon && <Ionicons name={icon as any} size={24} color={Colors.primary} />}
            <View style={styles.cardHeaderText}>
              {title && <Text style={styles.cardTitle}>{title}</Text>}
              {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
            </View>
          </View>
        )}
        <View style={styles.cardContent}>
          {children}
        </View>
      </CardWrapper>
    </Animatable.View>
  );
};

// 🏷️ Status Badge Component
export const StatusBadge: React.FC<{
  text: string;
  status: 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium' | 'large';
}> = ({ text, status, size = 'medium' }) => {
  const getBadgeStyle = () => {
    const baseStyle = size === 'small' ? styles.badgeSmall : size === 'large' ? styles.badgeLarge : styles.badge;
    switch (status) {
      case 'success':
        return [baseStyle, styles.successBadge];
      case 'warning':
        return [baseStyle, styles.warningBadge];
      case 'error':
        return [baseStyle, styles.errorBadge];
      default:
        return [baseStyle, styles.infoBadge];
    }
  };

  const getTextStyle = () => {
    return size === 'small' ? styles.badgeTextSmall : size === 'large' ? styles.badgeTextLarge : styles.badgeText;
  };

  return (
    <Animatable.View animation="bounceIn" style={getBadgeStyle()}>
      <Text style={getTextStyle()}>{text}</Text>
    </Animatable.View>
  );
};

// 🌟 Rating Stars Component
export const RatingStars: React.FC<{
  rating: number;
  size?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}> = ({ rating, size = 20, interactive = false, onRatingChange }) => {
  const handleStarPress = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  return (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= rating;
        const StarComponent = interactive ? TouchableOpacity : View;
        
        return (
          <StarComponent
            key={star}
            onPress={() => handleStarPress(star)}
            activeOpacity={0.7}
          >
            <Animatable.View animation="bounceIn" delay={star * 100}>
              <Ionicons
                name={filled ? "star" : "star-outline"}
                size={size}
                color={filled ? "#FFD700" : Colors.textLight}
              />
            </Animatable.View>
          </StarComponent>
        );
      })}
    </View>
  );
};

// 🎯 Toast Notifications
export const showToast = {
  success: (message: string) => {
    Toast.show({
      type: 'success',
      text1: 'Success! 🎉',
      text2: message,
      visibilityTime: 3000,
    });
  },
  error: (message: string) => {
    Toast.show({
      type: 'error',
      text1: 'Error! ❌',
      text2: message,
      visibilityTime: 4000,
    });
  },
  info: (message: string) => {
    Toast.show({
      type: 'info',
      text1: 'Info 💡',
      text2: message,
      visibilityTime: 3000,
    });
  },
  warning: (message: string) => {
    Toast.show({
      type: 'warning',
      text1: 'Warning ⚠️',
      text2: message,
      visibilityTime: 3500,
    });
  },
};

const styles = StyleSheet.create({
  // Button Styles
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    marginVertical: 8,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.secondary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  disabledButton: {
    backgroundColor: Colors.textLight,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  primaryButtonText: {
    color: 'white',
  },
  outlineButtonText: {
    color: Colors.primary,
  },

  // Input Styles
  inputContainer: {
    position: 'relative',
    marginVertical: 8,
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    top: 16,
    zIndex: 1,
  },
  textInput: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    color: Colors.text,
  },
  textInputWithIcon: {
    paddingLeft: 50,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },

  // Card Styles
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  highlightedCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  warningCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  successCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  cardContent: {
    // Content styling
  },

  // Badge Styles
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeLarge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  successBadge: {
    backgroundColor: Colors.success,
  },
  warningBadge: {
    backgroundColor: Colors.warning,
  },
  errorBadge: {
    backgroundColor: Colors.error,
  },
  infoBadge: {
    backgroundColor: Colors.secondary,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  badgeTextSmall: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  badgeTextLarge: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Stars Styles
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
