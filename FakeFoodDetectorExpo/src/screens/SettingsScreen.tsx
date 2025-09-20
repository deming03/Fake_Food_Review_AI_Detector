import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { Colors, ModernCard, showToast } from '../components/EnhancedUI';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoAnalyze, setAutoAnalyze] = useState(true);
  const [analytics, setAnalytics] = useState(true);
  
  const { user, updateProfile } = useAuth();
  const navigation = useNavigation();

  const handleNotificationToggle = async (value: boolean) => {
    setNotifications(value);
    showToast(`Notifications ${value ? 'enabled' : 'disabled'}`, 'success');
  };

  const handleDarkModeToggle = (value: boolean) => {
    setDarkMode(value);
    showToast('Dark mode coming soon!', 'info');
  };

  const handleAutoAnalyzeToggle = async (value: boolean) => {
    setAutoAnalyze(value);
    try {
      await updateProfile({
        preferences: {
          ...user?.preferences,
          analysisSettings: {
            ...user?.preferences?.analysisSettings,
            autoAnalyze: value,
          },
        },
      });
      showToast(`Auto-analyze ${value ? 'enabled' : 'disabled'}`, 'success');
    } catch (error) {
      showToast('Failed to update setting', 'error');
    }
  };

  const handleAnalyticsToggle = (value: boolean) => {
    setAnalytics(value);
    showToast(`Analytics ${value ? 'enabled' : 'disabled'}`, 'success');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Analysis Settings */}
      <Animatable.View animation="fadeInUp" delay={100}>
        <ModernCard title="🔬 Analysis Settings">
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Auto-Analyze URLs</Text>
              <Text style={styles.settingDescription}>
                Automatically start analysis when a restaurant URL is detected
              </Text>
            </View>
            <Switch
              value={autoAnalyze}
              onValueChange={handleAutoAnalyzeToggle}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={autoAnalyze ? Colors.white : Colors.textSecondary}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Analysis Sensitivity</Text>
              <Text style={styles.settingDescription}>
                Current: {user?.preferences?.analysisSettings?.sensitivity || 'Medium'}
              </Text>
            </View>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionText}>Change</Text>
            </TouchableOpacity>
          </View>
        </ModernCard>
      </Animatable.View>

      {/* Notification Settings */}
      <Animatable.View animation="fadeInUp" delay={200}>
        <ModernCard title="🔔 Notifications">
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive notifications when analysis is complete
              </Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={notifications ? Colors.white : Colors.textSecondary}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Weekly Reports</Text>
              <Text style={styles.settingDescription}>
                Get weekly summaries of your analysis activity
              </Text>
            </View>
            <Switch
              value={user?.preferences?.notifications?.weeklyReports || false}
              onValueChange={(value) => {
                // TODO: Update user preferences
                showToast(`Weekly reports ${value ? 'enabled' : 'disabled'}`, 'success');
              }}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>
        </ModernCard>
      </Animatable.View>

      {/* App Preferences */}
      <Animatable.View animation="fadeInUp" delay={300}>
        <ModernCard title="🎨 App Preferences">
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Dark Mode</Text>
              <Text style={styles.settingDescription}>
                Switch to dark theme (Coming Soon)
              </Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={handleDarkModeToggle}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={darkMode ? Colors.white : Colors.textSecondary}
              disabled={true}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Language</Text>
              <Text style={styles.settingDescription}>English</Text>
            </View>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionText}>Change</Text>
            </TouchableOpacity>
          </View>
        </ModernCard>
      </Animatable.View>

      {/* Privacy & Data */}
      <Animatable.View animation="fadeInUp" delay={400}>
        <ModernCard title="🔒 Privacy & Data">
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Usage Analytics</Text>
              <Text style={styles.settingDescription}>
                Help improve TRUTH BITE by sharing anonymous usage data
              </Text>
            </View>
            <Switch
              value={analytics}
              onValueChange={handleAnalyticsToggle}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={analytics ? Colors.white : Colors.textSecondary}
            />
          </View>

          <TouchableOpacity style={styles.linkRow}>
            <Ionicons name="document-text-outline" size={24} color={Colors.textSecondary} />
            <Text style={styles.linkText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkRow}>
            <Ionicons name="shield-checkmark-outline" size={24} color={Colors.textSecondary} />
            <Text style={styles.linkText}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </ModernCard>
      </Animatable.View>

      {/* About */}
      <Animatable.View animation="fadeInUp" delay={500}>
        <ModernCard title="ℹ️ About TRUTH BITE">
          <TouchableOpacity style={styles.linkRow}>
            <Ionicons name="help-circle-outline" size={24} color={Colors.textSecondary} />
            <Text style={styles.linkText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkRow}>
            <Ionicons name="star-outline" size={24} color={Colors.textSecondary} />
            <Text style={styles.linkText}>Rate TRUTH BITE</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkRow}>
            <Ionicons name="share-outline" size={24} color={Colors.textSecondary} />
            <Text style={styles.linkText}>Share with Friends</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.versionRow}>
            <Text style={styles.versionText}>Version 1.0.0</Text>
            <Text style={styles.buildText}>Build 2024.09</Text>
          </View>
        </ModernCard>
      </Animatable.View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          TRUTH BITE - Protecting diners from deceptive reviews since 2024
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  actionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: Colors.primary + '20',
    borderRadius: 8,
  },
  actionText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  linkText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginLeft: 15,
  },
  versionRow: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  buildText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
