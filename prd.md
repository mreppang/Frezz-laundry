Baik! Berikut PRD Frezz Laundry dalam teks biasa:

PRODUCT REQUIREMENTS DOCUMENT
Sistem Laundry Berbasis Web — FREZZ LAUNDRY
Versi: 1.0 | Status: Draft | Platform: Web Application

1. Executive Summary
Dokumen ini adalah PRD untuk Sistem Laundry Berbasis Web milik Frezz Laundry. Sistem ini dirancang untuk mendigitalisasi proses pengelolaan bisnis laundry, mulai dari penerimaan cucian, pemrosesan transaksi, pemantauan status, hingga laporan bisnis. Sistem melibatkan tiga aktor utama: Owner, Kasir, dan Pelanggan/Penerima.

2. Product Overview
Tujuan Produk:
Mengotomasi pencatatan transaksi laundry, meningkatkan transparansi informasi antar aktor, menyediakan notifikasi real-time via WhatsApp, dan menghasilkan laporan bisnis yang akurat untuk owner.
Tech Stack:
Frontend: HTML, CSS, JavaScript | Backend: Node.js / Express.js | Database: MySQL | Notifikasi: WhatsApp Click to Chat (wa.me)
Aktor dan Peran:
AktorDeskripsiHak AksesOwnerPemilik bisnis, mengelola sistem keseluruhanFull access semua modulKasirPetugas harian, input transaksi dan kelola cucianTransaksi, Cucian, NotifikasiPelangganPenerima layanan, ambil cucian di outletView pesanan via notifikasi WA

3. Functional Requirements
3.1 Autentikasi

Sistem menyediakan form login dengan username dan password untuk Owner dan Kasir
Sistem mengarahkan pengguna ke dashboard sesuai perannya
Sistem menyediakan fungsi logout yang menghapus sesi aktif
Sistem menampilkan pesan error bila kredensial salah

3.2 Dashboard

Dashboard Owner menampilkan: total transaksi, pendapatan, cucian masuk/selesai, grafik & statistik
Dashboard Kasir menampilkan: ringkasan hari ini dan transaksi terbaru

3.3 Master Data (Owner Only)

Owner dapat menambah, mengedit, dan menghapus jenis pakaian beserta harga layanan
Owner dapat mengelola data pelanggan (tambah, edit, hapus)
Owner dapat mengelola akun kasir (tambah, edit, hapus)
Owner dapat mengatur konfigurasi sistem melalui menu Pengaturan

3.4 Transaksi Baru (Kasir)
Kasir membuat transaksi melalui 6 langkah:

Pilih atau tambah pelanggan
Pilih layanan: Kiloan atau Satuan
Pilih paket: Normal atau Express
Input detail cucian: jenis pakaian, jumlah, berat (jika kiloan)
Isi tanggal masuk dan estimasi selesai
Konfirmasi total harga

Setelah tersimpan, sistem menghasilkan kode order otomatis unik (format: FRZ-XXX). Kasir kemudian dapat: cetak nota, kirim WhatsApp ke pelanggan, atau kembali ke daftar cucian.
3.5 Pengelolaan Cucian

Kasir dapat melihat semua transaksi aktif dengan filter (status, tanggal, pelanggan) dan fitur search
Kasir/Owner dapat mengupdate status cucian: Belum Selesai → Siap Diambil → Selesai
Sistem otomatis mengirim notifikasi WhatsApp saat status berubah ke Siap Diambil
Kasir dapat melihat riwayat transaksi dan mencetak ulang nota

3.6 Laporan (Owner Only)

Owner dapat mengakses laporan pendapatan, transaksi, pelanggan, dan cucian selesai
Owner dapat memfilter laporan berdasarkan tanggal, status, dan kasir
Owner dapat mengekspor laporan dalam format Excel (.xlsx) dan PDF

3.7 Notifikasi WhatsApp

Notifikasi pesanan masuk: dikirim setelah transaksi disimpan, berisi kode order, tanggal masuk, estimasi selesai, total harga, dan daftar cucian
Notifikasi siap diambil: dikirim saat kasir mengubah status ke Siap Diambil
Notifikasi selesai: dikirim saat transaksi dikonfirmasi selesai
Mekanisme: Click to Chat via wa.me (tidak memerlukan WhatsApp Business API berbayar)


4. Non-Functional Requirements

Performa: Halaman utama dan daftar transaksi dimuat dalam < 3 detik
Keamanan: Role-based access control — Owner dan Kasir hanya dapat mengakses halaman sesuai perannya
Keandalan: Data transaksi tidak boleh hilang saat refresh; perubahan data tersimpan secara konsisten
Usability: UI dapat diakses dari browser desktop maupun mobile
Uptime: Target minimal 99% dalam satu bulan operasional
Audit: Sistem mencatat log perubahan status transaksi beserta timestamp dan aktor


5. User Flow
Owner: Login → Dashboard (ringkasan & statistik) → Kelola Master Data → Monitoring Transaksi → Laporan → Export Excel/PDF → Logout
Kasir: Login → Dashboard → Buat Transaksi Baru (6 langkah) → Simpan (kode order otomatis) → Cetak Nota / Kirim WA → Daftar Cucian → Update Status → Kirim WA notifikasi → Riwayat Transaksi → Logout
Pelanggan: Terima WA pesanan masuk → Cek detail pesanan → Terima WA siap diambil → Datang ke outlet → Kasir konfirmasi → Transaksi selesai

6. Manajemen Status Cucian
StatusKeteranganTriggerNotifikasi WABelum SelesaiCucian masih dikerjakanDefault saat transaksi dibuatTidakSiap DiambilCucian selesai, menunggu pengambilanKasir/Owner update manualYaSelesaiCucian sudah diambil pelangganKasir konfirmasi saat pengambilanYa

7. Daftar Halaman (Screen List)
Login, Dashboard Owner, Dashboard Kasir, Kelola Jenis Pakaian, Kelola Pelanggan, Kelola Users/Kasir, Pengaturan Sistem, Buat Transaksi Baru, Daftar Cucian, Update Status Cucian, Riwayat Transaksi, Monitoring Transaksi (Owner), Laporan (Owner), Export Laporan, Cetak Nota.

8. Acceptance Criteria

Transaksi tersimpan dengan kode order unik otomatis dan total harga terhitung benar
Status cucian hanya dapat berubah sesuai urutan yang ditentukan (tidak bisa skip)
Notifikasi WhatsApp terkirim saat status berubah ke Siap Diambil
Owner tidak dapat mengakses halaman Kasir, dan sebaliknya
Export laporan menghasilkan file Excel/PDF yang valid dan dapat dibuka


9. Out of Scope (Versi 1.0)
Payment gateway, aplikasi mobile native, portal login mandiri untuk pelanggan, WhatsApp Business API resmi, sistem multi-cabang, manajemen kapasitas mesin, dan loyalty program pelanggan.

10. Glosarium
Kiloan: Layanan laundry dihitung berdasarkan berat (kg). Satuan: Dihitung per item pakaian. Express: Paket pengerjaan lebih cepat dari Normal. Kode Order: Identifikasi unik transaksi format FRZ-XXX. Click to Chat: Pengiriman WA via tautan wa.me tanpa API berbayar.
