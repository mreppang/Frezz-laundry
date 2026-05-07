import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { PlusCircle, RefreshCw, ChevronDown, Check, X, MessageCircle } from 'lucide-react';
import '../styles/shared.css';

const STATUS_LABELS = {
  belum_selesai: { label: 'Belum Selesai', cls: 'badge-amber' },
  siap_diambil:  { label: 'Siap Diambil',  cls: 'badge-emerald' },
  selesai:       { label: 'Selesai',        cls: 'badge-indigo' },
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

// Slide-down konfirmasi status
function StatusActionButton({ row, onConfirm, loading }) {
  const [open, setOpen] = useState(false);
  const ns = nextStatus(row.status);
  if (!ns) return <span style={{ color: '#9ca3af', fontSize: 13 }}>—</span>;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        className="btn btn-outline btn-sm"
        onClick={() => setOpen(o => !o)}
        disabled={loading}
        style={{ display: 'flex', alignItems: 'center', gap: 4 }}
      >
        <ChevronDown size={13} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
        {STATUS_LABELS[ns]?.label}
      </button>

      <div style={{
        position: 'absolute',
        top: 'calc(100% + 4px)',
        right: 0,
        zIndex: 100,
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 10,
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        padding: 14,
        minWidth: 220,
        transformOrigin: 'top right',
        transform: open ? 'scaleY(1) translateY(0)' : 'scaleY(0) translateY(-8px)',
        opacity: open ? 1 : 0,
        transition: 'transform 0.18s ease, opacity 0.15s ease',
        pointerEvents: open ? 'auto' : 'none',
      }}>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10, lineHeight: 1.4 }}>
          Ubah status <strong style={{ color: '#0d1c2e' }}>{row.kode_order}</strong> menjadi:
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
          <span className={`badge ${STATUS_LABELS[row.status]?.cls}`}>{STATUS_LABELS[row.status]?.label}</span>
          <span style={{ margin: '0 8px', color: '#9ca3af', fontSize: 16 }}>→</span>
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

      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
      )}
    </div>
  );
}

// Modal pop-out WA setelah status → siap_diambil
function WAPopup({ row, onClose }) {
  if (!row) return null;
  const waLink = buildWALink(row);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)', borderRadius: '12px 12px 0 0', padding: '24px 24px 20px', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <MessageCircle size={28} color="#fff" />
          </div>
          <h3 style={{ color: '#fff', fontFamily: 'Inter', fontSize: 17, fontWeight: 700, margin: 0 }}>
            Cucian Siap Diambil!
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, margin: '6px 0 0' }}>
            Kirim notifikasi ke pelanggan via WhatsApp
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px' }}>
          {/* Info transaksi */}
          <div style={{ background: '#f9fafb', borderRadius: 8, padding: '12px 14px', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: '#6b7280' }}>Pelanggan</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#0d1c2e' }}>{row.pelanggan_nama}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: '#6b7280' }}>No. HP</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{row.pelanggan_hp}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: '#6b7280' }}>Kode Order</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#00459a' }}>{row.kode_order}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: '#6b7280' }}>Total</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#00459a' }}>
                Rp {Number(row.total_harga).toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Preview pesan */}
          <div style={{ background: '#e7fdd8', borderRadius: 8, padding: '10px 12px', marginBottom: 16, fontSize: 12, color: '#1a3c1a', lineHeight: 1.6, whiteSpace: 'pre-line', borderLeft: '3px solid #25d366' }}>
            {`Halo ${row.pelanggan_nama}! 👋\n\nCucian Anda sudah siap diambil 🧺\nKode: ${row.kode_order}\nTotal: Rp ${Number(row.total_harga).toLocaleString('id-ID')}`}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>
              Lewati
            </button>
            {waLink ? (
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="btn"
                style={{ flex: 2, justifyContent: 'center', background: '#25d366', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: 6, borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}
                onClick={onClose}
              >
                <MessageCircle size={16} /> Kirim WhatsApp
              </a>
            ) : (
              <div style={{ flex: 2, padding: '10px', background: '#fee2e2', borderRadius: 8, fontSize: 12, color: '#b91c1c', textAlign: 'center' }}>
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
  const [waPopup, setWaPopup] = useState(null); // row yang baru saja jadi siap_diambil

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
      toast.success(`Status diperbarui → ${STATUS_LABELS[newStatus]?.label}`);

      // Tampilkan WA popup jika status baru = siap_diambil
      if (newStatus === 'siap_diambil') {
        setWaPopup({ ...row, status: newStatus });
      }

      fetchData();
    } catch (e) { toast.error(e.response?.data?.message || 'Gagal update status'); }
    finally { setUpdating(null); }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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
            <option value="selesai">Selesai</option>
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
          )}
        </div>
      </div>

      {/* WA Popup setelah status berubah ke siap_diambil */}
      {waPopup && <WAPopup row={waPopup} onClose={() => setWaPopup(null)} />}
    </div>
  );
}
