import EXERCISES from '@/app/exercise/data';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function NewWorkoutScreen() {
  const [slots, setSlots] = useState(() => [
    { id: 'slot-1', name: 'Trénink 1', exercises: [] as any[] },
    { id: 'slot-2', name: 'Den 1', exercises: [] as any[] },
  ]);

  const allExercises = Object.values(EXERCISES).flat();

  function addExerciseToSlot(slotId: string, ex: any) {
    // add exercise object with default sets/reps
    const item = { ...ex, sets: 3, reps: 8 };
    setSlots(s => s.map(slot => slot.id === slotId ? { ...slot, exercises: [...slot.exercises, item] } : slot));
  }

  function updateExerciseInSlot(slotId: string, exIndex: number, patch: Partial<any>) {
    setSlots(s => s.map(slot => {
      if (slot.id !== slotId) return slot;
      const next = [...slot.exercises];
      next[exIndex] = { ...next[exIndex], ...patch };
      return { ...slot, exercises: next };
    }));
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerInline}>
          <Link href="/(tabs)/explore" asChild>
            <TouchableOpacity style={styles.headerButton} accessibilityLabel="Zpět">
              <ThemedText style={styles.headerButtonText}>← Zpět</ThemedText>
            </TouchableOpacity>
          </Link>
          <ThemedText type="title" style={styles.title}>Nový trénink</ThemedText>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.slots}>
          {slots.map(slot => (
            <View key={slot.id} style={styles.slotCard}>
              <ThemedText style={styles.slotTitle}>{slot.name}</ThemedText>

              <View style={styles.slotExercises}>
                {slot.exercises.length === 0 ? (
                  <ThemedText style={styles.noExercise}>Žádné cviky</ThemedText>
                ) : (
                  slot.exercises.map((e: any, i: number) => (
                    <View key={i} style={styles.addedExerciseRow}>
                      <View style={{ flex: 1 }}>
                        <ThemedText style={styles.exerciseName}>{e.name}</ThemedText>
                      </View>

                      <View style={styles.selectorsRow}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorList}>
                          {[1,2,3,4,5].map(n => (
                            <TouchableOpacity key={n} style={[styles.selectorButton, e.sets === n && styles.selectorButtonActive]} onPress={() => updateExerciseInSlot(slot.id, i, { sets: n })}>
                              <ThemedText style={[styles.selectorText, e.sets === n && styles.selectorTextActive]}>{n}</ThemedText>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorList}>
                          {Array.from({ length: 20 }, (_, idx) => idx + 1).map(n => (
                            <TouchableOpacity key={n} style={[styles.selectorButtonSmall, e.reps === n && styles.selectorButtonActive]} onPress={() => updateExerciseInSlot(slot.id, i, { reps: n })}>
                              <ThemedText style={[styles.selectorTextSmall, e.reps === n && styles.selectorTextActive]}>{n}</ThemedText>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    </View>
                  ))
                )}
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.addScroll}>
                {allExercises.slice(0, 20).map(ex => (
                  <TouchableOpacity key={ex.id} style={styles.addButton} onPress={() => addExerciseToSlot(slot.id, ex)}>
                    <ThemedText style={styles.addButtonText}>{ex.name}</ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { padding: 24 },
  headerInline: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  headerButton: { backgroundColor: 'rgba(17,17,17,0.9)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#333' },
  headerButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  title: { fontSize: 26, color: '#D32F2F', fontWeight: '800', textAlign: 'center' },
  slots: { marginTop: 18 },
  slotCard: { backgroundColor: '#111', padding: 14, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#333' },
  slotTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 8 },
  slotExercises: { minHeight: 40, marginBottom: 8 },
  noExercise: { color: '#888' },
  addedExercise: { backgroundColor: '#0f0f0f', padding: 8, borderRadius: 8, marginBottom: 6 },
  exerciseName: { color: '#fff' },
  addScroll: { marginTop: 6 },
  addButton: { backgroundColor: '#1a1a1a', padding: 10, borderRadius: 10, marginRight: 8, borderWidth: 1, borderColor: '#333' },
  addButtonText: { color: '#fff', fontSize: 12 },
  addedExerciseRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#111' },
  selectorsRow: { flexDirection: 'row', alignItems: 'center' },
  selectorList: { alignItems: 'center' },
  selectorButton: { backgroundColor: '#1a1a1a', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, marginRight: 8, borderWidth: 1, borderColor: '#333' },
  selectorButtonSmall: { backgroundColor: '#1a1a1a', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 6, marginRight: 6, borderWidth: 1, borderColor: '#333' },
  selectorButtonActive: { backgroundColor: '#D32F2F', borderColor: '#D32F2F' },
  selectorText: { color: '#fff', fontSize: 12 },
  selectorTextSmall: { color: '#fff', fontSize: 11 },
  selectorTextActive: { color: '#fff', fontWeight: '700' },
});
