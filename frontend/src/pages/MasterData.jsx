import { useEffect, useState, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import '../styles/shared.css';

function Modal({ open, title, onClose, onSave, children, loading }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {children}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Batal</button>
          <button className="btn btn-blue" onClick={onSave} disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MasterData() {
  const [activeTab, setActiveTab] = useState('jenis'); // jenis, paket, kasir
  
  // Data states
  const [jenisList, setJenisList] = useState([]);
  const [paketList, setPaketList] = useState([]);
  const [kasirList, setKasirList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [modalJenis, setModalJenis] = useState({ open: false, form: { nama: '', harga_satuan: '' } });
  const [modalPaket, setModalPaket] = useState({ open: false, form: { nama: '', tipe: 'kiloan', harga_per_kg: '', estimasi_hari: '' } });
  const [modalKasir, setModalKasir] = useState({ open: false, form: { name: '', username: '', password: '', role: 'kasir' } });
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'jenis') {
        const r = await api.get('/api/master/jenis-pakaian');
        setJenisList(r.data?.data || r.data || []);
      } else if (activeTab === 'paket') {
        const r = await api.get('/api/master/paket');
        setPaketList(r.data?.data || r.data || []);
      } else if (activeTab === 'kasir') {
        const r = await api.get('/api/master/users');
        setKasirList(r.data?.data || r.data || []);
      }
    } catch (e) {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { loadData(); }, [loadData]);

  // Handlers for Jenis
  const saveJenis = async () => {
    setSaving(true);
    try {
      if (modalJenis.form.id) {
        await api.put(`/api/master/jenis-pakaian/${modalJenis.form.id}`, modalJenis.form);
      } else {
        await api.post('/api/master/jenis-pakaian', modalJenis.form);
      }
      toast.success('Disimpan');
      setModalJenis({ open: false, form: {} });
      loadData();
    } catch (e) { toast.error('Gagal menyimpan'); } finally { setSaving(false); }
  };
  const deleteJenis = async (id) => {
    if(!window.confirm('Hapus jenis pakaian?')) return;
    try { await api.delete(`/api/master/jenis-pakaian/${id}`); toast.success('Dihapus'); loadData(); } catch(e){ toast.error('Gagal hapus'); }
  };

  // Renderers
  const renderJenis = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn btn-blue" onClick={() => setModalJenis({ open: true, form: { nama: '', harga_satuan: '' } })}>
          <Plus size={15} /> Tambah Jenis
        </button>
      </div>
      <table className="table-card" style={{ width: '100%' }}>
        <thead><tr><th>Nama</th><th>Harga Satuan</th><th>Aksi</th></tr></thead>
        <tbody>
          {jenisList.map(j => (
            <tr key={j.id}>
              <td>{j.nama}</td>
              <td>Rp {Number(j.harga_satuan).toLocaleString('id-ID')}</td>
              <td>
                <button className="btn btn-ghost btn-sm" onClick={() => setModalJenis({ open: true, form: j })}><Pencil size={13}/></button>
                <button className="btn btn-danger btn-sm" onClick={() => deleteJenis(j.id)}><Trash2 size={13}/></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Modal open={modalJenis.open} title={modalJenis.form.id ? 'Edit Jenis' : 'Tambah Jenis'} onClose={() => setModalJenis({...modalJenis, open:false})} onSave={saveJenis} loading={saving}>
        <div className="form-group"><label className="form-label">Nama</label><input type="text" className="form-input" value={modalJenis.form.nama || ''} onChange={e => setModalJenis({...modalJenis, form:{...modalJenis.form, nama:e.target.value}})} /></div>
        <div className="form-group"><label className="form-label">Harga Satuan</label><input type="number" className="form-input" value={modalJenis.form.harga_satuan || ''} onChange={e => setModalJenis({...modalJenis, form:{...modalJenis.form, harga_satuan:e.target.value}})} /></div>
      </Modal>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Master Data</h1>
        <p className="page-subtitle">Kelola data referensi aplikasi</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button className={`btn ${activeTab === 'jenis' ? 'btn-blue' : 'btn-outline'}`} onClick={() => setActiveTab('jenis')}>Jenis Pakaian</button>
        <button className={`btn ${activeTab === 'paket' ? 'btn-blue' : 'btn-outline'}`} onClick={() => setActiveTab('paket')}>Paket Layanan</button>
        <button className={`btn ${activeTab === 'kasir' ? 'btn-blue' : 'btn-outline'}`} onClick={() => setActiveTab('kasir')}>Kelola Kasir</button>
      </div>

      <div className="table-card" style={{ padding: 24 }}>
        {loading ? <p>Memuat...</p> : activeTab === 'jenis' ? renderJenis() : activeTab === 'paket' ? <p>Fitur paket layanan (coming soon)</p> : <p>Fitur kelola kasir (coming soon)</p>}
      </div>
    </div>
  );
}
