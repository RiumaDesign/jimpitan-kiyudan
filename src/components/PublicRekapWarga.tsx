import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, Search, Filter, Printer, RefreshCw 
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useApp } from '../context/AppContext';

export const PublicRekapWarga: React.FC = () => {
  const { 
    wargaList, pesertaList, currentPeriode, pengambilanList, 
    transaksiPengambilanList 
  } = useApp();

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState<number | 'semua'>('semua');
  const [selectedBulan, setSelectedBulan] = useState<number | 'semua'>('semua');
  const [displayMode, setDisplayMode] = useState<'akumulasi' | 'detail'>('akumulasi');
  const [isExporting, setIsExporting] = useState(false);

  const activePesertaIds = new Set(
    pesertaList
      .filter(p => p.periodeId === currentPeriode.id && p.status === 'aktif')
      .map(p => p.wargaId)
  );

  // Month list
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

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    return pengambilanList.filter(s => {
      if (s.periodeId !== currentPeriode.id) return false;
      if (selectedSessionId !== 'semua' && s.id !== selectedSessionId) return false;
      if (selectedBulan !== 'semua') {
        const sessionMonth = new Date(s.tanggalPengambilan).getMonth() + 1;
        if (sessionMonth !== Number(selectedBulan)) return false;
      }
      return true;
    });
  }, [pengambilanList, currentPeriode.id, selectedSessionId, selectedBulan]);

  const filteredSessionIds = useMemo(() => new Set(filteredSessions.map(s => s.id)), [filteredSessions]);

  // Aggregate calculation per Warga
  const rekapData = useMemo(() => {
    return wargaList
      .filter(w => activePesertaIds.has(w.id))
      .filter(w => 
        w.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.kodeWarga.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.noRumah.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map(w => {
        const citizenTxList = transaksiPengambilanList.filter(
          t => t.wargaId === w.id && filteredSessionIds.has(t.pengambilanId) && t.status === 'sudah_diambil'
        );

        const totalJimpitan = citizenTxList.reduce((sum, t) => sum + t.jimpitan, 0);
        const totalTabungan = citizenTxList.reduce((sum, t) => sum + t.tabungan, 0);
        const totalSetoran = totalJimpitan + totalTabungan;
        const totalHadir = citizenTxList.length;

        return {
          warga: w,
          totalHadir,
          totalJimpitan,
          totalTabungan,
          totalSetoran,
          txList: citizenTxList,
        };
      })
      .sort((a, b) => a.warga.id - b.warga.id);
  }, [wargaList, activePesertaIds, searchTerm, transaksiPengambilanList, filteredSessionIds]);

  // Summary totals
  const grandTotalJimpitan = rekapData.reduce((sum, r) => sum + r.totalJimpitan, 0);
  const grandTotalTabungan = rekapData.reduce((sum, r) => sum + r.totalTabungan, 0);
  const grandTotalSetoran = grandTotalJimpitan + grandTotalTabungan;

  // PDF Export Generator
  const handleExportPDF = () => {
    setIsExporting(true);
    setTimeout(() => {
      try {
        const doc = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4',
        });

        const nowStr = new Date().toLocaleDateString('id-ID', {
          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });

        let subtitleText = `Periode Pembukuan Tahun ${currentPeriode.tahun}`;
        if (selectedBulan !== 'semua') {
          const bulanName = bulans.find(b => b.value === Number(selectedBulan))?.label;
          subtitleText = `Bulan ${bulanName} ${currentPeriode.tahun}`;
        }
        if (selectedSessionId !== 'semua') {
          const sessionObj = pengambilanList.find(s => s.id === selectedSessionId);
          subtitleText = `Sesi #${sessionObj?.nomorPengambilan} (${sessionObj?.tanggalPengambilan})`;
        }

        // Kop Surat Header
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(16, 185, 129); // Emerald color
        doc.text('PEMUDA DUSUN KIYUDAN', 14, 15);

        doc.setFontSize(9);
        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text('Desa Majaksingi, Kecamatan Borobudur, Kabupaten Magelang, Jawa Tengah', 14, 20);
        doc.text('Sistem Informasi Keuangan, Jimpitan & Transparansi Dusun', 14, 24);

        doc.setLineWidth(0.5);
        doc.setDrawColor(203, 213, 225);
        doc.line(14, 27, 283, 27);

        // Judul Laporan
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(15, 23, 42);
        doc.text(`LAPORAN REKAPITULASI SETORAN JIMPITAN & TABUNGAN WARGA`, 14, 34);

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        doc.text(`Kriteria Laporan: ${subtitleText} | Diunduh Tanggal: ${nowStr}`, 14, 40);

        // Prepare table rows
        const tableBody = rekapData.map((item, index) => [
          index + 1,
          item.warga.kodeWarga,
          item.warga.nama,
          `${item.warga.alamat} (${item.warga.noRumah})`,
          `${item.totalHadir} Sesi`,
          `Rp ${item.totalJimpitan.toLocaleString('id-ID')}`,
          `Rp ${item.totalTabungan.toLocaleString('id-ID')}`,
          `Rp ${item.totalSetoran.toLocaleString('id-ID')}`,
        ]);

        // Add summary footer row
        tableBody.push([
          '',
          '',
          'GRAND TOTAL KESELURUHAN',
          '',
          `${rekapData.reduce((sum, r) => sum + r.totalHadir, 0)} Sesi`,
          `Rp ${grandTotalJimpitan.toLocaleString('id-ID')}`,
          `Rp ${grandTotalTabungan.toLocaleString('id-ID')}`,
          `Rp ${grandTotalSetoran.toLocaleString('id-ID')}`,
        ]);

        autoTable(doc, {
          startY: 45,
          head: [['No', 'Kode', 'Nama Warga', 'Alamat & Rumah', 'Pengambilan', 'Total Jimpitan', 'Total Tabungan', 'Grand Total Setoran']],
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
            1: { cellWidth: 22, fontStyle: 'bold' },
            2: { cellWidth: 45, fontStyle: 'bold' },
            3: { cellWidth: 55 },
            4: { cellWidth: 25, halign: 'center' },
            5: { cellWidth: 35, halign: 'right' },
            6: { cellWidth: 35, halign: 'right' },
            7: { cellWidth: 40, halign: 'right', fontStyle: 'bold' },
          },
          didParseCell: (data) => {
            // Style footer row
            if (data.row.index === tableBody.length - 1) {
              data.cell.styles.fontStyle = 'bold';
              data.cell.styles.fillColor = [226, 232, 240];
              data.cell.styles.textColor = [15, 23, 42];
            }
          },
        });

        // Signatures Block
        const finalY = (doc as any).lastAutoTable.finalY + 15;

        if (finalY < 170) {
          doc.setFontSize(9);
          doc.setTextColor(15, 23, 42);

          const col1 = 30;
          const col2 = 130;
          const col3 = 230;

          doc.text('Ketua Pemuda Kiyudan,', col1, finalY);
          doc.text('Petugas Lapangan,', col2, finalY);
          doc.text('Bendahara Dusun,', col3, finalY);

          doc.setFont('Helvetica', 'bold');
          doc.text('Slamet Rahardjo', col1, finalY + 18);
          doc.text('Danang Prasetyo', col2, finalY + 18);
          doc.text('Budi Santoso', col3, finalY + 18);

          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139);
          doc.text('Penanggung Jawab', col1, finalY + 22);
          doc.text('Tim Keliling Lapangan', col2, finalY + 22);
          doc.text('Pengelola Keuangan', col3, finalY + 22);
        }

        doc.save(`Rekap_Setoran_Warga_Kiyudan_${currentPeriode.tahun}.pdf`);
      } catch (err) {
        console.error(err);
      } finally {
        setIsExporting(false);
      }
    }, 300);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Tabel & Laporan Rekapitulasi Warga</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white font-heading">
            Rekap Setoran Jimpitan & Tabungan Warga
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Filter multi-dimensi per nama warga, minggu/sesi, bulan, hingga akumulasi 1 tahun penuh (Periode {currentPeriode.tahun}).
          </p>
        </div>

        {/* Action Export Button */}
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-gray-950 shadow-xl shadow-emerald-500/20 transition-all flex items-center space-x-2 shrink-0 disabled:opacity-50"
        >
          {isExporting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Memproses PDF...</span>
            </>
          ) : (
            <>
              <Printer className="w-4 h-4" />
              <span>Cetak & Export PDF Resmi</span>
            </>
          )}
        </button>
      </div>

      {/* FILTER CONTROL PANEL BAR */}
      <div className="glass-panel p-5 rounded-3xl border border-gray-800 space-y-4">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase text-emerald-400">
          <Filter className="w-4 h-4" />
          <span>Panel Filter Multi-Kriteria</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari Nama / Kode KDY / No Rumah..."
              className="w-full glass-input pl-10 pr-3 py-2 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Jadwal Kelompok Dropdown */}
          <div>
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value === 'semua' ? 'semua' : Number(e.target.value))}
              className="w-full glass-input px-3.5 py-2 rounded-xl text-xs font-semibold"
            >
              <option value="semua" className="bg-gray-900 text-white">Semua Jadwal Tugas ({pengambilanList.length} Jadwal)</option>
              {pengambilanList.map(s => (
                <option key={s.id} value={s.id} className="bg-gray-900 text-white">
                  📅 {s.tanggalPengambilan} — {s.petugasLapangan || 'Kelompok SATU'}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Bulan Dropdown */}
          <div>
            <select
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(e.target.value === 'semua' ? 'semua' : Number(e.target.value))}
              className="w-full glass-input px-3.5 py-2 rounded-xl text-xs font-semibold"
            >
              <option value="semua" className="bg-gray-900 text-white">Semua Bulan / Akumulasi 1 Tahun</option>
              {bulans.map(b => (
                <option key={b.value} value={b.value} className="bg-gray-900 text-white">
                  Bulan {b.label}
                </option>
              ))}
            </select>
          </div>

          {/* Mode Tampilan Switcher */}
          <div className="flex items-center space-x-1 p-1 rounded-xl bg-gray-900/80 border border-gray-800">
            <button
              onClick={() => setDisplayMode('akumulasi')}
              className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                displayMode === 'akumulasi' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Akumulasi Warga
            </button>
            <button
              onClick={() => setDisplayMode('detail')}
              className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                displayMode === 'detail' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Detail Rincian
            </button>
          </div>
        </div>
      </div>

      {/* METRIC SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-gray-800">
          <p className="text-[10px] font-bold uppercase text-gray-400">Total Warga Tampil</p>
          <p className="text-xl font-black text-white font-heading mt-1">{rekapData.length} Warga</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5">
          <p className="text-[10px] font-bold uppercase text-amber-400">Total Jimpitan (Rp3k)</p>
          <p className="text-xl font-black text-amber-400 font-heading mt-1">Rp {grandTotalJimpitan.toLocaleString('id-ID')}</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-blue-500/30 bg-blue-500/5">
          <p className="text-[10px] font-bold uppercase text-blue-400">Total Tabungan</p>
          <p className="text-xl font-black text-blue-400 font-heading mt-1">Rp {grandTotalTabungan.toLocaleString('id-ID')}</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5">
          <p className="text-[10px] font-bold uppercase text-emerald-400">Grand Total Setoran</p>
          <p className="text-xl font-black text-emerald-400 font-heading mt-1">Rp {grandTotalSetoran.toLocaleString('id-ID')}</p>
        </div>
      </div>

      {/* DATA TABLE REKAP */}
      <div className="glass-panel rounded-3xl border border-gray-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-900/90 text-gray-400 uppercase font-semibold border-b border-gray-800">
              <tr>
                <th className="p-4">Kode Warga</th>
                <th className="p-4">Nama Warga</th>
                <th className="p-4">Alamat & Rumah</th>
                <th className="p-4 text-center">Frekuensi Sesi</th>
                <th className="p-4 text-right">Total Jimpitan</th>
                <th className="p-4 text-right">Total Tabungan</th>
                <th className="p-4 text-right">Total Setoran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-gray-300">
              {rekapData.map((item) => (
                <tr key={item.warga.id} className="hover:bg-gray-800/40 transition-colors">
                  <td className="p-4 font-extrabold text-amber-400">{item.warga.kodeWarga}</td>
                  <td className="p-4 font-bold text-white text-sm">{item.warga.nama}</td>
                  <td className="p-4 text-gray-400">{item.warga.alamat} ({item.warga.noRumah})</td>
                  <td className="p-4 text-center font-bold text-gray-300">
                    <span className="px-2.5 py-1 rounded-full bg-gray-900 border border-gray-800 text-[11px]">
                      {item.totalHadir} Sesi
                    </span>
                  </td>
                  <td className="p-4 text-right font-extrabold text-amber-400">
                    Rp {item.totalJimpitan.toLocaleString('id-ID')}
                  </td>
                  <td className="p-4 text-right font-extrabold text-blue-400">
                    Rp {item.totalTabungan.toLocaleString('id-ID')}
                  </td>
                  <td className="p-4 text-right font-black text-emerald-400 text-sm font-heading">
                    Rp {item.totalSetoran.toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
            
            {/* Grand Total Footer Row */}
            <tfoot className="bg-gray-900/95 border-t-2 border-gray-700 text-white font-heading font-extrabold text-xs">
              <tr>
                <td colSpan={3} className="p-4 text-right uppercase tracking-wider text-emerald-400">
                  GRAND TOTAL REKAPITULASI:
                </td>
                <td className="p-4 text-center text-white">
                  {rekapData.reduce((sum, r) => sum + r.totalHadir, 0)} Sesi
                </td>
                <td className="p-4 text-right text-amber-400 font-heading text-sm">
                  Rp {grandTotalJimpitan.toLocaleString('id-ID')}
                </td>
                <td className="p-4 text-right text-blue-400 font-heading text-sm">
                  Rp {grandTotalTabungan.toLocaleString('id-ID')}
                </td>
                <td className="p-4 text-right text-emerald-400 font-heading text-base">
                  Rp {grandTotalSetoran.toLocaleString('id-ID')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  );
};
