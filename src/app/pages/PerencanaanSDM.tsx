import React, { useState, useMemo } from 'react';
import {
  Users, Plus, Edit2, Trash2, X, AlertTriangle, TrendingUp,
  DollarSign, Target, ChevronRight, Clock,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { useNavigate } from 'react-router';
import { useAppContext } from '../context/AppContext';
import type { RencanaSDM, PrioritasRencana } from '../types';
import { toast } from 'sonner';
import { C } from '../components/colors';

// ─── Seed data ────────────────────────────────────────────────────────────────
const SEED_RENCANA: RencanaSDM[] = [
  { id: 'RS001', tahun: 2026, unitKerja: 'IGD', jabatan: 'Perawat Ahli Pertama', kualifikasiPendidikan: 'S1 Keperawatan + STR Aktif', targetHeadcount: 3, anggaran: 180000000, prioritas: 'Mendesak', statusRekrutmen: 'Sedang Direkrut' },
  { id: 'RS002', tahun: 2026, unitKerja: 'Instalasi Farmasi', jabatan: 'Apoteker Klinis', kualifikasiPendidikan: 'S1 Farmasi + Apoteker', targetHeadcount: 2, anggaran: 120000000, prioritas: 'Normal', statusRekrutmen: 'Belum Direkrut' },
  { id: 'RS003', tahun: 2026, unitKerja: 'ICU / ICCU / PICU', jabatan: 'Perawat Intensif', kualifikasiPendidikan: 'S1 Keperawatan + Pelatihan ICU', targetHeadcount: 2, anggaran: 140000000, prioritas: 'Mendesak', statusRekrutmen: 'Belum Direkrut' },
  { id: 'RS004', tahun: 2026, unitKerja: 'Instalasi Radiologi', jabatan: 'Radiografer', kualifikasiPendidikan: 'D3 Radiologi + STR', targetHeadcount: 1, anggaran: 60000000, prioritas: 'Normal', statusRekrutmen: 'Terpenuhi' },
  { id: 'RS005', tahun: 2026, unitKerja: 'Instalasi Lab Patologi Klinik', jabatan: 'ATLM Ahli Pertama', kualifikasiPendidikan: 'D3/S1 ATLM + STR', targetHeadcount: 2, anggaran: 100000000, prioritas: 'Normal', statusRekrutmen: 'Belum Direkrut' },
  { id: 'RS006', tahun: 2027, unitKerja: 'Sub Bag Kepegawaian', jabatan: 'Analis SDM', kualifikasiPendidikan: 'S1 Manajemen/Psikologi', targetHeadcount: 1, anggaran: 65000000, prioritas: 'Rendah', statusRekrutmen: 'Belum Direkrut' },
  { id: 'RS007', tahun: 2027, unitKerja: 'Bidang Pelayanan Medik', jabatan: 'Dokter Umum Jaga', kualifikasiPendidikan: 'S1 Kedokteran + SIP Aktif', targetHeadcount: 2, anggaran: 180000000, prioritas: 'Mendesak', statusRekrutmen: 'Sedang Direkrut' },
  { id: 'RS008', tahun: 2027, unitKerja: 'Instalasi Gizi', jabatan: 'Nutrisionis Ahli Pertama', kualifikasiPendidikan: 'S1 Gizi + STR', targetHeadcount: 1, anggaran: 60000000, prioritas: 'Rendah', statusRekrutmen: 'Belum Direkrut' },
];

// ─── Constants ────────────────────────────────────────────────────────────────
const NOW_MS = Date.now();

const PRIORITAS_CFG: Record<PrioritasRencana, string> = {
  Mendesak: 'bg-red-100 text-red-700',
  Normal:   'bg-blue-100 text-blue-700',
  Rendah:   'bg-gray-100 text-gray-600',
};

const STATUS_REKRUTMEN_CFG: Record<RencanaSDM['statusRekrutmen'], string> = {
  'Belum Direkrut':  'bg-yellow-100 text-yellow-700',
  'Sedang Direkrut': 'bg-blue-100 text-blue-700',
  'Terpenuhi':       'bg-green-100 text-green-700',
};

const fmtRp = (n: number) => `Rp ${new Intl.NumberFormat('id-ID').format(n)}`;

const fmtBudget = (n: number) =>
  n >= 1_000_000_000
    ? `Rp ${(n / 1_000_000_000).toFixed(1)} M`
    : `Rp ${(n / 1_000_000).toFixed(0)} Jt`;

// ─── Sub-components ───────────────────────────────────────────────────────────
function Badge({ label, cls }: { label: string; cls: string }) {
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{label}</span>;
}

function KpiCard({ icon: Icon, label, value, sub, color = C.brand }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3">
      <div className="rounded-lg p-2" style={{ background: C.bg }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-xl font-bold" style={{ color }}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Modal form ───────────────────────────────────────────────────────────────
const EMPTY: Omit<RencanaSDM, 'id'> = {
  tahun: 2026, unitKerja: '', jabatan: '', kualifikasiPendidikan: '',
  targetHeadcount: 1, anggaran: undefined, prioritas: 'Normal',
  statusRekrutmen: 'Belum Direkrut', keterangan: '',
};

function RencanaModal({
  init, onSave, onClose,
}: {
  init: Omit<RencanaSDM, 'id'> & { id?: string };
  onSave: (r: Omit<RencanaSDM, 'id'> & { id?: string }) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState(init);
  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.unitKerja || !form.jabatan || !form.kualifikasiPendidikan) {
      toast.error('Harap lengkapi field yang wajib diisi');
      return;
    }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">{form.id ? 'Edit Rencana' : 'Tambah Rencana'} Kebutuhan SDM</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="overflow-y-auto px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Tahun *</label>
              <select value={form.tahun} onChange={e => set('tahun', +e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Target Headcount *</label>
              <input type="number" min={1} value={form.targetHeadcount}
                onChange={e => set('targetHeadcount', +e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Unit Kerja *</label>
            <input value={form.unitKerja} onChange={e => set('unitKerja', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="e.g. IGD, Instalasi Farmasi" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Jabatan *</label>
            <input value={form.jabatan} onChange={e => set('jabatan', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="e.g. Perawat Ahli Pertama" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Kualifikasi Pendidikan *</label>
            <input value={form.kualifikasiPendidikan} onChange={e => set('kualifikasiPendidikan', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="e.g. S1 Keperawatan + STR Aktif" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Prioritas</label>
              <select value={form.prioritas} onChange={e => set('prioritas', e.target.value as PrioritasRencana)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                {(['Mendesak', 'Normal', 'Rendah'] as PrioritasRencana[]).map(p =>
                  <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Status Rekrutmen</label>
              <select value={form.statusRekrutmen} onChange={e => set('statusRekrutmen', e.target.value as RencanaSDM['statusRekrutmen'])}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                {(['Belum Direkrut', 'Sedang Direkrut', 'Terpenuhi'] as RencanaSDM['statusRekrutmen'][]).map(s =>
                  <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Anggaran (opsional)</label>
            <input type="number" min={0} value={form.anggaran ?? ''}
              onChange={e => set('anggaran', e.target.value ? +e.target.value : undefined)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="e.g. 120000000" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Keterangan</label>
            <textarea value={form.keterangan ?? ''} onChange={e => set('keterangan', e.target.value)}
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              Batal
            </button>
            <button type="submit"
              className="flex-1 py-2 rounded-xl text-sm font-medium text-white transition-colors"
              style={{ background: C.brand }}>
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function PerencanaanSDM() {
  const { rencanaSDM, pegawai, rekrutmen, addRencanaSDM, updateRencanaSDM, deleteRencanaSDM } = useAppContext();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'rencana' | 'proyeksi'>('dashboard');
  const [modal, setModal] = useState<(Omit<RencanaSDM, 'id'> & { id?: string }) | null>(null);

  // filters – tab 1
  const [tahunDash, setTahunDash] = useState<number>(2026);

  // filters – tab 2
  const [tahunFilter, setTahunFilter] = useState<string>('');
  const [unitFilter, setUnitFilter] = useState<string>('');
  const [priFilter, setPriFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');

  const displayRencana: RencanaSDM[] = rencanaSDM.length > 0 ? rencanaSDM : SEED_RENCANA;

  // ── Tab 1 data ─────────────────────────────────────────────────────────────
  const dashData = useMemo(() => {
    const filtered = displayRencana.filter(r => r.tahun === tahunDash);

    const aktifByUnit = new Map<string, number>();
    pegawai.filter(p => p.statusAktif === 'Aktif').forEach(p => {
      aktifByUnit.set(p.unitKerja, (aktifByUnit.get(p.unitKerja) ?? 0) + 1);
    });

    // Aggregate per unit (sum targets across positions)
    const unitMap = new Map<string, { target: number }>();
    filtered.forEach(r => {
      const cur = unitMap.get(r.unitKerja);
      unitMap.set(r.unitKerja, { target: (cur?.target ?? 0) + r.targetHeadcount });
    });

    const chartData = Array.from(unitMap.entries()).map(([unit, d]) => {
      const aktual = aktifByUnit.get(unit) ?? 0;
      return {
        unit: unit.replace('Instalasi ', 'Ins. ').replace('ICU / ICCU / PICU', 'ICU/ICCU').replace('Instalasi Lab Patologi Klinik', 'Lab Patologi'),
        fullUnit: unit,
        target: d.target,
        aktual,
        gap: Math.max(0, d.target - aktual),
      };
    });

    const totalTarget = filtered.reduce((s, r) => s + r.targetHeadcount, 0);
    const totalBudget = filtered.reduce((s, r) => s + (r.anggaran ?? 0), 0);
    const mendesak = filtered.filter(r => r.prioritas === 'Mendesak').length;
    const belumTerpenuhi = filtered
      .filter(r => r.statusRekrutmen !== 'Terpenuhi')
      .reduce((s, r) => s + Math.max(0, r.targetHeadcount - (aktifByUnit.get(r.unitKerja) ?? 0)), 0);

    return { chartData, filtered, aktifByUnit, totalTarget, totalBudget, mendesak, belumTerpenuhi };
  }, [displayRencana, pegawai, tahunDash]);

  // ── Tab 2 data ─────────────────────────────────────────────────────────────
  const filteredRencana = useMemo(() => {
    return displayRencana.filter(r => {
      if (tahunFilter && r.tahun !== +tahunFilter) return false;
      if (unitFilter && r.unitKerja !== unitFilter) return false;
      if (priFilter && r.prioritas !== priFilter) return false;
      if (statusFilter && r.statusRekrutmen !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!r.jabatan.toLowerCase().includes(q) && !r.unitKerja.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [displayRencana, tahunFilter, unitFilter, priFilter, statusFilter, search]);

  const unitOptions = useMemo(() => [...new Set(displayRencana.map(r => r.unitKerja))].sort(), [displayRencana]);

  const priStats = useMemo(() => ({
    Mendesak: displayRencana.filter(r => r.prioritas === 'Mendesak').length,
    Normal:   displayRencana.filter(r => r.prioritas === 'Normal').length,
    Rendah:   displayRencana.filter(r => r.prioritas === 'Rendah').length,
    budget:   displayRencana.reduce((s, r) => s + (r.anggaran ?? 0), 0),
  }), [displayRencana]);

  // ── Tab 3 data ─────────────────────────────────────────────────────────────
  const pensiunData = useMemo(() => {
    const withDays = pegawai
      .filter(p => p.statusAktif === 'Aktif' && p.batasPensiun)
      .map(p => ({ ...p, daysLeft: Math.ceil((new Date(p.batasPensiun).getTime() - NOW_MS) / 86400000) }))
      .filter(p => p.daysLeft > 0 && p.daysLeft <= 1095)
      .sort((a, b) => a.daysLeft - b.daysLeft);

    return {
      within1yr: withDays.filter(p => p.daysLeft <= 365),
      within2yr: withDays.filter(p => p.daysLeft > 365 && p.daysLeft <= 730),
      within3yr: withDays.filter(p => p.daysLeft > 730),
    };
  }, [pegawai]);

  const understaffedUnits = useMemo(() => {
    const byUnit = new Map<string, number>();
    pegawai.filter(p => p.statusAktif === 'Aktif').forEach(p => {
      byUnit.set(p.unitKerja, (byUnit.get(p.unitKerja) ?? 0) + 1);
    });
    return Array.from(byUnit.entries())
      .filter(([, c]) => c < 5)
      .map(([u, c]) => ({ unit: u, count: c }))
      .sort((a, b) => a.count - b.count);
  }, [pegawai]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSave = (form: Omit<RencanaSDM, 'id'> & { id?: string }) => {
    if (form.id) {
      updateRencanaSDM(form as RencanaSDM);
      toast.success('Rencana berhasil diperbarui');
    } else {
      addRencanaSDM(form);
      toast.success('Rencana berhasil ditambahkan');
    }
    setModal(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Hapus rencana ini?')) return;
    deleteRencanaSDM(id);
    toast.success('Rencana dihapus');
  };

  const addToRencana = (p: { unitKerja: string; jabatan: string; batasPensiun: string }) => {
    setModal({ ...EMPTY, unitKerja: p.unitKerja, jabatan: p.jabatan, prioritas: 'Mendesak', tahun: new Date(p.batasPensiun).getFullYear() });
    setActiveTab('rencana');
  };

  const tabs = [
    { key: 'dashboard' as const, label: 'Dashboard Gap Analysis' },
    { key: 'rencana'   as const, label: 'Rencana Kebutuhan' },
    { key: 'proyeksi'  as const, label: 'Proyeksi Kebutuhan' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl p-2" style={{ background: C.bg }}>
            <Users size={22} style={{ color: C.brand }} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Perencanaan Kebutuhan SDM</h1>
            <p className="text-xs text-gray-500">Manajemen rencana, analisis gap, dan proyeksi kebutuhan tenaga kerja</p>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex gap-1 mt-4">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === t.key ? 'text-white' : 'text-gray-500 hover:bg-gray-100'}`}
              style={activeTab === t.key ? { background: C.brand } : {}}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-6">

        {/* ─── Tab 1: Dashboard ───────────────────────────────────────────── */}
        {activeTab === 'dashboard' && (
          <>
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-500 font-medium">Tahun:</label>
              <select value={tahunDash} onChange={e => setTahunDash(+e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard icon={Target} label="Total Posisi Direncanakan" value={dashData.totalTarget}
                sub={`${dashData.filtered.length} jenis jabatan`} />
              <KpiCard icon={AlertTriangle} label="Kebutuhan Belum Terpenuhi" value={dashData.belumTerpenuhi}
                color={C.danger} sub="posisi masih terbuka" />
              <KpiCard icon={Clock} label="Posisi Mendesak" value={dashData.mendesak}
                color="#ef4444" sub="prioritas tinggi" />
              <KpiCard icon={DollarSign} label="Budget Direncanakan" value={fmtBudget(dashData.totalBudget)}
                sub="total anggaran" />
            </div>

            {/* Bar chart */}
            {dashData.chartData.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="font-semibold text-gray-800 mb-4">Analisis Gap per Unit Kerja</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={dashData.chartData} margin={{ top: 5, right: 20, left: 0, bottom: 70 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="unit" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" interval={0} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(v: number, name: string) => [v, name === 'target' ? 'Target' : 'Aktual']}
                      labelFormatter={(l) => {
                        const d = dashData.chartData.find(c => c.unit === l);
                        return d?.fullUnit ?? l;
                      }}
                    />
                    <Bar dataKey="target" name="target" radius={[4, 4, 0, 0]}>
                      {dashData.chartData.map((_, i) => <Cell key={i} fill="#013E37" />)}
                    </Bar>
                    <Bar dataKey="aktual" name="aktual" radius={[4, 4, 0, 0]}>
                      {dashData.chartData.map((d, i) => <Cell key={i} fill={d.aktual < d.target ? '#ef4444' : '#22c55e'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-sm inline-block" style={{ background: '#013E37' }} /> Target
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-sm inline-block bg-green-500" /> Terpenuhi
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-sm inline-block bg-red-500" /> Kekurangan
                  </span>
                </div>
              </div>
            )}

            {/* Gap detail table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800">Detail Gap per Posisi — {tahunDash}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <tr>
                      {['Unit Kerja', 'Jabatan', 'Target', 'Aktual', 'Gap', 'Prioritas', 'Status Rekrutmen', 'Aksi'].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {dashData.filtered.map(r => {
                      const aktual = dashData.aktifByUnit.get(r.unitKerja) ?? 0;
                      const gap = Math.max(0, r.targetHeadcount - aktual);
                      return (
                        <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-medium text-gray-800">{r.unitKerja}</td>
                          <td className="px-4 py-3 text-gray-600">{r.jabatan}</td>
                          <td className="px-4 py-3 text-center">{r.targetHeadcount}</td>
                          <td className="px-4 py-3 text-center">{aktual}</td>
                          <td className="px-4 py-3 text-center">
                            {gap > 0
                              ? <span className="font-semibold text-red-600">-{gap}</span>
                              : <span className="text-green-600">&#10003;</span>}
                          </td>
                          <td className="px-4 py-3"><Badge label={r.prioritas} cls={PRIORITAS_CFG[r.prioritas]} /></td>
                          <td className="px-4 py-3"><Badge label={r.statusRekrutmen} cls={STATUS_REKRUTMEN_CFG[r.statusRekrutmen]} /></td>
                          <td className="px-4 py-3">
                            <button onClick={() => navigate('/rekrutmen')}
                              className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg text-white transition-colors"
                              style={{ background: C.brand }}>
                              Buat Formasi <ChevronRight size={12} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {dashData.filtered.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                          Tidak ada data untuk tahun {tahunDash}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ─── Tab 2: Rencana Kebutuhan ──────────────────────────────────── */}
        {activeTab === 'rencana' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Mendesak</p>
                <p className="text-2xl font-bold text-red-600">{priStats.Mendesak}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Normal</p>
                <p className="text-2xl font-bold text-blue-600">{priStats.Normal}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Rendah</p>
                <p className="text-2xl font-bold text-gray-500">{priStats.Rendah}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Total Anggaran</p>
                <p className="text-lg font-bold" style={{ color: C.brand }}>{fmtBudget(priStats.budget)}</p>
              </div>
            </div>

            {/* Filters + Add button */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex flex-wrap gap-3 items-end">
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Cari jabatan / unit..."
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-48" />
                <select value={tahunFilter} onChange={e => setTahunFilter(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                  <option value="">Semua Tahun</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
                <select value={unitFilter} onChange={e => setUnitFilter(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white max-w-xs">
                  <option value="">Semua Unit</option>
                  {unitOptions.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                <select value={priFilter} onChange={e => setPriFilter(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                  <option value="">Semua Prioritas</option>
                  <option value="Mendesak">Mendesak</option>
                  <option value="Normal">Normal</option>
                  <option value="Rendah">Rendah</option>
                </select>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                  <option value="">Semua Status</option>
                  <option value="Belum Direkrut">Belum Direkrut</option>
                  <option value="Sedang Direkrut">Sedang Direkrut</option>
                  <option value="Terpenuhi">Terpenuhi</option>
                </select>
                <div className="ml-auto">
                  <button onClick={() => setModal({ ...EMPTY })}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors"
                    style={{ background: C.brand }}>
                    <Plus size={16} /> Tambah Rencana
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <tr>
                      {['Unit Kerja', 'Jabatan', 'Kualifikasi', 'Target', 'Prioritas', 'Status', 'Anggaran', 'Aksi'].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredRencana.map(r => {
                      const linkedRekrutmen = r.rekrutmenId ? rekrutmen.find(rk => rk.id === r.rekrutmenId) : null;
                      return (
                        <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-medium text-gray-800">
                            {r.unitKerja}
                            <br />
                            <span className="text-xs text-gray-400 font-normal">{r.tahun}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {r.jabatan}
                            {linkedRekrutmen && (
                              <button onClick={() => navigate('/rekrutmen')}
                                className="ml-2 text-xs text-teal-600 hover:underline">
                                [{linkedRekrutmen.posisi}]
                              </button>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs max-w-[160px] truncate"
                            title={r.kualifikasiPendidikan}>{r.kualifikasiPendidikan}</td>
                          <td className="px-4 py-3 text-center font-semibold">{r.targetHeadcount}</td>
                          <td className="px-4 py-3"><Badge label={r.prioritas} cls={PRIORITAS_CFG[r.prioritas]} /></td>
                          <td className="px-4 py-3"><Badge label={r.statusRekrutmen} cls={STATUS_REKRUTMEN_CFG[r.statusRekrutmen]} /></td>
                          <td className="px-4 py-3 text-gray-600 text-xs">{r.anggaran ? fmtRp(r.anggaran) : '—'}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button onClick={() => setModal({ ...r })}
                                className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="Edit">
                                <Edit2 size={14} />
                              </button>
                              <button onClick={() => handleDelete(r.id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredRencana.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                          Tidak ada data yang sesuai filter
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ─── Tab 3: Proyeksi ───────────────────────────────────────────── */}
        {activeTab === 'proyeksi' && (
          <>
            {/* Retirement groups */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                  <TrendingUp size={18} style={{ color: C.brand }} />
                  Proyeksi Pensiun (3 Tahun ke Depan)
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Pegawai aktif yang mendekati batas pensiun — disarankan segera direncanakan penggantinya
                </p>
              </div>

              {(
                [
                  { label: 'Dalam 1 Tahun', data: pensiunData.within1yr, color: 'text-red-600', headerCls: 'bg-red-50 border-red-200 text-red-700' },
                  { label: '1–2 Tahun',     data: pensiunData.within2yr, color: 'text-orange-600', headerCls: 'bg-orange-50 border-orange-200 text-orange-700' },
                  { label: '2–3 Tahun',     data: pensiunData.within3yr, color: 'text-yellow-600', headerCls: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
                ] as const
              ).map(group => (
                <div key={group.label} className="border-b border-gray-100 last:border-0">
                  <div className={`px-5 py-2 border-b ${group.headerCls}`}>
                    <span className="text-sm font-semibold">{group.label} ({group.data.length} pegawai)</span>
                  </div>
                  {group.data.length === 0 ? (
                    <p className="px-5 py-4 text-sm text-gray-400">
                      Tidak ada pegawai yang pensiun dalam periode ini
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500">
                          <tr>
                            {['Nama', 'Unit Kerja', 'Jabatan', 'Batas Pensiun', 'Sisa Hari', 'Aksi'].map(h => (
                              <th key={h} className="px-4 py-2 text-left font-medium">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {group.data.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium text-gray-800">
                                {p.gelarDepan ? `${p.gelarDepan} ` : ''}{p.nama}{p.gelarBelakang ? `, ${p.gelarBelakang}` : ''}
                              </td>
                              <td className="px-4 py-3 text-gray-600">{p.unitKerja}</td>
                              <td className="px-4 py-3 text-gray-600">{p.jabatan}</td>
                              <td className="px-4 py-3 text-gray-600">
                                {new Date(p.batasPensiun).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`font-semibold ${group.color}`}>{p.daysLeft} hari</span>
                              </td>
                              <td className="px-4 py-3">
                                <button onClick={() => addToRencana(p)}
                                  className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg text-white transition-colors"
                                  style={{ background: C.brand }}>
                                  <Plus size={12} /> Tambah ke Rencana
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Understaffed units */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-orange-500" />
                  Unit Kerja Berisiko (Headcount &lt; 5)
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Unit dengan jumlah pegawai aktif kurang dari 5 orang — rentan terhadap gangguan operasional
                </p>
              </div>
              {understaffedUnits.length === 0 ? (
                <p className="px-5 py-8 text-center text-gray-400">Semua unit memiliki headcount yang memadai</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs text-gray-500">
                      <tr>
                        {['Unit Kerja', 'Headcount Aktif', 'Risiko', 'Aksi'].map(h => (
                          <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {understaffedUnits.map(({ unit, count }) => (
                        <tr key={unit} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-800">{unit}</td>
                          <td className="px-4 py-3">
                            <span className={`font-bold ${count < 3 ? 'text-red-600' : 'text-orange-500'}`}>{count}</span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              label={count < 3 ? 'Kritis' : 'Perhatian'}
                              cls={count < 3 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => {
                                setModal({ ...EMPTY, unitKerja: unit, prioritas: count < 3 ? 'Mendesak' : 'Normal' });
                                setActiveTab('rencana');
                              }}
                              className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                              <Plus size={12} /> Tambah Rencana
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modal && <RencanaModal init={modal} onSave={handleSave} onClose={() => setModal(null)} />}
    </div>
  );
}
