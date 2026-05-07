const express = require('express');
const router = express.Router();

const users = require('../controller/users_controller');
const pelanggan = require('../controller/pelanggan_controller');
const jenisPakaian = require('../controller/jenis_pakaian_controller');
const transaksi = require('../controller/tranksaksi_controller');
const riwayat = require('../controller/riwayat_controller');
const laporan = require('../controller/laporan_controller');
const pengaturan = require('../controller/pengaturan_controller');
const { verifyToken, ownerOnly } = require('../middlerware/role');

// AUTH (publik)
router.post('/api/auth/login', users.login);
router.post('/api/auth/logout', users.logout);

// PELANGGAN
router.get('/api/pelanggan', verifyToken, pelanggan.getData_pelanggan);
router.get('/api/pelanggan/:id', verifyToken, pelanggan.getDataByid_Pelanggan);
router.post('/api/pelanggan', verifyToken, pelanggan.postData_pelanggan);
router.put('/api/pelanggan/:id', verifyToken, pelanggan.putData_pelanggan);
router.delete('/api/pelanggan/:id', verifyToken, ownerOnly, pelanggan.deleteData_pelanggan);

// JENIS PAKAIAN
router.get('/api/jenis-pakaian', verifyToken, jenisPakaian.getDataJenisPakaian);
router.post('/api/jenis-pakaian', verifyToken, ownerOnly, jenisPakaian.postDataJenisPakaian);
router.put('/api/jenis-pakaian/:id', verifyToken, ownerOnly, jenisPakaian.putDataJenisPakaian);
router.delete('/api/jenis-pakaian/:id', verifyToken, ownerOnly, jenisPakaian.deleteDataJenisPakaian);

// TRANSAKSI
router.get('/api/transaksi', verifyToken, transaksi.getDataTransaksi);
router.get('/api/transaksi/:id', verifyToken, transaksi.getDataByidTransaksi);
router.post('/api/transaksi', verifyToken, transaksi.postDataTransaksi);
router.patch('/api/transaksi/:id/status', verifyToken, transaksi.patchStatusTransaksi);

// RIWAYAT
router.get('/api/riwayat', verifyToken, riwayat.getRiwayat);

// LAPORAN & DASHBOARD
router.get('/api/laporan/dashboard', verifyToken, laporan.getDashboard);
router.get('/api/laporan/pendapatan', verifyToken, ownerOnly, laporan.getLaporan);

// PENGATURAN
router.get('/api/pengaturan', verifyToken, pengaturan.getPengaturan);
router.put('/api/pengaturan', verifyToken, ownerOnly, pengaturan.putPengaturan);

// PENGGUNA / KASIR (owner only)
router.get('/api/pengguna', verifyToken, ownerOnly, users.getDataUser);
router.post('/api/pengguna', verifyToken, ownerOnly, users.postDataUser);
router.put('/api/pengguna/:id', verifyToken, ownerOnly, users.putDataUser);
router.delete('/api/pengguna/:id', verifyToken, ownerOnly, users.deleteDataUser);

module.exports = router;
