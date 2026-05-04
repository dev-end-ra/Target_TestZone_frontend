import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronDown, LogOut, User, Shield, Menu, X,
         BookOpen, BarChart2, Home, Bell, Pencil, CheckCheck } from 'lucide-react';
import logo from '../assets/logo.png';

function Navbar() {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const profileRef = useRef();
  const notifRef   = useRef();

  const userStr = localStorage.getItem('user');
  const user    = userStr ? JSON.parse(userStr) : {};
  const isAdmin = user.role === 'admin';
  const token   = localStorage.getItem('token');
  const config  = { headers: { Authorization: `Bearer ${token}` } };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/notifications', config);
      setNotifications(res.data.notifications || []);
      setUnread(res.data.unreadCount || 0);
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    await axios.put('http://localhost:5000/api/notifications/read-all', {}, config);
    fetchNotifications();
  };

  const handleMarkRead = async (id) => {
    await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, config);
    fetchNotifications();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current   && !notifRef.current.contains(e.target))   setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, []);

  const linkStyle = ({ isActive }) => ({
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '7px 14px', borderRadius: 'var(--radius-md)',
    fontWeight: '600', fontSize: '0.875rem', textDecoration: 'none',
    transition: 'background 0.15s, color 0.15s',
    color: isActive ? 'var(--brand)' : 'var(--gray-600)',
    background: isActive ? 'var(--brand-light)' : 'transparent',
  });

  const mobileLinkStyle = ({ isActive }) => ({
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '12px 16px', borderRadius: 'var(--radius-md)',
    fontWeight: '600', fontSize: '0.95rem', textDecoration: 'none',
    color: isActive ? 'var(--brand)' : 'var(--gray-700)',
    background: isActive ? 'var(--brand-light)' : 'transparent',
    transition: 'background 0.15s',
  });

  return (
    <>
      {/* ── Floating Navbar ─────────────────────────── */}
      <nav style={{
        position: 'fixed', top: '12px', left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 24px)', maxWidth: '1320px',
        zIndex: 100, height: '62px',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.65)',
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
        display: 'flex', alignItems: 'center', padding: '0 20px', gap: '16px',
      }}>

        {/* Logo */}
        <div onClick={() => navigate('/home')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flexShrink: 0 }}>
          <img src={logo} alt="Target TestZone Logo" style={{ height: '42px', width: 'auto', objectFit: 'contain' }} />
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#111827' }}>Target</div>
            <div style={{ fontWeight: '700', fontSize: '0.6rem', color: 'var(--brand)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>TestZone</div>
          </div>
        </div>

        {/* Desktop nav links */}
        <div className="desktop-nav" style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '2px' }}>
          <NavLink to="/home"     style={linkStyle}><Home      size={15} />Home</NavLink>
          <NavLink to="/tests"    style={linkStyle}><BookOpen  size={15} />Mock Tests</NavLink>
          <NavLink to="/practice" style={linkStyle}><Pencil    size={15} />Practice</NavLink>
          <NavLink to="/results"  style={linkStyle}><BarChart2 size={15} />My Results</NavLink>
          {isAdmin && <NavLink to="/admin" style={linkStyle}><Shield size={15} />Admin</NavLink>}
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>

          {/* Student ID — hide on small screens */}
          {user.studentId && (
            <span className="hide-mobile" style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--brand)', background: 'var(--brand-light)', border: '1px solid var(--brand-border)', borderRadius: 'var(--radius-full)', padding: '4px 10px', letterSpacing: '0.04em' }}>
              {user.studentId}
            </span>
          )}

          {/* Bell */}
          <div style={{ position: 'relative' }} ref={notifRef}>
            <button onClick={() => { setNotifOpen(p => !p); setProfileOpen(false); setMenuOpen(false); }}
              style={{ position: 'relative', width: '36px', height: '36px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.15s' }}>
              <Bell size={17} color="var(--gray-600)" />
              {unread > 0 && (
                <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--danger)', color: 'white', borderRadius: '50%', width: '17px', height: '17px', fontSize: '10px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="animate-fade-in" style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', width: '320px', maxWidth: 'calc(100vw - 32px)', zIndex: 200, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>Notifications</span>
                  {unread > 0 && (
                    <button onClick={handleMarkAllRead} style={{ fontSize: '0.75rem', color: 'var(--brand)', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCheck size={13} /> Mark all read
                    </button>
                  )}
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <Bell size={28} style={{ margin: '0 auto 8px', opacity: 0.3, display: 'block' }} />No notifications yet
                    </div>
                  ) : notifications.slice(0, 8).map(n => (
                    <div key={n._id} onClick={() => handleMarkRead(n._id)}
                      style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-100)', cursor: 'pointer', background: n.isRead ? '#fff' : 'var(--brand-light)', transition: 'background 0.12s' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: n.isRead ? '500' : '700', color: n.isRead ? 'var(--gray-700)' : '#111827' }}>{n.title}</div>
                        {!n.isRead && <div style={{ width: '7px', height: '7px', background: 'var(--brand)', borderRadius: '50%', flexShrink: 0, marginTop: '4px' }} />}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{n.message}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>{new Date(n.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</div>
                    </div>
                  ))}
                </div>
                {notifications.length > 8 && (
                  <div style={{ padding: '10px', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
                    <button onClick={() => { navigate('/notifications'); setNotifOpen(false); }} style={{ fontSize: '0.8rem', color: 'var(--brand)', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}>View all</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Profile — desktop only */}
          <div className="hide-mobile" style={{ position: 'relative' }} ref={profileRef}>
            <button onClick={() => { setProfileOpen(p => !p); setNotifOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: '7px', background: 'rgba(255,255,255,0.7)', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', padding: '4px 12px 4px 4px', cursor: 'pointer', transition: 'border-color 0.15s' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.85rem', color: 'white', overflow: 'hidden', flexShrink: 0 }}>
                {user.avatar ? <img src={user.avatar} alt="pfp" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user.name?.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--gray-800)' }}>{user.name?.split(' ')[0]}</span>
              <ChevronDown size={14} color="var(--gray-400)" style={{ transition: 'transform 0.2s', transform: profileOpen ? 'rotate(180deg)' : 'none' }} />
            </button>
            {profileOpen && (
              <div className="animate-fade-in" style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', minWidth: '200px', padding: '6px', zIndex: 200 }}>
                <div style={{ padding: '10px 12px 8px', borderBottom: '1px solid var(--gray-100)', marginBottom: '4px' }}>
                  <div style={{ fontWeight: '700', fontSize: '0.875rem' }}>{user.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                </div>
                <button onClick={() => { navigate('/profile'); setProfileOpen(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '9px', width: '100%', padding: '9px 12px', border: 'none', background: 'none', cursor: 'pointer', borderRadius: 'var(--radius-sm)', color: 'var(--gray-700)', fontWeight: '500', fontSize: '0.875rem', fontFamily: 'inherit', transition: 'background 0.12s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                  <User size={15} />My Profile
                </button>
                <div style={{ borderTop: '1px solid var(--gray-100)', marginTop: '4px', paddingTop: '4px' }}>
                  <button onClick={handleLogout}
                    style={{ display: 'flex', alignItems: 'center', gap: '9px', width: '100%', padding: '9px 12px', border: 'none', background: 'none', cursor: 'pointer', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontWeight: '500', fontSize: '0.875rem', fontFamily: 'inherit', transition: 'background 0.12s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-light)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                    <LogOut size={15} />Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Hamburger — mobile only */}
          <button className="show-mobile" onClick={() => { setMenuOpen(p => !p); setProfileOpen(false); setNotifOpen(false); }}
            style={{ width: '36px', height: '36px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.7)', display: 'none', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* ── Mobile Slide-down Menu ───────────────────── */}
      {menuOpen && (
        <div className="animate-slide-up" style={{
          position: 'fixed', top: '82px', left: '12px', right: '12px',
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 99, padding: '12px',
        }}>
          {/* User info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 8px 16px', borderBottom: '1px solid var(--border)', marginBottom: '8px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: 'white', overflow: 'hidden', flexShrink: 0 }}>
              {user.avatar ? <img src={user.avatar} alt="pfp" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{user.name}</div>
              {user.studentId && <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--brand)' }}>{user.studentId}</span>}
            </div>
          </div>

          {/* Nav links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '8px' }}>
            {[
              { to: '/home',     icon: Home,      label: 'Home' },
              { to: '/tests',    icon: BookOpen,  label: 'Mock Tests' },
              { to: '/practice', icon: Pencil,    label: 'Practice' },
              { to: '/results',  icon: BarChart2, label: 'My Results' },
              { to: '/profile',  icon: User,      label: 'My Profile' },
              ...(isAdmin ? [{ to: '/admin', icon: Shield, label: 'Admin' }] : []),
            ].map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} style={mobileLinkStyle} onClick={() => setMenuOpen(false)}>
                <Icon size={18} />{label}
              </NavLink>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontWeight: '600', fontSize: '0.9rem', fontFamily: 'inherit' }}>
              <LogOut size={18} />Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
