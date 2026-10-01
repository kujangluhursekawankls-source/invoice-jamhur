import React from 'react';
import { Invoice, BusinessProfile } from '../types';
import { formatAngka, formatTanggalIndo } from '../utils/formatters';

interface ModernInvoicePaperProps {
  invoice: Invoice;
  profile: BusinessProfile;
  id?: string;
  className?: string;
}

export const ModernInvoicePaper: React.FC<ModernInvoicePaperProps> = ({
  invoice,
  profile,
  id = 'modern-invoice-paper',
  className = '',
}) => {
  // Profil usaha
  const businessName = profile.name || 'CV. MULIA TEKHNIK ABADI';
  const businessAddress = profile.address || 'KP. Nagrak RT 05/03 Desa Nagrak Kec. Gunung Putri Bogor';
  const businessPhone = profile.phone || '0812 1085 2489';
  const businessEmail = profile.email || 'mull.jhamur@gmail.com';

  // Rekening Bank
  const bankName = invoice.bankName || profile.bankName || 'Mandiri';
  const bankAccountName = invoice.bankAccountName || profile.bankAccountName || businessName;
  const bankAccountNumber = invoice.bankAccountNumber || profile.bankAccountNumber || '167-00-0529426-8';

  // Penandatangan
  const signerPersonName = invoice.signerName || profile.signerName || 'MUHAMAD RIDHO';
  const signerJobTitle = invoice.signerJobTitle || profile.signerJobTitle || '';

  // Data Pelanggan
  const customerPerson = invoice.customerPersonName || '';
  const customerCompany = invoice.customerName || 'PT. KANSAI PAINT';
  const customerAddress = invoice.customerAddress || 'KP BARU';

  // Komponen Penambah & Pengurang
  const adjustments = invoice.adjustments || [];
  const pengurangItems = adjustments.filter((a) => a.type === 'pengurang');
  const penambahItems = adjustments.filter((a) => a.type === 'penambah');

  const addressLines = businessAddress.split('\n').filter((l) => l.trim().length > 0);
  const custAddressLines = customerAddress.split('\n').filter((l) => l.trim().length > 0);

  return (
    <div
      id={id}
      className={className}
      style={{
        width: '794px', // Standar A4 96 DPI
        minWidth: '794px',
        maxWidth: '794px',
        minHeight: '1123px',
        margin: '0 auto',
        padding: '38px 42px',
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
        color: '#000000',
        fontFamily: 'Arial, Helvetica, sans-serif',
        display: 'block',
      }}
    >
      {/* ================= BAGIAN 1: HEADER SEIMBANG (INVOICE BOX & LOGO MTA) ================= */}
      <table
        style={{
          width: '710px',
          borderCollapse: 'collapse',
          tableLayout: 'fixed',
          marginBottom: '16px',
        }}
      >
        <tbody>
          <tr>
            {/* SISI KIRI: KOTAK BINGKAI INVOICE (LEBAR 350px) */}
            <td
              style={{
                width: '355px',
                verticalAlign: 'top',
                paddingRight: '12px',
              }}
            >
              <div
                style={{
                  border: '2px solid #000000',
                  backgroundColor: '#ffffff',
                  width: '340px',
                  boxSizing: 'border-box',
                }}
              >
                {/* Baris 1: TULISAN INVOICE BESAR */}
                <div
                  style={{
                    textAlign: 'center',
                    padding: '8px 10px',
                    borderBottom: '2px solid #000000',
                    fontSize: '24px',
                    fontWeight: 900,
                    letterSpacing: '3px',
                    color: '#000000',
                  }}
                >
                  INVOICE
                </div>

                {/* TABEL NO & TANGGAL SEJAJAR SEMPURNA */}
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    tableLayout: 'fixed',
                    fontSize: '11px',
                  }}
                >
                  <tbody>
                    <tr style={{ borderBottom: '2px solid #000000' }}>
                      <td
                        style={{
                          width: '85px',
                          padding: '6px 8px',
                          fontWeight: 'bold',
                          color: '#000000',
                          borderRight: '2px solid #000000',
                          backgroundColor: '#ffffff',
                        }}
                      >
                        No :
                      </td>
                      <td
                        style={{
                          padding: '6px 8px',
                          fontWeight: 900,
                          color: '#000000',
                          textTransform: 'uppercase',
                        }}
                      >
                        {invoice.invoiceNumber || 'INV/1026/589'}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          width: '85px',
                          padding: '6px 8px',
                          fontWeight: 'bold',
                          color: '#000000',
                          borderRight: '2px solid #000000',
                          backgroundColor: '#ffffff',
                        }}
                      >
                        Tanggal :
                      </td>
                      <td
                        style={{
                          padding: '6px 8px',
                          fontWeight: 'bold',
                          color: '#000000',
                        }}
                      >
                        {formatTanggalIndo(invoice.date)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </td>

            {/* SISI KANAN: LOGO MTA & NAMA CV SEIMBANG DENGAN KOTAK KIRI (LEBAR 355px) */}
            <td
              style={{
                width: '355px',
                verticalAlign: 'top',
                textAlign: 'right',
                paddingLeft: '12px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  minHeight: '100px',
                }}
              >
                {/* Logo Usaha Seimbang */}
                {profile.logoUrl ? (
                  <img
                    src={profile.logoUrl}
                    alt="Logo"
                    style={{
                      width: '210px',
                      maxHeight: '72px',
                      objectFit: 'contain',
                      marginBottom: '6px',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '210px',
                      height: '62px',
                      backgroundColor: '#1E3A8A',
                      borderRadius: '35px',
                      border: '2.5px solid #1E40AF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.12)',
                      marginBottom: '6px',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'Georgia, serif',
                        fontStyle: 'italic',
                        fontWeight: 900,
                        fontSize: '28px',
                        color: '#ffffff',
                        letterSpacing: '4px',
                      }}
                    >
                      MTA
                    </span>
                  </div>
                )}

                {/* Nama CV Cetak Tebal di Bawah Logo (Satu Saja, Tidak Dobel) */}
                <div
                  style={{
                    fontWeight: 900,
                    fontSize: '14px',
                    fontStyle: 'italic',
                    textTransform: 'uppercase',
                    color: '#000000',
                    letterSpacing: '0.5px',
                  }}
                >
                  {businessName}
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ================= BAGIAN 2: DARI & KEPADA 100% SEJAJAR (SESUAI PERMINTAAN) ================= */}
      <table
        style={{
          width: '710px',
          borderCollapse: 'collapse',
          tableLayout: 'fixed',
          marginBottom: '16px',
        }}
      >
        <tbody>
          <tr>
            {/* DARI (KIRI) */}
            <td
              style={{
                width: '355px',
                verticalAlign: 'top',
                paddingRight: '12px',
                fontSize: '11px',
                lineHeight: '1.4',
                color: '#000000',
              }}
            >
              <div style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '2px' }}>
                Dari:
              </div>
              <div
                style={{
                  fontWeight: 900,
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  marginBottom: '2px',
                }}
              >
                {businessName}
              </div>
              {addressLines.map((line, idx) => (
                <div key={idx} style={{ color: '#111827' }}>{line}</div>
              ))}
              {businessPhone && <div style={{ color: '#111827' }}>Telp: {businessPhone}</div>}
              {businessEmail && <div style={{ color: '#111827' }}>Email: {businessEmail}</div>}
            </td>

            {/* KEPADA (KANAN) - SEJAJAR PERSIS SECARA HORIZONTAL DENGAN DARI */}
            <td
              style={{
                width: '355px',
                verticalAlign: 'top',
                paddingLeft: '12px',
                fontSize: '11px',
                lineHeight: '1.4',
                color: '#000000',
              }}
            >
              <div style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '2px' }}>
                Kepada:
              </div>
              {customerPerson && (
                <div
                  style={{
                    fontWeight: 900,
                    fontSize: '13px',
                    color: '#000000',
                    marginBottom: '1px',
                  }}
                >
                  {customerPerson}
                </div>
              )}
              <div
                style={{
                  fontWeight: 900,
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  color: '#000000',
                  marginBottom: '2px',
                }}
              >
                {customerCompany}
              </div>
              {custAddressLines.map((line, idx) => (
                <div key={idx} style={{ color: '#111827' }}>{line}</div>
              ))}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ================= NOMOR PO (JIKA ADA) ================= */}
      {invoice.poNumber && invoice.poNumber.trim().length > 0 && (
        <div
          style={{
            width: '710px',
            border: '1.5px solid #000000',
            backgroundColor: '#f8fafc',
            padding: '6px 12px',
            fontSize: '11px',
            fontWeight: 'bold',
            marginBottom: '14px',
            display: 'flex',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
          }}
        >
          <span style={{ color: '#4b5563' }}>Referensi Pesanan:</span>
          <span style={{ fontWeight: 900, color: '#000000' }}>
            {invoice.poNumber.toLowerCase().includes('po')
              ? invoice.poNumber
              : `Sesuai dengan Nomor PO ${invoice.poNumber}`}
          </span>
        </div>
      )}

      {/* ================= TABEL URAIAN PEKERJAAN (LEBAR TETAP 710px) ================= */}
      <table
        style={{
          width: '710px',
          borderCollapse: 'collapse',
          border: '2px solid #000000',
          tableLayout: 'fixed',
          fontSize: '11px',
          marginBottom: '16px',
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #000000' }}>
            <th style={{ width: '40px', padding: '8px 4px', textAlign: 'center', fontWeight: 900, borderRight: '1px solid #000000' }}>No.</th>
            <th style={{ width: '280px', padding: '8px 8px', textAlign: 'left', fontWeight: 900, borderRight: '1px solid #000000' }}>Uraian Pekerjaan / Keterangan</th>
            <th style={{ width: '55px', padding: '8px 4px', textAlign: 'center', fontWeight: 900, borderRight: '1px solid #000000' }}>Qty</th>
            <th style={{ width: '65px', padding: '8px 4px', textAlign: 'center', fontWeight: 900, borderRight: '1px solid #000000' }}>Satuan</th>
            <th style={{ width: '120px', padding: '8px 8px', textAlign: 'right', fontWeight: 900, borderRight: '1px solid #000000' }}>Harga Satuan</th>
            <th style={{ width: '150px', padding: '8px 8px', textAlign: 'right', fontWeight: 900 }}>Jumlah (Rp)</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items && invoice.items.length > 0 ? (
            invoice.items.map((item, idx) => (
              <tr
                key={item.id || idx}
                style={{
                  borderBottom: '1px solid #000000',
                  backgroundColor: idx % 2 === 1 ? '#fafafa' : '#ffffff',
                }}
              >
                <td style={{ padding: '7px 4px', textAlign: 'center', fontWeight: 'bold', borderRight: '1px solid #000000' }}>
                  {item.itemCode || idx + 1}
                </td>
                <td style={{ padding: '7px 8px', fontWeight: 600, borderRight: '1px solid #000000', wordBreak: 'break-word' }}>
                  {item.description}
                </td>
                <td style={{ padding: '7px 4px', textAlign: 'center', fontWeight: 'bold', borderRight: '1px solid #000000' }}>
                  {item.qty}
                </td>
                <td style={{ padding: '7px 4px', textAlign: 'center', borderRight: '1px solid #000000' }}>
                  {item.unit || 'unit'}
                </td>
                <td style={{ padding: '7px 8px', textAlign: 'right', borderRight: '1px solid #000000' }}>
                  {formatAngka(item.price)}
                </td>
                <td style={{ padding: '7px 8px', textAlign: 'right', fontWeight: 900 }}>
                  {formatAngka(item.total)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontStyle: 'italic' }}>
                Belum ada rincian uraian pekerjaan
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ================= BAGIAN BAWAH: INFO BANK, SUMMARY & TANDA TANGAN ================= */}
      <table
        style={{
          width: '710px',
          borderCollapse: 'collapse',
          tableLayout: 'fixed',
        }}
      >
        <tbody>
          <tr>
            {/* SISI KIRI: INFORMASI PEMBAYARAN, TERBILANG, CATATAN (355px) */}
            <td
              style={{
                width: '355px',
                verticalAlign: 'top',
                paddingRight: '12px',
              }}
            >
              {/* KOTAK INFORMASI PEMBAYARAN BANK */}
              <div
                style={{
                  border: '1.5px solid #000000',
                  padding: '10px 12px',
                  backgroundColor: '#ffffff',
                  fontSize: '11px',
                  marginBottom: '10px',
                }}
              >
                <div
                  style={{
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    marginBottom: '4px',
                    color: '#000000',
                  }}
                >
                  Pembayaran Transfer Melalui
                </div>
                <div style={{ lineHeight: '1.5' }}>
                  <div>Nama Bank: <strong>{bankName}</strong></div>
                  <div>Atas Nama: <strong>{bankAccountName}</strong></div>
                  <div>No. Rekening: <strong style={{ letterSpacing: '0.5px' }}>{bankAccountNumber}</strong></div>
                </div>
              </div>

              {/* TERBILANG OTOMATIS */}
              <div
                style={{
                  border: '1.5px solid #000000',
                  padding: '8px 12px',
                  backgroundColor: '#ffffff',
                  fontSize: '11px',
                  marginBottom: '10px',
                }}
              >
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    color: '#4b5563',
                    marginBottom: '2px',
                  }}
                >
                  Terbilang :
                </div>
                <div
                  style={{
                    fontStyle: 'italic',
                    fontWeight: 900,
                    color: '#000000',
                    lineHeight: '1.3',
                  }}
                >
                  "{invoice.terbilang || 'Nol Rupiah'}"
                </div>
              </div>

              {/* CATATAN: HANYA TAMPIL BILA DIISI */}
              {invoice.notes && invoice.notes.trim().length > 0 && (
                <div
                  style={{
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    padding: '8px 10px',
                    backgroundColor: '#f8fafc',
                    fontSize: '10.5px',
                    color: '#334155',
                  }}
                >
                  <div style={{ fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '2px', color: '#000000' }}>
                    Catatan:
                  </div>
                  <div style={{ whiteSpace: 'pre-line', lineHeight: '1.4' }}>
                    {invoice.notes}
                  </div>
                </div>
              )}
            </td>

            {/* SISI KANAN: SUMMARY TOTAL & TANDA TANGAN (355px) */}
            <td
              style={{
                width: '355px',
                verticalAlign: 'top',
                paddingLeft: '12px',
              }}
            >
              {/* KOTAK SUMMARY HITUNGAN */}
              <div
                style={{
                  border: '2px solid #000000',
                  backgroundColor: '#ffffff',
                  marginBottom: '14px',
                  fontSize: '11px',
                }}
              >
                <div style={{ padding: '8px 10px', lineHeight: '1.6' }}>
                  {/* Subtotal */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                    <span>Subtotal</span>
                    <span>Rp {formatAngka(invoice.subtotal)}</span>
                  </div>

                  {/* Komponen Pengurang */}
                  {pengurangItems.map((adj) => (
                    <div
                      key={adj.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontWeight: 'bold',
                        color: '#b91c1c',
                      }}
                    >
                      <span>- {adj.label}</span>
                      <span>-Rp {formatAngka(adj.amount)}</span>
                    </div>
                  ))}

                  {/* Komponen Penambah */}
                  {penambahItems.map((adj) => (
                    <div
                      key={adj.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontWeight: 'bold',
                        color: '#1d4ed8',
                      }}
                    >
                      <span>+ {adj.label}</span>
                      <span>+Rp {formatAngka(adj.amount)}</span>
                    </div>
                  ))}

                  {/* Pajak PPN */}
                  {invoice.taxAmount && invoice.taxAmount > 0 ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                      <span>PPN {invoice.taxPercent || 11}%</span>
                      <span>Rp {formatAngka(invoice.taxAmount)}</span>
                    </div>
                  ) : null}
                </div>

                {/* TOTAL TAGIHAN / GRAND TOTAL */}
                <div
                  style={{
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    padding: '8px 10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '2px solid #000000',
                  }}
                >
                  <span style={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>
                    TOTAL TAGIHAN
                  </span>
                  <span style={{ fontWeight: 900, fontSize: '15px' }}>
                    Rp {formatAngka(invoice.grandTotal)}
                  </span>
                </div>
              </div>

              {/* AREA TANDA TANGAN */}
              <div style={{ textAlign: 'right', fontSize: '11px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  {profile.signerTitle || 'Hormat kami,'}
                </div>

                {/* Ruang TTD + Stempel + Materai */}
                <div
                  style={{
                    height: '75px',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '8px',
                    margin: '4px 0',
                  }}
                >
                  {/* Materai Tempel Jika Digunakan */}
                  {invoice.hasMaterai && (
                    <div
                      style={{
                        width: '58px',
                        height: '50px',
                        border: '1.5px dashed #64748b',
                        backgroundColor: '#fffbeb',
                        color: '#92400e',
                        borderRadius: '4px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '8px',
                        fontWeight: 'bold',
                        lineHeight: 1,
                        padding: '2px',
                        boxSizing: 'border-box',
                      }}
                    >
                      <span>MATERAI</span>
                      <span>TEMPEL</span>
                      <span style={{ fontWeight: 900, fontSize: '9px', marginTop: '2px' }}>10.000</span>
                    </div>
                  )}

                  {/* Stempel Usaha */}
                  {profile.stampUrl && (
                    <img
                      src={profile.stampUrl}
                      alt="Stempel"
                      style={{
                        position: 'absolute',
                        right: '55px',
                        width: '72px',
                        height: '72px',
                        objectFit: 'contain',
                        opacity: 0.8,
                        transform: 'rotate(-5deg)',
                        pointerEvents: 'none',
                      }}
                    />
                  )}

                  {/* Tanda Tangan */}
                  {profile.signatureUrl ? (
                    <img
                      src={profile.signatureUrl}
                      alt="Tanda Tangan"
                      style={{
                        maxHeight: '75px',
                        maxWidth: '130px',
                        objectFit: 'contain',
                        position: 'relative',
                        zIndex: 2,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        height: '50px',
                        width: '110px',
                        borderBottom: '1px dashed #9ca3af',
                      }}
                    />
                  )}
                </div>

                {/* Garis & Nama Penandatangan */}
                <div
                  style={{
                    display: 'inline-block',
                    borderTop: '1.5px solid #000000',
                    paddingTop: '4px',
                    minWidth: '160px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontWeight: 900, fontSize: '11px', textTransform: 'uppercase' }}>
                    {signerPersonName}
                  </div>
                  <div style={{ fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase', color: '#111827' }}>
                    {businessName}
                  </div>
                  {signerJobTitle && (
                    <div style={{ fontSize: '9.5px', color: '#4b5563' }}>
                      {signerJobTitle}
                    </div>
                  )}
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
