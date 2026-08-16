import React, { useState } from 'react';
import { Wallet, Search, ShieldCheck, ArrowDownRight, ArrowUpRight, X, AlertCircle, Printer, RefreshCw, Sparkles } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useApp } from '../context/AppContext';
import type { Warga, TransaksiTabungan } from '../types';

interface SavingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublicSavingsLookup: React.FC<SavingsModalProps> = ({ isOpen, onClose }) => {
  const { lookupTabunganPublik, currentPeriode, transaksiPengambilanList, pengambilanList, wargaList } = useApp();
  const [nama, setNama] = useState('Anwari');
  const [kodeWarga, setKodeWarga] = useState('KDY-001');
  const [filterBulan, setFilterBulan] = useState<number | 'semua'>('semua');
  const [isExporting, setIsExporting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [searchResult, setSearchResult] = useState<{
    searched: boolean;
    found: boolean;
    warga?: Warga;
    saldoTotal?: number;
    history?: TransaksiTabungan[];
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
      history: res.history,
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    executeLookup(nama, kodeWarga);
  };

  const handleSelectSuggestedWarga = (w: Warga) => {
    executeLookup(w.nama, w.kodeWarga);
  };

  // Personal PDF Generator
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
        const nowStr = new Date().toLocaleDateString('id-ID', {
          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });

        // Filter transactions for this citizen
        const citizenSessionsTx = transaksiPengambilanList.filter(
          t => t.wargaId === warga.id && t.status === 'sudah_diambil'
        ).map(t => {
          const sessionObj = pengambilanList.find(s => s.id === t.pengambilanId);
          return {
            ...t,
            sessionObj,
          };
        }).filter(item => {
          if (!item.sessionObj) return false;
          if (filterBulan !== 'semua') {
            const m = new Date(item.sessionObj.tanggalPengambilan).getMonth() + 1;
            return m === Number(filterBulan);
          }
          return true;
        }).sort((a, b) => (a.sessionObj?.nomorPengambilan || 0) - (b.sessionObj?.nomorPengambilan || 0));

        const sumJimpitan = citizenSessionsTx.reduce((acc, t) => acc + t.jimpitan, 0);
        const sumTabungan = citizenSessionsTx.reduce((acc, t) => acc + t.tabungan, 0);
        const grandTotal = sumJimpitan + sumTabungan;

        let scopeText = `Akumulasi 1 Tahun (Periode Pembukuan ${currentPeriode.tahun})`;
        if (filterBulan !== 'semua') {
          const bulanName = bulans.find(b => b.value === Number(filterBulan))?.label;
          scopeText = `Laporan Bulanan (${bulanName} ${currentPeriode.tahun})`;
        }

        // Kop Surat Header
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(16, 185, 129); // Emerald
        doc.text('PEMUDA DUSUN KIYUDAN', 14, 15);

        doc.setFontSize(9);
        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text('RT 01 / RW 04, Desa Majaksingi, Kecamatan Borobudur, Kabupaten Magelang', 14, 20);
        doc.text('Sistem Keuangan, Jimpitan & Tabungan Mandiri Warga', 14, 24);

        doc.setLineWidth(0.5);
        doc.setDrawColor(203, 213, 225);
        doc.line(14, 27, 196, 27);

        // Judul Dokumen
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(15, 23, 42);
        doc.text('KARTU & LAPORAN SETORAN INDIVIDU WARGA', 14, 34);

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(71, 85, 105);
        doc.text(`Kriteria Laporan: ${scopeText} | Tanggal Cetak: ${nowStr}`, 14, 39);

        // Detail Box Warga
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(14, 44, 182, 28, 3, 3, 'F');

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        doc.text(`Kode Warga : ${warga.kodeWarga}`, 18, 51);
        doc.text(`Nama Warga : ${warga.nama}`, 18, 57);
        doc.text(`Alamat / No : ${warga.alamat} (${warga.noRumah})`, 18, 63);

        doc.text(`Total Pertemuan  : ${citizenSessionsTx.length} Sesi`, 110, 51);
        doc.text(`Total Jimpitan   : Rp ${sumJimpitan.toLocaleString('id-ID')}`, 110, 57);
        doc.setTextColor(16, 185, 129);
        doc.text(`GRAND TOTAL SALDO: Rp ${grandTotal.toLocaleString('id-ID')}`, 110, 63);

        // Table Body
        const tableBody = citizenSessionsTx.map((item, idx) => [
          idx + 1,
          `Sesi #${item.sessionObj?.nomorPengambilan}`,
          item.sessionObj?.tanggalPengambilan || '-',
          `Rp ${item.jimpitan.toLocaleString('id-ID')}`,
          `Rp ${item.tabungan.toLocaleString('id-ID')}`,
          item.sessionObj?.petugasLapangan || 'Danang Prasetyo',
          `Rp ${item.total.toLocaleString('id-ID')}`,
        ]);

        // Footer row
        tableBody.push([
          '',
          '',
          'TOTAL AKUMULASI SETORAN',
          `Rp ${sumJimpitan.toLocaleString('id-ID')}`,
          `Rp ${sumTabungan.toLocaleString('id-ID')}`,
          '',
          `Rp ${grandTotal.toLocaleString('id-ID')}`,
        ]);

        autoTable(doc, {
          startY: 76,
          head: [['No', 'Sesi Minggu', 'Tanggal', 'Jimpitan (3k)', 'Tabungan', 'Petugas Lapangan', 'Total Setoran']],
          body: tableBody,
          theme: 'striped',
          headStyles: {
            fillColor: [16, 185, 129],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9,
          },
          bodyStyles: {
            fontSize: 8.5,
            textColor: [30, 41, 59],
          },
          columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 24, fontStyle: 'bold' },
            2: { cellWidth: 26 },
            3: { cellWidth: 28, halign: 'right' },
            4: { cellWidth: 30, halign: 'right' },
            5: { cellWidth: 34 },
            6: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
          },
          didParseCell: (data) => {
            if (data.row.index === tableBody.length - 1) {
              data.cell.styles.fontStyle = 'bold';
              data.cell.styles.fillColor = [226, 232, 240];
              data.cell.styles.textColor = [15, 23, 42];
            }
          },
        });

        // Signatures Block
        const finalY = (doc as any).lastAutoTable.finalY + 15;

        if (finalY < 250) {
          doc.setFontSize(9);
          doc.setTextColor(15, 23, 42);

          const col1 = 25;
          const col2 = 85;
          const col3 = 145;

          doc.text('Warga Pemilik Tabungan,', col1, finalY);
          doc.text('Petugas Lapangan,', col2, finalY);
          doc.text('Bendahara Dusun,', col3, finalY);

          doc.setFont('Helvetica', 'bold');
          doc.text(warga.nama, col1, finalY + 18);
          doc.text('Humam Syarif', col2, finalY + 18);
          doc.text('Syarif Suharsono', col3, finalY + 18);

          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139);
          doc.text(`Kode: ${warga.kodeWarga}`, col1, finalY + 22);
          doc.text('Ketua Pemuda Kiyudan', col2, finalY + 22);
          doc.text('Pengelola Keuangan', col3, finalY + 22);
        }

        doc.save(`Laporan_Personal_${warga.kodeWarga}_${warga.nama.replace(/\s+/g, '_')}.pdf`);
      } catch (e) {
        console.error(e);
      } finally {
        setIsExporting(false);
      }
    }, 300);
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
              Ketik nama Anda di bawah ini, pilih nama yang terdaftar, maka Kode Warga akan otomatis terisi!
            </p>
          </div>
        </div>

        {/* Search Form with Smart Autocomplete & Auto-Fill Kode Warga */}
        <form onSubmit={handleSearch} className="glass-card p-4 sm:p-5 rounded-2xl border border-gray-800 mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Nama Warga with Floating Suggestions */}
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
                  // Auto-lookup matching exact name if found
                  const exact = wargaList.find(w => w.nama.toLowerCase() === e.target.value.trim().toLowerCase());
                  if (exact) {
                    setKodeWarga(exact.kodeWarga);
                  }
                }}
                placeholder="Ketik nama Anda (contoh: Anwari)..."
                className="w-full glass-input px-4 py-2.5 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 text-white"
              />

              {/* Autocomplete Floating Dropdown */}
              {showSuggestions && suggestedWargaList.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-gray-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto animate-fadeIn">
                  <div className="px-3 py-1.5 bg-gray-950 border-b border-gray-800 text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Saran Nama Terdaftar</span>
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

            {/* Kode Warga Auto-Filled */}
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
              <span>Privasi terjamin: Saldo warga lain tetap terlindungi</span>
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
                  Nama Warga &quot;{nama}&quot; dan Kode Warga &quot;{kodeWarga}&quot; tidak cocok. Silakan ketik ulang nama Anda di atas dan pilih dari saran nama yang muncul.
                </p>
              </div>
            ) : (
              <div className="space-y-5 animate-fadeIn">
                
                {/* Result Hero Card */}
                <div className="glass-card p-6 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-gray-900/80 to-emerald-500/10 shadow-xl relative overflow-hidden space-y-4">
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

                  {/* Cetak PDF Personal Control Bar */}
                  <div className="pt-3 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                      <span className="text-xs text-gray-300 font-medium">Filter Cetak:</span>
                      <select
                        value={filterBulan}
                        onChange={(e) => setFilterBulan(e.target.value === 'semua' ? 'semua' : Number(e.target.value))}
                        className="glass-input px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-300"
                      >
                        <option value="semua" className="bg-gray-900 text-white">Akumulasi 1 Tahun ({currentPeriode.tahun})</option>
                        {bulans.map(b => (
                          <option key={b.value} value={b.value} className="bg-gray-900 text-white">
                            Bulan {b.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={handleExportPersonalPDF}
                      disabled={isExporting}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {isExporting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Mencetak PDF...</span>
                        </>
                      ) : (
                        <>
                          <Printer className="w-4 h-4" />
                          <span>🖨️ Cetak Kartu Laporan Individu (PDF)</span>
                        </>
                      )}
                    </button>
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
