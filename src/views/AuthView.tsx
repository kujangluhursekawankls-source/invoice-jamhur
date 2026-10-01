import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { storageService } from '../services/storageService';
import { UserAccount } from '../types';
import { useToast } from '../context/ToastContext';

interface AuthViewProps {
  onAuthSuccess: (user: UserAccount) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const resetFeedback = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();
    setIsLoading(true);
    showToast('Memverifikasi akun di server cloud...', 'info');

    const res = await storageService.login(email, password);
    setIsLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
      showToast(res.error, 'error');
    } else if (res.user) {
      showToast(`Selamat datang, ${res.user.name}! Data Anda tersimpan online.`, 'success');
      onAuthSuccess(res.user);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();

    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi password tidak cocok.');
      showToast('Konfirmasi password tidak cocok', 'warning');
      return;
    }

    setIsLoading(true);
    showToast('Membuat database pribadi online...', 'info');

    const res = await storageService.register(name, email, password);
    setIsLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
      showToast(res.error, 'error');
    } else if (res.user) {
      showToast('Pendaftaran sukses! Database online siap digunakan.', 'success');
      onAuthSuccess(res.user);
    }
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();
    setIsLoading(true);

    const res = storageService.resetPassword(email);
    setIsLoading(false);
    if (!res.success) {
      setErrorMsg(res.message);
      showToast(res.message, 'error');
    } else {
      setSuccessMsg(res.message);
      showToast('Link reset password terkirim!', 'success');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950 text-white flex flex-col justify-between p-4 sm:p-6">
      {/* Top Bar Branding */}
      <div className="text-center pt-8 pb-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/30 border border-blue-400/30 shadow-lg shadow-blue-500/20 mb-3 text-blue-300">
          <span className="font-black text-2xl tracking-tighter">IJ</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white">Invoice Jamhur</h1>
        <p className="text-xs text-blue-300/80 mt-1 max-w-xs mx-auto">
          Aplikasi Pembuat Invoice Android Profesional • Data Tersimpan Online di Cloud
        </p>
      </div>

      {/* Box Form Card */}
      <div className="w-full max-w-md mx-auto bg-white rounded-3xl p-6 text-slate-800 shadow-2xl space-y-4">
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-2xl mb-4 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                resetFeedback();
                showToast('Halaman Login', 'info');
              }}
              className={`py-2.5 rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Masuk (Login)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                resetFeedback();
                showToast('Halaman Daftar Akun', 'info');
              }}
              className={`py-2.5 rounded-xl transition-all ${
                mode === 'register'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Daftar Akun Baru
            </button>
          </div>
        )}

        {/* Feedback Alert */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* FORM LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    resetFeedback();
                    showToast('Halaman Lupa Password', 'info');
                  }}
                  className="text-[11px] font-semibold text-blue-600 hover:underline"
                >
                  Lupa Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:bg-blue-400 text-white py-3 rounded-xl font-bold text-xs shadow-md shadow-blue-600/25 flex items-center justify-center gap-1.5 transition-all"
            >
              <span>{isLoading ? 'Memverifikasi online...' : 'Login'}</span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-slate-500">Belum punya akun? </span>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  resetFeedback();
                }}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Daftar sekarang
              </button>
            </div>
          </form>
        )}

        {/* FORM REGISTER */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Nama Lengkap</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Lengkap Pemilik Usaha"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Konfirmasi Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:bg-blue-400 text-white py-3 rounded-xl font-bold text-xs shadow-md shadow-blue-600/25 flex items-center justify-center gap-1.5 transition-all"
            >
              <span>{isLoading ? 'Mendaftarkan online...' : 'Daftar Akun'}</span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>

            <div className="text-center pt-1">
              <span className="text-xs text-slate-500">Sudah punya akun? </span>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  resetFeedback();
                }}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Login
              </button>
            </div>
          </form>
        )}

        {/* FORM LUPA PASSWORD */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgot} className="space-y-3.5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Reset Password</h3>
              <p className="text-xs text-slate-500 mb-3">
                Masukkan email akun Anda. Kami akan mengirimkan instruksi ke email Anda.
              </p>
              <label className="text-xs font-bold text-slate-700 block mb-1">Email Terdaftar</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:bg-blue-400 text-white py-3 rounded-xl font-bold text-xs shadow-md transition-all"
            >
              {isLoading ? 'Mengirim...' : 'Kirim Link Reset'}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('login');
                resetFeedback();
              }}
              className="w-full py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Kembali ke Login
            </button>
          </form>
        )}
      </div>

      {/* Footer Branding */}
      <div className="text-center py-4 space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-blue-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Keamanan Cloud Multi-Tenant Terisolasi</span>
        </div>
        <p className="text-[11px] font-semibold text-blue-200/60">
          Created by Jamhur
        </p>
      </div>
    </div>
  );
};
