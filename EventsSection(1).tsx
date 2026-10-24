import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Calendar, Clock, Users, GraduationCap, Activity, MapPin } from 'lucide-react';
import { upcomingEvents } from './DashboardData';

interface Props {
  setActiveMenu: (menu: string) => void;
}

function getEventIcon(type: string) {
  switch (type) {
    case 'training': return <GraduationCap className="w-4 h-4 text-blue-600" />;
    case 'meeting': return <Users className="w-4 h-4 text-purple-600" />;
    case 'workshop': return <Activity className="w-4 h-4 text-green-600" />;
    case 'event': return <Calendar className="w-4 h-4 text-orange-600" />;
    default: return <Calendar className="w-4 h-4 text-gray-600" />;
  }
}

export function EventsSection({ setActiveMenu }: Props) {
  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg text-gray-900 mb-1">Event & Jadwal Mendatang</h3>
          <p className="text-sm text-gray-500">5 kegiatan yang akan datang</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setActiveMenu('kepegawaian')}>
          <Calendar className="w-4 h-4 mr-2" />
          Kalender Lengkap
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {upcomingEvents.map((event) => (
          <div
            key={event.id}
            className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg hover:shadow-md cursor-pointer transition-all border border-gray-200"
            onClick={() => setActiveMenu('kepegawaian')}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                event.type === 'training' ? 'bg-blue-100' :
                event.type === 'meeting' ? 'bg-purple-100' :
                event.type === 'workshop' ? 'bg-green-100' :
                'bg-orange-100'
              }`}>
                {getEventIcon(event.type)}
              </div>
              <div className="flex-1">
                <Badge variant="outline" className={`text-xs mb-1 ${
                  event.status === 'confirmed' ? 'bg-green-50 text-green-700' :
                  event.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                  'bg-blue-50 text-blue-700'
                }`}>
                  {event.status}
                </Badge>
              </div>
            </div>
            <h4 className="text-sm text-gray-900 mb-2 line-clamp-2">{event.title}</h4>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span className="line-clamp-1">{event.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{event.participants} peserta</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
