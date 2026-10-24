import { useState } from 'react';
import { 
  DollarSign, Users, FileText, Download, Search, Filter, 
  CheckCircle, Clock, AlertCircle, ChevronDown, ChevronUp,
  TrendingUp, TrendingDown, Printer, Send, Eye, Edit,
  Calculator, CreditCard, Banknote, Building2, User,
  Calendar, BarChart3, PieChart, ArrowUpRight, Mic, Shield
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart as RePieChart, Pie, Cell } from 'recharts';
import React from 'react';

interface PayrollManagementProps {
  setActiveMenu?: (menu: string) => void;
}

const payrollData = [
  { bulan: 'Sep', total: 2850000000, pokok: 1980000000, tunjangan: 620000000, lembur: 250000000 },
  { bulan: 'Okt', total: 2920000000, pokok: 2010000000, tunjangan: 640000000, lembur: 270000000 },
  { bulan: 'Nov', total: 3100000000, pokok: 2050000000, tunjangan: 680000000, lembur: 370000000 },
  { bulan: 'Des', total: 3450000000, pokok: 2100000000, tunjangan: 700000000, lembur: 650000000 },
  { bulan: 'Jan', total: 2980000000, pokok: 2050000000, tunjangan: 660000000, lembur: 270000000 },
  { bulan: 'Feb', total: 3050000000, pokok: 2080000000, tunjangan: 670000000, lembur: 300000000 },
];

const departemenPayroll = [
  { name: 'Rawat Jalan', value: 18 },
  { name: 'Rawat Inap', value: 22 },
  { name: 'IGD', value: 12 },
  { name: 'Laboratorium', value: 8 },
  { name: 'Radiologi', value: 7 },
  { name: 'Farmasi', value: 9 },
  { name: 'Operasi', value: 14 },
  { name: 'Lainnya', value: 10 },
];

const COLORS = ['#01544e', '#047857', '#059669', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5', '#ecfdf5'];

const payrollList = [
  { id: 'PAY-2026-02-001', nip: 'NIP-001', nama: 'Dr. Sarah Johnson, Sp.PD', jabatan: 'Dokter Spesialis PD', departemen: 'Rawat Jalan', gajiPokok: 25000000, tunjanganJabatan: 5000000, tunjanganKeluarga: 1500000, tunjanganKesehatan: 800000, tunjanganTransport: 600000, tunjanganMakan: 500000, lembur: 1200000, bonus: 0, potonganBPJS: 1350000, potonganPajak: 2800000, potonganLain: 0, totalTerima: 30450000, status: 'Diproses', bank: 'Bank Mandiri', rekening: '1234-5678-9012' },
  { id: 'PAY-2026-02-002', nip: 'NIP-002', nama: 'Dr. Ahmad Fauzi, Sp.B', jabatan: 'Dokter Spesialis Bedah', departemen: 'Kamar Operasi', gajiPokok: 28000000, tunjanganJabatan: 6000000, tunjanganKeluarga: 2000000, tunjanganKesehatan: 800000, tunjanganTransport: 600000, tunjanganMakan: 500000, lembur: 2500000, bonus: 0, potonganBPJS: 1500000, potonganPajak: 3500000, potonganLain: 0, totalTerima: 35400000, status: 'Diproses', bank: 'BRI', rekening: '0987-6543-2101' },
  { id: 'PAY-2026-02-003', nip: 'NIP-015', nama: 'Ns. Dewi Rahayu, S.Kep', jabatan: 'Kepala Ruang ICU', departemen: 'ICU', gajiPokok: 8500000, tunjanganJabatan: 1500000, tunjanganKeluarga: 1000000, tunjanganKesehatan: 600000, tunjanganTransport: 500000, tunjanganMakan: 400000, lembur: 800000, bonus: 0, potonganBPJS: 680000, potonganPajak: 950000, potonganLain: 0, totalTerima: 11670000, status: 'Approved', bank: 'BNI', rekening: '5678-9012-3456' },
  { id: 'PAY-2026-02-004', nip: 'NIP-023', nama: 'Hendra Setiawan', jabatan: 'Apoteker', departemen: 'Farmasi', gajiPokok: 7000000, tunjanganJabatan: 1200000, tunjanganKeluarga: 500000, tunjanganKesehatan: 600000, tunjanganTransport: 500000, tunjanganMakan: 400000, lembur: 350000, bonus: 0, potonganBPJS: 556000, potonganPajak: 720000, potonganLain: 0, totalTerima: 9274000, status: 'Approved', bank: 'BCA', rekening: '7890-1234-5678' },
  { id: 'PAY-2026-02-005', nip: 'NIP-031', nama: 'Rini Kusumawati', jabatan: 'Analis Laboratorium', departemen: 'Laboratorium', gajiPokok: 5500000, tunjanganJabatan: 800000, tunjanganKeluarga: 500000, tunjanganKesehatan: 600000, tunjanganTransport: 500000, tunjanganMakan: 400000, lembur: 480000, bonus: 0, potonganBPJS: 440000, potonganPajak: 530000, potonganLain: 0, totalTerima: 7810000, status: 'Approved', bank: 'Bank Mandiri', rekening: '2345-6789-0123' },
  { id: 'PAY-2026-02-006', nip: 'NIP-047', nama: 'Budi Santoso', jabatan: 'Radiografer', departemen: 'Radiologi', gajiPokok: 6000000, tunjanganJabatan: 900000, tunjanganKeluarga: 1000000, tunjanganKesehatan: 600000, tunjanganTransport: 500000, tunjanganMakan: 400000, lembur: 600000, bonus: 0, potonganBPJS: 480000, potonganPajak: 650000, potonganLain: 0, totalTerima: 8870000, status: 'Draft', bank: 'BTN', rekening: '3456-7890-1234' },
  { id: 'PAY-2026-02-007', nip: 'NIP-052', nama: 'Siti Aminah', jabatan: 'Perawat Pelaksana', departemen: 'Rawat Inap', gajiPokok: 4800000, tunjanganJabatan: 600000, tunjanganKeluarga: 0, tunjanganKesehatan: 600000, tunjanganTransport: 500000, tunjanganMakan: 400000, lembur: 320000, bonus: 0, potonganBPJS: 375000, potonganPajak: 420000, potonganLain: 0, totalTerima: 6425000, status: 'Draft', bank: 'BRI', rekening: '4567-8901-2345' },
  { id: 'PAY-2026-02-008', nip: 'NIP-058', nama: 'Joko Widodo', jabatan: 'Staf Administrasi', departemen: 'Administrasi', gajiPokok: 4000000, tunjanganJabatan: 400000, tunjanganKeluarga: 500000, tunjanganKesehatan: 600000, tunjanganTransport: 500000, tunjanganMakan: 400000, lembur: 160000, bonus: 0, potonganBPJS: 300000, potonganPajak: 340000, potonganLain: 0, totalTerima: 5920000, status: 'Draft', bank: 'BNI', rekening: '5678-0123-4567' },
];

const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
const formatCompact = (val: number) => {
  if (val >= 1000000000) return `Rp ${(val / 1000000000).toFixed(1)}M`;
  if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(0)}jt`;
  return `Rp ${val.toLocaleString('id-ID')}`;
};

export function PayrollManagement({ setActiveMenu }: PayrollManagementProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'proses' | 'slip' | 'laporan'>('dashboard');
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPeriode, setSelectedPeriode] = useState('Februari 2026');
  const [selectedEmployee, setSelectedEmployee] = useState<typeof payrollList[0] | null>(null);
  const [showSlip, setShowSlip] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const filtered = payrollList.filter(p => {
    const matchSearch = p.nama.toLowerCase().includes(search.toLowerCase()) || p.nip.toLowerCase().includes(search.toLowerCase());
    const matchDept = filterDept === 'all' || p.departemen === filterDept;
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchDept && matchStatus;
  });

  const totalGaji = payrollList.reduce((s, p) => s + p.totalTerima, 0);
  const totalApproved = payrollList.filter(p => p.status === 'Approved').reduce((s, p) => s + p.totalTerima, 0);
  const countPending = payrollList.filter(p => p.status === 'Draft').length;

  const statusColor = (s: string) => {
    if (s === 'Approved') return 'bg-green-100 text-green-700';
    if (s === 'Diproses') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#01544e] text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Banknote className="w-7 h-7" />
            <div>
              <h1 className="text-xl font-semibold">Manajemen Penggajian (Payroll)</h1>
              <p className="text-sm text-green-200">Periode: {selectedPeriode} · SIMRS IntraHospital</p>
            </div>
          </div>
          <div className="flex gap-2">
            <select value={selectedPeriode} onChange={e => setSelectedPeriode(e.target.value)}
              className="bg-white/20 border border-white/30 text-white text-sm px-3 py-2 rounded-lg">
              <option>Februari 2026</option>
              <option>Januari 2026</option>
              <option>Desember 2025</option>
            </select>
            <button className="bg-white text-[#01544e] px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-green-50">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b px-6">
        <div className="flex gap-0">
          {[
            { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { key: 'proses', label: 'Proses Gaji', icon: DollarSign },
            { key: 'slip', label: 'Slip Gaji', icon: FileText },
            { key: 'laporan', label: 'Laporan', icon: TrendingUp },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-5 py-3 text-sm border-b-2 transition-colors ${activeTab === tab.key ? 'border-[#01544e] text-[#01544e] font-medium' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Total Penggajian', value: formatCompact(totalGaji), sub: 'Februari 2026', icon: Banknote, color: 'bg-[#01544e]', change: '+3.2%' },
                { label: 'Total Karyawan', value: '248 org', sub: '8 departemen', icon: Users, color: 'bg-blue-600', change: '+2 baru' },
                { label: 'Sudah Diproses', value: formatCompact(totalApproved), sub: `${payrollList.filter(p => p.status === 'Approved').length} karyawan`, icon: CheckCircle, color: 'bg-emerald-600', change: '65%' },
                { label: 'Pending Approval', value: `${countPending} slip`, sub: 'Menunggu persetujuan', icon: Clock, color: 'bg-orange-500', change: 'Segera' },
              ].map((c, i) => (
                <div key={i} className="bg-white rounded-xl p-5 shadow-sm border">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`${c.color} p-2.5 rounded-lg`}>
                      <c.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{c.change}</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-800">{c.value}</div>
                  <div className="text-sm text-gray-500 mt-1">{c.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{c.sub}</div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 bg-white rounded-xl p-5 shadow-sm border">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#01544e]" /> Tren Penggajian 6 Bulan Terakhir
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={payrollData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="bulan" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={v => `${(v/1000000000).toFixed(1)}M`} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => formatCompact(v)} />
                    <Legend />
                    <Bar dataKey="pokok" name="Gaji Pokok" fill="#01544e" radius={[2,2,0,0]} />
                    <Bar dataKey="tunjangan" name="Tunjangan" fill="#059669" radius={[2,2,0,0]} />
                    <Bar dataKey="lembur" name="Lembur" fill="#34d399" radius={[2,2,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-[#01544e]" /> Distribusi per Departemen
                </h3>
                <ResponsiveContainer width="100%" height={160}>
                  <RePieChart>
                    <Pie data={departemenPayroll} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                      {departemenPayroll.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => `${v}%`} />
                  </RePieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {departemenPayroll.slice(0, 5).map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS[i] }}></div>
                        <span className="text-gray-600">{d.name}</span>
                      </div>
                      <span className="font-medium text-gray-700">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary by Dept */}
            <div className="bg-white rounded-xl p-5 shadow-sm border">
              <h3 className="font-semibold text-gray-800 mb-4">Ringkasan Penggajian per Departemen</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-y">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Departemen</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Jumlah SDM</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Total Gaji Pokok</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Total Tunjangan</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Total Lembur</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Grand Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { dept: 'Rawat Jalan', sdm: 42, pokok: 580000000, tunjangan: 120000000, lembur: 45000000 },
                      { dept: 'Rawat Inap', sdm: 58, pokok: 680000000, tunjangan: 145000000, lembur: 62000000 },
                      { dept: 'IGD', sdm: 32, pokok: 420000000, tunjangan: 98000000, lembur: 87000000 },
                      { dept: 'Kamar Operasi', sdm: 28, pokok: 510000000, tunjangan: 112000000, lembur: 54000000 },
                      { dept: 'ICU', sdm: 24, pokok: 380000000, tunjangan: 85000000, lembur: 72000000 },
                      { dept: 'Laboratorium', sdm: 18, pokok: 210000000, tunjangan: 48000000, lembur: 22000000 },
                      { dept: 'Farmasi', sdm: 22, pokok: 250000000, tunjangan: 55000000, lembur: 18000000 },
                      { dept: 'Radiologi', sdm: 14, pokok: 180000000, tunjangan: 42000000, lembur: 24000000 },
                    ].map((row, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-800">{row.dept}</td>
                        <td className="py-3 px-4 text-right text-gray-600">{row.sdm} org</td>
                        <td className="py-3 px-4 text-right text-gray-700">{formatCompact(row.pokok)}</td>
                        <td className="py-3 px-4 text-right text-gray-700">{formatCompact(row.tunjangan)}</td>
                        <td className="py-3 px-4 text-right text-gray-700">{formatCompact(row.lembur)}</td>
                        <td className="py-3 px-4 text-right font-semibold text-[#01544e]">{formatCompact(row.pokok + row.tunjangan + row.lembur)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-[#01544e]/5 font-semibold">
                      <td className="py-3 px-4 text-[#01544e]">TOTAL</td>
                      <td className="py-3 px-4 text-right text-[#01544e]">248 org</td>
                      <td className="py-3 px-4 text-right text-[#01544e]">{formatCompact(3210000000)}</td>
                      <td className="py-3 px-4 text-right text-[#01544e]">{formatCompact(705000000)}</td>
                      <td className="py-3 px-4 text-right text-[#01544e]">{formatCompact(384000000)}</td>
                      <td className="py-3 px-4 text-right text-[#01544e]">{formatCompact(4299000000)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Proses Gaji Tab */}
        {activeTab === 'proses' && (
          <div className="space-y-4">
            {/* Status Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">Proses Penggajian Februari 2026 Sedang Berjalan</p>
                <p className="text-sm text-blue-600">Progress: 155/248 slip telah diproses (62.5%) · Deadline: 28 Feb 2026</p>
              </div>
              <div className="ml-auto flex gap-2">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">Proses Semua</button>
                <button className="bg-white border border-blue-300 text-blue-600 px-4 py-2 rounded-lg text-sm hover:bg-blue-50">Export Draft</button>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm border flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Cari nama/NIP..."
                  className="pl-9 pr-4 py-2 border rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#01544e]/30" />
              </div>
              <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#01544e]/30">
                <option value="all">Semua Departemen</option>
                <option>Rawat Jalan</option>
                <option>Rawat Inap</option>
                <option>ICU</option>
                <option>Farmasi</option>
                <option>Laboratorium</option>
                <option>Radiologi</option>
                <option>Administrasi</option>
                <option>Kamar Operasi</option>
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#01544e]/30">
                <option value="all">Semua Status</option>
                <option>Draft</option>
                <option>Diproses</option>
                <option>Approved</option>
              </select>
              <div className="flex gap-2 ml-auto">
                <button className="bg-[#01544e] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#01544e]/90 flex items-center gap-2">
                  <Calculator className="w-4 h-4" /> Hitung Otomatis
                </button>
                <button className="border border-[#01544e] text-[#01544e] px-4 py-2 rounded-lg text-sm hover:bg-green-50 flex items-center gap-2">
                  <Send className="w-4 h-4" /> Approve All
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 w-8">
                      <input type="checkbox" className="rounded" />
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">NIP / Nama</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Departemen</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Gaji Pokok</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Tunjangan</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Lembur</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Potongan</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Total Terima</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <React.Fragment key={p.id}>
                      <tr className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4"><input type="checkbox" className="rounded" /></td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-800">{p.nama}</div>
                          <div className="text-xs text-gray-400">{p.nip} · {p.jabatan}</div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{p.departemen}</td>
                        <td className="py-3 px-4 text-right text-gray-700">{formatCurrency(p.gajiPokok)}</td>
                        <td className="py-3 px-4 text-right text-green-700">{formatCurrency(p.tunjanganJabatan + p.tunjanganKeluarga + p.tunjanganKesehatan + p.tunjanganTransport + p.tunjanganMakan)}</td>
                        <td className="py-3 px-4 text-right text-blue-700">{formatCurrency(p.lembur)}</td>
                        <td className="py-3 px-4 text-right text-red-600">-{formatCurrency(p.potonganBPJS + p.potonganPajak + p.potonganLain)}</td>
                        <td className="py-3 px-4 text-right font-semibold text-[#01544e]">{formatCurrency(p.totalTerima)}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(p.status)}`}>{p.status}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => setExpandedRow(expandedRow === p.id ? null : p.id)}
                              className="p-1.5 text-gray-400 hover:text-[#01544e] hover:bg-green-50 rounded">
                              {expandedRow === p.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                            <button onClick={() => { setSelectedEmployee(p); setShowSlip(true); }}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded">
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedRow === p.id && (
                        <tr key={`${p.id}-detail`} className="bg-blue-50/50 border-b">
                          <td colSpan={10} className="py-4 px-6">
                            <div className="grid grid-cols-4 gap-4 text-xs">
                              <div>
                                <p className="font-medium text-gray-700 mb-2">Komponen Tunjangan</p>
                                <div className="space-y-1">
                                  <div className="flex justify-between"><span className="text-gray-500">Tj. Jabatan</span><span>{formatCurrency(p.tunjanganJabatan)}</span></div>
                                  <div className="flex justify-between"><span className="text-gray-500">Tj. Keluarga</span><span>{formatCurrency(p.tunjanganKeluarga)}</span></div>
                                  <div className="flex justify-between"><span className="text-gray-500">Tj. Kesehatan</span><span>{formatCurrency(p.tunjanganKesehatan)}</span></div>
                                  <div className="flex justify-between"><span className="text-gray-500">Tj. Transport</span><span>{formatCurrency(p.tunjanganTransport)}</span></div>
                                  <div className="flex justify-between"><span className="text-gray-500">Tj. Makan</span><span>{formatCurrency(p.tunjanganMakan)}</span></div>
                                </div>
                              </div>
                              <div>
                                <p className="font-medium text-gray-700 mb-2">Potongan</p>
                                <div className="space-y-1">
                                  <div className="flex justify-between"><span className="text-gray-500">BPJS TK</span><span className="text-red-600">-{formatCurrency(p.potonganBPJS)}</span></div>
                                  <div className="flex justify-between"><span className="text-gray-500">PPh 21</span><span className="text-red-600">-{formatCurrency(p.potonganPajak)}</span></div>
                                  <div className="flex justify-between"><span className="text-gray-500">Lain-lain</span><span className="text-red-600">-{formatCurrency(p.potonganLain)}</span></div>
                                </div>
                              </div>
                              <div>
                                <p className="font-medium text-gray-700 mb-2">Bank & Rekening</p>
                                <div className="space-y-1">
                                  <div className="flex justify-between"><span className="text-gray-500">Bank</span><span>{p.bank}</span></div>
                                  <div className="flex justify-between"><span className="text-gray-500">No. Rek</span><span>{p.rekening}</span></div>
                                </div>
                              </div>
                              <div className="flex items-end justify-end gap-2">
                                <button className="bg-[#01544e] text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" /> Approve
                                </button>
                                <button className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-1">
                                  <Printer className="w-3 h-3" /> Cetak Slip
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Slip Gaji Tab */}
        {activeTab === 'slip' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border">
              <h3 className="font-semibold text-gray-800 mb-4">Pencarian Slip Gaji</h3>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input placeholder="Cari NIP atau Nama Karyawan..."
                    className="pl-9 pr-4 py-2 border rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#01544e]/30" />
                </div>
                <select className="border rounded-lg px-3 py-2 text-sm">
                  <option>Februari 2026</option>
                  <option>Januari 2026</option>
                  <option>Desember 2025</option>
                </select>
                <button className="bg-[#01544e] text-white px-4 py-2 rounded-lg text-sm">Cari</button>
              </div>
            </div>
            {/* Slip Gaji Preview */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="bg-[#01544e] text-white p-6 text-center">
                <h2 className="text-lg font-bold">SLIP GAJI KARYAWAN</h2>
                <p className="text-green-200 text-sm">RSUD IntraHospital · Periode: Februari 2026</p>
                <p className="text-green-200 text-xs mt-1">Jl. Kesehatan No. 1, Jakarta · Telp: (021) 123-4567</p>
              </div>
              <div className="p-6">
                {/* Employee Info */}
                <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b">
                  <div className="space-y-2">
                    {[
                      { l: 'NIP', v: 'NIP-001' },
                      { l: 'Nama', v: 'Dr. Sarah Johnson, Sp.PD' },
                      { l: 'Jabatan', v: 'Dokter Spesialis Penyakit Dalam' },
                      { l: 'Departemen', v: 'Rawat Jalan' },
                    ].map((r, i) => (
                      <div key={i} className="flex gap-2 text-sm">
                        <span className="text-gray-500 w-28">{r.l}</span>
                        <span className="text-gray-300">:</span>
                        <span className="font-medium text-gray-800">{r.v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {[
                      { l: 'Bank', v: 'Bank Mandiri' },
                      { l: 'No. Rekening', v: '1234-5678-9012' },
                      { l: 'NPWP', v: '12.345.678.9-012.000' },
                      { l: 'Status', v: 'Menikah / 2 Anak' },
                    ].map((r, i) => (
                      <div key={i} className="flex gap-2 text-sm">
                        <span className="text-gray-500 w-28">{r.l}</span>
                        <span className="text-gray-300">:</span>
                        <span className="font-medium text-gray-800">{r.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Salary Details */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-green-800 bg-green-50 px-3 py-2 rounded-lg mb-3">PENGHASILAN</h4>
                    <div className="space-y-2 text-sm">
                      {[
                        { l: 'Gaji Pokok', v: 25000000 },
                        { l: 'Tunjangan Jabatan', v: 5000000 },
                        { l: 'Tunjangan Keluarga', v: 1500000 },
                        { l: 'Tunjangan Kesehatan', v: 800000 },
                        { l: 'Tunjangan Transport', v: 600000 },
                        { l: 'Tunjangan Makan', v: 500000 },
                        { l: 'Upah Lembur', v: 1200000 },
                      ].map((r, i) => (
                        <div key={i} className="flex justify-between py-1 border-b border-dashed border-gray-100">
                          <span className="text-gray-600">{r.l}</span>
                          <span className="font-medium">{formatCurrency(r.v)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between py-2 font-semibold text-green-700 border-t-2 border-green-300">
                        <span>TOTAL PENGHASILAN</span>
                        <span>{formatCurrency(35600000)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-800 bg-red-50 px-3 py-2 rounded-lg mb-3">POTONGAN</h4>
                    <div className="space-y-2 text-sm">
                      {[
                        { l: 'BPJS Ketenagakerjaan', v: 1350000 },
                        { l: 'PPh Pasal 21', v: 2800000 },
                        { l: 'Iuran Koperasi', v: 200000 },
                        { l: 'Tabungan Hari Tua', v: 800000 },
                      ].map((r, i) => (
                        <div key={i} className="flex justify-between py-1 border-b border-dashed border-gray-100">
                          <span className="text-gray-600">{r.l}</span>
                          <span className="font-medium text-red-600">-{formatCurrency(r.v)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between py-2 font-semibold text-red-700 border-t-2 border-red-200">
                        <span>TOTAL POTONGAN</span>
                        <span>-{formatCurrency(5150000)}</span>
                      </div>
                    </div>
                    {/* Net */}
                    <div className="mt-6 bg-[#01544e] text-white p-4 rounded-xl">
                      <p className="text-green-200 text-sm">GAJI BERSIH DITERIMA</p>
                      <p className="text-2xl font-bold mt-1">{formatCurrency(30450000)}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <button className="flex items-center gap-2 border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                  <button className="flex items-center gap-2 bg-[#01544e] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#01544e]/90">
                    <Printer className="w-4 h-4" /> Cetak Slip
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Laporan Tab */}
        {activeTab === 'laporan' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-5 shadow-sm border">
                <h3 className="font-semibold text-gray-800 mb-4">Tren Penggajian Tahunan</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={payrollData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="bulan" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={v => `${(v/1000000000).toFixed(1)}M`} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => formatCompact(v)} />
                    <Legend />
                    <Line type="monotone" dataKey="total" name="Total Payroll" stroke="#01544e" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border">
                <h3 className="font-semibold text-gray-800 mb-4">Rekap Laporan</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Laporan Gaji Bulanan', desc: 'Rekap penggajian per bulan', icon: FileText },
                    { label: 'Laporan PPh 21', desc: 'Rekapitulasi pajak penghasilan', icon: Calculator },
                    { label: 'Laporan BPJS TK', desc: 'Iuran BPJS Ketenagakerjaan', icon: Shield },
                    { label: 'Laporan Lembur', desc: 'Rekap lembur per departemen', icon: Clock },
                    { label: 'Laporan Tunjangan', desc: 'Rincian komponen tunjangan', icon: TrendingUp },
                  ].map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-green-50 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-lg"><r.icon className="w-4 h-4 text-[#01544e]" /></div>
                        <div>
                          <p className="font-medium text-sm text-gray-800">{r.label}</p>
                          <p className="text-xs text-gray-500">{r.desc}</p>
                        </div>
                      </div>
                      <button className="text-xs text-[#01544e] hover:underline flex items-center gap-1">
                        <Download className="w-3 h-3" /> Unduh
                      </button>
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