import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Link } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import Body, { Slug } from "react-native-body-highlighter"; // Import Slug type

const MUSCLE_OPTIONS = [
  { key: "chest", label: "Hrudník", data: [{ slug: "chest" as Slug, intensity: 2 }] },
  { key: "back", label: "Záda", data: [{ slug: "upper-back" as Slug, intensity: 2 }, { slug: "lower-back" as Slug, intensity: 2 }] },
  { key: "legs", label: "Nohy", data: [{ slug: "quadriceps" as Slug, intensity: 2 }, { slug: "calves" as Slug, intensity: 2 }, { slug: "hamstring" as Slug, intensity: 2 }] },
  { key: "arms", label: "Ruce", data: [{ slug: "biceps" as Slug, intensity: 2 }, { slug: "triceps" as Slug, intensity: 2 }, { slug: "forearm" as Slug, intensity: 2 }] },
];

export default function MuscleSelectScreen() {
  const [selected, setSelected] = useState(MUSCLE_OPTIONS[0]);

  const handleBodyPartPress = (bodyPart: any) => {
    const found = MUSCLE_OPTIONS.find(option =>
      option.data.some(d => d.slug === bodyPart.slug)
    );
    if (found) setSelected(found);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.title}>Vyber partii</ThemedText>

        <View style={styles.bodyPreview}>
          <Body
            data={selected.data}
            gender="male"
            side={selected.key === "back" ? "back" : "front"}
            scale={1.3}
            border="#D32F2F"
            colors={["#D32F2F", "#fff"]}
            onBodyPartPress={handleBodyPartPress}
          />
        </View>

        <View style={styles.selectorRow}>
          {MUSCLE_OPTIONS.map(option => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.muscleButton,
                selected.key === option.key && styles.muscleButtonActive,
              ]}
              onPress={() => setSelected(option)}
            >
              <ThemedText
                style={[
                  styles.muscleButtonText,
                  selected.key === option.key && styles.muscleButtonTextActive,
                ]}
              >
                {option.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <Link href={`/muscle/${selected.key}`} asChild>
          <TouchableOpacity style={styles.openButton}>
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
});