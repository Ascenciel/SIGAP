const BMKG_FORECAST_URL = 'https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=35.78.04.1001';

export async function fetchWeather() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  let response;
  try {
    response = await fetch(BMKG_FORECAST_URL, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
  if (!response.ok) throw new Error(`BMKG merespons ${response.status}`);

  const payload = await response.json();
  const location = payload?.lokasi;
  const forecasts = (payload?.data || []).flatMap(day => day?.cuaca || []).flat();
  if (!location || forecasts.length === 0) throw new Error('Data prakiraan belum tersedia.');

  const now = Date.now();
  const next = forecasts.find(item => new Date(item.local_datetime).getTime() >= now) || forecasts[0];
  return {
    area: [location.desa, location.kecamatan, location.kotkab].filter(Boolean).join(', '),
    description: next.weather_desc || 'Kondisi tidak diketahui',
    temperature: next.t,
    humidity: next.hu,
    wind: next.ws,
    localTime: next.local_datetime,
    updatedAt: payload?.data?.[0]?.cuaca?.[0]?.[0]?.analysis_date || null,
  };
}

export const WEATHER_SOURCE = 'BMKG · Prakiraan Cuaca Terbuka';
