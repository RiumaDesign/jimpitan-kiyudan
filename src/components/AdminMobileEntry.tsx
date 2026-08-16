import React, { useState, useEffect } from 'react';
import { 
  UserCheck, Search, Check, Clock, ArrowLeft, 
  Save, AlertTriangle, X, ChevronDown, ChevronUp, Zap, Coins 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AdminMobileEntryProps {
  onGoToReconcile?: () => void;
  onBack?: () => void;
}

export const AdminMobileEntry: React.FC<AdminMobileEntryProps> = ({ onGoToReconcile, onBack }) => {
  const { 
    wargaList, pesertaList, currentPeriode, pengambilanList, 
    transaksiPengambilanList, savePengambilanWargaItem, updatePengambilanSessionMetadata, currentUser 
  } = useApp();

  const activeSession = pengambilanList.find(p => p.status === 'berjalan') || pengambilanList[pengambilanList.length - 1];
  const activeParticipants = pesertaList.filter(p => p.periodeId === currentPeriode.id && p.status === 'aktif');

  const defaultOfficer = currentUser ? `${currentUser.name}` : 'Kelompok SATU';

  // Metadata session states
  const [tanggalSesi, setTanggalSesi] = useState<string>(activeSession.tanggalPengambilan || new Date().toISOString().split('T')[0]);
  const [petugasSesi, setPetugasSesi] = useState<string>(activeSession.petugasLapangan || defaultOfficer);
  const [showMetadataPanel, setShowMetadataPanel] = useState<boolean>(false);
  const [isSavedMetadata, setIsSavedMetadata] = useState<boolean>(false);

  useEffect(() => {
    setTanggalSesi(activeSession.tanggalPengambilan || new Date().toISOString().split('T')[0]);
    setPetugasSesi(activeSession.petugasLapangan || defaultOfficer);
  }, [activeSession, currentUser]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'semua' | 'sudah' | 'belum'>('semua');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Selected Warga for editing
  const [selectedWargaId, setSelectedWargaId] = useState<number | null>(null);
  const [jimpitanInputStr, setJimpitanInputStr] = useState<string>('3000');
  const [tabunganInputStr, setTabunganInputStr] = useState<string>('10000');
  const [statusInput, setStatusInput] = useState<'sudah_diambil' | 'tidak_ada' | 'ditunda' | 'tidak_ikut'>('sudah_diambil');
  const [keteranganInput, setKeteranganInput] = useState<string>('');

  // Confirmation Popup Modal State
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const activeWargaItems = activeParticipants.map(p => {
    const w = wargaList.find(item => item.id === p.wargaId);
    const tx = transaksiPengambilanList.find(t => t.pengambilanId === activeSession.id && t.wargaId === p.wargaId);
    return {
      warga: w!,
      tx,
    };
  }).filter(item => item.warga !== undefined);

  // Suggestions for autocomplete matching
  const suggestedWarga = activeWargaItems.filter(item => {
    if (!searchTerm.trim()) return false;
    const term = searchTerm.toLowerCase();
    return item.warga.nama.toLowerCase().includes(term) ||
           item.warga.kodeWarga.toLowerCase().includes(term) ||
           item.warga.noRumah.toLowerCase().includes(term);
  });

  const filteredItems = activeWargaItems.filter(item => {
    const matchSearch = item.warga.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.warga.kodeWarga.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.warga.noRumah.toLowerCase().includes(searchTerm.toLowerCase());

    const isTaken = item.tx?.status === 'sudah_diambil';
    if (filterStatus === 'sudah') return matchSearch && isTaken;
    if (filterStatus === 'belum') return matchSearch && !isTaken;
    return matchSearch;
  });

  const countSudah = activeWargaItems.filter(item => item.tx?.status === 'sudah_diambil').length;
  const totalWargaCount = activeWargaItems.length;
  const progressPercent = Math.round((countSudah / (totalWargaCount || 1)) * 100);

  const handleSaveMetadata = () => {
    updatePengambilanSessionMetadata(activeSession.id, tanggalSesi, petugasSesi);
    setIsSavedMetadata(true);
    setTimeout(() => setIsSavedMetadata(false), 2000);
  };

  const handleSelectWarga = (wargaId: number) => {
    setSelectedWargaId(wargaId);
    setShowSuggestions(false);
    const existingTx = transaksiPengambilanList.find(t => t.pengambilanId === activeSession.id && t.wargaId === wargaId);
    if (existingTx && existingTx.status === 'sudah_diambil') {
      setJimpitanInputStr(String(existingTx.jimpitan || 3000));
      setTabunganInputStr(String(existingTx.tabungan));
      setStatusInput('sudah_diambil');
      setKeteranganInput(existingTx.keterangan || '');
    } else {
      setJimpitanInputStr('3000');
      setTabunganInputStr('10000');
      setStatusInput('sudah_diambil');
      setKeteranganInput('');
    }
  };

  // 1-Tap Quick Action Presets
  const applyQuickPreset = (preset: 'standar_13k' | 'jimpitan_3k' | 'tidak_ada') => {
    if (preset === 'standar_13k') {
      setJimpitanInputStr('3000');
      setTabunganInputStr('10000');
      setStatusInput('sudah_diambil');
    } else if (preset === 'jimpitan_3k') {
      setJimpitanInputStr('3000');
      setTabunganInputStr('0');
      setStatusInput('sudah_diambil');
    } else if (preset === 'tidak_ada') {
      setJimpitanInputStr('0');
      setTabunganInputStr('0');
      setStatusInput('tidak_ada');
    }
    setShowConfirmModal(true);
  };

  const handleOpenConfirmPopup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWargaId) return;
    setShowConfirmModal(true);
  };

  const handleExecuteSave = () => {
    if (!selectedWargaId) return;

    const numericJimpitan = Number(jimpitanInputStr) || (statusInput === 'sudah_diambil' ? 3000 : 0);
    const numericTabungan = Number(tabunganInputStr) || 0;

    // Ensure session date & officer are updated
    updatePengambilanSessionMetadata(activeSession.id, tanggalSesi, petugasSesi);

    savePengambilanWargaItem(
      activeSession.id,
      selectedWargaId,
      numericJimpitan,
      numericTabungan,
      statusInput,
      keteranganInput
    );

    setShowConfirmModal(false);

    // Auto move to next unvisited warga
    const nextItem = activeWargaItems.find(item => item.warga.id > selectedWargaId && item.tx?.status !== 'sudah_diambil');
    if (nextItem) {
      handleSelectWarga(nextItem.warga.id);
    } else {
      setSelectedWargaId(null);
    }
  };

  const selectedWargaObj = wargaList.find(w => w.id === selectedWargaId);
  const currentNumericJimpitan = Number(jimpitanInputStr) || (statusInput === 'sudah_diambil' ? 3000 : 0);
  const currentNumericTabungan = Number(tabunganInputStr) || 0;
  const currentTotalSetoran = (statusInput === 'sudah_diambil' ? currentNumericJimpitan : 0) + (statusInput === 'sudah_diambil' ? currentNumericTabungan : 0);

  return (
    <div className="space-y-5 animate-fadeIn pb-24 max-w-4xl mx-auto">
      
      {/* COMPACT TOP HEADER & METADATA BAR */}
      <div className="glass-panel p-4 rounded-3xl border border-gray-800 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            {onBack && (
              <button onClick={onBack} className="p-2 rounded-xl text-gray-400 hover:text-white bg-gray-900">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase">
                SESI #{activeSession.nomorPengambilan} • {tanggalSesi}
              </span>
              <h2 className="text-base font-bold text-white font-heading mt-0.5">
                Petugas: <span className="text-amber-300">{petugasSesi}</span>
              </h2>
            </div>
          </div>

          <button
            onClick={() => setShowMetadataPanel(!showMetadataPanel)}
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-gray-900 text-gray-300 hover:text-white border border-gray-800 flex items-center space-x-1"
          >
            <span>{showMetadataPanel ? 'Tutup Ubah' : '⚙️ Ubah Petugas'}</span>
            {showMetadataPanel ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Collapsible Metadata Form (Hidden by default to avoid clutter!) */}
        {showMetadataPanel && (
          <div className="p-4 rounded-2xl bg-gray-900/90 border border-emerald-500/30 space-y-3 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">Tanggal Pengambilan</label>
                <input
                  type="date"
                  value={tanggalSesi}
                  onChange={(e) => setTanggalSesi(e.target.value)}
                  className="w-full glass-input px-3 py-1.5 rounded-xl text-xs font-bold text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">Nama Petugas Lapangan</label>
                <input
                  type="text"
                  value={petugasSesi}
                  onChange={(e) => setPetugasSesi(e.target.value)}
                  placeholder="Nama petugas..."
                  className="w-full glass-input px-3 py-1.5 rounded-xl text-xs font-bold text-amber-300"
                />
              </div>
            </div>

            {/* Quick Group Chips */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-[10px]">
              <span className="text-gray-400 shrink-0 font-semibold">Pilih Regu:</span>
              <button
                type="button"
                onClick={() => setPetugasSesi('Kelompok SATU (Armi, Apep, Fadel, Khabib, Uzik, Ihsan)')}
                className="px-2 py-0.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/30 shrink-0"
              >
                Kelompok SATU
              </button>
              <button
                type="button"
                onClick={() => setPetugasSesi('Kelompok DUA (Iwan, Humam, Kusnadi, Feri, Pi\'i, Harno)')}
                className="px-2 py-0.5 rounded-lg bg-blue-950 text-blue-300 border border-blue-500/30 shrink-0"
              >
                Kelompok DUA
              </button>
              <button
                type="button"
                onClick={() => setPetugasSesi('Kelompok TIGA (Zazed, Alfin, Udin, Syahrul, Syarif)')}
                className="px-2 py-0.5 rounded-lg bg-amber-950 text-amber-300 border border-amber-500/30 shrink-0"
              >
                Kelompok TIGA
              </button>
              <button
                type="button"
                onClick={() => setPetugasSesi('Kelompok EMPAT (Dwik, Khoir, Doko, Riski, Rudi, Andri)')}
                className="px-2 py-0.5 rounded-lg bg-purple-950 text-purple-300 border border-purple-500/30 shrink-0"
              >
                Kelompok EMPAT
              </button>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleSaveMetadata}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
                  isSavedMetadata ? 'bg-emerald-500 text-gray-950' : 'bg-emerald-600 text-white'
                }`}
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavedMetadata ? 'Tersimpan!' : 'Simpan Pengaturan'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Progress Bar & Real-time Total Header */}
        <div className="flex items-center justify-between bg-gray-900/80 p-3 rounded-2xl border border-gray-800 text-xs">
          <div>
            <span className="text-gray-400 font-medium">Progress Sesi: </span>
            <b className="text-emerald-400 font-bold">{countSudah} / {totalWargaCount} KK ({progressPercent}%)</b>
          </div>
          <div>
            <span className="text-gray-400 font-medium">Total Fisik: </span>
            <b className="text-amber-400 font-bold text-sm">Rp {activeSession.totalSetoran.toLocaleString('id-ID')}</b>
          </div>
        </div>
      </div>

      {/* SEARCH BAR & AUTOCOMPLETE */}
      <div className="glass-panel p-4 rounded-3xl border border-gray-800 space-y-3 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 relative">
          
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-emerald-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              placeholder="🔍 Ketik nama warga (misal: Slamet / KDY-001)..."
              className="w-full glass-input pl-9 pr-3 py-2 rounded-xl text-xs font-medium text-white focus:ring-2 focus:ring-emerald-500"
            />

            {/* Floating Suggestions Dropdown */}
            {showSuggestions && suggestedWarga.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 z-40 bg-gray-900 border border-emerald-500/40 rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto animate-fadeIn">
                <div className="px-3 py-1.5 bg-gray-950 border-b border-gray-800 text-[10px] font-bold text-emerald-400 uppercase flex items-center justify-between">
                  <span>Saran Warga Terdaftar</span>
                  <span>{suggestedWarga.length} Hasil</span>
                </div>

                {suggestedWarga.map(item => (
                  <div
                    key={item.warga.id}
                    onClick={() => {
                      handleSelectWarga(item.warga.id);
                      setSearchTerm('');
                    }}
                    className="p-3 border-b border-gray-800/60 hover:bg-emerald-500/20 cursor-pointer flex items-center justify-between transition-colors text-xs"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">
                          {item.warga.kodeWarga}
                        </span>
                        <span className="font-bold text-white">{item.warga.nama}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">{item.warga.alamat} • {item.warga.noRumah}</p>
                    </div>

                    <div>
                      {item.tx?.status === 'sudah_diambil' ? (
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          🟢 Sudah (Rp {item.tx.total.toLocaleString('id-ID')})
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                          🟡 Pilih
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilterStatus('semua')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterStatus === 'semua' ? 'bg-emerald-600 text-white' : 'bg-gray-900 text-gray-400'
              }`}
            >
              Semua ({totalWargaCount})
            </button>
            <button
              onClick={() => setFilterStatus('sudah')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterStatus === 'sudah' ? 'bg-emerald-600 text-white' : 'bg-gray-900 text-gray-400'
              }`}
            >
              🟢 Sudah ({countSudah})
            </button>
            <button
              onClick={() => setFilterStatus('belum')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterStatus === 'belum' ? 'bg-amber-600 text-white' : 'bg-gray-900 text-gray-400'
              }`}
            >
              🟡 Belum ({totalWargaCount - countSudah})
            </button>
          </div>

        </div>
      </div>

      {/* SELECTED WARGA EXPANDED ENTRY FORM */}
      {selectedWargaId && (
        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 via-gray-900 to-gray-950 shadow-2xl space-y-4 animate-fadeIn">
          {(() => {
            const currentWarga = wargaList.find(w => w.id === selectedWargaId);
            if (!currentWarga) return null;

            return (
              <form onSubmit={handleOpenConfirmPopup} className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {currentWarga.kodeWarga}
                    </span>
                    <h3 className="text-xl font-bold text-white font-heading mt-1">{currentWarga.nama}</h3>
                    <p className="text-xs text-gray-400">{currentWarga.alamat} • {currentWarga.noRumah}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedWargaId(null)}
                    className="text-xs text-gray-400 hover:text-white underline p-1"
                  >
                    Tutup
                  </button>
                </div>

                {/* 1-TAP QUICK ACTION PRESETS (SANGAT MEMBANTU ORANG AWAM & PETUGAS) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    ⚡ TOMBOL CEPAT 1-KLIK (SETOR INSTAN):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => applyQuickPreset('standar_13k')}
                      className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 text-left transition-all space-y-0.5 border border-emerald-400"
                    >
                      <div className="flex items-center space-x-1">
                        <Zap className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                        <span className="font-extrabold text-sm">Rp 13.000</span>
                      </div>
                      <p className="text-[10px] text-emerald-100 opacity-90">3k Jimpitan + 10k Tabungan</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => applyQuickPreset('jimpitan_3k')}
                      className="p-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 text-left transition-all space-y-0.5 border border-amber-400"
                    >
                      <div className="flex items-center space-x-1">
                        <Coins className="w-3.5 h-3.5 text-amber-200 shrink-0" />
                        <span className="font-extrabold text-sm">Rp 3.000</span>
                      </div>
                      <p className="text-[10px] text-amber-100 opacity-90">Jimpitan Saja (Tanpa Tabungan)</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => applyQuickPreset('tidak_ada')}
                      className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs text-left transition-all space-y-0.5 border border-gray-700"
                    >
                      <span className="font-extrabold text-sm text-gray-200">🟡 Tidak Ada / Ditunda</span>
                      <p className="text-[10px] text-gray-400">Rumah Kosong / Ditunda</p>
                    </button>
                  </div>
                </div>

                {/* ADVANCED CUSTOM INPUT FIELDS */}
                <div className="pt-2 border-t border-gray-800/80 space-y-3">
                  <span className="text-[11px] font-bold text-gray-400 block uppercase">
                    ATAU ISI INPUT NOMINAL CUSTOM (Ketik Manual / Tombol Chip):
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Jimpitan Field */}
                    <div className="glass-card p-3 rounded-2xl border border-emerald-500/30 space-y-1.5">
                      <label className="text-[11px] font-bold text-emerald-400 uppercase block">
                        Nominal Jimpitan (Rp):
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={jimpitanInputStr}
                        onChange={(e) => setJimpitanInputStr(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="Min 3000..."
                        className="w-full glass-input px-3 py-1.5 rounded-xl text-sm font-bold text-emerald-300"
                      />
                      <div className="flex items-center space-x-1 text-[10px]">
                        <button type="button" onClick={() => setJimpitanInputStr('3000')} className="px-2 py-0.5 bg-emerald-950 text-emerald-300 rounded font-semibold border border-emerald-500/30">3rb (Default)</button>
                        <button type="button" onClick={() => setJimpitanInputStr('5000')} className="px-2 py-0.5 bg-gray-800 text-gray-200 rounded font-semibold">5rb</button>
                        <button type="button" onClick={() => setJimpitanInputStr('10000')} className="px-2 py-0.5 bg-gray-800 text-gray-200 rounded font-semibold">10rb</button>
                      </div>
                    </div>

                    {/* Tabungan Field */}
                    <div className="glass-card p-3 rounded-2xl border border-blue-500/30 space-y-1.5">
                      <label className="text-[11px] font-bold text-blue-400 uppercase block">
                        Nominal Tabungan (Rp):
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={tabunganInputStr}
                        onChange={(e) => setTabunganInputStr(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="Tabungan (10000)..."
                        className="w-full glass-input px-3 py-1.5 rounded-xl text-sm font-bold text-amber-400"
                      />
                      <div className="flex items-center space-x-1 text-[10px]">
                        <button type="button" onClick={() => setTabunganInputStr('5000')} className="px-2 py-0.5 bg-gray-800 text-gray-200 rounded font-semibold">5rb</button>
                        <button type="button" onClick={() => setTabunganInputStr('10000')} className="px-2 py-0.5 bg-gray-800 text-gray-200 rounded font-semibold">10rb</button>
                        <button type="button" onClick={() => setTabunganInputStr('20000')} className="px-2 py-0.5 bg-gray-800 text-gray-200 rounded font-semibold">20rb</button>
                        <button type="button" onClick={() => setTabunganInputStr('0')} className="px-2 py-0.5 bg-gray-800 text-rose-300 rounded font-semibold">0</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Big Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-r from-emerald-500 to-teal-400 text-gray-950 hover:from-emerald-400 hover:to-teal-300 shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center space-x-2"
                >
                  <Check className="w-5 h-5" />
                  <span>SIMPAN & LANJUT WARGA BERIKUTNYA ➔</span>
                </button>
              </form>
            );
          })()}
        </div>
      )}

      {/* CONFIRMATION REVIEW POPUP MODAL */}
      {showConfirmModal && selectedWargaObj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md glass-panel p-6 rounded-3xl border border-amber-500/40 shadow-2xl relative space-y-4">
            
            <button
              onClick={() => setShowConfirmModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-heading">
                  Cek Ulang Jumlah Uang Fisik
                </h3>
                <p className="text-xs text-gray-400">Pastikan uang tunai yang diterima cocok</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800 space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                <span className="text-gray-400">Nama Warga:</span>
                <span className="font-bold text-white text-sm">{selectedWargaObj.nama} ({selectedWargaObj.kodeWarga})</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400">Jimpitan (Minimal 3k):</span>
                <span className="font-bold text-emerald-400">Rp {statusInput === 'sudah_diambil' ? currentNumericJimpitan.toLocaleString('id-ID') : '0'}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400">Setoran Tabungan:</span>
                <span className="font-bold text-amber-400">Rp {statusInput === 'sudah_diambil' ? currentNumericTabungan.toLocaleString('id-ID') : '0'}</span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-800">
                <span className="font-bold text-gray-300">TOTAL FISIK DITERIMA:</span>
                <span className="font-black text-emerald-400 text-base font-heading">
                  Rp {currentTotalSetoran.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="py-2.5 rounded-xl font-bold text-xs bg-gray-800 text-gray-200 hover:bg-gray-700"
              >
                ✏️ Edit Lagi
              </button>

              <button
                type="button"
                onClick={handleExecuteSave}
                className="py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-1"
              >
                <Check className="w-4 h-4" />
                <span>✅ Ya, Simpan Data</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 40 WARGA CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredItems.map(item => {
          const isTaken = item.tx?.status === 'sudah_diambil';
          const isSelected = selectedWargaId === item.warga.id;

          return (
            <div
              key={item.warga.id}
              onClick={() => handleSelectWarga(item.warga.id)}
              className={`glass-card p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'border-emerald-400 bg-emerald-500/10 ring-2 ring-emerald-500/30'
                  : isTaken
                  ? 'border-gray-800 hover:border-gray-700 bg-gray-900/40'
                  : 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      {item.warga.kodeWarga}
                    </span>
                    <span className="text-[11px] text-gray-400">{item.warga.noRumah}</span>
                  </div>
                  <h4 className="text-base font-bold text-white mt-1">{item.warga.nama}</h4>
                  <p className="text-[11px] text-gray-400">{item.warga.alamat}</p>
                </div>

                <div>
                  {isTaken ? (
                    <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 inline-block">
                      <Check className="w-4 h-4" />
                    </span>
                  ) : (
                    <span className="p-1 rounded-full bg-amber-500/20 text-amber-400 inline-block">
                      <Clock className="w-4 h-4" />
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-gray-800/80 flex items-center justify-between text-xs">
                {isTaken ? (
                  <>
                    <span className="text-gray-400">Total: <b className="text-white">Rp {item.tx?.total.toLocaleString('id-ID')}</b></span>
                    <span className="text-[10px] text-emerald-400 font-semibold">({item.tx?.jimpitan.toLocaleString('id-ID')} Jimpitan + {item.tx?.tabungan.toLocaleString('id-ID')} Tab)</span>
                  </>
                ) : (
                  <>
                    <span className="text-amber-400 font-semibold text-[11px]">Belum Diambil</span>
                    <span className="text-[10px] text-gray-500">Tap untuk input ➔</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* FLOATING ACTION BOTTOM BAR */}
      <div className="fixed bottom-4 left-4 right-4 max-w-2xl mx-auto z-30">
        <div className="glass-panel p-3.5 rounded-2xl border border-emerald-500/40 shadow-2xl flex items-center justify-between bg-gray-950/90 backdrop-blur-xl">
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-400">Total Sesi Fisik ({tanggalSesi})</p>
            <p className="text-lg font-black text-amber-400 font-heading">
              Rp {activeSession.totalSetoran.toLocaleString('id-ID')}
            </p>
          </div>

          <button
            onClick={() => {
              updatePengambilanSessionMetadata(activeSession.id, tanggalSesi, petugasSesi);
              if (onGoToReconcile) onGoToReconcile();
            }}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center space-x-1.5"
          >
            <UserCheck className="w-4 h-4" />
            <span>Selesai & Rekonsiliasi &rarr;</span>
          </button>
        </div>
      </div>

    </div>
  );
};
