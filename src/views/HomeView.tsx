import React from 'react';
import { Plus, FileText, Calendar, Clock, DollarSign, ChevronRight, Eye } from 'lucide-react';
import { Invoice, BusinessProfile } from '../types';
import { formatAngka, formatRupiah, formatTanggalIndo } from '../utils/formatters';
import { useToast } from '../context/ToastContext';

interface HomeViewProps {
  invoices: Invoice[];
  profile: BusinessProfile;
  onCreateInvoice: () => void;
  onViewInvoice: (invoice: Invoice) => void;
  onGoToInvoices: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  invoices,
  profile,
  onCreateInvoice,
  onViewInvoice,
  onGoToInvoices,
}) => {
  const { showToast } = useToast();

  const totalInvoices = invoices.length;
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const thisMonthInvoices = invoices.filter((inv) => {
    try {
      const d = new Date(inv.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    } catch {
      return false;
    }
  });

  const unpaidInvoices = invoices.filter(
    (inv) => inv.status === 'belum_lunas' || inv.status === 'draft'
  );

  const totalNilai = invoices.reduce((acc, inv) => acc + (inv.grandTotal || 0), 0);
  const totalBelumLunas = unpaidInvoices.reduce((acc, inv) => acc + (inv.grandTotal || 0), 0);
  const recentInvoices = invoices.slice(0, 5);

  return (
    <div className="p-4 space-y-5 pb-24">
      {/* Banner Sapaan Usaha */}
      <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-2xl p-4 shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300 block mb-0.5">
            Invoice Jamhur • Cloud Active
          </span>
          <h2 className="text-lg font-extrabold truncate">
            {profile.name || 'Selamat Datang!'}
          </h2>
          <p className="text-xs text-blue-200 mt-0.5 line-clamp-1">
            {profile.address ? profile.address.split('\n')[0] : 'Kelola invoice profesional Anda.'}
          </p>
        </div>
        <div className="absolute right-[-10px] bottom-[-20px] opacity-10 text-white font-black text-7xl select-none pointer-events-none">
          INV
        </div>
      </div>

      {/* Tombol Utama Besar: + Buat Invoice */}
      <button
        type="button"
        onClick={() => {
          showToast('Membuka form pembuatan invoice baru', 'info');
          onCreateInvoice();
        }}
        className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white py-3.5 px-5 rounded-2xl font-bold shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2.5 text-base transition-all"
      >
        <div className="bg-white/20 p-1.5 rounded-xl">
          <Plus className="w-5 h-5 stroke-[3]" />
        </div>
        <span>+ Buat Invoice Baru</span>
      </button>

      {/* Grid 4 Kartu Metrik Ringkas */}
      <div className="grid grid-cols-2 gap-3">
        <div
          onClick={() => {
            showToast(`Total ${totalInvoices} invoice tercatat`, 'info');
            onGoToInvoices();
          }}
          className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between cursor-pointer active:scale-95 transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">Total Invoice</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900">{totalInvoices}</span>
            <span className="text-[11px] text-slate-400 ml-1">dokumen</span>
          </div>
        </div>

        <div
          onClick={() => {
            showToast(`${thisMonthInvoices.length} invoice terbit bulan ini`, 'info');
          }}
          className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between cursor-pointer active:scale-95 transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">Bulan Ini</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-emerald-700">{thisMonthInvoices.length}</span>
            <span className="text-[11px] text-slate-400 ml-1">terbit</span>
          </div>
        </div>

        <div
          onClick={() => {
            showToast(`${unpaidInvoices.length} invoice belum lunas`, 'warning');
            onGoToInvoices();
          }}
          className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between cursor-pointer active:scale-95 transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">Belum Lunas</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-amber-600">{unpaidInvoices.length}</span>
            <p className="text-[11px] text-slate-400 truncate">{formatRupiah(totalBelumLunas)}</p>
          </div>
        </div>

        <div
          onClick={() => {
            showToast(`Total omset invoice: ${formatRupiah(totalNilai)}`, 'info');
          }}
          className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between cursor-pointer active:scale-95 transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">Total Nilai</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-lg font-black text-slate-900 tracking-tight block truncate">
              {formatRupiah(totalNilai)}
            </span>
            <span className="text-[10px] text-slate-400">seluruh invoice</span>
          </div>
        </div>
      </div>

      {/* Riwayat Invoice Terbaru */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-bold text-slate-800">Invoice Terbaru</h3>
          {invoices.length > 0 && (
            <button
              onClick={() => {
                showToast('Menampilkan seluruh riwayat invoice', 'info');
                onGoToInvoices();
              }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
            >
              Lihat Semua
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {recentInvoices.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200/80 text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <FileText className="w-7 h-7 stroke-[1.5]" />
            </div>
            <h4 className="text-base font-bold text-slate-800">Belum ada invoice</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-[240px]">
              Data Anda masih bersih. Tekan tombol di bawah untuk membuat invoice pertama Anda.
            </p>
            <button
              onClick={() => {
                showToast('Membuka form invoice...', 'info');
                onCreateInvoice();
              }}
              className="mt-4 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold active:scale-95 shadow-sm transition-all"
            >
              + Tambah Invoice
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentInvoices.map((inv) => (
              <div
                key={inv.id}
                onClick={() => {
                  showToast(`Membuka review invoice ${inv.invoiceNumber}`, 'info');
                  onViewInvoice(inv);
                }}
                className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs hover:border-blue-300 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-xs text-slate-900">{inv.invoiceNumber}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        inv.status === 'lunas'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inv.status === 'belum_lunas'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {inv.status === 'lunas' ? 'Lunas' : inv.status === 'belum_lunas' ? 'Belum Lunas' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700 truncate">{inv.customerName}</p>
                  <span className="text-[11px] text-slate-400">{formatTanggalIndo(inv.date)}</span>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-slate-900 block">
                    {formatRupiah(inv.grandTotal)}
                  </span>
                  <span className="text-[10px] text-blue-600 font-semibold inline-flex items-center gap-0.5 mt-1">
                    <Eye className="w-3 h-3" /> Review
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="pt-4 text-center">
        <span className="text-[11px] font-medium text-slate-400">
          Created by Jamhur
        </span>
      </div>
    </div>
  );
};
