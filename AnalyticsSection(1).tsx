import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer,
} from 'recharts';
import { ageDistribution, tenureData, certificationData } from './DashboardData';

export function AnalyticsSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Age Distribution */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg text-gray-900 mb-1">Distribusi Usia</h3>
          <p className="text-sm text-gray-500">Rentang usia karyawan</p>
        </div>
        <div className="space-y-3">
          {ageDistribution.map((age, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm text-gray-700 w-16">{age.range}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full bg-blue-500" style={{ width: `${age.percentage * 3}%` }} />
                </div>
              </div>
              <div className="flex items-center gap-2 ml-3">
                <span className="text-sm text-gray-900">{age.count}</span>
                <span className="text-xs text-gray-500">({age.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Tenure Distribution */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg text-gray-900 mb-1">Masa Kerja</h3>
          <p className="text-sm text-gray-500">Distribusi lama bekerja</p>
        </div>
        <ResponsiveContainer width="100%" height={250} minHeight={250}>
          <BarChart data={tenureData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="range" stroke="#6b7280" fontSize={10} angle={-15} textAnchor="end" height={60} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]}>
              {tenureData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Certification Status */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg text-gray-900 mb-1">Status Sertifikasi</h3>
          <p className="text-sm text-gray-500">Compliance & kompetensi</p>
        </div>
        <div className="space-y-4">
          {certificationData.map((cert, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{cert.nama}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-900">{cert.certified}/{cert.total}</span>
                  <Badge className={cert.percentage === 100 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                    {cert.percentage}%
                  </Badge>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    cert.percentage === 100 ? 'bg-green-500' :
                    cert.percentage >= 90 ? 'bg-blue-500' :
                    'bg-yellow-500'
                  }`}
                  style={{ width: `${cert.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
