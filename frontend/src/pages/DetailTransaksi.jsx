import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import '../styles/shared.css';

const fmt = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

const STATUS = {
  belum_selesai: { label: 'Belum Selesai', cls: 'badge-amber' },
  siap_diambil:  { label: 'Siap Diambil',  cls: 'badge-emerald' },
  selesai:       { label: 'Selesai',        cls: 'badge-indigo' },
};

const nextStatus = (cur) => {
  if (cur === 'belum_selesai') return 'siap_diambil';
  if (cur === 'siap_diambil') return 'selesai';
  return null;
};

export default function DetailTransaksi() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchData = async () => {
    try {
      const r = await api.get(`/api/transaksi/${id}`);
      setData(r.data);
    } catch { toast.error('Transaksi tidak ditemukan'); navigate('/transaksi'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const updateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await api.patch(`/api/transaksi/${id}/status`, { status: newStatus });
      toast.success(`Status → ${STATUS[newStatus]?.label}`);
      fetchData();
    } catch (e) { toast.error(e.response?.data?.message || 'Gagal update'); }
    finally { setUpdating(false); }
  };

  const buildWA = () => {
    if (!data) return '#';
    const hp = data.pelanggan_hp?.replace(/\D/g, '').replace(/^0/, '');
    const msg = `Halo ${data.pelanggan_nama}!\nCucian Anda sudah *siap diambil*.\nKode Order: ${data.kode_order}\nTotal: ${fmt(data.total_harga)}\nTerima kasih telah menggunakan Frezz Laundry! 🧺`;
    return `https://wa.me/62${hp}?text=${encodeURIComponent(msg)}`;
  };

  if (loading) return <div className="loading-state"><p>Memuat data...</p></div>;
  if (!data) return null;

  const st = STATUS[data.status] || {};
  const ns = nextStatus(data.status);

  return (
    <div style={{ maxWidth: 680 }}>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/transaksi')}><ArrowLeft size={14} /> Kembali</button>
        <div>
          <h1 className="page-title">Detail Transaksi</h1>
          <p className="page-subtitle">{data.kode_order}</p>
        </div>
      </div>

      {/* Header Card */}
      <div className="table-card" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#00459a', fontFamily: 'Inter' }}>{data.kode_order}</div>
            <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
              {new Date(data.tanggal_masuk).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          <span className={`badge ${st.cls}`} style={{ fontSize: 13 }}>{st.label}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginTop: 24 }}>
          {[
            { label: 'Pelanggan', value: data.pelanggan_nama },
            { label: 'No. HP', value: data.pelanggan_hp },
            { label: 'Layanan', value: data.layanan?.charAt(0).toUpperCase() + data.layanan?.slice(1) },
            { label: 'Paket', value: data.paket === 'express' ? '⚡ Express' : '🔵 Normal' },
            { label: 'Kasir', value: data.kasir_nama },
            ...(data.layanan === 'kiloan' ? [{ label: 'Berat', value: `${data.berat_kg} kg` }] : []),
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0d1c2e', marginTop: 4 }}>{item.value || '—'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Items (satuan) */}
      {data.items?.length > 0 && (
        <div className="table-card" style={{ marginBottom: 16 }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', fontWeight: 700 }}>Item Pakaian</div>
          <table>
            <thead><tr><th>Jenis Pakaian</th><th style={{ textAlign: 'center' }}>Qty</th><th style={{ textAlign: 'right' }}>Harga</th><th style={{ textAlign: 'right' }}>Subtotal</th></tr></thead>
            <tbody>
              {data.items.map((item, i) => (
                <tr key={i}>
                  <td>{item.nama_jenis}</td>
                  <td style={{ textAlign: 'center' }}>{item.qty}</td>
                  <td style={{ textAlign: 'right' }}>{fmt(item.harga)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Total */}
      <div className="table-card" style={{ padding: 24, background: '#eff4ff', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 16, fontWeight: 600 }}>Total Harga</span>
          <span style={{ fontSize: 26, fontWeight: 700, color: '#00459a', fontVariantNumeric: 'tabular-nums' }}>{fmt(data.total_harga)}</span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {ns && (
          <button className="btn btn-blue" disabled={updating} onClick={() => updateStatus(ns)} style={{ flex: 1, justifyContent: 'center' }}>
            {updating ? <><span className="spinner" /> Memperbarui...</> : `→ ${STATUS[ns]?.label}`}
          </button>
        )}
        {data.status === 'siap_diambil' && (
          <a href={buildWA()} target="_blank" rel="noreferrer" className="btn btn-cyan">
            <MessageCircle size={15} /> Notif WA
          </a>
        )}
        <Link to="/transaksi" className="btn btn-ghost">Kembali</Link>
      </div>
    </div>
  );
}
