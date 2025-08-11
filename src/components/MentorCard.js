import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PRIMARY = '#1A73E8';
const BORDER = '#E5E7EB';
const TEXT = '#0C223A';
const MUTED = '#6B7280';

export default function MentorCard({ mentor, onRequest, onViewProfile, isRequested }) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRequested) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1.05,
            friction: 6,
            useNativeDriver: true,
          }),
        ]),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isRequested]);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={onViewProfile}
    >
      <View style={styles.header}>
        <Image
          source={
            mentor.avatarUrl
              ? { uri: mentor.avatarUrl }
              : require('../../assets/Layer1.png')
          }
          style={styles.avatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={1}>
            {mentor.name || 'Unknown'}
          </Text>
          <Text style={styles.title} numberOfLines={1}>
            {mentor.title || 'Mentor'}
          </Text>
          <Text style={styles.company} numberOfLines={1}>
            {mentor.company || 'Unknown'}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.chipWrap}>
          {(mentor.skills || []).slice(0, 3).map((skill, index) => (
            <View key={index} style={[styles.chip, index < 2 && { marginRight: 8 }]}>
              <Text style={styles.chipText}>{skill}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.bio} numberOfLines={2}>
          {mentor.bio || 'No bio available.'}
        </Text>
      </View>

      <View style={styles.footer}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={[styles.btn, isRequested && styles.btnDisabled]}
            onPress={onRequest}
            disabled={isRequested}
          >
            <Ionicons
              name={isRequested ? 'checkmark-done-outline' : 'person-add-outline'}
              size={18}
              color={isRequested ? MUTED : '#fff'}
            />
            <Text style={[styles.btnText, isRequested && styles.btnTextDisabled]}>
              {isRequested ? 'Requested' : 'Request'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: TEXT,
  },
  title: {
    fontSize: 13,
    color: MUTED,
    marginTop: 2,
  },
  company: {
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },
  body: {
    marginTop: 4,
  },
  chipWrap: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  chip: {
    backgroundColor: '#E8F0FE',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: {
    fontSize: 12,
    color: '#1F4DB3',
    fontWeight: '700',
  },
  bio: {
    fontSize: 13,
    color: TEXT,
    lineHeight: 18,
  },
  footer: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 6,
  },
  btnDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: BORDER,
  },
  btnTextDisabled: {
    color: MUTED,
    fontWeight: '600',
  },
});
