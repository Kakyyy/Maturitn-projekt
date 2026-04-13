// Jazyk: TypeScript (TSX)
// Popis: Zdrojový soubor projektu.

// Stránka: Home (Domovská stránka)

import HeaderLogo from '@/components/header-logo';
import MenuButton from '@/components/menu-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { useDrawer } from '@/contexts/DrawerContext';
import { db } from '@/firebase';
import { Link } from 'expo-router';
import { doc, setDoc } from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { openDrawer } = useDrawer();
  const { user, profile } = useAuth();

  // LOGIKA- Lokální stav pro zobrazení denní série v UI. Drží hodnotu, kterou
  // obrazovka zobrazuje uživateli ještě předtím, než se potvrdí nebo přepočítá
  // data z profilu ve Firestore.
  const [openStreak, setOpenStreak] = useState<number>(0);

  // LOGIKA- Formátovaný český datumový řetězec pro hlavní nadpis stránky.
  // Používá se jen pro UI, aby se datum nevytvářelo při každém renderu znovu
  // a aby bylo přizpůsobené českému formátu a lokalizaci.
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

  // LOGIKA- Převod data na stabilní klíč ve formátu YYYY-MM-DD.
  // Tohle je důležité pro porovnání dnů bez ohledu na čas, hodiny nebo minuty.
  function localDateKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // LOGIKA- Posun data o libovolný počet dní.
  // Pomáhá určit, jestli uživatel otevřel aplikaci i včera, a tím navázat
  // nebo resetovat sérii.
  function addDays(date: Date, days: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  // LOGIKA- Načtení série z profilu při změně uživatele nebo profilu.
  // Jakmile se načte profil z autentizace, synchronizujeme lokální stav s tím,
  // co je uložené na serveru, aby UI ukazovalo správné číslo.
  useEffect(() => {
    if (!user) {
      setOpenStreak(0);
      return;
    }

    const current = typeof profile?.openStreak === 'number' ? profile.openStreak : 0;
    setOpenStreak(current);
  }, [user, profile?.openStreak]);

  // LOGIKA- Průběžně zvyšuje sérii otevření aplikace a ukládá ji do Firestore.
  // Tohle je hlavní logika domovské stránky: při otevření aplikace zjistí,
  // jestli je už dnešek započítaný, jestli je možné pokračovat v sérii z včera,
  // nebo jestli se má série resetovat na 1.
  useEffect(() => {
    let cancelled = false;
    async function upsertOpenStreak() {
      if (!user) return;

      const todayKey = localDateKey(new Date());
      const yesterdayKey = localDateKey(addDays(new Date(), -1));
      const prevKey = typeof profile?.lastOpenDate === 'string' ? profile.lastOpenDate : null;
      const prevStreak = typeof profile?.openStreak === 'number' ? profile.openStreak : 0;

      // LOGIKA- Už je započítáno pro dnešek, takže nic nepřepisujeme.
      // Tím zabráníme tomu, aby se stejné otevření aplikace započetlo víckrát.
      if (prevKey === todayKey) return;

      // LOGIKA- Pokud byla aktivita včera, série pokračuje; jinak se resetuje.
      // Kontrola přes yesterdayKey drží sérii jen tehdy, když uživatel opravdu
      // navazuje na předchozí den. Jakmile je mezi tím delší pauza, začíná se
      // znovu od jedničky.
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

  // LOGIKA- Texty odvozené z profilu, aby byla šablona v JSX co nejstručnější.
  // Místo opakovaného psaní podmínek v JSX si připravíme hotové řetězce předem.
  const firstName = (profile?.name || '').trim();
  const greetingName = firstName ? firstName : 'sportovče';

  const goalLabel = (profile?.currentGoal || '').trim() || 'Nastavte si cíl v profilu.';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['left', 'right']}>
        {/* HTML- Horní lišta s menu a názvem obrazovky. Slouží jako rychlý vstup
        // do postranní nabídky a zároveň drží název aktuální sekce nahoře. */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <MenuButton onPress={openDrawer} />
            <ThemedText style={styles.headerTitle}>Domů</ThemedText>
            <View style={styles.headerSpacer} />
          </View>
        </View>

        {/* HTML- Hlavní obsah domovské obrazovky. Tady jsou všechny hlavní akce
        // a přehledové informace, které uživatel potřebuje hned po otevření. */}
        <View style={styles.content}>
          {/* HTML- Hero sekce s pozdravem a aktuálním datem. První vizuální blok
          // na stránce má navodit osobní dojem a ukázat dnešní datum. */}
          <View style={styles.hero}>
            <View style={styles.heroTopRow}>
              <ThemedText style={styles.heroTitle}>Ahoj, {greetingName}</ThemedText>
            </View>
            <View style={styles.heroLogoWrap}>
              <HeaderLogo mode="inline" size={150} />
            </View>
            <ThemedText style={styles.heroSubtitle}>Co dneska chceš dělat?</ThemedText>
            <ThemedText style={styles.heroDate}>{todayLabel}</ThemedText>
          </View>

          {/* HTML- Rychlé vstupy do nejpoužívanějších částí aplikace. Zde jsou
          // dvě nejdůležitější cesty: výběr partie a procházení databáze cviků. */}
          <View style={styles.primaryActions}>
            <Link href={'/(tabs)/muscleselect'} asChild>
              <TouchableOpacity style={StyleSheet.flatten([styles.primaryCard, styles.primaryCardRed])} accessibilityRole="button">
                <ThemedText style={styles.primaryCardTitle}>Vybrat partii</ThemedText>
                <ThemedText style={styles.primaryCardSubtitle}>3D výběr -&gt; doporučené cviky</ThemedText>
              </TouchableOpacity>
            </Link>

            <Link href={'/(tabs)/explore'} asChild>
              <TouchableOpacity style={styles.primaryCard} accessibilityRole="button">
                <ThemedText style={styles.primaryCardTitle}>Procházet cviky</ThemedText>
                <ThemedText style={styles.primaryCardSubtitle}>Databáze cviků podle obtížnosti</ThemedText>
              </TouchableOpacity>
            </Link>
          </View>

          {/* HTML- Přehledové statistiky pro rychlý vizuální feedback. Uživatel
          // tady hned vidí, jestli se jeho aktivita počítá a jak rozsáhlá je
          // databáze cviků v aplikaci. */}
          <View style={styles.statsRow}>
            <View style={styles.statBoxPrimary}>
              <ThemedText style={styles.statLabelSmall}>Dnešní série</ThemedText>
              <ThemedText style={styles.statValue}>{user ? openStreak : '—'}</ThemedText>
              <ThemedText style={styles.statLabel}>po sobě jdoucích dnů v aplikaci</ThemedText>
            </View>
            <View style={styles.statBoxSecondary}>
              <ThemedText style={styles.statLabelSmall}>Databáze</ThemedText>
              <ThemedText style={styles.statValue}>99+</ThemedText>
              <ThemedText style={styles.statLabel}>cviků připravených k použití</ThemedText>
            </View>
          </View>

          {/* HTML- Karta s aktuálním cílem a odkazem na profil. Tohle je místo,
          // kde se zobrazuje osobní nastavení a odkud se dá cíl rychle upravit. */}
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

// CSS- Stylování celé domovské obrazovky v černo-červeném vizuálu aplikace.
// Všechny hodnoty jsou tu natvrdo sladěné s výrazným černým podkladem,
// červeným akcentem a kartami, aby obrazovka působila konzistentně s celou
// aplikací.
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

  hero: { width: '100%', marginBottom: 12, position: 'relative' },
  heroTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start', gap: 8 },
  heroLogoWrap: { position: 'absolute', right: -13, top: -22 },
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
