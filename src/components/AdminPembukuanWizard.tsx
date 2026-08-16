import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Check, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AdminPembukuanWizard: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { currentPeriode, getSaldoKasPemuda, getSaldoKasDusun, createNewPeriodWizard } = useApp();

  const [step, setStep] = useState<number>(1);
  const [tahunInput, setTahunInput] = useState<number>(currentPeriode.tahun + 1);
  const [namaPeriodeInput, setNamaPeriodeInput] = useState<string>(`Pembukuan ${currentPeriode.tahun + 1}`);
  const [salinWarga, setSalinWarga] = useState<boolean>(true);
  const [confirmed, setConfirmed] = useState<boolean>(false);

  const saldoPemudaAkhir = getSaldoKasPemuda();
  const saldoDusunAkhir = getSaldoKasDusun();

  const handleSubmitNewPeriod = () => {
    createNewPeriodWizard(
      tahunInput,
      namaPeriodeInput,
      `${tahunInput}-01-01`,
      `${tahunInput}-12-31`,
      salinWarga
    );
    setConfirmed(true);
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn pb-16">
      
      {/* Wizard Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800 space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Wizard Pembukuan Tahun Baru & Carry-Over Saldo</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white font-heading">
          + Pembukuan Baru Tahun {tahunInput}
        </h2>
        <p className="text-xs sm:text-sm text-gray-400">
          Prosedur penutupan pembukuan tahun {currentPeriode.tahun} dan inisialisasi saldo awal tahun baru secara berkelanjutan.
        </p>
      </div>

      {/* Wizard Steps Indicator */}
      <div className="flex items-center justify-between glass-card p-4 rounded-2xl border border-gray-800 text-xs font-bold">
        <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-emerald-400' : 'text-gray-500'}`}>
          <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40">1</span>
          <span>Informasi Tahun</span>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-600" />
        <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-emerald-400' : 'text-gray-500'}`}>
          <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40">2</span>
          <span>Transfer Saldo Awal</span>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-600" />
        <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-emerald-400' : 'text-gray-500'}`}>
          <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40">3</span>
          <span>Konfirmasi & Buka</span>
        </div>
      </div>

      {/* Step 1: Input Details */}
      {step === 1 && (
        <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-4 animate-fadeIn">
          <h3 className="text-base font-bold text-white">Step 1: Pengaturan Periode Pembukuan Baru</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Tahun Pembukuan Baru</label>
              <input
                type="number"
                value={tahunInput}
                onChange={(e) => {
                  const t = Number(e.target.value);
                  setTahunInput(t);
                  setNamaPeriodeInput(`Pembukuan ${t}`);
                }}
                className="w-full glass-input px-4 py-2.5 rounded-xl text-sm font-bold text-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Nama Periode Pembukuan</label>
              <input
                type="text"
                value={namaPeriodeInput}
                onChange={(e) => setNamaPeriodeInput(e.target.value)}
                className="w-full glass-input px-4 py-2.5 rounded-xl text-sm font-semibold"
              />
            </div>

            <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={salinWarga}
                  onChange={(e) => setSalinWarga(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-gray-900 border-gray-700"
                />
                <span className="text-xs font-bold text-white">Salin Data Peserta Warga dari Periode {currentPeriode.tahun}?</span>
              </label>
              <p className="text-[11px] text-gray-400 pl-7">
                Seluruh warga aktif periode {currentPeriode.tahun} akan otomatis didaftarkan sebagai peserta periode {tahunInput}. Warga pindah/baru bisa disesuaikan nanti.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 flex items-center space-x-2"
            >
              <span>Lanjut Ke Transfer Saldo &rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Transfer Saldo Overview */}
      {step === 2 && (
        <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-4 animate-fadeIn">
          <h3 className="text-base font-bold text-white">Step 2: Verifikasi Carry-Over Saldo Awal</h3>
          
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <p>
              Saldo akhir pembukuan tahun {currentPeriode.tahun} secara otomatis dikunci dan diposting sebagai <b>Saldo Awal</b> pembukuan tahun {tahunInput}.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-card p-4 rounded-2xl border border-blue-500/30">
              <span className="text-xs font-bold text-blue-400 uppercase">Kas Pemuda (Saldo Awal {tahunInput})</span>
              <p className="text-2xl font-black text-white font-heading mt-1">
                Rp {saldoPemudaAkhir.toLocaleString('id-ID')}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">Diambil dari saldo akhir Kas Pemuda {currentPeriode.tahun}</p>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-emerald-500/30">
              <span className="text-xs font-bold text-emerald-400 uppercase">Kas Dusun (Saldo Awal {tahunInput})</span>
              <p className="text-2xl font-black text-white font-heading mt-1">
                Rp {saldoDusunAkhir.toLocaleString('id-ID')}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">Diambil dari saldo akhir Kas Dusun {currentPeriode.tahun}</p>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gray-800 hover:bg-gray-700 text-gray-300"
            >
              &larr; Kembali
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-6 py-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
            >
              Lanjut Konfirmasi Akhir &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-4 animate-fadeIn">
          <h3 className="text-base font-bold text-white">Step 3: Konfirmasi & Peluncuran Pembukuan Baru</h3>
          
          <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Periode Lama ({currentPeriode.tahun}):</span>
              <span className="font-bold text-rose-400">Status Ditutup & Diarsip</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Periode Baru:</span>
              <span className="font-bold text-emerald-400">{namaPeriodeInput} ({tahunInput})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Saldo Awal Pemuda:</span>
              <span className="font-bold text-white">Rp {saldoPemudaAkhir.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Saldo Awal Dusun:</span>
              <span className="font-bold text-white">Rp {saldoDusunAkhir.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {confirmed ? (
            <div className="p-4 rounded-2xl bg-emerald-500/20 text-emerald-300 text-xs font-bold text-center flex items-center justify-center space-x-2">
              <Check className="w-5 h-5 text-emerald-400" />
              <span>Pembukuan Tahun Baru Berhasil Diinisialisasi!</span>
            </div>
          ) : (
            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gray-800 text-gray-300"
              >
                &larr; Kembali
              </button>
              <button
                onClick={handleSubmitNewPeriod}
                className="px-6 py-3.5 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-500 to-teal-400 text-gray-950 shadow-xl shadow-emerald-500/30 hover:from-emerald-400 hover:to-teal-300"
              >
                🚀 BUAT & AKTIFKAN PEMBUKUAN {tahunInput}
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
