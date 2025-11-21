import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import Body, { Slug } from "react-native-body-highlighter"; // Import Slug type

const MUSCLE_OPTIONS = [
  { key: "chest", label: "Hrudník", data: [{ slug: "chest" as Slug, intensity: 2 }] },
  { key: "back", label: "Záda", data: [
      { slug: "upper-back" as Slug, intensity: 2 },
      { slug: "lower-back" as Slug, intensity: 2 }
    ] },
  { key: "deltoids", label: "Ramena", data: [{ slug: "deltoids" as Slug, intensity: 2 }] },
  { key: "biceps", label: "Biceps", data: [{ slug: "biceps" as Slug, intensity: 2 }] },
  { key: "triceps", label: "Triceps", data: [{ slug: "triceps" as Slug, intensity: 2 }] },
  { key: "forearm", label: "Předloktí", data: [{ slug: "forearm" as Slug, intensity: 2 }] },
  { key: "abs", label: "Břicho", data: [{ slug: "abs" as Slug, intensity: 2 }] },
  { key: "quadriceps", label: "Quadriceps", data: [{ slug: "quadriceps" as Slug, intensity: 2 }] },
  { key: "hamstring", label: "Hamstringy", data: [{ slug: "hamstring" as Slug, intensity: 2 }] },
  { key: "calves", label: "Lýtka", data: [{ slug: "calves" as Slug, intensity: 2 }] },
  // Trapézy a hýždě (slugs použité v knihovně)
  { key: "trapezius", label: "Trapézy", data: [{ slug: "trapezius" as Slug, intensity: 2 }] },
  { key: "gluteal", label: "Hýždě", data: [{ slug: "gluteal" as Slug, intensity: 2 }] },
];

export default function MuscleSelectScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<null | typeof MUSCLE_OPTIONS[0]>(null);
  const [side, setSide] = useState<"front" | "back">("front");
  // selector open/close and entrance animation
  const [selectorOpen, setSelectorOpen] = useState(true);
  const entranceAnim = useRef(new Animated.Value(0)).current;
  const openAnim = useRef(new Animated.Value(selectorOpen ? 1 : 0)).current;
  const MAX_SELECTOR_HEIGHT = 240;

  useEffect(() => {
    Animated.timing(entranceAnim, { toValue: 1, duration: 420, useNativeDriver: true }).start();
  }, [entranceAnim]);

  useEffect(() => {
    Animated.timing(openAnim, { toValue: selectorOpen ? 1 : 0, duration: 220, useNativeDriver: false }).start();
  }, [selectorOpen, openAnim]);

  const handleBodyPartPress = (bodyPart: any) => {
    console.log('handleBodyPartPress called:', bodyPart);
    const found = MUSCLE_OPTIONS.find(option =>
      option.data.some(d => d.slug === bodyPart.slug)
    );
    if (found) {
      setSelected(found);
      // auto-rotate for back-facing muscles
      if (found.key === 'back' || found.key === 'hamstring') {
        setSide('back');
      } else {
        setSide('front');
      }
      // keep selector visible
    }
  };

  
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="always">
        <View style={styles.headerInline}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
            accessibilityLabel="Zpět"
          >
            <ThemedText style={styles.headerButtonText}>← Zpět</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setSide(side === "front" ? "back" : "front")}
            accessibilityLabel="Otočit tělo"
          >
            <ThemedText style={styles.headerButtonText}>Otočit</ThemedText>
          </TouchableOpacity>
        </View>

        <ThemedText type="title" style={styles.title}>
          {selected ? selected.label : "Vyberte partii"}
        </ThemedText>

        <View
          style={[styles.bodyPreview, styles.body]}
          
        >
          <Body
            data={selected ? selected.data : []}
            gender="male"
            side={side}
            scale={1.4}
            border="#D32F2F"
            colors={["#D32F2F", "#fff"]}
            onBodyPartPress={handleBodyPartPress}
            
          />

          
          </View>
        

        

        {/* Collapsible selector header + animated list */}
        <TouchableOpacity
          style={[styles.muscleButton, styles.muscleButtonFull, styles.selectorHeader]}
          onPress={() => setSelectorOpen(o => !o)}
          accessibilityRole="button"
        >
          <ThemedText style={styles.muscleButtonText}>{selected ? selected.label : 'Vyberte partii'}</ThemedText>
          <Animated.View style={{ transform: [{ rotate: openAnim.interpolate({ inputRange: [0,1], outputRange: ['0deg','180deg'] }) }] }}>
            <MaterialIcons name="keyboard-arrow-down" size={22} color="#fff" />
          </Animated.View>
        </TouchableOpacity>

        <Animated.View
          style={{
            width: '100%',
            overflow: 'hidden',
            height: openAnim.interpolate({ inputRange: [0,1], outputRange: [0, MAX_SELECTOR_HEIGHT] }),
            opacity: entranceAnim,
            transform: [{ translateY: entranceAnim.interpolate({ inputRange: [0,1], outputRange: [8,0] }) }],
          }}
          pointerEvents={selectorOpen ? 'auto' : 'none'}
        >
          <ScrollView
            style={styles.selectorScroll}
            contentContainerStyle={styles.selectorContent}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
          >
            {MUSCLE_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.muscleButton,
                  styles.muscleButtonFull,
                  selected && selected.key === option.key && styles.muscleButtonActive,
                ]}
                onPress={() => {
                  setSelected(option);
                  // auto-rotate when selecting back-facing muscles
                  if (option.key === 'back' || option.key === 'hamstring' || option.key === 'gluteal') {
                    setSide('back');
                  } else {
                    setSide('front');
                  }
                  // close selector after selection
                  setSelectorOpen(false);
                }}
              >
                <ThemedText
                  style={[
                    styles.muscleButtonText,
                    selected && selected.key === option.key && styles.muscleButtonTextActive,
                  ]}
                >
                  {option.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        <Link
          href={
            selected
              ? { pathname: "/muscle/[type]", params: { type: selected.key } }
              : "/muscleselect"
          }
          asChild
        >
          <TouchableOpacity
            style={styles.openButton}
            disabled={!selected}
          >
            <ThemedText type="defaultSemiBold" style={styles.openButtonText}>
              Zobraz cviky
            </ThemedText>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  content: { alignItems: "center", paddingHorizontal: 24, paddingVertical: 48 },
  title: { fontSize: 28, color: "#D32F2F", fontWeight: "bold", marginBottom: 2 },
  bodyPreview: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    paddingVertical: 12,
    height: 520,
    marginTop: 0,
  },
  body: {
    zIndex: 100,
  },
  selectorRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 18,
    width: "100%",
  },
  muscleButton: {
    backgroundColor: "#111",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: "#333",
  },
  muscleButtonActive: {
    backgroundColor: "#D32F2F",
    borderColor: "#D32F2F",
  },
  muscleButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  muscleButtonTextActive: { color: "#fff" },
  openButton: {
    backgroundColor: "#D32F2F",
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 30,
    marginTop: 8,
  },
  openButtonText: { color: "#fff", fontSize: 16 },
  controlsRow: {
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  flipButton: {
    backgroundColor: "#222",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#333",
  },
  flipButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  headerInline: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 12,
    marginTop: 6,
  },
  headerButton: {
    backgroundColor: "rgba(17,17,17,0.9)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  headerButtonText: { color: "#fff", fontSize: 14, fontWeight: "600", lineHeight: 18, textAlignVertical: "center" as any },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
  },
  overlayZone: {
    position: 'absolute',
    backgroundColor: 'rgba(255,0,0,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,0,0,0.6)',
    borderRadius: 8,
  },
  selectorScroll: {
    width: '100%',
    maxHeight: 240,
    marginBottom: 12,
  },
  selectorContent: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  selectorContainer: {
    width: '100%',
    backgroundColor: '#0f0f0f',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 6,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#222',
  },
  muscleButtonFull: {
    width: '100%',
    paddingHorizontal: 20,
    marginVertical: 6,
    alignItems: 'flex-start',
    zIndex: 300,
    elevation: 6,
  },
  selectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
});