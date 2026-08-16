import type { 
  Warga, PeriodePembukuan, PesertaPembukuan, PengambilanMingguan, 
  TransaksiTabungan, TransaksiKas, KategoriKeuangan, 
  Pengumuman, AuditLog, User 
} from '../types';

export const MOCK_USERS: User[] = [
  { id: 1, name: 'Slamet Rahardjo', username: 'admin', role: 'admin' },
  { id: 2, name: 'Budi Santoso', username: 'bendahara', role: 'bendahara' },
  { id: 3, name: 'Danang Prasetyo', username: 'petugas', role: 'petugas' },
];

export const RAW_WARGA_NAMES = [
  'Anwari', 'Armi', 'Feri', 'Arini', 'Slamet', 'Bambang', 'Joko', 'Sugeng', 'Hartono', 'Supri',
  'Yanti', 'Endang', 'Tri Suparni', 'Budi Harsono', 'Purwanto', 'Agus Setiawan', 'Eko Prasetyo', 'Edi Raharjo', 'Danang', 'Rudi',
  'Suparno', 'Wiji', 'Sukidi', 'Mulyono', 'Poniman', 'Waluyo', 'Sudarmo', 'Sarwono', 'Tuminah', 'Sumiyati',
  'Parto', 'Saman', 'Martono', 'Harjo', 'Tukiman', 'Wagiman', 'Suwardi', 'Kasiman', 'Kiman', 'Paiman',
  'Sunarto', 'Purnomo', 'Riyanto', 'Heru', 'Suharto', 'Supomo', 'Kartono', 'Tugimin', 'Sutrisno', 'Bowo',
  'Dwi Haryanto', 'Triyono', 'Agung', 'Catur', 'Wibowo', 'Nugroho', 'Prasetya', 'Surya', 'Wawan', 'Bayu',
  'Aris', 'Fajar', 'Sigit', 'Deni', 'Didik', 'Hari', 'Heri', 'Iwan', 'Kuswanto', 'Lilik',
  'Muhtar', 'Nur', 'Oki', 'Pujiono', 'Rahmat', 'Samidi', 'Taufik', 'Untung', 'Wahyu', 'Yudi'
];

export const INITIAL_WARGA: Warga[] = RAW_WARGA_NAMES.map((nama, idx) => ({
  id: idx + 1,
  kodeWarga: `KDY-${String(idx + 1).padStart(3, '0')}`,
  nama,
  alamat: 'Dusun Kiyudan, RT 01 / RW 04, Desa Majaksingi',
  noRumah: `No. ${idx + 1}`,
  noTelepon: `08123456${String(idx + 100).padStart(3, '0')}`,
  status: 'aktif',
}));

export const INITIAL_PERIODE: PeriodePembukuan[] = [
  {
    id: 1,
    namaPeriode: 'Pembukuan 2024',
    tahun: 2024,
    tanggalMulai: '2024-01-01',
    tanggalSelesai: '2024-12-31',
    status: 'arsip',
    saldoAwalPemuda: 5000000,
    saldoAwalDusun: 10000000,
    closedAt: '2024-12-31 23:59:00',
    closedBy: 'Slamet Rahardjo',
  },
  {
    id: 2,
    namaPeriode: 'Pembukuan 2025',
    tahun: 2025,
    tanggalMulai: '2025-01-01',
    tanggalSelesai: '2025-12-31',
    status: 'arsip',
    saldoAwalPemuda: 10000000,
    saldoAwalDusun: 16000000,
    closedAt: '2025-12-31 23:59:00',
    closedBy: 'Slamet Rahardjo',
  },
  {
    id: 3,
    namaPeriode: 'Pembukuan 2026',
    tahun: 2026,
    tanggalMulai: '2026-01-01',
    tanggalSelesai: '2026-12-31',
    status: 'aktif',
    saldoAwalPemuda: 16000000,
    saldoAwalDusun: 21000000,
  },
];

export const INITIAL_PESERTA: PesertaPembukuan[] = INITIAL_WARGA.map((w) => ({
  id: w.id,
  periodeId: 3,
  wargaId: w.id,
  status: 'aktif',
  tanggalMasuk: '2026-01-01',
}));

export const INITIAL_KATEGORI: KategoriKeuangan[] = [
  { id: 1, nama: 'Jimpitan Mingguan', jenis: 'pemasukan' },
  { id: 2, nama: 'Donasi & Sponsor', jenis: 'pemasukan' },
  { id: 3, nama: 'Bantuan Pemerintah Desa', jenis: 'pemasukan' },
  { id: 4, nama: 'Hadiah Lomba', jenis: 'pengeluaran' },
  { id: 5, nama: 'Konsumsi Rapat / Kegiatan', jenis: 'pengeluaran' },
  { id: 6, nama: 'Perlengkapan & Sound System', jenis: 'pengeluaran' },
  { id: 7, nama: 'Infrastruktur Dusun', jenis: 'pengeluaran' },
  { id: 8, nama: 'Sosial & Santunan', jenis: 'pengeluaran' },
  { id: 9, nama: 'Lain-lain', jenis: 'pengeluaran' },
];

export const INITIAL_PENGAMBILAN: PengambilanMingguan[] = [
  {
    id: 1,
    periodeId: 3,
    nomorPengambilan: 31,
    tanggalPengambilan: '2026-08-01',
    status: 'disahkan',
    totalWarga: 80,
    totalSudahDiambil: 80,
    totalJimpitan: 240000,
    totalTabungan: 1250000,
    totalSetoran: 1490000,
    uangFisik: 1490000,
    selisih: 0,
    petugasLapangan: 'Danang Prasetyo (Petugas Lapangan)',
    catatan: 'Pengambilan lancar, uang fisik cocok 100%.',
    tanggalDisahkan: '2026-08-01 22:30:00',
    disahkanOleh: 'Budi Santoso',
  },
  {
    id: 2,
    periodeId: 3,
    nomorPengambilan: 32,
    tanggalPengambilan: '2026-08-08',
    status: 'disahkan',
    totalWarga: 80,
    totalSudahDiambil: 78,
    totalJimpitan: 234000,
    totalTabungan: 1420000,
    totalSetoran: 1654000,
    uangFisik: 1654000,
    selisih: 0,
    petugasLapangan: 'Danang Prasetyo (Petugas Lapangan)',
    catatan: '2 warga (Feri & Sugeng) tidak ada di rumah, ditunda ke minggu depan.',
    tanggalDisahkan: '2026-08-08 22:15:00',
    disahkanOleh: 'Budi Santoso',
  },
  {
    id: 3,
    periodeId: 3,
    nomorPengambilan: 33,
    tanggalPengambilan: '2026-08-15',
    status: 'disahkan',
    totalWarga: 80,
    totalSudahDiambil: 80,
    totalJimpitan: 240000,
    totalTabungan: 1560000,
    totalSetoran: 1800000,
    uangFisik: 1800000,
    selisih: 0,
    petugasLapangan: 'Danang Prasetyo (Petugas Lapangan)',
    catatan: 'Termasuk pelunasan jimpitan Feri & Sugeng dari minggu lalu.',
    tanggalDisahkan: '2026-08-15 23:00:00',
    disahkanOleh: 'Budi Santoso',
  },
  {
    id: 4,
    periodeId: 3,
    nomorPengambilan: 34,
    tanggalPengambilan: '2026-08-22',
    status: 'berjalan',
    totalWarga: 80,
    totalSudahDiambil: 68,
    totalJimpitan: 204000,
    totalTabungan: 1350000,
    totalSetoran: 1554000,
    uangFisik: 0,
    selisih: 0,
    petugasLapangan: 'Danang Prasetyo (Petugas Lapangan)',
  },
];

export const INITIAL_TRANSAKSI_KAS: TransaksiKas[] = [
  {
    id: 1,
    periodeId: 3,
    jenisKas: 'kas_pemuda',
    jenisTransaksi: 'saldo_awal',
    tanggal: '2026-01-01',
    nominal: 16000000,
    keterangan: 'Saldo Awal Kas Pemuda Periode 2026',
    createdBy: 'System Migration',
    createdAt: '2026-01-01 00:00:00',
  },
  {
    id: 2,
    periodeId: 3,
    jenisKas: 'kas_dusun',
    jenisTransaksi: 'saldo_awal',
    tanggal: '2026-01-01',
    nominal: 21000000,
    keterangan: 'Saldo Awal Kas Dusun Periode 2026',
    createdBy: 'System Migration',
    createdAt: '2026-01-01 00:00:00',
  },
  {
    id: 3,
    periodeId: 3,
    jenisKas: 'kas_pemuda',
    jenisTransaksi: 'pemasukan',
    kategoriId: 1,
    kategoriNama: 'Jimpitan Mingguan',
    tanggal: '2026-08-01',
    nominal: 120000,
    keterangan: 'Pembagian 50% Jimpitan Pengambilan #031',
    createdBy: 'Budi Santoso',
    createdAt: '2026-08-01 22:30:00',
  },
  {
    id: 4,
    periodeId: 3,
    jenisKas: 'kas_dusun',
    jenisTransaksi: 'pemasukan',
    kategoriId: 1,
    kategoriNama: 'Jimpitan Mingguan',
    tanggal: '2026-08-01',
    nominal: 120000,
    keterangan: 'Pembagian 50% Jimpitan Pengambilan #031',
    createdBy: 'Budi Santoso',
    createdAt: '2026-08-01 22:30:00',
  },
  {
    id: 5,
    periodeId: 3,
    jenisKas: 'kas_pemuda',
    jenisTransaksi: 'pemasukan',
    kategoriId: 2,
    kategoriNama: 'Donasi & Sponsor',
    tanggal: '2026-08-05',
    nominal: 1500000,
    keterangan: 'Sponsorship Kegiatan HUT RI 81 dari Toko Berkah',
    createdBy: 'Slamet Rahardjo',
    createdAt: '2026-08-05 14:00:00',
    buktiFoto: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 6,
    periodeId: 3,
    jenisKas: 'kas_pemuda',
    jenisTransaksi: 'pengeluaran',
    kategoriId: 4,
    kategoriNama: 'Hadiah Lomba',
    tanggal: '2026-08-10',
    nominal: 750000,
    keterangan: 'Pembelian piala dan doorprize lomba anak-anak HUT RI',
    kegiatanId: 1,
    createdBy: 'Budi Santoso',
    createdAt: '2026-08-10 16:30:00',
    buktiFoto: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 7,
    periodeId: 3,
    jenisKas: 'kas_dusun',
    jenisTransaksi: 'pengeluaran',
    kategoriId: 7,
    kategoriNama: 'Infrastruktur Dusun',
    tanggal: '2026-08-12',
    nominal: 1200000,
    keterangan: 'Perbaikan lampu penerangan jalan utama Dusun Kiyudan',
    createdBy: 'Budi Santoso',
    createdAt: '2026-08-12 11:00:00',
    buktiFoto: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
  },
];



export const INITIAL_TABUNGAN_TRANSAKSI: TransaksiTabungan[] = INITIAL_WARGA.map((w, idx) => {
  const baseSavings = (idx + 1) * 25000 + 400000;
  return {
    id: idx + 1,
    wargaId: w.id,
    periodeId: 3,
    jenis: 'setoran',
    nominal: baseSavings,
    keterangan: 'Akumulasi Setoran Tabungan Pengambilan Minggu #001 - #033',
    createdAt: '2026-08-15 23:00:00',
    createdBy: 'System Auto-Posting',
  };
});

export const INITIAL_PENGUMUMAN: Pengumuman[] = [
  {
    id: 1,
    judul: 'Jadwal Pengambilan Jimpitan Sesi #034 Sabtu Malam Minggu',
    isi: 'Diberitahukan kepada seluruh warga Dusun Kiyudan bahwa pengambilan jimpitan Rp3.000 & tabungan bebas akan dilaksanakan Sabtu malam pukul 19:30 WIB oleh petugas regu Pemuda.',
    tanggalPublish: '2026-08-21',
    isActive: true,
  },
  {
    id: 2,
    judul: 'Undangan Kerja Bakti Pembenahan Fasilitas Dusun',
    isi: 'Diharapkan kehadiran bapak-bapak dan pemuda Dusun Kiyudan dalam kegiatan kerja bakti pada hari Minggu, 23 Agustus 2026 pukul 07:00 WIB.',
    tanggalPublish: '2026-08-19',
    isActive: true,
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 1,
    username: 'Budi Santoso',
    aksi: 'DISAHKAN_PENGAMBILAN',
    modul: 'Pengambilan Mingguan',
    detail: 'Mengesahkan Pengambilan Sesi #033 tanggal 15 Agustus 2026 (Uang Fisik: Rp1.800.000, Selisih: Rp0)',
    timestamp: '2026-08-15 23:00:00',
  },
  {
    id: 2,
    username: 'Slamet Rahardjo',
    aksi: 'INPUT_PEMASUKAN_KAS',
    modul: 'Kas Pemuda',
    detail: 'Menambahkan Pemasukan Kas Pemuda Rp1.500.000 (Sponsorship Toko Berkah)',
    timestamp: '2026-08-05 14:00:00',
  }
];
