import React, { useState, useEffect } from 'react';
import { UserCheck, Search, Check, Clock, ArrowLeft, Calendar, Save, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AdminMobileEntryProps {
  onGoToReconcile?: () => void;
  onBack?: () => void;
}

export const AdminMobileEntry: React.FC<AdminMobileEntryProps> = ({ onGoToReconcile, onBack }) => {
  const { 
    wargaList, pesertaList, currentPeriode, pengambilanList, 
    transaksiPengambilanList, savePengambilanWargaItem, updatePengambilanSessionMetadata 
  } = useApp();

  const activeSession = pengambilanList.find(p => p.status === 'berjalan') || pengambilanList[pengambilanList.length - 1];
  const activeParticipants = pesertaList.filter(p => p.periodeId === currentPeriode.id && p.status === 'aktif');

  // Metadata session states (Tanggal & Petugas Lapangan - Free Input supported!)
  const [tanggalSesi, setTanggalSesi] = useState<string>(activeSession.tanggalPengambilan || new Date().toISOString().split('T')[0]);
  const [petugasSesi, setPetugasSesi] = useState<string>(activeSession.petugasLapangan || 'Danang Prasetyo (Petugas Lapangan)');
  const [isSavedMetadata, setIsSavedMetadata] = useState<boolean>(false);

  useEffect(() => {
    setTanggalSesi(activeSession.tanggalPengambilan || new Date().toISOString().split('T')[0]);
    setPetugasSesi(activeSession.petugasLapangan || 'Danang Prasetyo (Petugas Lapangan)');
  }, [activeSession]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'semua' | 'sudah' | 'belum'>('semua');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Selected Warga for editing
  const [selectedWargaId, setSelectedWargaId] = useState<number | null>(null);
  const [tabunganInput, setTabunganInput] = useState<number>(10000);
  const [statusInput, setStatusInput] = useState<'sudah_diambil' | 'tidak_ada' | 'ditunda' | 'tidak_ikut'>('sudah_diambil');
  const [keteranganInput, setKeteranganInput] = useState<string>('');

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
    setTimeout(() => setIsSavedMetadata(false), 2500);
  };

  const handleSelectWarga = (wargaId: number) => {
    setSelectedWargaId(wargaId);
    setShowSuggestions(false);
    const existingTx = transaksiPengambilanList.find(t => t.pengambilanId === activeSession.id && t.wargaId === wargaId);
    if (existingTx && existingTx.status === 'sudah_diambil') {
      setTabunganInput(existingTx.tabungan);
      setStatusInput('sudah_diambil');
      setKeteranganInput(existingTx.keterangan || '');
    } else {
      setTabunganInput(10000);
      setStatusInput('sudah_diambil');
      setKeteranganInput('');
    }
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWargaId) return;

    // Ensure session date & officer are updated
    updatePengambilanSessionMetadata(activeSession.id, tanggalSesi, petugasSesi);

    savePengambilanWargaItem(
      activeSession.id,
      selectedWargaId,
      3000,
      tabunganInput,
      statusInput,
      keteranganInput
    );

    // Auto move to next unvisited warga
    const nextItem = activeWargaItems.find(item => item.warga.id > selectedWargaId && item.tx?.status !== 'sudah_diambil');
    if (nextItem) {
      handleSelectWarga(nextItem.warga.id);
    } else {
      setSelectedWargaId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-24 max-w-4xl mx-auto">
      
      {/* Top Mobile Session Header & Metadata Input Panel */}
      <div className="glass-panel p-5 rounded-3xl border border-gray-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            {onBack && (
              <button onClick={onBack} className="p-2 rounded-xl text-gray-400 hover:text-white bg-gray-900">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
                  📱 MOBILE ENTRY PETUGAS KELILING
                </span>
                <span className="text-xs text-gray-400">Sesi Pengambilan #{activeSession.nomorPengambilan}</span>
              </div>
              <h2 className="text-xl font-bold text-white font-heading mt-0.5">
                Pencatatan Keliling Jimpitan & Tabungan
              </h2>
            </div>
          </div>

          <div className="text-left sm:text-right bg-gray-900/60 p-3 rounded-2xl border border-gray-800">
            <p className="text-[10px] uppercase font-bold text-gray-400">Total Setoran Sesi</p>
            <p className="text-lg font-black text-amber-400 font-heading">
              Rp {activeSession.totalSetoran.toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        {/* SESSION METADATA FORM: Tanggal Entry & Nama Petugas (Free Input Custom) */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-gray-900 to-gray-900 border border-emerald-500/20 space-y-3">
          <p className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Pengaturan Tanggal Entry & Nama Petugas Lapangan</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Tanggal Entry Input */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                Tanggal Pengambilan / Entry Data
              </label>
              <input
                type="date"
                value={tanggalSesi}
                onChange={(e) => setTanggalSesi(e.target.value)}
                className="w-full glass-input px-3.5 py-2 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Nama Petugas Lapangan Input (Free Input + Quick Options) */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                Nama Petugas Lapangan (Bisa Diisi Bebas)
              </label>
              <div className="space-y-1.5">
                <input
                  type="text"
                  value={petugasSesi}
                  onChange={(e) => setPetugasSesi(e.target.value)}
                  placeholder="Ketik nama petugas yang bertugas..."
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-xs font-bold text-amber-300 focus:ring-2 focus:ring-emerald-500"
                />
                
                {/* Quick Officer Chips */}
                <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-[10px]">
                  <span className="text-gray-500 shrink-0">Pilih Cepat:</span>
                  <button
                    type="button"
                    onClick={() => setPetugasSesi('Danang Prasetyo (Petugas Lapangan)')}
                    className="px-2 py-0.5 rounded-lg bg-gray-800 text-gray-300 hover:text-white shrink-0"
                  >
                    Danang
                  </button>
                  <button
                    type="button"
                    onClick={() => setPetugasSesi('Slamet Rifaudin (Super Admin)')}
                    className="px-2 py-0.5 rounded-lg bg-gray-800 text-gray-300 hover:text-white shrink-0"
                  >
                    Slamet Rifaudin
                  </button>
                  <button
                    type="button"
                    onClick={() => setPetugasSesi('Budi Santoso (Bendahara)')}
                    className="px-2 py-0.5 rounded-lg bg-gray-800 text-gray-300 hover:text-white shrink-0"
                  >
                    Budi Santoso
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-gray-400 italic">
              *Nama petugas akan dicatat pada audit log & laporan rekap fisik.
            </span>
            <button
              type="button"
              onClick={handleSaveMetadata}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                isSavedMetadata ? 'bg-emerald-500 text-gray-950' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavedMetadata ? 'Tersimpan!' : 'Simpan Info Sesi'}</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 bg-gray-900/60 p-3.5 rounded-2xl border border-gray-800">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-300 font-medium">Progress Keliling Lapangan:</span>
            <span className="text-emerald-400 font-bold">{countSudah} dari {totalWargaCount} Warga ({progressPercent}%)</span>
          </div>
          <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Smart Autocomplete Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 relative">
          
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
              placeholder="🔍 Ketik nama warga (otomatis muncul saran)..."
              className="w-full glass-input pl-9 pr-3 py-2 rounded-xl text-xs font-medium text-white focus:ring-2 focus:ring-emerald-500"
            />

            {/* Smart Autocomplete Suggestions Floating Dropdown */}
            {showSuggestions && suggestedWarga.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 z-40 bg-gray-900 border border-emerald-500/40 rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto animate-fadeIn">
                <div className="px-3 py-1.5 bg-gray-950 border-b border-gray-800 text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Saran Nama Terdaftar</span>
                  </span>
                  <span>{suggestedWarga.length} Hasil</span>
                </div>

                {suggestedWarga.map(item => (
                  <div
                    key={item.warga.id}
                    onClick={() => {
                      handleSelectWarga(item.warga.id);
                      setSearchTerm('');
                    }}
                    className="p-3 border-b border-gray-800/60 hover:bg-emerald-500/20 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">
                          {item.warga.kodeWarga}
                        </span>
                        <span className="text-xs font-bold text-white">{item.warga.nama}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">{item.warga.alamat} • {item.warga.noRumah}</p>
                    </div>

                    <div className="text-right">
                      {item.tx?.status === 'sudah_diambil' ? (
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          🟢 Sudah (Rp {item.tx.total.toLocaleString('id-ID')})
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                          🟡 Pilih Untuk Input
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filterStatus === 'semua' ? 'bg-emerald-600 text-white' : 'bg-gray-900 text-gray-400'
              }`}
            >
              Semua ({totalWargaCount})
            </button>
            <button
              onClick={() => setFilterStatus('sudah')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filterStatus === 'sudah' ? 'bg-emerald-600 text-white' : 'bg-gray-900 text-gray-400'
              }`}
            >
              🟢 Sudah ({countSudah})
            </button>
            <button
              onClick={() => setFilterStatus('belum')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filterStatus === 'belum' ? 'bg-amber-600 text-white' : 'bg-gray-900 text-gray-400'
              }`}
            >
              🟡 Belum ({totalWargaCount - countSudah})
            </button>
          </div>
        </div>
      </div>

      {/* Selected Warga Entry Form Modal / Expanded View */}
      {selectedWargaId && (
        <div className="glass-panel p-6 rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-gray-900 to-gray-950 shadow-2xl space-y-4 animate-fadeIn">
          {(() => {
            const currentWarga = wargaList.find(w => w.id === selectedWargaId);
            if (!currentWarga) return null;

            return (
              <form onSubmit={handleSaveItem} className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 tracking-wider">
                      {currentWarga.kodeWarga}
                    </span>
                    <h3 className="text-xl font-bold text-white font-heading mt-1">{currentWarga.nama}</h3>
                    <p className="text-xs text-gray-400">{currentWarga.alamat} • {currentWarga.noRumah}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedWargaId(null)}
                    className="text-xs text-gray-400 hover:text-white underline"
                  >
                    Tutup Input
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Jimpitan Locked Badge */}
                  <div className="glass-card p-3.5 rounded-2xl border border-emerald-500/30 space-y-1">
                    <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                      Jimpitan Warga (Locked Default)
                    </label>
                    <div className="text-xl font-black text-white font-heading">
                      Rp 3.000
                    </div>
                    <p className="text-[10px] text-gray-400">Otomatis dibagi 50% Pemuda / 50% Dusun saat disahkan</p>
                  </div>

                  {/* Tabungan Free Input */}
                  <div className="glass-card p-3.5 rounded-2xl border border-blue-500/30 space-y-2">
                    <label className="text-xs font-bold text-blue-400 uppercase tracking-wider block">
                      Tabungan Bebas Warga
                    </label>
                    <input
                      type="number"
                      step="5000"
                      value={tabunganInput}
                      onChange={(e) => setTabunganInput(Number(e.target.value))}
                      className="w-full glass-input px-3 py-2 rounded-xl text-base font-bold text-amber-400 focus:ring-2 focus:ring-amber-500"
                    />
                    
                    {/* Quick Add Buttons */}
                    <div className="flex items-center space-x-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setTabunganInput(5000)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-800 text-gray-200 hover:bg-gray-700"
                      >
                        +5rb
                      </button>
                      <button
                        type="button"
                        onClick={() => setTabunganInput(10000)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-800 text-gray-200 hover:bg-gray-700"
                      >
                        +10rb
                      </button>
                      <button
                        type="button"
                        onClick={() => setTabunganInput(20000)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-800 text-gray-200 hover:bg-gray-700"
                      >
                        +20rb
                      </button>
                      <button
                        type="button"
                        onClick={() => setTabunganInput(0)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-800 text-rose-300 hover:bg-rose-950"
                      >
                        Reset (0)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Status Switcher */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-300">Status Kunjungan Warga</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setStatusInput('sudah_diambil')}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                        statusInput === 'sudah_diambil'
                          ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                          : 'bg-gray-900 text-gray-400 border-gray-800'
                      }`}
                    >
                      ✅ Sudah Diambil
                    </button>

                    <button
                      type="button"
                      onClick={() => setStatusInput('tidak_ada')}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                        statusInput === 'tidak_ada'
                          ? 'bg-amber-600 text-white border-amber-400 shadow-md'
                          : 'bg-gray-900 text-gray-400 border-gray-800'
                      }`}
                    >
                      🟡 Tidak Ada
                    </button>

                    <button
                      type="button"
                      onClick={() => setStatusInput('ditunda')}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                        statusInput === 'ditunda'
                          ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                          : 'bg-gray-900 text-gray-400 border-gray-800'
                      }`}
                    >
                      🔵 Ditunda
                    </button>

                    <button
                      type="button"
                      onClick={() => setStatusInput('tidak_ikut')}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                        statusInput === 'tidak_ikut'
                          ? 'bg-rose-600 text-white border-rose-400 shadow-md'
                          : 'bg-gray-900 text-gray-400 border-gray-800'
                      }`}
                    >
                      ❌ Tidak Ikut
                    </button>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-400 text-gray-950 hover:from-emerald-400 hover:to-teal-300 shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center space-x-2"
                >
                  <Check className="w-5 h-5" />
                  <span>SIMPAN & LANJUT WARGA BERIKUTNYA</span>
                </button>
              </form>
            );
          })()}
        </div>
      )}

      {/* Warga List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredItems.map(item => {
          const isTaken = item.tx?.status === 'sudah_diambil';
          const isSelected = selectedWargaId === item.warga.id;

          return (
            <div
              key={item.warga.id}
              onClick={() => handleSelectWarga(item.warga.id)}
              className={`glass-card p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
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
                    <span className="text-[10px] text-emerald-400 font-semibold">(3k Jimpitan + {item.tx?.tabungan.toLocaleString('id-ID')} Tabungan)</span>
                  </>
                ) : (
                  <>
                    <span className="text-amber-400 font-semibold text-[11px]">Belum Diambil</span>
                    <span className="text-[10px] text-gray-500">Tap untuk input</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-4 left-4 right-4 max-w-2xl mx-auto z-30">
        <div className="glass-panel p-4 rounded-2xl border border-emerald-500/40 shadow-2xl flex items-center justify-between bg-gray-950/90 backdrop-blur-xl">
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-400">Total Sesi ({tanggalSesi})</p>
            <p className="text-xl font-black text-amber-400 font-heading">
              Rp {activeSession.totalSetoran.toLocaleString('id-ID')}
            </p>
            <p className="text-[10px] text-gray-400">PJ: <span className="text-emerald-300 font-semibold">{petugasSesi}</span></p>
          </div>

          <button
            onClick={() => {
              updatePengambilanSessionMetadata(activeSession.id, tanggalSesi, petugasSesi);
              if (onGoToReconcile) onGoToReconcile();
            }}
            className="px-5 py-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center space-x-2"
          >
            <UserCheck className="w-4 h-4" />
            <span>Selesai & Rekonsiliasi &rarr;</span>
          </button>
        </div>
      </div>

    </div>
  );
};
