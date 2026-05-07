-- =========================================================
-- DATABASE FREZZ LAUNDRY — versi Fix.md
-- Drop & recreate semua tabel sesuai PRD baru
-- Jalankan di phpMyAdmin → database frezz_laundry → tab SQL
-- =========================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS riwayat;
DROP TABLE IF EXISTS transaksi_detail;
DROP TABLE IF EXISTS transaksi;
DROP TABLE IF EXISTS jenis_pakaian;
DROP TABLE IF EXISTS pelanggan;
DROP TABLE IF EXISTS pengaturan;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- TABLE: users (username only, no email/nama)
-- =====================================================
CREATE TABLE users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role        ENUM('owner','kasir') NOT NULL DEFAULT 'kasir',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE: pelanggan (no_hp UNIQUE)
-- =====================================================
CREATE TABLE pelanggan (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nama        VARCHAR(150) NOT NULL,
    no_hp       VARCHAR(25) NOT NULL UNIQUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE: jenis_pakaian (nama_jenis, harga)
-- =====================================================
CREATE TABLE jenis_pakaian (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nama_jenis  VARCHAR(150) NOT NULL,
    harga       DECIMAL(12,2) DEFAULT 0
);

-- =====================================================
-- TABLE: pengaturan (harga kiloan + express tambahan)
-- =====================================================
CREATE TABLE pengaturan (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    harga_per_kg        DECIMAL(12,2) NOT NULL DEFAULT 10000,
    express_tambahan    DECIMAL(12,2) NOT NULL DEFAULT 10000,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE: transaksi
-- =====================================================
CREATE TABLE transaksi (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    kode_order      VARCHAR(50) NOT NULL UNIQUE,
    pelanggan_id    INT,
    layanan         ENUM('kiloan','satuan') NOT NULL,
    paket           ENUM('normal','express') NOT NULL DEFAULT 'normal',
    berat_kg        DECIMAL(10,2) DEFAULT NULL,
    total_harga     DECIMAL(12,2) DEFAULT 0,
    status          ENUM('belum_selesai','siap_diambil','selesai') NOT NULL DEFAULT 'belum_selesai',
    tanggal_masuk   DATETIME NOT NULL,
    tanggal_selesai DATETIME DEFAULT NULL,
    created_by      INT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pelanggan_id) REFERENCES pelanggan(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- TABLE: transaksi_detail (satuan items)
-- =====================================================
CREATE TABLE transaksi_detail (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    transaksi_id    INT NOT NULL,
    jenis_id        INT,
    qty             INT NOT NULL DEFAULT 1,
    harga           DECIMAL(12,2) NOT NULL DEFAULT 0,
    subtotal        DECIMAL(12,2) NOT NULL DEFAULT 0,
    FOREIGN KEY (transaksi_id) REFERENCES transaksi(id) ON DELETE CASCADE,
    FOREIGN KEY (jenis_id) REFERENCES jenis_pakaian(id) ON DELETE SET NULL
);

-- =====================================================
-- TABLE: riwayat (arsip transaksi selesai)
-- =====================================================
CREATE TABLE riwayat (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    transaksi_id    INT NOT NULL UNIQUE,
    selesai_at      DATETIME NOT NULL,
    FOREIGN KEY (transaksi_id) REFERENCES transaksi(id) ON DELETE CASCADE
);

-- =====================================================
-- SEED DATA
-- =====================================================

-- Akun Owner (password: password)
INSERT INTO users (username, password, role) VALUES
('owner', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'owner'),
('kasir', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'kasir');

-- Jenis pakaian awal
INSERT INTO jenis_pakaian (nama_jenis, harga) VALUES
('Kemeja',    7000),
('Kaos',      5000),
('Celana',    8000),
('Jas',      20000),
('Bed Cover', 25000);

-- Pengaturan default
INSERT INTO pengaturan (harga_per_kg, express_tambahan) VALUES (10000, 10000);

-- =====================================================
-- LOGIN:
-- username: owner | password: password
-- username: kasir | password: password
-- =====================================================
