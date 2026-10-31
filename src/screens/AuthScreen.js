import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import C from '../theme/colors';

export default function AuthScreen({ onSubmit, onGoogle, configured }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const signup = mode === 'signup';

  const submit = async () => {
    setError(''); setInfo('');
    if (!configured) return setError('Koneksi Supabase belum dikonfigurasi. Isi EXPO_PUBLIC_SUPABASE_URL dan EXPO_PUBLIC_SUPABASE_ANON_KEY.');
    if (!email.trim() || password.length < 6 || (signup && !name.trim())) return setError('Isi semua kolom. Kata sandi minimal 6 karakter.');
    setBusy(true);
    try { const message = await onSubmit({ mode, name: name.trim(), email: email.trim(), password }); if (message) setInfo(message); }
    catch (e) { setError(e.message || 'Terjadi kesalahan. Coba lagi.'); }
    finally { setBusy(false); }
  };
  const google = async () => {
    setError(''); setInfo('');
    if (!configured) return setError('Koneksi Supabase belum dikonfigurasi.');
    setBusy(true);
    try { const message = await onGoogle(); if (message) setError(message); }
    catch (e) { setError(e.message || 'Login Google gagal. Coba lagi.'); }
    finally { setBusy(false); }
  };

  return <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }} keyboardShouldPersistTaps="handled">
      <View style={{ alignSelf: 'center', width: '100%', maxWidth: 430 }}>
        <View style={{ width: 54, height: 54, borderRadius: 18, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}><Text style={{ color: C.white, fontSize: 29, fontWeight: '900', fontStyle: 'italic' }}>S</Text></View>
        <Text style={{ color: C.green, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 }}>SIGAP · INFORMASI KOMUNITAS</Text>
        <Text style={{ color: C.ink, fontSize: 29, lineHeight: 36, fontWeight: '800', marginTop: 9 }}>{signup ? 'Bergabung bersama warga' : 'Selamat datang kembali'}</Text>
        <Text style={{ color: C.muted, fontSize: 13, lineHeight: 20, marginTop: 7, marginBottom: 25 }}>{signup ? 'Buat akun untuk melaporkan kondisi dan membantu komunitas.' : 'Masuk untuk melihat informasi dan berkoordinasi dengan komunitas.'}</Text>
        {signup ? <Field label="Nama lengkap" value={name} onChangeText={setName} placeholder="Nama Anda" /> : null}
        <Field label="Email" value={email} onChangeText={setEmail} placeholder="nama@email.com" keyboardType="email-address" autoCapitalize="none" />
        <Field label="Kata sandi" value={password} onChangeText={setPassword} placeholder="Minimal 6 karakter" secureTextEntry />
        {error ? <Text accessibilityRole="alert" style={{ color: '#B33D35', fontSize: 12, lineHeight: 18, marginTop: 13 }}>{error}</Text> : null}
        {info ? <Text style={{ color: C.green, fontSize: 12, lineHeight: 18, marginTop: 13 }}>{info}</Text> : null}
        <Pressable disabled={busy} onPress={submit} style={{ height: 50, borderRadius: 13, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>{busy ? <ActivityIndicator color={C.white} /> : <Text style={{ color: C.white, fontWeight: '800', fontSize: 13 }}>{signup ? 'Buat akun' : 'Masuk'}</Text>}</Pressable>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 18 }}><View style={{ flex: 1, height: 1, backgroundColor: C.line }} /><Text style={{ color: C.muted, fontSize: 11 }}>atau</Text><View style={{ flex: 1, height: 1, backgroundColor: C.line }} /></View>
        <Pressable disabled={busy} onPress={google} style={{ height: 49, borderRadius: 13, backgroundColor: C.white, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: C.ink, fontWeight: '700', fontSize: 12 }}>G  Lanjutkan dengan Google</Text></Pressable>
        <Pressable onPress={() => { setMode(signup ? 'login' : 'signup'); setError(''); setInfo(''); }} style={{ padding: 16, alignItems: 'center' }}><Text style={{ color: C.muted, fontSize: 12 }}>{signup ? 'Sudah punya akun? ' : 'Belum punya akun? '}<Text style={{ color: C.green, fontWeight: '800' }}>{signup ? 'Masuk' : 'Daftar'}</Text></Text></Pressable>
      </View>
    </ScrollView>
  </KeyboardAvoidingView>;
}

function Field({ label, ...props }) {
  return <View style={{ marginTop: 11 }}><Text style={{ color: C.ink, fontSize: 11, fontWeight: '800', marginBottom: 7 }}>{label}</Text><TextInput {...props} placeholderTextColor="#9AA6A1" style={{ height: 48, borderRadius: 11, backgroundColor: C.white, borderWidth: 1, borderColor: C.line, paddingHorizontal: 13, color: C.ink, fontSize: 13 }} /></View>;
}
