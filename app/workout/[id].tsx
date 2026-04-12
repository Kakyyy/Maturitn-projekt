import { EXERCISES } from '@/app/exercise/data';
import HeaderLogo from '@/components/header-logo';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/firebase';
import { useNavigation, usePreventRemove } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type WorkoutExercise = {
  exerciseId?: string;
  exerciseName?: string;
  sets?: number;
  reps?: number;
  weight?: number;
  series?: WorkoutSet[];
};

type WorkoutSet = {
  reps?: number;
  weight?: number;
};

type WorkoutData = {
  id: string;
  userId?: string;
  name: string;
  exercises: WorkoutExercise[];
  restTargetSeconds?: number;
};

function toNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function normalizeSeries(exercise: WorkoutExercise): WorkoutSet[] {
  const fromSeries = Array.isArray(exercise.series)
    ? exercise.series.map((set) => ({
        reps: Math.max(0, toNumber(set?.reps)),
        weight: Math.max(0, toNumber(set?.weight)),
      }))
    : [];

  if (fromSeries.length > 0) return fromSeries;

  const count = Math.max(1, Math.floor(toNumber(exercise.sets) || 1));
  const reps = Math.max(0, toNumber(exercise.reps));
  const weight = Math.max(0, toNumber(exercise.weight));
  return Array.from({ length: count }, () => ({ reps, weight }));
}

function normalizeExercise(exercise: WorkoutExercise): WorkoutExercise {
  const series = normalizeSeries(exercise);
  return {
    ...exercise,
    sets: series.length,
    reps: toNumber(series[0]?.reps),
    weight: toNumber(series[0]?.weight),
    series,
  };
}

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [workout, setWorkout] = useState<WorkoutData | null>(null);
  const [workoutName, setWorkoutName] = useState('');
  const [editableExercises, setEditableExercises] = useState<WorkoutExercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [addExerciseOpen, setAddExerciseOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restSeconds, setRestSeconds] = useState(180);
  const [restRunning, setRestRunning] = useState(false);
  const [restTargetSeconds, setRestTargetSeconds] = useState(180);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavigationAction, setPendingNavigationAction] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadWorkout() {
      if (!id || typeof id !== 'string') {
        setError('Neplatné ID tréninku.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const snap = await getDoc(doc(db, 'workouts', id));
        if (!snap.exists()) {
          setError('Trénink nebyl nalezen.');
          return;
        }

        const data = snap.data() as any;
        if (user?.uid && data?.userId && data.userId !== user.uid) {
          setError('K tomuto tréninku nemáte přístup.');
          return;
        }

        const mapped: WorkoutData = {
          id: snap.id,
          userId: data?.userId,
          name: data?.name || 'Trénink',
          exercises: Array.isArray(data?.exercises) ? data.exercises.map((ex: WorkoutExercise) => normalizeExercise(ex)) : [],
          restTargetSeconds: Math.min(3600, Math.max(10, toNumber(data?.restTargetSeconds) || 180)),
        };

        if (!cancelled) {
          setWorkout(mapped);
          setWorkoutName(mapped.name);
          setEditableExercises(mapped.exercises);
          setRestTargetSeconds(mapped.restTargetSeconds || 180);
          setRestSeconds(mapped.restTargetSeconds || 180);
        }
      } catch (e) {
        if (!cancelled) {
          setError('Nepodařilo se načíst trénink.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadWorkout();
    return () => {
      cancelled = true;
    };
  }, [id, user?.uid]);

  const allExercises = useMemo(() => Object.values(EXERCISES).flat(), []);
  const filteredSearchExercises = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return allExercises.filter((ex: any) => ex.name.toLowerCase().includes(q)).slice(0, 8);
  }, [allExercises, searchQuery]);

  useEffect(() => {
    if (!restRunning) return;
    if (restSeconds <= 0) {
      setRestRunning(false);
      return;
    }

    const timer = setInterval(() => {
      setRestSeconds((prev) => {
        if (prev <= 1) {
          setRestRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [restRunning, restSeconds]);

  const dirty = useMemo(() => {
    if (!workout) return false;
    return (
      workoutName.trim() !== (workout.name || '').trim() ||
      JSON.stringify(editableExercises) !== JSON.stringify(workout.exercises) ||
      restTargetSeconds !== (workout.restTargetSeconds || 180)
    );
  }, [editableExercises, restTargetSeconds, workout, workoutName]);

  usePreventRemove(dirty && !saving, ({ data }) => {
    setPendingNavigationAction(data.action);
    setShowUnsavedModal(true);
  });

  function stayOnWorkout() {
    setShowUnsavedModal(false);
    setPendingNavigationAction(null);
  }

  function leaveWithoutSaving() {
    if (pendingNavigationAction) {
      navigation.dispatch(pendingNavigationAction);
    }
    setShowUnsavedModal(false);
    setPendingNavigationAction(null);
  }

  const formatDuration = (seconds: number) => {
    const mm = Math.floor(seconds / 60).toString().padStart(2, '0');
    const ss = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  const addExercise = (ex: any) => {
    setEditableExercises((prev) => [
      ...prev,
      {
        exerciseId: ex.id,
        exerciseName: ex.name,
        sets: 3,
        reps: 8,
        weight: 0,
        series: [
          { reps: 8, weight: 0 },
          { reps: 8, weight: 0 },
          { reps: 8, weight: 0 },
        ],
      },
    ]);
    setSearchQuery('');
    setAddExerciseOpen(false);
  };

  const updateExercise = (index: number, patch: Partial<WorkoutExercise>) => {
    setEditableExercises((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const removeExercise = (index: number) => {
    setEditableExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSeries = (exerciseIndex: number, setIndex: number, patch: Partial<WorkoutSet>) => {
    setEditableExercises((prev) =>
      prev.map((exercise, i) => {
        if (i !== exerciseIndex) return exercise;
        const currentSeries = normalizeSeries(exercise);
        const nextSeries = currentSeries.map((set, j) => (j === setIndex ? { ...set, ...patch } : set));
        return {
          ...exercise,
          sets: nextSeries.length,
          reps: toNumber(nextSeries[0]?.reps),
          weight: toNumber(nextSeries[0]?.weight),
          series: nextSeries,
        };
      })
    );
  };

  const addSeriesToExercise = (exerciseIndex: number) => {
    setEditableExercises((prev) =>
      prev.map((exercise, i) => {
        if (i !== exerciseIndex) return exercise;
        const currentSeries = normalizeSeries(exercise);
        const last = currentSeries[currentSeries.length - 1] || { reps: 8, weight: 0 };
        const nextSeries = [...currentSeries, { reps: toNumber(last.reps), weight: toNumber(last.weight) }];
        return {
          ...exercise,
          sets: nextSeries.length,
          reps: toNumber(nextSeries[0]?.reps),
          weight: toNumber(nextSeries[0]?.weight),
          series: nextSeries,
        };
      })
    );
  };

  const removeSeriesFromExercise = (exerciseIndex: number, setIndex: number) => {
    setEditableExercises((prev) =>
      prev.map((exercise, i) => {
        if (i !== exerciseIndex) return exercise;
        const currentSeries = normalizeSeries(exercise);
        if (currentSeries.length <= 1) return exercise;
        const nextSeries = currentSeries.filter((_, j) => j !== setIndex);
        return {
          ...exercise,
          sets: nextSeries.length,
          reps: toNumber(nextSeries[0]?.reps),
          weight: toNumber(nextSeries[0]?.weight),
          series: nextSeries,
        };
      })
    );
  };

  async function saveWorkoutChanges() {
    if (!id || typeof id !== 'string' || !workout) return;

    try {
      setSaving(true);
      await setDoc(
        doc(db, 'workouts', id),
        {
          name: workoutName.trim() || 'Trénink',
          restTargetSeconds,
          exercises: editableExercises.map((ex) => ({
            series: normalizeSeries(ex).map((set) => ({
              reps: toNumber(set.reps),
              weight: toNumber(set.weight),
            })),
            exerciseId: ex.exerciseId || '',
            exerciseName: ex.exerciseName || 'Neznámý cvik',
            sets: normalizeSeries(ex).length,
            reps: toNumber(normalizeSeries(ex)[0]?.reps),
            weight: toNumber(normalizeSeries(ex)[0]?.weight),
          })),
          updatedAt: serverTimestamp(),
          updatedAtClientMs: Date.now(),
        },
        { merge: true }
      );

      setWorkout((prev) =>
        prev
          ? {
              ...prev,
              name: workoutName.trim() || 'Trénink',
              exercises: editableExercises,
              restTargetSeconds,
            }
          : prev
      );
    } catch (e) {
      setError('Nepodařilo se uložit změny tréninku.');
    } finally {
      setSaving(false);
    }
  }

  const timerRatio = useMemo(() => {
    if (restSeconds <= 0) return 0;
    const target = Math.max(1, restTargetSeconds);
    return Math.min(restSeconds / target, 1);
  }, [restSeconds, restTargetSeconds]);

  function changeRestTargetBy(delta: number) {
    const next = Math.min(3600, Math.max(10, restTargetSeconds + delta));
    setRestTargetSeconds(next);
    if (!restRunning) {
      setRestSeconds(next);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ThemedText style={styles.backButtonText}>Zpět</ThemedText>
            </TouchableOpacity>
            <TextInput
              style={styles.headerNameInput}
              value={workoutName}
              onChangeText={setWorkoutName}
              placeholder="Název tréninku"
              placeholderTextColor="rgba(255,255,255,0.7)"
            />
            <TouchableOpacity
              style={StyleSheet.flatten([styles.saveTopButton, (!dirty || saving) && styles.saveTopButtonDisabled])}
              disabled={!dirty || saving}
              onPress={saveWorkoutChanges}
            >
              <ThemedText style={styles.saveTopButtonText}>{saving ? '...' : 'Uložit'}</ThemedText>
            </TouchableOpacity>
          </View>
          <HeaderLogo mode="watermark" />
        </View>

        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color="#D32F2F" />
            <ThemedText style={styles.stateText}>Načítám trénink...</ThemedText>
          </View>
        ) : null}

        {!loading && error ? (
          <View style={styles.centerState}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        ) : null}

        {!loading && !error && workout ? (
          <>
            <ScrollView contentContainerStyle={styles.content}>
            <View style={StyleSheet.flatten([styles.sectionCard, styles.restCard])}>
              <View style={styles.restHeaderRow}>
                <View style={styles.restTitleRow}>
                  <ThemedText style={StyleSheet.flatten([styles.sectionTitle, styles.restTitleText])}>Rest:</ThemedText>
                  <TouchableOpacity style={styles.timerAdjustMini} onPress={() => changeRestTargetBy(-5)}>
                    <ThemedText style={styles.timerAdjustMiniText}>◀</ThemedText>
                  </TouchableOpacity>
                  <ThemedText style={styles.timerTextInline}>{formatDuration(restSeconds)}</ThemedText>
                  <TouchableOpacity style={styles.timerAdjustMini} onPress={() => changeRestTargetBy(5)}>
                    <ThemedText style={styles.timerAdjustMiniText}>▶</ThemedText>
                  </TouchableOpacity>
                </View>
                <View style={styles.restTopActions}>
                  <View style={styles.restTopButtons}>
                    <TouchableOpacity
                      style={StyleSheet.flatten([styles.smallBtn, styles.smallBtnCompact, styles.startBtn])}
                      onPress={() => {
                        if (restRunning) {
                          setRestRunning(false);
                        } else {
                          if (restSeconds <= 0) setRestSeconds(restTargetSeconds);
                          setRestRunning(true);
                        }
                      }}
                    >
                      <ThemedText style={styles.smallBtnText}>{restRunning ? 'Pauza' : 'Start'}</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={StyleSheet.flatten([styles.smallBtn, styles.smallBtnCompact])}
                      onPress={() => {
                        setRestRunning(false);
                        setRestSeconds(restTargetSeconds);
                      }}
                    >
                      <ThemedText style={styles.smallBtnText}>Reset</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <View style={styles.timerTrack}>
                <View style={StyleSheet.flatten([styles.timerDot, { left: `${timerRatio * 100}%` }])} />
              </View>
            </View>

            {editableExercises.length === 0 ? (
              <ThemedText style={styles.emptyText}>V tomto tréninku zatím nejsou cviky.</ThemedText>
            ) : (
              editableExercises.map((ex, index) => {
                const series = normalizeSeries(ex);
                return (
                  <View key={`${ex.exerciseId || ex.exerciseName || 'ex'}-${index}`} style={styles.exerciseCard}>
                    <View style={styles.exerciseHeaderRow}>
                      <ThemedText style={styles.exerciseName}>{ex.exerciseName || 'Neznámý cvik'}</ThemedText>
                      <TouchableOpacity style={styles.removeBtn} onPress={() => removeExercise(index)}>
                        <ThemedText style={styles.removeBtnText}>×</ThemedText>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.exerciseHeaderDivider} />

                    {series.map((set, setIndex) => (
                      <View key={`set-${setIndex}`} style={StyleSheet.flatten([styles.setRowCard, setIndex > 0 && styles.setRowDivider])}>
                        <View style={styles.setRowTop}>
                          <ThemedText style={styles.setTitle}>Série {setIndex + 1}</ThemedText>
                          <TouchableOpacity style={styles.setDeleteBtn} onPress={() => removeSeriesFromExercise(index, setIndex)}>
                            <ThemedText style={styles.setDeleteBtnText}>x</ThemedText>
                          </TouchableOpacity>
                        </View>

                        <View style={styles.setInputsRow}>
                          <View style={styles.setInputGroup}>
                            <ThemedText style={styles.inputLabel}>Opakování</ThemedText>
                            <TextInput
                              style={styles.seriesInput}
                              value={toNumber(set.reps).toString()}
                              onChangeText={(text) => updateSeries(index, setIndex, { reps: text === '' ? 0 : Number(text) || 0 })}
                              keyboardType="numeric"
                              placeholder="0"
                              placeholderTextColor="#666"
                            />
                          </View>
                          <View style={styles.setInputGroup}>
                            <ThemedText style={styles.inputLabel}>Váha (kg)</ThemedText>
                            <TextInput
                              style={styles.seriesInput}
                              value={toNumber(set.weight).toString()}
                              onChangeText={(text) => updateSeries(index, setIndex, { weight: text === '' ? 0 : Number(text) || 0 })}
                              keyboardType="numeric"
                              placeholder="0"
                              placeholderTextColor="#666"
                            />
                          </View>
                        </View>
                      </View>
                    ))}

                    <TouchableOpacity style={styles.addSetButton} onPress={() => addSeriesToExercise(index)}>
                      <ThemedText style={styles.addSetButtonText}>+</ThemedText>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
            </ScrollView>

            <View style={styles.addExerciseDock} pointerEvents="box-none">
              {addExerciseOpen ? (
                <View style={styles.addExercisePanel}>
                  <ThemedText style={styles.addExercisePanelTitle}>Přidat cvik</ThemedText>
                  <TextInput
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Vyhledej cvik..."
                    placeholderTextColor="#666"
                  />
                  {filteredSearchExercises.length > 0 ? (
                    <View style={styles.searchResults}>
                      {filteredSearchExercises.map((ex: any) => (
                        <TouchableOpacity key={ex.id} style={styles.searchItem} onPress={() => addExercise(ex)}>
                          <ThemedText style={styles.searchItemText}>{ex.name}</ThemedText>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : (
                    <ThemedText style={styles.emptySearchText}>Napiš název cviku.</ThemedText>
                  )}
                </View>
              ) : null}

              <TouchableOpacity style={styles.addExerciseButton} onPress={() => setAddExerciseOpen((prev) => !prev)}>
                <ThemedText style={styles.addExerciseButtonText}>{addExerciseOpen ? 'Zavřít' : 'Přidat cvik'}</ThemedText>
              </TouchableOpacity>
            </View>

            <Modal
              visible={showUnsavedModal}
              transparent
              animationType="fade"
              onRequestClose={stayOnWorkout}
            >
              <View style={styles.modalBackdrop}>
                <View style={styles.modalCard}>
                  <ThemedText style={styles.modalTitle}>Neuložené změny</ThemedText>
                  <ThemedText style={styles.modalMessage}>
                    Máte neuložené změny. Opravdu chcete odejít bez uložení?
                  </ThemedText>
                  <View style={styles.modalActions}>
                    <TouchableOpacity style={styles.modalButtonSecondary} onPress={stayOnWorkout}>
                      <ThemedText style={styles.modalButtonSecondaryText}>Zůstat</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalButtonDanger} onPress={leaveWithoutSaving}>
                      <ThemedText style={styles.modalButtonDangerText}>Odejít</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </>
        ) : null}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  safeArea: { flex: 1 },
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
    gap: 8,
  },
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  backButtonText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  headerNameInput: {
    flex: 1,
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 8,
    paddingVertical: 0,
  },
  saveTopButton: {
    minWidth: 54,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveTopButtonDisabled: { opacity: 0.5 },
  saveTopButtonText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 24 },
  stateText: { color: '#aaa', fontSize: 14 },
  errorText: { color: '#ff8a8a', fontSize: 14, textAlign: 'center' },
  content: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 110 },
  sectionCard: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 7,
    marginBottom: 10,
  },
  restCard: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    minHeight: 140,
  },
  sectionTitle: { color: '#fff', fontSize: 15, fontWeight: '800', marginBottom: 4 },
  restHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  restTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  restTitleText: { marginBottom: 0 },
  timerAdjustMini: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerAdjustMiniText: {
    color: '#fff',
    fontSize: 12,
    lineHeight: 12,
    fontWeight: '800',
    textAlign: 'center',
    textAlignVertical: 'center' as any,
  },
  restTopButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  restTopActions: {
    alignItems: 'flex-end',
    gap: 0,
  },
  searchInput: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
  },
  searchResults: { marginTop: 8, gap: 6 },
  searchItem: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  searchItemText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  emptySearchText: { color: '#777', fontSize: 12, marginTop: 8 },
  addExerciseDock: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    width: 250,
  },
  addExercisePanel: {
    backgroundColor: '#0F0F0F',
    borderWidth: 1,
    borderColor: '#2b2b2b',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    maxHeight: 280,
  },
  addExercisePanelTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },
  addExerciseButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#D32F2F',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#a12424',
  },
  addExerciseButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  timerTextInline: { color: '#fff', fontSize: 22, fontWeight: '800' },
  timerTrack: {
    height: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(211, 47, 47, 0.25)',
    borderWidth: 1,
    borderColor: '#D32F2F',
    marginTop: 30,
    marginBottom: 2,
    position: 'relative',
    overflow: 'visible',
  },
  timerDot: {
    position: 'absolute',
    top: -2,
    width: 14,
    height: 14,
    marginLeft: -7,
    borderRadius: 7,
    backgroundColor: '#D32F2F',
    borderWidth: 1,
    borderColor: '#fff',
  },
  smallBtn: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  smallBtnCompact: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  startBtn: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  smallBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  emptyText: { color: '#999', fontSize: 14, marginTop: 4 },
  exerciseCard: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    borderLeftWidth: 3,
    borderLeftColor: '#D32F2F',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  exerciseHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  exerciseHeaderDivider: {
    height: 1,
    backgroundColor: '#2a2a2a',
    marginBottom: 2,
  },
  exerciseName: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 0 },
  removeBtn: {
    backgroundColor: '#D32F2F',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: { color: '#fff', fontSize: 14, fontWeight: '700', lineHeight: 14 },
  setRowCard: {
    paddingTop: 3,
    paddingBottom: 3,
  },
  setRowDivider: {
    borderTopWidth: 1,
    borderTopColor: '#262626',
  },
  setRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  setTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  setDeleteBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setDeleteBtnText: {
    color: '#c7c7c7',
    fontSize: 14,
  },
  setInputsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  setInputGroup: {
    flex: 1,
  },
  seriesInput: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '700',
  },
  addSetButton: {
    alignSelf: 'center',
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
  },
  addSetButtonText: {
    color: '#fff',
    fontSize: 18,
    lineHeight: 18,
    fontWeight: '700',
  },
  inputLabel: {
    color: '#888',
    fontSize: 9,
    marginBottom: 1,
    lineHeight: 10,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#101010',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 14,
    padding: 16,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 8,
  },
  modalMessage: {
    color: '#c9c9c9',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalButtonSecondary: {
    backgroundColor: '#1b1b1b',
    borderWidth: 1,
    borderColor: '#353535',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  modalButtonSecondaryText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  modalButtonDanger: {
    backgroundColor: '#D32F2F',
    borderWidth: 1,
    borderColor: '#a12424',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  modalButtonDangerText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
});
