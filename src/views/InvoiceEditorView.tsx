import React, { useState } from 'react';
import { Plus, Trash2, ArrowLeft, Eye, Save, MinusCircle, PlusCircle, Stamp } from 'lucide-react';
import { Customer, Invoice, InvoiceItem, InvoiceStatus, Product, BusinessProfile, AdjustmentItem } from '../types';
import { formatAngka, formatRupiah, getTodayDateString } from '../utils/formatters';
import { terbilang } from '../utils/terbilang';
import { useToast } from '../context/ToastContext';

interface InvoiceEditorViewProps {
  initialInvoice?: Invoice | null;
  customers: Customer[];
  products: Product[];
  profile: BusinessProfile;
  onSave: (invoiceData: Partial<Invoice> & { invoiceNumber: string; customerName: string }) => void;
  onPreview: (tempInvoice: Invoice) => void;
  onCancel: () => void;
}

export const InvoiceEditorView: React.FC<InvoiceEditorViewProps> = ({
  initialInvoice,
  customers,
  products,
  profile,
  onSave,
  onPreview,
  onCancel,
}) => {
  const { showToast } = useToast();

  // 10. Format Nomor Invoice Manual Sesuai Permintaan
  const [invoiceNumber, setInvoiceNumber] = useState(
    initialInvoice?.invoiceNumber || ''
  );
  const [date, setDate] = useState(initialInvoice?.date || getTodayDateString());
  const [status, setStatus] = useState<InvoiceStatus>(
    initialInvoice?.status || 'belum_lunas'
  );

  // 5. Menu Sesuai Nomor PO (Penting)
  const [poNumber, setPoNumber] = useState(initialInvoice?.poNumber || '');

  // 2. Kepada: Nama Orang lalu Nama PT / Usaha
  const [customerId, setCustomerId] = useState(initialInvoice?.customerId || '');
  const [customerPersonName, setCustomerPersonName] = useState(initialInvoice?.customerPersonName || '');
  const [customerName, setCustomerName] = useState(initialInvoice?.customerName || '');
  const [customerAddress, setCustomerAddress] = useState(initialInvoice?.customerAddress || '');

  // Detail Proyek
  const [projectName, setProjectName] = useState(initialInvoice?.projectName || '');
  const [projectLocation, setProjectLocation] = useState(initialInvoice?.projectLocation || '');
  const [projectPeriod, setProjectPeriod] = useState(initialInvoice?.projectPeriod || '');

  // Item List
  const [items, setItems] = useState<InvoiceItem[]>(
    initialInvoice?.items && initialInvoice.items.length > 0
      ? initialInvoice.items
      : [
          {
            id: 'item_1',
            itemCode: '1',
            description: '',
            qty: 1,
            unit: 'unit',
            price: 0,
            total: 0,
          },
        ]
  );

  // Komponen Trade-In & Pengurang / Penambah
  const [adjustments, setAdjustments] = useState<AdjustmentItem[]>(
    initialInvoice?.adjustments || []
  );

  // Pajak PPN
  const [hasTax, setHasTax] = useState<boolean>((initialInvoice?.taxAmount || 0) > 0);
  const [taxPercent, setTaxPercent] = useState<number>(initialInvoice?.taxPercent || 11);

  // 9. Ruang Materai
  const [hasMaterai, setHasMaterai] = useState<boolean>(initialInvoice?.hasMaterai || false);

  // 4. Catatan Bisa Diedit (Bila kosong maka tidak ditampilkan di invoice)
  const [notes, setNotes] = useState(initialInvoice?.notes || '');
  const [errorMessage, setErrorMessage] = useState('');

  // Handle Pilih Pelanggan
  const handleSelectCustomer = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setCustomerId(selectedId);
    if (!selectedId) return;

    const cust = customers.find((c) => c.id === selectedId);
    if (cust) {
      setCustomerPersonName(cust.contactPerson || '');
      setCustomerName(cust.name);
      setCustomerAddress(cust.address);
      showToast(`Pelanggan ${cust.name} dipilih`, 'info');
    }
  };

  const handleAddItem = () => {
    const nextNumber = items.length + 1;
    const newItem: InvoiceItem = {
      id: 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      itemCode: String(nextNumber),
      description: '',
      qty: 1,
      unit: 'unit',
      price: 0,
      total: 0,
    };
    setItems([...items, newItem]);
    showToast('Baris baru ditambahkan', 'info');
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items];
    const current = { ...updated[index], [field]: value };
    const qty = Number(current.qty) || 0;
    const price = Number(current.price) || 0;
    current.total = Math.max(0, qty * price);
    updated[index] = current;
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      setItems([
        {
          id: 'item_' + Date.now(),
          itemCode: '1',
          description: '',
          qty: 1,
          unit: 'unit',
          price: 0,
          total: 0,
        },
      ]);
      return;
    }
    const updated = items.filter((_, idx) => idx !== index);
    let counter = 1;
    setItems(updated.map((item) => ({ ...item, itemCode: String(counter++) })));
    showToast('Baris dihapus', 'info');
  };

  const handleAddAdjustment = (type: 'pengurang' | 'penambah') => {
    const newAdj: AdjustmentItem = {
      id: 'adj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      type,
      label: type === 'pengurang' ? 'Trade In Barang Bekas' : 'Biaya Tambahan / Ongkir',
      amount: 0,
    };
    setAdjustments([...adjustments, newAdj]);
    showToast(type === 'pengurang' ? 'Komponen Trade In ditambahkan' : 'Komponen Penambah ditambahkan', 'info');
  };

  const handleAdjustmentChange = (id: string, field: 'label' | 'amount', value: any) => {
    setAdjustments(
      adjustments.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  const handleRemoveAdjustment = (id: string) => {
    setAdjustments(adjustments.filter((a) => a.id !== id));
    showToast('Komponen dihapus', 'info');
  };

  // Perhitungan
  const subtotal = items.reduce((acc, it) => acc + (it.total || 0), 0);
  const totalPengurang = adjustments
    .filter((a) => a.type === 'pengurang')
    .reduce((acc, a) => acc + (Number(a.amount) || 0), 0);

  const totalPenambah = adjustments
    .filter((a) => a.type === 'penambah')
    .reduce((acc, a) => acc + (Number(a.amount) || 0), 0);

  const netBeforeTax = Math.max(0, subtotal - totalPengurang + totalPenambah);
  const taxAmount = hasTax ? Math.round(netBeforeTax * (taxPercent / 100)) : 0;
  const grandTotal = netBeforeTax + taxAmount;
  const terbilangRupiah = terbilang(grandTotal);

  const buildInvoicePayload = (): Invoice => {
    return {
      id: initialInvoice?.id || '',
      tenantId: initialInvoice?.tenantId || '',
      userId: initialInvoice?.userId || '',
      invoiceNumber: invoiceNumber.trim() || 'INV/001',
      date,
      poNumber: poNumber.trim() || undefined,
      customerId: customerId || undefined,
      customerPersonName: customerPersonName.trim() || undefined,
      customerName: customerName.trim() || 'Nama Pelanggan',
      customerAddress: customerAddress.trim(),
      projectName: projectName.trim() || undefined,
      projectLocation: projectLocation.trim() || undefined,
      projectPeriod: projectPeriod.trim() || undefined,
      items: items.filter((it) => it.description.trim().length > 0 || it.price > 0),
      subtotal,
      adjustments,
      totalPenambah,
      totalPengurang,
      taxPercent: hasTax ? taxPercent : 0,
      taxAmount,
      grandTotal,
      terbilang: terbilangRupiah,
      hasMaterai,
      bankName: profile.bankName,
      bankAccountName: profile.bankAccountName,
      bankAccountNumber: profile.bankAccountNumber,
      signerName: profile.signerName,
      signerJobTitle: profile.signerJobTitle,
      notes: notes.trim() || undefined,
      status,
      createdAt: initialInvoice?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
  };

  const handlePreviewClick = () => {
    if (!customerName.trim() && !customerPersonName.trim()) {
      setErrorMessage('Isi nama orang atau nama usaha pelanggan terlebih dahulu.');
      showToast('Data pelanggan wajib diisi', 'warning');
      return;
    }
    setErrorMessage('');
    onPreview(buildInvoicePayload());
  };

  const handleSaveClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceNumber.trim()) {
      setErrorMessage('Ketik nomor invoice terlebih dahulu.');
      showToast('Nomor invoice tidak boleh kosong', 'warning');
      return;
    }
    if (!customerName.trim() && !customerPersonName.trim()) {
      setErrorMessage('Nama pelanggan wajib diisi.');
      showToast('Nama pelanggan wajib diisi', 'warning');
      return;
    }

    setErrorMessage('');
    onSave(buildInvoicePayload());
  };

  return (
    <div className="p-4 space-y-4 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-slate-600 hover:bg-slate-200 rounded-xl active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              {initialInvoice ? 'Edit Invoice' : 'Buat Invoice Baru'}
            </h2>
            <p className="text-xs text-slate-500">Nomor manual & format rapi</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePreviewClick}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold active:scale-95"
        >
          <Eye className="w-4 h-4" />
          <span>Review</span>
        </button>
      </div>

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-2.5 rounded-xl text-xs font-semibold">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSaveClick} className="space-y-4">
        {/* BAGIAN 1: NOMOR INVOICE MANUAL & TANGGAL */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            Nomor Invoice & Tanggal
          </h3>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Nomor Invoice (Ketik Bebas / Manual) *
            </label>
            <input
              type="text"
              required
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="Contoh: INV/001 atau NO.MTA/04/BOGOR/05/2025"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-black text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Tanggal Terbit *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Status Pembayaran
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none"
              >
                <option value="belum_lunas">Belum Lunas</option>
                <option value="lunas">Lunas</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {/* 5. NOMOR PO REFERENSI */}
          <div>
            <label className="text-xs font-bold text-[#0B3B7B] block mb-1">
              Sesuai dengan Nomor PO (Penting)
            </label>
            <input
              type="text"
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              placeholder="Contoh: KPIN-MIS-2503-118 atau PO-042/IX/2026"
              className="w-full bg-blue-50/50 border border-blue-200 rounded-xl px-3 py-2 text-xs font-bold text-blue-900 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* BAGIAN 2: KEPADA (NAMA ORANG LALU NAMA PT / USAHA) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Kepada (Pelanggan)
            </h3>
            {customers.length > 0 && (
              <span className="text-[11px] text-blue-600 font-semibold">Pilih Kontak</span>
            )}
          </div>

          {customers.length > 0 && (
            <select
              value={customerId}
              onChange={handleSelectCustomer}
              className="w-full bg-blue-50/60 border border-blue-200 rounded-xl px-3 py-2 text-xs text-blue-900 font-medium focus:outline-none"
            >
              <option value="">-- Pilih dari Kontak Tersimpan --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.contactPerson ? `${c.contactPerson} (${c.name})` : c.name}
                </option>
              ))}
            </select>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Nama Orang (PIC / Kontak Pelanggan)
            </label>
            <input
              type="text"
              value={customerPersonName}
              onChange={(e) => setCustomerPersonName(e.target.value)}
              placeholder="Contoh: Bpk. Hendra Gunawan / Ibu Ratna"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Nama PT / Toko / Usaha Pelanggan *
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Contoh: PT Sumber Logistik Nusantara"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Alamat Lengkap
            </label>
            <textarea
              rows={2}
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="Jl. Pergudangan Timur No. 8 Tangerang, Banten 15118"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* BAGIAN 3: URAIAN BARANG / PEKERJAAN */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Uraian Pekerjaan / Barang & Jasa
            </h3>
            <button
              type="button"
              onClick={handleAddItem}
              className="bg-[#0B3B7B] hover:bg-blue-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold active:scale-95 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah Baris</span>
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-700">
                    Baris #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <input
                  type="text"
                  required
                  value={item.description}
                  onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                  placeholder="Uraian pekerjaan / nama barang..."
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none"
                />

                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Volume</label>
                    <input
                      type="number"
                      min="0.01"
                      step="any"
                      required
                      value={item.qty}
                      onChange={(e) =>
                        handleItemChange(idx, 'qty', parseFloat(e.target.value) || 0)
                      }
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-center font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Satuan</label>
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                      placeholder="unit/set/proyek"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-center text-slate-900"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Harga Satuan (Rp)</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      required
                      value={item.price || ''}
                      onChange={(e) =>
                        handleItemChange(idx, 'price', parseFloat(e.target.value) || 0)
                      }
                      placeholder="0"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-right text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200 font-semibold text-slate-700">
                  <span className="text-[11px] text-slate-400">Total Baris:</span>
                  <span className="font-extrabold text-slate-900">{formatRupiah(item.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BAGIAN 5: TRADE-IN & KOMPONEN PENGURANG / PENAMBAH */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                Trade In & Komponen Pengurang / Penambah
              </h3>
              <p className="text-[11px] text-slate-400">
                Atur trade-in barang lama, potongan, atau biaya tambahan
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleAddAdjustment('pengurang')}
                className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 active:scale-95"
              >
                <MinusCircle className="w-3.5 h-3.5" />
                <span>+ Trade In</span>
              </button>
              <button
                type="button"
                onClick={() => handleAddAdjustment('penambah')}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 active:scale-95"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Penambah</span>
              </button>
            </div>
          </div>

          {adjustments.length === 0 ? (
            <div className="border border-dashed border-slate-200 rounded-xl p-3 text-center text-slate-400 text-xs">
              Belum ada komponen trade in atau biaya penambah.
            </div>
          ) : (
            <div className="space-y-2">
              {adjustments.map((adj) => (
                <div
                  key={adj.id}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    adj.type === 'pengurang'
                      ? 'bg-rose-50/50 border-rose-200'
                      : 'bg-blue-50/50 border-blue-200'
                  }`}
                >
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      adj.type === 'pengurang'
                        ? 'bg-rose-200 text-rose-800'
                        : 'bg-blue-200 text-blue-800'
                    }`}
                  >
                    {adj.type === 'pengurang' ? 'Pengurang (-)' : 'Penambah (+)'}
                  </span>

                  <input
                    type="text"
                    value={adj.label}
                    onChange={(e) => handleAdjustmentChange(adj.id, 'label', e.target.value)}
                    placeholder={
                      adj.type === 'pengurang'
                        ? 'Contoh: Trade In AC Bekas'
                        : 'Contoh: Biaya Pengiriman'
                    }
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-900"
                  />

                  <div className="w-32">
                    <input
                      type="number"
                      min="0"
                      value={adj.amount || ''}
                      onChange={(e) =>
                        handleAdjustmentChange(adj.id, 'amount', parseFloat(e.target.value) || 0)
                      }
                      placeholder="0"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-black text-right text-slate-900"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveAdjustment(adj.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BAGIAN 6: RUANG MATERAI & CATATAN */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            Materai & Catatan Pembayaran
          </h3>

          {/* 9. Pilihan Materai */}
          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={hasMaterai}
                onChange={(e) => {
                  setHasMaterai(e.target.checked);
                  showToast(e.target.checked ? 'Kotak materai 10.000 diaktifkan' : 'Materai dinonaktifkan', 'info');
                }}
                className="rounded text-[#0B3B7B] focus:ring-blue-500 w-4 h-4"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Sisipkan Kotak Materai Tempel (10.000)
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Menyediakan ruang resmi materai di samping tanda tangan & stempel
                </span>
              </div>
            </label>
          </div>

          {/* 4. Catatan (Bisa Diedit Bebas, Jika Kosong Tidak Tampil) */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Catatan Invoice (Opsional - Kosongkan jika tidak diperlukan)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Harap mencantumkan nomor invoice pada saat transfer pembayaran..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* BAGIAN 7: SUMMARY HITUNGAN & TOTAL TAGIHAN */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            Perhitungan & Total Tagihan
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-1">
              <span className="font-semibold text-slate-600">Subtotal:</span>
              <span className="font-bold text-slate-900 text-sm">{formatRupiah(subtotal)}</span>
            </div>

            {totalPengurang > 0 && (
              <div className="flex justify-between items-center py-1 text-rose-600 font-bold border-t border-slate-100">
                <span>Total Trade In / Pengurang:</span>
                <span>-{formatRupiah(totalPengurang)}</span>
              </div>
            )}

            {totalPenambah > 0 && (
              <div className="flex justify-between items-center py-1 text-blue-700 font-bold border-t border-slate-100">
                <span>Total Biaya Penambah:</span>
                <span>+{formatRupiah(totalPenambah)}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasTax}
                  onChange={(e) => setHasTax(e.target.checked)}
                  className="rounded text-[#0B3B7B] focus:ring-blue-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-800">Kenakan PPN</span>
              </label>
              {hasTax && (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                    className="w-12 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-xs text-center font-bold"
                  />
                  <span className="text-xs font-bold text-slate-500">%</span>
                </div>
              )}
            </div>

            {hasTax && (
              <div className="flex justify-between items-center text-xs pl-6 text-slate-600">
                <span>Nominal PPN:</span>
                <span className="font-bold text-slate-900">{formatRupiah(taxAmount)}</span>
              </div>
            )}

            {/* TOTAL TAGIHAN BAR */}
            <div className="bg-[#0B3B7B] text-white p-3 rounded-xl flex justify-between items-center mt-2">
              <span className="font-extrabold text-xs uppercase tracking-wide">
                TOTAL TAGIHAN
              </span>
              <span className="font-black text-lg tracking-tight">
                {formatRupiah(grandTotal)}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-700">
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
                Terbilang:
              </span>
              <p className="text-xs font-semibold italic text-slate-900">
                "{terbilangRupiah}"
              </p>
            </div>
          </div>
        </div>

        {/* Tombol Simpan & Review */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handlePreviewClick}
            className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
          >
            <Eye className="w-4 h-4" />
            <span>Review</span>
          </button>

          <button
            type="submit"
            className="flex-1 py-3 px-4 bg-[#0B3B7B] hover:bg-blue-900 active:scale-95 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Invoice</span>
          </button>
        </div>
      </form>
    </div>
  );
};
