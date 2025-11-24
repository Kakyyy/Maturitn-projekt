// Import komponent, ikon a konfigurace
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Layout pro spodní navigační lištu (tab bar) s 4 záložkami
export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Domů',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />

        <Tabs.Screen
          name="explore"
          options={{
            title: 'Hledat',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
          }}
        />

        <Tabs.Screen
          name="muscleselect/index"
          options={{
            tabBarLabel: 'Výběr cviků',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="fitness-center" size={26} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="new-workout"
          options={{
            title: 'Nový',
            tabBarLabel: 'Nový',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="add" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({});
