export type InvoiceStatus = 'draft' | 'belum_lunas' | 'lunas' | 'batal';

export interface InvoiceItem {
  id: string;
  itemCode?: string; // e.g. "1", "2", "3"
  description: string; // Uraian Pekerjaan / Nama Barang / Jasa
  qty: number; // Volume / Qty
  unit: string; // Satuan (e.g. proyek, paket, unit, m2, pcs, titik)
  price: number; // Harga Satuan (Rp)
  total: number; // Qty * Price
}

export interface AdjustmentItem {
  id: string;
  type: 'penambah' | 'pengurang'; // penambah (biaya kirim, jasa tambah) atau pengurang (trade in, diskon, DP)
  label: string; // e.g. "Trade In AC Lama", "Diskon Negosiasi", "Uang Muka (DP)"
  amount: number;
}

export interface Customer {
  id: string;
  tenantId: string;
  contactPerson?: string; // Nama Orang (PIC)
  name: string; // Nama PT / Usaha
  address: string;
  phone: string;
  email?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  price: number;
  unit: string;
  createdAt: number;
  updatedAt: number;
}

export interface BusinessProfile {
  name: string; // Nama Usaha / CV / PT (contoh: CV. MULIA TEKHNIK ABADI)
  tagline?: string; // Contoh: KONTRAKTOR & KONSULTAN TEKNIK
  address: string; // Alamat kantor/workshop
  phone: string; // Telp / WA
  email: string; // Email usaha
  website?: string;
  footerMotto?: string; // Motto banner bawah
  
  // Penandatangan (Dibuat Terpisah Sesuai Permintaan)
  signerName: string; // Nama Orang Penandatangan (contoh: MUHAMAD RIDHO)
  signerJobTitle?: string; // Jabatan (contoh: Direktur / Pemilik)
  signerTitle?: string; // Contoh: Hormat kami,
  
  // Rekening Bank
  bankName: string; // Bank Mandiri / BCA / dsb
  bankAccountName: string; // a.n CV. Mulia Tehnik Abadi
  bankAccountNumber: string; // 123-456-7890-0
  
  // Gambar
  logoUrl?: string; // Logo CV
  stampUrl?: string; // Stempel
  signatureUrl?: string; // Tanda Tangan
  invoicePrefix?: string; // Prefix nomor invoice
  defaultNotes?: string;
}

export interface Invoice {
  id: string;
  tenantId: string;
  userId: string;
  invoiceNumber: string; // Manual (contoh: INV/001 atau NO.MTA/04/BOGOR/05/2025)
  date: string; // Tanggal Terbit
  poNumber?: string; // Sesuai dengan Nomor PO KPIN-MIS-2503-118
  
  // Customer Info (Nama Orang lalu Nama PT/Usaha)
  customerId?: string;
  customerPersonName?: string; // Nama Orang (misal: Bpk. Ridho / PIC)
  customerName: string; // Nama PT / Usaha (misal: PT Sumber Logistik Nusantara)
  customerAddress: string;
  customerPhone?: string;
  customerEmail?: string;
  
  // Rincian Proyek (Opsional)
  projectName?: string;
  projectLocation?: string;
  projectPeriod?: string;
  
  // Items & Calculations
  items: InvoiceItem[];
  subtotal: number;
  
  // Komponen Penambah & Pengurang (Trade-in / Potongan / Biaya Tambahan)
  adjustments?: AdjustmentItem[];
  totalPenambah?: number;
  totalPengurang?: number;
  discount?: number;
  
  // Pajak PPN
  taxPercent: number; // e.g. 11%
  taxAmount: number;
  
  grandTotal: number; // TOTAL TAGIHAN
  terbilang: string;
  
  // Materai & TTD
  hasMaterai?: boolean; // Opsi tempel materai 10.000 di area TTD
  
  // Bank & Signer
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  signerName?: string;
  signerJobTitle?: string;
  notes?: string; // Catatan pembayaran (hanya tampil bila diisi)
  
  status: InvoiceStatus;
  createdAt: number;
  updatedAt: number;
}

export interface UserAccount {
  uid: string;
  name: string;
  email: string;
  tenantId: string;
  createdAt: number;
}
