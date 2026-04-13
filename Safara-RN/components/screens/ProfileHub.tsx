import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";

interface Props {
  userEmail?: string;
  userPhone?: string;
  theme: "light" | "dark";
  onLogout: () => void;
}

const DEFAULT_AVATARS = [
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/women/44.jpg",
  "https://randomuser.me/api/portraits/men/46.jpg",
  "https://randomuser.me/api/portraits/women/68.jpg",
];

export default function ProfileHub({ userEmail, userPhone, theme, onLogout }: Props) {
  const isDark = theme === "dark";
  const bgColor = isDark ? "#020617" : "#F8FAFC";
  const cardBg = isDark ? "#1E293B" : "#FFFFFF";
  const textColor = isDark ? "#F8FAFC" : "#0F172A";
  const subTextColor = isDark ? "#94A3B8" : "#64748B";

  const [avatarIndex, setAvatarIndex] = useState(0);

  const handleChangePicture = () => {
    // Cycle through mock avatars to simulate profile picture changing
    setAvatarIndex((prev) => (prev + 1) % DEFAULT_AVATARS.length);
  };

  const currentAvatar = DEFAULT_AVATARS[avatarIndex];

  return (
    <ScrollView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header / Profile Info */}
      <View style={styles.headerArea}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: currentAvatar }} style={styles.avatar} />
          <TouchableOpacity style={styles.editAvatarBtn} onPress={handleChangePicture}>
            <Ionicons name="camera" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>

        <Text style={[styles.userName, { color: textColor }]}>
          {userEmail ? userEmail.split('@')[0] : "Tourist"}
        </Text>
        <Text style={[styles.userDetails, { color: subTextColor }]}>
          {userPhone || "No Phone Number"}
        </Text>
        <Text style={[styles.userDetails, { color: subTextColor }]}>
          {userEmail || "No Email Provided"}
        </Text>
        
        <TouchableOpacity style={styles.editProfileBtn}>
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Settings Options */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: subTextColor }]}>ACCOUNT SETTINGS</Text>
        
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <TouchableOpacity style={styles.settingRow}>
            <View style={[styles.iconBox, { backgroundColor: "rgba(37,99,235,0.1)" }]}>
              <Feather name="shield" size={20} color="#2563EB" />
            </View>
            <Text style={[styles.settingText, { color: textColor }]}>Personal ID & Verification</Text>
            <Feather name="chevron-right" size={20} color={subTextColor} />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: isDark ? "#334155" : "#E2E8F0" }]} />
          
          <TouchableOpacity style={styles.settingRow}>
            <View style={[styles.iconBox, { backgroundColor: "rgba(139,92,246,0.1)" }]}>
              <Feather name="bell" size={20} color="#8B5CF6" />
            </View>
            <Text style={[styles.settingText, { color: textColor }]}>Notifications</Text>
            <Feather name="chevron-right" size={20} color={subTextColor} />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: isDark ? "#334155" : "#E2E8F0" }]} />

          <TouchableOpacity style={styles.settingRow}>
            <View style={[styles.iconBox, { backgroundColor: "rgba(16,185,129,0.1)" }]}>
              <Feather name="map-pin" size={20} color="#10B981" />
            </View>
            <Text style={[styles.settingText, { color: textColor }]}>Saved Locations</Text>
            <Feather name="chevron-right" size={20} color={subTextColor} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: subTextColor }]}>SUPPORT & MORE</Text>
        
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <TouchableOpacity style={styles.settingRow}>
            <View style={[styles.iconBox, { backgroundColor: "rgba(245,158,11,0.1)" }]}>
              <Feather name="help-circle" size={20} color="#F59E0B" />
            </View>
            <Text style={[styles.settingText, { color: textColor }]}>Help Center</Text>
            <Feather name="chevron-right" size={20} color={subTextColor} />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: isDark ? "#334155" : "#E2E8F0" }]} />
          
          <TouchableOpacity style={styles.settingRow} onPress={onLogout}>
            <View style={[styles.iconBox, { backgroundColor: "rgba(239,68,68,0.1)" }]}>
              <Feather name="log-out" size={20} color="#EF4444" />
            </View>
            <Text style={[styles.settingText, { color: "#EF4444" }]}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerArea: {
    alignItems: "center",
    paddingVertical: 30,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editAvatarBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#2563EB",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#F8FAFC",
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  userDetails: {
    fontSize: 14,
    marginBottom: 2,
  },
  editProfileBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(37,99,235,0.1)",
  },
  editProfileText: {
    color: "#2563EB",
    fontWeight: "600",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
    marginLeft: 8,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    marginLeft: 68,
  },
});
