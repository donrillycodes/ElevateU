// Simple data mapper (no classes in JS, but object schema)
export const mapUser = (data) => ({
  uid: data.uid,
  name: data.name || '',
  email: data.email,
  role: data.role,
  field: data.field,
  avatarUrl: data.avatarUrl || '',
  bio: data.bio || '',
  skills: data.skills || [],
  gender: data.gender || '',
  dob: data.dob || '',
  phone: data.phone || '',
});