import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { History, BarChart2, ChevronRight, Trophy, Clock, Target } from 'lucide-react';

function Results() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/users/me/submissions', { headers: { Authorization: `Bearer ${token}` } });
        setSubmissions(res.data);
      } catch (err) {
        console.error('Failed to fetch results', err);
      }
      setLoading(false);
    };
    fetchSubmissions();
  }, []);

  if (loading) {
    return <div className="page-wrapper flex-center" style={{ height: '70vh' }}><div style={{ width: '48px', height: '48px', border: '4px solid var(--slate-200)', borderTop: '4px solid var(--brand)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
  }

  return (
    <div className="page-wrapper">
      <div className="page-header animate-slide-up">
        <h1>My Results</h1>
        <p>Complete history of all your mock test attempts and performance analysis.</p>
      </div>

      {submissions.length === 0 ? (
        <div className="card card-body animate-fade-in" style={{ textAlign: 'center', padding: '100px 40px' }}>
          <History size={64} style={{ margin: '0 auto 20px', color: 'var(--slate-300)' }} />
          <h3 style={{ color: 'var(--slate-600)', marginBottom: '8px' }}>No tests attempted yet</h3>
          <p style={{ color: 'var(--slate-400)', marginBottom: '24px' }}>Go to Mock Tests and attempt your first exam to see your results here.</p>
          <button className="btn btn-primary btn-md" onClick={() => navigate('/tests')}>Browse Mock Tests</button>
        </div>
      ) : (
        <div className="animate-slide-up">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Test</th>
                  <th>Date</th>
                  <th>Score</th>
                  <th>Time Taken</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub, i) => (
                  <tr key={sub._id}>
                    <td>
                      <div style={{ fontWeight: '700', color: 'var(--slate-900)' }}>{sub.testId?.title || 'MHT-CET Mock Test'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--slate-400)' }}>{sub.testId?.type?.replace('MHTCET-', 'MHT-CET ')}</div>
                    </td>
                    <td style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>{new Date(sub.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td>
                      <span style={{ fontSize: '1.2rem', fontWeight: '800', color: sub.totalScore >= 100 ? 'var(--success)' : sub.totalScore >= 50 ? 'var(--warning)' : 'var(--danger)' }}>
                        {sub.totalScore}
                      </span>
                    </td>
                    <td style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>{Math.floor(sub.timeTakenSeconds / 60)}m {sub.timeTakenSeconds % 60}s</td>
                    <td><span className="badge badge-success">Completed</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-sm btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '5px' }} onClick={() => navigate(`/result/${sub._id}`)}>
                          <BarChart2 size={13} /> Analysis
                        </button>
                        <button className="btn btn-sm btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '5px' }} onClick={() => navigate(`/review/${sub._id}`)}>
                          <ChevronRight size={13} /> Solutions
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Results;
