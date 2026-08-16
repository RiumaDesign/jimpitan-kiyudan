import React, { useState } from 'react';
import { Landmark, ArrowDownRight, ArrowUpRight, FileText, Image as ImageIcon, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { TransaksiKas } from '../types';

export const PublicKasLedger: React.FC = () => {
  const { transaksiKasList, getSaldoKasPemuda, getSaldoKasDusun, currentPeriode } = useApp();
  const [activeTab, setActiveTab] = useState<'semua' | 'kas_pemuda' | 'kas_dusun'>('semua');
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

  const saldoPemuda = getSaldoKasPemuda();
  const saldoDusun = getSaldoKasDusun();

  const filteredKas = transaksiKasList.filter(t => {
    if (activeTab === 'kas_pemuda') return t.jenisKas === 'kas_pemuda';
    if (activeTab === 'kas_dusun') return t.jenisKas === 'kas_dusun';
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-2">
            <Landmark className="w-3.5 h-3.5" />
            <span>Ledger Terpisah Kas Pemuda & Kas Dusun</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white font-heading">
            Ledger Transparansi Keuangan Kas
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Seluruh pemasukan, pengeluaran, dan bukti nota dapat diakses secara transparan oleh warga (Periode {currentPeriode.tahun})
          </p>
        </div>

        {/* Balance Cards */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="glass-card p-3.5 rounded-2xl border border-blue-500/30 bg-blue-500/5 text-right">
            <p className="text-[10px] uppercase font-bold text-blue-400">Kas Pemuda</p>
            <p className="text-lg font-black text-white font-heading">Rp {saldoPemuda.toLocaleString('id-ID')}</p>
          </div>
          <div className="glass-card p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 text-right">
            <p className="text-[10px] uppercase font-bold text-emerald-400">Kas Dusun</p>
            <p className="text-lg font-black text-white font-heading">Rp {saldoDusun.toLocaleString('id-ID')}</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-gray-800 pb-3">
        <button
          onClick={() => setActiveTab('semua')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'semua' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:text-white bg-gray-900/60'
          }`}
        >
          Semua Kas ({transaksiKasList.length})
        </button>
        <button
          onClick={() => setActiveTab('kas_pemuda')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'kas_pemuda' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white bg-gray-900/60'
          }`}
        >
          Kas Pemuda
        </button>
        <button
          onClick={() => setActiveTab('kas_dusun')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'kas_dusun' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:text-white bg-gray-900/60'
          }`}
        >
          Kas Dusun
        </button>
      </div>

      {/* Ledger Table */}
      <div className="glass-panel rounded-3xl border border-gray-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-900/90 text-gray-400 uppercase font-semibold border-b border-gray-800">
              <tr>
                <th className="p-4">Tanggal</th>
                <th className="p-4">Jenis Kas</th>
                <th className="p-4">Kategori / Keterangan</th>
                <th className="p-4">Pencatat</th>
                <th className="p-4">Bukti Nota</th>
                <th className="p-4 text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-gray-300">
              {filteredKas.map((t: TransaksiKas) => {
                const isIncome = t.jenisTransaksi === 'saldo_awal' || t.jenisTransaksi === 'pemasukan';
                return (
                  <tr key={t.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="p-4 font-semibold text-gray-300">{t.tanggal}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          t.jenisKas === 'kas_pemuda'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {t.jenisKas.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{t.keterangan}</div>
                      {t.kategoriNama && <div className="text-[11px] text-gray-400 mt-0.5">{t.kategoriNama}</div>}
                    </td>
                    <td className="p-4 text-gray-400">{t.createdBy}</td>
                    <td className="p-4">
                      {t.buktiFoto ? (
                        <button
                          onClick={() => setSelectedReceipt(t.buktiFoto || null)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 flex items-center space-x-1"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Lihat Nota</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-gray-600 font-medium">Tanpa Nota</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {isIncome ? (
                          <ArrowDownRight className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-rose-400" />
                        )}
                        <span
                          className={`text-sm font-extrabold font-heading ${
                            isIncome ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isIncome ? '+' : '-'} Rp {t.nominal.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-500 capitalize">{t.jenisTransaksi.replace('_', ' ')}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="max-w-xl w-full glass-panel p-6 rounded-3xl border border-gray-700 relative text-center">
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-center space-x-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              <span>Bukti Nota Transaksi</span>
            </h3>
            <img 
              src={selectedReceipt} 
              alt="Bukti Nota" 
              className="w-full max-h-96 object-contain rounded-2xl border border-gray-800" 
            />
          </div>
        </div>
      )}

    </div>
  );
};
