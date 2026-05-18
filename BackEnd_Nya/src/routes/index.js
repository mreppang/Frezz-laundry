const express = require('express');
const router = express.Router();

const auth         = require('../middleware/auth');
const checkRole    = require('../middleware/role');

const authCtrl     = require('../controllers/auth_controller');
const pelanggan    = require('../controllers/pelanggan_controller');
const jenisPakaian = require('../controllers/jenis_pakaian_controller');
const transaksi    = require('../controllers/transaksi_controller');
const riwayat      = require('../controllers/riwayat_controller');
const laporan      = require('../controllers/laporan_controller');
const pengaturan   = require('../controllers/pengaturan_controller');
const pengguna     = require('../controllers/pengguna_controller');

// ─────────────────────────────────────────────
// AUTH (publik)
// ─────────────────────────────────────────────
router.post('/api/auth/login',  authCtrl.login);
router.post('/api/auth/logout', authCtrl.logout);

// ─────────────────────────────────────────────
// PELANGGAN
// ─────────────────────────────────────────────
router.get('/api/pelanggan',        auth, pelanggan.getData_pelanggan);
router.get('/api/pelanggan/:id',    auth, pelanggan.getDataByid_Pelanggan);
router.post('/api/pelanggan',       auth, pelanggan.postData_pelanggan);
router.put('/api/pelanggan/:id',    auth, pelanggan.putData_pelanggan);
router.delete('/api/pelanggan/:id', auth, checkRole('owner'), pelanggan.deleteData_pelanggan);

// ─────────────────────────────────────────────
// JENIS PAKAIAN
// ─────────────────────────────────────────────
router.get('/api/jenis-pakaian',        auth, jenisPakaian.getDataJenisPakaian);
router.post('/api/jenis-pakaian',       auth, checkRole('owner'), jenisPakaian.postDataJenisPakaian);
router.put('/api/jenis-pakaian/:id',    auth, checkRole('owner'), jenisPakaian.putDataJenisPakaian);
router.delete('/api/jenis-pakaian/:id', auth, checkRole('owner'), jenisPakaian.deleteDataJenisPakaian);

// ─────────────────────────────────────────────
// TRANSAKSI
// ─────────────────────────────────────────────
router.get('/api/transaksi',               auth, transaksi.getDataTransaksi);
router.get('/api/transaksi/:id',           auth, transaksi.getDataByidTransaksi);
router.post('/api/transaksi',              auth, transaksi.postDataTransaksi);
router.patch('/api/transaksi/:id/status',  auth, transaksi.patchStatusTransaksi);

// ─────────────────────────────────────────────
// RIWAYAT
// ─────────────────────────────────────────────
router.get('/api/riwayat', auth, riwayat.getRiwayat);

// ─────────────────────────────────────────────
// LAPORAN & DASHBOARD
// ─────────────────────────────────────────────
router.get('/api/laporan/dashboard',  auth, laporan.getDashboard);
router.get('/api/laporan/pendapatan', auth, checkRole('owner'), laporan.getLaporan);
router.get('/api/laporan/export',     auth, checkRole('owner'), laporan.getExportDetail);

// ─────────────────────────────────────────────
// PENGATURAN
// ─────────────────────────────────────────────
router.get('/api/pengaturan', auth, pengaturan.getPengaturan);
router.put('/api/pengaturan', auth, checkRole('owner'), pengaturan.putPengaturan);

// ─────────────────────────────────────────────
// PENGGUNA / KASIR (owner only)
// ─────────────────────────────────────────────
router.get('/api/pengguna',        auth, checkRole('owner'), pengguna.getDataUser);
router.post('/api/pengguna',       auth, checkRole('owner'), pengguna.postDataUser);
router.put('/api/pengguna/:id',    auth, checkRole('owner'), pengguna.putDataUser);
router.delete('/api/pengguna/:id', auth, checkRole('owner'), pengguna.deleteDataUser);

module.exports = router;
