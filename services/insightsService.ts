/**
 * Insights Service — Trip statistics and analytics.
 * Calculates stats from local storage data (no API needed).
 */

import { loadAllTrips, loadExpenseData, type StoredTrip, type ExpenseData } from './storageService';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TripInsights {
  totalTrips: number;
  totalDays: number;
  totalCitiesVisited: string[];
  totalExpenses: number;
  expensesByCategory: Record<string, number>;
  averageTripDuration: number;
  averageTripCost: number;
  mostVisitedCategory: string;
  tripsTimeline: { month: string; count: number }[];
}

// ─── Compute insights ─────────────────────────────────────────────────────────

export async function computeInsights(): Promise<TripInsights> {
  const trips = await loadAllTrips();

  const cities = new Set<string>();
  let totalDays = 0;
  let totalExpenses = 0;
  const expensesByCategory: Record<string, number> = {};
  const monthCounts: Record<string, number> = {};

  for (const trip of trips) {
    // Destination
    const dest = trip.itinerary?.destination ?? '';
    if (dest) {
      const city = dest.split(',')[0].trim();
      if (city) cities.add(city);
    }

    // Duration
    const days = trip.itinerary?.duration ?? 0;
    totalDays += typeof days === 'number' ? days : parseInt(String(days)) || 0;

    // Expenses
    try {
      const expData = await loadExpenseData(trip.id);
      if (expData) {
        for (const exp of expData.expenses) {
          totalExpenses += exp.amount;
          expensesByCategory[exp.category] =
            (expensesByCategory[exp.category] ?? 0) + exp.amount;
        }
      }
    } catch {}

    // Timeline
    if (trip.createdAt) {
      const date = new Date(trip.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthCounts[key] = (monthCounts[key] ?? 0) + 1;
    }
  }

  // Most visited category (from itinerary themes)
  const categoryFreq: Record<string, number> = {};
  for (const trip of trips) {
    if (trip.itinerary?.itinerary) {
      for (const day of trip.itinerary.itinerary) {
        const theme = day.theme?.toLowerCase() ?? '';
        if (theme.includes('culture') || theme.includes('museum') || theme.includes('heritage'))
          categoryFreq['Culture'] = (categoryFreq['Culture'] ?? 0) + 1;
        else if (theme.includes('beach') || theme.includes('coast'))
          categoryFreq['Beach'] = (categoryFreq['Beach'] ?? 0) + 1;
        else if (theme.includes('food') || theme.includes('culinary'))
          categoryFreq['Food'] = (categoryFreq['Food'] ?? 0) + 1;
        else if (theme.includes('adventure') || theme.includes('hike') || theme.includes('trek'))
          categoryFreq['Adventure'] = (categoryFreq['Adventure'] ?? 0) + 1;
        else if (theme.includes('shopping') || theme.includes('market'))
          categoryFreq['Shopping'] = (categoryFreq['Shopping'] ?? 0) + 1;
        else
          categoryFreq['Exploration'] = (categoryFreq['Exploration'] ?? 0) + 1;
      }
    }
  }

  const mostVisitedCategory =
    Object.entries(categoryFreq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A';

  const timeline = Object.entries(monthCounts)
    .sort()
    .map(([month, count]) => ({ month, count }));

  return {
    totalTrips: trips.length,
    totalDays,
    totalCitiesVisited: Array.from(cities),
    totalExpenses,
    expensesByCategory,
    averageTripDuration: trips.length > 0 ? Math.round(totalDays / trips.length) : 0,
    averageTripCost: trips.length > 0 ? Math.round(totalExpenses / trips.length) : 0,
    mostVisitedCategory,
    tripsTimeline: timeline,
  };
}
