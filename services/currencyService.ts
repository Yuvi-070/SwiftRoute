/**
 * Currency Converter Service
 * Uses the free frankfurter.app API — no API key required.
 * Docs: https://www.frankfurter.app/docs/
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ExchangeRates {
  base: string;
  date: string;
  rates: Record<string, number>;
  fetchedAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const API_URL = 'https://api.frankfurter.app';
const CACHE_KEY = '@swiftroute:exchangeRates';
const CACHE_DURATION_MS = 4 * 60 * 60 * 1000; // 4 hours

export const POPULAR_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
];

// ─── API ──────────────────────────────────────────────────────────────────────

export async function fetchExchangeRates(base: string = 'USD'): Promise<ExchangeRates> {
  // Check cache first
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as ExchangeRates;
      const age = Date.now() - new Date(parsed.fetchedAt).getTime();
      if (age < CACHE_DURATION_MS && parsed.base === base) {
        return parsed;
      }
    }
  } catch {}

  const res = await fetch(`${API_URL}/latest?from=${base}`);
  if (!res.ok) {
    throw new Error(`Currency API error: ${res.status}`);
  }

  const data = await res.json();
  const rates: ExchangeRates = {
    base: data.base,
    date: data.date,
    rates: data.rates,
    fetchedAt: new Date().toISOString(),
  };

  // Cache
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(rates));
  } catch {}

  return rates;
}

export function convertCurrency(
  amount: number,
  fromRate: number,
  toRate: number
): number {
  if (fromRate === 0) return 0;
  return (amount / fromRate) * toRate;
}

export function getCurrencySymbol(code: string): string {
  return POPULAR_CURRENCIES.find((c) => c.code === code)?.symbol ?? code;
}

/**
 * Try to guess the destination currency from a place name.
 * Very basic heuristic — covers major destinations.
 */
export function guessDestinationCurrency(destination: string): string {
  const d = destination.toLowerCase();
  if (d.includes('japan') || d.includes('tokyo') || d.includes('kyoto')) return 'JPY';
  if (d.includes('india') || d.includes('delhi') || d.includes('mumbai') || d.includes('goa')) return 'INR';
  if (d.includes('uk') || d.includes('london') || d.includes('england') || d.includes('scotland')) return 'GBP';
  if (d.includes('france') || d.includes('paris') || d.includes('germany') || d.includes('italy') || d.includes('spain') || d.includes('rome') || d.includes('berlin') || d.includes('barcelona')) return 'EUR';
  if (d.includes('thailand') || d.includes('bangkok') || d.includes('phuket')) return 'THB';
  if (d.includes('australia') || d.includes('sydney') || d.includes('melbourne')) return 'AUD';
  if (d.includes('canada') || d.includes('toronto') || d.includes('vancouver')) return 'CAD';
  if (d.includes('switzerland') || d.includes('zurich')) return 'CHF';
  if (d.includes('china') || d.includes('beijing') || d.includes('shanghai')) return 'CNY';
  if (d.includes('singapore')) return 'SGD';
  if (d.includes('korea') || d.includes('seoul')) return 'KRW';
  if (d.includes('turkey') || d.includes('istanbul')) return 'TRY';
  if (d.includes('bali') || d.includes('indonesia')) return 'IDR';
  if (d.includes('mexico') || d.includes('cancun')) return 'MXN';
  if (d.includes('brazil') || d.includes('rio')) return 'BRL';
  if (d.includes('dubai') || d.includes('uae') || d.includes('abu dhabi')) return 'AED';
  if (d.includes('new zealand') || d.includes('queenstown') || d.includes('auckland')) return 'NZD';
  return 'USD';
}
