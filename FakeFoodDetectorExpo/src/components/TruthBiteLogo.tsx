import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Colors } from './EnhancedUI';

export const TruthBiteLogo: React.FC<{ 
  size?: number; 
  showText?: boolean; 
  animated?: boolean;
  variant?: 'light' | 'dark' | 'color';
}> = ({ 
  size = 80, 
  showText = true, 
  animated = true,
  variant = 'color'
}) => {
  const logoColor = variant === 'light' ? '#FFFFFF' : variant === 'dark' ? '#333333' : Colors.primary;

  const LogoImage = () => (
    <View style={[styles.logoImageContainer, { width: size, height: size }]}>
      <Image
        source={require('../../assets/logodesign.png')}
        style={[
          styles.logoImage,
          { 
            width: size, 
            height: size,
            tintColor: variant === 'light' ? undefined : variant === 'dark' ? '#333333' : undefined
          }
        ]}
        resizeMode="contain"
      />
    </View>
  );

  if (animated) {
    return (
      <View style={styles.container}>
        <Animatable.View 
          animation="bounceIn" 
          duration={1000}
          style={styles.logoContainer}
        >
          <LogoImage />
        </Animatable.View>
        {showText && (
          <Animatable.View animation="fadeInUp" delay={500}>
            <Text style={[styles.logoText, { color: logoColor }]}>
              TRUTH BITE
            </Text>
            <Text style={[styles.tagline, { color: variant === 'light' ? '#FFFFFF80' : Colors.textSecondary }]}>
              Real Reviews. Real Trust.
            </Text>
          </Animatable.View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <LogoImage />
      </View>
      {showText && (
        <View>
          <Text style={[styles.logoText, { color: logoColor }]}>
            TRUTH BITE
          </Text>
          <Text style={[styles.tagline, { color: variant === 'light' ? '#FFFFFF80' : Colors.textSecondary }]}>
            Real Reviews. Real Trust.
          </Text>
        </View>
      )}
    </View>
  );
};

// Compact logo for headers
export const TruthBiteHeader: React.FC<{ size?: number }> = ({ size = 40 }) => {
  return (
    <View style={styles.headerContainer}>
      <Image
        source={require('../../assets/logodesign.png')}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
      <Text style={styles.headerText}>TRUTH BITE</Text>
    </View>
  );
};

// Icon only for small spaces
export const TruthBiteIcon: React.FC<{ size?: number; variant?: 'light' | 'dark' | 'color' }> = ({ 
  size = 32, 
  variant = 'color' 
}) => {
  return (
    <Image
      source={require('../../assets/logodesign.png')}
      style={[
        { 
          width: size, 
          height: size,
          tintColor: variant === 'light' ? undefined : variant === 'dark' ? '#333333' : undefined
        }
      ]}
      resizeMode="contain"
    />
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 8,
  },
  logoImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  logoImage: {
    borderRadius: 8,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginLeft: 8,
  },
});
