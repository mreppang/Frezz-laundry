import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Search } from 'lucide-react';
import '../styles/shared.css';

export default function Riwayat() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    dari: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    sampai: new Date().toISOString().split('T')[0],
    q: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const r = await api.get('/api/riwayat', { params: filters });
      setData(r.data?.data || []);
    } catch { toast.error('Gagal memuat riwayat'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Riwayat Transaksi</h1>
        <p className="page-subtitle">Arsip transaksi yang telah selesai</p>
      </div>

      <div className="filter-row" style={{ marginBottom: 20 }}>
        <div className="filter-group">
          <label className="filter-label">Dari</label>
          <input type="date" className="filter-input" value={filters.dari}
            onChange={e => setFilters({ ...filters, dari: e.target.value })} />
        </div>
        <div className="filter-group">
          <label className="filter-label">Sampai</label>
          <input type="date" className="filter-input" value={filters.sampai}
            onChange={e => setFilters({ ...filters, sampai: e.target.value })} />
        </div>
        <div className="filter-group">
          <input className="filter-input" placeholder="Cari pelanggan..." value={filters.q}
            onChange={e => setFilters({ ...filters, q: e.target.value })} />
        </div>
        <button className="btn btn-blue" onClick={fetchData} disabled={loading}>
          <Search size={14} /> Cari
        </button>
      </div>

      <div className="table-card">
        <div className="table-wrapper">
          {loading ? <div className="loading-state"><p>Memuat...</p></div>
          : data.length === 0 ? <div className="empty-state"><p>Tidak ada riwayat ditemukan.</p></div>
          : (
            <table>
              <thead>
                <tr>
                  <th>Kode Order</th>
                  <th>Pelanggan</th>
                  <th>Layanan</th>
                  <th>Paket</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                  <th>Selesai Pada</th>
                </tr>
              </thead>
              <tbody>
                {data.map(row => (
                  <tr key={row.id}>
                    <td>
                      <Link to={`/transaksi/${row.id}`} style={{ color: '#00459a', fontWeight: 600 }}>
                        {row.kode_order}
                      </Link>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{row.pelanggan_nama}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>{row.pelanggan_hp}</div>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{row.layanan}</td>
                    <td>
                      <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 4, background: row.paket === 'express' ? '#fef3c7' : '#f0f9ff', color: row.paket === 'express' ? '#b45309' : '#0369a1' }}>
                        {row.paket === 'express' ? '⚡ Express' : 'Normal'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#00459a' }}>
                      Rp {Number(row.total_harga).toLocaleString('id-ID')}
                    </td>
                    <td>{new Date(row.selesai_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
