import React, { useState } from 'react';
import { X, BookOpen, ChevronDown, ChevronUp, Smartphone, Play, Shield, Globe, Award } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  const [openSection, setOpenSection] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<'panduan' | 'playstore'>('panduan');

  if (!isOpen) return null;

  const toggleSection = (index: number) => {
    setOpenSection(openSection === index ? null : index);
  };

  const guides = [
    {
      title: '1. Cara Membuat Akun',
      desc: 'Buka aplikasi, pilih tab "Daftar Akun Baru". Masukkan Nama Lengkap, Email yang aktif, Password (minimal 6 karakter), dan Konfirmasi Password. Tekan tombol "Daftar". Database pribadi (tenant) Anda akan otomatis dibuat.',
    },
    {
      title: '2. Cara Login',
      desc: 'Masukkan alamat email dan password yang telah Anda daftarkan pada layar login, kemudian tekan tombol "Masuk ke Akun". Sesi login Anda akan tersimpan otomatis.',
    },
    {
      title: '3. Cara Membuat Profil Usaha',
      desc: 'Buka menu "Pengaturan" di bagian bawah layar. Isi Nama Usaha (misal CV. MULIA TEKHNIK ABADI), Alamat lengkap kantor/workshop, Nomor Telepon, dan Email usaha. Tekan "Simpan Semua Pengaturan". Profil ini akan otomatis muncul pada bagian header dan info "Dari:" di invoice.',
    },
    {
      title: '4. Cara Upload Logo',
      desc: 'Pada menu "Pengaturan", buka kartu "Logo Usaha". Tekan area upload untuk memilih gambar dari galeri HP Android Anda. Disarankan menggunakan format PNG transparan atau JPG berlatar putih. Logo akan otomatis diposisikan di sudut kanan atas invoice seperti pada foto referensi.',
    },
    {
      title: '5. Cara Membuat Tanda Tangan',
      desc: 'Tersedia 2 metode: (A) Goresan Jari: Gunakan layar sentuh HP Anda untuk mencoret tanda tangan langsung pada canvas, lalu tekan "Gunakan Tanda Tangan". (B) Upload File: Pilih foto tanda tangan bertinta hitam dari galeri HP Anda.',
    },
    {
      title: '6. Cara Upload Stempel',
      desc: 'Pada menu "Pengaturan", cari bagian "Stempel Usaha". Upload file cap stempel perusahaan Anda (disarankan PNG transparan). Stempel akan otomatis diposisikan bertumpuk secara realistis dengan tanda tangan Anda di bagian "Hormat Kami".',
    },
    {
      title: '7. Cara Menambahkan Pelanggan',
      desc: 'Buka tab "Pelanggan" pada menu bawah. Tekan "+ Tambah Pelanggan". Masukkan Nama Pembeli/PT, Alamat Lengkap pengiriman, Nomor Telepon, dan Email. Tekan "Simpan". Pelanggan ini dapat langsung dipilih saat membuat invoice.',
    },
    {
      title: '8. Cara Menambahkan Produk / Jasa',
      desc: 'Buka tab "Produk" pada menu bawah. Tekan "+ Tambah Produk". Isi Nama Barang/Jasa (misal AC Daikin...), Spesifikasi, Harga Satuan, dan Satuan (unit/pcs/meter). Item ini akan mempercepat pengisian tabel barang invoice.',
    },
    {
      title: '9. Cara Membuat Invoice',
      desc: 'Tekan tombol besar "+ Buat Invoice Baru" di Beranda. Tentukan Nomor Invoice, Tanggal, pilih Pelanggan dari kontak Anda. Tambahkan baris barang/jasa dengan kuantitas dan harga satuan. Jika ada potongan trade-in, tekan tombol "+ Trade In / Baris B". Anda juga dapat memasukkan Nomor PO referensi dan diskon. Subtotal, Grand Total, dan ejaan huruf "Terbilang" akan dihitung 100% otomatis.',
    },
    {
      title: '10. Cara Mengedit Invoice',
      desc: 'Buka tab "Invoice", cari dokumen yang ingin diubah, lalu tekan ikon pensil "Edit". Lakukan perubahan data, lalu tekan tombol "Simpan Invoice".',
    },
    {
      title: '11. Cara Preview Invoice',
      desc: 'Tekan tombol "Preview" pada invoice editor atau daftar invoice. Layar akan menampilkan lembar invoice format A4 Portrait presisi tinggi yang 100% identik dengan foto referensi: kotak judul INVOICE tebal, kolom tabel bergaris hitam tegas, info bank, kotak terbilang bergaris tebal, dan tanda tangan + stempel.',
    },
    {
      title: '12. Cara Download PDF',
      desc: 'Pada layar Preview, tekan tombol biru "Download PDF". File dokumen PDF beresolusi tajam (tanpa pecah) akan langsung diunduh dan tersimpan di folder Download perangkat Android Anda.',
    },
    {
      title: '13. Cara Membagikan Invoice (Share Sheet)',
      desc: 'Tekan tombol hijau "Bagikan PDF". Android Share Sheet akan terbuka, memungkinkan Anda mengirimkan file PDF langsung ke WhatsApp klien, Gmail, Telegram, Google Drive, atau Bluetooth.',
    },
    {
      title: '14. Cara Mencetak Invoice (Print)',
      desc: 'Tekan tombol printer pada layar preview atau daftar invoice. Sistem akan memanggil layanan pencetakan Android (Android Print Service) untuk mencetak via printer WiFi / Bluetooth atau menyimpannya sebagai format cetak A4.',
    },
    {
      title: '15. Cara Melihat Riwayat Invoice',
      desc: 'Buka tab "Invoice". Anda dapat memfilter status: Belum Lunas, Lunas, atau Draft, serta mencari invoice berdasarkan nomor atau nama pelanggan melalui kolom pencarian.',
    },
    {
      title: '16. Cara Logout',
      desc: 'Buka tab "Pengaturan", gulir ke bawah, lalu tekan tombol "Keluar (Logout)". Konfirmasi pesan keluar untuk mengakhiri sesi dan membersihkan data aktif di layar HP.',
    },
    {
      title: '17. Cara Lupa Password',
      desc: 'Pada halaman Login, tekan tautan "Lupa Password?". Masukkan alamat email akun Anda dan tekan kirim. Sistem akan mengirimkan instruksi pemulihan kata sandi.',
    },
    {
      title: '18. Cara Menjaga Keamanan Akun',
      desc: 'Gunakan kata sandi yang kuat dan jangan berikan kepada pihak lain. Sistem menggunakan arsitektur multi-tenant, memastikan data invoice, pelanggan, dan tanda tangan Anda terisolasi secara ketat dan tidak dapat diakses pengguna lain.',
    },
    {
      title: '19. Cara Menggunakan Aplikasi pada HP Baru (Device Migration)',
      desc: 'Data akun Anda tersimpan secara online di Cloud. Jika Anda mengganti HP atau aplikasi sempat terhapus, cukup install kembali aplikasi ini di HP baru dan login menggunakan Email & Password yang sama. Semua invoice, pelanggan, produk, logo, dan tanda tangan Anda akan langsung muncul kembali secara otomatis tanpa ada data yang hilang!',
    },
  ];

  const playstoreSteps = [
    {
      step: '1. Build Production Web & PWA',
      detail: 'Jalankan build teroptimasi menggunakan perintah: npm run build. Aplikasi siap berjalan sebagai Progressive Web App (PWA) berkecepatan tinggi dengan offline capability.',
    },
    {
      step: '2. Konfigurasi Firebase Production & Cloud Storage',
      detail: 'Hubungkan project Firebase Anda melalui Firebase Console. Aktifkan Cloud Firestore dalam mode multi-tenant, Firebase Authentication (Email/Password), dan Firebase Storage untuk file logo, stempel, dan tanda tangan.',
    },
    {
      step: '3. Konfigurasi Firestore Security Rules',
      detail: 'Pastikan firestore.rules memvalidasi request.auth != null dan resource.data.tenantId == request.auth.uid sehingga setiap pengguna hanya dapat membaca & memodifikasi datanya sendiri.',
    },
    {
      step: '4. Packaging Android (TWA / Capacitor)',
      detail: 'Gunakan Bubblewrap CLI atau Capacitor untuk mengemas aplikasi web menjadi file Android App Bundle (.aab): "npx @bubblewrap/cli init --manifest=https://your-domain.com/manifest.json" lalu ikuti petunjuk pembuatan package com.invoicejamhur.app.',
    },
    {
      step: '5. Key Signing (Keystore)',
      detail: 'Buat keystore rilis menggunakan perintah keytool: "keytool -genkey -v -keystore invoicejamhur.keystore -alias jamhur -keyalg RSA -keysize 2048 -validity 10000". Simpan file keystore dan password Anda dengan aman.',
    },
    {
      step: '6. Akun Google Play Console & Asset Rilis',
      detail: 'Buka play.google.com/console, bayar biaya registrasi developer $25 (sekali seumur hidup). Siapkan: Icon aplikasi 512x512 PNG, Feature Graphic 1024x500 PNG, dan minimal 4 screenshot layar HP Android.',
    },
    {
      step: '7. Upload Bundle AAB & Testing Internal',
      detail: 'Upload file .aab ke menu "Testing Internal" di Play Console. Tambahkan email penguji untuk mencoba instalasi via Play Store link.',
    },
    {
      step: '8. Pengajuan Review & Publish ke Google Play',
      detail: 'Lengkapi kuesioner rating konten, kebijakan privasi, dan detail aplikasi. Ajukan rilis ke "Produksi". Tim Google Play akan mereview dalam waktu 1-3 hari kerja sebelum aplikasi tampil publik di Google Play Store.',
    },
    {
      step: '9. Cara Melakukan Update Versi',
      detail: 'Untuk merilis update fitur, naikkan versionCode di build.gradle, lakukan build paket AAB baru, buat rilis baru di Play Console, lalu submit untuk review update otomatis.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-blue-950 flex items-center justify-center">
              <BookOpen className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold leading-tight">Panduan Aplikasi</h2>
              <span className="text-[11px] text-blue-200">Invoice Jamhur • Dokumentasi Resmi</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 active:scale-95 text-blue-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigasi Panduan */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2">
          <button
            onClick={() => setActiveTab('panduan')}
            className={`flex items-center gap-1.5 py-2 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'panduan'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>19 Panduan Penggunaan</span>
          </button>

          <button
            onClick={() => setActiveTab('playstore')}
            className={`flex items-center gap-1.5 py-2 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'playstore'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Rilis Google Play Store</span>
          </button>
        </div>

        {/* Isi Panduan Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {activeTab === 'panduan' ? (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 mb-3">
                Pelajari langkah-langkah lengkap penggunaan aplikasi Invoice Jamhur dari membuat akun hingga migrasi ke perangkat baru.
              </p>
              {guides.map((item, idx) => {
                const isOpen = openSection === idx;
                return (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSection(idx)}
                      className="w-full text-left p-3 flex items-center justify-between gap-2 hover:bg-slate-50 font-bold text-xs text-slate-800 transition-colors"
                    >
                      <span className="flex-1">{item.title}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-blue-600 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="p-3 pt-0 text-xs text-slate-600 leading-relaxed bg-slate-50/50 border-t border-slate-100">
                        {item.desc}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 text-xs text-blue-900 space-y-1">
                <span className="font-extrabold block text-blue-950">
                  Panduan Teknis Siap Produksi (Section 49)
                </span>
                <p>
                  Langkah-langkah membungkus aplikasi ini menjadi file APK / AAB dan mempublikasikannya ke Google Play Store hingga siap digunakan oleh pengguna umum.
                </p>
              </div>

              {playstoreSteps.map((item, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">{item.step}</h4>
                  </div>
                  <p className="text-xs text-slate-600 pl-7 leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-400">Created by Jamhur</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl active:scale-95 text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
