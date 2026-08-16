import React, { useState, useMemo } from 'react';
import { 
  Wallet, Search, ShieldCheck, ArrowDownRight, ArrowUpRight, 
  X, AlertCircle, Printer, RefreshCw, Sparkles, Filter, Calendar, Users, CheckCircle2 
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useApp } from '../context/AppContext';
import type { Warga } from '../types';

interface SavingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublicSavingsLookup: React.FC<SavingsModalProps> = ({ isOpen, onClose }) => {
  const { 
    lookupTabunganPublik, currentPeriode, periodeList, transaksiPengambilanList, 
    pengambilanList, wargaList, transaksiTabunganList, getSaldoTabunganWarga 
  } = useApp();

  const [nama, setNama] = useState('Anwari');
  const [kodeWarga, setKodeWarga] = useState('KDY-001');
  const [filterBulan, setFilterBulan] = useState<number | 'semua'>('semua');
  const [filterTahun, setFilterTahun] = useState<number | 'semua'>('semua');
  const [activeViewTab, setActiveViewTab] = useState<'mingguan' | 'bukutabungan'>('mingguan');
  const [isExporting, setIsExporting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [searchResult, setSearchResult] = useState<{
    searched: boolean;
    found: boolean;
    warga?: Warga;
    saldoTotal?: number;
  }>({ searched: false, found: false });

  if (!isOpen) return null;

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

  // Matching registered warga suggestions
  const suggestedWargaList = wargaList.filter(w => {
    if (!nama.trim()) return false;
    const term = nama.trim().toLowerCase();
    return w.nama.toLowerCase().includes(term) ||
           w.kodeWarga.toLowerCase().includes(term) ||
           w.noRumah.toLowerCase().includes(term);
  });

  const executeLookup = (targetNama: string, targetKode: string) => {
    setNama(targetNama);
    setKodeWarga(targetKode);
    setShowSuggestions(false);
    const res = lookupTabunganPublik(targetNama, targetKode);
    setSearchResult({
      searched: true,
      found: res.found,
      warga: res.warga,
      saldoTotal: res.saldoTotal,
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    executeLookup(nama, kodeWarga);
  };

  const handleSelectSuggestedWarga = (w: Warga) => {
    executeLookup(w.nama, w.kodeWarga);
  };

  // Detailed Weekly History per Citizen with Group & Date tracking
  const citizenWeeklyHistory = useMemo(() => {
    if (!searchResult.warga) return [];
    const targetWargaId = searchResult.warga.id;

    return (pengambilanList || []).map(session => {
      const tx = (transaksiPengambilanList || []).find(
        t => t.pengambilanId === session.id && t.wargaId === targetWargaId
      );

      const isTaken = tx?.status === 'sudah_diambil';
      const jimpitan = isTaken ? (tx?.jimpitan || 3000) : 0;
      const tabungan = isTaken ? (tx?.tabungan || 0) : 0;
      const total = jimpitan + tabungan;

      const dateObj = new Date(session.tanggalPengambilan);
      const sessionMonth = dateObj.getMonth() + 1;
      const sessionYear = dateObj.getFullYear();

      return {
        sessionId: session.id,
        nomorPengambilan: session.nomorPengambilan,
        tanggalPengambilan: session.tanggalPengambilan,
        hariPengambilan: session.hariPengambilan || 'Malam Minggu',
        isDitunda: session.isDitunda,
        alasanPenundaan: session.alasanPenundaan,
        kelompok: session.petugasLapangan || 'Kelompok SATU',
        statusSesi: session.status,
        isTaken,
        jimpitan,
        tabungan,
        total,
        waktuPengambilan: tx?.waktuPengambilan,
        bulan: sessionMonth,
        tahun: sessionYear,
      };
    }).filter(item => {
      if (filterBulan !== 'semua' && item.bulan !== Number(filterBulan)) return false;
      if (filterTahun !== 'semua' && item.tahun !== Number(filterTahun)) return false;
      return true;
    }).sort((a, b) => b.sessionId - a.sessionId);
  }, [searchResult.warga, pengambilanList, transaksiPengambilanList, filterBulan, filterTahun]);

  // General Tabungan Ledger (Setoran, Penarikan, Koreksi)
  const citizenSavingsLedger = useMemo(() => {
    if (!searchResult.warga) return [];
    const targetWargaId = searchResult.warga.id;

    return (transaksiTabunganList || [])
      .filter(t => t.wargaId === targetWargaId)
      .filter(t => {
        const d = new Date(t.createdAt);
        if (filterBulan !== 'semua' && d.getMonth() + 1 !== Number(filterBulan)) return false;
        if (filterTahun !== 'semua' && d.getFullYear() !== Number(filterTahun)) return false;
        return true;
      })
      .sort((a, b) => b.id - a.id);
  }, [searchResult.warga, transaksiTabunganList, filterBulan, filterTahun]);

  // Aggregate stats
  const totalFilteredJimpitan = citizenWeeklyHistory.reduce((acc, h) => acc + (h.isTaken ? h.jimpitan : 0), 0);
  const totalFilteredTabungan = citizenWeeklyHistory.reduce((acc, h) => acc + (h.isTaken ? h.tabungan : 0), 0);
  const totalFilteredSetoran = totalFilteredJimpitan + totalFilteredTabungan;
  const countHadir = citizenWeeklyHistory.filter(h => h.isTaken).length;

  // PDF Export
  const handleExportPersonalPDF = () => {
    if (!searchResult.warga) return;

    setIsExporting(true);
    setTimeout(() => {
      try {
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        const warga = searchResult.warga!;
        const totalSaldoTabungan = getSaldoTabunganWarga(warga.id);

        const nowStr = new Date().toLocaleDateString('id-ID', {
          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });

        // Header Dusun
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, 210, 38, 'F');

        doc.setFontSize(15);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('KARTU TRANSPARANSI JIMPITAN & TABUNGAN WARGA', 105, 14, { align: 'center' });

        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(52, 211, 153);
        doc.text('PAGUYUBAN PEMUDA DUSUN KIYUDAN RT 01 / RW 04, DESA MAJAKSINGI', 105, 21, { align: 'center' });

        doc.setFontSize(8);
        doc.setTextColor(203, 213, 225);
        doc.text(`Dicetak Resmi pada: ${nowStr} • Akuntabilitas 100% Transparan`, 105, 28, { align: 'center' });

        // Citizen Identity & Balance Box
        doc.setDrawColor(226, 232, 240);
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(14, 44, 182, 30, 3, 3, 'FD');

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(`NAMA WARGA: ${warga.nama.toUpperCase()} (${warga.kodeWarga})`, 20, 53);

        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(`Alamat: ${warga.alamat} • ${warga.noRumah}`, 20, 60);
        doc.text(`Periode: Pembukuan Tahun ${currentPeriode.tahun}`, 20, 66);

        // Big Balance
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(180, 83, 9);
        doc.text('TOTAL SALDO TABUNGAN SAAT INI:', 130, 53);

        doc.setFontSize(14);
        doc.setTextColor(16, 185, 129);
        doc.text(`Rp ${totalSaldoTabungan.toLocaleString('id-ID')}`, 130, 63);

        // Table
        const tableBody = citizenWeeklyHistory.map((item, idx) => [
          String(idx + 1),
          item.tanggalPengambilan,
          (item.kelompok || 'Kelompok SATU').split('(')[0].trim(),
          item.isTaken ? `Rp ${item.jimpitan.toLocaleString('id-ID')}` : 'Rp 0',
          item.isTaken ? `Rp ${item.tabungan.toLocaleString('id-ID')}` : 'Rp 0',
          item.isTaken ? `Rp ${item.total.toLocaleString('id-ID')}` : 'Rp 0',
          item.isTaken ? 'Lunas / Sah' : 'Belum Setor',
        ]);

        tableBody.push([
          '',
          'TOTAL AKUMULASI',
          `${countHadir}x Hadir`,
          `Rp ${totalFilteredJimpitan.toLocaleString('id-ID')}`,
          `Rp ${totalFilteredTabungan.toLocaleString('id-ID')}`,
          `Rp ${totalFilteredSetoran.toLocaleString('id-ID')}`,
          '',
        ]);

        autoTable(doc, {
          startY: 80,
          head: [['No', 'Tanggal Pengambilan', 'Kelompok Bertugas', 'Jimpitan', 'Tabungan', 'Total Setor', 'Status']],
          body: tableBody,
          theme: 'grid',
          headStyles: {
            fillColor: [15, 23, 42],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 8.5,
          },
          bodyStyles: {
            fontSize: 8,
            textColor: [30, 41, 59],
          },
          columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 35 },
            2: { cellWidth: 42, fontStyle: 'bold' },
            3: { cellWidth: 25, halign: 'right' },
            4: { cellWidth: 25, halign: 'right' },
            5: { cellWidth: 25, halign: 'right', fontStyle: 'bold' },
            6: { cellWidth: 20, halign: 'center' },
          },
        });

        const finalY = (doc as any).lastAutoTable.finalY + 15;
        if (finalY < 250) {
          doc.setFontSize(8.5);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(15, 23, 42);

          doc.text('Ketua Pemuda Kiyudan,', 30, finalY);
          doc.text('Warga Penabung,', 95, finalY);
          doc.text('Bendahara Dusun,', 150, finalY);

          doc.setFont('helvetica', 'bold');
          doc.text('Humam Syarif', 30, finalY + 22);
          doc.text(warga.nama, 95, finalY + 22);
          doc.text('Syarif Suharsono', 150, finalY + 22);
        }

        doc.save(`Tabungan_${warga.nama.replace(/\s+/g, '_')}_${warga.kodeWarga}.pdf`);
        setIsExporting(false);
      } catch (err) {
        console.error(err);
        setIsExporting(false);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel p-5 sm:p-7 rounded-3xl border border-gray-800 max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl space-y-5 bg-gray-950">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-800/80 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white font-heading">
                Cek Tabungan & Riwayat Jimpitan Warga
              </h3>
              <p className="text-xs text-gray-400">
                Transparansi penuh per tanggal pengambilan, kelompok bertugas & nominal tabungan
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl text-gray-400 hover:text-white bg-gray-900 border border-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Form with Smart Autocomplete */}
        <form onSubmit={handleSearch} className="glass-card p-4 sm:p-5 rounded-2xl border border-gray-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Nama Warga */}
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center justify-between">
                <span>Nama Lengkap Warga</span>
                <span className="text-[10px] text-emerald-400 font-bold flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Autofill Otomatis</span>
                </span>
              </label>

              <input
                type="text"
                required
                value={nama}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setNama(e.target.value);
                  setShowSuggestions(true);
                  const exact = wargaList.find(w => w.nama.toLowerCase() === e.target.value.trim().toLowerCase());
                  if (exact) {
                    setKodeWarga(exact.kodeWarga);
                  }
                }}
                placeholder="Ketik nama Anda (contoh: Anwari)..."
                className="w-full glass-input px-4 py-2.5 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 text-white"
              />

              {/* Autocomplete Dropdown */}
              {showSuggestions && suggestedWargaList.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-gray-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto animate-fadeIn">
                  <div className="px-3 py-1.5 bg-gray-950 border-b border-gray-800 text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Saran Nama Terdaftar (40 KK)</span>
                    <span>{suggestedWargaList.length} Nama</span>
                  </div>

                  {suggestedWargaList.map(w => (
                    <div
                      key={w.id}
                      onClick={() => handleSelectSuggestedWarga(w)}
                      className="p-3 border-b border-gray-800/60 hover:bg-amber-500/20 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">
                          {w.kodeWarga}
                        </span>
                        <span className="text-xs font-bold text-white">{w.nama}</span>
                      </div>
                      <span className="text-[10px] text-gray-400">{w.noRumah}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Kode Warga */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Kode Warga (Otomatis Terisi)
              </label>
              <input
                type="text"
                required
                value={kodeWarga}
                onChange={(e) => setKodeWarga(e.target.value.toUpperCase())}
                placeholder="Contoh: KDY-001"
                className="w-full glass-input px-4 py-2.5 rounded-xl text-sm font-black tracking-wider uppercase focus:ring-2 focus:ring-amber-500 text-amber-400 bg-gray-900/60"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <div className="flex items-center space-x-1.5 text-[11px] text-gray-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Privasi Terjamin: Data saldo aman & transparan</span>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>Cek Saldo Tabungan</span>
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
                  Nama Warga &quot;{nama}&quot; dan Kode Warga &quot;{kodeWarga}&quot; tidak cocok. Silakan pilih dari saran nama yang muncul saat mengetik.
                </p>
              </div>
            ) : (
              <div className="space-y-5 animate-fadeIn">
                
                {/* Result Hero Card Matching Screenshot */}
                <div className="glass-card p-6 rounded-3xl border border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-gray-900 to-gray-950 shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 tracking-wider uppercase">
                          {searchResult.warga?.kodeWarga}
                        </span>
                        <span className="text-xs text-gray-400">{searchResult.warga?.alamat} • {searchResult.warga?.noRumah}</span>
                      </div>
                      
                      <h2 className="text-2xl sm:text-3xl font-black text-white font-heading mt-1 uppercase tracking-wide">
                        {searchResult.warga?.nama}
                      </h2>
                      
                      <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                        Status: <span className="text-white font-bold">Warga Aktif Dusun Kiyudan</span>
                      </p>
                    </div>

                    {/* Big Bold Balance - Exactly as in user image */}
                    <div className="text-left sm:text-right bg-gray-950/90 p-4 rounded-2xl border border-amber-500/30 shadow-inner">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        Saldo Tabungan Saat Ini
                      </p>
                      <p className="text-3xl sm:text-4xl font-black text-amber-400 font-heading tracking-tight mt-1">
                        Rp {searchResult.saldoTotal?.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>

                  {/* Summary Metric Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-gray-800 text-xs">
                    <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800">
                      <span className="text-[10px] text-gray-400 uppercase block">Total Jimpitan Disetor</span>
                      <span className="font-bold text-amber-300 text-sm mt-0.5 block">Rp {totalFilteredJimpitan.toLocaleString('id-ID')}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800">
                      <span className="text-[10px] text-gray-400 uppercase block">Total Tabungan Sesi</span>
                      <span className="font-bold text-blue-400 text-sm mt-0.5 block">Rp {totalFilteredTabungan.toLocaleString('id-ID')}</span>
                    </div>

                    <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-gray-900/80 border border-emerald-500/30">
                      <span className="text-[10px] text-emerald-400 uppercase block">Total Akumulasi Masuk</span>
                      <span className="font-black text-emerald-400 text-sm mt-0.5 block font-heading">Rp {totalFilteredSetoran.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  {/* Filter & Tracking Bar (Bulan & Tahun) */}
                  <div className="pt-3 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      <div className="flex items-center space-x-1 text-xs text-gray-300">
                        <Filter className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-semibold">Tracking:</span>
                      </div>

                      {/* Filter Bulan */}
                      <select
                        value={filterBulan}
                        onChange={(e) => setFilterBulan(e.target.value === 'semua' ? 'semua' : Number(e.target.value))}
                        className="glass-input px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-gray-900 border border-gray-800"
                      >
                        <option value="semua">Semua Bulan (Jan - Des)</option>
                        {bulans.map(b => (
                          <option key={b.value} value={b.value}>Bulan {b.label}</option>
                        ))}
                      </select>

                      {/* Filter Tahun */}
                      <select
                        value={filterTahun}
                        onChange={(e) => setFilterTahun(e.target.value === 'semua' ? 'semua' : Number(e.target.value))}
                        className="glass-input px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-gray-900 border border-gray-800"
                      >
                        <option value="semua">Semua Tahun</option>
                        {periodeList.map(p => (
                          <option key={p.id} value={p.tahun}>Tahun {p.tahun}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={handleExportPersonalPDF}
                      disabled={isExporting}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 shrink-0"
                    >
                      {isExporting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Mencetak PDF...</span>
                        </>
                      ) : (
                        <>
                          <Printer className="w-4 h-4" />
                          <span>🖨️ Cetak Riwayat Resmi (PDF)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* View Switcher Tabs */}
                <div className="flex items-center space-x-2 border-b border-gray-800 pb-2">
                  <button
                    onClick={() => setActiveViewTab('mingguan')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                      activeViewTab === 'mingguan'
                        ? 'bg-amber-500 text-gray-950 shadow-md'
                        : 'bg-gray-900 text-gray-400 hover:text-white'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>📅 Riwayat Per Tanggal & Kelompok</span>
                  </button>

                  <button
                    onClick={() => setActiveViewTab('bukutabungan')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                      activeViewTab === 'bukutabungan'
                        ? 'bg-amber-500 text-gray-950 shadow-md'
                        : 'bg-gray-900 text-gray-400 hover:text-white'
                    }`}
                  >
                    <Wallet className="w-4 h-4" />
                    <span>💳 Buku Tabungan Lengkap</span>
                  </button>
                </div>

                {/* Tab 1: Weekly History Table (Exact match to screenshot!) */}
                {activeViewTab === 'mingguan' && (
                  <div className="glass-panel rounded-2xl border border-gray-800 overflow-hidden shadow-xl space-y-0 animate-fadeIn">
                    <div className="p-4 bg-gray-950 border-b border-gray-800 flex items-center justify-between text-xs">
                      <div>
                        <h4 className="font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                          <span>📋 Riwayat Setoran Jimpitan & Tabungan</span>
                        </h4>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Mengetahui kapan dicatat dan kelompok mana yang bertugas pada setiap tanggal
                        </p>
                      </div>

                      <span className="text-gray-400 text-xs">
                        <b className="text-emerald-400">{citizenWeeklyHistory.length} Jadwal</b>
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-900 text-gray-400 uppercase font-bold border-b border-gray-800 tracking-wider">
                          <tr>
                            <th className="p-3.5">Tanggal</th>
                            <th className="p-3.5">Kelompok Bertugas</th>
                            <th className="p-3.5 text-right">Jimpitan</th>
                            <th className="p-3.5 text-right">Tabungan</th>
                            <th className="p-3.5 text-right">Total Setor</th>
                            <th className="p-3.5 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/60 text-gray-300">
                          {citizenWeeklyHistory.length > 0 ? (
                            citizenWeeklyHistory.map((item) => (
                              <tr key={item.sessionId} className="hover:bg-gray-800/40 transition-colors">
                                <td className="p-3.5 font-bold text-white whitespace-nowrap">
                                  <div className="flex items-center space-x-2">
                                    <span>{item.tanggalPengambilan}</span>
                                    {item.isDitunda && (
                                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                        Malam Senin
                                      </span>
                                    )}
                                  </div>
                                </td>

                                <td className="p-3.5 font-extrabold text-amber-300 whitespace-nowrap">
                                  <div className="flex items-center space-x-1.5">
                                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>{(item.kelompok || 'Kelompok SATU').split('(')[0].trim()}</span>
                                  </div>
                                </td>

                                <td className="p-3.5 text-right font-bold text-amber-400 whitespace-nowrap">
                                  {item.isTaken ? `Rp ${item.jimpitan.toLocaleString('id-ID')}` : <span className="text-gray-600 font-normal">Rp 0</span>}
                                </td>

                                <td className="p-3.5 text-right font-bold text-blue-400 whitespace-nowrap">
                                  {item.isTaken ? `Rp ${item.tabungan.toLocaleString('id-ID')}` : <span className="text-gray-600 font-normal">Rp 0</span>}
                                </td>

                                <td className="p-3.5 text-right font-black text-emerald-400 text-sm font-heading whitespace-nowrap">
                                  {item.isTaken ? `Rp ${item.total.toLocaleString('id-ID')}` : <span className="text-gray-600 font-normal">Rp 0</span>}
                                </td>

                                <td className="p-3.5 text-center whitespace-nowrap">
                                  {item.isTaken ? (
                                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                      <CheckCircle2 className="w-3 h-3" />
                                      <span>SUDAH DICATAT</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                      <span>BELUM SETOR</span>
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="p-6 text-center text-gray-500">
                                Tidak ada data riwayat pada filter yang dipilih.
                              </td>
                            </tr>
                          )}
                        </tbody>

                        <tfoot className="bg-gray-950 font-bold border-t-2 border-gray-800 text-white">
                          <tr>
                            <td colSpan={2} className="p-3.5 text-emerald-400 uppercase text-xs">
                              TOTAL SETORAN TERKUMPUL:
                            </td>
                            <td className="p-3.5 text-right text-amber-400 font-bold">
                              Rp {totalFilteredJimpitan.toLocaleString('id-ID')}
                            </td>
                            <td className="p-3.5 text-right text-blue-400 font-bold">
                              Rp {totalFilteredTabungan.toLocaleString('id-ID')}
                            </td>
                            <td className="p-3.5 text-right text-emerald-400 font-black text-sm font-heading">
                              Rp {totalFilteredSetoran.toLocaleString('id-ID')}
                            </td>
                            <td className="p-3.5 text-center text-xs text-gray-400">
                              {countHadir}x Masuk
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* Tab 2: General Savings Ledger (Setoran & Penarikan) */}
                {activeViewTab === 'bukutabungan' && (
                  <div className="space-y-2 animate-fadeIn">
                    <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                      Buku Mutasi Tabungan ({citizenSavingsLedger.length} Transaksi)
                    </h4>

                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {citizenSavingsLedger.length > 0 ? (
                        citizenSavingsLedger.map((t) => (
                          <div
                            key={t.id}
                            className="glass-card p-3.5 rounded-2xl border border-gray-800/80 flex items-center justify-between hover:border-gray-700 transition-colors"
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
                        <p className="text-xs text-gray-500 text-center py-6">Belum ada mutasi tabungan pada filter ini.</p>
                      )}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
