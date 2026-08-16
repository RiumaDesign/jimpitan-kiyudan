import React, { useState } from 'react';
import { 
  UserCheck, Landmark, Coins, Wallet, ShieldCheck, 
  PlusCircle, ArrowRight, LayoutDashboard, Database, Download, Upload, CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AdminDashboardProps {
  setActiveTab: (tab: string) => void;
  openReconcileModal: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ setActiveTab, openReconcileModal }) => {
  const { 
    currentUser, currentPeriode, getSaldoKasPemuda, 
    getSaldoKasDusun, getTotalTabunganDusun, pengambilanList, transaksiPengambilanList, auditLogs,
    exportDatabaseBackup, importDatabaseBackup
  } = useApp();

  const [importStatus, setImportStatus] = useState<string | null>(null);

  const saldoPemuda = getSaldoKasPemuda();
  const saldoDusun = getSaldoKasDusun();
  const totalTabungan = getTotalTabunganDusun();

  const activeSession = pengambilanList.find(p => p.status === 'berjalan') || pengambilanList[pengambilanList.length - 1];
  const activeSessionTx = activeSession 
    ? (transaksiPengambilanList || []).filter(t => t.pengambilanId === activeSession.id && t.status === 'sudah_diambil')
    : [];
  const activeSessionCountSudah = activeSessionTx.length > 0 ? activeSessionTx.length : (activeSession?.totalSudahDiambil || 0);

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ok = importDatabaseBackup(content);
      if (ok) {
        setImportStatus('Database berhasil dipulihkan & disimpan permanen!');
        setTimeout(() => setImportStatus(null), 3500);
      } else {
        setImportStatus('Gagal memulihkan database. Pastikan format file JSON valid.');
        setTimeout(() => setImportStatus(null), 3500);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-16">
      
      {/* Admin Welcome Hero */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800 bg-gradient-to-r from-emerald-500/10 via-gray-900 to-blue-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Dashboard Administrator & Pengurus Dusun</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white font-heading tracking-tight">
            Selamat Datang, {currentUser?.name || 'Pengurus'}
          </h2>

          <p className="text-xs sm:text-sm text-gray-400">
            Periode Pembukuan Aktif: <b className="text-emerald-400 font-semibold">{currentPeriode.namaPeriode} ({currentPeriode.tahun})</b>
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('admin-entry')}
            className="px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-emerald-500 to-teal-400 text-gray-950 shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-300 transition-all flex items-center space-x-2"
          >
            <UserCheck className="w-4 h-4" />
            <span>📱 Mobile Entry Sesi</span>
          </button>

          <button
            onClick={openReconcileModal}
            className="px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm bg-amber-500 text-gray-950 hover:bg-amber-400 shadow-lg shadow-amber-500/20 transition-all flex items-center space-x-2"
          >
            <Coins className="w-4 h-4" />
            <span>⚖️ Rekonsiliasi & Sahkan</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-panel p-5 rounded-2xl border border-blue-500/20 glow-blue">
          <div className="flex items-center justify-between text-xs text-blue-400 font-bold uppercase">
            <span>Kas Pemuda</span>
            <Landmark className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-white font-heading mt-2">
            Rp {saldoPemuda.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Ready for Youth Projects</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 glow-emerald">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-bold uppercase">
            <span>Kas Dusun</span>
            <Coins className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-white font-heading mt-2">
            Rp {saldoDusun.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Ready for Village Repair</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-amber-500/20 glow-gold">
          <div className="flex items-center justify-between text-xs text-amber-400 font-bold uppercase">
            <span>Tabungan Warga</span>
            <Wallet className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-white font-heading mt-2">
            Rp {totalTabungan.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Dikelola Terpisah</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-purple-500/20 glow-purple">
          <div className="flex items-center justify-between text-xs text-purple-400 font-bold uppercase">
            <span>Sesi #{activeSession?.nomorPengambilan}</span>
            <UserCheck className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-white font-heading mt-2">
            {activeSessionCountSudah} / {activeSession?.totalWarga || 40} Warga
          </p>
          <p className="text-[11px] text-amber-400 font-semibold capitalize mt-1">Status: {activeSession?.status.replace('_', ' ')}</p>
        </div>

      </div>

      {/* Realtime Database & Backup Storage Control Card */}
      <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-gray-900 to-blue-950/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-heading">
                💾 Penyimpanan Permanent & Backup Database Realtime
              </h3>
              <p className="text-xs text-gray-300">
                Seluruh data yang Anda input otomatis tersimpan permanen di LocalStorage browser. Anda juga bisa backup/restore database file JSON kapan saja.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={exportDatabaseBackup}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center space-x-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor Backup JSON</span>
            </button>

            <label className="px-4 py-2.5 rounded-xl font-bold text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-all flex items-center space-x-1.5 cursor-pointer">
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Impor Backup JSON</span>
              <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
            </label>
          </div>
        </div>

        {importStatus && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{importStatus}</span>
          </div>
        )}
      </div>

      {/* Admin Quick Action Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white font-heading flex items-center space-x-2">
          <LayoutDashboard className="w-5 h-5 text-emerald-400" />
          <span>Pusat Kendali Pengurus & Bendahara</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <div 
            onClick={() => setActiveTab('admin-entry')}
            className="glass-card p-5 rounded-2xl border border-gray-800 hover:border-emerald-500/40 transition-all cursor-pointer space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">📱 Mobile Entry Pengambilan HP</h4>
            <p className="text-xs text-gray-400">Antarmuka cepat petugas keliling Sabtu malam mencatat Rp3.000 + tabungan.</p>
            <div className="pt-2 text-xs font-bold text-emerald-400 flex items-center space-x-1">
              <span>Buka Mobile Entry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div 
            onClick={openReconcileModal}
            className="glass-card p-5 rounded-2xl border border-gray-800 hover:border-amber-500/40 transition-all cursor-pointer space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Coins className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">⚖️ Rekonsiliasi & Sahkan Sesi</h4>
            <p className="text-xs text-gray-400">Input uang fisik, cek selisih, dan auto-split 50:50 Jimpitan ke Kas Pemuda/Dusun.</p>
            <div className="pt-2 text-xs font-bold text-amber-400 flex items-center space-x-1">
              <span>Buka Rekonsiliasi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div 
            onClick={() => setActiveTab('admin-keuangan')}
            className="glass-card p-5 rounded-2xl border border-gray-800 hover:border-blue-500/40 transition-all cursor-pointer space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <PlusCircle className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">💰 Input Transaksi Kas & Nota</h4>
            <p className="text-xs text-gray-400">Catat pemasukan donasi/sponsor & pengeluaran kas dengan bukti foto nota.</p>
            <div className="pt-2 text-xs font-bold text-blue-400 flex items-center space-x-1">
              <span>Kelola Transaksi Kas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div 
            onClick={() => setActiveTab('admin-warga')}
            className="glass-card p-5 rounded-2xl border border-gray-800 hover:border-purple-500/40 transition-all cursor-pointer space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors">👤 Master Data Warga & Peserta</h4>
            <p className="text-xs text-gray-400">Tambah warga baru, auto code KDY-xxx, dan atur peserta aktif per periode.</p>
            <div className="pt-2 text-xs font-bold text-purple-400 flex items-center space-x-1">
              <span>Kelola Warga</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div 
            onClick={() => setActiveTab('admin-pembukuan')}
            className="glass-card p-5 rounded-2xl border border-gray-800 hover:border-emerald-500/40 transition-all cursor-pointer space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">🛡️ Wizard Pembukuan Tahun Baru</h4>
            <p className="text-xs text-gray-400">Tutup pembukuan tahun aktif & carry-over saldo akhir sebagai saldo awal tahun baru.</p>
            <div className="pt-2 text-xs font-bold text-emerald-400 flex items-center space-x-1">
              <span>Buka Wizard Rollover</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>
      </div>

      {/* Audit Log Recent Feed */}
      <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white font-heading">Audit Trail Aktivitas Terakhir</h3>
          <button onClick={() => setActiveTab('admin-audit')} className="text-xs font-semibold text-emerald-400 hover:underline">
            Lihat Semua Audit Log
          </button>
        </div>

        <div className="space-y-2">
          {auditLogs.slice(0, 3).map(log => (
            <div key={log.id} className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-white">{log.detail}</span>
                <span className="text-gray-400 text-[11px] block">Oleh: {log.username} ({log.modul})</span>
              </div>
              <span className="text-gray-500 text-[10px]">{log.timestamp}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
