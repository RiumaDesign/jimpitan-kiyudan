import React, { createContext, useContext, useState, useEffect } from 'react';
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
  exportDatabaseBackup: () => void;
  importDatabaseBackup: (jsonStr: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Ensure old 80-citizen dataset in LocalStorage is cleared so 40-citizen dataset takes effect
const CURRENT_DATA_VER = 'v40_aug2026_clean';
if (localStorage.getItem('kiyu_data_ver') !== CURRENT_DATA_VER) {
  localStorage.removeItem('kiyu_warga');
  localStorage.removeItem('kiyu_peserta');
  localStorage.removeItem('kiyu_pengambilan');
  localStorage.removeItem('kiyu_tx_pengambilan');
  localStorage.removeItem('kiyu_tx_kas');
  localStorage.removeItem('kiyu_tx_tabungan');
  localStorage.setItem('kiyu_data_ver', CURRENT_DATA_VER);
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('kiyu_user');
    return saved ? JSON.parse(saved) : null;
  });

  // LocalStorage-backed state initializers for 40 citizens
  const [periodeList, setPeriodeList] = useState<PeriodePembukuan[]>(() => {
    const saved = localStorage.getItem('kiyu_periode');
    return saved ? JSON.parse(saved) : INITIAL_PERIODE;
  });

  const currentPeriode = periodeList.find(p => p.status === 'aktif') || periodeList[periodeList.length - 1];

  const [wargaList, setWargaList] = useState<Warga[]>(() => {
    const saved = localStorage.getItem('kiyu_warga');
    return saved ? JSON.parse(saved) : INITIAL_WARGA;
  });

  const [pesertaList, setPesertaList] = useState<PesertaPembukuan[]>(() => {
    const saved = localStorage.getItem('kiyu_peserta');
    return saved ? JSON.parse(saved) : INITIAL_PESERTA;
  });

  // Deduplicate PengambilanList for Sesi 1, 2, 3, 4 in August 2026
  const [pengambilanList, setPengambilanList] = useState<PengambilanMingguan[]>(() => {
    const saved = localStorage.getItem('kiyu_pengambilan');
    const raw: PengambilanMingguan[] = saved ? JSON.parse(saved) : INITIAL_PENGAMBILAN;
    
    const map = new Map<number, PengambilanMingguan>();
    raw.forEach(item => {
      if (!map.has(item.nomorPengambilan)) {
        map.set(item.nomorPengambilan, item);
      } else {
        const existing = map.get(item.nomorPengambilan)!;
        if (item.totalSudahDiambil >= existing.totalSudahDiambil) {
          map.set(item.nomorPengambilan, item);
        }
      }
    });
    return Array.from(map.values()).sort((a, b) => a.nomorPengambilan - b.nomorPengambilan);
  });

  // TransaksiPengambilanList mapped to 40 citizens for Sesi #1, #2, #3, and #4 (Agustus 2026)
  const [transaksiPengambilanList, setTransaksiPengambilanList] = useState<TransaksiPengambilan[]>(() => {
    const saved = localStorage.getItem('kiyu_tx_pengambilan');
    let raw: TransaksiPengambilan[] = saved ? JSON.parse(saved) : [];

    const map = new Map<string, TransaksiPengambilan>();
    raw.forEach(item => {
      const key = `${item.pengambilanId}_${item.wargaId}`;
      map.set(key, item);
    });

    let idCounter = 1000;
    // Ensure all 4 sessions (Sesi 1, 2, 3, 4) have baseline entries for all 40 citizens
    const sessionConfigs = [
      { id: 1, date: '2026-08-01 20:00:00', allTaken: true },
      { id: 2, date: '2026-08-08 20:00:00', allTaken: true },
      { id: 3, date: '2026-08-15 20:00:00', allTaken: true },
      { id: 4, date: '2026-08-22 20:00:00', allTaken: false },
    ];

    sessionConfigs.forEach(cfg => {
      INITIAL_WARGA.forEach((w, idx) => {
        const key = `${cfg.id}_${w.id}`;
        if (!map.has(key)) {
          const isTaken = cfg.allTaken || (idx < 32);
          const tabunganNominal = isTaken ? (idx % 3 === 0 ? 20000 : idx % 2 === 0 ? 10000 : 5000) : 0;
          const jimpitanNominal = isTaken ? 3000 : 0;

          map.set(key, {
            id: idCounter++,
            pengambilanId: cfg.id,
            wargaId: w.id,
            jimpitan: jimpitanNominal,
            tabungan: tabunganNominal,
            total: jimpitanNominal + tabunganNominal,
            status: isTaken ? 'sudah_diambil' : 'belum_dikunjungi',
            waktuPengambilan: isTaken ? cfg.date : undefined,
          });
        }
      });
    });

    return Array.from(map.values());
  });

  const [transaksiKasList, setTransaksiKasList] = useState<TransaksiKas[]>(() => {
    const saved = localStorage.getItem('kiyu_tx_kas');
    return saved ? JSON.parse(saved) : INITIAL_TRANSAKSI_KAS;
  });

  const [transaksiTabunganList, setTransaksiTabunganList] = useState<TransaksiTabungan[]>(() => {
    const saved = localStorage.getItem('kiyu_tx_tabungan');
    return saved ? JSON.parse(saved) : INITIAL_TABUNGAN_TRANSAKSI;
  });

  const [pengumumanList] = useState<Pengumuman[]>(INITIAL_PENGUMUMAN);
  
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('kiyu_audit');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Auto-persist state to LocalStorage
  useEffect(() => { localStorage.setItem('kiyu_periode', JSON.stringify(periodeList)); }, [periodeList]);
  useEffect(() => { localStorage.setItem('kiyu_warga', JSON.stringify(wargaList)); }, [wargaList]);
  useEffect(() => { localStorage.setItem('kiyu_peserta', JSON.stringify(pesertaList)); }, [pesertaList]);
  useEffect(() => { localStorage.setItem('kiyu_pengambilan', JSON.stringify(pengambilanList)); }, [pengambilanList]);
  useEffect(() => { localStorage.setItem('kiyu_tx_pengambilan', JSON.stringify(transaksiPengambilanList)); }, [transaksiPengambilanList]);
  useEffect(() => { localStorage.setItem('kiyu_tx_kas', JSON.stringify(transaksiKasList)); }, [transaksiKasList]);
  useEffect(() => { localStorage.setItem('kiyu_tx_tabungan', JSON.stringify(transaksiTabunganList)); }, [transaksiTabunganList]);
  useEffect(() => { localStorage.setItem('kiyu_audit', JSON.stringify(auditLogs)); }, [auditLogs]);

  // Real-time synchronization across browser tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'kiyu_warga' && e.newValue) setWargaList(JSON.parse(e.newValue));
      if (e.key === 'kiyu_pengambilan' && e.newValue) setPengambilanList(JSON.parse(e.newValue));
      if (e.key === 'kiyu_tx_pengambilan' && e.newValue) setTransaksiPengambilanList(JSON.parse(e.newValue));
      if (e.key === 'kiyu_tx_kas' && e.newValue) setTransaksiKasList(JSON.parse(e.newValue));
      if (e.key === 'kiyu_tx_tabungan' && e.newValue) setTransaksiTabunganList(JSON.parse(e.newValue));
      if (e.key === 'kiyu_periode' && e.newValue) setPeriodeList(JSON.parse(e.newValue));
      if (e.key === 'kiyu_audit' && e.newValue) setAuditLogs(JSON.parse(e.newValue));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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

    const newEntry: TransaksiPengambilan = {
      id: Date.now(),
      pengambilanId,
      wargaId,
      jimpitan: status === 'sudah_diambil' ? jimpitan : 0,
      tabungan: status === 'sudah_diambil' ? tabungan : 0,
      total: status === 'sudah_diambil' ? total : 0,
      status,
      waktuPengambilan: now,
      keterangan,
    };

    setTransaksiPengambilanList(prev => {
      const cleaned = prev.filter(t => !(t.pengambilanId === pengambilanId && t.wargaId === wargaId));
      const nextList = [...cleaned, newEntry];

      // Immediately calculate totals from nextList and update PengambilanList
      const sessionTx = nextList.filter(t => t.pengambilanId === pengambilanId && t.status === 'sudah_diambil');
      const countSudah = sessionTx.length;
      const sumJimpitan = sessionTx.reduce((acc, t) => acc + (t.jimpitan || 0), 0);
      const sumTabungan = sessionTx.reduce((acc, t) => acc + (t.tabungan || 0), 0);
      const sumTotal = sumJimpitan + sumTabungan;

      setPengambilanList(prevPengambilan => prevPengambilan.map(p => {
        if (p.id === pengambilanId) {
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

      return nextList;
    });
  };

  const rekonsiliasiSahkanPengambilan = (
    pengambilanId: number,
    uangFisik: number,
    catatan?: string
  ) => {
    const targetSession = pengambilanList.find(p => p.id === pengambilanId);
    if (!targetSession) return { success: false, selisih: 0, message: 'Sesi pengambilan tidak ditemukan' };

    const sessionTxItems = transaksiPengambilanList.filter(t => t.pengambilanId === pengambilanId && t.status === 'sudah_diambil');
    const realJimpitan = sessionTxItems.length > 0 ? sessionTxItems.reduce((acc, t) => acc + (t.jimpitan || 0), 0) : targetSession.totalJimpitan;
    const realTabungan = sessionTxItems.length > 0 ? sessionTxItems.reduce((acc, t) => acc + (t.tabungan || 0), 0) : targetSession.totalTabungan;
    const totalSystem = realJimpitan + realTabungan;
    const selisih = uangFisik - totalSystem;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const splitNominal = Math.floor(realJimpitan / 2);

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

    const savingsTxItems = sessionTxItems.filter(t => t.tabungan > 0);
    const newSavingsItems: TransaksiTabungan[] = savingsTxItems.map((t, idx) => ({
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

    // Prevent duplicate kas entries for the same session
    setTransaksiKasList(prev => {
      const cleaned = prev.filter(t => !(t.periodeId === targetSession.periodeId && t.kategoriId === 1 && t.keterangan.includes(`Sesi #${targetSession.nomorPengambilan}`)));
      return [kasPemudaTx, kasDusunTx, ...cleaned];
    });

    // Prevent duplicate tabungan entries for the same session
    setTransaksiTabunganList(prev => {
      const cleaned = prev.filter(t => t.pengambilanId !== pengambilanId);
      return [...newSavingsItems, ...cleaned];
    });

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

  // Safe Session Creation: Reuse active session or create next session number without duplicates
  const createPengambilanMingguanBaru = (): PengambilanMingguan => {
    const activeSession = pengambilanList.find(p => p.status === 'berjalan');
    if (activeSession) {
      return activeSession;
    }

    const maxNum = pengambilanList.reduce((max, p) => Math.max(max, p.nomorPengambilan), 0);
    const newSessionNum = maxNum + 1;
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
      petugasLapangan: currentUser ? `${currentUser.name} (Petugas Lapangan)` : 'Humam Syarif (Ketua Pemuda)',
    };

    setPengambilanList(prev => {
      const exists = prev.some(p => p.nomorPengambilan === newSessionNum || p.id === newSession.id);
      if (exists) return prev;
      return [newSession, ...prev];
    });

    addLog('PENGAMBILAN_BARU', 'Pengambilan Mingguan', `Membuka Sesi Pengambilan Mingguan #${newSessionNum}`);
    return newSession;
  };

  const exportDatabaseBackup = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      wargaList,
      pesertaList,
      periodeList,
      pengambilanList,
      transaksiPengambilanList,
      transaksiKasList,
      transaksiTabunganList,
      auditLogs,
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_Database_Kiyudan_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addLog('BACKUP_DATABASE', 'Sistem Database', 'Mengekspor file cadangan database JSON.');
  };

  const importDatabaseBackup = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.wargaList) setWargaList(data.wargaList);
      if (data.pesertaList) setPesertaList(data.pesertaList);
      if (data.periodeList) setPeriodeList(data.periodeList);
      if (data.pengambilanList) setPengambilanList(data.pengambilanList);
      if (data.transaksiPengambilanList) setTransaksiPengambilanList(data.transaksiPengambilanList);
      if (data.transaksiKasList) setTransaksiKasList(data.transaksiKasList);
      if (data.transaksiTabunganList) setTransaksiTabunganList(data.transaksiTabunganList);
      if (data.auditLogs) setAuditLogs(data.auditLogs);
      addLog('RESTORE_DATABASE', 'Sistem Database', 'Memulihkan database dari file backup JSON.');
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
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
        exportDatabaseBackup,
        importDatabaseBackup,
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
