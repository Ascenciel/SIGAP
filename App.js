import 'expo-dev-client';
import React, { useEffect, useMemo, useState } from 'react';
import { Linking, Platform, Pressable, StatusBar, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as ExpoLinking from 'expo-linking';
import C from './src/theme/colors';
import styles from './src/theme/styles';
import { SEED } from './src/data/reports';
import useRemoteData from './src/hooks/useRemoteData';
import { fetchWeather } from './src/services/weatherApi';
import { fetchNews } from './src/services/newsApi';
import HomeScreen from './src/screens/HomeScreen';
import MapScreen from './src/screens/MapScreen';
import ReportScreen from './src/screens/ReportScreen';
import AidScreen from './src/screens/AidScreen';
import NewsScreen from './src/screens/NewsScreen';
import ModeratorScreen from './src/screens/ModeratorScreen';
import DetailScreen from './src/screens/DetailScreen';
import AuthScreen from './src/screens/AuthScreen';
import { isSupabaseConfigured, supabase } from './src/services/supabase';

WebBrowser.maybeCompleteAuthSession();

const TABS = [
  { id: 'home', icon: '⌂', label: 'Beranda' },
  { id: 'map', icon: '⌖', label: 'Peta' },
  { id: 'report', icon: '+', label: 'Lapor' },
  { id: 'aid', icon: '✚', label: 'Bantuan' },
  { id: 'news', icon: '▤', label: 'Berita' },
];

export default function App() {
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [tab, setTab] = useState('home');
  const [isModerator, setIsModerator] = useState(false);
  const [reports, setReports] = useState(SEED);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState('');
  const weather = useRemoteData(fetchWeather);
  const news = useRemoteData(fetchNews);
  const reportCount = useMemo(() => reports.length, [reports]);

  useEffect(() => {
    if (!supabase) { setAuthReady(true); return undefined; }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthReady(true); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) setTimeout(() => syncProfile(nextSession.user).catch(() => {}), 0);
    });
    return () => subscription.unsubscribe();
  }, []);

  const syncProfile = async user => {
    if (!supabase || !user) return;
    await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
    }, { onConflict: 'id' });
  };

  const handleAuth = async ({ mode, name, email, password }) => {
    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
      if (error) throw error;
      if (data.session && data.user) await syncProfile(data.user);
      return data.session ? '' : 'Pendaftaran berhasil. Periksa email Anda untuk konfirmasi sebelum masuk.';
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await syncProfile(data.user);
    return '';
  };

  const handleGoogle = async () => {
    // Let Expo choose the URL for the current runtime: web origin, exp:// in Expo Go,
    // and the configured sigap:// scheme in a development/production build.
    const redirectTo = Platform.OS === 'web' ? `${window.location.origin}/auth/callback` : ExpoLinking.createURL('auth/callback');
    const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo, skipBrowserRedirect: true } });
    if (error) throw error;
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== 'success') return '';
    const callbackUrl = new URL(result.url);
    // Supabase can return a PKCE code in the query string, or tokens/errors in the fragment.
    // Mobile deep links may also place the PKCE code in the fragment.
    const fragment = new URLSearchParams(callbackUrl.hash.replace(/^#/, ''));
    const query = callbackUrl.searchParams;
    const oauthError = query.get('error_description') || query.get('error') || fragment.get('error_description') || fragment.get('error');
    if (oauthError) throw new Error(oauthError);
    const code = query.get('code') || fragment.get('code');
    const access_token = fragment.get('access_token') || query.get('access_token');
    const refresh_token = fragment.get('refresh_token') || query.get('refresh_token');
    if (!code && (!access_token || !refresh_token)) {
      const received = [...query.keys(), ...fragment.keys()].join(', ') || 'tidak ada parameter';
      throw new Error(`Callback Google diterima tanpa kredensial login (${received}). Periksa Redirect URLs di Supabase dan pastikan ${redirectTo} tercantum persis.`);
    }
    const { data: sessionData, error: sessionError } = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : await supabase.auth.setSession({ access_token, refresh_token });
    if (sessionError) throw sessionError;
    await syncProfile(sessionData.user);
    return '';
  };

  if (!authReady) return <View style={styles.app} />;
  if (!session) return <View style={styles.app}><StatusBar barStyle="dark-content" backgroundColor={C.paper} /><AuthScreen onSubmit={handleAuth} onGoogle={handleGoogle} configured={isSupabaseConfigured} /></View>;

  const navigate = id => { setSelected(null); setTab(id); };
  const chooseReport = report => setSelected(report.id);
  const openNews = article => {
    if (article?.url) Linking.openURL(article.url).catch(() => {});
    else navigate('news');
  };
  const createReport = draft => {
    const report = {
      id: `SG-${String(2409 + reports.length - SEED.length).padStart(4, '0')}`,
      ...draft,
      title: `${draft.category} dilaporkan di ${draft.place}`,
      time: 'Baru saja',
      updated: 'Baru saja',
      status: 'Menunggu verifikasi',
      source: 'Laporan warga · belum diperiksa',
      note: '', latitude: -7.2756, longitude: 112.6426,
    };
    setReports(previous => [report, ...previous]);
  };
  const changeStatus = (report, status, note) => {
    const next = reports.map(item => item.id === report.id ? {
      ...item,
      status,
      note: note?.trim() || (status === 'Terverifikasi' ? 'Diperiksa oleh moderator demo.' : item.note),
      updated: 'Baru saja',
      history: [...(item.history || []), {
        status,
        note: note?.trim() || (status === 'Terverifikasi' ? 'Diperiksa oleh moderator demo.' : `Status diubah menjadi ${status}.`),
        time: 'Baru saja',
      }],
      source: status === 'Terverifikasi' ? 'Laporan warga · diperiksa moderator' : item.source,
    } : item);
    setReports(next);
    setToast(`${report.id} diperbarui · ${status}`);
    setTimeout(() => setToast(''), 2300);
  };

  const selectedReport = reports.find(report => report.id === selected);
  const pageTitles = { home: 'Beranda', map: 'Peta komunitas', report: 'Pelaporan', aid: 'Bantuan & posko', news: 'Berita kebencanaan' };
  const pageTitle = selectedReport ? 'Detail laporan' : isModerator ? 'Ruang moderator' : pageTitles[tab];

  return <View style={styles.app}>
    <StatusBar barStyle="dark-content" backgroundColor={C.paper} />
    <View style={styles.header}>
      <Pressable onPress={() => navigate('home')} style={styles.brand}>
        <View style={styles.brandMark}><Text style={styles.brandGlyph}>S</Text><View style={styles.brandDot} /></View>
        <View><Text style={styles.brandName}>SIGAP</Text><Text style={styles.brandSub}>INFORMASI KOMUNITAS</Text></View>
      </Pressable>
      <Pressable onPress={() => { setSelected(null); setIsModerator(value => !value); }} style={[styles.modePill, isModerator && styles.modePillActive]}>
        <View style={[styles.modeDot, isModerator && { backgroundColor: '#B6E8D8' }]} />
        <Text style={[styles.modeText, isModerator && { color: C.white }]}>{isModerator ? 'MODERATOR' : 'WARGA'}</Text>
        <Text style={[styles.modeChevron, isModerator && { color: C.white }]}>⌄</Text>
      </Pressable>
      {session?.user ? <Pressable accessibilityLabel="Keluar" onPress={() => supabase.auth.signOut()} style={{ padding: 8 }}><Text style={{ color: C.muted, fontSize: 10, fontWeight: '700' }}>Keluar</Text></Pressable> : null}
    </View>

    <View style={styles.pageBar}><Text style={styles.pageTitle}>{pageTitle}</Text><Text style={styles.simTag}>{tab === 'news' && !selected ? 'SUMBER BERITA' : isModerator ? 'DEMO' : 'SIMULASI'}</Text></View>
    <View style={{ flex: 1 }}>
      {selectedReport ? <DetailScreen key={selectedReport.id} report={selectedReport} onBack={() => setSelected(null)} isModerator={isModerator} onStatus={changeStatus} />
        : isModerator ? <ModeratorScreen reports={reports} onSelect={chooseReport} onStatus={changeStatus} />
          : tab === 'home' ? <HomeScreen reports={reports} onNavigate={navigate} onSelect={chooseReport} isModerator={isModerator} weather={weather} news={news} onRefreshWeather={weather.refresh} onOpenNews={openNews} />
            : tab === 'map' ? <MapScreen reports={reports} onSelect={chooseReport} />
              : tab === 'report' ? <ReportScreen onSubmit={createReport} onNavigate={navigate} />
                : tab === 'aid' ? <AidScreen />
                  : <NewsScreen articles={news.data} loading={news.loading} error={news.error} onRefresh={news.refresh} />}
    </View>

    {toast ? <View style={styles.toast}><Text style={styles.toastText}>✓  {toast}</Text></View> : null}
    {!isModerator && !selectedReport ? <View style={styles.tabBar}>{TABS.map(item =>
      <Pressable key={item.id} onPress={() => navigate(item.id)} style={styles.tabItem}>
        <View style={[styles.tabIconWrap, tab === item.id && styles.tabIconWrapActive]}>
          <Text style={[styles.tabIcon, tab === item.id && styles.tabIconActive]}>{item.icon}</Text>
          {item.id === 'map' && reportCount > 0 ? <View style={styles.tabBadge} /> : null}
        </View>
        <Text style={[styles.tabLabel, tab === item.id && styles.tabLabelActive]}>{item.label}</Text>
      </Pressable>)}
    </View> : null}
    {isModerator && !selectedReport ? <View style={styles.tabBar}><Pressable onPress={() => setIsModerator(false)} style={styles.exitMode}><Text style={styles.exitModeIcon}>‹</Text><Text style={styles.exitModeText}>Kembali ke tampilan warga</Text></Pressable></View> : null}
  </View>;
}
