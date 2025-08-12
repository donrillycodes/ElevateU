import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Image, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { subscribeToRequests, acceptRequest, declineRequest } from '../../controllers/MatchController';
import { auth } from '../../services/firebase';

const PRIMARY = '#1A73E8';
const BORDER = '#C7D7E5';
const TEXT = '#0C223A';
const MUTED = '#6B7280';

export default function MentorHomeScreen() {
    const navigation = useNavigation();
    const [requests, setRequests] = useState([]);
    const [statusMap, setStatusMap] = useState({}); // id -> 'processing' | 'accepted' | 'declined'
    const [ready, setReady] = useState(false);      // auth ready flag

    useEffect(() => {
        let stopAuth = null;
        let stopRequests = null;

        stopAuth = onAuthStateChanged(auth, (u) => {
            setReady(true);

            if (stopRequests) {
                stopRequests();
                stopRequests = null;
            }

            if (!u) {
                setRequests([]);
                navigation.replace('Login'); // ✅ Navigate to login when signed out
                return;
            }

            stopRequests = subscribeToRequests(u.uid, setRequests);
        });


        return () => {
        if (stopAuth) stopAuth();
        if (stopRequests) stopRequests();
        };
    }, []);

    const handleLogout = async () => {
        try {
        await signOut(auth);
        // Your root navigator should switch to Auth/Login automatically
        } catch (err) {
        console.error('Logout error:', err);
        Alert.alert('Logout error', err?.message ?? 'Failed to log out.');
        }
    };

    // Accept using the whole item so we can pass name/avatar to chat
    const handleAccept = async (req) => {
        const { id, menteeId, menteeName, menteeAvatarUrl } = req || {};
        try {
        const mentorId = auth.currentUser?.uid;
        if (!mentorId) return Alert.alert('Error', 'User not authenticated.');
        if (!menteeId) return Alert.alert('Error', 'Missing mentee id on this request.');

        setStatusMap((prev) => ({ ...prev, [id]: 'processing' }));

        // Build participantsMeta so ChatList can render instantly
        const participantsMeta = {
            [mentorId]: {
            displayName: auth.currentUser?.displayName || 'You',
            avatarUrl: auth.currentUser?.photoURL || '', // use your stored avatar if different
            },
            [menteeId]: {
            displayName: menteeName || 'Mentee',
            avatarUrl: menteeAvatarUrl || '',
            },
        };

        // acceptRequest now creates/reuses the chat and returns chatId
        const chatId = await acceptRequest(id, mentorId, menteeId, participantsMeta);

        setStatusMap((prev) => ({ ...prev, [id]: 'accepted' }));

        Alert.alert(
            'Approved',
            'Request approved. You can start chatting now.',
            [
            { text: 'Go to chat', onPress: () => navigation.navigate('ChatRoom', { chatId, peerId: menteeId }) },
            { text: 'OK' },
            ]
        );
        } catch (err) {
        console.error('Accept error:', err);
        Alert.alert('Error', err?.message ?? 'Failed to accept request.');
        setStatusMap((prev) => {
            const copy = { ...prev };
            delete copy[req?.id];
            return copy;
        });
        }
    };

    const handleDecline = async (id) => {
        try {
        setStatusMap((prev) => ({ ...prev, [id]: 'processing' }));
        await declineRequest(id);
        setStatusMap((prev) => ({ ...prev, [id]: 'declined' }));
        } catch (err) {
        console.error('Decline error:', err);
        Alert.alert('Error', err?.message ?? 'Failed to decline request.');
        setStatusMap((prev) => {
            const copy = { ...prev };
            delete copy[id];
            return copy;
        });
        }
    };

    const renderItem = ({ item }) => {
        const status = statusMap[item.id];
        const isProcessing = status === 'processing';
        const displayName = (item.menteeName || item.menteeDisplayName || '').trim();

        return (
        <View style={styles.cardOuter}>
            <View style={styles.cardInner}>
            <View style={styles.cardHeader}>
                <Image
                source={
                    item.menteeAvatarUrl
                    ? { uri: item.menteeAvatarUrl }
                    : require('../../../assets/Layer1.png')
                }
                style={styles.avatar}
                />
                <View style={{ flex: 1 }}>
                <Text style={styles.name}>{displayName || 'Loading…'}</Text>
                <Text style={styles.when}>
                    {item.timestamp?.toDate
                    ? item.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'Recent'}
                </Text>
                </View>
            </View>

            <Text style={styles.msg}>{item.message || 'No message provided.'}</Text>

            {status === 'accepted' ? (
                <Text style={styles.statusAccepted}>✅ Accepted</Text>
            ) : status === 'declined' ? (
                <Text style={styles.statusDeclined}>❌ Declined</Text>
            ) : (
                <View style={styles.actionRow}>
                <TouchableOpacity
                    style={[styles.acceptBtn, isProcessing && styles.btnDisabled]}
                    disabled={isProcessing}
                    onPress={() => handleAccept(item)}
                >
                    <Text style={styles.acceptText}>
                    {isProcessing ? 'Please wait…' : 'Accept Request'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.declineBtn, isProcessing && styles.btnDisabled]}
                    disabled={isProcessing}
                    onPress={() => handleDecline(item.id)}
                >
                    <Text style={styles.declineText}>
                    {isProcessing ? 'Please wait…' : 'Decline'}
                    </Text>
                </TouchableOpacity>
                </View>
            )}
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
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Home</Text>
            <TouchableOpacity onPress={handleLogout} style={{ position: 'absolute', right: 16 }}>
            <Ionicons name="log-out-outline" size={22} color={TEXT} />
            </TouchableOpacity>
        </View>

        <FlatList
            data={requests}
            keyExtractor={(i) => (i.id ? String(i.id) : Math.random().toString(36))}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 16, paddingBottom: 90 }}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            ListHeaderComponent={
            requests.length > 0 ? <Text style={styles.pageTitle}>Mentee Requests</Text> : null
            }
            ListEmptyComponent={
            <View style={{ padding: 24, alignItems: 'center' }}>
                <Text style={{ color: MUTED }}>
                {ready ? 'No mentee requests yet.' : 'Loading…'}
                </Text>
            </View>
            }
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
    pageTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: TEXT,
        marginBottom: 8,
    },
    cardOuter: {
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: BORDER,
    },
    cardInner: { padding: 14 },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 10,
    },
    avatar: { width: 36, height: 36, borderRadius: 18 },
    name: { fontSize: 16, fontWeight: '800', color: TEXT },
    when: { fontSize: 12, color: MUTED, marginTop: 2 },
    msg: {
        fontSize: 14,
        color: TEXT,
        lineHeight: 20,
        marginTop: 6,
        marginBottom: 10,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 4,
    },
    acceptBtn: {
        flex: 1,
        height: 44,
        backgroundColor: PRIMARY,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    acceptText: { color: '#fff', fontWeight: '800' },
    declineBtn: {
        flex: 1,
        height: 44,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: PRIMARY,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    declineText: { color: PRIMARY, fontWeight: '800' },
    statusAccepted: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: '700',
        color: PRIMARY,
    },
    statusDeclined: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: '700',
        color: MUTED,
    },
    btnDisabled: { opacity: 0.6 },
});

// mentor home screen

