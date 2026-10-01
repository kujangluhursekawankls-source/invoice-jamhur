import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

export interface PDFExportOptions {
  fileName?: string;
  onProgress?: (progress: number, status: string) => void;
}

/**
 * Membuat nama file bersih dan sah di Android/Windows berdasarkan nomor invoice
 * Contoh: "INV/001" -> "INV-001.pdf"
 */
export function getInvoiceFileName(invoiceNumber?: string): string {
  if (!invoiceNumber || !invoiceNumber.trim()) {
    return `Invoice-${Date.now()}.pdf`;
  }
  const clean = invoiceNumber
    .trim()
    .replace(/[\/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, '_');
  return clean.endsWith('.pdf') ? clean : `${clean}.pdf`;
}

/**
 * Menghasilkan PDF dari elemen DOM invoice dengan resolusi tinggi (A4 Portrait)
 * Menggunakan html2canvas-pro yang mendukung penuh format warna oklch, lab, dan rgb.
 */
export async function generateInvoicePDF(
  element: HTMLElement,
  options: PDFExportOptions = {}
): Promise<{ blob: Blob; dataUri: string; pdf: jsPDF }> {
  const { onProgress } = options;

  if (onProgress) onProgress(15, 'Menyiapkan layout dokumen...');

  const prevWidth = element.style.width;
  const prevMaxWidth = element.style.maxWidth;
  const prevMinHeight = element.style.minHeight;
  const prevBg = element.style.backgroundColor;

  element.style.width = '794px';
  element.style.maxWidth = '794px';
  element.style.minHeight = '1123px';
  element.style.backgroundColor = '#ffffff';

  if (onProgress) onProgress(35, 'Merender dokumen presisi tinggi...');

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // 2x scale untuk ketajaman teks maksimal
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      removeContainer: true,
      imageTimeout: 15000,
    });

    if (onProgress) onProgress(70, 'Mengonversi ke format PDF A4...');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    let heightLeft = imgHeight;
    let position = 0;

    // Halaman 1
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    // Tambah halaman jika dokumen panjang
    while (heightLeft > 5) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    if (onProgress) onProgress(95, 'Menyelesaikan berkas...');

    const blob = pdf.output('blob');
    const dataUri = pdf.output('datauristring');

    return { blob, dataUri, pdf };
  } catch (error) {
    console.error('HTML2Canvas-Pro rendering error:', error);
    throw new Error('Gagal merender PDF: ' + (error instanceof Error ? error.message : String(error)));
  } finally {
    element.style.width = prevWidth;
    element.style.maxWidth = prevMaxWidth;
    element.style.minHeight = prevMinHeight;
    element.style.backgroundColor = prevBg;
  }
}

/**
 * Download file PDF langsung dengan nama file sesuai nomor invoice
 */
export async function downloadInvoicePDF(
  element: HTMLElement,
  invoiceNumber: string,
  onProgress?: (progress: number, status: string) => void
): Promise<string> {
  const safeName = getInvoiceFileName(invoiceNumber);
  const { pdf } = await generateInvoicePDF(element, { fileName: safeName, onProgress });
  pdf.save(safeName);
  return safeName;
}

/**
 * Share PDF ke WhatsApp/Email/ShareSheet Android
 */
export async function shareInvoicePDF(
  element: HTMLElement,
  invoiceNumber: string,
  title: string = 'Invoice',
  text: string = 'Berikut kami lampirkan dokumen invoice.',
  onProgress?: (progress: number, status: string) => void
): Promise<boolean> {
  const safeName = getInvoiceFileName(invoiceNumber);
  const { blob } = await generateInvoicePDF(element, { fileName: safeName, onProgress });
  const file = new File([blob], safeName, { type: 'application/pdf' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title,
        text,
        files: [file],
      });
      return true;
    } catch (err: any) {
      if (err.name === 'AbortError') return false;
      console.warn('Gagal share langsung:', err);
    }
  }

  // Fallback download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = safeName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return true;
}
