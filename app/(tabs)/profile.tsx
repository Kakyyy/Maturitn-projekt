// Stránka: Profile (Uživatelský profil)

import MenuButton from '@/components/menu-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useDrawer } from '@/contexts/DrawerContext';
import { auth, db } from '@/firebase';
import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

function toDayKey(value: any): string | null {
  if (!value) return null;

  let date: Date | null = null;
  if (typeof value?.toMillis === 'function') {
    date = new Date(value.toMillis());
  } else if (typeof value?.seconds === 'number') {
    date = new Date(value.seconds * 1000);
  } else if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) date = parsed;
  }

  if (!date) return null;
  return date.toISOString().slice(0, 10);
}

function toTimestampMs(value: any): number {
  if (!value) return 0;
  if (typeof value?.toMillis === 'function') return value.toMillis();
  if (typeof value?.seconds === 'number') return value.seconds * 1000;
  if (typeof value === 'string') {
    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

export default function ProfileScreen() {
  const { openDrawer } = useDrawer();
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ workouts: 0, exercises: 0, days: 0 });

  // Původní hodnoty pro detekci změn
  const [originalData, setOriginalData] = useState({
    gender: 'male' as 'male' | 'female',
    name: '',
    surname: '',
    age: '',
    weight: '',
    height: '',
  });

  // Načtení dat z Firestore při otevření stránky
  useEffect(() => {
    loadProfile();
    loadWorkoutStats();
  }, []);

  const loadWorkoutStats = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const workoutsQuery = query(collection(db, 'workouts'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(workoutsQuery);

      const uniqueBySignature = new Map<string, any>();
      const dayKeys = new Set<string>();

      querySnapshot.forEach((workoutDoc) => {
        const data = workoutDoc.data();
        const exercises = (Array.isArray(data.exercises) ? data.exercises : []).map((ex: any) => ({
          id: ex.exerciseId,
          sets: ex.sets ?? 0,
          reps: ex.reps ?? 0,
          weight: ex.weight ?? 0,
        }));

        const signature = JSON.stringify({
          name: data.name || '',
          exercises,
        });

        const candidate = {
          exercisesCount: exercises.length,
          dayKey: toDayKey(data.createdAt) ?? toDayKey(data.updatedAt),
          lastChangedAtMs: toTimestampMs(data.updatedAt) || toTimestampMs(data.createdAt),
        };

        const existing = uniqueBySignature.get(signature);
        if (!existing || candidate.lastChangedAtMs > existing.lastChangedAtMs) {
          uniqueBySignature.set(signature, candidate);
        }
      });

      let exercisesCount = 0;
      uniqueBySignature.forEach((item) => {
        exercisesCount += item.exercisesCount;
        if (item.dayKey) dayKeys.add(item.dayKey);
      });

      setStats({
        workouts: uniqueBySignature.size,
        exercises: exercisesCount,
        days: dayKeys.size,
      });
    } catch (error) {
      console.error('Chyba při načítání statistik:', error);
    }
  };

  const loadProfile = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          const loadedData = {
            gender: (data.gender === 'female' ? 'female' : 'male') as 'male' | 'female',
            name: data.name || '',
            surname: data.surname || '',
            age: data.age?.toString() || '',
            weight: data.weight?.toString() || '',
            height: data.height?.toString() || '',
          };
          
          setGender(loadedData.gender);
          setName(loadedData.name);
          setSurname(loadedData.surname);
          setAge(loadedData.age);
          setWeight(loadedData.weight);
          setHeight(loadedData.height);
          setOriginalData(loadedData);
        }
      }
    } catch (error) {
      console.error('Chyba při načítání profilu:', error);
      Alert.alert('Chyba', 'Nepodařilo se načíst profil');
    } finally {
      setLoading(false);
    }
  };

  // Kontrola, zda byly provedeny změny
  const hasChanges = () => {
    return (
      gender !== originalData.gender ||
      name !== originalData.name ||
      surname !== originalData.surname ||
      age !== originalData.age ||
      weight !== originalData.weight ||
      height !== originalData.height
    );
  };

  // Auto-uložení dat do Firestore
  const persistProfile = async () => {
    if (!hasChanges() || loading) return;

    try {
      const user = auth.currentUser;
      if (user) {
        setSaveState('saving');
        await setDoc(
          doc(db, 'users', user.uid),
          {
          gender,
          name,
          surname,
          age: age ? parseInt(age) : null,
          weight: weight ? parseFloat(weight) : null,
          height: height ? parseFloat(height) : null,
          email: user.email,
          updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
        
        // Aktualizovat původní data po uložení
        setOriginalData({
          gender,
          name,
          surname,
          age,
          weight,
          height,
        });
        setSaveState('saved');
      }
    } catch (error) {
      console.error('Chyba při ukládání profilu:', error);
      setSaveState('error');
    }
  };

  useEffect(() => {
    if (loading || !hasChanges()) return;

    const timer = setTimeout(() => {
      persistProfile();
    }, 700);

    return () => clearTimeout(timer);
  }, [gender, name, surname, age, weight, height, loading]);

  const saveStatusText =
    saveState === 'saving'
      ? 'Ukládám...'
      : saveState === 'saved'
        ? 'Uloženo'
        : saveState === 'error'
          ? 'Chyba při ukládání'
          : '';

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <MenuButton onPress={openDrawer} />
          <ThemedText style={styles.headerTitle}>Profil</ThemedText>
          <View style={styles.headerSpacer} />
        </View>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>

        <View style={styles.section}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Pohlaví</ThemedText>
            <View style={styles.genderRow}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === 'male' && styles.genderButtonActive,
                ]}
                onPress={() => setGender('male')}
                disabled={loading}
              >
                <ThemedText
                  style={[
                    styles.genderButtonText,
                    gender === 'male' && styles.genderButtonTextActive,
                  ]}
                >
                  Muž
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === 'female' && styles.genderButtonActive,
                ]}
                onPress={() => setGender('female')}
                disabled={loading}
              >
                <ThemedText
                  style={[
                    styles.genderButtonText,
                    gender === 'female' && styles.genderButtonTextActive,
                  ]}
                >
                  Žena
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <ThemedText style={styles.label}>Jméno</ThemedText>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Zadejte jméno"
                placeholderTextColor="#666"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <ThemedText style={styles.label}>Příjmení</ThemedText>
              <TextInput
                style={styles.input}
                value={surname}
                onChangeText={setSurname}
                placeholder="Zadejte příjmení"
                placeholderTextColor="#666"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <ThemedText style={styles.label}>Věk</ThemedText>
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                placeholder="0"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <ThemedText style={styles.label}>Výška (cm)</ThemedText>
              <TextInput
                style={styles.input}
                value={height}
                onChangeText={setHeight}
                placeholder="0"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <ThemedText style={styles.label}>Váha (kg)</ThemedText>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                placeholder="0"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {saveStatusText ? <ThemedText style={styles.saveStatus}>{saveStatusText}</ThemedText> : null}

        <View style={styles.statsSection}>
          <ThemedText style={styles.sectionTitle}>Statistiky</ThemedText>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <ThemedText style={styles.statNumber}>{stats.workouts}</ThemedText>
              <ThemedText style={styles.statLabel}>Tréninků</ThemedText>
            </View>
            <View style={styles.statCard}>
              <ThemedText style={styles.statNumber}>{stats.exercises}</ThemedText>
              <ThemedText style={styles.statLabel}>Cviků</ThemedText>
            </View>
            <View style={styles.statCard}>
              <ThemedText style={styles.statNumber}>{stats.days}</ThemedText>
              <ThemedText style={styles.statLabel}>Dnů</ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ccc',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#fff',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: '#D32F2F',
    borderColor: '#D32F2F',
  },
  genderButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  genderButtonTextActive: {
    color: '#fff',
  },
  saveStatus: {
    color: '#999',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
    marginTop: -8,
    marginBottom: 24,
  },
  statsSection: {
    marginTop: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#D32F2F',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
  },
});
