import { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Search, Download } from 'lucide-react';
import '../styles/shared.css';

export default function Laporan() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    dari: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    sampai: new Date().toISOString().split('T')[0],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const r = await api.get('/api/laporan/pendapatan', { params: filters });
      setData(r.data?.data || []);
    } catch { toast.error('Gagal memuat laporan'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const totalPendapatan = data.reduce((a, r) => a + Number(r.total_pendapatan || 0), 0);
  const totalTrx = data.reduce((a, r) => a + Number(r.jumlah_transaksi || 0), 0);

  const exportCSV = () => {
    if (data.length === 0) return;
    const header = ['Tanggal', 'Jumlah Transaksi', 'Total Pendapatan'];
    const rows = data.map(row => [
      new Date(row.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
      row.jumlah_transaksi,
      Number(row.total_pendapatan),
    ]);
    rows.push(['TOTAL', totalTrx, totalPendapatan]);

    const csvContent = [header, ...rows]
      .map(r => r.map(v => `"${v}"`).join(','))
      .join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_Pendapatan_${filters.dari}_sd_${filters.sampai}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Laporan berhasil di-export!');
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Laporan Pendapatan</h1>
          <p className="page-subtitle">Ringkasan pendapatan dari transaksi selesai</p>
        </div>
        <button className="btn btn-outline" onClick={exportCSV} disabled={data.length === 0}><Download size={15} /> Export</button>
      </div>

      <div className="filter-row" style={{ marginBottom: 20 }}>
        <div className="filter-group">
          <label className="filter-label">Dari Tanggal</label>
          <input type="date" className="filter-input" value={filters.dari}
            onChange={e => setFilters({ ...filters, dari: e.target.value })} />
        </div>
        <div className="filter-group">
          <label className="filter-label">Sampai Tanggal</label>
          <input type="date" className="filter-input" value={filters.sampai}
            onChange={e => setFilters({ ...filters, sampai: e.target.value })} />
        </div>
        <button className="btn btn-blue" onClick={fetchData} disabled={loading}>
          <Search size={14} /> Tampilkan
        </button>
      </div>

      <div className="table-card">
        <div className="table-wrapper">
          {loading ? <div className="loading-state"><p>Memuat...</p></div>
          : data.length === 0 ? <div className="empty-state"><p>Tidak ada data pada rentang tanggal ini.</p></div>
          : (
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th style={{ textAlign: 'right' }}>Jumlah Transaksi</th>
                  <th style={{ textAlign: 'right' }}>Total Pendapatan</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i}>
                    <td>{new Date(row.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                    <td style={{ textAlign: 'right' }}>{row.jumlah_transaksi}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#00459a' }}>
                      Rp {Number(row.total_pendapatan).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: '#eff4ff' }}>
                  <td style={{ fontWeight: 700, padding: 16 }}>Total</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, padding: 16 }}>{totalTrx}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, fontSize: 16, color: '#00459a', padding: 16 }}>
                    Rp {totalPendapatan.toLocaleString('id-ID')}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
