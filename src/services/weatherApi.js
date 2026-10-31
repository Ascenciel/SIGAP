const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';

const WEATHER_CODES = {
  0: 'Cerah',
  1: 'Cerah sebagian',
  2: 'Cerah berawan',
  3: 'Berawan',
  45: 'Berkabut',
  48: 'Berkabut tebal',
  51: 'Gerimis ringan',
  53: 'Gerimis',
  55: 'Gerimis lebat',
  56: 'Gerimis beku ringan',
  57: 'Gerimis beku lebat',
  61: 'Hujan ringan',
  63: 'Hujan',
  65: 'Hujan lebat',
  66: 'Hujan beku ringan',
  67: 'Hujan beku lebat',
  71: 'Salju ringan',
  73: 'Salju',
  75: 'Salju lebat',
  77: 'Butiran salju',
  80: 'Hujan lokal ringan',
  81: 'Hujan lokal',
  82: 'Hujan lokal lebat',
  85: 'Hujan salju ringan',
  86: 'Hujan salju lebat',
  95: 'Badai petir',
  96: 'Badai petir dan hujan es',
  99: 'Badai petir dan hujan es lebat',
};

export async function fetchWeather(location) {
  if (!location || !Number.isFinite(location.latitude) || !Number.isFinite(location.longitude)) {
    throw new Error('Aktifkan lokasi perangkat untuk melihat cuaca di sekitar Anda.');
  }

  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
    timezone: 'auto',
  });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  let response;
  try {
    response = await fetch(`${OPEN_METEO_URL}?${params.toString()}`, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
  if (!response.ok) throw new Error(`Layanan cuaca merespons ${response.status}`);

  const payload = await response.json();
  const current = payload?.current;
  if (!current) throw new Error('Data cuaca untuk lokasi ini belum tersedia.');

  return {
    area: location.area || 'Lokasi saat ini',
    description: WEATHER_CODES[current.weather_code] || 'Kondisi tidak diketahui',
    temperature: current.temperature_2m,
    humidity: current.relative_humidity_2m,
    wind: current.wind_speed_10m,
    localTime: current.time,
    updatedAt: current.time,
  };
}

export const WEATHER_SOURCE = 'Open-Meteo · Prakiraan cuaca';
