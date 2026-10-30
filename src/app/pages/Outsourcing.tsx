import React, { useState, useMemo, useEffect } from 'react';
import {
  Building2, Plus, Eye, Edit2, Trash2, X, Search, Download,
  CheckCircle, AlertTriangle, XCircle, RefreshCw,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import type { VendorOutsourcing, TenagaOutsourcing, StatusKontrakVendor } from '../types';
import { toast } from 'sonner';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmtRp = (n: number) => `Rp ${new Intl.NumberFormat('id-ID').format(n)}`;
const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const daysLeft = (dateStr: string) =>
  Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);

const statusBadge: Record<StatusKontrakVendor, string> = {
  Aktif: 'bg-green-100 text-green-700',
  Berakhir: 'bg-gray-100 text-gray-600',
  Dibatalkan: 'bg-red-100 text-red-700',
  Diperpanjang: 'bg-blue-100 text-blue-700',
};
const statusIcon: Record<StatusKontrakVendor, React.ElementType> = {
  Aktif: CheckCircle,
  Berakhir: AlertTriangle,
  Dibatalkan: XCircle,
  Diperpanjang: RefreshCw,
};

// ─── Seed Data ────────────────────────────────────────────────────────────────
const VENDOR_SEEDS: Omit<VendorOutsourcing, 'id'>[] = [
  { namaVendor: 'PT. Bersih Sejati', noKontrak: 'KTR/OS/2024/001', jenisLayanan: 'Cleaning Service', kontrakMulai: '2024-01-01', kontrakSelesai: '2026-12-31', nilaiKontrak: 480000000, statusKontrak: 'Aktif', picNama: 'Budi Santoso', picNoHp: '08111234567' },
  { namaVendor: 'PT. Aman Sentosa Security', noKontrak: 'KTR/OS/2024/002', jenisLayanan: 'Security / Satpam', kontrakMulai: '2024-02-01', kontrakSelesai: '2026-11-30', nilaiKontrak: 360000000, statusKontrak: 'Aktif', picNama: 'Ahmad Fauzi', picNoHp: '08119876543' },
  { namaVendor: 'CV. Parkir Nusantara', noKontrak: 'KTR/OS/2025/003', jenisLayanan: 'Jasa Parkir', kontrakMulai: '2025-01-01', kontrakSelesai: '2026-12-31', nilaiKontrak: 120000000, statusKontrak: 'Aktif', picNama: 'Slamet Raharjo', picNoHp: '08113456789' },
  { namaVendor: 'PT. Laundry Medika', noKontrak: 'KTR/OS/2023/004', jenisLayanan: 'Laundry Linen RS', kontrakMulai: '2023-06-01', kontrakSelesai: '2026-05-31', nilaiKontrak: 240000000, statusKontrak: 'Aktif', picNama: 'Dewi Rahayu', picNoHp: '08115678901' },
];

// Tenaga seeds reference vendor by index (0-based); resolved after seeding vendors
const TENAGA_SEEDS_TEMPLATE: Array<Omit<TenagaOutsourcing, 'id' | 'vendorId'> & { vendorIdx: number }> = [
  { vendorIdx: 0, nama: 'Surya Buana', jenisKelamin: 'L', jabatan: 'Petugas Kebersihan', unitPenempatan: 'IGD', tanggalMulai: '2024-01-15', statusAktif: 'Aktif', noHp: '08121111001' },
  { vendorIdx: 0, nama: 'Siti Rahmawati', jenisKelamin: 'P', jabatan: 'Petugas Kebersihan', unitPenempatan: 'Rawat Inap', tanggalMulai: '2024-01-15', statusAktif: 'Aktif', noHp: '08121111002' },
  { vendorIdx: 0, nama: 'Hendra Gunawan', jenisKelamin: 'L', jabatan: 'Petugas Kebersihan', unitPenempatan: 'Poli', tanggalMulai: '2024-03-01', statusAktif: 'Aktif', noHp: '08121111003' },
  { vendorIdx: 0, nama: 'Wulandari', jenisKelamin: 'P', jabatan: 'Petugas Kebersihan', unitPenempatan: 'Farmasi', tanggalMulai: '2024-03-01', statusAktif: 'Aktif', noHp: '08121111004' },
  { vendorIdx: 1, nama: 'Agus Salim', jenisKelamin: 'L', jabatan: 'Satpam', unitPenempatan: 'Pintu Utama', tanggalMulai: '2024-02-15', statusAktif: 'Aktif', noHp: '08122222001' },
  { vendorIdx: 1, nama: 'Darmawan', jenisKelamin: 'L', jabatan: 'Satpam', unitPenempatan: 'Parkir', tanggalMulai: '2024-02-15', statusAktif: 'Aktif', noHp: '08122222002' },
  { vendorIdx: 1, nama: 'Rudi Hartono', jenisKelamin: 'L', jabatan: 'Satpam', unitPenempatan: 'IGD', tanggalMulai: '2024-04-01', statusAktif: 'Aktif', noHp: '08122222003' },
  { vendorIdx: 2, nama: 'Bambang Eko', jenisKelamin: 'L', jabatan: 'Juru Parkir', unitPenempatan: 'Parkir', tanggalMulai: '2025-01-10', statusAktif: 'Aktif', noHp: '08123333001' },
  { vendorIdx: 2, nama: 'Sugeng Riyadi', jenisKelamin: 'L', jabatan: 'Juru Parkir', unitPenempatan: 'Parkir', tanggalMulai: '2025-01-10', statusAktif: 'Aktif', noHp: '08123333002' },
  { vendorIdx: 3, nama: 'Kartini', jenisKelamin: 'P', jabatan: 'Petugas Laundry', unitPenempatan: 'Laundry', tanggalMulai: '2023-06-15', statusAktif: 'Aktif', noHp: '08124444001' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}

function Modal({ title, onClose, children, footer }: { title: string; onClose: () => void; children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="p-6 space-y-4">{children}</div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">{footer}</div>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-700 block mb-1.5">{label}{required && ' *'}</label>
      {children}
    </div>
  );
}

const inputCls = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500';

// ─── Tab 1: Vendor & Kontrak ──────────────────────────────────────────────────
type VendorForm = Omit<VendorOutsourcing, 'id'>;
const emptyVendor: VendorForm = { namaVendor: '', noKontrak: '', jenisLayanan: '', kontrakMulai: '', kontrakSelesai: '', nilaiKontrak: 0, statusKontrak: 'Aktif', picNama: '', picNoHp: '', keterangan: '' };

function TabVendor() {
  const { vendorOutsourcing, tenagaOutsourcing, addVendorOutsourcing, updateVendorOutsourcing, deleteVendorOutsourcing } = useAppContext();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<VendorForm>(emptyVendor);
  const [detailVendor, setDetailVendor] = useState<VendorOutsourcing | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const f = (k: keyof VendorForm, v: string | number) => setForm(prev => ({ ...prev, [k]: v }));

  const aktifVendors = vendorOutsourcing.filter(v => v.statusKontrak === 'Aktif');
  const akanBerakhir = aktifVendors.filter(v => { const d = daysLeft(v.kontrakSelesai); return d > 0 && d <= 60; });
  const totalNilai = aktifVendors.reduce((s, v) => s + v.nilaiKontrak, 0);
  const tenagaAktif = tenagaOutsourcing.filter(t => t.statusAktif === 'Aktif').length;

  const filtered = useMemo(() =>
    vendorOutsourcing.filter(v =>
      !search ||
      v.namaVendor.toLowerCase().includes(search.toLowerCase()) ||
      v.noKontrak.toLowerCase().includes(search.toLowerCase()) ||
      v.jenisLayanan.toLowerCase().includes(search.toLowerCase())
    ), [vendorOutsourcing, search]);

  const openAdd = () => { setEditId(null); setForm(emptyVendor); setShowModal(true); };
  const openEdit = (v: VendorOutsourcing) => { setEditId(v.id); setForm({ namaVendor: v.namaVendor, noKontrak: v.noKontrak, jenisLayanan: v.jenisLayanan, kontrakMulai: v.kontrakMulai, kontrakSelesai: v.kontrakSelesai, nilaiKontrak: v.nilaiKontrak, statusKontrak: v.statusKontrak, picNama: v.picNama, picNoHp: v.picNoHp, keterangan: v.keterangan ?? '' }); setShowModal(true); };

  const handleSave = () => {
    if (!form.namaVendor || !form.noKontrak || !form.jenisLayanan || !form.kontrakMulai || !form.kontrakSelesai || !form.picNama) {
      toast.error('Harap isi semua field wajib'); return;
    }
    if (editId) { updateVendorOutsourcing({ ...form, id: editId }); toast.success('Vendor diperbarui'); }
    else { addVendorOutsourcing(form); toast.success('Vendor baru ditambahkan'); }
    setShowModal(false);
  };

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Vendor Aktif" value={aktifVendors.length} sub="Kontrak berjalan" color="text-green-600" />
        <StatCard label="Kontrak Akan Berakhir" value={akanBerakhir.length} sub="≤ 60 hari" color={akanBerakhir.length > 0 ? 'text-orange-600' : 'text-gray-500'} />
        <StatCard label="Total Nilai Kontrak Aktif" value={fmtRp(totalNilai)} sub="Per tahun" color="text-blue-600" />
        <StatCard label="Tenaga Outsourcing Aktif" value={tenagaAktif} sub="Semua vendor" color="text-purple-600" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center justify-between">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari vendor, nomor kontrak..." className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg">
            <Plus className="w-4 h-4" /> Tambah Vendor
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Vendor', 'Jenis Layanan', 'No. Kontrak', 'Periode', 'Nilai Kontrak', 'Status', 'PIC', 'Aksi'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0
                ? <tr><td colSpan={8} className="py-10 text-center text-gray-400">Tidak ada data vendor</td></tr>
                : filtered.map(v => {
                  const days = daysLeft(v.kontrakSelesai);
                  const expiringSoon = v.statusKontrak === 'Aktif' && days > 0 && days <= 60;
                  const Icon = statusIcon[v.statusKontrak];
                  return (
                    <tr key={v.id} className={`hover:bg-gray-50/60 cursor-pointer ${expiringSoon ? 'bg-yellow-50' : ''}`} onClick={() => setDetailVendor(v)}>
                      <td className="px-4 py-3.5 font-medium text-gray-800">{v.namaVendor}</td>
                      <td className="px-4 py-3.5 text-gray-600">{v.jenisLayanan}</td>
                      <td className="px-4 py-3.5 font-mono text-xs text-gray-600">{v.noKontrak}</td>
                      <td className="px-4 py-3.5">
                        <p className="text-xs text-gray-700">{fmtDate(v.kontrakMulai)} — {fmtDate(v.kontrakSelesai)}</p>
                        {expiringSoon && <p className="text-xs text-orange-600 font-semibold mt-0.5">⚠ {days} hari lagi</p>}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-700">{fmtRp(v.nilaiKontrak)}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${statusBadge[v.statusKontrak]}`}>
                          <Icon className="w-3 h-3" />{v.statusKontrak}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-xs font-medium text-gray-700">{v.picNama}</p>
                        <p className="text-xs text-gray-400">{v.picNoHp}</p>
                      </td>
                      <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <button onClick={() => setDetailVendor(v)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600"><Eye className="w-3.5 h-3.5" /></button>
                          <button onClick={() => openEdit(v)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setDeleteId(v.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {detailVendor && (() => {
        const tenagaDiVendor = tenagaOutsourcing.filter(t => t.vendorId === detailVendor.id);
        const days = daysLeft(detailVendor.kontrakSelesai);
        const expiringSoon = detailVendor.statusKontrak === 'Aktif' && days > 0 && days <= 60;
        return (
          <Modal title="Detail Vendor Outsourcing" onClose={() => setDetailVendor(null)} footer={
            <>
              <button onClick={() => { setDetailVendor(null); openEdit(detailVendor); }} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Edit</button>
              <button onClick={() => setDetailVendor(null)} className="px-4 py-2 text-sm bg-gray-800 text-white rounded-lg">Tutup</button>
            </>
          }>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-800">{detailVendor.namaVendor}</p>
                <p className="text-xs text-gray-500">{detailVendor.jenisLayanan}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusBadge[detailVendor.statusKontrak]}`}>{detailVendor.statusKontrak}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {([['No. Kontrak', detailVendor.noKontrak], ['Nilai Kontrak', fmtRp(detailVendor.nilaiKontrak)], ['Mulai Kontrak', fmtDate(detailVendor.kontrakMulai)], ['Selesai Kontrak', fmtDate(detailVendor.kontrakSelesai)], ['PIC', detailVendor.picNama], ['No. HP PIC', detailVendor.picNoHp]] as [string, string][]).map(([l, val]) => (
                <div key={l}><p className="text-xs text-gray-400">{l}</p><p className="text-sm text-gray-800 mt-0.5">{val}</p></div>
              ))}
            </div>
            {expiringSoon && (
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                <p className="text-xs text-yellow-800 font-medium">⚠ Kontrak akan berakhir dalam {days} hari — segera proses perpanjangan</p>
              </div>
            )}
            {detailVendor.keterangan && (
              <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-400 mb-1">Keterangan</p><p className="text-sm text-gray-700">{detailVendor.keterangan}</p></div>
            )}
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">Tenaga Outsourcing dari Vendor Ini ({tenagaDiVendor.length})</p>
              {tenagaDiVendor.length === 0
                ? <p className="text-xs text-gray-400">Belum ada tenaga terdaftar</p>
                : <div className="space-y-1.5">
                  {tenagaDiVendor.map(t => (
                    <div key={t.id} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2">
                      <span className="font-medium text-gray-700">{t.nama}</span>
                      <span className="text-gray-500">{t.jabatan} · {t.unitPenempatan}</span>
                      <span className={`px-2 py-0.5 rounded-full font-medium ${t.statusAktif === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{t.statusAktif}</span>
                    </div>
                  ))}
                </div>
              }
            </div>
          </Modal>
        );
      })()}

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal title={editId ? 'Edit Vendor' : 'Tambah Vendor Baru'} onClose={() => setShowModal(false)} footer={
          <>
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Batal</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">{editId ? 'Perbarui' : 'Simpan'}</button>
          </>
        }>
          <Field label="Nama Vendor" required><input value={form.namaVendor} onChange={e => f('namaVendor', e.target.value)} className={inputCls} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="No. Kontrak" required><input value={form.noKontrak} onChange={e => f('noKontrak', e.target.value)} className={inputCls} /></Field>
            <Field label="Jenis Layanan" required><input value={form.jenisLayanan} onChange={e => f('jenisLayanan', e.target.value)} className={inputCls} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Kontrak Mulai" required><input type="date" value={form.kontrakMulai} onChange={e => f('kontrakMulai', e.target.value)} className={inputCls} /></Field>
            <Field label="Kontrak Selesai" required><input type="date" value={form.kontrakSelesai} onChange={e => f('kontrakSelesai', e.target.value)} className={inputCls} /></Field>
          </div>
          <Field label="Nilai Kontrak (Rp/tahun)" required>
            <input type="number" value={form.nilaiKontrak || ''} onChange={e => f('nilaiKontrak', parseInt(e.target.value) || 0)} className={inputCls} />
          </Field>
          <Field label="Status Kontrak">
            <select value={form.statusKontrak} onChange={e => f('statusKontrak', e.target.value)} className={inputCls}>
              {(['Aktif', 'Berakhir', 'Diperpanjang', 'Dibatalkan'] as StatusKontrakVendor[]).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nama PIC" required><input value={form.picNama} onChange={e => f('picNama', e.target.value)} className={inputCls} /></Field>
            <Field label="No. HP PIC"><input value={form.picNoHp} onChange={e => f('picNoHp', e.target.value)} className={inputCls} /></Field>
          </div>
          <Field label="Keterangan"><textarea rows={2} value={form.keterangan ?? ''} onChange={e => f('keterangan', e.target.value)} className={`${inputCls} resize-none`} /></Field>
        </Modal>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="font-semibold text-gray-800 mb-2">Hapus Vendor?</h3>
            <p className="text-sm text-gray-500 mb-4">Data vendor dan kontrak ini akan dihapus permanen.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg">Batal</button>
              <button onClick={() => { deleteVendorOutsourcing(deleteId); toast.success('Vendor dihapus'); setDeleteId(null); }} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Tab 2: Tenaga Outsourcing ────────────────────────────────────────────────
type TenagaForm = Omit<TenagaOutsourcing, 'id'>;
const emptyTenaga: TenagaForm = { vendorId: '', nama: '', jenisKelamin: 'L', jabatan: '', unitPenempatan: '', tanggalMulai: '', tanggalSelesai: '', statusAktif: 'Aktif', noHp: '', keterangan: '' };

function TabTenaga() {
  const { vendorOutsourcing, tenagaOutsourcing, addTenagaOutsourcing, updateTenagaOutsourcing, deleteTenagaOutsourcing } = useAppContext();
  const [filterVendor, setFilterVendor] = useState('');
  const [filterUnit, setFilterUnit] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<TenagaForm>(emptyTenaga);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const tf = (k: keyof TenagaForm, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const units = useMemo(() => [...new Set(tenagaOutsourcing.map(t => t.unitPenempatan))].sort(), [tenagaOutsourcing]);

  const filtered = useMemo(() => tenagaOutsourcing.filter(t =>
    (!filterVendor || t.vendorId === filterVendor) &&
    (!filterUnit || t.unitPenempatan === filterUnit) &&
    (!filterStatus || t.statusAktif === filterStatus)
  ), [tenagaOutsourcing, filterVendor, filterUnit, filterStatus]);

  const aktifCount = tenagaOutsourcing.filter(t => t.statusAktif === 'Aktif').length;

  // Per-vendor breakdown
  const vendorBreakdown = useMemo(() =>
    vendorOutsourcing.map(v => ({
      nama: v.namaVendor,
      count: tenagaOutsourcing.filter(t => t.vendorId === v.id && t.statusAktif === 'Aktif').length,
    })).filter(x => x.count > 0),
    [vendorOutsourcing, tenagaOutsourcing]);

  const maxVendorCount = Math.max(...vendorBreakdown.map(x => x.count), 1);

  const getVendorName = (id: string) => vendorOutsourcing.find(v => v.id === id)?.namaVendor ?? '—';

  const openAdd = () => { setEditId(null); setForm(emptyTenaga); setShowModal(true); };
  const openEdit = (t: TenagaOutsourcing) => {
    setEditId(t.id);
    setForm({ vendorId: t.vendorId, nama: t.nama, jenisKelamin: t.jenisKelamin, jabatan: t.jabatan, unitPenempatan: t.unitPenempatan, tanggalMulai: t.tanggalMulai, tanggalSelesai: t.tanggalSelesai ?? '', statusAktif: t.statusAktif, noHp: t.noHp ?? '', keterangan: t.keterangan ?? '' });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.vendorId || !form.nama || !form.jabatan || !form.unitPenempatan || !form.tanggalMulai) {
      toast.error('Harap isi semua field wajib'); return;
    }
    if (editId) { updateTenagaOutsourcing({ ...form, id: editId }); toast.success('Data tenaga diperbarui'); }
    else { addTenagaOutsourcing(form); toast.success('Tenaga outsourcing ditambahkan'); }
    setShowModal(false);
  };

  const exportCSV = () => {
    const header = ['Nama', 'Jenis Kelamin', 'Jabatan', 'Vendor', 'Unit Penempatan', 'Tgl Mulai', 'Tgl Selesai', 'Status'];
    const rows = filtered.map(t => [t.nama, t.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan', t.jabatan, getVendorName(t.vendorId), t.unitPenempatan, t.tanggalMulai, t.tanggalSelesai ?? '', t.statusAktif]);
    const csv = [header, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'tenaga-outsourcing.csv';
    a.click();
    toast.success('Data berhasil diekspor');
  };

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StatCard label="Total Tenaga Aktif" value={aktifCount} sub="Semua vendor" color="text-green-600" />
        <div className="bg-white rounded-xl border border-gray-200 p-4 lg:col-span-2">
          <p className="text-xs text-gray-500 mb-3">Sebaran per Vendor (Aktif)</p>
          <div className="space-y-2">
            {vendorBreakdown.map(x => (
              <div key={x.nama} className="flex items-center gap-3">
                <span className="text-xs text-gray-600 w-44 truncate">{x.nama}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(x.count / maxVendorCount) * 100}%` }} />
                </div>
                <span className="text-xs font-semibold text-gray-700 w-6 text-right">{x.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-2 flex-1">
            <select value={filterVendor} onChange={e => setFilterVendor(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none">
              <option value="">Semua Vendor</option>
              {vendorOutsourcing.map(v => <option key={v.id} value={v.id}>{v.namaVendor}</option>)}
            </select>
            <select value={filterUnit} onChange={e => setFilterUnit(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none">
              <option value="">Semua Unit</option>
              {units.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none">
              <option value="">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Tidak Aktif">Tidak Aktif</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={exportCSV} className="flex items-center gap-2 text-sm border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg">
              <Plus className="w-4 h-4" /> Tambah
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Nama', 'Kelamin', 'Jabatan', 'Vendor', 'Unit', 'Tgl Mulai', 'Tgl Selesai', 'Status', 'Aksi'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0
                ? <tr><td colSpan={9} className="py-10 text-center text-gray-400">Tidak ada data tenaga outsourcing</td></tr>
                : filtered.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50/60">
                    <td className="px-4 py-3.5 font-medium text-gray-800">{t.nama}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.jenisKelamin === 'L' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                        {t.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">{t.jabatan}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-600">{getVendorName(t.vendorId)}</td>
                    <td className="px-4 py-3.5 text-gray-600">{t.unitPenempatan}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-600">{fmtDate(t.tanggalMulai)}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-600">{t.tanggalSelesai ? fmtDate(t.tanggalSelesai) : '—'}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${t.statusAktif === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {t.statusAktif}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(t)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteId(t.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal title={editId ? 'Edit Tenaga Outsourcing' : 'Tambah Tenaga Outsourcing'} onClose={() => setShowModal(false)} footer={
          <>
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Batal</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">{editId ? 'Perbarui' : 'Simpan'}</button>
          </>
        }>
          <Field label="Vendor" required>
            <select value={form.vendorId} onChange={e => tf('vendorId', e.target.value)} className={inputCls}>
              <option value="">-- Pilih Vendor --</option>
              {vendorOutsourcing.map(v => <option key={v.id} value={v.id}>{v.namaVendor}</option>)}
            </select>
          </Field>
          <Field label="Nama Lengkap" required><input value={form.nama} onChange={e => tf('nama', e.target.value)} className={inputCls} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Jenis Kelamin">
              <select value={form.jenisKelamin} onChange={e => tf('jenisKelamin', e.target.value)} className={inputCls}>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </Field>
            <Field label="Status Aktif">
              <select value={form.statusAktif} onChange={e => tf('statusAktif', e.target.value)} className={inputCls}>
                <option value="Aktif">Aktif</option>
                <option value="Tidak Aktif">Tidak Aktif</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Jabatan" required><input value={form.jabatan} onChange={e => tf('jabatan', e.target.value)} className={inputCls} /></Field>
            <Field label="Unit Penempatan" required><input value={form.unitPenempatan} onChange={e => tf('unitPenempatan', e.target.value)} className={inputCls} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tanggal Mulai" required><input type="date" value={form.tanggalMulai} onChange={e => tf('tanggalMulai', e.target.value)} className={inputCls} /></Field>
            <Field label="Tanggal Selesai"><input type="date" value={form.tanggalSelesai ?? ''} onChange={e => tf('tanggalSelesai', e.target.value)} className={inputCls} /></Field>
          </div>
          <Field label="No. HP"><input value={form.noHp ?? ''} onChange={e => tf('noHp', e.target.value)} className={inputCls} /></Field>
          <Field label="Keterangan"><textarea rows={2} value={form.keterangan ?? ''} onChange={e => tf('keterangan', e.target.value)} className={`${inputCls} resize-none`} /></Field>
        </Modal>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="font-semibold text-gray-800 mb-2">Hapus Data Tenaga?</h3>
            <p className="text-sm text-gray-500 mb-4">Data tenaga outsourcing ini akan dihapus permanen.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg">Batal</button>
              <button onClick={() => { deleteTenagaOutsourcing(deleteId); toast.success('Data tenaga dihapus'); setDeleteId(null); }} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Outsourcing() {
  const { vendorOutsourcing, tenagaOutsourcing, addVendorOutsourcing, addTenagaOutsourcing } = useAppContext();
  const [tab, setTab] = useState<'vendor' | 'tenaga'>('vendor');

  // Seed once when both arrays are empty
  useEffect(() => {
    if (vendorOutsourcing.length > 0) return;
    const seeded: VendorOutsourcing[] = [];
    VENDOR_SEEDS.forEach(v => {
      // We add and track via a local array since IDs are generated inside context
      addVendorOutsourcing(v);
    });
    // ponytail: seed order matches VENDOR_SEEDS index; tenaga seeded in second effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Seed tenaga after vendors are in state
  useEffect(() => {
    if (vendorOutsourcing.length === 0 || tenagaOutsourcing.length > 0) return;
    TENAGA_SEEDS_TEMPLATE.forEach(({ vendorIdx, ...rest }) => {
      const vendor = vendorOutsourcing[vendorIdx];
      if (!vendor) return;
      addTenagaOutsourcing({ ...rest, vendorId: vendor.id });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorOutsourcing.length]);

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Manajemen Outsourcing
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Manajemen vendor, kontrak, dan tenaga alih daya rumah sakit</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {([['vendor', 'Vendor & Kontrak'], ['tenaga', 'Tenaga Outsourcing']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === key ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'vendor' ? <TabVendor /> : <TabTenaga />}
    </div>
  );
}
