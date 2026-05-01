import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, Clock, FileText, Search, Filter } from 'lucide-react';

function MockTests() {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/tests', { headers: { Authorization: `Bearer ${token}` } });
        setTests(res.data);
      } catch (err) {
        console.error('Failed to fetch tests', err);
        // Show mock data if empty
        setTests([{
          _id: '663200000000000000000000',
          title: 'MHT-CET Mock Test 1',
          type: 'MHTCET-PCM',
          durationSeconds: 10800,
          totalQuestions: 150,
          liveAt: new Date(Date.now() - 86400000).toISOString(),
          isActive: true
        }]);
      }
      setLoading(false);
    };
    fetchTests();
  }, []);

  const filtered = tests.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'all' || t.type === filterType;
    return matchSearch && matchType;
  });

  const now = new Date();
  const getStatus = (test) => {
    const liveAt = test.liveAt ? new Date(test.liveAt) : null;
    const liveUntil = test.liveUntil ? new Date(test.liveUntil) : null;
    if (liveAt && liveAt > now) return 'upcoming';
    if (liveUntil && liveUntil < now) return 'expired';
    return 'live';
  };

  if (loading) {
    return (
      <div className="page-wrapper flex-center" style={{ height: '70vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid var(--slate-200)', borderTop: '4px solid var(--brand)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ fontWeight: '600', color: 'var(--slate-500)' }}>Loading tests...</p>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="page-header animate-slide-up">
        <h1>Mock Test Library</h1>
        <p>Browse all available mock tests for MHT-CET and JEE. Only live tests can be attempted.</p>
      </div>

      {/* Filters */}
      <div className="animate-slide-up card" style={{ animationDelay: '0.05s', marginBottom: '32px' }}>
        <div className="card-body" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', padding: '20px 24px' }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)', pointerEvents: 'none' }} />
            <input 
              className="form-input" 
              placeholder="Search tests..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              style={{ paddingLeft: '40px' }} 
            />
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Filter size={16} style={{ color: 'var(--slate-400)' }} />
            {['all', 'MHTCET-PCM', 'MHTCET-PCB', 'JEE'].map(t => (
              <button key={t} onClick={() => setFilterType(t)} className={`btn btn-sm ${filterType === t ? 'btn-primary' : 'btn-secondary'}`}>
                {t === 'all' ? 'All' : t.replace('MHTCET-', 'MHT-CET ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card card-body animate-fade-in" style={{ textAlign: 'center', padding: '80px 40px' }}>
          <BookOpen size={56} style={{ margin: '0 auto 20px', color: 'var(--slate-300)' }} />
          <h3 style={{ color: 'var(--slate-600)', marginBottom: '8px' }}>No tests found</h3>
          <p style={{ color: 'var(--slate-400)' }}>Try adjusting your filters or search term.</p>
        </div>
      ) : (
        <div className="grid-3 stagger">
          {filtered.map((test, i) => {
            const status = getStatus(test);
            const typeColors = { 'MHTCET-PCM': { bg: '#eef2ff', color: '#4f46e5', label: 'MHT-CET PCM' }, 'MHTCET-PCB': { bg: '#f0fdf4', color: '#059669', label: 'MHT-CET PCB' }, 'JEE': { bg: '#fff7ed', color: '#d97706', label: 'JEE MAIN' } };
            const tc = typeColors[test.type] || { bg: '#f1f5f9', color: '#64748b', label: test.type };
            
            return (
              <div key={test._id} className={`card ${status === 'live' ? 'card-hover' : ''} animate-slide-up`} style={{ animationDelay: `${i * 0.06}s`, opacity: status === 'expired' ? 0.6 : 1 }}>
                <div className="card-body">
                  <div className="flex-between" style={{ marginBottom: '16px' }}>
                    <span className="badge" style={{ background: tc.bg, color: tc.color }}>{tc.label}</span>
                    {status === 'live' && <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '7px', height: '7px', background: 'var(--success)', borderRadius: '50%', animation: 'pulse-ring 1.5s ease infinite' }}></span>Live</span>}
                    {status === 'upcoming' && <span className="badge badge-warning">Upcoming</span>}
                    {status === 'expired' && <span className="badge badge-neutral">Expired</span>}
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--slate-900)', marginBottom: '12px' }}>{test.title}</h3>

                  <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--slate-500)', fontSize: '0.85rem' }}>
                      <FileText size={14} /> {test.totalQuestions || '—'} Qs
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--slate-500)', fontSize: '0.85rem' }}>
                      <Clock size={14} /> {Math.floor(test.durationSeconds / 60)} min
                    </div>
                  </div>

                  {status === 'upcoming' && test.liveAt && (
                    <div className="alert alert-warning" style={{ marginBottom: '16px', fontSize: '0.82rem', padding: '10px 14px' }}>
                      Starts {new Date(test.liveAt).toLocaleString()}
                    </div>
                  )}

                  <button 
                    className={`btn btn-full btn-md ${status === 'live' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => status === 'live' && navigate('/exam')}
                    disabled={status !== 'live'}
                    style={status !== 'live' ? { cursor: 'not-allowed', opacity: 0.6 } : {}}
                  >
                    {status === 'live' ? 'Begin Exam' : status === 'upcoming' ? 'Not Started Yet' : 'Test Expired'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MockTests;
