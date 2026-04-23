import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { radii, spacing, typography } from '../../constants/theme';
import { loadTrip } from '../../services/storageService';
import { loadWeather } from '../../services/storageService';
import {
  createMessage,
  getQuickSuggestions,
  loadChatHistory,
  saveChatHistory,
  sendChatMessage,
  type ChatMessage,
} from '../../services/chatService';
import type { GeneratedItinerary, TripDetails } from '../../services/aiService';
import type { WeatherForecast } from '../../services/weatherService';
import AnimatedCard from '../../components/ui/AnimatedCard';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [tripDetails, setTripDetails] = useState<TripDetails | undefined>();
  const [itinerary, setItinerary] = useState<GeneratedItinerary | undefined>();
  const [weather, setWeather] = useState<WeatherForecast | undefined>();
  const [suggestions] = useState(() => getQuickSuggestions());

  // Load trip context and chat history
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const trip = await loadTrip(id);
        if (trip) {
          setTripDetails(trip.tripDetails as unknown as TripDetails);
          setItinerary(trip.itinerary);
        }
        const w = await loadWeather(id);
        if (w) setWeather(w);
        const history = await loadChatHistory(id);
        setMessages(history);
      } catch (err) {
        console.warn('[Chat] Failed to load context:', err);
      }
    })();
  }, [id]);

  const handleSend = useCallback(
    async (text?: string) => {
      const messageText = (text ?? input).trim();
      if (!messageText || sending) return;
      setInput('');

      const userMsg = createMessage('user', messageText);
      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setSending(true);

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      try {
        const response = await sendChatMessage(
          messageText,
          messages,
          tripDetails,
          itinerary,
          weather
        );
        const assistantMsg = createMessage('assistant', response);
        const finalMessages = [...updatedMessages, assistantMsg];
        setMessages(finalMessages);
        if (id) await saveChatHistory(id, finalMessages);

        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } catch (err) {
        const errorMsg = createMessage(
          'assistant',
          `❌ Sorry, something went wrong: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.`
        );
        const finalMessages = [...updatedMessages, errorMsg];
        setMessages(finalMessages);
      } finally {
        setSending(false);
      }
    },
    [input, sending, messages, tripDetails, itinerary, weather, id]
  );

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    return (
      <View
        style={[
          styles.bubbleRow,
          isUser ? styles.bubbleRowUser : styles.bubbleRowAssistant,
        ]}
      >
        {!isUser && (
          <View style={[styles.avatar, { backgroundColor: theme.primaryMuted }]}>
            <Ionicons name="sparkles" size={16} color={theme.primary} />
          </View>
        )}
        <View
          style={[
            styles.bubble,
            isUser
              ? [styles.bubbleUser, { backgroundColor: theme.primary }]
              : [
                  styles.bubbleAssistant,
                  {
                    backgroundColor: theme.surfaceElevated,
                    borderColor: theme.border,
                  },
                ],
          ]}
        >
          <Text
            style={[
              styles.bubbleText,
              { color: isUser ? '#FFF' : theme.textPrimary },
            ]}
          >
            {item.content}
          </Text>
          <Text
            style={[
              styles.bubbleTime,
              {
                color: isUser
                  ? 'rgba(255,255,255,0.6)'
                  : theme.textTertiary,
              },
            ]}
          >
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  const destination = tripDetails?.destination?.split(',')[0] ?? 'your trip';

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}
      >
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: theme.primaryMuted }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={theme.primary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
            AI Assistant ✨
          </Text>
          <Text
            style={[styles.headerSub, { color: theme.textSecondary }]}
            numberOfLines={1}
          >
            Ask anything about {destination}
          </Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <AnimatedCard delay={0}>
              <View style={[styles.emptyIcon, { backgroundColor: theme.primaryMuted }]}>
                <Ionicons name="chatbubbles-outline" size={40} color={theme.primary} />
              </View>
            </AnimatedCard>
            <AnimatedCard delay={100}>
              <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
                Your AI Travel Assistant
              </Text>
            </AnimatedCard>
            <AnimatedCard delay={200}>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Ask about restaurants, activities, transport, weather — anything about{' '}
                {destination}!
              </Text>
            </AnimatedCard>

            {/* Quick suggestions */}
            <AnimatedCard delay={300}>
              <View style={styles.suggestionsGrid}>
                {suggestions.slice(0, 4).map((suggestion) => (
                  <TouchableOpacity
                    key={suggestion}
                    style={[
                      styles.suggestionChip,
                      {
                        backgroundColor: theme.surfaceElevated,
                        borderColor: theme.border,
                      },
                    ]}
                    onPress={() => handleSend(suggestion)}
                    disabled={sending}
                  >
                    <Text
                      style={[styles.suggestionText, { color: theme.textPrimary }]}
                      numberOfLines={2}
                    >
                      {suggestion}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </AnimatedCard>
          </View>
        }
      />

      {/* Typing indicator */}
      {sending && (
        <View style={[styles.typingRow]}>
          <View style={[styles.avatar, { backgroundColor: theme.primaryMuted }]}>
            <Ionicons name="sparkles" size={14} color={theme.primary} />
          </View>
          <View
            style={[
              styles.typingBubble,
              { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
            ]}
          >
            <TypingDots color={theme.textTertiary} />
          </View>
        </View>
      )}

      {/* Input */}
      <View
        style={[
          styles.inputBar,
          { backgroundColor: theme.surface, borderTopColor: theme.border },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.surfaceElevated,
              color: theme.textPrimary,
              borderColor: theme.border,
            },
          ]}
          placeholder="Ask anything..."
          placeholderTextColor={theme.textTertiary}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => handleSend()}
          returnKeyType="send"
          editable={!sending}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendBtn,
            {
              backgroundColor:
                input.trim() && !sending ? theme.primary : theme.border,
            },
          ]}
          onPress={() => handleSend()}
          disabled={!input.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Ionicons name="send" size={18} color="#FFF" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

/** Animated three-dot typing indicator */
function TypingDots({ color }: { color: string }) {
  return (
    <View style={styles.typingDots}>
      {[0, 1, 2].map((i) => (
        <TypingDot key={i} delay={i * 200} color={color} />
      ))}
    </View>
  );
}

function TypingDot({ delay, color }: { delay: number; color: string }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [delay, opacity]);

  return (
    <Animated.View
      style={[
        styles.typingDot,
        { backgroundColor: color, opacity },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.xl,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    ...typography.h3,
  },
  headerSub: {
    ...typography.bodySmall,
    marginTop: 1,
  },
  messageList: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  bubbleRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    alignItems: 'flex-end',
  },
  bubbleRowUser: {
    justifyContent: 'flex-end',
  },
  bubbleRowAssistant: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    marginBottom: 2,
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: radii.xl,
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  bubbleUser: {
    borderBottomRightRadius: 6,
  },
  bubbleAssistant: {
    borderBottomLeftRadius: 6,
    borderWidth: 1,
  },
  bubbleText: {
    ...typography.body,
    lineHeight: 21,
  },
  bubbleTime: {
    ...typography.caption,
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
    lineHeight: 22,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  suggestionChip: {
    width: '47%',
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
  },
  suggestionText: {
    ...typography.bodySmall,
    textAlign: 'center',
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  typingBubble: {
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderBottomLeftRadius: 6,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    gap: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? 34 : spacing.md,
  },
  input: {
    flex: 1,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    ...typography.body,
    maxHeight: 100,
    borderWidth: 1,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
