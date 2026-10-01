/**
 * Formatters khusus standar akuntansi dan bahasa Indonesia sesuai foto referensi
 */

const BULAN_INDONESIA = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

/**
 * Format angka ribuan dengan titik (seperti 28.750.000 pada tabel referensi)
 */
export function formatAngka(nominal: number | string | undefined | null): string {
  if (nominal === undefined || nominal === null || nominal === '') return '0';
  const num = typeof nominal === 'string' ? parseFloat(nominal) : nominal;
  if (isNaN(num)) return '0';
  return Math.round(num)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Format mata uang Rupiah dengan prefix Rp
 */
export function formatRupiah(nominal: number | string | undefined | null): string {
  return `Rp ${formatAngka(nominal)}`;
}

/**
 * Format tanggal Indonesia, e.g. "14 Mei 2025"
 */
export function formatTanggalIndo(dateStr?: string | Date | null): string {
  if (!dateStr) {
    const now = new Date();
    return `${now.getDate()} ${BULAN_INDONESIA[now.getMonth()]} ${now.getFullYear()}`;
  }

  try {
    const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(d.getTime())) return dateStr.toString();
    return `${d.getDate()} ${BULAN_INDONESIA[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return String(dateStr);
  }
}

/**
 * Ambil tanggal hari ini dalam format YYYY-MM-DD untuk input date
 */
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
