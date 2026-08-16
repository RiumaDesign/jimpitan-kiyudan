import React, { useState } from 'react';
import { Coins, CheckCircle, AlertTriangle, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PublicJimpitan: React.FC = () => {
  const { pengambilanList, currentPeriode } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'mingguan' | 'bulanan' | 'tahunan'>('mingguan');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSessions = pengambilanList.filter(s => 
    s.nomorPengambilan.toString().includes(searchTerm) ||
    s.tanggalPengambilan.includes(searchTerm) ||
    s.status.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
            <Coins className="w-3.5 h-3.5" />
            <span>Rp3.000 Setiap Pengambilan Malam Minggu</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white font-heading">
            Rekap Transparansi Jimpitan Warga
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Setiap pengambilan Rp3.000 otomatis dibagi: 50% Kas Pemuda & 50% Kas Dusun Kiyudan (Periode {currentPeriode.tahun})
          </p>
        </div>

        {/* Subtab Selector */}
        <div className="flex items-center p-1 bg-gray-900/90 rounded-2xl border border-gray-800 shrink-0">
          <button
            onClick={() => setActiveSubTab('mingguan')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'mingguan' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Sesi Mingguan
          </button>
          <button
            onClick={() => setActiveSubTab('bulanan')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'bulanan' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Rekap Bulanan
          </button>
          <button
            onClick={() => setActiveSubTab('tahunan')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'tahunan' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Rekap Tahunan
          </button>
        </div>
      </div>

      {activeSubTab === 'mingguan' && (
        <div className="space-y-4">
          
          {/* Search bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari sesi # atau tanggal..."
                className="w-full glass-input pl-10 pr-4 py-2 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <span className="text-xs text-gray-400 font-medium">
              Menampilkan {filteredSessions.length} sesi pengambilan
            </span>
          </div>

          {/* Sessions List Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSessions.map((session) => {
              const splitPemuda = Math.floor(session.totalJimpitan / 2);
              const splitDusun = Math.floor(session.totalJimpitan / 2);

              return (
                <div 
                  key={session.id} 
                  className="glass-card p-5 rounded-2xl border border-gray-800 hover:border-emerald-500/40 transition-all space-y-4 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-wider">
                        PENGAMBILAN #{session.nomorPengambilan}
                      </span>
                      <h4 className="text-base font-bold text-white mt-0.5">
                        Sabtu Malam ({session.tanggalPengambilan})
                      </h4>
                    </div>

                    <div className="text-right">
                      {session.status === 'disahkan' ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle className="w-3 h-3" />
                          <span>DISAHKAN</span>
                        </span>
                      ) : session.status === 'ada_selisih' ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          <AlertTriangle className="w-3 h-3" />
                          <span>ADA SELISIH</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          <span>BERJALAN</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stat Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
                    <div className="bg-gray-900/80 p-2.5 rounded-xl border border-gray-800">
                      <p className="text-[10px] text-gray-400 uppercase">Prosentase Diambil</p>
                      <p className="font-bold text-white mt-0.5">{session.totalSudahDiambil} / {session.totalWarga} Warga</p>
                    </div>
                    <div className="bg-gray-900/80 p-2.5 rounded-xl border border-gray-800">
                      <p className="text-[10px] text-gray-400 uppercase">Jimpitan Terkumpul</p>
                      <p className="font-bold text-amber-400 mt-0.5">Rp {session.totalJimpitan.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="col-span-2 sm:col-span-1 bg-gray-900/80 p-2.5 rounded-xl border border-gray-800">
                      <p className="text-[10px] text-gray-400 uppercase">Tabungan Sesi</p>
                      <p className="font-bold text-blue-400 mt-0.5">Rp {session.totalTabungan.toLocaleString('id-ID')}</p>
                    </div>
                  </div>

                  {/* 50:50 Split Box */}
                  <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-emerald-400">Pembagian 50:50:</span>
                      <span className="text-gray-300">Pemuda: <b className="text-white">Rp {splitPemuda.toLocaleString('id-ID')}</b></span>
                    </div>
                    <span className="text-gray-300">Dusun: <b className="text-white">Rp {splitDusun.toLocaleString('id-ID')}</b></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeSubTab === 'bulanan' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800 space-y-4">
          <h3 className="text-lg font-bold text-white font-heading">Rekapitulasi Jimpitan Bulanan (2026)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-900/80 text-gray-400 uppercase font-semibold border-b border-gray-800">
                <tr>
                  <th className="p-3">Bulan</th>
                  <th className="p-3">Jumlah Sesi</th>
                  <th className="p-3">Total Jimpitan</th>
                  <th className="p-3">50% Kas Pemuda</th>
                  <th className="p-3">50% Kas Dusun</th>
                  <th className="p-3">Total Tabungan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 text-gray-300">
                <tr>
                  <td className="p-3 font-bold text-white">Agustus 2026</td>
                  <td className="p-3">4 Sesi</td>
                  <td className="p-3 font-bold text-amber-400">Rp 914.000</td>
                  <td className="p-3 text-blue-400 font-semibold">Rp 457.000</td>
                  <td className="p-3 text-emerald-400 font-semibold">Rp 457.000</td>
                  <td className="p-3 font-bold text-gray-200">Rp 5.590.000</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-white">Juli 2026</td>
                  <td className="p-3">4 Sesi</td>
                  <td className="p-3 font-bold text-amber-400">Rp 960.000</td>
                  <td className="p-3 text-blue-400 font-semibold">Rp 480.000</td>
                  <td className="p-3 text-emerald-400 font-semibold">Rp 480.000</td>
                  <td className="p-3 font-bold text-gray-200">Rp 5.200.000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'tahunan' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800 text-center py-12 space-y-3">
          <Coins className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-xl font-bold text-white">Rekapitulasi Tahunan Jimpitan 2026</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            Total jimpitan yang terkumpul sepanjang tahun 2026 akan terakumulasi otomatis dan menjadi dasar saldo awal pembukuan tahun 2027.
          </p>
        </div>
      )}

    </div>
  );
};
