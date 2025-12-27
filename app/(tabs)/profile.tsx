import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [goal, setGoal] = useState<'strength' | 'mass' | 'endurance' | ''>('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const goals = [
    { key: 'strength', label: 'Síla', icon: 'fitness-center' },
    { key: 'mass', label: 'Svalová hmota', icon: 'trending-up' },
    { key: 'endurance', label: 'Vytrvalost', icon: 'directions-run' },
  ];

  const handleImagePick = () => {
    // Zatím jen placeholder - napojí se později s databází
    console.log('Výběr profilové fotky');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerInline}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
            accessibilityLabel="Zpět"
          >
            <ThemedText style={styles.headerButtonText}>← Zpět</ThemedText>
          </TouchableOpacity>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.titleRow}>
          <ThemedText type="title" style={styles.title}>Profil</ThemedText>
          <TouchableOpacity style={styles.profileImageContainer} onPress={handleImagePick}>
            {profileImage ? (
              <View style={styles.profileImage}>
                {/* Zde bude později Image component */}
              </View>
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <MaterialIcons name="add-a-photo" size={28} color="#666" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Jméno</ThemedText>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Zadejte jméno"
              placeholderTextColor="#666"
            />
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

        <TouchableOpacity style={styles.saveButton}>
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
  content: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    paddingBottom: 100,
  },
  headerInline: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 12,
    marginTop: 6,
  },
  headerButton: {
    backgroundColor: 'rgba(17,17,17,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
    textAlignVertical: 'center' as any,
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
