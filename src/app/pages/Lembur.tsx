import React, { useState, useMemo } from 'react';
import {
  Clock, Plus, CheckCircle, XCircle, CreditCard, Search, Download,
  Trash2, BookOpen, AlertCircle,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import type { LemburRecord, JenisLembur, StatusLembur } from '../types';
import { GAJI_POKOK } from '../data/mockDataRS';
import { toast } from 'sonner';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n: number) => new Intl.NumberFormat('id-ID').format(n);
const BULAN_NAMES = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

function getFullName(p: { gelarDepan?: string; nama: string; gelarBelakang?: string }) {
  return `${p.gelarDepan ? p.gelarDepan + ' ' : ''}${p.nama}${p.gelarBelakang ? ', ' + p.gelarBelakang : ''}`.trim();
}

function calcDurasi(mulai: string, selesai: string): number {
  if (!mulai || !selesai) return 0;
  const [h1, m1] = mulai.split(':').map(Number);
  const [h2, m2] = selesai.split(':').map(Number);
  const mins = (h2 * 60 + m2) - (h1 * 60 + m1);
  return Math.max(0, Math.round((mins / 60) * 10) / 10);
}

/** PP No. 35 Tahun 2021 */
function hitungUpahLembur(durasiJam: number, jenis: JenisLembur, gajiPokok: number): number {
  const upahPerJam = gajiPokok / 173;
  let total = 0;

  if (jenis === 'Hari Kerja') {
    for (let jam = 1; jam <= durasiJam; jam++) {
      total += jam === 1 ? 1.5 * upahPerJam : 2.0 * upahPerJam;
    }
  } else if (jenis === 'Hari Libur') {
    for (let jam = 1; jam <= durasiJam; jam++) {
      if (jam <= 7) total += 2.0 * upahPerJam;
      else if (jam === 8) total += 3.0 * upahPerJam;
      else total += 4.0 * upahPerJam;
    }
  } else {
    // Hari Raya
    for (let jam = 1; jam <= durasiJam; jam++) {
      if (jam <= 7) total += 3.0 * upahPerJam;
      else if (jam === 8) total += 4.0 * upahPerJam;
      else total += 5.0 * upahPerJam;
    }
  }
  return Math.round(total);
}

// ─── Seed data ────────────────────────────────────────────────────────────────
const SEED_LEMBUR_BASE: Omit<LemburRecord, 'upahLembur'>[] = [
  { id: 'LB001', pegawaiId: 'P001', tanggal: '2026-10-15', jamMulai: '17:00', jamSelesai: '21:00', durasiJam: 4, jenisLembur: 'Hari Kerja', alasan: 'Pelayanan pasien emergency', status: 'Disetujui', disetujuiOleh: 'Admin', tanggalDisetujui: '2026-10-15' },
  { id: 'LB002', pegawaiId: 'P002', tanggal: '2026-10-18', jamMulai: '08:00', jamSelesai: '14:00', durasiJam: 6, jenisLembur: 'Hari Libur', alasan: 'Piket IGD akhir pekan', status: 'Dibayar', disetujuiOleh: 'Admin', tanggalDisetujui: '2026-10-18' },
  { id: 'LB003', pegawaiId: 'P003', tanggal: '2026-10-20', jamMulai: '16:00', jamSelesai: '20:00', durasiJam: 4, jenisLembur: 'Hari Kerja', alasan: 'Operasi elektif tambahan', status: 'Pending' },
  { id: 'LB004', pegawaiId: 'P004', tanggal: '2026-10-22', jamMulai: '07:00', jamSelesai: '13:00', durasiJam: 6, jenisLembur: 'Hari Libur', alasan: 'Jaga farmasi akhir pekan', status: 'Disetujui', disetujuiOleh: 'Admin', tanggalDisetujui: '2026-10-22' },
  { id: 'LB005', pegawaiId: 'P005', tanggal: '2026-10-25', jamMulai: '06:00', jamSelesai: '13:00', durasiJam: 7, jenisLembur: 'Hari Raya', alasan: 'Hari Raya Natal', status: 'Pending' },
  { id: 'LB006', pegawaiId: 'P006', tanggal: '2026-10-10', jamMulai: '17:00', jamSelesai: '21:00', durasiJam: 4, jenisLembur: 'Hari Kerja', alasan: 'Rapat koordinasi urgent', status: 'Dibayar', disetujuiOleh: 'Admin', tanggalDisetujui: '2026-10-10' },
  { id: 'LB007', pegawaiId: 'P008', tanggal: '2026-10-19', jamMulai: '08:00', jamSelesai: '16:00', durasiJam: 8, jenisLembur: 'Hari Libur', alasan: 'Penggantian shift rekan sakit', status: 'Disetujui', disetujuiOleh: 'Admin', tanggalDisetujui: '2026-10-19' },
  { id: 'LB008', pegawaiId: 'P009', tanggal: '2026-10-28', jamMulai: '17:00', jamSelesai: '21:00', durasiJam: 4, jenisLembur: 'Hari Kerja', alasan: 'Input data rekam medis', status: 'Pending' },
];

// ─── Badge configs ─────────────────────────────────────────────────────────────
const jenisBadge: Record<JenisLembur, string> = {
  'Hari Kerja': 'bg-blue-100 text-blue-700',
  'Hari Libur': 'bg-orange-100 text-orange-700',
  'Hari Raya': 'bg-red-100 text-red-700',
};

const statusBadge: Record<StatusLembur, string> = {
  'Pending': 'bg-yellow-100 text-yellow-700',
  'Disetujui': 'bg-blue-100 text-blue-700',
  'Ditolak': 'bg-red-100 text-red-700',
  'Dibayar': 'bg-green-100 text-green-700',
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function Lembur() {
  const { lembur, pegawai, currentUser, addLembur, updateLembur, deleteLembur } = useAppContext();

  const [activeTab, setActiveTab] = useState<'pengajuan' | 'rekap' | 'aturan'>('pengajuan');
  const [filterBulan, setFilterBulan] = useState('10');
  const [filterTahun, setFilterTahun] = useState('2026');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterUnit, setFilterUnit] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({ pegawaiId: '', tanggal: '', jamMulai: '', jamSelesai: '', jenisLembur: 'Hari Kerja' as JenisLembur, alasan: '' });

  const getPeg = (id: string) => pegawai.find(p => p.id === id);
  const getGajiPokok = (id: string) => {
    const p = getPeg(id);
    return p ? (GAJI_POKOK[p.golongan] ?? 2022200) : 2022200;
  };

  // Merge seed when context empty, calculate upah on the fly
  const displayLembur: LemburRecord[] = useMemo(() => {
    const base = lembur.length === 0 ? (SEED_LEMBUR_BASE as LemburRecord[]) : lembur;
    return base.map(l => ({
      ...l,
      upahLembur: l.upahLembur ?? hitungUpahLembur(l.durasiJam, l.jenisLembur, getGajiPokok(l.pegawaiId)),
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lembur, pegawai]);

  const canApprove = currentUser?.role === 'admin' || currentUser?.role === 'kepala_unit' || currentUser?.role === 'direktur';
  const canPay = currentUser?.role === 'admin';

  const bulanNum = parseInt(filterBulan);
  const tahunNum = parseInt(filterTahun);

  const filtered = useMemo(() => {
    return displayLembur.filter(l => {
      const d = new Date(l.tanggal);
      const matchBulan = !filterBulan || (d.getMonth() + 1) === bulanNum;
      const matchTahun = !filterTahun || d.getFullYear() === tahunNum;
      const matchStatus = !filterStatus || l.status === filterStatus;
      const p = getPeg(l.pegawaiId);
      const matchUnit = !filterUnit || p?.unitKerja === filterUnit;
      const name = p ? getFullName(p) : '';
      const matchSearch = !search || name.toLowerCase().includes(search.toLowerCase());
      return matchBulan && matchTahun && matchStatus && matchUnit && matchSearch;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayLembur, filterBulan, filterTahun, filterStatus, filterUnit, search]);

  // Stats (this month)
  const thisBulan = displayLembur.filter(l => {
    const d = new Date(l.tanggal);
    return (d.getMonth() + 1) === bulanNum && d.getFullYear() === tahunNum;
  });
  const statPending = thisBulan.filter(l => l.status === 'Pending').length;
  const statDisetujui = thisBulan.filter(l => l.status === 'Disetujui' || l.status === 'Dibayar').length;
  const statJam = thisBulan.reduce((a, l) => a + l.durasiJam, 0);
  const statUpah = thisBulan
    .filter(l => l.status !== 'Pending' && l.status !== 'Ditolak')
    .reduce((a, l) => a + (l.upahLembur ?? 0), 0);

  const unitList = useMemo(() => [...new Set(pegawai.map(p => p.unitKerja))].sort(), [pegawai]);

  // Actions
  const handleApprove = (l: LemburRecord) => {
    const upah = hitungUpahLembur(l.durasiJam, l.jenisLembur, getGajiPokok(l.pegawaiId));
    const updated: LemburRecord = {
      ...l,
      status: 'Disetujui',
      disetujuiOleh: currentUser?.nama ?? 'Pejabat',
      tanggalDisetujui: new Date().toISOString().slice(0, 10),
      upahLembur: upah,
    };
    if (lembur.length === 0) {
      // seed mode: push to context then seed row will be replaced by context data
      addLembur({ pegawaiId: updated.pegawaiId, tanggal: updated.tanggal, jamMulai: updated.jamMulai, jamSelesai: updated.jamSelesai, durasiJam: updated.durasiJam, jenisLembur: updated.jenisLembur, alasan: updated.alasan, status: 'Disetujui', disetujuiOleh: updated.disetujuiOleh, tanggalDisetujui: updated.tanggalDisetujui, upahLembur: upah });
    } else {
      updateLembur(updated);
    }
    toast.success('Lembur disetujui');
  };

  const handlePay = (l: LemburRecord) => {
    updateLembur({ ...l, status: 'Dibayar' });
    toast.success('Status diubah menjadi Dibayar');
  };

  const handleReject = (l: LemburRecord) => {
    if (!window.confirm(`Tolak lembur ${getPeg(l.pegawaiId)?.nama ?? l.pegawaiId}?`)) return;
    if (lembur.length === 0) {
      addLembur({ pegawaiId: l.pegawaiId, tanggal: l.tanggal, jamMulai: l.jamMulai, jamSelesai: l.jamSelesai, durasiJam: l.durasiJam, jenisLembur: l.jenisLembur, alasan: l.alasan, status: 'Ditolak' });
    } else {
      updateLembur({ ...l, status: 'Ditolak' });
    }
    toast.error('Lembur ditolak');
  };

  const handleDelete = (id: string) => {
    deleteLembur(id);
    setShowDeleteConfirm(null);
    toast.success('Data lembur dihapus');
  };

  // Add form
  const durasi = calcDurasi(form.jamMulai, form.jamSelesai);
  const estimasiUpah = form.pegawaiId && durasi > 0
    ? hitungUpahLembur(durasi, form.jenisLembur, getGajiPokok(form.pegawaiId))
    : 0;

  const handleSubmit = () => {
    if (!form.pegawaiId || !form.tanggal || !form.jamMulai || !form.jamSelesai || !form.alasan) {
      toast.error('Semua field wajib diisi'); return;
    }
    if (durasi <= 0) { toast.error('Jam selesai harus setelah jam mulai'); return; }
    addLembur({
      pegawaiId: form.pegawaiId,
      tanggal: form.tanggal,
      jamMulai: form.jamMulai,
      jamSelesai: form.jamSelesai,
      durasiJam: durasi,
      jenisLembur: form.jenisLembur,
      alasan: form.alasan,
      status: 'Pending',
    });
    setShowModal(false);
    setForm({ pegawaiId: '', tanggal: '', jamMulai: '', jamSelesai: '', jenisLembur: 'Hari Kerja', alasan: '' });
    toast.success('Pengajuan lembur berhasil ditambahkan');
  };

  // Rekap bulanan
  const rekapData = useMemo(() => {
    const bulanFiltered = displayLembur.filter(l => {
      const d = new Date(l.tanggal);
      return (d.getMonth() + 1) === bulanNum && d.getFullYear() === tahunNum;
    });
    const byPeg: Record<string, {
      pegawaiId: string; totalJam: number; totalHari: number;
      hkJam: number; hlJam: number; hrJam: number;
      totalUpah: number; sudahDibayar: boolean;
    }> = {};
    for (const l of bulanFiltered) {
      if (!byPeg[l.pegawaiId]) {
        byPeg[l.pegawaiId] = { pegawaiId: l.pegawaiId, totalJam: 0, totalHari: 0, hkJam: 0, hlJam: 0, hrJam: 0, totalUpah: 0, sudahDibayar: false };
      }
      const r = byPeg[l.pegawaiId];
      r.totalJam += l.durasiJam;
      r.totalHari += 1;
      if (l.jenisLembur === 'Hari Kerja') r.hkJam += l.durasiJam;
      else if (l.jenisLembur === 'Hari Libur') r.hlJam += l.durasiJam;
      else r.hrJam += l.durasiJam;
      if (l.status === 'Disetujui' || l.status === 'Dibayar') r.totalUpah += (l.upahLembur ?? 0);
      if (l.status === 'Dibayar') r.sudahDibayar = true;
    }
    return Object.values(byPeg).filter(r => !filterUnit || getPeg(r.pegawaiId)?.unitKerja === filterUnit);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayLembur, bulanNum, tahunNum, filterUnit]);

  const exportCSV = () => {
    const headers = ['NIP', 'Nama', 'Unit Kerja', 'Total Jam', 'Total Hari', 'HK (jam)', 'HL (jam)', 'HR (jam)', 'Total Upah', 'Status Bayar'];
    const rows = rekapData.map(r => {
      const p = getPeg(r.pegawaiId);
      return [p?.nip ?? '', p ? getFullName(p) : r.pegawaiId, p?.unitKerja ?? '', r.totalJam, r.totalHari, r.hkJam, r.hlJam, r.hrJam, r.totalUpah, r.sudahDibayar ? 'Sudah Dibayar' : 'Belum Dibayar'];
    });
    const csv = [headers, ...rows].map(row => row.map(v => `"${String(v ?? '')}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `Rekap_Lembur_${BULAN_NAMES[bulanNum]}_${tahunNum}.csv`; a.click();
    toast.success('Export CSV berhasil');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Clock className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Lembur</h1>
          <p className="text-sm text-gray-500">Pengajuan, persetujuan, dan rekap lembur pegawai (PP No. 35/2021)</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {(['pengajuan', 'rekap', 'aturan'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {tab === 'pengajuan' ? 'Pengajuan Lembur' : tab === 'rekap' ? 'Rekap Bulanan' : 'Aturan & Referensi'}
          </button>
        ))}
      </div>

      {/* ── Tab 1: Pengajuan ── */}
      {activeTab === 'pengajuan' && (
        <div className="space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Pending', value: statPending, color: 'text-yellow-600', bg: 'bg-yellow-50' },
              { label: 'Disetujui Bulan Ini', value: statDisetujui, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Total Jam', value: `${statJam} jam`, color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Total Upah', value: `Rp ${fmt(statUpah)}`, color: 'text-green-600', bg: 'bg-green-50' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
                <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <select value={filterBulan} onChange={e => setFilterBulan(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              {BULAN_NAMES.slice(1).map((b, i) => <option key={i + 1} value={i + 1}>{b}</option>)}
            </select>
            <select value={filterTahun} onChange={e => setFilterTahun(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">Semua Status</option>
              {(['Pending', 'Disetujui', 'Ditolak', 'Dibayar'] as StatusLembur[]).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select value={filterUnit} onChange={e => setFilterUnit(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm max-w-xs">
              <option value="">Semua Unit</option>
              {unitList.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Cari nama pegawai..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
              <Plus className="w-4 h-4" /> Tambah Lembur
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {['Pegawai / Unit', 'Tanggal / Hari', 'Jenis', 'Jam', 'Durasi', 'Alasan', 'Upah Lembur', 'Status', 'Aksi'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="text-center py-8 text-gray-400">Tidak ada data lembur</td></tr>
                )}
                {filtered.map(l => {
                  const p = getPeg(l.pegawaiId);
                  const tgl = new Date(l.tanggal);
                  const isPending = l.status === 'Pending';
                  return (
                    <tr key={l.id} className={isPending ? 'bg-yellow-50/30' : 'hover:bg-gray-50'}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{p ? getFullName(p) : l.pegawaiId}</p>
                        <p className="text-xs text-gray-500">{p?.unitKerja ?? '—'}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p>{l.tanggal}</p>
                        <p className="text-xs text-gray-500">{HARI[tgl.getDay()]}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${jenisBadge[l.jenisLembur]}`}>
                          {l.jenisLembur}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                        {l.jamMulai} – {l.jamSelesai}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700">{l.durasiJam} jam</td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="text-gray-700 line-clamp-2">{l.alasan}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                        Rp {fmt(l.upahLembur ?? 0)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[l.status]}`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {isPending && canApprove && (
                            <button onClick={() => handleApprove(l)} title="Setujui"
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {isPending && (
                            <button onClick={() => handleReject(l)} title="Tolak"
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          {l.status === 'Disetujui' && canPay && (
                            <button onClick={() => handlePay(l)} title="Tandai Dibayar"
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                              <CreditCard className="w-4 h-4" />
                            </button>
                          )}
                          {canPay && (
                            <button onClick={() => setShowDeleteConfirm(l.id)} title="Hapus"
                              className="p-1.5 text-gray-400 hover:bg-gray-100 rounded">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tab 2: Rekap Bulanan ── */}
      {activeTab === 'rekap' && (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-3 items-center">
            <select value={filterBulan} onChange={e => setFilterBulan(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              {BULAN_NAMES.slice(1).map((b, i) => <option key={i + 1} value={i + 1}>{b}</option>)}
            </select>
            <select value={filterTahun} onChange={e => setFilterTahun(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={filterUnit} onChange={e => setFilterUnit(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm max-w-xs">
              <option value="">Semua Unit</option>
              {unitList.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <button onClick={exportCSV}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 ml-auto">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {['Pegawai', 'Unit Kerja', 'Total Jam', 'Total Hari', 'HK (jam)', 'HL (jam)', 'HR (jam)', 'Total Upah', 'Status Bayar'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rekapData.length === 0 && (
                  <tr><td colSpan={9} className="text-center py-8 text-gray-400">Tidak ada data</td></tr>
                )}
                {rekapData.map(r => {
                  const p = getPeg(r.pegawaiId);
                  return (
                    <tr key={r.pegawaiId} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium">{p ? getFullName(p) : r.pegawaiId}</p>
                        <p className="text-xs text-gray-500">{p?.nip ?? ''}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{p?.unitKerja ?? '—'}</td>
                      <td className="px-4 py-3 font-medium">{r.totalJam} jam</td>
                      <td className="px-4 py-3">{r.totalHari} hari</td>
                      <td className="px-4 py-3">{r.hkJam}</td>
                      <td className="px-4 py-3">{r.hlJam}</td>
                      <td className="px-4 py-3">{r.hrJam}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">Rp {fmt(r.totalUpah)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.sudahDibayar ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {r.sudahDibayar ? 'Sudah Dibayar' : 'Belum Dibayar'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tab 3: Aturan & Referensi ── */}
      {activeTab === 'aturan' && (
        <div className="space-y-6 max-w-3xl">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
            <BookOpen className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-blue-800">Dasar Hukum: PP No. 35 Tahun 2021</p>
              <p className="text-sm text-blue-700 mt-1">Peraturan Pemerintah tentang Perjanjian Kerja Waktu Tertentu, Alih Daya, Waktu Kerja dan Waktu Istirahat, dan Pemutusan Hubungan Kerja.</p>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-orange-800">Batas Maksimum Lembur</p>
              <ul className="text-sm text-orange-700 mt-1 list-disc list-inside space-y-1">
                <li>Maksimum <strong>4 jam per hari</strong></li>
                <li>Maksimum <strong>18 jam per minggu</strong></li>
              </ul>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Tarif Upah Lembur</h3>
              <p className="text-xs text-gray-500 mt-0.5">Upah Per Jam = (1/173) × Gaji Pokok</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">Jenis Hari</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">Jam Ke-</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">Tarif</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr><td className="px-4 py-2 font-medium text-blue-700">Hari Kerja</td><td className="px-4 py-2">Jam ke-1</td><td className="px-4 py-2">1,5 × upah/jam</td></tr>
                <tr><td className="px-4 py-2"></td><td className="px-4 py-2">Jam ke-2 dst.</td><td className="px-4 py-2">2,0 × upah/jam</td></tr>
                <tr className="bg-orange-50/40"><td className="px-4 py-2 font-medium text-orange-700">Hari Libur/Minggu</td><td className="px-4 py-2">Jam ke-1 s/d 7</td><td className="px-4 py-2">2,0 × upah/jam</td></tr>
                <tr className="bg-orange-50/40"><td className="px-4 py-2"></td><td className="px-4 py-2">Jam ke-8</td><td className="px-4 py-2">3,0 × upah/jam</td></tr>
                <tr className="bg-orange-50/40"><td className="px-4 py-2"></td><td className="px-4 py-2">Jam ke-9 dst.</td><td className="px-4 py-2">4,0 × upah/jam</td></tr>
                <tr className="bg-red-50/40"><td className="px-4 py-2 font-medium text-red-700">Hari Raya</td><td className="px-4 py-2">Jam ke-1 s/d 7</td><td className="px-4 py-2">3,0 × upah/jam</td></tr>
                <tr className="bg-red-50/40"><td className="px-4 py-2"></td><td className="px-4 py-2">Jam ke-8</td><td className="px-4 py-2">4,0 × upah/jam</td></tr>
                <tr className="bg-red-50/40"><td className="px-4 py-2"></td><td className="px-4 py-2">Jam ke-9 dst.</td><td className="px-4 py-2">5,0 × upah/jam</td></tr>
              </tbody>
            </table>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-gray-800">Contoh Perhitungan</h3>
            <p className="text-sm text-gray-600">
              <strong>Pegawai Gol. III/a</strong> (Gaji Pokok Rp {fmt(2579400)}) lembur <strong>4 jam Hari Kerja</strong>:
            </p>
            <ul className="text-sm text-gray-700 list-disc list-inside space-y-1 pl-2">
              <li>Upah/jam = Rp {fmt(2579400)} / 173 = Rp {fmt(Math.round(2579400 / 173))}</li>
              <li>Jam ke-1 = 1,5 × Rp {fmt(Math.round(2579400 / 173))} = Rp {fmt(Math.round(1.5 * 2579400 / 173))}</li>
              <li>Jam ke-2 s/d 4 (3 jam) = 3 × 2,0 × Rp {fmt(Math.round(2579400 / 173))} = Rp {fmt(Math.round(3 * 2 * 2579400 / 173))}</li>
              <li><strong>Total = Rp {fmt(hitungUpahLembur(4, 'Hari Kerja', 2579400))}</strong></li>
            </ul>
            <p className="text-sm text-gray-600 mt-2">
              <strong>Pegawai Gol. III/a</strong> lembur <strong>6 jam Hari Libur</strong>:
            </p>
            <ul className="text-sm text-gray-700 list-disc list-inside space-y-1 pl-2">
              <li>6 jam × 2,0 × Rp {fmt(Math.round(2579400 / 173))} (semua ≤7 jam)</li>
              <li><strong>Total = Rp {fmt(hitungUpahLembur(6, 'Hari Libur', 2579400))}</strong></li>
            </ul>
          </div>
        </div>
      )}

      {/* ── Modal Tambah Lembur ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Tambah Pengajuan Lembur</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pegawai</label>
                <select value={form.pegawaiId} onChange={e => setForm(f => ({ ...f, pegawaiId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">-- Pilih Pegawai --</option>
                  {pegawai.filter(p => p.statusAktif === 'Aktif').map(p => (
                    <option key={p.id} value={p.id}>{getFullName(p)} — {p.unitKerja}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                <input type="date" value={form.tanggal} onChange={e => setForm(f => ({ ...f, tanggal: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam Mulai</label>
                  <input type="time" value={form.jamMulai} onChange={e => setForm(f => ({ ...f, jamMulai: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam Selesai</label>
                  <input type="time" value={form.jamSelesai} onChange={e => setForm(f => ({ ...f, jamSelesai: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              {durasi > 0 && (
                <p className="text-xs text-gray-500">Durasi: <strong>{durasi} jam</strong></p>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Lembur</label>
                <select value={form.jenisLembur} onChange={e => setForm(f => ({ ...f, jenisLembur: e.target.value as JenisLembur }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="Hari Kerja">Hari Kerja</option>
                  <option value="Hari Libur">Hari Libur</option>
                  <option value="Hari Raya">Hari Raya</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alasan Lembur</label>
                <textarea value={form.alasan} onChange={e => setForm(f => ({ ...f, alasan: e.target.value }))} rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
                  placeholder="Tuliskan alasan lembur..." />
              </div>
              {form.pegawaiId && durasi > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800">
                  Estimasi Upah Lembur: <strong>Rp {fmt(estimasiUpah)}</strong>
                </div>
              )}
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-200 justify-end">
              <button onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                Batal
              </button>
              <button onClick={handleSubmit}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Delete ── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full space-y-4">
            <p className="text-gray-900 font-medium">Hapus data lembur ini?</p>
            <p className="text-sm text-gray-500">Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700">
                Batal
              </button>
              <button onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
