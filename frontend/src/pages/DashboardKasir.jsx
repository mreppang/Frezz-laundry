import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { PlusCircle, ListOrdered, Clock, CheckCircle } from 'lucide-react';
import logoImg from '../assets/Logo_Brand.png';
import '../styles/shared.css';

const STATUS = {
  belum_selesai: { label: 'Belum Selesai', cls: 'badge-amber' },
  siap_diambil:  { label: 'Siap Diambil',  cls: 'badge-emerald' },
  selesai:       { label: 'Selesai',        cls: 'badge-indigo' },
};

export default function DashboardKasir() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Backend mengembalikan { message, data: { ... } } — ambil r.data.data
    api.get('/api/laporan/dashboard')
      .then(r => setStats(r.data?.data || r.data))
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* Branded Welcome Header */}
      <div style={{
        background: 'rgba(255,255,255,0.5)',
        borderRadius: 16,
        padding: '24px 28px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        border: '1px solid rgba(255,255,255,0.8)',
        boxShadow: '0 8px 24px rgba(2,136,209,0.06)',
      }}>
        <img src={logoImg} alt="Frezz Laundry" style={{
          width: 52, height: 52, objectFit: 'contain',
          background: '#fff', borderRadius: 14, padding: 4,
          boxShadow: '0 4px 16px rgba(2,136,209,0.12)',
          flexShrink: 0,
        }} />
        <div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: 22, fontWeight: 700, color: '#0A192F', margin: '0 0 2px' }}>
            Selamat Datang, {user?.username || 'Kasir'} 👋
          </h1>
          <p style={{ fontFamily: 'Inter', fontSize: 14, color: 'rgba(10,25,47,0.6)', margin: 0 }}>
            Frezz Laundry — Ringkasan aktivitas hari ini
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { icon: <ListOrdered size={20} />, label: 'Masuk Hari Ini', value: stats?.hariIni ?? '—', color: '#00459a' },
          { icon: <Clock size={20} />, label: 'Belum Selesai', value: stats?.aktif ?? '—', color: '#d97706' },
          { icon: <CheckCircle size={20} />, label: 'Selesai', value: stats?.selesai ?? '—', color: '#059669' },
        ].map(c => (
          <div key={c.label} className="table-card" style={{ padding: 20, display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: `${c.color}18`, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {c.icon}
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>{c.label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: c.color }}>{c.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Shortcuts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <Link to="/transaksi/baru" className="table-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none', transition: 'box-shadow 0.2s' }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#00459a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PlusCircle size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#0d1c2e' }}>Buat Transaksi</div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>Catat order baru</div>
          </div>
        </Link>
        <Link to="/transaksi" className="table-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none' }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#0891b218', color: '#0891b2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ListOrdered size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#0d1c2e' }}>Daftar Transaksi</div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>Lihat & update status</div>
          </div>
        </Link>
      </div>

      {/* Recent */}
      {stats?.recent?.length > 0 && (
        <div className="table-card">
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700 }}>Transaksi Terbaru</span>
            <Link to="/transaksi" style={{ color: '#00459a', fontSize: 13 }}>Lihat Semua →</Link>
          </div>
          <table>
            <thead><tr><th>Kode</th><th>Pelanggan</th><th>Layanan</th><th>Status</th></tr></thead>
            <tbody>
              {stats.recent.map(row => (
                <tr key={row.id}>
                  <td><Link to={`/transaksi/${row.id}`} style={{ color: '#00459a', fontWeight: 600 }}>{row.kode_order}</Link></td>
                  <td>{row.pelanggan_nama}</td>
                  <td style={{ textTransform: 'capitalize' }}>{row.layanan} {row.paket === 'express' ? '⚡' : ''}</td>
                  <td><span className={`badge ${STATUS[row.status]?.cls}`}>{STATUS[row.status]?.label}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer watermark */}
      <div style={{ textAlign: 'center', marginTop: 32, opacity: 0.3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <img src={logoImg} alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} />
        <span style={{ fontFamily: 'Inter', fontSize: 11, color: '#0A192F' }}>Frezz Laundry Management System</span>
      </div>
    </div>
  );
}

