import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../index.css';

function Exam() {
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeSpent, setTimeSpent] = useState({}); // { index: seconds }
  const [statuses, setStatuses] = useState({});
  const [timeLeft, setTimeLeft] = useState(10800);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchExam = async () => {
      try {
        // Real seeded MHT-CET Mock Test 1
        const TEST_ID = '69f48bb83cf17bcb737fbde6';
        const res = await axios.get(`http://localhost:5000/api/tests/${TEST_ID}/questions`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setQuestions(res.data.questions);
        setTimeLeft(res.data.durationSeconds);
        const initialStatuses = {};
        res.data.questions.forEach((_, idx) => {
          initialStatuses[idx] = idx === 0 ? 'not-answered' : 'not-visited';
        });
        setStatuses(initialStatuses);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch test data', err);
        setLoading(false);
      }
    };
    fetchExam();
  }, []);

  // Global Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [questions]); // Dependency on questions to ensure handleSubmit has access to latest state

  // Question Timer
  useEffect(() => {
    const qTimer = setInterval(() => {
      setTimeSpent(prev => ({
        ...prev,
        [currentQIndex]: (prev[currentQIndex] || 0) + 1
      }));
    }, 1000);
    return () => clearInterval(qTimer);
  }, [currentQIndex]);

  const handleSubmit = async () => {
    if (window.confirm('Are you sure you want to submit the test?')) {
      try {
        const token = localStorage.getItem('token');
        const formattedAnswers = questions.map((q, idx) => ({
          questionId: q._id,
          selectedOptionIndex: answers[idx] !== undefined ? answers[idx] : null,
          timeSpentSeconds: timeSpent[idx] || 0
        }));

        const payload = { answers: formattedAnswers, timeTakenSeconds: 10800 - timeLeft };
        const TEST_ID = '69f48bb83cf17bcb737fbde6';
        const res = await axios.post(
          `http://localhost:5000/api/tests/${TEST_ID}/submit`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        navigate(`/result/${res.data.submissionId}`);
      } catch (err) {
        console.error('Submission failed', err);
        alert('Failed to submit test. Please check your connection.');
      }
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (optionIdx) => {
    setAnswers(prev => ({ ...prev, [currentQIndex]: optionIdx }));
  };

  const handleSaveAndNext = () => {
    setStatuses(prev => {
      const newStatuses = { ...prev };
      if (answers[currentQIndex] !== undefined) {
        newStatuses[currentQIndex] = 'answered';
      } else {
        newStatuses[currentQIndex] = 'not-answered';
      }
      if (currentQIndex + 1 < questions.length && newStatuses[currentQIndex + 1] === 'not-visited') {
        newStatuses[currentQIndex + 1] = 'not-answered';
      }
      return newStatuses;
    });
    if (currentQIndex < questions.length - 1) setCurrentQIndex(currentQIndex + 1);
  };

  const handleClearResponse = () => {
    setAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[currentQIndex];
      return newAnswers;
    });
  };

  const handleMarkForReview = () => {
    setStatuses(prev => {
      const newStatuses = { ...prev };
      newStatuses[currentQIndex] = answers[currentQIndex] !== undefined ? 'marked-answered' : 'marked';
      if (currentQIndex + 1 < questions.length && newStatuses[currentQIndex + 1] === 'not-visited') {
        newStatuses[currentQIndex + 1] = 'not-answered';
      }
      return newStatuses;
    });
    if (currentQIndex < questions.length - 1) setCurrentQIndex(currentQIndex + 1);
  };

  const handleJumpToQuestion = (idx) => {
    setStatuses(prev => {
      const newStatuses = { ...prev };
      if (newStatuses[currentQIndex] === 'not-visited') newStatuses[currentQIndex] = 'not-answered';
      if (newStatuses[idx] === 'not-visited') newStatuses[idx] = 'not-answered';
      return newStatuses;
    });
    setCurrentQIndex(idx);
  };

  const currentQ = questions[currentQIndex];
  const subjects = [...new Set(questions.map(q => q.subject))];

  if (loading) {
    return (
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '20px'}}>
        <div style={{ width: '50px', height: '50px', border: '5px solid #f3f3f3', borderTop: '5px solid #4361ee', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p>Loading your exam...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ backgroundColor: '#fff' }}>
      <header className="exam-header" style={{ height: '70px', padding: '0 30px' }}>
        <div style={{ fontSize: '20px', fontWeight: '700' }}>Target TestZone</div>
        <div className="candidate-info">
          <div className="candidate-photo" style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#4361ee', color: 'white', fontWeight: 'bold' }}>
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ fontWeight: '600' }}>{user.name}</div>
        </div>
      </header>

      <div className="main-layout">
        <div className="question-panel">
          <div className="section-tabs">
            {subjects.map(sub => (
              <button key={sub} className={`section-tab ${currentQ?.subject === sub ? 'active' : ''}`}>{sub}</button>
            ))}
          </div>

          <div className="question-header">
            <div style={{ fontWeight: '700' }}>Question No. {currentQIndex + 1}</div>
            <div>Marks: <span style={{color: '#27ae60', fontWeight: '700'}}>+4</span>, <span style={{color: '#e15252', fontWeight: '700'}}>-1</span></div>
          </div>

          <div className="question-content" style={{ padding: '30px' }}>
            {currentQ && (
              <>
                <p style={{ fontSize: '18px', marginBottom: '16px', color: '#1e293b', lineHeight: 1.7 }}>{currentQ.text}</p>
                {currentQ.questionImage && (
                  <div style={{ marginBottom: '24px' }}>
                    <img
                      src={currentQ.questionImage}
                      alt="Question diagram"
                      style={{ maxWidth: '100%', maxHeight: '280px', objectFit: 'contain', borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: '#f8fafc', padding: '8px' }}
                    />
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {currentQ.options.map((opt, idx) => (
                    <label key={idx} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px', 
                      padding: '15px 20px', 
                      borderRadius: '12px', 
                      border: '1px solid #e2e8f0', 
                      cursor: 'pointer',
                      backgroundColor: answers[currentQIndex] === idx ? '#f0f7ff' : 'white',
                      borderColor: answers[currentQIndex] === idx ? '#4361ee' : '#e2e8f0',
                      transition: 'all 0.2s'
                    }}>
                      <input 
                        type="radio" 
                        name={`q-${currentQIndex}`} 
                        checked={answers[currentQIndex] === idx}
                        onChange={() => handleOptionSelect(idx)}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <span style={{ fontSize: '16px' }}>{opt}</span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="action-buttons" style={{ padding: '20px 30px' }}>
            <div className="left-btns">
              <button className="btn" onClick={handleMarkForReview} style={{ borderRadius: '8px', padding: '10px 20px' }}>Mark for Review & Next</button>
              <button className="btn" onClick={handleClearResponse} style={{ borderRadius: '8px', padding: '10px 20px' }}>Clear Response</button>
            </div>
            <button className="btn btn-success" onClick={handleSaveAndNext} style={{ borderRadius: '8px', padding: '10px 30px' }}>Save & Next</button>
          </div>
        </div>

        <div className="palette-panel" style={{ width: '350px' }}>
          <div className="timer-section" style={{ padding: '20px' }}>
            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>TIME LEFT</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: timeLeft < 300 ? '#ef4444' : '#1e293b' }}>{formatTime(timeLeft)}</div>
          </div>
          
          <div className="legend-section" style={{ padding: '15px' }}>
            <div className="legend-item"><div className="legend-icon status-not-visited">0</div> Not Visited</div>
            <div className="legend-item"><div className="legend-icon status-not-answered">0</div> Not Answered</div>
            <div className="legend-item"><div className="legend-icon status-answered">0</div> Answered</div>
            <div className="legend-item"><div className="legend-icon status-marked">0</div> Marked</div>
            <div className="legend-item" style={{ width: '100%' }}><div className="legend-icon status-marked-answered">0</div> Answered & Marked</div>
          </div>

          <div className="palette-grid-section">
            <div className="palette-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
              {questions.map((_, idx) => (
                <button 
                  key={idx}
                  className={`palette-btn legend-icon status-${statuses[idx] || 'not-visited'}`}
                  onClick={() => handleJumpToQuestion(idx)}
                  style={{ width: '45px', height: '45px', fontSize: '14px' }}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0' }}>
             <button onClick={handleSubmit} className="btn-modern btn-primary" style={{ width: '100%', padding: '14px' }}>Submit Test</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Exam;
