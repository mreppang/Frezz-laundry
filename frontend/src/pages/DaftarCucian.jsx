import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { MessageCircle, RefreshCw } from 'lucide-react';
import '../styles/shared.css';

const STATUSES = ['Belum Selesai', 'Siap Diambil', 'Selesai'];
const STATUS_NEXT = {
  'Belum Selesai': 'Siap Diambil',
  'Siap Diambil': 'Selesai',
};
const STATUS_CLS = {
  'Belum Selesai': 'badge-pending',
  'Siap Diambil': 'badge-ready',
  'Selesai': 'badge-done',
};

function buildWALink(transaksi) {
  const hp = transaksi.pelanggan_hp?.replace(/\D/g, '');
  const msg = `Halo ${transaksi.pelanggan_nama}!\nCucian Anda dengan kode ${transaksi.kode_order} sudah selesai dan siap diambil. Kami tunggu kedatangan Anda!\n\n- Frezz Laundry`;
  return `https://wa.me/62${hp?.replace(/^0/, '')}?text=${encodeURIComponent(msg)}`;
}

export default function DaftarCucian() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', tanggal: '', nama: '' });

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.tanggal) params.tanggal = filters.tanggal;
    if (filters.nama) params.nama = filters.nama;
    api.get('/api/transaksi', { params })
      .then((r) => setData(r.data?.data || r.data || []))
      .catch(() => toast.error('Gagal memuat data cucian'))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/api/transaksi/${id}/status`, { status: newStatus });
      toast.success(`Status diperbarui: ${newStatus}`);
      fetchData();
    } catch {
      toast.error('Gagal memperbarui status');
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Daftar Cucian</h1>
          <p className="page-subtitle">Semua transaksi laundry aktif</p>
        </div>
        <Link to="/transaksi/baru" className="btn btn-blue" id="btn-buat-transaksi">+ Buat Transaksi</Link>
      </div>

      {/* Filters */}
      <div className="filter-row">
        <div className="filter-group">
          <label className="filter-label">Status</label>
          <select
            className="filter-select"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">Semua Status</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Tanggal Masuk</label>
          <input
            type="date"
            className="filter-input"
            value={filters.tanggal}
            onChange={(e) => setFilters({ ...filters, tanggal: e.target.value })}
          />
        </div>
        <div className="filter-group">
          <label className="filter-label">Nama Pelanggan</label>
          <input
            type="text"
            className="filter-input"
            placeholder="Cari nama..."
            value={filters.nama}
            onChange={(e) => setFilters({ ...filters, nama: e.target.value })}
          />
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => setFilters({ status: '', tanggal: '', nama: '' })}>
          Reset
        </button>
      </div>

      <div className="table-card">
        <div className="table-card-header">
          <h2 className="table-card-title">Daftar Transaksi</h2>
          <button className="btn btn-ghost btn-sm" onClick={fetchData}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
        <div className="table-wrapper">
          {loading ? (
            <div className="loading-state"><p>Memuat data...</p></div>
          ) : data.length === 0 ? (
            <div className="empty-state"><p>Tidak ada transaksi ditemukan.</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Kode Order</th>
                  <th>Pelanggan</th>
                  <th>Paket</th>
                  <th>Tanggal Masuk</th>
                  <th>Estimasi</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((t) => {
                  const nextStatus = STATUS_NEXT[t.status];
                  const isReady = t.status === 'Siap Diambil';
                  return (
                    <tr key={t.id}>
                      <td>
                        <Link to={`/transaksi/${t.id}`} style={{ color: '#00459a', fontWeight: 600, textDecoration: 'none' }}>
                          {t.kode_order}
                        </Link>
                      </td>
                      <td>{t.pelanggan_nama}</td>
                      <td>{t.paket_nama}</td>
                      <td>{new Date(t.tanggal_masuk).toLocaleDateString('id-ID')}</td>
                      <td>{new Date(t.estimasi_selesai).toLocaleDateString('id-ID')}</td>
                      <td><span className={`badge ${STATUS_CLS[t.status] || 'badge-pending'}`}>{t.status}</span></td>
                      <td>
                        <div className="action-row">
                          {nextStatus && (
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => updateStatus(t.id, nextStatus)}
                              id={`btn-status-${t.id}`}
                            >
                              → {nextStatus}
                            </button>
                          )}
                          {isReady && (
                            <a
                              href={buildWALink(t)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-cyan btn-sm"
                              id={`btn-wa-${t.id}`}
                            >
                              <MessageCircle size={13} /> WA
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        {!loading && data.length > 0 && (
          <div className="table-footer">
            <span>Total: <strong>{data.length}</strong> transaksi</span>
          </div>
        )}
      </div>
    </div>
  );
}
