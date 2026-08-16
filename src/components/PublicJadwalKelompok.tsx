import React from 'react';
import { Calendar, Shield, Clock, CheckCircle2, CloudRain, Sparkles, Scale } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PublicJadwalKelompok: React.FC = () => {
  const { kelompokList, penasehatList } = useApp();

  const colorStyles: Record<number, { border: string; bg: string; badge: string }> = {
    1: { border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
    2: { border: 'border-blue-500/40', bg: 'bg-blue-500/10', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
    3: { border: 'border-amber-500/40', bg: 'bg-amber-500/10', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    4: { border: 'border-purple-500/40', bg: 'bg-purple-500/10', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  };

  const aturanSistem = [
    { no: 1, judul: 'Jadwal Rutin Malam Minggu', desc: 'Jimpitan dilaksanakan setiap malam Minggu (Sabtu malam) oleh 4 kelompok bergiliran.' },
    { no: 2, judul: 'Penanganan Hujan / Berhalangan', desc: 'Jika terjadi hujan deras atau berhalangan, pengambilan dapat dialihkan ke malam Senin (bukan 2x seminggu).' },
    { no: 3, judul: 'Rotasi Kelompok Tidak Berubah', desc: 'Penundaan jadwal ke malam Senin tidak mengubah urutan giliran kelompok berikutnya.' },
    { no: 4, judul: 'Siklus Berputar Berkesinambungan', desc: 'Urutan giliran: SATU ➔ DUA ➔ TIGA ➔ EMPAT ➔ kembali ke SATU, dst.' },
    { no: 5, judul: 'Satu Kelompok Penanggung Jawab', desc: 'Setiap tanggal pengambilan memiliki 1 kelompok yang bertanggung jawab atas penarikan & pencatatan.' },
    { no: 6, judul: 'Pencatatan Mandiri Per Tanggal', desc: 'Data warga per tanggal dicatat secara mandiri dan transaksi lama tidak pernah saling menimpa.' },
    { no: 7, judul: 'Pembagian Jimpitan 50 : 50', desc: 'Total uang jimpitan dibagi rata: 50% Kas Pemuda & 50% Kas Dusun Kiyudan.' },
    { no: 8, judul: 'Tabungan Warga 100% Utuh', desc: 'Tabungan warga 100% menjadi hak saldo warga dan tidak dimasukkan ke kas pemuda/dusun.' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn pb-16 max-w-6xl mx-auto">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800 bg-gradient-to-r from-emerald-500/10 via-gray-900 to-blue-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5" />
            <span>RANCANGAN DATA KELOMPOK JIMPITAN KIYUDAN — RESMI</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white font-heading tracking-tight">
            Struktur 4 Kelompok & Jadwal Rotasi
          </h2>

          <p className="text-xs sm:text-sm text-gray-300">
            Total 23 personil aktif dalam 4 kelompok bergiliran & 4 tokoh Penasehat Dusun Kiyudan.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium space-y-1 shrink-0 max-w-xs">
          <div className="flex items-center space-x-1.5 font-bold text-amber-400">
            <Clock className="w-4 h-4" />
            <span>KETENTUAN HARI PENGAMBILAN:</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            *Tiap <b>malam Minggu (Sabtu malam)</b> atau <b>malam Senin</b> jika Hujan / Berhalangan.*
          </p>
        </div>
      </div>

      {/* Advisory Council (Penasehat Dusun) - Separated Structure */}
      <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 bg-purple-950/10 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white font-heading">
                PENASEHAT DUSUN KIYUDAN
              </h3>
              <p className="text-xs text-gray-400">
                Struktur pengayom & penasehat (terpisah di luar anggota kelompok lapangan)
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/40">
            4 Tokoh Dusun
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {penasehatList.map((p) => (
            <div
              key={p.id}
              className="p-4 rounded-2xl bg-gray-900/90 border border-purple-500/20 flex items-center space-x-3 hover:border-purple-500/50 transition-all shadow-md"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 font-bold text-xs flex items-center justify-center border border-purple-500/30">
                P
              </div>
              <div>
                <span className="font-black text-white text-sm block">{p.nama}</span>
                <span className="text-[10px] text-purple-400 font-semibold">{p.jabatan}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4 Group Roster Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>4 KELOMPOK JIMPITAN AKTIF (SISTEM GILIRAN)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {kelompokList.map(group => {
            const style = colorStyles[group.id] || colorStyles[1];
            return (
              <div
                key={group.id}
                className={`glass-panel p-6 rounded-3xl border ${style.border} ${style.bg} space-y-4 shadow-xl transition-all hover:scale-[1.01]`}
              >
                <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-lg border ${style.badge}`}>
                      #{group.urutan}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white font-heading">{group.namaKelompok}</h3>
                      <p className="text-[11px] text-gray-400">Kode: <b className="text-gray-300">{group.kodeKelompok}</b> • {group.jumlahAnggota} Anggota</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${style.badge}`}>
                    {group.jumlahAnggota} Personil
                  </span>
                </div>

                {/* Member list */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {group.anggota.map((nama, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-gray-900/80 border border-gray-800 flex items-center justify-between hover:border-gray-700 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-white text-xs">{nama}</span>
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
            );
          })}
        </div>
      </div>

      {/* Realization & Weather Contingency (Jika Hujan) */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-blue-500/30 bg-gradient-to-r from-blue-950/30 via-gray-900 to-indigo-950/30 space-y-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <CloudRain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white font-heading">
              Penanganan Kondisi Hujan / Berhalangan
            </h3>
            <p className="text-xs text-gray-400">
              Mekanisme pengalihan jadwal tanpa mengacaukan rotasi mingguan
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-2">
            <span className="font-bold text-emerald-400 flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Jadwal Normal:</span>
            </span>
            <p className="text-gray-300 leading-relaxed">
              Dilaksanakan pada <b>Malam Minggu</b>. Kelompok bertugas melakukan pengambilan jimpitan Rp3.000 & tabungan warga, kemudian menyetorkannya untuk disahkan bendahara.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-2">
            <span className="font-bold text-amber-400 flex items-center space-x-1.5">
              <CloudRain className="w-4 h-4" />
              <span>Jika Terjadi Hujan / Berhalangan:</span>
            </span>
            <p className="text-gray-300 leading-relaxed">
              Pengambilan ditunda dan dialihkan ke <b>Malam Senin</b> oleh <b>kelompok yang sama</b>. Pada minggu berikutnya, kelompok selanjutnya tetap bertugas sesuai jadwal giliran.
            </p>
          </div>
        </div>
      </div>

      {/* 8 Official System Rules Table */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800 space-y-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white font-heading">
                Ketentuan & Aturan Baku Sistem Jimpitan
              </h3>
              <p className="text-xs text-gray-400">
                Pedoman operasional transparansi keuangan Dusun Kiyudan
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {aturanSistem.map((rule) => (
            <div
              key={rule.no}
              className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 flex items-start space-x-3"
            >
              <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 font-black text-xs flex items-center justify-center shrink-0 border border-emerald-500/40">
                {rule.no}
              </span>
              <div>
                <h4 className="text-xs font-bold text-white mb-0.5">{rule.judul}</h4>
                <p className="text-[11px] text-gray-400 leading-relaxed">{rule.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Note */}
      <div className="p-5 rounded-2xl bg-gray-950 border border-gray-800 text-center text-xs text-gray-400 space-y-1">
        <p className="font-semibold text-gray-300">
          *&quot;Ada kurang lebihnya mohon dikoreksi. Maturnuwun.&quot;* — Pemuda Dusun Kiyudan
        </p>
        <p className="text-[11px] text-emerald-400 font-bold">
          Kiyudan RT 01 / RW 04, Desa Majaksingi, Borobudur, Magelang • GUYUB RUKUN MAJU BERSAMA
        </p>
      </div>

    </div>
  );
};
