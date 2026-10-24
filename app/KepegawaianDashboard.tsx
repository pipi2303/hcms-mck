import { useState } from 'react';
import { Button } from '../ui/button';
import { Search, Download, UserPlus, BarChart3 } from 'lucide-react';
import { EMPLOYEES, getEmployeeStatistics } from '../../lib/kepegawaianData';
import { StatsSection } from './StatsSection';
import { ChartsSection } from './ChartsSection';
import { TrainingRecruitmentSection } from './TrainingRecruitmentSection';
import { AnalyticsSection } from './AnalyticsSection';
import { ActivitiesSection } from './ActivitiesSection';
import { EventsSection } from './EventsSection';
import { QuickAccessSection } from './QuickAccessSection';

interface Props {
  setActiveMenu: (menu: string) => void;
}

export function KepegawaianDashboard({ setActiveMenu }: Props) {
  const [timeFilter, setTimeFilter] = useState('today');

  const empStats = getEmployeeStatistics();

  const stats = {
    totalKaryawan: empStats.totalEmployees,
    dokterSpesialis: EMPLOYEES.filter(e => e.jabatan.includes('Spesialis')).length,
    dokterUmum: EMPLOYEES.filter(e => e.jabatan === 'Dokter Umum').length,
    perawat: 185,
    bidan: 32,
    staff: 225,
    hadir: 465,
    izin: 12,
    cuti: 7,
    sakit: 3,
    alpha: 0,
    totalGaji: 1850000000,
    terlambat: 8,
    lembur: 23,
    kontrak: 145,
    tetap: 342,
    rekrutBulanIni: 12,
    resignBulanIni: 3,
    promosiBulanIni: 5,
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

  const formatCurrencyShort = (amount: number) => {
    if (amount >= 1000000000) return `Rp ${(amount / 1000000000).toFixed(1)}M`;
    if (amount >= 1000000) return `Rp ${(amount / 1000000).toFixed(0)}jt`;
    return formatCurrency(amount);
  };

  return (
    <div className="p-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl text-gray-900">Dashboard Kepegawaian</h1>
              <p className="text-sm text-gray-500">Analitik dan Manajemen SDM Komprehensif</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Hari Ini</option>
              <option value="week">Minggu Ini</option>
              <option value="month">Bulan Ini</option>
              <option value="year">Tahun Ini</option>
            </select>
            <Button variant="outline" className="gap-2" onClick={() => setActiveMenu('kepegawaian')}>
              <Search className="w-4 h-4" />
              Cari Karyawan
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => setActiveMenu('kepegawaian')}>
              <UserPlus className="w-4 h-4" />
              Tambah Karyawan
            </Button>
          </div>
        </div>
      </div>

      <StatsSection stats={stats} setActiveMenu={setActiveMenu} formatCurrencyShort={formatCurrencyShort} />
      <ChartsSection setActiveMenu={setActiveMenu} formatCurrencyShort={formatCurrencyShort} />
      <TrainingRecruitmentSection setActiveMenu={setActiveMenu} />
      <AnalyticsSection />
      <ActivitiesSection setActiveMenu={setActiveMenu} />
      <EventsSection setActiveMenu={setActiveMenu} />
      <QuickAccessSection setActiveMenu={setActiveMenu} />
    </div>
  );
}
