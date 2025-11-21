import EXERCISES from '@/app/exercise/data';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ExploreScreen() {
  const [selectedCategory, setSelectedCategory] = useState('Nejoblíbenější');
  const router = useRouter();

  // animations
  const titleAnim = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(0)).current;

  const allExercises = useMemo(() => Object.values(EXERCISES).flat(), []);

  useEffect(() => {
    // title in, then list
    Animated.sequence([
      Animated.timing(titleAnim, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.timing(listAnim, { toValue: 1, duration: 420, useNativeDriver: true }),
    ]).start();
  }, [titleAnim, listAnim]);

  const difficultyValue = (ex: any) => {
    if (!ex || !ex.difficulty) return 1;
    return ex.difficulty === 'hard' ? 3 : ex.difficulty === 'medium' ? 2 : 1;
  };

  const filteredExercises = useMemo(() => {
    const arr = (allExercises || []).slice();
    switch (selectedCategory) {
      case 'Nejoblíbenější':
        return arr.sort((a: any, b: any) => {
          const ai = parseInt(String(a.id || ''), 10) || 0;
          const bi = parseInt(String(b.id || ''), 10) || 0;
          return ai - bi || (a.name || '').localeCompare(b.name || '');
        }).slice(0, 5);
      case 'Nejobtížnější':
        return arr.sort((a: any, b: any) => difficultyValue(b) - difficultyValue(a)).slice(0, 5);
      case 'Nejznámější':
        const keywords = ['bench','dead','squat','press','curl','pull','snatch','clean'];
        const popular = arr.filter((e: any) => keywords.some(k => (e.name||'').toLowerCase().includes(k))).slice(0,5);
        if (popular.length >= 5) return popular;
        // fill up
        return Array.from(new Set([...popular, ...arr])).slice(0,5);
      case 'Nejlehčí':
        return arr.sort((a: any, b: any) => difficultyValue(a) - difficultyValue(b)).slice(0,5);
      default:
        return arr.slice(0,5);
    }
  }, [allExercises, selectedCategory]);

  function CategoryList() {
    const cats = ['Nejoblíbenější', 'Nejobtížnější', 'Nejznámější', 'Nejlehčí'];
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll} contentContainerStyle={{ paddingVertical: 6 }}>
        {cats.map(cat => (
          <TouchableOpacity key={cat} style={[styles.categoryButton, selectedCategory === cat && styles.categoryButtonActive]} onPress={() => setSelectedCategory(cat)}>
            <ThemedText style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>{cat}</ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  }

  function ExercisePreviewList() {
      return (
        <Animated.View style={{ opacity: listAnim, transform: [{ translateY: listAnim.interpolate({ inputRange: [0,1], outputRange: [8,0] }) }] }}>
          {filteredExercises.map((ex: any) => (
            <Link key={ex.id} href={`/exercise/${ex.id}`} asChild>
              <TouchableOpacity style={styles.exerciseCard}>
                <View style={styles.exerciseRow}>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.exerciseName}>{ex.name}</ThemedText>
                    <ThemedText style={styles.exerciseMuscle}>{(ex.primaryMuscles||[]).join(' • ')}</ThemedText>
                  </View>

                  <View style={styles.stars}>
                    { [0,1,2].map(i => {
                      const stars = ex.difficulty === 'hard' ? 3 : ex.difficulty === 'medium' ? 2 : 1;
                      return (
                        <MaterialIcons key={i} name={i < stars ? 'star' : 'star-border'} size={16} color={i < stars ? '#fff' : '#888'} style={{ marginLeft: 4 }} />
                      );
                    }) }
                  </View>
                </View>
                <ThemedText style={styles.exerciseEquipment}>{ex.equipment || ''}</ThemedText>
              </TouchableOpacity>
            </Link>
          ))}
        </Animated.View>
      );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.content}>
          <View style={styles.headerContainer}>
            <View style={styles.headerInlineTop}>
              <TouchableOpacity style={styles.headerButton} onPress={() => router.back()} accessibilityLabel="Zpět">
                <ThemedText style={styles.headerButtonText}>← Zpět</ThemedText>
              </TouchableOpacity>
              <View style={{ width: 40 }} />
            </View>

            <Animated.View style={[styles.dbTitleWrap, { opacity: titleAnim, transform: [{ translateY: titleAnim.interpolate({ inputRange: [0,1], outputRange: [12,0] }) }] }]}>
              <ThemedText type="title" style={styles.dbTitle}>
                Databáze cviků
              </ThemedText>
            </Animated.View>
          </View>

          <ThemedView style={styles.popularExercises}>
            <ThemedText style={styles.sectionTitleWhite}>Cviky:</ThemedText>

            <CategoryList />

            <ExercisePreviewList />
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