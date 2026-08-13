import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.primary,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.textOnPrimary,
        headerTitleStyle: {
          fontFamily: Fonts.family.bold,
          fontSize: Fonts.size.xl,
        },
        tabBarActiveTintColor: theme.tabBarActive,
        tabBarInactiveTintColor: theme.tabBarInactive,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: 75,
          paddingBottom: 20,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: Fonts.size.xs,
          fontFamily: Fonts.family.bold,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Peso',
          tabBarLabel: 'Peso',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="scale-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="medications"
        options={{
          title: 'Medicações',
          tabBarLabel: 'Medicações',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="medkit-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Histórico',
          tabBarLabel: 'Histórico',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}