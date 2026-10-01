import React from 'react';
import { HelpCircle, User, Wifi, WifiOff } from 'lucide-react';
import { UserAccount } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface AndroidHeaderProps {
  currentUser: UserAccount | null;
  onOpenGuide: () => void;
  title?: string;
  isOnline?: boolean;
}

export const AndroidHeader: React.FC<AndroidHeaderProps> = ({
  currentUser,
  onOpenGuide,
  title = 'Invoice Jamhur',
  isOnline = true,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white px-4 py-3 shadow-md flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center font-black text-sm text-blue-200">
          IJ
        </div>
        <div>
          <h1 className="text-base font-extrabold tracking-tight leading-tight">{title}</h1>
          <div className="flex items-center gap-1.5 text-[10px] text-blue-200">
            {isOnline ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <Wifi className="w-2.5 h-2.5" /> Cloud Aktif
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400">
                <WifiOff className="w-2.5 h-2.5" /> Mode Offline
              </span>
            )}
            <span>•</span>
            <span className="truncate max-w-[120px]">{currentUser?.name || 'Tamu'}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <PWAInstallButton />
        <button
          onClick={onOpenGuide}
          className="flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 active:scale-95 px-2.5 py-1.5 rounded-lg border border-white/15 transition-all text-blue-100"
          title="Panduan Lengkap"
        >
          <HelpCircle className="w-4 h-4 text-amber-300" />
          <span className="font-semibold text-xs hidden sm:inline">Panduan</span>
        </button>
      </div>
    </header>
  );
};
