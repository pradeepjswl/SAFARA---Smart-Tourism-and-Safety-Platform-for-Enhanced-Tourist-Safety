// src/components/screens/PlanTripHub.tsx
import React from "react";
import {SafeAreaView} from "react-native-safe-area-context";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Badge from "../ui/Badge";

type PlanSection = "agencies" | "direct" | "ai";

interface Props {
  onBack: () => void;
  onNavigate: (section: PlanSection) => void;
}

export default function PlanTripHub({ onBack, onNavigate }: Props) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f3f4f6" }} edges={["top", "left", "right"]}>
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Plan your trip</Text>
          <Text style={styles.headerSubtitle}>
            Choose how to plan your time-bound journey, then generate a Tourist ID.
          </Text>
        </View>
      </View>

      {/* Card List */}
      <View style={styles.cardGrid}>
        {/* 1. Agencies */}
        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.row}>
              <View style={[styles.iconCircle, { backgroundColor: "rgba(22,163,74,0.12)" }]}>
                <Text style={[styles.iconText, { color: "#16a34a" }]}>A</Text>
              </View>

              <View style={styles.textBlock}>
                <Text style={styles.cardTitle}>Browse trusted agencies</Text>
                <Text style={styles.cardSubtitle}>
                  Curated operators, safe itineraries, transparent pricing.
                </Text>
              </View>
            </View>

            <Badge variant="secondary">Recommended</Badge>
          </View>

          <View style={styles.cardFooter}>
            <Button onPress={() => onNavigate("agencies")} variant="secondary">
              <Text style={styles.buttonTextWhite}>Explore agencies →</Text>
            </Button>
          </View>
        </Card>

        {/* 2. AI Planning */}
        <Card style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.iconCircle, { backgroundColor: "rgba(234,179,8,0.12)" }]}>
              <Text style={[styles.iconText, { color: "#eab308" }]}>AI</Text>
            </View>

            <View style={styles.textBlock}>
              <Text style={styles.cardTitle}>Personalised trip with AI</Text>
              <Text style={styles.cardSubtitle}>Get a tailored itinerary with safety guidance.</Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <Button onPress={() => onNavigate("ai")} variant="default">
              <Text style={styles.buttonTextWhite}>Start AI Planning →</Text>
            </Button>
          </View>
        </Card>

        {/* 3. Direct Tourist ID */}
        <Card style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.iconCircle, { backgroundColor: "rgba(59,130,246,0.12)" }]}>
              <Text style={[styles.iconText, { color: "#3b82f6" }]}>D</Text>
            </View>

            <View style={styles.textBlock}>
              <Text style={styles.cardTitle}>Direct Tourist ID</Text>
              <Text style={styles.cardSubtitle}>
                Set dates and go — destination will skip hometown.
              </Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            {/* Changed from secondary to secondary (blue) */}
            <Button variant="secondary" onPress={() => onNavigate("direct")}>
              <Text style={styles.buttonTextWhite}>Generate quickly →</Text>
            </Button>
          </View>
        </Card>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    elevation: 2,
  },

  backButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
  },
  backText: { fontSize: 18, fontWeight: "600" },

  headerTextWrap: { flex: 1, marginLeft: 14 },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  headerSubtitle: { fontSize: 13, color: "#6b7280", marginTop: 2, lineHeight: 18 },

  cardGrid: {
    padding: 18,
    rowGap: 18,
  },

  card: {
    padding: 18,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },

  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    columnGap: 12,
    flexShrink: 1,
  },

  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  iconText: { fontWeight: "800", fontSize: 16 },

  textBlock: { flexShrink: 1, flex: 1 },

  cardTitle: { fontWeight: "700", fontSize: 16, flexShrink: 1, marginBottom: 2 },

  cardSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 17,
    marginTop: 2,
    flexShrink: 1,
  },

  cardFooter: { marginTop: 18 },

  comingSoonBox: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  comingSoonText: { fontSize: 12, color: "#475569", lineHeight: 17 },

  buttonTextWhite: { color: "#ffffff", fontWeight: "600" },
});
