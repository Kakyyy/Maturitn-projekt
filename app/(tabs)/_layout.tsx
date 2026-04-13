// Jazyk: TypeScript (TSX)
// Popis: Zdrojový soubor projektu.

// Stránka: Tabs Layout (Layout s drawer navigací)
// LOGIKA- Tohle je společný obal všech obrazovek v této složce. Vkládá sem
// drawer navigaci a zároveň hlídá, jaké routy jsou dostupné v layoutu.

import DrawerMenu from '@/components/drawer-menu';
import { DrawerProvider, useDrawer } from '@/contexts/DrawerContext';
import { Stack } from 'expo-router';
import React from 'react';

function LayoutContent() {
  const { isOpen, closeDrawer } = useDrawer();

  return (
    <>
      {/* HTML- Stack navigace pro jednotlivé obrazovky v sekci tabs. */}
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="explore" />
        <Stack.Screen name="muscleselect/index" />
        <Stack.Screen name="new-workout" />
        <Stack.Screen name="history" />
        <Stack.Screen name="profile" />
      </Stack>
      
      {/* HTML- Přes celý layout se vykresluje vlastní drawer menu. */}
      <DrawerMenu visible={isOpen} onClose={closeDrawer} />
    </>
  );
}

// LOGIKA- Vnější provider, který zpřístupní stav draweru všem screenům uvnitř.
export default function TabLayout() {
  return (
    <DrawerProvider>
      <LayoutContent />
    </DrawerProvider>
  );
}

