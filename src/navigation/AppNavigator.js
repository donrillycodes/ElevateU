import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { auth } from '../services/firebase';
import { checkRole } from '../services/userService';
import MenteeTabs from './MenteeTabs';
import MentorTabs from './MentorTabs';
import LoginScreen from '../views/auth/LoginScreen';
import SignupScreen from '../views/auth/SignupScreen';
import CompleteProfileScreen from '../views/auth/CompleteProfileScreen';
import ForgotPasswordScreen from '../views/auth/ForgotPasswordScreen';
import EditProfileScreen from '../views/shared/EditProfileScreen';
import ChatRoomScreen from '../views/shared/ChatRoomScreen';
import ProfileDetailsScreen from '../views/mentee/ProfileDetailsScreen';
import { ActivityIndicator, View } from 'react-native';
import { navigationRef } from '../services/navigationService';

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
            {user ? (
            role ? (
                role === 'mentee' ? (
                <>
                    <Stack.Screen name="MenteeTabs" component={MenteeTabs} />
                    <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
                    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                    <Stack.Screen name="ProfileDetails" component={ProfileDetailsScreen} />
                </>
                ) : (
                <>
                    <Stack.Screen name="MentorTabs" component={MentorTabs} />
                    <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
                    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                </>
                )
            ) : (
                <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
            )
            ) : (
            <>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Signup" component={SignupScreen} />
                <Stack.Screen name="Forgot" component={ForgotPasswordScreen} />
            </>
            )}
        </Stack.Navigator>
        </NavigationContainer>
    );
}
