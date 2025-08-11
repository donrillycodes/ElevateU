export const formatTimestamp = (timestamp) => {
  if (!timestamp || !timestamp.toDate) return '';
  return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const formatName = (name) => {
  return name ? name.trim() : 'Unknown';
};

export const formatSkills = (skills) => {
  return skills && skills.length > 0 ? skills.join(', ') : '';
};