// Jazyk: TypeScript (TSX)
// Popis: Zdrojový soubor projektu.

// Stránka: Explore (Procházení cviků)

// LOGIKA- Import databáze cviků, komponent a ikon. Tady se skládá celá
// obrazovka Explore z dat, navigace a vizuálních prvků.
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
import { Animated, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

// Obrazovka databáze cviků s filtrováním podle kategorií
export default function ExploreScreen() {
  // LOGIKA- Stav pro vybranou kategorii, vyhledávání a počet viditelných
  // výsledků. Díky tomu obrazovka umí filtrovat a postupně odkrývat obsah.
  const [selectedCategory, setSelectedCategory] = useState('Všechny');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(5);
  const { openDrawer } = useDrawer();
  const { profile } = useAuth();

  // LOGIKA- Animace pro postupné zobrazení titulku a seznamu cviků. Obsah se
  // neukáže najednou, ale naváže jemně po načtení obrazovky.
  const titleAnim = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(0)).current;

  // LOGIKA- Spojení všech cviků ze všech kategorií do jednoho pole, aby se s
  // nimi dalo dál filtrovat, řadit a vyhledávat na jednom místě.
  const allExercises = useMemo(() => Object.values(EXERCISES).flat(), []);
  // LOGIKA- Oblíbené cviky z profilu převádíme na seznam ID, protože se pak
  // mnohem rychleji porovnávají při filtrování "Moje top".
  const favoriteIds = useMemo(
    () => (Array.isArray(profile?.favoriteExerciseIds) ? profile.favoriteExerciseIds : []),
    [profile?.favoriteExerciseIds]
  );
  // LOGIKA- Set je vhodnější než pole, když potřebujeme rychle zjistit, jestli
  // je konkrétní cvik mezi oblíbenými.
  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  // LOGIKA- Abecední pořadí pro sekci "Všechny" se připraví jednou, aby bylo
  // stabilní a konzistentní bez ohledu na původní dataset.
  const allExercisesAZ = useMemo(
    () => (allExercises || []).slice().sort((a: any, b: any) => (a.name || '').localeCompare(b.name || '', 'cs')),
    [allExercises]
  );

  // LOGIKA- Spuštění animací při načtení komponenty. Nejprve se ukáže titulek,
  // potom obsah seznamu, aby přechod působil přirozeněji.
  useEffect(() => {
    Animated.sequence([
      Animated.timing(titleAnim, { toValue: 1, duration: 420, useNativeDriver: false }),
      Animated.timing(listAnim, { toValue: 1, duration: 420, useNativeDriver: false }),
    ]).start();
  }, [titleAnim, listAnim]);

  useEffect(() => {
    setVisibleCount(5);
  }, [selectedCategory]);

  useEffect(() => {
    setVisibleCount(5);
  }, [searchQuery]);

  // LOGIKA- Převod obtížnosti cviku na číselnou hodnotu. To se používá při
  // řazení od nejlehčích po nejtěžší a naopak.
  const difficultyValue = (ex: any) => {
    if (!ex || !ex.difficulty) return 1;
    return ex.difficulty === 'hard' ? 3 : ex.difficulty === 'medium' ? 2 : 1;
  };

  // LOGIKA- Filtrování a řazení cviků podle vybrané kategorie. Tady se určuje,
  // jestli uživatel uvidí všechny cviky, jen oblíbené, nebo jen obtížnostní výpis.
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

  const searchedExercises = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return filteredExercises;

    // LOGIKA- Hledání prochází více polí najednou, aby šlo najít cvik podle
    // názvu, vybavení i svalové skupiny.
    return filteredExercises.filter((ex: any) => {
      const searchable = [
        ex?.name || '',
        ex?.equipment || '',
        ...(Array.isArray(ex?.primaryMuscles) ? ex.primaryMuscles : []),
        ...(Array.isArray(ex?.secondaryMuscles) ? ex.secondaryMuscles : []),
      ]
        .join(' ')
        .toLowerCase();

      return searchable.includes(q);
    });
  }, [filteredExercises, searchQuery]);

  const visibleExercises = useMemo(() => {
    return searchedExercises.slice(0, visibleCount);
  }, [searchedExercises, visibleCount]);

  // LOGIKA- Když je výsledků víc než aktuálně zobrazených karet, ukáže se
  // tlačítko pro načtení další dávky.
  const canLoadMore = visibleCount < searchedExercises.length;

  // HTML- Horizontální lišta kategorií pro rychlé přepínání mezi pohledy
  // databáze bez opuštění obrazovky.
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

  // HTML- Výpis cviků po filtrování a hledání. Každá karta vede přímo na detail
  // cviku, kde jsou rozšířené informace a další akce.
  function ExercisePreviewList() {
      return (
        <Animated.View style={{ opacity: listAnim, transform: [{ translateY: listAnim.interpolate({ inputRange: [0,1], outputRange: [8,0] }) }] }}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Vyhledat cvik..."
            placeholderTextColor="#666"
          />

          {/* HTML- Prázdný stav pro hledání, když nic neodpovídá zadanému textu. */}
          {searchQuery.trim() && searchedExercises.length === 0 ? (
            <ThemedText style={styles.emptyStateText}>Žádný cvik neodpovídá hledání.</ThemedText>
          ) : null}

          {/* HTML- Prázdný stav pro oblíbené cviky, pokud uživatel zatím žádné
          // nepřidal do srdíček. */}
          {selectedCategory === 'Moje top' && filteredExercises.length === 0 ? (
            <ThemedText style={styles.emptyStateText}>Zatím nemáš žádné oblíbené cviky. Otevři detail cviku a dej srdíčko.</ThemedText>
          ) : null}

          {/* HTML- Samotné karty cviků, omezené podle visibleCount, aby se seznam
          // rozšiřoval postupně a nepůsobil zbytečně dlouhý hned na začátku. */}
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

          {/* HTML- Tlačítko pro načtení dalších výsledků, pokud ještě nějaké
          // položky zůstaly mimo aktuální výřez seznamu. */}
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
      {/* HTML- Horní lišta obrazovky s menu, názvem databáze a logem. */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <MenuButton onPress={openDrawer} />
          <ThemedText style={styles.headerTitle}>Databáze cviků</ThemedText>
          <HeaderLogo />
        </View>
      </View>
      
      {/* HTML- Scrollovatelná část stránky, ve které je celý katalog cviků i
      // všechny ovládací prvky pro filtrování. */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.content}>
          {/* HTML- Hlavní karta stránky, která drží nadpis, filtry a výsledky
          // pohromadě v jednom vizuálním bloku. */}
          <ThemedView style={styles.popularExercises}>
            <ThemedText style={styles.sectionTitleWhite}>Cviky:</ThemedText>

            {CategoryList()}

            {ExercisePreviewList()}
          </ThemedView>

        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

// CSS- Stylování celé obrazovky Explore v černo-červeném vizuálu aplikace.
// Bloky níže jsou rozdělené podle části UI, kterou ovládají.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  // CSS- Horní lišta s výrazným červeným podkladem a stínem.
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
  // CSS- Prostor pro scrollovatelný obsah pod hlavičkou.
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  // CSS- Zarovnání hlavního obsahu a vnitřní odsazení pro karty a seznam.
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
  // CSS- Připravené stylové bloky pro další titulkové nebo nadpisové části.
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
  // CSS- Doprovodné tlačítko v horní oblasti obrazovky.
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
  // CSS- Kategorie a vyhledávání, které tvoří hlavní filtraci seznamu.
  categoryScroll: { width: '100%', marginBottom: 12 },
  searchInput: {
    width: '100%',
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    color: '#fff',
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
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
  // CSS- Doplňkové filtry, které zůstávají připravené pro budoucí rozšíření.
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
  // CSS- Kontejner hlavní sekce s výpisem cviků.
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
  // CSS- Text pro prázdný stav, když hledání nebo filtr nic nenajde.
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
  // CSS- Karta jednotlivého cviku v seznamu, včetně textů a ikon.
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
