import React, { useState } from 'react';
import { Search, Plus, Eye, Download, Edit2, Trash2, FileText, AlertTriangle } from 'lucide-react';
import { Invoice, InvoiceStatus, BusinessProfile } from '../types';
import { formatRupiah, formatTanggalIndo } from '../utils/formatters';
import { useToast } from '../context/ToastContext';
import { getInvoiceFileName } from '../utils/pdfGenerator';

interface InvoiceListViewProps {
  invoices: Invoice[];
  profile: BusinessProfile;
  onCreateInvoice: () => void;
  onPreviewInvoice: (invoice: Invoice) => void;
  onEditInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  onDirectDownload: (invoice: Invoice) => void;
}

export const InvoiceListView: React.FC<InvoiceListViewProps> = ({
  invoices,
  profile,
  onCreateInvoice,
  onPreviewInvoice,
  onEditInvoice,
  onDeleteInvoice,
  onDirectDownload,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'semua' | InvoiceStatus>('semua');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { showToast } = useToast();

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'semua' ? true : inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleExecuteDelete = (id: string, invoiceNumber: string) => {
    onDeleteInvoice(id);
    setDeletingId(null);
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Header & Tombol Tambah */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Daftar Invoice</h2>
          <p className="text-xs text-slate-500">Kelola dan review invoice tersimpan online</p>
        </div>
        <button
          onClick={() => {
            showToast('Membuka form invoice baru', 'info');
            onCreateInvoice();
          }}
          className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Buat Invoice</span>
        </button>
      </div>

      {/* Input Pencarian */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nomor invoice / nama pelanggan..."
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      </div>

      {/* Filter Status Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {(
          [
            { id: 'semua', label: 'Semua' },
            { id: 'belum_lunas', label: 'Belum Lunas' },
            { id: 'lunas', label: 'Lunas' },
            { id: 'draft', label: 'Draft' },
          ] as const
        ).map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                showToast(`Filter: ${tab.label}`, 'info');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Daftar Invoice */}
      {filteredInvoices.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200/80 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <FileText className="w-7 h-7 stroke-[1.5]" />
          </div>
          <h4 className="text-base font-bold text-slate-800">
            {searchQuery ? 'Invoice tidak ditemukan' : 'Belum ada invoice'}
          </h4>
          <p className="text-xs text-slate-500 mt-1 max-w-[240px]">
            {searchQuery
              ? 'Coba ganti kata kunci pencarian nomor invoice atau nama pelanggan.'
              : 'Semua data awal bersih. Tekan tombol di bawah untuk membuat invoice baru.'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => {
                showToast('Membuka form invoice...', 'info');
                onCreateInvoice();
              }}
              className="mt-4 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold active:scale-95 shadow-sm transition-all"
            >
              + Tambah Invoice
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInvoices.map((inv) => {
            const fileName = getInvoiceFileName(inv.invoiceNumber);

            return (
              <div
                key={inv.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-blue-200 transition-all space-y-3"
              >
                {/* Header Kartu */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-extrabold text-sm text-slate-900 block tracking-tight">
                      {inv.invoiceNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-700 block mt-0.5">
                      {inv.customerName}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {formatTanggalIndo(inv.date)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full mb-1 ${
                        inv.status === 'lunas'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inv.status === 'belum_lunas'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {inv.status === 'lunas' ? 'Lunas' : inv.status === 'belum_lunas' ? 'Belum Lunas' : 'Draft'}
                    </span>
                    <span className="text-sm font-black text-slate-900 block">
                      {formatRupiah(inv.grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Info Ringkas */}
                <div className="bg-slate-50 rounded-xl p-2 text-[11px] text-slate-600 flex justify-between items-center">
                  <span>{inv.items?.length || 0} item barang/jasa</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    File: {fileName}
                  </span>
                </div>

                {/* Tombol Aksi atau Konfirmasi Hapus Langsung */}
                {deletingId === (inv.id || inv.invoiceNumber) ? (
                  <div className="pt-1 border-t border-rose-100">
                    <div className="flex items-center justify-between gap-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span className="text-xs font-bold text-rose-900 truncate">
                          Hapus invoice {inv.invoiceNumber}?
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingId(null);
                          }}
                          className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold active:scale-95 transition-all shadow-xs"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExecuteDelete(inv.id || inv.invoiceNumber, inv.invoiceNumber);
                          }}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold active:scale-95 shadow-sm shadow-rose-600/30 transition-all flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Ya, Hapus</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                    {/* Tombol Review */}
                    <button
                      type="button"
                      onClick={() => {
                        showToast('Membuka review invoice...', 'info');
                        onPreviewInvoice(inv);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold active:scale-95 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review</span>
                    </button>

                    {/* Tombol Download PDF */}
                    <button
                      type="button"
                      onClick={() => {
                        showToast(`Mengunduh ${fileName}...`, 'info');
                        onDirectDownload(inv);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold active:scale-95 transition-all shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>

                    {/* Tombol Edit */}
                    <button
                      type="button"
                      onClick={() => {
                        showToast('Mengedit invoice...', 'info');
                        onEditInvoice(inv);
                      }}
                      className="p-2.5 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl active:scale-95 transition-all"
                      title="Edit Invoice"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Tombol Hapus */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingId(inv.id || inv.invoiceNumber);
                      }}
                      className="p-2.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl active:scale-95 transition-all"
                      title="Hapus Invoice"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
