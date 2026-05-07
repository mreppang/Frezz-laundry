import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2, MessageCircle } from 'lucide-react';
import '../styles/shared.css';

const fmt = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

export default function BuatTransaksi() {
  const navigate = useNavigate();
  const [pelangganList, setPelangganList] = useState([]);
  const [jenisList, setJenisList] = useState([]);
  const [pengaturan, setPengaturan] = useState({ harga_per_kg: 10000, express_tambahan: 10000 });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(null);

  const [form, setForm] = useState({
    pelanggan_id: '',
    layanan: 'kiloan',
    paket: 'normal',
    berat_kg: '',
    tanggal_masuk: new Date().toISOString().split('T')[0],
    items: [{ jenis_id: '', qty: 1 }],
  });

  const [showNewPelanggan, setShowNewPelanggan] = useState(false);
  const [newP, setNewP] = useState({ nama: '', no_hp: '' });

  useEffect(() => {
    Promise.all([
      api.get('/api/pelanggan'),
      api.get('/api/jenis-pakaian'),
      api.get('/api/pengaturan'),
    ]).then(([p, j, cfg]) => {
      setPelangganList(p.data?.data || []);
      setJenisList(j.data?.data || []);
      if (cfg.data?.data) setPengaturan(cfg.data.data);
    }).catch(() => toast.error('Gagal memuat data'));
  }, []);

  const expressTambahan = form.paket === 'express' ? Number(pengaturan.express_tambahan) : 0;

  // Subtotal per item (express fee TIDAK ditambahkan per item untuk satuan)
  const calcItemSubtotal = (item) => {
    const jenis = jenisList.find(j => String(j.id) === String(item.jenis_id));
    const harga = Number(jenis?.harga || 0);
    return Number(item.qty || 1) * harga;
  };

  const calcTotal = () => {
    if (form.layanan === 'kiloan') {
      // Kiloan: express tambahan per kg
      const hargaKg = Number(pengaturan.harga_per_kg) + expressTambahan;
      return (parseFloat(form.berat_kg) || 0) * hargaKg;
    }
    // Satuan: express tambahan flat ke total saja
    const subtotalItems = form.items.reduce((acc, item) => acc + calcItemSubtotal(item), 0);
    return subtotalItems + (form.paket === 'express' ? expressTambahan : 0);
  };

  const handleSavePelanggan = async () => {
    if (!newP.nama || !newP.no_hp) { toast.error('Nama dan No HP wajib diisi'); return; }
    try {
      const res = await api.post('/api/pelanggan', newP);
      const created = res.data?.data;
      setPelangganList(prev => [...prev, created]);
      setForm(f => ({ ...f, pelanggan_id: String(created.id) }));
      setShowNewPelanggan(false);
      setNewP({ nama: '', no_hp: '' });
      toast.success('Pelanggan ditambahkan!');
    } catch (e) { toast.error(e.response?.data?.message || 'Gagal tambah pelanggan'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.pelanggan_id) { toast.error('Pilih pelanggan'); return; }
    if (form.layanan === 'kiloan' && !form.berat_kg) { toast.error('Berat kg wajib diisi'); return; }
    if (form.layanan === 'satuan' && !form.items.some(i => i.jenis_id)) { toast.error('Pilih minimal 1 item'); return; }

    setLoading(true);
    try {
      const payload = {
        pelanggan_id: form.pelanggan_id,
        layanan: form.layanan,
        paket: form.paket,
        tanggal_masuk: form.tanggal_masuk,
        berat_kg: form.layanan === 'kiloan' ? form.berat_kg : null,
        items: form.layanan === 'satuan'
          ? form.items.filter(i => i.jenis_id).map(i => {
              const jenis = jenisList.find(j => String(j.id) === String(i.jenis_id));
              return { jenis_id: i.jenis_id, qty: i.qty, harga: Number(jenis?.harga || 0) };
            })
          : [],
      };
      const res = await api.post('/api/transaksi', payload);
      const order = res.data?.data;
      setSaved(order);
      toast.success(`Transaksi ${order.kode_order} berhasil dibuat!`);
    } catch (e) { toast.error(e.response?.data?.message || 'Gagal menyimpan'); }
    finally { setLoading(false); }
  };

  const buildWA = () => {
    if (!saved) return '#';
    const pel = pelangganList.find(p => String(p.id) === String(form.pelanggan_id));
    const hp = pel?.no_hp?.replace(/\D/g, '').replace(/^0/, '');
    const msg = `Halo ${pel?.nama}!\nPesanan laundry Anda telah diterima.\nKode Order: ${saved.kode_order}\nLayanan: ${form.layanan} ${form.paket}\nTotal: ${fmt(saved.total_harga)}\nTerima kasih telah menggunakan Frezz Laundry!`;
    return `https://wa.me/62${hp}?text=${encodeURIComponent(msg)}`;
  };

  if (saved) return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      <div className="table-card" style={{ padding: 32, textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#d1fae5', color: '#065f46', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28 }}>✓</div>
        <h2 style={{ fontFamily: 'Inter', fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>Transaksi Berhasil!</h2>
        <p style={{ color: '#424753', margin: '0 0 8px' }}>Kode: <strong style={{ color: '#00459a' }}>{saved.kode_order}</strong></p>
        <p style={{ color: '#424753', margin: '0 0 24px', fontSize: 18, fontWeight: 600 }}>{fmt(saved.total_harga)}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href={buildWA()} target="_blank" rel="noreferrer" className="btn btn-cyan">
            <MessageCircle size={15} /> Kirim WA
          </a>
          <button className="btn btn-blue" onClick={() => {
            setSaved(null);
            setForm({ pelanggan_id: '', layanan: 'kiloan', paket: 'normal', berat_kg: '', tanggal_masuk: new Date().toISOString().split('T')[0], items: [{ jenis_id: '', qty: 1 }] });
          }}>+ Transaksi Baru</button>
          <button className="btn btn-outline" onClick={() => navigate('/transaksi')}>Ke Daftar</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 720 }}>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}><ArrowLeft size={14} /> Kembali</button>
        <div>
          <h1 className="page-title">Buat Transaksi Baru</h1>
          <p className="page-subtitle">Catat order laundry pelanggan</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Pelanggan & Layanan */}
        <div className="table-card" style={{ padding: 24, marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'Inter', fontSize: 15, fontWeight: 700, margin: '0 0 20px' }}>Data Pesanan</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* Pelanggan */}
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Pelanggan *</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <select className="form-input" style={{ flex: 1 }} value={form.pelanggan_id}
                  onChange={e => setForm({ ...form, pelanggan_id: e.target.value })}>
                  <option value="">Pilih atau cari pelanggan...</option>
                  {pelangganList.map(p => (
                    <option key={p.id} value={p.id}>{p.nama} — {p.no_hp}</option>
                  ))}
                </select>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowNewPelanggan(true)}>
                  <Plus size={14} /> Baru
                </button>
              </div>
            </div>

            {/* Layanan */}
            <div className="form-group">
              <label className="form-label">Jenis Layanan *</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['kiloan', 'satuan'].map(l => (
                  <button key={l} type="button"
                    className={`btn ${form.layanan === l ? 'btn-blue' : 'btn-outline'}`}
                    style={{ flex: 1 }}
                    onClick={() => setForm({ ...form, layanan: l, items: [{ jenis_id: '', qty: 1 }], berat_kg: '' })}>
                    {l === 'kiloan' ? '⚖️ Kiloan' : '👕 Satuan'}
                  </button>
                ))}
              </div>
            </div>

            {/* Paket */}
            <div className="form-group">
              <label className="form-label">Paket *</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['normal', 'express'].map(p => (
                  <button key={p} type="button"
                    className={`btn ${form.paket === p ? 'btn-blue' : 'btn-outline'}`}
                    style={{ flex: 1 }}
                    onClick={() => setForm({ ...form, paket: p })}>
                    {p === 'express' ? `⚡ Express (+Rp${Number(pengaturan.express_tambahan).toLocaleString('id-ID')})` : '🔵 Normal'}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Tanggal Masuk</label>
              <input type="date" className="form-input" value={form.tanggal_masuk}
                onChange={e => setForm({ ...form, tanggal_masuk: e.target.value })} required />
            </div>

            {/* Berat untuk kiloan */}
            {form.layanan === 'kiloan' && (
              <div className="form-group">
                <label className="form-label">Berat (kg) *</label>
                <input type="number" step="0.1" min="0.1" className="form-input" placeholder="Contoh: 2.5"
                  value={form.berat_kg} onChange={e => setForm({ ...form, berat_kg: e.target.value })} required />
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                  Harga: Rp{(Number(pengaturan.harga_per_kg) + expressTambahan).toLocaleString('id-ID')}/kg
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Items untuk satuan */}
        {form.layanan === 'satuan' && (
          <div className="table-card" style={{ padding: 24, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontFamily: 'Inter', fontSize: 15, fontWeight: 700, margin: 0 }}>Item Pakaian</h2>
              <button type="button" className="btn btn-outline btn-sm"
                onClick={() => setForm({ ...form, items: [...form.items, { jenis_id: '', qty: 1 }] })}>
                <Plus size={13} /> Tambah Item
              </button>
            </div>
            {form.items.map((item, idx) => {
              const jenis = jenisList.find(j => String(j.id) === String(item.jenis_id));
              const hargaItem = Number(jenis?.harga || 0) + expressTambahan;
              return (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 10, marginBottom: 10, alignItems: 'end' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Jenis Pakaian</label>
                    <select className="form-input" value={item.jenis_id}
                      onChange={e => {
                        const items = [...form.items];
                        items[idx] = { ...items[idx], jenis_id: e.target.value };
                        setForm({ ...form, items });
                      }}>
                      <option value="">Pilih jenis...</option>
                      {jenisList.map(j => (
                        <option key={j.id} value={j.id}>{j.nama_jenis} — Rp{Number(j.harga).toLocaleString('id-ID')}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Jumlah</label>
                    <input type="number" min="1" className="form-input" value={item.qty}
                      onChange={e => {
                        const items = [...form.items];
                        items[idx] = { ...items[idx], qty: e.target.value };
                        setForm({ ...form, items });
                      }} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Subtotal</label>
                    <div style={{ padding: '10px 14px', background: '#eff4ff', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#00459a' }}>
                      {item.jenis_id ? fmt(hargaItem * Number(item.qty || 1)) : 'Rp 0'}
                    </div>
                  </div>
                  {form.items.length > 1 && (
                    <button type="button" className="btn btn-danger btn-sm"
                      onClick={() => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) })}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Total */}
        <div className="table-card" style={{ padding: 24, marginBottom: 16, background: '#eff4ff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontFamily: 'Inter', fontSize: 16, fontWeight: 600 }}>Total Harga</span>
              {form.paket === 'express' && (
                <div style={{ fontSize: 12, color: '#b45309' }}>
                  ⚡ Termasuk tambahan express Rp{Number(pengaturan.express_tambahan).toLocaleString('id-ID')}
                  {form.layanan === 'kiloan' ? '/kg' : ' (biaya express flat)'}
                </div>
              )}
            </div>
            <span style={{ fontFamily: 'Inter', fontSize: 24, fontWeight: 700, color: '#00459a', fontVariantNumeric: 'tabular-nums' }}>
              {fmt(calcTotal())}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" className="btn btn-blue" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
            {loading ? <><span className="spinner" /> Menyimpan...</> : 'Simpan Transaksi'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Batal</button>
        </div>
      </form>

      {/* Modal Pelanggan Baru */}
      {showNewPelanggan && (
        <div className="modal-overlay" onClick={() => setShowNewPelanggan(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Pelanggan Baru</h3>
              <button className="modal-close" onClick={() => setShowNewPelanggan(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Nama *</label>
                  <input type="text" className="form-input" value={newP.nama} onChange={e => setNewP({ ...newP, nama: e.target.value })} placeholder="Nama pelanggan" />
                </div>
                <div className="form-group">
                  <label className="form-label">No. HP *</label>
                  <input type="tel" className="form-input" value={newP.no_hp} onChange={e => setNewP({ ...newP, no_hp: e.target.value })} placeholder="08xx..." />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowNewPelanggan(false)}>Batal</button>
              <button className="btn btn-blue" onClick={handleSavePelanggan}>Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
