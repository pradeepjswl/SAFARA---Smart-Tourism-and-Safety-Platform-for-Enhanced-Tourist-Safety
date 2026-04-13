import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Post {
  id: string;
  author: string;
  avatar: string;
  time: string;
  content: string;
  category: "alert" | "news" | "discussion";
  likes: number;
  comments: number;
}

const MOCK_POSTS: Post[] = [
  {
    id: "1",
    author: "Safety Officer Rajesh",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    time: "10 mins ago",
    content: "Heavy rainfall expected near the western ghats. All tourists are advised to avoid trekking trails until further notice.",
    category: "alert",
    likes: 45,
    comments: 12,
  },
  {
    id: "2",
    author: "Local Guide Anjali",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    time: "2 hours ago",
    content: "The annual cultural festival has started in the main square! Free entry for tourists with active IDs.",
    category: "news",
    likes: 120,
    comments: 8,
  },
  {
    id: "3",
    author: "Traveler Tom",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    time: "5 hours ago",
    content: "Any recommendations for authentic local food around the south zone? Preferably vegetarian.",
    category: "discussion",
    likes: 15,
    comments: 32,
  },
];

interface Props {
  userEmail?: string;
  theme: "light" | "dark";
}

export default function CommunityHub({ userEmail, theme }: Props) {
  const [activeTab, setActiveTab] = useState<"all" | "alerts" | "news" | "discussion">("all");

  const isDark = theme === "dark";
  const bgColor = isDark ? "#020617" : "#F8FAFC";
  const cardBg = isDark ? "#1E293B" : "#FFFFFF";
  const textColor = isDark ? "#F8FAFC" : "#0F172A";
  const subTextColor = isDark ? "#94A3B8" : "#64748B";

  const posts = MOCK_POSTS.filter(p => activeTab === "all" || p.category === activeTab);

  const getCategoryColor = (cat: string) => {
    switch(cat) {
      case "alert": return "#EF4444";
      case "news": return "#3B82F6";
      case "discussion": return "#8B5CF6";
      default: return "#64748B";
    }
  };

  const renderPost = ({ item }: { item: Post }) => (
    <View style={[styles.card, { backgroundColor: cardBg }]}>
      <View style={styles.cardHeader}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[styles.author, { color: textColor }]}>{item.author}</Text>
          <Text style={[styles.time, { color: subTextColor }]}>{item.time}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: getCategoryColor(item.category) + '20' }]}>
          <Text style={[styles.badgeText, { color: getCategoryColor(item.category) }]}>
            {item.category.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <Text style={[styles.content, { color: textColor }]}>{item.content}</Text>
      
      <View style={styles.cardFooter}>
        <TouchableOpacity style={styles.footerAction}>
          <Ionicons name="heart-outline" size={20} color={subTextColor} />
          <Text style={[styles.footerActionText, { color: subTextColor }]}>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerAction}>
          <Ionicons name="chatbubble-outline" size={20} color={subTextColor} />
          <Text style={[styles.footerActionText, { color: subTextColor }]}>{item.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerAction}>
          <Ionicons name="share-social-outline" size={20} color={subTextColor} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header Tabs */}
      <View style={styles.tabContainer}>
        {["all", "alert", "news", "discussion"].map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                isActive ? styles.activeTab : { backgroundColor: isDark ? "#334155" : "#E2E8F0" }
              ]}
              onPress={() => setActiveTab(tab as any)}
            >
              <Text style={[styles.tabText, isActive ? styles.activeTabText : { color: subTextColor }]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}s
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={posts}
        keyExtractor={p => p.id}
        renderItem={renderPost}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      {userEmail && (
        <TouchableOpacity style={styles.fab}>
          <Ionicons name="pencil" size={24} color="#FFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: "#2563EB",
  },
  tabText: {
    fontWeight: "600",
    fontSize: 13,
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  author: {
    fontWeight: "700",
    fontSize: 15,
  },
  time: {
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
  },
  content: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
  },
  cardFooter: {
    flexDirection: "row",
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(100,100,100,0.1)",
    paddingTop: 12,
    gap: 20,
  },
  footerAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  footerActionText: {
    fontSize: 13,
    fontWeight: "500",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});
