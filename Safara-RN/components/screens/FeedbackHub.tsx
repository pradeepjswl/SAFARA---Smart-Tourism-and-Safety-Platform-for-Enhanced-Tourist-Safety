import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  userEmail?: string;
  theme: "light" | "dark";
  onBack: () => void;
}

export default function FeedbackHub({ userEmail, theme, onBack }: Props) {
  const isDark = theme === "dark";
  const bgColor = isDark ? "#020617" : "#F8FAFC";
  const cardBg = isDark ? "#1E293B" : "#FFFFFF";
  const textColor = isDark ? "#F8FAFC" : "#0F172A";
  const subTextColor = isDark ? "#94A3B8" : "#64748B";

  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating > 0 && feedback.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Feedback</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {submitted ? (
          <View style={[styles.successCard, { backgroundColor: cardBg }]}>
            <Ionicons name="checkmark-circle" size={80} color="#10B981" />
            <Text style={[styles.successTitle, { color: textColor }]}>Thank you!</Text>
            <Text style={[styles.successText, { color: subTextColor }]}>
              Your feedback has been securely transmitted. It helps us improve the travel safety for everyone!
            </Text>
            <TouchableOpacity style={styles.submitBtn} onPress={onBack}>
              <Text style={styles.submitBtnText}>Return Home</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <Text style={[styles.title, { color: textColor }]}>How was your recent trip?</Text>
            <Text style={[styles.subtitle, { color: subTextColor }]}>
              Rate your overall safety and experience below.
            </Text>

            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Ionicons
                    name={rating >= star ? "star" : "star-outline"}
                    size={40}
                    color={rating >= star ? "#FBBF24" : subTextColor}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[styles.textInput, { backgroundColor: isDark ? "#334155" : "#F1F5F9", color: textColor }]}
              placeholder="Tell us what went well or what could be improved..."
              placeholderTextColor={subTextColor}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={feedback}
              onChangeText={setFeedback}
            />

            <TouchableOpacity 
              style={[styles.submitBtn, { opacity: (rating > 0 && feedback.trim()) ? 1 : 0.5 }]} 
              disabled={!(rating > 0 && feedback.trim())}
              onPress={handleSubmit}
            >
              <Text style={styles.submitBtnText}>Submit Feedback</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "rgba(100,100,100,0.1)",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  content: {
    padding: 20,
  },
  card: {
    padding: 24,
    borderRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  textInput: {
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    marginBottom: 24,
  },
  submitBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitBtnText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
  },
  successCard: {
    padding: 40,
    borderRadius: 20,
    alignItems: "center",
    elevation: 5,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  successText: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
});
