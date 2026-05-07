-- =========================================================
-- DATABASE FREZZ LAUNDRY
-- Jalankan script ini di MySQL/phpMyAdmin
-- =========================================================

CREATE DATABASE IF NOT EXISTS frezz_laundry CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE frezz_laundry;

-- =====================================================
-- TABLE: users (kasir & owner)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('owner', 'kasir') NOT NULL DEFAULT 'kasir',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE: pelanggan
-- =====================================================
CREATE TABLE IF NOT EXISTS pelanggan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    no_hp VARCHAR(20),
    alamat TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE: paket_layanan
-- =====================================================
CREATE TABLE IF NOT EXISTS paket_layanan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    tipe ENUM('kiloan', 'satuan') NOT NULL DEFAULT 'kiloan',
    harga_per_kg DECIMAL(10,2) DEFAULT 0,
    estimasi_hari INT DEFAULT 2,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE: jenis_pakaian
-- =====================================================
CREATE TABLE IF NOT EXISTS jenis_pakaian (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    harga_satuan DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE: transaksi
-- =====================================================
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

-- =====================================================
-- TABLE: transaksi_detail (item cucian per transaksi)
-- =====================================================
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

-- =====================================================
-- DATA AWAL (Seed Data)
-- =====================================================

-- Akun Owner (password: admin123)
INSERT INTO users (nama, username, email, password, role) VALUES
('Admin Owner', 'owner', 'owner@frezz.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'owner');

-- Akun Kasir (password: kasir123)
INSERT INTO users (nama, username, email, password, role) VALUES
('Kasir Satu', 'kasir', 'kasir@frezz.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'kasir');

-- Paket layanan contoh
INSERT INTO paket_layanan (nama, tipe, harga_per_kg, estimasi_hari) VALUES
('Regular Kiloan', 'kiloan', 7000, 3),
('Express Kiloan', 'kiloan', 12000, 1),
('Satuan Normal', 'satuan', 0, 2),
('Satuan Express', 'satuan', 0, 1);

-- Jenis pakaian contoh
INSERT INTO jenis_pakaian (nama, harga_satuan) VALUES
('Kaos', 5000),
('Kemeja', 7000),
('Celana Panjang', 8000),
('Jaket', 15000),
('Sepatu', 20000),
('Selimut', 25000);

-- Pelanggan contoh
INSERT INTO pelanggan (nama, no_hp, alamat) VALUES
('Budi Santoso', '081234567890', 'Jl. Merdeka No. 1'),
('Siti Rahayu', '082345678901', 'Jl. Sudirman No. 5'),
('Andi Wijaya', '083456789012', 'Jl. Gatot Subroto No. 10');

-- =====================================================
-- CATATAN PASSWORD DEFAULT:
-- owner   → username: owner   | password: password
-- kasir   → username: kasir   | password: password
-- Hash di atas adalah bcrypt dari "password"
-- =====================================================
