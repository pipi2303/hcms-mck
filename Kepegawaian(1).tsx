import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { 
  Users, 
  Search, 
  Plus, 
  UserCheck, 
  Download, 
  Upload, 
  Filter, 
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  Calendar,
  Award,
  Clock,
  Building2,
  ArrowRight,
  TrendingUp,
  UserPlus,
  Activity,
  FileText,
  ChevronDown,
  Grid,
  List,
  Briefcase,
  GraduationCap,
  BarChart3
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { EMPLOYEES, getEmployeeStatistics, getDepartmentDistribution } from '../../lib/kepegawaianData';

interface Props {
  setActiveMenu: (menu: string) => void;
}

export function Kepegawaian({ setActiveMenu }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedEmployee, setSelectedEmployee] = useState<typeof EMPLOYEES[0] | null>(null);

  const filteredEmployees = EMPLOYEES.filter(e => {
    const matchesSearch = 
      e.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.jabatan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === 'all' || e.departemen === filterDept;
    const matchesStatus = filterStatus === 'all' || e.status === filterStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  // Statistics
  const totalEmployees = EMPLOYEES.length;
  const dokter = EMPLOYEES.filter(e => e.jabatan.includes('Dokter')).length;
  const perawat = EMPLOYEES.filter(e => e.jabatan.includes('Perawat') || e.jabatan.includes('Kepala Ruangan')).length;
  const staff = totalEmployees - dokter - perawat;
  const aktif = EMPLOYEES.filter(e => e.status === 'Aktif').length;

  // Department distribution with more data
  const departments = ['Rawat Jalan', 'Rawat Inap', 'IGD', 'Bedah', 'Laboratorium', 'Farmasi', 'Anak', 'Obstetri', 'ICU'];
  const deptData = departments.map(dept => ({
    name: dept,
    value: EMPLOYEES.filter(e => e.departemen === dept).length,
    avgSalary: EMPLOYEES.filter(e => e.departemen === dept).reduce((sum, e) => sum + e.gajiPokok, 0) / 
               Math.max(EMPLOYEES.filter(e => e.departemen === dept).length, 1)
  })).filter(d => d.value > 0);

  // Position distribution
  const positionData = [
    { name: 'Dokter Spesialis', value: EMPLOYEES.filter(e => e.jabatan === 'Dokter Spesialis').length, color: '#3b82f6' },
    { name: 'Dokter Umum', value: EMPLOYEES.filter(e => e.jabatan === 'Dokter Umum').length, color: '#60a5fa' },
    { name: 'Perawat', value: EMPLOYEES.filter(e => e.jabatan === 'Perawat').length, color: '#10b981' },
    { name: 'Kepala Ruangan', value: EMPLOYEES.filter(e => e.jabatan === 'Kepala Ruangan').length, color: '#059669' },
    { name: 'Apoteker', value: EMPLOYEES.filter(e => e.jabatan === 'Apoteker').length, color: '#f59e0b' },
    { name: 'Analis Lab', value: EMPLOYEES.filter(e => e.jabatan === 'Analis Lab').length, color: '#8b5cf6' },
  ].filter(p => p.value > 0);

  // Education Distribution
  const educationData = [
    { name: 'S2 Spesialis', value: EMPLOYEES.filter(e => e.pendidikan === 'S2 Spesialis').length },
    { name: 'S1 Kedokteran', value: EMPLOYEES.filter(e => e.pendidikan === 'S1 Kedokteran').length },
    { name: 'S1 Keperawatan', value: EMPLOYEES.filter(e => e.pendidikan === 'S1 Keperawatan').length },
    { name: 'D3 Keperawatan', value: EMPLOYEES.filter(e => e.pendidikan === 'D3 Keperawatan').length },
    { name: 'S1 Farmasi', value: EMPLOYEES.filter(e => e.pendidikan === 'S1 Farmasi').length },
    { name: 'D3 Analis Kesehatan', value: EMPLOYEES.filter(e => e.pendidikan === 'D3 Analis Kesehatan').length },
  ].filter(e => e.value > 0);

  const COLORS = ['#3b82f6', '#8b5cf6', '#14b8a6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#10b981'];

  const getStatusBadge = (status: string) => {
    const colors = {
      'Aktif': 'bg-green-100 text-green-800 border-green-200',
      'Cuti': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Tidak Aktif': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return <Badge variant="outline" className={colors[status as keyof typeof colors]}>{status}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateTenure = (tglMasuk: string) => {
    const start = new Date(tglMasuk);
    const now = new Date();
    const years = now.getFullYear() - start.getFullYear();
    const months = now.getMonth() - start.getMonth();
    const totalMonths = years * 12 + months;
    
    if (totalMonths < 12) return `${totalMonths} bulan`;
    return `${years} tahun ${months} bulan`;
  };

  return (
    <div className="p-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl text-gray-900">Data Kepegawaian</h1>
              <p className="text-sm text-gray-500">Manajemen karyawan rumah sakit</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => setActiveMenu('kepegawaian-dashboard')}
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
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <UserPlus className="w-4 h-4" />
              Tambah Karyawan
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats - Clickable */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card 
          className="p-4 cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-blue-500"
          onClick={() => setActiveMenu('kepegawaian-dashboard')}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 mb-1">Total Karyawan</p>
          <p className="text-2xl text-gray-900">{totalEmployees}</p>
          <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>Aktif: {aktif}</span>
          </div>
        </Card>

        <Card 
          className="p-4 cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-purple-500"
          onClick={() => setFilterDept('all')}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-purple-600" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 mb-1">Dokter</p>
          <p className="text-2xl text-gray-900">{dokter}</p>
          <p className="text-xs text-gray-500 mt-1">Spesialis & Umum</p>
        </Card>

        <Card 
          className="p-4 cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-green-500"
          onClick={() => setFilterDept('all')}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 mb-1">Perawat</p>
          <p className="text-2xl text-gray-900">{perawat}</p>
          <p className="text-xs text-gray-500 mt-1">Termasuk Kepala Ruang</p>
        </Card>

        <Card 
          className="p-4 cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-orange-500"
          onClick={() => setFilterDept('all')}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-orange-600" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 mb-1">Staff Lainnya</p>
          <p className="text-2xl text-gray-900">{staff}</p>
          <p className="text-xs text-gray-500 mt-1">Tenaga Pendukung</p>
        </Card>

        <Card 
          className="p-4 cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-teal-500"
          onClick={() => setActiveMenu('kepegawaian-absensi')}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-teal-600" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 mb-1">Kehadiran</p>
          <p className="text-2xl text-gray-900">95.5%</p>
          <p className="text-xs text-green-600 mt-1">Hari ini</p>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Department Distribution */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg text-gray-900 mb-1">Distribusi Departemen</h3>
              <p className="text-sm text-gray-500">Karyawan per unit</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setActiveMenu('kepegawaian-dashboard')}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
          <ResponsiveContainer width="100%" height={250} minHeight={250}>
            <BarChart data={deptData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={10} angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                {deptData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Position Distribution */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg text-gray-900 mb-1">Distribusi Jabatan</h3>
              <p className="text-sm text-gray-500">Breakdown posisi</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setActiveMenu('kepegawaian-dashboard')}
            >
              <FileText className="w-4 h-4" />
            </Button>
          </div>
          <ResponsiveContainer width="100%" height={250} minHeight={250}>
            <PieChart>
              <Pie
                data={positionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {positionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Education Distribution */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg text-gray-900 mb-1">Tingkat Pendidikan</h3>
              <p className="text-sm text-gray-500">Kualifikasi karyawan</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setActiveMenu('kepegawaian-dashboard')}
            >
              <GraduationCap className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-3">
            {educationData.map((edu, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 flex-1">
                  <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-sm text-gray-700">{edu.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{ 
                        width: `${(edu.value / totalEmployees) * 100}%`,
                        backgroundColor: COLORS[index % COLORS.length]
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-900 w-8 text-right">{edu.value}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Cari nama, NIP, atau jabatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Departemen</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Cuti">Cuti</option>
              <option value="Tidak Aktif">Tidak Aktif</option>
            </select>
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
          <span>Menampilkan {filteredEmployees.length} dari {totalEmployees} karyawan</span>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span>{filterDept !== 'all' && `${filterDept}, `}{filterStatus !== 'all' && filterStatus}</span>
          </div>
        </div>
      </Card>

      {/* Employee Cards - Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {filteredEmployees.map((employee) => (
            <Card 
              key={employee.id} 
              className="p-5 cursor-pointer hover:shadow-xl transition-all duration-300 border-t-4 border-t-blue-500"
              onClick={() => setActiveMenu('kepegawaian-detail')}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${
                    employee.jenisKelamin === 'L' ? 'bg-blue-500' : 'bg-pink-500'
                  }`}>
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900 line-clamp-1">{employee.nama}</p>
                    <p className="text-xs text-gray-500">{employee.nip}</p>
                  </div>
                </div>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-600 line-clamp-1">{employee.jabatan}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-600">{employee.departemen}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-600">{calculateTenure(employee.tglMasuk)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                {getStatusBadge(employee.status)}
                {employee.performance && (
                  <div className="flex items-center gap-1">
                    <Award className="w-3 h-3 text-orange-500" />
                    <span className="text-xs text-gray-600">{employee.performance}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenu('kepegawaian-detail');
                  }}
                >
                  <Eye className="w-3 h-3" />
                  Detail
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Edit className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Employee Table - List View */}
      {viewMode === 'list' && (
        <Card className="overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Karyawan</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Jabatan</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Departemen</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Pendidikan</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Masa Kerja</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Performance</th>
                  <th className="px-4 py-3 text-center text-xs text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredEmployees.map((employee) => (
                  <tr 
                    key={employee.id} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setActiveMenu('kepegawaian-detail')}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                          employee.jenisKelamin === 'L' ? 'bg-blue-500' : 'bg-pink-500'
                        }`}>
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-900">{employee.nama}</p>
                          <p className="text-xs text-gray-500">{employee.nip}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">{employee.jabatan}</td>
                    <td className="px-4 py-4">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {employee.departemen}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">{employee.pendidikan}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{calculateTenure(employee.tglMasuk)}</td>
                    <td className="px-4 py-4">{getStatusBadge(employee.status)}</td>
                    <td className="px-4 py-4">
                      {employee.performance && (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[60px]">
                            <div
                              className={`h-2 rounded-full ${
                                employee.performance >= 95 ? 'bg-green-500' :
                                employee.performance >= 90 ? 'bg-blue-500' :
                                'bg-yellow-500'
                              }`}
                              style={{ width: `${employee.performance}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-700 w-8">{employee.performance}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenu('kepegawaian-detail');
                          }}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className="p-5 cursor-pointer hover:shadow-lg transition-all bg-gradient-to-br from-blue-50 to-white"
          onClick={() => setActiveMenu('kepegawaian-absensi')}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm text-gray-900">Kelola Absensi</h3>
              <p className="text-xs text-gray-500">Monitor kehadiran karyawan</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
        </Card>

        <Card 
          className="p-5 cursor-pointer hover:shadow-lg transition-all bg-gradient-to-br from-purple-50 to-white"
          onClick={() => setActiveMenu('kepegawaian-detail')}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm text-gray-900">Penilaian Kinerja</h3>
              <p className="text-xs text-gray-500">Evaluasi performa karyawan</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
        </Card>

        <Card 
          className="p-5 cursor-pointer hover:shadow-lg transition-all bg-gradient-to-br from-green-50 to-white"
          onClick={() => setActiveMenu('keuangan')}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm text-gray-900">Laporan Penggajian</h3>
              <p className="text-xs text-gray-500">Data gaji dan tunjangan</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
        </Card>
      </div>
    </div>
  );
}