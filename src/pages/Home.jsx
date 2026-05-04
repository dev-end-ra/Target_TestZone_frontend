import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, BarChart2, Trophy, Clock, Target, Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';

function Home() {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};
  const [recentTests, setRecentTests] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [testsRes, histRes] = await Promise.all([
          axios.get('http://localhost:5000/api/tests', config),
          axios.get('http://localhost:5000/api/users/me/submissions', config),
        ]);
        setRecentTests(testsRes.data.slice(0, 3));
        setSubmissions(histRes.data);
      } catch {}
    };
    fetchData();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const bestScore = submissions.length ? Math.max(...submissions.map(s => s.totalScore)) : null;
  const avgScore  = submissions.length ? Math.round(submissions.reduce((a, s) => a + s.totalScore, 0) / submissions.length) : null;

  return (
    <div className="page-wrapper">

      {/* Hero — clean two-column, NO gradient */}
      <div className="animate-slide-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '36px 40px', marginBottom: '32px', borderLeft: '4px solid var(--brand)' }}>
        <div>
          <p style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>{greeting}</p>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>Welcome back, {user.name?.split(' ')[0]}!</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '440px' }}>
            Keep your preparation on track. Browse live tests, practice chapter-wise, or review your past results.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-primary btn-md" onClick={() => navigate('/tests')} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <BookOpen size={16} /> Start Mock Test <ArrowRight size={15} />
            </button>
            <button className="btn btn-secondary btn-md" onClick={() => navigate('/practice')} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <Pencil size={16} /> Chapter Practice
            </button>
          </div>
        </div>
        {user.studentId && (
          <div style={{ textAlign: 'center', background: 'var(--gray-50)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 28px', flexShrink: 0 }}>
            <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Student ID</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--brand)', letterSpacing: '0.04em' }}>{user.studentId}</div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid-4 stagger animate-slide-up" style={{ marginBottom: '32px' }}>
        {[
          { icon: Trophy,   cls: 'stat-icon-warning', label: 'Best Score',   value: bestScore ?? '—' },
          { icon: BookOpen, cls: 'stat-icon-primary', label: 'Tests Taken',  value: submissions.length || '—' },
          { icon: BarChart2,cls: 'stat-icon-success', label: 'Avg Score',    value: avgScore ?? '—' },
          { icon: Target,   cls: 'stat-icon-neutral', label: 'Target Exam',  value: user.targetExam?.split(' ')[0] || '—' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className={`stat-icon ${s.cls}`}><s.icon size={22} /></div>
            <div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ fontSize: '1.5rem' }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Available Tests */}
      <div>
        <div className="flex-between" style={{ marginBottom: '20px' }}>
          <h3>Available Tests</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/tests')} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>View all <ArrowRight size={14} /></button>
        </div>
        {recentTests.length === 0 ? (
          <div className="card card-body" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            <BookOpen size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p>No tests scheduled yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid-3">
            {recentTests.map((test, i) => <TestCard key={test._id} test={test} index={i} onStart={() => navigate('/exam')} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function TestCard({ test, onStart, index }) {
  const now      = new Date();
  const liveAt   = test.liveAt    ? new Date(test.liveAt)    : null;
  const liveUntil= test.liveUntil ? new Date(test.liveUntil) : null;
  let status = 'live';
  if (liveAt && liveAt > now)    status = 'upcoming';
  if (liveUntil && liveUntil < now) status = 'expired';

  const typeLabel = { 'MHTCET-PCM': 'MHT-CET PCM', 'MHTCET-PCB': 'MHT-CET PCB', 'JEE': 'JEE Main' };

  return (
    <div className={`card ${status === 'live' ? 'card-hover' : ''} animate-slide-up`} style={{ animationDelay: `${index * 0.07}s`, opacity: status === 'expired' ? 0.6 : 1 }}>
      <div className="card-body">
        <div className="flex-between" style={{ marginBottom: '14px' }}>
          <span className="badge badge-neutral">{typeLabel[test.type] || test.type}</span>
          {status === 'live'     && <span className="badge badge-success">Live</span>}
          {status === 'upcoming' && <span className="badge badge-warning">Upcoming</span>}
          {status === 'expired'  && <span className="badge badge-neutral">Expired</span>}
        </div>
        <h4 style={{ marginBottom: '8px' }}>{test.title}</h4>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '20px', display: 'flex', gap: '14px' }}>
          <span>{test.totalQuestions || '—'} Questions</span>
          <span><Clock size={12} style={{ display: 'inline', marginRight: '3px' }} />{Math.floor(test.durationSeconds / 60)} min</span>
        </p>
        <button className={`btn btn-full btn-md ${status === 'live' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={status === 'live' ? onStart : undefined} disabled={status !== 'live'}>
          {status === 'live' ? 'Begin Exam' : status === 'upcoming' ? 'Not Started Yet' : 'Test Expired'}
        </button>
      </div>
    </div>
  );
}

export default Home;
