import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { Colors, ModernCard, AnimatedButton, showToast } from '../components/EnhancedUI';

export default function ProfileScreen() {
  const [loading, setLoading] = useState(false);
  const { user, logout, updateProfile } = useAuth();
  const navigation = useNavigation();

  if (!user) {
    return null; // This shouldn't happen if auth flow is correct
  }

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await logout();
              showToast('Signed out successfully', 'success');
            } catch (error) {
              showToast('Error signing out', 'error');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const toggleAnalysisSetting = async (setting: string, value: boolean) => {
    try {
      const updatedPreferences = {
        ...user.preferences,
        analysisSettings: {
          ...user.preferences?.analysisSettings,
          [setting]: value,
        },
      };
      
      await updateProfile({ preferences: updatedPreferences });
      showToast('Settings updated', 'success');
    } catch (error) {
      showToast('Failed to update settings', 'error');
    }
  };

  const toggleNotificationSetting = async (setting: string, value: boolean) => {
    try {
      const updatedPreferences = {
        ...user.preferences,
        notifications: {
          ...user.preferences?.notifications,
          [setting]: value,
        },
      };
      
      await updateProfile({ preferences: updatedPreferences });
      showToast('Notification settings updated', 'success');
    } catch (error) {
      showToast('Failed to update notifications', 'error');
    }
  };

  const navigateToSettings = () => {
    navigation.navigate('Settings' as never);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <Animatable.View animation="fadeInDown" style={styles.header}>
        <View style={styles.avatarContainer}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color={Colors.textSecondary} />
            </View>
          )}
          <TouchableOpacity style={styles.editAvatarButton}>
            <Ionicons name="camera" size={16} color={Colors.white} />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        
        <View style={styles.providerBadge}>
          <Ionicons 
            name={user.provider === 'google' ? 'logo-google' : 'mail'} 
            size={14} 
            color={Colors.white} 
          />
          <Text style={styles.providerText}>
            {user.provider === 'google' ? 'Google' : 'Email'}
          </Text>
        </View>
      </Animatable.View>

      {/* Quick Stats */}
      <Animatable.View animation="fadeInUp" delay={200}>
        <ModernCard title="📊 Your TRUTH BITE Stats">
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Analyses</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>89%</Text>
              <Text style={styles.statLabel}>Avg Score</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>7</Text>
              <Text style={styles.statLabel}>Saved</Text>
            </View>
          </View>
        </ModernCard>
      </Animatable.View>

      {/* Analysis Settings */}
      <Animatable.View animation="fadeInUp" delay={300}>
        <ModernCard title="⚙️ Analysis Settings">
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Sensitivity Level</Text>
              <Text style={styles.settingDescription}>
                {user.preferences?.analysisSettings?.sensitivity || 'medium'}
              </Text>
            </View>
            <TouchableOpacity style={styles.settingAction}>
              <Text style={styles.actionText}>Change</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Auto-Analyze</Text>
              <Text style={styles.settingDescription}>
                Automatically start analysis when URL is detected
              </Text>
            </View>
            <TouchableOpacity 
              style={[
                styles.toggle,
                user.preferences?.analysisSettings?.autoAnalyze && styles.toggleActive
              ]}
              onPress={() => toggleAnalysisSetting(
                'autoAnalyze', 
                !user.preferences?.analysisSettings?.autoAnalyze
              )}
            >
              <View style={[
                styles.toggleHandle,
                user.preferences?.analysisSettings?.autoAnalyze && styles.toggleHandleActive
              ]} />
            </TouchableOpacity>
          </View>
        </ModernCard>
      </Animatable.View>

      {/* Notification Settings */}
      <Animatable.View animation="fadeInUp" delay={400}>
        <ModernCard title="🔔 Notifications">
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Analysis Complete</Text>
              <Text style={styles.settingDescription}>
                Get notified when analysis results are ready
              </Text>
            </View>
            <TouchableOpacity 
              style={[
                styles.toggle,
                user.preferences?.notifications?.resultsReady && styles.toggleActive
              ]}
              onPress={() => toggleNotificationSetting(
                'resultsReady', 
                !user.preferences?.notifications?.resultsReady
              )}
            >
              <View style={[
                styles.toggleHandle,
                user.preferences?.notifications?.resultsReady && styles.toggleHandleActive
              ]} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Weekly Reports</Text>
              <Text style={styles.settingDescription}>
                Receive weekly analysis summaries
              </Text>
            </View>
            <TouchableOpacity 
              style={[
                styles.toggle,
                user.preferences?.notifications?.weeklyReports && styles.toggleActive
              ]}
              onPress={() => toggleNotificationSetting(
                'weeklyReports', 
                !user.preferences?.notifications?.weeklyReports
              )}
            >
              <View style={[
                styles.toggleHandle,
                user.preferences?.notifications?.weeklyReports && styles.toggleHandleActive
              ]} />
            </TouchableOpacity>
          </View>
        </ModernCard>
      </Animatable.View>

      {/* Account Actions */}
      <Animatable.View animation="fadeInUp" delay={500}>
        <ModernCard title="👤 Account">
          <TouchableOpacity style={styles.actionRow} onPress={navigateToSettings}>
            <Ionicons name="settings-outline" size={24} color={Colors.textSecondary} />
            <Text style={styles.actionText}>App Settings</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionRow}>
            <Ionicons name="help-circle-outline" size={24} color={Colors.textSecondary} />
            <Text style={styles.actionText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionRow}>
            <Ionicons name="document-text-outline" size={24} color={Colors.textSecondary} />
            <Text style={styles.actionText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </ModernCard>
      </Animatable.View>

      {/* Logout Button */}
      <Animatable.View animation="fadeInUp" delay={600} style={styles.logoutSection}>
        <AnimatedButton
          title="Sign Out"
          onPress={handleLogout}
          loading={loading}
          variant="danger"
          style={styles.logoutButton}
        />
      </Animatable.View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>TRUTH BITE v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: Colors.white,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.white + '80',
    marginBottom: 10,
  },
  providerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  providerText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  settingAction: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  actionText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    padding: 3,
  },
  toggleActive: {
    backgroundColor: Colors.primary,
  },
  toggleHandle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignSelf: 'flex-start',
  },
  toggleHandleActive: {
    alignSelf: 'flex-end',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  logoutSection: {
    padding: 20,
  },
  logoutButton: {
    backgroundColor: Colors.error,
  },
  footer: {
    alignItems: 'center',
    padding: 20,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});