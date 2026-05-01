import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Camera, Save, User, Mail, Phone, BookOpen,
  Hash, Calendar, CheckCircle2, AlertCircle,
  Trophy, BarChart2, Clock, Shield, Loader2
} from 'lucide-react';

// Generate a gradient background color from a string
const getGradient = (name = '') => {
  const gradients = [
    'linear-gradient(135deg, #4f46e5, #7c3aed)',
    'linear-gradient(135deg, #0ea5e9, #6366f1)',
    'linear-gradient(135deg, #10b981, #0ea5e9)',
    'linear-gradient(135deg, #f59e0b, #ef4444)',
    'linear-gradient(135deg, #8b5cf6, #ec4899)',
    'linear-gradient(135deg, #06b6d4, #3b82f6)',
  ];
  const index = name.charCodeAt(0) % gradients.length;
  return gradients[index];
};

function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const [profile, setProfile] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ type: '', msg: '' });
  const [formData, setFormData] = useState({ name: '', phone: '', targetExam: '' });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarChanged, setAvatarChanged] = useState(false);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, historyRes] = await Promise.all([
          axios.get('http://localhost:5000/api/users/me', config),
          axios.get('http://localhost:5000/api/users/me/submissions', config),
        ]);
        const p = profileRes.data;
        setProfile(p);
        setFormData({ name: p.name || '', phone: p.phone || '', targetExam: p.targetExam || '' });
        if (p.avatar) setAvatarPreview(p.avatar);
        setSubmissions(historyRes.data);
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setSaveStatus({ type: 'error', msg: 'Please select a valid image file (JPG, PNG, etc.)' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        // Compress to max 300x300, JPEG quality 0.75
        const MAX = 300;
        const canvas = document.createElement('canvas');
        const scale = Math.min(MAX / img.width, MAX / img.height, 1);
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL('image/jpeg', 0.75);
        setAvatarPreview(compressed);
        setAvatarChanged(true);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setAvatarChanged(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveStatus({ type: '', msg: '' });
    try {
      const payload = { ...formData };
      if (avatarChanged) payload.avatar = avatarPreview || '';

      const res = await axios.put('http://localhost:5000/api/users/me', payload, config);
      setProfile(res.data);
      setAvatarChanged(false);

      // Refresh localStorage user info
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...stored, name: res.data.name, avatar: res.data.avatar }));

      setSaveStatus({ type: 'success', msg: 'Profile updated successfully!' });
      setTimeout(() => setSaveStatus({ type: '', msg: '' }), 4000);
    } catch (err) {
      setSaveStatus({ type: 'error', msg: err.response?.data?.message || 'Failed to save' });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="page-wrapper flex-center" style={{ height: '70vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid var(--slate-200)', borderTop: '4px solid var(--brand)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: 'var(--slate-400)', fontWeight: '600' }}>Loading profile...</p>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const bestScore = submissions.length ? Math.max(...submissions.map(s => s.totalScore)) : null;
  const avgScore = submissions.length ? Math.round(submissions.reduce((a, s) => a + s.totalScore, 0) / submissions.length) : null;

  return (
    <div className="page-wrapper animate-fade-in" style={{ maxWidth: '1100px' }}>
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your personal information and view your performance statistics.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '28px' }}>

        {/* LEFT: Avatar + Identity Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Avatar Card */}
          <div className="card card-body animate-slide-up" style={{ textAlign: 'center', padding: '40px 28px' }}>
            {/* Avatar */}
            <div style={{ position: 'relative', width: '120px', margin: '0 auto 24px' }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: avatarPreview ? 'none' : getGradient(profile?.name),
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                border: '4px solid white',
                outline: '2px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '3rem', fontWeight: '900', color: 'white' }}>
                    {profile?.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Camera button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--brand)',
                  border: '3px solid white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-md)',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Camera size={16} color="white" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
            </div>

            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--slate-900)', marginBottom: '4px' }}>{profile?.name}</h2>
            <p style={{ color: 'var(--slate-400)', fontSize: '0.88rem', marginBottom: '20px' }}>{profile?.email}</p>

            {profile?.studentId && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--brand-light)',
                color: 'var(--brand)',
                padding: '8px 18px',
                borderRadius: 'var(--r-full)',
                fontWeight: '800',
                fontSize: '1rem',
                letterSpacing: '0.05em',
                marginBottom: '20px',
              }}>
                <Hash size={16} /> {profile.studentId}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className={`badge ${profile?.status === 'approved' ? 'badge-success' : profile?.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                {profile?.status === 'approved' ? <CheckCircle2 size={12} /> : null}
                {profile?.status ? profile.status.charAt(0).toUpperCase() + profile.status.slice(1) : 'Pending'}
              </span>
              {profile?.role === 'admin' && <span className="badge badge-primary"><Shield size={12} /> Admin</span>}
              {profile?.targetExam && <span className="badge badge-neutral">{profile.targetExam}</span>}
            </div>

            {avatarPreview && avatarChanged && (
              <button
                onClick={handleRemoveAvatar}
                className="btn btn-danger btn-sm btn-full"
                style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}
              >
                Remove Photo
              </button>
            )}

            <p style={{ marginTop: '16px', fontSize: '0.75rem', color: 'var(--slate-400)' }}>
              Click the camera icon to upload a photo.<br />Max 2MB, JPG/PNG.
            </p>
          </div>

          {/* Stats Card */}
          <div className="card card-body animate-slide-up" style={{ animationDelay: '0.08s' }}>
            <h4 style={{ marginBottom: '20px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={18} color="var(--brand)" /> Performance Stats
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { icon: BookOpen, color: 'var(--brand)', label: 'Tests Taken', value: submissions.length },
                { icon: Trophy, color: '#f59e0b', label: 'Best Score', value: bestScore ?? '—' },
                { icon: BarChart2, color: 'var(--success)', label: 'Avg Score', value: avgScore ?? '—' },
                { icon: Calendar, color: 'var(--accent)', label: 'Member Since', value: new Date(profile?.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) },
              ].map((stat, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 3 ? '1px solid var(--slate-100)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--slate-600)', fontSize: '0.88rem', fontWeight: '500' }}>
                    <stat.icon size={16} color={stat.color} />
                    {stat.label}
                  </div>
                  <div style={{ fontWeight: '800', color: 'var(--slate-900)', fontSize: '1rem' }}>{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Edit Form */}
        <div className="animate-slide-up" style={{ animationDelay: '0.04s' }}>
          <div className="card">
            <div className="card-header">
              <h3 style={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                <User size={20} color="var(--brand)" /> Personal Information
              </h3>
            </div>
            <div className="card-body">
              {saveStatus.msg && (
                <div className={`alert animate-fade-in ${saveStatus.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '24px' }}>
                  {saveStatus.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  {saveStatus.msg}
                </div>
              )}

              <form onSubmit={handleSave}>
                <div className="grid-2" style={{ marginBottom: '20px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label"><User size={12} style={{ display: 'inline', marginRight: '4px' }} />Full Name</label>
                    <input
                      className="form-input"
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label"><Phone size={12} style={{ display: 'inline', marginRight: '4px' }} />Phone Number</label>
                    <input
                      className="form-input"
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label"><Mail size={12} style={{ display: 'inline', marginRight: '4px' }} />Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="form-input"
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      style={{ backgroundColor: 'var(--slate-50)', color: 'var(--slate-400)', cursor: 'not-allowed', paddingRight: '100px' }}
                    />
                    <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.72rem', fontWeight: '700', color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cannot change</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label"><BookOpen size={12} style={{ display: 'inline', marginRight: '4px' }} />Target Exam</label>
                  <select
                    className="form-select"
                    value={formData.targetExam}
                    onChange={e => setFormData({ ...formData, targetExam: e.target.value })}
                  >
                    <option value="">Select your target exam</option>
                    <option value="MHT-CET (PCM)">MHT-CET (PCM)</option>
                    <option value="MHT-CET (PCB)">MHT-CET (PCB)</option>
                    <option value="JEE">JEE Main / Advanced</option>
                  </select>
                </div>

                {/* Read-only Student ID */}
                <div className="form-group">
                  <label className="form-label"><Hash size={12} style={{ display: 'inline', marginRight: '4px' }} />Student ID</label>
                  <div style={{
                    padding: '12px 16px',
                    background: profile?.studentId ? 'var(--brand-light)' : 'var(--slate-50)',
                    border: '1.5px solid',
                    borderColor: profile?.studentId ? 'var(--brand)' : 'var(--border)',
                    borderRadius: 'var(--r-md)',
                    fontWeight: profile?.studentId ? '800' : '500',
                    color: profile?.studentId ? 'var(--brand)' : 'var(--slate-400)',
                    fontSize: '0.95rem',
                    letterSpacing: profile?.studentId ? '0.06em' : 'normal',
                  }}>
                    {profile?.studentId || 'Not yet assigned — awaiting admin approval'}
                  </div>
                </div>

                <div style={{ paddingTop: '8px', borderTop: '1px solid var(--border)', marginTop: '8px' }}>
                  <button type="submit" className="btn btn-primary btn-lg" disabled={saving} style={{ minWidth: '180px' }}>
                    {saving ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : <><Save size={18} /> Save Changes</>}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Recent Tests */}
          {submissions.length > 0 && (
            <div className="card animate-slide-up" style={{ marginTop: '24px', animationDelay: '0.12s' }}>
              <div className="card-header flex-between">
                <h4 style={{ margin: 0, fontWeight: '700' }}>Recent Tests</h4>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/results')}>View All</button>
              </div>
              <div>
                {submissions.slice(0, 5).map((sub, i) => (
                  <div key={sub._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderBottom: i < Math.min(submissions.length - 1, 4) ? '1px solid var(--slate-100)' : 'none' }}>
                    <div>
                      <div style={{ fontWeight: '700', color: 'var(--slate-800)', fontSize: '0.92rem' }}>{sub.testId?.title || 'Mock Test'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--slate-400)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={12} /> {new Date(sub.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '900', fontSize: '1.3rem', color: sub.totalScore >= 100 ? 'var(--success)' : sub.totalScore >= 50 ? 'var(--warning)' : 'var(--danger)' }}>
                        {sub.totalScore}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)', fontWeight: '600' }}>SCORE</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default Profile;
