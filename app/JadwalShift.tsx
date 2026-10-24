import { useState } from 'react';
import {
  Calendar, Users, Clock, ChevronLeft, ChevronRight,
  Plus, Edit, Trash2, CheckCircle, AlertCircle, Download,
  Search, Filter, RotateCcw, Mic, Moon, Sun, Sunset,
  UserCheck, UserX, BarChart3, RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface JadwalShiftProps {
  setActiveMenu?: (menu: string) => void;
}

const SHIFTS = [
  { id: 'P', label: 'Pagi', jam: '07:00 - 14:00', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Sun },
  { id: 'S', label: 'Sore', jam: '14:00 - 21:00', color: 'bg-orange-100 text-orange-800 border-orange-300', icon: Sunset },
  { id: 'M', label: 'Malam', jam: '21:00 - 07:00', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: Moon },
  { id: 'L', label: 'Libur', jam: '-', color: 'bg-gray-100 text-gray-500 border-gray-200', icon: UserX },
];

const DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const DATES_FEB = [3, 4, 5, 6, 7, 8, 9]; // Week 1 of Feb 2026

const staffData = [
  { id: 1, nip: 'NIP-015', nama: 'Ns. Dewi Rahayu', jabatan: 'Kepala Ruang', departemen: 'ICU', shifts: ['P', 'P', 'S', 'S', 'M', 'L', 'L'] },
  { id: 2, nip: 'NIP-052', nama: 'Siti Aminah', jabatan: 'Perawat Pelaksana', departemen: 'Rawat Inap', shifts: ['P', 'L', 'P', 'M', 'M', 'S', 'L'] },
  { id: 3, nip: 'NIP-063', nama: 'Eko Prasetyo', jabatan: 'Perawat IGD', departemen: 'IGD', shifts: ['M', 'M', 'L', 'P', 'P', 'S', 'S'] },
  { id: 4, nip: 'NIP-071', nama: 'Lina Marlina', jabatan: 'Bidan Pelaksana', departemen: 'VK/Nifas', shifts: ['S', 'P', 'P', 'L', 'M', 'M', 'P'] },
  { id: 5, nip: 'NIP-082', nama: 'Andi Wijaya', jabatan: 'Perawat ICU', departemen: 'ICU', shifts: ['L', 'S', 'S', 'P', 'L', 'M', 'M'] },
  { id: 6, nip: 'NIP-091', nama: 'Ratna Sari', jabatan: 'Perawat Pelaksana', departemen: 'Rawat Inap', shifts: ['P', 'P', 'M', 'M', 'S', 'L', 'P'] },
  { id: 7, nip: 'NIP-103', nama: 'Budi Hartono', jabatan: 'Perawat OK', departemen: 'Kamar Operasi', shifts: ['P', 'S', 'L', 'P', 'P', 'L', 'S'] },
  { id: 8, nip: 'NIP-112', nama: 'Yunita Sari', jabatan: 'Perawat IGD', departemen: 'IGD', shifts: ['M', 'L', 'M', 'S', 'P', 'P', 'L'] },
];

const shiftStatsData = [
  { departemen: 'ICU', pagi: 8, sore: 6, malam: 8, libur: 6 },
  { departemen: 'IGD', pagi: 10, sore: 8, malam: 10, libur: 8 },
  { departemen: 'Rawat Inap', pagi: 14, sore: 12, malam: 10, libur: 12 },
  { departemen: 'VK/Nifas', pagi: 6, sore: 4, malam: 6, libur: 4 },
  { departemen: 'OK', pagi: 8, sore: 4, malam: 2, libur: 6 },
];

const cutiData = [
  { nip: 'NIP-052', nama: 'Siti Aminah', dept: 'Rawat Inap', tgl: '10-12 Feb 2026', jenis: 'Cuti Tahunan', status: 'Approved', sisa: 8 },
  { nip: 'NIP-091', nama: 'Ratna Sari', dept: 'Rawat Inap', tgl: '15 Feb 2026', jenis: 'Izin', status: 'Pending', sisa: 12 },
  { nip: 'NIP-082', nama: 'Andi Wijaya', dept: 'ICU', tgl: '18-20 Feb 2026', jenis: 'Cuti Sakit', status: 'Approved', sisa: 14 },
  { nip: 'NIP-063', nama: 'Eko Prasetyo', dept: 'IGD', tgl: '24-25 Feb 2026', jenis: 'Cuti Tahunan', status: 'Pending', sisa: 6 },
];

export function JadwalShift({ setActiveMenu }: JadwalShiftProps) {
  const [activeTab, setActiveTab] = useState<'jadwal' | 'template' | 'cuti' | 'statistik'>('jadwal');
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [filterDept, setFilterDept] = useState('all');
  const [search, setSearch] = useState('');
  const [editCell, setEditCell] = useState<{ row: number; col: number } | null>(null);
  const [scheduleData, setScheduleData] = useState(staffData);

  const getShiftInfo = (shiftId: string) => SHIFTS.find(s => s.id === shiftId) || SHIFTS[3];

  const handleShiftChange = (rowIdx: number, colIdx: number, newShift: string) => {
    setScheduleData(prev => prev.map((staff, i) => {
      if (i === rowIdx) {
        const newShifts = [...staff.shifts];
        newShifts[colIdx] = newShift;
        return { ...staff, shifts: newShifts };
      }
      return staff;
    }));
    setEditCell(null);
  };

  const filteredStaff = scheduleData.filter(s => {
    const matchDept = filterDept === 'all' || s.departemen === filterDept;
    const matchSearch = s.nama.toLowerCase().includes(search.toLowerCase()) || s.nip.toLowerCase().includes(search.toLowerCase());
    return matchDept && matchSearch;
  });

  // Count shifts per day
  const countPerDay = DAYS.map((_, dayIdx) => ({
    pagi: filteredStaff.filter(s => s.shifts[dayIdx] === 'P').length,
    sore: filteredStaff.filter(s => s.shifts[dayIdx] === 'S').length,
    malam: filteredStaff.filter(s => s.shifts[dayIdx] === 'M').length,
    libur: filteredStaff.filter(s => s.shifts[dayIdx] === 'L').length,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#01544e] text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-7 h-7" />
            <div>
              <h1 className="text-xl font-semibold">Jadwal Shift Karyawan</h1>
              <p className="text-sm text-green-200">Februari 2026 · SIMRS IntraHospital</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="bg-white/20 border border-white/30 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-white/30">
              <RefreshCw className="w-4 h-4" /> Generate Otomatis
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
            { key: 'jadwal', label: 'Jadwal Mingguan', icon: Calendar },
            { key: 'template', label: 'Template Shift', icon: RotateCcw },
            { key: 'cuti', label: 'Permohonan Cuti', icon: UserCheck },
            { key: 'statistik', label: 'Statistik', icon: BarChart3 },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-5 py-3 text-sm border-b-2 transition-colors ${activeTab === tab.key ? 'border-[#01544e] text-[#01544e] font-medium' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'jadwal' && (
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Total Staf Terjadwal', value: '248', sub: 'Semua departemen', icon: Users, color: 'bg-[#01544e]' },
                { label: 'Shift Pagi Hari Ini', value: '82', sub: '07:00 - 14:00', icon: Sun, color: 'bg-yellow-500' },
                { label: 'Shift Sore Hari Ini', value: '61', sub: '14:00 - 21:00', icon: Sunset, color: 'bg-orange-500' },
                { label: 'Shift Malam Hari Ini', value: '55', sub: '21:00 - 07:00', icon: Moon, color: 'bg-blue-600' },
              ].map((c, i) => (
                <div key={i} className="bg-white rounded-xl p-4 shadow-sm border flex items-center gap-4">
                  <div className={`${c.color} p-3 rounded-xl`}><c.icon className="w-5 h-5 text-white" /></div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">{c.value}</div>
                    <div className="text-sm text-gray-500">{c.label}</div>
                    <div className="text-xs text-gray-400">{c.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Shift Legend */}
            <div className="bg-white rounded-xl p-4 shadow-sm border flex items-center gap-6 flex-wrap">
              <span className="text-sm font-medium text-gray-600">Keterangan Shift:</span>
              {SHIFTS.map(s => (
                <div key={s.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${s.color}`}>
                  <s.icon className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">{s.label} ({s.id})</span>
                  <span className="text-xs opacity-70">{s.jam}</span>
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="bg-white rounded-xl p-4 shadow-sm border flex flex-wrap gap-3 items-center">
              {/* Week Navigation */}
              <div className="flex items-center gap-2 border rounded-lg overflow-hidden">
                <button className="p-2 hover:bg-gray-100" onClick={() => setSelectedWeek(w => Math.max(0, w - 1))}>
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <span className="text-sm font-medium px-3 text-gray-700">
                  {selectedWeek === 0 ? '3 - 9 Feb 2026' : selectedWeek === 1 ? '10 - 16 Feb 2026' : selectedWeek === 2 ? '17 - 23 Feb 2026' : '24 - 28 Feb 2026'}
                </span>
                <button className="p-2 hover:bg-gray-100" onClick={() => setSelectedWeek(w => Math.min(3, w + 1))}>
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Cari staf..."
                  className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#01544e]/30" />
              </div>
              <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none">
                <option value="all">Semua Departemen</option>
                <option>ICU</option>
                <option>IGD</option>
                <option>Rawat Inap</option>
                <option>VK/Nifas</option>
                <option>Kamar Operasi</option>
              </select>
              <button className="ml-auto bg-[#01544e] text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-[#01544e]/90">
                <Plus className="w-4 h-4" /> Tambah Jadwal
              </button>
            </div>

            {/* Schedule Grid */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#01544e] text-white">
                    <th className="text-left py-3 px-4 font-medium w-56">Nama / Departemen</th>
                    {DAYS.map((day, i) => (
                      <th key={day} className="text-center py-3 px-2 font-medium">
                        <div>{day}</div>
                        <div className="text-green-300 text-xs">{DATES_FEB[i] + selectedWeek * 7} Feb</div>
                      </th>
                    ))}
                    <th className="text-center py-3 px-4 font-medium">Total Kerja</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((staff, rowIdx) => {
                    const workDays = staff.shifts.filter(s => s !== 'L').length;
                    return (
                      <tr key={staff.id} className="border-b hover:bg-gray-50">
                        <td className="py-2.5 px-4">
                          <div className="font-medium text-gray-800 text-xs">{staff.nama}</div>
                          <div className="text-xs text-gray-400">{staff.nip} · {staff.departemen}</div>
                          <div className="text-xs text-blue-600">{staff.jabatan}</div>
                        </td>
                        {staff.shifts.map((shiftId, colIdx) => {
                          const shift = getShiftInfo(shiftId);
                          const isEditing = editCell?.row === rowIdx && editCell?.col === colIdx;
                          return (
                            <td key={colIdx} className="py-2 px-1 text-center">
                              {isEditing ? (
                                <select
                                  autoFocus
                                  className="border rounded px-1 py-1 text-xs w-full"
                                  defaultValue={shiftId}
                                  onChange={e => handleShiftChange(rowIdx, colIdx, e.target.value)}
                                  onBlur={() => setEditCell(null)}
                                >
                                  {SHIFTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                </select>
                              ) : (
                                <button
                                  onClick={() => setEditCell({ row: rowIdx, col: colIdx })}
                                  className={`px-2 py-1 rounded-lg border text-xs font-medium w-full transition-all hover:opacity-80 ${shift.color}`}
                                >
                                  {shiftId}
                                </button>
                              )}
                            </td>
                          );
                        })}
                        <td className="py-2 px-4 text-center">
                          <span className={`text-sm font-semibold ${workDays >= 5 ? 'text-green-700' : workDays >= 4 ? 'text-orange-600' : 'text-red-600'}`}>
                            {workDays}/7
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {/* Daily Summary */}
                  <tr className="bg-gray-50 border-t-2 border-gray-300">
                    <td className="py-2.5 px-4 font-medium text-gray-700 text-xs">Total per Hari</td>
                    {countPerDay.map((c, i) => (
                      <td key={i} className="py-2 px-1 text-center">
                        <div className="text-xs space-y-0.5">
                          <div className="text-yellow-700">P:{c.pagi}</div>
                          <div className="text-orange-700">S:{c.sore}</div>
                          <div className="text-blue-700">M:{c.malam}</div>
                        </div>
                      </td>
                    ))}
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'template' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[
                { title: 'Template Shift Reguler', dept: 'Rawat Inap', pattern: ['P', 'P', 'S', 'S', 'M', 'L', 'L'], desc: 'Rotasi 3 shift standar' },
                { title: 'Template Shift IGD', dept: 'IGD', pattern: ['P', 'S', 'M', 'L', 'P', 'S', 'L'], desc: 'Prioritas malam & libur' },
                { title: 'Template Shift ICU', dept: 'ICU', pattern: ['M', 'M', 'L', 'P', 'P', 'S', 'L'], desc: 'Shift malam intensif' },
                { title: 'Template Shift OK', dept: 'Kamar Operasi', pattern: ['P', 'P', 'P', 'S', 'S', 'L', 'L'], desc: 'Pagi & sore dominan' },
                { title: 'Template Shift Poliklinik', dept: 'Rawat Jalan', pattern: ['P', 'P', 'P', 'P', 'P', 'L', 'L'], desc: 'Hanya pagi weekday' },
                { title: 'Template Custom', dept: 'Semua', pattern: ['P', 'S', 'M', 'P', 'S', 'M', 'L'], desc: 'Template kustom' },
              ].map((t, i) => (
                <div key={i} className="bg-white rounded-xl p-5 shadow-sm border hover:border-[#01544e] transition-colors cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-800">{t.title}</h4>
                      <p className="text-xs text-gray-500">{t.dept} · {t.desc}</p>
                    </div>
                    <div className="flex gap-1">
                      <button className="p-1.5 text-gray-400 hover:text-[#01544e] rounded"><Edit className="w-4 h-4" /></button>
                      <button className="p-1.5 text-gray-400 hover:text-red-500 rounded"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {DAYS.map((day, j) => {
                      const shift = getShiftInfo(t.pattern[j]);
                      return (
                        <div key={j} className="flex-1 text-center">
                          <div className="text-xs text-gray-400 mb-1">{day}</div>
                          <div className={`text-xs font-medium px-1 py-1 rounded border ${shift.color}`}>{t.pattern[j]}</div>
                        </div>
                      );
                    })}
                  </div>
                  <button className="mt-3 w-full text-xs text-[#01544e] border border-[#01544e] py-1.5 rounded-lg hover:bg-green-50">
                    Terapkan Template
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'cuti' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Permohonan Cuti & Izin</h3>
                <button className="bg-[#01544e] text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Ajukan Cuti
                </button>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-y">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Nama / NIP</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Departemen</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Tanggal</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Jenis Cuti</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Sisa Cuti</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {cutiData.map((c, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-800">{c.nama}</div>
                        <div className="text-xs text-gray-400">{c.nip}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{c.dept}</td>
                      <td className="py-3 px-4 text-gray-700">{c.tgl}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">{c.jenis}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-sm font-medium ${c.sisa <= 6 ? 'text-orange-600' : 'text-green-700'}`}>{c.sisa} hari</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {c.status === 'Pending' && (
                            <>
                              <button className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100">
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100">
                                <AlertCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button className="p-1.5 bg-gray-50 text-gray-500 rounded hover:bg-gray-100">
                            <Edit className="w-4 h-4" />
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

        {activeTab === 'statistik' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-5 shadow-sm border">
                <h3 className="font-semibold text-gray-800 mb-4">Distribusi Shift per Departemen</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={shiftStatsData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="departemen" type="category" tick={{ fontSize: 11 }} width={80} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="pagi" name="Pagi" fill="#f59e0b" radius={[0,2,2,0]} />
                    <Bar dataKey="sore" name="Sore" fill="#f97316" radius={[0,2,2,0]} />
                    <Bar dataKey="malam" name="Malam" fill="#3b82f6" radius={[0,2,2,0]} />
                    <Bar dataKey="libur" name="Libur" fill="#9ca3af" radius={[0,2,2,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border">
                <h3 className="font-semibold text-gray-800 mb-4">Ringkasan Absensi Bulan Ini</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Total Hari Kerja', value: '20 hari', color: 'text-gray-800' },
                    { label: 'Rata-rata Kehadiran', value: '95.8%', color: 'text-green-700' },
                    { label: 'Total Staf Terjadwal', value: '248 orang', color: 'text-blue-700' },
                    { label: 'Shift Pagi Total', value: '1,640 shift', color: 'text-yellow-700' },
                    { label: 'Shift Sore Total', value: '1,220 shift', color: 'text-orange-700' },
                    { label: 'Shift Malam Total', value: '1,100 shift', color: 'text-blue-700' },
                    { label: 'Cuti Disetujui', value: '24 orang', color: 'text-purple-700' },
                    { label: 'Izin Pending', value: '6 permohonan', color: 'text-orange-600' },
                  ].map((r, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-dashed border-gray-100 last:border-0">
                      <span className="text-sm text-gray-600">{r.label}</span>
                      <span className={`text-sm font-semibold ${r.color}`}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
