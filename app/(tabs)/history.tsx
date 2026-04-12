import HeaderLogo from '@/components/header-logo';
import MenuButton from '@/components/menu-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { useDrawer } from '@/contexts/DrawerContext';
import { db } from '@/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';

type WorkoutExercise = {
  exerciseId?: string;
  exerciseName?: string;
  sets?: number;
  reps?: number;
  weight?: number;
};

type WorkoutDoc = {
  id: string;
  name: string;
  lastChangedAtMs: number;
  exercises: WorkoutExercise[];
};

function toNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function getCreatedAtMs(rawCreatedAt: any) {
  if (!rawCreatedAt) return 0;

  // Firestore Timestamp usually contains toMillis().
  if (typeof rawCreatedAt?.toMillis === 'function') {
    return rawCreatedAt.toMillis();
  }

  // Fallback for serialized timestamp-like object.
  if (typeof rawCreatedAt?.seconds === 'number') {
    return rawCreatedAt.seconds * 1000;
  }

  return 0;
}

function workoutVolume(workout: WorkoutDoc) {
  return workout.exercises.reduce((sum, ex) => {
    const sets = toNumber(ex.sets);
    const reps = toNumber(ex.reps);
    const weight = toNumber(ex.weight);
    return sum + sets * reps * weight;
  }, 0);
}

export default function HistoryScreen() {
  const { openDrawer } = useDrawer();
  const { user } = useAuth();

  const [workouts, setWorkouts] = useState<WorkoutDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);

  const loadWorkouts = useCallback(async () => {
    if (!user) {
      setWorkouts([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const workoutsQuery = query(
        collection(db, 'workouts'),
        where('userId', '==', user.uid)
      );

      const snapshot = await getDocs(workoutsQuery);
      const loaded: WorkoutDoc[] = snapshot.docs.map((item) => {
        const data = item.data() as any;
        const lastChangedAtMs =
          getCreatedAtMs(data?.updatedAt) ||
          (typeof data?.updatedAtClientMs === 'number' ? data.updatedAtClientMs : 0) ||
          getCreatedAtMs(data?.createdAt);

        return {
          id: item.id,
          name: data?.name || 'Trenink',
          lastChangedAtMs,
          exercises: Array.isArray(data?.exercises) ? data.exercises : [],
        };
      });

      loaded.sort((a, b) => b.lastChangedAtMs - a.lastChangedAtMs);
      setWorkouts(loaded);
    } catch (error) {
      console.error('Chyba pri nacitani historie treninku:', error);
      setWorkouts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    loadWorkouts();
  }, [loadWorkouts]);

  const totalVolume = useMemo(() => workouts.reduce((sum, w) => sum + workoutVolume(w), 0), [workouts]);

  const totalSets = useMemo(() => {
    return workouts.reduce((sum, w) => {
      return sum + w.exercises.reduce((setSum, ex) => setSum + toNumber(ex.sets), 0);
    }, 0);
  }, [workouts]);

  const chartData = useMemo(() => {
    const recent = workouts.slice(0, 7).reverse();
    const maxVolume = Math.max(...recent.map(workoutVolume), 1);

    return recent.map((w) => {
      const volume = workoutVolume(w);
      const ratio = maxVolume > 0 ? volume / maxVolume : 0;
      const dateLabel = w.lastChangedAtMs > 0 ? new Date(w.lastChangedAtMs).toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit' }) : '--.--';

      return {
        id: w.id,
        label: dateLabel,
        volume,
        ratio,
      };
    });
  }, [workouts]);

  const lineChart = useMemo(() => {
    const width = 320;
    const height = 160;
    const paddingX = 14;
    const paddingY = 14;
    const usableWidth = width - paddingX * 2;
    const usableHeight = height - paddingY * 2;

    const points = chartData.map((item, index) => {
      const x = chartData.length === 1
        ? width / 2
        : paddingX + (index / (chartData.length - 1)) * usableWidth;
      const y = Math.min(height - paddingY, height - paddingY - item.ratio * usableHeight + 18);
      return {
        ...item,
        x,
        y,
      };
    });

    return {
      width,
      height,
      points,
      polyline: points.map((p) => `${p.x},${p.y}`).join(' '),
    };
  }, [chartData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadWorkouts();
  }, [loadWorkouts]);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <MenuButton onPress={openDrawer} />
          <ThemedText style={styles.headerTitle}>Historie tréninků</ThemedText>
          <HeaderLogo />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D32F2F" />}
      >
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <ThemedText style={styles.summaryLabel}>Treninky</ThemedText>
            <ThemedText style={styles.summaryValue}>{workouts.length}</ThemedText>
          </View>
          <View style={styles.summaryCard}>
            <ThemedText style={styles.summaryLabel}>Serie celkem</ThemedText>
            <ThemedText style={styles.summaryValue}>{totalSets}</ThemedText>
          </View>
          <View style={styles.summaryCardWide}>
            <ThemedText style={styles.summaryLabel}>Objem celkem (kg)</ThemedText>
            <ThemedText style={styles.summaryValue}>{Math.round(totalVolume).toLocaleString('cs-CZ')}</ThemedText>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <ThemedText style={styles.sectionTitle}>Progres (spojnicový graf, posledních 7)</ThemedText>
          {chartData.length === 0 ? (
            <ThemedText style={styles.emptyText}>Zatim nemas ulozene zadne treninky.</ThemedText>
          ) : (
            <View>
              <View style={styles.lineChartFrame}>
                <Svg width="100%" height={lineChart.height} viewBox={`0 0 ${lineChart.width} ${lineChart.height}`}>
                  <Line x1="14" y1="146" x2="306" y2="146" stroke="#333" strokeWidth="1" />
                  <Line x1="14" y1="14" x2="14" y2="146" stroke="#222" strokeWidth="1" />

                  <Polyline
                    points={lineChart.polyline}
                    fill="none"
                    stroke="#D32F2F"
                    strokeWidth="3"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />

                  {lineChart.points.map((point) => (
                    <Circle
                      key={point.id}
                      cx={point.x}
                      cy={point.y}
                      r="4"
                      fill="#fff"
                      stroke="#D32F2F"
                      strokeWidth="2"
                    />
                  ))}
                </Svg>
              </View>

              <View style={styles.lineChartLabels}>
                {lineChart.points.map((point) => (
                  <View key={`${point.id}-label`} style={styles.lineChartLabelItem}>
                    <ThemedText style={styles.lineChartValue}>{Math.round(point.volume)}</ThemedText>
                    <ThemedText style={styles.lineChartLabel}>{point.label}</ThemedText>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={styles.sectionCard}>
          <ThemedText style={styles.sectionTitle}>Seznam tréninků</ThemedText>

          {loading ? <ThemedText style={styles.emptyText}>Nacitam historii...</ThemedText> : null}

          {!loading && workouts.length === 0 ? (
            <ThemedText style={styles.emptyText}>Zatim tu nic neni. Uloz prvni trenink v sekci Novy trenink.</ThemedText>
          ) : null}

          {!loading && workouts.map((workout) => {
            const isExpanded = expandedWorkoutId === workout.id;
            const when = workout.lastChangedAtMs > 0
              ? new Date(workout.lastChangedAtMs).toLocaleString('cs-CZ')
              : 'Neznamy cas';

            return (
              <TouchableOpacity
                key={workout.id}
                style={styles.workoutCard}
                activeOpacity={0.9}
                onPress={() => setExpandedWorkoutId(isExpanded ? null : workout.id)}
              >
                <View style={styles.workoutCardTop}>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.workoutName}>{workout.name}</ThemedText>
                    <ThemedText style={styles.workoutMeta}>{when}</ThemedText>
                  </View>
                  <ThemedText style={styles.workoutVolume}>{Math.round(workoutVolume(workout))} kg</ThemedText>
                </View>

                <ThemedText style={styles.workoutMeta}>Cviky: {workout.exercises.length}</ThemedText>

                {isExpanded ? (
                  <View style={styles.exerciseList}>
                    {workout.exercises.map((ex, index) => (
                      <View key={`${workout.id}-${index}`} style={styles.exerciseRow}>
                        <ThemedText style={styles.exerciseName}>{ex.exerciseName || 'Cvik'}</ThemedText>
                        <ThemedText style={styles.exerciseStats}>
                          {toNumber(ex.sets)} x {toNumber(ex.reps)} @ {toNumber(ex.weight)} kg
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
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
  content: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    minWidth: 120,
    backgroundColor: '#111',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    padding: 12,
  },
  summaryCardWide: {
    width: '100%',
    backgroundColor: '#111',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    padding: 12,
  },
  summaryLabel: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  summaryValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },
  sectionCard: {
    backgroundColor: '#111',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    padding: 12,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 12,
  },
  emptyText: {
    color: '#888',
    fontSize: 14,
  },
  lineChartFrame: {
    backgroundColor: '#0B0B0B',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#222',
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  lineChartLabels: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  lineChartLabelItem: {
    flex: 1,
    alignItems: 'center',
  },
  lineChartValue: {
    color: '#aaa',
    fontSize: 10,
    fontWeight: '700',
  },
  lineChartLabel: {
    color: '#bbb',
    fontSize: 10,
    fontWeight: '600',
  },
  workoutCard: {
    backgroundColor: '#0B0B0B',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#222',
    padding: 10,
    marginBottom: 10,
  },
  workoutCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  workoutName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  workoutMeta: {
    color: '#888',
    fontSize: 12,
  },
  workoutVolume: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: '800',
  },
  exerciseList: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#222',
    paddingTop: 8,
    gap: 6,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  exerciseName: {
    color: '#fff',
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  exerciseStats: {
    color: '#bbb',
    fontSize: 12,
    fontWeight: '600',
  },
});
