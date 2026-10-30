import React, { useState, useMemo } from 'react';
import {
  Users, Plus, Edit2, Trash2, X, Eye, ChevronRight,
  Briefcase, CheckCircle, UserCheck,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import type { RekrutmenRecord, LamaranRecord, OnboardingRecord, OnboardingItem, Pegawai } from '../types';
import { toast } from 'sonner';

// ─── Seed data ────────────────────────────────────────────────────────────────
const SEED_REKRUTMEN: RekrutmenRecord[] = [
  {
    id: 'RK001', posisi: 'Perawat Ahli Muda IGD', unitKerja: 'Instalasi Gawat Darurat',
    jumlahFormasi: 3, tanggalBuka: '2026-09-01', tanggalTutup: '2026-10-31',
    statusFormasi: 'Buka', kualifikasiPendidikan: 'D3/S1', kualifikasiJurusan: 'Keperawatan',
    persyaratan: 'Pengalaman min 2 tahun, memiliki STR aktif', dibuatOleh: 'Admin SDM',
  },
  {
    id: 'RK002', posisi: 'Apoteker Klinis', unitKerja: 'Instalasi Farmasi',
    jumlahFormasi: 1, tanggalBuka: '2026-09-15', tanggalTutup: '2026-10-15',
    statusFormasi: 'Terpenuhi', kualifikasiPendidikan: 'S1 Profesi', kualifikasiJurusan: 'Farmasi',
    persyaratan: 'Memiliki STRA aktif, pengalaman klinis min 1 tahun', dibuatOleh: 'Admin SDM',
  },
  {
    id: 'RK003', posisi: 'Dokter Umum Jaga', unitKerja: 'Instalasi Gawat Darurat',
    jumlahFormasi: 2, tanggalBuka: '2026-08-01', tanggalTutup: '2026-09-30',
    statusFormasi: 'Tutup', kualifikasiPendidikan: 'S1 Profesi', kualifikasiJurusan: 'Kedokteran',
    persyaratan: 'Memiliki SIP aktif, bersedia jaga malam', dibuatOleh: 'Admin SDM',
  },
];

const SEED_LAMARAN: LamaranRecord[] = [
  { id: 'LM001', rekrutmenId: 'RK001', namaPerlamar: 'Siti Rahayu', tanggalLahir: '1998-04-12', jenisKelamin: 'P', pendidikanTerakhir: 'S1', jurusan: 'Keperawatan', noHp: '081234567890', email: 'siti@example.com', tanggalLamar: '2026-09-05', status: 'Wawancara', nilaiAdministrasi: 85, nilaiPsikotes: 78 },
  { id: 'LM002', rekrutmenId: 'RK001', namaPerlamar: 'Budi Santoso', tanggalLahir: '1997-07-20', jenisKelamin: 'L', pendidikanTerakhir: 'D3', jurusan: 'Keperawatan', noHp: '082345678901', email: 'budi@example.com', tanggalLamar: '2026-09-06', status: 'Psikotes', nilaiAdministrasi: 80 },
  { id: 'LM003', rekrutmenId: 'RK001', namaPerlamar: 'Dewi Kurniawati', tanggalLahir: '1999-01-15', jenisKelamin: 'P', pendidikanTerakhir: 'S1', jurusan: 'Keperawatan', noHp: '083456789012', email: 'dewi@example.com', tanggalLamar: '2026-09-08', status: 'Diterima', nilaiAdministrasi: 90, nilaiPsikotes: 85, nilaiWawancara: 88, nilaiKesehatan: 'Layak' },
  { id: 'LM004', rekrutmenId: 'RK001', namaPerlamar: 'Andi Prasetyo', tanggalLahir: '1996-11-03', jenisKelamin: 'L', pendidikanTerakhir: 'D3', jurusan: 'Keperawatan', noHp: '084567890123', email: 'andi@example.com', tanggalLamar: '2026-09-10', status: 'Ditolak', nilaiAdministrasi: 60, catatanSeleksi: 'Tidak memenuhi syarat pengalaman' },
  { id: 'LM005', rekrutmenId: 'RK002', namaPerlamar: 'Maya Sari', tanggalLahir: '1995-06-22', jenisKelamin: 'P', pendidikanTerakhir: 'S1 Profesi', jurusan: 'Farmasi', noHp: '085678901234', email: 'maya@example.com', tanggalLamar: '2026-09-16', status: 'Diterima', nilaiAdministrasi: 92, nilaiPsikotes: 88, nilaiWawancara: 91, nilaiKesehatan: 'Layak' },
  { id: 'LM006', rekrutmenId: 'RK002', namaPerlamar: 'Reza Firmansyah', tanggalLahir: '1997-09-18', jenisKelamin: 'L', pendidikanTerakhir: 'S1 Profesi', jurusan: 'Farmasi', noHp: '086789012345', email: 'reza@example.com', tanggalLamar: '2026-09-17', status: 'Ditolak', nilaiAdministrasi: 75, nilaiPsikotes: 72, nilaiWawancara: 68, catatanSeleksi: 'Nilai wawancara di bawah standar' },
  { id: 'LM007', rekrutmenId: 'RK003', namaPerlamar: 'dr. Hendra Wijaya', tanggalLahir: '1994-03-30', jenisKelamin: 'L', pendidikanTerakhir: 'S1 Profesi', jurusan: 'Kedokteran', noHp: '087890123456', email: 'hendra@example.com', tanggalLamar: '2026-08-05', status: 'Administrasi' },
  { id: 'LM008', rekrutmenId: 'RK003', namaPerlamar: 'dr. Nisa Aulia', tanggalLahir: '1996-12-08', jenisKelamin: 'P', pendidikanTerakhir: 'S1 Profesi', jurusan: 'Kedokteran', noHp: '088901234567', email: 'nisa@example.com', tanggalLamar: '2026-08-07', status: 'Baru' },
];

// ─── Constants ────────────────────────────────────────────────────────────────
const SELEKSI_STAGES: LamaranRecord['status'][] = ['Baru', 'Administrasi', 'Psikotes', 'Wawancara', 'Kesehatan', 'Diterima'];

const STATUS_LAMARAN_CFG: Record<LamaranRecord['status'], { label: string; color: string }> = {
  Baru:          { label: 'Baru',          color: 'bg-gray-100 text-gray-700' },
  Administrasi:  { label: 'Administrasi',  color: 'bg-blue-100 text-blue-700' },
  Psikotes:      { label: 'Psikotes',      color: 'bg-purple-100 text-purple-700' },
  Wawancara:     { label: 'Wawancara',     color: 'bg-indigo-100 text-indigo-700' },
  Kesehatan:     { label: 'Kesehatan',     color: 'bg-orange-100 text-orange-700' },
  Diterima:      { label: 'Diterima',      color: 'bg-green-100 text-green-700' },
  Ditolak:       { label: 'Ditolak',       color: 'bg-red-100 text-red-700' },
};

const STATUS_FORMASI_CFG: Record<RekrutmenRecord['statusFormasi'], string> = {
  Buka:      'bg-green-100 text-green-700',
  Tutup:     'bg-gray-100 text-gray-600',
  Terpenuhi: 'bg-blue-100 text-blue-700',
};

const DEFAULT_ONBOARDING_ITEMS: Omit<OnboardingItem, 'id'>[] = [
  { kategori: 'Umum', namaItem: 'Pengenalan Visi Misi RS', status: 'Belum' },
  { kategori: 'Umum', namaItem: 'Orientasi K3RS', status: 'Belum' },
  { kategori: 'Umum', namaItem: 'Pengenalan Sistem Informasi RS', status: 'Belum' },
  { kategori: 'Umum', namaItem: 'Sosialisasi Peraturan Kepegawaian', status: 'Belum' },
  { kategori: 'Klinis', namaItem: 'Pelatihan BHD (Bantuan Hidup Dasar)', status: 'Belum' },
  { kategori: 'Klinis', namaItem: 'Sosialisasi PPI (Pencegahan dan Pengendalian Infeksi)', status: 'Belum' },
  { kategori: 'Klinis', namaItem: 'Sosialisasi KPRS (Keselamatan Pasien RS)', status: 'Belum' },
  { kategori: 'Administratif', namaItem: 'Pembuatan ID Card & Badge', status: 'Belum' },
  { kategori: 'Administratif', namaItem: 'Pendaftaran BPJS', status: 'Belum' },
  { kategori: 'Administratif', namaItem: 'Setup Email & Sistem', status: 'Belum' },
  { kategori: 'Unit Kerja', namaItem: 'Orientasi Unit Kerja', status: 'Belum' },
  { kategori: 'Unit Kerja', namaItem: 'Pengenalan Prosedur dan SOP Unit', status: 'Belum' },
];

const KATEGORI_COLOR: Record<OnboardingItem['kategori'], string> = {
  Umum:          'bg-blue-100 text-blue-700',
  Klinis:        'bg-red-100 text-red-700',
  'Unit Kerja':  'bg-purple-100 text-purple-700',
  Administratif: 'bg-yellow-100 text-yellow-700',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
const nextStage = (s: LamaranRecord['status']): LamaranRecord['status'] | null => {
  const idx = SELEKSI_STAGES.indexOf(s);
  return idx >= 0 && idx < SELEKSI_STAGES.length - 1 ? SELEKSI_STAGES[idx + 1] : null;
};
let _idCounter = 100;
const genItemId = () => `OI${++_idCounter}`;

// ─── Sub-components ───────────────────────────────────────────────────────────
function Badge({ label, className }: { label: string; className: string }) {
  return <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium ${className}`}>{label}</span>;
}

function Modal({ onClose, children, wide }: { onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-xl w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} max-h-[90vh] overflow-y-auto`}>
        {children}
      </div>
    </div>
  );
}

// ─── Tab 1: Formasi ───────────────────────────────────────────────────────────
const EMPTY_FORM_REKRUTMEN: Omit<RekrutmenRecord, 'id'> = {
  posisi: '', unitKerja: '', jumlahFormasi: 1, tanggalBuka: '', tanggalTutup: '',
  statusFormasi: 'Buka', kualifikasiPendidikan: '', kualifikasiJurusan: '',
  persyaratan: '', dibuatOleh: '', keterangan: '',
};

function TabFormasi({
  rekrutmen, lamaran, addRekrutmen, updateRekrutmen, deleteRekrutmen, onViewLamaran,
}: {
  rekrutmen: RekrutmenRecord[];
  lamaran: LamaranRecord[];
  addRekrutmen: (r: Omit<RekrutmenRecord, 'id'>) => void;
  updateRekrutmen: (r: RekrutmenRecord) => void;
  deleteRekrutmen: (id: string) => void;
  onViewLamaran: (id: string) => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<RekrutmenRecord | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM_REKRUTMEN });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const stats = useMemo(() => ({
    buka: rekrutmen.filter(r => r.statusFormasi === 'Buka').length,
    totalPelamar: lamaran.length,
    diterimaMonth: lamaran.filter(l => {
      if (l.status !== 'Diterima') return false;
      const d = new Date(l.tanggalLamar);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length,
    terpenuhi: rekrutmen.filter(r => r.statusFormasi === 'Terpenuhi').length,
  }), [rekrutmen, lamaran, thisMonth, thisYear]);

  const openAdd = () => { setForm({ ...EMPTY_FORM_REKRUTMEN }); setEditData(null); setShowModal(true); };
  const openEdit = (r: RekrutmenRecord) => {
    setEditData(r);
    setForm({ posisi: r.posisi, unitKerja: r.unitKerja, jumlahFormasi: r.jumlahFormasi, tanggalBuka: r.tanggalBuka, tanggalTutup: r.tanggalTutup, statusFormasi: r.statusFormasi, kualifikasiPendidikan: r.kualifikasiPendidikan, kualifikasiJurusan: r.kualifikasiJurusan || '', persyaratan: r.persyaratan || '', dibuatOleh: r.dibuatOleh, keterangan: r.keterangan || '' });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.posisi || !form.unitKerja || !form.tanggalBuka || !form.tanggalTutup || !form.kualifikasiPendidikan) {
      toast.error('Harap isi semua field yang wajib diisi');
      return;
    }
    if (editData) {
      updateRekrutmen({ ...editData, ...form });
      toast.success('Formasi berhasil diperbarui');
    } else {
      addRekrutmen(form);
      toast.success('Formasi berhasil ditambahkan');
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    deleteRekrutmen(id);
    setConfirmDelete(null);
    toast.success('Formasi berhasil dihapus');
  };

  const f = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [key]: key === 'jumlahFormasi' ? Number(e.target.value) : e.target.value }));

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Formasi Buka', value: stats.buka, icon: Briefcase, color: 'text-green-600', bg: 'bg-green-50 border-green-100' },
          { label: 'Total Pelamar', value: stats.totalPelamar, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
          { label: 'Diterima Bulan Ini', value: stats.diterimaMonth, icon: UserCheck, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
          { label: 'Formasi Terpenuhi', value: stats.terpenuhi, icon: CheckCircle, color: 'text-gray-600', bg: 'bg-white border-gray-200' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 border shadow-sm ${s.bg}`}>
            <s.icon className={`w-5 h-5 mb-2 ${s.color}`} />
            <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-700">Daftar Formasi</p>
          <button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /> Tambah Formasi
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Posisi', 'Unit Kerja', 'Formasi', 'Periode', 'Status', 'Aksi'].map(h => (
                  <th key={h} className="text-xs font-semibold text-gray-500 text-left px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rekrutmen.map(r => (
                <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{r.posisi}</td>
                  <td className="px-4 py-3 text-gray-600">{r.unitKerja}</td>
                  <td className="px-4 py-3 text-gray-700">{r.jumlahFormasi} orang</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(r.tanggalBuka)} – {fmtDate(r.tanggalTutup)}</td>
                  <td className="px-4 py-3"><Badge label={r.statusFormasi} className={STATUS_FORMASI_CFG[r.statusFormasi]} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => onViewLamaran(r.id)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600" title="Lihat Lamaran"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-600" title="Edit"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => setConfirmDelete(r.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {rekrutmen.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">Belum ada data formasi</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">{editData ? 'Edit Formasi' : 'Tambah Formasi Baru'}</h2>
            <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-4 h-4 text-gray-500" /></button>
          </div>
          <div className="p-5 space-y-4">
            {([
              ['posisi', 'Posisi / Jabatan *', 'text'],
              ['unitKerja', 'Unit Kerja *', 'text'],
              ['kualifikasiPendidikan', 'Kualifikasi Pendidikan *', 'text'],
              ['kualifikasiJurusan', 'Jurusan', 'text'],
              ['tanggalBuka', 'Tanggal Buka *', 'date'],
              ['tanggalTutup', 'Tanggal Tutup *', 'date'],
            ] as [keyof typeof form, string, string][]).map(([key, label, type]) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <input type={type} value={form[key] as string} onChange={f(key)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Jumlah Formasi</label>
              <input type="number" min={1} value={form.jumlahFormasi} onChange={f('jumlahFormasi')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status Formasi</label>
              <select value={form.statusFormasi} onChange={f('statusFormasi')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {(['Buka', 'Tutup', 'Terpenuhi'] as const).map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Persyaratan</label>
              <textarea value={form.persyaratan} onChange={f('persyaratan')} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Dibuat Oleh</label>
              <input type="text" value={form.dibuatOleh} onChange={f('dibuatOleh')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="p-5 border-t border-gray-100 flex justify-end gap-2">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50">Batal</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">Simpan</button>
          </div>
        </Modal>
      )}

      {/* Confirm Delete */}
      {confirmDelete && (
        <Modal onClose={() => setConfirmDelete(null)}>
          <div className="p-6 text-center">
            <Trash2 className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-800 mb-1">Hapus Formasi?</h3>
            <p className="text-sm text-gray-500 mb-4">Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50">Batal</button>
              <button onClick={() => handleDelete(confirmDelete)} className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700">Hapus</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Tab 2: Lamaran & Seleksi ─────────────────────────────────────────────────
function TabLamaran({
  rekrutmen, lamaran, addLamaran, updateLamaran, deleteLamaran, initialFilter,
}: {
  rekrutmen: RekrutmenRecord[];
  lamaran: LamaranRecord[];
  addLamaran: (l: Omit<LamaranRecord, 'id'>) => void;
  updateLamaran: (l: LamaranRecord) => void;
  deleteLamaran: (id: string) => void;
  initialFilter?: string;
}) {
  const [filterRekrutmen, setFilterRekrutmen] = useState(initialFilter ?? '');
  const [detailLamaran, setDetailLamaran] = useState<LamaranRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [addForm, setAddForm] = useState<Omit<LamaranRecord, 'id'>>({
    rekrutmenId: initialFilter ?? '', namaPerlamar: '', tanggalLahir: '', jenisKelamin: 'L',
    pendidikanTerakhir: '', jurusan: '', noHp: '', email: '', tanggalLamar: new Date().toISOString().slice(0, 10),
    status: 'Baru',
  });

  const filtered = useMemo(() =>
    lamaran.filter(l => !filterRekrutmen || l.rekrutmenId === filterRekrutmen),
    [lamaran, filterRekrutmen],
  );

  const stageCounts = useMemo(() =>
    SELEKSI_STAGES.reduce((acc, s) => ({ ...acc, [s]: filtered.filter(l => l.status === s).length }), {} as Record<string, number>),
    [filtered],
  );

  const getRekrutmenLabel = (id: string) => rekrutmen.find(r => r.id === id)?.posisi ?? id;

  const handleMajukan = (l: LamaranRecord) => {
    const next = nextStage(l.status);
    if (!next) return;
    updateLamaran({ ...l, status: next });
    setDetailLamaran({ ...l, status: next });
    toast.success(`Status dimajukan ke: ${next}`);
  };

  const handleTolak = (l: LamaranRecord) => {
    updateLamaran({ ...l, status: 'Ditolak' });
    setDetailLamaran({ ...l, status: 'Ditolak' });
    toast.info('Pelamar ditolak');
  };

  const handleAddLamaran = () => {
    if (!addForm.rekrutmenId || !addForm.namaPerlamar || !addForm.noHp) {
      toast.error('Harap isi field yang wajib diisi');
      return;
    }
    addLamaran(addForm);
    toast.success('Lamaran berhasil ditambahkan');
    setShowAddModal(false);
  };

  const af = (key: keyof typeof addForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setAddForm(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <div>
      {/* Pipeline stepper */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 overflow-x-auto">
        <p className="text-xs font-semibold text-gray-500 mb-3">Pipeline Seleksi {filterRekrutmen ? `— ${getRekrutmenLabel(filterRekrutmen)}` : '(Semua Formasi)'}</p>
        <div className="flex items-center gap-0 min-w-max">
          {SELEKSI_STAGES.map((s, i) => {
            const cfg = STATUS_LAMARAN_CFG[s];
            return (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center gap-1 px-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${cfg.color}`}>
                    {stageCounts[s] ?? 0}
                  </div>
                  <span className="text-xs text-gray-600 whitespace-nowrap">{s}</span>
                </div>
                {i < SELEKSI_STAGES.length - 1 && <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />}
              </React.Fragment>
            );
          })}
          <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
          <div className="flex flex-col items-center gap-1 px-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-red-100 text-red-700">
              {filtered.filter(l => l.status === 'Ditolak').length}
            </div>
            <span className="text-xs text-gray-600 whitespace-nowrap">Ditolak</span>
          </div>
        </div>
      </div>

      {/* Filter + Add */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <select value={filterRekrutmen} onChange={e => setFilterRekrutmen(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Semua Formasi</option>
          {rekrutmen.map(r => <option key={r.id} value={r.id}>{r.posisi} — {r.unitKerja}</option>)}
        </select>
        <button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ml-auto">
          <Plus className="w-4 h-4" /> Tambah Lamaran
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Nama Pelamar', 'Tanggal Lamar', 'Pendidikan', 'Jurusan', 'Formasi', 'Status', 'Aksi'].map(h => (
                  <th key={h} className="text-xs font-semibold text-gray-500 text-left px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(l => (
                <tr key={l.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{l.namaPerlamar}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(l.tanggalLamar)}</td>
                  <td className="px-4 py-3 text-gray-600">{l.pendidikanTerakhir}</td>
                  <td className="px-4 py-3 text-gray-600">{l.jurusan}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{getRekrutmenLabel(l.rekrutmenId)}</td>
                  <td className="px-4 py-3"><Badge label={l.status} className={STATUS_LAMARAN_CFG[l.status].color} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setDetailLamaran(l)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600" title="Detail"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => setConfirmDelete(l.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">Belum ada data lamaran</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      {detailLamaran && (
        <Modal onClose={() => setDetailLamaran(null)} wide>
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Detail Lamaran — {detailLamaran.namaPerlamar}</h2>
            <button onClick={() => setDetailLamaran(null)} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-4 h-4 text-gray-500" /></button>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Nama', detailLamaran.namaPerlamar],
                ['Tanggal Lahir', fmtDate(detailLamaran.tanggalLahir)],
                ['Jenis Kelamin', detailLamaran.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'],
                ['Pendidikan', `${detailLamaran.pendidikanTerakhir} — ${detailLamaran.jurusan}`],
                ['No HP', detailLamaran.noHp],
                ['Email', detailLamaran.email],
                ['Tanggal Lamar', fmtDate(detailLamaran.tanggalLamar)],
                ['Posisi', getRekrutmenLabel(detailLamaran.rekrutmenId)],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-xs text-gray-500">{k}</p>
                  <p className="font-medium text-gray-800">{v}</p>
                </div>
              ))}
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Status Saat Ini:</span>
              <Badge label={detailLamaran.status} className={STATUS_LAMARAN_CFG[detailLamaran.status].color} />
            </div>

            {/* Scores */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-600 mb-2">Nilai Seleksi</p>
              {[
                ['Administrasi', detailLamaran.nilaiAdministrasi != null ? `${detailLamaran.nilaiAdministrasi}` : '-'],
                ['Psikotes', detailLamaran.nilaiPsikotes != null ? `${detailLamaran.nilaiPsikotes}` : '-'],
                ['Wawancara', detailLamaran.nilaiWawancara != null ? `${detailLamaran.nilaiWawancara}` : '-'],
                ['Kesehatan', detailLamaran.nilaiKesehatan ?? '-'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-medium text-gray-800">{v}</span>
                </div>
              ))}
            </div>

            {detailLamaran.catatanSeleksi && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Catatan Seleksi</p>
                <p className="text-sm text-gray-700 bg-yellow-50 rounded-lg p-3">{detailLamaran.catatanSeleksi}</p>
              </div>
            )}
          </div>
          {detailLamaran.status !== 'Diterima' && detailLamaran.status !== 'Ditolak' && (
            <div className="p-5 border-t border-gray-100 flex gap-2 justify-end">
              <button onClick={() => handleTolak(detailLamaran)} className="px-4 py-2 text-sm rounded-lg border border-red-200 text-red-600 hover:bg-red-50">Tolak</button>
              {nextStage(detailLamaran.status) && (
                <button onClick={() => handleMajukan(detailLamaran)} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2">
                  Majukan ke {nextStage(detailLamaran.status)} <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </Modal>
      )}

      {/* Add Lamaran Modal */}
      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)}>
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Tambah Lamaran</h2>
            <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-4 h-4 text-gray-500" /></button>
          </div>
          <div className="p-5 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Formasi *</label>
              <select value={addForm.rekrutmenId} onChange={af('rekrutmenId')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Pilih Formasi</option>
                {rekrutmen.map(r => <option key={r.id} value={r.id}>{r.posisi} — {r.unitKerja}</option>)}
              </select>
            </div>
            {([
              ['namaPerlamar', 'Nama Pelamar *', 'text'],
              ['tanggalLahir', 'Tanggal Lahir', 'date'],
              ['pendidikanTerakhir', 'Pendidikan Terakhir', 'text'],
              ['jurusan', 'Jurusan', 'text'],
              ['noHp', 'No HP *', 'text'],
              ['email', 'Email', 'email'],
              ['tanggalLamar', 'Tanggal Lamar', 'date'],
            ] as [keyof typeof addForm, string, string][]).map(([key, label, type]) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <input type={type} value={addForm[key] as string} onChange={af(key)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Jenis Kelamin</label>
              <select value={addForm.jenisKelamin} onChange={af('jenisKelamin')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
          </div>
          <div className="p-5 border-t border-gray-100 flex justify-end gap-2">
            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50">Batal</button>
            <button onClick={handleAddLamaran} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">Simpan</button>
          </div>
        </Modal>
      )}

      {/* Confirm Delete */}
      {confirmDelete && (
        <Modal onClose={() => setConfirmDelete(null)}>
          <div className="p-6 text-center">
            <Trash2 className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-800 mb-1">Hapus Lamaran?</h3>
            <p className="text-sm text-gray-500 mb-4">Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50">Batal</button>
              <button onClick={() => { deleteLamaran(confirmDelete); setConfirmDelete(null); toast.success('Lamaran dihapus'); }} className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700">Hapus</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Tab 3: Onboarding ────────────────────────────────────────────────────────
function TabOnboarding({
  onboarding, pegawai, addOnboarding, updateOnboarding, deleteOnboarding,
}: {
  onboarding: OnboardingRecord[];
  pegawai: Pegawai[];
  addOnboarding: (o: Omit<OnboardingRecord, 'id'>) => void;
  updateOnboarding: (o: OnboardingRecord) => void;
  deleteOnboarding: (id: string) => void;
}) {
  const [detailOnboarding, setDetailOnboarding] = useState<OnboardingRecord | null>(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const [startForm, setStartForm] = useState({ pegawaiId: '', tanggalMulai: new Date().toISOString().slice(0, 10), tanggalTarget: '' });

  const getPegawaiName = (id: string) => {
    const p = pegawai.find(p => p.id === id);
    if (!p) return id;
    return `${p.gelarDepan ? p.gelarDepan + ' ' : ''}${p.nama}${p.gelarBelakang ? ', ' + p.gelarBelakang : ''}`;
  };

  const getPegawaiUnit = (id: string) => pegawai.find(p => p.id === id)?.unitKerja ?? '-';

  const handleStartOnboarding = () => {
    if (!startForm.pegawaiId || !startForm.tanggalMulai || !startForm.tanggalTarget) {
      toast.error('Harap lengkapi semua field');
      return;
    }
    const items: OnboardingItem[] = DEFAULT_ONBOARDING_ITEMS.map((item, i) => ({ ...item, id: `OI_NEW_${i}` }));
    addOnboarding({
      pegawaiId: startForm.pegawaiId,
      tanggalMulai: startForm.tanggalMulai,
      tanggalTarget: startForm.tanggalTarget,
      statusOrientasi: 'Belum Mulai',
      items,
    });
    toast.success('Onboarding dimulai');
    setShowStartModal(false);
    setStartForm({ pegawaiId: '', tanggalMulai: new Date().toISOString().slice(0, 10), tanggalTarget: '' });
  };

  const toggleItem = (rec: OnboardingRecord, itemId: string) => {
    const updated: OnboardingRecord = {
      ...rec,
      items: rec.items.map(it =>
        it.id === itemId
          ? { ...it, status: it.status === 'Selesai' ? 'Belum' : 'Selesai', tanggalSelesai: it.status === 'Belum' ? new Date().toISOString().slice(0, 10) : undefined }
          : it,
      ),
    };
    const selesai = updated.items.filter(i => i.status === 'Selesai').length;
    const total = updated.items.length;
    if (selesai === total) updated.statusOrientasi = 'Selesai';
    else if (selesai > 0) updated.statusOrientasi = 'Berlangsung';
    else updated.statusOrientasi = 'Belum Mulai';
    updateOnboarding(updated);
    setDetailOnboarding(updated);
  };

  const KATEGORI_ORDER: OnboardingItem['kategori'][] = ['Umum', 'Klinis', 'Administratif', 'Unit Kerja'];

  const STATUS_ORI_CFG: Record<OnboardingRecord['statusOrientasi'], string> = {
    'Belum Mulai': 'bg-gray-100 text-gray-600',
    'Berlangsung': 'bg-blue-100 text-blue-700',
    'Selesai':     'bg-green-100 text-green-700',
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowStartModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Mulai Onboarding
        </button>
      </div>

      {onboarding.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-sm text-gray-400">
          Belum ada data onboarding. Klik "+ Mulai Onboarding" untuk memulai.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {onboarding.map(ob => {
          const selesai = ob.items.filter(i => i.status === 'Selesai').length;
          const total = ob.items.length;
          const pct = total > 0 ? Math.round((selesai / total) * 100) : 0;
          return (
            <div key={ob.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{getPegawaiName(ob.pegawaiId)}</p>
                  <p className="text-xs text-gray-500">{getPegawaiUnit(ob.pegawaiId)}</p>
                </div>
                <Badge label={ob.statusOrientasi} className={STATUS_ORI_CFG[ob.statusOrientasi]} />
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress Onboarding</span>
                  <span>{selesai}/{total} item ({pct}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Mulai: {fmtDate(ob.tanggalMulai)} · Target: {fmtDate(ob.tanggalTarget)}</span>
                <button onClick={() => setDetailOnboarding(ob)} className="text-blue-600 hover:underline font-medium">Detail →</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {detailOnboarding && (
        <Modal onClose={() => setDetailOnboarding(null)} wide>
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-800">Onboarding — {getPegawaiName(detailOnboarding.pegawaiId)}</h2>
              <p className="text-xs text-gray-500 mt-0.5">Mulai: {fmtDate(detailOnboarding.tanggalMulai)} · Target: {fmtDate(detailOnboarding.tanggalTarget)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { deleteOnboarding(detailOnboarding.id); setDetailOnboarding(null); toast.success('Onboarding dihapus'); }} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Hapus"><Trash2 className="w-4 h-4" /></button>
              <button onClick={() => setDetailOnboarding(null)} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-4 h-4 text-gray-500" /></button>
            </div>
          </div>
          <div className="p-5 space-y-5">
            {KATEGORI_ORDER.map(kat => {
              const items = detailOnboarding.items.filter(i => i.kategori === kat);
              if (items.length === 0) return null;
              return (
                <div key={kat}>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge label={kat} className={KATEGORI_COLOR[kat]} />
                  </div>
                  <div className="space-y-2">
                    {items.map(item => (
                      <label key={item.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={item.status === 'Selesai'}
                          onChange={() => toggleItem(detailOnboarding, item.id)}
                          className="w-4 h-4 rounded accent-blue-600"
                        />
                        <div className="flex-1">
                          <p className={`text-sm ${item.status === 'Selesai' ? 'line-through text-gray-400' : 'text-gray-700'}`}>{item.namaItem}</p>
                          {item.tanggalSelesai && <p className="text-xs text-gray-400 mt-0.5">Selesai: {fmtDate(item.tanggalSelesai)}</p>}
                        </div>
                        {item.status === 'Selesai' && <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />}
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Modal>
      )}

      {/* Start Onboarding Modal */}
      {showStartModal && (
        <Modal onClose={() => setShowStartModal(false)}>
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Mulai Onboarding</h2>
            <button onClick={() => setShowStartModal(false)} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-4 h-4 text-gray-500" /></button>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Pegawai *</label>
              <select value={startForm.pegawaiId} onChange={e => setStartForm(p => ({ ...p, pegawaiId: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Pilih Pegawai</option>
                {pegawai.map(p => <option key={p.id} value={p.id}>{getPegawaiName(p.id)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tanggal Mulai *</label>
              <input type="date" value={startForm.tanggalMulai} onChange={e => setStartForm(p => ({ ...p, tanggalMulai: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tanggal Target Selesai *</label>
              <input type="date" value={startForm.tanggalTarget} onChange={e => setStartForm(p => ({ ...p, tanggalTarget: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <p className="text-xs text-gray-500 bg-blue-50 rounded-lg p-3">
              Checklist default ({DEFAULT_ONBOARDING_ITEMS.length} item) akan diisi secara otomatis mencakup orientasi Umum, Klinis, Administratif, dan Unit Kerja.
            </p>
          </div>
          <div className="p-5 border-t border-gray-100 flex justify-end gap-2">
            <button onClick={() => setShowStartModal(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50">Batal</button>
            <button onClick={handleStartOnboarding} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">Mulai</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const TABS = ['Formasi', 'Lamaran & Seleksi', 'Onboarding'] as const;
type Tab = typeof TABS[number];

export default function Rekrutmen() {
  const {
    rekrutmen, lamaran, onboarding, pegawai,
    addRekrutmen, updateRekrutmen, deleteRekrutmen,
    addLamaran, updateLamaran, deleteLamaran,
    addOnboarding, updateOnboarding, deleteOnboarding,
  } = useAppContext();

  const [activeTab, setActiveTab] = useState<Tab>('Formasi');
  const [lamaranFilterId, setLamaranFilterId] = useState<string | undefined>(undefined);

  const displayRekrutmen = rekrutmen.length > 0 ? rekrutmen : SEED_REKRUTMEN;
  const displayLamaran = lamaran.length > 0 ? lamaran : SEED_LAMARAN;

  const handleViewLamaran = (rekrutmenId: string) => {
    setLamaranFilterId(rekrutmenId);
    setActiveTab('Lamaran & Seleksi');
  };

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Rekrutmen & Onboarding
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Manajemen formasi, seleksi pelamar, dan orientasi pegawai baru</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'Formasi' && (
        <TabFormasi
          rekrutmen={displayRekrutmen}
          lamaran={displayLamaran}
          addRekrutmen={addRekrutmen}
          updateRekrutmen={updateRekrutmen}
          deleteRekrutmen={deleteRekrutmen}
          onViewLamaran={handleViewLamaran}
        />
      )}
      {activeTab === 'Lamaran & Seleksi' && (
        <TabLamaran
          key={lamaranFilterId}
          rekrutmen={displayRekrutmen}
          lamaran={displayLamaran}
          addLamaran={addLamaran}
          updateLamaran={updateLamaran}
          deleteLamaran={deleteLamaran}
          initialFilter={lamaranFilterId}
        />
      )}
      {activeTab === 'Onboarding' && (
        <TabOnboarding
          onboarding={onboarding}
          pegawai={pegawai}
          addOnboarding={addOnboarding}
          updateOnboarding={updateOnboarding}
          deleteOnboarding={deleteOnboarding}
        />
      )}
    </div>
  );
}
