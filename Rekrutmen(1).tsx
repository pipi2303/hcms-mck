import { useState } from 'react';
import {
  UserPlus, Briefcase, Users, CheckCircle, Clock, XCircle,
  Search, Filter, Plus, Edit, Eye, Download, FileText,
  Calendar, Star, Phone, Mail, MapPin, Award, TrendingUp,
  ChevronRight, User, ClipboardList, BarChart3, Mic
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface RekrutmenProps {
  setActiveMenu?: (menu: string) => void;
}

const lowonganData = [
  { id: 'REK-001', posisi: 'Dokter Spesialis Anestesi', departemen: 'Anestesiologi', jenis: 'Tetap', kuota: 1, pelamar: 8, status: 'Aktif', deadline: '15 Mar 2026', tahapan: 'Wawancara', syarat: ['S2 Sp.An', 'STR Aktif', 'SIP RS', 'Pengalaman min 2 thn'] },
  { id: 'REK-002', posisi: 'Perawat ICU', departemen: 'ICU', jenis: 'Tetap', kuota: 3, pelamar: 24, status: 'Aktif', deadline: '20 Mar 2026', tahapan: 'Seleksi Berkas', syarat: ['D3/S1 Keperawatan', 'STR Aktif', 'Sertifikat ICU', 'Pengalaman min 1 thn'] },
  { id: 'REK-003', posisi: 'Apoteker Klinis', departemen: 'Farmasi', jenis: 'Kontrak', kuota: 2, pelamar: 15, status: 'Aktif', deadline: '10 Mar 2026', tahapan: 'Tes Kompetensi', syarat: ['S1 Farmasi + Apoteker', 'SIPA Aktif', 'Pengalaman farmasi klinis'] },
  { id: 'REK-004', posisi: 'Radiografer', departemen: 'Radiologi', jenis: 'Tetap', kuota: 1, pelamar: 12, status: 'Closed', deadline: '28 Feb 2026', tahapan: 'Selesai', syarat: ['D3 Radiologi', 'STR Aktif', 'SIR Aktif'] },
  { id: 'REK-005', posisi: 'Perawat IGD', departemen: 'IGD', jenis: 'Tetap', kuota: 4, pelamar: 31, status: 'Aktif', deadline: '25 Mar 2026', tahapan: 'Seleksi Berkas', syarat: ['D3/S1 Keperawatan', 'STR Aktif', 'BTCLS/PPGD', 'Pengalaman IGD'] },
  { id: 'REK-006', posisi: 'Analis Laboratorium', departemen: 'Laboratorium', jenis: 'Kontrak', kuota: 2, pelamar: 18, status: 'Aktif', deadline: '12 Mar 2026', tahapan: 'Tes Tertulis', syarat: ['D3 Analis Kesehatan', 'STR Aktif', 'SIK Aktif'] },
];

const pelamarData = [
  { id: 'PEL-001', nama: 'Raditya Pramana, Sp.An', posisi: 'Dokter Spesialis Anestesi', email: 'raditya@mail.com', telp: '0812-3456-7891', pendidikan: 'S2 Sp.An - FKUI', pengalaman: '4 tahun', lokasi: 'Jakarta', skor: 88, status: 'Wawancara', tanggal: '25 Feb 2026' },
  { id: 'PEL-002', nama: 'Mega Wulandari, Ns', posisi: 'Perawat ICU', email: 'mega@mail.com', telp: '0813-5678-9012', pendidikan: 'S1 Keperawatan - UI', pengalaman: '3 tahun ICU', lokasi: 'Depok', skor: 85, status: 'Lolos Berkas', tanggal: '24 Feb 2026' },
  { id: 'PEL-003', nama: 'Dian Permatasari, S.Farm., Apt', posisi: 'Apoteker Klinis', email: 'dian@mail.com', telp: '0814-9012-3456', pendidikan: 'S1 Farmasi + Profesi', pengalaman: '2 tahun', lokasi: 'Tangerang', skor: 90, status: 'Tes Kompetensi', tanggal: '23 Feb 2026' },
  { id: 'PEL-004', nama: 'Andi Kurniawan', posisi: 'Perawat IGD', email: 'andi@mail.com', telp: '0815-2345-6789', pendidikan: 'D3 Keperawatan - AKPER', pengalaman: '1 tahun', lokasi: 'Bekasi', skor: 78, status: 'Lolos Berkas', tanggal: '22 Feb 2026' },
  { id: 'PEL-005', nama: 'Sri Wahyuni', posisi: 'Analis Laboratorium', email: 'sri@mail.com', telp: '0816-3456-7890', pendidikan: 'D3 Analis Kesehatan', pengalaman: '2 tahun', lokasi: 'Jakarta', skor: 82, status: 'Tes Tertulis', tanggal: '21 Feb 2026' },
  { id: 'PEL-006', nama: 'Fahmi Reza', posisi: 'Perawat IGD', email: 'fahmi@mail.com', telp: '0817-4567-8901', pendidikan: 'S1 Keperawatan', pengalaman: '2 tahun IGD', lokasi: 'Jakarta', skor: 86, status: 'Lolos Berkas', tanggal: '20 Feb 2026' },
  { id: 'PEL-007', nama: 'Putri Handayani, Ns', posisi: 'Perawat ICU', email: 'putri@mail.com', telp: '0818-5678-9012', pendidikan: 'D3 Keperawatan', pengalaman: '2 tahun ICU', lokasi: 'Bogor', skor: 79, status: 'Ditolak', tanggal: '19 Feb 2026' },
];

const funnelData = [
  { tahap: 'Pelamar Masuk', count: 108, color: '#01544e' },
  { tahap: 'Lolos Berkas', count: 72, color: '#059669' },
  { tahap: 'Tes Tertulis', count: 45, color: '#34d399' },
  { tahap: 'Tes Kompetensi', count: 28, color: '#6ee7b7' },
  { tahap: 'Wawancara', count: 18, color: '#a7f3d0' },
  { tahap: 'Diterima', count: 8, color: '#d1fae5' },
];

const deptNeedData = [
  { dept: 'ICU', kebutuhan: 3, tersedia: 0, pct: 100 },
  { dept: 'IGD', kebutuhan: 4, tersedia: 1, pct: 75 },
  { dept: 'Anestesi', kebutuhan: 1, tersedia: 0, pct: 100 },
  { dept: 'Farmasi', kebutuhan: 2, tersedia: 0, pct: 100 },
  { dept: 'Lab', kebutuhan: 2, tersedia: 1, pct: 50 },
  { dept: 'Radiologi', kebutuhan: 1, tersedia: 1, pct: 0 },
];

const statusColor: Record<string, string> = {
  'Lolos Berkas': 'bg-blue-100 text-blue-700',
  'Tes Tertulis': 'bg-yellow-100 text-yellow-700',
  'Tes Kompetensi': 'bg-orange-100 text-orange-700',
  'Wawancara': 'bg-purple-100 text-purple-700',
  'Diterima': 'bg-green-100 text-green-700',
  'Ditolak': 'bg-red-100 text-red-600',
};

const STAGES = ['Seleksi Berkas', 'Tes Tertulis', 'Tes Kompetensi', 'Wawancara', 'Keputusan', 'Onboarding'];
const COLORS_PIE = ['#01544e', '#059669', '#34d399', '#6ee7b7', '#a7f3d0', '#ecfdf5'];

export function Rekrutmen({ setActiveMenu }: RekrutmenProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'lowongan' | 'pelamar' | 'onboarding'>('dashboard');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedApplicant, setSelectedApplicant] = useState<typeof pelamarData[0] | null>(null);

  const filtered = pelamarData.filter(p => {
    const matchSearch = p.nama.toLowerCase().includes(search.toLowerCase()) || p.posisi.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#01544e] text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserPlus className="w-7 h-7" />
            <div>
              <h1 className="text-xl font-semibold">Rekrutmen & Seleksi SDM</h1>
              <p className="text-sm text-green-200">Manajemen Penerimaan Karyawan Baru · SIMRS IntraHospital</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="bg-white/20 border border-white/30 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-white/30">
              <Plus className="w-4 h-4" /> Buat Lowongan
            </button>
            <button className="bg-white text-[#01544e] px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b px-6">
        <div className="flex">
          {[
            { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { key: 'lowongan', label: 'Lowongan Kerja', icon: Briefcase },
            { key: 'pelamar', label: 'Data Pelamar', icon: Users },
            { key: 'onboarding', label: 'Onboarding', icon: Award },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-5 py-3 text-sm border-b-2 transition-colors ${activeTab === tab.key ? 'border-[#01544e] text-[#01544e] font-medium' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Posisi Lowongan Aktif', value: '5 posisi', sub: '11 kuota tersedia', icon: Briefcase, color: 'bg-[#01544e]' },
                { label: 'Total Pelamar', value: '108 orang', sub: 'Semua posisi aktif', icon: Users, color: 'bg-blue-600' },
                { label: 'Dalam Proses', value: '72 orang', sub: 'Seleksi berjalan', icon: Clock, color: 'bg-orange-500' },
                { label: 'Diterima Bulan Ini', value: '8 orang', sub: 'Siap onboarding', icon: CheckCircle, color: 'bg-green-600' },
              ].map((c, i) => (
                <div key={i} className="bg-white rounded-xl p-5 shadow-sm border flex items-center gap-4">
                  <div className={`${c.color} p-3 rounded-xl`}><c.icon className="w-5 h-5 text-white" /></div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">{c.value}</div>
                    <div className="text-sm text-gray-500">{c.label}</div>
                    <div className="text-xs text-gray-400">{c.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-6">
              {/* Funnel */}
              <div className="bg-white rounded-xl p-5 shadow-sm border">
                <h3 className="font-semibold text-gray-800 mb-4">Funnel Rekrutmen</h3>
                <div className="space-y-2">
                  {funnelData.map((f, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-32">{f.tahap}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden relative">
                        <div className="h-full rounded-full flex items-center pl-3 text-white text-xs font-medium transition-all"
                          style={{ width: `${(f.count / 108) * 100}%`, backgroundColor: f.color }}>
                          {f.count}
                        </div>
                      </div>
                      <span className="text-xs font-medium text-gray-700 w-12 text-right">
                        {((f.count / 108) * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Kebutuhan per Dept */}
              <div className="bg-white rounded-xl p-5 shadow-sm border">
                <h3 className="font-semibold text-gray-800 mb-4">Kebutuhan SDM per Departemen</h3>
                <div className="space-y-3">
                  {deptNeedData.map((d, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{d.dept}</span>
                        <span className="text-gray-500">{d.tersedia}/{d.kebutuhan} terpenuhi</span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${d.pct === 0 ? 'bg-green-500' : d.pct <= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${100 - d.pct}%` }}></div>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {d.pct === 0 ? '✅ Terpenuhi' : `${d.pct}% masih dibutuhkan`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'lowongan' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border flex gap-3 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input placeholder="Cari posisi..."
                  className="pl-9 pr-4 py-2 border rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#01544e]/30" />
              </div>
              <select className="border rounded-lg px-3 py-2 text-sm">
                <option>Semua Status</option>
                <option>Aktif</option>
                <option>Closed</option>
              </select>
              <button className="bg-[#01544e] text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                <Plus className="w-4 h-4" /> Buat Lowongan
              </button>
            </div>

            <div className="grid gap-4">
              {lowonganData.map(l => (
                <div key={l.id} className={`bg-white rounded-xl p-5 shadow-sm border hover:border-[#01544e] transition-colors ${l.status === 'Closed' ? 'opacity-60' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="bg-green-100 p-3 rounded-xl mt-0.5">
                        <Briefcase className="w-5 h-5 text-[#01544e]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-gray-800">{l.posisi}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${l.status === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{l.status}</span>
                          <span className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700">{l.jenis}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">{l.departemen} · Kuota: {l.kuota} orang · Deadline: {l.deadline}</p>
                        <div className="flex gap-4 mt-2 text-sm">
                          <span className="flex items-center gap-1 text-gray-600">
                            <Users className="w-3.5 h-3.5" /> {l.pelamar} pelamar
                          </span>
                          <span className="flex items-center gap-1 text-orange-600">
                            <Clock className="w-3.5 h-3.5" /> Tahapan: {l.tahapan}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {l.syarat.map((s, i) => (
                            <span key={i} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-gray-400 hover:text-[#01544e] hover:bg-green-50 rounded-lg">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {/* Progress */}
                  {l.status === 'Aktif' && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {STAGES.map((stage, i) => {
                          const currentIdx = STAGES.indexOf(l.tahapan);
                          const isActive = i === currentIdx;
                          const isDone = i < currentIdx;
                          return (
                            <div key={i} className="flex items-center gap-1 flex-shrink-0">
                              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-[#01544e] text-white' : isDone ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                {isDone && <CheckCircle className="w-3 h-3" />}
                                {stage}
                              </div>
                              {i < STAGES.length - 1 && <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'pelamar' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Cari nama pelamar..."
                  className="pl-9 pr-4 py-2 border rounded-lg text-sm w-full focus:outline-none" />
              </div>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm">
                <option value="all">Semua Status</option>
                <option>Lolos Berkas</option>
                <option>Tes Tertulis</option>
                <option>Tes Kompetensi</option>
                <option>Wawancara</option>
                <option>Diterima</option>
                <option>Ditolak</option>
              </select>
            </div>

            <div className="grid gap-3">
              {filtered.map(p => (
                <div key={p.id} className="bg-white rounded-xl p-4 shadow-sm border hover:border-[#01544e] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="bg-[#01544e] text-white rounded-full w-10 h-10 flex items-center justify-center font-semibold flex-shrink-0">
                      {p.nama.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium text-gray-800">{p.nama}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${statusColor[p.status] || 'bg-gray-100 text-gray-600'}`}>{p.status}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">Melamar: {p.posisi}</p>
                      <div className="flex flex-wrap gap-4 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{p.email}</span>
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{p.telp}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.lokasi}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-bold text-[#01544e]">{p.skor}</div>
                      <div className="text-xs text-gray-400">Skor Seleksi</div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button className="p-2 text-gray-400 hover:text-[#01544e] hover:bg-green-50 rounded-lg">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-gray-500">
                    <span>Pendidikan: {p.pendidikan}</span>
                    <span>Pengalaman: {p.pengalaman}</span>
                    <span>Daftar: {p.tanggal}</span>
                    {p.status !== 'Ditolak' && p.status !== 'Diterima' && (
                      <div className="flex gap-2">
                        <button className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs hover:bg-green-200">Loloskan</button>
                        <button className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs hover:bg-red-200">Tolak</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'onboarding' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[
                { nama: 'Dian Permatasari, S.Farm., Apt', posisi: 'Apoteker Klinis', dept: 'Farmasi', startDate: '1 Mar 2026', progress: 60, tasks: ['Orientasi RS ✓', 'STR & SIP ✓', 'Training Farmasi Klinis ✓', 'Sistem SIMRS (Hari Ini)', 'Evaluasi 1 bulan (pending)'] },
                { nama: 'Raditya Pramana, Sp.An', posisi: 'Dokter Sp. Anestesi', dept: 'Anestesiologi', startDate: '3 Mar 2026', progress: 30, tasks: ['Orientasi RS ✓', 'STR & SIP (proses)', 'Training Anestesi (pending)', 'Sistem EMR (pending)', 'Evaluasi 1 bulan (pending)'] },
                { nama: 'Mega Wulandari, Ns', posisi: 'Perawat ICU', dept: 'ICU', startDate: '5 Mar 2026', progress: 15, tasks: ['Orientasi RS (terjadwal)', 'STR & SIK (proses)', 'Training ICU (pending)', 'Training Ventilator (pending)', 'Evaluasi 1 bulan (pending)'] },
              ].map((emp, i) => (
                <div key={i} className="bg-white rounded-xl p-5 shadow-sm border">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="bg-[#01544e] text-white rounded-full w-10 h-10 flex items-center justify-center font-semibold flex-shrink-0">
                      {emp.nama.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 text-sm">{emp.nama}</h4>
                      <p className="text-xs text-gray-500">{emp.posisi}</p>
                      <p className="text-xs text-blue-600">{emp.dept} · Mulai {emp.startDate}</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress Onboarding</span>
                      <span className="font-medium text-[#01544e]">{emp.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#01544e] rounded-full" style={{ width: `${emp.progress}%` }}></div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {emp.tasks.map((task, j) => (
                      <div key={j} className={`text-xs flex items-center gap-2 ${task.includes('✓') ? 'text-green-600' : task.includes('pending') ? 'text-gray-400' : 'text-blue-600 font-medium'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${task.includes('✓') ? 'bg-green-500' : task.includes('pending') ? 'bg-gray-300' : 'bg-blue-500'}`}></div>
                        {task}
                      </div>
                    ))}
                  </div>
                  <button className="mt-4 w-full text-xs text-[#01544e] border border-[#01544e] py-1.5 rounded-lg hover:bg-green-50">
                    Lihat Detail Onboarding
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
