import React, { useState } from 'react';
import {
  Building2,
  Image as ImageIcon,
  PenTool,
  Stamp,
  CreditCard,
  Hash,
  LogOut,
  HelpCircle,
  Save,
  UserCheck,
} from 'lucide-react';
import { BusinessProfile, UserAccount } from '../types';
import { ImageUploader } from '../components/ImageUploader';
import { SignaturePad } from '../components/SignaturePad';
import { ConfirmModal } from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';

interface SettingsViewProps {
  profile: BusinessProfile;
  currentUser: UserAccount | null;
  onSaveProfile: (profile: BusinessProfile) => void;
  onLogout: () => void;
  onOpenGuide: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  currentUser,
  onSaveProfile,
  onLogout,
  onOpenGuide,
}) => {
  const [formData, setFormData] = useState<BusinessProfile>(profile);
  const [activeSignTab, setActiveSignTab] = useState<'draw' | 'upload'>('draw');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { showToast } = useToast();

  const handleChange = (field: keyof BusinessProfile, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    showToast('Semua pengaturan profil dan penandatangan disimpan!', 'success');
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    showToast('Berhasil keluar dari akun', 'info');
    onLogout();
  };

  return (
    <div className="p-4 space-y-4 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Pengaturan Usaha</h2>
          <p className="text-xs text-slate-500">Profil CV, penandatangan, logo & stempel</p>
        </div>
        <button
          type="button"
          onClick={() => {
            showToast('Membuka panduan aplikasi...', 'info');
            onOpenGuide();
          }}
          className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-xl text-xs font-bold active:scale-95 flex items-center gap-1"
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
          <span>Panduan</span>
        </button>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-4">
        {/* IDENTITAS USAHA (CV / PT) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-[#0B3B7B]" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Identitas Usaha / Perusahaan
            </h3>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Nama Usaha / CV / PT *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Contoh: CV. MULIA TEKHNIK ABADI"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Tagline / Bidang Usaha (Opsional)
            </label>
            <input
              type="text"
              value={formData.tagline || ''}
              onChange={(e) => handleChange('tagline', e.target.value)}
              placeholder="Contoh: KONTRAKTOR & KONSULTAN TEKNIK"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Alamat Lengkap Usaha
            </label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Jl. Letda Nasir No. 58 Bogor..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Nomor Telepon / WA</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="0812 1085 2489"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Email Usaha</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="kontak@usaha.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 7. NAMA PENANDATANGAN TERPISAH DARI NAMA USAHA (MENU BARU) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <UserCheck className="w-4 h-4 text-[#0B3B7B]" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Data Penandatangan (Berbeda dengan Nama Usaha)
            </h3>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Nama Orang Penandatangan *
            </label>
            <input
              type="text"
              required
              value={formData.signerName}
              onChange={(e) => handleChange('signerName', e.target.value)}
              placeholder="Contoh: MUHAMAD RIDHO"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-slate-900 focus:bg-white focus:outline-none uppercase"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Jabatan / Title
              </label>
              <input
                type="text"
                value={formData.signerJobTitle || ''}
                onChange={(e) => handleChange('signerJobTitle', e.target.value)}
                placeholder="Contoh: Direktur / Pemilik"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Teks Pembuka TTD
              </label>
              <input
                type="text"
                value={formData.signerTitle || 'Hormat kami,'}
                onChange={(e) => handleChange('signerTitle', e.target.value)}
                placeholder="Hormat kami,"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 6. LOGO CV BESAR */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <ImageIcon className="w-4 h-4 text-[#0B3B7B]" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Logo Usaha / CV (Tampil Besar & Proporsional)
            </h3>
          </div>

          <ImageUploader
            label="Upload Logo Perusahaan"
            sublabel="Ditampilkan besar di sisi kiri atas kop invoice"
            value={formData.logoUrl}
            onChange={(val) => {
              handleChange('logoUrl', val);
              showToast(val ? 'Logo CV diperbarui' : 'Logo dihapus', 'info');
            }}
            aspectDesc="PNG Transparan / JPG"
          />
        </div>

        {/* TANDA TANGAN */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <PenTool className="w-4 h-4 text-[#0B3B7B]" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Tanda Tangan Digital
              </h3>
            </div>

            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setActiveSignTab('draw')}
                className={`px-2 py-1 rounded-md transition-all ${
                  activeSignTab === 'draw'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                Gores Jari
              </button>
              <button
                type="button"
                onClick={() => setActiveSignTab('upload')}
                className={`px-2 py-1 rounded-md transition-all ${
                  activeSignTab === 'upload'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                Upload File
              </button>
            </div>
          </div>

          {activeSignTab === 'draw' ? (
            <SignaturePad
              initialSignature={formData.signatureUrl}
              onSave={(dataUrl) => {
                handleChange('signatureUrl', dataUrl);
                showToast('Tanda tangan goresan jari diterapkan!', 'success');
              }}
            />
          ) : (
            <ImageUploader
              label="Upload File Tanda Tangan"
              sublabel="File gambar tanda tangan Anda dari galeri HP"
              value={formData.signatureUrl}
              onChange={(val) => {
                handleChange('signatureUrl', val);
                showToast(val ? 'Tanda tangan diunggah' : 'Tanda tangan dihapus', 'info');
              }}
              aspectDesc="PNG Transparan disarankan"
            />
          )}
        </div>

        {/* STEMPEL USAHA */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <Stamp className="w-4 h-4 text-[#0B3B7B]" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Stempel Usaha
            </h3>
          </div>

          <ImageUploader
            label="Upload Stempel Perusahaan"
            sublabel="Ditampilkan secara tumpang tindih natural di area tanda tangan"
            value={formData.stampUrl}
            onChange={(val) => {
              handleChange('stampUrl', val);
              showToast(val ? 'Stempel diunggah' : 'Stempel dihapus', 'info');
            }}
            aspectDesc="PNG Transparan / Cap Basah"
          />
        </div>

        {/* REKENING BANK */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <CreditCard className="w-4 h-4 text-[#0B3B7B]" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Informasi Pembayaran Bank
            </h3>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Nama Bank</label>
            <input
              type="text"
              value={formData.bankName}
              onChange={(e) => handleChange('bankName', e.target.value)}
              placeholder="Contoh: Bank Mandiri / BCA / BRI / BNI"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Atas Nama Rekening</label>
            <input
              type="text"
              value={formData.bankAccountName}
              onChange={(e) => handleChange('bankAccountName', e.target.value)}
              placeholder="Contoh: a.n CV. Mulia Tehnik Abadi"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Nomor Rekening</label>
            <input
              type="text"
              value={formData.bankAccountNumber}
              onChange={(e) => handleChange('bankAccountNumber', e.target.value)}
              placeholder="Contoh: 123-456-7890-0"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none tracking-wider"
            />
          </div>
        </div>

        {/* MOTTO BANNER BAWAH */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
            Motto Footer Bawah
          </h3>
          <div>
            <input
              type="text"
              value={formData.footerMotto || ''}
              onChange={(e) => handleChange('footerMotto', e.target.value)}
              placeholder="Contoh: MEMBANGUN STRUKTUR, MENATA MASA DEPAN"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Tombol Simpan */}
        <button
          type="submit"
          className="w-full bg-[#0B3B7B] hover:bg-blue-900 active:scale-[0.98] text-white py-3.5 px-5 rounded-2xl font-bold shadow-lg shadow-blue-900/25 flex items-center justify-center gap-2 text-sm transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Simpan Semua Pengaturan</span>
        </button>

        {/* LOGOUT */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
            Akun Anda (Tersimpan Online)
          </h3>

          <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Akun:</span>
              <span className="font-bold text-slate-800">{currentUser?.name || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Email:</span>
              <span className="font-bold text-slate-800">{currentUser?.email || '-'}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </form>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Konfirmasi Keluar Akun"
        message="Apakah Anda yakin ingin keluar dari akun ini?"
        confirmText="Ya, Keluar"
        cancelText="Batal"
        confirmVariant="danger"
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      <div className="text-center pt-2">
        <span className="text-[11px] font-semibold text-slate-400">
          Created by Jamhur
        </span>
      </div>
    </div>
  );
};
