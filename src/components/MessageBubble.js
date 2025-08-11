import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PRIMARY = '#1A73E8';
const BORDER = '#E5E7EB';
const TEXT = '#0C223A';
const MUTED = '#6B7280';

export default function MessageBubble({ message, isMine }) {
  return (
    <View style={[styles.msgRow, isMine ? styles.rowRight : styles.rowLeft]}>
      {!isMine && <View style={styles.dot} />}
      <View style={[styles.bubble, isMine ? styles.bubbleMe : styles.bubbleOther]}>
        <Text style={[styles.msgText, isMine ? { color: '#fff' } : { color: TEXT }]}>
          {message.text}
        </Text>
        <Text style={[styles.time, isMine ? { color: '#E0EEFF' } : { color: MUTED }]}>
          {message.timestamp}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  msgRow: {
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  rowLeft: {
    justifyContent: 'flex-start',
  },
  rowRight: {
    justifyContent: 'flex-end',
  },
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
  bubbleMe: {
    backgroundColor: PRIMARY,
  },
  msgText: {
    fontSize: 14,
    lineHeight: 20,
  },
  time: {
    fontSize: 11,
    marginTop: 6,
    textAlign: 'right',
  },
});