import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export default function ExploreScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.content}>
          <ThemedText type="title" style={styles.title}>
              🏋️ Databáze Cviků
          </ThemedText>
          
          <ThemedView style={styles.filters}>
            <ThemedText style={styles.sectionTitle}>Vyber partii:</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <Link href="/muscle/chest" asChild>
                <TouchableOpacity style={styles.filterButton}>
                  <ThemedText style={styles.filterText}>Prsa</ThemedText>
                </TouchableOpacity>
              </Link>
              
              <Link href="/muscle/back" asChild>
                <TouchableOpacity style={styles.filterButton}>
                  <ThemedText style={styles.filterText}>Záda</ThemedText>
                </TouchableOpacity>
              </Link>
              
              <Link href="/muscle/legs" asChild>
                <TouchableOpacity style={styles.filterButton}>
                  <ThemedText style={styles.filterText}>Nohy</ThemedText>
                </TouchableOpacity>
              </Link>
              
              <Link href="/muscle/arms" asChild>
                <TouchableOpacity style={styles.filterButton}>
                  <ThemedText style={styles.filterText}>Ruce</ThemedText>
                </TouchableOpacity>
              </Link>
              
              <Link href="/muscle/core" asChild>
                <TouchableOpacity style={styles.filterButton}>
                  <ThemedText style={styles.filterText}>Břicho</ThemedText>
                </TouchableOpacity>
              </Link>
            </ScrollView>
          </ThemedView>

          <ThemedView style={styles.popularExercises}>
            <ThemedText style={styles.sectionTitle}>Nejoblíbenější cviky:</ThemedText>
            
            <Link href="/exercise/1" asChild>
              <TouchableOpacity style={styles.exerciseCard}>
                <ThemedText style={styles.exerciseName}>Bench Press</ThemedText>
                <ThemedText style={styles.exerciseMuscle}>Prsní svaly</ThemedText>
                <ThemedText style={styles.exerciseEquipment}>Činka • Lavice</ThemedText>
              </TouchableOpacity>
            </Link>

            <Link href="/exercise/2" asChild>
              <TouchableOpacity style={styles.exerciseCard}>
                <ThemedText style={styles.exerciseName}>Deadlift</ThemedText>
                <ThemedText style={styles.exerciseMuscle}>Záda • Nohy</ThemedText>
                <ThemedText style={styles.exerciseEquipment}>Činka</ThemedText>
              </TouchableOpacity>
            </Link>

            <Link href="/exercise/3" asChild>
              <TouchableOpacity style={styles.exerciseCard}>
                <ThemedText style={styles.exerciseName}>Biceps Curls</ThemedText>
                <ThemedText style={styles.exerciseMuscle}>Biceps</ThemedText>
                <ThemedText style={styles.exerciseEquipment}>Jednoručky</ThemedText>
              </TouchableOpacity>
            </Link>
          </ThemedView>

          <ThemedView style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <ThemedText style={styles.actionButtonText}>📥 Uložit trénink</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <ThemedText style={styles.actionButtonText}>🔄 Nový trénink</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <ThemedText style={styles.actionButtonText}>📤 Exportovat</ThemedText>
            </TouchableOpacity>
          </ThemedView>

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
    marginBottom: 30,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    color: '#D32F2F',
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  filters: {
    width: '100%',
    marginBottom: 30,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterButton: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  filterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  popularExercises: {
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
  exerciseMuscle: {
    color: '#D32F2F',
    fontSize: 14,
    marginBottom: 3,
  },
  exerciseEquipment: {
    color: '#666',
    fontSize: 12,
  },
  actionButtons: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});