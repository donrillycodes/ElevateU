import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';

import { auth } from '../services/firebase';
import { checkRole } from '../services/userService';
import { navigationRef } from '../services/navigationService';

// Screens
import LoginScreen from '../views/auth/LoginScreen';
import SignupScreen from '../views/auth/SignupScreen';
import CompleteProfileScreen from '../views/auth/CompleteProfileScreen';
import ForgotPasswordScreen from '../views/auth/ForgotPasswordScreen';
import EditProfileScreen from '../views/shared/EditProfileScreen';
import ChatRoomScreen from '../views/shared/ChatRoomScreen';
import ProfileDetailsScreen from '../views/mentee/ProfileDetailsScreen';
import MenteeTabs from './MenteeTabs';
import MentorTabs from './MentorTabs';
import Redirector from '../views/auth/Redirector';

const Stack = createStackNavigator();

export default function AppNavigator() {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (u) => {
        if (u) {
            setUser(u);
            try {
            const r = await checkRole(u.uid);
            setRole(r);
            } catch (err) {
            console.error('Error checking role:', err);
            }
        } else {
            setUser(null);
            setRole(null);
        }
        setLoading(false);
        });
        return unsubscribe;
    }, []);

    if (loading) {
        return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#1A73E8" />
        </View>
        );
    }

    return (
        <NavigationContainer ref={navigationRef}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {/* Auth Screens */}
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Signup" component={SignupScreen} />
                <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
                <Stack.Screen name="Forgot" component={ForgotPasswordScreen} />

                {/* Shared Screens */}
                <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />

                {/* Role-Based Tabs */}
                <Stack.Screen name="MenteeTabs" component={MenteeTabs} />
                <Stack.Screen name="MentorTabs" component={MentorTabs} />
                <Stack.Screen name="ProfileDetails" component={ProfileDetailsScreen} />

                {/* Redirector */}
                <Stack.Screen name="Redirector" component={Redirector} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
