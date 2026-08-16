import React from 'react';
import { Calendar, Shield, Clock, CheckCircle2 } from 'lucide-react';

export const PublicJadwalKelompok: React.FC = () => {
  const kelompokData = [
    {
      id: 1,
      nama: 'Kelompok SATU',
      warna: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      jadwal: 'Sabtu Malam (Minggu Ke-1 Bulan)',
      anggota: [
        { nama: 'Armi', role: 'Koordinator Regu' },
        { nama: 'Apep', role: 'Anggota Regu' },
        { nama: 'Fadel', role: 'Anggota Regu' },
        { nama: 'Khabib', role: 'Anggota Regu' },
        { nama: 'Uzik', role: 'Anggota Regu' },
        { nama: 'Ihsan', role: 'Anggota Regu' },
      ]
    },
    {
      id: 2,
      nama: 'Kelompok DUA',
      warna: 'border-blue-500/40 bg-blue-500/10 text-blue-400',
      badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      jadwal: 'Sabtu Malam (Minggu Ke-2 Bulan)',
      anggota: [
        { nama: 'Iwan', role: 'Koordinator Regu' },
        { nama: 'Humam', role: 'Ketua Pemuda' },
        { nama: 'Kusnadi', role: 'Anggota Regu' },
        { nama: 'Feri', role: 'Anggota Regu' },
        { nama: 'Pi\'i', role: 'Anggota Regu' },
        { nama: 'Harno', role: 'Anggota Regu' },
      ]
    },
    {
      id: 3,
      nama: 'Kelompok TIGA',
      warna: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      jadwal: 'Sabtu Malam (Minggu Ke-3 Bulan)',
      anggota: [
        { nama: 'Zazed', role: 'Koordinator Regu' },
        { nama: 'Alfin', role: 'Anggota Regu' },
        { nama: 'Udin', role: 'Anggota Regu' },
        { nama: 'Syahrul', role: 'Anggota Regu' },
        { nama: 'Syarif', role: 'Bendahara Dusun' },
      ]
    },
    {
      id: 4,
      nama: 'Kelompok EMPAT',
      warna: 'border-purple-500/40 bg-purple-500/10 text-purple-400',
      badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      jadwal: 'Sabtu Malam (Minggu Ke-4 Bulan)',
      anggota: [
        { nama: 'Dwik', role: 'Koordinator Regu' },
        { nama: 'Khoir', role: 'Anggota Regu' },
        { nama: 'Doko', role: 'Anggota Regu' },
        { nama: 'Riski', role: 'Anggota Regu' },
        { nama: 'Rudi', role: 'Anggota Regu' },
        { nama: 'Andri', role: 'Anggota Regu' },
      ]
    }
  ];

  const penasehatList = [
    'P. Joko',
    'P. Jono',
    'P. Pawit',
    'P. Muhsin'
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-16 max-w-6xl mx-auto">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800 bg-gradient-to-r from-emerald-500/10 via-gray-900 to-blue-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5" />
            <span>Jadwal & Regu Petugas Keliling Dusun Kiyudan</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white font-heading tracking-tight">
            Kelompok Jimpitan Kiyudan
          </h2>

          <p className="text-xs sm:text-sm text-gray-300">
            Pencatatan jimpitan Rp3.000 & tabungan warga dilaksanakan rutin per regu kelompok.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium space-y-1 shrink-0 max-w-xs">
          <div className="flex items-center space-x-1.5 font-bold text-amber-400">
            <Clock className="w-4 h-4" />
            <span>WAKTU PELAKSANAAN:</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            *Tiap <b>malam Minggu (Sabtu malam)</b> atau <b>malam Senin</b> jika Hujan / Berhalangan.*
          </p>
        </div>
      </div>

      {/* 4 Group Roster Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {kelompokData.map(group => (
          <div
            key={group.id}
            className={`glass-panel p-6 rounded-3xl border ${group.warna} space-y-4 shadow-xl transition-all hover:scale-[1.01]`}
          >
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg border ${group.badge}`}>
                  #{group.id}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white font-heading">{group.nama}</h3>
                  <p className="text-[11px] text-gray-400">{group.jadwal}</p>
                </div>
              </div>

              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${group.badge}`}>
                {group.anggota.length} Personil
              </span>
            </div>

            {/* Member list */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {group.anggota.map((member, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center justify-between hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-white text-xs">{member.nama}</span>
                  </div>
                  {idx === 0 && (
                    <span className="text-[9px] font-extrabold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                      Koordinator
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Advisory Council (Penasehat Dusun) */}
      <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-heading">
              Penasehat Dusun & Pemuda Kiyudan
            </h3>
            <p className="text-xs text-gray-400">
              Tokoh & Pengayom Kegiatan Jimpitan Dusun Kiyudan
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {penasehatList.map((p, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-gray-900/80 border border-gray-800 flex items-center space-x-3 hover:border-purple-500/40 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <span className="font-bold text-white text-xs block">{p}</span>
                <span className="text-[10px] text-gray-400">Penasehat Official</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Note */}
      <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800 text-center text-xs text-gray-400 space-y-1">
        <p className="font-medium text-gray-300">
          *&quot;Ada kurang lebihnya mohon dikoreksi. Maturnuwun.&quot;* — Pemuda Dusun Kiyudan
        </p>
        <p className="text-[11px] text-emerald-400 font-semibold">
          Kiyudan RT 01 / RW 04, Desa Majaksingi • GUYUB RUKUN MAJU BERSAMA
        </p>
      </div>

    </div>
  );
};
