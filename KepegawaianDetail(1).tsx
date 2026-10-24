import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  User, Calendar, DollarSign, Award, Clock, FileText, 
  Phone, Mail, MapPin, Briefcase, GraduationCap, TrendingUp,
  ArrowLeft, Edit, Download, CreditCard, Users, Activity,
  AlertCircle, CheckCircle, XCircle, ChevronRight, Building2,
  Heart, Shield, Banknote, TrendingDown, BarChart3, Eye,
  FileCheck, UserCheck, Target, Zap, Upload
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { EMPLOYEES, ATTENDANCE_SUMMARY, LEAVE_DATA, PERFORMANCE_DATA, SALARY_HISTORY, calculateMasaKerja, formatRupiah } from '../../lib/kepegawaianData';

interface Props {
  setActiveMenu?: (menu: string) => void;
}

export function KepegawaianDetail({ setActiveMenu }: Props) {
  const [selectedTab, setSelectedTab] = useState('profile');
  
  // Get employee data (first employee for demo)
  const emp = EMPLOYEES[0];

  const getStatusBadge = (status: string) => {
    const colors = {
      'Aktif': 'bg-green-100 text-green-800 border-green-200',
      'Cuti': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Tidak Aktif': 'bg-gray-100 text-gray-800 border-gray-200',
      'Disetujui': 'bg-green-100 text-green-800 border-green-200',
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Ditolak': 'bg-red-100 text-red-800 border-red-200',
    };
    return <Badge variant="outline" className={colors[status as keyof typeof colors]}>{status}</Badge>;
  };

  const getGradeBadge = (grade: string) => {
    const colors = {
      'A': 'bg-green-600',
      'B': 'bg-blue-600',
      'C': 'bg-yellow-600',
      'D': 'bg-orange-600',
      'E': 'bg-red-600',
    };
    return <Badge className={`${colors[grade as keyof typeof colors]} text-lg px-3 py-1 text-white`}>{grade}</Badge>;
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date('2024-11-22');
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Get attendance data for this employee
  const attendanceSummary = ATTENDANCE_SUMMARY;

  // Get leave data for this employee
  const leaveData = LEAVE_DATA.filter(l => l.nip === emp.nip);

  // Get performance data for this employee
  const performanceData = PERFORMANCE_DATA.filter(p => p.nip === emp.nip);

  // Get salary history for this employee
  const salaryHistory = SALARY_HISTORY.filter(s => s.nip === emp.nip);

  // Calculate total compensation
  const totalTunjangan = emp.tunjangan;
  const totalKompensasi = emp.gajiPokok + totalTunjangan;

  const COLORS = ['#3b82f6', '#8b5cf6', '#14b8a6', '#f59e0b', '#ef4444', '#06b6d4'];

  return (
    <div className="p-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setActiveMenu?.('kepegawaian')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
            <div className="flex items-center gap-3">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl ${
                emp.jenisKelamin === 'L' ? 'bg-blue-500' : 'bg-pink-500'
              }`}>
                <User className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl text-gray-900">{emp.nama}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-sm text-gray-500">{emp.nip}</p>
                  <span className="text-gray-300">•</span>
                  <p className="text-sm text-gray-500">{emp.jabatan}</p>
                  <span className="text-gray-300">•</span>
                  {getStatusBadge(emp.status)}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export Data
            </Button>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Edit className="w-4 h-4" />
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-1">Masa Kerja</p>
          <p className="text-xl text-gray-900">{calculateMasaKerja(emp.tglMasuk)}</p>
          <p className="text-xs text-gray-500 mt-1">Sejak {formatDate(emp.tglMasuk)}</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-1">Kehadiran</p>
          <p className="text-xl text-gray-900">96.5%</p>
          <p className="text-xs text-green-600 mt-1">Excellent</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-1">Performance</p>
          <p className="text-xl text-gray-900">{emp.performance || 95}</p>
          <p className="text-xs text-purple-600 mt-1">Grade A</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-1">Gaji Pokok</p>
          <p className="text-lg text-gray-900">{formatRupiah(emp.gajiPokok)}</p>
          <p className="text-xs text-gray-500 mt-1">Per bulan</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-teal-500">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-teal-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-1">Total Kompensasi</p>
          <p className="text-lg text-gray-900">{formatRupiah(totalKompensasi)}</p>
          <p className="text-xs text-gray-500 mt-1">Termasuk tunjangan</p>
        </Card>
      </div>

      {/* Main Content with Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-6 bg-white border border-gray-200 p-1">
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="attendance" className="gap-2">
            <Clock className="w-4 h-4" />
            Kehadiran
          </TabsTrigger>
          <TabsTrigger value="leave" className="gap-2">
            <Calendar className="w-4 h-4" />
            Cuti & Izin
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-2">
            <Award className="w-4 h-4" />
            Kinerja
          </TabsTrigger>
          <TabsTrigger value="salary" className="gap-2">
            <DollarSign className="w-4 h-4" />
            Penggajian
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="w-4 h-4" />
            Dokumen
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Personal Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Informasi Pribadi
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm text-gray-500">Nama Lengkap</label>
                      <p className="text-gray-900 mt-1">{emp.nama}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">NIP</label>
                      <p className="text-gray-900 mt-1">{emp.nip}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">NIK</label>
                      <p className="text-gray-900 mt-1">{emp.nik}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">NPWP</label>
                      <p className="text-gray-900 mt-1">{emp.npwp || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Jenis Kelamin</label>
                      <p className="text-gray-900 mt-1">{emp.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Tempat, Tanggal Lahir</label>
                      <p className="text-gray-900 mt-1">{emp.tempatLahir}, {formatDate(emp.tanggalLahir)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Usia</label>
                      <p className="text-gray-900 mt-1">{calculateAge(emp.tanggalLahir)} tahun</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Status Pernikahan</label>
                      <p className="text-gray-900 mt-1">{emp.statusPernikahan}</p>
                    </div>
                    {emp.jumlahAnak !== undefined && (
                      <div>
                        <label className="text-sm text-gray-500">Jumlah Anak</label>
                        <p className="text-gray-900 mt-1">{emp.jumlahAnak} anak</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-green-600" />
                    Informasi Kontak
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <label className="text-sm text-gray-500">Telepon</label>
                        <p className="text-gray-900">{emp.telepon}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Mail className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <label className="text-sm text-gray-500">Email</label>
                        <p className="text-gray-900">{emp.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <label className="text-sm text-gray-500">Alamat</label>
                        <p className="text-gray-900">{emp.alamat}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card>
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    Kontak Darurat
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">Nama</label>
                      <p className="text-gray-900 mt-1">{emp.kontakDarurat.nama}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Hubungan</label>
                      <p className="text-gray-900 mt-1">{emp.kontakDarurat.hubungan}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Telepon</label>
                      <p className="text-gray-900 mt-1">{emp.kontakDarurat.telepon}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Employment & Education */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-purple-600" />
                    Informasi Kepegawaian
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <label className="text-sm text-gray-500">Jabatan</label>
                    <p className="text-gray-900 mt-1">{emp.jabatan}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Departemen</label>
                    <Badge variant="outline" className="mt-1 bg-blue-50 text-blue-700 border-blue-200">
                      {emp.departemen}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Status Kepegawaian</label>
                    <div className="mt-1">{getStatusBadge(emp.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Jenis Kontrak</label>
                    <Badge variant="outline" className="mt-1 bg-purple-50 text-purple-700 border-purple-200">
                      {emp.kontrak}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Tanggal Bergabung</label>
                    <p className="text-gray-900 mt-1">{formatDate(emp.tglMasuk)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Masa Kerja</label>
                    <p className="text-gray-900 mt-1">{calculateMasaKerja(emp.tglMasuk)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-orange-600" />
                    Pendidikan
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div>
                    <label className="text-sm text-gray-500">Pendidikan Terakhir</label>
                    <p className="text-gray-900 mt-1">{emp.pendidikan}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-teal-600" />
                    Informasi Bank
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <label className="text-sm text-gray-500">Nama Bank</label>
                    <p className="text-gray-900 mt-1">{emp.bank}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Nomor Rekening</label>
                    <p className="text-gray-900 mt-1 font-mono">{emp.noRekening}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="border-b border-gray-100">
                  <CardTitle>Riwayat Kehadiran 2024</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ResponsiveContainer width="100%" height={350} minHeight={350}>
                    <BarChart data={attendanceSummary}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="bulan" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="hadir" name="Hadir" fill="#10b981" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="terlambat" name="Terlambat" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="izin" name="Izin" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="sakit" name="Sakit" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="alpha" name="Alpha" fill="#ef4444" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader className="border-b border-gray-100">
                  <CardTitle>Summary Kehadiran</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">Hadir</span>
                    </div>
                    <span className="text-gray-900">1323 hari</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm text-gray-700">Terlambat</span>
                    </div>
                    <span className="text-gray-900">58 kali</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-700">Izin</span>
                    </div>
                    <span className="text-gray-900">37 hari</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-gray-700">Sakit</span>
                    </div>
                    <span className="text-gray-900">28 hari</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-gray-700">Alpha</span>
                    </div>
                    <span className="text-gray-900">8 hari</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-teal-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-teal-600" />
                      <span className="text-sm text-gray-700">Cuti</span>
                    </div>
                    <span className="text-gray-900">30 hari</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Leave Tab */}
        <TabsContent value="leave">
          <Card>
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle>Riwayat Cuti & Izin</CardTitle>
                <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <Calendar className="w-4 h-4" />
                  Ajukan Cuti
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Jenis</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Tanggal Mulai</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Tanggal Selesai</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Durasi</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Alasan</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {leaveData.length > 0 ? leaveData.map((leave) => {
                      const start = new Date(leave.tanggalMulai);
                      const end = new Date(leave.tanggalSelesai);
                      const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                      
                      return (
                        <tr key={leave.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {leave.jenisCuti}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-700">{formatDate(leave.tanggalMulai)}</td>
                          <td className="px-4 py-4 text-sm text-gray-700">{formatDate(leave.tanggalSelesai)}</td>
                          <td className="px-4 py-4 text-sm text-gray-700">{duration} hari</td>
                          <td className="px-4 py-4 text-sm text-gray-700">{leave.alasan}</td>
                          <td className="px-4 py-4">{getStatusBadge(leave.status)}</td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          Tidak ada data cuti/izin
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="border-b border-gray-100">
                <CardTitle>Trend Penilaian Kinerja</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={300} minHeight={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="periode" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="kehadiran" name="Kehadiran" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="kinerja" name="Kinerja" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="kedisiplinan" name="Kedisiplinan" stroke="#f59e0b" strokeWidth={2} />
                    <Line type="monotone" dataKey="kerjasama" name="Kerjasama" stroke="#8b5cf6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {performanceData.length > 0 && (
              <Card>
                <CardHeader className="border-b border-gray-100">
                  <CardTitle>Radar Chart - {performanceData[performanceData.length - 1].periode}</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ResponsiveContainer width="100%" height={300} minHeight={300}>
                    <RadarChart data={[
                      { aspect: 'Kehadiran', value: performanceData[performanceData.length - 1].kehadiran },
                      { aspect: 'Kinerja', value: performanceData[performanceData.length - 1].kinerja },
                      { aspect: 'Kedisiplinan', value: performanceData[performanceData.length - 1].kedisiplinan },
                      { aspect: 'Kerjasama', value: performanceData[performanceData.length - 1].kerjasama },
                      { aspect: 'Kepemimpinan', value: performanceData[performanceData.length - 1].kepemimpinan || 90 },
                      { aspect: 'Inisiatif', value: performanceData[performanceData.length - 1].inisiatif || 90 },
                    ]}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="aspect" stroke="#6b7280" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#6b7280" />
                      <Radar name="Score" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            <Card className="lg:col-span-2">
              <CardHeader className="border-b border-gray-100">
                <CardTitle>Detail Penilaian Kinerja</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Periode</th>
                        <th className="px-4 py-3 text-center text-xs text-gray-500 uppercase tracking-wider">Kehadiran</th>
                        <th className="px-4 py-3 text-center text-xs text-gray-500 uppercase tracking-wider">Kinerja</th>
                        <th className="px-4 py-3 text-center text-xs text-gray-500 uppercase tracking-wider">Kedisiplinan</th>
                        <th className="px-4 py-3 text-center text-xs text-gray-500 uppercase tracking-wider">Kerjasama</th>
                        <th className="px-4 py-3 text-center text-xs text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-4 py-3 text-center text-xs text-gray-500 uppercase tracking-wider">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {performanceData.length > 0 ? performanceData.map((perf) => (
                        <tr key={perf.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 text-sm text-gray-900">{perf.periode}</td>
                          <td className="px-4 py-4 text-sm text-gray-700 text-center">{perf.kehadiran}</td>
                          <td className="px-4 py-4 text-sm text-gray-700 text-center">{perf.kinerja}</td>
                          <td className="px-4 py-4 text-sm text-gray-700 text-center">{perf.kedisiplinan}</td>
                          <td className="px-4 py-4 text-sm text-gray-700 text-center">{perf.kerjasama}</td>
                          <td className="px-4 py-4 text-sm text-gray-900 text-center">{perf.total}</td>
                          <td className="px-4 py-4 text-center">{getGradeBadge(perf.grade)}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                            Tidak ada data penilaian kinerja
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {performanceData.length > 0 && performanceData[performanceData.length - 1].catatan && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Catatan:</strong> {performanceData[performanceData.length - 1].catatan}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Salary Tab */}
        <TabsContent value="salary">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="border-b border-gray-100">
                  <CardTitle>Riwayat Gaji</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Bulan</th>
                          <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase tracking-wider">Gaji Pokok</th>
                          <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase tracking-wider">Tunjangan</th>
                          <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase tracking-wider">Bonus</th>
                          <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase tracking-wider">Potongan</th>
                          <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase tracking-wider">Total Terima</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {salaryHistory.length > 0 ? salaryHistory.map((sal) => {
                          const totalTunjangan = sal.tunjanganJabatan + sal.tunjanganKeluarga + sal.tunjanganKesehatan + 
                                               sal.tunjanganTransport + sal.tunjanganMakan;
                          const totalPotongan = sal.potonganBPJS + sal.potonganPajak + sal.potonganLainnya;
                          
                          return (
                            <tr key={sal.id} className="hover:bg-gray-50">
                              <td className="px-4 py-4 text-sm text-gray-900">{sal.bulan}</td>
                              <td className="px-4 py-4 text-sm text-gray-700 text-right">{formatRupiah(sal.gajiPokok)}</td>
                              <td className="px-4 py-4 text-sm text-green-600 text-right">+{formatRupiah(totalTunjangan)}</td>
                              <td className="px-4 py-4 text-sm text-blue-600 text-right">
                                {sal.bonus > 0 ? `+${formatRupiah(sal.bonus)}` : '-'}
                              </td>
                              <td className="px-4 py-4 text-sm text-red-600 text-right">-{formatRupiah(totalPotongan)}</td>
                              <td className="px-4 py-4 text-sm text-gray-900 text-right">{formatRupiah(sal.totalTerima)}</td>
                            </tr>
                          );
                        }) : (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                              Tidak ada data gaji
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader className="border-b border-gray-100">
                  <CardTitle>Komponen Gaji</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Gaji Pokok</span>
                    <span className="text-gray-900">{formatRupiah(emp.gajiPokok)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-gray-700">Tunjangan</span>
                    <span className="text-green-600">+{formatRupiah(emp.tunjangan)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900">Total Kompensasi</span>
                      <span className="text-xl text-gray-900">{formatRupiah(totalKompensasi)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="border-b border-gray-100">
                  <CardTitle>Informasi Bank</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <label className="text-sm text-gray-500">Bank</label>
                    <p className="text-gray-900 mt-1">{emp.bank}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Nomor Rekening</label>
                    <p className="text-gray-900 mt-1 font-mono">{emp.noRekening}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Atas Nama</label>
                    <p className="text-gray-900 mt-1">{emp.nama}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle>Dokumen Karyawan</CardTitle>
                <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <Upload className="w-4 h-4" />
                  Upload Dokumen
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['KTP', 'NPWP', 'Ijazah', 'Sertifikat', 'CV', 'Kontrak Kerja'].map((doc, idx) => (
                  <div key={idx} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm text-gray-900">{doc}</h4>
                        <p className="text-xs text-gray-500">PDF • 2.4 MB</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}