import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { PlusCircle, RefreshCw, ChevronDown, Check, X, MessageCircle } from 'lucide-react';
import '../styles/shared.css';

const STATUS_LABELS = {
  belum_selesai: { label: 'Belum Selesai', cls: 'badge-amber' },
  siap_diambil:  { label: 'Siap Diambil',  cls: 'badge-emerald' },
  selesai:       { label: 'Selesai',        cls: 'badge-indigo' },  // tetap untuk referensi aksi
};

const nextStatus = (cur) => {
  if (cur === 'belum_selesai') return 'siap_diambil';
  if (cur === 'siap_diambil') return 'selesai';
  return null;
};

const buildWALink = (row) => {
  const hp = row.pelanggan_hp?.replace(/\D/g, '').replace(/^0/, '');
  if (!hp) return null;
  const msg =
    `Halo *${row.pelanggan_nama}*! 👋\n\n` +
    `Cucian Anda di *Frezz Laundry* sudah *siap diambil* 🧺\n\n` +
    `📦 Kode Order : *${row.kode_order}*\n` +
    `🧼 Layanan     : ${row.layanan} ${row.paket === 'express' ? '⚡ Express' : 'Normal'}\n` +
    `💰 Total Harga : *Rp ${Number(row.total_harga).toLocaleString('id-ID')}*\n\n` +
    `Silakan ambil cucian Anda di toko kami.\n` +
    `Terima kasih telah menggunakan Frezz Laundry! 🙏`;
  return `https://wa.me/62${hp}?text=${encodeURIComponent(msg)}`;
};

// Konfirmasi status — menggunakan Portal + centered modal agar tidak terpotong oleh table scroll/backdrop-filter
function StatusActionButton({ row, onConfirm, loading }) {
  const [open, setOpen] = useState(false);
  const ns = nextStatus(row.status);
  if (!ns) return <span style={{ color: '#9ca3af', fontSize: 13 }}>—</span>;

  return (
    <>
      <button
        className="btn btn-outline btn-sm"
        onClick={() => setOpen(true)}
        disabled={loading}
        style={{ display: 'flex', alignItems: 'center', gap: 4 }}
      >
        <ChevronDown size={13} />
        {STATUS_LABELS[ns]?.label}
      </button>

      {open && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(13, 28, 46, 0.35)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16,
          }}
          onClick={() => setOpen(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 14,
              boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
              padding: '20px 22px',
              minWidth: 260,
              maxWidth: 320,
              animation: 'fadeScaleIn 0.18s ease',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12, lineHeight: 1.5, textAlign: 'center' }}>
              Ubah status <strong style={{ color: '#0d1c2e' }}>{row.kode_order}</strong> menjadi:
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, gap: 8 }}>
              <span className={`badge ${STATUS_LABELS[row.status]?.cls}`}>{STATUS_LABELS[row.status]?.label}</span>
              <span style={{ color: '#9ca3af', fontSize: 18 }}>→</span>
              <span className={`badge ${STATUS_LABELS[ns]?.cls}`}>{STATUS_LABELS[ns]?.label}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setOpen(false)}>
                <X size={13} /> Batal
              </button>
              <button className="btn btn-blue btn-sm" style={{ flex: 1, justifyContent: 'center' }}
                disabled={loading}
                onClick={() => { setOpen(false); onConfirm(row.id, ns, row); }}>
                {loading ? '...' : <><Check size={13} /> Ya, Ubah</>}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// Modal pop-out WA setelah status → siap_diambil
function WAPopup({ row, onClose }) {
  if (!row) return null;
  const waLink = buildWALink(row);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 360, margin: '0 16px' }} onClick={e => e.stopPropagation()}>
        {/* Header - compact */}
        <div style={{ background: 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)', borderRadius: '12px 12px 0 0', padding: '16px 20px', textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
            <MessageCircle size={22} color="#fff" />
          </div>
          <h3 style={{ color: '#fff', fontFamily: 'Inter', fontSize: 15, fontWeight: 700, margin: 0 }}>
            Cucian Siap Diambil!
          </h3>
        </div>

        {/* Body - compact */}
        <div style={{ padding: '14px 18px' }}>
          <div style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 12px', marginBottom: 12, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: '#6b7280', fontSize: 12 }}>Pelanggan</span>
              <span style={{ fontWeight: 600, color: '#0d1c2e' }}>{row.pelanggan_nama}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: '#6b7280', fontSize: 12 }}>Kode</span>
              <span style={{ fontWeight: 600, color: '#00459a' }}>{row.kode_order}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280', fontSize: 12 }}>Total</span>
              <span style={{ fontWeight: 700, color: '#00459a' }}>Rp {Number(row.total_harga).toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center', padding: '8px 12px', fontSize: 13 }} onClick={onClose}>
              Lewati
            </button>
            {waLink ? (
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="btn"
                style={{ flex: 2, justifyContent: 'center', background: '#25d366', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: 6, borderRadius: 8, fontWeight: 600, textDecoration: 'none', padding: '8px 12px', fontSize: 13 }}
                onClick={onClose}
              >
                <MessageCircle size={15} /> Kirim WA
              </a>
            ) : (
              <div style={{ flex: 2, padding: '8px', background: '#fee2e2', borderRadius: 8, fontSize: 12, color: '#b91c1c', textAlign: 'center' }}>
                No. HP tidak tersedia
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DaftarTransaksi() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({ status: '', q: '' });
  const [updating, setUpdating] = useState(null);
  const [waPopup, setWaPopup] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter.status) params.status = filter.status;
      if (filter.q) params.q = filter.q;
      const r = await api.get('/api/transaksi', { params });
      setData(r.data?.data || []);
    } catch { toast.error('Gagal memuat data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [filter.status]);

  const updateStatus = async (id, newStatus, row) => {
    setUpdating(id);
    try {
      await api.patch(`/api/transaksi/${id}/status`, { status: newStatus });
      if (newStatus === 'selesai') {
        toast.success('Transaksi selesai! Data dipindahkan ke Riwayat 📋');
      } else {
        toast.success(`Status diperbarui → ${STATUS_LABELS[newStatus]?.label}`);
      }
      if (newStatus === 'siap_diambil') {
        setWaPopup({ ...row, status: newStatus });
      }
      fetchData();
    } catch (e) { toast.error(e.response?.data?.message || 'Gagal update status'); }
    finally { setUpdating(null); }
  };

  // --- Mobile Card View ---
  const renderMobileCards = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 12 }}>
      {data.map(row => {
        const st = STATUS_LABELS[row.status] || {};
        return (
          <div key={row.id} style={{
            background: 'rgba(255,255,255,0.6)',
            borderRadius: 14,
            padding: 16,
            border: '1px solid rgba(255,255,255,0.8)',
            boxShadow: '0 4px 12px rgba(2,136,209,0.06)',
          }}>
            {/* Header: kode + status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Link to={`/transaksi/${row.id}`} style={{ color: '#0288D1', fontWeight: 700, fontSize: 15 }}>
                {row.kode_order}
              </Link>
              <span className={`badge ${st.cls}`}>{st.label}</span>
            </div>
            {/* Info */}
            <div style={{ fontSize: 14, marginBottom: 4 }}>
              <strong>{row.pelanggan_nama}</strong>
              <span style={{ color: 'rgba(10,25,47,0.5)', fontSize: 12, marginLeft: 8 }}>{row.pelanggan_hp}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10, fontSize: 13, color: 'rgba(10,25,47,0.7)' }}>
              <span style={{ textTransform: 'capitalize' }}>{row.layanan}</span>
              <span>•</span>
              <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 4, background: row.paket === 'express' ? '#fef3c7' : '#f0f9ff', color: row.paket === 'express' ? '#b45309' : '#0369a1' }}>
                {row.paket === 'express' ? '⚡ Express' : 'Normal'}
              </span>
            </div>
            {/* Footer: total + aksi */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 10 }}>
              <span style={{ fontWeight: 700, fontSize: 16, color: '#0A192F' }}>
                Rp {Number(row.total_harga).toLocaleString('id-ID')}
              </span>
              <StatusActionButton
                row={row}
                onConfirm={updateStatus}
                loading={updating === row.id}
              />
            </div>
          </div>
        );
      })}
    </div>
  );

  // --- Desktop Table View ---
  const renderDesktopTable = () => (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Kode Order</th>
            <th>Pelanggan</th>
            <th>Layanan</th>
            <th>Paket</th>
            <th>Total</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Aksi Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map(row => {
            const st = STATUS_LABELS[row.status] || {};
            return (
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
                <td style={{ fontWeight: 600 }}>Rp {Number(row.total_harga).toLocaleString('id-ID')}</td>
                <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                <td style={{ textAlign: 'right' }}>
                  <StatusActionButton
                    row={row}
                    onConfirm={updateStatus}
                    loading={updating === row.id}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Daftar Transaksi</h1>
          <p className="page-subtitle">Pantau dan perbarui status cucian</p>
        </div>
        <Link to="/transaksi/baru" className="btn btn-blue">
          <PlusCircle size={15} /> Buat Transaksi
        </Link>
      </div>

      {/* Filter */}
      <div className="filter-row" style={{ marginBottom: 20 }}>
        <div className="filter-group">
          <select className="filter-input" value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}>
            <option value="">Semua Status</option>
            <option value="belum_selesai">Belum Selesai</option>
            <option value="siap_diambil">Siap Diambil</option>
          </select>
        </div>
        <div className="filter-group">
          <input className="filter-input" placeholder="Cari pelanggan..." value={filter.q}
            onChange={e => setFilter({ ...filter, q: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && fetchData()} />
        </div>
        <button className="btn btn-outline" onClick={fetchData} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      <div className="table-card">
        {loading ? (
          <div className="loading-state"><p>Memuat data...</p></div>
        ) : data.length === 0 ? (
          <div className="empty-state"><p>Tidak ada transaksi ditemukan.</p></div>
        ) : isMobile ? renderMobileCards() : renderDesktopTable()}
      </div>

      {waPopup && <WAPopup row={waPopup} onClose={() => setWaPopup(null)} />}
    </div>
  );
}
