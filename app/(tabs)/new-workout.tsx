// Jazyk: TypeScript (TSX)
// Popis: Zdrojový soubor projektu.

// Stránka: New Workout (Nový trénink)

// LOGIKA- Import databáze cviků a komponent. Tahle obrazovka kombinuje výběr
// cviků, ukládání do Firestore, vlastní dialogy i drag-and-drop pořadí.
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

function toInstructionsArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item || '').trim()).filter(Boolean);
  if (typeof value === 'string') {
    const single = value.trim();
    return single ? [single] : [];
  }
  return [];
}

// LOGIKA- Obrazovka pro vytváření nového tréninku. Uživatel tu skládá sloty,
// přidává cviky, upravuje parametry a následně ukládá trénink do databáze.
export default function NewWorkoutScreen() {
  const router = useRouter();
  const { openDrawer, setNavigationBlocker } = useDrawer();
  const { user } = useAuth();
  // LOGIKA- State pro uchování tréninkových slotů, rozbalené karty a všech
  // pomocných stavů okolo hledání, dialogů a drag-and-drop interakce.
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
  // LOGIKA- Ref drží drag stav i mezi re-rendery, aby gesture fungovalo bez
  // ztráty kontextu během pohybu prstu.
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

  // LOGIKA- Výchozí výška karty a mezera mezi kartami, pokud ještě nejsou
  // změřené přes onLayout.
  const DEFAULT_SLOT_HEIGHT = 78;
  // Mezera mezi kartami, která se počítá do přeskoku na další pozici
  const SLOT_VERTICAL_GAP = 12;

  useEffect(() => {
    slotsRef.current = slots;
  }, [slots]);

  // LOGIKA- Všechny cviky ze všech svalových partií jsou dostupné v jednom poli
  // pro rychlé hledání a vkládání do tréninku.
  const allExercises = Object.values(EXERCISES).flat();

  // HTML- Zobrazení detailů cviku přes vlastní dialog s instrukcemi.
  function showExerciseDetails(exercise: any) {
    const byId = allExercises.find((item: any) => item?.id === exercise?.id);
    const byName = allExercises.find((item: any) => item?.name === exercise?.name);
    const source = byId || byName || exercise;
    const instructions = toInstructionsArray(source?.instructions);

    const message =
      instructions.length > 0
        ? instructions.map((step, index) => `${index + 1}. ${step}`).join('\n')
        : 'Postup pro tento cvik není dostupný.';

    setCustomDialog({
      visible: true,
      title: `Podrobnosti: ${source?.name || 'cvik'}`,
      message,
      buttons: [
        {
          text: 'Zavřít',
          onPress: () => setCustomDialog({ visible: false, title: '', message: '', buttons: [] }),
          style: 'cancel',
        },
      ],
    });
  }

  // LOGIKA- Načtení uložených tréninků z Firebase při otevření stránky.
  // Zároveň sjednocuje data do lokální struktury slotů.
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

  // LOGIKA- Navigation blocker hlídá neuložené změny a zabrání nechtěnému
  // odchodu ze stránky bez potvrzení.
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

  // LOGIKA- Přidání nového slotu do lokálního plánu tréninku.
  function addNewSlot() {
    const newId = `slot-${Date.now()}`;
    const newName = `Trénink ${slots.length + 1}`;
    setSlots(s => [...s, { id: newId, name: newName, lastChangedAtMs: Date.now(), exercises: [] }]);
    setHasUnsavedChanges(true);
    setExpandedSlotId(null);
  }

  // LOGIKA- Přejmenování slotu a okamžité označení změny jako neuložené.
  function renameSlot(slotId: string, newName: string) {
    setSlots(s => s.map(slot => slot.id === slotId ? { ...slot, name: newName, lastChangedAtMs: Date.now() } : slot));
    setHasUnsavedChanges(true);
  }

  // LOGIKA- Odstranění slotu z lokálního stavu a případně i z Firestore.
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
            
            // LOGIKA- Pokud má slot Firebase ID, odstraní se i z databáze.
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
            
            // LOGIKA- Po úspěšném smazání se slot odstraní i z lokálního stavu.
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

  // LOGIKA- Odstranění jednoho cviku z vybraného slotu.
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

  // LOGIKA- Přidání cviku do slotu s výchozími hodnotami pro série, opakování
  // a váhu. Pokud je cvik už přidaný, zobrazí se potvrzení.
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

  // LOGIKA- Aktualizace parametrů cviku v konkrétním slotu.
  function updateExerciseInSlot(slotId: string, exIndex: number, patch: Partial<any>) {
    setSlots(s => s.map(slot => {
      if (slot.id !== slotId) return slot;
      const next = [...slot.exercises];
      next[exIndex] = { ...next[exIndex], ...patch };
      return { ...slot, exercises: next, lastChangedAtMs: Date.now() };
    }));
    setHasUnsavedChanges(true);
  }

  // LOGIKA- Přesun slotu mezi dvěma pozicemi v seznamu pomocí drag-and-drop.
  const moveSlotByIndex = useCallback((fromIndex: number, toIndex: number) => {
    // LOGIKA- Plynulá výměna sousedních karet místo skokového přerenderu.
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
    // LOGIKA- Vzdálenost, kterou musí karta vizuálně přeskočit na další pozici.
    // Počítá se jako výška sousední karty plus mezera mezi kartami.
    if (!slotId) return DEFAULT_SLOT_HEIGHT + SLOT_VERTICAL_GAP;
    const measuredHeight = slotHeightsRef.current[slotId] ?? DEFAULT_SLOT_HEIGHT;
    return measuredHeight + SLOT_VERTICAL_GAP;
  }, []);

  const getSwapThreshold = useCallback((slotId?: string) => {
    // LOGIKA- Swap nastane po překročení zhruba poloviny sousední karty.
    return Math.max(28, getSlotTravelDistance(slotId) / 2);
  }, [getSlotTravelDistance]);

  const finishDragging = useCallback(() => {
    // LOGIKA- Reset interního drag stavu po puštění prstu.
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

    // LOGIKA- Při startu drag režimu se zavřou editační stavy, aby gesture
    // nebylo rušeno vyhledáváním nebo přejmenováním slotu.
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

        // LOGIKA- Karta zůstává pod prstem i po více swapech.
        // Bez této kompenzace by se s každým přeskokem vizuálně utrhla.
        dragTranslateY.setValue(gestureState.dy - dragVisualOffsetRef.current);
      },
      onPanResponderRelease: finishDragging,
      onPanResponderTerminate: finishDragging,
    })
  ).current;

  // LOGIKA- Uložení celého tréninku do Firebase včetně potvrzení prázdných
  // slotů a následného přepnutí do persistované podoby.
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

    // LOGIKA- Kontrola, zda některé sloty nejsou prázdné.
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

      // LOGIKA- Existující tréninky aktualizujeme, nové lokální sloty vytvoříme
      // jako nové dokumenty jen jednou.
      const savedSlots = await Promise.all(slots.map(async (slot, index) => {
        const savedAtMs = Date.now();
        const isLocalSlot = typeof slot.id === 'string' && slot.id.startsWith('slot-');
        const normalizedName = normalizeWorkoutName(slot.name);
        const workoutData = {
          userId: user?.uid,
          name: slot.name,
          // LOGIKA- Persist pořadí tréninků po vlastním přerovnání uživatelem.
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
        {/* HTML- Horní lišta stránky s menu, názvem obrazovky a logem. */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <MenuButton onPress={openDrawer} />
            <ThemedText style={styles.headerTitle}>Trénink</ThemedText>
            <HeaderLogo />
          </View>
        </View>
        {/* HTML- Scrollovatelný obsah, kde jsou sloty, vyhledávání, akce i dialogy. */}
        <ScrollView contentContainerStyle={styles.content}>

        {/* HTML- Seznam všech tréninkových slotů, které si uživatel skládá. */}
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
                // LOGIKA- Měření výšky karty pro přesný threshold při drag-and-drop.
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
                  // LOGIKA- Dlouhý stisk aktivuje drag režim bez otevření detailu.
                  onLongPress={() => startDragging(slot.id)}
                  delayLongPress={220}
                >
                  {/* HTML- Přepínání mezi editací názvu a běžným zobrazením slotu. */}
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
                  {/* HTML- Akce pro odstranění slotu. */}
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

                {/* HTML- Rozbalený obsah slotu: vyhledávání, přidání a editace cviků. */}
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
                  {/* HTML- Dropdown s návrhy cviků se ukáže jen při aktivním poli. */}
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

                  {/* HTML- Seznam cviků už přidaných do slotu. */}
                  <View style={styles.slotExercises}>
                    {slot.exercises.length === 0 ? (
                      <ThemedText style={styles.noExercise}>Žádné cviky</ThemedText>
                    ) : (
                      slot.exercises.map((e: any, i: number) => {
                        return (
                          <View key={i} style={styles.addedExerciseCard}>
                            <View style={styles.exerciseRow}>
                              <View style={styles.exerciseNameWrap}>
                                <ThemedText style={styles.exerciseName}>{e.name}</ThemedText>
                                <TouchableOpacity style={styles.detailButton} onPress={() => showExerciseDetails(e)}>
                                  <ThemedText style={styles.detailButtonText}>Podrobnosti</ThemedText>
                                </TouchableOpacity>
                              </View>
                              
                              {/* HTML- Kompaktní ovládání pro série, opakování a váhu. */}
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
          
          {/* HTML- Tlačítko pro přidání nového tréninkového slotu. */}
          <TouchableOpacity style={styles.addSlotButton} onPress={addNewSlot}>
            <ThemedText style={styles.addSlotButtonText}>+ Přidat trénink</ThemedText>
          </TouchableOpacity>

          {/* HTML- Finální akce pro uložení tréninku do databáze. */}
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
      
      {/* HTML- Vlastní dialog pro potvrzení, chyby a destruktivní akce. */}
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

// CSS- Styly pro uložené tréninky a celý editor tréninku.
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
  // CSS- Doplňkový horní řádek s akcemi nebo nadpisy.
  headerInline: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, marginTop: 6, marginBottom: 12 },
  headerButton: { backgroundColor: 'rgba(17,17,17,0.9)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#333', justifyContent: 'center', alignItems: 'center' },
  headerButtonText: { color: '#fff', fontSize: 14, fontWeight: '600', lineHeight: 18, textAlignVertical: 'center' as any },
  title: { fontSize: 28, color: '#D32F2F', fontWeight: '800', textAlign: 'center' },
  titleBelowHeader: { marginTop: 8, marginBottom: 6 },
  // CSS- Kontejner seznamu slotů.
  slots: { marginTop: 18 },
  // CSS- Karta jednoho tréninkového slotu.
  slotCard: {
    backgroundColor: '#111',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  // CSS- Zvýraznění karty během drag-and-drop.
  slotCardDragging: {
    borderColor: '#D32F2F',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 200,
  },
  // CSS- Hlavička slotu s názvem, datem a akcemi.
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
  // CSS- Hledací pole pro přidávání cviků do slotu.
  searchInput: { flex: 1, backgroundColor: '#1a1a1a', color: '#fff', fontSize: 13, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#333' },
  searchDropdown: { position: 'absolute', top: 40, left: 0, right: 0, backgroundColor: '#2a2a2a', borderRadius: 8, borderWidth: 1, borderColor: '#444', zIndex: 1000, elevation: 10, maxHeight: 200, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.95, shadowRadius: 6 },
  searchOption: { paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#444' },
  searchOptionText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  // CSS- Oblast se seznamem přidaných cviků.
  slotExercises: { minHeight: 40, marginBottom: 8 },
  noExercise: { color: '#888' },
  addedExercise: { backgroundColor: '#0f0f0f', padding: 8, borderRadius: 8, marginBottom: 6 },
  // CSS- Jednotlivá karta přidaného cviku.
  addedExerciseCard: { backgroundColor: '#0f0f0f', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginBottom: 6, borderWidth: 1, borderColor: '#222', borderLeftWidth: 3, borderLeftColor: '#D32F2F' },
  exerciseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 6 },
  exerciseNameWrap: { flex: 1, marginRight: 6 },
  exerciseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  exerciseName: { color: '#fff', fontSize: 13, fontWeight: '600', flex: 1, marginRight: 6 },
  detailButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  detailButtonText: { color: '#ddd', fontSize: 11, fontWeight: '700' },
  exerciseSummary: { color: '#aaa', fontSize: 13, fontWeight: '700' },
  removeButton: { backgroundColor: '#D32F2F', width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center', marginLeft: 4 },
  removeButtonText: { color: '#fff', fontSize: 14, fontWeight: '700', lineHeight: 14 },
  // CSS- Kompaktní řada ovládacích polí pro parametry cviku.
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
  // CSS- Tlačítko pro přidání dalšího slotu.
  addSlotButton: { backgroundColor: '#1a1a1a', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#444', alignItems: 'center', marginTop: 8 },
  addSlotButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  // CSS- Hlavní tlačítko pro uložení tréninku.
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
  // CSS- Překryv pro vlastní potvrzovací dialog.
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.85)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  modalContent: { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 20, width: '100%', maxWidth: 400, borderWidth: 1, borderColor: '#333' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 10, textAlign: 'center' },
  modalMessage: { fontSize: 14, color: '#ccc', marginBottom: 20, textAlign: 'center', lineHeight: 20 },
  modalButtons: { flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  modalButton: { flex: 1, backgroundColor: '#2a2a2a', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#444', alignItems: 'center' },
  modalButtonDestructive: { backgroundColor: '#D32F2F', borderColor: '#D32F2F' },
  modalButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  modalButtonTextDestructive: { color: '#fff' },
  // CSS- Styly pro uložené tréninky, které jsou zobrazené v samostatné části.
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

