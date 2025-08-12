import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Alert, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchProfile } from '../../controllers/ProfileController';
import { auth } from '../../services/firebase';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { resetTo } from '../../services/navigationService';



const PRIMARY = '#1677C8';
const BORDER = '#98C0DF';
const TEXT = '#0C223A';
const MUTED = '#6B7280';

export default function UserProfileScreen() {
    const navigation = useNavigation();
    const [profile, setProfile] = useState({
        name: '',
        title: '',
        email: '',
        phone: '',
        dob: '',
        gender: '',
        skills: [],
        avatarUrl: '',
        bio: '',
    });

    useFocusEffect(
        React.useCallback(() => {
        const load = async () => {
            if (!auth.currentUser) return;
            try {
            const data = await fetchProfile(auth.currentUser.uid);
            setProfile(data);
            } catch (err) {
            Alert.alert('Error', 'Failed to load profile.');
            }
        };
        load();
        }, [])
    );

    const handleLogout = async () => {
        try {
            await auth.signOut();
            resetTo('Login');
        } catch (err) {
            console.error('Logout error:', err);
        }
    };


    const sections = [
        { type: 'profileCard' },
        {
        type: 'contact',
        rows: [
            { icon: 'mail-outline', label: 'Email', value: profile.email },
            { icon: 'call-outline', label: 'Phone', value: profile.phone },
        ].filter(r => r.value),
        },
        {
        type: 'personal',
        rows: [
            { icon: 'calendar-outline', label: 'Date of Birth', value: profile.dob },
            { icon: 'male-female-outline', label: 'Gender', value: profile.gender },
        ].filter(r => r.value),
        },
        { type: 'bio', value: profile.bio },
        { type: 'skills', items: profile.skills },
    ].filter(section =>
        section.type === 'profileCard' ||
        section.rows?.length > 0 ||
        section.items?.length > 0 ||
        (section.type === 'bio' && section.value)
    );

    const renderItem = ({ item }) => {
        switch (item.type) {
        case 'profileCard':
            return (
            <View style={styles.box}>
                {profile.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
                ) : (
                <View style={[styles.avatar, { backgroundColor: '#D7F7D2' }]} />
                )}
                <Text style={styles.name}>{profile.name || 'Your Name'}</Text>
                <Text style={styles.subtitle}>{profile.title || 'Your Title'}</Text>
                <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditProfile')}>
                <Text style={styles.editText}>Edit Profile</Text>
                </TouchableOpacity>
            </View>
            );
        case 'contact':
        case 'personal':
            return (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                {item.type === 'contact' ? 'Contact Information' : 'Personal Details'}
                </Text>
                {item.rows.map((r, idx) => (
                <View key={idx} style={styles.row}>
                    <Ionicons name={r.icon} size={18} color={TEXT} style={{ marginRight: 10 }} />
                    <Text style={styles.rowLabel}>{r.label}</Text>
                    <Text style={styles.rowValue}>{r.value}</Text>
                </View>
                ))}
            </View>
            );
        case 'bio':
            return (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>About Me</Text>
                <Text style={styles.rowValue}>{item.value}</Text>
            </View>
            );
        case 'skills':
            return (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Skills & Interests</Text>
                <View style={styles.chipsWrap}>
                {item.items.map((s, i) => (
                    <View key={i} style={[styles.chip, { marginRight: 8, marginBottom: 8 }]}>
                    <Text style={styles.chipText}>{s}</Text>
                    </View>
                ))}
                </View>
            </View>
            );
        default:
            return null;
        }
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
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity onPress={handleLogout} style={{ position: 'absolute', right: 16 }}>
                <Ionicons name="log-out-outline" size={22} color={TEXT} />
            </TouchableOpacity>
        </View>
        <FlatList
            data={sections}
            keyExtractor={(_, i) => String(i)}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16, paddingBottom: 96 }}
            ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#fff' },
    header: {
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: TEXT },
    box: {
        borderWidth: 1.5,
        borderColor: BORDER,
        borderRadius: 12,
        padding: 16,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        marginBottom: 12,
    },
    name: { fontSize: 20, fontWeight: '800', color: TEXT, textAlign: 'center' },
    subtitle: { fontSize: 13, color: MUTED, textAlign: 'center', marginTop: 4 },
    editBtn: {
        marginTop: 14,
        height: 44,
        paddingHorizontal: 18,
        borderRadius: 10,
        backgroundColor: PRIMARY,
        alignItems: 'center',
        justifyContent: 'center',
    },
    editText: { color: '#fff', fontWeight: '800' },
    section: {
        borderWidth: 1.5,
        borderColor: BORDER,
        borderRadius: 12,
        padding: 14,
        backgroundColor: '#fff',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: TEXT,
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    rowLabel: { width: 120, color: TEXT, fontWeight: '700' },
    rowValue: { flex: 1, color: TEXT },
    chipsWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    chip: {
        backgroundColor: PRIMARY,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    chipText: { color: '#fff', fontWeight: '800', fontSize: 12 },
});
