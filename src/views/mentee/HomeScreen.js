import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import { sendMentorRequest } from '../../controllers/MatchController';
import MentorCard from '../../components/MentorCard';

const PRIMARY = '#1A73E8';
const BORDER = '#E5E7EB';
const PAGE_BG = '#FFFFFF';
const MUTED = '#6B7280';
const TEXT = '#0C223A';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: 'apps-outline' },
  { id: 'Product Management', label: 'Product', icon: 'briefcase-outline' },
  { id: 'Software Engineering', label: 'Tech', icon: 'hardware-chip-outline' },
  { id: 'Data Science', label: 'Data', icon: 'analytics-outline' },
  { id: 'UI/UX Design', label: 'Design', icon: 'color-palette-outline' },
  { id: 'Marketing', label: 'Marketing', icon: 'megaphone-outline' },
  { id: 'Finance', label: 'Finance', icon: 'cash-outline' },
];

export default function HomeScreen({ navigation }) {
  const [mentors, setMentors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [requestedMentors, setRequestedMentors] = useState({});

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        let q = query(collection(db, 'users'), where('role', '==', 'mentor'));
        if (activeCat !== 'all') {
          q = query(q, where('field', '==', activeCat));
        }
        const snapshot = await getDocs(q);
        setMentors(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.warn('Error fetching mentors:', err);
      }
    };
    fetchMentors();
  }, [activeCat]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      resetTo('Login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const filteredMentors = mentors.filter(m =>
    (m.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.bio || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRequestMentor = async (mentorId, mentorName) => {
    try {
      await sendMentorRequest(
        auth.currentUser.uid,
        mentorId,
        `Interested in mentorship with ${mentorName}!`,
        new Date()
      );
      setRequestedMentors(prev => ({ ...prev, [mentorId]: true }));
      Alert.alert('Request Sent', `Your request to ${mentorName} has been sent.`);
    } catch (err) {
      console.warn('Request failed:', err);
      Alert.alert('Error', 'Failed to send mentorship request.');
    }
  };

  const ListHeader = () => (
    <View>
      <View style={styles.searchWrap}>
        <Ionicons name='search-outline' size={18} color={MUTED} />
        <TextInput
          style={styles.searchInput}
          placeholder='Search mentors, skills, or industries...'
          placeholderTextColor='#9AA0A6'
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingVertical: 10 }}
        ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
        renderItem={({ item }) => {
          const active = item.id === activeCat;
          return (
            <TouchableOpacity
              style={[styles.catChip, active ? styles.catChipActive : styles.catChipInactive]}
              onPress={() => setActiveCat(item.id)}
            >
              <Ionicons
                name={item.icon}
                size={16}
                color={active ? '#fff' : MUTED}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.catText, { color: active ? '#fff' : MUTED }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      <View style={styles.promo}>
        <View style={styles.promoIcon}>
          <Ionicons name='flash-outline' size={18} color='#fff' />
        </View>
        <Text style={styles.promoTitle}>Match Instantly</Text>
        <Text style={styles.promoSub}>
          Find a mentor tailored to your unique career goals with our AI-powered matching.
        </Text>
        <TouchableOpacity
          style={styles.promoBtn}
          onPress={() => navigation.navigate('SmartMatch')}
        >
          <Text style={styles.promoBtnText}>Get Started Now</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Top Mentors</Text>
    </View>
  );

  const renderMentor = ({ item }) => {
    const isRequested = requestedMentors[item.id];

    return (
      <MentorCard
        mentor={item}
        isRequested={isRequested}
        onRequest={() => handleRequestMentor(item.id, item.name)}
        onViewProfile={() => navigation.navigate('ProfileDetails', { userId: item.id })}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Home</Text>
        <TouchableOpacity onPress={handleLogout} style={{ position: 'absolute', right: 16 }}>
          <Ionicons name="log-out-outline" size={22} color={TEXT} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredMentors}
        keyExtractor={(i) => i.id}
        ListHeaderComponent={ListHeader}
        renderItem={renderMentor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 90, paddingHorizontal: 16 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 20, color: MUTED }}>
            No mentors found. Try a different category or search term.
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PAGE_BG },
  header: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: TEXT },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: '#fff',
    marginTop: 12,
  },
  searchInput: { flex: 1, marginLeft: 8 },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
  },
  catChipInactive: { borderColor: BORDER, backgroundColor: '#fff' },
  catChipActive: { borderColor: PRIMARY, backgroundColor: PRIMARY },
  catText: { fontWeight: '700', fontSize: 12 },
  promo: {
    marginTop: 12,
    backgroundColor: '#4C1D95',
    borderRadius: 14,
    padding: 16,
  },
  promoIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  promoTitle: { color: '#fff', fontWeight: '800', fontSize: 16, marginBottom: 6 },
  promoSub: { color: '#EDE9FE', fontSize: 13, lineHeight: 18, marginBottom: 12 },
  promoBtn: {
    backgroundColor: '#8B5CF6',
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoBtnText: { color: '#fff', fontWeight: '800' },
  sectionTitle: {
    marginTop: 14,
    marginBottom: 8,
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
});
