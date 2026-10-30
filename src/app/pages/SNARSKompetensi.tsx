import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldCheck, Plus, X, Edit2, Trash2, AlertTriangle, Search,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import type { KompetensiWajib, KompetensiPegawai, KategoriKompetensiWajib } from '../types';
import { toast } from 'sonner';

// ─── constants ────────────────────────────────────────────────────────────────

const TODAY = new Date('2026-10-28');

const KATEGORI_CONFIG: Record<KategoriKompetensiWajib, { label: string; bg: string; text: string }> = {
  BHD:     { label: 'BHD',     bg: 'bg-red-100',    text: 'text-red-700' },
  PPI:     { label: 'PPI',     bg: 'bg-blue-100',   text: 'text-blue-700' },
  KPRS:    { label: 'KPRS',    bg: 'bg-orange-100', text: 'text-orange-700' },
  K3:      { label: 'K3',      bg: 'bg-yellow-100', text: 'text-yellow-700' },
  Mutu:    { label: 'Mutu',    bg: 'bg-purple-100', text: 'text-purple-700' },
  Lainnya: { label: 'Lainnya', bg: 'bg-gray-100',   text: 'text-gray-600' },
};

const STATUS_CONFIG = {
  Valid:          { bg: 'bg-green-100',  text: 'text-green-700',  label: '✓', long: 'Valid' },
  'Akan Expired': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '⚠', long: 'Akan Expired' },
  Expired:        { bg: 'bg-red-100',    text: 'text-red-700',    label: '✗', long: 'Expired' },
  Belum:          { bg: 'bg-gray-100',   text: 'text-gray-500',   label: '−', long: 'Belum' },
};

const SEED_WAJIB: Omit<KompetensiWajib, 'id'>[] = [
  { namaKompetensi: 'BHD Dasar (Basic Life Support)',       kategori: 'BHD',  berlakuUntuk: 'Semua', periodeValidasiBulan: 24, isWajib: true },
  { namaKompetensi: 'Penggunaan APAR',                       kategori: 'K3',   berlakuUntuk: 'Semua', periodeValidasiBulan: 24, isWajib: true },
  { namaKompetensi: 'Kewaspadaan Standar PPI',               kategori: 'PPI',  berlakuUntuk: 'Semua', periodeValidasiBulan: 24, isWajib: true },
  { namaKompetensi: 'Identifikasi Pasien & KPRS',            kategori: 'KPRS', berlakuUntuk: 'Semua', periodeValidasiBulan: 12, isWajib: true },
  { namaKompetensi: 'Pelaporan Insiden Keselamatan Pasien',  kategori: 'KPRS', berlakuUntuk: 'Semua', periodeValidasiBulan: 24, isWajib: true },
  { namaKompetensi: 'Hand Hygiene & 5 Momen Cuci Tangan',   kategori: 'PPI',  berlakuUntuk: 'Semua', periodeValidasiBulan: 12, isWajib: true },
  { namaKompetensi: 'Penggunaan APD yang Benar',             kategori: 'PPI',  berlakuUntuk: 'Semua', periodeValidasiBulan: 24, isWajib: true },
  { namaKompetensi: 'Indikator Mutu Klinis Dasar',           kategori: 'Mutu', berlakuUntuk: 'Semua', periodeValidasiBulan: 24, isWajib: false },
  { namaKompetensi: 'BHD Lanjut (ACLS/BTCLS)',               kategori: 'BHD',  berlakuUntuk: 'IGD',   periodeValidasiBulan: 24, isWajib: true },
  { namaKompetensi: 'Triase Pasien',                          kategori: 'KPRS', berlakuUntuk: 'IGD',   periodeValidasiBulan: 12, isWajib: true },
];

// Seed KompetensiPegawai: first 8 pegawai × first 8 kompetensi, varied statuses
// Dates relative to TODAY (2026-10-28):
//   Valid        : sertifikasi 2025-04-01, expired 2027-04-01 (>90 days)
//   Akan Expired : sertifikasi 2024-10-01, expired 2026-11-15 (~18 days)
//   Expired      : sertifikasi 2023-01-01, expired 2025-01-01 (past)
const SEED_STATUS_PATTERN: ('Valid' | 'Akan Expired' | 'Expired' | 'Belum')[][] = [
  // kompetensi index 0-7 for each of 8 pegawai
  ['Valid','Valid','Valid','Valid','Valid','Akan Expired','Valid','Belum'],
  ['Valid','Valid','Valid','Akan Expired','Valid','Valid','Valid','Valid'],
  ['Expired','Valid','Valid','Valid','Valid','Valid','Belum','Valid'],
  ['Valid','Akan Expired','Valid','Valid','Valid','Valid','Valid','Valid'],
  ['Valid','Valid','Expired','Valid','Valid','Valid','Valid','Akan Expired'],
  ['Valid','Valid','Valid','Valid','Akan Expired','Valid','Expired','Valid'],
  ['Valid','Valid','Valid','Valid','Valid','Valid','Valid','Valid'],
  ['Akan Expired','Valid','Valid','Valid','Valid','Expired','Valid','Valid'],
];

const SEED_DATES: Record<string, { sertifikasi: string; expired: string }> = {
  Valid:          { sertifikasi: '2025-04-01', expired: '2027-04-01' },
  'Akan Expired': { sertifikasi: '2024-10-01', expired: '2026-11-15' },
  Expired:        { sertifikasi: '2023-01-01', expired: '2025-01-01' },
};

// ─── helpers ──────────────────────────────────────────────────────────────────

function computeStatus(expired: string): KompetensiPegawai['status'] {
  const exp = new Date(expired);
  const diffDays = Math.ceil((exp.getTime() - TODAY.getTime()) / 86400000);
  if (diffDays < 0) return 'Expired';
  if (diffDays <= 90) return 'Akan Expired';
  return 'Valid';
}

function daysRemaining(expired: string) {
  return Math.ceil((new Date(expired).getTime() - TODAY.getTime()) / 86400000);
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function compliancePct(count: number, total: number) {
  if (!total) return 0;
  return Math.round((count / total) * 100);
}

function pctColor(pct: number) {
  if (pct >= 80) return 'text-green-600';
  if (pct >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

function pctBarColor(pct: number) {
  if (pct >= 80) return 'bg-green-500';
  if (pct >= 60) return 'bg-yellow-400';
  return 'bg-red-500';
}

// ─── empty forms ──────────────────────────────────────────────────────────────

const EMPTY_KW: Omit<KompetensiWajib, 'id'> = {
  namaKompetensi: '', kategori: 'BHD', berlakuUntuk: 'Semua', periodeValidasiBulan: 24, isWajib: true, keterangan: '',
};

const EMPTY_KP: Omit<KompetensiPegawai, 'id'> = {
  pegawaiId: '', kompetensiId: '', tanggalSertifikasi: '', tanggalExpired: '',
  nomorSertifikat: '', penyelenggara: '', status: 'Valid',
};

// ─── component ────────────────────────────────────────────────────────────────

type TabType = 'dashboard' | 'matriks' | 'kelola';

export default function SNARSKompetensi() {
  const {
    kompetensiWajib, kompetensiPegawai, pegawai,
    addKompetensiWajib, updateKompetensiWajib, deleteKompetensiWajib,
    addKompetensiPegawai, updateKompetensiPegawai, deleteKompetensiPegawai,
  } = useAppContext();

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // ── seed on first load ──
  const seeded = React.useRef(false);
  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    if (kompetensiWajib.length === 0) {
      SEED_WAJIB.forEach(k => addKompetensiWajib(k));
    }
  }, []); // ponytail: seeds fire once; if context resets this reruns harmlessly

  // After wajib seeds land we need their IDs, but the seed is async via dispatch.
  // We piggyback on the already-seeded kompetensiWajib list once it's populated.
  const kwRef = React.useRef<KompetensiWajib[]>([]);
  useEffect(() => {
    if (kompetensiPegawai.length > 0) return; // already have data
    if (kompetensiWajib.length < 8) return;   // seeds not landed yet
    if (pegawai.length === 0) return;
    if (kwRef.current.length > 0) return;     // already seeded kp
    kwRef.current = kompetensiWajib;

    const first8peg = pegawai.slice(0, 8);
    const first8kw  = kompetensiWajib.slice(0, 8);
    first8peg.forEach((p, pi) => {
      first8kw.forEach((kw, ki) => {
        const st = SEED_STATUS_PATTERN[pi]?.[ki] ?? 'Valid';
        if (st === 'Belum') return;
        const dates = SEED_DATES[st];
        addKompetensiPegawai({
          pegawaiId: p.id,
          kompetensiId: kw.id,
          tanggalSertifikasi: dates.sertifikasi,
          tanggalExpired: dates.expired,
          nomorSertifikat: `SERT/${p.id.slice(-3)}/${ki + 1}/2025`,
          penyelenggara: 'RSUD Intramedika',
          status: st,
        });
      });
    });
  }, [kompetensiWajib, pegawai, kompetensiPegawai]);

  // ── derived ──
  const kwById = useMemo(() => Object.fromEntries(kompetensiWajib.map(k => [k.id, k])), [kompetensiWajib]);
  const pegById = useMemo(() => Object.fromEntries(pegawai.map(p => [p.id, p])), [pegawai]);

  // map pegawaiId → kompetensiId → record
  const kpMap = useMemo(() => {
    const m: Record<string, Record<string, KompetensiPegawai>> = {};
    kompetensiPegawai.forEach(kp => {
      if (!m[kp.pegawaiId]) m[kp.pegawaiId] = {};
      m[kp.pegawaiId][kp.kompetensiId] = kp;
    });
    return m;
  }, [kompetensiPegawai]);

  const getFullName = (id: string) => {
    const p = pegById[id];
    if (!p) return '—';
    return `${p.gelarDepan ? p.gelarDepan + ' ' : ''}${p.nama}`;
  };

  // ────────────────────────────────────────────────────────────────────────────
  // TAB 1: Dashboard Compliance
  // ────────────────────────────────────────────────────────────────────────────

  // which kompetensi apply to a pegawai
  const applicableKw = (pegId: string) => {
    const unit = pegById[pegId]?.unitKerja ?? '';
    return kompetensiWajib.filter(kw => kw.berlakuUntuk === 'Semua' || kw.berlakuUntuk === unit);
  };

  const overallCompliance = useMemo(() => {
    if (!pegawai.length || !kompetensiWajib.length) return 0;
    const fullCompliant = pegawai.filter(p => {
      const applicable = applicableKw(p.id);
      return applicable.every(kw => kpMap[p.id]?.[kw.id]?.status === 'Valid');
    });
    return compliancePct(fullCompliant.length, pegawai.length);
  }, [pegawai, kompetensiWajib, kpMap]);

  const kategoriStats = useMemo(() => {
    const kategoriList: KategoriKompetensiWajib[] = ['BHD', 'PPI', 'KPRS', 'K3', 'Mutu'];
    return kategoriList.map(kat => {
      const kws = kompetensiWajib.filter(kw => kw.kategori === kat);
      let valid = 0, expired = 0, akanExpired = 0, total = 0;
      pegawai.forEach(p => {
        const applicable = kws.filter(kw => kw.berlakuUntuk === 'Semua' || kw.berlakuUntuk === (pegById[p.id]?.unitKerja ?? ''));
        applicable.forEach(kw => {
          total++;
          const st = kpMap[p.id]?.[kw.id]?.status ?? 'Belum';
          if (st === 'Valid') valid++;
          else if (st === 'Expired') expired++;
          else if (st === 'Akan Expired') akanExpired++;
        });
      });
      return { kat, pct: compliancePct(valid, total), expired, akanExpired, total };
    });
  }, [kompetensiWajib, pegawai, kpMap, pegById]);

  const alerts = useMemo(() => {
    return kompetensiPegawai
      .filter(kp => kp.status === 'Expired' || kp.status === 'Akan Expired')
      .map(kp => ({
        kp,
        pegNama: getFullName(kp.pegawaiId),
        kwNama: kwById[kp.kompetensiId]?.namaKompetensi ?? '—',
        days: daysRemaining(kp.tanggalExpired),
      }))
      .sort((a, b) => a.days - b.days);
  }, [kompetensiPegawai, pegById, kwById]);

  const unitStats = useMemo(() => {
    const units = Array.from(new Set(pegawai.map(p => p.unitKerja))).filter(Boolean);
    return units.map(unit => {
      const unitPeg = pegawai.filter(p => p.unitKerja === unit);
      const compliant = unitPeg.filter(p => {
        const applicable = applicableKw(p.id);
        return applicable.every(kw => kpMap[p.id]?.[kw.id]?.status === 'Valid');
      });
      return { unit, pct: compliancePct(compliant.length, unitPeg.length), total: unitPeg.length };
    }).sort((a, b) => b.pct - a.pct);
  }, [pegawai, kompetensiWajib, kpMap]);

  // ────────────────────────────────────────────────────────────────────────────
  // TAB 2: Matriks Kompetensi
  // ────────────────────────────────────────────────────────────────────────────

  const [filterUnit, setFilterUnit] = useState('');
  const [filterKat, setFilterKat] = useState('');
  const [matriksSearch, setMatriksSearch] = useState('');

  // modal for cell click
  const [cellModal, setCellModal] = useState<{
    pegawaiId: string; kompetensiId: string; existing: KompetensiPegawai | null;
  } | null>(null);
  const [kpForm, setKpForm] = useState<Omit<KompetensiPegawai, 'id'>>({ ...EMPTY_KP });
  const [showDeleteKpConfirm, setShowDeleteKpConfirm] = useState<string | null>(null);

  const unitList = useMemo(() => Array.from(new Set(pegawai.map(p => p.unitKerja))).filter(Boolean).sort(), [pegawai]);
  const katList: KategoriKompetensiWajib[] = ['BHD', 'PPI', 'KPRS', 'K3', 'Mutu', 'Lainnya'];

  const matriksKw = useMemo(() =>
    kompetensiWajib.filter(kw =>
      (!filterKat || kw.kategori === filterKat) &&
      (kw.berlakuUntuk === 'Semua' || !filterUnit || kw.berlakuUntuk === filterUnit)
    ), [kompetensiWajib, filterKat, filterUnit]);

  const matriksPeg = useMemo(() =>
    pegawai.filter(p =>
      (!filterUnit || p.unitKerja === filterUnit) &&
      (!matriksSearch || getFullName(p.id).toLowerCase().includes(matriksSearch.toLowerCase()))
    ), [pegawai, filterUnit, matriksSearch]);

  const openCellModal = (pegawaiId: string, kompetensiId: string) => {
    const existing = kpMap[pegawaiId]?.[kompetensiId] ?? null;
    setCellModal({ pegawaiId, kompetensiId, existing });
    setKpForm(existing
      ? { pegawaiId: existing.pegawaiId, kompetensiId: existing.kompetensiId, tanggalSertifikasi: existing.tanggalSertifikasi, tanggalExpired: existing.tanggalExpired, nomorSertifikat: existing.nomorSertifikat ?? '', penyelenggara: existing.penyelenggara ?? '', status: existing.status }
      : { ...EMPTY_KP, pegawaiId, kompetensiId }
    );
  };

  const handleSaveKp = () => {
    if (!kpForm.tanggalSertifikasi || !kpForm.tanggalExpired) {
      toast.error('Harap isi tanggal sertifikasi dan expired');
      return;
    }
    const computedStatus = computeStatus(kpForm.tanggalExpired);
    const payload = { ...kpForm, status: computedStatus };
    if (cellModal?.existing) {
      updateKompetensiPegawai({ ...payload, id: cellModal.existing.id });
      toast.success('Data kompetensi pegawai diperbarui');
    } else {
      addKompetensiPegawai(payload);
      toast.success('Data kompetensi pegawai ditambahkan');
    }
    setCellModal(null);
  };

  const handleDeleteKp = (id: string) => {
    deleteKompetensiPegawai(id);
    setShowDeleteKpConfirm(null);
    setCellModal(null);
    toast.success('Data kompetensi pegawai dihapus');
  };

  // column compliance
  const colCompliance = (kwId: string) => {
    const applicable = matriksPeg;
    const valid = applicable.filter(p => kpMap[p.id]?.[kwId]?.status === 'Valid').length;
    return compliancePct(valid, applicable.length);
  };

  // ────────────────────────────────────────────────────────────────────────────
  // TAB 3: Kelola Kompetensi Wajib
  // ────────────────────────────────────────────────────────────────────────────

  const [kwModal, setKwModal] = useState(false);
  const [kwEdit, setKwEdit] = useState<KompetensiWajib | null>(null);
  const [kwForm, setKwForm] = useState<Omit<KompetensiWajib, 'id'>>({ ...EMPTY_KW });
  const [deleteKwConfirm, setDeleteKwConfirm] = useState<string | null>(null);
  const [kwSearch, setKwSearch] = useState('');

  const openAddKw = () => { setKwEdit(null); setKwForm({ ...EMPTY_KW }); setKwModal(true); };
  const openEditKw = (k: KompetensiWajib) => { setKwEdit(k); setKwForm({ namaKompetensi: k.namaKompetensi, kategori: k.kategori, berlakuUntuk: k.berlakuUntuk, periodeValidasiBulan: k.periodeValidasiBulan, isWajib: k.isWajib, keterangan: k.keterangan ?? '' }); setKwModal(true); };

  const handleSaveKw = () => {
    if (!kwForm.namaKompetensi) { toast.error('Nama kompetensi harus diisi'); return; }
    if (kwEdit) {
      updateKompetensiWajib({ ...kwEdit, ...kwForm });
      toast.success('Kompetensi wajib diperbarui');
    } else {
      addKompetensiWajib(kwForm);
      toast.success('Kompetensi wajib ditambahkan');
    }
    setKwModal(false);
  };

  const handleDeleteKw = (id: string) => {
    const hasRecords = kompetensiPegawai.some(kp => kp.kompetensiId === id);
    if (hasRecords) { toast.error('Tidak dapat menghapus: masih ada data pegawai terkait'); setDeleteKwConfirm(null); return; }
    deleteKompetensiWajib(id);
    setDeleteKwConfirm(null);
    toast.success('Kompetensi wajib dihapus');
  };

  const kwFiltered = useMemo(() =>
    kompetensiWajib.filter(k => !kwSearch || k.namaKompetensi.toLowerCase().includes(kwSearch.toLowerCase()) || k.kategori.toLowerCase().includes(kwSearch.toLowerCase())),
    [kompetensiWajib, kwSearch]);

  // ────────────────────────────────────────────────────────────────────────────
  // render
  // ────────────────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          SNARS — Matriks Kompetensi Wajib
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Pemantauan kepatuhan kompetensi wajib pegawai sesuai standar akreditasi SNARS</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
        {([
          { id: 'dashboard', label: 'Dashboard Compliance' },
          { id: 'matriks',   label: 'Matriks Kompetensi' },
          { id: 'kelola',    label: 'Kelola Kompetensi Wajib' },
        ] as { id: TabType; label: string }[]).map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === t.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── TAB 1: Dashboard ─── */}
      {activeTab === 'dashboard' && (
        <div className="space-y-5">
          {/* Overall */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">Overall Compliance</p>
              <p className={`text-5xl font-bold ${pctColor(overallCompliance)}`}>{overallCompliance}%</p>
              <p className="text-xs text-gray-400 mt-1">Pegawai dengan semua kompetensi Valid / total pegawai</p>
            </div>
            <div className="w-full md:w-56">
              <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${pctBarColor(overallCompliance)}`} style={{ width: `${overallCompliance}%` }} />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0%</span><span>100%</span>
              </div>
            </div>
          </div>

          {/* Per-kategori cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {kategoriStats.map(({ kat, pct, expired, akanExpired }) => {
              const cfg = KATEGORI_CONFIG[kat];
              return (
                <div key={kat} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.bg} ${cfg.text}`}>{kat}</span>
                  <p className={`text-2xl font-bold mt-2 ${pctColor(pct)}`}>{pct}%</p>
                  <p className="text-xs text-gray-400">compliance</p>
                  <div className="mt-2 space-y-0.5 text-xs">
                    {expired > 0 && <p className="text-red-600">✗ {expired} expired</p>}
                    {akanExpired > 0 && <p className="text-yellow-600">⚠ {akanExpired} akan expired</p>}
                    {expired === 0 && akanExpired === 0 && <p className="text-green-600">✓ Semua valid</p>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <p className="text-sm font-semibold text-gray-800">Perhatian — Kompetensi Expired / Akan Expired ({alerts.length})</p>
              </div>
              <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                {alerts.map(({ kp, pegNama, kwNama, days }) => (
                  <div key={kp.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{pegNama}</p>
                      <p className="text-xs text-gray-500">{kwNama}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_CONFIG[kp.status].bg} ${STATUS_CONFIG[kp.status].text}`}>
                        {kp.status}
                      </span>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {days < 0 ? `${Math.abs(days)} hari lalu` : `${days} hari lagi`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unit bar chart */}
          {unitStats.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-semibold text-gray-800 mb-4">Compliance per Unit Kerja</p>
              <div className="space-y-3">
                {unitStats.map(({ unit, pct, total }) => (
                  <div key={unit} className="flex items-center gap-3">
                    <p className="text-xs text-gray-600 w-40 truncate shrink-0">{unit}</p>
                    <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden relative">
                      <div className={`h-full rounded-full ${pctBarColor(pct)}`} style={{ width: `${pct}%` }} />
                      <span className="absolute right-2 top-0 text-xs font-medium leading-5 text-gray-600">{pct}%</span>
                    </div>
                    <p className="text-xs text-gray-400 w-16 shrink-0">{total} pegawai</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: Matriks ─── */}
      {activeTab === 'matriks' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Cari pegawai..." value={matriksSearch} onChange={e => setMatriksSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <select value={filterUnit} onChange={e => setFilterUnit(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Semua Unit</option>
              {unitList.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <select value={filterKat} onChange={e => setFilterKat(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Semua Kategori</option>
              {katList.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>

          {/* Matrix table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="text-xs border-collapse min-w-max">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {/* sticky first col header */}
                    <th className="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-500 border-r border-gray-200 min-w-[180px]">
                      Pegawai
                    </th>
                    {matriksKw.map(kw => {
                      const cfg = KATEGORI_CONFIG[kw.kategori];
                      return (
                        <th key={kw.id} className="px-2 py-3 text-center font-medium text-gray-600 border-r border-gray-100 max-w-[100px] min-w-[90px]">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>{kw.kategori}</span>
                            <span className="text-[10px] leading-tight text-center line-clamp-3">{kw.namaKompetensi}</span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {matriksPeg.length === 0 ? (
                    <tr>
                      <td colSpan={matriksKw.length + 1} className="py-12 text-center text-gray-400">
                        Tidak ada pegawai yang ditemukan
                      </td>
                    </tr>
                  ) : matriksPeg.map(p => (
                    <tr key={p.id} className="hover:bg-blue-50/10">
                      <td className="sticky left-0 z-10 bg-white px-4 py-2.5 border-r border-gray-200">
                        <p className="font-medium text-gray-800 text-xs">{getFullName(p.id)}</p>
                        <p className="text-gray-400 text-[10px]">{p.unitKerja}</p>
                      </td>
                      {matriksKw.map(kw => {
                        const rec = kpMap[p.id]?.[kw.id];
                        const st = rec?.status ?? 'Belum';
                        const cfg = STATUS_CONFIG[st];
                        return (
                          <td key={kw.id} className="px-2 py-2.5 text-center border-r border-gray-50">
                            <button
                              onClick={() => openCellModal(p.id, kw.id)}
                              className={`w-8 h-8 rounded-lg font-bold text-sm ${cfg.bg} ${cfg.text} hover:opacity-80 transition-opacity mx-auto flex items-center justify-center`}
                              title={`${getFullName(p.id)} — ${kw.namaKompetensi}: ${cfg.long}`}
                            >
                              {cfg.label}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {/* summary row */}
                  {matriksPeg.length > 0 && (
                    <tr className="bg-gray-50 border-t border-gray-200">
                      <td className="sticky left-0 z-10 bg-gray-50 px-4 py-2 border-r border-gray-200 text-xs font-semibold text-gray-600">
                        Compliance %
                      </td>
                      {matriksKw.map(kw => {
                        const pct = colCompliance(kw.id);
                        return (
                          <td key={kw.id} className="px-2 py-2 text-center border-r border-gray-100">
                            <span className={`text-xs font-semibold ${pctColor(pct)}`}>{pct}%</span>
                          </td>
                        );
                      })}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 text-xs text-gray-600">
            {(Object.entries(STATUS_CONFIG) as [KompetensiPegawai['status'], typeof STATUS_CONFIG[keyof typeof STATUS_CONFIG]][]).map(([st, cfg]) => (
              <div key={st} className="flex items-center gap-1.5">
                <span className={`w-5 h-5 rounded flex items-center justify-center font-bold ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                <span>{cfg.long}</span>
              </div>
            ))}
            <span className="text-gray-400 ml-2">Klik sel untuk input/edit data</span>
          </div>
        </div>
      )}

      {/* ─── TAB 3: Kelola ─── */}
      {activeTab === 'kelola' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Cari kompetensi..." value={kwSearch} onChange={e => setKwSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button onClick={openAddKw} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" /> Tambah Kompetensi Wajib
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Nama Kompetensi</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Kategori</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Berlaku Untuk</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Periode (bln)</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Wajib</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Pegawai Terdaftar</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {kwFiltered.length === 0 ? (
                    <tr><td colSpan={7} className="py-12 text-center text-gray-400">
                      <ShieldCheck className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p>Tidak ada data kompetensi</p>
                    </td></tr>
                  ) : kwFiltered.map(kw => {
                    const cfg = KATEGORI_CONFIG[kw.kategori];
                    const recordCount = kompetensiPegawai.filter(kp => kp.kompetensiId === kw.id).length;
                    return (
                      <tr key={kw.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800">{kw.namaKompetensi}</p>
                          {kw.keterangan && <p className="text-xs text-gray-400 mt-0.5">{kw.keterangan}</p>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.bg} ${cfg.text}`}>{kw.kategori}</span>
                        </td>
                        <td className="px-4 py-3 text-center text-xs text-gray-600">{kw.berlakuUntuk}</td>
                        <td className="px-4 py-3 text-center text-xs text-gray-600">{kw.periodeValidasiBulan}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => updateKompetensiWajib({ ...kw, isWajib: !kw.isWajib })}
                            className={`w-10 h-5 rounded-full transition-colors relative ${kw.isWajib ? 'bg-blue-600' : 'bg-gray-300'}`}
                          >
                            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${kw.isWajib ? 'left-5' : 'left-0.5'}`} />
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center text-xs text-gray-600">{recordCount}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => openEditKw(kw)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setDeleteKwConfirm(kw.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal: Cell KP ─── */}
      {cellModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <p className="font-semibold text-gray-900 text-sm">{kwById[cellModal.kompetensiId]?.namaKompetensi}</p>
                <p className="text-xs text-gray-500">{getFullName(cellModal.pegawaiId)}</p>
              </div>
              <button onClick={() => setCellModal(null)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tgl Sertifikasi *</label>
                  <input type="date" value={kpForm.tanggalSertifikasi}
                    onChange={e => setKpForm(f => ({ ...f, tanggalSertifikasi: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tgl Expired *</label>
                  <input type="date" value={kpForm.tanggalExpired}
                    onChange={e => setKpForm(f => ({ ...f, tanggalExpired: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">No. Sertifikat</label>
                <input type="text" value={kpForm.nomorSertifikat ?? ''} placeholder="Nomor sertifikat"
                  onChange={e => setKpForm(f => ({ ...f, nomorSertifikat: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Penyelenggara</label>
                <input type="text" value={kpForm.penyelenggara ?? ''} placeholder="Nama penyelenggara"
                  onChange={e => setKpForm(f => ({ ...f, penyelenggara: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              {kpForm.tanggalExpired && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500">Status otomatis:</span>
                  <span className={`px-2 py-0.5 rounded-full font-medium ${STATUS_CONFIG[computeStatus(kpForm.tanggalExpired)].bg} ${STATUS_CONFIG[computeStatus(kpForm.tanggalExpired)].text}`}>
                    {STATUS_CONFIG[computeStatus(kpForm.tanggalExpired)].long}
                  </span>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-between">
              <div>
                {cellModal.existing && (
                  <button onClick={() => setShowDeleteKpConfirm(cellModal.existing!.id)}
                    className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                    <Trash2 className="w-3.5 h-3.5" /> Hapus
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setCellModal(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50">
                  Batal
                </button>
                <button onClick={handleSaveKp} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal: Tambah/Edit KW ─── */}
      {kwModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <p className="font-semibold text-gray-900">{kwEdit ? 'Edit Kompetensi Wajib' : 'Tambah Kompetensi Wajib'}</p>
              <button onClick={() => setKwModal(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nama Kompetensi *</label>
                <input type="text" value={kwForm.namaKompetensi} placeholder="Nama kompetensi"
                  onChange={e => setKwForm(f => ({ ...f, namaKompetensi: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Kategori</label>
                  <select value={kwForm.kategori} onChange={e => setKwForm(f => ({ ...f, kategori: e.target.value as KategoriKompetensiWajib }))}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {katList.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Periode Validasi (bulan)</label>
                  <input type="number" min={1} value={kwForm.periodeValidasiBulan}
                    onChange={e => setKwForm(f => ({ ...f, periodeValidasiBulan: Number(e.target.value) }))}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Berlaku Untuk</label>
                <input type="text" value={kwForm.berlakuUntuk} placeholder="Semua / nama unit"
                  onChange={e => setKwForm(f => ({ ...f, berlakuUntuk: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Keterangan</label>
                <textarea value={kwForm.keterangan ?? ''} rows={2} placeholder="Keterangan tambahan (opsional)"
                  onChange={e => setKwForm(f => ({ ...f, keterangan: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setKwForm(f => ({ ...f, isWajib: !f.isWajib }))}
                  className={`w-10 h-5 rounded-full transition-colors relative ${kwForm.isWajib ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${kwForm.isWajib ? 'left-5' : 'left-0.5'}`} />
                </button>
                <span className="text-sm text-gray-700">Kompetensi Wajib</span>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
              <button onClick={() => setKwModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50">
                Batal
              </button>
              <button onClick={handleSaveKw} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirm: KP ─── */}
      {showDeleteKpConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="font-semibold text-gray-900 mb-1">Hapus data kompetensi ini?</p>
            <p className="text-sm text-gray-500 mb-5">Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowDeleteKpConfirm(null)} className="px-5 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Batal</button>
              <button onClick={() => handleDeleteKp(showDeleteKpConfirm)} className="px-5 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirm: KW ─── */}
      {deleteKwConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="font-semibold text-gray-900 mb-1">Hapus kompetensi wajib ini?</p>
            <p className="text-sm text-gray-500 mb-5">Jika ada data pegawai terkait, penghapusan akan gagal.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeleteKwConfirm(null)} className="px-5 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Batal</button>
              <button onClick={() => handleDeleteKw(deleteKwConfirm)} className="px-5 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
