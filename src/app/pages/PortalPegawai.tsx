import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard, CalendarDays, FileText, Clock, CheckCircle,
  XCircle, AlertCircle, ChevronDown, ChevronUp, Download,
  Calendar, Activity, BookOpen, Star, ArrowRight, TrendingUp,
  Shield, BadgeCheck, Printer,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAppContext } from '../context/AppContext';
import { EmployeeAvatar } from '../components/EmployeeAvatar';

// ─── Constants ────────────────────────────────────────────────────────────────
const BULAN = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const HARI_PENDEK = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const fmt = (n: number) => new Intl.NumberFormat('id-ID').format(n);

const ABSENSI_STATUS_CFG: Record<string, { color: string; bg: string }> = {
  'Hadir':      { color: 'text-green-700',  bg: 'bg-green-100' },
  'Izin':       { color: 'text-blue-700',   bg: 'bg-blue-100' },
  'Sakit':      { color: 'text-yellow-700', bg: 'bg-yellow-100' },
  'Cuti':       { color: 'text-purple-700', bg: 'bg-purple-100' },
  'Alpha':      { color: 'text-red-700',    bg: 'bg-red-100' },
  'Libur':      { color: 'text-gray-500',   bg: 'bg-gray-100' },
  'Dinas Luar': { color: 'text-indigo-700', bg: 'bg-indigo-100' },
};

const CUTI_STATUS_CFG: Record<string, { color: string; bg: string; label: string }> = {
  'Pending':   { color: 'text-yellow-700', bg: 'bg-yellow-100', label: 'Menunggu' },
  'Disetujui': { color: 'text-green-700',  bg: 'bg-green-100',  label: 'Disetujui' },
  'Ditolak':   { color: 'text-red-700',    bg: 'bg-red-100',    label: 'Ditolak' },
};

const SLIP_STATUS_CFG: Record<string, { color: string; bg: string }> = {
  'Draft':    { color: 'text-gray-600',  bg: 'bg-gray-100' },
  'Disetujui':{ color: 'text-blue-700', bg: 'bg-blue-100' },
  'Dibayar':  { color: 'text-green-700',bg: 'bg-green-100' },
  'Dibatalkan':{ color: 'text-red-700', bg: 'bg-red-100' },
};

const DIKLAT_STATUS_CFG: Record<string, { color: string; bg: string }> = {
  'Selesai':      { color: 'text-green-700',  bg: 'bg-green-100' },
  'Berlangsung':  { color: 'text-blue-700',   bg: 'bg-blue-100' },
  'Direncanakan': { color: 'text-yellow-700', bg: 'bg-yellow-100' },
  'Dibatalkan':   { color: 'text-red-700',    bg: 'bg-red-100' },
};

const SHIFT_CFG: Record<string, { color: string; bg: string }> = {
  'Pagi':    { color: 'text-amber-700',   bg: 'bg-amber-100' },
  'Sore':    { color: 'text-orange-700',  bg: 'bg-orange-100' },
  'Malam':   { color: 'text-indigo-700',  bg: 'bg-indigo-100' },
  'Lepas':   { color: 'text-gray-600',    bg: 'bg-gray-100' },
  'On-Call': { color: 'text-purple-700',  bg: 'bg-purple-100' },
  'Libur':   { color: 'text-gray-400',    bg: 'bg-gray-50' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getWeekDates(ref: Date): Date[] {
  const d = new Date(ref);
  const day = d.getDay(); // 0=Sun
  const mon = new Date(d);
  mon.setDate(d.getDate() - ((day + 6) % 7)); // Monday
  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(mon);
    dt.setDate(mon.getDate() + i);
    return dt;
  });
}

function toYMD(d: Date): string {
  return d.toISOString().split('T')[0];
}

function daysUntil(ds: string): number {
  const now = new Date('2026-10-29');
  const exp = new Date(ds + 'T00:00:00');
  return Math.ceil((exp.getTime() - now.getTime()) / 86400000);
}

function StatusBadge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color} ${bg}`}>
      {label}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PortalPegawai() {
  const {
    currentUser, pegawai, cuti, absensi, jadwalShift,
    slipGaji, str, sip, diklat, skp,
  } = useAppContext();
  const navigate = useNavigate();
  const [expandedSlip, setExpandedSlip] = useState<string | null>(null);

  // ── Guard: no pegawaiId ────────────────────────────────────────────────────
  if (!currentUser?.pegawaiId) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Akun belum terhubung</h2>
          <p className="text-sm text-gray-500">
            Akun Anda belum terhubung ke data pegawai. Hubungi Administrator.
          </p>
        </div>
      </div>
    );
  }

  const myId = currentUser.pegawaiId;
  const myPegawai = pegawai.find(p => p.id === myId);
  const myCuti = cuti.filter(c => c.pegawaiId === myId);
  const myAbsensi = absensi.filter(a => a.pegawaiId === myId);
  const myJadwal = jadwalShift.filter(j => j.pegawaiId === myId);
  const mySlipGaji = useMemo(
    () => slipGaji.filter(s => s.pegawaiId === myId).sort((a, b) => b.tahun - a.tahun || b.bulan - a.bulan),
    [slipGaji, myId]
  );
  const mySTR = str.filter(s => s.pegawaiId === myId);
  const mySIP = sip.filter(s => s.pegawaiId === myId);
  const myDiklat = diklat.filter(d => d.pegawaiId === myId);
  const mySKP = skp.filter(s => s.pegawaiId === myId);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const thisYear = 2026;
  const thisMonth = 10; // October 2026

  const cutiTahunanTerpakai = myCuti.filter(c =>
    c.jenisCuti === 'Cuti Tahunan' &&
    c.status === 'Disetujui' &&
    new Date(c.tanggalMulai).getFullYear() === thisYear
  ).reduce((acc, c) => acc + c.jumlahHari, 0);
  const saldoCuti = Math.max(0, 12 - cutiTahunanTerpakai);

  const absensiMonthThis = myAbsensi.filter(a => {
    const d = new Date(a.tanggal + 'T00:00:00');
    return d.getFullYear() === thisYear && d.getMonth() + 1 === thisMonth;
  });
  const hadirCount = absensiMonthThis.filter(a => a.status === 'Hadir').length;
  // Count working days in current month up to today
  const totalWorkingDays = absensiMonthThis.filter(
    a => a.status !== 'Libur'
  ).length || 1;
  const kehadiran = Math.round((hadirCount / totalWorkingDays) * 100);

  const jpDiklat = myDiklat
    .filter(d => d.status === 'Selesai' && new Date(d.tanggalMulai).getFullYear() === thisYear)
    .reduce((acc, d) => acc + d.jumlahJP, 0);

  const latestSKP = mySKP
    .filter(s => s.status === 'Selesai' || s.status === 'Disetujui')
    .sort((a, b) => b.tahun - a.tahun || b.semester - a.semester)[0];
  const statusSKP = latestSKP?.predikat ?? 'Belum Ada';

  // ── Week view ──────────────────────────────────────────────────────────────
  const today = new Date('2026-10-29');
  const weekDates = getWeekDates(today);
  const jadwalByDate = useMemo(() => {
    const map: Record<string, typeof myJadwal[0]> = {};
    myJadwal.forEach(j => { map[j.tanggal] = j; });
    return map;
  }, [myJadwal]);

  // ── Absensi last 10 this month ─────────────────────────────────────────────
  const recentAbsensi = [...absensiMonthThis]
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
    .slice(0, 10);

  // ── Download slip helper ────────────────────────────────────────────────────
  const handleDownloadSlip = (s: typeof mySlipGaji[0]) => {
    const nama = myPegawai ? `${myPegawai.gelarDepan ? myPegawai.gelarDepan + ' ' : ''}${myPegawai.nama}` : currentUser.nama;
    const lines = [
      `SLIP GAJI — ${BULAN[s.bulan]} ${s.tahun}`,
      `Nama    : ${nama}`,
      `NIP     : ${myPegawai?.nip ?? '-'}`,
      `Jabatan : ${myPegawai?.jabatan ?? '-'}`,
      `Unit    : ${myPegawai?.unitKerja ?? '-'}`,
      ``,
      `PENGHASILAN`,
      `  Gaji Pokok              : Rp ${fmt(s.gajiPokok)}`,
      `  Tunjangan Jabatan       : Rp ${fmt(s.tunjanganJabatan)}`,
      `  Tunjangan Fungsional    : Rp ${fmt(s.tunjanganFungsional)}`,
      `  Tunjangan Beras         : Rp ${fmt(s.tunjanganBeras)}`,
      `  Tunjangan Anak          : Rp ${fmt(s.tunjanganAnak)}`,
      `  Tunjangan Istri         : Rp ${fmt(s.tunjanganIstri)}`,
      `  Tunjangan Kinerja       : Rp ${fmt(s.tunjanganKinerja)}`,
      ...(s.tambahanLain || []).map(x => `  ${x.uraian.padEnd(24)}: Rp ${fmt(x.jumlah)}`),
      `  Total Bruto             : Rp ${fmt(s.totalBruto)}`,
      ``,
      `POTONGAN`,
      `  BPJS Kesehatan          : Rp ${fmt(s.potonganBPJSKes)}`,
      `  BPJS Ketenagakerjaan    : Rp ${fmt(s.potonganBPJSTK)}`,
      `  PPh 21                  : Rp ${fmt(s.potonganPPh21)}`,
      `  Taspen                  : Rp ${fmt(s.potonganTaspen)}`,
      ...(s.potonganLain || []).map(x => `  ${x.uraian.padEnd(24)}: Rp ${fmt(x.jumlah)}`),
      `  Total Potongan          : Rp ${fmt(s.totalPotongan)}`,
      ``,
      `GAJI BERSIH               : Rp ${fmt(s.totalNetto)}`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `slip-gaji-${BULAN[s.bulan]}-${s.tahun}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Slip gaji ${BULAN[s.bulan]} ${s.tahun} diunduh`);
  };

  // ── Lisensi (STR+SIP combined) ─────────────────────────────────────────────
  const lisensiItems = [
    ...mySTR.map(s => ({
      id: s.id, nomor: s.nomorSTR,
      jenis: `STR – ${s.jenisTenaga}`,
      expired: s.tanggalExpired, status: s.status,
    })),
    ...mySIP.map(s => ({
      id: s.id, nomor: s.nomorSIP,
      jenis: `${s.jenisDokumen}${s.jenisPraktik ? ' – ' + s.jenisPraktik : ''}`,
      expired: s.tanggalExpired, status: s.status,
    })),
  ];

  const lisensiStatusCfg = (status: string, expired: string) => {
    const days = daysUntil(expired);
    if (status === 'Expired' || days < 0) return { color: 'text-red-700', bg: 'bg-red-100', label: 'Expired' };
    if (status === 'Akan Expired' || days <= 90) return { color: 'text-yellow-700', bg: 'bg-yellow-100', label: `${days}h lagi` };
    return { color: 'text-green-700', bg: 'bg-green-100', label: 'Aktif' };
  };

  // ── Cuti aktif (pending or approved future) ────────────────────────────────
  const activeCuti = myCuti.filter(c =>
    c.status === 'Pending' ||
    (c.status === 'Disetujui' && c.tanggalMulai >= toYMD(today))
  ).sort((a, b) => b.tanggalPengajuan.localeCompare(a.tanggalPengajuan));

  const displayNama = myPegawai
    ? `${myPegawai.gelarDepan ? myPegawai.gelarDepan + ' ' : ''}${myPegawai.nama}${myPegawai.gelarBelakang ? ', ' + myPegawai.gelarBelakang : ''}`
    : currentUser.nama;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* ── Page title ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <LayoutDashboard className="w-5 h-5 text-[#038E7D]" />
        <h1 className="text-xl font-bold text-[#012D29]">Portal Pegawai</h1>
      </div>

      {/* ── 1. Hero / Welcome card ────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#013E37] to-[#025C52] rounded-2xl p-5 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <EmployeeAvatar
            id={myId}
            nama={myPegawai?.nama ?? currentUser.nama}
            foto={myPegawai?.foto}
            size="xl"
            shape="rounded"
            className="ring-2 ring-white/30"
          />
          <div className="flex-1 min-w-0">
            <p className="text-white/60 text-sm">Selamat datang,</p>
            <h2 className="text-xl font-bold leading-tight break-words">{displayNama}</h2>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/75">
              {myPegawai?.jabatan && <span>{myPegawai.jabatan}</span>}
              {myPegawai?.unitKerja && <span>· {myPegawai.unitKerja}</span>}
              {myPegawai?.golongan && <span>· Gol. {myPegawai.golongan}</span>}
            </div>
            {myPegawai?.nip && (
              <p className="text-xs text-white/50 mt-0.5">NIP: {myPegawai.nip}</p>
            )}
            <div className="mt-2">
              {myPegawai?.statusAktif === 'Aktif' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-500/20 text-green-300 border border-green-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                  Aktif
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-400/20 text-gray-300 border border-gray-400/30">
                  {myPegawai?.statusAktif ?? 'Tidak Aktif'}
                </span>
              )}
            </div>
          </div>
        </div>
        {/* Quick actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => navigate('/cuti')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors text-white border border-white/20"
          >
            <CalendarDays className="w-4 h-4" />
            Ajukan Cuti
          </button>
          <button
            onClick={() => navigate('/penjadwalan')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors text-white border border-white/20"
          >
            <Clock className="w-4 h-4" />
            Lihat Jadwal
          </button>
          {mySlipGaji[0] && (
            <button
              onClick={() => handleDownloadSlip(mySlipGaji[0])}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFEFB2]/20 hover:bg-[#FFEFB2]/30 text-sm font-medium transition-colors text-[#FFEFB2] border border-[#FFEFB2]/30"
            >
              <Download className="w-4 h-4" />
              Unduh Slip Gaji
            </button>
          )}
        </div>
      </div>

      {/* ── 2. Stats row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            icon: <CalendarDays className="w-5 h-5 text-[#038E7D]" />,
            label: 'Saldo Cuti',
            value: `${saldoCuti} hari`,
            sub: `Terpakai ${cutiTahunanTerpakai} hari`,
            bg: 'bg-teal-50',
            border: 'border-teal-200',
          },
          {
            icon: <Activity className="w-5 h-5 text-blue-600" />,
            label: 'Kehadiran Bulan Ini',
            value: `${kehadiran}%`,
            sub: `${hadirCount} dari ${totalWorkingDays} hari`,
            bg: 'bg-blue-50',
            border: 'border-blue-200',
          },
          {
            icon: <BookOpen className="w-5 h-5 text-purple-600" />,
            label: 'JP Diklat Tahun Ini',
            value: `${jpDiklat} JP`,
            sub: 'Status: Selesai',
            bg: 'bg-purple-50',
            border: 'border-purple-200',
          },
          {
            icon: <Star className="w-5 h-5 text-amber-600" />,
            label: 'Status SKP',
            value: statusSKP,
            sub: latestSKP ? `${latestSKP.tahun} Sem ${latestSKP.semester}` : 'Belum ada data',
            bg: 'bg-amber-50',
            border: 'border-amber-200',
          },
        ].map(stat => (
          <div key={stat.label} className={`${stat.bg} border ${stat.border} rounded-xl p-4`}>
            <div className="flex items-center justify-between mb-2">
              {stat.icon}
            </div>
            <p className="text-xs text-gray-500 mb-0.5">{stat.label}</p>
            <p className="text-lg font-bold text-gray-800 leading-tight">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* ── 3. Jadwal Shift minggu ini ────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#038E7D]" />
          <h3 className="font-semibold text-gray-800">Jadwal Shift Minggu Ini</h3>
          <span className="ml-auto text-xs text-gray-400">
            {weekDates[0].getDate()} – {weekDates[6].getDate()} {BULAN[weekDates[6].getMonth() + 1]} {weekDates[6].getFullYear()}
          </span>
        </div>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-7 min-w-[560px]">
            {weekDates.map((dt, i) => {
              const ymd = toYMD(dt);
              const isToday = ymd === toYMD(today);
              const jadwal = jadwalByDate[ymd];
              const cfg = jadwal ? SHIFT_CFG[jadwal.jenisShift] ?? SHIFT_CFG['Lepas'] : null;
              return (
                <div
                  key={i}
                  className={`flex flex-col items-center py-3 px-1 border-r last:border-r-0 border-gray-100 ${isToday ? 'bg-teal-50' : ''}`}
                >
                  <p className={`text-xs font-medium mb-1 ${isToday ? 'text-[#038E7D]' : 'text-gray-500'}`}>
                    {HARI_PENDEK[(i + 1) % 7]}
                  </p>
                  <p className={`text-sm font-bold mb-2 ${isToday ? 'text-[#013E37]' : 'text-gray-700'}`}>
                    {dt.getDate()}
                  </p>
                  {jadwal && cfg ? (
                    <div className="text-center">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${cfg.color} ${cfg.bg} mb-1`}>
                        {jadwal.jenisShift}
                      </span>
                      {jadwal.jamMulai && (
                        <p className="text-[10px] text-gray-400 leading-tight">
                          {jadwal.jamMulai}
                          {jadwal.jamSelesai ? `–${jadwal.jamSelesai}` : ''}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-300 text-sm">—</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 4. Riwayat Absensi bulan ini ─────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#038E7D]" />
          <h3 className="font-semibold text-gray-800">Riwayat Absensi Bulan Ini</h3>
          <span className="ml-auto text-xs text-gray-400">{BULAN[thisMonth]} {thisYear}</span>
        </div>
        {recentAbsensi.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-8">Belum ada data absensi bulan ini.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[540px]">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-2.5 text-left font-medium">Tanggal</th>
                  <th className="px-4 py-2.5 text-left font-medium">Hari</th>
                  <th className="px-4 py-2.5 text-left font-medium">Status</th>
                  <th className="px-4 py-2.5 text-left font-medium">Masuk</th>
                  <th className="px-4 py-2.5 text-left font-medium">Keluar</th>
                  <th className="px-4 py-2.5 text-left font-medium">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentAbsensi.map(a => {
                  const d = new Date(a.tanggal + 'T00:00:00');
                  const cfg = ABSENSI_STATUS_CFG[a.status] ?? ABSENSI_STATUS_CFG['Libur'];
                  return (
                    <tr key={a.id} className="hover:bg-gray-50/60">
                      <td className="px-4 py-2.5 font-medium text-gray-700">
                        {String(d.getDate()).padStart(2, '0')}/{String(d.getMonth() + 1).padStart(2, '0')}
                      </td>
                      <td className="px-4 py-2.5 text-gray-500">
                        {['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][d.getDay()]}
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusBadge label={a.status} {...cfg} />
                      </td>
                      <td className="px-4 py-2.5 text-gray-600">{a.jamMasuk ?? '—'}</td>
                      <td className="px-4 py-2.5 text-gray-600">{a.jamKeluar ?? '—'}</td>
                      <td className="px-4 py-2.5 text-gray-400 max-w-[160px] truncate">{a.keterangan ?? '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 5. Slip Gaji Terbaru ──────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#038E7D]" />
          <h3 className="font-semibold text-gray-800">Slip Gaji Terbaru</h3>
        </div>
        {mySlipGaji.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-8">Belum ada slip gaji.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {mySlipGaji.slice(0, 3).map(s => {
              const scfg = SLIP_STATUS_CFG[s.status] ?? SLIP_STATUS_CFG['Draft'];
              const open = expandedSlip === s.id;
              return (
                <div key={s.id}>
                  {/* Card header — click to expand */}
                  <button
                    className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                    onClick={() => setExpandedSlip(open ? null : s.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800">{BULAN[s.bulan]} {s.tahun}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Gaji Bersih</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#013E37]">Rp {fmt(s.totalNetto)}</p>
                      <StatusBadge label={s.status} {...scfg} />
                    </div>
                    {open ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                  </button>

                  {/* Inline detail accordion */}
                  {open && (
                    <div className="px-5 pb-4 bg-gray-50/70 border-t border-gray-100">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Penghasilan</p>
                          {[
                            ['Gaji Pokok', s.gajiPokok],
                            ['Tunjangan Jabatan', s.tunjanganJabatan],
                            ['Tunjangan Fungsional', s.tunjanganFungsional],
                            ['Tunjangan Beras', s.tunjanganBeras],
                            ['Tunjangan Anak', s.tunjanganAnak],
                            ['Tunjangan Istri', s.tunjanganIstri],
                            ['Tunjangan Kinerja', s.tunjanganKinerja],
                            ...(s.tambahanLain || []).map(x => [x.uraian, x.jumlah] as [string, number]),
                          ].filter(([, v]) => (v as number) > 0).map(([label, val]) => (
                            <div key={label as string} className="flex justify-between text-sm py-0.5">
                              <span className="text-gray-600">{label as string}</span>
                              <span className="text-gray-800 font-medium">Rp {fmt(val as number)}</span>
                            </div>
                          ))}
                          <div className="flex justify-between text-sm py-1 border-t border-gray-200 mt-1 font-semibold">
                            <span className="text-gray-700">Total Bruto</span>
                            <span className="text-gray-900">Rp {fmt(s.totalBruto)}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Potongan</p>
                          {[
                            ['BPJS Kesehatan', s.potonganBPJSKes],
                            ['BPJS Ketenagakerjaan', s.potonganBPJSTK],
                            ['PPh 21', s.potonganPPh21],
                            ['Taspen', s.potonganTaspen],
                            ...(s.potonganLain || []).map(x => [x.uraian, x.jumlah] as [string, number]),
                          ].filter(([, v]) => (v as number) > 0).map(([label, val]) => (
                            <div key={label as string} className="flex justify-between text-sm py-0.5">
                              <span className="text-gray-600">{label as string}</span>
                              <span className="text-red-600 font-medium">- Rp {fmt(val as number)}</span>
                            </div>
                          ))}
                          <div className="flex justify-between text-sm py-1 border-t border-gray-200 mt-1 font-semibold">
                            <span className="text-gray-700">Total Potongan</span>
                            <span className="text-red-600">- Rp {fmt(s.totalPotongan)}</span>
                          </div>
                          <div className="flex justify-between text-sm py-2 border-t-2 border-gray-300 mt-1 font-bold text-base">
                            <span className="text-gray-900">Gaji Bersih</span>
                            <span className="text-[#013E37]">Rp {fmt(s.totalNetto)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => handleDownloadSlip(s)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#013E37] hover:bg-[#025C52] text-white text-sm font-medium transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                          Unduh
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 6. STR / SIP / Lisensi ───────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#038E7D]" />
          <h3 className="font-semibold text-gray-800">STR / SIP / Lisensi</h3>
        </div>
        {lisensiItems.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-8">Tidak ada data STR/SIP.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {lisensiItems.map(item => {
              const cfg = lisensiStatusCfg(item.status, item.expired);
              const days = daysUntil(item.expired);
              return (
                <div key={item.id} className="flex items-center gap-4 px-5 py-3.5">
                  <BadgeCheck className={`w-5 h-5 flex-shrink-0 ${cfg.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.jenis}</p>
                    <p className="text-xs text-gray-400">{item.nomor}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <StatusBadge label={cfg.label} color={cfg.color} bg={cfg.bg} />
                    <p className="text-xs text-gray-400 mt-0.5">
                      Exp: {new Date(item.expired + 'T00:00:00').toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    {days > 0 && days <= 90 && (
                      <p className="text-xs text-yellow-600">{days} hari lagi</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 7. Riwayat Diklat ────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#038E7D]" />
          <h3 className="font-semibold text-gray-800">Riwayat Diklat</h3>
          <span className="ml-auto text-xs font-medium text-[#038E7D]">
            Total {thisYear}: {jpDiklat} JP
          </span>
        </div>
        {myDiklat.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-8">Belum ada riwayat diklat.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[540px]">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-2.5 text-left font-medium">Nama Diklat</th>
                  <th className="px-4 py-2.5 text-left font-medium">Jenis</th>
                  <th className="px-4 py-2.5 text-left font-medium">Penyelenggara</th>
                  <th className="px-4 py-2.5 text-center font-medium">JP</th>
                  <th className="px-4 py-2.5 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[...myDiklat]
                  .sort((a, b) => (b.tanggalMulai ?? '').localeCompare(a.tanggalMulai ?? ''))
                  .slice(0, 5)
                  .map(d => {
                    const cfg = DIKLAT_STATUS_CFG[d.status] ?? DIKLAT_STATUS_CFG['Selesai'];
                    return (
                      <tr key={d.id} className="hover:bg-gray-50/60">
                        <td className="px-4 py-2.5 font-medium text-gray-800 max-w-[200px]">
                          <span className="block truncate" title={d.namaDiklat}>{d.namaDiklat}</span>
                        </td>
                        <td className="px-4 py-2.5 text-gray-500">{d.jenisDiklat}</td>
                        <td className="px-4 py-2.5 text-gray-500 max-w-[140px]">
                          <span className="block truncate" title={d.penyelenggara}>{d.penyelenggara}</span>
                        </td>
                        <td className="px-4 py-2.5 text-center font-semibold text-gray-700">{d.jumlahJP}</td>
                        <td className="px-4 py-2.5">
                          <StatusBadge label={d.status} {...cfg} />
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 8. Pengajuan Cuti Aktif ───────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-[#038E7D]" />
          <h3 className="font-semibold text-gray-800">Pengajuan Cuti Aktif</h3>
          <button
            onClick={() => navigate('/cuti')}
            className="ml-auto flex items-center gap-1 text-xs text-[#038E7D] hover:underline"
          >
            Lihat Semua <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        {activeCuti.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-8">Tidak ada pengajuan cuti aktif.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {activeCuti.map(c => {
              const cfg = CUTI_STATUS_CFG[c.status] ?? CUTI_STATUS_CFG['Pending'];
              const levels = c.approvalLevels ?? [];
              return (
                <div key={c.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{c.jenisCuti}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {c.tanggalMulai} s/d {c.tanggalSelesai} · {c.jumlahHari} hari
                      </p>
                      {c.alasan && (
                        <p className="text-xs text-gray-400 mt-0.5 italic">"{c.alasan}"</p>
                      )}
                    </div>
                    <StatusBadge label={cfg.label} color={cfg.color} bg={cfg.bg} />
                  </div>

                  {/* Mini approval timeline */}
                  {levels.length > 0 && (
                    <div className="mt-3 flex items-center gap-0">
                      {levels.map((lv, i) => {
                        const isDone = lv.status === 'Disetujui';
                        const isRejected = lv.status === 'Ditolak';
                        return (
                          <React.Fragment key={lv.level}>
                            <div className="flex flex-col items-center">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                                isDone ? 'bg-green-500 border-green-500 text-white' :
                                isRejected ? 'bg-red-500 border-red-500 text-white' :
                                'bg-white border-gray-300 text-gray-400'
                              }`}>
                                {isDone ? <CheckCircle className="w-3.5 h-3.5" /> :
                                 isRejected ? <XCircle className="w-3.5 h-3.5" /> :
                                 lv.level}
                              </div>
                              <p className="text-[10px] text-gray-400 mt-1 w-16 text-center leading-tight">{lv.jabatan}</p>
                            </div>
                            {i < levels.length - 1 && (
                              <div className={`flex-1 h-0.5 mx-0.5 mb-4 ${isDone ? 'bg-green-400' : 'bg-gray-200'}`} />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
