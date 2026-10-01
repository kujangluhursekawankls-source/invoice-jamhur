import React from 'react';
import { Invoice, BusinessProfile } from '../types';
import { formatAngka, formatTanggalIndo } from '../utils/formatters';

interface InvoicePaperProps {
  invoice: Invoice;
  profile: BusinessProfile;
  id?: string;
  className?: string;
}

export const InvoicePaper: React.FC<InvoicePaperProps> = ({
  invoice,
  profile,
  id = 'invoice-render-target',
  className = '',
}) => {
  // Gunakan data profile jika data invoice tidak tersimpan secara terpisah
  const businessName = profile.name || 'NAMA USAHA ANDA';
  const businessAddress = profile.address || 'Alamat Usaha';
  const businessPhone = profile.phone || 'Nomor Telepon';
  const businessEmail = profile.email || 'email@usaha.com';

  const bankName = invoice.bankName || profile.bankName || '-';
  const bankAccountName = invoice.bankAccountName || profile.bankAccountName || '-';
  const bankAccountNumber = invoice.bankAccountNumber || profile.bankAccountNumber || '-';
  const signerName = invoice.signerName || profile.signerName || 'PIMPINAN';

  // Pisahkan alamat menjadi baris-baris agar rapi
  const addressLines = businessAddress.split('\n').filter((l) => l.trim().length > 0);
  const custAddressLines = (invoice.customerAddress || '').split('\n').filter((l) => l.trim().length > 0);

  return (
    <div
      id={id}
      className={`bg-white text-black font-sans leading-tight relative shadow-sm ${className}`}
      style={{
        width: '100%',
        maxWidth: '794px', // A4 96 DPI width standard
        minHeight: '1120px', // A4 96 DPI height standard
        padding: '36px 42px',
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
        color: '#000000',
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}
    >
      {/* ================= HEADER SECTION ================= */}
      <div className="flex justify-between items-start mb-6">
        {/* KIRI ATAS: Box INVOICE dan No. */}
        <div className="w-[45%]">
          <div className="border border-black">
            <div className="border-b border-black text-center py-2 px-6">
              <span className="text-3xl font-extrabold tracking-widest block">INVOICE</span>
            </div>
            <div className="flex items-center text-sm font-bold">
              <div className="border-r border-black px-3 py-1.5 whitespace-nowrap bg-white">
                No :
              </div>
              <div className="px-3 py-1.5 flex-1 tracking-wide uppercase truncate">
                {invoice.invoiceNumber || 'NO.MTA/04/BOGOR/05/2025'}
              </div>
            </div>
          </div>

          {/* DARI: Identitas Usaha */}
          <div className="mt-5 text-xs text-black">
            <div className="font-bold text-sm mb-0.5">Dari:</div>
            <div className="font-extrabold text-sm uppercase mb-1">{businessName}</div>
            {addressLines.map((line, idx) => (
              <div key={idx} className="leading-snug">{line}</div>
            ))}
            {businessPhone && <div className="leading-snug">{businessPhone}</div>}
            {businessEmail && <div className="leading-snug">{businessEmail}</div>}
          </div>
        </div>

        {/* KANAN ATAS: Logo, Nama Perusahaan, Tanggal, dan Kepada */}
        <div className="w-[50%] flex flex-col items-end text-right">
          {/* Logo Perusahaan (Jika ada) */}
          {profile.logoUrl ? (
            <div className="mb-1 flex justify-end">
              <img
                src={profile.logoUrl}
                alt="Logo Usaha"
                className="max-h-16 max-w-[200px] object-contain"
              />
            </div>
          ) : (
            <div className="mb-1 flex items-center justify-end">
              {/* Desain placeholder logo oval jika belum upload seperti di foto */}
              <div className="h-10 px-4 rounded-full border border-blue-800 bg-blue-900/10 flex items-center justify-center">
                <span className="text-blue-900 font-black italic text-lg tracking-wider">
                  {businessName.slice(0, 3).toUpperCase() || 'LOGO'}
                </span>
              </div>
            </div>
          )}

          {/* Nama Perusahaan Header Kanan */}
          <div className="font-black italic text-base uppercase text-black tracking-wide mb-3">
            {businessName}
          </div>

          {/* Tanggal & Data Pelanggan */}
          <div className="w-full text-left text-xs">
            <div className="font-medium text-xs mb-1">
              Date {formatTanggalIndo(invoice.date)}
            </div>
            <div className="font-bold text-sm mb-0.5">Kepada:</div>
            <div className="font-bold text-sm text-black mb-1">
              {invoice.customerName || 'Nama Pelanggan'}
            </div>
            {custAddressLines.length > 0 ? (
              custAddressLines.map((line, idx) => (
                <div key={idx} className="leading-snug">{line}</div>
              ))
            ) : (
              <div className="leading-snug">{invoice.customerAddress || 'Alamat Pelanggan'}</div>
            )}
            {invoice.customerPhone && (
              <div className="leading-snug">{invoice.customerPhone}</div>
            )}
            {invoice.customerEmail && (
              <div className="leading-snug">{invoice.customerEmail}</div>
            )}
          </div>
        </div>
      </div>

      {/* ================= TABEL BARANG / JASA ================= */}
      <div className="mb-4">
        <table className="w-full border-collapse border border-black text-xs">
          <thead>
            <tr className="border-b border-black">
              <th className="border border-black px-2 py-2 text-center font-bold w-12">No</th>
              <th className="border border-black px-3 py-2 text-center font-bold">Keterangan</th>
              <th className="border border-black px-2 py-2 text-center font-bold w-14">Qty</th>
              <th className="border border-black px-3 py-2 text-center font-bold w-32">Harga</th>
              <th className="border border-black px-3 py-2 text-center font-bold w-32">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items && invoice.items.length > 0 ? (
              invoice.items.map((item, index) => {
                const itemNumber = item.itemCode || String(index + 1);
                return (
                  <tr key={item.id || index} className="border-b border-black">
                    <td className="border border-black px-2 py-2 text-center align-middle font-medium">
                      {itemNumber}
                    </td>
                    <td className="border border-black px-3 py-2 text-left align-middle font-medium">
                      {item.description}
                      {item.unit && <span className="text-gray-600 text-[11px] ml-1">({item.unit})</span>}
                    </td>
                    <td className="border border-black px-2 py-2 text-center align-middle font-medium">
                      {item.qty}
                    </td>
                    <td className="border border-black px-3 py-2 text-right align-middle font-medium">
                      {formatAngka(item.price)}
                    </td>
                    <td className="border border-black px-3 py-2 text-right align-middle font-medium">
                      {formatAngka(item.total)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="border border-black text-center py-6 text-gray-500 italic">
                  Belum ada item barang/jasa
                </td>
              </tr>
            )}

            {/* BARIS SUBTOTAL */}
            <tr className="border-t border-black font-bold">
              <td colSpan={3} className="border-r border-black border-t-0 p-0"></td>
              <td className="border border-black px-3 py-1.5 text-center bg-gray-50">Subtotal</td>
              <td className="border border-black px-3 py-1.5 text-right">
                {formatAngka(invoice.subtotal)}
              </td>
            </tr>

            {/* BARIS PO / CATATAN & DISCOUNT */}
            <tr className="border-b border-black font-bold">
              <td
                colSpan={3}
                rowSpan={invoice.taxAmount && invoice.taxAmount > 0 ? 3 : 2}
                className="border border-black px-4 py-2 text-center align-middle text-xs font-semibold"
              >
                {invoice.poNumber || invoice.notes || (
                  <span className="text-transparent">PO/Catatan</span>
                )}
              </td>
              <td className="border border-black px-3 py-1.5 text-left flex justify-between">
                <span>Discount</span>
                <span>:</span>
              </td>
              <td className="border border-black px-3 py-1.5 text-right">
                {formatAngka(invoice.discount)}
              </td>
            </tr>

            {/* BARIS PAJAK (JIKA ADA) */}
            {invoice.taxAmount && invoice.taxAmount > 0 ? (
              <tr className="border-b border-black font-bold">
                <td className="border border-black px-3 py-1.5 text-left flex justify-between">
                  <span>PPN ({invoice.taxPercent || 11}%)</span>
                  <span>:</span>
                </td>
                <td className="border border-black px-3 py-1.5 text-right">
                  {formatAngka(invoice.taxAmount)}
                </td>
              </tr>
            ) : null}

            {/* BARIS GRAND TOTAL */}
            <tr className="border-b border-black font-extrabold text-sm">
              <td className="border border-black px-3 py-1.5 text-left flex justify-between">
                <span>Grand Total</span>
                <span>:</span>
              </td>
              <td className="border border-black px-3 py-1.5 text-right">
                {formatAngka(invoice.grandTotal)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ================= FOOTER SECTION ================= */}
      <div className="flex justify-between items-start mt-4">
        {/* KIRI BAWAH: Terbilang dan Info Rekening Transfer */}
        <div className="w-[55%]">
          <div className="text-xs mb-1 font-medium">Terbilang :</div>
          <div className="border border-black p-2.5 font-bold italic text-xs leading-normal mb-3 min-h-[40px] flex items-center bg-white">
            {invoice.terbilang || 'Nol Rupiah'}
          </div>

          <div className="text-xs space-y-0.5">
            <div className="font-medium text-black">Pembayaran Transfer Melalui</div>
            <div className="grid grid-cols-[90px_10px_1fr] items-center text-xs">
              <span>Nama Bank</span>
              <span>:</span>
              <span className="font-semibold">{bankName}</span>
            </div>
            <div className="grid grid-cols-[90px_10px_1fr] items-center text-xs">
              <span>Atas Nama</span>
              <span>:</span>
              <span className="font-semibold">{bankAccountName}</span>
            </div>
            <div className="grid grid-cols-[90px_10px_1fr] items-center text-xs">
              <span>No. Rekening</span>
              <span>:</span>
              <span className="font-semibold tracking-wide">{bankAccountNumber}</span>
            </div>
          </div>
        </div>

        {/* KANAN BAWAH: Tanda Tangan, Stempel & Nama Penandatangan */}
        <div className="w-[40%] flex flex-col items-center justify-end text-center">
          <div className="text-xs font-medium mb-1">
            {profile.signerTitle || 'Hormat Kami,'}
          </div>

          {/* Area Tanda Tangan & Stempel yang tumpang tindih realistis */}
          <div className="relative w-48 h-20 flex items-center justify-center my-1">
            {/* Stempel Usaha */}
            {profile.stampUrl && (
              <img
                src={profile.stampUrl}
                alt="Stempel Usaha"
                className="absolute w-24 h-24 object-contain opacity-75 pointer-events-none transform -rotate-6 left-2"
                style={{ mixBlendMode: 'multiply' }}
              />
            )}

            {/* Tanda Tangan Digital / Goresan */}
            {profile.signatureUrl ? (
              <img
                src={profile.signatureUrl}
                alt="Tanda Tangan"
                className="max-h-20 max-w-full object-contain relative z-10"
              />
            ) : (
              <div className="h-16 flex items-center justify-center text-gray-300 text-xs italic">
                (Tanda Tangan)
              </div>
            )}
          </div>

          {/* Nama Penandatangan Bold Uppercase */}
          <div className="font-bold text-xs uppercase tracking-wide border-t border-transparent pt-1">
            {signerName}
          </div>
        </div>
      </div>
    </div>
  );
};
