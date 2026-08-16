import React from 'react';
import { MapPin, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full glass-panel border-t border-gray-800/80 mt-16 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-white p-0.5 border border-emerald-500/30 flex items-center justify-center overflow-hidden shadow-lg">
              <img src="/logo.png" alt="Logo Dusun Kiyudan" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-heading">
                Sistem Informasi Keuangan & Transparansi Dusun Kiyudan
              </h3>
              <p className="text-xs text-gray-400 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>RT 01 / RW 04, Desa Majaksingi, Borobudur, Magelang</span>
              </p>
            </div>
          </div>

          <div className="text-xs text-gray-400 text-center md:text-right">
            <p className="font-semibold text-emerald-400 uppercase tracking-wider text-[11px]">Guyub Rukun • Maju Bersama</p>
            <p className="font-medium text-gray-300">Pengolahan Jimpitan Rp3.000 & Tabungan Mandiri Warga</p>
            <p className="text-[11px] text-gray-500">Transparansi 100% • Tanpa Hapus Histori Pembukuan</p>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-800/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Pemuda Dusun Kiyudan. Seluruh hak cipta dilindungi.</p>
          <p className="flex items-center space-x-1">
            <span>Dibuat dengan</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>untuk Kemajuan Pemuda & Warga Kiyudan</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
