
import { supabase } from './supabase';

const STATUS_TO_DB = {
    'Menunggu verifikasi': 'pending',
    'Sedang diperiksa': 'reviewing',
    'Terverifikasi': 'verified',
    'Ditolak': 'rejected',
    'Perlu pembaruan': 'needs_update',
};

const STATUS_FROM_DB = {
    pending: 'Menunggu verifikasi',
    reviewing: 'Sedang diperiksa',
    verified: 'Terverifikasi',
    rejected: 'Ditolak',
    needs_update: 'Perlu pembaruan',
};

function ensureSupabase() {
    if (!supabase) {
        throw new Error('Supabase belum dikonfigurasi.');
    }
}

function getRelativeTime(dateString) {
    if (!dateString) return 'Waktu tidak diketahui';

    const diff = Math.max(0, Date.now() - new Date(dateString).getTime());
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes} menit lalu`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam lalu`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} hari lalu`;

    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function mapReport(row) {
    const status = STATUS_FROM_DB[row.status] || 'Menunggu verifikasi';

    const history = (row.report_updates || [])
        .slice()
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        .map(update => ({
            status: STATUS_FROM_DB[update.new_status] || status,
            note: update.description,
            time: getRelativeTime(update.created_at),
        }));

    return {
        id: row.id,
        title: row.title || `${row.category} dilaporkan`,
        category: row.category,
        place: row.location_name || 'Lokasi tidak dicantumkan',
        time: getRelativeTime(row.created_at),
        updated: getRelativeTime(row.updated_at || row.created_at),
        status,
        description: row.description || '',
        source: status === 'Terverifikasi'
            ? 'Laporan warga · diperiksa moderator'
            : status === 'Ditolak'
                ? 'Laporan warga · ditolak moderator'
                : 'Laporan warga',
        note: row.verification_note || '',
        latitude: row.latitude,
        longitude: row.longitude,
        userId: row.user_id,
        history,
    };
}

async function getCurrentUser() {
    ensureSupabase();

    const { data, error } = await supabase.auth.getUser();

    if (error) throw error;
    if (!data.user) throw new Error('Silakan masuk terlebih dahulu.');

    return data.user;
}

// Mengambil semua laporan beserta riwayatnya.
export async function fetchReports() {
    ensureSupabase();

    const { data, error } = await supabase
        .from('reports')
        .select(`
      *,
      report_updates (*)
    `)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(mapReport);
}

// Mengirim laporan baru.
export async function createReport(draft) {
    ensureSupabase();

    const user = await getCurrentUser();

    const payload = {
        user_id: user.id,
        category: draft.category,
        title: `${draft.category} dilaporkan di ${draft.place}`,
        location_name: draft.place,
        description: draft.description,
        latitude: draft.latitude ?? null,
        longitude: draft.longitude ?? null,
        status: 'pending',
    };

    const { data, error } = await supabase
        .from('reports')
        .insert(payload)
        .select()
        .single();

    if (error) throw error;

    // Simpan riwayat awal laporan.
    const { error: historyError } = await supabase
        .from('report_updates')
        .insert({
            report_id: data.id,
            user_id: user.id,
            description: 'Laporan dibuat dan menunggu verifikasi.',
            old_status: null,
            new_status: 'pending',
        });

    if (historyError) {
        console.warn('Laporan tersimpan, tetapi riwayat awal gagal:', historyError);
    }

    return mapReport(data);
}

// Mengubah status laporan oleh moderator.
export async function updateReportStatus(reportId, newStatus, note = '') {
    ensureSupabase();

    const user = await getCurrentUser();
    const dbStatus = STATUS_TO_DB[newStatus];

    if (!dbStatus) {
        throw new Error(`Status laporan tidak dikenal: ${newStatus}`);
    }

    // Ambil status sebelumnya.
    const { data: previous, error: fetchError } = await supabase
        .from('reports')
        .select('status')
        .eq('id', reportId)
        .single();

    if (fetchError) throw fetchError;

    const updatePayload = {
        status: dbStatus,
        verification_note: note.trim() || null,
    };

    if (dbStatus === 'verified') {
        updatePayload.verified_by = user.id;
    } else {
        updatePayload.verified_by = null;
    }

    const { data, error } = await supabase
        .from('reports')
        .update(updatePayload)
        .eq('id', reportId)
        .select()
        .single();

    if (error) throw error;

    const description = note.trim()
        || `Status laporan diubah menjadi ${newStatus}.`;

    // Catat perubahan status.
    const { error: historyError } = await supabase
        .from('report_updates')
        .insert({
            report_id: reportId,
            user_id: user.id,
            description,
            old_status: previous.status,
            new_status: dbStatus,
        });

    if (historyError) {
        console.warn('Status berhasil diubah, tetapi riwayat gagal:', historyError);
    }

    return mapReport(data);
}

export { STATUS_TO_DB, STATUS_FROM_DB };
