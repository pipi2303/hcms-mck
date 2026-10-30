import React, { useState, useMemo } from 'react';
import { Megaphone, Pin, Plus, Search, Eye, Edit2, Trash2, X, FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import type { PengumumanRecord, KategoriPengumuman } from '../types';
import { toast } from 'sonner';

// ─── Constants ────────────────────────────────────────────────────────────────

const KATEGORI_OPTIONS: KategoriPengumuman[] = ['Kepegawaian', 'Pelatihan', 'Kebijakan', 'Umum', 'Penting'];

const KATEGORI_BADGE: Record<KategoriPengumuman, string> = {
  Kepegawaian: 'bg-blue-100 text-blue-700',
  Pelatihan:   'bg-purple-100 text-purple-700',
  Kebijakan:   'bg-orange-100 text-orange-700',
  Umum:        'bg-gray-100 text-gray-600',
  Penting:     'bg-red-100 text-red-700',
};

const STATUS_BADGE = {
  Draft:      { cls: 'bg-gray-100 text-gray-600',  icon: FileText },
  Aktif:      { cls: 'bg-green-100 text-green-700', icon: CheckCircle },
  Kadaluarsa: { cls: 'bg-red-100 text-red-700',    icon: AlertTriangle },
};

const AUDIENS_OPTIONS = [
  'Semua', 'PNS', 'PPPK', 'Honorer',
  'Instalasi Farmasi', 'IGD', 'ICU', 'Rawat Inap', 'Rawat Jalan',
  'Laboratorium', 'Radiologi', 'Gizi', 'Rekam Medis', 'Keuangan', 'Umum & SDM',
];

const SEED_PENGUMUMAN: PengumumanRecord[] = [
  {
    id: 'PU-SEED-1',
    judul: 'Libur Nasional & Penggantian Hari Kerja November 2026',
    konten: 'Diberitahukan kepada seluruh pegawai bahwa berdasarkan Keputusan Presiden, tanggal 10 November 2026 ditetapkan sebagai hari libur nasional (Hari Pahlawan). Penggantian hari kerja akan ditetapkan berdasarkan SK Direktur.',
    kategori: 'Kepegawaian', tanggalPublish: '2026-10-28', targetAudiens: 'Semua',
    dibuatOleh: 'Bagian Kepegawaian', isPinned: true, status: 'Aktif',
  },
  {
    id: 'PU-SEED-2',
    judul: 'Pengisian SKP Semester 2 Tahun 2026',
    konten: 'Seluruh PNS dan PPPK wajib mengisi Sasaran Kinerja Pegawai (SKP) Semester 2 Tahun 2026 melalui aplikasi HCMS sebelum tanggal 15 November 2026. SKP yang belum diisi akan dikenakan sanksi sesuai peraturan yang berlaku.',
    kategori: 'Kepegawaian', tanggalPublish: '2026-10-25', tanggalExpiry: '2026-11-15',
    targetAudiens: 'PNS', dibuatOleh: 'Sub Bag Kepegawaian', isPinned: true, status: 'Aktif',
  },
  {
    id: 'PU-SEED-3',
    judul: 'Jadwal Pelatihan BHD Wajib November 2026',
    konten: 'Pelatihan Bantuan Hidup Dasar (BHD) wajib bagi seluruh tenaga klinis akan dilaksanakan pada tanggal 5-7 November 2026 di Aula Utama RS. Peserta wajib hadir sesuai jadwal yang telah ditentukan. Absensi akan dicatat dan dilaporkan ke atasan langsung.',
    kategori: 'Pelatihan', tanggalPublish: '2026-10-20', tanggalExpiry: '2026-11-07',
    targetAudiens: 'Semua', dibuatOleh: 'Instalasi Diklat', isPinned: false, status: 'Aktif',
  },
  {
    id: 'PU-SEED-4',
    judul: 'Perubahan Jam Kerja Instalasi Farmasi',
    konten: 'Mulai 1 November 2026, jam operasional Instalasi Farmasi Rawat Jalan berubah menjadi 07.00-20.00 WIB (sebelumnya 08.00-17.00 WIB). Penyesuaian jadwal shift akan dikoordinasikan oleh Kepala Instalasi Farmasi.',
    kategori: 'Kebijakan', tanggalPublish: '2026-10-15', targetAudiens: 'Instalasi Farmasi',
    dibuatOleh: 'Bidang Pelayanan Medik', isPinned: false, status: 'Aktif',
  },
  {
    id: 'PU-SEED-5',
    judul: 'Pembaruan Kebijakan Cuti Tahunan 2027',
    konten: 'Berdasarkan hasil rapat pimpinan, kebijakan cuti tahunan untuk tahun 2027 akan mengalami beberapa perubahan. Draft kebijakan dapat diakses melalui Bagian Kepegawaian untuk masukan sebelum ditetapkan.',
    kategori: 'Kebijakan', tanggalPublish: '2026-10-01', targetAudiens: 'Semua',
    dibuatOleh: 'Direktur RS', isPinned: false, status: 'Aktif',
  },
  {
    id: 'PU-SEED-6',
    judul: 'Sosialisasi BPJS Ketenagakerjaan Jaminan Hari Tua',
    konten: 'BPJS Ketenagakerjaan akan mengadakan sosialisasi program JHT dan klaim manfaat pada Rabu, 12 November 2026 pukul 09.00 WIB di Ruang Rapat Utama. Seluruh pegawai diundang untuk hadir.',
    kategori: 'Umum', tanggalPublish: '2026-10-28', tanggalExpiry: '2026-11-12',
    targetAudiens: 'Semua', dibuatOleh: 'Bagian SDM', isPinned: false, status: 'Aktif',
  },
];

const EMPTY_FORM = {
  judul: '', konten: '', kategori: 'Umum' as KategoriPengumuman,
  tanggalPublish: '', tanggalExpiry: '', targetAudiens: 'Semua',
  dibuatOleh: '', isPinned: false, status: 'Draft' as PengumumanRecord['status'],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - new Date().setHours(0, 0, 0, 0);
  return Math.ceil(diff / 86400000);
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Small reusable badges ────────────────────────────────────────────────────

function KategoriBadge({ k }: { k: KategoriPengumuman }) {
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${KATEGORI_BADGE[k]}`}>{k}</span>;
}

function StatusBadge({ s }: { s: PengumumanRecord['status'] }) {
  const cfg = STATUS_BADGE[s];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.cls}`}>
      <Icon className="w-3 h-3" />{s}
    </span>
  );
}

function ExpiryTag({ tanggalExpiry }: { tanggalExpiry?: string }) {
  if (!tanggalExpiry) return null;
  const days = daysUntil(tanggalExpiry);
  if (days < 0) return <span className="text-xs text-red-600 font-medium">Kadaluarsa</span>;
  if (days <= 7) return <span className="text-xs text-orange-600 font-medium">{days} hari lagi</span>;
  return <span className="text-xs text-gray-500">{fmtDate(tanggalExpiry)}</span>;
}

// ─── Shared Form State type ───────────────────────────────────────────────────

type FormState = typeof EMPTY_FORM;

// ─── Add/Edit Modal ───────────────────────────────────────────────────────────

function PengumumanModal({ form, setForm, isEdit, onSave, onClose }: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  isEdit: boolean;
  onSave: () => void;
  onClose: () => void;
}) {
  const upd = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            {isEdit ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Judul <span className="text-red-500">*</span></label>
            <input value={form.judul} onChange={upd('judul')} placeholder="Judul pengumuman"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Kategori</label>
              <select value={form.kategori} onChange={upd('kategori')}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                {KATEGORI_OPTIONS.map(k => <option key={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={upd('status')}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Draft</option><option>Aktif</option><option>Kadaluarsa</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Target Audiens</label>
            <select value={form.targetAudiens} onChange={upd('targetAudiens')}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              {AUDIENS_OPTIONS.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal Publish <span className="text-red-500">*</span></label>
              <input type="date" value={form.tanggalPublish} onChange={upd('tanggalPublish')}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Kadaluarsa <span className="text-gray-400">(opsional)</span></label>
              <input type="date" value={form.tanggalExpiry} onChange={upd('tanggalExpiry')}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Dibuat Oleh <span className="text-red-500">*</span></label>
            <input value={form.dibuatOleh} onChange={upd('dibuatOleh')} placeholder="Nama unit / pembuat pengumuman"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Konten <span className="text-red-500">*</span></label>
            <textarea value={form.konten} onChange={upd('konten')} rows={5} placeholder="Isi pengumuman..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={form.isPinned}
              onChange={e => setForm(prev => ({ ...prev, isPinned: e.target.checked }))}
              className="w-4 h-4 rounded" />
            <span className="text-sm text-gray-700">Sematkan (Pinned) di bagian atas</span>
          </label>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Batal</button>
          <button onClick={onSave} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            {isEdit ? 'Simpan Perubahan' : 'Buat Pengumuman'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailModal({ p, onClose }: { p: PengumumanRecord; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[85vh] flex flex-col">
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100 gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {p.isPinned && <Pin className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />}
              <KategoriBadge k={p.kategori} />
              <StatusBadge s={p.status} />
            </div>
            <h2 className="text-sm font-semibold text-gray-900 mt-1">{p.judul}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 flex-shrink-0"><X className="w-5 h-5" /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4">
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{p.konten}</p>
        </div>
        <div className="px-6 py-3 border-t border-gray-100 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
          <span>Publish: {fmtDate(p.tanggalPublish)}</span>
          {p.tanggalExpiry && (
            <span className="flex items-center gap-1">Berlaku s/d: <ExpiryTag tanggalExpiry={p.tanggalExpiry} /></span>
          )}
          <span>Audiens: {p.targetAudiens}</span>
          <span>Oleh: {p.dibuatOleh}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Admin View ───────────────────────────────────────────────────────────────

function AdminView({ data, addPengumuman, updatePengumuman, deletePengumuman }: {
  data: PengumumanRecord[];
  addPengumuman: (p: Omit<PengumumanRecord, 'id'>) => void;
  updatePengumuman: (p: PengumumanRecord) => void;
  deletePengumuman: (id: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<'daftar' | 'buat'>('daftar');
  const [search, setSearch] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState<PengumumanRecord | null>(null);
  const [editData, setEditData] = useState<PengumumanRecord | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM });

  const stats = useMemo(() => ({
    aktif:      data.filter(p => p.status === 'Aktif').length,
    pinned:     data.filter(p => p.isPinned).length,
    draft:      data.filter(p => p.status === 'Draft').length,
    kadaluarsa: data.filter(p => p.status === 'Kadaluarsa').length,
  }), [data]);

  const filtered = useMemo(() => data.filter(p => {
    const matchSearch = !search || p.judul.toLowerCase().includes(search.toLowerCase());
    const matchKat    = !filterKategori || p.kategori === filterKategori;
    const matchSts    = !filterStatus   || p.status   === filterStatus;
    return matchSearch && matchKat && matchSts;
  }), [data, search, filterKategori, filterStatus]);

  const today = new Date().toISOString().slice(0, 10);

  const openAdd = () => {
    setForm({ ...EMPTY_FORM, tanggalPublish: today });
    setEditData(null);
    setShowModal(true);
  };

  const openEdit = (p: PengumumanRecord) => {
    setEditData(p);
    setForm({
      judul: p.judul, konten: p.konten, kategori: p.kategori,
      tanggalPublish: p.tanggalPublish, tanggalExpiry: p.tanggalExpiry ?? '',
      targetAudiens: p.targetAudiens, dibuatOleh: p.dibuatOleh,
      isPinned: p.isPinned, status: p.status,
    });
    setShowModal(true);
  };

  const validateForm = (f: FormState) => {
    if (!f.judul.trim() || !f.tanggalPublish || !f.konten.trim() || !f.dibuatOleh.trim()) {
      toast.error('Harap isi semua field wajib');
      return false;
    }
    return true;
  };

  const toPayload = (f: FormState): Omit<PengumumanRecord, 'id'> => ({
    ...f, tanggalExpiry: f.tanggalExpiry || undefined,
  });

  const handleSave = () => {
    if (!validateForm(form)) return;
    if (editData) {
      updatePengumuman({ ...editData, ...toPayload(form) });
      toast.success('Pengumuman berhasil diperbarui');
    } else {
      addPengumuman(toPayload(form));
      toast.success('Pengumuman berhasil dibuat');
    }
    setShowModal(false);
  };

  const handleSaveForm = () => {
    if (!validateForm(form)) return;
    addPengumuman(toPayload(form));
    toast.success('Pengumuman berhasil dipublikasikan');
    setForm({ ...EMPTY_FORM, tanggalPublish: today });
    setActiveTab('daftar');
  };

  const handleDelete = (id: string) => {
    deletePengumuman(id);
    setDeleteConfirm(null);
    toast.success('Pengumuman berhasil dihapus');
  };

  const togglePin = (p: PengumumanRecord) => {
    updatePengumuman({ ...p, isPinned: !p.isPinned });
    toast.success(p.isPinned ? 'Sematan dilepas' : 'Pengumuman disematkan');
  };

  const TABS = [
    { key: 'daftar' as const, label: 'Semua Pengumuman', count: data.length },
    { key: 'buat'   as const, label: 'Buat Pengumuman',  count: null },
  ];

  return (
    <>
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-5 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.key} onClick={() => { setActiveTab(t.key); }}
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === t.key
                ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
            {t.label}
            {t.count !== null && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === t.key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'daftar' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {[
              { label: 'Total Aktif',  value: stats.aktif,      color: 'text-green-600',  bg: 'bg-green-50 border-green-100' },
              { label: 'Disematkan',   value: stats.pinned,     color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-100' },
              { label: 'Draft',        value: stats.draft,      color: 'text-gray-600',   bg: 'bg-gray-50 border-gray-100' },
              { label: 'Kadaluarsa',   value: stats.kadaluarsa, color: 'text-red-600',    bg: 'bg-red-50 border-red-100' },
            ].map(s => (
              <div key={s.label} className={`rounded-xl p-4 border ${s.bg}`}>
                <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filter bar + table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Cari judul pengumuman..." value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <select value={filterKategori} onChange={e => setFilterKategori(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Semua Kategori</option>
                {KATEGORI_OPTIONS.map(k => <option key={k}>{k}</option>)}
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Semua Status</option>
                <option>Draft</option><option>Aktif</option><option>Kadaluarsa</option>
              </select>
              <button onClick={openAdd}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
                <Plus className="w-4 h-4" /> Tambah
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="w-8 px-4 py-3" />
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Judul</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Kategori</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">Audiens</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden lg:table-cell">Publish</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden lg:table-cell">Berlaku s/d</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden xl:table-cell">Dibuat Oleh</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center py-10 text-gray-400 text-sm">
                        Tidak ada pengumuman ditemukan
                      </td>
                    </tr>
                  )}
                  {filtered.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-center">
                        {p.isPinned && <Pin className="w-3.5 h-3.5 text-yellow-500 inline" />}
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <span className="font-medium text-gray-800 line-clamp-1">{p.judul}</span>
                      </td>
                      <td className="px-4 py-3"><KategoriBadge k={p.kategori} /></td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{p.targetAudiens}</td>
                      <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{fmtDate(p.tanggalPublish)}</td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {p.tanggalExpiry
                          ? <ExpiryTag tanggalExpiry={p.tanggalExpiry} />
                          : <span className="text-xs text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3"><StatusBadge s={p.status} /></td>
                      <td className="px-4 py-3 text-gray-500 hidden xl:table-cell">{p.dibuatOleh}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setShowDetail(p)} title="Lihat"
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => openEdit(p)} title="Edit"
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => togglePin(p)} title={p.isPinned ? 'Lepas sematan' : 'Sematkan'}
                            className={`p-1.5 rounded-lg transition-colors ${p.isPinned ? 'text-yellow-500 hover:bg-yellow-50' : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'}`}>
                            <Pin className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteConfirm(p.id)} title="Hapus"
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'buat' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 max-w-2xl mx-auto">
          <h2 className="text-base font-semibold text-gray-800 mb-5">Form Pengumuman Baru</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Judul <span className="text-red-500">*</span></label>
              <input value={form.judul} onChange={e => setForm(f => ({ ...f, judul: e.target.value }))}
                placeholder="Judul pengumuman"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Kategori</label>
                <select value={form.kategori} onChange={e => setForm(f => ({ ...f, kategori: e.target.value as KategoriPengumuman }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {KATEGORI_OPTIONS.map(k => <option key={k}>{k}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as PengumumanRecord['status'] }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Draft</option><option>Aktif</option><option>Kadaluarsa</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Target Audiens</label>
              <select value={form.targetAudiens} onChange={e => setForm(f => ({ ...f, targetAudiens: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                {AUDIENS_OPTIONS.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal Publish <span className="text-red-500">*</span></label>
                <input type="date" value={form.tanggalPublish} onChange={e => setForm(f => ({ ...f, tanggalPublish: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Kadaluarsa <span className="text-gray-400">(opsional)</span></label>
                <input type="date" value={form.tanggalExpiry} onChange={e => setForm(f => ({ ...f, tanggalExpiry: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Dibuat Oleh <span className="text-red-500">*</span></label>
              <input value={form.dibuatOleh} onChange={e => setForm(f => ({ ...f, dibuatOleh: e.target.value }))}
                placeholder="Nama unit / pembuat pengumuman"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Konten <span className="text-red-500">*</span></label>
              <textarea value={form.konten} onChange={e => setForm(f => ({ ...f, konten: e.target.value }))}
                rows={6} placeholder="Isi pengumuman..."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={form.isPinned}
                onChange={e => setForm(f => ({ ...f, isPinned: e.target.checked }))}
                className="w-4 h-4 rounded" />
              <span className="text-sm text-gray-700">Sematkan (Pinned) di bagian atas</span>
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setForm({ ...EMPTY_FORM, tanggalPublish: today })}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                Reset
              </button>
              <button onClick={handleSaveForm}
                className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Publikasikan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <PengumumanModal form={form} setForm={setForm} isEdit={!!editData}
          onSave={handleSave} onClose={() => setShowModal(false)} />
      )}
      {showDetail && (
        <DetailModal p={showDetail} onClose={() => setShowDetail(null)} />
      )}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Hapus Pengumuman?</h3>
            <p className="text-sm text-gray-500 mb-4">Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Batal</button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Pegawai Read-Only View ───────────────────────────────────────────────────

function PegawaiView({ data, userUnit }: {
  data: PengumumanRecord[];
  userUnit?: string;
}) {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const visible = useMemo(() => {
    return data
      .filter(p => {
        if (p.status !== 'Aktif') return false;
        const ta = p.targetAudiens;
        if (ta === 'Semua') return true;
        if (userUnit && ta === userUnit) return true;
        return false;
      })
      .filter(p => !search || p.judul.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(b.tanggalPublish).getTime() - new Date(a.tanggalPublish).getTime();
      });
  }, [data, search, userUnit]);

  return (
    <>
      <div className="relative mb-5 max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Cari pengumuman..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {visible.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Megaphone className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Tidak ada pengumuman saat ini</p>
        </div>
      )}

      <div className="space-y-3">
        {visible.map(p => {
          const isExpanded = expandedId === p.id;
          return (
            <div key={p.id}
              onClick={() => setExpandedId(isExpanded ? null : p.id)}
              className={`bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm cursor-pointer transition-all ${p.isPinned ? 'border-l-4 border-l-yellow-400' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    {p.isPinned && <Pin className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />}
                    <KategoriBadge k={p.kategori} />
                    {p.tanggalExpiry && <ExpiryTag tanggalExpiry={p.tanggalExpiry} />}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">{p.judul}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{fmtDate(p.tanggalPublish)} · {p.dibuatOleh}</p>
                </div>
                <Clock className={`w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
              </div>

              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{p.konten}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Pengumuman() {
  const { pengumuman, currentUser, addPengumuman, updatePengumuman, deletePengumuman } = useAppContext();

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'direktur';
  const data = pengumuman.length > 0 ? pengumuman : SEED_PENGUMUMAN;

  return (
    <div className="p-4 lg:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-blue-600" />
            Papan Pengumuman
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isAdmin
              ? 'Kelola pengumuman internal rumah sakit'
              : 'Informasi dan pengumuman terbaru untuk Anda'}
          </p>
        </div>
      </div>

      {isAdmin ? (
        <AdminView
          data={data}
          addPengumuman={addPengumuman}
          updatePengumuman={updatePengumuman}
          deletePengumuman={deletePengumuman}
        />
      ) : (
        <PegawaiView data={data} userUnit={currentUser?.unitKerja} />
      )}
    </div>
  );
}
