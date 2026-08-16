export type UserRole = 'admin' | 'bendahara' | 'petugas';

export interface User {
  id: number;
  name: string;
  username: string;
  role: UserRole;
  avatar?: string;
}

export interface Warga {
  id: number;
  kodeWarga: string;
  nama: string;
  alamat: string;
  noRumah: string;
  noTelepon: string;
  status: 'aktif' | 'nonaktif';
}

export interface PeriodePembukuan {
  id: number;
  namaPeriode: string;
  tahun: number;
  tanggalMulai: string;
  tanggalSelesai: string;
  status: 'draft' | 'aktif' | 'selesai' | 'arsip';
  saldoAwalPemuda: number;
  saldoAwalDusun: number;
  closedAt?: string;
  closedBy?: string;
}

export interface PesertaPembukuan {
  id: number;
  periodeId: number;
  wargaId: number;
  status: 'aktif' | 'nonaktif';
  tanggalMasuk: string;
  tanggalKeluar?: string;
}

export type StatusPengambilanSesi = 'draft' | 'berjalan' | 'selesai_pengambilan' | 'rekonsiliasi' | 'disahkan' | 'ada_selisih';

export interface PengambilanMingguan {
  id: number;
  periodeId: number;
  nomorPengambilan: number;
  tanggalPengambilan: string;
  status: StatusPengambilanSesi;
  totalWarga: number;
  totalSudahDiambil: number;
  totalJimpitan: number;
  totalTabungan: number;
  totalSetoran: number;
  uangFisik: number;
  selisih: number;
  petugasLapangan?: string;
  catatan?: string;
  tanggalDisahkan?: string;
  disahkanOleh?: string;
}

export type StatusTransWarga = 'belum_dikunjungi' | 'sudah_diambil' | 'tidak_ada' | 'ditunda' | 'tidak_ikut';

export interface TransaksiPengambilan {
  id: number;
  pengambilanId: number;
  wargaId: number;
  petugasId?: number;
  jimpitan: number;
  tabungan: number;
  total: number;
  status: StatusTransWarga;
  waktuPengambilan?: string;
  keterangan?: string;
}

export interface TransaksiTabungan {
  id: number;
  wargaId: number;
  periodeId: number;
  pengambilanId?: number;
  jenis: 'setoran' | 'penarikan' | 'koreksi' | 'pengembalian';
  nominal: number;
  keterangan: string;
  createdAt: string;
  createdBy: string;
}

export type JenisKas = 'kas_pemuda' | 'kas_dusun';
export type JenisTransKas = 'saldo_awal' | 'pemasukan' | 'pengeluaran' | 'koreksi';

export interface TransaksiKas {
  id: number;
  periodeId: number;
  jenisKas: JenisKas;
  jenisTransaksi: JenisTransKas;
  kategoriId?: number;
  kategoriNama?: string;
  tanggal: string;
  nominal: number;
  keterangan: string;
  buktiFoto?: string;
  kegiatanId?: number;
  createdBy: string;
  createdAt: string;
}

export interface KategoriKeuangan {
  id: number;
  nama: string;
  jenis: 'pemasukan' | 'pengeluaran';
}

export interface Pengumuman {
  id: number;
  judul: string;
  isi: string;
  tanggalPublish: string;
  gambar?: string;
  isActive: boolean;
}

export interface AuditLog {
  id: number;
  userId?: number;
  username: string;
  aksi: string;
  modul: string;
  detail: string;
  timestamp: string;
}
