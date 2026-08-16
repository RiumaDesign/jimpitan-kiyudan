import React, { useState } from 'react';
import { Wallet, Search, ShieldCheck, ArrowDownRight, ArrowUpRight, X, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Warga, TransaksiTabungan } from '../types';

interface SavingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublicSavingsLookup: React.FC<SavingsModalProps> = ({ isOpen, onClose }) => {
  const { lookupTabunganPublik } = useApp();
  const [nama, setNama] = useState('Anwari');
  const [kodeWarga, setKodeWarga] = useState('KDY-001');

  const [searchResult, setSearchResult] = useState<{
    searched: boolean;
    found: boolean;
    warga?: Warga;
    saldoTotal?: number;
    history?: TransaksiTabungan[];
  }>({ searched: false, found: false });

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const res = lookupTabunganPublik(nama, kodeWarga);
    setSearchResult({
      searched: true,
      found: res.found,
      warga: res.warga,
      saldoTotal: res.saldoTotal,
      history: res.history,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl glass-panel p-6 sm:p-8 rounded-3xl border border-gray-700 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
            <Wallet className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-heading">
              Cek Tabungan Mandiri Warga
            </h2>
            <p className="text-xs sm:text-sm text-gray-400">
              Masukkan Nama Warga dan Kode Warga untuk membuka saldo pribadi
            </p>
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="glass-card p-4 sm:p-5 rounded-2xl border border-gray-800 mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Nama Lengkap Warga
              </label>
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Anwari"
                className="w-full glass-input px-4 py-2.5 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Kode Warga (KDY-xxx)
              </label>
              <input
                type="text"
                required
                value={kodeWarga}
                onChange={(e) => setKodeWarga(e.target.value.toUpperCase())}
                placeholder="Contoh: KDY-001"
                className="w-full glass-input px-4 py-2.5 rounded-xl text-sm font-semibold tracking-wider uppercase focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-1.5 text-[11px] text-gray-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Privasi terjamin: Saldo warga lain tetap terlindungi</span>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 shadow-lg shadow-amber-500/20 transition-all flex items-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>Cek Saldo</span>
            </button>
          </div>
        </form>

        {/* Search Results */}
        {searchResult.searched && (
          <div>
            {!searchResult.found ? (
              <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-2">
                <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
                <h4 className="text-base font-bold text-rose-200">Data Warga Tidak Ditemukan</h4>
                <p className="text-xs text-rose-300/80 max-w-md mx-auto">
                  Nama Warga &quot;{nama}&quot; dan Kode Warga &quot;{kodeWarga}&quot; tidak cocok. Pastikan ejaan nama dan kode sesuai (contoh: Anwari & KDY-001).
                </p>
              </div>
            ) : (
              <div className="space-y-5 animate-fadeIn">
                
                {/* Result Hero Card */}
                <div className="glass-card p-6 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-gray-900/80 to-emerald-500/10 shadow-xl relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 tracking-wider">
                          {searchResult.warga?.kodeWarga}
                        </span>
                        <span className="text-xs text-gray-400">{searchResult.warga?.alamat}</span>
                      </div>
                      <h3 className="text-2xl font-black text-white font-heading mt-1">
                        {searchResult.warga?.nama}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">Status Peserta Pembukuan: <span className="text-emerald-400 font-semibold">Aktif</span></p>
                    </div>

                    <div className="text-left sm:text-right bg-gray-950/70 p-4 rounded-xl border border-gray-800">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Saldo Tabungan</p>
                      <p className="text-3xl font-black text-amber-400 font-heading tracking-tight mt-0.5">
                        Rp {searchResult.saldoTotal?.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* History Ledger Table */}
                <div>
                  <h4 className="text-sm font-bold text-gray-200 mb-3 flex items-center justify-between">
                    <span>Riwayat Transaksi Tabungan</span>
                    <span className="text-xs text-gray-400 font-normal">({searchResult.history?.length || 0} catatan)</span>
                  </h4>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {searchResult.history && searchResult.history.length > 0 ? (
                      searchResult.history.map((t) => (
                        <div
                          key={t.id}
                          className="glass-card p-3.5 rounded-xl border border-gray-800/80 flex items-center justify-between hover:border-gray-700 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                t.jenis === 'setoran'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}
                            >
                              {t.jenis === 'setoran' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                            </div>

                            <div>
                              <p className="text-xs font-bold text-white">{t.keterangan}</p>
                              <p className="text-[11px] text-gray-400">{t.createdAt}</p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span
                              className={`text-sm font-extrabold ${
                                t.jenis === 'setoran' ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {t.jenis === 'setoran' ? '+' : '-'} Rp {t.nominal.toLocaleString('id-ID')}
                            </span>
                            <p className="text-[10px] text-gray-500 capitalize">{t.jenis}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500 text-center py-4">Belum ada riwayat transaksi tabungan.</p>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
