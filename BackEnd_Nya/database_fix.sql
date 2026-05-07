-- =========================================================
-- FIX TABLE: Jalankan script ini jika tabel users sudah ada
-- tapi belum punya kolom username/email
-- Jalankan di phpMyAdmin → pilih database frezz_laundry → tab SQL
-- =========================================================

USE frezz_laundry;

-- Tambah kolom username jika belum ada
ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE AFTER nama,
    ADD COLUMN IF NOT EXISTS email VARCHAR(100) UNIQUE AFTER username;

-- Update akun owner yang sudah ada (sesuaikan nama jika berbeda)
-- Jika tabel users sudah ada datanya, skip bagian INSERT di bawah

-- Cek apakah sudah ada data di tabel users
-- Jika belum ada, jalankan INSERT ini:
-- (password: "password" — sudah di-hash dengan bcrypt)
INSERT IGNORE INTO users (nama, username, email, password, role) VALUES
('Admin Owner', 'owner', 'owner@frezz.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'owner'),
('Kasir Satu',  'kasir', 'kasir@frezz.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'kasir');

-- Pastikan tabel lain sudah ada
CREATE TABLE IF NOT EXISTS pelanggan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    no_hp VARCHAR(20),
    alamat TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS paket_layanan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    tipe ENUM('kiloan', 'satuan') NOT NULL DEFAULT 'kiloan',
    harga_per_kg DECIMAL(10,2) DEFAULT 0,
    estimasi_hari INT DEFAULT 2,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jenis_pakaian (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    harga_satuan DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transaksi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kode_order VARCHAR(20) UNIQUE NOT NULL,
    pelanggan_id INT,
    paket_id INT,
    kasir_id INT,
    tanggal_masuk DATE NOT NULL,
    estimasi_selesai DATE NOT NULL,
    total_harga DECIMAL(10,2) DEFAULT 0,
    catatan TEXT,
    status ENUM('Belum Selesai', 'Siap Diambil', 'Selesai') DEFAULT 'Belum Selesai',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pelanggan_id) REFERENCES pelanggan(id) ON DELETE SET NULL,
    FOREIGN KEY (paket_id) REFERENCES paket_layanan(id) ON DELETE SET NULL,
    FOREIGN KEY (kasir_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS transaksi_detail (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaksi_id INT NOT NULL,
    jenis_pakaian_id INT,
    jumlah INT DEFAULT 1,
    berat DECIMAL(5,2),
    harga_satuan DECIMAL(10,2) DEFAULT 0,
    subtotal DECIMAL(10,2) DEFAULT 0,
    FOREIGN KEY (transaksi_id) REFERENCES transaksi(id) ON DELETE CASCADE,
    FOREIGN KEY (jenis_pakaian_id) REFERENCES jenis_pakaian(id) ON DELETE SET NULL
);

-- Seed paket layanan (jika belum ada)
INSERT IGNORE INTO paket_layanan (nama, tipe, harga_per_kg, estimasi_hari) VALUES
('Regular Kiloan',  'kiloan', 7000,  3),
('Express Kiloan',  'kiloan', 12000, 1),
('Satuan Normal',   'satuan', 0,     2),
('Satuan Express',  'satuan', 0,     1);

-- Seed jenis pakaian (jika belum ada)
INSERT IGNORE INTO jenis_pakaian (nama, harga_satuan) VALUES
('Kaos',          5000),
('Kemeja',        7000),
('Celana Panjang', 8000),
('Jaket',         15000),
('Sepatu',        20000),
('Selimut',       25000);

-- =========================================================
-- AKUN LOGIN:
-- Owner → nama/username: "Admin Owner" atau "owner" | password: password
-- Kasir → nama/username: "Kasir Satu" atau "kasir"  | password: password
-- =========================================================
