// Import databáze cviků a komponent
import EXERCISES from '@/app/exercise/data';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

// Obrazovka pro vytváření nového tréninku
export default function NewWorkoutScreen() {
  // State pro uchování tréninkových slotů (jednotlivé dny/tréninky)
  const [slots, setSlots] = useState(() => [
    { id: 'slot-1', name: 'Trénink 1', exercises: [] as any[] },
    { id: 'slot-2', name: 'Den 1', exercises: [] as any[] },
  ]);
  // State pro sledování, který dropdown picker je aktuálně otevřený
  const [expandedPicker, setExpandedPicker] = useState<string | null>(null);

  // Získání všech cviků ze všech svalových partií
  const allExercises = Object.values(EXERCISES).flat();

  // Funkce pro přidání cviku do konkrétního slotu s defaultními hodnotami (3 série, 8 opakování)
  function addExerciseToSlot(slotId: string, ex: any) {
    const item = { ...ex, sets: 3, reps: 8 };
    setSlots(s => s.map(slot => slot.id === slotId ? { ...slot, exercises: [...slot.exercises, item] } : slot));
  }

  // Funkce pro aktualizaci parametrů cviku (např. změna počtu sérií nebo opakování)
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
          <View style={{ width: 40 }} />
        </View>

        <ThemedText type="title" style={[styles.title, styles.titleBelowHeader]}>Nový trénink</ThemedText>

        <View style={styles.slots}>
          {slots.map(slot => (
            <View key={slot.id} style={styles.slotCard}>
              <ThemedText style={styles.slotTitle}>{slot.name}</ThemedText>

              <View style={styles.slotExercises}>
                {slot.exercises.length === 0 ? (
                  <ThemedText style={styles.noExercise}>Žádné cviky</ThemedText>
                ) : (
                  slot.exercises.map((e: any, i: number) => {
                    const pickerIdSets = `${slot.id}-${i}-sets`;
                    const pickerIdReps = `${slot.id}-${i}-reps`;
                    return (
                      <View key={i} style={styles.addedExerciseCard}>
                        <View style={styles.exerciseRow}>
                          <ThemedText style={styles.exerciseName}>{e.name}</ThemedText>
                          
                          <View style={styles.controlsCompact}>
                            <View style={styles.pickerColumn}>
                              <ThemedText style={styles.pickerLabel}>Série</ThemedText>
                              <TouchableOpacity 
                                style={styles.pickerButton} 
                                onPress={() => setExpandedPicker(expandedPicker === pickerIdSets ? null : pickerIdSets)}
                              >
                                <ThemedText style={styles.pickerValue}>{e.sets}</ThemedText>
                                <ThemedText style={styles.pickerArrow}>▼</ThemedText>
                              </TouchableOpacity>
                              {expandedPicker === pickerIdSets && (
                                <View style={styles.pickerDropdown}>
                                  {[1,2,3,4,5].map(n => (
                                    <TouchableOpacity 
                                      key={n} 
                                      style={styles.pickerOption} 
                                      onPress={() => {
                                        updateExerciseInSlot(slot.id, i, { sets: n });
                                        setExpandedPicker(null);
                                      }}
                                    >
                                      <ThemedText style={styles.pickerOptionText}>{n}</ThemedText>
                                    </TouchableOpacity>
                                  ))}
                                </View>
                              )}
                            </View>

                            <View style={styles.pickerColumn}>
                              <ThemedText style={styles.pickerLabel}>Opak.</ThemedText>
                              <TouchableOpacity 
                                style={styles.pickerButton} 
                                onPress={() => setExpandedPicker(expandedPicker === pickerIdReps ? null : pickerIdReps)}
                              >
                                <ThemedText style={styles.pickerValue}>{e.reps}</ThemedText>
                                <ThemedText style={styles.pickerArrow}>▼</ThemedText>
                              </TouchableOpacity>
                              {expandedPicker === pickerIdReps && (
                                <View style={styles.pickerDropdown}>
                                  {[6,8,10,12,15,20].map(n => (
                                    <TouchableOpacity 
                                      key={n} 
                                      style={styles.pickerOption} 
                                      onPress={() => {
                                        updateExerciseInSlot(slot.id, i, { reps: n });
                                        setExpandedPicker(null);
                                      }}
                                    >
                                      <ThemedText style={styles.pickerOptionText}>{n}</ThemedText>
                                    </TouchableOpacity>
                                  ))}
                                </View>
                              )}
                            </View>
                          </View>
                        </View>
                      </View>
                    );
                  })
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
  content: { paddingHorizontal: 24, paddingTop: 48, paddingBottom: 24 },
  headerInline: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, marginTop: 6, marginBottom: 12 },
  headerButton: { backgroundColor: 'rgba(17,17,17,0.9)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#333' },
  headerButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  title: { fontSize: 26, color: '#D32F2F', fontWeight: '800', textAlign: 'center' },
  titleBelowHeader: { marginTop: 8, marginBottom: 6 },
  slots: { marginTop: 18 },
  slotCard: { backgroundColor: '#111', padding: 14, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#333' },
  slotTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 8 },
  slotExercises: { minHeight: 40, marginBottom: 8 },
  noExercise: { color: '#888' },
  addedExercise: { backgroundColor: '#0f0f0f', padding: 8, borderRadius: 8, marginBottom: 6 },
  addedExerciseCard: { backgroundColor: '#0f0f0f', padding: 10, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#222' },
  exerciseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  exerciseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  exerciseName: { color: '#fff', fontSize: 14, fontWeight: '600', flex: 1 },
  exerciseSummary: { color: '#D32F2F', fontSize: 13, fontWeight: '700' },
  controlsCompact: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  pickerColumn: { position: 'relative', zIndex: 10 },
  pickerRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pickerLabel: { color: '#888', fontSize: 11, fontWeight: '600', marginBottom: 4, textAlign: 'center' },
  pickerButton: { backgroundColor: '#1a1a1a', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#333', gap: 6 },
  pickerValue: { color: '#fff', fontSize: 13, fontWeight: '700' },
  pickerArrow: { color: '#D32F2F', fontSize: 10 },
  pickerDropdown: { position: 'absolute', top: 42, left: 0, right: 0, backgroundColor: '#0a0a0a', borderRadius: 8, borderWidth: 2, borderColor: '#D32F2F', zIndex: 100, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.8, shadowRadius: 6 },
  pickerOption: { paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#222', backgroundColor: '#0a0a0a' },
  pickerOptionText: { color: '#fff', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  controlsRow: { flexDirection: 'row', gap: 12 },
  controlColumn: { flex: 1 },
  controlsSection: { gap: 12 },
  controlGroup: { gap: 6 },
  controlLabel: { color: '#888', fontSize: 11, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase' },
  selectorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  addScroll: { marginTop: 6 },
  addButton: { backgroundColor: '#1a1a1a', padding: 10, borderRadius: 10, marginRight: 8, borderWidth: 1, borderColor: '#333' },
  addButtonText: { color: '#fff', fontSize: 12 },
  addedExerciseRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#111' },
  selectorsRow: { flexDirection: 'row', alignItems: 'center' },
  selectorList: { alignItems: 'center', paddingVertical: 2 },
  selectorButton: { backgroundColor: '#1a1a1a', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, marginRight: 8, borderWidth: 1, borderColor: '#333' },
  selectorButtonCompact: { backgroundColor: '#1a1a1a', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#333', minWidth: 32, alignItems: 'center' },
  selectorButtonSmall: { backgroundColor: '#1a1a1a', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 6, marginRight: 6, borderWidth: 1, borderColor: '#333' },
  selectorButtonActive: { backgroundColor: '#D32F2F', borderColor: '#D32F2F' },
  selectorText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  selectorTextCompact: { color: '#fff', fontSize: 12, fontWeight: '600' },
  selectorTextSmall: { color: '#fff', fontSize: 11 },
  selectorTextActive: { color: '#fff', fontWeight: '700' },
});
