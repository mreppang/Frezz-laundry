import { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Shirt } from 'lucide-react';
import '../styles/shared.css';

const emptyForm = { nama_jenis: '', harga: '' };

export default function JenisPakaian() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, form: emptyForm });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const r = await api.get('/api/jenis-pakaian');
      setData(r.data?.data || []);
    } catch { toast.error('Gagal memuat data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    if (!modal.form.nama_jenis) { toast.error('Nama jenis wajib diisi'); return; }
    setSaving(true);
    try {
      if (modal.form.id) {
        await api.put(`/api/jenis-pakaian/${modal.form.id}`, modal.form);
      } else {
        await api.post('/api/jenis-pakaian', modal.form);
      }
      toast.success('Disimpan');
      setModal({ open: false, form: emptyForm });
      fetchData();
    } catch (e) { toast.error(e.response?.data?.message || 'Gagal'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, nama) => {
    if (!window.confirm(`Hapus "${nama}"?`)) return;
    try {
      await api.delete(`/api/jenis-pakaian/${id}`);
      toast.success('Dihapus');
      fetchData();
    } catch (e) { toast.error(e.response?.data?.message || 'Gagal'); }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Jenis Pakaian</h1>
          <p className="page-subtitle">Harga per item untuk layanan satuan</p>
        </div>
        <button className="btn btn-blue" onClick={() => setModal({ open: true, form: emptyForm })}>
          <Plus size={15} /> Tambah Jenis
        </button>
      </div>

      <div className="table-card">
        <div className="table-wrapper">
          {loading ? <div className="loading-state"><p>Memuat...</p></div>
          : data.length === 0 ? <div className="empty-state"><Shirt size={32} /><p>Belum ada jenis pakaian.</p></div>
          : (
            <table>
              <thead><tr><th>#</th><th>Nama Jenis</th><th style={{ textAlign: 'right' }}>Harga / item</th><th>Aksi</th></tr></thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={row.id}>
                    <td style={{ color: '#9ca3af' }}>{i + 1}</td>
                    <td style={{ fontWeight: 500 }}>{row.nama_jenis}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#00459a' }}>
                      Rp {Number(row.harga).toLocaleString('id-ID')}
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => setModal({ open: true, form: { id: row.id, nama_jenis: row.nama_jenis, harga: row.harga } })}><Pencil size={13} /></button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row.id, row.nama_jenis)}><Trash2 size={13} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal.open && (
        <div className="modal-overlay" onClick={() => setModal({ open: false, form: emptyForm })}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{modal.form.id ? 'Edit' : 'Tambah'} Jenis Pakaian</h3>
              <button className="modal-close" onClick={() => setModal({ open: false, form: emptyForm })}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Nama Jenis *</label>
                  <input type="text" className="form-input" value={modal.form.nama_jenis}
                    onChange={e => setModal({ ...modal, form: { ...modal.form, nama_jenis: e.target.value } })}
                    placeholder="Kemeja, Kaos, Celana..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Harga per Item (Rp)</label>
                  <input type="number" min="0" className="form-input" value={modal.form.harga}
                    onChange={e => setModal({ ...modal, form: { ...modal.form, harga: e.target.value } })}
                    placeholder="7000" />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal({ open: false, form: emptyForm })}>Batal</button>
              <button className="btn btn-blue" onClick={handleSave} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
