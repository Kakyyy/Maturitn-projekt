// Stránka: Tabs Layout (Layout s drawer navigací)

import DrawerMenu from '@/components/drawer-menu';
import { DrawerProvider, useDrawer } from '@/contexts/DrawerContext';
import { Stack } from 'expo-router';
import React from 'react';

function LayoutContent() {
  const { isOpen, closeDrawer } = useDrawer();

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="explore" />
        <Stack.Screen name="muscleselect/index" />
        <Stack.Screen name="new-workout" />
        <Stack.Screen name="profile" />
      </Stack>
      
      <DrawerMenu visible={isOpen} onClose={closeDrawer} />
    </>
  );
}

// Layout pro aplikaci s drawer menu místo spodní navigační lišty
export default function TabLayout() {
  return (
    <DrawerProvider>
      <LayoutContent />
    </DrawerProvider>
  );
}
