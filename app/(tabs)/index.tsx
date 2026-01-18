// Stránka: Home (Domovská stránka - tréninkový deník)

// Import komponent a navigace
import MenuButton from '@/components/menu-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useDrawer } from '@/contexts/DrawerContext';
import { Link } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

// Domovská obrazovka aplikace s úvodním CTA tlačítkem a rychlými akcemi
export default function HomeScreen() {
  const { openDrawer } = useDrawer();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <MenuButton onPress={openDrawer} />
            <ThemedText style={styles.headerTitle}>PowerGainz</ThemedText>
            <View style={styles.headerSpacer} />
          </View>
        </View>
        
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedView style={styles.content}>

          <Link href="/explore" asChild>
            <TouchableOpacity style={[styles.startButton, styles.centeredButtonVisual]}>
              <ThemedText type="defaultSemiBold" style={styles.buttonText}>
                ZAČNEME!
              </ThemedText>
            </TouchableOpacity>
          </Link>

          <ThemedView style={styles.quickActions}>
            <ThemedText style={styles.sectionTitle}>Rychlé akce</ThemedText>
            
            <ThemedView style={styles.actionRow}>
              <TouchableOpacity style={styles.smallButton}>
                <ThemedText style={styles.smallButtonText}>Dnešní trénink</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.smallButton}>
                <ThemedText style={styles.smallButtonText}>Přidat cvik</ThemedText>
              </TouchableOpacity>
            </ThemedView>

            <ThemedView style={styles.actionRow}>
              <TouchableOpacity style={styles.smallButton}>
                <ThemedText style={styles.smallButtonText}>Statistiky</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.smallButton}>
                <ThemedText style={styles.smallButtonText}>Nastavení</ThemedText>
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
              <ThemedText style={styles.featureIcon}></ThemedText>
              <ThemedText style={styles.featureText}>Sleduj pokroky </ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.featureItem}>
              <ThemedText style={styles.featureIcon}></ThemedText>
              <ThemedText style={styles.featureText}>50 cviků</ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.featureItem}>
              <ThemedText style={styles.featureIcon}></ThemedText>
              <ThemedText style={styles.featureText}>Statistiky</ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Removed the explicit muscle-selection CTA per design request */}

        </ThemedView>
        </ScrollView>
      </SafeAreaView>
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
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  startButton: {
    backgroundColor: '#D32F2F',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    marginBottom: 24,
    alignSelf: 'stretch',
    width: '100%',
    maxWidth: 420,
  },
  startButtonCentered: {
    alignSelf: 'center',
    width: '70%',
    maxWidth: 420,
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
    marginBottom: 24,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  smallButton: {
    backgroundColor: '#1a1a1a',
    padding: 14,
    borderRadius: 12,
    width: '48%',
    marginHorizontal: 0,
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
  centerButtonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 18,
  },
  centeredButton: {
    alignSelf: 'center',
    width: '90%',
    maxWidth: 420,
  },
  centeredButtonVisual: {
    backgroundColor: '#D32F2F',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#B71C1C',
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
});