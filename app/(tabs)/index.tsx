import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.content}>
          
          <ThemedView style={styles.header}>
            <ThemedText type="title" style={styles.appTitle}>
              PowerGainz
            </ThemedText>
            <ThemedText type="subtitle" style={styles.slogan}>
              Tvá cesta k maximální síle a formě
            </ThemedText>
          </ThemedView>

          <Link href="/explore" asChild>
            <TouchableOpacity style={styles.startButton}>
              <ThemedText type="defaultSemiBold" style={styles.buttonText}>
                ZAČNEME!
              </ThemedText>
            </TouchableOpacity>
          </Link>

          <ThemedView style={styles.quickActions}>
            <ThemedText style={styles.sectionTitle}>Rychlé akce</ThemedText>
            
            <ThemedView style={styles.actionRow}>
              <TouchableOpacity style={styles.smallButton}>
                <ThemedText style={styles.smallButtonText}>📊 Dnešní trénink</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.smallButton}>
                <ThemedText style={styles.smallButtonText}>➕ Přidat cvik</ThemedText>
              </TouchableOpacity>
            </ThemedView>

            <ThemedView style={styles.actionRow}>
              <TouchableOpacity style={styles.smallButton}>
                <ThemedText style={styles.smallButtonText}>📈 Statistiky</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.smallButton}>
                <ThemedText style={styles.smallButtonText}>⚙️ Nastavení</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.lastWorkout}>
            <ThemedText style={styles.sectionTitle}>Poslední trénink</ThemedText>
            <ThemedView style={styles.workoutCard}>
              <ThemedText style={styles.workoutTitle}>Prsní svaly</ThemedText>
              <ThemedText style={styles.workoutDetail}>Bench Press: 3x10 (80kg)</ThemedText>
              <ThemedText style={styles.workoutDetail}>Kliky: 4x15</ThemedText>
              <ThemedText style={styles.workoutDate}>Včera • 45 minut</ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.features}>
            <ThemedView style={styles.featureItem}>
              <ThemedText style={styles.featureIcon}>💯</ThemedText>
              <ThemedText style={styles.featureText}>Sleduj pokroky</ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.featureItem}>
              <ThemedText style={styles.featureIcon}>🏋️</ThemedText>
              <ThemedText style={styles.featureText}>500+ cviků</ThemedText>
            </ThemedView>
            
<Link href="/(tabs)/muscleselect" asChild>
            <TouchableOpacity style={styles.startButton}>
              <ThemedText type="defaultSemiBold" style={styles.buttonText}>
                🧍‍♂️ Výběr svalové partie
              </ThemedText>
            </TouchableOpacity>
          </Link>

            <ThemedView style={styles.featureItem}>
              <ThemedText style={styles.featureIcon}>📊</ThemedText>
              <ThemedText style={styles.featureText}>Statistiky</ThemedText>
            </ThemedView>
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
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  appTitle: {
    fontSize: 52,
    fontWeight: 'bold',
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 16,
  },
  slogan: {
    fontSize: 22,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 28,
  },
  startButton: {
    backgroundColor: '#D32F2F',
    paddingHorizontal: 50,
    paddingVertical: 20,
    borderRadius: 30,
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    marginBottom: 40,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    color: '#D32F2F',
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  quickActions: {
    width: '100%',
    marginBottom: 30,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  smallButton: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  smallButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  lastWorkout: {
    width: '100%',
    marginBottom: 30,
  },
  workoutCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  workoutTitle: {
    color: '#D32F2F',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  workoutDetail: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 4,
    opacity: 0.8,
  },
  workoutDate: {
    color: '#666',
    fontSize: 12,
    marginTop: 8,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 400,
  },
  featureItem: {
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  featureText: {
    color: '#FFFFFF',
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
});