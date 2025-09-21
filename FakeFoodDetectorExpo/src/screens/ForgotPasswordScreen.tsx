import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import { useAuth } from '../contexts/AuthContext';
import { TruthBiteLogo } from '../components/TruthBiteLogo';
import { Colors, AnimatedButton, EnhancedTextInput, showToast } from '../components/EnhancedUI';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const { forgotPassword } = useAuth();
  const navigation = useNavigation();

  const handleForgotPassword = async () => {
    if (!email) {
      showToast.error('Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      showToast.error('Please enter a valid email');
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      setEmailSent(true);
      showToast.success('Password reset instructions sent to your email!');
    } catch (error: any) {
      showToast.error(error.message || 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.goBack();
  };

  const navigateToRegister = () => {
    navigation.navigate('Register' as never);
  };

  if (emailSent) {
    return (
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <Animatable.View animation="bounceIn" style={styles.successSection}>
            <View style={styles.successIcon}>
              <Text style={styles.successEmoji}>📧</Text>
            </View>
            
            <Text style={styles.successTitle}>Email Sent!</Text>
            <Text style={styles.successMessage}>
              We've sent password reset instructions to:
            </Text>
            <Text style={styles.emailAddress}>{email}</Text>
            
            <Text style={styles.instructionsText}>
              Please check your inbox and follow the instructions to reset your password. 
              Don't forget to check your spam folder if you don't see the email.
            </Text>

            <AnimatedButton
              title="Back to Login"
              onPress={navigateToLogin}
              variant="primary"
              icon="arrow-back"
            />

            <TouchableOpacity 
              style={styles.resendButton}
              onPress={() => {
                setEmailSent(false);
                showToast.info('You can request another password reset email');
              }}
            >
              <Text style={styles.resendText}>Didn't receive the email? Resend</Text>
            </TouchableOpacity>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <Animatable.View animation="fadeInDown" duration={1000} style={styles.headerSection}>
          <TouchableOpacity style={styles.backButton} onPress={navigateToLogin}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          
          <TruthBiteLogo size={80} showText={false} animated={true} />
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            No worries! Enter your email and we'll send you a link to reset your password.
          </Text>
        </Animatable.View>

        {/* Form Section */}
        <Animatable.View animation="fadeInUp" delay={300} style={styles.formSection}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <EnhancedTextInput
              placeholder="Enter your email address"
              value={email}
              onChangeText={setEmail}
              icon="mail"
            />
          </View>

          {/* Reset Password Button */}
          <AnimatedButton
            title="Send Reset Link"
            onPress={handleForgotPassword}
            loading={loading}
            variant="primary"
            icon="mail-outline"
          />

          {/* Back to Login */}
          <View style={styles.loginSection}>
            <Text style={styles.loginText}>Remember your password? </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>

          {/* Register Link */}
          <View style={styles.registerSection}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={navigateToRegister}>
              <Text style={styles.registerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>

        {/* Footer */}
        <Animatable.View animation="fadeIn" delay={800} style={styles.footer}>
          <Text style={styles.footerText}>
            🔒 Your security is our priority. We'll never share your personal information.
          </Text>
        </Animatable.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 10,
    zIndex: 1,
  },
  backArrow: {
    fontSize: 24,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  formSection: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 15,
  },
  loginText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  registerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  registerText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  registerLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Success State Styles
  successSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  successIcon: {
    width: 120,
    height: 120,
    backgroundColor: `${Colors.success}15`,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  successEmoji: {
    fontSize: 50,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emailAddress: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  instructionsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  resendButton: {
    marginTop: 20,
    padding: 10,
  },
  resendText: {
    color: Colors.primary,
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
