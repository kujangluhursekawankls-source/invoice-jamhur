import React, { useRef, useState, useEffect } from 'react';
import { X, Download, Edit2, Loader2, Trash2 } from 'lucide-react';
import { Invoice, BusinessProfile } from '../types';
import { ModernInvoicePaper } from '../components/ModernInvoicePaper';
import { downloadInvoicePDF, getInvoiceFileName } from '../utils/pdfGenerator';
import { ConfirmModal } from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';

interface InvoicePreviewModalProps {
  invoice: Invoice;
  profile: BusinessProfile;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (invoice: Invoice) => void;
  onDelete?: (id: string) => void;
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  invoice,
  profile,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  const exportPaperRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressStatus, setProgressStatus] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { showToast } = useToast();

  // Hitung skala otomatis agar invoice PAS di layar HP tanpa harus digeser ke samping
  useEffect(() => {
    if (!isOpen) return;

    const updateScale = () => {
      const screenWidth = window.innerWidth;
      const padding = screenWidth < 640 ? 20 : 40;
      const availableWidth = screenWidth - padding;
      const targetScale = Math.min(1, Math.max(0.35, availableWidth / 794));
      setScale(targetScale);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [isOpen]);

  if (!isOpen) return null;

  const fileName = getInvoiceFileName(invoice.invoiceNumber);

  const handleDownload = async () => {
    const targetElement = exportPaperRef.current;
    if (!targetElement || isGenerating) return;

    setIsGenerating(true);
    setProgressStatus('Menyiapkan file PDF...');
    showToast('Sedang merender PDF beresolusi tinggi...', 'info');

    try {
      const savedName = await downloadInvoicePDF(
        targetElement,
        invoice.invoiceNumber,
        (_, status) => setProgressStatus(status)
      );
      showToast(`PDF ${savedName} berhasil diunduh!`, 'success');
    } catch (err: any) {
      console.error('Download error:', err);
      showToast('Gagal mengunduh: ' + (err?.message || 'Silakan coba lagi'), 'error');
    } finally {
      setIsGenerating(false);
      setProgressStatus('');
    }
  };

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false);
    if (onDelete && invoice.id) {
      onDelete(invoice.id);
      showToast(`Invoice ${invoice.invoiceNumber} berhasil dihapus`, 'info');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex flex-col justify-between">
      {/* ================= DEDICATED OFFSCREEN UN-SCALED EXPORT CONTAINER (794px A4) ================= */}
      <div
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '794px',
          minWidth: '794px',
          maxWidth: '794px',
          minHeight: '1123px',
          backgroundColor: '#ffffff',
          zIndex: -100,
          opacity: 1,
          pointerEvents: 'none',
        }}
      >
        <div ref={exportPaperRef}>
          <ModernInvoicePaper
            id="pdf-render-export-paper"
            invoice={invoice}
            profile={profile}
          />
        </div>
      </div>

      {/* Top Bar Header Review */}
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between shadow-md border-b border-slate-800 shrink-0">
        <div>
          <span className="text-[10px] text-blue-400 font-bold block uppercase tracking-wider">
            Review Dokumen Invoice
          </span>
          <h3 className="text-xs font-bold text-white truncate max-w-[220px]">
            {invoice.invoiceNumber}
          </h3>
        </div>

        <button
          type="button"
          onClick={() => {
            showToast('Menutup review', 'info');
            onClose();
          }}
          className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Status Bar */}
      {isGenerating && (
        <div className="bg-[#0B3B7B] text-white px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 animate-pulse shrink-0">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>{progressStatus || 'Menyusun berkas PDF presisi...'}</span>
        </div>
      )}

      {/* Area Tampilan Kertas (OTOMATIS FIT LEBAR LAYAR, TANPA PERLU GULIR KE SAMPING) */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-4 bg-slate-900 flex justify-center items-start"
      >
        <div
          style={{
            width: `${Math.round(794 * scale)}px`,
            height: `${Math.round(1123 * scale)}px`,
            position: 'relative',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.6)',
            backgroundColor: '#ffffff',
            borderRadius: '2px',
          }}
        >
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              width: '794px',
              minHeight: '1123px',
            }}
          >
            <ModernInvoicePaper
              id="modal-screen-preview-paper"
              invoice={invoice}
              profile={profile}
            />
          </div>
        </div>
      </div>

      {/* Bottom Bar Tombol Ringkas */}
      <div className="bg-white border-t border-slate-200 p-3 shadow-xl flex items-center justify-between gap-2 max-w-md mx-auto w-full shrink-0">
        {/* Tombol Hapus dengan Pop Up Konfirmasi */}
        {onDelete && invoice.id && (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="p-3 bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-600 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1 shrink-0"
            title="Hapus Invoice"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {onEdit && (
          <button
            type="button"
            onClick={() => {
              showToast('Membuka editor...', 'info');
              onClose();
              onEdit(invoice);
            }}
            className="py-3 px-3.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1 shrink-0"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-600" />
            <span>Edit</span>
          </button>
        )}

        {/* Tombol Utama: Download PDF */}
        <button
          type="button"
          disabled={isGenerating}
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 px-3 bg-[#0B3B7B] hover:bg-blue-900 active:scale-[0.98] disabled:bg-slate-400 text-white rounded-2xl text-xs font-extrabold transition-all shadow-md truncate"
        >
          <Download className="w-4 h-4 shrink-0" />
          <span className="truncate">Download PDF</span>
        </button>
      </div>

      {/* Modal Konfirmasi Hapus Invoice */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Konfirmasi Hapus Invoice"
        message={`Apakah Anda yakin ingin menghapus invoice "${invoice.invoiceNumber}"? Data yang sudah dihapus tidak dapat dipulihkan.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};
