import React, { useState, useMemo } from 'react';
import {
  History, Search, Filter, Download, Trash2, ChevronLeft, ChevronRight,
  ChevronDown, ChevronUp, X, AlertTriangle, Shield
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import type { AuditLog, AksiAudit } from '../types';
import { toast } from 'sonner';

// ─── Seed data ────────────────────────────────────────────────────────────────
const SEED_LOG: AuditLog[] = [
  { id: 'AL001', timestamp: '2026-10-29T08:15:23Z', userId: 'U001', userName: 'dr. Imam Ghozali, Sp.An., M.Kes', aksi: 'Login', modul: 'Autentikasi', deskripsi: 'Login berhasil sebagai admin' },
  { id: 'AL002', timestamp: '2026-10-29T08:17:45Z', userId: 'U001', userName: 'dr. Imam Ghozali, Sp.An., M.Kes', aksi: 'Approve', modul: 'Cuti', deskripsi: 'Menyetujui cuti Ns. Rahma Dewi', targetNama: 'Ns. Rahma Dewi, S.Kep' },
  { id: 'AL003', timestamp: '2026-10-29T09:02:11Z', userId: 'U005', userName: 'Rivelino Hasugian', aksi: 'Tambah', modul: 'Data Pegawai', deskripsi: 'Menambah pegawai baru', targetNama: 'Budi Santoso, S.Kep' },
  { id: 'AL004', timestamp: '2026-10-28T14:30:00Z', userId: 'U005', userName: 'Rivelino Hasugian', aksi: 'Ubah', modul: 'Penggajian', deskripsi: 'Generate slip gaji Oktober 2026', nilaiLama: 'Tidak ada', nilaiBaru: '20 slip gaji Draft' },
  { id: 'AL005', timestamp: '2026-10-28T10:15:33Z', userId: 'U007', userName: 'Andiko Pratama', aksi: 'Tambah', modul: 'Diklat', deskripsi: 'Menambah record diklat BHD', targetNama: 'Pelatihan BHD Dasar' },
  { id: 'AL006', timestamp: '2026-10-27T16:45:20Z', userId: 'U001', userName: 'dr. Imam Ghozali, Sp.An., M.Kes', aksi: 'Tolak', modul: 'Cuti', deskripsi: 'Menolak cuti dr. Fauzan Arief', targetNama: 'dr. Fauzan Arief' },
  { id: 'AL007', timestamp: '2026-10-27T09:00:05Z', userId: 'U006', userName: 'Pipi Suryani', aksi: 'Ubah', modul: 'Data Pegawai', deskripsi: 'Update data kontak pegawai', targetNama: 'P003 — Ns. Rahma Dewi', nilaiLama: 'noTelp: 08111111111', nilaiBaru: 'noTelp: 08129876543' },
  { id: 'AL008', timestamp: '2026-10-26T11:22:18Z', userId: 'U005', userName: 'Rivelino Hasugian', aksi: 'Tambah', modul: 'Kontrak', deskripsi: 'Menambah kontrak Dokter Mitra baru', targetNama: 'dr. Arif Budiman' },
  { id: 'AL009', timestamp: '2026-10-25T13:40:00Z', userId: 'U001', userName: 'dr. Imam Ghozali, Sp.An., M.Kes', aksi: 'Approve', modul: 'Kenaikan Pangkat', deskripsi: 'Menyetujui kenaikan pangkat ke III/c', targetNama: 'Ns. Rahma Dewi, S.Kep' },
  { id: 'AL010', timestamp: '2026-10-24T08:05:00Z', userId: 'U007', userName: 'Andiko Pratama', aksi: 'Hapus', modul: 'Jadwal Shift', deskripsi: 'Menghapus jadwal shift duplikat', targetId: 'JS001' },
  { id: 'AL011', timestamp: '2026-10-24T07:58:00Z', userId: 'U007', userName: 'Andiko Pratama', aksi: 'Login', modul: 'Autentikasi', deskripsi: 'Login berhasil sebagai admin' },
  { id: 'AL012', timestamp: '2026-10-23T15:30:00Z', userId: 'U005', userName: 'Rivelino Hasugian', aksi: 'Ubah', modul: 'BPJS', deskripsi: 'Update status BPJS Kesehatan', targetNama: 'P008 — Nutrisionis', nilaiLama: 'status: Tidak Aktif', nilaiBaru: 'status: Aktif' },
  { id: 'AL013', timestamp: '2026-10-22T10:00:00Z', userId: 'U006', userName: 'Pipi Suryani', aksi: 'Tambah', modul: 'Disiplin', deskripsi: 'Mencatat pelanggaran disiplin', targetNama: 'P020' },
  { id: 'AL014', timestamp: '2026-10-22T09:30:00Z', userId: 'U021', userName: 'Ns. Rahma Dewi, S.Kep', aksi: 'Login', modul: 'Autentikasi', deskripsi: 'Login berhasil sebagai pegawai' },
  { id: 'AL015', timestamp: '2026-10-21T16:00:00Z', userId: 'U001', userName: 'dr. Imam Ghozali, Sp.An., M.Kes', aksi: 'Approve', modul: 'Penggajian', deskripsi: 'Menyetujui slip gaji September 2026 (20 slip)', nilaiLama: 'Draft', nilaiBaru: 'Disetujui' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const relTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'Baru saja';
  if (h < 24) return `${h} jam lalu`;
  return `${Math.floor(h / 24)} hari lalu`;
};

const AKSI_CONFIG: Record<AksiAudit, { label: string; cls: string; border: string }> = {
  Tambah:  { label: 'Tambah',  cls: 'bg-green-100 text-green-800',   border: 'border-green-400' },
  Ubah:    { label: 'Ubah',    cls: 'bg-blue-100 text-blue-800',     border: 'border-blue-400' },
  Hapus:   { label: 'Hapus',   cls: 'bg-red-100 text-red-800',       border: 'border-red-400' },
  Approve: { label: 'Approve', cls: 'bg-emerald-100 text-emerald-800', border: 'border-emerald-400' },
  Tolak:   { label: 'Tolak',   cls: 'bg-orange-100 text-orange-800', border: 'border-orange-400' },
  Login:   { label: 'Login',   cls: 'bg-gray-100 text-gray-700',     border: 'border-gray-400' },
  Logout:  { label: 'Logout',  cls: 'bg-gray-100 text-gray-700',     border: 'border-gray-400' },
};

const PAGE_SIZE = 10;

const escCsv = (v: string) => `"${v.replace(/"/g, '""')}"`;

// ─── Component ────────────────────────────────────────────────────────────────
export default function AuditTrail() {
  const { auditLog, clearAuditLog, currentUser } = useAppContext();
  const isAdmin = currentUser?.role === 'admin';

  const logs: AuditLog[] = auditLog.length > 0 ? auditLog : SEED_LOG;

  // Filter state
  const [search, setSearch]       = useState('');
  const [filterModul, setFilterModul] = useState('');
  const [filterAksi, setFilterAksi]   = useState('');
  const [dateFrom, setDateFrom]   = useState('');
  const [dateTo, setDateTo]       = useState('');
  const [page, setPage]           = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Unique modules for dropdown
  const uniqueModuls = useMemo(() =>
    Array.from(new Set(logs.map(l => l.modul))).sort(), [logs]);

  // Filtered + sorted
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return logs.filter(l => {
      if (q && !l.userName.toLowerCase().includes(q) && !l.modul.toLowerCase().includes(q) && !l.deskripsi.toLowerCase().includes(q)) return false;
      if (filterModul && l.modul !== filterModul) return false;
      if (filterAksi && l.aksi !== filterAksi) return false;
      if (dateFrom && l.timestamp < dateFrom) return false;
      if (dateTo && l.timestamp > dateTo + 'T23:59:59Z') return false;
      return true;
    }).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [logs, search, filterModul, filterAksi, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const clearFilters = () => {
    setSearch(''); setFilterModul(''); setFilterAksi('');
    setDateFrom(''); setDateTo(''); setPage(1);
  };
  const hasFilters = search || filterModul || filterAksi || dateFrom || dateTo;

  // Stats
  const stats = useMemo(() => ({
    total:    logs.length,
    logins:   logs.filter(l => l.aksi === 'Login').length,
    changes:  logs.filter(l => ['Tambah','Ubah','Hapus'].includes(l.aksi)).length,
    approvals: logs.filter(l => ['Approve','Tolak'].includes(l.aksi)).length,
  }), [logs]);

  // Export CSV
  const exportCsv = () => {
    const header = ['ID','Waktu','Pengguna','Aksi','Modul','Deskripsi','Target ID','Target Nama','Nilai Lama','Nilai Baru'];
    const rows = filtered.map(l => [
      l.id, fmtTime(l.timestamp), l.userName, l.aksi, l.modul, l.deskripsi,
      l.targetId ?? '', l.targetNama ?? '', l.nilaiLama ?? '', l.nilaiBaru ?? ''
    ].map(escCsv).join(','));
    const csv = [header.map(escCsv).join(','), ...rows].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `audit-trail-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    toast.success('Ekspor CSV berhasil');
  };

  const handleClear = () => {
    clearAuditLog();
    setShowConfirm(false);
    toast.success('Log audit berhasil dibersihkan');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <History className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audit Trail</h1>
            <p className="text-sm text-gray-500">Riwayat Aktivitas Sistem</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          {isAdmin && (
            <button
              onClick={() => setShowConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Bersihkan Log
            </button>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Entri Log', value: stats.total, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Login Events',    value: stats.logins,   color: 'text-gray-600',   bg: 'bg-gray-50' },
          { label: 'Perubahan Data',  value: stats.changes,  color: 'text-blue-600',   bg: 'bg-blue-50' },
          { label: 'Aksi Approval',   value: stats.approvals, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-lg p-4`}>
            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari pengguna, modul, deskripsi…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <select
            value={filterModul}
            onChange={e => { setFilterModul(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          >
            <option value="">Semua Modul</option>
            {uniqueModuls.map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          <select
            value={filterAksi}
            onChange={e => { setFilterAksi(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          >
            <option value="">Semua Aksi</option>
            {(['Tambah','Ubah','Hapus','Approve','Tolak','Login','Logout'] as AksiAudit[]).map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          <div className="flex items-center gap-1">
            <input
              type="date"
              value={dateFrom}
              onChange={e => { setDateFrom(e.target.value); setPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <span className="text-gray-400 text-sm">—</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => { setDateTo(e.target.value); setPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <X className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
        {filtered.length !== logs.length && (
          <p className="mt-2 text-xs text-gray-500">
            Menampilkan {filtered.length} dari {logs.length} entri
          </p>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-40">Waktu</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Pengguna</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-24">Aksi</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-32">Modul</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Deskripsi</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Target</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                  <Filter className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>Tidak ada data yang sesuai filter</p>
                </td>
              </tr>
            )}
            {pageRows.map((log, i) => {
              const cfg = AKSI_CONFIG[log.aksi];
              const expanded = expandedId === log.id;
              const hasDetail = log.nilaiLama || log.nilaiBaru;
              return (
                <React.Fragment key={log.id}>
                  <tr
                    className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-indigo-50/30 cursor-pointer transition-colors`}
                    onClick={() => setExpandedId(expanded ? null : log.id)}
                  >
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      <div>{fmtTime(log.timestamp)}</div>
                      <div className="text-xs text-gray-400">{relTime(log.timestamp)}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{log.userName}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.cls}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{log.modul}</td>
                    <td className="px-4 py-3 text-gray-700">{log.deskripsi}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {log.targetNama || log.targetId || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {expanded
                        ? <ChevronUp className="w-4 h-4" />
                        : <ChevronDown className="w-4 h-4" />}
                    </td>
                  </tr>
                  {expanded && (
                    <tr className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td colSpan={7} className="px-4 pb-4 pt-0">
                        <div className={`ml-2 pl-4 border-l-4 ${cfg.border} bg-gray-50 rounded-r-lg p-3 space-y-2`}>
                          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-600">
                            <div><span className="font-semibold">ID Log:</span> {log.id}</div>
                            <div><span className="font-semibold">User ID:</span> {log.userId}</div>
                            <div><span className="font-semibold">Waktu Lengkap:</span> {fmtTime(log.timestamp)}</div>
                            {log.targetId && <div><span className="font-semibold">Target ID:</span> {log.targetId}</div>}
                            {log.targetNama && <div><span className="font-semibold">Target Nama:</span> {log.targetNama}</div>}
                          </div>
                          {hasDetail && (
                            <div className="mt-2 space-y-1 text-xs">
                              {log.nilaiLama && (
                                <div className="flex gap-2">
                                  <span className="font-semibold text-red-600 w-24 shrink-0">Nilai Lama:</span>
                                  <code className="bg-red-50 text-red-800 px-2 py-0.5 rounded">{log.nilaiLama}</code>
                                </div>
                              )}
                              {log.nilaiBaru && (
                                <div className="flex gap-2">
                                  <span className="font-semibold text-green-600 w-24 shrink-0">Nilai Baru:</span>
                                  <code className="bg-green-50 text-green-800 px-2 py-0.5 rounded">{log.nilaiBaru}</code>
                                </div>
                              )}
                            </div>
                          )}
                          {!hasDetail && <p className="text-xs text-gray-400 italic">Tidak ada detail perubahan nilai.</p>}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between text-sm">
            <p className="text-gray-500">
              Halaman {page} dari {totalPages} ({filtered.length} entri)
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '...'
                    ? <span key={`e${i}`} className="px-2 text-gray-400">…</span>
                    : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className={`w-8 h-8 rounded-lg text-xs font-medium ${page === p ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100 text-gray-600'}`}
                      >
                        {p}
                      </button>
                    )
                )}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="font-semibold text-gray-900">Konfirmasi Hapus Log</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Semua entri audit log akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Batal
              </button>
              <button
                onClick={handleClear}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Ya, Bersihkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin badge */}
      {!isAdmin && (
        <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
          <Shield className="w-3.5 h-3.5" />
          Hanya admin yang dapat membersihkan log audit
        </div>
      )}
    </div>
  );
}
