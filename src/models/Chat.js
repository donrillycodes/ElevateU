export const mapChat = (data) => ({
  id: data.id || '',
  participants: data.participants || [], // Array of UIDs
  lastMessage: data.lastMessage || '',
  lastTimestamp: data.lastTimestamp ? data.lastTimestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
});