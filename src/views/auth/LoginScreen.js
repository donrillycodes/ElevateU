import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { handleLogin } from '../../controllers/AuthController';

const CARD_BG = '#F6F7F9';
const BORDER = '#E2E5EA';
const PRIMARY = '#1A73E8';
const TEXT_DARK = '#111827';
const TEXT_MUTED = '#6B7280';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const onLogin = async () => {
    try {
      setError('');
      if (!email || !password) {
        setError('Please fill in all fields.');
        return;
      }
      await handleLogin(email, password);
      // Redirector will handle the navigation based on user role
      navigation.replace('Redirector');
      // Navigation handled in AppNavigator
    } catch (err) {
      setError(err.message || 'Login failed.');
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.centerWrap}>
          <View style={styles.card}>
            <Text style={styles.title}>Welcome Back</Text>

            <Text style={styles.label}>Email address</Text>
            <TextInput
              style={styles.input}
              placeholder='Enter your email'
              placeholderTextColor='#9AA0A6'
              autoCapitalize='none'
              keyboardType='email-address'
              value={email}
              onChangeText={setEmail}
            />

            <Text style={[styles.label, { marginTop: 12 }]}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder='Enter your password'
              placeholderTextColor='#9AA0A6'
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity style={styles.primaryBtn} onPress={onLogin}>
              <Text style={styles.primaryBtnText}>Log In</Text>
              <Ionicons
                name='log-in-outline'
                size={20}
                color='#fff'
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>

            <View style={styles.footerRow}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Forgot')}
                style={styles.linkRow}
              >
                <Ionicons name='mail-outline' size={16} color='#5E6AD2' />
                <Text style={styles.linkText}> Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('Signup')}
                style={styles.linkRow}
              >
                <Ionicons name='person-add-outline' size={16} color='#5E6AD2' />
                <Text style={styles.linkText}> Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  centerWrap: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    color: TEXT_DARK,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_DARK,
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFF',
  },
  error: { color: 'crimson', marginTop: 8 },
  primaryBtn: {
    marginTop: 18,
    height: 46,
    backgroundColor: PRIMARY,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primaryBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  footerRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkRow: { flexDirection: 'row', alignItems: 'center' },
  linkText: {
    color: '#5E6AD2',
    fontSize: 13,
    fontWeight: '600',
  },
});