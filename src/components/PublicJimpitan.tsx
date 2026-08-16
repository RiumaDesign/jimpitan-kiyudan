import React, { useState } from 'react';
import { 
  Coins, CheckCircle, Search, Filter, 
  Table, LayoutGrid, Eye, X, Calendar 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { PengambilanMingguan } from '../types';

export const PublicJimpitan: React.FC = () => {
  const { 
    pengambilanList, currentPeriode, periodeList, wargaList, transaksiPengambilanList 
  } = useApp();

  const [viewMode, setViewMode] = useState<'tabel' | 'kartu'>('tabel');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBulan, setSelectedBulan] = useState<number | 'semua'>('semua');
  const [selectedTahun, setSelectedTahun] = useState<number | 'semua'>(currentPeriode.tahun);
  const [filterStatus, setFilterStatus] = useState<string>('semua');

  // Detail Modal State for inspecting 40 Warga in a specific session
  const [detailSession, setDetailSession] = useState<PengambilanMingguan | null>(null);

  const bulans = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
  ];

  // Filter sessions strictly based on user controls
  const filteredSessions = pengambilanList.filter(s => {
    // Filter Tahun
    const dateObj = new Date(s.tanggalPengambilan);
    const sessionYear = dateObj.getFullYear();
    if (selectedTahun !== 'semua' && sessionYear !== Number(selectedTahun)) {
      return false;
    }

    // Filter Bulan
    if (selectedBulan !== 'semua') {
      const sessionMonth = dateObj.getMonth() + 1;
      if (sessionMonth !== Number(selectedBulan)) return false;
    }

    // Filter Status
    if (filterStatus !== 'semua' && s.status !== filterStatus) {
      return false;
    }

    // Filter Search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchNum = `sesi ${s.nomorPengambilan}`.includes(term) || s.nomorPengambilan.toString().includes(term);
      const matchDate = s.tanggalPengambilan.includes(term);
      const matchOfficer = (s.petugasLapangan || '').toLowerCase().includes(term);
      if (!matchNum && !matchDate && !matchOfficer) return false;
    }

    return true;
  }).sort((a, b) => a.nomorPengambilan - b.nomorPengambilan);

  // Grand Totals for Filtered View
  const grandJimpitan = filteredSessions.reduce((sum, s) => sum + s.totalJimpitan, 0);
  const grandTabungan = filteredSessions.reduce((sum, s) => sum + s.totalTabungan, 0);
  const grandTotalSetoran = filteredSessions.reduce((sum, s) => sum + s.totalSetoran, 0);
  const grandKasPemuda = Math.floor(grandJimpitan / 2);

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
            <Coins className="w-3.5 h-3.5" />
            <span>Rekapitulasi Pengambilan Jimpitan & Tabungan Sesi #001, #002, #003, #004...</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white font-heading">
            Tabel Transparansi Sesi Pengambilan
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Lihat rincian jimpitan Rp3.000 & tabungan warga per minggu, filter per bulan/tahun, dan cek rincian 40 KK.
          </p>
        </div>

        {/* View Switcher & Subtab */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="flex items-center p-1 bg-gray-900 rounded-2xl border border-gray-800">
            <button
              onClick={() => setViewMode('tabel')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                viewMode === 'tabel' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Table className="w-4 h-4" />
              <span>Tabel Data</span>
            </button>
            <button
              onClick={() => setViewMode('kartu')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                viewMode === 'kartu' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Tampilan Kartu</span>
            </button>
          </div>
        </div>
      </div>

      {/* FILTER CONTROL BAR */}
      <div className="glass-panel p-5 rounded-3xl border border-gray-800 space-y-4 shadow-xl">
        <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-emerald-400" />
          <span>Filter Sesi Pengambilan (Minggu / Tanggal, Bulan & Tahun)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari sesi #1, tanggal, petugas..."
              className="w-full glass-input pl-9 pr-3 py-2 rounded-xl text-xs font-medium text-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Filter Bulan */}
          <div>
            <select
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(e.target.value === 'semua' ? 'semua' : Number(e.target.value))}
              className="w-full glass-input px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-gray-900"
            >
              <option value="semua">Semua Bulan (Januari - Desember)</option>
              {bulans.map(b => (
                <option key={b.value} value={b.value}>Bulan {b.label}</option>
              ))}
            </select>
          </div>

          {/* Filter Tahun */}
          <div>
            <select
              value={selectedTahun}
              onChange={(e) => setSelectedTahun(e.target.value === 'semua' ? 'semua' : Number(e.target.value))}
              className="w-full glass-input px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-gray-900"
            >
              <option value="semua">Semua Tahun Pembukuan</option>
              {periodeList.map(p => (
                <option key={p.id} value={p.tahun}>Tahun Pembukuan {p.tahun}</option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full glass-input px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-gray-900"
            >
              <option value="semua">Semua Status Sesi</option>
              <option value="disahkan">🟢 Disahkan (Resmi)</option>
              <option value="berjalan">🟡 Berjalan (Sedang Diambil)</option>
            </select>
          </div>

        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-gray-800 text-xs">
          <span className="text-gray-400 font-medium">
            Menampilkan <b className="text-white font-bold">{filteredSessions.length} Sesi Pengambilan</b>
          </span>

          <div className="flex items-center space-x-3 text-[11px] text-gray-300">
            <span>Total Setoran: <b className="text-emerald-400 font-bold">Rp {grandTotalSetoran.toLocaleString('id-ID')}</b></span>
            <span>(Jimpitan: <b className="text-amber-400">Rp {grandJimpitan.toLocaleString('id-ID')}</b> • Tabungan: <b className="text-blue-400">Rp {grandTabungan.toLocaleString('id-ID')}</b>)</span>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: TABEL DATA LENGKAP */}
      {viewMode === 'tabel' && (
        <div className="glass-panel rounded-3xl border border-gray-800 overflow-hidden shadow-2xl space-y-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-900/90 text-gray-400 uppercase font-bold border-b border-gray-800 tracking-wider">
                <tr>
                  <th className="p-4 text-center">Sesi #</th>
                  <th className="p-4">Tanggal Pengambilan</th>
                  <th className="p-4">Petugas Lapangan</th>
                  <th className="p-4 text-center">Warga Diambil</th>
                  <th className="p-4 text-right">Jimpitan (3k)</th>
                  <th className="p-4 text-right">Tabungan Warga</th>
                  <th className="p-4 text-right">Total Setoran</th>
                  <th className="p-4 text-right">50% Pemuda / Dusun</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Aksi Rincian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 text-gray-300">
                {filteredSessions.map((session) => {
                  const splitPemuda = Math.floor(session.totalJimpitan / 2);
                  const isPassed = session.status === 'disahkan';

                  return (
                    <tr key={session.id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="p-4 text-center font-black text-amber-400 text-sm font-heading">
                        #{session.nomorPengambilan}
                      </td>

                      <td className="p-4 font-bold text-white whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{session.tanggalPengambilan}</span>
                        </div>
                      </td>

                      <td className="p-4 font-medium text-emerald-300 max-w-xs truncate">
                        {session.petugasLapangan || 'Kelompok SATU'}
                      </td>

                      <td className="p-4 text-center">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-gray-900 text-gray-200 border border-gray-800">
                          {session.totalSudahDiambil} / {session.totalWarga} KK
                        </span>
                      </td>

                      <td className="p-4 text-right font-bold text-amber-400 whitespace-nowrap">
                        Rp {session.totalJimpitan.toLocaleString('id-ID')}
                      </td>

                      <td className="p-4 text-right font-bold text-blue-400 whitespace-nowrap">
                        Rp {session.totalTabungan.toLocaleString('id-ID')}
                      </td>

                      <td className="p-4 text-right font-black text-emerald-400 text-sm font-heading whitespace-nowrap">
                        Rp {session.totalSetoran.toLocaleString('id-ID')}
                      </td>

                      <td className="p-4 text-right text-gray-400 text-[11px] whitespace-nowrap">
                        Rp {splitPemuda.toLocaleString('id-ID')} / kas
                      </td>

                      <td className="p-4 text-center whitespace-nowrap">
                        {isPassed ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle className="w-3 h-3" />
                            <span>DISAHKAN</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            <span>BERJALAN</span>
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => setDetailSession(session)}
                          className="px-3 py-1.5 rounded-xl font-bold text-xs bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 transition-all flex items-center space-x-1 mx-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail 40 KK</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Summary Table Footer */}
              <tfoot className="bg-gray-950 font-bold border-t-2 border-gray-800 text-white">
                <tr>
                  <td colSpan={4} className="p-4 uppercase text-emerald-400 text-xs">
                    TOTAL AKUMULASI TABEL SESI:
                  </td>
                  <td className="p-4 text-right text-amber-400 font-bold">
                    Rp {grandJimpitan.toLocaleString('id-ID')}
                  </td>
                  <td className="p-4 text-right text-blue-400 font-bold">
                    Rp {grandTabungan.toLocaleString('id-ID')}
                  </td>
                  <td className="p-4 text-right text-emerald-400 font-black text-sm font-heading">
                    Rp {grandTotalSetoran.toLocaleString('id-ID')}
                  </td>
                  <td className="p-4 text-right text-gray-300 text-xs">
                    Rp {grandKasPemuda.toLocaleString('id-ID')} / kas
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: KARTU SESI */}
      {viewMode === 'kartu' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSessions.map((session) => {
            const splitPemuda = Math.floor(session.totalJimpitan / 2);

            return (
              <div 
                key={session.id} 
                className="glass-card p-5 rounded-3xl border border-gray-800 hover:border-emerald-500/40 transition-all space-y-4 shadow-xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider">
                      SESI PENGAMBILAN #{session.nomorPengambilan}
                    </span>
                    <h4 className="text-lg font-bold text-white mt-0.5">
                      Sabtu Malam ({session.tanggalPengambilan})
                    </h4>
                    <p className="text-xs text-emerald-300 mt-0.5 font-medium">
                      Petugas: {session.petugasLapangan || 'Kelompok SATU'}
                    </p>
                  </div>

                  <div className="text-right">
                    {session.status === 'disahkan' ? (
                      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>DISAHKAN</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        <span>BERJALAN</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Stat Grid */}
                <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                  <div className="bg-gray-900/80 p-3 rounded-2xl border border-gray-800">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Warga Diambil</p>
                    <p className="font-bold text-white mt-0.5">{session.totalSudahDiambil} / {session.totalWarga} KK</p>
                  </div>
                  <div className="bg-gray-900/80 p-3 rounded-2xl border border-gray-800">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Jimpitan (3k)</p>
                    <p className="font-bold text-amber-400 mt-0.5">Rp {session.totalJimpitan.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="bg-gray-900/80 p-3 rounded-2xl border border-gray-800">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Tabungan Sesi</p>
                    <p className="font-bold text-blue-400 mt-0.5">Rp {session.totalTabungan.toLocaleString('id-ID')}</p>
                  </div>
                </div>

                {/* Action & Split */}
                <div className="p-3 rounded-2xl bg-gray-900/90 border border-gray-800 flex items-center justify-between text-xs">
                  <div className="text-gray-300">
                    <span className="text-[11px] text-gray-400 block">Split 50:50 Jimpitan:</span>
                    <span className="font-bold text-emerald-400">Rp {splitPemuda.toLocaleString('id-ID')} / kas</span>
                  </div>

                  <button
                    onClick={() => setDetailSession(session)}
                    className="px-4 py-2 rounded-xl font-bold text-xs bg-emerald-600 text-white shadow-md hover:bg-emerald-500 transition-all flex items-center space-x-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Detail 40 KK &rarr;</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* POPUP MODAL DETAIL 40 WARGA FOR A SPECIFIC SESSION */}
      {detailSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-3xl glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/40 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-5">
            
            <button
              onClick={() => setDetailSession(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    SESI #{detailSession.nomorPengambilan}
                  </span>
                  <span className="text-xs text-gray-400">Sabtu Malam ({detailSession.tanggalPengambilan})</span>
                </div>
                <h3 className="text-xl font-bold text-white font-heading mt-0.5">
                  Rincian Pengambilan Jimpitan & Tabungan 40 KK Warga
                </h3>
              </div>
            </div>

            {/* Officer Metadata Box */}
            <div className="p-3.5 rounded-2xl bg-gray-900 border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
              <div>
                <span className="text-gray-400">Petugas Penanggung Jawab: </span>
                <span className="font-bold text-amber-300">{detailSession.petugasLapangan || 'Kelompok SATU'}</span>
              </div>
              <div>
                <span className="text-gray-400">Total Setoran Fisik Sesi: </span>
                <span className="font-black text-emerald-400 text-sm">Rp {detailSession.totalSetoran.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Breakdown Table of 40 Residents */}
            <div className="glass-card rounded-2xl border border-gray-800 overflow-hidden">
              <div className="max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-900 text-gray-400 uppercase font-bold sticky top-0 border-b border-gray-800">
                    <tr>
                      <th className="p-3">Kode</th>
                      <th className="p-3">Nama Warga</th>
                      <th className="p-3">No. Rumah</th>
                      <th className="p-3 text-right">Jimpitan</th>
                      <th className="p-3 text-right">Tabungan</th>
                      <th className="p-3 text-right">Total Setor</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 text-gray-300">
                    {wargaList.map((w) => {
                      const tx = (transaksiPengambilanList || []).find(
                        t => t.pengambilanId === detailSession.id && t.wargaId === w.id
                      );

                      const isTaken = tx?.status === 'sudah_diambil';
                      const jimpitanVal = isTaken ? (tx?.jimpitan || 3000) : 0;
                      const tabunganVal = isTaken ? (tx?.tabungan || 0) : 0;
                      const totalVal = jimpitanVal + tabunganVal;

                      return (
                        <tr key={w.id} className="hover:bg-gray-800/40">
                          <td className="p-3 font-bold text-amber-300">{w.kodeWarga}</td>
                          <td className="p-3 font-bold text-white">{w.nama}</td>
                          <td className="p-3 text-gray-400">{w.noRumah}</td>
                          <td className="p-3 text-right font-semibold text-emerald-400">
                            Rp {jimpitanVal.toLocaleString('id-ID')}
                          </td>
                          <td className="p-3 text-right font-semibold text-blue-400">
                            Rp {tabunganVal.toLocaleString('id-ID')}
                          </td>
                          <td className="p-3 text-right font-black text-emerald-400">
                            Rp {totalVal.toLocaleString('id-ID')}
                          </td>
                          <td className="p-3 text-center">
                            {isTaken ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                🟢 Sudah
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                🟡 Belum
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setDetailSession(null)}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gray-800 text-gray-200 hover:bg-gray-700"
              >
                Tutup Rincian
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
