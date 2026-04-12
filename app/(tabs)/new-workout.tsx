// Stránka: New Workout (Nový trénink)

// Import databáze cviků a komponent
import { EXERCISES } from '@/app/exercise/data';
import HeaderLogo from '@/components/header-logo';
import MenuButton from '@/components/menu-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { useDrawer } from '@/contexts/DrawerContext';
import { db } from '@/firebase';
import { useFocusEffect, useRouter } from 'expo-router';
import { collection, deleteDoc, doc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, LayoutAnimation, Modal, PanResponder, ScrollView, StyleSheet, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

function toTimestampMs(value: any): number | null {
  if (!value) return null;
  if (typeof value?.toMillis === 'function') return value.toMillis();
  if (typeof value?.seconds === 'number') return value.seconds * 1000;
  return null;
}

function formatDateOnly(timestampMs?: number | null): string {
  if (!timestampMs) return '--.--.----';
  return new Date(timestampMs).toLocaleDateString('cs-CZ');
}

function normalizeWorkoutName(name: unknown): string {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

// Obrazovka pro vytváření nového tréninku
export default function NewWorkoutScreen() {
  const router = useRouter();
  const { openDrawer, setNavigationBlocker } = useDrawer();
  const { user } = useAuth();
  // State pro uchování tréninkových slotů (jednotlivé dny/tréninky)
  const [slots, setSlots] = useState<any[]>([]);
  // State pro sbalený/rozbalený trénink
  const [expandedSlotId, setExpandedSlotId] = useState<string | null>(null);
  // State pro vyhledávání cviků
  const [searchQuery, setSearchQuery] = useState<{ [key: string]: string }>({});
  // State pro editaci názvu slotu
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  // State pro sledování aktivního vyhledávacího pole
  const [activeSearchSlot, setActiveSearchSlot] = useState<string | null>(null);
  // State pro vlastní dialogy
  const [customDialog, setCustomDialog] = useState<{ visible: boolean; title: string; message: string; buttons: any[] }>({ visible: false, title: '', message: '', buttons: [] });
  // State pro ukládání tréninku
  const [isSaving, setIsSaving] = useState(false);
  // State pro sledování neuložených změn
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  // State pro drag-and-drop přesun tréninku
  const [draggingSlotId, setDraggingSlotId] = useState<string | null>(null);
  // ID aktuálně taženého tréninku (ref drží hodnotu i mezi re-rendery během gesta)
  const draggingSlotIdRef = useRef<string | null>(null);
  // Aktuální pořadí slotů dostupné synchronně uvnitř gesture callbacků
  const slotsRef = useRef<any[]>([]);
  // Naměřené výšky jednotlivých karet (pro přesný 50% threshold)
  const slotHeightsRef = useRef<Record<string, number>>({});
  // Index tažené karty v aktuálním pořadí
  const activeDragIndexRef = useRef<number>(-1);
  // O kolik "slotových vzdáleností" už byla karta během dragu vizuálně kompenzována
  const dragVisualOffsetRef = useRef(0);
  // Animovaná vertikální pozice tažené karty
  const dragTranslateY = useRef(new Animated.Value(0)).current;

  // Fallback, když karta ještě nebyla změřena onLayoutem
  const DEFAULT_SLOT_HEIGHT = 78;
  // Mezera mezi kartami, která se počítá do přeskoku na další pozici
  const SLOT_VERTICAL_GAP = 12;

  useEffect(() => {
    slotsRef.current = slots;
  }, [slots]);

  // Získání všech cviků ze všech svalových partií
  const allExercises = Object.values(EXERCISES).flat();

  // Načtení tréninků z Firebase při otevření stránky
  // Funkce pro načtení tréninků z Firebase
  const loadWorkouts = useCallback(async () => {
    if (!user) return;
    
    try {
      const workoutsQuery = query(
        collection(db, 'workouts'),
        where('userId', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(workoutsQuery);
      const uniqueByName = new Map<string, any>();
      
      querySnapshot.forEach((workoutDoc) => {
        const data = workoutDoc.data();
        const mappedExercises = data.exercises.map((ex: any) => ({
          id: ex.exerciseId,
          name: ex.exerciseName,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
        }));

        const slot = {
          id: workoutDoc.id,
          name: data.name,
          order: typeof data.order === 'number' ? data.order : Number.MAX_SAFE_INTEGER,
          lastChangedAtMs:
            toTimestampMs(data.updatedAt) ??
            (typeof data.updatedAtClientMs === 'number' ? data.updatedAtClientMs : null) ??
            toTimestampMs(data.createdAt) ??
            Date.now(),
          exercises: mappedExercises,
        };

        const key = normalizeWorkoutName(slot.name) || `__id__${slot.id}`;
        const existing = uniqueByName.get(key);
        if (!existing || (slot.lastChangedAtMs ?? 0) > (existing.lastChangedAtMs ?? 0)) {
          uniqueByName.set(key, slot);
        }
      });

      const loadedSlots = Array.from(uniqueByName.values()).sort((a, b) => {
        if ((a.order ?? Number.MAX_SAFE_INTEGER) !== (b.order ?? Number.MAX_SAFE_INTEGER)) {
          return (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER);
        }
        return (b.lastChangedAtMs ?? 0) - (a.lastChangedAtMs ?? 0);
      });
      
      setSlots(loadedSlots);
      setExpandedSlotId(null);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Chyba při načítání tréninků:', error);
    }
  }, [user]);

  useEffect(() => {
    loadWorkouts();
  }, [loadWorkouts]);

  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
    }, [loadWorkouts])
  );

  // Registrace navigation blockeru pro kontrolu před odchodem ze stránky
  useEffect(() => {
    const blocker = hasUnsavedChanges && slots.length > 0
      ? async (): Promise<boolean> => {
          return new Promise<boolean>((resolve) => {
            setCustomDialog({
              visible: true,
              title: 'Neuložené změny',
              message: 'Máte neuložené změny. Opravdu chcete odejít bez uložení?',
              buttons: [
                {
                  text: 'Zrušit',
                  onPress: () => {
                    setCustomDialog({ visible: false, title: '', message: '', buttons: [] });
                    resolve(false);
                  },
                  style: 'cancel'
                },
                {
                  text: 'Odejít',
                  onPress: () => {
                    setCustomDialog({ visible: false, title: '', message: '', buttons: [] });
                    setHasUnsavedChanges(false);
                    resolve(true);
                  },
                  style: 'destructive'
                }
              ]
            });
          });
        }
      : null;

    setNavigationBlocker(blocker);

    return () => {
      setNavigationBlocker(null);
    };
  }, [hasUnsavedChanges, slots, setNavigationBlocker]);

  // Funkce pro přidání nového slotu
  function addNewSlot() {
    const newId = `slot-${Date.now()}`;
    const newName = `Trénink ${slots.length + 1}`;
    setSlots(s => [...s, { id: newId, name: newName, lastChangedAtMs: Date.now(), exercises: [] }]);
    setHasUnsavedChanges(true);
    setExpandedSlotId(null);
  }

  // Funkce pro přejmenování slotu
  function renameSlot(slotId: string, newName: string) {
    setSlots(s => s.map(slot => slot.id === slotId ? { ...slot, name: newName, lastChangedAtMs: Date.now() } : slot));
    setHasUnsavedChanges(true);
  }

  // Funkce pro odstranění tréninku
  function removeSlot(slotId: string) {
    const slot = slots.find(s => s.id === slotId);
    
    setCustomDialog({
      visible: true,
      title: 'Odstranit trénink',
      message: `Opravdu chcete odstranit trénink "${slot?.name || 'tento trénink'}"?`,
      buttons: [
        {
          text: 'Zrušit',
          onPress: () => setCustomDialog({ visible: false, title: '', message: '', buttons: [] }),
          style: 'cancel'
        },
        {
          text: 'Odstranit',
          onPress: async () => {
            setCustomDialog({ visible: false, title: '', message: '', buttons: [] });
            
            // Pokud má slot Firebase ID (není to lokální slot-xxx), smažeme ho z Firebase
            if (slotId && !slotId.startsWith('slot-')) {
              try {
                await deleteDoc(doc(db, 'workouts', slotId));
                console.log('Workout deleted from Firebase:', slotId);
              } catch (error) {
                console.error('Chyba při mazání tréninku:', error);
                setCustomDialog({
                  visible: true,
                  title: 'Chyba',
                  message: 'Nepodařilo se odstranit trénink z databáze.',
                  buttons: [
                    {
                      text: 'OK',
                      onPress: () => setCustomDialog({ visible: false, title: '', message: '', buttons: [] }),
                      style: 'cancel'
                    }
                  ]
                });
                return;
              }
            }
            
            // Odebrat z lokálního stavu
            setSlots(s => {
              const next = s.filter(slot => slot.id !== slotId);
              if (expandedSlotId === slotId) {
                setExpandedSlotId(next[0]?.id ?? null);
              }
              return next;
            });
            setHasUnsavedChanges(true);
          },
          style: 'destructive'
        }
      ]
    });
  }

  // Funkce pro odstranění cviku ze slotu
  function removeExerciseFromSlot(slotId: string, exIndex: number) {
    const slot = slots.find(s => s.id === slotId);
    const exerciseName = slot?.exercises[exIndex]?.name || 'tento cvik';
    
    setCustomDialog({
      visible: true,
      title: 'Odstranit cvik',
      message: `Opravdu chcete odstranit ${exerciseName}?`,
      buttons: [
        {
          text: 'Zrušit',
          onPress: () => setCustomDialog({ visible: false, title: '', message: '', buttons: [] }),
          style: 'cancel'
        },
        {
          text: 'Odstranit',
          onPress: () => {
            setSlots(s => s.map(slot => {
              if (slot.id !== slotId) return slot;
              const next = slot.exercises.filter((_: any, idx: number) => idx !== exIndex);
              return { ...slot, exercises: next, lastChangedAtMs: Date.now() };
            }));
            setHasUnsavedChanges(true);
            setCustomDialog({ visible: false, title: '', message: '', buttons: [] });
          },
          style: 'destructive'
        }
      ]
    });
  }

  // Funkce pro přidání cviku do konkrétního slotu s defaultními hodnotami (3 série, 8 opakování, 0 kg)
  function addExerciseToSlot(slotId: string, ex: any, force: boolean = false) {
    const slot = slots.find(s => s.id === slotId);
    const isAlreadyAdded = slot?.exercises.some((e: any) => e.id === ex.id);
    
    if (isAlreadyAdded && !force) {
      setCustomDialog({
        visible: true,
        title: 'Cvik už je přidán',
        message: `${ex.name} už je v tomto tréninku. Chcete ho přidat znovu?`,
        buttons: [
          {
            text: 'Nepřidávat',
            onPress: () => setCustomDialog({ visible: false, title: '', message: '', buttons: [] }),
            style: 'cancel'
          },
          {
            text: 'Přesto přidat',
            onPress: () => {
              setCustomDialog({ visible: false, title: '', message: '', buttons: [] });
              addExerciseToSlot(slotId, ex, true);
            },
            style: 'destructive'
          }
        ]
      });
      return;
    }
    
    const item = { ...ex, sets: 3, reps: 8, weight: 0 };
    setSlots(s => s.map(slot => slot.id === slotId ? { ...slot, exercises: [...slot.exercises, item], lastChangedAtMs: Date.now() } : slot));
    setHasUnsavedChanges(true);
  }

  // Funkce pro aktualizaci parametrů cviku (např. změna počtu sérií nebo opakování)
  function updateExerciseInSlot(slotId: string, exIndex: number, patch: Partial<any>) {
    setSlots(s => s.map(slot => {
      if (slot.id !== slotId) return slot;
      const next = [...slot.exercises];
      next[exIndex] = { ...next[exIndex], ...patch };
      return { ...slot, exercises: next, lastChangedAtMs: Date.now() };
    }));
    setHasUnsavedChanges(true);
  }

  // Přesun tréninku mezi dvěma pozicemi v seznamu
  const moveSlotByIndex = useCallback((fromIndex: number, toIndex: number) => {
    // Plynulá výměna sousedních karet místo "skokového" přerenderu
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSlots((prev) => {
      if (fromIndex < 0 || toIndex < 0 || fromIndex >= prev.length || toIndex >= prev.length) return prev;
      if (fromIndex === toIndex) return prev;

      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      slotsRef.current = next;
      return next;
    });
    setHasUnsavedChanges(true);
  }, []);

  const getSlotTravelDistance = useCallback((slotId?: string) => {
    // Vzdálenost, kterou musí karta vizuálně "přeskočit" na další pozici
    // = výška cílové karty + mezera mezi kartami.
    if (!slotId) return DEFAULT_SLOT_HEIGHT + SLOT_VERTICAL_GAP;
    const measuredHeight = slotHeightsRef.current[slotId] ?? DEFAULT_SLOT_HEIGHT;
    return measuredHeight + SLOT_VERTICAL_GAP;
  }, []);

  const getSwapThreshold = useCallback((slotId?: string) => {
    // Výměna nastane po překročení 50 % sousední karty.
    return Math.max(28, getSlotTravelDistance(slotId) / 2);
  }, [getSlotTravelDistance]);

  const finishDragging = useCallback(() => {
    // Reset interního drag stavu po puštění prstu
    dragVisualOffsetRef.current = 0;
    activeDragIndexRef.current = -1;
    draggingSlotIdRef.current = null;
    Animated.spring(dragTranslateY, {
      toValue: 0,
      useNativeDriver: true,
      speed: 20,
      bounciness: 0,
    }).start(() => {
      setDraggingSlotId(null);
    });
  }, [dragTranslateY]);

  const startDragging = useCallback((slotId: string) => {
    if (slotsRef.current.length < 2) return;

    const index = slotsRef.current.findIndex((slot) => slot.id === slotId);
    if (index === -1) return;

    // Při startu dragu zavřeme editační/interakční stavy,
    // aby gesture nebylo rušeno dalšími elementy.
    setActiveSearchSlot(null);
    setEditingSlotId(null);

    draggingSlotIdRef.current = slotId;
    activeDragIndexRef.current = index;
    dragVisualOffsetRef.current = 0;
    dragTranslateY.setValue(0);
    setDraggingSlotId(slotId);
  }, [dragTranslateY]);

  const slotPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return draggingSlotIdRef.current !== null && Math.abs(gestureState.dy) > 2;
      },
      onPanResponderMove: (_, gestureState) => {
        if (!draggingSlotIdRef.current) return;

        const currentIndex = activeDragIndexRef.current;
        if (currentIndex < 0) return;

        let nextIndex = currentIndex;

        while (nextIndex < slotsRef.current.length - 1) {
          const belowSlotId = slotsRef.current[nextIndex + 1]?.id;
          const belowTravel = getSlotTravelDistance(belowSlotId);
          const downThreshold = getSwapThreshold(belowSlotId);
          // Dolů swapneme až po překročení poloviny sousední karty.
          if (gestureState.dy < dragVisualOffsetRef.current + downThreshold) break;

          moveSlotByIndex(nextIndex, nextIndex + 1);
          nextIndex += 1;
          dragVisualOffsetRef.current += belowTravel;
        }

        while (nextIndex > 0) {
          const aboveSlotId = slotsRef.current[nextIndex - 1]?.id;
          const aboveTravel = getSlotTravelDistance(aboveSlotId);
          const upThreshold = getSwapThreshold(aboveSlotId);
          // Nahoru swapneme až po překročení poloviny sousední karty.
          if (gestureState.dy > dragVisualOffsetRef.current - upThreshold) break;

          moveSlotByIndex(nextIndex, nextIndex - 1);
          nextIndex -= 1;
          dragVisualOffsetRef.current -= aboveTravel;
        }

        activeDragIndexRef.current = nextIndex;

        // Karta zůstává pod prstem i po více swapech.
        // Bez této kompenzace by se s každým přeskokem vizuálně "utrhla".
        dragTranslateY.setValue(gestureState.dy - dragVisualOffsetRef.current);
      },
      onPanResponderRelease: finishDragging,
      onPanResponderTerminate: finishDragging,
    })
  ).current;

  // Funkce pro uložení tréninku do Firebase
  async function saveWorkout() {
    if (!user) {
      setCustomDialog({
        visible: true,
        title: 'Nepřihlášen',
        message: 'Pro uložení tréninku se musíte přihlásit.',
        buttons: [
          {
            text: 'OK',
            onPress: () => setCustomDialog({ visible: false, title: '', message: '', buttons: [] }),
            style: 'cancel'
          }
        ]
      });
      return;
    }

    // Kontrola, zda jsou vyplněné všechny tréninky
    const emptyWorkouts = slots.filter(slot => slot.exercises.length === 0);
    if (emptyWorkouts.length > 0) {
      setCustomDialog({
        visible: true,
        title: 'Prázdné tréninky',
        message: 'Některé tréninky nemají žádné cviky. Chcete je přesto uložit?',
        buttons: [
          {
            text: 'Zrušit',
            onPress: () => setCustomDialog({ visible: false, title: '', message: '', buttons: [] }),
            style: 'cancel'
          },
          {
            text: 'Uložit',
            onPress: () => {
              setCustomDialog({ visible: false, title: '', message: '', buttons: [] });
              performSave();
            },
            style: 'default'
          }
        ]
      });
      return;
    }

    await performSave();
  }

  async function performSave() {
    setIsSaving(true);
    try {
      const existingWorkoutsSnapshot = await getDocs(
        query(collection(db, 'workouts'), where('userId', '==', user?.uid))
      );

      const existingByName = new Map<string, { id: string; changedAtMs: number }>();
      existingWorkoutsSnapshot.forEach((item) => {
        const data = item.data();
        const key = normalizeWorkoutName(data?.name);
        if (!key) return;

        const changedAtMs =
          toTimestampMs(data?.updatedAt) ??
          (typeof data?.updatedAtClientMs === 'number' ? data.updatedAtClientMs : null) ??
          toTimestampMs(data?.createdAt) ??
          0;

        const prev = existingByName.get(key);
        if (!prev || changedAtMs > prev.changedAtMs) {
          existingByName.set(key, { id: item.id, changedAtMs });
        }
      });

      // Existující tréninky aktualizujeme, nové (slot-*) vytvoříme jen jednou.
      const savedSlots = await Promise.all(slots.map(async (slot, index) => {
        const savedAtMs = Date.now();
        const isLocalSlot = typeof slot.id === 'string' && slot.id.startsWith('slot-');
        const normalizedName = normalizeWorkoutName(slot.name);
        const workoutData = {
          userId: user?.uid,
          name: slot.name,
          // Persist pořadí tréninků po custom přerovnání uživatelem
          order: index,
          exercises: slot.exercises.map((ex: any) => ({
            exerciseId: ex.id,
            exerciseName: ex.name,
            sets: ex.sets || 0,
            reps: ex.reps || 0,
            weight: ex.weight || 0,
          })),
          updatedAt: serverTimestamp(),
          updatedAtClientMs: savedAtMs,
        };

        if (isLocalSlot) {
          const existing = normalizedName ? existingByName.get(normalizedName) : undefined;
          const targetDocId = existing?.id ?? `${user?.uid || 'user'}-${slot.id}`;
          const payload = existing
            ? workoutData
            : {
                ...workoutData,
                createdAt: serverTimestamp(),
              };

          await setDoc(doc(db, 'workouts', targetDocId), payload, { merge: true });
          return { ...slot, id: targetDocId, lastChangedAtMs: savedAtMs };
        }

        await setDoc(doc(db, 'workouts', slot.id), workoutData, { merge: true });
        return { ...slot, lastChangedAtMs: savedAtMs };
      }));

      setSlots(savedSlots);

      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Chyba při ukládání tréninku:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      setCustomDialog({
        visible: true,
        title: 'Chyba',
        message: `Nepodařilo se uložit trénink. Chyba: ${error instanceof Error ? error.message : 'Neznámá chyba'}`,
        buttons: [
          {
            text: 'OK',
            onPress: () => setCustomDialog({ visible: false, title: '', message: '', buttons: [] }),
            style: 'cancel'
          }
        ]
      });
    } finally {
      setIsSaving(false);
    }
  }

  function openWorkoutDetail(slotId: string) {
    if (!slotId || slotId.startsWith('slot-')) {
      setCustomDialog({
        visible: true,
        title: 'Neuložený trénink',
        message: 'Nejdřív klikněte na Uložit trénink, pak půjde otevřít detail.',
        buttons: [
          {
            text: 'OK',
            onPress: () => setCustomDialog({ visible: false, title: '', message: '', buttons: [] }),
            style: 'cancel',
          },
        ],
      });
      return;
    }

    router.push({ pathname: '/workout/[id]', params: { id: slotId } });
  }

  return (
    <TouchableWithoutFeedback onPress={() => setActiveSearchSlot(null)}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <MenuButton onPress={openDrawer} />
            <ThemedText style={styles.headerTitle}>Trénink</ThemedText>
            <HeaderLogo />
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.content}>

        <View style={styles.slots}>
          {slots.map(slot => {
            const query = searchQuery[slot.id] || '';
            const isExpanded = expandedSlotId === slot.id;
            const filteredExercises = query
              ? allExercises.filter(ex => ex.name.toLowerCase().includes(query.toLowerCase()))
              : allExercises.slice(0, 20);
            const isDragging = draggingSlotId === slot.id;
            
            return (
            <Animated.View
              key={slot.id}
              style={StyleSheet.flatten([
                styles.slotCard,
                isDragging && styles.slotCardDragging,
                isDragging ? { transform: [{ translateY: dragTranslateY }] } : null,
              ])}
              onLayout={(event) => {
                // Měření výšky karty pro přesný threshold 50 % sousedního tréninku
                slotHeightsRef.current[slot.id] = event.nativeEvent.layout.height;
              }}
              {...slotPanResponder.panHandlers}
            >
              <View style={StyleSheet.flatten([styles.slotHeader, !isExpanded && styles.slotHeaderCollapsed])}>
                <TouchableOpacity
                  style={styles.slotHeaderMain}
                  activeOpacity={0.85}
                  onPress={() => {
                    if (draggingSlotIdRef.current) return;
                    openWorkoutDetail(slot.id);
                  }}
                  // Podržení aktivuje drag režim, bez popupu.
                  onLongPress={() => startDragging(slot.id)}
                  delayLongPress={220}
                >
                  {editingSlotId === slot.id ? (
                    <TextInput
                      style={styles.slotTitleInput}
                      value={slot.name}
                      onChangeText={(text) => renameSlot(slot.id, text)}
                      onBlur={() => setEditingSlotId(null)}
                      autoFocus
                    />
                  ) : (
                    <View style={styles.slotTitleTapArea}>
                      <ThemedText style={styles.slotTitle}>{slot.name}</ThemedText>
                    </View>
                  )}
                  <View style={styles.slotHeaderRight}>
                    <ThemedText style={styles.slotDate}>{formatDateOnly(slot.lastChangedAtMs)}</ThemedText>
                  </View>
                </TouchableOpacity>
                <View style={styles.slotHeaderActions}>
                  <TouchableOpacity 
                    style={styles.deleteSlotButton}
                    onPress={() => removeSlot(slot.id)}
                    disabled={Boolean(draggingSlotId)}
                  >
                    <ThemedText style={styles.deleteSlotButtonText}>×</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>

              {isExpanded ? (
                <>
                  <View style={{ flex: 1, position: 'relative', flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <TextInput
                      style={styles.searchInput}
                      value={query}
                      onChangeText={(text) => setSearchQuery(prev => ({ ...prev, [slot.id]: text }))}
                      onFocus={() => setActiveSearchSlot(slot.id)}
                      placeholder="Vyhledat cvik..."
                      placeholderTextColor="#666"
                    />
                  {activeSearchSlot === slot.id && filteredExercises.length > 0 && (
                    <ScrollView 
                      style={styles.searchDropdown}
                      nestedScrollEnabled={true}
                      keyboardShouldPersistTaps="handled"
                    >
                      {filteredExercises.slice(0, 5).map(ex => (
                        <TouchableOpacity 
                          key={ex.id} 
                          style={styles.searchOption}
                          onPress={() => {
                            addExerciseToSlot(slot.id, ex);
                            setSearchQuery(prev => ({ ...prev, [slot.id]: '' }));
                            setActiveSearchSlot(null);
                          }}
                        >
                          <ThemedText style={styles.searchOptionText}>{ex.name}</ThemedText>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                  </View>

                  <View style={styles.slotExercises}>
                    {slot.exercises.length === 0 ? (
                      <ThemedText style={styles.noExercise}>Žádné cviky</ThemedText>
                    ) : (
                      slot.exercises.map((e: any, i: number) => {
                        return (
                          <View key={i} style={styles.addedExerciseCard}>
                            <View style={styles.exerciseRow}>
                              <ThemedText style={styles.exerciseName}>{e.name}</ThemedText>
                              
                              <View style={styles.controlsCompact}>
                                <View style={styles.weightColumn}>
                                  <ThemedText style={styles.pickerLabel}>Série</ThemedText>
                                  <TextInput
                                    style={styles.weightInput}
                                    value={e.sets === 0 || e.sets ? e.sets.toString() : ''}
                                    onChangeText={(text) => {
                                      if (text === '') {
                                        updateExerciseInSlot(slot.id, i, { sets: '' });
                                      } else {
                                        const num = parseInt(text);
                                        if (!isNaN(num)) {
                                          updateExerciseInSlot(slot.id, i, { sets: num });
                                        }
                                      }
                                    }}
                                    onBlur={() => {
                                      if (e.sets === '' || e.sets === undefined || e.sets === null) {
                                        updateExerciseInSlot(slot.id, i, { sets: 0 });
                                      }
                                    }}
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor="#666"
                                  />
                                </View>

                                <View style={styles.weightColumn}>
                                  <ThemedText style={styles.pickerLabel}>Opak.</ThemedText>
                                  <TextInput
                                    style={styles.weightInput}
                                    value={e.reps === 0 || e.reps ? e.reps.toString() : ''}
                                    onChangeText={(text) => {
                                      if (text === '') {
                                        updateExerciseInSlot(slot.id, i, { reps: '' });
                                      } else {
                                        const num = parseInt(text);
                                        if (!isNaN(num)) {
                                          updateExerciseInSlot(slot.id, i, { reps: num });
                                        }
                                      }
                                    }}
                                    onBlur={() => {
                                      if (e.reps === '' || e.reps === undefined || e.reps === null) {
                                        updateExerciseInSlot(slot.id, i, { reps: 0 });
                                      }
                                    }}
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor="#666"
                                  />
                                </View>

                                <View style={styles.weightColumn}>
                                  <ThemedText style={styles.pickerLabel}>Kg</ThemedText>
                                  <TextInput
                                    style={styles.weightInput}
                                    value={e.weight === 0 || e.weight ? e.weight.toString() : ''}
                                    onChangeText={(text) => {
                                      if (text === '') {
                                        updateExerciseInSlot(slot.id, i, { weight: '' });
                                      } else {
                                        const num = parseFloat(text);
                                        if (!isNaN(num)) {
                                          updateExerciseInSlot(slot.id, i, { weight: num });
                                        }
                                      }
                                    }}
                                    onBlur={() => {
                                      if (e.weight === '' || e.weight === undefined || e.weight === null) {
                                        updateExerciseInSlot(slot.id, i, { weight: 0 });
                                      }
                                    }}
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor="#666"
                                  />
                                </View>
                              </View>
                              
                              <TouchableOpacity 
                                style={styles.removeButton}
                                onPress={() => removeExerciseFromSlot(slot.id, i)}
                              >
                                <ThemedText style={styles.removeButtonText}>×</ThemedText>
                              </TouchableOpacity>
                            </View>
                          </View>
                        );
                      })
                    )}
                  </View>
                </>
              ) : null}
            </Animated.View>
            );
          })}
          
          <TouchableOpacity style={styles.addSlotButton} onPress={addNewSlot}>
            <ThemedText style={styles.addSlotButtonText}>+ Přidat trénink</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={StyleSheet.flatten([styles.saveWorkoutButton, (isSaving || slots.length === 0) && styles.saveWorkoutButtonDisabled])} 
            onPress={saveWorkout}
            disabled={isSaving || slots.length === 0}
          >
            <ThemedText style={StyleSheet.flatten([styles.saveWorkoutButtonText, slots.length === 0 && styles.saveWorkoutButtonTextDisabled])}>
              {isSaving ? 'Ukládám...' : 'Uložit trénink'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Vlastní dialog */}
      <Modal
        transparent={true}
        visible={customDialog.visible}
        animationType="fade"
        onRequestClose={() => setCustomDialog({ visible: false, title: '', message: '', buttons: [] })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>{customDialog.title}</ThemedText>
            <ThemedText style={styles.modalMessage}>{customDialog.message}</ThemedText>
            <View style={styles.modalButtons}>
              {customDialog.buttons.map((btn: any, idx: number) => (
                <TouchableOpacity
                  key={idx}
                  style={StyleSheet.flatten([
                    styles.modalButton,
                    btn.style === 'destructive' && styles.modalButtonDestructive
                  ])}
                  onPress={btn.onPress}
                >
                  <ThemedText style={StyleSheet.flatten([
                    styles.modalButtonText,
                    btn.style === 'destructive' && styles.modalButtonTextDestructive
                  ])}>
                    {btn.text}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
    </TouchableWithoutFeedback>
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
  content: { paddingHorizontal: 12, paddingTop: 24, paddingBottom: 24 },
  headerInline: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, marginTop: 6, marginBottom: 12 },
  headerButton: { backgroundColor: 'rgba(17,17,17,0.9)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#333', justifyContent: 'center', alignItems: 'center' },
  headerButtonText: { color: '#fff', fontSize: 14, fontWeight: '600', lineHeight: 18, textAlignVertical: 'center' as any },
  title: { fontSize: 28, color: '#D32F2F', fontWeight: '800', textAlign: 'center' },
  titleBelowHeader: { marginTop: 8, marginBottom: 6 },
  slots: { marginTop: 18 },
  slotCard: {
    backgroundColor: '#111',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  slotCardDragging: {
    borderColor: '#D32F2F',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 200,
  },
  slotHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 10 },
  slotHeaderCollapsed: { marginBottom: 0 },
  slotHeaderMain: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  slotHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  slotTitleTapArea: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingRight: 4,
  },
  slotHeaderActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  slotTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  slotDate: { color: '#aaa', fontSize: 10, fontWeight: '600' },
  expandToggleButton: { paddingHorizontal: 6, paddingVertical: 2 },
  expandIcon: { color: '#bbb', fontSize: 14, fontWeight: '800' },
  slotTitleInput: { color: '#fff', fontSize: 16, fontWeight: '700', backgroundColor: '#1a1a1a', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#666', minWidth: 120 },
  detailSlotButton: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#444',
  },
  detailSlotButtonText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  deleteSlotButton: { backgroundColor: '#2a2a2a', width: 24, height: 24, borderRadius: 6, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#444' },
  deleteSlotButtonText: { color: '#888', fontSize: 16, fontWeight: '700', lineHeight: 16 },
  searchInput: { flex: 1, backgroundColor: '#1a1a1a', color: '#fff', fontSize: 13, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#333' },
  searchDropdown: { position: 'absolute', top: 40, left: 0, right: 0, backgroundColor: '#2a2a2a', borderRadius: 8, borderWidth: 1, borderColor: '#444', zIndex: 1000, elevation: 10, maxHeight: 200, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.95, shadowRadius: 6 },
  searchOption: { paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#444' },
  searchOptionText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  slotExercises: { minHeight: 40, marginBottom: 8 },
  noExercise: { color: '#888' },
  addedExercise: { backgroundColor: '#0f0f0f', padding: 8, borderRadius: 8, marginBottom: 6 },
  addedExerciseCard: { backgroundColor: '#0f0f0f', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginBottom: 6, borderWidth: 1, borderColor: '#222', borderLeftWidth: 3, borderLeftColor: '#D32F2F' },
  exerciseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 6 },
  exerciseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  exerciseName: { color: '#fff', fontSize: 13, fontWeight: '600', flex: 1, marginRight: 6 },
  exerciseSummary: { color: '#aaa', fontSize: 13, fontWeight: '700' },
  removeButton: { backgroundColor: '#D32F2F', width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center', marginLeft: 4 },
  removeButtonText: { color: '#fff', fontSize: 14, fontWeight: '700', lineHeight: 14 },
  controlsCompact: { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
  pickerColumn: { position: 'relative', zIndex: 10 },
  weightColumn: { minWidth: 45, maxWidth: 50, marginTop: -8 },
  weightInput: { backgroundColor: '#1a1a1a', color: '#fff', fontSize: 12, fontWeight: '700', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: '#333', textAlign: 'center' },
  pickerRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pickerLabel: { color: '#888', fontSize: 9, fontWeight: '600', marginBottom: 1, textAlign: 'center' },
  pickerButton: { backgroundColor: '#1a1a1a', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#333', gap: 6 },
  pickerValue: { color: '#fff', fontSize: 13, fontWeight: '700' },
  pickerArrow: { color: '#888', fontSize: 10 },
  pickerDropdown: { position: 'absolute', top: 42, left: 0, right: 0, backgroundColor: '#2a2a2a', borderRadius: 8, borderWidth: 2, borderColor: '#444', zIndex: 100, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.95, shadowRadius: 6, overflow: 'hidden' },
  pickerOption: { paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#444', backgroundColor: '#2a2a2a' },
  pickerOptionText: { color: '#fff', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  controlsRow: { flexDirection: 'row', gap: 12 },
  controlColumn: { flex: 1 },
  controlsSection: { gap: 12 },
  controlGroup: { gap: 6 },
  controlLabel: { color: '#888', fontSize: 11, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase' },
  selectorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  addScroll: { marginTop: -2 },
  addButton: { backgroundColor: '#1a1a1a', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, marginRight: 6, borderWidth: 1, borderColor: '#333' },
  addButtonText: { color: '#fff', fontSize: 11 },
  addSlotButton: { backgroundColor: '#1a1a1a', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#444', alignItems: 'center', marginTop: 8 },
  addSlotButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  saveWorkoutButton: { backgroundColor: '#D32F2F', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 16, borderWidth: 1, borderColor: '#D32F2F' },
  saveWorkoutButtonDisabled: { backgroundColor: '#444', borderColor: '#444', opacity: 0.7 },
  saveWorkoutButtonText: { color: '#fff', fontSize: 18, fontWeight: '800', textTransform: 'uppercase' },
  saveWorkoutButtonTextDisabled: { color: '#888' },
  addedExerciseRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#111' },
  selectorsRow: { flexDirection: 'row', alignItems: 'center' },
  selectorList: { alignItems: 'center', paddingVertical: 2 },
  selectorButton: { backgroundColor: '#1a1a1a', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, marginRight: 8, borderWidth: 1, borderColor: '#333' },
  selectorButtonCompact: { backgroundColor: '#1a1a1a', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#333', minWidth: 32, alignItems: 'center' },
  selectorButtonSmall: { backgroundColor: '#1a1a1a', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 6, marginRight: 6, borderWidth: 1, borderColor: '#333' },
  selectorButtonActive: { backgroundColor: '#444', borderColor: '#666' },
  selectorText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  selectorTextCompact: { color: '#fff', fontSize: 12, fontWeight: '600' },
  selectorTextSmall: { color: '#fff', fontSize: 11 },
  selectorTextActive: { color: '#fff', fontWeight: '700' },
  // Modal styly
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.85)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  modalContent: { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 20, width: '100%', maxWidth: 400, borderWidth: 1, borderColor: '#333' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 10, textAlign: 'center' },
  modalMessage: { fontSize: 14, color: '#ccc', marginBottom: 20, textAlign: 'center', lineHeight: 20 },
  modalButtons: { flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  modalButton: { flex: 1, backgroundColor: '#2a2a2a', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#444', alignItems: 'center' },
  modalButtonDestructive: { backgroundColor: '#D32F2F', borderColor: '#D32F2F' },
  modalButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  modalButtonTextDestructive: { color: '#fff' },
  // Styly pro uložené tréninky
  savedWorkoutsSection: { marginBottom: 20, paddingVertical: 12 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 12, paddingHorizontal: 4 },
  savedWorkoutCard: { backgroundColor: '#111', padding: 14, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#333', width: '100%' },
  savedWorkoutHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  savedWorkoutInfo: { flex: 1, marginRight: 12 },
  savedWorkoutName: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  savedWorkoutExerciseCount: { color: '#888', fontSize: 12 },
  savedWorkoutButtons: { flexDirection: 'row', gap: 8 },
  savedWorkoutButton: { backgroundColor: '#D32F2F', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', minWidth: 70 },
  savedWorkoutButtonDelete: { backgroundColor: '#444', paddingHorizontal: 14, minWidth: 40 },
  savedWorkoutButtonText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
