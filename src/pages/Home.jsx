import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, BarChart2, Star, Users, Trophy, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';

function Home() {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};
  const [stats, setStats] = useState({ totalStudents: 0, totalTests: 0 });
  const [recentTests, setRecentTests] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const testsRes = await axios.get('http://localhost:5000/api/tests', config);
        setRecentTests(testsRes.data.slice(0, 3));

        if (user.role === 'admin') {
          const statsRes = await axios.get('http://localhost:5000/api/admin/stats', config);
          setStats(statsRes.data);
        }
      } catch (err) {
        console.error('Failed to fetch home data', err);
      }
    };
    fetchData();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="page-wrapper">
      {/* Hero Section */}
      <div className="animate-slide-up" style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #4f46e5 50%, #7c3aed 100%)',
        borderRadius: '28px',
        padding: '56px 64px',
        color: 'white',
        marginBottom: '48px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '280px', height: '280px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-80px', right: '200px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }}></div>

        <div style={{ position: 'relative' }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontWeight: '600', fontSize: '1rem', marginBottom: '8px' }}>{greeting}</p>
          <h1 style={{ color: 'white', fontWeight: '900', fontSize: '2.8rem', marginBottom: '16px', lineHeight: 1.1 }}>
            Welcome back, {user.name?.split(' ')[0]}!
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.1rem', maxWidth: '520px', marginBottom: '36px' }}>
            Your preparation journey continues. Let's make today count with a focused practice session.
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button className="btn btn-lg" onClick={() => navigate('/tests')} style={{ background: 'white', color: 'var(--brand)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={20} /> Start Mock Test <ArrowRight size={18} />
            </button>
            <button className="btn btn-lg" onClick={() => navigate('/results')} style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={20} /> View My Results
            </button>
          </div>
        </div>

        {/* Student ID Badge */}
        {user.studentId && (
          <div style={{ position: 'absolute', top: '32px', right: '40px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '16px', padding: '14px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', marginBottom: '4px' }}>Student ID</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'white', letterSpacing: '0.05em' }}>{user.studentId}</div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid-4 stagger animate-slide-up" style={{ marginBottom: '48px' }}>
        {[
          { icon: Trophy, colorClass: 'stat-icon-primary', label: 'Best Score', value: '—' },
          { icon: BookOpen, colorClass: 'stat-icon-success', label: 'Tests Taken', value: '—' },
          { icon: Clock, colorClass: 'stat-icon-warning', label: 'Avg. Time', value: '—' },
          { icon: Star, colorClass: 'stat-icon-accent', label: 'Accuracy', value: '—' },
        ].map((stat, i) => (
          <div key={i} className="stat-card">
            <div className={`stat-icon ${stat.colorClass}`}><stat.icon size={26} /></div>
            <div>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value" style={{ fontSize: '1.6rem' }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Available Tests */}
      <div>
        <div className="flex-between" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--slate-900)' }}>Available Mock Tests</h3>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/tests')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            View All <ArrowRight size={14} />
          </button>
        </div>

        {recentTests.length === 0 ? (
          <div className="card card-body" style={{ textAlign: 'center', padding: '60px', color: 'var(--slate-400)' }}>
            <BookOpen size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
            <p style={{ fontWeight: '600', color: 'var(--slate-500)' }}>No tests available yet. The admin will schedule tests soon.</p>
          </div>
        ) : (
          <div className="grid-3">
            {recentTests.map((test, i) => (
              <TestCard key={test._id} test={test} onStart={() => navigate('/exam')} index={i} />
            ))}
          </div>
        )}
      </div>
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

  const typeColors = { 'MHTCET-PCM': { bg: '#eef2ff', color: '#4f46e5' }, 'MHTCET-PCB': { bg: '#f0fdf4', color: '#059669' }, 'JEE': { bg: '#fff7ed', color: '#d97706' } };
  const tc = typeColors[test.type] || { bg: '#f1f5f9', color: '#64748b' };

  return (
    <div className={`card ${status === 'live' ? 'card-hover' : ''} animate-slide-up`} style={{ animationDelay: `${index * 0.07}s` }}>
      <div className="card-body">
        <div className="flex-between" style={{ marginBottom: '16px' }}>
          <span className="badge" style={{ background: tc.bg, color: tc.color }}>{test.type.replace('MHTCET-', 'MHT-CET ')}</span>
          {status === 'live' && <span className="badge badge-success">Live</span>}
          {status === 'upcoming' && <span className="badge badge-warning">Upcoming</span>}
          {status === 'expired' && <span className="badge badge-neutral">Expired</span>}
        </div>
        <h4 style={{ fontWeight: '700', color: 'var(--slate-900)', marginBottom: '10px' }}>{test.title}</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginBottom: '20px' }}>
          {test.totalQuestions} Questions &bull; {Math.floor(test.durationSeconds / 60)} minutes
        </p>
        <button 
          className={`btn btn-full btn-md ${status === 'live' ? 'btn-primary' : ''}`}
          style={status !== 'live' ? { background: 'var(--slate-100)', color: 'var(--slate-400)', cursor: 'not-allowed' } : {}}
          onClick={status === 'live' ? onStart : undefined}
          disabled={status !== 'live'}
        >
          {status === 'live' ? 'Start Exam' : status === 'upcoming' ? 'Not Started Yet' : 'Test Expired'}
        </button>
      </div>
    </div>
  );
}

export default Home;
