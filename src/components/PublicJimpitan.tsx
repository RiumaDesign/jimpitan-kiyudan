import React, { useState } from 'react';
import { 
  Coins, CheckCircle, Search, Filter, 
  CheckCircle2, ShieldCheck, Sparkles 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PublicJimpitan: React.FC = () => {
  const { 
    pengambilanList, currentPeriode, periodeList, wargaList, transaksiPengambilanList 
  } = useApp();

  // Selected session ID (defaults to the latest session)
  const sortedSessions = [...pengambilanList].sort((a, b) => b.nomorPengambilan - a.nomorPengambilan);
  const [selectedSessionId, setSelectedSessionId] = useState<number>(
    sortedSessions.length > 0 ? sortedSessions[0].id : 1
  );

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBulan, setSelectedBulan] = useState<number | 'semua'>('semua');
  const [selectedTahun, setSelectedTahun] = useState<number | 'semua'>(currentPeriode.tahun);
  const [filterStatusSetor, setFilterStatusSetor] = useState<'semua' | 'sudah' | 'belum'>('semua');

  // Currently selected session object
  const activeSession = sortedSessions.find(s => s.id === selectedSessionId) || sortedSessions[0];

  // Filtered session list for session dropdown based on Year & Month filters
  const availableSessionsForDropdown = sortedSessions.filter(s => {
    const d = new Date(s.tanggalPengambilan);
    if (selectedTahun !== 'semua' && d.getFullYear() !== Number(selectedTahun)) return false;
    if (selectedBulan !== 'semua' && (d.getMonth() + 1) !== Number(selectedBulan)) return false;
    return true;
  });

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

  // Filter 40 KK Warga rows for the active session
  const filteredWarga = wargaList.filter(w => {
    // Filter Search (Nama / Kode Warga / No Rumah)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = w.nama.toLowerCase().includes(term);
      const matchCode = w.kodeWarga.toLowerCase().includes(term);
      const matchHouse = w.noRumah.toLowerCase().includes(term);
      if (!matchName && !matchCode && !matchHouse) return false;
    }

    // Filter Status Setor
    if (activeSession) {
      const tx = (transaksiPengambilanList || []).find(
        t => t.pengambilanId === activeSession.id && t.wargaId === w.id
      );
      const isTaken = tx?.status === 'sudah_diambil';
      if (filterStatusSetor === 'sudah' && !isTaken) return false;
      if (filterStatusSetor === 'belum' && isTaken) return false;
    }

    return true;
  });

  // Calculate totals for active session & filtered warga
  const sessionSplitPemuda = activeSession ? Math.floor(activeSession.totalJimpitan / 2) : 0;
  const sessionSplitDusun = activeSession ? Math.floor(activeSession.totalJimpitan / 2) : 0;

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
            <Coins className="w-3.5 h-3.5" />
            <span>Tabel Transparansi Rincian 40 KK Warga Dusun Kiyudan</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white font-heading">
            Tabel Rincian Setoran Jimpitan & Tabungan 40 KK
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Data langsung menampilkan rincian 40 KK per sesi pengambilan. Jimpitan default Rp3.000 (minimal Rp3.000, boleh lebih).
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium space-y-1 shrink-0 max-w-xs">
          <div className="flex items-center space-x-1.5 font-bold text-amber-400">
            <Sparkles className="w-4 h-4" />
            <span>ATURAN SETORAN JIMPITAN:</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Standard jimpitan per malam Minggu adalah <b>Rp3.000</b> (minimal), namun warga diperbolehkan menyetor lebih sesuai kemauan pribadi.
          </p>
        </div>
      </div>

      {/* SESSION SELECTOR & FILTER CONTROL BAR */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-emerald-500/30 space-y-4 shadow-xl bg-gradient-to-br from-emerald-950/20 via-gray-900 to-gray-950">
        
        <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-emerald-400" />
          <span>PILIH SESI PENGAMBILAN (SESI 1, 2, 3, 4 ... & FILTER TANGGAL/BULAN/TAHUN)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Main Session Selector Dropdown */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-amber-300 mb-1">
              Pilih Sesi Mingguan (Klik Untuk Ganti Sesi):
            </label>
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(Number(e.target.value))}
              className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs font-black text-amber-300 bg-gray-900 border border-amber-500/40 focus:ring-2 focus:ring-amber-500"
            >
              {availableSessionsForDropdown.map(s => (
                <option key={s.id} value={s.id}>
                  Sesi #{s.nomorPengambilan} — {s.tanggalPengambilan} ({s.status === 'disahkan' ? '🟢 DISAHKAN' : '🟡 BERJALAN'}) — PJ: {s.petugasLapangan || 'Kelompok SATU'}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Bulan */}
          <div>
            <label className="block text-[11px] font-bold text-gray-300 mb-1">
              Filter Bulan:
            </label>
            <select
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(e.target.value === 'semua' ? 'semua' : Number(e.target.value))}
              className="w-full glass-input px-3 py-2.5 rounded-xl text-xs font-semibold text-white bg-gray-900 border border-gray-800"
            >
              <option value="semua">Semua Bulan (Jan - Des)</option>
              {bulans.map(b => (
                <option key={b.value} value={b.value}>Bulan {b.label}</option>
              ))}
            </select>
          </div>

          {/* Filter Tahun */}
          <div>
            <label className="block text-[11px] font-bold text-gray-300 mb-1">
              Filter Tahun Pembukuan:
            </label>
            <select
              value={selectedTahun}
              onChange={(e) => setSelectedTahun(e.target.value === 'semua' ? 'semua' : Number(e.target.value))}
              className="w-full glass-input px-3 py-2.5 rounded-xl text-xs font-semibold text-white bg-gray-900 border border-gray-800"
            >
              <option value="semua">Semua Tahun</option>
              {periodeList.map(p => (
                <option key={p.id} value={p.tahun}>Tahun Pembukuan {p.tahun}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Second Row: Instant Warga Search & Status Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-gray-800/80">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-emerald-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 Cari nama warga / kode (KDY-001)..."
              className="w-full glass-input pl-9 pr-3 py-2 rounded-xl text-xs font-medium text-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center space-x-1.5 w-full sm:w-auto">
            <button
              onClick={() => setFilterStatusSetor('semua')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterStatusSetor === 'semua' ? 'bg-emerald-600 text-white' : 'bg-gray-900 text-gray-400'
              }`}
            >
              Semua (40 KK)
            </button>
            <button
              onClick={() => setFilterStatusSetor('sudah')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterStatusSetor === 'sudah' ? 'bg-emerald-600 text-white' : 'bg-gray-900 text-gray-400'
              }`}
            >
              🟢 Sudah Setor
            </button>
            <button
              onClick={() => setFilterStatusSetor('belum')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterStatusSetor === 'belum' ? 'bg-amber-600 text-white' : 'bg-gray-900 text-gray-400'
              }`}
            >
              🟡 Belum Setor
            </button>
          </div>
        </div>

      </div>

      {/* ACTIVE SESSION METADATA CARD */}
      {activeSession && (
        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-gray-800 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  INFORMASI SESI TERPILIH
                </span>
                <span className="text-xs text-gray-400">Pengambilan #{activeSession.nomorPengambilan}</span>
              </div>
              <h3 className="text-xl font-bold text-white font-heading mt-1">
                Sabtu Malam ({activeSession.tanggalPengambilan})
              </h3>
              <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                Petugas Lapangan: {activeSession.petugasLapangan || 'Kelompok SATU'}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {activeSession.status === 'disahkan' ? (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-lg">
                  <CheckCircle className="w-4 h-4" />
                  <span>SESI TELAH DISAHKAN RESMI</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-lg">
                  <span>SESI BERJALAN</span>
                </span>
              )}
            </div>
          </div>

          {/* Quick Session Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
            <div className="bg-gray-900/90 p-3 rounded-2xl border border-gray-800">
              <p className="text-[10px] text-gray-400 uppercase font-semibold">Prosentase Diambil</p>
              <p className="font-bold text-white text-sm mt-0.5">{activeSession.totalSudahDiambil} / {activeSession.totalWarga} KK</p>
            </div>
            <div className="bg-gray-900/90 p-3 rounded-2xl border border-gray-800">
              <p className="text-[10px] text-gray-400 uppercase font-semibold">Total Jimpitan Sesi</p>
              <p className="font-bold text-amber-400 text-sm mt-0.5">Rp {activeSession.totalJimpitan.toLocaleString('id-ID')}</p>
            </div>
            <div className="bg-gray-900/90 p-3 rounded-2xl border border-gray-800">
              <p className="text-[10px] text-gray-400 uppercase font-semibold">Total Tabungan Sesi</p>
              <p className="font-bold text-blue-400 text-sm mt-0.5">Rp {activeSession.totalTabungan.toLocaleString('id-ID')}</p>
            </div>
            <div className="bg-gray-900/90 p-3 rounded-2xl border border-emerald-500/30">
              <p className="text-[10px] text-emerald-400 uppercase font-semibold">Total Setoran Fisik</p>
              <p className="font-black text-emerald-400 text-base mt-0.5 font-heading">Rp {activeSession.totalSetoran.toLocaleString('id-ID')}</p>
            </div>
          </div>

          {/* 50:50 Split Info Box */}
          <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-bold text-emerald-400">Pembagian 50:50 Kas Jimpitan:</span>
            </div>
            <div className="flex items-center space-x-4 text-gray-300">
              <span>Kas Pemuda: <b className="text-white">Rp {sessionSplitPemuda.toLocaleString('id-ID')}</b></span>
              <span>Kas Dusun: <b className="text-white">Rp {sessionSplitDusun.toLocaleString('id-ID')}</b></span>
            </div>
          </div>
        </div>
      )}

      {/* MAIN 40 KK RESIDENTS TABLE VIEW */}
      <div className="glass-panel rounded-3xl border border-gray-800 overflow-hidden shadow-2xl space-y-0">
        <div className="p-4 bg-gray-950 border-b border-gray-800 flex items-center justify-between text-xs">
          <span className="font-bold text-white uppercase tracking-wider">
            📋 TABEL SETORAN 40 KK (SESI #{activeSession?.nomorPengambilan || 1})
          </span>
          <span className="text-gray-400">
            Menampilkan <b className="text-emerald-400 font-bold">{filteredWarga.length} Warga</b>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-900/90 text-gray-400 uppercase font-bold border-b border-gray-800 tracking-wider">
              <tr>
                <th className="p-3.5 text-center">Kode Warga</th>
                <th className="p-3.5">Nama Warga</th>
                <th className="p-3.5">Alamat / No. Rumah</th>
                <th className="p-3.5 text-right">Nominal Jimpitan (Rp)</th>
                <th className="p-3.5 text-right">Tabungan Warga (Rp)</th>
                <th className="p-3.5 text-right">Total Setor Sesi (Rp)</th>
                <th className="p-3.5 text-center">Status Setor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-gray-300">
              {filteredWarga.map((w) => {
                const tx = (transaksiPengambilanList || []).find(
                  t => t.pengambilanId === activeSession?.id && t.wargaId === w.id
                );

                const isTaken = tx?.status === 'sudah_diambil';
                const jimpitanVal = isTaken ? (tx?.jimpitan || 3000) : 0;
                const tabunganVal = isTaken ? (tx?.tabungan || 0) : 0;
                const totalVal = jimpitanVal + tabunganVal;

                return (
                  <tr key={w.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="p-3.5 text-center font-bold text-amber-300 font-heading">
                      {w.kodeWarga}
                    </td>

                    <td className="p-3.5 font-bold text-white whitespace-nowrap">
                      {w.nama}
                    </td>

                    <td className="p-3.5 text-gray-400 whitespace-nowrap">
                      {w.alamat} • <b className="text-gray-300">{w.noRumah}</b>
                    </td>

                    <td className="p-3.5 text-right font-bold text-amber-400 whitespace-nowrap">
                      {isTaken ? (
                        <span>Rp {jimpitanVal.toLocaleString('id-ID')}</span>
                      ) : (
                        <span className="text-gray-600 font-normal">Rp 0</span>
                      )}
                    </td>

                    <td className="p-3.5 text-right font-bold text-blue-400 whitespace-nowrap">
                      {isTaken ? (
                        <span>Rp {tabunganVal.toLocaleString('id-ID')}</span>
                      ) : (
                        <span className="text-gray-600 font-normal">Rp 0</span>
                      )}
                    </td>

                    <td className="p-3.5 text-right font-black text-emerald-400 text-sm font-heading whitespace-nowrap">
                      {isTaken ? (
                        <span>Rp {totalVal.toLocaleString('id-ID')}</span>
                      ) : (
                        <span className="text-gray-600 font-normal">Rp 0</span>
                      )}
                    </td>

                    <td className="p-3.5 text-center whitespace-nowrap">
                      {isTaken ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>SUDAH SETOR</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          <span>BELUM SETOR</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Table Footer Summary for Active Session */}
            {activeSession && (
              <tfoot className="bg-gray-950 font-bold border-t-2 border-gray-800 text-white">
                <tr>
                  <td colSpan={3} className="p-4 uppercase text-emerald-400 text-xs">
                    TOTAL SETORAN SESI #{activeSession.nomorPengambilan}:
                  </td>
                  <td className="p-4 text-right text-amber-400 font-bold">
                    Rp {activeSession.totalJimpitan.toLocaleString('id-ID')}
                  </td>
                  <td className="p-4 text-right text-blue-400 font-bold">
                    Rp {activeSession.totalTabungan.toLocaleString('id-ID')}
                  </td>
                  <td className="p-4 text-right text-emerald-400 font-black text-sm font-heading">
                    Rp {activeSession.totalSetoran.toLocaleString('id-ID')}
                  </td>
                  <td className="p-4 text-center text-xs text-gray-400">
                    {activeSession.totalSudahDiambil} / {activeSession.totalWarga} KK
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

    </div>
  );
};
