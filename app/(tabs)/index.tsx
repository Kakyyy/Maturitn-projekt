// Stránka: Home (Domovská stránka)

import ExerciseData from '@/app/exercise/data';
import MenuButton from '@/components/menu-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { useDrawer } from '@/contexts/DrawerContext';
import { db } from '@/firebase';
import { Link } from 'expo-router';
import { doc, setDoc } from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const { openDrawer } = useDrawer();
  const { user, profile } = useAuth();

  const [openStreak, setOpenStreak] = useState<number>(0);

  const exerciseCount = useMemo(() => Object.values(ExerciseData).flat().length, []);
  const todayLabel = useMemo(() => {
    const date = new Date();
    try {
      return new Intl.DateTimeFormat('cs-CZ', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(date);
    } catch {
      try {
        return date.toLocaleDateString('cs-CZ');
      } catch {
        return date.toDateString();
      }
    }
  }, []);

  function localDateKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function addDays(date: Date, days: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  useEffect(() => {
    if (!user) {
      setOpenStreak(0);
      return;
    }

    const current = typeof profile?.openStreak === 'number' ? profile.openStreak : 0;
    setOpenStreak(current);
  }, [user, profile?.openStreak]);

  useEffect(() => {
    let cancelled = false;
    async function upsertOpenStreak() {
      if (!user) return;

      const todayKey = localDateKey(new Date());
      const yesterdayKey = localDateKey(addDays(new Date(), -1));
      const prevKey = typeof profile?.lastOpenDate === 'string' ? profile.lastOpenDate : null;
      const prevStreak = typeof profile?.openStreak === 'number' ? profile.openStreak : 0;

      // Already counted today → no update.
      if (prevKey === todayKey) return;

      const nextStreak = !prevKey ? 1 : prevKey === yesterdayKey ? Math.max(1, prevStreak + 1) : 1;

      try {
        await setDoc(
          doc(db, 'users', user.uid),
          {
            lastOpenDate: todayKey,
            openStreak: nextStreak,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        if (!cancelled) setOpenStreak(nextStreak);
      } catch (e) {
        console.error('Home: upsert open streak error', e);
      }
    }

    upsertOpenStreak();
    return () => {
      cancelled = true;
    };
  }, [user, profile?.lastOpenDate, profile?.openStreak]);

  const firstName = (profile?.name || '').trim();
  const greetingName = firstName ? firstName : 'sportovče';

  const goalLabel = (() => {
    if (!profile?.goal) return 'Začni tím, že si nastavíš cíl v profilu.';
    if (profile.goal === 'strength') return 'Priorita: síla · těžší váhy, méně opakování.';
    if (profile.goal === 'mass') return 'Priorita: svalová hmota · střední váhy, 8–12 opakování.';
    if (profile.goal === 'endurance') return 'Priorita: vytrvalost · lehčí váhy, více opakování.';
    return 'Uprav si trénink podle sebe v profilu.';
  })();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <MenuButton onPress={openDrawer} />
            <ThemedText style={styles.headerTitle}>Domů</ThemedText>
            <View style={styles.headerSpacer} />
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.hero}>
            <ThemedText style={styles.heroTitle}>Ahoj, {greetingName}</ThemedText>
            <ThemedText style={styles.heroSubtitle}>Co dneska chceš dělat?</ThemedText>
            <ThemedText style={styles.heroDate}>{todayLabel}</ThemedText>
          </View>

          <View style={styles.primaryActions}>
            <Link href={'/(tabs)/muscleselect'} asChild>
              <TouchableOpacity style={[styles.primaryCard, styles.primaryCardRed]} accessibilityRole="button">
                <ThemedText style={styles.primaryCardTitle}>Vybrat partii</ThemedText>
                <ThemedText style={styles.primaryCardSubtitle}>3D výběr → doporučené cviky</ThemedText>
              </TouchableOpacity>
            </Link>

            <Link href={'/(tabs)/explore'} asChild>
              <TouchableOpacity style={styles.primaryCard} accessibilityRole="button">
                <ThemedText style={styles.primaryCardTitle}>Procházet cviky</ThemedText>
                <ThemedText style={styles.primaryCardSubtitle}>Databáze cviků podle obtížnosti</ThemedText>
              </TouchableOpacity>
            </Link>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBoxPrimary}>
              <ThemedText style={styles.statLabelSmall}>Dnešní série</ThemedText>
              <ThemedText style={styles.statValue}>{user ? openStreak : '—'}</ThemedText>
              <ThemedText style={styles.statLabel}>po sobě jdoucích dní v aplikaci</ThemedText>
            </View>
            <View style={styles.statBoxSecondary}>
              <ThemedText style={styles.statLabelSmall}>Databáze</ThemedText>
              <ThemedText style={styles.statValue}>{exerciseCount}</ThemedText>
              <ThemedText style={styles.statLabel}>cviků připravených k použití</ThemedText>
            </View>
          </View>

          <View style={styles.goalCard}>
            <View style={styles.goalHeaderRow}>
              <ThemedText style={styles.goalTitle}>Tvůj aktuální cíl</ThemedText>
              <Link href={'/(tabs)/profile'} asChild>
                <TouchableOpacity>
                  <ThemedText style={styles.goalEditLink}>upravit profil</ThemedText>
                </TouchableOpacity>
              </Link>
            </View>
            <ThemedText style={styles.goalDescription}>{goalLabel}</ThemedText>
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: {
    backgroundColor: '#D32F2F',
    paddingTop: 44,
    paddingBottom: 14,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff', flex: 1, textAlign: 'center' },
  headerSpacer: { width: 40 },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 18, paddingBottom: 18, gap: 14 },

  hero: { width: '100%', marginBottom: 12 },
  heroTitle: { fontSize: 26, lineHeight: 34, paddingBottom: 2, fontWeight: '800', color: '#fff', marginBottom: 4 },
  heroSubtitle: { fontSize: 15, color: '#AAA', opacity: 0.95 },
  heroDate: { fontSize: 13, color: '#888', marginTop: 6 },

  primaryActions: { width: '100%', gap: 12, marginBottom: 12 },
  primaryCard: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  primaryCardRed: { backgroundColor: '#D32F2F', borderColor: '#B71C1C' },
  primaryCardTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 2 },
  primaryCardSubtitle: { color: '#fff', fontSize: 13, opacity: 0.85 },

  statsRow: { width: '100%', flexDirection: 'row', gap: 12 },
  statBoxPrimary: {
    flex: 1,
    backgroundColor: '#1b1b1b',
    borderWidth: 1,
    borderColor: '#D32F2F',
    borderRadius: 14,
    padding: 14,
  },
  statBoxSecondary: {
    flex: 1,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 14,
    padding: 14,
  },
  statValue: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 2 },
  statLabel: { color: '#888', fontSize: 12 },
  statLabelSmall: { color: '#bbb', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },

  goalCard: {
    width: '100%',
    backgroundColor: '#111',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  goalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  goalTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  goalEditLink: { color: '#D32F2F', fontSize: 13, fontWeight: '600' },
  goalDescription: { color: '#ccc', fontSize: 13, lineHeight: 18 },
});