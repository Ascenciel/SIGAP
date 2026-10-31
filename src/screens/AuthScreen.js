import React, { useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
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
    setError('');
    setInfo('');
    if (!configured) return setError('Koneksi Supabase belum dikonfigurasi. Isi EXPO_PUBLIC_SUPABASE_URL dan EXPO_PUBLIC_SUPABASE_ANON_KEY.');
    if (!email.trim() || password.length < 6 || (signup && !name.trim())) return setError('Isi semua kolom. Kata sandi minimal 6 karakter.');
    setBusy(true);
    try {
      const message = await onSubmit({ mode, name: name.trim(), email: email.trim(), password });
      if (message) setInfo(message);
    } catch (e) {
      setError(e.message || 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setError('');
    setInfo('');
    if (!configured) return setError('Koneksi Supabase belum dikonfigurasi.');
    setBusy(true);
    try {
      const message = await onGoogle();
      if (message) setError(message);
    } catch (e) {
      console.error('[AuthScreen] Google login error:', e);
      setError(e.message || 'Login Google gagal. Coba lagi.');
    } finally {
      setBusy(false);
    }
  };

  const changeMode = () => {
    setMode(signup ? 'login' : 'signup');
    setError('');
    setInfo('');
  };

  return <KeyboardAvoidingView style={authStyles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={authStyles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={authStyles.container}>
        <View style={authStyles.brandLockup}>
          <Image source={require('../../assets/sigap-logo.png')} resizeMode="contain" style={authStyles.brandLogo} accessibilityLabel="Logo SIGAP" />
        </View>

        <View style={authStyles.intro}>
          <Text style={authStyles.eyebrow}>{signup ? 'GABUNG BERSAMA KOMUNITAS' : 'AKSES INFORMASI KOMUNITAS'}</Text>
          <Text style={authStyles.title}>{signup ? 'Buat akun warga' : 'Selamat datang kembali'}</Text>
          <Text style={authStyles.subtitle}>{signup ? 'Laporkan kondisi sekitar dan bantu warga tetap terhubung.' : 'Masuk untuk memantau informasi dan berkoordinasi dengan warga.'}</Text>
        </View>

        <View style={authStyles.formCard}>
          {signup ? <Field label="Nama lengkap" value={name} onChangeText={setName} placeholder="Nama Anda" autoCapitalize="words" returnKeyType="next" /> : null}
          <Field label="Email" value={email} onChangeText={setEmail} placeholder="nama@email.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} textContentType="emailAddress" returnKeyType="next" />
          <Field label="Kata sandi" value={password} onChangeText={setPassword} placeholder="Minimal 6 karakter" secureTextEntry textContentType={signup ? 'newPassword' : 'password'} returnKeyType="done" onSubmitEditing={submit} />

          {error ? <Text accessibilityRole="alert" style={authStyles.error}>{error}</Text> : null}
          {info ? <Text style={authStyles.info}>{info}</Text> : null}

          <Pressable accessibilityRole="button" disabled={busy} onPress={submit} style={({ pressed }) => [authStyles.primaryButton, pressed && !busy && authStyles.buttonPressed, busy && authStyles.buttonDisabled]}>
            {busy ? <ActivityIndicator color={C.white} /> : <Text style={authStyles.primaryButtonText}>{signup ? 'Buat akun' : 'Masuk'}</Text>}
          </Pressable>

          <View style={authStyles.separator}><View style={authStyles.separatorLine} /><Text style={authStyles.separatorText}>atau lanjutkan dengan</Text><View style={authStyles.separatorLine} /></View>

          <Pressable accessibilityRole="button" disabled={busy} onPress={google} style={({ pressed }) => [authStyles.googleButton, pressed && !busy && authStyles.buttonPressed, busy && authStyles.buttonDisabled]}>
            <Text style={authStyles.googleMark}>G</Text><Text style={authStyles.googleButtonText}>Google</Text>
          </Pressable>
        </View>

        <Pressable accessibilityRole="button" disabled={busy} onPress={changeMode} style={authStyles.modeSwitch}>
          <Text style={authStyles.modeSwitchText}>{signup ? 'Sudah punya akun? ' : 'Belum punya akun? '}<Text style={authStyles.modeSwitchAction}>{signup ? 'Masuk' : 'Daftar'}</Text></Text>
        </Pressable>
        <Text style={authStyles.footer}>Sistem Informasi dan Gerak Aksi Penanggulangan Bencana</Text>
      </View>
    </ScrollView>
  </KeyboardAvoidingView>;
}

function Field({ label, ...props }) {
  const [focused, setFocused] = useState(false);
  return <View style={authStyles.field}>
    <Text style={authStyles.fieldLabel}>{label}</Text>
    <TextInput {...props} onFocus={event => { setFocused(true); props.onFocus?.(event); }} onBlur={event => { setFocused(false); props.onBlur?.(event); }} placeholderTextColor="#98A7A2" style={[authStyles.input, focused && authStyles.inputFocused]} />
  </View>;
}

const authStyles = StyleSheet.create({
  keyboard: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 22, paddingVertical: 26 },
  container: { alignSelf: 'center', width: '100%', maxWidth: 430 },
  brandLockup: { alignItems: 'center', marginBottom: 13 },
  brandLogo: { width: 142, height: 157 },
  intro: { alignItems: 'center', marginBottom: 18 },
  eyebrow: { color: C.green, fontSize: 9, fontWeight: '900', letterSpacing: 1.2, marginBottom: 8, textAlign: 'center' },
  title: { color: C.ink, fontSize: 27, lineHeight: 33, fontWeight: '900', letterSpacing: -0.5, textAlign: 'center' },
  subtitle: { color: C.muted, fontSize: 12, lineHeight: 18, marginTop: 7, maxWidth: 360, textAlign: 'center' },
  formCard: { backgroundColor: C.white, borderWidth: 1, borderColor: C.line, borderRadius: 20, padding: 18 },
  field: { marginTop: 10 },
  fieldLabel: { color: C.ink, fontSize: 11, fontWeight: '800', marginBottom: 7 },
  input: { height: 48, borderRadius: 11, backgroundColor: '#FBFCFB', borderWidth: 1, borderColor: C.line, paddingHorizontal: 13, color: C.ink, fontSize: 13 },
  inputFocused: { borderColor: '#68AA98', backgroundColor: C.white },
  error: { color: '#B33D35', fontSize: 11, lineHeight: 16, marginTop: 12 },
  info: { color: C.green, fontSize: 11, lineHeight: 16, marginTop: 12 },
  primaryButton: { height: 49, borderRadius: 12, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center', marginTop: 17 },
  primaryButtonText: { color: C.white, fontWeight: '800', fontSize: 13 },
  buttonPressed: { opacity: 0.85 },
  buttonDisabled: { opacity: 0.65 },
  separator: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 17 },
  separatorLine: { flex: 1, height: 1, backgroundColor: C.line },
  separatorText: { color: C.muted, fontSize: 10 },
  googleButton: { height: 47, borderRadius: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  googleMark: { color: '#4285F4', fontSize: 15, fontWeight: '900' },
  googleButtonText: { color: C.ink, fontWeight: '700', fontSize: 12 },
  modeSwitch: { padding: 15, alignItems: 'center' },
  modeSwitchText: { color: C.muted, fontSize: 11 },
  modeSwitchAction: { color: C.green, fontWeight: '900' },
  footer: { color: '#8A9691', fontSize: 8, textAlign: 'center', lineHeight: 12, marginTop: 1 },
});
