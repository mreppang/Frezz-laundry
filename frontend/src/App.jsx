import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { PrivateRoute, PublicRoute } from './components/PrivateRoute';
import Layout from './components/Layout';

import LoginPage from './pages/Login';
import DashboardKasir from './pages/DashboardKasir';
import DashboardOwner from './pages/DashboardOwner';
import BuatTransaksi from './pages/BuatTransaksi';
import DaftarTransaksi from './pages/DaftarTransaksi';
import DetailTransaksi from './pages/DetailTransaksi';
import Pelanggan from './pages/Pelanggan';
import JenisPakaian from './pages/JenisPakaian';
import Pengguna from './pages/Pengguna';
import Riwayat from './pages/Riwayat';
import Laporan from './pages/Laporan';
import Pengaturan from './pages/Pengaturan';

function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          {/* Kasir & Owner */}
          <Route path="/dashboard" element={<DashboardKasir />} />
          <Route path="/transaksi" element={<DaftarTransaksi />} />
          <Route path="/transaksi/baru" element={<BuatTransaksi />} />
          <Route path="/transaksi/:id" element={<DetailTransaksi />} />
          <Route path="/pelanggan" element={<Pelanggan />} />
          <Route path="/riwayat" element={<Riwayat />} />
          <Route path="/jenis-pakaian" element={<JenisPakaian />} />

          {/* Owner Only */}
          <Route path="/dashboard-owner" element={<PrivateRoute ownerOnly><DashboardOwner /></PrivateRoute>} />
          <Route path="/laporan" element={<PrivateRoute ownerOnly><Laporan /></PrivateRoute>} />
          <Route path="/pengguna" element={<PrivateRoute ownerOnly><Pengguna /></PrivateRoute>} />
          <Route path="/pengaturan" element={<PrivateRoute ownerOnly><Pengaturan /></PrivateRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
