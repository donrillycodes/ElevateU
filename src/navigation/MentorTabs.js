import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import MentorHomeScreen from '../views/mentor/MentorHomeScreen';
import ChatListScreen from '../views/shared/ChatListScreen';
import UserProfileScreen from '../views/shared/UserProfileScreen';

const Tab = createBottomTabNavigator();

export default function MenteeTabs() {
    return (
        <Tab.Navigator screenOptions={{
            tabBarActiveTintColor: '#1A73E8',
            tabBarInactiveTintColor: '#6B7280',
            tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#E5E7EB' },
            headerShown: false,
            }}
        >
            <Tab.Screen name="Home" component={MentorHomeScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={22} color={color} /> }} />
            <Tab.Screen name="Chats" component={ChatListScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="chatbubbles-outline" size={22} color={color} /> }} />
            <Tab.Screen name="Profile" component={UserProfileScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="person-circle-outline" size={22} color={color} /> }} />
        </Tab.Navigator>
    );
}