import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Link } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import Body, { Slug } from "react-native-body-highlighter"; // Import Slug type

const MUSCLE_OPTIONS = [
  { key: "chest", label: "Hrudník", data: [{ slug: "chest" as Slug, intensity: 2 }] },
  { key: "back", label: "Záda", data: [
      { slug: "upper-back" as Slug, intensity: 2 },
      { slug: "lower-back" as Slug, intensity: 2 }
    ] },
  { key: "shoulders", label: "Ramena", data: [{ slug: "deltoids" as Slug, intensity: 2 }] },
  { key: "biceps", label: "Biceps", data: [{ slug: "biceps" as Slug, intensity: 2 }] },
  { key: "triceps", label: "Triceps", data: [{ slug: "triceps" as Slug, intensity: 2 }] },
  { key: "forearm", label: "Předloktí", data: [{ slug: "forearm" as Slug, intensity: 2 }] },
  { key: "abs", label: "Břicho", data: [{ slug: "abs" as Slug, intensity: 2 }] },
  { key: "quadriceps", label: "Quadriceps", data: [{ slug: "quadriceps" as Slug, intensity: 2 }] },
  { key: "hamstring", label: "Hamstringy", data: [{ slug: "hamstring" as Slug, intensity: 2 }] },
  { key: "calves", label: "Lýtka", data: [{ slug: "calves" as Slug, intensity: 2 }] },
  // Trapézy a hýždě (slugs použité v knihovně)
  { key: "trapezius", label: "Trapézy", data: [{ slug: "trapezius" as Slug, intensity: 2 }] },
  { key: "glutes", label: "Hýždě", data: [{ slug: "gluteal" as Slug, intensity: 2 }] },
];

export default function MuscleSelectScreen() {
  const [selected, setSelected] = useState<null | typeof MUSCLE_OPTIONS[0]>(null);
  const [side, setSide] = useState<"front" | "back">("front");

  const handleBodyPartPress = (bodyPart: any) => {
    const found = MUSCLE_OPTIONS.find(option =>
      option.data.some(d => d.slug === bodyPart.slug)
    );
    if (found) setSelected(found);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.title}>
          {selected ? selected.label : ""}
        </ThemedText>

        <View style={styles.bodyPreview}>
          <Body
            data={selected ? selected.data : []}
            gender="male"
            side={side}
            scale={1.3}
            border="#D32F2F"
            colors={["#D32F2F", "#fff"]}
            onBodyPartPress={handleBodyPartPress}
          />
        </View>

        <View style={styles.controlsRow}>
          <TouchableOpacity
            onPress={() => setSide(side === "front" ? "back" : "front")}
            style={styles.flipButton}
          >
            <ThemedText style={styles.flipButtonText}>Otočit</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.selectorRow}>
          {/* Pokud je něco vybrané, zobraz pouze ten vybraný prvek; jinak zobraz všechny */}
          {((selected ? [selected] : MUSCLE_OPTIONS) as typeof MUSCLE_OPTIONS).map(
            option => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.muscleButton,
                  selected && selected.key === option.key && styles.muscleButtonActive,
                ]}
                // Pokud se klikne na již vybraný prvek, zruší výběr (tím se zase zobrazí všechny)
                onPress={() => setSelected(selected && selected.key === option.key ? null : option)}
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
            )
          )}
        </View>

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
  content: { alignItems: "center", paddingHorizontal: 24, paddingVertical: 32 },
  title: { fontSize: 28, color: "#D32F2F", fontWeight: "bold", marginBottom: 16 },
  bodyPreview: {
    width: "100%",
    alignItems: "center",
    marginBottom: 24,
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
});