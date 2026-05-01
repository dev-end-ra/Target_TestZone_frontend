import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  BookOpen, 
  Filter,
  Check,
  X
} from 'lucide-react';

function SolutionReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, incorrect, correct

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/tests/submission/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch result', err);
        setLoading(false);
      }
    };
    fetchResult();
  }, [id]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading solutions...</div>;
  if (!data) return <div style={{ textAlign: 'center', padding: '50px' }}>Solutions not found.</div>;

  const filteredAnswers = data.answers.filter(ans => {
    if (filter === 'incorrect') return ans.selectedOptionIndex !== ans.questionId.correctOptionIndex && ans.selectedOptionIndex !== null;
    if (filter === 'correct') return ans.selectedOptionIndex === ans.questionId.correctOptionIndex;
    return true;
  });

  return (
    <div style={{ padding: '40px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'Outfit, sans-serif' }}>
      <button 
        onClick={() => navigate(`/result/${id}`)}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '24px', fontWeight: '600' }}
      >
        <ArrowLeft size={20} /> Back to Result Analysis
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b' }}>Solution Review</h1>
          <p style={{ color: '#64748b' }}>Analyze every question and understand the logic behind the answers.</p>
        </div>
        
        <div style={{ display: 'flex', backgroundColor: '#e2e8f0', padding: '6px', borderRadius: '14px', gap: '4px' }}>
          {['all', 'incorrect', 'correct'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              style={{ 
                padding: '10px 20px', 
                borderRadius: '10px', 
                border: 'none', 
                cursor: 'pointer', 
                fontWeight: '600',
                backgroundColor: filter === f ? 'white' : 'transparent',
                color: filter === f ? '#1e293b' : '#64748b',
                boxShadow: filter === f ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s',
                textTransform: 'capitalize'
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {filteredAnswers.map((ans, idx) => {
          const q = ans.questionId;
          const isCorrect = ans.selectedOptionIndex === q.correctOptionIndex;
          const isUnattempted = ans.selectedOptionIndex === null;

          return (
            <div key={idx} className="animate-slide-up" style={{ 
              backgroundColor: 'white', 
              padding: '40px', 
              borderRadius: '32px', 
              boxShadow: 'var(--shadow-md)',
              border: `1px solid ${isUnattempted ? '#e2e8f0' : (isCorrect ? '#dcfce7' : '#fee2e2')}`,
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Status Ribbon */}
              <div style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '6px', 
                height: '100%', 
                backgroundColor: isUnattempted ? '#94a3b8' : (isCorrect ? '#2ec4b6' : '#e71d36') 
              }}></div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <span style={{ backgroundColor: '#f1f5f9', color: '#64748b', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                  {q.subject.toUpperCase()}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isUnattempted ? (
                    <span style={{ color: '#94a3b8', fontWeight: '700', fontSize: '14px' }}>UNATTEMPTED</span>
                  ) : (
                    isCorrect ? (
                      <span style={{ color: '#16a34a', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle size={16} /> CORRECT
                      </span>
                    ) : (
                      <span style={{ color: '#ef4444', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <XCircle size={16} /> INCORRECT
                      </span>
                    )
                  )}
                </div>
              </div>

              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', marginBottom: '32px', lineHeight: '1.6' }}>
                <span style={{ color: '#4361ee', marginRight: '10px' }}>Q{idx + 1}.</span> {q.text}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
                {q.options.map((opt, oIdx) => {
                  let style = { padding: '16px 24px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px' };
                  let icon = null;

                  if (oIdx === q.correctOptionIndex) {
                    style = { ...style, backgroundColor: '#f0fdf4', borderColor: '#2ec4b6', color: '#16a34a', fontWeight: '600' };
                    icon = <Check size={18} />;
                  } else if (oIdx === ans.selectedOptionIndex && !isCorrect) {
                    style = { ...style, backgroundColor: '#fef2f2', borderColor: '#ef4444', color: '#ef4444', fontWeight: '600' };
                    icon = <X size={18} />;
                  }

                  return (
                    <div key={oIdx} style={style}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800' }}>
                        {String.fromCharCode(65 + oIdx)}
                      </div>
                      <span style={{ flex: 1 }}>{opt}</span>
                      {icon}
                    </div>
                  );
                })}
              </div>

              {/* Solution Box */}
              <div style={{ backgroundColor: '#f8fafc', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={18} color="#4361ee" /> Step-by-Step Solution
                </h4>
                <p style={{ color: '#475569', fontSize: '15px', lineHeight: '1.8' }}>
                  {q.solutionText || 'Solution not provided for this question.'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SolutionReview;
