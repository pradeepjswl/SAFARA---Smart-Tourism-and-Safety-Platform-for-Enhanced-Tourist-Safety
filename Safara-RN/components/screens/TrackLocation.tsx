import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// Placeholder for map; in a real app use react-native-maps
const { width, height } = Dimensions.get("window");

interface Props {
  theme: "light" | "dark";
  onBack: () => void;
}

export default function TrackLocation({ theme, onBack }: Props) {
  const isDark = theme === "dark";
  const bgColor = isDark ? "#020617" : "#F8FAFC";
  const textColor = isDark ? "#F8FAFC" : "#0F172A";
  const cardBg = isDark ? "#1E293B" : "#FFFFFF";

  const [geofenceActive, setGeofenceActive] = useState(true);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Track Location</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.mapContainer}>
        {/* Mock Map Image */}
        <Image 
          source={{ uri: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80" }} 
          style={styles.mapImage} 
        />
        
        {/* Mock Location Marker */}
        <View style={styles.markerContainer}>
          <View style={styles.markerPulse} />
          <Ionicons name="location" size={40} color="#2563EB" />
        </View>

        {/* Floating Controls */}
        <View style={styles.floatingControls}>
          <TouchableOpacity style={[styles.controlBtn, { backgroundColor: cardBg }]}>
            <Ionicons name="locate" size={24} color={textColor} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.controlBtn, { backgroundColor: cardBg, marginTop: 10 }]}>
            <Ionicons name="layers" size={24} color={textColor} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.bottomCard, { backgroundColor: cardBg }]}>
        <View style={styles.row}>
          <View>
            <Text style={[styles.cardTitle, { color: textColor }]}>Geofence Alerts</Text>
            <Text style={styles.cardSubtitle}>Notify family if you leave the safe zone</Text>
          </View>
          <TouchableOpacity 
            style={[styles.toggle, geofenceActive ? styles.toggleActive : styles.toggleInactive]}
            onPress={() => setGeofenceActive(!geofenceActive)}
          >
            <View style={[styles.toggleKnob, geofenceActive ? styles.knobActive : styles.knobInactive]} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.shareBtn}>
          <Ionicons name="share-social" size={20} color="#FFF" />
          <Text style={styles.shareBtnText}>Share Live Location</Text>
        </TouchableOpacity>
      </View>
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
  mapContainer: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  mapImage: {
    width: "100%",
    height: "100%",
    opacity: 0.8,
  },
  markerContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -20,
    marginTop: -40,
    alignItems: "center",
    justifyContent: "center",
  },
  markerPulse: {
    position: "absolute",
    width: 60,
    height: 60,
    backgroundColor: "rgba(37,99,235,0.3)",
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "rgba(37,99,235,0.6)",
  },
  floatingControls: {
    position: "absolute",
    right: 16,
    bottom: 30,
  },
  controlBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  bottomCard: {
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#64748B",
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: "center",
  },
  toggleActive: {
    backgroundColor: "#2563EB",
  },
  toggleInactive: {
    backgroundColor: "#CBD5E1",
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFF",
  },
  knobActive: {
    transform: [{ translateX: 22 }],
  },
  knobInactive: {
    transform: [{ translateX: 0 }],
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  shareBtnText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 15,
  },
});
