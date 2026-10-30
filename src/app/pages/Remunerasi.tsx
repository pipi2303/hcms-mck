import React, { useState, useMemo, useEffect } from 'react';
import { Coins, Plus, X, ChevronDown, Download, CheckCircle, Clock, CreditCard, Edit2, Sliders } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import type { RemunKonfigurasi, RemunPoinRecord, KategoriRemunerasi } from '../types';
import { toast } from 'sonner';

const fmt = (n: number) => new Intl.NumberFormat('id-ID').format(Math.round(n));
const rp = (n: number) => `Rp ${fmt(n)}`;

const KATEGORI_LIST: KategoriRemunerasi[] = ['Medis', 'Keperawatan', 'Penunjang', 'Manajemen', 'Lainnya'];

const KATEGORI_COLOR: Record<KategoriRemunerasi, string> = {
  Medis: 'bg-blue-100 text-blue-700',
  Keperawatan: 'bg-green-100 text-green-700',
  Penunjang: 'bg-orange-100 text-orange-700',
  Manajemen: 'bg-purple-100 text-purple-700',
  Lainnya: 'bg-gray-100 text-gray-600',
};

// Heuristic: map pegawai jabatan/unit to kategori
function guessKategori(jabatan: string, unit: string): KategoriRemunerasi {
  const j = (jabatan + ' ' + unit).toLowerCase();
  if (j.includes('dokter') || j.includes('medis') || j.includes('dokter')) return 'Medis';
  if (j.includes('perawat') || j.includes('bidan') || j.includes('keperawatan')) return 'Keperawatan';
  if (j.includes('farmasi') || j.includes('lab') || j.includes('radiologi') || j.includes('gizi') || j.includes('fisio') || j.includes('penunjang')) return 'Penunjang';
  if (j.includes('kepala') || j.includes('direktur') || j.includes('manajer') || j.includes('manager') || j.includes('kasubag') || j.includes('kabag')) return 'Manajemen';
  return 'Lainnya';
}

const SEED_CONFIG: Omit<RemunKonfigurasi, 'id'> = {
  namaPeriode: 'Maret 2026',
  periodeAwal: '2026-03-01',
  periodeAkhir: '2026-03-31',
  totalDanaKlaim: 850000000,
  persenJasaPelayanan: 44,
  persenManajemen: 10,
  persenMedis: 40,
  persenKeperawatan: 35,
  persenPenunjang: 15,
  status: 'Aktif',
};

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-600',
    Aktif: 'bg-blue-100 text-blue-700',
    Selesai: 'bg-green-100 text-green-700',
    Disetujui: 'bg-blue-100 text-blue-700',
    Dibayar: 'bg-green-100 text-green-700',
  };
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>{status}</span>;
}

// ─── Stats Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-bold text-gray-800 truncate">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Inline bar ──────────────────────────────────────────────────────────────
function DistBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-24 text-gray-500 truncate">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right text-gray-600">{pct}%</span>
    </div>
  );
}

// ─── Konfigurasi Form Modal ───────────────────────────────────────────────────
interface ConfigForm {
  namaPeriode: string;
  periodeAwal: string;
  periodeAkhir: string;
  totalDanaKlaim: string;
  persenJasaPelayanan: number;
  persenMedis: number;
  persenKeperawatan: number;
  persenPenunjang: number;
  persenManajemen: number;
  status: RemunKonfigurasi['status'];
}

const DEFAULT_FORM: ConfigForm = {
  namaPeriode: '',
  periodeAwal: '',
  periodeAkhir: '',
  totalDanaKlaim: '',
  persenJasaPelayanan: 44,
  persenMedis: 40,
  persenKeperawatan: 35,
  persenPenunjang: 15,
  persenManajemen: 10,
  status: 'Draft',
};

function ConfigModal({
  initial,
  onClose,
  onSave,
}: {
  initial?: RemunKonfigurasi;
  onClose: () => void;
  onSave: (data: Omit<RemunKonfigurasi, 'id'>) => void;
}) {
  const [form, setForm] = useState<ConfigForm>(
    initial
      ? {
          ...initial,
          totalDanaKlaim: String(initial.totalDanaKlaim),
        }
      : DEFAULT_FORM
  );

  const set = (k: keyof ConfigForm, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  const totalDana = Number(form.totalDanaKlaim.replace(/\D/g, '')) || 0;
  const danaJasa = totalDana * (form.persenJasaPelayanan / 100);
  const sumKategori = form.persenMedis + form.persenKeperawatan + form.persenPenunjang + form.persenManajemen;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sumKategori !== 100) { toast.error('Total distribusi kategori harus 100%'); return; }
    if (!form.namaPeriode || !form.periodeAwal || !form.periodeAkhir || !totalDana) {
      toast.error('Lengkapi semua field wajib'); return;
    }
    onSave({
      namaPeriode: form.namaPeriode,
      periodeAwal: form.periodeAwal,
      periodeAkhir: form.periodeAkhir,
      totalDanaKlaim: totalDana,
      persenJasaPelayanan: form.persenJasaPelayanan,
      persenMedis: form.persenMedis,
      persenKeperawatan: form.persenKeperawatan,
      persenPenunjang: form.persenPenunjang,
      persenManajemen: form.persenManajemen,
      status: form.status,
    });
  };

  const kategoriRows: { key: 'persenMedis' | 'persenKeperawatan' | 'persenPenunjang' | 'persenManajemen'; label: string }[] = [
    { key: 'persenMedis', label: 'Medis' },
    { key: 'persenKeperawatan', label: 'Keperawatan' },
    { key: 'persenPenunjang', label: 'Penunjang' },
    { key: 'persenManajemen', label: 'Manajemen' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">{initial ? 'Edit Periode' : 'Buat Periode Baru'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nama Periode *</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={form.namaPeriode} onChange={e => set('namaPeriode', e.target.value)} placeholder="e.g. April 2026" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Periode Awal *</label>
              <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={form.periodeAwal} onChange={e => set('periodeAwal', e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Periode Akhir *</label>
              <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={form.periodeAkhir} onChange={e => set('periodeAkhir', e.target.value)} required />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Total Dana Klaim (Rp) *</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={form.totalDanaKlaim}
              onChange={e => set('totalDanaKlaim', e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="850000000" required />
            {totalDana > 0 && <p className="text-xs text-gray-400 mt-0.5">{rp(totalDana)}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">% Jasa Pelayanan: <span className="font-bold text-blue-600">{form.persenJasaPelayanan}%</span></label>
            <input type="range" min={0} max={100} className="w-full"
              value={form.persenJasaPelayanan} onChange={e => set('persenJasaPelayanan', Number(e.target.value))} />
            {totalDana > 0 && <p className="text-xs text-blue-500 mt-0.5">Dana Jasa Pelayanan: {rp(danaJasa)}</p>}
          </div>
          <div className="border border-gray-100 rounded-xl p-3 space-y-2 bg-gray-50">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-gray-700">Distribusi Jasa Pelayanan</p>
              <span className={`text-xs font-bold ${sumKategori === 100 ? 'text-green-600' : 'text-red-500'}`}>Total: {sumKategori}%</span>
            </div>
            {kategoriRows.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2">
                <span className="w-24 text-xs text-gray-600">{label}</span>
                <input type="number" min={0} max={100}
                  className="w-16 border border-gray-200 rounded px-2 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-300"
                  value={form[key]} onChange={e => set(key, Number(e.target.value))} />
                <span className="text-xs text-gray-400">%</span>
                {totalDana > 0 && (
                  <span className="text-xs text-gray-500 ml-auto">{rp(danaJasa * (form[key] / 100))}</span>
                )}
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={form.status} onChange={e => set('status', e.target.value as RemunKonfigurasi['status'])}>
              {['Draft', 'Aktif', 'Selesai'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 text-sm py-2 rounded-xl hover:bg-gray-50">Batal</button>
            <button type="submit" className="flex-1 bg-blue-600 text-white text-sm py-2 rounded-xl hover:bg-blue-700">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Poin Edit Modal ──────────────────────────────────────────────────────────
function PoinModal({
  record,
  pegawaiNama,
  danKategori,
  totalPoinKategori,
  onClose,
  onSave,
}: {
  record: RemunPoinRecord;
  pegawaiNama: string;
  danKategori: number;
  totalPoinKategori: number;
  onClose: () => void;
  onSave: (r: RemunPoinRecord) => void;
}) {
  const [poin, setPoin] = useState({
    poinKehadiran: record.poinKehadiran,
    poinShift: record.poinShift,
    poinJabatan: record.poinJabatan,
    poinKinerja: record.poinKinerja,
  });
  const [kategori, setKategori] = useState<KategoriRemunerasi>(record.kategori);

  const totalPoin = poin.poinKehadiran + poin.poinShift + poin.poinJabatan + poin.poinKinerja;
  const newTotalKategori = totalPoinKategori - record.totalPoin + totalPoin;
  const jasaPelayanan = newTotalKategori > 0 ? (totalPoin / newTotalKategori) * danKategori : 0;

  const handleSave = () => {
    onSave({ ...record, ...poin, kategori, totalPoin, jasaPelayanan });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-800">Edit Poin</h2>
            <p className="text-xs text-gray-400">{pegawaiNama}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Kategori</label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={kategori} onChange={e => setKategori(e.target.value as KategoriRemunerasi)}>
              {KATEGORI_LIST.map(k => <option key={k}>{k}</option>)}
            </select>
          </div>
          {(['poinKehadiran', 'poinShift', 'poinJabatan', 'poinKinerja'] as const).map(key => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {key === 'poinKehadiran' ? 'Poin Kehadiran' : key === 'poinShift' ? 'Poin Shift' : key === 'poinJabatan' ? 'Poin Jabatan' : 'Poin Kinerja'}
              </label>
              <input type="number" min={0}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={poin[key]} onChange={e => setPoin(p => ({ ...p, [key]: Number(e.target.value) }))} />
            </div>
          ))}
          <div className="bg-blue-50 rounded-xl p-3 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-gray-600">Total Poin</span><span className="font-bold text-gray-800">{totalPoin}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Estimasi Jasa Pelayanan</span><span className="font-bold text-blue-700">{rp(jasaPelayanan)}</span></div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 text-sm py-2 rounded-xl hover:bg-gray-50">Batal</button>
            <button onClick={handleSave} className="flex-1 bg-blue-600 text-white text-sm py-2 rounded-xl hover:bg-blue-700">Simpan</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Remunerasi() {
  const {
    remunKonfigurasi, remunPoin, pegawai,
    addRemunKonfigurasi, updateRemunKonfigurasi, deleteRemunKonfigurasi,
    addRemunPoin, updateRemunPoin, deleteRemunPoin,
  } = useAppContext();

  const [tab, setTab] = useState<'config' | 'distribusi'>('config');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editConfig, setEditConfig] = useState<RemunKonfigurasi | undefined>();
  const [filterKonfigId, setFilterKonfigId] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [editPoinRecord, setEditPoinRecord] = useState<RemunPoinRecord | null>(null);
  const [seeded, setSeeded] = useState(false);

  // ─── Seed data ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (seeded) return;
    setSeeded(true);
    if (remunKonfigurasi.length === 0) {
      addRemunKonfigurasi(SEED_CONFIG);
    }
  }, []); // ponytail: runs once on mount, seed check is synchronous

  // After seed config exists, seed poin if empty
  useEffect(() => {
    if (remunPoin.length > 0 || remunKonfigurasi.length === 0) return;
    const cfg = remunKonfigurasi[0];
    const aktif = pegawai.filter(p => p.statusAktif === 'Aktif').slice(0, 6);
    const seedPoinValues = [
      { poinKehadiran: 22, poinShift: 8, poinJabatan: 15, poinKinerja: 10 },
      { poinKehadiran: 20, poinShift: 10, poinJabatan: 12, poinKinerja: 9 },
      { poinKehadiran: 21, poinShift: 6, poinJabatan: 10, poinKinerja: 8 },
      { poinKehadiran: 18, poinShift: 12, poinJabatan: 8, poinKinerja: 7 },
      { poinKehadiran: 23, poinShift: 4, poinJabatan: 6, poinKinerja: 9 },
      { poinKehadiran: 19, poinShift: 9, poinJabatan: 11, poinKinerja: 6 },
    ];
    aktif.forEach((p, i) => {
      const sp = seedPoinValues[i] ?? seedPoinValues[0];
      const kategori = guessKategori(p.jabatan, p.unitKerja);
      const totalPoin = sp.poinKehadiran + sp.poinShift + sp.poinJabatan + sp.poinKinerja;
      addRemunPoin({
        konfigurasiId: cfg.id,
        pegawaiId: p.id,
        kategori,
        ...sp,
        totalPoin,
        jasaPelayanan: 0, // will be recalculated below
        status: 'Draft',
      });
    });
  }, [remunKonfigurasi]);

  // ─── Helpers ─────────────────────────────────────────────────────────────
  const getPegawai = (id: string) => pegawai.find(p => p.id === id);
  const getNama = (id: string) => {
    const p = getPegawai(id);
    if (!p) return '—';
    return `${p.gelarDepan ? p.gelarDepan + ' ' : ''}${p.nama}${p.gelarBelakang ? ', ' + p.gelarBelakang : ''}`;
  };

  // Calculate jasa pelayanan per record given a config
  const calcJasa = (record: RemunPoinRecord, cfg: RemunKonfigurasi, allPoin: RemunPoinRecord[]) => {
    const danaJasa = cfg.totalDanaKlaim * (cfg.persenJasaPelayanan / 100);
    const persenKat: Record<KategoriRemunerasi, number> = {
      Medis: cfg.persenMedis,
      Keperawatan: cfg.persenKeperawatan,
      Penunjang: cfg.persenPenunjang,
      Manajemen: cfg.persenManajemen,
      Lainnya: 0,
    };
    const danKategori = danaJasa * ((persenKat[record.kategori] ?? 0) / 100);
    const totalPoinKat = allPoin.filter(r => r.konfigurasiId === cfg.id && r.kategori === record.kategori).reduce((s, r) => s + r.totalPoin, 0);
    return totalPoinKat > 0 ? (record.totalPoin / totalPoinKat) * danKategori : 0;
  };

  // Enrich remunPoin with live jasaPelayanan
  const enrichedPoin = useMemo(() => remunPoin.map(r => {
    const cfg = remunKonfigurasi.find(c => c.id === r.konfigurasiId);
    if (!cfg) return r;
    return { ...r, jasaPelayanan: calcJasa(r, cfg, remunPoin) };
  }), [remunPoin, remunKonfigurasi]);

  // ─── Tab 1: stats ─────────────────────────────────────────────────────────
  const activeConfig = remunKonfigurasi.find(c => c.status === 'Aktif');
  const activePoin = enrichedPoin.filter(r => r.konfigurasiId === activeConfig?.id);
  const totalDanaAktif = activeConfig?.totalDanaKlaim ?? 0;
  const danaJasaAktif = activeConfig ? totalDanaAktif * (activeConfig.persenJasaPelayanan / 100) : 0;
  const sudahDibayar = activePoin.filter(r => r.status === 'Dibayar').reduce((s, r) => s + r.jasaPelayanan, 0);
  const sisaDana = danaJasaAktif - sudahDibayar;

  // ─── Generate poin ───────────────────────────────────────────────────────
  const handleGeneratePoin = (cfg: RemunKonfigurasi) => {
    const existingIds = new Set(remunPoin.filter(r => r.konfigurasiId === cfg.id).map(r => r.pegawaiId));
    const toAdd = pegawai.filter(p => p.statusAktif === 'Aktif' && !existingIds.has(p.id));
    if (toAdd.length === 0) { toast.info('Semua pegawai aktif sudah memiliki data poin untuk periode ini'); return; }
    toAdd.forEach(p => {
      const kategori = guessKategori(p.jabatan, p.unitKerja);
      addRemunPoin({
        konfigurasiId: cfg.id,
        pegawaiId: p.id,
        kategori,
        poinKehadiran: 0,
        poinShift: 0,
        poinJabatan: 0,
        poinKinerja: 0,
        totalPoin: 0,
        jasaPelayanan: 0,
        status: 'Draft',
      });
    });
    toast.success(`${toAdd.length} record poin berhasil dibuat untuk ${cfg.namaPeriode}`);
  };

  // ─── Tab 2: filtered rows ─────────────────────────────────────────────────
  const selectedConfig = remunKonfigurasi.find(c => c.id === filterKonfigId) ?? remunKonfigurasi[0];

  const filteredPoin = useMemo(() => enrichedPoin.filter(r => {
    const inCfg = selectedConfig ? r.konfigurasiId === selectedConfig.id : true;
    const inKat = !filterKategori || r.kategori === filterKategori;
    return inCfg && inKat;
  }), [enrichedPoin, selectedConfig, filterKategori]);

  const tab2Stats = useMemo(() => {
    const poinCfg = enrichedPoin.filter(r => r.konfigurasiId === selectedConfig?.id);
    return {
      totalPoin: poinCfg.reduce((s, r) => s + r.totalPoin, 0),
      totalJasa: poinCfg.reduce((s, r) => s + r.jasaPelayanan, 0),
      dibayar: poinCfg.filter(r => r.status === 'Dibayar').reduce((s, r) => s + r.jasaPelayanan, 0),
      belumDibayar: poinCfg.filter(r => r.status !== 'Dibayar').reduce((s, r) => s + r.jasaPelayanan, 0),
    };
  }, [enrichedPoin, selectedConfig]);

  // ─── Export CSV ───────────────────────────────────────────────────────────
  const handleExport = () => {
    const header = 'Nama,Jabatan,Kategori,Poin Hadir,Poin Shift,Poin Jabatan,Poin Kinerja,Total Poin,Jasa Pelayanan,Status';
    const rows = filteredPoin.map(r => {
      const p = getPegawai(r.pegawaiId);
      return [getNama(r.pegawaiId), p?.jabatan ?? '', r.kategori, r.poinKehadiran, r.poinShift, r.poinJabatan, r.poinKinerja, r.totalPoin, Math.round(r.jasaPelayanan), r.status].join(',');
    });
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `remunerasi_${selectedConfig?.namaPeriode ?? 'export'}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  // ─── getDanKategori helper for PoinModal ─────────────────────────────────
  const getDanKategori = (record: RemunPoinRecord) => {
    const cfg = remunKonfigurasi.find(c => c.id === record.konfigurasiId);
    if (!cfg) return 0;
    const danaJasa = cfg.totalDanaKlaim * (cfg.persenJasaPelayanan / 100);
    const persenKat: Record<KategoriRemunerasi, number> = {
      Medis: cfg.persenMedis, Keperawatan: cfg.persenKeperawatan,
      Penunjang: cfg.persenPenunjang, Manajemen: cfg.persenManajemen, Lainnya: 0,
    };
    return danaJasa * ((persenKat[record.kategori] ?? 0) / 100);
  };

  const getTotalPoinKategori = (record: RemunPoinRecord) =>
    remunPoin.filter(r => r.konfigurasiId === record.konfigurasiId && r.kategori === record.kategori).reduce((s, r) => s + r.totalPoin, 0);

  // ─── Config save ─────────────────────────────────────────────────────────
  const handleSaveConfig = (data: Omit<RemunKonfigurasi, 'id'>) => {
    if (editConfig) {
      updateRemunKonfigurasi({ ...editConfig, ...data });
      toast.success('Periode diperbarui');
    } else {
      addRemunKonfigurasi(data);
      toast.success('Periode baru dibuat');
    }
    setShowConfigModal(false);
    setEditConfig(undefined);
  };

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
            <Coins size={20} className="text-yellow-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Remunerasi & Jasa Medis</h1>
            <p className="text-xs text-gray-400">Pengelolaan jasa pelayanan dan distribusi poin pegawai</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {([['config', 'Konfigurasi Periode'], ['distribusi', 'Distribusi & Poin Pegawai']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === key ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── TAB 1 ── */}
      {tab === 'config' && (
        <div className="space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Total Dana Klaim (Aktif)" value={rp(totalDanaAktif)} sub={activeConfig?.namaPeriode} />
            <StatCard label="Dana Jasa Pelayanan" value={rp(danaJasaAktif)} sub={activeConfig ? `${activeConfig.persenJasaPelayanan}% dari total` : undefined} />
            <StatCard label="Sudah Didistribusikan" value={rp(sudahDibayar)} />
            <StatCard label="Sisa Dana" value={rp(sisaDana)} />
          </div>

          {/* Config list */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-700">Daftar Periode</h2>
              <button onClick={() => { setEditConfig(undefined); setShowConfigModal(true); }}
                className="flex items-center gap-1.5 bg-blue-600 text-white text-sm px-3 py-2 rounded-xl hover:bg-blue-700">
                <Plus size={16} /> Buat Periode
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {remunKonfigurasi.length === 0 && (
                <p className="p-6 text-center text-sm text-gray-400">Belum ada periode. Klik "Buat Periode" untuk mulai.</p>
              )}
              {remunKonfigurasi.map(cfg => {
                const danaJasa = cfg.totalDanaKlaim * (cfg.persenJasaPelayanan / 100);
                return (
                  <div key={cfg.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-800">{cfg.namaPeriode}</span>
                          <StatusBadge status={cfg.status} />
                        </div>
                        <p className="text-xs text-gray-400 mb-2">{cfg.periodeAwal} s/d {cfg.periodeAkhir}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 mb-3">
                          <span>Total Dana: <strong>{rp(cfg.totalDanaKlaim)}</strong></span>
                          <span>Jasa Pelayanan: <strong>{rp(danaJasa)}</strong> ({cfg.persenJasaPelayanan}%)</span>
                        </div>
                        <div className="space-y-1 max-w-xs">
                          <DistBar label="Medis" pct={cfg.persenMedis} color="bg-blue-400" />
                          <DistBar label="Keperawatan" pct={cfg.persenKeperawatan} color="bg-green-400" />
                          <DistBar label="Penunjang" pct={cfg.persenPenunjang} color="bg-orange-400" />
                          <DistBar label="Manajemen" pct={cfg.persenManajemen} color="bg-purple-400" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <button onClick={() => { setEditConfig(cfg); setShowConfigModal(true); }}
                          className="flex items-center gap-1.5 text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-gray-600">
                          <Edit2 size={13} /> Edit
                        </button>
                        <button onClick={() => handleGeneratePoin(cfg)}
                          className="flex items-center gap-1.5 text-xs bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-100">
                          <Sliders size={13} /> Generate Poin
                        </button>
                        <button onClick={() => { if (confirm('Hapus periode ini?')) { deleteRemunKonfigurasi(cfg.id); toast.success('Periode dihapus'); } }}
                          className="flex items-center gap-1.5 text-xs bg-red-50 border border-red-200 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100">
                          <X size={13} /> Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Formula info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-800 space-y-1">
            <p className="font-semibold mb-1">Rumus Perhitungan Jasa Pelayanan:</p>
            <p className="font-mono bg-white/60 rounded p-2">jasaPelayanan = (totalPoin / totalPoinKategori) × danKategori</p>
            <p>di mana: <span className="font-mono">danKategori = totalDanaKlaim × (persenJasaPelayanan/100) × (persenKategori/100)</span></p>
          </div>
        </div>
      )}

      {/* ── TAB 2 ── */}
      {tab === 'distribusi' && (
        <div className="space-y-5">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
              value={filterKonfigId} onChange={e => setFilterKonfigId(e.target.value)}>
              {remunKonfigurasi.map(c => <option key={c.id} value={c.id}>{c.namaPeriode}</option>)}
            </select>
            <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
              value={filterKategori} onChange={e => setFilterKategori(e.target.value)}>
              <option value="">Semua Kategori</option>
              {KATEGORI_LIST.map(k => <option key={k}>{k}</option>)}
            </select>
            <button onClick={handleExport}
              className="ml-auto flex items-center gap-1.5 border border-gray-200 text-gray-600 text-sm px-3 py-2 rounded-xl hover:bg-gray-50">
              <Download size={15} /> Export CSV
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Total Poin" value={String(tab2Stats.totalPoin)} sub={selectedConfig?.namaPeriode} />
            <StatCard label="Total Jasa Pelayanan" value={rp(tab2Stats.totalJasa)} />
            <StatCard label="Sudah Dibayar" value={rp(tab2Stats.dibayar)} />
            <StatCard label="Belum Dibayar" value={rp(tab2Stats.belumDibayar)} />
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Pegawai</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Kategori</th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500">Hadir</th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500">Shift</th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500">Jabatan</th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500">Kinerja</th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500">Total</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Jasa Pelayanan</th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500">Status</th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredPoin.length === 0 && (
                    <tr><td colSpan={10} className="text-center py-8 text-sm text-gray-400">Tidak ada data. Generate poin dari tab Konfigurasi Periode.</td></tr>
                  )}
                  {filteredPoin.map(r => {
                    const p = getPegawai(r.pegawaiId);
                    return (
                      <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800 text-xs">{getNama(r.pegawaiId)}</p>
                          <p className="text-xs text-gray-400">{p?.jabatan ?? '—'}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${KATEGORI_COLOR[r.kategori]}`}>{r.kategori}</span>
                        </td>
                        <td className="text-center px-3 py-3 text-gray-700">{r.poinKehadiran}</td>
                        <td className="text-center px-3 py-3 text-gray-700">{r.poinShift}</td>
                        <td className="text-center px-3 py-3 text-gray-700">{r.poinJabatan}</td>
                        <td className="text-center px-3 py-3 text-gray-700">{r.poinKinerja}</td>
                        <td className="text-center px-3 py-3 font-bold text-gray-800">{r.totalPoin}</td>
                        <td className="text-right px-4 py-3 font-semibold text-blue-700">{rp(r.jasaPelayanan)}</td>
                        <td className="text-center px-3 py-3"><StatusBadge status={r.status} /></td>
                        <td className="text-center px-3 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => setEditPoinRecord(r)}
                              className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600" title="Edit Poin">
                              <Edit2 size={13} />
                            </button>
                            {r.status === 'Draft' && (
                              <button onClick={() => { updateRemunPoin({ ...r, status: 'Disetujui' }); toast.success('Disetujui'); }}
                                className="p-1.5 hover:bg-green-50 rounded-lg text-green-600" title="Setujui">
                                <CheckCircle size={13} />
                              </button>
                            )}
                            {r.status === 'Disetujui' && (
                              <button onClick={() => { updateRemunPoin({ ...r, status: 'Dibayar' }); toast.success('Ditandai Dibayar'); }}
                                className="p-1.5 hover:bg-green-50 rounded-lg text-green-600" title="Tandai Dibayar">
                                <CreditCard size={13} />
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

          {/* Formula reminder */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-500">
            <span className="font-semibold">Rumus: </span>
            <span className="font-mono">jasaPelayanan = (totalPoin / totalPoinKategori) × (totalDanaKlaim × persenJasaPelayanan% × persenKategori%)</span>
          </div>
        </div>
      )}

      {/* Modals */}
      {showConfigModal && (
        <ConfigModal
          initial={editConfig}
          onClose={() => { setShowConfigModal(false); setEditConfig(undefined); }}
          onSave={handleSaveConfig}
        />
      )}

      {editPoinRecord && (
        <PoinModal
          record={editPoinRecord}
          pegawaiNama={getNama(editPoinRecord.pegawaiId)}
          danKategori={getDanKategori(editPoinRecord)}
          totalPoinKategori={getTotalPoinKategori(editPoinRecord)}
          onClose={() => setEditPoinRecord(null)}
          onSave={r => { updateRemunPoin(r); toast.success('Poin diperbarui'); }}
        />
      )}
    </div>
  );
}
