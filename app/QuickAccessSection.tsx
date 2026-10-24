import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Users, Calendar, Award, DollarSign, ArrowRight } from 'lucide-react';

interface Props {
  setActiveMenu: (menu: string) => void;
}

export function QuickAccessSection({ setActiveMenu }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        className="p-5 cursor-pointer hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-white border-blue-100"
        onClick={() => setActiveMenu('kepegawaian')}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-sm text-gray-900">Data Karyawan</h3>
        </div>
        <p className="text-xs text-gray-500 mb-3">Kelola profil & data lengkap karyawan</p>
        <Button variant="outline" size="sm" className="w-full gap-2 border-blue-200 hover:bg-blue-50">
          Buka
          <ArrowRight className="w-3 h-3" />
        </Button>
      </Card>

      <Card
        className="p-5 cursor-pointer hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-white border-green-100"
        onClick={() => setActiveMenu('kepegawaian-absensi')}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-sm text-gray-900">Absensi</h3>
        </div>
        <p className="text-xs text-gray-500 mb-3">Monitor kehadiran & ketidakhadiran</p>
        <Button variant="outline" size="sm" className="w-full gap-2 border-green-200 hover:bg-green-50">
          Buka
          <ArrowRight className="w-3 h-3" />
        </Button>
      </Card>

      <Card
        className="p-5 cursor-pointer hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-white border-purple-100"
        onClick={() => setActiveMenu('kepegawaian-detail')}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Award className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-sm text-gray-900">Penilaian Kinerja</h3>
        </div>
        <p className="text-xs text-gray-500 mb-3">Evaluasi & assessment performa</p>
        <Button variant="outline" size="sm" className="w-full gap-2 border-purple-200 hover:bg-purple-50">
          Buka
          <ArrowRight className="w-3 h-3" />
        </Button>
      </Card>

      <Card
        className="p-5 cursor-pointer hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-white border-orange-100"
        onClick={() => setActiveMenu('keuangan')}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-orange-600" />
          </div>
          <h3 className="text-sm text-gray-900">Penggajian</h3>
        </div>
        <p className="text-xs text-gray-500 mb-3">Kelola gaji, tunjangan & benefit</p>
        <Button variant="outline" size="sm" className="w-full gap-2 border-orange-200 hover:bg-orange-50">
          Buka
          <ArrowRight className="w-3 h-3" />
        </Button>
      </Card>
    </div>
  );
}
