import React, { useState } from 'react';
import { Coins, CheckCircle, AlertTriangle, X, ShieldCheck, UserCheck, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ReconcileModalProps {
  isOpen: boolean;
  onClose: () => void;
  pengambilanId?: number;
}

export const AdminReconciliationModal: React.FC<ReconcileModalProps> = ({ isOpen, onClose, pengambilanId }) => {
  const { pengambilanList, rekonsiliasiSahkanPengambilan } = useApp();

  const targetSession = pengambilanId
    ? pengambilanList.find(p => p.id === pengambilanId)
    : pengambilanList.find(p => p.status === 'berjalan') || pengambilanList[pengambilanList.length - 1];

  const initialCash = targetSession ? targetSession.totalSetoran : 0;
  const [uangFisikInput, setUangFisikInput] = useState<number>(initialCash);
  const [catatanInput, setCatatanInput] = useState<string>('Uang fisik lengkap dan sudah dihitung Bendahara.');
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen || !targetSession) return null;

  const totalSystem = targetSession.totalSetoran;
  const selisih = uangFisikInput - totalSystem;
  const splitPemuda = Math.floor(targetSession.totalJimpitan / 2);
  const splitDusun = Math.floor(targetSession.totalJimpitan / 2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = rekonsiliasiSahkanPengambilan(targetSession.id, uangFisikInput, catatanInput);
    setFeedback({ success: res.success, message: res.message });

    setTimeout(() => {
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl glass-panel p-6 sm:p-8 rounded-3xl border border-gray-700 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-6">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Coins className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-heading">
              Rekonsiliasi & Pengesahan Sesi #{targetSession.nomorPengambilan}
            </h3>
            <p className="text-xs text-gray-400 flex items-center space-x-1 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tanggal Entry: <b>{targetSession.tanggalPengambilan}</b></span>
            </p>
          </div>
        </div>

        {/* Responsible Officer Card */}
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-gray-300">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>Petugas Lapangan Penanggung Jawab:</span>
          </div>
          <span className="font-extrabold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
            {targetSession.petugasLapangan || 'Danang Prasetyo (Petugas Lapangan)'}
          </span>
        </div>

        {/* System Summary Card */}
        <div className="glass-card p-4 rounded-2xl border border-gray-800 space-y-2 text-xs">
          <p className="text-gray-400 font-bold uppercase">Ringkasan Sistem Pengambilan:</p>
          <div className="flex justify-between">
            <span className="text-gray-300">Total Warga Diambil</span>
            <span className="font-bold text-white">{targetSession.totalSudahDiambil} / {targetSession.totalWarga} Warga</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Total Jimpitan Sistem (Rp3.000)</span>
            <span className="font-bold text-amber-400">Rp {targetSession.totalJimpitan.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Total Setoran Tabungan Warga</span>
            <span className="font-bold text-blue-400">Rp {targetSession.totalTabungan.toLocaleString('id-ID')}</span>
          </div>
          <div className="pt-2 border-t border-gray-800 flex justify-between text-sm font-bold">
            <span className="text-white">TOTAL UANG SISTEM:</span>
            <span className="text-emerald-400 font-heading">Rp {totalSystem.toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Form Input Uang Fisik */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-200 mb-1.5">
              Jumlah Uang Fisik Diterima Bendahara dari {targetSession.petugasLapangan || 'Petugas'} (Rp)
            </label>
            <input
              type="number"
              required
              value={uangFisikInput || ''}
              onChange={(e) => setUangFisikInput(e.target.value === '' ? 0 : Number(e.target.value))}
              className="w-full glass-input px-4 py-3 rounded-xl text-lg font-black text-emerald-400 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Selisih Indicator Status Card */}
          <div>
            {selisih === 0 ? (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-3 text-emerald-300 text-xs">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-bold text-emerald-200">🟢 STATUS: SESUAI (Selisih Rp0)</p>
                  <p className="text-[11px] text-emerald-300/80">Uang fisik tepat cocok dengan total setoran sistem.</p>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-3 text-rose-300 text-xs">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <div>
                  <p className="font-bold text-rose-200">🔴 STATUS: ADA SELISIH (Rp {selisih.toLocaleString('id-ID')})</p>
                  <p className="text-[11px] text-rose-300/80">Jumlah uang fisik tidak cocok dengan sistem. Wajib memberikan alasan audit di bawah.</p>
                </div>
              </div>
            )}
          </div>

          {/* Audit Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Catatan Audit / Rekonsiliasi</label>
            <textarea
              rows={2}
              value={catatanInput}
              onChange={(e) => setCatatanInput(e.target.value)}
              placeholder="Catatan rekonsiliasi..."
              className="w-full glass-input p-3 rounded-xl text-xs font-medium"
            ></textarea>
          </div>

          {/* Auto 50:50 Split Preview Box */}
          <div className="glass-card p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-2 text-xs">
            <p className="font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Preview Pembagian Otomatis Jimpitan (50:50):</span>
            </p>
            <div className="grid grid-cols-2 gap-2 text-gray-300">
              <div className="p-2 rounded-xl bg-gray-900/60 border border-gray-800">
                <span className="text-[10px] text-gray-400 block">50% Kas Pemuda</span>
                <span className="font-bold text-blue-400 text-sm">+Rp {splitPemuda.toLocaleString('id-ID')}</span>
              </div>
              <div className="p-2 rounded-xl bg-gray-900/60 border border-gray-800">
                <span className="text-[10px] text-gray-400 block">50% Kas Dusun</span>
                <span className="font-bold text-emerald-400 text-sm">+Rp {splitDusun.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* Feedback Message */}
          {feedback && (
            <div className={`p-3 rounded-xl text-xs font-bold text-center ${feedback.success ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
              {feedback.message}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-xs font-bold bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-gray-950 shadow-lg shadow-emerald-500/20 transition-all"
            >
              🚀 SAHKAN & POSTING KE KAS
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
