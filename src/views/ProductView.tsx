import React, { useState } from 'react';
import { Plus, Search, Package, Edit2, Trash2, X, Save } from 'lucide-react';
import { Product } from '../types';
import { formatRupiah } from '../utils/formatters';
import { ConfirmModal } from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';

interface ProductViewProps {
  products: Product[];
  onSaveProduct: (product: Omit<Product, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  onDeleteProduct: (id: string) => void;
}

export const ProductView: React.FC<ProductViewProps> = ({
  products,
  onSaveProduct,
  onDeleteProduct,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [unit, setUnit] = useState('unit');

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setUnit('unit');
    setIsModalOpen(true);
    showToast('Tambah produk baru', 'info');
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description || '');
    setPrice(product.price);
    setUnit(product.unit || 'unit');
    setIsModalOpen(true);
    showToast(`Edit: ${product.name}`, 'info');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSaveProduct({
      id: editingProduct?.id,
      name: name.trim(),
      description: description.trim() || undefined,
      price: Number(price) || 0,
      unit: unit.trim() || 'unit',
    });

    setIsModalOpen(false);
    showToast(
      editingProduct ? 'Produk berhasil diperbarui!' : 'Produk baru berhasil disimpan ke cloud!',
      'success'
    );
  };

  const handleConfirmDelete = () => {
    if (deletingId) {
      onDeleteProduct(deletingId);
      showToast('Produk telah dihapus', 'info');
      setDeletingId(null);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Produk & Jasa</h2>
          <p className="text-xs text-slate-500">Tersimpan online untuk buat invoice cepat</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all"
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
          placeholder="Cari nama barang atau jasa..."
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      </div>

      {/* List Produk */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200/80 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <Package className="w-7 h-7 stroke-[1.5]" />
          </div>
          <h4 className="text-base font-bold text-slate-800">
            {searchQuery ? 'Produk tidak ditemukan' : 'Belum ada produk'}
          </h4>
          <p className="text-xs text-slate-500 mt-1 max-w-[240px]">
            {searchQuery
              ? 'Coba ganti kata kunci pencarian.'
              : 'Semua data produk awal bersih. Tambahkan item pertama Anda.'}
          </p>
          {!searchQuery && (
            <button
              onClick={openAddModal}
              className="mt-4 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold active:scale-95 shadow-sm transition-all"
            >
              + Tambah Produk
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between"
            >
              <div className="pr-3">
                <h3 className="font-bold text-xs text-slate-900 line-clamp-1">{prod.name}</h3>
                {prod.description && (
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                    {prod.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs font-black text-blue-900">
                    {formatRupiah(prod.price)}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    per {prod.unit || 'unit'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => openEditModal(prod)}
                  className="p-2 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl active:scale-95 transition-all"
                  title="Edit Produk"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeletingId(prod.id)}
                  className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl active:scale-95 transition-all"
                  title="Hapus Produk"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
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
                {editingProduct ? 'Edit Produk / Jasa' : 'Tambah Produk / Jasa'}
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
                  Nama Barang / Jasa *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: AC Daikin Thailand FCFC71DVM4"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Deskripsi / Spesifikasi
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Spesifikasi teknis, merek, detail instalasi..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Harga Satuan (Rp) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Satuan *
                  </label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="unit, pcs, meter, set"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
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
                  className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hapus Produk */}
      <ConfirmModal
        isOpen={!!deletingId}
        title="Hapus Produk"
        message="Apakah Anda yakin ingin menghapus produk/jasa ini dari daftar katalog?"
        confirmText="Ya, Hapus"
        cancelText="Batal"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
