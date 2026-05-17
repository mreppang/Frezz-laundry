import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, ListOrdered, PlusCircle, Users,
  Shirt, BarChart2, LogOut, History, UserCog, Settings, MoreHorizontal, X
} from 'lucide-react';
import logoImg from '../assets/Logo_Brand.png';
import './Sidebar.css';

// Menu items for kasir
const kasirMenu = [
  { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard', mobileLabel: 'Home' },
  { to: '/transaksi', icon: <ListOrdered size={18} />, label: 'Daftar Transaksi', mobileLabel: 'Transaksi' },
  { to: '/transaksi/baru', icon: <PlusCircle size={18} />, label: 'Buat Transaksi', mobileLabel: 'Buat' },
  { to: '/pelanggan', icon: <Users size={18} />, label: 'Pelanggan', mobileLabel: 'Pelanggan' },
  { to: '/riwayat', icon: <History size={18} />, label: 'Riwayat' },
  { to: '/jenis-pakaian', icon: <Shirt size={18} />, label: 'Jenis Pakaian' },
];

// Menu items for owner
const ownerMenu = [
  { to: '/dashboard-owner', icon: <LayoutDashboard size={18} />, label: 'Dashboard Owner', mobileLabel: 'Home' },
  { to: '/transaksi', icon: <ListOrdered size={18} />, label: 'Daftar Transaksi', mobileLabel: 'Transaksi' },
  { to: '/transaksi/baru', icon: <PlusCircle size={18} />, label: 'Buat Transaksi', mobileLabel: 'Buat' },
  { to: '/pelanggan', icon: <Users size={18} />, label: 'Pelanggan', mobileLabel: 'Pelanggan' },
  { to: '/riwayat', icon: <History size={18} />, label: 'Riwayat' },
  { to: '/jenis-pakaian', icon: <Shirt size={18} />, label: 'Jenis Pakaian' },
  { to: '/pengguna', icon: <UserCog size={18} />, label: 'Kelola Kasir' },
  { to: '/laporan', icon: <BarChart2 size={18} />, label: 'Laporan' },
  { to: '/pengaturan', icon: <Settings size={18} />, label: 'Pengaturan' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const menu = user?.role === 'owner' ? ownerMenu : kasirMenu;
  const [moreOpen, setMoreOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close "more" panel on navigation
  useEffect(() => { setMoreOpen(false); }, [location.pathname]);

  const handleLogout = async () => { setMoreOpen(false); await logout(); navigate('/login'); };

  // Mobile: first 4 items go in bottom bar, rest go in "more" panel
  const mobileMainMenu = menu.slice(0, 4);
  const mobileMoreMenu = menu.slice(4);

  // Check if any "more" menu item is currently active
  const isMoreActive = mobileMoreMenu.some(item => location.pathname === item.to);

  if (isMobile) {
    return (
      <>
        {/* Bottom Bar - exactly 5 items: 4 main + "Lainnya" */}
        <aside className="sidebar">
          <nav className="sidebar-nav">
            {mobileMainMenu.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to !== '/transaksi'}
                className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              >
                {item.icon}
                <span>{item.mobileLabel || item.label}</span>
              </NavLink>
            ))}
            <button
              className={`sidebar-link sidebar-more-btn${moreOpen || isMoreActive ? ' active' : ''}`}
              onClick={() => setMoreOpen(o => !o)}
            >
              {moreOpen ? <X size={18} /> : <MoreHorizontal size={18} />}
              <span>Lainnya</span>
            </button>
          </nav>
        </aside>

        {/* Slide-up "More" Panel */}
        {moreOpen && (
          <div className="more-overlay" onClick={() => setMoreOpen(false)}>
            <div className="more-panel" onClick={e => e.stopPropagation()}>
              {/* Panel Header */}
              <div className="more-panel-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img src={logoImg} alt="" style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 8 }} />
                  <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 15, color: '#0A192F' }}>Menu Lainnya</span>
                </div>
                <button className="more-panel-close" onClick={() => setMoreOpen(false)}>
                  <X size={18} />
                </button>
              </div>

              {/* Menu Items */}
              <div className="more-panel-menu">
                {mobileMoreMenu.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end
                    className={({ isActive }) => `more-panel-link${isActive ? ' active' : ''}`}
                    onClick={() => setMoreOpen(false)}
                  >
                    <div className="more-panel-link-icon">{item.icon}</div>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>

              {/* Logout */}
              <div className="more-panel-footer">
                <button className="more-panel-logout" onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop sidebar
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img
          src={logoImg}
          alt="Frezz Laundry Logo"
          style={{ width: 44, height: 44, borderRadius: 12, objectFit: 'contain', background: '#fff', padding: 3, boxShadow: '0 4px 12px rgba(2,136,209,0.12)', flexShrink: 0 }}
        />
        <div>
          <div className="sidebar-brand-name">Frezz Laundry</div>
          <div className="sidebar-brand-role">{user?.role === 'owner' ? 'Owner Panel' : 'Kasir Panel'}</div>
        </div>
      </div>

      <div className="sidebar-user">
        <div className="sidebar-user-avatar">{(user?.username || 'U')[0].toUpperCase()}</div>
        <span className="sidebar-user-name">{user?.username || user?.name}</span>
      </div>

      <nav className="sidebar-nav">
        {menu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to !== '/transaksi'}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
        <button className="sidebar-logout" onClick={handleLogout}>
          <LogOut size={16} />
          <span>Keluar</span>
        </button>
      </nav>
    </aside>
  );
}
