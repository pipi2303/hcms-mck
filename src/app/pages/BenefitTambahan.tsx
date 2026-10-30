import React, { useState, useMemo } from 'react';
import { Gift, Search, Plus, Edit2, Trash2, X, FileDown, BarChart2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import type { BenefitRecord, JenisBenefit } from '../types';
import { toast } from 'sonner';

// ─── Constants ────────────────────────────────────────────────────────────────
const JENIS_LIST: JenisBenefit[] = ['Seragam', 'Transport', 'Makan', 'Perumahan', 'Pulsa', 'Lainnya'];

const JENIS_COLOR: Record<JenisBenefit, string> = {
  Seragam:   'bg-indigo-100 text-indigo-700',
  Transport: 'bg-blue-100 text-blue-700',
  Makan:     'bg-green-100 text-green-700',
  Perumahan: 'bg-purple-100 text-purple-700',
  Pulsa:     'bg-orange-100 text-orange-700',
  Lainnya:   'bg-gray-100 text-gray-600',
};

const JENIS_BAR: Record<JenisBenefit, string> = {
  Seragam:   'bg-indigo-500',
  Transport: 'bg-blue-500',
  Makan:     'bg-green-500',
  Perumahan: 'bg-purple-500',
  Pulsa:     'bg-orange-500',
  Lainnya:   'bg-gray-400',
};

// ─── Seed data ────────────────────────────────────────────────────────────────
const SEED_BENEFIT: BenefitRecord[] = [
  // P001
  { id: 'BN-S001', pegawaiId: 'P001', jenisBenefit: 'Transport', nilaiPerBulan: 500000, tanggalMulai: '2026-01-01', isAktif: true },
  { id: 'BN-S002', pegawaiId: 'P001', jenisBenefit: 'Makan',     nilaiPerBulan: 450000, tanggalMulai: '2026-01-01', isAktif: true },
  { id: 'BN-S003', pegawaiId: 'P001', jenisBenefit: 'Seragam',   nilaiPerBulan: 150000, tanggalMulai: '2026-01-01', isAktif: true },
  // P002
  { id: 'BN-S004', pegawaiId: 'P002', jenisBenefit: 'Transport', nilaiPerBulan: 400000, tanggalMulai: '2026-01-01', isAktif: true },
  { id: 'BN-S005', pegawaiId: 'P002', jenisBenefit: 'Makan',     nilaiPerBulan: 450000, tanggalMulai: '2026-01-01', isAktif: true },
  // P003
  { id: 'BN-S006', pegawaiId: 'P003', jenisBenefit: 'Transport', nilaiPerBulan: 400000, tanggalMulai: '2026-01-01', isAktif: true },
  { id: 'BN-S007', pegawaiId: 'P003', jenisBenefit: 'Makan',     nilaiPerBulan: 450000, tanggalMulai: '2026-01-01', isAktif: true },
  { id: 'BN-S008', pegawaiId: 'P003', jenisBenefit: 'Pulsa',     nilaiPerBulan: 100000, tanggalMulai: '2026-01-01', isAktif: true },
  // P004
  { id: 'BN-S009', pegawaiId: 'P004', jenisBenefit: 'Transport', nilaiPerBulan: 350000, tanggalMulai: '2026-01-01', isAktif: true },
  { id: 'BN-S010', pegawaiId: 'P004', jenisBenefit: 'Makan',     nilaiPerBulan: 450000, tanggalMulai: '2026-01-01', isAktif: true },
  { id: 'BN-S011', pegawaiId: 'P004', jenisBenefit: 'Seragam',   nilaiPerBulan: 150000, tanggalMulai: '2026-01-01', isAktif: true },
  // P005
  { id: 'BN-S012', pegawaiId: 'P005', jenisBenefit: 'Transport', nilaiPerBulan: 600000, tanggalMulai: '2026-01-01', isAktif: true },
  { id: 'BN-S013', pegawaiId: 'P005', jenisBenefit: 'Makan',     nilaiPerBulan: 450000, tanggalMulai: '2026-01-01', isAktif: true },
  { id: 'BN-S014', pegawaiId: 'P005', jenisBenefit: 'Perumahan', nilaiPerBulan: 1000000, tanggalMulai: '2026-01-01', isAktif: true },
  // P006
  { id: 'BN-S015', pegawaiId: 'P006', jenisBenefit: 'Transport', nilaiPerBulan: 500000, tanggalMulai: '2026-01-01', isAktif: true },
  { id: 'BN-S016', pegawaiId: 'P006', jenisBenefit: 'Makan',     nilaiPerBulan: 450000, tanggalMulai: '2026-01-01', isAktif: true },
  { id: 'BN-S017', pegawaiId: 'P006', jenisBenefit: 'Pulsa',     nilaiPerBulan: 150000, tanggalMulai: '2026-01-01', isAktif: true },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const rp = (n: number) => `Rp ${new Intl.NumberFormat('id-ID').format(n)}`;
const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const EMPTY_FORM: Omit<BenefitRecord, 'id'> = {
  pegawaiId: '', jenisBenefit: 'Transport', nilaiPerBulan: 0,
  tanggalMulai: '', tanggalSelesai: undefined, isAktif: true, keterangan: '',
};

// ─── Modal ────────────────────────────────────────────────────────────────────
type PegawaiList = ReturnType<typeof useAppContext>['pegawai'];

function Modal({ form, setForm, pegawai, onSave, onClose, isEdit }: {
  form: Omit<BenefitRecord, 'id'>;
  setForm: React.Dispatch<React.SetStateAction<Omit<BenefitRecord, 'id'>>>;
  pegawai: PegawaiList;
  onSave: () => void;
  onClose: () => void;
  isEdit: boolean;
}) {
  const [pgSearch, setPgSearch] = useState('');
  const [pgOpen, setPgOpen] = useState(false);

  const filteredPg = useMemo(() =>
    pegawai
      .filter(p => p.statusAktif === 'Aktif' &&
        (p.nama.toLowerCase().includes(pgSearch.toLowerCase()) || p.nip.includes(pgSearch)))
      .slice(0, 30),
  [pegawai, pgSearch]);

  const selectedPg = pegawai.find(p => p.id === form.pegawaiId);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-semibold text-gray-900">{isEdit ? 'Edit Benefit' : 'Tambah Benefit'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          {/* Pegawai searchable */}
          <div className="relative">
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              Pegawai <span className="text-red-500">*</span>
            </label>
            <input
              value={selectedPg ? `${selectedPg.nama} — ${selectedPg.unitKerja}` : pgSearch}
              onChange={e => { setPgSearch(e.target.value); setForm(f => ({ ...f, pegawaiId: '' })); setPgOpen(true); }}
              onFocus={() => setPgOpen(true)}
              onBlur={() => setTimeout(() => setPgOpen(false), 150)}
              placeholder="Cari nama atau NIP..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {pgOpen && filteredPg.length > 0 && (
              <ul className="absolute z-10 top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredPg.map(p => (
                  <li key={p.id}
                    className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer"
                    onMouseDown={() => { setForm(f => ({ ...f, pegawaiId: p.id })); setPgSearch(''); setPgOpen(false); }}
                  >
                    <span className="font-medium">{p.nama}</span>
                    <span className="text-gray-400 text-xs ml-2">{p.unitKerja}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Jenis Benefit */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Jenis Benefit</label>
            <select
              value={form.jenisBenefit}
              onChange={e => setForm(f => ({ ...f, jenisBenefit: e.target.value as JenisBenefit }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {JENIS_LIST.map(j => <option key={j} value={j}>{j}</option>)}
            </select>
          </div>
          {/* Nilai */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Nilai per Bulan (Rp)</label>
            <input
              type="number" min={0} value={form.nilaiPerBulan || ''}
              onChange={e => setForm(f => ({ ...f, nilaiPerBulan: Number(e.target.value) }))}
              placeholder="0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Tanggal */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                Tanggal Mulai <span className="text-red-500">*</span>
              </label>
              <input
                type="date" value={form.tanggalMulai}
                onChange={e => setForm(f => ({ ...f, tanggalMulai: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                Tanggal Selesai <span className="text-gray-400">(opsional)</span>
              </label>
              <input
                type="date" value={form.tanggalSelesai || ''}
                onChange={e => setForm(f => ({ ...f, tanggalSelesai: e.target.value || undefined }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          {/* Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox" id="isAktif" checked={form.isAktif}
              onChange={e => setForm(f => ({ ...f, isAktif: e.target.checked }))}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="isAktif" className="text-sm text-gray-700">Status Aktif</label>
          </div>
          {/* Keterangan */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Keterangan</label>
            <input
              type="text" value={form.keterangan || ''}
              onChange={e => setForm(f => ({ ...f, keterangan: e.target.value }))}
              placeholder="Opsional"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Batal</button>
          <button onClick={onSave} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Simpan</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BenefitTambahan() {
  const { benefit, pegawai, addBenefit, updateBenefit, deleteBenefit } = useAppContext();
  const [tab, setTab] = useState<'data' | 'analitik'>('data');
  const [search, setSearch] = useState('');
  const [filterJenis, setFilterJenis] = useState<JenisBenefit | ''>('');
  const [filterAktif, setFilterAktif] = useState<'all' | 'aktif' | 'tidak'>('all');
  const [filterUnit, setFilterUnit] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<BenefitRecord, 'id'>>(EMPTY_FORM);

  const displayBenefit = benefit.length > 0 ? benefit : SEED_BENEFIT;

  const unitList = useMemo(() => [...new Set(pegawai.map(p => p.unitKerja))].sort(), [pegawai]);
  const getPegawai = (id: string) => pegawai.find(p => p.id === id);

  const filtered = useMemo(() => displayBenefit.filter(b => {
    const pg = getPegawai(b.pegawaiId);
    if (!pg) return false;
    if (search && !pg.nama.toLowerCase().includes(search.toLowerCase()) && !pg.unitKerja.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterJenis && b.jenisBenefit !== filterJenis) return false;
    if (filterAktif === 'aktif' && !b.isAktif) return false;
    if (filterAktif === 'tidak' && b.isAktif) return false;
    if (filterUnit && pg.unitKerja !== filterUnit) return false;
    return true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [displayBenefit, search, filterJenis, filterAktif, filterUnit, pegawai]);

  const aktifBenefit = displayBenefit.filter(b => b.isAktif);
  const totalNilai = aktifBenefit.reduce((s, b) => s + b.nilaiPerBulan, 0);
  const penerimAktifIds = new Set(aktifBenefit.map(b => b.pegawaiId));
  const tanpaBenefit = pegawai.filter(p => p.statusAktif === 'Aktif' && !penerimAktifIds.has(p.id)).length;

  const perJenis = useMemo(() => JENIS_LIST.map(j => {
    const rows = aktifBenefit.filter(b => b.jenisBenefit === j);
    const total = rows.reduce((s, b) => s + b.nilaiPerBulan, 0);
    return { jenis: j, count: rows.length, total, avg: rows.length ? Math.round(total / rows.length) : 0 };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [aktifBenefit]);

  const perUnit = useMemo(() => {
    const totalMap = new Map<string, number>();
    aktifBenefit.forEach(b => {
      const pg = getPegawai(b.pegawaiId);
      if (!pg) return;
      totalMap.set(pg.unitKerja, (totalMap.get(pg.unitKerja) ?? 0) + b.nilaiPerBulan);
    });
    const countMap = new Map<string, number>();
    penerimAktifIds.forEach(pid => {
      const pg = getPegawai(pid);
      if (!pg) return;
      countMap.set(pg.unitKerja, (countMap.get(pg.unitKerja) ?? 0) + 1);
    });
    return [...totalMap.entries()]
      .map(([unit, total]) => ({ unit, total, count: countMap.get(unit) ?? 0 }))
      .sort((a, b) => b.total - a.total);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aktifBenefit, pegawai]);

  const handleSave = () => {
    if (!form.pegawaiId) { toast.error('Pilih pegawai terlebih dahulu'); return; }
    if (!form.tanggalMulai) { toast.error('Tanggal mulai wajib diisi'); return; }
    if (form.nilaiPerBulan <= 0) { toast.error('Nilai benefit harus lebih dari 0'); return; }
    if (editId) {
      updateBenefit({ ...form, id: editId });
      toast.success('Data benefit diperbarui');
    } else {
      addBenefit(form);
      toast.success('Benefit berhasil ditambahkan');
    }
    setShowModal(false);
  };

  const handleEdit = (b: BenefitRecord) => {
    setEditId(b.id);
    setForm({ pegawaiId: b.pegawaiId, jenisBenefit: b.jenisBenefit, nilaiPerBulan: b.nilaiPerBulan, tanggalMulai: b.tanggalMulai, tanggalSelesai: b.tanggalSelesai, isAktif: b.isAktif, keterangan: b.keterangan });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Hapus data benefit ini?')) return;
    deleteBenefit(id);
    toast.success('Data benefit dihapus');
  };

  const handleToggleAktif = (b: BenefitRecord) => {
    updateBenefit({ ...b, isAktif: !b.isAktif });
    toast.success(b.isAktif ? 'Benefit dinonaktifkan' : 'Benefit diaktifkan');
  };

  const handleExport = () => {
    const rows = [
      ['ID', 'Pegawai', 'Unit Kerja', 'Golongan', 'Jenis Benefit', 'Nilai/Bulan', 'Tanggal Mulai', 'Tanggal Selesai', 'Status', 'Keterangan'],
      ...displayBenefit.map(b => {
        const pg = getPegawai(b.pegawaiId);
        return [b.id, pg?.nama ?? b.pegawaiId, pg?.unitKerja ?? '', pg?.golongan ?? '', b.jenisBenefit, String(b.nilaiPerBulan), b.tanggalMulai, b.tanggalSelesai ?? '', b.isAktif ? 'Aktif' : 'Tidak Aktif', b.keterangan ?? ''];
      }),
    ];
    const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `benefit-tambahan-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast.success('CSV berhasil diunduh');
  };

  const topJenis = perJenis.filter(j => j.total > 0).sort((a, b) => b.total - a.total)[0];

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Gift className="w-5 h-5 text-blue-600" />
            Benefit &amp; Tunjangan Tambahan
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Tunjangan non-gaji sesuai Peraturan Internal RS</p>
        </div>
        <button
          onClick={() => { setEditId(null); setForm(EMPTY_FORM); setShowModal(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg"
        >
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {([['data', 'Data Benefit Pegawai'], ['analitik', 'Ringkasan & Analitik']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: Data ─────────────────────────────────────────────────────────── */}
      {tab === 'data' && (
        <div className="space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Penerima Aktif',  value: penerimAktifIds.size, sub: 'pegawai',        color: 'text-blue-600' },
              { label: 'Total Nilai/Bulan',      value: rp(totalNilai),       sub: 'benefit aktif',  color: 'text-green-600' },
              { label: 'Terbesar',               value: topJenis?.jenis ?? '—', sub: 'jenis benefit', color: 'text-purple-600' },
              { label: 'Tanpa Benefit',           value: tanpaBenefit,          sub: 'pegawai aktif',  color: tanpaBenefit > 0 ? 'text-orange-500' : 'text-gray-500' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama / unit..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <select value={filterJenis} onChange={e => setFilterJenis(e.target.value as JenisBenefit | '')}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Semua Jenis</option>
                {JENIS_LIST.map(j => <option key={j} value={j}>{j}</option>)}
              </select>
              <select value={filterAktif} onChange={e => setFilterAktif(e.target.value as typeof filterAktif)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="tidak">Tidak Aktif</option>
              </select>
              <select value={filterUnit} onChange={e => setFilterUnit(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Semua Unit</option>
                {unitList.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          {/* Import hint */}
          <p className="text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2">
            Gunakan fitur Import untuk upload data benefit massal
          </p>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Pegawai</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Jenis</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Nilai/Bulan</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Periode</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-10 text-gray-400">Tidak ada data benefit</td></tr>
                  ) : filtered.map(b => {
                    const pg = getPegawai(b.pegawaiId);
                    return (
                      <tr key={b.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{pg?.nama ?? b.pegawaiId}</p>
                          <p className="text-xs text-gray-400">{pg?.unitKerja} · {pg?.golongan}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${JENIS_COLOR[b.jenisBenefit]}`}>
                            {b.jenisBenefit}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">{rp(b.nilaiPerBulan)}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {fmtDate(b.tanggalMulai)} s/d {b.tanggalSelesai ? fmtDate(b.tanggalSelesai) : 'Sekarang'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleToggleAktif(b)}
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${b.isAktif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                          >
                            {b.isAktif ? 'Aktif' : 'Tidak Aktif'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => handleEdit(b)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(b.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
              Menampilkan {filtered.length} dari {displayBenefit.length} entri
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: Analitik ─────────────────────────────────────────────────────── */}
      {tab === 'analitik' && (
        <div className="space-y-5">
          {/* Total */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-5 text-white">
            <p className="text-sm text-blue-100">Total Pengeluaran Benefit / Bulan</p>
            <p className="text-3xl font-bold mt-1">{rp(totalNilai)}</p>
            <p className="text-xs text-blue-200 mt-1">{penerimAktifIds.size} penerima aktif · {aktifBenefit.length} entri benefit</p>
          </div>

          {/* Summary bars */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-blue-500" />
                Distribusi per Jenis Benefit
              </h3>
              <button onClick={handleExport} className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 border border-blue-200 px-3 py-1.5 rounded-lg">
                <FileDown className="w-4 h-4" /> Export CSV
              </button>
            </div>
            <div className="space-y-3">
              {perJenis.filter(j => j.total > 0).sort((a, b) => b.total - a.total).map(j => {
                const pct = totalNilai > 0 ? Math.round((j.total / totalNilai) * 100) : 0;
                return (
                  <div key={j.jenis}>
                    <div className="flex justify-between items-center mb-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${JENIS_COLOR[j.jenis]}`}>{j.jenis}</span>
                      <span className="text-gray-500 text-xs">{rp(j.total)} · {pct}% · {j.count} penerima</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div className={`${JENIS_BAR[j.jenis]} h-2.5 rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              {perJenis.every(j => j.total === 0) && (
                <p className="text-gray-400 text-sm text-center py-4">Belum ada data benefit aktif</p>
              )}
            </div>
          </div>

          {/* Per unit */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Benefit per Unit Kerja</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Unit Kerja</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Penerima</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Total/Bulan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {perUnit.length === 0
                    ? <tr><td colSpan={3} className="text-center py-6 text-gray-400">Belum ada data</td></tr>
                    : perUnit.map(u => (
                      <tr key={u.unit} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900">{u.unit}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{u.count}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">{rp(u.total)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Per jenis detail */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Rincian per Jenis Benefit</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Jenis</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Penerima</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Rata-rata/Bulan</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Total/Bulan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {perJenis.filter(j => j.count > 0).sort((a, b) => b.total - a.total).map(j => (
                    <tr key={j.jenis} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${JENIS_COLOR[j.jenis]}`}>{j.jenis}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">{j.count}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{rp(j.avg)}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">{rp(j.total)}</td>
                    </tr>
                  ))}
                  {perJenis.every(j => j.count === 0) && (
                    <tr><td colSpan={4} className="text-center py-6 text-gray-400">Belum ada data</td></tr>
                  )}
                </tbody>
                <tfoot className="bg-gray-50 border-t border-gray-200">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-gray-700">Total</td>
                    <td className="px-4 py-3 text-right font-bold text-blue-700">{rp(totalNilai)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <Modal
          form={form}
          setForm={setForm}
          pegawai={pegawai}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
          isEdit={editId !== null}
        />
      )}
    </div>
  );
}
