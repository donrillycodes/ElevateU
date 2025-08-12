import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Platform, TouchableOpacity, FlatList, Image, StatusBar, } from 'react-native';
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
  const [profiles, setProfiles] = useState({}); // { [uid]: { name, avatarUrl } }

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const unsubscribe = listenChats(uid, async (chatData) => {
      const pendingProfiles = {};
      const enriched = await Promise.all(
        (chatData || []).map(async (chat) => {
          const me = uid;
          const peerId = chat.participants?.find((p) => p !== me);

          // 1) Prefer participantsMeta from chat doc
          const meta = chat.participantsMeta?.[peerId] || {};
          let name = meta.displayName;
          let avatarUrl = meta.avatarUrl;

          // 2) Fallback to cached profile
          if (!name) {
            const cached = profiles[peerId];
            if (cached) {
              name = cached.name;
              avatarUrl = cached.avatarUrl;
            }
          }

          // 3) Final fallback to userService (fetch once)
          if (!name) {
            try {
              const u = await getUser(peerId);
              name = u?.displayName || u?.name || 'Unknown';
              avatarUrl = u?.avatarUrl || '';
              pendingProfiles[peerId] = { name, avatarUrl };
            } catch {
              name = 'Unknown';
              avatarUrl = '';
            }
          }

          // last message + time
          const lastMessage = chat.lastMessage || '';
          const updatedAtDate = chat.updatedAt?.toDate
            ? chat.updatedAt.toDate()
            : null;
          const lastTimestamp = updatedAtDate
            ? formatTime(updatedAtDate)
            : '';

          // unread (if your backend stores per-user counts)
          const unread = (chat.unread && chat.unread[me]) || 0;

          return {
            id: chat.id,
            peerId,
            name,
            avatarUrl,
            lastMessage,
            lastTimestamp,
            unread,
          };
        })
      );

      // Merge any fresh profiles into cache
      if (Object.keys(pendingProfiles).length) {
        setProfiles((prev) => ({ ...prev, ...pendingProfiles }));
      }
      setChats(enriched);
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() =>
        navigation.navigate('ChatRoom', {
          chatId: item.id,
          peerId: item.peerId,
          name: item.name,
        })
      }
    >
      {item.avatarUrl ? (
        <Image source={{ uri: item.avatarUrl }} style={styles.avatarImg} />
      ) : (
        <View style={[styles.avatar, { backgroundColor: '#D7F7D2' }]} />
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        {!!item.lastMessage && (
          <Text style={styles.last} numberOfLines={1}>
            {item.lastMessage}
          </Text>
        )}
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
    <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#fff",
          paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
        }}
      >
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
      </View>
      <FlatList
        data={chats}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 90 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <View style={{ paddingTop: 40, alignItems: 'center' }}>
            <Text style={{ color: MUTED }}>No chats yet</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function formatTime(d) {
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  return sameDay
    ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString();
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
    marginRight: 12,
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

// chatlist screen