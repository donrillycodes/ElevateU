import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, FlatList, Linking, Image, Alert, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchProfile } from '../../controllers/ProfileController';
import { initiateChat } from '../../controllers/ChatController';
import { sendMentorRequest } from '../../controllers/MatchController';
import { auth } from '../../services/firebase';

export default function ProfileDetailsScreen({ navigation, route }) {
  const { userId } = route.params;
  const [profile, setProfile] = useState({
    name: '',
    title: '',
    location: '',
    about: '',
    skills: [],
    experience: [],
    email: '',
    linkedin: '',
    avatarUrl: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchProfile(userId);
        setProfile(data);
      } catch (err) {
        Alert.alert('Error', 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const openEmail = () => profile.email && Linking.openURL(`mailto:${profile.email}`);
  const openLinkedIn = () => profile.linkedin && Linking.openURL(profile.linkedin);

  const handleMessage = async () => {
    if (!auth.currentUser) return;
    try {
      const chatId = await initiateChat(
        auth.currentUser.uid,
        userId,
        `Hi ${profile.name}, let's connect!`
      );
      navigation.navigate('ChatRoom', { chatId, name: profile.name });
    } catch (err) {
      Alert.alert('Error', 'Failed to initiate chat.');
    }
  };

  const handleConnect = async () => {
    if (!auth.currentUser) return;
    try {
      await sendMentorRequest(
        auth.currentUser.uid,
        userId,
        `Interested in connecting with ${profile.name}!`
      );
      Alert.alert('Request Sent', 'Mentor request has been sent.');
    } catch (err) {
      Alert.alert('Error', 'Failed to send mentor request.');
    }
  };

  const sections = [
    { type: 'profileCard' },
    { type: 'about', content: profile.about },
    { type: 'skills', content: profile.skills },
    { type: 'experience', content: profile.experience },
    { type: 'contact', content: { email: profile.email, linkedin: profile.linkedin } },
  ];

  const renderItem = ({ item }) => {
    switch (item.type) {
      case 'profileCard':
        return (
          <View style={styles.card}>
            {profile.avatarUrl ? (
              <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: '#F3D1E5' }]} />
            )}
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.subtitle}>{profile.title}</Text>
            <Text style={styles.location}>{profile.location}</Text>
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.primaryBtn} onPress={handleMessage}>
                <Ionicons name='chatbubble-ellipses-outline' size={18} color='#fff' />
                <Text style={styles.primaryBtnText}>Message</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.outlineBtn} onPress={handleConnect}>
                <Ionicons name='shield-checkmark-outline' size={18} color='#1A73E8' />
                <Text style={styles.outlineBtnText}>Connect</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      case 'about':
        return item.content ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Me</Text>
            <Text style={styles.body}>{item.content}</Text>
          </View>
        ) : null;
      case 'skills':
        return item.content.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.chipWrap}>
              {item.content.map((s, i) => (
                <View key={i} style={[styles.chip, i < item.content.length - 1 && { marginRight: 8 }]}>
                  <Text style={styles.chipText}>{s}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null;
      case 'experience':
        return item.content.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {item.content.map((exp, idx) => (
              <View key={idx} style={{ marginBottom: 16 }}>
                <Text style={styles.expRole}>{exp.role}</Text>
                <Text style={styles.expMeta}>{exp.company} • {exp.timeline}</Text>
                {Array.isArray(exp.bullets) ? (
                  exp.bullets.map((b, i) => (
                    <Text key={i} style={styles.body}>• {b}</Text>
                  ))
                ) : (
                  <Text style={styles.body}>{exp.bullets}</Text>
                )}
              </View>
            ))}
          </View>
        ) : null;
      case 'contact':
        return (item.content.email || item.content.linkedin) ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            {item.content.email && (
              <TouchableOpacity style={styles.contactRow} onPress={openEmail}>
                <Ionicons name='mail-outline' size={18} color='#1F2937' />
                <Text style={styles.contactText}>{item.content.email}</Text>
              </TouchableOpacity>
            )}
            {item.content.linkedin && (
              <TouchableOpacity style={styles.contactRow} onPress={openLinkedIn}>
                <Ionicons name='logo-linkedin' size={18} color='#1F2937' />
                <Text style={styles.contactText}>LinkedIn Profile</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator size="large" color="#1A73E8" style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name='chevron-back' size={26} color='#111827' />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile Details</Text>
        <View style={{ width: 26 }} />
      </View>

      <FlatList
        data={sections}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 96 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 4,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignSelf: 'center',
    marginVertical: 12,
  },
  name: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 4 },
  location: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginTop: 2 },
  actionRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 14, gap: 12 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A73E8',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 8,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#1A73E8',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 8,
  },
  outlineBtnText: { color: '#1A73E8', fontWeight: '700' },
  section: {
    backgroundColor: '#F6F7F9',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
  body: { fontSize: 14, lineHeight: 20 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: '#E8F0FE', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  chipText: { color: '#1F4DB3', fontWeight: '700', fontSize: 12 },
  expRole: { fontSize: 16, fontWeight: '800' },
  expMeta: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  contactText: { fontSize: 14 },
});