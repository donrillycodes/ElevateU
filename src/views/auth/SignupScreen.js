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
import { validateEmail, validateRequired } from '../../lib/validators';

const CARD_BG = '#F6F7F9';
const BORDER = '#E2E5EA';
const PRIMARY = '#1A73E8';
const TEXT_DARK = '#111827';
const TEXT_MUTED = '#6B7280';

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleNext = () => {
    setError('');
    if (!validateRequired(name)) {
      setError('Name is required.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Invalid email address.');
      return;
    }
    if (!validateRequired(password)) {
      setError('Password is required.');
      return;
    }

    navigation.navigate('CompleteProfile', {
      name,
      email,
      password,
    });
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.centerWrap}>
          <View style={styles.card}>
            <Text style={styles.title}>Create Your Account</Text>
            <Text style={styles.subtitle}>
              Enter your details to get started with{' '}
              <Text style={{ fontWeight: '700' }}>ElevateU</Text>
            </Text>

            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder='John Doe'
              placeholderTextColor='#9AA0A6'
              value={name}
              onChangeText={setName}
            />

            <Text style={[styles.label, { marginTop: 12 }]}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder='name@example.com'
              placeholderTextColor='#9AA0A6'
              autoCapitalize='none'
              keyboardType='email-address'
              value={email}
              onChangeText={setEmail}
            />

            <Text style={[styles.label, { marginTop: 12 }]}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder='••••••••'
              placeholderTextColor='#9AA0A6'
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity style={styles.primaryBtn} onPress={handleNext}>
              <Text style={styles.primaryBtnText}>Next</Text>
              <Ionicons
                name='arrow-forward'
                size={20}
                color='#fff'
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>

            <View style={styles.bottomRow}>
              <Text style={styles.muted}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.link}>Login</Text>
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
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    color: TEXT_DARK,
  },
  subtitle: {
    fontSize: 13,
    color: TEXT_MUTED,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
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
  bottomRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  muted: { color: TEXT_MUTED },
  link: { color: PRIMARY, fontWeight: '700' },
});
