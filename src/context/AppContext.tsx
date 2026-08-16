import React, { createContext, useContext, useState } from 'react';
import confetti from 'canvas-confetti';
import type {
  User, Warga, PeriodePembukuan, PesertaPembukuan, PengambilanMingguan,
  TransaksiPengambilan, TransaksiTabungan, TransaksiKas,
  Pengumuman, AuditLog
} from '../types';
import {
  MOCK_USERS, INITIAL_WARGA, INITIAL_PERIODE, INITIAL_PESERTA,
  INITIAL_PENGAMBILAN, INITIAL_TRANSAKSI_KAS,
  INITIAL_TABUNGAN_TRANSAKSI, INITIAL_PENGUMUMAN, INITIAL_AUDIT_LOGS
} from '../data/mockData';

interface AppContextType {
  currentUser: User | null;
  login: (username: string, password?: string) => { success: boolean; message?: string };
  logout: () => void;

  periodeList: PeriodePembukuan[];
  currentPeriode: PeriodePembukuan;

  wargaList: Warga[];
  pesertaList: PesertaPembukuan[];

  pengambilanList: PengambilanMingguan[];
  transaksiPengambilanList: TransaksiPengambilan[];

  transaksiKasList: TransaksiKas[];
  transaksiTabunganList: TransaksiTabungan[];

  pengumumanList: Pengumuman[];
  auditLogs: AuditLog[];

  // Helper functions
  getSaldoKasPemuda: (periodeId?: number) => number;
  getSaldoKasDusun: (periodeId?: number) => number;
  getSaldoTabunganWarga: (wargaId: number) => number;
  getTotalTabunganDusun: () => number;

  // Actions
  savePengambilanWargaItem: (
    pengambilanId: number,
    wargaId: number,
    jimpitan: number,
    tabungan: number,
    status: 'sudah_diambil' | 'tidak_ada' | 'ditunda' | 'tidak_ikut',
    keterangan?: string
  ) => void;

  updatePengambilanSessionMetadata: (
    pengambilanId: number,
    tanggalPengambilan: string,
    petugasLapangan: string
  ) => void;

  rekonsiliasiSahkanPengambilan: (
    pengambilanId: number,
    uangFisik: number,
    catatan?: string
  ) => { success: boolean; selisih: number; message: string };

  addTransaksiKasItem: (
    jenisKas: 'kas_pemuda' | 'kas_dusun',
    jenisTransaksi: 'pemasukan' | 'pengeluaran',
    kategoriId: number,
    kategoriNama: string,
    nominal: number,
    keterangan: string,
    buktiFoto?: string
  ) => void;

  addWargaItem: (nama: string, alamat: string, noRumah: string, noTelepon: string) => Warga;
  updateWargaItem: (id: number, data: Partial<Warga>) => void;
  deleteWargaItem: (id: number) => void;

  addTransaksiTabunganMandiri: (
    wargaId: number,
    jenis: 'setoran' | 'penarikan' | 'koreksi',
    nominal: number,
    keterangan: string
  ) => void;

  togglePesertaStatus: (wargaId: number, status: 'aktif' | 'nonaktif') => void;

  createNewPeriodWizard: (
    tahun: number,
    namaPeriode: string,
    tanggalMulai: string,
    tanggalSelesai: string,
    salinWarga: boolean
  ) => void;

  lookupTabunganPublik: (nama: string, kodeWarga: string) => {
    found: boolean;
    warga?: Warga;
    saldoTotal?: number;
    history?: TransaksiTabungan[];
  };

  createPengambilanMingguanBaru: () => PengambilanMingguan;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('kiyu_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [periodeList, setPeriodeList] = useState<PeriodePembukuan[]>(INITIAL_PERIODE);
  const currentPeriode = periodeList.find(p => p.status === 'aktif') || periodeList[periodeList.length - 1];

  const [wargaList, setWargaList] = useState<Warga[]>(INITIAL_WARGA);
  const [pesertaList, setPesertaList] = useState<PesertaPembukuan[]>(INITIAL_PESERTA);

  const [pengambilanList, setPengambilanList] = useState<PengambilanMingguan[]>(INITIAL_PENGAMBILAN);

  const [transaksiPengambilanList, setTransaksiPengambilanList] = useState<TransaksiPengambilan[]>(() => {
    const items: TransaksiPengambilan[] = [];
    let idCounter = 1;
    INITIAL_WARGA.forEach((w, idx) => {
      const isTaken = idx < 68;
      items.push({
        id: idCounter++,
        pengambilanId: 4,
        wargaId: w.id,
        jimpitan: isTaken ? 3000 : 0,
        tabungan: isTaken ? (idx % 3 === 0 ? 20000 : idx % 2 === 0 ? 10000 : 5000) : 0,
        total: isTaken ? (3000 + (idx % 3 === 0 ? 20000 : idx % 2 === 0 ? 10000 : 5000)) : 0,
        status: isTaken ? 'sudah_diambil' : 'belum_dikunjungi',
        waktuPengambilan: isTaken ? '2026-08-22 20:15:00' : undefined,
      });
    });
    return items;
  });

  const [transaksiKasList, setTransaksiKasList] = useState<TransaksiKas[]>(INITIAL_TRANSAKSI_KAS);
  const [transaksiTabunganList, setTransaksiTabunganList] = useState<TransaksiTabungan[]>(INITIAL_TABUNGAN_TRANSAKSI);
  const [pengumumanList] = useState<Pengumuman[]>(INITIAL_PENGUMUMAN);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  const addLog = (aksi: string, modul: string, detail: string) => {
    const newLog: AuditLog = {
      id: Date.now(),
      username: currentUser ? currentUser.name : 'Sistem Publik',
      aksi,
      modul,
      detail,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const login = (username: string, password?: string): { success: boolean; message?: string } => {
    const cleanUser = username.trim().toLowerCase();

    // Password must strictly be kiyudan123
    if (!password || password.trim() !== 'kiyudan123') {
      return { success: false, message: 'Password salah! Password resmi pengurus adalah: kiyudan123' };
    }

    // Match against official 7 officers list or gemuk ireng alias
    let matchedUser = MOCK_USERS.find(
      u => u.username.toLowerCase() === cleanUser || u.name.toLowerCase() === cleanUser
    );

    if (!matchedUser && (cleanUser === 'gemuk ireng' || cleanUser === 'gemukireng' || cleanUser === 'admin')) {
      matchedUser = MOCK_USERS[0]; // Slamet Rifaudin
    }

    if (matchedUser) {
      setCurrentUser(matchedUser);
      localStorage.setItem('kiyu_user', JSON.stringify(matchedUser));
      addLog('LOGIN', 'Autentikasi Pengurus', `Pengurus ${matchedUser.name} berhasil login.`);
      return { success: true };
    }

    // Allow custom officer name if password kiyudan123 is valid
    const customUser: User = {
      id: Date.now(),
      name: username.trim(),
      username: cleanUser,
      role: 'admin',
    };
    setCurrentUser(customUser);
    localStorage.setItem('kiyu_user', JSON.stringify(customUser));
    addLog('LOGIN', 'Autentikasi Pengurus', `Pengurus ${customUser.name} berhasil login.`);
    return { success: true };
  };

  const logout = () => {
    if (currentUser) {
      addLog('LOGOUT', 'Autentikasi', `User ${currentUser.name} logout.`);
    }
    setCurrentUser(null);
    localStorage.removeItem('kiyu_user');
  };

  const getSaldoKasPemuda = (periodeId: number = currentPeriode.id): number => {
    return transaksiKasList
      .filter(t => t.periodeId === periodeId && t.jenisKas === 'kas_pemuda')
      .reduce((sum, t) => {
        if (t.jenisTransaksi === 'saldo_awal' || t.jenisTransaksi === 'pemasukan') {
          return sum + t.nominal;
        }
        if (t.jenisTransaksi === 'pengeluaran') {
          return sum - t.nominal;
        }
        return sum;
      }, 0);
  };

  const getSaldoKasDusun = (periodeId: number = currentPeriode.id): number => {
    return transaksiKasList
      .filter(t => t.periodeId === periodeId && t.jenisKas === 'kas_dusun')
      .reduce((sum, t) => {
        if (t.jenisTransaksi === 'saldo_awal' || t.jenisTransaksi === 'pemasukan') {
          return sum + t.nominal;
        }
        if (t.jenisTransaksi === 'pengeluaran') {
          return sum - t.nominal;
        }
        return sum;
      }, 0);
  };

  const getSaldoTabunganWarga = (wargaId: number): number => {
    return transaksiTabunganList
      .filter(t => t.wargaId === wargaId)
      .reduce((sum, t) => {
        if (t.jenis === 'setoran') return sum + t.nominal;
        if (t.jenis === 'penarikan') return sum - t.nominal;
        return sum;
      }, 0);
  };

  const getTotalTabunganDusun = (): number => {
    return wargaList.reduce((sum, w) => sum + getSaldoTabunganWarga(w.id), 0);
  };

  const updatePengambilanSessionMetadata = (
    pengambilanId: number,
    tanggalPengambilan: string,
    petugasLapangan: string
  ) => {
    setPengambilanList(prev => prev.map(p => {
      if (p.id === pengambilanId) {
        return {
          ...p,
          tanggalPengambilan,
          petugasLapangan,
        };
      }
      return p;
    }));
    addLog(
      'UPDATE_METADATA_SESI',
      'Pengambilan Mingguan',
      `Mengubah Tanggal/Petugas Sesi #${pengambilanId}: Tanggal=${tanggalPengambilan}, Petugas=${petugasLapangan}`
    );
  };

  const savePengambilanWargaItem = (
    pengambilanId: number,
    wargaId: number,
    jimpitan: number,
    tabungan: number,
    status: 'sudah_diambil' | 'tidak_ada' | 'ditunda' | 'tidak_ikut',
    keterangan?: string
  ) => {
    const total = jimpitan + tabungan;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    setTransaksiPengambilanList(prev => {
      const existingIdx = prev.findIndex(t => t.pengambilanId === pengambilanId && t.wargaId === wargaId);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = {
          ...copy[existingIdx],
          jimpitan: status === 'sudah_diambil' ? jimpitan : 0,
          tabungan: status === 'sudah_diambil' ? tabungan : 0,
          total: status === 'sudah_diambil' ? total : 0,
          status,
          waktuPengambilan: now,
          keterangan,
        };
        return copy;
      } else {
        return [...prev, {
          id: Date.now(),
          pengambilanId,
          wargaId,
          jimpitan: status === 'sudah_diambil' ? jimpitan : 0,
          tabungan: status === 'sudah_diambil' ? tabungan : 0,
          total: status === 'sudah_diambil' ? total : 0,
          status,
          waktuPengambilan: now,
          keterangan,
        }];
      }
    });

    setPengambilanList(prev => prev.map(p => {
      if (p.id === pengambilanId) {
        const sessionTx = transaksiPengambilanList.filter(t => t.pengambilanId === pengambilanId && t.wargaId !== wargaId);
        const newWargaTx = { jimpitan: status === 'sudah_diambil' ? jimpitan : 0, tabungan: status === 'sudah_diambil' ? tabungan : 0 };
        
        const countSudah = sessionTx.filter(t => t.status === 'sudah_diambil').length + (status === 'sudah_diambil' ? 1 : 0);
        const sumJimpitan = sessionTx.reduce((acc, t) => acc + (t.status === 'sudah_diambil' ? t.jimpitan : 0), 0) + newWargaTx.jimpitan;
        const sumTabungan = sessionTx.reduce((acc, t) => acc + (t.status === 'sudah_diambil' ? t.tabungan : 0), 0) + newWargaTx.tabungan;
        const sumTotal = sumJimpitan + sumTabungan;

        return {
          ...p,
          status: 'berjalan',
          totalSudahDiambil: countSudah,
          totalJimpitan: sumJimpitan,
          totalTabungan: sumTabungan,
          totalSetoran: sumTotal,
        };
      }
      return p;
    }));
  };

  const rekonsiliasiSahkanPengambilan = (
    pengambilanId: number,
    uangFisik: number,
    catatan?: string
  ) => {
    const targetSession = pengambilanList.find(p => p.id === pengambilanId);
    if (!targetSession) return { success: false, selisih: 0, message: 'Sesi pengambilan tidak ditemukan' };

    const totalSystem = targetSession.totalSetoran;
    const selisih = uangFisik - totalSystem;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const splitNominal = Math.floor(targetSession.totalJimpitan / 2);

    const kasPemudaTx: TransaksiKas = {
      id: Date.now() + 1,
      periodeId: targetSession.periodeId,
      jenisKas: 'kas_pemuda',
      jenisTransaksi: 'pemasukan',
      kategoriId: 1,
      kategoriNama: 'Jimpitan Mingguan',
      tanggal: targetSession.tanggalPengambilan,
      nominal: splitNominal,
      keterangan: `Pembagian 50% Jimpitan Pengambilan Sesi #${targetSession.nomorPengambilan} (Petugas: ${targetSession.petugasLapangan || 'Petugas Lapangan'})`,
      createdBy: currentUser ? currentUser.name : 'System',
      createdAt: now,
    };

    const kasDusunTx: TransaksiKas = {
      id: Date.now() + 2,
      periodeId: targetSession.periodeId,
      jenisKas: 'kas_dusun',
      jenisTransaksi: 'pemasukan',
      kategoriId: 1,
      kategoriNama: 'Jimpitan Mingguan',
      tanggal: targetSession.tanggalPengambilan,
      nominal: splitNominal,
      keterangan: `Pembagian 50% Jimpitan Pengambilan Sesi #${targetSession.nomorPengambilan} (Petugas: ${targetSession.petugasLapangan || 'Petugas Lapangan'})`,
      createdBy: currentUser ? currentUser.name : 'System',
      createdAt: now,
    };

    const sessionTxItems = transaksiPengambilanList.filter(t => t.pengambilanId === pengambilanId && t.status === 'sudah_diambil' && t.tabungan > 0);
    const newSavingsItems: TransaksiTabungan[] = sessionTxItems.map((t, idx) => ({
      id: Date.now() + 10 + idx,
      wargaId: t.wargaId,
      periodeId: targetSession.periodeId,
      pengambilanId,
      jenis: 'setoran',
      nominal: t.tabungan,
      keterangan: `Setoran Tabungan Pengambilan Minggu #${targetSession.nomorPengambilan} (${targetSession.tanggalPengambilan})`,
      createdAt: now,
      createdBy: currentUser ? currentUser.name : 'System',
    }));

    setTransaksiKasList(prev => [...prev, kasPemudaTx, kasDusunTx]);
    setTransaksiTabunganList(prev => [...prev, ...newSavingsItems]);

    setPengambilanList(prev => prev.map(p => {
      if (p.id === pengambilanId) {
        return {
          ...p,
          status: selisih === 0 ? 'disahkan' : 'ada_selisih',
          uangFisik,
          selisih,
          catatan,
          tanggalDisahkan: now,
          disahkanOleh: currentUser ? currentUser.name : 'Admin',
        };
      }
      return p;
    }));

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // fallback
    }

    addLog(
      'REKONSILIASI_PENGESAHAN',
      'Pengambilan Mingguan',
      `Mengesahkan Sesi #${targetSession.nomorPengambilan} Tanggal ${targetSession.tanggalPengambilan} (Petugas: ${targetSession.petugasLapangan || 'Petugas Lapangan'}, Uang Fisik: Rp${uangFisik.toLocaleString('id-ID')}, Selisih: Rp${selisih.toLocaleString('id-ID')})`
    );

    return {
      success: true,
      selisih,
      message: selisih === 0 
        ? 'Sesi Pengambilan Berhasil Disahkan & Split 50:50 Jimpitan Sukses!'
        : `Pengambilan Disahkan dengan catatan SELISIH (Rp${selisih.toLocaleString('id-ID')}).`
    };
  };

  const addTransaksiKasItem = (
    jenisKas: 'kas_pemuda' | 'kas_dusun',
    jenisTransaksi: 'pemasukan' | 'pengeluaran',
    kategoriId: number,
    kategoriNama: string,
    nominal: number,
    keterangan: string,
    buktiFoto?: string
  ) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newTx: TransaksiKas = {
      id: Date.now(),
      periodeId: currentPeriode.id,
      jenisKas,
      jenisTransaksi,
      kategoriId,
      kategoriNama,
      tanggal: new Date().toISOString().split('T')[0],
      nominal,
      keterangan,
      buktiFoto,
      createdBy: currentUser ? currentUser.name : 'Admin',
      createdAt: now,
    };

    setTransaksiKasList(prev => [newTx, ...prev]);

    addLog(
      jenisTransaksi === 'pemasukan' ? 'INPUT_PEMASUKAN' : 'INPUT_PENGELUARAN',
      jenisKas === 'kas_pemuda' ? 'Kas Pemuda' : 'Kas Dusun',
      `Mencatat ${jenisTransaksi} Rp${nominal.toLocaleString('id-ID')} - ${keterangan}`
    );
  };

  const addWargaItem = (nama: string, alamat: string, noRumah: string, noTelepon: string): Warga => {
    const newId = wargaList.length + 1;
    const kodeWarga = `KDY-${String(newId).padStart(3, '0')}`;
    const newWarga: Warga = {
      id: newId,
      kodeWarga,
      nama,
      alamat,
      noRumah,
      noTelepon,
      status: 'aktif',
    };

    setWargaList(prev => [...prev, newWarga]);

    const newPeserta: PesertaPembukuan = {
      id: Date.now(),
      periodeId: currentPeriode.id,
      wargaId: newId,
      status: 'aktif',
      tanggalMasuk: new Date().toISOString().split('T')[0],
    };
    setPesertaList(prev => [...prev, newPeserta]);

    addLog('TAMBAH_WARGA', 'Master Warga', `Menambahkan Warga Baru: ${nama} (${kodeWarga})`);

    return newWarga;
  };

  const updateWargaItem = (id: number, data: Partial<Warga>) => {
    setWargaList(prev => prev.map(w => w.id === id ? { ...w, ...data } : w));
    const updated = wargaList.find(w => w.id === id);
    addLog('UPDATE_WARGA', 'Master Warga', `Mengubah Data Warga: ${data.nama || updated?.nama} (${updated?.kodeWarga})`);
  };

  const deleteWargaItem = (id: number) => {
    const target = wargaList.find(w => w.id === id);
    setWargaList(prev => prev.filter(w => w.id !== id));
    setPesertaList(prev => prev.filter(p => p.wargaId !== id));
    addLog('HAPUS_WARGA', 'Master Warga', `Menghapus Warga: ${target?.nama || ''} (${target?.kodeWarga || ''})`);
  };

  const addTransaksiTabunganMandiri = (
    wargaId: number,
    jenis: 'setoran' | 'penarikan' | 'koreksi',
    nominal: number,
    keterangan: string
  ) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newTx: TransaksiTabungan = {
      id: Date.now(),
      wargaId,
      periodeId: currentPeriode.id,
      jenis,
      nominal,
      keterangan,
      createdAt: now,
      createdBy: currentUser ? currentUser.name : 'Bendahara',
    };
    setTransaksiTabunganList(prev => [newTx, ...prev]);
    const w = wargaList.find(item => item.id === wargaId);
    addLog(
      jenis === 'setoran' ? 'SETORAN_TABUNGAN' : 'PENARIKAN_TABUNGAN',
      'Tabungan Warga',
      `Mencatat ${jenis.toUpperCase()} Tabungan ${w?.nama} (${w?.kodeWarga}): Rp${nominal.toLocaleString('id-ID')} - ${keterangan}`
    );
  };

  const togglePesertaStatus = (wargaId: number, status: 'aktif' | 'nonaktif') => {
    setPesertaList(prev => prev.map(p => {
      if (p.wargaId === wargaId && p.periodeId === currentPeriode.id) {
        return { ...p, status };
      }
      return p;
    }));

    const w = wargaList.find(item => item.id === wargaId);
    addLog(
      'UPDATE_PESERTA',
      'Peserta Periode',
      `Mengubah status peserta ${w?.nama} (${w?.kodeWarga}) menjadi ${status}`
    );
  };

  const createNewPeriodWizard = (
    tahun: number,
    namaPeriode: string,
    tanggalMulai: string,
    tanggalSelesai: string,
    salinWarga: boolean
  ) => {
    const finalSaldoPemuda = getSaldoKasPemuda(currentPeriode.id);
    const finalSaldoDusun = getSaldoKasDusun(currentPeriode.id);

    setPeriodeList(prev => prev.map(p => {
      if (p.id === currentPeriode.id) {
        return {
          ...p,
          status: 'arsip',
          closedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          closedBy: currentUser ? currentUser.name : 'Admin',
        };
      }
      return p;
    }));

    const newPeriodId = periodeList.length + 1;
    const newPeriod: PeriodePembukuan = {
      id: newPeriodId,
      namaPeriode,
      tahun,
      tanggalMulai,
      tanggalSelesai,
      status: 'aktif',
      saldoAwalPemuda: finalSaldoPemuda,
      saldoAwalDusun: finalSaldoDusun,
    };

    setPeriodeList(prev => [...prev, newPeriod]);

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const initKasPemuda: TransaksiKas = {
      id: Date.now() + 1,
      periodeId: newPeriodId,
      jenisKas: 'kas_pemuda',
      jenisTransaksi: 'saldo_awal',
      tanggal: tanggalMulai,
      nominal: finalSaldoPemuda,
      keterangan: `Saldo Awal Pembukuan Tahun ${tahun} (Carry-over Saldo Akhir ${currentPeriode.tahun})`,
      createdBy: currentUser ? currentUser.name : 'System',
      createdAt: now,
    };

    const initKasDusun: TransaksiKas = {
      id: Date.now() + 2,
      periodeId: newPeriodId,
      jenisKas: 'kas_dusun',
      jenisTransaksi: 'saldo_awal',
      tanggal: tanggalMulai,
      nominal: finalSaldoDusun,
      keterangan: `Saldo Awal Pembukuan Tahun ${tahun} (Carry-over Saldo Akhir ${currentPeriode.tahun})`,
      createdBy: currentUser ? currentUser.name : 'System',
      createdAt: now,
    };

    setTransaksiKasList(prev => [initKasPemuda, initKasDusun, ...prev]);

    if (salinWarga) {
      const newPesertaItems: PesertaPembukuan[] = pesertaList
        .filter(p => p.periodeId === currentPeriode.id && p.status === 'aktif')
        .map((p, idx) => ({
          id: Date.now() + 100 + idx,
          periodeId: newPeriodId,
          wargaId: p.wargaId,
          status: 'aktif',
          tanggalMasuk: tanggalMulai,
        }));
      setPesertaList(prev => [...prev, ...newPesertaItems]);
    }

    addLog(
      'BUAT_PEMBUKUAN_BARU',
      'Pembukuan Tahunan',
      `Membuat Pembukuan Baru ${namaPeriode} (Saldo Awal Pemuda: Rp${finalSaldoPemuda.toLocaleString('id-ID')}, Dusun: Rp${finalSaldoDusun.toLocaleString('id-ID')})`
    );
  };

  const lookupTabunganPublik = (nama: string, kodeWarga: string) => {
    const target = wargaList.find(
      w => w.nama.trim().toLowerCase() === nama.trim().toLowerCase() && 
           w.kodeWarga.trim().toUpperCase() === kodeWarga.trim().toUpperCase()
    );

    if (!target) {
      return { found: false };
    }

    const saldoTotal = getSaldoTabunganWarga(target.id);
    const history = transaksiTabunganList
      .filter(t => t.wargaId === target.id)
      .sort((a, b) => b.id - a.id);

    return {
      found: true,
      warga: target,
      saldoTotal,
      history,
    };
  };

  const createPengambilanMingguanBaru = (): PengambilanMingguan => {
    const newSessionNum = pengambilanList.length + 1;
    const today = new Date().toISOString().split('T')[0];
    const newSession: PengambilanMingguan = {
      id: Date.now(),
      periodeId: currentPeriode.id,
      nomorPengambilan: newSessionNum,
      tanggalPengambilan: today,
      status: 'berjalan',
      totalWarga: pesertaList.filter(p => p.periodeId === currentPeriode.id && p.status === 'aktif').length,
      totalSudahDiambil: 0,
      totalJimpitan: 0,
      totalTabungan: 0,
      totalSetoran: 0,
      uangFisik: 0,
      selisih: 0,
      petugasLapangan: currentUser ? `${currentUser.name} (${currentUser.role})` : 'Danang Prasetyo (Petugas Lapangan)',
    };

    setPengambilanList(prev => [newSession, ...prev]);

    addLog('PENGAMBILAN_BARU', 'Pengambilan Mingguan', `Membuka Sesi Pengambilan Mingguan #${newSessionNum}`);
    return newSession;
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        logout,
        periodeList,
        currentPeriode,
        wargaList,
        pesertaList,
        pengambilanList,
        transaksiPengambilanList,
        transaksiKasList,
        transaksiTabunganList,
        pengumumanList,
        auditLogs,
        getSaldoKasPemuda,
        getSaldoKasDusun,
        getSaldoTabunganWarga,
        getTotalTabunganDusun,
        savePengambilanWargaItem,
        updatePengambilanSessionMetadata,
        rekonsiliasiSahkanPengambilan,
        addTransaksiKasItem,
        addWargaItem,
        updateWargaItem,
        deleteWargaItem,
        addTransaksiTabunganMandiri,
        togglePesertaStatus,
        createNewPeriodWizard,
        lookupTabunganPublik,
        createPengambilanMingguanBaru,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
