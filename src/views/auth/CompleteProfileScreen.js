import React, { useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';
import { handleSignup } from '../../controllers/AuthController';
import { validateRequired } from '../../lib/validators';

const CARD_BG = '#F6F7F9';
const BORDER = '#E2E5EA';
const PRIMARY = '#1A73E8';
const TEXT_DARK = '#111827';
const TEXT_MUTED = '#6B7280';

export default function CompleteProfileScreen({ navigation, route }) {
    const { name, email, password } = route.params;
    const [role, setRole] = useState('mentee');
    const [field, setField] = useState(null);
    const [error, setError] = useState('');
    const [open, setOpen] = useState(false);
    const [fields, setFields] = useState([
        { label: 'Product Management', value: 'Product Management' },
        { label: 'Software Engineering', value: 'Software Engineering' },
        { label: 'Data Science', value: 'Data Science' },
        { label: 'UI/UX Design', value: 'UI/UX Design' },
        { label: 'Marketing', value: 'Marketing' },
        { label: 'Finance', value: 'Finance' },
    ]);

    const handleSubmit = async () => {
        setError('');
        if (!validateRequired(field)) {
        setError('Please select a field.');
        return;
        }

        try {
        await handleSignup(name, email, password, role, field);
        navigation.navigate('Login');
        } catch (err) {
        setError(err.message || 'Failed to complete profile.');
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
        <View style={styles.centerWrap}>
            <View style={styles.card}>
            <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ marginBottom: 6, width: 28 }}
            >
                <Ionicons name='chevron-back' size={24} color={TEXT_DARK} />
            </TouchableOpacity>

            <Text style={styles.title}>Complete Your Profile</Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Text style={[styles.label, { marginTop: 14 }]}>Select Your Role</Text>
            <TouchableOpacity style={styles.radioRow} onPress={() => setRole('mentor')}>
                <View style={[styles.radioOuter, role === 'mentor' && styles.radioOuterActive]}>
                {role === 'mentor' ? <View style={styles.radioInner} /> : null}
                </View>
                <Text style={styles.radioText}>Mentor</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.radioRow} onPress={() => setRole('mentee')}>
                <View style={[styles.radioOuter, role === 'mentee' && styles.radioOuterActive]}>
                {role === 'mentee' ? <View style={styles.radioInner} /> : null}
                </View>
                <Text style={styles.radioText}>Mentee</Text>
            </TouchableOpacity>

            <Text style={[styles.label, { marginTop: 16 }]}>Choose Your Field</Text>
            <DropDownPicker
                open={open}
                value={field}
                items={fields}
                setOpen={setOpen}
                setValue={setField}
                setItems={setFields}
                placeholder="Select a field"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                zIndex={1000}
                zIndexInverse={3000}
            />

            <View style={styles.buttonRow}>
                <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => navigation.goBack()}
                >
                <Text style={styles.secondaryBtnText}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                style={[styles.primaryBtn, { opacity: field ? 1 : 0.6 }]}
                onPress={handleSubmit}
                disabled={!field}
                >
                <Text style={styles.primaryBtnText}>Complete Sign-Up</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.bottomRow}>
                <Text style={styles.muted}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.link}>Login</Text>
                </TouchableOpacity>
            </View>
            </View>
        </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#fff' },
    centerWrap: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
    card: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: BORDER,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 16,
        elevation: 2,
        zIndex: 0,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: TEXT_DARK,
        marginBottom: 6,
    },
    error: { color: 'crimson', marginTop: 8 },
    label: { fontSize: 13, color: TEXT_MUTED, marginBottom: 8 },
    radioRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        backgroundColor: '#fff',
    },
    radioOuterActive: { borderColor: PRIMARY },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: PRIMARY,
    },
    radioText: { fontSize: 16, color: TEXT_DARK },
    dropdown: {
        borderColor: BORDER,
        marginTop: 8,
        zIndex: 1000,
    },
    dropdownContainer: {
        borderColor: BORDER,
        zIndex: 1000,
    },
    primaryBtn: {
        flex: 1,
        height: 46,
        backgroundColor: PRIMARY,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 18,
        columnGap: 12,
    },
    secondaryBtn: {
        flex: 1,
        height: 46,
        paddingHorizontal: 16,
        backgroundColor: '#E5E7EB',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryBtnText: {
        color: TEXT_DARK,
        fontWeight: '600',
        fontSize: 16,
    },
    muted: { color: TEXT_MUTED },
    link: { color: PRIMARY, fontWeight: '700' },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
});
