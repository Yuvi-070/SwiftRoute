// Open-Meteo is a free, open-source weather API – no API key required.
// Docs: https://open-meteo.com/en/docs

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

export interface DailyWeather {
  date: string;           // ISO date string "YYYY-MM-DD"
  maxTempC: number;
  minTempC: number;
  precipitationMm: number;
  weatherCode: number;    // WMO weather code
  description: string;    // Human-readable summary
  isRainy: boolean;
  isSnowy: boolean;
}

export interface WeatherForecast {
  destination: string;
  latitude: number;
  longitude: number;
  daily: DailyWeather[];
  fetchedAt: string;      // ISO timestamp
}

// WMO weather code → human-readable description
function describeWeatherCode(code: number): string {
  if (code === 0) return 'Clear sky';
  if (code <= 2) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if (code <= 49) return 'Foggy';
  if (code <= 57) return 'Drizzle';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Rain showers';
  if (code <= 86) return 'Snow showers';
  if (code <= 99) return 'Thunderstorm';
  return 'Unknown';
}

async function geocodeDestination(
  destination: string,
  lat?: number,
  lng?: number
): Promise<{ latitude: number; longitude: number }> {
  if (lat !== undefined && lng !== undefined) {
    return { latitude: lat, longitude: lng };
  }

  const url = `${GEOCODING_URL}?name=${encodeURIComponent(destination)}&count=1&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Geocoding failed: ${res.status}`);
  }
  const data = await res.json();
  const result = data?.results?.[0];
  if (!result) {
    throw new Error(`Could not geocode "${destination}"`);
  }
  return { latitude: result.latitude, longitude: result.longitude };
}

export async function fetchWeatherForecast(
  destination: string,
  startDate: string,  // "YYYY-MM-DD"
  endDate: string,    // "YYYY-MM-DD"
  coords?: { lat: number; lng: number }
): Promise<WeatherForecast> {
  const { latitude, longitude } = await geocodeDestination(
    destination,
    coords?.lat,
    coords?.lng
  );

  // Open-Meteo free forecast is limited to 16 days ahead
  const url =
    `${FORECAST_URL}?latitude=${latitude}&longitude=${longitude}` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code` +
    `&start_date=${startDate}&end_date=${endDate}` +
    `&timezone=auto&forecast_days=16`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Open-Meteo API error: ${res.status}`);
  }
  const data = await res.json();

  const dates: string[] = data.daily?.time ?? [];
  const maxTemps: number[] = data.daily?.temperature_2m_max ?? [];
  const minTemps: number[] = data.daily?.temperature_2m_min ?? [];
  const precip: number[] = data.daily?.precipitation_sum ?? [];
  const codes: number[] = data.daily?.weather_code ?? [];

  const daily: DailyWeather[] = dates.map((date, i) => {
    const code = codes[i] ?? 0;
    const precipMm = precip[i] ?? 0;
    return {
      date,
      maxTempC: Math.round(maxTemps[i] ?? 0),
      minTempC: Math.round(minTemps[i] ?? 0),
      precipitationMm: Math.round(precipMm * 10) / 10,
      weatherCode: code,
      description: describeWeatherCode(code),
      isRainy: (code >= 51 && code <= 67) || (code >= 80 && code <= 82),
      isSnowy: (code >= 71 && code <= 77) || (code >= 85 && code <= 86),
    };
  });

  return {
    destination,
    latitude,
    longitude,
    daily,
    fetchedAt: new Date().toISOString(),
  };
}

/** Returns a concise weather summary string suitable for injection into an AI prompt. */
export function buildWeatherPromptContext(forecast: WeatherForecast): string {
  const lines = forecast.daily.map((d) => {
    const temp = `${d.minTempC}–${d.maxTempC}°C`;
    const rain = d.precipitationMm > 0 ? `, ${d.precipitationMm}mm rain` : '';
    return `  ${d.date}: ${d.description}, ${temp}${rain}`;
  });
  return `Weather forecast for ${forecast.destination}:\n${lines.join('\n')}`;
}
