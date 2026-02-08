import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, KeyboardAvoidingView, Platform, StatusBar} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { listenMessages, sendMessage } from '../../controllers/ChatController';
import { auth } from '../../services/firebase';

const PRIMARY = '#1A73E8';
const BORDER = '#E5E7EB';
const TEXT = '#0C223A';
const MUTED = '#6B7280';

export default function ChatRoomScreen({ navigation, route }) {
  const { chatId, name } = route.params;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const listRef = useRef();

  if (!chatId || !name) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red', fontWeight: 'bold' }}>
          ⚠️ Error: Missing chat parameters
        </Text>
      </View>
    );
  }

  useEffect(() => {
  const unsubscribe = listenMessages(chatId, (msgs) => {
    const formatted = msgs.map((m) => ({
      ...m,
      timestamp: m.timestamp?.toDate?.().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }) || '',
    }));
    setMessages(formatted);
    setTimeout(() => listRef.current?.scrollToOffset({ offset: 0, animated: true }), 50);
  });
  return unsubscribe;
}, [chatId]);


  const onSend = () => {
    if (!input.trim()) return;
    sendMessage(chatId, input, auth.currentUser.uid);
    setInput('');
  };

  const renderItem = ({ item }) => {
    const mine = item.senderId === auth.currentUser.uid;
    return (
      <View style={[styles.msgRow, mine ? styles.rowRight : styles.rowLeft]}>
        {!mine && <View style={styles.dot} />}
        <View style={[styles.bubble, mine ? styles.bubbleMe : styles.bubbleOther]}>
          <Text style={[styles.msgText, mine ? { color: '#fff' } : { color: TEXT }]}>
            {item.text}
          </Text>
          <Text style={[styles.time, mine ? { color: '#E0EEFF' } : { color: MUTED }]}>
            {item.timestamp}
          </Text>
        </View>
      </View>
    );
  };

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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name='chevron-back' size={26} color={TEXT} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.onlineRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineTxt}>online</Text>
          </View>
        </View>
        <TouchableOpacity>
          <Ionicons name='ellipsis-horizontal' size={22} color={TEXT} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={renderItem}
          inverted
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 12, paddingTop: 8 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name='happy-outline' size={22} color={MUTED} />
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            placeholder='Send message...'
            placeholderTextColor='#9AA0A6'
            value={input}
            onChangeText={setInput}
            multiline
            onSubmitEditing={onSend}
          />
          <TouchableOpacity
            style={[styles.sendBtn, { opacity: input.trim() ? 1 : 0.6 }]}
            onPress={onSend}
            disabled={!input.trim()}
          >
            <Ionicons name='send' size={18} color='#fff' />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  name: { fontSize: 16, fontWeight: '800', color: TEXT },
  onlineRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E', marginRight: 6 },
  onlineTxt: { color: MUTED, fontSize: 12 },
  msgRow: { paddingHorizontal: 4, flexDirection: 'row', alignItems: 'flex-end' },
  rowLeft: { justifyContent: 'flex-start' },
  rowRight: { justifyContent: 'flex-end' },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EFD7FB',
    marginRight: 6,
    alignSelf: 'flex-end',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  bubbleOther: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: BORDER,
  },
  bubbleMe: { backgroundColor: PRIMARY },
  msgText: { fontSize: 14, lineHeight: 20 },
  time: { fontSize: 11, marginTop: 6, textAlign: 'right' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    padding: 10,
    gap: 8,
    backgroundColor: '#fff',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 110,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
