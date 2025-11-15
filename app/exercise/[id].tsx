import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

export default function ExerciseScreen() {
  const { id } = useLocalSearchParams();

  const exerciseData: { [key: string]: { name: string, muscle: string, description: string, instructions: string[] } } = {
    '1': {
      name: 'Bench Press',
      muscle: 'Prsní svaly',
      description: 'Základní cvik pro rozvoj prsních svalů',
      instructions: [
        'Lehněte si na lavičku s chodidly na zemi',
        'Uchopte činku nadhmatem o něco širším než šířka ramen',
        'Spouštějte činku pomalu k hrudníku',
        'Tlačte činku explosivně nahoru'
      ]
    },
    '2': {
      name: 'Deadlift',
      muscle: 'Záda • Nohy',
      description: 'Komplexní cvik pro celkové tělo',
      instructions: [
        'Postavte se před činku s chodidly na šířku ramen',
        'Dřepněte a uchopte činku nadhmatem',
        'Zvedejte trup rovně nahoru',
        'Mějte záda stále rovná'
      ]
    },
    '3': {
      name: 'Biceps Curls',
      muscle: 'Biceps',
      description: 'Izolovaný cvik pro bicepsy',
      instructions: [
        'Stůjte rovně s jednoručkami v rukou',
        'Dlaně směřují dopředu',
        'Zvedejte závaží k ramenům',
        'Kontrolovaně spouštějte dolů'
      ]
    }
  };

  const exercise = exerciseData[id as string] || exerciseData['1'];

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.content}>
          <ThemedText type="title" style={styles.title}>
            🏋️ {exercise.name}
          </ThemedText>
          
          <ThemedText style={styles.muscleGroup}>
            {exercise.muscle}
          </ThemedText>

          <ThemedView style={styles.descriptionCard}>
            <ThemedText style={styles.description}>
              {exercise.description}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.instructions}>
            <ThemedText style={styles.instructionsTitle}>Postup:</ThemedText>
            {exercise.instructions.map((instruction, index) => (
              <ThemedText key={index} style={styles.instruction}>
                {index + 1}. {instruction}
              </ThemedText>
            ))}
          </ThemedView>

          <Link href="/explore" asChild>
            <ThemedView style={styles.backLink}>
              <ThemedText style={styles.backLinkText}>← Zpět na cviky</ThemedText>
            </ThemedView>
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
  muscleGroup: {
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
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
  backLink: {
    padding: 15,
  },
  backLinkText: {
    color: '#D32F2F',
    fontSize: 16,
    fontWeight: '600',
  },
});