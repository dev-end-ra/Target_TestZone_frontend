import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Clock, ChevronLeft, ChevronRight, CheckCircle2, Flag, Trash2, User, Info } from 'lucide-react';

function Exam() {
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeSpent, setTimeSpent] = useState({});
  const [statuses, setStatuses] = useState({});
  const [timeLeft, setTimeLeft] = useState(10800);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const TEST_ID = '69f48bb83cf17bcb737fbde6'; // Your seeded Test ID
        const res = await axios.get(`http://localhost:5000/api/tests/${TEST_ID}/questions`, config);
        setQuestions(res.data.questions);
        setTimeLeft(res.data.durationSeconds);
        const initialStatuses = {};
        res.data.questions.forEach((_, idx) => {
          initialStatuses[idx] = idx === 0 ? 'not-answered' : 'not-visited';
        });
        setStatuses(initialStatuses);
        setLoading(false);
      } catch (err) { setLoading(false); }
    };
    fetchExam();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); handleSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [questions]);

  useEffect(() => {
    const qTimer = setInterval(() => {
      setTimeSpent(prev => ({ ...prev, [currentQIndex]: (prev[currentQIndex] || 0) + 1 }));
    }, 1000);
    return () => clearInterval(qTimer);
  }, [currentQIndex]);

  const handleSubmit = async () => {
    if (window.confirm('Are you sure you want to finish and submit the test?')) {
      try {
        const formattedAnswers = questions.map((q, idx) => ({
          questionId: q._id,
          selectedOptionIndex: answers[idx] !== undefined ? answers[idx] : null,
          timeSpentSeconds: timeSpent[idx] || 0
        }));
        const TEST_ID = '69f48bb83cf17bcb737fbde6';
        const res = await axios.post(`http://localhost:5000/api/tests/${TEST_ID}/submit`, 
          { answers: formattedAnswers, timeTakenSeconds: 10800 - timeLeft }, config
        );
        navigate(`/result/${res.data.submissionId}`);
      } catch (err) { alert('Submission failed. Check connection.'); }
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSaveAndNext = () => {
    setStatuses(prev => ({
      ...prev,
      [currentQIndex]: answers[currentQIndex] !== undefined ? 'answered' : 'not-answered'
    }));
    if (currentQIndex < questions.length - 1) setCurrentQIndex(currentQIndex + 1);
  };

  const handleMarkForReview = () => {
    setStatuses(prev => ({
      ...prev,
      [currentQIndex]: answers[currentQIndex] !== undefined ? 'marked-answered' : 'marked'
    }));
    if (currentQIndex < questions.length - 1) setCurrentQIndex(currentQIndex + 1);
  };

  if (loading) return <div className="flex-center" style={{ height: '100vh' }}><div className="loader"></div></div>;

  const q = questions[currentQIndex];
  const subjects = [...new Set(questions.map(qu => qu.subject))];

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f1f5f9', fontFamily: 'Poppins, sans-serif', overflow: 'hidden' }}>
      
      {/* ── FLOATING TOP HEADER ────────────────────────── */}
      <div style={{ padding: '12px 20px 0' }}>
        <header style={{ 
          background: 'rgba(255, 255, 255, 0.85)', 
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          height: '64px', 
          border: '1px solid rgba(255, 255, 255, 0.7)', 
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', zIndex: 100
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ fontWeight: '800', fontSize: '1.2rem', color: '#1e293b' }}>Target <span style={{ color: '#2563eb' }}>TestZone</span></div>
            <div style={{ height: '24px', width: '1px', background: '#e2e8f0' }}></div>
            <div style={{ fontWeight: '600', fontSize: '0.85rem', color: '#64748b' }}>MHT-CET Mock Test 01</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time Remaining</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: timeLeft < 300 ? '#ef4444' : '#1e293b', fontVariantNumeric: 'tabular-nums' }}>
                {formatTime(timeLeft)}
              </div>
            </div>
            <button className="btn btn-primary btn-md" onClick={handleSubmit} style={{ borderRadius: '10px' }}>Submit Test</button>
          </div>
        </header>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', padding: '12px 20px 20px', gap: '16px' }}>
        
        {/* LEFT: Question Section */}
        <section style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          
          {/* Subject Switcher */}
          <div style={{ background: '#f8fafc', padding: '0 20px', borderBottom: '1px solid #e2e8f0', display: 'flex' }}>
            {subjects.map(sub => (
              <button key={sub} style={{ 
                padding: '12px 24px', fontSize: '0.85rem', fontWeight: '700', border: 'none', background: 'none',
                color: q?.subject === sub ? '#2563eb' : '#64748b',
                borderBottom: `3px solid ${q?.subject === sub ? '#2563eb' : 'transparent'}`,
                cursor: 'pointer'
              }}>
                {sub}
              </button>
            ))}
          </div>

          {/* Question Details Header */}
          <div style={{ padding: '15px 30px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
            <div style={{ fontWeight: '700', fontSize: '1rem', color: '#1e293b' }}>Question No. {currentQIndex + 1}</div>
            <div style={{ display: 'flex', gap: '15px', fontSize: '0.8rem', fontWeight: '600' }}>
              <span style={{ color: '#059669', background: '#ecfdf5', padding: '4px 10px', borderRadius: '4px' }}>Correct: +{q?.marks || 2}</span>
              <span style={{ color: '#dc2626', background: '#fef2f2', padding: '4px 10px', borderRadius: '4px' }}>Incorrect: -{q?.negativeMarks || 0}</span>
            </div>
          </div>

          {/* Question Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '40px 60px', background: '#fff' }}>
            <div style={{ marginBottom: '30px' }}>
              <p style={{ fontSize: '1.15rem', color: '#1e293b', fontWeight: '500', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{q?.text}</p>
              {q?.questionImage && (
                <div style={{ marginTop: '20px' }}>
                  <img src={q.questionImage} alt="Diagram" style={{ maxWidth: '100%', maxHeight: '350px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px' }} />
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gap: '15px' }}>
              {q?.options.map((opt, idx) => (
                <div key={idx} 
                  onClick={() => setAnswers(p => ({ ...p, [currentQIndex]: idx }))}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 20px', borderRadius: '10px',
                    background: answers[currentQIndex] === idx ? '#eff6ff' : '#fff',
                    border: `1.5px solid ${answers[currentQIndex] === idx ? '#2563eb' : '#e2e8f0'}`,
                    cursor: 'pointer', transition: 'all 0.1s ease'
                  }}
                >
                  <div style={{ 
                    width: '28px', height: '28px', borderRadius: '50%', border: '2px solid',
                    borderColor: answers[currentQIndex] === idx ? '#2563eb' : '#cbd5e1',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', fontWeight: '700',
                    background: answers[currentQIndex] === idx ? '#2563eb' : 'transparent',
                    color: answers[currentQIndex] === idx ? '#fff' : '#64748b'
                  }}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span style={{ fontSize: '1rem', fontWeight: '500', color: answers[currentQIndex] === idx ? '#1d4ed8' : '#334155' }}>{opt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Controls Footer */}
          <footer style={{ 
            height: '70px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '0 30px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary btn-md" onClick={handleMarkForReview} style={{ gap: '8px', background: '#fff' }}>
                <Flag size={15} color="#7c3aed" /> Mark for Review
              </button>
              <button className="btn btn-ghost btn-md" onClick={() => setAnswers(p => { const n = {...p}; delete n[currentQIndex]; return n; })}>
                <Trash2 size={15} /> Clear
              </button>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary btn-md" onClick={() => currentQIndex > 0 && setCurrentQIndex(currentQIndex - 1)} disabled={currentQIndex === 0}>
                <ChevronLeft size={18} /> Previous
              </button>
              <button className="btn btn-primary btn-md" onClick={handleSaveAndNext} style={{ minWidth: '140px' }}>
                Save & Next <ChevronRight size={18} />
              </button>
            </div>
          </footer>
        </section>

        {/* RIGHT: Palette Section */}
        <aside style={{ width: '300px', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          
          {/* Student Info */}
          <div style={{ padding: '20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
             <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.2rem' }}>
               {user.name?.charAt(0).toUpperCase()}
             </div>
             <div>
               <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#1e293b' }}>{user.name}</div>
               <div style={{ fontSize: '0.7rem', fontWeight: '600', color: '#64748b' }}>Candidate ID: {user.studentId || 'N/A'}</div>
             </div>
          </div>

          <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
            <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '15px', fontWeight: '700' }}>Question Palette</h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {questions.map((_, idx) => {
                const status = statuses[idx];
                let bg = '#fff', border = '#e2e8f0', color = '#64748b', clipPath = 'none';
                
                if (status === 'answered') { bg = '#059669'; border = '#059669'; color = '#fff'; }
                else if (status === 'not-answered') { bg = '#dc2626'; border = '#dc2626'; color = '#fff'; }
                else if (status === 'marked' || status === 'marked-answered') { bg = '#7c3aed'; border = '#7c3aed'; color = '#fff'; }
                
                return (
                  <button key={idx} onClick={() => setCurrentQIndex(idx)}
                    style={{ 
                      width: '100%', aspectRatio: '1/1', borderRadius: '6px', 
                      background: bg, border: `1px solid ${currentQIndex === idx ? '#2563eb' : border}`, color,
                      fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer',
                      boxShadow: currentQIndex === idx ? '0 0 0 2px #fff, 0 0 0 4px #2563eb' : 'none',
                      transition: 'all 0.1s'
                    }}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: '30px', display: 'grid', gap: '10px' }}>
               <StatusLegend color="#059669" label="Answered" />
               <StatusLegend color="#dc2626" label="Not Answered" />
               <StatusLegend color="#7c3aed" label="Marked" />
               <StatusLegend color="#fff" border="#e2e8f0" label="Not Visited" />
            </div>
          </div>

          <div style={{ padding: '20px', background: '#fff', borderTop: '1px solid #e2e8f0' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.75rem', marginBottom: '10px' }}>
               <Info size={14} />
               <span>Click a number to jump to question</span>
             </div>
             <button onClick={handleSubmit} className="btn btn-primary btn-full" style={{ padding: '12px', fontWeight: '700' }}>Finish Test</button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatusLegend({ color, label, border }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.75rem', fontWeight: '600', color: '#475569' }}>
      <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: color, border: border ? `1px solid ${border}` : 'none' }} />
      <span>{label}</span>
    </div>
  );
}

export default Exam;
