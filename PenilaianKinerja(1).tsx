import { useState } from 'react';
import {
  Star, TrendingUp, Users, Award, FileText, Download,
  ChevronDown, ChevronUp, Search, Filter, Plus, Edit,
  CheckCircle, Clock, AlertCircle, Target, BarChart3,
  Medal, ThumbsUp, ClipboardList, Eye, Printer
} from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';

interface PenilaianKinerjaProps {
  setActiveMenu?: (menu: string) => void;
}

const EMPLOYEES_PERF = [
  { id: 1, nip: 'NIP-001', nama: 'Dr. Sarah Johnson, Sp.PD', jabatan: 'Dokter Spesialis PD', dept: 'Rawat Jalan', kehadiran: 95, kinerja: 92, kedisiplinan: 88, kerjasama: 94, inisiatif: 90, kepemimpinan: 85, total: 90.7, grade: 'A', status: 'Selesai', reviewer: 'Dr. Direktur Utama' },
  { id: 2, nip: 'NIP-002', nama: 'Dr. Ahmad Fauzi, Sp.B', jabatan: 'Dokter Spesialis Bedah', dept: 'Kamar Operasi', kehadiran: 98, kinerja: 95, kedisiplinan: 92, kerjasama: 88, inisiatif: 94, kepemimpinan: 90, total: 92.8, grade: 'A', status: 'Selesai', reviewer: 'Dr. Direktur Utama' },
  { id: 3, nip: 'NIP-015', nama: 'Ns. Dewi Rahayu, S.Kep', jabatan: 'Kepala Ruang ICU', dept: 'ICU', kehadiran: 96, kinerja: 88, kedisiplinan: 90, kerjasama: 92, inisiatif: 85, kepemimpinan: 88, total: 89.8, grade: 'A', status: 'Selesai', reviewer: 'Kabid Keperawatan' },
  { id: 4, nip: 'NIP-023', nama: 'Hendra Setiawan', jabatan: 'Apoteker', dept: 'Farmasi', kehadiran: 92, kinerja: 85, kedisiplinan: 88, kerjasama: 90, inisiatif: 80, kepemimpinan: 75, total: 85.0, grade: 'B', status: 'Selesai', reviewer: 'Kepala Farmasi' },
  { id: 5, nip: 'NIP-031', nama: 'Rini Kusumawati', jabatan: 'Analis Lab', dept: 'Laboratorium', kehadiran: 90, kinerja: 82, kedisiplinan: 85, kerjasama: 88, inisiatif: 78, kepemimpinan: 72, total: 82.5, grade: 'B', status: 'Selesai', reviewer: 'Kepala Lab' },
  { id: 6, nip: 'NIP-047', nama: 'Budi Santoso', jabatan: 'Radiografer', dept: 'Radiologi', kehadiran: 88, kinerja: 80, kedisiplinan: 82, kerjasama: 85, inisiatif: 75, kepemimpinan: 70, total: 80.0, grade: 'B', status: 'Review', reviewer: 'Kepala Radiologi' },
  { id: 7, nip: 'NIP-052', nama: 'Siti Aminah', jabatan: 'Perawat Pelaksana', dept: 'Rawat Inap', kehadiran: 85, kinerja: 78, kedisiplinan: 80, kerjasama: 88, inisiatif: 72, kepemimpinan: 65, total: 78.0, grade: 'B', status: 'Review', reviewer: 'Kepala Ruang' },
  { id: 8, nip: 'NIP-058', nama: 'Joko Widodo', jabatan: 'Staf Administrasi', dept: 'Administrasi', kehadiran: 82, kinerja: 72, kedisiplinan: 75, kerjasama: 80, inisiatif: 68, kepemimpinan: 60, total: 72.8, grade: 'C', status: 'Draft', reviewer: 'Kabag Administrasi' },
];

const deptPerformanceData = [
  { dept: 'Kamar Operasi', rata: 92.8 },
  { dept: 'Rawat Jalan', rata: 90.7 },
  { dept: 'ICU', rata: 89.8 },
  { dept: 'Farmasi', rata: 85.0 },
  { dept: 'Laboratorium', rata: 82.5 },
  { dept: 'Radiologi', rata: 80.0 },
  { dept: 'Rawat Inap', rata: 78.0 },
  { dept: 'Administrasi', rata: 72.8 },
];

const trendData = [
  { periode: 'Q2 2025', avg: 83.2, top: 91.5 },
  { periode: 'Q3 2025', avg: 84.8, top: 92.1 },
  { periode: 'Q4 2025', avg: 85.9, top: 92.4 },
  { periode: 'Q1 2026', avg: 87.2, top: 92.8 },
];

const gradeColor: Record<string, string> = {
  A: 'bg-green-100 text-green-700 border-green-300',
  B: 'bg-blue-100 text-blue-700 border-blue-300',
  C: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  D: 'bg-orange-100 text-orange-700 border-orange-300',
  E: 'bg-red-100 text-red-700 border-red-300',
};

const statusColor: Record<string, string> = {
  Selesai: 'bg-green-100 text-green-700',
  Review: 'bg-blue-100 text-blue-700',
  Draft: 'bg-gray-100 text-gray-600',
};

export function PenilaianKinerja({ setActiveMenu }: PenilaianKinerjaProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'penilaian' | 'detail' | 'laporan'>('dashboard');
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [filterGrade, setFilterGrade] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState<typeof EMPLOYEES_PERF[0] | null>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const filtered = EMPLOYEES_PERF.filter(e => {
    const matchSearch = e.nama.toLowerCase().includes(search.toLowerCase()) || e.nip.toLowerCase().includes(search.toLowerCase());
    const matchDept = filterDept === 'all' || e.dept === filterDept;
    const matchGrade = filterGrade === 'all' || e.grade === filterGrade;
    return matchSearch && matchDept && matchGrade;
  });

  const avgScore = (EMPLOYEES_PERF.reduce((s, e) => s + e.total, 0) / EMPLOYEES_PERF.length).toFixed(1);
  const gradeACount = EMPLOYEES_PERF.filter(e => e.grade === 'A').length;
  const gradeBCount = EMPLOYEES_PERF.filter(e => e.grade === 'B').length;

  const radarDataForEmployee = selectedEmployee ? [
    { subject: 'Kehadiran', value: selectedEmployee.kehadiran, fullMark: 100 },
    { subject: 'Kinerja', value: selectedEmployee.kinerja, fullMark: 100 },
    { subject: 'Kedisiplinan', value: selectedEmployee.kedisiplinan, fullMark: 100 },
    { subject: 'Kerjasama', value: selectedEmployee.kerjasama, fullMark: 100 },
    { subject: 'Inisiatif', value: selectedEmployee.inisiatif, fullMark: 100 },
    { subject: 'Kepemimpinan', value: selectedEmployee.kepemimpinan, fullMark: 100 },
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#01544e] text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Star className="w-7 h-7" />
            <div>
              <h1 className="text-xl font-semibold">Penilaian Kinerja Karyawan</h1>
              <p className="text-sm text-green-200">Periode Q1 2026 (Januari - Maret 2026) · SIMRS IntraHospital</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="bg-white/20 border border-white/30 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-white/30">
              <Plus className="w-4 h-4" /> Mulai Penilaian
            </button>
            <button className="bg-white text-[#01544e] px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-green-50">
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
            { key: 'penilaian', label: 'Data Penilaian', icon: ClipboardList },
            { key: 'detail', label: 'Detail Individu', icon: Target },
            { key: 'laporan', label: 'Laporan', icon: FileText },
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
            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Rata-rata Nilai', value: avgScore, sub: 'Semua karyawan Q1 2026', icon: Star, color: 'bg-[#01544e]', change: '+2.3 poin' },
                { label: 'Grade A (Sangat Baik)', value: `${gradeACount} org`, sub: '≥ 90 poin', icon: Award, color: 'bg-yellow-500', change: '37.5%' },
                { label: 'Grade B (Baik)', value: `${gradeBCount} org`, sub: '75 - 89 poin', icon: ThumbsUp, color: 'bg-blue-600', change: '50%' },
                { label: 'Pending Review', value: `${EMPLOYEES_PERF.filter(e => e.status !== 'Selesai').length} org`, sub: 'Perlu diselesaikan', icon: Clock, color: 'bg-orange-500', change: 'Segera' },
              ].map((c, i) => (
                <div key={i} className="bg-white rounded-xl p-5 shadow-sm border">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`${c.color} p-2.5 rounded-lg`}><c.icon className="w-5 h-5 text-white" /></div>
                    <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{c.change}</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-800">{c.value}</div>
                  <div className="text-sm text-gray-500 mt-1">{c.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{c.sub}</div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-5 shadow-sm border">
                <h3 className="font-semibold text-gray-800 mb-4">Nilai Rata-rata per Departemen</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={deptPerformanceData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" domain={[60, 100]} tick={{ fontSize: 11 }} />
                    <YAxis dataKey="dept" type="category" tick={{ fontSize: 11 }} width={100} />
                    <Tooltip formatter={(v: number) => `${v.toFixed(1)} poin`} />
                    <Bar dataKey="rata" name="Rata-rata Nilai" fill="#01544e" radius={[0, 4, 4, 0]}>
                      {deptPerformanceData.map((_, i) => (
                        <rect key={i} fill={_.rata >= 90 ? '#059669' : _.rata >= 80 ? '#01544e' : _.rata >= 75 ? '#0284c7' : '#f59e0b'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border">
                <h3 className="font-semibold text-gray-800 mb-4">Tren Nilai Kinerja Organisasi</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="periode" tick={{ fontSize: 11 }} />
                    <YAxis domain={[75, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="avg" name="Rata-rata" stroke="#01544e" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="top" name="Nilai Tertinggi" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Grade Distribution */}
            <div className="bg-white rounded-xl p-5 shadow-sm border">
              <h3 className="font-semibold text-gray-800 mb-4">Distribusi Grade Kinerja Q1 2026</h3>
              <div className="grid grid-cols-5 gap-4">
                {[
                  { grade: 'A', label: 'Sangat Baik', range: '≥ 90', count: 3, color: 'bg-green-500', pct: 37.5 },
                  { grade: 'B', label: 'Baik', range: '75-89', count: 4, color: 'bg-blue-500', pct: 50 },
                  { grade: 'C', label: 'Cukup', range: '60-74', count: 1, color: 'bg-yellow-500', pct: 12.5 },
                  { grade: 'D', label: 'Kurang', range: '50-59', count: 0, color: 'bg-orange-500', pct: 0 },
                  { grade: 'E', label: 'Sangat Kurang', range: '< 50', count: 0, color: 'bg-red-500', pct: 0 },
                ].map(g => (
                  <div key={g.grade} className={`border rounded-xl p-4 ${gradeColor[g.grade]}`}>
                    <div className="text-3xl font-bold">{g.grade}</div>
                    <div className="font-medium text-sm mt-1">{g.label}</div>
                    <div className="text-xs opacity-70 mt-0.5">Nilai {g.range}</div>
                    <div className="text-2xl font-bold mt-3">{g.count} <span className="text-sm font-normal">orang</span></div>
                    <div className="text-xs mt-1">{g.pct}%</div>
                    <div className="mt-2 bg-current/20 rounded-full h-1.5">
                      <div className="bg-current rounded-full h-1.5" style={{ width: `${g.pct}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'penilaian' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm border flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Cari nama/NIP..."
                  className="pl-9 pr-4 py-2 border rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#01544e]/30" />
              </div>
              <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm">
                <option value="all">Semua Departemen</option>
                {['Rawat Jalan', 'Rawat Inap', 'ICU', 'Farmasi', 'Laboratorium', 'Radiologi', 'Kamar Operasi', 'Administrasi'].map(d => (
                  <option key={d}>{d}</option>
                ))}
              </select>
              <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm">
                <option value="all">Semua Grade</option>
                {['A', 'B', 'C', 'D', 'E'].map(g => <option key={g}>Grade {g}</option>)}
              </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">NIP / Nama</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Departemen</th>
                    <th className="text-center py-3 px-3 font-medium text-gray-600">Kehadiran</th>
                    <th className="text-center py-3 px-3 font-medium text-gray-600">Kinerja</th>
                    <th className="text-center py-3 px-3 font-medium text-gray-600">Kedisiplinan</th>
                    <th className="text-center py-3 px-3 font-medium text-gray-600">Kerjasama</th>
                    <th className="text-center py-3 px-3 font-medium text-gray-600">Inisiatif</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Total</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Grade</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(emp => (
                    <tr key={emp.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-800">{emp.nama}</div>
                        <div className="text-xs text-gray-400">{emp.nip} · {emp.jabatan}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{emp.dept}</td>
                      {[emp.kehadiran, emp.kinerja, emp.kedisiplinan, emp.kerjasama, emp.inisiatif].map((v, ci) => (
                        <td key={ci} className="py-3 px-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`text-sm font-medium ${v >= 90 ? 'text-green-700' : v >= 80 ? 'text-blue-700' : v >= 70 ? 'text-yellow-700' : 'text-red-600'}`}>{v}</span>
                            <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${v >= 90 ? 'bg-green-500' : v >= 80 ? 'bg-blue-500' : v >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${v}%` }}></div>
                            </div>
                          </div>
                        </td>
                      ))}
                      <td className="py-3 px-4 text-right">
                        <span className="font-bold text-gray-800">{emp.total.toFixed(1)}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${gradeColor[emp.grade]}`}>{emp.grade}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${statusColor[emp.status]}`}>{emp.status}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => { setSelectedEmployee(emp); setActiveTab('detail'); }}
                            className="p-1.5 text-gray-400 hover:text-[#01544e] hover:bg-green-50 rounded">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded">
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'detail' && (
          <div className="space-y-4">
            {!selectedEmployee ? (
              <div className="bg-white rounded-xl p-10 shadow-sm border text-center">
                <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Pilih karyawan dari tab "Data Penilaian" untuk melihat detail</p>
                <button onClick={() => setActiveTab('penilaian')} className="mt-3 text-[#01544e] text-sm hover:underline">
                  Buka Data Penilaian
                </button>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-xl p-5 shadow-sm border">
                  <div className="flex items-center gap-4 mb-6 pb-4 border-b">
                    <div className="bg-[#01544e] text-white rounded-full w-14 h-14 flex items-center justify-center text-xl font-bold">
                      {selectedEmployee.nama.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-lg">{selectedEmployee.nama}</h3>
                      <p className="text-gray-500 text-sm">{selectedEmployee.jabatan} · {selectedEmployee.dept}</p>
                      <p className="text-gray-400 text-xs">{selectedEmployee.nip}</p>
                    </div>
                    <div className="text-center">
                      <div className={`text-5xl font-bold px-4 py-2 rounded-xl border ${gradeColor[selectedEmployee.grade]}`}>
                        {selectedEmployee.grade}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Grade</p>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-[#01544e]">{selectedEmployee.total.toFixed(1)}</div>
                      <p className="text-xs text-gray-500">Total Skor</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    {/* Radar Chart */}
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">Profil Kompetensi</h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <RadarChart data={radarDataForEmployee}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                          <Radar name={selectedEmployee.nama} dataKey="value" stroke="#01544e" fill="#01544e" fillOpacity={0.3} />
                          <Tooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Score Details */}
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">Rincian Nilai</h4>
                      <div className="space-y-3">
                        {[
                          { label: 'Kehadiran & Ketepatan Waktu', value: selectedEmployee.kehadiran, weight: '20%' },
                          { label: 'Kualitas Kinerja Pekerjaan', value: selectedEmployee.kinerja, weight: '30%' },
                          { label: 'Kedisiplinan & Integritas', value: selectedEmployee.kedisiplinan, weight: '20%' },
                          { label: 'Kerjasama Tim', value: selectedEmployee.kerjasama, weight: '15%' },
                          { label: 'Inisiatif & Inovasi', value: selectedEmployee.inisiatif, weight: '10%' },
                          { label: 'Kemampuan Kepemimpinan', value: selectedEmployee.kepemimpinan, weight: '5%' },
                        ].map((item, i) => (
                          <div key={i}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-600">{item.label}</span>
                              <div className="flex gap-2">
                                <span className="text-gray-400">{item.weight}</span>
                                <span className={`font-medium ${item.value >= 90 ? 'text-green-700' : item.value >= 80 ? 'text-blue-700' : 'text-yellow-700'}`}>{item.value}/100</span>
                              </div>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all ${item.value >= 90 ? 'bg-green-500' : item.value >= 80 ? 'bg-blue-500' : item.value >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${item.value}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Reviewer: <span className="font-medium text-gray-700">{selectedEmployee.reviewer}</span></p>
                        <p className="text-xs text-gray-500 mt-1">Catatan: Kinerja sangat baik, perlu pengembangan leadership skill untuk promosi jabatan</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'laporan' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: 'Laporan Rekap Kinerja Q1 2026', desc: 'Rekap seluruh karyawan per departemen', icon: FileText },
                { title: 'Laporan Grade Distribution', desc: 'Distribusi A-E per departemen & unit', icon: Award },
                { title: 'Laporan KPI Organisasi', desc: 'KPI tingkat organisasi rumah sakit', icon: Target },
                { title: 'Laporan Tren Kinerja', desc: 'Perbandingan kinerja antar periode', icon: TrendingUp },
                { title: 'Laporan Individual', desc: 'Laporan penilaian per individu karyawan', icon: Users },
                { title: 'Laporan Kebutuhan Pelatihan', desc: 'Analisis gap kompetensi & rekomendasi', icon: Medal },
              ].map((r, i) => (
                <div key={i} className="bg-white rounded-xl p-4 shadow-sm border flex items-center gap-3 hover:border-[#01544e] transition-colors cursor-pointer">
                  <div className="bg-green-100 p-3 rounded-xl"><r.icon className="w-5 h-5 text-[#01544e]" /></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{r.title}</p>
                    <p className="text-xs text-gray-500">{r.desc}</p>
                  </div>
                  <button className="flex items-center gap-1 text-xs text-[#01544e] hover:underline">
                    <Download className="w-3 h-3" /> Unduh
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
