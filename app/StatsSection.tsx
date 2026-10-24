import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  Users, UserCheck, Clock, DollarSign, TrendingUp,
  Activity, Award, Calendar, ArrowRight, Stethoscope,
  Heart, Zap, UserPlus,
  CheckCircle,
} from 'lucide-react';

interface Props {
  stats: any;
  setActiveMenu: (menu: string) => void;
  formatCurrencyShort: (amount: number) => string;
}

export function StatsSection({ stats, setActiveMenu, formatCurrencyShort }: Props) {
  return (
    <>
      {/* Main Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card
          className="p-5 cursor-pointer hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-white"
          onClick={() => setActiveMenu('kepegawaian')}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Aktif</Badge>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-1">Total Karyawan</p>
          <p className="text-3xl text-gray-900 mb-2">{stats.totalKaryawan}</p>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-blue-600">Tetap: {stats.tetap}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-600">Kontrak: {stats.kontrak}</span>
            </div>
          </div>
        </Card>

        <Card
          className="p-5 cursor-pointer hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-white"
          onClick={() => setActiveMenu('kepegawaian-absensi')}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {((stats.hadir / stats.totalKaryawan) * 100).toFixed(1)}%
              </Badge>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-1">Hadir Hari Ini</p>
          <p className="text-3xl text-gray-900 mb-2">{stats.hadir}</p>
          <div className="flex items-center gap-1 text-xs text-green-600">
            <TrendingUp className="w-3 h-3" />
            <span>+2.3% dari kemarin</span>
          </div>
        </Card>

        <Card
          className="p-5 cursor-pointer hover:shadow-xl transition-all duration-300 border-l-4 border-l-yellow-500 bg-gradient-to-br from-yellow-50 to-white"
          onClick={() => setActiveMenu('kepegawaian-absensi')}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                {stats.izin + stats.cuti + stats.sakit}
              </Badge>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-1">Tidak Hadir</p>
          <p className="text-3xl text-gray-900 mb-2">{stats.izin + stats.cuti + stats.sakit}</p>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-yellow-600">Izin: {stats.izin}</span>
            <span className="text-orange-600">Cuti: {stats.cuti}</span>
            <span className="text-red-600">Sakit: {stats.sakit}</span>
          </div>
        </Card>

        <Card
          className="p-5 cursor-pointer hover:shadow-xl transition-all duration-300 border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-white"
          onClick={() => setActiveMenu('keuangan')}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">/Bulan</Badge>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-1">Total Gaji</p>
          <p className="text-2xl text-gray-900 mb-2">{formatCurrencyShort(stats.totalGaji)}</p>
          <div className="flex items-center gap-1 text-xs text-purple-600">
            <TrendingUp className="w-3 h-3" />
            <span>Termasuk tunjangan</span>
          </div>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        <Card className="p-3 cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-br from-blue-50 to-white" onClick={() => setActiveMenu('kepegawaian')}>
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
              <Stethoscope className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500 mb-1">Dokter Spesialis</p>
            <p className="text-xl text-gray-900">{stats.dokterSpesialis}</p>
          </div>
        </Card>

        <Card className="p-3 cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-br from-teal-50 to-white" onClick={() => setActiveMenu('kepegawaian')}>
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mb-2">
              <UserCheck className="w-5 h-5 text-teal-600" />
            </div>
            <p className="text-xs text-gray-500 mb-1">Dokter Umum</p>
            <p className="text-xl text-gray-900">{stats.dokterUmum}</p>
          </div>
        </Card>

        <Card className="p-3 cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-br from-green-50 to-white" onClick={() => setActiveMenu('kepegawaian')}>
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-2">
              <Heart className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 mb-1">Perawat</p>
            <p className="text-xl text-gray-900">{stats.perawat}</p>
          </div>
        </Card>

        <Card className="p-3 cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-br from-pink-50 to-white" onClick={() => setActiveMenu('kepegawaian')}>
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center mb-2">
              <Activity className="w-5 h-5 text-pink-600" />
            </div>
            <p className="text-xs text-gray-500 mb-1">Bidan</p>
            <p className="text-xl text-gray-900">{stats.bidan}</p>
          </div>
        </Card>

        <Card className="p-3 cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-br from-yellow-50 to-white" onClick={() => setActiveMenu('kepegawaian-absensi')}>
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-xs text-gray-500 mb-1">Terlambat</p>
            <p className="text-xl text-gray-900">{stats.terlambat}</p>
          </div>
        </Card>

        <Card className="p-3 cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-br from-orange-50 to-white" onClick={() => setActiveMenu('kepegawaian-absensi')}>
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-2">
              <Zap className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-xs text-gray-500 mb-1">Lembur</p>
            <p className="text-xl text-gray-900">{stats.lembur}</p>
          </div>
        </Card>

        <Card className="p-3 cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-br from-purple-50 to-white" onClick={() => setActiveMenu('kepegawaian')}>
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
              <UserPlus className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-xs text-gray-500 mb-1">Rekrut Baru</p>
            <p className="text-xl text-gray-900">{stats.rekrutBulanIni}</p>
          </div>
        </Card>

        <Card className="p-3 cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-br from-indigo-50 to-white" onClick={() => setActiveMenu('kepegawaian-detail')}>
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-2">
              <Award className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-xs text-gray-500 mb-1">Promosi</p>
            <p className="text-xl text-gray-900">{stats.promosiBulanIni}</p>
          </div>
        </Card>
      </div>
    </>
  );
}
