import React from 'react';
import { Pressable, Text, View } from 'react-native';
import C from '../theme/colors';
import styles from '../theme/styles';
import { WEATHER_SOURCE } from '../services/weatherApi';

function forecastTime(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('id-ID', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function WeatherCard({ data, loading, error, onRefresh }) {
  return <View style={styles.weatherCard}>
    <View style={styles.weatherHeader}><View><Text style={styles.weatherKicker}>PRAKIRAAN CUACA</Text><Text style={styles.weatherArea}>{data?.area || 'Wonokromo, Surabaya'}</Text></View><Text style={styles.weatherGlyph}>☁</Text></View>
    {loading && !data ? <Text style={styles.weatherMessage}>Mengambil prakiraan dari BMKG…</Text> : error && !data ? <View style={styles.weatherError}><Text style={styles.weatherMessage}>Cuaca belum dapat dimuat. Periksa koneksi internet.</Text><Pressable onPress={onRefresh}><Text style={styles.link}>Coba lagi</Text></Pressable></View> : <>
      <View style={styles.weatherMain}><Text style={styles.weatherTemperature}>{data?.temperature ?? '—'}°C</Text><View style={styles.weatherDivider} /><View><Text style={styles.weatherCondition}>{data?.description}</Text><Text style={styles.weatherMeta}>Kelembapan {data?.humidity ?? '—'}%  ·  Angin {data?.wind ?? '—'} km/j</Text></View></View>
      {error ? <Text style={styles.weatherWarning}>Data terakhir tersedia · gagal diperbarui</Text> : null}
      <Text style={styles.weatherValid}>Prakiraan untuk {forecastTime(data?.localTime)}</Text>
    </>}
    <View style={styles.weatherFooter}><Text style={styles.weatherSource}>{WEATHER_SOURCE}</Text><Pressable onPress={onRefresh}><Text style={styles.weatherRefresh}>↻</Text></Pressable></View>
    <Text style={styles.weatherDisclaimer}>Prakiraan bukan peringatan dini. Ikuti informasi resmi BMKG.</Text>
  </View>;
}
