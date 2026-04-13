import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  time: string;
  isQuickReply?: boolean;
}

interface Props {
  userEmail?: string;
  theme: "light" | "dark";
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    text: "Hello! I am your AI Travel Guide. How can I help you plan your perfect trip today?",
    sender: "bot",
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];

const SUGGESTIONS = [
  "Top 5 places in Goa",
  "Is it safe to travel to Kasol?",
  "Recommend a 3-day itinerary",
];

export default function Chatbot({ userEmail, theme }: Props) {
  const isDark = theme === "dark";
  const bgColor = isDark ? "#020617" : "#F8FAFC";
  const cardBg = isDark ? "#1E293B" : "#FFFFFF";
  const textColor = isDark ? "#F8FAFC" : "#0F172A";
  const inputBg = isDark ? "#334155" : "#E2E8F0";

  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: "user",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(text.trim()),
        sender: "bot",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const getBotResponse = (input: string) => {
    const lower = input.toLowerCase();
    if (lower.includes("goa")) {
      return "Goa is amazing! The top 5 places to visit are Baga Beach, Fort Aguada, Dudhsagar Falls, Basilica of Bom Jesus, and Anjuna Beach. Would you like a detailed itinerary?";
    } else if (lower.includes("safe") || lower.includes("kasol")) {
      return "Kasol is generally safe for tourists, but it's advisable to avoid trekking alone at night. Our app will keep you updated with real-time safety alerts if anything happens in the area.";
    } else if (lower.includes("itinerary")) {
      return "I can help with that! A typical 3-day itinerary includes arriving on Day 1 and relaxing, exploring local landmarks on Day 2, and visiting nearby natural attractions on Day 3. Where are you planning to go?";
    }
    return "That sounds exciting! As your AI travel guide, I can help you find the best spots, check safety alerts, and generate a customized itinerary. Let me know what specific place you are thinking about.";
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === "user";
    return (
      <View style={[styles.messageRow, isUser ? styles.messageUser : styles.messageBot]}>
        {!isUser && (
          <View style={styles.botAvatar}>
            <Ionicons name="sparkles" size={16} color="#FFFFFF" />
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.bubbleUser : [styles.bubbleBot, { backgroundColor: cardBg }]]}>
          <Text style={[styles.messageText, isUser ? { color: "#FFF" } : { color: textColor }]}>
            {item.text}
          </Text>
          <Text style={[styles.timeText, isUser ? { color: "rgba(255,255,255,0.7)" } : { color: "#94A3B8" }]}>
            {item.time}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Animated.View style={[styles.container, { backgroundColor: bgColor, opacity: fadeAnim }]}>
      
      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Typing Indicator */}
      {isTyping && (
        <View style={styles.typingIndicator}>
          <View style={styles.botAvatarSmall}>
            <Ionicons name="sparkles" size={10} color="#FFFFFF" />
          </View>
          <View style={[styles.typingBubble, { backgroundColor: cardBg }]}>
            <Text style={{ color: textColor }}>AI is typing...</Text>
          </View>
        </View>
      )}

      {/* Quick Suggestions (only show if no user messages yet) */}
      {messages.length === 1 && (
        <View style={styles.suggestionsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {SUGGESTIONS.map((sug, idx) => (
              <TouchableOpacity key={idx} style={[styles.suggestionBtn, { backgroundColor: cardBg }]} onPress={() => handleSend(sug)}>
                <Text style={[styles.suggestionText, { color: textColor }]}>{sug}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Input Area */}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={[styles.inputContainer, { backgroundColor: cardBg, borderTopColor: isDark ? "#1E293B" : "#E2E8F0" }]}>
          <TextInput
            style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
            placeholder="Ask your travel guide..."
            placeholderTextColor="#94A3B8"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => handleSend(inputText)}
          />
          <TouchableOpacity 
            style={[styles.sendButton, { opacity: inputText.trim() ? 1 : 0.5 }]} 
            disabled={!inputText.trim()}
            onPress={() => handleSend(inputText)}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-end",
  },
  messageUser: {
    justifyContent: "flex-end",
  },
  messageBot: {
    justifyContent: "flex-start",
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 14,
    borderRadius: 20,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  bubbleUser: {
    backgroundColor: "#8B5CF6",
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  botAvatarSmall: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  typingBubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderBottomLeftRadius: 4,
  },
  suggestionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  suggestionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.3)",
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
});
