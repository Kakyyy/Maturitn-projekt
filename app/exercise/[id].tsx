// Stránka: Exercise Detail (Detail cviku)

export const unstable_settings = { headerShown: false };

// Import komponent a databáze cviků
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import EXERCISES from './data';

// Obrazovka s detailním popisem konkrétního cviku (instrukce, svaly, vybavení)
export default function ExerciseScreen() {
  // Získání ID cviku z URL parametru
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Vyhledání cviku podle ID v databázi
  const all = Object.values(EXERCISES).flat();
  const exercise = all.find((e) => e.id === id) || all[0];

  const muscleLabel = exercise?.primaryMuscles?.join(', ') || 'Partie';
  const instructions = (exercise as any)?.instructions;

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedView style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle} numberOfLines={1}>{exercise.name}</ThemedText>
          <ThemedView style={styles.headerSpacer} />
        </ThemedView>
      </ThemedView>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.content}>
          <ThemedText style={styles.muscleGroup}>{muscleLabel}</ThemedText>

          <ThemedView style={styles.descriptionCard}>
            <ThemedText style={styles.description}>
              {exercise.equipment || ''}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.instructions}>
            <ThemedText style={styles.instructionsTitle}>Postup:</ThemedText>
            {Array.isArray(instructions)
              ? instructions.map((instruction, index) => (
                  <ThemedText key={index} style={styles.instruction}>
                    {index + 1}. {instruction}
                  </ThemedText>
                ))
              : instructions
              ? <ThemedText style={styles.instruction}>{instructions}</ThemedText>
              : <ThemedText style={styles.instruction}>Instrukce nejsou k dispozici.</ThemedText>
            }
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
    marginHorizontal: 8,
  },
  headerSpacer: {
    width: 24,
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
  muscleGroup: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  descriptionCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#333',
    width: '100%',
  },
  description: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  instructions: {
    width: '100%',
    marginBottom: 30,
  },
  instructionsTitle: {
    fontSize: 20,
    color: '#D32F2F',
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  instruction: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 22,
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