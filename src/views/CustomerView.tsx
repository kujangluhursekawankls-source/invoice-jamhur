import React, { useState } from 'react';
import { Plus, Search, Users, Edit2, Trash2, Phone, Mail, MapPin, X, Save } from 'lucide-react';
import { Customer } from '../types';
import { ConfirmModal } from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';

interface CustomerViewProps {
  customers: Customer[];
  onSaveCustomer: (customer: Omit<Customer, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  onDeleteCustomer: (id: string) => void;
}

export const CustomerView: React.FC<CustomerViewProps> = ({
  customers,
  onSaveCustomer,
  onDeleteCustomer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { showToast } = useToast();

  const [contactPerson, setContactPerson] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    setEditingCustomer(null);
    setContactPerson('');
    setName('');
    setAddress('');
    setPhone('');
    setEmail('');
    setNotes('');
    setIsModalOpen(true);
    showToast('Tambah pelanggan baru', 'info');
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setContactPerson(customer.contactPerson || '');
    setName(customer.name);
    setAddress(customer.address);
    setPhone(customer.phone || '');
    setEmail(customer.email || '');
    setNotes(customer.notes || '');
    setIsModalOpen(true);
    showToast(`Edit: ${customer.name}`, 'info');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSaveCustomer({
      id: editingCustomer?.id,
      contactPerson: contactPerson.trim() || undefined,
      name: name.trim(),
      address: address.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    setIsModalOpen(false);
    showToast(
      editingCustomer ? 'Pelanggan berhasil diperbarui!' : 'Pelanggan baru berhasil disimpan!',
      'success'
    );
  };

  const handleConfirmDelete = () => {
    if (deletingId) {
      onDeleteCustomer(deletingId);
      showToast('Data pelanggan telah dihapus', 'info');
      setDeletingId(null);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.contactPerson && c.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.phone && c.phone.includes(searchQuery))
  );

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Data Pelanggan</h2>
          <p className="text-xs text-slate-500">Nama kontak orang & nama PT/usaha</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-[#0B3B7B] hover:bg-blue-900 active:scale-95 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Tambah</span>
        </button>
      </div>

      {/* Pencarian */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama orang, PT, atau nomor telepon..."
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      </div>

      {/* List Pelanggan */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200/80 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <Users className="w-7 h-7 stroke-[1.5]" />
          </div>
          <h4 className="text-base font-bold text-slate-800">
            {searchQuery ? 'Pelanggan tidak ditemukan' : 'Belum ada pelanggan'}
          </h4>
          <p className="text-xs text-slate-500 mt-1 max-w-[240px]">
            {searchQuery
              ? 'Coba ganti kata kunci pencarian.'
              : 'Semua data pelanggan awal bersih. Tekan tombol di bawah untuk menambahkan.'}
          </p>
          {!searchQuery && (
            <button
              onClick={openAddModal}
              className="mt-4 px-5 py-2.5 bg-[#0B3B7B] text-white rounded-xl text-xs font-bold active:scale-95 shadow-sm transition-all"
            >
              + Tambah Pelanggan
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCustomers.map((cust) => (
            <div
              key={cust.id}
              className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  {cust.contactPerson && (
                    <span className="font-extrabold text-xs text-[#0B3B7B] block">
                      {cust.contactPerson}
                    </span>
                  )}
                  <h3 className="font-black text-sm text-slate-900">{cust.name}</h3>
                  {cust.phone && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                      <Phone className="w-3.5 h-3.5 text-blue-600" />
                      <span>{cust.phone}</span>
                    </div>
                  )}
                  {cust.email && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-0.5">
                      <Mail className="w-3.5 h-3.5 text-blue-600" />
                      <span>{cust.email}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(cust)}
                    className="p-2 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl active:scale-95 transition-all"
                    title="Edit Pelanggan"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingId(cust.id)}
                    className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl active:scale-95 transition-all"
                    title="Hapus Pelanggan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {cust.address && (
                <div className="flex items-start gap-1.5 text-xs text-slate-500 pt-1 border-t border-slate-100">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <span className="line-clamp-2">{cust.address}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Form Tambah/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingCustomer ? 'Edit Pelanggan' : 'Tambah Pelanggan'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nama Orang (Kontak / PIC)
                </label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Contoh: Bpk. Hendra Gunawan"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nama Perusahaan / PT / Usaha *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Alamat kantor / gudang / toko..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Telepon</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0812..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@pt.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Catatan</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Catatan tambahan..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold active:scale-95"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-[#0B3B7B] hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hapus Pelanggan */}
      <ConfirmModal
        isOpen={!!deletingId}
        title="Hapus Pelanggan"
        message="Apakah Anda yakin ingin menghapus pelanggan ini dari kontak?"
        confirmText="Ya, Hapus"
        cancelText="Batal"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
