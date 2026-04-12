// Stránka: Explore (Procházení cviků)

// Import databáze cviků, komponent a ikon
import { EXERCISES } from '@/app/exercise/data';
import HeaderLogo from '@/components/header-logo';
import MenuButton from '@/components/menu-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { useDrawer } from '@/contexts/DrawerContext';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

// Obrazovka databáze cviků s filtrováním podle kategorií
export default function ExploreScreen() {
  // State pro aktuálně vybranou kategorii
  const [selectedCategory, setSelectedCategory] = useState('Všechny');
  const [visibleCount, setVisibleCount] = useState(5);
  const { openDrawer } = useDrawer();
  const { profile } = useAuth();

  // Animace pro postupné zobrazení titulku a seznamu cviků
  const titleAnim = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(0)).current;

  // Získání všech cviků ze všech kategorií
  const allExercises = useMemo(() => Object.values(EXERCISES).flat(), []);
  const favoriteIds = useMemo(
    () => (Array.isArray(profile?.favoriteExerciseIds) ? profile.favoriteExerciseIds : []),
    [profile?.favoriteExerciseIds]
  );
  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  const allExercisesAZ = useMemo(
    () => (allExercises || []).slice().sort((a: any, b: any) => (a.name || '').localeCompare(b.name || '', 'cs')),
    [allExercises]
  );

  // Spuštění animací při načtení komponenty (nejprve titulek, pak seznam)
  useEffect(() => {
    Animated.sequence([
      Animated.timing(titleAnim, { toValue: 1, duration: 420, useNativeDriver: false }),
      Animated.timing(listAnim, { toValue: 1, duration: 420, useNativeDriver: false }),
    ]).start();
  }, [titleAnim, listAnim]);

  useEffect(() => {
    setVisibleCount(5);
  }, [selectedCategory]);

  // Převod obtížnosti cviku na číselnou hodnotu (lehký=1, střední=2, těžký=3)
  const difficultyValue = (ex: any) => {
    if (!ex || !ex.difficulty) return 1;
    return ex.difficulty === 'hard' ? 3 : ex.difficulty === 'medium' ? 2 : 1;
  };

  // Filtrování a řazení cviků podle vybrané kategorie
  const filteredExercises = useMemo(() => {
    const arr = (allExercises || []).slice();
    switch (selectedCategory) {
      case 'Moje top': {
        return arr
          .filter((e: any) => favoriteSet.has(e.id))
          .sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));
      }
      case 'Všechny':
        return allExercisesAZ;
      case 'Nejobtížnější':
        return arr.sort((a: any, b: any) => difficultyValue(b) - difficultyValue(a));
      case 'Nejlehčí':
        return arr.sort((a: any, b: any) => difficultyValue(a) - difficultyValue(b));
      default:
        return arr;
    }
  }, [allExercises, allExercisesAZ, favoriteSet, selectedCategory]);

  const visibleExercises = useMemo(() => {
    return filteredExercises.slice(0, visibleCount);
  }, [filteredExercises, visibleCount]);

  const canLoadMore = visibleCount < filteredExercises.length;

  function CategoryList() {
    const cats = ['Všechny', 'Nejlehčí', 'Nejobtížnější', 'Moje top'];
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll} contentContainerStyle={{ paddingVertical: 6 }}>
        {cats.map(cat => (
          <TouchableOpacity key={cat} style={StyleSheet.flatten([styles.categoryButton, selectedCategory === cat && styles.categoryButtonActive])} onPress={() => setSelectedCategory(cat)}>
            <ThemedText style={StyleSheet.flatten([styles.categoryText, selectedCategory === cat && styles.categoryTextActive])}>{cat}</ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  }

  function ExercisePreviewList() {
      return (
        <Animated.View style={{ opacity: listAnim, transform: [{ translateY: listAnim.interpolate({ inputRange: [0,1], outputRange: [8,0] }) }] }}>
          {selectedCategory === 'Moje top' && filteredExercises.length === 0 ? (
            <ThemedText style={styles.emptyStateText}>Zatím nemáš žádné oblíbené cviky. Otevři detail cviku a dej srdíčko.</ThemedText>
          ) : null}
          {visibleExercises.map((ex: any) => (
            <Link key={ex.id} href={`/exercise/${ex.id}`} asChild>
              <TouchableOpacity style={styles.exerciseCard}>
                <View style={styles.exerciseRow}>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.exerciseName}>{ex.name}</ThemedText>
                    <ThemedText style={styles.exerciseMuscle}>{(ex.primaryMuscles||[]).join(' • ')}</ThemedText>
                  </View>

                  {favoriteSet.has(ex.id) ? (
                    <MaterialIcons name="favorite" size={16} color="#D32F2F" style={{ marginRight: 6 }} />
                  ) : null}

                  <View style={styles.stars}>
                    { [0,1,2].map(i => {
                      const stars = ex.difficulty === 'hard' ? 3 : ex.difficulty === 'medium' ? 2 : 1;
                      return (
                        <MaterialIcons
                          key={i}
                          name={i < stars ? 'star' : 'star-border'}
                          size={16}
                          color={i < stars ? '#fff' : '#888'}
                          style={{ marginLeft: 4 }}
                        />
                      );
                    }) }
                  </View>
                </View>
                <ThemedText style={styles.exerciseEquipment}>{ex.equipment || ''}</ThemedText>
              </TouchableOpacity>
            </Link>
          ))}

          {canLoadMore ? (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={() => setVisibleCount((prev) => prev + 5)}
            >
              <ThemedText style={styles.loadMoreText}>Zobrazit další</ThemedText>
            </TouchableOpacity>
          ) : null}
        </Animated.View>
      );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <MenuButton onPress={openDrawer} />
          <ThemedText style={styles.headerTitle}>Databáze cviků</ThemedText>
          <HeaderLogo />
        </View>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.content}>
          <ThemedView style={styles.popularExercises}>
            <ThemedText style={styles.sectionTitleWhite}>Cviky:</ThemedText>

            <CategoryList />

            <ExercisePreviewList />
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
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 38,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#FF7B7B',
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  headerInline: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerInlineTop: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  dbTitleWrap: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
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
  headerButtonText: { color: '#fff', fontSize: 14, fontWeight: '600', lineHeight: 18, textAlignVertical: 'center' as any },
  categoryScroll: { width: '100%', marginBottom: 12 },
  categoryButton: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  categoryButtonActive: {
    backgroundColor: '#D32F2F',
    borderColor: '#D32F2F',
  },
  categoryText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  categoryTextActive: { color: '#fff' },
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
  dbTitle: {
    fontSize: 40,
    color: '#D32F2F',
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  sectionTitleWhite: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'left',
  },
  emptyStateText: {
    color: '#999',
    fontSize: 13,
    marginBottom: 12,
  },
  loadMoreButton: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 10,
  },
  loadMoreText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  exerciseCard: {
    backgroundColor: '#1a1a1a',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  exerciseName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  exerciseMuscle: {
    color: '#D32F2F',
    fontSize: 13,
    marginBottom: 2,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stars: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  exerciseEquipment: {
    color: '#666',
    fontSize: 12,
  },
});