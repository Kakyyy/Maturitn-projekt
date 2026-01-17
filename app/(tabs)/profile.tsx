// Stránka: Profile (Uživatelský profil)

import MenuButton from '@/components/menu-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useDrawer } from '@/contexts/DrawerContext';
import { auth, db } from '@/firebase';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { openDrawer } = useDrawer();
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [goal, setGoal] = useState<'strength' | 'mass' | 'endurance' | ''>('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Původní hodnoty pro detekci změn
  const [originalData, setOriginalData] = useState({
    name: '',
    surname: '',
    age: '',
    weight: '',
    height: '',
    goal: '' as 'strength' | 'mass' | 'endurance' | '',
    profileImage: null as string | null,
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
            name: data.name || '',
            surname: data.surname || '',
            age: data.age?.toString() || '',
            weight: data.weight?.toString() || '',
            height: data.height?.toString() || '',
            goal: (data.goal || '') as 'strength' | 'mass' | 'endurance' | '',
            profileImage: data.profileImage || null,
          };
          
          setName(loadedData.name);
          setSurname(loadedData.surname);
          setAge(loadedData.age);
          setWeight(loadedData.weight);
          setHeight(loadedData.height);
          setGoal(loadedData.goal);
          setProfileImage(loadedData.profileImage);
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
      name !== originalData.name ||
      surname !== originalData.surname ||
      age !== originalData.age ||
      weight !== originalData.weight ||
      height !== originalData.height ||
      goal !== originalData.goal ||
      profileImage !== originalData.profileImage
    );
  };

  // Uložení dat do Firestore
  const handleSave = async () => {
    if (!hasChanges()) return; // Neukládat, pokud nejsou změny
    
    try {
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, 'users', user.uid), {
          name,
          surname,
          age: age ? parseInt(age) : null,
          weight: weight ? parseFloat(weight) : null,
          height: height ? parseFloat(height) : null,
          goal,
          profileImage,
          email: user.email,
          updatedAt: new Date().toISOString(),
        });
        
        // Aktualizovat původní data po uložení
        setOriginalData({
          name,
          surname,
          age,
          weight,
          height,
          goal,
          profileImage,
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

  const handleImagePick = async () => {
    try {
      // Požádat o oprávnění k přístupu k fotogalerii
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Oprávnění odmítnuto', 'Pro výběr profilové fotky potřebujeme přístup k vašim fotkám.');
        return;
      }

      // Otevřít výběr fotky
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        setUploading(true);
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Chyba při výběru fotky:', error);
      Alert.alert('Chyba', 'Nepodařilo se vybrat fotku');
    } finally {
      setUploading(false);
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Chyba', 'Uživatel není přihlášen');
        return;
      }

      // Převést obrázek na base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });

      // Vytvořit data URI
      const imageData = `data:image/jpeg;base64,${base64}`;

      // Aktualizovat stav
      setProfileImage(imageData);
      
      Alert.alert('Úspěch', 'Profilová fotka byla nahrána');
    } catch (error: any) {
      console.error('Chyba při nahrávání fotky:', error);
      Alert.alert('Chyba', 'Nepodařilo se nahrát fotku');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.menuButtonContainer}>
        <MenuButton onPress={openDrawer} />
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleRow}>
          <ThemedText type="title" style={styles.title}>Profil</ThemedText>
          <TouchableOpacity style={styles.profileImageContainer} onPress={handleImagePick} disabled={uploading}>
            {uploading ? (
              <View style={styles.profileImagePlaceholder}>
                <ActivityIndicator size="small" color="#D32F2F" />
              </View>
            ) : profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <MaterialIcons name="add-a-photo" size={28} color="#666" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
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
  menuButtonContainer: {
    position: 'absolute',
    top: 50,
    left: 8,
    zIndex: 10,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 60,
    paddingBottom: 100,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  title: {
    fontSize: 38,
    fontWeight: '800',
    color: '#D32F2F',
    marginBottom: 0,
  },
  profileImageContainer: {
    width: 80,
    height: 80,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D32F2F',
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
