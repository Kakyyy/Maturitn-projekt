// Stránka: Muscle Type (Detail svalové partie)

export const unstable_settings = { headerShown: false };

// Import databáze cviků, komponent a typů
import EXERCISES from '@/app/exercise/data';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Exercise } from '@/src/data/types';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

// Obrazovka zobrazující cviky pro konkrétní svalovou partii s možností řazení
export default function MuscleScreen() {
  // Získání typu svalové partie z URL parametru
  const { type } = useLocalSearchParams();
  // State pro zobrazení/skrytí menu s možnostmi řazení
  const [sortOpen, setSortOpen] = useState(false);
  // Aktuální režim řazení (abecedně, podle obtížnosti atd.)
  const [sortMode, setSortMode] = useState<'az' | 'za' | 'diff-asc' | 'diff-desc'>('az');
  
  // Mapování klíčů svalových partií na jejich české názvy
  const muscleNames: { [key: string]: string } = {
    chest: 'Prsní svaly',
    back: 'Zádové svaly',
    deltoids: 'Ramena',
    trapezius: 'Trapézy',
    gluteal: 'Hýždě',
    legs: 'Nohy',
    arms: 'Ruce',
    core: 'Břišní svaly'
  };

  // Získání cviků pro aktuální svalovou partii
  const currentExercises: Exercise[] = (EXERCISES[type as string] as Exercise[]) || [];

  // Převod obtížnosti na číselnou hodnotu pro řazení
  const difficultyValue = (ex: Exercise) => {
    if (!ex || !ex.difficulty) return 1;
    return ex.difficulty === 'hard' ? 3 : ex.difficulty === 'medium' ? 2 : 1;
  };

  // Seřazení cviků podle zvoleného režimu (abecedně nebo podle obtížnosti)
  const sortedExercises = useMemo(() => {
    const arr = (currentExercises || []).slice();
    switch (sortMode) {
      case 'az':
        return arr.sort((a, b) => a.name.localeCompare(b.name));
      case 'za':
        return arr.sort((a, b) => b.name.localeCompare(a.name));
      case 'diff-asc':
        return arr.sort((a, b) => difficultyValue(a) - difficultyValue(b));
      case 'diff-desc':
        return arr.sort((a, b) => difficultyValue(b) - difficultyValue(a));
      default:
        return arr;
    }
  }, [currentExercises, sortMode]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.content}>
          {sortOpen && (
            <View style={styles.sortMenu}>
              <TouchableOpacity style={styles.sortMenuItem} onPress={() => { setSortMode('az'); setSortOpen(false); }}>
                <ThemedText style={styles.sortMenuText}>A → Z</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sortMenuItem} onPress={() => { setSortMode('za'); setSortOpen(false); }}>
                <ThemedText style={styles.sortMenuText}>Z → A</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sortMenuItem} onPress={() => { setSortMode('diff-asc'); setSortOpen(false); }}>
                <ThemedText style={styles.sortMenuText}>Obtížnost ↑</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sortMenuItem} onPress={() => { setSortMode('diff-desc'); setSortOpen(false); }}>
                <ThemedText style={styles.sortMenuText}>Obtížnost ↓</ThemedText>
              </TouchableOpacity>
            </View>
          )}
          
          <ThemedText style={styles.exerciseCount}>{currentExercises.length} cviků</ThemedText>

          <ThemedView style={styles.exercisesList}>
            {sortedExercises.map((exercise) => {
              const stars = exercise.difficulty === 'hard' ? 3 : exercise.difficulty === 'medium' ? 2 : 1;
              return (
                <Link key={exercise.id} href={`/exercise/${exercise.id}`} asChild>
                  <TouchableOpacity style={styles.exerciseCard}>
                    <View style={styles.exerciseRow}>
                      <View style={{ flex: 1 }}>
                        <ThemedText style={styles.exerciseName}>{exercise.name}</ThemedText>
                        <ThemedText style={styles.exerciseEquipment}>{exercise.equipment}</ThemedText>
                      </View>

                      <View style={styles.stars}>
                        {[0, 1, 2].map(i => (
                          <MaterialIcons
                            key={i}
                            name={i < stars ? 'star' : 'star-border'}
                            size={16}
                            color={i < stars ? '#fff' : '#888'}
                            style={{ marginLeft: 4 }}
                          />
                        ))}
                      </View>
                    </View>
                  </TouchableOpacity>
                </Link>
              );
            })}
          </ThemedView>

          <Link href="/(tabs)/muscleselect" asChild>
            <TouchableOpacity style={styles.backButton}>
              <ThemedText style={styles.backButtonText}>← Zpět na výběr partií</ThemedText>
            </TouchableOpacity>
          </Link>

        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  exerciseCount: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    width: '100%',
  },
  sortButton: {
    padding: 0,
  },
  sortMenu: {
    position: 'absolute',
    right: 24,
    top: 0,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingVertical: 8,
    minWidth: 140,
    zIndex: 500,
    elevation: 12,
  },
  sortMenuItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  sortMenuText: {
    color: '#fff',
    fontSize: 14,
  },
  exercisesList: {
    width: '100%',
    marginBottom: 30,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  stars: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  exerciseCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  exerciseName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  exerciseEquipment: {
    color: '#D32F2F',
    fontSize: 14,
  },
  backButton: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});