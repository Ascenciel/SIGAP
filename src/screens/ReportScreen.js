import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Pressable, Text, TextInput, View } from 'react-native';
import * as Location from 'expo-location';
import styles from '../theme/styles';
import C from '../theme/colors';
import { CATEGORIES } from '../data/reports';
import { FieldLabel } from '../components/UI';
import MapPreview from '../components/MapPreview';

const NO_REPORTS = [];

function ReportScreen({ onSubmit, onNavigate }) {
  const [category, setCategory] = useState('Banjir');
  const [place, setPlace] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapInitialLocation, setMapInitialLocation] = useState(null);
  const [locationMessage, setLocationMessage] = useState('Ketuk peta untuk menandai lokasi kejadian.');
  const [resolvingAddress, setResolvingAddress] = useState(false);
  const addressRequest = useRef(0);

  const chooseLocation = async point => {
    const requestId = ++addressRequest.current;
    setSelectedLocation(point);
    setPlace('');
    setResolvingAddress(true);
    setLocationMessage('Mencari alamat lokasi…');
    try {
      if (Platform.OS === 'android') {
        let permission = await Location.getForegroundPermissionsAsync();
        if (!permission.granted) permission = await Location.requestForegroundPermissionsAsync();
        if (!permission.granted) {
          if (requestId === addressRequest.current) setLocationMessage('Izin lokasi dibutuhkan untuk mencari alamat otomatis. Kamu tetap bisa mengisi alamat secara manual.');
          return;
        }
      }
      const results = await Location.reverseGeocodeAsync(point);
      if (requestId !== addressRequest.current) return;
      const result = results?.[0];
      const street = [result?.street, result?.streetNumber].filter(Boolean).join(' ');
      const address = [...new Set([result?.name, street, result?.district, result?.subregion, result?.city, result?.region].filter(Boolean))].join(', ');
      if (address) {
        setPlace(address);
        setLocationMessage('Alamat terisi otomatis. Kamu bisa mengoreksinya jika perlu.');
      } else {
        setLocationMessage('Alamat tidak ditemukan. Silakan isi nama tempat secara manual.');
      }
    } catch {
      if (requestId === addressRequest.current) setLocationMessage('Alamat tidak dapat ditemukan. Silakan isi nama tempat secara manual.');
    } finally {
      if (requestId === addressRequest.current) setResolvingAddress(false);
    }
  };

  const useMyLocation = async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Izin lokasi diperlukan', 'Izinkan akses lokasi untuk menandai posisi perangkat pada peta.');
        return;
      }
      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const point = { latitude: current.coords.latitude, longitude: current.coords.longitude };
      setMapInitialLocation(point);
      await chooseLocation(point);
    } catch {
      Alert.alert('Lokasi tidak tersedia', 'Periksa pengaturan lokasi perangkat lalu coba lagi.');
    }
  };

  const pickPhoto = async source => {
    setPhotoBusy(true);
    try {
      const ImagePicker = await import('expo-image-picker');
      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Izin kamera diperlukan', 'Izinkan akses kamera untuk mengambil foto pendukung.');
          return;
        }
      }
      const options = { mediaTypes: ['images'], allowsEditing: false, quality: 0.75, exif: false };
      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);
      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        setPhoto({ uri: asset.uri, fileName: asset.fileName || 'Foto pendukung', fileSize: asset.fileSize || null });
      }
    } catch (error) {
      const missingNativeModule = error?.message?.includes('ExpoImagePicker');
      Alert.alert(
        missingNativeModule ? 'Perlu memasang ulang aplikasi' : 'Foto tidak dapat dibuka',
        missingNativeModule
          ? 'Aplikasi yang terpasang belum menyertakan modul kamera dan galeri. Buat lalu pasang development build terbaru untuk memakai fitur foto.'
          : error?.message || 'Coba ambil foto lain atau pilih dari galeri.'
      );
    } finally {
      setPhotoBusy(false);
    }
  };

  const submit = () => {
    if (!place.trim() || !description.trim()) {
      Alert.alert('Lengkapi laporan', 'Pilih titik pada peta atau isi lokasi, lalu tulis deskripsi laporan.');
      return;
    }
    if (resolvingAddress) {
      Alert.alert('Tunggu sebentar', 'Alamat lokasi masih dicari.');
      return;
    }
    onSubmit({ category, place: place.trim(), description: description.trim(), latitude: selectedLocation?.latitude, longitude: selectedLocation?.longitude, photoUri: photo?.uri || null });
    Alert.alert('Laporan terkirim', 'Laporan disimpan dengan status Menunggu verifikasi.', [{ text: 'Lihat laporan', onPress: () => onNavigate('map') }]);
  };

  return <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <Text style={styles.screenTitle}>Kirim laporan</Text>
      <Text style={styles.screenSubtitle}>Bagikan kondisi yang kamu lihat. Laporan akan diperiksa sebelum ditandai terverifikasi.</Text>
      <View style={styles.formNotice}><Text style={styles.formNoticeIcon}>✓</Text><Text style={styles.formNoticeText}>Laporan baru berstatus <Text style={{ fontWeight: '800', color: C.blue }}>Menunggu verifikasi</Text>. Lokasi dan identitas pelapor tidak ditampilkan pada kartu publik.</Text></View>
      <FieldLabel>Kategori kejadian</FieldLabel>
      <View style={styles.categoryGrid}>{CATEGORIES.map(item => <Pressable key={item} onPress={() => setCategory(item)} style={[styles.categoryOption, category === item && styles.categoryOptionActive]}><Text style={[styles.categoryOptionText, category === item && styles.categoryOptionTextActive]}>{item}</Text></Pressable>)}</View>

      <FieldLabel>Lokasi kejadian</FieldLabel>
      <View style={styles.locationPickerHeader}>
        <Text style={styles.locationPickerHint}>Ketuk peta untuk memilih titik kejadian</Text>
        <Pressable accessibilityRole="button" onPress={useMyLocation} style={styles.useMyLocationButton}><Text style={styles.useMyLocationText}>Lokasi saya</Text></Pressable>
      </View>
      <MapPreview reports={NO_REPORTS} selectable selectedLocation={mapInitialLocation} onLocationSelect={chooseLocation} height={230} />
      <View style={styles.selectedCoordinates}>
        {resolvingAddress ? <ActivityIndicator size="small" color={C.green} /> : <Text style={styles.inputIcon}>{selectedLocation ? '✓' : '⌖'}</Text>}
        <Text style={styles.selectedCoordinatesText}>{selectedLocation ? `${selectedLocation.latitude.toFixed(5)}, ${selectedLocation.longitude.toFixed(5)}` : 'Belum ada titik yang dipilih'}</Text>
      </View>
      <Text style={styles.helperText}>{locationMessage}</Text>
      <View style={[styles.inputWrap, { marginTop: 10 }]}><Text style={styles.inputIcon}>⌖</Text><TextInput value={place} onChangeText={value => { addressRequest.current += 1; setResolvingAddress(false); setPlace(value); }} placeholder="Nama jalan atau tempat" placeholderTextColor="#9AA6A2" style={styles.input} accessibilityLabel="Alamat lokasi kejadian" /></View>
      <Text style={styles.helperText}>Alamat bisa dikoreksi. Hindari membagikan alamat rumah pribadi.</Text>

      <FieldLabel>Waktu kejadian</FieldLabel>
      <View style={styles.readonlyField}><Text style={styles.inputIcon}>◷</Text><Text style={styles.readonlyText}>Sekarang · otomatis dicatat</Text></View>
      <FieldLabel>Deskripsi</FieldLabel>
      <TextInput multiline value={description} onChangeText={setDescription} placeholder="Jelaskan kondisi yang kamu lihat dengan singkat dan faktual…" placeholderTextColor="#9AA6A2" textAlignVertical="top" style={[styles.input, styles.textArea]} />
      <Text style={styles.helperText}>Tuliskan yang kamu lihat. Jangan menyimpulkan area aman atau memberi arahan darurat.</Text>

      <FieldLabel optional="OPSIONAL">Foto pendukung</FieldLabel>
      {photo ? <View style={styles.photoPreviewCard}>
        <Image source={{ uri: photo.uri }} style={styles.photoPreviewImage} resizeMode="cover" accessibilityLabel="Pratinjau foto pendukung" />
        <View style={styles.photoPreviewFooter}>
          <View style={{ flex: 1 }}><Text style={styles.uploadText} numberOfLines={1}>{photo.fileName}</Text><Text style={styles.uploadSub}>{photo.fileSize ? `${(photo.fileSize / (1024 * 1024)).toFixed(1)} MB` : 'Foto siap dilampirkan'}</Text></View>
          <Pressable accessibilityRole="button" onPress={() => setPhoto(null)} style={styles.photoRemoveButton}><Text style={styles.photoRemoveText}>Hapus</Text></Pressable>
        </View>
      </View> : <View style={styles.photoActions}>
        <Pressable accessibilityRole="button" disabled={photoBusy} onPress={() => pickPhoto('camera')} style={[styles.photoSourceButton, photoBusy && { opacity: 0.6 }]}><Text style={styles.photoSourceIcon}>◉</Text><Text style={styles.photoSourceText}>{photoBusy ? 'Membuka…' : 'Ambil foto'}</Text></Pressable>
        <Pressable accessibilityRole="button" disabled={photoBusy} onPress={() => pickPhoto('library')} style={[styles.photoSourceButton, photoBusy && { opacity: 0.6 }]}><Text style={styles.photoSourceIcon}>▧</Text><Text style={styles.photoSourceText}>Pilih dari galeri</Text></Pressable>
      </View>}

      <Pressable disabled={resolvingAddress} onPress={submit} style={[styles.primaryButton, resolvingAddress && { opacity: 0.65 }]}><Text style={styles.primaryButtonText}>Kirim laporan  →</Text></Pressable>
      <Text style={styles.consentText}>Dengan mengirim laporan, kamu memahami bahwa informasi akan ditampilkan sebagai laporan komunitas dan perlu diperiksa.</Text>
    </ScrollView>
  </KeyboardAvoidingView>;
}

export default ReportScreen;
