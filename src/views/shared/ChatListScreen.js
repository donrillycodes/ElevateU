import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, FlatList, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { listenChats } from '../../controllers/ChatController';
import { getUser } from '../../services/userService';
import { auth } from '../../services/firebase';

const PRIMARY = '#1677C8';
const BORDER = '#98C0DF';
const PAGE_BG = '#FFFFFF';
const TEXT = '#0C223A';
const MUTED = '#6B7280';

export default function ChatListScreen({ navigation }) {
  const [chats, setChats] = useState([]);
  const [names, setNames] = useState({}); // Cache user names

  useEffect(() => {
    const unsubscribe = listenChats(auth.currentUser.uid, async (chatData) => {
      const updatedChats = [];
      const nameCache = { ...names };
      for (const chat of chatData) {
        const otherUid = chat.participants.find(uid => uid !== auth.currentUser.uid);
        if (!nameCache[otherUid]) {
          const user = await getUser(otherUid);
          nameCache[otherUid] = user?.name || 'Unknown';
        }
        updatedChats.push({ ...chat, name: nameCache[otherUid] });
      }
      setNames(nameCache);
      setChats(updatedChats);
    });
    return unsubscribe;
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('ChatRoom', { chatId: item.id, name: item.name })}
    >
      <View style={[styles.avatar, { backgroundColor: '#D7F7D2' }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.last} numberOfLines={1}>{item.lastMessage}</Text>
      </View>
      <View style={styles.rightCol}>
        <Text style={styles.time}>{item.lastTimestamp}</Text>
        {item.unread > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.unread}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
      </View>
      <FlatList
        data={chats}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 90 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        showsVerticalScrollIndicator={false}
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
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: TEXT },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1.6,
    borderColor: BORDER,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
    avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  name: { fontSize: 15, fontWeight: '800', color: TEXT },
  last: { fontSize: 13, color: MUTED, marginTop: 2 },
  rightCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 10,
  },
  time: { fontSize: 12, color: MUTED, marginBottom: 6 },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '800' },
});
