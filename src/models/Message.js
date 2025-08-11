export const mapMessage = (data) => ({
  id: data.id || '',
  senderId: data.senderId || '',
  text: data.text || '',
  timestamp: data.timestamp ? data.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
});