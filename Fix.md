PRODUCT REQUIREMENTS DOCUMENT
Frezz Laundry Management System
Versi: 1.0.0
Tanggal: 30 April 2026
Status: Draft - Internal Review
Platform: Web Application (Node.js + MySQL)

1. Pendahuluan
1.1 Tujuan Dokumen
Dokumen ini mendeskripsikan spesifikasi fungsional dan non-fungsional dari Frezz Laundry Management System sebagai acuan tim pengembang, desainer, dan stakeholder.
1.2 Gambaran Umum Produk
Frezz Laundry adalah aplikasi manajemen laundry berbasis web untuk membantu pemilik bisnis mengelola operasional harian, mencakup transaksi, pelanggan, laporan keuangan, dan pemantauan status pesanan secara real-time.
1.3 Ruang Lingkup

Manajemen pengguna berbasis peran (owner & kasir)
Manajemen data pelanggan
Manajemen jenis pakaian dan harga
Transaksi laundry kiloan & satuan, paket normal & express
Pemantauan dan pembaruan status pesanan
Riwayat transaksi selesai
Dashboard dan laporan untuk owner


2. Stakeholder & Pengguna
Owner (Pemilik Laundry)
Role: owner — Memantau performa bisnis, laporan keuangan, dan kontrol penuh sistem. Dapat mengelola akun kasir, jenis pakaian, harga, dan melihat seluruh riwayat transaksi.
Kasir
Role: kasir — Operator harian. Input transaksi baru, perbarui status pesanan, daftarkan pelanggan baru.

3. Arsitektur Database
Database: frezz_laundry | Engine: MySQL
Tabel: users
Menyimpan akun pengguna dengan kontrol akses berbasis peran.

id — INT, PK, AUTO_INCREMENT
username — VARCHAR(100), NOT NULL, UNIQUE
password — VARCHAR(255), NOT NULL, di-hash dengan bcrypt
role — ENUM('owner', 'kasir'), DEFAULT 'kasir'
created_at — TIMESTAMP

Tabel: pelanggan
Data pelanggan yang menggunakan layanan laundry.

id — INT, PK, AUTO_INCREMENT
nama — VARCHAR(150), NOT NULL
no_hp — VARCHAR(25), NOT NULL, UNIQUE
created_at — TIMESTAMP

Tabel: jenis_pakaian
Master data jenis pakaian dan harga per item (layanan satuan).

id — INT, PK, AUTO_INCREMENT
nama_jenis — VARCHAR(150), NOT NULL
harga — DECIMAL(12,2), DEFAULT 0

Data awal yang di-seed: Kemeja (Rp7.000), Kaos (Rp5.000), Celana (Rp8.000), Jas (Rp20.000), Bed Cover (Rp25.000).
Tabel: transaksi
Tabel utama semua transaksi laundry.

id — INT, PK, AUTO_INCREMENT
kode_order — VARCHAR(50), NOT NULL, UNIQUE
pelanggan_id — INT, FK → pelanggan
layanan — ENUM('kiloan', 'satuan')
paket — ENUM('normal', 'express'), DEFAULT 'normal'
berat_kg — DECIMAL(10,2), NULL (diisi jika layanan kiloan)
total_harga — DECIMAL(12,2), DEFAULT 0
status — ENUM('belum_selesai', 'siap_diambil', 'selesai')
tanggal_masuk — DATETIME, NOT NULL
tanggal_selesai — DATETIME, NULL
created_by — INT, FK → users
created_at — TIMESTAMP

Tabel: transaksi_detail
Detail item per transaksi (untuk layanan satuan). Relasi one-to-many dengan transaksi.

id — INT, PK, AUTO_INCREMENT
transaksi_id — INT, FK → transaksi (CASCADE DELETE)
jenis_id — INT, FK → jenis_pakaian
qty — INT, NOT NULL
harga — DECIMAL(12,2), harga saat transaksi dibuat
subtotal — DECIMAL(12,2), hasil qty × harga

Tabel: riwayat
Arsip transaksi yang telah berstatus selesai.

id — INT, PK, AUTO_INCREMENT
transaksi_id — INT, FK → transaksi, UNIQUE (CASCADE DELETE)
selesai_at — DATETIME, NOT NULL


4. Fitur & Persyaratan Fungsional
Autentikasi

F-01: Login dengan username & password (bcrypt)
F-02: Logout dan hapus sesi
F-03: Proteksi halaman berdasarkan role

Manajemen Pengguna (owner)

F-04: Tambah akun kasir baru
F-05: Lihat daftar semua pengguna
F-06: Edit username/password kasir
F-07: Hapus akun kasir

Manajemen Pelanggan

F-08: Daftarkan pelanggan baru (nama + no_hp)
F-09: Cari pelanggan berdasarkan nama atau no_hp
F-10: Edit data pelanggan
F-11: Hapus pelanggan (owner, jika tidak ada transaksi aktif)

Manajemen Jenis Pakaian (owner)

F-12: Tambah jenis pakaian baru beserta harga
F-13: Edit harga per jenis pakaian
F-14: Hapus jenis pakaian
F-15: Lihat daftar harga (semua role)

Transaksi

F-16: Buat transaksi kiloan (input berat kg, pilih paket)
F-17: Buat transaksi satuan (input item per jenis, minimal 1 item)
F-18: Generate kode_order unik otomatis oleh sistem
F-19: Lihat daftar transaksi aktif dengan filter status
F-20: Ubah status transaksi (belum_selesai → siap_diambil → selesai)
F-21: Lihat detail transaksi lengkap
F-22: Cetak/export nota untuk pelanggan

Riwayat & Laporan

F-23: Lihat riwayat transaksi selesai
F-24: Dashboard ringkasan harian (owner)
F-25: Laporan pendapatan dengan filter tanggal (owner)
F-26: Filter & pencarian transaksi lanjutan


5. Alur Bisnis Utama
Penerimaan Laundry:

Kasir login ke sistem
Cari atau daftarkan pelanggan baru berdasarkan no_hp
Pilih layanan: kiloan (input berat kg) atau satuan (input per item)
Pilih paket: normal atau express
Sistem menghitung total harga otomatis
Sistem generate kode_order unik dan simpan transaksi
Cetak nota untuk pelanggan

Alur Status Pesanan:
belum_selesai → siap_diambil → selesai
Ketika status berubah menjadi "selesai", sistem otomatis mencatat record ke tabel riwayat.

6. Persyaratan Non-Fungsional

Performa: Halaman dimuat dalam < 2 detik pada jaringan normal
Keamanan: Password di-hash bcrypt, akses dibatasi per role (RBAC)
Ketersediaan: Uptime minimal 99% per bulan
Skalabilitas: Tetap responsif hingga 10.000 transaksi di database
Kompatibilitas: Berjalan di Chrome, Firefox, Safari, dan Edge terbaru
Kemudahan Pakai: Kasir baru dapat beroperasi setelah pelatihan 30 menit
Audit Trail: Setiap transaksi mencatat created_by dan created_at


7. Aturan Bisnis & Validasi
Layanan:

Kiloan: field berat_kg wajib diisi, transaksi_detail tidak digunakan
Satuan: transaksi_detail wajib memiliki minimal 1 baris item
Total harga dihitung otomatis oleh sistem, kasir tidak bisa mengubah langsung
Paket express dikenakan multiplier biaya tambahan (dikonfigurasi owner)

Transaksi:

kode_order bersifat unik dan tidak dapat diubah setelah dibuat
Status hanya bergerak maju, tidak bisa mundur
Transaksi berstatus "selesai" tidak dapat diubah atau dihapus
Penghapusan transaksi cascade ke transaksi_detail dan riwayat

Pengguna:

Hanya owner yang dapat mengelola akun kasir
Kasir tidak dapat mengakses modul laporan keuangan dan manajemen harga
Username harus unik di seluruh sistem
Akun owner pertama (boss) di-seed saat instalasi


8. Halaman & Navigasi
HalamanAksesFungsi/loginPublicForm login/dashboardownerStatistik bisnis harian/transaksiowner, kasirDaftar transaksi aktif/transaksi/baruowner, kasirForm transaksi baru/transaksi/:idowner, kasirDetail & update status/pelangganowner, kasirManajemen pelanggan/jenis-pakaianownerMaster data & harga/penggunaownerManajemen akun user/riwayatowner, kasirArsip transaksi selesai/laporanownerLaporan pendapatan

9. Tech Stack

Backend: Node.js + Express.js
Database: MySQL 8.x
ORM/Query: Sequelize atau mysql2
Autentikasi: bcrypt + JWT
Frontend: EJS atau React.js
Styling: Tailwind CSS atau Bootstrap
Deploy: VPS / cPanel


10. Kriteria Penerimaan

Owner "boss" dapat login dan mengakses semua fitur
Kasir tidak dapat mengakses halaman owner
Transaksi kiloan dan satuan dapat dibuat dengan kalkulasi harga yang benar
kode_order di-generate otomatis dan selalu unik
Status transaksi dapat diperbarui sampai "selesai"
Saat status "selesai", record muncul di tabel riwayat
Dashboard menampilkan data yang akurat sesuai database


11. Asumsi & Batasan
Asumsi:

Single-tenant (satu toko, satu instance sistem)
Harga per kg dan multiplier express dikonfigurasi di halaman pengaturan
Sistem berjalan di lingkungan dengan koneksi internet stabil

Batasan v1.0:

Tidak ada fitur multi-cabang
Tidak ada notifikasi WhatsApp/SMS otomatis
Tidak ada integrasi payment gateway
Tidak ada export laporan ke Excel/PDF


12. Roadmap

v1.0 (MVP): Autentikasi, CRUD pelanggan, transaksi kiloan & satuan, manajemen status, riwayat
v1.1: Dashboard owner, laporan pendapatan, filter & pencarian lanjutan
v1.2: Cetak nota PDF, export laporan Excel, pengaturan harga kiloan & express
v2.0: Notifikasi WhatsApp otomatis, multi-cabang, integrasi kasir digital