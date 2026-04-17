import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GeneratedItinerary } from './aiService';
import type { WeatherForecast } from './weatherService';

// ─── Key helpers ─────────────────────────────────────────────────────────────

const TRIP_KEY = (id: string) => `@swiftroute:trip:${id}`;
const WEATHER_KEY = (id: string) => `@swiftroute:weather:${id}`;
const PACKING_KEY = (id: string) => `@swiftroute:packing:${id}`;
const EXPENSE_KEY = (id: string) => `@swiftroute:expenses:${id}`;
const ALL_TRIP_IDS_KEY = '@swiftroute:tripIds';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StoredTrip {
  id: string;
  tripDetails: Record<string, unknown>;
  itinerary: GeneratedItinerary;
  createdAt: string;
}

export interface PackingItem {
  id: string;
  label: string;
  checked: boolean;
  category: string;
}

export interface Expense {
  id: string;
  label: string;
  amount: number;
  category: string;
  date: string;
}

export interface ExpenseData {
  totalBudget: number;
  expenses: Expense[];
}

// ─── Trip storage ─────────────────────────────────────────────────────────────

export async function saveTrip(trip: StoredTrip): Promise<void> {
  await AsyncStorage.setItem(TRIP_KEY(trip.id), JSON.stringify(trip));

  // maintain index
  const raw = await AsyncStorage.getItem(ALL_TRIP_IDS_KEY);
  const ids: string[] = raw ? JSON.parse(raw) : [];
  if (!ids.includes(trip.id)) {
    ids.unshift(trip.id);
    await AsyncStorage.setItem(ALL_TRIP_IDS_KEY, JSON.stringify(ids));
  }
}

export async function loadTrip(id: string): Promise<StoredTrip | null> {
  const raw = await AsyncStorage.getItem(TRIP_KEY(id));
  return raw ? (JSON.parse(raw) as StoredTrip) : null;
}

export async function loadAllTrips(): Promise<StoredTrip[]> {
  const raw = await AsyncStorage.getItem(ALL_TRIP_IDS_KEY);
  const ids: string[] = raw ? JSON.parse(raw) : [];
  const trips = await Promise.all(ids.map(loadTrip));
  return trips.filter((t): t is StoredTrip => t !== null);
}

export async function deleteTrip(id: string): Promise<void> {
  await AsyncStorage.removeItem(TRIP_KEY(id));
  const raw = await AsyncStorage.getItem(ALL_TRIP_IDS_KEY);
  const ids: string[] = raw ? JSON.parse(raw) : [];
  await AsyncStorage.setItem(
    ALL_TRIP_IDS_KEY,
    JSON.stringify(ids.filter((i) => i !== id))
  );
}

// ─── Weather storage ──────────────────────────────────────────────────────────

export async function saveWeather(
  tripId: string,
  weather: WeatherForecast
): Promise<void> {
  await AsyncStorage.setItem(WEATHER_KEY(tripId), JSON.stringify(weather));
}

export async function loadWeather(
  tripId: string
): Promise<WeatherForecast | null> {
  const raw = await AsyncStorage.getItem(WEATHER_KEY(tripId));
  return raw ? (JSON.parse(raw) as WeatherForecast) : null;
}

// ─── Packing list storage ─────────────────────────────────────────────────────

export async function savePackingList(
  tripId: string,
  items: PackingItem[]
): Promise<void> {
  await AsyncStorage.setItem(PACKING_KEY(tripId), JSON.stringify(items));
}

export async function loadPackingList(
  tripId: string
): Promise<PackingItem[] | null> {
  const raw = await AsyncStorage.getItem(PACKING_KEY(tripId));
  return raw ? (JSON.parse(raw) as PackingItem[]) : null;
}

// ─── Expense storage ──────────────────────────────────────────────────────────

export async function saveExpenseData(
  tripId: string,
  data: ExpenseData
): Promise<void> {
  await AsyncStorage.setItem(EXPENSE_KEY(tripId), JSON.stringify(data));
}

export async function loadExpenseData(
  tripId: string
): Promise<ExpenseData | null> {
  const raw = await AsyncStorage.getItem(EXPENSE_KEY(tripId));
  return raw ? (JSON.parse(raw) as ExpenseData) : null;
}
