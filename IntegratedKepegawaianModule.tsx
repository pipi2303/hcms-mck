import React, { Suspense, lazy } from 'react';
import { MemoryRouter, Navigate, Route, Routes } from 'react-router';
import { AppProvider } from './app/context/AppContext';
import './IntegratedKepegawaianModule.css';

const Dashboard = lazy(() => import('./app/pages/Dashboard'));
const DataPegawai = lazy(() => import('./app/pages/DataPegawai'));
const DetailPegawai = lazy(() => import('./app/pages/DetailPegawai'));
const OrganisasiTree = lazy(() => import('./app/pages/OrganisasiTree'));
const Mutasi = lazy(() => import('./app/pages/Mutasi'));
const Penghargaan = lazy(() => import('./app/pages/Penghargaan'));
const Absensi = lazy(() => import('./app/pages/Absensi'));
const Cuti = lazy(() => import('./app/pages/Cuti'));
const Penjadwalan = lazy(() => import('./app/pages/Penjadwalan'));
const RiwayatJabatan = lazy(() => import('./app/pages/RiwayatJabatan'));
const KenaikanPangkat = lazy(() => import('./app/pages/KenaikanPangkat'));
const SKP = lazy(() => import('./app/pages/SKP'));
const PerformanceManagement = lazy(() => import('./app/pages/PerformanceManagement'));
const Diklat = lazy(() => import('./app/pages/Diklat'));
const Credentialing = lazy(() => import('./app/pages/Credentialing'));
const K3RS = lazy(() => import('./app/pages/K3RS'));
const KomiteRS = lazy(() => import('./app/pages/KomiteRS'));
const Penggajian = lazy(() => import('./app/pages/Penggajian'));
const BPJS = lazy(() => import('./app/pages/BPJS'));
const Kontrak = lazy(() => import('./app/pages/Kontrak'));
const Disiplin = lazy(() => import('./app/pages/Disiplin'));
const HubunganIndustrial = lazy(() => import('./app/pages/HubunganIndustrial'));
const SuratKepegawaian = lazy(() => import('./app/pages/SuratKepegawaian'));
const Laporan = lazy(() => import('./app/pages/Laporan'));

const MENU_PATHS: Record<string, string> = {
  'hr-dashboard': '/',
  'hr-data-pegawai': '/pegawai',
  'hr-struktur-organisasi': '/organisasi',
  'hr-mutasi-rotasi-promosi': '/mutasi',
  'hr-penghargaan': '/penghargaan',
  'hr-presensi-absensi': '/absensi',
  'hr-manajemen-cuti': '/cuti',
  'hr-penjadwalan-shift': '/penjadwalan',
  'hr-riwayat-jabatan': '/riwayat-jabatan',
  'hr-kenaikan-pangkat': '/kenaikan-pangkat',
  'hr-skp': '/skp',
  'hr-performance-management': '/performance',
  'hr-diklat': '/diklat',
  'hr-credentialing-lisensi': '/credentialing',
  'hr-k3rs-keselamatan': '/k3rs',
  'hr-komite-rs': '/komite-rs',
  'hr-penggajian-tunjangan': '/penggajian',
  'hr-bpjs': '/bpjs',
  'hr-kontrak-hubungan-kerja': '/kontrak',
  'hr-disiplin-pegawai': '/disiplin',
  'hr-hubungan-industrial': '/hubungan-industrial',
  'hr-surat-kepegawaian': '/surat-kepegawaian',
  'hr-laporan-statistik': '/laporan',
  'kepegawaian-dashboard': '/',
  'kepegawaian': '/pegawai',
  'kepegawaian-detail': '/pegawai/P001',
  'kepegawaian-absensi': '/absensi',
  'kepegawaian-jadwal-shift': '/penjadwalan',
  'kepegawaian-payroll': '/penggajian',
  'kepegawaian-penilaian-kinerja': '/skp',
  'kepegawaian-rekrutmen': '/diklat',
  'staff-scheduling-management': '/penjadwalan',
};

function LoadingState() {
  return (
    <div className="p-4 md:p-6 min-w-0 w-full">
      <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00423a] border-t-transparent" />
          <p className="text-sm text-gray-500">Memuat modul kepegawaian...</p>
        </div>
      </div>
    </div>
  );
}

export function IntegratedKepegawaianModule({ activeMenu }: { activeMenu: string }) {
  const initialPath = MENU_PATHS[activeMenu] ?? '/';

  return (
    <div className="integrated-kepegawaian min-w-0 w-full">
      <AppProvider>
        <MemoryRouter initialEntries={[initialPath]}>
          <Suspense fallback={<LoadingState />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/pegawai" element={<DataPegawai />} />
              <Route path="/pegawai/:id" element={<DetailPegawai />} />
              <Route path="/organisasi" element={<OrganisasiTree />} />
              <Route path="/mutasi" element={<Mutasi />} />
              <Route path="/penghargaan" element={<Penghargaan />} />
              <Route path="/absensi" element={<Absensi />} />
              <Route path="/cuti" element={<Cuti />} />
              <Route path="/penjadwalan" element={<Penjadwalan />} />
              <Route path="/riwayat-jabatan" element={<RiwayatJabatan />} />
              <Route path="/kenaikan-pangkat" element={<KenaikanPangkat />} />
              <Route path="/skp" element={<SKP />} />
              <Route path="/performance" element={<PerformanceManagement />} />
              <Route path="/diklat" element={<Diklat />} />
              <Route path="/credentialing" element={<Credentialing />} />
              <Route path="/k3rs" element={<K3RS />} />
              <Route path="/komite-rs" element={<KomiteRS />} />
              <Route path="/penggajian" element={<Penggajian />} />
              <Route path="/bpjs" element={<BPJS />} />
              <Route path="/kontrak" element={<Kontrak />} />
              <Route path="/disiplin" element={<Disiplin />} />
              <Route path="/hubungan-industrial" element={<HubunganIndustrial />} />
              <Route path="/surat-kepegawaian" element={<SuratKepegawaian />} />
              <Route path="/laporan" element={<Laporan />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </MemoryRouter>
      </AppProvider>
    </div>
  );
}

export default IntegratedKepegawaianModule;
