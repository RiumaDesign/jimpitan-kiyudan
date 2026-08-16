import React, { useState } from 'react';
import { Landmark, PlusCircle, Wallet, ArrowDownRight, ArrowUpRight, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AdminKasManager: React.FC = () => {
  const { 
    transaksiKasList, addTransaksiKasItem, getSaldoKasPemuda, 
    getSaldoKasDusun, wargaList, getSaldoTabunganWarga, addTransaksiTabunganMandiri 
  } = useApp();

  const [activeFormTab, setActiveFormTab] = useState<'kas' | 'tabungan'>('kas');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states - Kas
  const [jenisKas, setJenisKas] = useState<'kas_pemuda' | 'kas_dusun'>('kas_pemuda');
  const [jenisTransaksi, setJenisTransaksi] = useState<'pemasukan' | 'pengeluaran'>('pengeluaran');
  const [nominal, setNominal] = useState<number>(250000);
  const [keterangan, setKeterangan] = useState<string>('Pembelian konsumsi kerja bakti dusun');
  const [kategoriId, setKategoriId] = useState<number>(5);
  const [buktiFoto, setBuktiFoto] = useState<string>('https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=600&q=80');

  // Form states - Tabungan Mandiri
  const [selectedWargaId, setSelectedWargaId] = useState<number>(1);
  const [jenisTabungan, setJenisTabungan] = useState<'setoran' | 'penarikan'>('setoran');
  const [nominalTabungan, setNominalTabungan] = useState<number>(50000);
  const [keteranganTabungan, setKeteranganTabungan] = useState<string>('Setoran tabungan mandiri bendahara');

  const saldoPemuda = getSaldoKasPemuda();
  const saldoDusun = getSaldoKasDusun();

  const categories = [
    { id: 1, nama: 'Jimpitan Mingguan' },
    { id: 2, nama: 'Donasi & Sponsor' },
    { id: 3, nama: 'Bantuan Pemerintah Desa' },
    { id: 4, nama: 'Hadiah Lomba' },
    { id: 5, nama: 'Konsumsi Rapat / Kegiatan' },
    { id: 6, nama: 'Perlengkapan & Sound System' },
    { id: 7, nama: 'Infrastruktur Dusun' },
    { id: 8, nama: 'Sosial & Santunan' },
    { id: 9, nama: 'Lain-lain' },
  ];

  const handleKasSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nominal <= 0 || !keterangan) return;

    const kat = categories.find(c => c.id === kategoriId);
    addTransaksiKasItem(
      jenisKas,
      jenisTransaksi,
      kategoriId,
      kat ? kat.nama : 'Lain-lain',
      nominal,
      keterangan,
      buktiFoto
    );

    setShowAddForm(false);
    setKeterangan('');
    setNominal(100000);
  };

  const handleTabunganSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nominalTabungan <= 0 || !selectedWargaId) return;

    addTransaksiTabunganMandiri(
      selectedWargaId,
      jenisTabungan,
      nominalTabungan,
      keteranganTabungan
    );

    setShowAddForm(false);
    setNominalTabungan(50000);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-2">
            <Landmark className="w-3.5 h-3.5" />
            <span>Manajemen Transaksi Kas & Tabungan Mandiri</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white font-heading">
            Kelola Keuangan Kas & Tabungan Warga
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Input Pemasukan/Pengeluaran Kas Dusun & Pemuda serta Setoran/Penarikan Tabungan Mandiri.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-5 py-3 rounded-2xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center space-x-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Input Transaksi Baru</span>
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 space-y-4 animate-fadeIn">
          
          {/* Subtab Form Switcher */}
          <div className="flex items-center space-x-2 border-b border-gray-800 pb-3">
            <button
              onClick={() => setActiveFormTab('kas')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                activeFormTab === 'kas' ? 'bg-emerald-600 text-white' : 'bg-gray-900 text-gray-400'
              }`}
            >
              <Landmark className="w-4 h-4" />
              <span>Input Transaksi Kas</span>
            </button>

            <button
              onClick={() => setActiveFormTab('tabungan')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                activeFormTab === 'tabungan' ? 'bg-amber-600 text-white' : 'bg-gray-900 text-gray-400'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Input Tabungan Mandiri Warga</span>
            </button>
          </div>

          {activeFormTab === 'kas' ? (
            <form onSubmit={handleKasSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Target Kas</label>
                  <select
                    value={jenisKas}
                    onChange={(e) => setJenisKas(e.target.value as any)}
                    className="w-full glass-input px-3.5 py-2 rounded-xl text-xs font-semibold"
                  >
                    <option value="kas_pemuda" className="bg-gray-900">Kas Pemuda (Saldo: Rp{saldoPemuda.toLocaleString('id-ID')})</option>
                    <option value="kas_dusun" className="bg-gray-900">Kas Dusun (Saldo: Rp{saldoDusun.toLocaleString('id-ID')})</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Jenis Transaksi</label>
                  <select
                    value={jenisTransaksi}
                    onChange={(e) => setJenisTransaksi(e.target.value as any)}
                    className="w-full glass-input px-3.5 py-2 rounded-xl text-xs font-semibold"
                  >
                    <option value="pengeluaran" className="bg-gray-900">🔻 Pengeluaran Kas</option>
                    <option value="pemasukan" className="bg-gray-900">🟢 Pemasukan Kas (Donasi/Bantuan)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Kategori Keuangan</label>
                  <select
                    value={kategoriId}
                    onChange={(e) => setKategoriId(Number(e.target.value))}
                    className="w-full glass-input px-3.5 py-2 rounded-xl text-xs font-semibold"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id} className="bg-gray-900">{c.nama}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Nominal (Rp)</label>
                  <input
                    type="number"
                    required
                    value={nominal || ''}
                    onChange={(e) => setNominal(e.target.value === '' ? 0 : Number(e.target.value))}
                    className="w-full glass-input px-3.5 py-2 rounded-xl text-xs font-bold text-amber-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Keterangan Transaksi</label>
                  <input
                    type="text"
                    required
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                    placeholder="Contoh: Pembelian konsumsi kerja bakti"
                    className="w-full glass-input px-3.5 py-2 rounded-xl text-xs font-medium"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-gray-300 mb-1">URL Foto Bukti Nota (Opsional)</label>
                  <input
                    type="text"
                    value={buktiFoto}
                    onChange={(e) => setBuktiFoto(e.target.value)}
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
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 text-white shadow-md flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Transaksi Kas</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleTabunganSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Pilih Warga</label>
                  <select
                    value={selectedWargaId}
                    onChange={(e) => setSelectedWargaId(Number(e.target.value))}
                    className="w-full glass-input px-3.5 py-2 rounded-xl text-xs font-semibold"
                  >
                    {wargaList.map(w => (
                      <option key={w.id} value={w.id} className="bg-gray-900">
                        {w.nama} ({w.kodeWarga}) - Saldo: Rp{getSaldoTabunganWarga(w.id).toLocaleString('id-ID')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Jenis Transaksi Tabungan</label>
                  <select
                    value={jenisTabungan}
                    onChange={(e) => setJenisTabungan(e.target.value as any)}
                    className="w-full glass-input px-3.5 py-2 rounded-xl text-xs font-semibold"
                  >
                    <option value="setoran" className="bg-gray-900">🟢 Setoran Tabungan</option>
                    <option value="penarikan" className="bg-gray-900">🔻 Penarikan Tabungan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Nominal (Rp)</label>
                  <input
                    type="number"
                    required
                    value={nominalTabungan || ''}
                    onChange={(e) => setNominalTabungan(e.target.value === '' ? 0 : Number(e.target.value))}
                    className="w-full glass-input px-3.5 py-2 rounded-xl text-xs font-bold text-amber-400"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Keterangan / Catatan Bendahara</label>
                  <input
                    type="text"
                    required
                    value={keteranganTabungan}
                    onChange={(e) => setKeteranganTabungan(e.target.value)}
                    placeholder="Contoh: Setoran mandiri langsung ke bendahara"
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
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-600 hover:bg-amber-500 text-gray-950 shadow-md flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Transaksi Tabungan</span>
                </button>
              </div>
            </form>
          )}

        </div>
      )}

      {/* Transaction List */}
      <div className="glass-panel rounded-3xl border border-gray-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-900/90 text-gray-400 uppercase font-semibold border-b border-gray-800">
              <tr>
                <th className="p-4">Tanggal</th>
                <th className="p-4">Target Kas</th>
                <th className="p-4">Keterangan</th>
                <th className="p-4">Pencatat</th>
                <th className="p-4 text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-gray-300">
              {transaksiKasList.map(t => {
                const isIncome = t.jenisTransaksi === 'saldo_awal' || t.jenisTransaksi === 'pemasukan';
                return (
                  <tr key={t.id} className="hover:bg-gray-800/40">
                    <td className="p-4 font-medium text-gray-400">{t.tanggal}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${t.jenisKas === 'kas_pemuda' ? 'text-blue-400 bg-blue-500/10' : 'text-emerald-400 bg-emerald-500/10'}`}>
                        {t.jenisKas.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-white">
                      <div>{t.keterangan}</div>
                      {t.kategoriNama && <div className="text-[10px] text-gray-400 mt-0.5">{t.kategoriNama}</div>}
                    </td>
                    <td className="p-4 text-gray-400">{t.createdBy}</td>
                    <td className="p-4 text-right font-extrabold">
                      <div className="flex items-center justify-end space-x-1">
                        {isIncome ? <ArrowDownRight className="w-4 h-4 text-emerald-400" /> : <ArrowUpRight className="w-4 h-4 text-rose-400" />}
                        <span className={isIncome ? 'text-emerald-400' : 'text-rose-400'}>
                          {isIncome ? '+' : '-'} Rp {t.nominal.toLocaleString('id-ID')}
                        </span>
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
