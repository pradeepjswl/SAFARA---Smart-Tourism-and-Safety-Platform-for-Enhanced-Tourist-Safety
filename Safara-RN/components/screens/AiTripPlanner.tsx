import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  ActivityIndicator,
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.75;
const SPACING = 16;

interface Props {
  userEmail: string;
  theme: "light" | "dark";
  onBack: () => void;
}

// 1. Core Data
const STATES = [
  "Maharashtra",
  "Rajasthan",
  "Kerala",
  "Goa",
  "Uttarakhand",
  "Himachal Pradesh",
];

const CITIES_BY_STATE: Record<string, string[]> = {
  Maharashtra: ["Mumbai", "Pune", "Nashik", "Aurangabad", "Nagpur"],
  Rajasthan: ["Jaipur", "Udaipur", "Jodhpur", "Jaisalmer", "Pushkar"],
  Kerala: ["Munnar", "Kochi", "Alleppey", "Wayanad", "Varkala"],
  Goa: ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
  Uttarakhand: ["Rishikesh", "Nainital", "Mussoorie", "Dehradun", "Haridwar"],
  "Himachal Pradesh": ["Manali", "Shimla", "Dharamshala", "Dalhousie", "Kasauli"],
};

export default function AiTripPlanner({ userEmail, theme, onBack }: Props) {
  const [selectedState, setSelectedState] = useState<string>(STATES[0]);
  const [selectedCity, setSelectedCity] = useState<string>(CITIES_BY_STATE[STATES[0]][0]);

  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const isDark = theme === "dark";
  const bgColor = isDark ? "#020617" : "#F8FAFC";
  const textColor = isDark ? "#F8FAFC" : "#0F172A";
  const subTextColor = isDark ? "#94A3B8" : "#64748B";
  const cardBg = isDark ? "#1E293B" : "#FFFFFF";

  // When state changes, auto-select first city
  useEffect(() => {
    setSelectedCity(CITIES_BY_STATE[selectedState][0]);
  }, [selectedState]);

  // When city changes, fetch real-time data from Wikipedia
  useEffect(() => {
    fetchPlacesForCity(selectedCity);
  }, [selectedCity]);

  const fetchPlacesForCity = async (city: string) => {
    setLoading(true);
    setPlaces([]);
    try {
      // 1. Fetch top attractions/places in the city using Wikipedia Search API
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=landmarks+in+${city}&utf8=&format=json&origin=*`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();
      const results = searchData.query.search.slice(0, 5); // Take top 5

      // 2. Fetch details for each place
      const detailedPlaces = await Promise.all(
        results.map(async (item: any) => {
          const detailUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
            item.title
          )}`;
          const detailRes = await fetch(detailUrl);
          const detailData = await detailRes.json();
          
          return {
            id: item.pageid.toString(),
            name: detailData.title,
            description: detailData.extract || "A highly recommended place to visit.",
            imageUrl: detailData.thumbnail?.source || "https://images.unsplash.com/photo-1596895111956-bf5705a5a1fde?w=600&q=80",
            rating: (Math.random() * (5.0 - 4.0) + 4.0).toFixed(1), // Mock rating since Wikipedia doesn't have ratings
          };
        })
      );

      setPlaces(detailedPlaces);
    } catch (error) {
      console.error("Failed to fetch places", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStateItem = ({ item }: { item: string }) => {
    const isActive = item === selectedState;
    return (
      <TouchableOpacity
        style={[
          styles.pill,
          isActive
            ? styles.activePill
            : isDark
            ? styles.inactivePillDark
            : styles.inactivePillLight,
        ]}
        onPress={() => setSelectedState(item)}
      >
        <Text
          style={[
            styles.pillText,
            isActive ? styles.activePillText : { color: subTextColor },
            { fontWeight: isActive ? "700" : "500" },
          ]}
        >
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderCityItem = ({ item }: { item: string }) => {
    const isActive = item === selectedCity;
    return (
      <TouchableOpacity
        style={[
          styles.pill,
          { paddingVertical: 6, paddingHorizontal: 16 },
          isActive
            ? styles.activeCityPill
            : isDark
            ? styles.inactivePillDark
            : styles.inactivePillLight,
        ]}
        onPress={() => setSelectedCity(item)}
      >
        <Text
          style={[
            styles.pillText,
            { fontSize: 13 },
            isActive ? styles.activePillText : { color: subTextColor },
            { fontWeight: isActive ? "700" : "500" },
          ]}
        >
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  const scrollX = React.useRef(new Animated.Value(0)).current;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          AI Trip Planner
        </Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="sparkles" size={20} color="#8B5CF6" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* State Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Select State</Text>
          <FlatList
            data={STATES}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item}
            renderItem={renderStateItem}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 10 }}
            ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
          />
        </View>

        {/* City Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Choose City</Text>
          <FlatList
            data={CITIES_BY_STATE[selectedState]}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item}
            renderItem={renderCityItem}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 10 }}
            ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
          />
        </View>

        {/* Places List (Floating Horizontal Style) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor, marginBottom: 4 }]}>
            Best places in {selectedCity}
          </Text>
          <Text style={[styles.sectionSubtitle, { color: subTextColor, marginBottom: 16 }]}>
            Recommended based on real-time data and behavior
          </Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#8B5CF6" />
              <Text style={{ color: subTextColor, marginTop: 10 }}>Analyzing local data...</Text>
            </View>
          ) : (
            <Animated.FlatList
              data={places}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={CARD_WIDTH + SPACING}
              decelerationRate="fast"
              contentContainerStyle={{ paddingHorizontal: 20 }}
              keyExtractor={(item) => item.id}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: true }
              )}
              renderItem={({ item, index }) => {
                const inputRange = [
                  (index - 1) * (CARD_WIDTH + SPACING),
                  index * (CARD_WIDTH + SPACING),
                  (index + 1) * (CARD_WIDTH + SPACING),
                ];

                const scale = scrollX.interpolate({
                  inputRange,
                  outputRange: [0.9, 1, 0.9],
                  extrapolate: "clamp",
                });

                return (
                  <Animated.View
                    style={[
                      styles.floatingCard,
                      { backgroundColor: cardBg, transform: [{ scale }] },
                    ]}
                  >
                    <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
                    <View style={styles.cardContent}>
                      <View style={styles.cardTitleRow}>
                        <Text style={[styles.cardTitle, { color: textColor }]} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <View style={styles.ratingBadge}>
                          <Ionicons name="star" size={12} color="#FBBF24" />
                          <Text style={styles.ratingText}>{item.rating}</Text>
                        </View>
                      </View>
                      <Text style={[styles.cardDescription, { color: subTextColor }]} numberOfLines={3}>
                        {item.description}
                      </Text>
                      
                      <TouchableOpacity style={styles.exploreBtn}>
                        <Text style={styles.exploreBtnText}>Add to Itinerary</Text>
                        <Ionicons name="add-circle" size={18} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </Animated.View>
                );
              }}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(139, 92, 246, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginLeft: 20, marginBottom: 12 },
  sectionSubtitle: { fontSize: 13, marginLeft: 20 },
  
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  activePill: {
    backgroundColor: "#0F172A", // Dark for both themes as accent
  },
  activeCityPill: {
    backgroundColor: "#8B5CF6", // Purple accent
  },
  inactivePillLight: {
    backgroundColor: "#E2E8F0",
  },
  inactivePillDark: {
    backgroundColor: "#334155",
  },
  pillText: { fontSize: 14 },
  activePillText: { color: "#FFFFFF" },
  
  loadingContainer: {
    height: 300,
    justifyContent: "center",
    alignItems: "center",
  },
  
  floatingCard: {
    width: CARD_WIDTH,
    marginRight: SPACING,
    borderRadius: 24,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: 200,
  },
  cardContent: {
    padding: 16,
  },
  cardTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    marginRight: 10,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(251, 191, 36, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#D97706",
    marginLeft: 4,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  exploreBtn: {
    backgroundColor: "#8B5CF6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  exploreBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
});
