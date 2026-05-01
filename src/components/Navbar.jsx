import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { GraduationCap, ChevronDown, LogOut, User, Shield, BookOpen, BarChart2, Home } from 'lucide-react';

function Navbar() {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};

  const isAdmin = user.role === 'admin';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navLinkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    padding: '8px 16px',
    borderRadius: 'var(--r-md)',
    fontWeight: '600',
    fontSize: '0.9rem',
    textDecoration: 'none',
    transition: 'all 0.2s',
    color: isActive ? 'var(--brand)' : 'var(--slate-600)',
    background: isActive ? 'var(--brand-light)' : 'transparent',
  });

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      height: 'var(--navbar-h)',
      background: 'rgba(255, 255, 255, 0.92)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 32px',
      gap: '24px',
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Logo */}
      <div 
        onClick={() => navigate('/home')} 
        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', textDecoration: 'none', flexShrink: 0 }}
      >
        <div style={{
          width: '42px',
          height: '42px',
          background: 'linear-gradient(135deg, var(--brand), #7c3aed)',
          borderRadius: 'var(--r-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-brand)',
        }}>
          <GraduationCap size={22} color="white" />
        </div>
        <div>
          <div style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--slate-900)', lineHeight: 1 }}>Target</div>
          <div style={{ fontWeight: '600', fontSize: '0.72rem', color: 'var(--brand)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>TestZone</div>
        </div>
      </div>

      {/* Center Nav Links */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '4px' }}>
        <NavLink to="/home" style={navLinkStyle}><Home size={16} /> Home</NavLink>
        <NavLink to="/tests" style={navLinkStyle}><BookOpen size={16} /> Mock Tests</NavLink>
        <NavLink to="/results" style={navLinkStyle}><BarChart2 size={16} /> My Results</NavLink>
        {isAdmin && (
          <NavLink to="/admin" style={navLinkStyle}><Shield size={16} /> Admin</NavLink>
        )}
      </div>

      {/* Right: Student ID + Profile Dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
        {user.studentId && (
          <div style={{
            padding: '6px 14px',
            background: 'var(--brand-light)',
            borderRadius: 'var(--r-full)',
            fontSize: '0.78rem',
            fontWeight: '700',
            color: 'var(--brand)',
            letterSpacing: '0.05em',
          }}>
            {user.studentId}
          </div>
        )}

        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button 
            onClick={() => setProfileOpen(p => !p)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'var(--slate-50)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--r-full)',
              padding: '6px 14px 6px 6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--brand), #7c3aed)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '0.9rem',
              color: 'white',
              flexShrink: 0,
              overflow: 'hidden',
            }}>
              {user.avatar
                ? <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : user.name?.charAt(0).toUpperCase()
              }
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--slate-800)', lineHeight: 1.2 }}>{user.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--slate-400)', fontWeight: '500' }}>
                {user.role === 'admin' ? 'Administrator' : 'Student'}
              </div>
            </div>
            <ChevronDown size={16} color="var(--slate-400)" style={{ transition: 'transform 0.2s', transform: profileOpen ? 'rotate(180deg)' : 'none' }} />
          </button>

          {/* Dropdown */}
          {profileOpen && (
            <div className="animate-fade-in" style={{
              position: 'absolute',
              top: 'calc(100% + 12px)',
              right: 0,
              background: 'white',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-lg)',
              boxShadow: 'var(--shadow-xl)',
              minWidth: '220px',
              padding: '8px',
              zIndex: 200,
            }}>
              <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid var(--slate-100)', marginBottom: '6px' }}>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--slate-900)' }}>{user.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>{user.email}</div>
              </div>
              <button
                onClick={() => { navigate('/profile'); setProfileOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 14px', border: 'none', background: 'none', cursor: 'pointer', borderRadius: 'var(--r-sm)', color: 'var(--slate-700)', fontWeight: '500', fontSize: '0.9rem', fontFamily: 'Outfit, sans-serif', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--slate-50)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <User size={16} /> My Profile
              </button>
              <button
                onClick={handleLogout}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 14px', border: 'none', background: 'none', cursor: 'pointer', borderRadius: 'var(--r-sm)', color: 'var(--danger)', fontWeight: '500', fontSize: '0.9rem', fontFamily: 'Outfit, sans-serif', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-light)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
