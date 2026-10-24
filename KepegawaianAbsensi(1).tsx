import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { 
  Clock, Search, Calendar, CheckCircle, XCircle, AlertCircle, Download, 
  Upload, Filter, Users, Activity, TrendingUp, ArrowRight, Eye, BarChart3,
  UserCheck, UserX, Timer, FileText, ChevronRight, Building2
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { ATTENDANCE_DATA, ATTENDANCE_SUMMARY, EMPLOYEES, getAttendanceByDate, getAttendanceStatistics } from '../../lib/kepegawaianData';

interface Props {
  setActiveMenu?: (menu: string) => void;
}

export function KepegawaianAbsensi({ setActiveMenu }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDate, setSelectedDate] = useState('2024-11-22');

  // Get attendance records for selected date
  const attendanceRecords = getAttendanceByDate(selectedDate);
  const attStats = getAttendanceStatistics();

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = 
      (record.nip || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.nama || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.departemen || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const configs = {
      'Hadir': { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
      'Terlambat': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertCircle },
      'Izin': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: AlertCircle },
      'Sakit': { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertCircle },
      'Alpha': { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
      'Cuti': { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Calendar },
    };
    const config = configs[status as keyof typeof configs] || configs['Hadir'];
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  // Statistics for pie chart
  const statusDistribution = [
    { name: 'Hadir', value: attStats.hadir, color: '#10b981' },
    { name: 'Terlambat', value: attStats.terlambat, color: '#f59e0b' },
    { name: 'Izin', value: attStats.izin, color: '#3b82f6' },
    { name: 'Sakit', value: attStats.sakit, color: '#f97316' },
    { name: 'Alpha', value: attStats.alpha, color: '#ef4444' },
    { name: 'Cuti', value: attStats.cuti, color: '#8b5cf6' },
  ].filter(item => item.value > 0);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <div className="p-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl text-gray-900">Absensi Karyawan</h1>
              <p className="text-sm text-gray-500">Monitoring kehadiran harian</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => setActiveMenu?.('kepegawaian-dashboard')}
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button variant="outline" className="gap-2">
              <Upload className="w-4 h-4" />
              Import
            </Button>
            <Button className="gap-2 bg-teal-600 hover:bg-teal-700">
              <Calendar className="w-4 h-4" />
              Rekap Bulanan
            </Button>
          </div>
        </div>
      </div>

      {/* Date Selector & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <Card className="lg:col-span-4 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <label className="text-sm text-gray-500">Tanggal Absensi</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="mt-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="ml-4 pl-4 border-l border-gray-200">
                <p className="text-sm text-gray-500">Hari ini</p>
                <p className="text-gray-900">{formatDate(selectedDate)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1.5">
                Total Karyawan: {EMPLOYEES.length}
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1.5">
                Kehadiran: {((attStats.hadir / attStats.total) * 100).toFixed(1)}%
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Card 
          className="p-4 cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-green-500"
          onClick={() => setFilterStatus('Hadir')}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 mb-1">Hadir</p>
          <p className="text-2xl text-gray-900">{attStats.hadir}</p>
          <p className="text-xs text-green-600 mt-1">
            {((attStats.hadir / attStats.total) * 100).toFixed(0)}%
          </p>
        </Card>

        <Card 
          className="p-4 cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-yellow-500"
          onClick={() => setFilterStatus('Terlambat')}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Timer className="w-5 h-5 text-yellow-600" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 mb-1">Terlambat</p>
          <p className="text-2xl text-gray-900">{attStats.terlambat}</p>
          <p className="text-xs text-yellow-600 mt-1">
            {((attStats.terlambat / attStats.total) * 100).toFixed(0)}%
          </p>
        </Card>

        <Card 
          className="p-4 cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-blue-500"
          onClick={() => setFilterStatus('Izin')}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 mb-1">Izin</p>
          <p className="text-2xl text-gray-900">{attStats.izin}</p>
          <p className="text-xs text-blue-600 mt-1">
            {((attStats.izin / attStats.total) * 100).toFixed(0)}%
          </p>
        </Card>

        <Card 
          className="p-4 cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-orange-500"
          onClick={() => setFilterStatus('Sakit')}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-orange-600" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 mb-1">Sakit</p>
          <p className="text-2xl text-gray-900">{attStats.sakit}</p>
          <p className="text-xs text-orange-600 mt-1">
            {((attStats.sakit / attStats.total) * 100).toFixed(0)}%
          </p>
        </Card>

        <Card 
          className="p-4 cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-red-500"
          onClick={() => setFilterStatus('Alpha')}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <UserX className="w-5 h-5 text-red-600" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 mb-1">Alpha</p>
          <p className="text-2xl text-gray-900">{attStats.alpha}</p>
          <p className="text-xs text-red-600 mt-1">
            {((attStats.alpha / attStats.total) * 100).toFixed(0)}%
          </p>
        </Card>

        <Card 
          className="p-4 cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-purple-500"
          onClick={() => setFilterStatus('Cuti')}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 mb-1">Cuti</p>
          <p className="text-2xl text-gray-900">{attStats.cuti}</p>
          <p className="text-xs text-purple-600 mt-1">
            {((attStats.cuti / attStats.total) * 100).toFixed(0)}%
          </p>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Monthly Trend */}
        <Card className="lg:col-span-2">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center justify-between">
              <CardTitle>Trend Kehadiran Bulanan 2024</CardTitle>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300} minHeight={300}>
              <AreaChart data={ATTENDANCE_SUMMARY}>
                <defs>
                  <linearGradient id="colorHadir" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTerlambat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="bulan" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="hadir" name="Hadir" stroke="#10b981" fillOpacity={1} fill="url(#colorHadir)" />
                <Area type="monotone" dataKey="terlambat" name="Terlambat" stroke="#f59e0b" fillOpacity={1} fill="url(#colorTerlambat)" />
                <Line type="monotone" dataKey="izin" name="Izin" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="sakit" name="Sakit" stroke="#f97316" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution Today */}
        <Card>
          <CardHeader className="border-b border-gray-100">
            <CardTitle>Distribusi Status Hari Ini</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300} minHeight={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Cari NIP, nama, atau departemen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">Semua Status</option>
              <option value="Hadir">Hadir</option>
              <option value="Terlambat">Terlambat</option>
              <option value="Izin">Izin</option>
              <option value="Sakit">Sakit</option>
              <option value="Alpha">Alpha</option>
              <option value="Cuti">Cuti</option>
            </select>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter Lainnya
            </Button>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
          <span>Menampilkan {filteredRecords.length} dari {attendanceRecords.length} absensi</span>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{formatDate(selectedDate)}</span>
          </div>
        </div>
      </Card>

      {/* Attendance Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">No</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">NIP</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Nama Karyawan</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Departemen</th>
                <th className="px-4 py-3 text-center text-xs text-gray-500 uppercase tracking-wider">Jam Masuk</th>
                <th className="px-4 py-3 text-center text-xs text-gray-500 uppercase tracking-wider">Jam Keluar</th>
                <th className="px-4 py-3 text-center text-xs text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Keterangan</th>
                <th className="px-4 py-3 text-center text-xs text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredRecords.length > 0 ? filteredRecords.map((record, index) => (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 text-sm text-gray-700">{index + 1}</td>
                  <td className="px-4 py-4 text-sm text-gray-900 font-mono">{record.nip}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${
                        EMPLOYEES.find(e => e.nip === record.nip)?.jenisKelamin === 'L' 
                          ? 'bg-blue-500' 
                          : 'bg-pink-500'
                      }`}>
                        {record.nama.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">{record.nama}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {record.departemen}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700 text-center font-mono">
                    {record.jamMasuk || '-'}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700 text-center font-mono">
                    {record.jamKeluar || '-'}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {getStatusBadge(record.status)}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {record.keterangan || '-'}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveMenu?.('kepegawaian-detail')}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    Tidak ada data absensi untuk tanggal ini
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card className="p-5 bg-gradient-to-br from-green-50 to-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm text-gray-900">Kehadiran Rate</h3>
              <p className="text-2xl text-green-600">{((attStats.hadir / attStats.total) * 100).toFixed(1)}%</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">Target: 95% kehadiran per bulan</p>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-yellow-50 to-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Timer className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm text-gray-900">Keterlambatan</h3>
              <p className="text-2xl text-yellow-600">{attStats.terlambat}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">Perlu perhatian khusus</p>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-blue-50 to-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm text-gray-900">Total Karyawan</h3>
              <p className="text-2xl text-blue-600">{EMPLOYEES.length}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">Karyawan aktif saat ini</p>
        </Card>
      </div>
    </div>
  );
}