import React, { useState } from 'react';
import { UserCheck, UserPlus, Search, Edit3, Trash2, X, Check, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Warga } from '../types';

export const AdminWargaManager: React.FC = () => {
  const { wargaList, pesertaList, currentPeriode, addWargaItem, updateWargaItem, deleteWargaItem, togglePesertaStatus } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingWarga, setEditingWarga] = useState<Warga | null>(null);
  const [deletingWarga, setDeletingWarga] = useState<Warga | null>(null);

  // Form states
  const [nama, setNama] = useState('');
  const [alamat, setAlamat] = useState('Dusun Kiyudan, RT 01 / RW 04, Desa Majaksingi');
  const [noRumah, setNoRumah] = useState('');
  const [noTelepon, setNoTelepon] = useState('');

  // Edit states
  const [editNama, setEditNama] = useState('');
  const [editKode, setEditKode] = useState('');
  const [editAlamat, setEditAlamat] = useState('');
  const [editNoRumah, setEditNoRumah] = useState('');
  const [editNoTelepon, setEditNoTelepon] = useState('');
  const [editStatus, setEditStatus] = useState<'aktif' | 'nonaktif'>('aktif');

  const currentPesertaMap = new Map(
    pesertaList
      .filter(p => p.periodeId === currentPeriode.id)
      .map(p => [p.wargaId, p.status])
  );

  const filteredWarga = wargaList.filter(w =>
    w.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.kodeWarga.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.noRumah.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama) return;
    addWargaItem(nama, alamat, noRumah, noTelepon);
    setNama('');
    setNoRumah('');
    setNoTelepon('');
    setShowAddForm(false);
  };

  const handleStartEdit = (w: Warga) => {
    setEditingWarga(w);
    setEditNama(w.nama);
    setEditKode(w.kodeWarga);
    setEditAlamat(w.alamat);
    setEditNoRumah(w.noRumah);
    setEditNoTelepon(w.noTelepon);
    setEditStatus(w.status);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWarga) return;

    updateWargaItem(editingWarga.id, {
      nama: editNama,
      kodeWarga: editKode,
      alamat: editAlamat,
      noRumah: editNoRumah,
      noTelepon: editNoTelepon,
      status: editStatus,
    });

    setEditingWarga(null);
  };

  const ConfirmDeleteSubmit = () => {
    if (!deletingWarga) return;
    deleteWargaItem(deletingWarga.id);
    setDeletingWarga(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Master Warga & Peserta Pembukuan</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white font-heading">
            Kelola Data Warga Dusun Kiyudan
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Total {wargaList.length} warga terdaftar. Admin dapat menambah, mengedit, dan menghapus data warga.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-5 py-3 rounded-2xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center space-x-2 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Tambah Warga Baru</span>
        </button>
      </div>

      {/* Add Warga Form */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="glass-panel p-6 rounded-3xl border border-emerald-500/30 space-y-4 animate-fadeIn">
          <h3 className="text-base font-bold text-white font-heading">Form Tambah Warga Baru</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Nama Lengkap Warga</label>
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Ahmad Widodo"
                className="w-full glass-input px-3.5 py-2 rounded-xl text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Nomor Rumah</label>
              <input
                type="text"
                required
                value={noRumah}
                onChange={(e) => setNoRumah(e.target.value)}
                placeholder="Contoh: No. 85"
                className="w-full glass-input px-3.5 py-2 rounded-xl text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Alamat Dusun & RT</label>
              <input
                type="text"
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                className="w-full glass-input px-3.5 py-2 rounded-xl text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Nomor Telepon (Opsional)</label>
              <input
                type="text"
                value={noTelepon}
                onChange={(e) => setNoTelepon(e.target.value)}
                placeholder="0812xxxx"
                className="w-full glass-input px-3.5 py-2 rounded-xl text-xs font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-800 text-gray-300"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 text-white shadow-md"
            >
              Simpan Warga
            </button>
          </div>
        </form>
      )}

      {/* Edit Modal */}
      {editingWarga && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg glass-panel p-6 rounded-3xl border border-gray-700 space-y-4 relative">
            <button
              onClick={() => setEditingWarga(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                <Edit3 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white font-heading">Edit Data Warga ({editingWarga.kodeWarga})</h3>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Kode Warga (Kode Unik)</label>
                <input
                  type="text"
                  required
                  value={editKode}
                  onChange={(e) => setEditKode(e.target.value.toUpperCase())}
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-xs font-bold tracking-wider uppercase text-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Nama Lengkap Warga</label>
                <input
                  type="text"
                  required
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Nomor Rumah</label>
                  <input
                    type="text"
                    required
                    value={editNoRumah}
                    onChange={(e) => setEditNoRumah(e.target.value)}
                    className="w-full glass-input px-3.5 py-2 rounded-xl text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Nomor Telepon</label>
                  <input
                    type="text"
                    value={editNoTelepon}
                    onChange={(e) => setEditNoTelepon(e.target.value)}
                    className="w-full glass-input px-3.5 py-2 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Alamat Dusun & RT</label>
                <input
                  type="text"
                  value={editAlamat}
                  onChange={(e) => setEditAlamat(e.target.value)}
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Status Master Warga</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-xs font-semibold"
                >
                  <option value="aktif" className="bg-gray-900">🟢 Aktif</option>
                  <option value="nonaktif" className="bg-gray-900">🔴 Nonaktif (Pindah / Keluar)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingWarga(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-800 text-gray-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingWarga && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md glass-panel p-6 rounded-3xl border border-rose-500/40 space-y-4 relative text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-white font-heading">Konfirmasi Hapus Data Warga</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus data warga <b className="text-rose-400">{deletingWarga.nama} ({deletingWarga.kodeWarga})</b>? 
            </p>
            <p className="text-[11px] text-gray-400 italic">
              Tindakan ini akan menghapus peserta periode aktif. Riwayat transaksi lama tetap tersimpan secara aman di database audit.
            </p>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingWarga(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-gray-800 hover:bg-gray-700 text-gray-300"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={ConfirmDeleteSubmit}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari nama, kode KDY, atau no rumah..."
          className="w-full glass-input pl-10 pr-4 py-2 rounded-xl text-xs font-medium"
        />
      </div>

      {/* Warga Table */}
      <div className="glass-panel rounded-3xl border border-gray-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-900/90 text-gray-400 uppercase font-semibold border-b border-gray-800">
              <tr>
                <th className="p-4">Kode Warga</th>
                <th className="p-4">Nama Warga</th>
                <th className="p-4">Alamat & Rumah</th>
                <th className="p-4">No. HP</th>
                <th className="p-4 text-center">Status Peserta {currentPeriode.tahun}</th>
                <th className="p-4 text-right">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-gray-300">
              {filteredWarga.map((w) => {
                const isPesertaActive = currentPesertaMap.get(w.id) === 'aktif';

                return (
                  <tr key={w.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="p-4 font-extrabold text-amber-400">{w.kodeWarga}</td>
                    <td className="p-4 font-bold text-white text-sm">{w.nama}</td>
                    <td className="p-4 text-gray-300">{w.alamat} ({w.noRumah})</td>
                    <td className="p-4 text-gray-400">{w.noTelepon || '-'}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => togglePesertaStatus(w.id, isPesertaActive ? 'nonaktif' : 'aktif')}
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold transition-all border ${
                          isPesertaActive
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                        }`}
                      >
                        {isPesertaActive ? `🟢 Aktif ${currentPeriode.tahun}` : `🔴 Nonaktif ${currentPeriode.tahun}`}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleStartEdit(w)}
                          title="Edit Data Warga"
                          className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingWarga(w)}
                          title="Hapus Data Warga"
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
