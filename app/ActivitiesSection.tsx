import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Users, UserPlus, Award, Calendar, GraduationCap,
  AlertOctagon, UserX, ShieldCheck, ArrowRight, Heart,
} from 'lucide-react';
import { recentActivities, topPerformers } from './DashboardData';

interface Props {
  setActiveMenu: (menu: string) => void;
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'new': return <UserPlus className="w-4 h-4 text-green-600" />;
    case 'promotion': return <Award className="w-4 h-4 text-purple-600" />;
    case 'leave': return <Calendar className="w-4 h-4 text-yellow-600" />;
    case 'training': return <GraduationCap className="w-4 h-4 text-blue-600" />;
    case 'award': return <Award className="w-4 h-4 text-orange-600" />;
    case 'warning': return <AlertOctagon className="w-4 h-4 text-red-600" />;
    case 'resign': return <UserX className="w-4 h-4 text-gray-600" />;
    case 'certificate': return <ShieldCheck className="w-4 h-4 text-teal-600" />;
    default: return <Users className="w-4 h-4 text-gray-600" />;
  }
}

function getBadgeColor(badge: string) {
  switch (badge) {
    case 'gold': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'silver': return 'bg-gray-200 text-gray-800 border-gray-300';
    case 'bronze': return 'bg-orange-100 text-orange-800 border-orange-300';
    default: return 'bg-blue-100 text-blue-800 border-blue-300';
  }
}

export function ActivitiesSection({ setActiveMenu }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Recent Activities */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg text-gray-900 mb-1">Aktivitas Terbaru</h3>
            <p className="text-sm text-gray-500">8 update terakhir</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setActiveMenu('kepegawaian')}>
            Lihat Semua
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border border-gray-100"
              onClick={() => setActiveMenu('kepegawaian-detail')}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                activity.type === 'new' ? 'bg-green-100' :
                activity.type === 'promotion' ? 'bg-purple-100' :
                activity.type === 'leave' ? 'bg-yellow-100' :
                activity.type === 'training' ? 'bg-blue-100' :
                activity.type === 'award' ? 'bg-orange-100' :
                activity.type === 'resign' ? 'bg-gray-100' :
                activity.type === 'certificate' ? 'bg-teal-100' :
                'bg-red-100'
              }`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-gray-900 truncate">{activity.nama}</p>
                  <span className="text-xs text-gray-500">{activity.waktu}</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">{activity.nip}</Badge>
                  <span className="text-xs text-gray-600">{activity.departemen}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{activity.status}</Badge>
                  <span className="text-xs text-gray-500">{activity.detail}</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </div>
          ))}
        </div>
      </Card>

      {/* Top Performers */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg text-gray-900 mb-1">Top Performers</h3>
            <p className="text-sm text-gray-500">Karyawan terbaik bulan ini</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setActiveMenu('kepegawaian-detail')}>
            <Award className="w-4 h-4 mr-2" />
            Ranking
          </Button>
        </div>
        <div className="space-y-3">
          {topPerformers.map((performer, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg hover:shadow-md cursor-pointer transition-all border border-gray-100"
              onClick={() => setActiveMenu('kepegawaian-detail')}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-md' :
                index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 shadow-md' :
                index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500 shadow-md' :
                'bg-gradient-to-br from-blue-400 to-blue-500'
              }`}>
                <span className="text-lg text-white">#{index + 1}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 mb-1">{performer.nama}</p>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">{performer.nip}</Badge>
                  <Badge variant="outline" className="text-xs">{performer.dept}</Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>
                    <Users className="w-3 h-3 inline mr-1" />
                    {performer.pasienPerBulan} pasien
                  </span>
                  <span>
                    <Heart className="w-3 h-3 inline mr-1" />
                    {performer.kepuasan}% rating
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl text-gray-900">{performer.score}</p>
                <Badge variant="outline" className={`text-xs ${getBadgeColor(performer.badge)}`}>
                  {performer.badge.toUpperCase()}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
