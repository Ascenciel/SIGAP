import React from 'react';
import { View, Text, Pressable } from 'react-native';
import C from '../theme/colors';
import styles from '../theme/styles';
import { STATUS } from '../data/reports';

function Badge({ status, small = false }) {
  const s = STATUS[status] || STATUS['Menunggu verifikasi'];
  return <View style={[styles.badge, { backgroundColor: s.bg, paddingVertical: small ? 4 : 6 }]}>
    <View style={[styles.dot, { backgroundColor: s.dot }]} />
    <Text style={[styles.badgeText, { color: s.fg, fontSize: small ? 10 : 11 }]}>{status}</Text>
  </View>;
}
function SectionTitle({ title, action, onPress }) {
  return <View style={styles.sectionTitle}><Text style={styles.sectionHeading}>{title}</Text>
    {action ? <Pressable onPress={onPress}><Text style={styles.link}>{action}  ›</Text></Pressable> : null}
  </View>;
}
function ReportCard({ report, onPress }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.reportCard, pressed && { opacity: 0.82 }]}>
    <View style={styles.cardTop}><Text style={styles.categoryLabel}>{report.category.toUpperCase()}</Text><Badge status={report.status} small /></View>
    <Text style={styles.reportTitle}>{report.title}</Text>
    <View style={styles.metaRow}><Text style={styles.metaIcon}>⌖</Text><Text style={styles.metaText}>{report.place}</Text><Text style={styles.metaDot}>·</Text><Text style={styles.metaText}>{report.time}</Text></View>
  </Pressable>;
}
function Legend({ color, label }) { return <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: color }]} /><Text style={styles.legendText}>{label}</Text></View>; }
function FieldLabel({ children, optional }) { return <Text style={styles.fieldLabel}>{children}{optional ? <Text style={styles.optional}>  {optional}</Text> : null}</Text>; }
function SafetyNote() { return <View style={styles.safetyNote}><Text style={styles.safetyTitle}>Untuk keadaan darurat</Text><Text style={styles.safetyText}>Hubungi kanal resmi atau BPBD setempat. SIGAP bukan layanan darurat dan tidak menggantikan arahan petugas.</Text></View>; }

export { Badge, SectionTitle, ReportCard, Legend, FieldLabel, SafetyNote };
