import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { TrendingUp, ShoppingBag, Clock, CheckCircle2, CalendarCheck } from 'lucide-react';
import logoImg from '../assets/Logo_Brand.png';
import '../styles/shared.css';

const fmt = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

const STATUS = {
  belum_selesai: { label: 'Belum Selesai', cls: 'badge-amber' },
  siap_diambil:  { label: 'Siap Diambil',  cls: 'badge-emerald' },
  selesai:       { label: 'Selesai',        cls: 'badge-indigo' },
};

export default function DashboardOwner() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Backend mengembalikan { message, data: { ... } } — ambil r.data.data
    api.get('/api/laporan/dashboard')
      .then(r => setStats(r.data?.data || r.data))
      .catch(() => {});
  }, []);

  const cards = stats ? [
    { icon: <ShoppingBag size={20} />, label: 'Total Transaksi', value: stats.totalTransaksi, color: '#00459a', bg: '#eff4ff' },
    { icon: <TrendingUp size={20} />, label: 'Total Pendapatan', value: fmt(stats.totalPendapatan), color: '#059669', bg: '#d1fae5' },
    { icon: <Clock size={20} />, label: 'Transaksi Aktif', value: stats.aktif, color: '#d97706', bg: '#fef3c7' },
    { icon: <CheckCircle2 size={20} />, label: 'Selesai', value: stats.selesai, color: '#7c3aed', bg: '#ede9fe' },
    { icon: <CalendarCheck size={20} />, label: 'Masuk Hari Ini', value: stats.hariIni, color: '#0891b2', bg: '#e0f7fa' },
  ] : [];

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
            Selamat Datang, {user?.username || 'Owner'} 👋
          </h1>
          <p style={{ fontFamily: 'Inter', fontSize: 14, color: 'rgba(10,25,47,0.6)', margin: 0 }}>
            Frezz Laundry — Ringkasan performa bisnis
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16, marginBottom: 24 }}>
        {cards.map(c => (
          <div key={c.label} className="table-card" style={{ padding: 20, display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: c.bg, color: c.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {c.icon}
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, marginBottom: 4 }}>{c.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: c.color, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                {stats ? c.value : '—'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Transaksi Terbaru */}
      {stats?.recent?.length > 0 && (
        <div className="table-card">
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontFamily: 'Inter' }}>Transaksi Terbaru</span>
            <Link to="/transaksi" style={{ color: '#00459a', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>
              Lihat Semua →
            </Link>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Pelanggan</th>
                  <th>Layanan</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent.map(row => (
                  <tr key={row.id}>
                    <td>
                      <Link to={`/transaksi/${row.id}`} style={{ color: '#00459a', fontWeight: 600 }}>
                        {row.kode_order}
                      </Link>
                    </td>
                    <td>{row.pelanggan_nama}</td>
                    <td style={{ textTransform: 'capitalize' }}>
                      {row.layanan} {row.paket === 'express' ? '⚡' : ''}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      Rp {Number(row.total_harga).toLocaleString('id-ID')}
                    </td>
                    <td>
                      <span className={`badge ${STATUS[row.status]?.cls}`}>
                        {STATUS[row.status]?.label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

