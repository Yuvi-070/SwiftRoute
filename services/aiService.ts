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

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama3-8b-8192';

function buildPrompt(trip: TripDetails): string {
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

  return `You are an expert travel planner. Create a detailed ${trip.totalDays}-day travel itinerary for ${trip.destination}.

Trip details:
- Travelers: ${travelersLabel}
- Budget style: ${budgetLabel}
- Travel dates: ${trip.startDate} to ${trip.endDate}

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
          "estimatedCost": "string (e.g. $15 per person)"
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
  "estimatedTotalCost": "string (e.g. $800 - $1,200 per person)",
  "packingTips": ["string", "string", "string"],
  "travelTips": ["string", "string", "string"]
}

Generate exactly ${trip.totalDays} day objects in the itinerary array. Each day must have exactly 3 activities (Morning, Afternoon, Evening).`;
}

export async function generateItinerary(
  trip: TripDetails
): Promise<GeneratedItinerary> {
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
        {
          role: 'system',
          content:
            'You are a professional travel planner. You always respond with valid, raw JSON only — no markdown, no code fences, no commentary.',
        },
        {
          role: 'user',
          content: buildPrompt(trip),
        },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const content: string = data.choices?.[0]?.message?.content ?? '';

  // Strip any accidental markdown fences before parsing
  const cleaned = content
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned) as GeneratedItinerary;
  } catch (parseErr) {
    throw new Error(
      `Failed to parse AI response as JSON. Parse error: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}. Response preview: ${cleaned.slice(0, 400)}`
    );
  }
}
