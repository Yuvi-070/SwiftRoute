/**
 * AI Chat Service — Conversational travel assistant using Groq.
 * Context-aware: knows about the user's trip, itinerary, weather, and budget.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GeneratedItinerary, TripDetails } from './aiService';
import type { WeatherForecast } from './weatherService';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface ChatHistory {
  tripId: string;
  messages: ChatMessage[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.1-8b-instant';
const CHAT_KEY = (tripId: string) => `@swiftroute:chat:${tripId}`;
const MAX_HISTORY_MESSAGES = 20; // Keep last 20 messages for context window

// ─── System Prompt Builder ────────────────────────────────────────────────────

function buildSystemPrompt(
  trip?: TripDetails,
  itinerary?: GeneratedItinerary,
  weather?: WeatherForecast
): string {
  let context = `You are SwiftRoute AI, a friendly and knowledgeable travel assistant. You help travelers with their trips — from planning activities, finding restaurants, suggesting alternatives, navigating local culture, and answering any travel question.

Your personality: enthusiastic but concise, practical, and helpful. Use emojis sparingly (1-2 per message max). Keep responses focused and under 200 words unless the user asks for detail.`;

  if (trip) {
    context += `\n\nCurrent trip context:
- Destination: ${trip.destination}
- Dates: ${trip.startDate} to ${trip.endDate}
- Duration: ${trip.totalDays} days
- Travelers: ${trip.travelers} (${trip.travelersCount} people)
- Budget style: ${trip.budget}`;
  }

  if (itinerary) {
    context += `\n\nGenerated itinerary summary:
- Trip title: ${itinerary.tripTitle}
- Estimated cost: ${itinerary.estimatedTotalCost}
- Summary: ${itinerary.summary}`;

    // Include day themes for context
    if (itinerary.itinerary) {
      const dayThemes = itinerary.itinerary
        .map((d) => `Day ${d.day}: ${d.theme}`)
        .join(', ');
      context += `\n- Day themes: ${dayThemes}`;
    }
  }

  if (weather && weather.daily.length > 0) {
    const weatherSummary = weather.daily
      .slice(0, 7)
      .map((d) => `${d.date}: ${d.description} ${d.minTempC}-${d.maxTempC}°C`)
      .join('; ');
    context += `\n\nWeather forecast: ${weatherSummary}`;
  }

  return context;
}

// ─── Quick Suggestions ────────────────────────────────────────────────────────

export function getQuickSuggestions(trip?: TripDetails): string[] {
  const destination = trip?.destination ?? 'my destination';
  return [
    `🍽️ Best local food in ${destination.split(',')[0]}?`,
    `💡 What should I do on a rainy day?`,
    `🏨 Suggest a cheaper hotel option`,
    `🚗 How should I get around?`,
    `📸 Top Instagram-worthy spots?`,
    `🎒 What am I forgetting to pack?`,
  ];
}

// ─── Chat API ─────────────────────────────────────────────────────────────────

export async function sendChatMessage(
  userMessage: string,
  history: ChatMessage[],
  trip?: TripDetails,
  itinerary?: GeneratedItinerary,
  weather?: WeatherForecast
): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('Groq API key is missing. Set EXPO_PUBLIC_GROQ_API_KEY in your .env file.');
  }

  const systemPrompt = buildSystemPrompt(trip, itinerary, weather);

  // Build messages array with system prompt + recent history + new message
  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...history.slice(-MAX_HISTORY_MESSAGES).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: userMessage },
  ];

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Chat API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() ?? 'Sorry, I couldn\'t generate a response.';
}

// ─── Chat Persistence ─────────────────────────────────────────────────────────

export async function saveChatHistory(
  tripId: string,
  messages: ChatMessage[]
): Promise<void> {
  await AsyncStorage.setItem(CHAT_KEY(tripId), JSON.stringify(messages));
}

export async function loadChatHistory(
  tripId: string
): Promise<ChatMessage[]> {
  const raw = await AsyncStorage.getItem(CHAT_KEY(tripId));
  return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
}

export async function clearChatHistory(tripId: string): Promise<void> {
  await AsyncStorage.removeItem(CHAT_KEY(tripId));
}

// ─── Message factory ──────────────────────────────────────────────────────────

export function createMessage(
  role: 'user' | 'assistant',
  content: string
): ChatMessage {
  return {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    role,
    content,
    timestamp: new Date().toISOString(),
  };
}
