import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useAuth } from '../contexts/AuthContext';
import { TruthBiteLogo } from './TruthBiteLogo';
import { Colors, showToast } from './EnhancedUI';

const { width, height } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.8;

interface SideDrawerProps {
  isVisible: boolean;
  onClose: () => void;
  navigation: any;
}

interface MenuItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  iconColor?: string;
  delay?: number;
}

const MenuItem: React.FC<MenuItemProps> = ({ 
  icon, 
  title, 
  subtitle, 
  onPress, 
  iconColor = Colors.primary,
  delay = 0 
}) => (
  <Animatable.View 
    animation="fadeInLeft" 
    delay={delay}
    style={styles.menuItem}
  >
    <TouchableOpacity style={styles.menuButton} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIconContainer, { backgroundColor: `${iconColor}15` }]}>
        <Ionicons name={icon as any} size={22} color={iconColor} />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
    </TouchableOpacity>
  </Animatable.View>
);

const SideDrawer: React.FC<SideDrawerProps> = ({ isVisible, onClose, navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
      showToast.success('Successfully signed out!');
    } catch (error) {
      showToast.error('Failed to sign out');
    }
  };

  const handleNavigate = (screen: string) => {
    onClose();
    navigation.navigate(screen);
  };

  const menuItems = [
    {
      icon: 'home-outline',
      title: 'Home',
      subtitle: 'Main dashboard',
      onPress: () => handleNavigate('Home'),
      iconColor: Colors.primary,
    },
    {
      icon: 'restaurant-outline',
      title: 'Check Restaurant',
      subtitle: 'Analyze restaurant reviews',
      onPress: () => handleNavigate('Home'),
      iconColor: Colors.success,
    },
    {
      icon: 'time-outline',
      title: 'Analysis History',
      subtitle: 'View past results',
      onPress: () => handleNavigate('History'),
      iconColor: Colors.warning,
    },
    {
      icon: 'person-outline',
      title: 'Profile',
      subtitle: 'Account settings',
      onPress: () => handleNavigate('Profile'),
      iconColor: Colors.info,
    },
    {
      icon: 'settings-outline',
      title: 'Settings',
      subtitle: 'App preferences',
      onPress: () => handleNavigate('Settings'),
      iconColor: Colors.textSecondary,
    },
  ];

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <Animated.View style={styles.backdrop}>
        <TouchableOpacity 
          style={styles.backdropTouch} 
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Drawer */}
      <Animatable.View
        animation="slideInLeft"
        duration={300}
        easing="ease-out"
        style={styles.drawer}
      >
        <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.5)" />
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TruthBiteLogo size={40} showText={false} variant="light" />
            <View style={styles.headerText}>
              <Text style={styles.appName}>TRUTH BITE</Text>
              <Text style={styles.appSubtitle}>Restaurant Review Detector</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* User Info */}
        <Animatable.View animation="fadeInLeft" delay={100} style={styles.userSection}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {(user?.name || 'User').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
          </View>
        </Animatable.View>

        {/* Menu Items */}
        <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>NAVIGATION</Text>
            {menuItems.map((item, index) => (
              <MenuItem
                key={item.title}
                {...item}
                delay={200 + index * 100}
              />
            ))}
          </View>

          {/* Quick Actions */}
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
            
            <MenuItem
              icon="help-circle-outline"
              title="How to Use"
              subtitle="Learn how to analyze reviews"
              onPress={() => {
                onClose();
                showToast.info('How to Use: 1. Open Google Maps → 2. Copy restaurant link → 3. Paste and analyze!');
              }}
              iconColor={Colors.info}
              delay={700}
            />
            
            <MenuItem
              icon="log-out-outline"
              title="Sign Out"
              subtitle="Logout from your account"
              onPress={handleLogout}
              iconColor={Colors.error}
              delay={800}
            />
          </View>
        </ScrollView>

        {/* Footer */}
        <Animatable.View animation="fadeInUp" delay={500} style={styles.footer}>
          <View style={styles.footerStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>89%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>1.2K</Text>
              <Text style={styles.statLabel}>Analyzed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>342</Text>
              <Text style={styles.statLabel}>Fake Found</Text>
            </View>
          </View>
          <Text style={styles.footerText}>Powered by AI • Version 1.0</Text>
        </Animatable.View>
      </Animatable.View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  backdropTouch: {
    flex: 1,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: 'white',
    zIndex: 1000,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },

  // Header
  header: {
    backgroundColor: Colors.primary,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: 12,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  appSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  // User Section
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
  },

  // Menu
  menuContainer: {
    flex: 1,
  },
  menuSection: {
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    letterSpacing: 1,
  },
  menuItem: {
    paddingHorizontal: 20,
    paddingVertical: 2,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 2,
    backgroundColor: 'transparent',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },

  // Footer
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    backgroundColor: '#f8f9fa',
  },
  footerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#dee2e6',
  },
  footerText: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

export default SideDrawer;
