import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, Search, Filter, Clock, HelpCircle, ArrowRight, Calendar, AlertCircle } from 'lucide-react';

function MockTests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    axios.get('http://localhost:5000/api/tests', config)
      .then(res => {
        setTests(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || test.type === filterType;
    return matchesSearch && matchesType;
  });

  const examTypes = ['All', 'MHTCET-PCM', 'MHTCET-PCB', 'JEE'];

  if (loading) return (
    <div className="page-wrapper flex-center" style={{ height: '70vh' }}>
      <div className="animate-spin" style={{ width: '30px', height: '30px', border: '3px solid var(--gray-200)', borderTopColor: 'var(--brand)', borderRadius: '50%' }} />
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="page-header animate-slide-up">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BookOpen size={28} color="var(--brand)" /> 
          Mock Test Series
        </h1>
        <p>Attempt full-length mock tests designed to simulate the actual exam environment.</p>
      </div>

      {/* Filters Bar */}
      <div className="animate-slide-up" style={{ 
        display: 'flex', 
        gap: '16px', 
        marginBottom: '32px', 
        flexWrap: 'wrap',
        background: '#fff',
        padding: '16px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        alignItems: 'center'
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search tests by name..." 
            style={{ paddingLeft: '40px', marginBottom: 0 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Filter size={18} color="var(--text-muted)" />
          <div style={{ display: 'flex', gap: '6px' }}>
            {examTypes.map(type => (
              <button 
                key={type} 
                onClick={() => setFilterType(type)}
                className={`btn btn-sm ${filterType === type ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '6px 12px' }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Test Grid */}
      {filteredTests.length === 0 ? (
        <div className="card animate-slide-up" style={{ textAlign: 'center', padding: '80px 20px' }}>
          <AlertCircle size={48} style={{ margin: '0 auto 16px', color: 'var(--gray-300)' }} />
          <h3>No tests found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid-3 stagger">
          {filteredTests.map((test, i) => (
            <TestCard 
              key={test._id} 
              test={test} 
              index={i} 
              onStart={() => navigate('/exam')} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TestCard({ test, onStart, index }) {
  const now = new Date();
  const liveAt = test.liveAt ? new Date(test.liveAt) : null;
  const liveUntil = test.liveUntil ? new Date(test.liveUntil) : null;
  
  let status = 'live';
  if (liveAt && liveAt > now) status = 'upcoming';
  if (liveUntil && liveUntil < now) status = 'expired';

  const typeStyles = {
    'MHTCET-PCM': { color: '#2563eb', bg: '#eff6ff' },
    'MHTCET-PCB': { color: '#059669', bg: '#ecfdf5' },
    'JEE': { color: '#7c3aed', bg: '#f5f3ff' }
  };

  const style = typeStyles[test.type] || { color: 'var(--text-secondary)', bg: 'var(--gray-100)' };

  return (
    <div className="card animate-slide-up" style={{ 
      animationDelay: `${index * 0.05}s`,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      borderTop: `4px solid ${style.color}`
    }}>
      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '24px' }}>
        <div className="flex-between" style={{ marginBottom: '16px' }}>
          <span style={{ 
            fontSize: '0.7rem', 
            fontWeight: '700', 
            padding: '4px 10px', 
            borderRadius: '6px', 
            background: style.bg, 
            color: style.color,
            textTransform: 'uppercase'
          }}>
            {test.type}
          </span>
          {status === 'live' && <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontSize: '0.75rem', fontWeight: '700' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', animation: 'pulse 2s infinite' }} />
            LIVE
          </div>}
          {status === 'upcoming' && <span className="badge badge-warning">Upcoming</span>}
          {status === 'expired' && <span className="badge badge-neutral">Expired</span>}
        </div>

        <h3 style={{ marginBottom: '12px', lineHeight: 1.4, fontSize: '1.15rem' }}>{test.title}</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <HelpCircle size={16} color="var(--gray-400)" />
            <span>{test.totalQuestions || 0} Questions</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <Clock size={16} color="var(--gray-400)" />
            <span>{Math.floor(test.durationSeconds / 60)} Mins</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', gridColumn: 'span 2' }}>
            <Calendar size={16} color="var(--gray-400)" />
            <span>Live until: {liveUntil ? liveUntil.toLocaleDateString() : 'Always'}</span>
          </div>
        </div>

        <div style={{ marginTop: 'auto' }}>
          <button 
            className={`btn btn-full btn-md ${status === 'live' ? 'btn-primary' : 'btn-secondary'}`}
            disabled={status !== 'live'}
            onClick={onStart}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {status === 'live' ? (
              <>Start Test <ArrowRight size={16} /></>
            ) : status === 'upcoming' ? (
              'Not Yet Available'
            ) : (
              'Test Expired'
            )}
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default MockTests;
