import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  theme: "light" | "dark";
  onBack: () => void;
}

const FAMILY_MEMBERS = [
  { id: "1", name: "Priya (Wife)", status: "At Hotel", lastSeen: "Just now", avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
  { id: "2", name: "Rahul (Son)", status: "Moving", lastSeen: "5 mins ago", avatar: "https://randomuser.me/api/portraits/men/22.jpg" },
  { id: "3", name: "Mom", status: "Offline", lastSeen: "2 hours ago", avatar: "https://randomuser.me/api/portraits/women/68.jpg" },
];

export default function FamilyCircle({ theme, onBack }: Props) {
  const isDark = theme === "dark";
  const bgColor = isDark ? "#020617" : "#F8FAFC";
  const textColor = isDark ? "#F8FAFC" : "#0F172A";
  const cardBg = isDark ? "#1E293B" : "#FFFFFF";
  const subTextColor = isDark ? "#94A3B8" : "#64748B";

  const renderMember = ({ item }: { item: any }) => {
    const isOnline = item.status !== "Offline";
    return (
      <View style={[styles.memberCard, { backgroundColor: cardBg }]}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
          {isOnline && <View style={styles.onlineDot} />}
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: textColor }]}>{item.name}</Text>
          <Text style={[styles.status, { color: subTextColor }]}>
            {item.status} • {item.lastSeen}
          </Text>
        </View>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="chatbubble-ellipses-outline" size={20} color="#6366F1" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Family Circle</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="person-add" size={20} color={textColor} />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <Ionicons name="shield-checkmark" size={32} color="#10B981" />
        <Text style={styles.summaryText}>All family members are within safe zones.</Text>
      </View>

      <FlatList
        data={FAMILY_MEMBERS}
        keyExtractor={(item) => item.id}
        renderItem={renderMember}
        contentContainerStyle={{ padding: 16 }}
      />
      
      <TouchableOpacity style={styles.addBtn}>
        <Text style={styles.addBtnText}>Invite Member</Text>
      </TouchableOpacity>
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
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16,185,129,0.1)",
    margin: 16,
    padding: 16,
    borderRadius: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.2)",
  },
  summaryText: {
    flex: 1,
    color: "#10B981",
    fontSize: 15,
    fontWeight: "600",
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    backgroundColor: "#10B981",
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  status: {
    fontSize: 13,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(99,102,241,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  addBtn: {
    backgroundColor: "#6366F1",
    margin: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  addBtnText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
  },
});
