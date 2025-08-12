import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../../services/firebase';
import { checkRole } from '../../services/userService';

export default function Redirector() {
    const navigation = useNavigation();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (!user) {
                navigation.replace('Login');
                return;
            }

            try {
                const role = await checkRole(user.uid);
                if (role === 'mentee') {
                    navigation.replace('MenteeTabs');
                } else if (role === 'mentor') {
                    navigation.replace('MentorTabs');
                } else {
                    navigation.replace('CompleteProfile');
                }
            } catch (err) {
                console.error('Redirect error:', err);
                navigation.replace('Login');
            }
        });

        return unsubscribe;
    }, []);


    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1A73E8" />
        </View>
    );
}
