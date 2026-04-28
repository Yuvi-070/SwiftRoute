import type { WeatherForecast } from './weatherService';
import { buildWeatherPromptContext } from './weatherService';

export interface TripDetails {
  destination: string;
  destinationCoords?: { lat: number; lng: number };
  startDate: string;  // ISO date string
  endDate: string;    // ISO date string
  totalDays: number;
  travelers: 'solo' | 'couple' | 'family' | 'friends';
  travelersCount: number;
  budget: 'budget' | 'moderate' | 'luxury';
}

export interface Activity {
  time: 'Morning' | 'Afternoon' | 'Evening';
  activity: string;
  location: string;
  description: string;
  estimatedCost: string;
}

export interface DayItinerary {
  day: number;
  theme: string;
  activities: Activity[];
}

export interface GeneratedItinerary {
  tripTitle: string;
  destination: string;
  duration: number;
  summary: string;
  itinerary: DayItinerary[];
  estimatedTotalCost: string;
  packingTips: string[];
  travelTips: string[];
}

export interface PackingCategory {
  category: string;
  items: string[];
}

export interface PackingList {
  destination: string;
  totalDays: number;
  categories: PackingCategory[];
}

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.1-8b-instant';

function buildPrompt(trip: TripDetails, weather?: WeatherForecast): string {
  const budgetLabel =
    trip.budget === 'budget'
      ? 'budget-friendly (spend as little as possible)'
      : trip.budget === 'moderate'
        ? 'moderate spending (mix of affordable and mid-range options)'
        : 'luxury (high-end experiences, fine dining, premium hotels)';

  const travelersLabel =
    trip.travelers === 'solo'
      ? '1 solo traveler'
      : trip.travelers === 'couple'
        ? '2 people (romantic couple)'
        : trip.travelers === 'family'
          ? `a family of ${trip.travelersCount}`
          : `a group of ${trip.travelersCount} friends`;

  const weatherSection = weather
    ? `\n${buildWeatherPromptContext(weather)}\nUse this weather forecast to tailor each day's activities — suggest indoor alternatives (museums, cafes, galleries) on rainy or snowy days, and outdoor highlights on clear days.\n`
    : '';

  return `You are an expert travel planner. Create a detailed ${trip.totalDays}-day travel itinerary for ${trip.destination}.

Trip details:
- Travelers: ${travelersLabel}
- Budget style: ${budgetLabel}
- Travel dates: ${trip.startDate} to ${trip.endDate}
${weatherSection}
IMPORTANT: Return ONLY a raw JSON object with no markdown, no code blocks, no extra text.

The JSON must follow this exact structure:
{
  "tripTitle": "string",
  "destination": "string",
  "duration": number,
  "summary": "string (2-3 sentences describing the trip)",
  "itinerary": [
    {
      "day": 1,
      "theme": "string (e.g. Arrival & Old City Exploration)",
      "activities": [
        {
          "time": "Morning",
          "activity": "string",
          "location": "string",
          "description": "string (1-2 sentences)",
          "estimatedCost": "string (e.g. ₹1500 per person)"
        },
        {
          "time": "Afternoon",
          "activity": "string",
          "location": "string",
          "description": "string",
          "estimatedCost": "string"
        },
        {
          "time": "Evening",
          "activity": "string",
          "location": "string",
          "description": "string",
          "estimatedCost": "string"
        }
      ]
    }
  ],
  "estimatedTotalCost": "string (e.g. ₹80,000 - ₹1,20,000 per person)",
  "packingTips": ["string", "string", "string"],
  "travelTips": ["string", "string", "string"]
}

Generate exactly ${trip.totalDays} day objects in the itinerary array. Each day must have exactly 3 activities (Morning, Afternoon, Evening).`;
}

async function callGroq(prompt: string, systemMessage: string): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('Groq API key is missing. Set EXPO_PUBLIC_GROQ_API_KEY in your .env file.');
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    if (
      response.status === 429 ||
      errorText.includes('rate_limit_exceeded') ||
      errorText.includes('model_decommissioned')
    ) {
      throw new Error('Our AI is currently experiencing high demand. Please wait a moment and try again.');
    }
    // Avoid leaking raw provider errors / request details to end users.
    console.warn('[Groq] API error', response.status, errorText.slice(0, 500));
    throw new Error('We couldn’t generate your plan right now. Please try again in a moment.');
  }

  const data = await response.json();
  const content: string = data.choices?.[0]?.message?.content ?? '';

  return content
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();
}

export async function generateItinerary(
  trip: TripDetails,
  weather?: WeatherForecast
): Promise<GeneratedItinerary> {
  const cleaned = await callGroq(
    buildPrompt(trip, weather),
    'You are a professional travel planner. You always respond with valid, raw JSON only — no markdown, no code fences, no commentary.'
  );

  try {
    return JSON.parse(cleaned) as GeneratedItinerary;
  } catch (parseErr) {
    console.warn(
      '[Groq] Itinerary JSON parse failed:',
      parseErr instanceof Error ? parseErr.message : String(parseErr),
      'preview:',
      cleaned.slice(0, 300)
    );
    throw new Error('We couldn’t generate a valid itinerary. Please try again.');
  }
}

export async function generatePackingList(
  trip: TripDetails,
  weather?: WeatherForecast
): Promise<PackingList> {
  const weatherNote = weather
    ? `\n${buildWeatherPromptContext(weather)}\nUse the forecast to include weather-appropriate items (e.g. umbrella for rainy days, sunscreen for clear weather).`
    : '';

  const prompt = `Generate a smart packing list for a ${trip.totalDays}-day trip to ${trip.destination}.
Travel dates: ${trip.startDate} to ${trip.endDate}.
Travelers: ${trip.travelers} (${trip.travelersCount} people).
Budget style: ${trip.budget}.
${weatherNote}

IMPORTANT: Return ONLY a raw JSON object with no markdown, no code blocks, no extra text.

The JSON must follow this exact structure:
{
  "destination": "string",
  "totalDays": number,
  "categories": [
    {
      "category": "string (e.g. Clothing, Toiletries, Documents, Electronics, Health & Safety)",
      "items": ["string", "string"]
    }
  ]
}

Include 5-7 categories with 4-8 relevant items each. Be specific and practical.`;

  const cleaned = await callGroq(
    prompt,
    'You are a professional travel packing expert. You always respond with valid, raw JSON only — no markdown, no code fences, no commentary.'
  );

  try {
    return JSON.parse(cleaned) as PackingList;
  } catch (parseErr) {
    console.warn(
      '[Groq] Packing list JSON parse failed:',
      parseErr instanceof Error ? parseErr.message : String(parseErr),
      'preview:',
      cleaned.slice(0, 300)
    );
    throw new Error('We couldn’t generate a valid packing list. Please try again.');
  }
}
