import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Eye, Calendar, Target, PieChart as PieChartIcon } from 'lucide-react';
import {
  ComposedChart, Bar, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area,
} from 'recharts';
import {
  departmentData, positionData, weeklyAttendance, performanceData,
} from './DashboardData';

interface Props {
  setActiveMenu: (menu: string) => void;
  formatCurrencyShort: (amount: number) => string;
}

export function ChartsSection({ setActiveMenu, formatCurrencyShort }: Props) {
  return (
    <>
      {/* Main Charts - Department & Position */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg text-gray-900 mb-1">Distribusi Karyawan per Departemen</h3>
              <p className="text-sm text-gray-500">Jumlah karyawan, kehadiran & performa</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setActiveMenu('kepegawaian')}>
              <Eye className="w-4 h-4 mr-2" />
              Detail
            </Button>
          </div>
          <ResponsiveContainer width="100%" height={300} minHeight={300}>
            <ComposedChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={11} angle={-15} textAnchor="end" height={80} />
              <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="#6b7280" fontSize={12} />
              <Tooltip
                formatter={(value: any, name: string) => {
                  if (name === 'avg_salary') return formatCurrencyShort(value);
                  return value;
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Jumlah Karyawan">
                {departmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
              <Line yAxisId="left" type="monotone" dataKey="hadir" stroke="#10b981" strokeWidth={2} name="Hadir Hari Ini" />
              <Line yAxisId="right" type="monotone" dataKey="performance" stroke="#f59e0b" strokeWidth={2} name="Performance %" />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg text-gray-900 mb-1">Distribusi Jabatan</h3>
              <p className="text-sm text-gray-500">By position type</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setActiveMenu('kepegawaian')}>
              <PieChartIcon className="w-4 h-4" />
            </Button>
          </div>
          <ResponsiveContainer width="100%" height={300} minHeight={300}>
            <PieChart>
              <Pie
                data={positionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={90}
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
      </div>

      {/* Attendance & Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg text-gray-900 mb-1">Kehadiran Minggu Ini</h3>
              <p className="text-sm text-gray-500">Senin - Jumat (19-23 Nov 2025)</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setActiveMenu('kepegawaian-absensi')}>
              <Calendar className="w-4 h-4 mr-2" />
              Absensi
            </Button>
          </div>
          <ResponsiveContainer width="100%" height={300} minHeight={300}>
            <AreaChart data={weeklyAttendance}>
              <defs>
                <linearGradient id="colorHadir" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorSakit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="hadir" stroke="#10b981" fill="url(#colorHadir)" name="Hadir" />
              <Area type="monotone" dataKey="sakit" stroke="#ef4444" fill="url(#colorSakit)" name="Sakit" />
              <Line type="monotone" dataKey="terlambat" stroke="#f59e0b" strokeWidth={2} name="Terlambat" />
              <Line type="monotone" dataKey="lembur" stroke="#8b5cf6" strokeWidth={2} name="Lembur" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg text-gray-900 mb-1">Evaluasi Kinerja Keseluruhan</h3>
              <p className="text-sm text-gray-500">Aktual vs Target</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setActiveMenu('kepegawaian-detail')}>
              <Target className="w-4 h-4 mr-2" />
              Penilaian
            </Button>
          </div>
          <ResponsiveContainer width="100%" height={300} minHeight={300}>
            <RadarChart data={performanceData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="kategori" stroke="#6b7280" fontSize={11} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#6b7280" fontSize={10} />
              <Radar name="Aktual" dataKey="nilai" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
              <Radar name="Target" dataKey="target" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </>
  );
}
