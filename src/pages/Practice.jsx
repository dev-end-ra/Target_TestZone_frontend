import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Pencil, ChevronRight, BookOpen, FlaskConical, Calculator, Loader2 } from 'lucide-react';

const SUBJECT_META = {
  Physics:     { icon: BookOpen,     color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  Chemistry:   { icon: FlaskConical, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  Mathematics: { icon: Calculator,   color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
};

function Practice() {
  const navigate = useNavigate();
  const [subjects, setSubjects]   = useState([]);
  const [selected, setSelected]   = useState(null);
  const [chapters, setChapters]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [chapLoading, setChapLoading] = useState(false);

  const token  = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    axios.get('http://localhost:5000/api/practice/subjects', config)
      .then(res => { setSubjects(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSubjectSelect = async (subject) => {
    setSelected(subject);
    setChapLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/practice/${encodeURIComponent(subject)}/chapters`, config);
      setChapters(res.data);
    } catch {}
    setChapLoading(false);
  };

  if (loading) return (
    <div className="page-wrapper flex-center" style={{ height: '70vh' }}>
      <Loader2 size={32} className="animate-spin" color="var(--brand)" />
    </div>
  );

  return (
    <div className="page-wrapper" style={{ maxWidth: '900px' }}>
      <div className="page-header animate-slide-up">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Pencil size={26} color="var(--brand)" /> Chapter-wise Practice</h1>
        <p>Pick a subject, then a chapter to start a focused practice session — no timer, instant feedback.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1.6fr' : '1fr', gap: '24px', transition: 'all 0.3s' }}>

        {/* Subject List */}
        <div className="animate-slide-up" style={{ animationDelay: '0.05s' }}>
          <h4 style={{ marginBottom: '14px', color: 'var(--text-secondary)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700' }}>Select Subject</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {subjects.map((sub, i) => {
              const meta = SUBJECT_META[sub] || { icon: BookOpen, color: 'var(--brand)', bg: 'var(--brand-light)', border: 'var(--brand-border)' };
              const Icon = meta.icon;
              const isActive = selected === sub;
              return (
                <button key={sub} onClick={() => handleSubjectSelect(sub)}
                  className="animate-slide-up"
                  style={{
                    animationDelay: `${i * 0.06}s`,
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '16px 18px',
                    background: isActive ? meta.bg : '#fff',
                    border: `1px solid ${isActive ? meta.color : 'var(--border)'}`,
                    borderRadius: 'var(--radius-lg)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.18s',
                    boxShadow: isActive ? '0 0 0 3px ' + meta.border : 'none',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = 'var(--gray-300)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  <div style={{ width: '40px', height: '40px', background: meta.bg, border: `1px solid ${meta.border}`, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={20} color={meta.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem', color: isActive ? meta.color : 'var(--text-primary)' }}>{sub}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Click to view chapters</div>
                  </div>
                  <ChevronRight size={16} color={isActive ? meta.color : 'var(--gray-400)'} style={{ transition: 'transform 0.15s', transform: isActive ? 'rotate(90deg)' : 'none' }} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Chapter List */}
        {selected && (
          <div className="animate-slide-up">
            <h4 style={{ marginBottom: '14px', color: 'var(--text-secondary)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700' }}>{selected} — Chapters</h4>
            {chapLoading ? (
              <div className="flex-center" style={{ padding: '40px' }}><Loader2 size={24} className="animate-spin" color="var(--brand)" /></div>
            ) : chapters.length === 0 ? (
              <div className="card card-body" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                <p>No chapters found. Questions may not have chapters assigned yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {chapters.map((ch, i) => (
                  <button key={ch} onClick={() => navigate(`/practice/${encodeURIComponent(selected)}/${encodeURIComponent(ch)}`)}
                    className="animate-slide-up"
                    style={{
                      animationDelay: `${i * 0.04}s`,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '13px 16px',
                      background: '#fff',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      fontFamily: 'inherit',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--gray-50)'; e.currentTarget.style.borderColor = 'var(--gray-300)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{ch}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>Practice</span>
                      <ChevronRight size={14} color="var(--gray-400)" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Practice;
