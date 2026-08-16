import React from 'react';
import { 
  Coins, Wallet, Landmark, Search, ArrowUpRight, 
  ChevronRight, Sparkles, Megaphone, Clock, ShieldCheck, Calendar, Users 
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useApp } from '../context/AppContext';

interface PublicHomeProps {
  setActiveTab: (tab: string) => void;
  openSavingsModal: () => void;
}

export const PublicHome: React.FC<PublicHomeProps> = ({ setActiveTab, openSavingsModal }) => {
  const { 
    getSaldoKasPemuda, getSaldoKasDusun, getTotalTabunganDusun, 
    pengambilanList, pengumumanList, currentPeriode 
  } = useApp();

  const saldoPemuda = getSaldoKasPemuda();
  const saldoDusun = getSaldoKasDusun();
  const totalTabungan = getTotalTabunganDusun();
  const latestSession = pengambilanList[pengambilanList.length - 1];

  const chartData = [
    { bulan: 'Jan', kasPemuda: 16.0, kasDusun: 21.0 },
    { bulan: 'Feb', kasPemuda: 16.5, kasDusun: 21.8 },
    { bulan: 'Mar', kasPemuda: 17.2, kasDusun: 22.5 },
    { bulan: 'Apr', kasPemuda: 17.8, kasDusun: 23.4 },
    { bulan: 'Mei', kasPemuda: 18.5, kasDusun: 24.2 },
    { bulan: 'Jun', kasPemuda: 19.3, kasDusun: 25.8 },
    { bulan: 'Jul', kasPemuda: 20.1, kasDusun: 27.5 },
    { bulan: 'Agt', kasPemuda: saldoPemuda / 1000000, kasDusun: saldoDusun / 1000000 },
  ];

  return (
    <div className="space-y-8 sm:space-y-12 pb-12 animate-fadeIn">
      
      {/* HERO SECTION WITH OFFICIAL LOGO EMBLEM */}
      <section className="relative rounded-3xl p-6 sm:p-10 overflow-hidden glass-panel border border-gray-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="max-w-2xl space-y-4 text-center md:text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sistem Keuangan & Transparansi Dusun Kiyudan</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white font-heading tracking-tight leading-tight">
              Guyub Rukun, <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                Maju Bersama Kiyudan
              </span>
            </h1>

            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              Platform pencatatan jimpitan Rp3.000 malam Minggu, tabungan mandiri warga, Kas Pemuda, dan Kas Dusun Kiyudan — RT 01 / RW 04 Desa Majaksingi, Borobudur, Magelang.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button
                onClick={openSavingsModal}
                className="px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-gray-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/25 transition-all flex items-center space-x-2.5"
              >
                <Wallet className="w-4 h-4" />
                <span>Cek Saldo Tabungan Saya</span>
              </button>

              <button
                onClick={() => setActiveTab('keuangan')}
                className="px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-gray-200 glass-card hover:bg-gray-800 border border-gray-700 transition-all flex items-center space-x-2"
              >
                <Landmark className="w-4 h-4 text-emerald-400" />
                <span>Lihat Transparansi Kas</span>
              </button>
            </div>
          </div>

          {/* Official Emblem Logo Badge */}
          <div className="shrink-0 flex flex-col items-center">
            <div className="w-44 h-44 sm:w-56 sm:h-56 rounded-3xl bg-white p-2.5 shadow-2xl shadow-emerald-500/20 border-4 border-emerald-500/40 transform hover:scale-105 transition-transform duration-300 relative group">
              <img 
                src="/logo.png" 
                alt="Lambang Resmi Dusun Kiyudan" 
                className="w-full h-full object-contain rounded-2xl"
              />
            </div>
            <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest mt-3">
              Lambang Resmi Dusun Kiyudan
            </p>
          </div>

        </div>
      </section>

      {/* TOP STATS METRICS GRID */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Card 1: Kas Pemuda */}
        <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-blue-500/20 glow-blue relative group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Kas Pemuda</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
              <Landmark className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white font-heading mt-3">
            Rp {saldoPemuda.toLocaleString('id-ID')}
          </p>
          <div className="mt-2 flex items-center text-xs text-emerald-400 space-x-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Aktif • Periode {currentPeriode.tahun}</span>
          </div>
        </div>

        {/* Card 2: Kas Dusun */}
        <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-emerald-500/20 glow-emerald relative group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Kas Dusun</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Coins className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white font-heading mt-3">
            Rp {saldoDusun.toLocaleString('id-ID')}
          </p>
          <div className="mt-2 flex items-center text-xs text-emerald-400 space-x-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Otomatis 50% Jimpitan</span>
          </div>
        </div>

        {/* Card 3: Tabungan Warga */}
        <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-amber-500/20 glow-gold relative group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Total Tabungan Warga</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white font-heading mt-3">
            Rp {totalTabungan.toLocaleString('id-ID')}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-gray-400">80 Warga Terdaftar</span>
            <button onClick={openSavingsModal} className="text-amber-400 font-semibold hover:underline">
              Cek Pribadi &rarr;
            </button>
          </div>
        </div>

        {/* Card 4: Audit & Akuntabilitas */}
        <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-purple-500/20 glow-purple relative group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Akuntabilitas</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white font-heading mt-3">
            100% Audit Log
          </p>
          <div className="mt-2 flex items-center text-xs text-purple-300 space-x-1">
            <span>Transaksi Terverifikasi</span>
          </div>
        </div>
      </section>

      {/* QUICK SAVINGS LOOKUP BANNER */}
      <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-gray-900/90 to-emerald-500/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="text-xl sm:text-2xl font-bold text-white font-heading">
            Ingin mengecek saldo tabungan pribadi Anda?
          </h3>
          <p className="text-xs sm:text-sm text-gray-300">
            Cukup gunakan kombinasi Nama Warga dan Kode Warga (contoh: KDY-001) tanpa perlu membuat akun.
          </p>
        </div>

        <button
          onClick={openSavingsModal}
          className="px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm bg-amber-500 text-gray-950 hover:bg-amber-400 shadow-xl shadow-amber-500/20 transition-all flex items-center space-x-2 shrink-0"
        >
          <Search className="w-4 h-4" />
          <span>Buka Pencarian Tabungan</span>
        </button>
      </section>

      {/* JADWAL & KELOMPOK BANNER CARD */}
      <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-gray-900 to-blue-950/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                4 KELOMPOK REGU KELILING
              </span>
              <span className="text-xs text-gray-400">Sabtu / Senin Malam</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white font-heading mt-1">
              Jadwal & Regu Petugas Kelompok Jimpitan
            </h3>
            <p className="text-xs text-gray-300 mt-0.5">
              Cek daftar personil Kelompok SATU, DUA, TIGA, EMPAT & Penasehat Dusun Kiyudan.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('jadwal-kelompok')}
          className="px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-600/30 transition-all flex items-center space-x-2 shrink-0"
        >
          <Users className="w-4 h-4" />
          <span>Lihat Jadwal Lengkap &rarr;</span>
        </button>
      </section>

      {/* CHART & LATEST SESSION GRID */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Financial Line Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white font-heading">Grafik Pertumbuhan Kas Dusun Kiyudan</h3>
              <p className="text-xs text-gray-400">Pertumbuhan saldo Kas Pemuda & Kas Dusun tahun {currentPeriode.tahun} (Juta Rupiah)</p>
            </div>
            <button onClick={() => setActiveTab('laporan')} className="text-xs font-semibold text-emerald-400 hover:underline flex items-center space-x-1">
              <span>Detail Laporan</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPemuda" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDusun" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis dataKey="bulan" stroke="#6b7280" tick={{ fontSize: 12 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px' }}
                  formatter={(value: any) => [`Rp ${(Number(value) || 0).toFixed(1)} Juta`, '']}
                />
                <Area type="monotone" dataKey="kasPemuda" name="Kas Pemuda" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPemuda)" />
                <Area type="monotone" dataKey="kasDusun" name="Kas Dusun" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDusun)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Latest Session Card */}
        <div className="glass-panel p-6 rounded-3xl border border-gray-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                PENGAMBILAN TERBARU
              </span>
              <span className="text-xs text-gray-400 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{latestSession?.tanggalPengambilan}</span>
              </span>
            </div>

            <h3 className="text-xl font-bold text-white font-heading">
              Sesi #{latestSession?.nomorPengambilan} (Sabtu Malam)
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Status Sesi: <span className="text-amber-400 capitalize font-semibold">{latestSession?.status.replace('_', ' ')}</span>
            </p>

            <div className="mt-5 space-y-3">
              <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-gray-900/60 border border-gray-800">
                <span className="text-gray-400">Total Terdaftar</span>
                <span className="font-bold text-white">{latestSession?.totalWarga} Warga</span>
              </div>
              <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-gray-900/60 border border-gray-800">
                <span className="text-gray-400">Sudah Diambil</span>
                <span className="font-bold text-emerald-400">{latestSession?.totalSudahDiambil} Warga ({Math.round((latestSession?.totalSudahDiambil || 0) / (latestSession?.totalWarga || 1) * 100)}%)</span>
              </div>
              <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-gray-900/60 border border-gray-800">
                <span className="text-gray-400">Total Jimpitan (Rp3k)</span>
                <span className="font-bold text-amber-400">Rp {latestSession?.totalJimpitan.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-gray-900/60 border border-gray-800">
                <span className="text-gray-400">Total Tabungan Sesi</span>
                <span className="font-bold text-blue-400">Rp {latestSession?.totalTabungan.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('jimpitan')}
            className="w-full py-3 rounded-xl text-xs font-bold text-center bg-gray-800 hover:bg-gray-700 text-gray-200 transition-colors border border-gray-700"
          >
            Lihat Rekap Seluruh Sesi
          </button>
        </div>

      </section>

      {/* ANNOUNCEMENTS & AGENDA */}
      <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800 space-y-4">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-heading">Pengumuman & Agenda Dusun Kiyudan</h3>
            <p className="text-xs text-gray-400">Informasi terbaru untuk seluruh warga masyarakat</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pengumumanList.map((p) => (
            <div key={p.id} className="glass-card p-4 rounded-2xl border border-gray-800 hover:border-gray-700 transition-all space-y-2">
              <div className="flex items-center justify-between text-xs text-amber-400 font-semibold">
                <span>PENGUMUMAN RESMI</span>
                <span className="text-gray-500">{p.tanggalPublish}</span>
              </div>
              <h4 className="text-sm font-bold text-white">{p.judul}</h4>
              <p className="text-xs text-gray-400 leading-relaxed">{p.isi}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
