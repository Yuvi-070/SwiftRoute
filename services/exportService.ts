/**
 * Export Service — Premium PDF generation and Calendar integration.
 * Uses built-in Expo modules (free, no API key).
 */

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { GeneratedItinerary, DayItinerary } from './aiService';

// ─── PDF Export ───────────────────────────────────────────────────────────────

function generateItineraryHtml(itinerary: GeneratedItinerary): string {
  const daysHtml = itinerary.itinerary
    .map(
      (day: DayItinerary) => `
      <div class="day-card">
        <div class="day-header">
          <div class="day-badge">Day ${day.day}</div>
          <div class="day-theme">${day.theme}</div>
        </div>
        <div class="activities">
        ${day.activities
          .map((act) => {
            let color = act.time === 'Morning' ? '#F59E0B' : act.time === 'Afternoon' ? '#6366F1' : '#8B5CF6';
            return `
            <div class="activity" style="border-left-color: ${color}">
              <div class="act-header" style="color: ${color}">
                <span>${act.time}</span>
                <span class="cost-badge" style="background: ${color}15; color: ${color}">${act.estimatedCost}</span>
              </div>
              <div class="act-title">${act.activity}</div>
              <div class="act-location">📍 <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(act.location)}" target="_blank" style="color: #6B7280; text-decoration: none;">${act.location}</a></div>
              <div class="act-desc">${act.description}</div>
            </div>
          `;
          }).join('')}
        </div>
      </div>
    `
    )
    .join('');

  const tipsHtml =
    itinerary.travelTips?.length > 0
      ? `
      <div class="tips-section">
        <h2>💡 Travel Tips</h2>
        <ul>
          ${itinerary.travelTips.map((tip: string) => `<li>${tip}</li>`).join('')}
        </ul>
      </div>
    `
      : '';

  const packingHtml =
    itinerary.packingTips?.length > 0
      ? `
      <div class="tips-section">
        <h2>🎒 Packing Tips</h2>
        <ul>
          ${itinerary.packingTips.map((tip: string) => `<li>${tip}</li>`).join('')}
        </ul>
      </div>
    `
      : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;700&display=swap" rel="stylesheet">
      <style>
        body { 
          font-family: 'Outfit', -apple-system, sans-serif; 
          background-color: #F9FAFB;
          color: #1F2937; 
          margin: 0;
          padding: 40px;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: #FFFFFF;
          border-radius: 24px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.05);
          padding: 48px;
        }
        .hero {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 30px;
          border-bottom: 2px solid #F3F4F6;
        }
        h1 { 
          color: #111827; 
          font-size: 36px;
          margin: 0 0 12px 0;
          letter-spacing: -0.5px;
        }
        .meta { 
          display: flex;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .meta-badge {
          background: #EEF2FF;
          color: #4F46E5;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
        }
        .summary { 
          background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
          color: white;
          padding: 24px; 
          border-radius: 16px; 
          font-size: 16px;
          line-height: 1.6; 
          margin-bottom: 40px;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
        }
        .day-card {
          background: #FFFFFF;
          border: 1px solid #E5E7EB;
          border-radius: 16px;
          margin-bottom: 24px;
          overflow: hidden;
          page-break-inside: avoid;
        }
        .day-header {
          background: #F9FAFB;
          padding: 16px 20px;
          border-bottom: 1px solid #E5E7EB;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .day-badge {
          background: #111827;
          color: white;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
        }
        .day-theme {
          font-size: 16px;
          font-weight: 600;
          color: #374151;
        }
        .activities {
          padding: 20px;
        }
        .activity {
          margin-bottom: 20px;
          border-left: 3px solid #6366F1;
          padding-left: 16px;
        }
        .activity:last-child {
          margin-bottom: 0;
        }
        .act-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 4px;
        }
        .cost-badge {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
        }
        .act-title {
          font-size: 18px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 4px;
        }
        .act-location {
          color: #6B7280;
          font-size: 14px;
          margin-bottom: 8px;
          font-weight: 500;
        }
        .act-desc {
          color: #4B5563;
          font-size: 14px;
          line-height: 1.5;
        }
        .tips-section {
          background: #F3F4F6;
          padding: 24px;
          border-radius: 16px;
          margin-top: 32px;
          page-break-inside: avoid;
        }
        .tips-section h2 {
          color: #111827;
          font-size: 20px;
          margin: 0 0 16px 0;
        }
        .tips-section ul {
          margin: 0;
          padding-left: 20px;
          color: #4B5563;
          line-height: 1.6;
        }
        .tips-section li {
          margin-bottom: 8px;
        }
        .footer { 
          margin-top: 48px; 
          text-align: center; 
          color: #9CA3AF; 
          font-size: 14px; 
          font-weight: 500;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="hero">
          <h1>${itinerary.tripTitle}</h1>
          <div class="meta">
            <span class="meta-badge">📍 ${itinerary.destination}</span>
            <span class="meta-badge">🕐 ${itinerary.duration} days</span>
            <span class="meta-badge">💰 ${itinerary.estimatedTotalCost}</span>
          </div>
        </div>
        <div class="summary">${itinerary.summary}</div>
        ${daysHtml}
        <div style="display: flex; gap: 24px;">
          <div style="flex: 1;">${tipsHtml}</div>
          <div style="flex: 1;">${packingHtml}</div>
        </div>
        <div class="footer">
          ✨ Planned with SwiftRoute AI · ${new Date().toLocaleDateString()}
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function exportToPdf(itinerary: GeneratedItinerary): Promise<void> {
  const html = generateItineraryHtml(itinerary);

  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
  });

  const isAvailable = await Sharing.isAvailableAsync();
  if (isAvailable) {
    await Sharing.shareAsync(uri, {
      UTI: '.pdf',
      mimeType: 'application/pdf',
      dialogTitle: `${itinerary.tripTitle} Itinerary`,
    });
  }
}

// ─── Share as text ────────────────────────────────────────────────────────────

export function generateShareText(itinerary: GeneratedItinerary): string {
  let text = `✈️ ${itinerary.tripTitle}\n`;
  text += `📍 ${itinerary.destination} · ${itinerary.duration} days\n`;
  text += `💰 ${itinerary.estimatedTotalCost}\n\n`;
  text += `${itinerary.summary}\n\n`;

  itinerary.itinerary.forEach((day: DayItinerary) => {
    text += `📅 Day ${day.day}: ${day.theme}\n`;
    day.activities.forEach((act) => {
      text += `  ${act.time}: ${act.activity} (${act.location}) - ${act.estimatedCost}\n`;
    });
    text += '\n';
  });

  text += 'Planned with SwiftRoute AI ✨';
  return text;
}
