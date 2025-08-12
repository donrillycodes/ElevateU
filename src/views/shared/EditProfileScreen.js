import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert, Image, StatusBar, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import {
  saveProfile,
  handleUploadAvatar,
  fetchProfile,
} from '../../controllers/ProfileController';
import { auth } from '../../services/firebase';
import { validateEmail, validateRequired } from '../../lib/validators';

const PRIMARY = '#1677C8';
const BORDER = '#E5E7EB';
const TEXT = '#0C223A';
const MUTED = '#6B7280';

export default function EditProfileScreen({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [gender, setGender] = useState('');
  const [avatarUri, setAvatarUri] = useState('');
  const [originalAvatar, setOriginalAvatar] = useState('');
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');


  useEffect(() => {
    const load = async () => {
      try {
        if (!auth.currentUser) return;
        const data = await fetchProfile(auth.currentUser.uid);
        setFirstName(data.name?.split(' ')[0] || '');
        setLastName(data.name?.split(' ').slice(1).join(' ') || '');
        setEmail(data.email || '');
        setBio(data.bio || '');
        setSkills(data.skills?.join(', ') || '');
        setGender(data.gender || '');
        setAvatarUri(data.avatarUrl || '');
        setOriginalAvatar(data.avatarUrl || '');
        setTitle(data.title || '');

      } catch (err) {
        console.warn('Failed to load profile:', err);
      }
    };
    load();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const onSave = async () => {
    setError('');
    if (!validateRequired(firstName) || !validateRequired(lastName)) {
      setError('Name is required.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Invalid email.');
      return;
    }
    if (!auth.currentUser) {
      setError('User not authenticated.');
      return;
    }
    try {
      const updates = {
        name: `${firstName} ${lastName}`.trim(),
        email,
        bio,
        skills: skills.split(',').map(s => s.trim()).filter(s => s),
        gender,
        title,
      };
      await saveProfile(auth.currentUser.uid, updates);
      if (avatarUri && avatarUri !== originalAvatar) {
        await handleUploadAvatar(auth.currentUser.uid, avatarUri);
      }
      Alert.alert('Saved', 'Your profile changes were saved.');
      navigation.goBack();
    } catch (err) {
      setError(err.message || 'Failed to save profile.');
    }
  };

  return (
    <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: "#fff",
            paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
          }}
        >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name='chevron-back' size={26} color={TEXT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={onSave}>
          <Text style={styles.saveLink}>Save</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 96 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.avatarWrap}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: '#F7F4D7' }]} />
            )}
            <TouchableOpacity style={styles.camBtn} onPress={pickImage}>
              <Ionicons name='camera' size={18} color='#fff' />
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Certified Career Coach"
          />

          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder='First name'
          />

          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder='Last name'
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize='none'
            keyboardType='email-address'
            placeholder='email@example.com'
          />

          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={bio}
            onChangeText={setBio}
            multiline
            textAlignVertical='top'
            placeholder='Tell others about yourself'
          />

          <Text style={styles.label}>Skills (Comma-separated)</Text>
          <TextInput
            style={styles.input}
            value={skills}
            onChangeText={setSkills}
            placeholder='e.g., Leadership, Communication'
          />

          <Text style={styles.label}>Gender</Text>
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={gender}
              onValueChange={setGender}
              style={styles.picker}
            >
              <Picker.Item label='Female' value='Female' />
              <Picker.Item label='Male' value='Male' />
              <Picker.Item label='Non-binary' value='Non-binary' />
              <Picker.Item label='Prefer not to say' value='N/A' />
            </Picker>
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#fff' },
    header: {
        height: 52,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: TEXT },
    saveLink: { color: PRIMARY, fontWeight: '700', fontSize: 15 },
    avatarWrap: { alignItems: 'center', marginTop: 8, marginBottom: 12 },
    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
    },
    camBtn: {
        position: 'absolute',
        bottom: 4,
        right: (-110 / 2) + 110 - 24,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: PRIMARY,
        alignItems: 'center',
        justifyContent: 'center',
    },
    error: { color: 'crimson', marginBottom: 8 },
    label: {
        fontSize: 13,
        color: MUTED,
        marginTop: 10,
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 44,
        backgroundColor: '#fff',
    },
    textarea: { height: 100, paddingVertical: 10 },
    pickerWrap: {
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: 10,
        backgroundColor: '#fff',
        overflow: 'hidden',
        position: 'relative',
    },
    pickerIcon: { position: 'absolute', right: 10, top: 14 },
    saveBtn: {
        marginTop: 16,
        height: 48,
        backgroundColor: PRIMARY,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
