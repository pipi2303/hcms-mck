import React, { useMemo, useState } from 'react';
import {
  BarChart3, Users, TrendingUp, Calendar, AlertTriangle,
  Clock, ShieldAlert, GraduationCap, ChevronUp, ChevronDown, Minus,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useAppContext } from '../context/AppContext';
import { C, CHART_COLORS } from '../components/colors';

// ─── Constants ────────────────────────────────────────────────────────────────
const NOW = new Date('2026-10-29');
const NOW_MS = NOW.getTime();
const THIS_YEAR = NOW.getFullYear();

const COLORS = ['#013E37', '#025046', '#0d9488', '#14b8a6', '#5eead4', '#99f6e4'];
const COLOR_RED = '#ef4444';
const COLOR_ORANGE = '#f97316';
const COLOR_YELLOW = '#eab308';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const ageFrom = (tl: string) => Math.floor((NOW_MS - new Date(tl).getTime()) / (365.25 * 86400000));
const masaKerja = (tm: string) => Math.floor((NOW_MS - new Date(tm).getTime()) / (365.25 * 86400000));
const hariPensiun = (bp: string) => Math.ceil((new Date(bp).getTime() - NOW_MS) / 86400000);
const golGroup = (g: string) => g.split('/')[0]; // 'III/a' → 'III'

type SortDir = 'asc' | 'desc';

// ─── Small shared UI pieces ────────────────────────────────────────────────────
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

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
      {children}
    </h2>
  );
}

function ChartBox({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 ${className}`}>
      <p className="text-sm font-semibold text-gray-700 mb-3">{title}</p>
      {children}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function WorkforceAnalytics() {
  const { pegawai, absensi, diklat, cuti, str, sip } = useAppContext();

  const [tab, setTab] = useState<'overview' | 'distribusi' | 'kehadiran' | 'prediksi'>('overview');
  const [pensiunSort, setPensiunSort] = useState<{ key: string; dir: SortDir }>({ key: 'hariSisa', dir: 'asc' });

  // ─── Derived data (all tabs) ─────────────────────────────────────────────────
  const aktif = useMemo(() => pegawai.filter(p => p.statusAktif === 'Aktif'), [pegawai]);

  // ── Overview stats ───────────────────────────────────────────────────────────
  const overview = useMemo(() => {
    const lCount = aktif.filter(p => p.jenisKelamin === 'L').length;
    const pCount = aktif.filter(p => p.jenisKelamin === 'P').length;
    const avgMasaKerja = aktif.length
      ? (aktif.reduce((s, p) => s + masaKerja(p.tanggalMasuk), 0) / aktif.length).toFixed(1)
      : '0';

    // Attendance % this month (Oct 2026)
    const thisMonthAbsensi = absensi.filter(a => a.tanggal.startsWith('2026-10'));
    const hadirCount = thisMonthAbsensi.filter(a => a.status === 'Hadir').length;
    const pctHadir = thisMonthAbsensi.length
      ? ((hadirCount / thisMonthAbsensi.length) * 100).toFixed(1)
      : '—';

    // Turnover proxy: headcount masuk per year 2018–2026
    const byYear: Record<number, number> = {};
    for (let y = 2018; y <= 2026; y++) byYear[y] = 0;
    aktif.forEach(p => {
      const y = new Date(p.tanggalMasuk).getFullYear();
      if (y >= 2018 && y <= 2026) byYear[y]++;
    });
    const joinChart = Object.entries(byYear).map(([y, n]) => ({ tahun: y, masuk: n }));

    // Status pie
    const statusCount: Record<string, number> = { PNS: 0, PPPK: 0, Honorer: 0 };
    aktif.forEach(p => { statusCount[p.statusPegawai] = (statusCount[p.statusPegawai] || 0) + 1; });
    const statusPie = Object.entries(statusCount).map(([name, value]) => ({ name, value }));

    // Gender pie
    const genderPie = [
      { name: 'Laki-laki', value: lCount },
      { name: 'Perempuan', value: pCount },
    ];

    return { lCount, pCount, avgMasaKerja, pctHadir, joinChart, statusPie, genderPie };
  }, [aktif, absensi]);

  // ── Distribusi SDM ───────────────────────────────────────────────────────────
  const distribusi = useMemo(() => {
    // Unit kerja headcount top 10
    const unitMap: Record<string, { L: number; P: number }> = {};
    aktif.forEach(p => {
      if (!unitMap[p.unitKerja]) unitMap[p.unitKerja] = { L: 0, P: 0 };
      unitMap[p.unitKerja][p.jenisKelamin]++;
    });
    const unitChart = Object.entries(unitMap)
      .map(([unit, v]) => ({ unit, L: v.L, P: v.P, total: v.L + v.P }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    // Golongan grouped
    const golMap: Record<string, number> = { I: 0, II: 0, III: 0, IV: 0 };
    aktif.forEach(p => {
      const g = golGroup(p.golongan);
      if (golMap[g] !== undefined) golMap[g]++;
    });
    const golChart = Object.entries(golMap).map(([gol, total]) => ({ gol, total }));

    // Pendidikan
    const pdMap: Record<string, number> = {};
    aktif.forEach(p => { pdMap[p.pendidikanTerakhir] = (pdMap[p.pendidikanTerakhir] || 0) + 1; });
    const pdChart = Object.entries(pdMap).map(([pend, total]) => ({ pend, total })).sort((a, b) => b.total - a.total);

    // Age buckets
    const ageBuckets: Record<string, number> = { '<30': 0, '30-39': 0, '40-49': 0, '50-59': 0, '≥60': 0 };
    aktif.forEach(p => {
      const a = ageFrom(p.tanggalLahir);
      if (a < 30) ageBuckets['<30']++;
      else if (a < 40) ageBuckets['30-39']++;
      else if (a < 50) ageBuckets['40-49']++;
      else if (a < 60) ageBuckets['50-59']++;
      else ageBuckets['≥60']++;
    });
    const ageChart = Object.entries(ageBuckets).map(([usia, total]) => ({ usia, total }));

    return { unitChart, golChart, pdChart, ageChart };
  }, [aktif]);

  // ── Kehadiran & Cuti ─────────────────────────────────────────────────────────
  const kehadiran = useMemo(() => {
    // Monthly absensi trend (last 6 months rolling from Oct 2026)
    const months = ['2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10'];
    const monthLabels = ['Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt'];
    const trendData = months.map((m, i) => {
      const recs = absensi.filter(a => a.tanggal.startsWith(m));
      return {
        bulan: monthLabels[i],
        Hadir: recs.filter(a => a.status === 'Hadir').length,
        Sakit: recs.filter(a => a.status === 'Sakit').length,
        Alpha: recs.filter(a => a.status === 'Alpha').length,
      };
    });

    // Cuti utilization by jenisCuti (Disetujui only)
    const cutiMap: Record<string, number> = {};
    cuti.filter(c => c.status === 'Disetujui').forEach(c => {
      cutiMap[c.jenisCuti] = (cutiMap[c.jenisCuti] || 0) + c.jumlahHari;
    });
    const cutiChart = Object.entries(cutiMap)
      .map(([jenis, hari]) => ({ jenis: jenis.replace('Cuti ', ''), hari }))
      .sort((a, b) => b.hari - a.hari);

    // Top 10 alpha per pegawai
    const alphaMap: Record<string, number> = {};
    absensi.filter(a => a.status === 'Alpha').forEach(a => {
      alphaMap[a.pegawaiId] = (alphaMap[a.pegawaiId] || 0) + 1;
    });
    const topAlpha = Object.entries(alphaMap)
      .map(([id, count]) => {
        const p = pegawai.find(x => x.id === id);
        return { nama: p?.nama ?? id, unit: p?.unitKerja ?? '—', count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return { trendData, cutiChart, topAlpha };
  }, [absensi, cuti, pegawai]);

  // ── Prediksi & Risiko ────────────────────────────────────────────────────────
  const prediksi = useMemo(() => {
    const DAY_1Y = 365;
    const DAY_2Y = 730;
    const DAY_3Y = 1095;

    // Pensiun dalam 3 tahun
    const pensiunList = aktif
      .map(p => ({ ...p, hariSisa: hariPensiun(p.batasPensiun) }))
      .filter(p => p.hariSisa > 0 && p.hariSisa <= DAY_3Y)
      .map(p => ({
        nama: p.nama,
        jabatan: p.jabatan,
        unit: p.unitKerja,
        golongan: p.golongan,
        batasPensiun: p.batasPensiun,
        hariSisa: p.hariSisa,
        risiko: p.hariSisa <= DAY_1Y ? 'merah' : p.hariSisa <= DAY_2Y ? 'oranye' : 'kuning',
      }));

    // STR/SIP alerts
    const strExpired = str.filter(s => s.status === 'Expired').length;
    const strAkanExpired = str.filter(s => s.status === 'Akan Expired').length;
    const sipExpired = sip.filter(s => s.status === 'Expired').length;
    const sipAkanExpired = sip.filter(s => s.status === 'Akan Expired').length;

    // Diklat compliance: % pegawai with ≥1 selesai training this year
    const diklatIds = new Set(
      diklat
        .filter(d => d.status === 'Selesai' && d.tanggalSelesai?.startsWith(String(THIS_YEAR)))
        .map(d => d.pegawaiId)
    );
    const diklatPct = aktif.length ? Math.round((diklatIds.size / aktif.length) * 100) : 0;

    // Unit headcount vs minimum (90% threshold)
    const unitMap: Record<string, number> = {};
    aktif.forEach(p => { unitMap[p.unitKerja] = (unitMap[p.unitKerja] || 0) + 1; });
    const unitRisk = Object.entries(unitMap)
      .map(([unit, count]) => ({ unit, count, minimum: Math.round(count * 0.9) }))
      .sort((a, b) => a.count - b.count)
      .slice(0, 10);

    return { pensiunList, strExpired, strAkanExpired, sipExpired, sipAkanExpired, diklatPct, unitRisk };
  }, [aktif, str, sip, diklat]);

  // ── Sort pensiun table ────────────────────────────────────────────────────────
  const sortedPensiun = useMemo(() => {
    const list = [...prediksi.pensiunList];
    list.sort((a, b) => {
      const va = (a as any)[pensiunSort.key];
      const vb = (b as any)[pensiunSort.key];
      const cmp = typeof va === 'string' ? va.localeCompare(vb) : va - vb;
      return pensiunSort.dir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [prediksi.pensiunList, pensiunSort]);

  const toggleSort = (key: string) =>
    setPensiunSort(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }));

  const SortIcon = ({ k }: { k: string }) =>
    pensiunSort.key !== k ? <Minus size={12} className="inline ml-1 opacity-30" /> :
    pensiunSort.dir === 'asc' ? <ChevronUp size={12} className="inline ml-1" /> :
    <ChevronDown size={12} className="inline ml-1" />;

  const risikoColor = (r: string) =>
    r === 'merah' ? COLOR_RED : r === 'oranye' ? COLOR_ORANGE : COLOR_YELLOW;

  const tabs: { id: typeof tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'distribusi', label: 'Distribusi SDM' },
    { id: 'kehadiran', label: 'Kehadiran & Cuti' },
    { id: 'prediksi', label: 'Prediksi & Risiko' },
  ];

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6" style={{ background: C.bg, minHeight: '100vh' }}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl p-2.5" style={{ background: C.brand }}>
          <BarChart3 size={22} color="#fff" />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: C.brand }}>Workforce Analytics &amp; Prediksi SDM</h1>
          <p className="text-xs text-gray-500 mt-0.5">Data per {NOW.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
            style={tab === t.id
              ? { background: C.brand, color: '#fff' }
              : { color: C.textMuted }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab 1: Overview ── */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <div>
            <SectionHeader>Ringkasan Eksekutif</SectionHeader>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard icon={Users} label="Total Pegawai Aktif" value={aktif.length} sub="per hari ini" />
              <KpiCard
                icon={Users}
                label="Rasio L : P"
                value={`${overview.lCount} : ${overview.pCount}`}
                sub={`${((overview.lCount / (aktif.length || 1)) * 100).toFixed(0)}% laki-laki`}
                color={C.accent}
              />
              <KpiCard
                icon={Clock}
                label="Rata-rata Masa Kerja"
                value={`${overview.avgMasaKerja} thn`}
                sub="berdasarkan tanggal masuk"
                color={C.brandMid}
              />
              <KpiCard
                icon={Calendar}
                label="% Kehadiran Okt 2026"
                value={overview.pctHadir === '—' ? '—' : `${overview.pctHadir}%`}
                sub="dari total rekap absensi"
                color={C.success}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <ChartBox title="Pegawai Masuk per Tahun (2018–2026)">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={overview.joinChart} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} />
                      <XAxis dataKey="tahun" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="masuk" stroke={C.brand} strokeWidth={2} dot={{ r: 4, fill: C.brand }} isAnimationActive={false} name="Masuk" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </ChartBox>
            </div>

            <div className="space-y-4">
              <ChartBox title="Status Pegawai">
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={overview.statusPie} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={2} isAnimationActive={false}>
                        {overview.statusPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend iconSize={10} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </ChartBox>

              <ChartBox title="Jenis Kelamin">
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={overview.genderPie} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={2} isAnimationActive={false}>
                        {overview.genderPie.map((_, i) => <Cell key={i} fill={[C.brand, C.brandXLight][i]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend iconSize={10} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </ChartBox>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: Distribusi SDM ── */}
      {tab === 'distribusi' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartBox title="Headcount per Unit Kerja (Top 10)">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distribusi.unitChart} layout="vertical" margin={{ top: 0, right: 16, left: 4, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="unit" type="category" tick={{ fontSize: 10 }} width={90} />
                    <Tooltip />
                    <Legend iconSize={10} />
                    <Bar dataKey="L" stackId="a" fill={C.brand} isAnimationActive={false} name="Laki-laki" />
                    <Bar dataKey="P" stackId="a" fill={C.brandXLight} isAnimationActive={false} name="Perempuan" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartBox>

            <ChartBox title="Distribusi Golongan">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distribusi.golChart} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} />
                    <XAxis dataKey="gol" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="total" isAnimationActive={false} name="Jumlah">
                      {distribusi.golChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartBox>

            <ChartBox title="Distribusi Pendidikan Terakhir">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distribusi.pdChart} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} />
                    <XAxis dataKey="pend" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="total" fill={C.accent} isAnimationActive={false} name="Jumlah" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartBox>

            <ChartBox title="Distribusi Usia (Histogram)">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distribusi.ageChart} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} />
                    <XAxis dataKey="usia" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="total" isAnimationActive={false} name="Jumlah">
                      {distribusi.ageChart.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartBox>
          </div>

          {/* Unit × L/P table */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <SectionHeader>Rekap Unit Kerja × Jenis Kelamin</SectionHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 pr-4 text-gray-500 font-medium">Unit Kerja</th>
                    <th className="text-center py-2 px-3 text-gray-500 font-medium">L</th>
                    <th className="text-center py-2 px-3 text-gray-500 font-medium">P</th>
                    <th className="text-center py-2 px-3 text-gray-500 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {distribusi.unitChart.map(row => (
                    <tr key={row.unit} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 pr-4 text-gray-700">{row.unit}</td>
                      <td className="py-2 px-3 text-center text-gray-600">{row.L}</td>
                      <td className="py-2 px-3 text-center text-gray-600">{row.P}</td>
                      <td className="py-2 px-3 text-center font-semibold" style={{ color: C.brand }}>{row.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 3: Kehadiran & Cuti ── */}
      {tab === 'kehadiran' && (
        <div className="space-y-6">
          <ChartBox title="Tren Kehadiran Bulanan (Mei–Okt 2026)">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={kehadiran.trendData} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} />
                  <XAxis dataKey="bulan" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend iconSize={10} />
                  <Line type="monotone" dataKey="Hadir" stroke={C.success} strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="Sakit" stroke={COLOR_ORANGE} strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="Alpha" stroke={COLOR_RED} strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartBox>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartBox title="Utilisasi Cuti per Jenis (Hari Disetujui)">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={kehadiran.cutiChart} layout="vertical" margin={{ top: 0, right: 16, left: 4, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="jenis" type="category" tick={{ fontSize: 10 }} width={90} />
                    <Tooltip formatter={(v) => [`${v} hari`, 'Total']} />
                    <Bar dataKey="hari" fill={C.brandLight} isAnimationActive={false} name="Hari" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartBox>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">Top 10 Pegawai — Alpha Terbanyak</p>
              {kehadiran.topAlpha.length === 0
                ? <p className="text-xs text-gray-400">Tidak ada data alpha.</p>
                : (
                  <div className="space-y-2">
                    {kehadiran.topAlpha.map((row, i) => (
                      <div key={i} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs text-gray-400 w-4">{i + 1}.</span>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-gray-700 truncate">{row.nama}</p>
                            <p className="text-xs text-gray-400 truncate">{row.unit}</p>
                          </div>
                        </div>
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: '#fee2e2', color: COLOR_RED }}
                        >
                          {row.count}x
                        </span>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 4: Prediksi & Risiko ── */}
      {tab === 'prediksi' && (
        <div className="space-y-6">
          {/* Alert summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              icon={TrendingUp}
              label="Pensiun <1 Tahun"
              value={prediksi.pensiunList.filter(p => p.risiko === 'merah').length}
              sub="segera ditangani"
              color={COLOR_RED}
            />
            <KpiCard
              icon={ShieldAlert}
              label="STR Expired / Akan Exp."
              value={`${prediksi.strExpired} / ${prediksi.strAkanExpired}`}
              sub="perlu perpanjangan"
              color={COLOR_ORANGE}
            />
            <KpiCard
              icon={ShieldAlert}
              label="SIP Expired / Akan Exp."
              value={`${prediksi.sipExpired} / ${prediksi.sipAkanExpired}`}
              sub="perlu perpanjangan"
              color={COLOR_ORANGE}
            />
            <KpiCard
              icon={GraduationCap}
              label="Diklat Compliance"
              value={`${prediksi.diklatPct}%`}
              sub={`pegawai ≥1 diklat selesai ${THIS_YEAR}`}
              color={C.success}
            />
          </div>

          {/* Pensiun table */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <SectionHeader>Pegawai Mendekati Pensiun (≤3 Tahun)</SectionHeader>
            {sortedPensiun.length === 0
              ? <p className="text-sm text-gray-400">Tidak ada pegawai yang mendekati pensiun dalam 3 tahun.</p>
              : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        {[
                          { key: 'nama', label: 'Nama' },
                          { key: 'jabatan', label: 'Jabatan' },
                          { key: 'unit', label: 'Unit' },
                          { key: 'golongan', label: 'Gol.' },
                          { key: 'batasPensiun', label: 'Batas Pensiun' },
                          { key: 'hariSisa', label: 'Sisa (hari)' },
                        ].map(col => (
                          <th
                            key={col.key}
                            className="text-left py-2 pr-4 text-gray-500 font-medium cursor-pointer select-none whitespace-nowrap"
                            onClick={() => toggleSort(col.key)}
                          >
                            {col.label}<SortIcon k={col.key} />
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedPensiun.map((row, i) => (
                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-2 pr-4 font-medium text-gray-800 whitespace-nowrap">{row.nama}</td>
                          <td className="py-2 pr-4 text-gray-600 whitespace-nowrap">{row.jabatan}</td>
                          <td className="py-2 pr-4 text-gray-600 whitespace-nowrap">{row.unit}</td>
                          <td className="py-2 pr-4 text-gray-600">{row.golongan}</td>
                          <td className="py-2 pr-4 text-gray-600 whitespace-nowrap">{row.batasPensiun}</td>
                          <td className="py-2 pr-4">
                            <span
                              className="text-xs font-bold px-2 py-0.5 rounded-full"
                              style={{ background: `${risikoColor(row.risiko)}22`, color: risikoColor(row.risiko) }}
                            >
                              {row.hariSisa.toLocaleString('id-ID')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }
          </div>

          {/* Unit risk bar chart */}
          <ChartBox title="Risiko Jabatan Kosong — Headcount vs Minimum Unit (×0.9)">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prediksi.unitRisk} layout="vertical" margin={{ top: 0, right: 16, left: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="unit" type="category" tick={{ fontSize: 10 }} width={90} />
                  <Tooltip />
                  <Legend iconSize={10} />
                  <Bar dataKey="count" fill={C.brand} isAnimationActive={false} name="Headcount" />
                  <Bar dataKey="minimum" fill={COLOR_YELLOW} isAnimationActive={false} name="Minimum (90%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartBox>

          {/* Risiko legend */}
          <div className="flex gap-4 flex-wrap">
            {[
              { color: COLOR_RED, label: '< 1 tahun — Segera' },
              { color: COLOR_ORANGE, label: '1–2 tahun — Waspada' },
              { color: COLOR_YELLOW, label: '2–3 tahun — Pantau' },
            ].map(r => (
              <div key={r.label} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: r.color }} />
                <span className="text-xs text-gray-500">{r.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
