import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

interface Props {
  userEmail?: string;
  theme: "light" | "dark";
  onBack: () => void;
}

const LEADERBOARD_DATA = [
  { id: "1", name: "Anil Kumar", points: 2450, avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
  { id: "2", name: "Priya Singh", points: 2310, avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
  { id: "3", name: "Rohan Sharma", points: 2120, avatar: "https://randomuser.me/api/portraits/men/22.jpg" },
  { id: "4", name: "Nina Mehta", points: 1980, avatar: "https://randomuser.me/api/portraits/women/68.jpg" },
  { id: "5", name: "Arun Verma", points: 1850, avatar: "https://randomuser.me/api/portraits/men/46.jpg" },
];

export default function LeaderboardHub({ userEmail, theme, onBack }: Props) {
  const isDark = theme === "dark";
  const bgColor = isDark ? "#020617" : "#F8FAFC";
  const cardBg = isDark ? "#1E293B" : "#FFFFFF";
  const textColor = isDark ? "#F8FAFC" : "#0F172A";
  const subTextColor = isDark ? "#94A3B8" : "#64748B";

  const renderItem = ({ item, index }: { item: any, index: number }) => {
    const isTop3 = index < 3;
    let rankColor = "#64748B";
    if (index === 0) rankColor = "#FBBF24"; // Gold
    else if (index === 1) rankColor = "#94A3B8"; // Silver
    else if (index === 2) rankColor = "#B45309"; // Bronze

    return (
      <View style={[styles.userCard, { backgroundColor: cardBg }]}>
        <View style={styles.rankContainer}>
          {isTop3 ? (
            <FontAwesome5 name="crown" size={20} color={rankColor} />
          ) : (
            <Text style={[styles.rankText, { color: subTextColor }]}>#{index + 1}</Text>
          )}
        </View>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: textColor }]}>{item.name}</Text>
          <Text style={[styles.userPoints, { color: subTextColor }]}>{item.points} Safety Points</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Leaderboard</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Podium Highlights */}
      <View style={styles.podiumContainer}>
        {/* Silver */}
        <View style={[styles.podiumPlace, { marginTop: 40 }]}>
          <Image source={{ uri: LEADERBOARD_DATA[1].avatar }} style={[styles.podiumAvatar, { borderColor: "#94A3B8" }]} />
          <View style={[styles.podiumPillar, { height: 100, backgroundColor: "#94A3B8" }]}>
            <Text style={styles.podiumRank}>2</Text>
          </View>
          <Text style={[styles.podiumName, { color: textColor }]} numberOfLines={1}>{LEADERBOARD_DATA[1].name.split(' ')[0]}</Text>
        </View>
        
        {/* Gold */}
        <View style={[styles.podiumPlace, { zIndex: 10 }]}>
          <FontAwesome5 name="crown" size={28} color="#FBBF24" style={{ marginBottom: 8 }} />
          <Image source={{ uri: LEADERBOARD_DATA[0].avatar }} style={[styles.podiumAvatar, { borderColor: "#FBBF24", width: 80, height: 80, borderRadius: 40 }]} />
          <View style={[styles.podiumPillar, { height: 140, backgroundColor: "#FBBF24" }]}>
            <Text style={styles.podiumRank}>1</Text>
          </View>
          <Text style={[styles.podiumName, { color: textColor, fontWeight: "800" }]} numberOfLines={1}>{LEADERBOARD_DATA[0].name.split(' ')[0]}</Text>
        </View>

        {/* Bronze */}
        <View style={[styles.podiumPlace, { marginTop: 60 }]}>
          <Image source={{ uri: LEADERBOARD_DATA[2].avatar }} style={[styles.podiumAvatar, { borderColor: "#B45309" }]} />
          <View style={[styles.podiumPillar, { height: 80, backgroundColor: "#B45309" }]}>
            <Text style={styles.podiumRank}>3</Text>
          </View>
          <Text style={[styles.podiumName, { color: textColor }]} numberOfLines={1}>{LEADERBOARD_DATA[2].name.split(' ')[0]}</Text>
        </View>
      </View>

      <View style={styles.listContainer}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Global Ranking</Text>
        <FlatList
          data={LEADERBOARD_DATA}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
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
  podiumContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    height: 250,
  },
  podiumPlace: {
    alignItems: "center",
    width: 90,
  },
  podiumAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    marginBottom: -15,
    zIndex: 2,
    backgroundColor: "#FFF",
  },
  podiumPillar: {
    width: "100%",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  podiumRank: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "800",
  },
  podiumName: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  rankContainer: {
    width: 30,
    alignItems: "center",
  },
  rankText: {
    fontSize: 16,
    fontWeight: "700",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginHorizontal: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  userPoints: {
    fontSize: 13,
  },
});
