import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { requestApi } from '../../lib/api';

export default function ChatbotScreen() {
  const [messages, setMessages] = useState<{ id: string, text: string, sender: 'user' | 'bot' }[]>([
    { id: '1', text: 'Hello! I am your Safara Eco-Travel Assistant. How can I help you travel sustainably today?', sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsgDesc = inputText.trim();
    const newMsg = { id: Date.now().toString(), text: userMsgDesc, sender: 'user' as const };
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setLoading(true);

    try {
      // the requestApi function will automatically append EXPO_PUBLIC_API_URL and auth token
      const res = await requestApi('/chat', {
        method: 'POST',
        body: JSON.stringify({ prompt: userMsgDesc })
      });
      const botMsg = { id: (Date.now() + 1).toString(), text: res.reply || "Sorry, I couldn't get a response.", sender: 'bot' as const };
      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg = { id: (Date.now() + 1).toString(), text: `Error: ${err.message}`, sender: 'bot' as const };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Ionicons name="leaf" size={24} color="#10B981" />
        <Text style={styles.headerText}>Eco-Travel Assistant</Text>
      </View>
      <ScrollView contentContainerStyle={styles.chatArea}>
        {messages.map(msg => (
          <View key={msg.id} style={[styles.messageBubble, msg.sender === 'user' ? styles.userBubble : styles.botBubble]}>
            <Text style={[styles.messageText, msg.sender === 'user' ? styles.userText : styles.botText]}>{msg.text}</Text>
          </View>
        ))}
        {loading && (
          <View style={[styles.messageBubble, styles.botBubble]}>
            <Text style={styles.botText}>Thinking...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask a question..."
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={sendMessage}
        />
        <Pressable style={styles.sendButton} onPress={sendMessage} disabled={loading}>
          <Ionicons name="send" size={20} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerText: { fontSize: 18, fontWeight: '600', marginLeft: 8, color: '#111827' },
  chatArea: { padding: 16, paddingBottom: 32 },
  messageBubble: { padding: 12, borderRadius: 16, marginBottom: 12, maxWidth: '85%' },
  userBubble: { backgroundColor: '#246BFD', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  botBubble: { backgroundColor: '#e5e7eb', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  messageText: { fontSize: 15, lineHeight: 22 },
  userText: { color: '#ffffff' },
  botText: { color: '#111827' },
  inputContainer: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb', backgroundColor: '#fff', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 16, marginRight: 8 },
  sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#246BFD', alignItems: 'center', justifyContent: 'center' },
});
