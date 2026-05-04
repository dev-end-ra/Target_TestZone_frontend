import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, XCircle, ArrowRight, Loader2, RotateCcw, ChevronLeft, Lightbulb } from 'lucide-react';

function PracticeSession() {
  const { subject, chapter } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions]   = useState([]);
  const [current, setCurrent]       = useState(0);
  const [selected, setSelected]     = useState(null);
  const [revealed, setRevealed]     = useState(false);
  const [results, setResults]       = useState([]);   // { correct: bool }
  const [done, setDone]             = useState(false);
  const [loading, setLoading]       = useState(true);

  const token  = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    axios.get(`http://localhost:5000/api/practice/${encodeURIComponent(subject)}/${encodeURIComponent(chapter)}/questions`, config)
      .then(res => { setQuestions(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [subject, chapter]);

  if (loading) return (
    <div className="page-wrapper flex-center" style={{ height: '70vh' }}>
      <Loader2 size={32} className="animate-spin" color="var(--brand)" />
    </div>
  );

  if (questions.length === 0) return (
    <div className="page-wrapper" style={{ maxWidth: '720px', textAlign: 'center', paddingTop: '80px' }}>
      <h3 style={{ marginBottom: '8px' }}>No questions found</h3>
      <p style={{ marginBottom: '24px' }}>There are no practice questions for this chapter yet.</p>
      <button className="btn btn-secondary" onClick={() => navigate('/practice')}>Back to Practice</button>
    </div>
  );

  const q = questions[current];
  const correct = q?.correctOptionIndex;

  const handleSelect = (idx) => {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
    setResults(r => [...r, { correct: idx === correct }]);
  };

  const handleNext = () => {
    if (current + 1 >= questions.length) { setDone(true); return; }
    setCurrent(c => c + 1);
    setSelected(null);
    setRevealed(false);
  };

  const handleRestart = () => {
    setCurrent(0); setSelected(null); setRevealed(false); setResults([]); setDone(false);
  };

  const correctCount = results.filter(r => r.correct).length;
  const accuracy     = Math.round((correctCount / results.length) * 100) || 0;

  if (done) {
    return (
      <div className="page-wrapper" style={{ maxWidth: '560px' }}>
        <div className="card animate-slide-up">
          <div className="card-body" style={{ textAlign: 'center', padding: '48px 40px' }}>
            <div style={{ fontSize: '3.5rem', lineHeight: 1, marginBottom: '4px' }}>
              {accuracy >= 80 ? '🎯' : accuracy >= 50 ? '📚' : '💪'}
            </div>
            <h2 style={{ marginBottom: '6px' }}>Session Complete!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>{chapter} — {subject}</p>

            <div className="grid-3" style={{ marginBottom: '32px' }}>
              {[
                { label: 'Correct',   value: correctCount,                color: 'var(--success)' },
                { label: 'Incorrect', value: results.length - correctCount, color: 'var(--danger)'  },
                { label: 'Accuracy',  value: `${accuracy}%`,              color: 'var(--brand)'   },
              ].map((s, i) => (
                <div key={i} style={{ background: 'var(--gray-50)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: '800', color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '4px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="btn btn-secondary btn-md" onClick={handleRestart} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <RotateCcw size={15} /> Practice Again
              </button>
              <button className="btn btn-primary btn-md" onClick={() => navigate('/practice')} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                More Chapters <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ maxWidth: '780px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
        <button onClick={() => navigate('/practice')} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ChevronLeft size={13} /> Back
        </button>
        <span>/</span><span>{subject}</span><span>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{chapter}</span>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: '24px' }}>
        <div className="flex-between" style={{ marginBottom: '6px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
            Question {current + 1} of {questions.length}
          </span>
          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--success)' }}>
            {correctCount} correct
          </span>
        </div>
        <div style={{ height: '6px', background: 'var(--gray-200)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'var(--brand)', borderRadius: 'var(--radius-full)', width: `${((current) / questions.length) * 100}%`, transition: 'width 0.4s var(--ease)' }} />
        </div>
      </div>

      {/* Question card */}
      <div className="card animate-fade-in" key={current}>
        <div className="card-body" style={{ padding: '32px' }}>
          <p style={{ fontSize: '1.05rem', fontWeight: '500', color: 'var(--text-primary)', lineHeight: 1.7, marginBottom: '8px' }}>{q.text}</p>
          {q.questionImage && (
            <div style={{ marginBottom: '20px' }}>
              <img src={q.questionImage} alt="diagram" style={{ maxWidth: '100%', maxHeight: '240px', objectFit: 'contain', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
            {q.options.map((opt, idx) => {
              let bg = '#fff', border = 'var(--border)', color = 'var(--text-primary)';
              if (revealed) {
                if (idx === correct)   { bg = 'var(--success-light)'; border = 'var(--success)'; color = '#14532d'; }
                if (idx === selected && idx !== correct) { bg = 'var(--danger-light)'; border = 'var(--danger)'; color = '#7f1d1d'; }
              } else if (selected === idx) {
                bg = 'var(--brand-light)'; border = 'var(--brand)';
              }
              return (
                <button key={idx} onClick={() => handleSelect(idx)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px', background: bg, border: `1.5px solid ${border}`, borderRadius: 'var(--radius-md)', cursor: revealed ? 'default' : 'pointer', textAlign: 'left', transition: 'all 0.15s', fontFamily: 'inherit', fontSize: '0.9rem', color, fontWeight: revealed && idx === correct ? '700' : '500' }}>
                  <span style={{ width: '28px', height: '28px', border: `1.5px solid ${border}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.8rem', flexShrink: 0, background: revealed && idx === correct ? 'var(--success)' : revealed && idx === selected ? 'var(--danger)' : 'transparent', color: revealed && (idx === correct || idx === selected) ? '#fff' : 'inherit' }}>
                    {revealed && idx === correct ? <CheckCircle2 size={14} /> : revealed && idx === selected ? <XCircle size={14} /> : String.fromCharCode(65 + idx)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Solution */}
          {revealed && q.solutionText && (
            <div className="animate-slide-up alert alert-info" style={{ marginTop: '20px' }}>
              <Lightbulb size={16} style={{ flexShrink: 0 }} />
              <div><strong>Solution: </strong>{q.solutionText}</div>
            </div>
          )}

          {revealed && (
            <div className="animate-slide-up" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary btn-md" onClick={handleNext} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                {current + 1 === questions.length ? 'View Results' : 'Next Question'} <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PracticeSession;
