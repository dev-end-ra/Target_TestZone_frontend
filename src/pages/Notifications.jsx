import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);

  const token  = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchNotifs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/notifications', config);
      setNotifications(res.data.notifications || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchNotifs(); }, []);

  const markAllRead = async () => {
    await axios.put('http://localhost:5000/api/notifications/read-all', {}, config);
    fetchNotifs();
  };

  const markRead = async (id) => {
    await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, config);
    fetchNotifs();
  };

  const typeColors = {
    success: { bg: 'var(--success-light)', border: 'var(--success-border)', dot: 'var(--success)' },
    warning: { bg: 'var(--warning-light)', border: 'var(--warning-border)', dot: 'var(--warning)' },
    info:    { bg: 'var(--brand-light)',   border: 'var(--brand-border)',   dot: 'var(--brand)'   },
  };

  if (loading) return (
    <div className="page-wrapper flex-center" style={{ height: '60vh' }}>
      <Loader2 size={32} className="animate-spin" color="var(--brand)" />
    </div>
  );

  return (
    <div className="page-wrapper" style={{ maxWidth: '760px' }}>
      <div className="flex-between page-header animate-slide-up">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Bell size={26} color="var(--brand)" />Notifications</h1>
          <p>All your platform announcements and account updates.</p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <button className="btn btn-secondary btn-sm" onClick={markAllRead} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card card-body animate-slide-up" style={{ textAlign: 'center', padding: '64px' }}>
          <Bell size={44} style={{ margin: '0 auto 16px', opacity: 0.2, display: 'block' }} />
          <h4 style={{ marginBottom: '8px' }}>No notifications yet</h4>
          <p>You're all caught up. We'll notify you when something new happens.</p>
        </div>
      ) : (
        <div className="card animate-slide-up" style={{ overflow: 'hidden' }}>
          {notifications.map((n, i) => {
            const c = typeColors[n.type] || typeColors.info;
            return (
              <div key={n._id} onClick={() => !n.isRead && markRead(n._id)}
                style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '18px 24px', borderBottom: i < notifications.length - 1 ? '1px solid var(--gray-100)' : 'none', background: n.isRead ? '#fff' : c.bg, cursor: n.isRead ? 'default' : 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => { if (!n.isRead) e.currentTarget.style.filter = 'brightness(0.97)'; }}
                onMouseLeave={e => e.currentTarget.style.filter = 'none'}
              >
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: n.isRead ? 'var(--gray-300)' : c.dot, flexShrink: 0, marginTop: '6px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: n.isRead ? '500' : '700', fontSize: '0.9rem', color: n.isRead ? 'var(--gray-600)' : 'var(--text-primary)', marginBottom: '3px' }}>{n.title}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{n.message}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    {new Date(n.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                </div>
                {!n.isRead && <span className="badge badge-primary" style={{ flexShrink: 0 }}>New</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Notifications;
