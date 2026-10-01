import React, { useRef } from 'react';
import { Upload, X, RefreshCw, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  label: string;
  sublabel?: string;
  value?: string;
  onChange: (dataUrl: string | '') => void;
  aspectDesc?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  sublabel,
  value,
  onChange,
  aspectDesc = 'Format PNG transparan / JPG',
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Baca file gambar
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onChange(dataUrl);
    };
    reader.readAsDataURL(file);
    // Reset file input agar bisa upload file yang sama jika diinginkan
    e.target.value = '';
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div>
          <label className="text-sm font-semibold text-slate-800 block">{label}</label>
          {sublabel && <span className="text-xs text-slate-500 block">{sublabel}</span>}
        </div>
        <span className="text-[11px] text-slate-400">{aspectDesc}</span>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
      />

      {value ? (
        <div className="relative border border-slate-200 rounded-xl p-3 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-lg bg-white border border-slate-200 p-1 flex items-center justify-center overflow-hidden">
              <img
                src={value}
                alt={label}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mb-1">
                Tersimpan
              </span>
              <p className="text-xs text-slate-500">Gambar siap ditampilkan di invoice</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg active:scale-95 transition-all text-xs font-medium flex items-center gap-1"
              title="Ganti Gambar"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Ganti
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg active:scale-95 transition-all text-xs font-medium flex items-center gap-1"
              title="Hapus Gambar"
            >
              <X className="w-3.5 h-3.5" />
              Hapus
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/30 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors text-center"
        >
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
            <Upload className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-700">Pilih dari Galeri / File</span>
          <span className="text-[11px] text-slate-400 mt-0.5">Mendukung PNG transparan & JPG</span>
        </div>
      )}
    </div>
  );
};
