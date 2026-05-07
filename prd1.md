PRD — FREZZ LAUNDRY
Web-based Laundry Management System
Version 1.0 | Draft

1. Deskripsi Produk
Frezz Laundry adalah aplikasi web untuk mengelola operasional bisnis laundry harian. Aplikasi ini membantu kasir mencatat transaksi, memperbarui status cucian, dan mengirim notifikasi ke pelanggan via WhatsApp. Owner dapat memantau transaksi dan melihat laporan bisnis.

2. Aktor
AktorAksesOwnerDashboard, master data, monitoring semua transaksi, laporanKasirDashboard, buat transaksi, kelola cucian, notifikasi WAPelangganTidak login — hanya terima notifikasi WhatsApp

3. Tech Stack
LayerTeknologiFrontendReact + React Router + AxiosBackendNode.js + Express + NodemonAuthJSON Web Token (JWT)ConfigdotenvDatabaseMySQL + mysql2NotifikasiWhatsApp Click to Chat (wa.me)

4. Halaman & Fitur
4.1 Login /login
Semua user

Form input username dan password
Validasi ke endpoint POST /api/auth/login
Simpan token JWT ke localStorage
Redirect ke dashboard sesuai role: owner → /dashboard-owner, kasir → /dashboard
Tampil pesan error jika gagal


4.2 Dashboard Kasir /dashboard
Kasir

Jumlah transaksi hari ini
5 transaksi terbaru beserta status
Tombol shortcut ke Buat Transaksi dan Daftar Cucian


4.3 Dashboard Owner /dashboard-owner
Owner

Total semua transaksi
Total pendapatan (transaksi selesai)
Jumlah cucian masuk dan selesai
Shortcut ke Laporan dan Monitoring Transaksi


4.4 Buat Transaksi /transaksi/baru
Kasir
Form input transaksi baru dengan field:

Pilih pelanggan (dropdown + tombol tambah pelanggan baru)
Pilih paket layanan (kiloan/satuan, normal/express)
Pilih jenis pakaian, isi jumlah dan berat (jika kiloan)
Tanggal masuk dan estimasi selesai (auto-hitung dari paket)
Total harga (auto-kalkulasi)
Catatan (opsional)

Setelah simpan:

Kode order otomatis terbuat (FRZ-001, FRZ-002, dst)
Tombol Cetak Nota (print browser)
Tombol Kirim WhatsApp (buka wa.me dengan pesan terformat)


4.5 Daftar Cucian /cucian
Kasir & Owner

Tabel semua transaksi aktif
Filter berdasarkan status, tanggal, nama pelanggan
Kolom: Kode Order, Pelanggan, Paket, Tanggal Masuk, Estimasi, Status, Aksi
Tombol Update Status per baris:

Belum Selesai → Siap Diambil → Selesai


Saat status berubah ke Siap Diambil: muncul tombol Kirim WA notifikasi


4.6 Detail Transaksi /transaksi/:id
Kasir & Owner

Info lengkap transaksi: kode order, pelanggan, kasir, paket, tanggal, status
Tabel detail item cucian
Tombol cetak ulang nota
Tombol update status


4.7 Pelanggan /pelanggan
Kasir & Owner

Tabel daftar pelanggan
Tambah pelanggan baru (nama, no HP, alamat)
Edit dan hapus pelanggan


4.8 Master Data /master
Owner only
Tiga sub-menu:

Jenis Pakaian — tabel + form tambah/edit/hapus, kolom nama dan harga satuan
Paket Layanan — tabel paket (kiloan/satuan, normal/express, harga/kg, estimasi hari)
Kelola Kasir — tabel user kasir + form tambah/edit/hapus (password di-hash bcrypt)


4.9 Laporan /laporan
Owner only

Filter rentang tanggal (dari — sampai)
Tabel laporan pendapatan per hari (tanggal, jumlah transaksi, total pendapatan)
Total keseluruhan di bagian bawah
Tombol Export (opsional fase 2)


5. API Endpoints
Auth
MethodEndpointAksesKeteranganPOST/api/auth/loginPublicLogin, return JWT
Pelanggan
MethodEndpointAksesKeteranganGET/api/pelangganAllList semua pelangganPOST/api/pelangganAllTambah pelangganPUT/api/pelanggan/:idAllEdit pelangganDELETE/api/pelanggan/:idAllHapus pelanggan
Transaksi
MethodEndpointAksesKeteranganGET/api/transaksiAllList transaksi + filterGET/api/transaksi/:idAllDetail + item cucianPOST/api/transaksiAllBuat transaksi baruPATCH/api/transaksi/:id/statusAllUpdate status cucian
Master Data
MethodEndpointAksesKeteranganGET/api/master/jenis-pakaianAllList jenis pakaianPOST/api/master/jenis-pakaianOwnerTambahPUT/api/master/jenis-pakaian/:idOwnerEditDELETE/api/master/jenis-pakaian/:idOwnerHapusGET/api/master/paketAllList paket layananGET/api/master/usersOwnerList kasir
Laporan
MethodEndpointAksesKeteranganGET/api/laporan/dashboard-ownerOwnerSummary dashboardGET/api/laporan/dashboard-kasirAllSummary hari iniGET/api/laporan/pendapatanOwnerLaporan per tanggal

6. Alur Status Cucian
Belum Selesai  →  Siap Diambil  →  Selesai
   (default)      (kirim WA)     (konfirmasi ambil)
Status hanya bisa maju, tidak bisa mundur.

7. Notifikasi WhatsApp
Dikirim via link https://wa.me/{no_hp}?text={pesan} yang dibuka di tab baru.
Pesanan Masuk:
Halo {nama_pelanggan}!
Pesanan laundry Anda telah diterima.
Kode Order : FRZ-001
Tanggal Masuk : 01/01/2025
Estimasi Selesai : 03/01/2025
Total Harga : Rp 30.000
Terima kasih telah menggunakan Frezz Laundry!
Siap Diambil:
Halo {nama_pelanggan}!
Cucian Anda dengan kode FRZ-001 sudah selesai
dan siap diambil. Kami tunggu kedatangan Anda!

8. Aturan Akses
HalamanOwnerKasirDashboard Owner✅❌Dashboard Kasir❌✅Buat Transaksi❌✅Daftar Cucian✅✅Detail Transaksi✅✅Pelanggan✅✅Master Data✅❌Laporan✅❌
Proteksi dilakukan di frontend via PrivateRoute dan di backend via middleware verifyToken + ownerOnly.

8. Out of Scope (v1.0)

Payment gateway
Aplikasi mobile
Login mandiri untuk pelanggan
Multi-cabang
Export Excel/PDF (fase 2)