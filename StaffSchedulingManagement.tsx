import { useState, useEffect } from 'react';
import {
  Users, Calendar, Clock, User, TrendingUp, AlertTriangle, CheckCircle,
  Plus, Edit, X, Eye, Download, Printer, RefreshCw, Search, Filter,
  UserCheck, UserX, Activity, BarChart3, PieChart as PieChartIcon,
  Phone, Mail, MapPin, Award, Target, Zap, Bell, Settings, Heart,
  Stethoscope, Shield, Package, ClipboardCheck, FileText, Send
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Staff {
  id: string;
  nip: string;
  nama: string;
  jabatan: string;
  departemen: string;
  spesialisasi?: string;
  phone: string;
  email: string;
  photo?: string;
  status: 'Active' | 'Leave' | 'Off Duty';
  shiftPreference: string[];
  workingHours: number;
  overtimeHours: number;
}

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  color: string;
  minStaff: number;
  currentStaff: number;
}

interface Schedule {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  shiftId: string;
  shiftName: string;
  department: string;
  status: 'Scheduled' | 'Completed' | 'Absent' | 'Late' | 'Cancelled';
  checkIn?: string;
  checkOut?: string;
}

interface LeaveRequest {
  id: string;
  staffId: string;
  staffName: string;
  leaveType: 'Cuti Tahunan' | 'Cuti Sakit' | 'Cuti Melahirkan' | 'Izin' | 'Cuti Khusus';
  startDate: string;
  endDate: string;
  duration: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedDate: string;
  approvedBy?: string;
}

export default function StaffSchedulingManagement() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'schedule' | 'staff' | 'leaves' | 'analytics'>('schedule');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const shifts: Shift[] = [
    { id: 'S1', name: 'Pagi', startTime: '07:00', endTime: '14:00', color: '#3b82f6', minStaff: 15, currentStaff: 16 },
    { id: 'S2', name: 'Siang', startTime: '14:00', endTime: '21:00', color: '#f59e0b', minStaff: 12, currentStaff: 11 },
    { id: 'S3', name: 'Malam', startTime: '21:00', endTime: '07:00', color: '#8b5cf6', minStaff: 10, currentStaff: 10 },
  ];

  const [staff, setStaff] = useState<Staff[]>([
    {
      id: 'STF001',
      nip: '19850101',
      nama: 'dr. Sarah Amanda, Sp.JP',
      jabatan: 'Dokter Spesialis',
      departemen: 'Kardiologi',
      spesialisasi: 'Jantung & Pembuluh Darah',
      phone: '08123456789',
      email: 'sarah.amanda@hospital.com',
      status: 'Active',
      shiftPreference: ['S1', 'S2'],
      workingHours: 160,
      overtimeHours: 12,
    },
    {
      id: 'STF002',
      nip: '19900215',
      nama: 'Ns. Linda Wijaya, S.Kep',
      jabatan: 'Perawat',
      departemen: 'ICU',
      phone: '08198765432',
      email: 'linda.wijaya@hospital.com',
      status: 'Active',
      shiftPreference: ['S1', 'S3'],
      workingHours: 176,
      overtimeHours: 8,
    },
    {
      id: 'STF003',
      nip: '19880310',
      nama: 'dr. Michael Chen, Sp.S',
      jabatan: 'Dokter Spesialis',
      departemen: 'Neurologi',
      spesialisasi: 'Saraf',
      phone: '08187654321',
      email: 'michael.chen@hospital.com',
      status: 'Active',
      shiftPreference: ['S1'],
      workingHours: 152,
      overtimeHours: 4,
    },
    {
      id: 'STF004',
      nip: '19920505',
      nama: 'Ns. Maya Putri, S.Kep',
      jabatan: 'Perawat',
      departemen: 'IGD',
      phone: '08176543210',
      email: 'maya.putri@hospital.com',
      status: 'Active',
      shiftPreference: ['S2', 'S3'],
      workingHours: 180,
      overtimeHours: 16,
    },
    {
      id: 'STF005',
      nip: '19870420',
      nama: 'dr. Rudi Hartono, Sp.B',
      jabatan: 'Dokter Spesialis',
      departemen: 'Bedah',
      spesialisasi: 'Bedah Umum',
      phone: '08165432109',
      email: 'rudi.hartono@hospital.com',
      status: 'Leave',
      shiftPreference: ['S1'],
      workingHours: 144,
      overtimeHours: 0,
    },
  ]);

  const [schedules, setSchedules] = useState<Schedule[]>([
    {
      id: 'SCH001',
      staffId: 'STF001',
      staffName: 'dr. Sarah Amanda, Sp.JP',
      date: '2025-11-25',
      shiftId: 'S1',
      shiftName: 'Pagi',
      department: 'Kardiologi',
      status: 'Completed',
      checkIn: '06:55',
      checkOut: '14:10',
    },
    {
      id: 'SCH002',
      staffId: 'STF002',
      staffName: 'Ns. Linda Wijaya, S.Kep',
      date: '2025-11-25',
      shiftId: 'S1',
      shiftName: 'Pagi',
      department: 'ICU',
      status: 'Completed',
      checkIn: '06:50',
      checkOut: '14:05',
    },
    {
      id: 'SCH003',
      staffId: 'STF004',
      staffName: 'Ns. Maya Putri, S.Kep',
      date: '2025-11-25',
      shiftId: 'S2',
      shiftName: 'Siang',
      department: 'IGD',
      status: 'Completed',
      checkIn: '13:55',
      checkOut: '21:15',
    },
  ]);

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([
    {
      id: 'LV001',
      staffId: 'STF005',
      staffName: 'dr. Rudi Hartono, Sp.B',
      leaveType: 'Cuti Sakit',
      startDate: '2025-11-24',
      endDate: '2025-11-26',
      duration: 3,
      reason: 'Demam tinggi, perlu istirahat',
      status: 'Approved',
      submittedDate: '2025-11-23',
      approvedBy: 'Dr. Director',
    },
    {
      id: 'LV002',
      staffId: 'STF002',
      staffName: 'Ns. Linda Wijaya, S.Kep',
      leaveType: 'Cuti Tahunan',
      startDate: '2025-12-01',
      endDate: '2025-12-05',
      duration: 5,
      reason: 'Liburan keluarga',
      status: 'Pending',
      submittedDate: '2025-11-25',
    },
  ]);

  const stats = {
    totalStaff: staff.length,
    activeStaff: staff.filter(s => s.status === 'Active').length,
    onLeave: staff.filter(s => s.status === 'Leave').length,
    avgWorkingHours: (staff.reduce((sum, s) => sum + s.workingHours, 0) / staff.length).toFixed(0),
    totalOvertimeHours: staff.reduce((sum, s) => sum + s.overtimeHours, 0),
    pendingLeaves: leaveRequests.filter(l => l.status === 'Pending').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700';
      case 'Leave': return 'bg-yellow-100 text-yellow-700';
      case 'Off Duty': return 'bg-gray-100 text-gray-700';
      case 'Scheduled': return 'bg-blue-100 text-blue-700';
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'Absent': return 'bg-red-100 text-red-700';
      case 'Late': return 'bg-orange-100 text-orange-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Approved': return 'bg-green-100 text-green-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6', '#22c55e', '#ef4444'];

  const departmentData = [
    { name: 'ICU', value: staff.filter(s => s.departemen === 'ICU').length },
    { name: 'IGD', value: staff.filter(s => s.departemen === 'IGD').length },
    { name: 'Kardiologi', value: staff.filter(s => s.departemen === 'Kardiologi').length },
    { name: 'Neurologi', value: staff.filter(s => s.departemen === 'Neurologi').length },
    { name: 'Bedah', value: staff.filter(s => s.departemen === 'Bedah').length },
  ];

  const workloadData = staff.map(s => ({
    name: s.nama.split(' ')[0] + ' ' + s.nama.split(' ')[1],
    hours: s.workingHours,
    overtime: s.overtimeHours,
  }));

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Users className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">👥 Staff Scheduling & Workforce Management</h1>
              <p className="text-indigo-100">Comprehensive Staff Rostering & Attendance System</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold mb-1">
              {currentTime.toLocaleTimeString('id-ID')}
            </div>
            <p className="text-indigo-100">
              {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 opacity-80" />
            <div className="text-4xl font-bold">{stats.totalStaff}</div>
          </div>
          <p className="text-sm opacity-90">Total Staff</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <UserCheck className="w-8 h-8 opacity-80" />
            <div className="text-4xl font-bold">{stats.activeStaff}</div>
          </div>
          <p className="text-sm opacity-90">Active Today</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <UserX className="w-8 h-8 opacity-80" />
            <div className="text-4xl font-bold">{stats.onLeave}</div>
          </div>
          <p className="text-sm opacity-90">On Leave</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 opacity-80" />
            <div className="text-4xl font-bold">{stats.avgWorkingHours}</div>
          </div>
          <p className="text-sm opacity-90">Avg Hours/Month</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <div className="text-4xl font-bold">{stats.totalOvertimeHours}</div>
          </div>
          <p className="text-sm opacity-90">Total OT Hours</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Bell className="w-8 h-8 opacity-80 animate-pulse" />
            <div className="text-4xl font-bold">{stats.pendingLeaves}</div>
          </div>
          <p className="text-sm opacity-90">Pending Requests</p>
        </div>
      </div>

      {/* Shift Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 text-xl mb-4">Today's Shift Overview</h3>
        <div className="grid grid-cols-3 gap-4">
          {shifts.map((shift) => (
            <div
              key={shift.id}
              className="border-2 rounded-xl p-4"
              style={{ borderColor: shift.color, backgroundColor: `${shift.color}10` }}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-gray-900 text-lg">{shift.name}</h4>
                <div
                  className="px-3 py-1 rounded-full text-white font-bold"
                  style={{ backgroundColor: shift.color }}
                >
                  {shift.startTime} - {shift.endTime}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Min Required</p>
                  <p className="text-2xl font-bold text-gray-900">{shift.minStaff}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Current Staff</p>
                  <p className={`text-2xl font-bold ${
                    shift.currentStaff >= shift.minStaff ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {shift.currentStaff}
                  </p>
                </div>
              </div>
              {shift.currentStaff < shift.minStaff && (
                <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded text-xs text-red-900 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Understaffed! Need {shift.minStaff - shift.currentStaff} more
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'schedule'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Calendar className="w-5 h-5" />
              Schedule Management
            </div>
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'staff'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Users className="w-5 h-5" />
              Staff Directory
            </div>
          </button>
          <button
            onClick={() => setActiveTab('leaves')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'leaves'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FileText className="w-5 h-5" />
              Leave Requests
              {stats.pendingLeaves > 0 && (
                <span className="px-2 py-0.5 bg-red-600 text-white rounded-full text-xs font-bold animate-pulse">
                  {stats.pendingLeaves}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Analytics & Reports
            </div>
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-xl">Today's Schedule</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create Schedule
                </button>
              </div>

              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold"
                      style={{
                        backgroundColor: shifts.find(s => s.id === schedule.shiftId)?.color || '#gray'
                      }}
                    >
                      {schedule.shiftName}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-gray-900">{schedule.staffName}</h4>
                        <div className={`px-3 py-1 rounded-lg text-sm font-bold ${getStatusColor(schedule.status)}`}>
                          {schedule.status}
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span>Department: </span>
                          <span className="font-bold">{schedule.department}</span>
                        </div>
                        <div>
                          <span>Date: </span>
                          <span className="font-bold">{schedule.date}</span>
                        </div>
                        {schedule.checkIn && (
                          <div>
                            <span>Check In: </span>
                            <span className="font-bold text-green-600">{schedule.checkIn}</span>
                          </div>
                        )}
                        {schedule.checkOut && (
                          <div>
                            <span>Check Out: </span>
                            <span className="font-bold text-red-600">{schedule.checkOut}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'staff' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {staff.map((member) => (
                  <div
                    key={member.id}
                    className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                        <User className="w-8 h-8 text-blue-600" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-bold text-gray-900 text-lg">{member.nama}</h4>
                            <p className="text-sm text-gray-600">{member.jabatan} • {member.departemen}</p>
                          </div>
                          <div className={`px-3 py-1 rounded-lg text-sm font-bold ${getStatusColor(member.status)}`}>
                            {member.status}
                          </div>
                        </div>

                        {member.spesialisasi && (
                          <p className="text-sm text-gray-600 mb-2">
                            <span className="font-bold">Spesialisasi:</span> {member.spesialisasi}
                          </p>
                        )}

                        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                          <div className="p-2 bg-gray-50 rounded">
                            <p className="text-gray-600">Working Hours</p>
                            <p className="font-bold">{member.workingHours} hrs</p>
                          </div>
                          <div className="p-2 bg-gray-50 rounded">
                            <p className="text-gray-600">Overtime</p>
                            <p className="font-bold text-orange-600">{member.overtimeHours} hrs</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Phone className="w-3 h-3" />
                          {member.phone}
                          <Mail className="w-3 h-3 ml-2" />
                          {member.email}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'leaves' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-xl">Leave Requests</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Request
                </button>
              </div>

              {leaveRequests.map((request) => (
                <div
                  key={request.id}
                  className={`border-2 rounded-xl p-6 ${
                    request.status === 'Pending' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{request.staffName}</h4>
                      <p className="text-sm text-gray-600 mt-1">{request.leaveType}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-lg font-bold ${getStatusColor(request.status)}`}>
                      {request.status}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Start Date</p>
                      <p className="font-bold text-gray-900">{request.startDate}</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">End Date</p>
                      <p className="font-bold text-gray-900">{request.endDate}</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Duration</p>
                      <p className="font-bold text-gray-900">{request.duration} days</p>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                    <p className="text-xs text-gray-600 mb-1">Reason:</p>
                    <p className="text-sm text-gray-900">{request.reason}</p>
                  </div>

                  {request.status === 'Pending' && (
                    <div className="flex gap-2">
                      <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}

                  {request.approvedBy && (
                    <p className="text-xs text-gray-600 mt-3">
                      Approved by: <span className="font-bold">{request.approvedBy}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Staff by Department</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={departmentData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                          label
                        >
                          {departmentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Working Hours vs Overtime</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={workloadData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="hours" fill="#3b82f6" name="Regular Hours" />
                        <Bar dataKey="overtime" fill="#f59e0b" name="Overtime" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
