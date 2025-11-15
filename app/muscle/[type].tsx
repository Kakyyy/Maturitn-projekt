import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export default function MuscleScreen() {
  const { type } = useLocalSearchParams();
  
  const muscleNames: { [key: string]: string } = {
    chest: 'Prsní svaly',
    back: 'Zádové svaly', 
    legs: 'Nohy',
    arms: 'Ruce',
    core: 'Břišní svaly'
  };

  const exercises: { [key: string]: Array<{id: string, name: string, equipment: string}> } = {
    chest: [
      { id: '1', name: 'Bench Press', equipment: 'Činka, Lavice' },
      { id: '2', name: 'Kliky', equipment: 'Vlastní váha' },
      { id: '3', name: 'Cable Crossover', equipment: 'Kladky' }
    ],
    back: [
      { id: '4', name: 'Deadlift', equipment: 'Činka' },
      { id: '5', name: 'Pull-ups', equipment: 'Hrazda' },
      { id: '6', name: 'Bent Over Row', equipment: 'Činka' }
    ],
    legs: [
      { id: '7', name: 'Squat', equipment: 'Činka' },
      { id: '8', name: 'Leg Press', equipment: 'Stroj' },
      { id: '9', name: 'Lunges', equipment: 'Jednoručky' }
    ],
    arms: [
      { id: '10', name: 'Biceps Curls', equipment: 'Jednoručky' },
      { id: '11', name: 'Triceps Extensions', equipment: 'Kladka' },
      { id: '12', name: 'Hammer Curls', equipment: 'Jednoručky' }
    ],
    core: [
      { id: '13', name: 'Plank', equipment: 'Vlastní váha' },
      { id: '14', name: 'Russian Twist', equipment: 'Medicinbal' },
      { id: '15', name: 'Leg Raises', equipment: 'Lavička' }
    ]
  };

  const currentExercises = exercises[type as string] || [];

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.content}>
          <ThemedText type="title" style={styles.title}>
            💪 {muscleNames[type as string] || 'Partie'}
          </ThemedText>
          
          <ThemedText style={styles.exerciseCount}>
            {currentExercises.length} cviků
          </ThemedText>

          <ThemedView style={styles.exercisesList}>
            {currentExercises.map((exercise) => (
              <Link key={exercise.id} href={`/exercise/${exercise.id}`} asChild>
                <TouchableOpacity style={styles.exerciseCard}>
                  <ThemedText style={styles.exerciseName}>{exercise.name}</ThemedText>
                  <ThemedText style={styles.exerciseEquipment}>{exercise.equipment}</ThemedText>
                </TouchableOpacity>
              </Link>
            ))}
          </ThemedView>

          <Link href="/explore" asChild>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  title: {
    fontSize: 38,
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  exerciseCount: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  exercisesList: {
    width: '100%',
    marginBottom: 30,
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