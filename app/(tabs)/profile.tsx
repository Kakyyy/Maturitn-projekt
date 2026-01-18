// Stránka: Profile (Uživatelský profil)

import MenuButton from '@/components/menu-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useDrawer } from '@/contexts/DrawerContext';
import { auth, db } from '@/firebase';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { openDrawer } = useDrawer();
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [goal, setGoal] = useState<'strength' | 'mass' | 'endurance' | ''>('');
  const [loading, setLoading] = useState(true);

  // Původní hodnoty pro detekci změn
  const [originalData, setOriginalData] = useState({
    gender: 'male' as 'male' | 'female',
    name: '',
    surname: '',
    age: '',
    weight: '',
    height: '',
    goal: '' as 'strength' | 'mass' | 'endurance' | '',
  });

  // Načtení dat z Firestore při otevření stránky
  useEffect(() => {
    loadProfile();
  }, []);

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
            goal: (data.goal || '') as 'strength' | 'mass' | 'endurance' | '',
          };
          
          setGender(loadedData.gender);
          setName(loadedData.name);
          setSurname(loadedData.surname);
          setAge(loadedData.age);
          setWeight(loadedData.weight);
          setHeight(loadedData.height);
          setGoal(loadedData.goal);
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
      height !== originalData.height ||
      goal !== originalData.goal
    );
  };

  // Uložení dat do Firestore
  const handleSave = async () => {
    if (!hasChanges()) return; // Neukládat, pokud nejsou změny
    
    try {
      const user = auth.currentUser;
      if (user) {
        await setDoc(
          doc(db, 'users', user.uid),
          {
          gender,
          name,
          surname,
          age: age ? parseInt(age) : null,
          weight: weight ? parseFloat(weight) : null,
          height: height ? parseFloat(height) : null,
          goal,
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
          goal,
        });
        
        Alert.alert('Úspěch', 'Profil byl úspěšně uložen');
        router.back();
      }
    } catch (error) {
      console.error('Chyba při ukládání profilu:', error);
      Alert.alert('Chyba', 'Nepodařilo se uložit profil');
    }
  };

  const goals = [
    { key: 'strength', label: 'Síla', icon: 'fitness-center' },
    { key: 'mass', label: 'Svalová hmota', icon: 'trending-up' },
    { key: 'endurance', label: 'Vytrvalost', icon: 'directions-run' },
  ];

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

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Tréninkový cíl</ThemedText>
          <View style={styles.goalsContainer}>
            {goals.map((g) => (
              <TouchableOpacity
                key={g.key}
                style={[
                  styles.goalCard,
                  goal === g.key && styles.goalCardActive,
                ]}
                onPress={() => setGoal(g.key as any)}
              >
                <MaterialIcons
                  name={g.icon as any}
                  size={32}
                  color={goal === g.key ? '#fff' : '#666'}
                />
                <ThemedText
                  style={[
                    styles.goalText,
                    goal === g.key && styles.goalTextActive,
                  ]}
                >
                  {g.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity 
          style={[
            styles.saveButton,
            !hasChanges() && styles.saveButtonDisabled
          ]} 
          onPress={handleSave}
          disabled={!hasChanges()}
        >
          <ThemedText style={styles.saveButtonText}>Uložit změny</ThemedText>
        </TouchableOpacity>

        <View style={styles.statsSection}>
          <ThemedText style={styles.sectionTitle}>Statistiky</ThemedText>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <ThemedText style={styles.statNumber}>0</ThemedText>
              <ThemedText style={styles.statLabel}>Tréninků</ThemedText>
            </View>
            <View style={styles.statCard}>
              <ThemedText style={styles.statNumber}>0</ThemedText>
              <ThemedText style={styles.statLabel}>Cviků</ThemedText>
            </View>
            <View style={styles.statCard}>
              <ThemedText style={styles.statNumber}>0</ThemedText>
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
  goalsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  goalCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  goalCardActive: {
    backgroundColor: '#D32F2F',
    borderColor: '#D32F2F',
  },
  goalText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  goalTextActive: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#D32F2F',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  saveButtonDisabled: {
    backgroundColor: '#666',
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
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
