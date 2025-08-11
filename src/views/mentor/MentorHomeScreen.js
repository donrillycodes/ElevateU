import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, FlatList,Alert, Image, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { subscribeToRequests, acceptRequest, declineRequest, } from '../../controllers/MatchController';
import { initiateChat } from '../../controllers/ChatController';
import { auth } from '../../services/firebase';

const PRIMARY = '#1A73E8';
const BORDER = '#C7D7E5';
const TEXT = '#0C223A';
const MUTED = '#6B7280';

export default function MentorHomeScreen() {
    const [requests, setRequests] = useState([]);
    const [statusMap, setStatusMap] = useState({});

    useEffect(() => {
        if (!auth.currentUser) {
        Alert.alert('Error', 'User not authenticated.');
        return;
        }
        const unsubscribe = subscribeToRequests(auth.currentUser.uid, setRequests);
        return unsubscribe;
    }, []);

    const handleLogout = async () => {
        try {
            await auth.signOut();
            resetTo('Login');
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    const handleAccept = async (id, menteeId) => {
        try {
            console.log('Current UID:', auth.currentUser.uid);
            console.log('Request ID:', item.id);
            console.log('Request mentorId:', item.mentorId);


        await acceptRequest(id, auth.currentUser.uid, menteeId);
        await initiateChat(auth.currentUser.uid, menteeId, 'You’ve been matched! Start chatting now.');
        setStatusMap((prev) => ({ ...prev, [id]: 'accepted' }));
        } catch (err) {
        console.error('Accept error:', err);
        Alert.alert('Error', 'Failed to accept request.');
        }
    };

    const handleDecline = async (id) => {
        try {
        await declineRequest(id);
        setStatusMap((prev) => ({ ...prev, [id]: 'declined' }));
        } catch (err) {
        Alert.alert('Error', 'Failed to decline request.');
        }
    };

    const renderItem = ({ item }) => {
        const status = statusMap[item.id];

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
                <Text style={styles.name}>{item.menteeName || 'Unknown'}</Text>
                <Text style={styles.when}>
                    {item.timestamp?.toDate
                    ? item.timestamp.toDate().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        })
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
                    style={styles.acceptBtn}
                    onPress={() => handleAccept(item.id, item.menteeId)}
                >
                    <Text style={styles.acceptText}>Accept Request</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.declineBtn}
                    onPress={() => handleDecline(item.id)}
                >
                    <Text style={styles.declineText}>Decline</Text>
                </TouchableOpacity>
                </View>
            )}
            </View>
        </View>
        );
    };

    return (
        <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Home</Text>
            <TouchableOpacity onPress={handleLogout} style={{ position: 'absolute', right: 16 }}>
                <Ionicons name="log-out-outline" size={22} color={TEXT} />
            </TouchableOpacity>
        </View>
        <FlatList
            data={requests}
            keyExtractor={(i) => i.id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 16, paddingBottom: 90 }}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            ListHeaderComponent={
            requests.length > 0 ? (
                <Text style={styles.pageTitle}>Mentee Requests</Text>
            ) : null
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
});
