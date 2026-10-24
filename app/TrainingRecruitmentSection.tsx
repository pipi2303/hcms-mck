import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { GraduationCap, Calendar, UserPlus } from 'lucide-react';
import { trainingData, recruitmentData } from './DashboardData';

interface Props {
  setActiveMenu: (menu: string) => void;
}

export function TrainingRecruitmentSection({ setActiveMenu }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Training Programs */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg text-gray-900 mb-1">Program Pelatihan Aktif</h3>
            <p className="text-sm text-gray-500">5 program sedang berjalan</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setActiveMenu('kepegawaian-detail')}>
            <GraduationCap className="w-4 h-4 mr-2" />
            Semua
          </Button>
        </div>
        <div className="space-y-3">
          {trainingData.map((training) => (
            <div
              key={training.id}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border border-gray-100"
              onClick={() => setActiveMenu('kepegawaian-detail')}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${training.progress === 100 ? 'bg-green-100' : 'bg-blue-100'}`}>
                    <GraduationCap className={`w-5 h-5 ${training.progress === 100 ? 'text-green-600' : 'text-blue-600'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{training.program}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{training.kategori}</Badge>
                      <span className="text-xs text-gray-500">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {training.deadline}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge className={`${training.progress === 100 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                  {training.progress}%
                </Badge>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <p className="text-xs text-gray-500">{training.selesai}/{training.peserta} peserta selesai</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${training.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                  style={{ width: `${training.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recruitment Funnel */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg text-gray-900 mb-1">Recruitment Pipeline</h3>
            <p className="text-sm text-gray-500">Funnel rekrutmen November 2025</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setActiveMenu('kepegawaian')}>
            <UserPlus className="w-4 h-4 mr-2" />
            Detail
          </Button>
        </div>
        <div className="space-y-3">
          {recruitmentData.map((stage, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">{stage.stage}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-900">{stage.count}</span>
                  <Badge variant="outline" className="text-xs">{stage.percentage}%</Badge>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${stage.percentage}%`,
                    background: `hsl(${220 - index * 15}, 70%, ${50 + index * 3}%)`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
