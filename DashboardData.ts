// Static data and helper types used by KepegawaianDashboard sub-components

export const departmentData = [
  { name: 'Rawat Jalan', value: 78, budget: 350000000, avg_salary: 7500000, color: '#3b82f6', hadir: 75, performance: 92 },
  { name: 'Rawat Inap', value: 125, budget: 580000000, avg_salary: 7200000, color: '#8b5cf6', hadir: 120, performance: 90 },
  { name: 'IGD', value: 52, budget: 280000000, avg_salary: 8200000, color: '#ef4444', hadir: 51, performance: 95 },
  { name: 'Bedah', value: 35, budget: 420000000, avg_salary: 12500000, color: '#f59e0b', hadir: 34, performance: 94 },
  { name: 'Lab & Radiologi', value: 48, budget: 240000000, avg_salary: 6800000, color: '#10b981', hadir: 46, performance: 91 },
  { name: 'Farmasi', value: 42, budget: 185000000, avg_salary: 6500000, color: '#06b6d4', hadir: 41, performance: 89 },
  { name: 'Administrasi', value: 65, budget: 280000000, avg_salary: 5200000, color: '#ec4899', hadir: 62, performance: 88 },
  { name: 'Penunjang', value: 42, budget: 165000000, avg_salary: 5800000, color: '#14b8a6', hadir: 36, performance: 87 },
];

export const positionData = [
  { name: 'Dokter Spesialis', value: 28, avg_salary: 25000000, color: '#3b82f6', growth: 5 },
  { name: 'Dokter Umum', value: 17, avg_salary: 12000000, color: '#60a5fa', growth: 3 },
  { name: 'Perawat', value: 185, avg_salary: 6500000, color: '#10b981', growth: 8 },
  { name: 'Bidan', value: 32, avg_salary: 6000000, color: '#34d399', growth: 2 },
  { name: 'Tenaga Medis', value: 55, avg_salary: 7200000, color: '#f59e0b', growth: 4 },
  { name: 'Administrasi', value: 95, avg_salary: 5200000, color: '#8b5cf6', growth: 6 },
  { name: 'Pendukung', value: 75, avg_salary: 4800000, color: '#06b6d4', growth: -2 },
];

export const weeklyAttendance = [
  { day: 'Sen', hadir: 472, sakit: 5, izin: 7, cuti: 3, alpha: 0, terlambat: 12, lembur: 18 },
  { day: 'Sel', hadir: 468, sakit: 8, izin: 6, cuti: 5, alpha: 0, terlambat: 15, lembur: 22 },
  { day: 'Rab', hadir: 475, sakit: 4, izin: 5, cuti: 3, alpha: 0, terlambat: 9, lembur: 20 },
  { day: 'Kam', hadir: 470, sakit: 6, izin: 8, cuti: 3, alpha: 0, terlambat: 11, lembur: 25 },
  { day: 'Jum', hadir: 465, sakit: 3, izin: 12, cuti: 7, alpha: 0, terlambat: 8, lembur: 23 },
];

export const performanceData = [
  { kategori: 'Profesionalisme', nilai: 92, target: 90, gap: 2 },
  { kategori: 'Kedisiplinan', nilai: 88, target: 85, gap: 3 },
  { kategori: 'Kompetensi', nilai: 90, target: 85, gap: 5 },
  { kategori: 'Teamwork', nilai: 95, target: 90, gap: 5 },
  { kategori: 'Kepuasan Pasien', nilai: 89, target: 85, gap: 4 },
  { kategori: 'Inovasi', nilai: 85, target: 80, gap: 5 },
];

export const trainingData = [
  { id: 1, program: 'Sertifikasi BLS', peserta: 45, selesai: 42, progress: 93, kategori: 'Wajib', deadline: '30 Nov 2025' },
  { id: 2, program: 'Pelatihan K3RS', peserta: 38, selesai: 38, progress: 100, kategori: 'Wajib', deadline: '15 Nov 2025' },
  { id: 3, program: 'Workshop SOAP', peserta: 52, selesai: 48, progress: 92, kategori: 'Pengembangan', deadline: '25 Nov 2025' },
  { id: 4, program: 'Training ISO', peserta: 28, selesai: 25, progress: 89, kategori: 'Sertifikasi', deadline: '10 Des 2025' },
  { id: 5, program: 'ACLS Refresher', peserta: 35, selesai: 30, progress: 86, kategori: 'Refresher', deadline: '20 Des 2025' },
];

export const recruitmentData = [
  { stage: 'Lamaran Masuk', count: 245, percentage: 100 },
  { stage: 'Screening CV', count: 120, percentage: 49 },
  { stage: 'Interview HR', count: 65, percentage: 27 },
  { stage: 'Test Kompetensi', count: 38, percentage: 16 },
  { stage: 'Interview User', count: 25, percentage: 10 },
  { stage: 'Offering', count: 18, percentage: 7 },
  { stage: 'Hired', count: 12, percentage: 5 },
];

export const ageDistribution = [
  { range: '20-25', count: 45, percentage: 9 },
  { range: '26-30', count: 128, percentage: 26 },
  { range: '31-35', count: 145, percentage: 30 },
  { range: '36-40', count: 98, percentage: 20 },
  { range: '41-45', count: 52, percentage: 11 },
  { range: '46-50', count: 15, percentage: 3 },
  { range: '50+', count: 4, percentage: 1 },
];

export const tenureData = [
  { range: '< 1 tahun', count: 85, color: '#3b82f6' },
  { range: '1-3 tahun', count: 142, color: '#10b981' },
  { range: '3-5 tahun', count: 128, color: '#f59e0b' },
  { range: '5-10 tahun', count: 98, color: '#8b5cf6' },
  { range: '> 10 tahun', count: 34, color: '#ef4444' },
];

export const certificationData = [
  { nama: 'BLS/BTCLS', certified: 445, total: 487, percentage: 91 },
  { nama: 'ACLS', certified: 156, total: 200, percentage: 78 },
  { nama: 'STR Aktif', certified: 470, total: 487, percentage: 97 },
  { nama: 'SIP Aktif', certified: 458, total: 487, percentage: 94 },
  { nama: 'Kompetensi K3', certified: 487, total: 487, percentage: 100 },
];

export const recentActivities = [
  { id: '1', type: 'new', nama: 'Dr. Andi Wijaya, Sp.PD', departemen: 'Rawat Jalan', waktu: '2 jam lalu', status: 'Karyawan Baru', detail: 'Bergabung sebagai Dokter Spesialis Penyakit Dalam', nip: 'NIP-487', avatar: 'AW' },
  { id: '2', type: 'promotion', nama: 'Ns. Siti Nurhaliza, S.Kep', departemen: 'Rawat Inap', waktu: '5 jam lalu', status: 'Promosi', detail: 'Promosi dari Perawat menjadi Kepala Ruangan VIP', nip: 'NIP-125', avatar: 'SN' },
  { id: '3', type: 'leave', nama: 'Dr. Bambang Susilo, Sp.B', departemen: 'Bedah', waktu: '1 hari lalu', status: 'Cuti', detail: 'Cuti tahunan selama 7 hari (19-25 Nov)', nip: 'NIP-042', avatar: 'BS' },
  { id: '4', type: 'training', nama: '15 Perawat ICU', departemen: 'ICU', waktu: '2 hari lalu', status: 'Pelatihan', detail: 'Workshop Advanced Life Support & Ventilator Management', nip: 'Multiple', avatar: '15' },
  { id: '5', type: 'award', nama: 'Tim Gawat Darurat', departemen: 'IGD', waktu: '3 hari lalu', status: 'Penghargaan', detail: 'Employee of the Month - Response Time Excellence', nip: 'Team IGD', avatar: 'IGD' },
  { id: '6', type: 'warning', nama: 'Ahmad Fauzi', departemen: 'Administrasi', waktu: '4 hari lalu', status: 'Peringatan', detail: 'SP1 - Terlambat 3x berturut-turut tanpa keterangan', nip: 'NIP-234', avatar: 'AF' },
  { id: '7', type: 'resign', nama: 'Dwi Handayani, A.Md.Kep', departemen: 'Rawat Jalan', waktu: '5 hari lalu', status: 'Resign', detail: 'Mengundurkan diri untuk melanjutkan studi S1', nip: 'NIP-189', avatar: 'DH' },
  { id: '8', type: 'certificate', nama: 'Dr. Linda Sari, Sp.A', departemen: 'Anak', waktu: '6 hari lalu', status: 'Sertifikasi', detail: 'Menyelesaikan ACLS Provider Course', nip: 'NIP-067', avatar: 'LS' },
];

export const topPerformers = [
  { nama: 'dr. Sarah Johnson, Sp.PD', dept: 'Rawat Jalan', score: 98, badge: 'gold', pasienPerBulan: 245, kepuasan: 98, nip: 'NIP-001' },
  { nama: 'Ns. Dewi Sartika, S.Kep', dept: 'ICU', score: 96, badge: 'gold', pasienPerBulan: 180, kepuasan: 97, nip: 'NIP-045' },
  { nama: 'dr. Budi Hartono, Sp.B', dept: 'Bedah', score: 95, badge: 'silver', pasienPerBulan: 156, kepuasan: 96, nip: 'NIP-002' },
  { nama: 'Apt. Linda Wijaya, S.Farm', dept: 'Farmasi', score: 94, badge: 'silver', pasienPerBulan: 320, kepuasan: 95, nip: 'NIP-078' },
  { nama: 'Ns. Ahmad Yani, S.Kep', dept: 'IGD', score: 93, badge: 'bronze', pasienPerBulan: 210, kepuasan: 94, nip: 'NIP-005' },
];

export const upcomingEvents = [
  { id: 1, title: 'Pelatihan BLS Batch 3', date: '22 Nov 2025', time: '08:00 - 16:00', participants: 30, location: 'Ruang Training Lt.3', type: 'training', status: 'confirmed' },
  { id: 2, title: 'Rapat Evaluasi Kinerja Q4', date: '25 Nov 2025', time: '13:00 - 15:00', participants: 15, location: 'Ruang Rapat Direksi', type: 'meeting', status: 'confirmed' },
  { id: 3, title: 'Workshop K3RS & Fire Safety', date: '28 Nov 2025', time: '08:00 - 12:00', participants: 45, location: 'Aula Utama', type: 'workshop', status: 'pending' },
  { id: 4, title: 'Town Hall Meeting - All Staff', date: '30 Nov 2025', time: '14:00 - 16:00', participants: 487, location: 'Aula Utama', type: 'event', status: 'confirmed' },
  { id: 5, title: 'Medical Staff Meeting', date: '05 Des 2025', time: '16:00 - 18:00', participants: 85, location: 'Ruang Komite Medik', type: 'meeting', status: 'scheduled' },
];
