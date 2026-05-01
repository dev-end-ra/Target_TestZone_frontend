import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { 
  Download, 
  ChevronRight, 
  Trophy, 
  Clock, 
  Target, 
  BarChart2, 
  ArrowLeft 
} from 'lucide-react';

function ResultAnalysis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('Target TestZone - Performance Report', 20, 20);
    
    doc.setFontSize(14);
    doc.text(`Student: ${data.userId.name}`, 20, 35);
    doc.text(`Test: ${data.testId.title}`, 20, 42);
    doc.text(`Total Score: ${data.totalScore}`, 20, 49);
    doc.text(`Time Taken: ${Math.floor(data.timeTakenSeconds / 60)} mins`, 20, 56);

    const tableData = Object.entries(data.subjectScores).map(([sub, score]) => [sub, score]);
    doc.autoTable({
      startY: 70,
      head: [['Subject', 'Score']],
      body: tableData,
    });

    doc.save(`Result_${data.testId.title}.pdf`);
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading analysis...</div>;
  if (!data) return <div style={{ textAlign: 'center', padding: '50px' }}>Result not found.</div>;

  // Prepare Chart Data
  const correctCount = data.answers.filter(a => a.selectedOptionIndex === a.questionId.correctOptionIndex).length;
  const incorrectCount = data.answers.filter(a => a.selectedOptionIndex !== null && a.selectedOptionIndex !== a.questionId.correctOptionIndex).length;
  const unattemptedCount = data.answers.filter(a => a.selectedOptionIndex === null).length;

  const pieData = [
    { name: 'Correct', value: correctCount, color: '#2ec4b6' },
    { name: 'Incorrect', value: incorrectCount, color: '#e71d36' },
    { name: 'Unattempted', value: unattemptedCount, color: '#94a3b8' }
  ];

  const barData = Object.entries(data.subjectScores).map(([subject, score]) => ({
    subject,
    score
  }));

  return (
    <div style={{ padding: '40px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'Outfit, sans-serif' }}>
      <button 
        onClick={() => navigate('/dashboard')}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '24px', fontWeight: '600' }}
      >
        <ArrowLeft size={20} /> Back to Dashboard
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b' }}>Performance Analysis</h1>
          <p style={{ color: '#64748b' }}>Detailed breakdown of your attempt for <strong>{data.testId.title}</strong></p>
        </div>
        <button className="btn-modern btn-primary" onClick={generatePDF}>
          <Download size={18} /> Download PDF Report
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ backgroundColor: '#eef2ff', color: '#4361ee', padding: '16px', borderRadius: '16px' }}><Trophy size={32} /></div>
          <div>
            <div style={{ fontSize: '14px', color: '#94a3b8', fontWeight: '600' }}>TOTAL SCORE</div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b' }}>{data.totalScore}</div>
          </div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ backgroundColor: '#f0fdf4', color: '#2ec4b6', padding: '16px', borderRadius: '16px' }}><Target size={32} /></div>
          <div>
            <div style={{ fontSize: '14px', color: '#94a3b8', fontWeight: '600' }}>ACCURACY</div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b' }}>{Math.round((correctCount / (correctCount + incorrectCount || 1)) * 100)}%</div>
          </div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ backgroundColor: '#fff7ed', color: '#ff9f1c', padding: '16px', borderRadius: '16px' }}><Clock size={32} /></div>
          <div>
            <div style={{ fontSize: '14px', color: '#94a3b8', fontWeight: '600' }}>TIME TAKEN</div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b' }}>{Math.floor(data.timeTakenSeconds / 60)}m {data.timeTakenSeconds % 60}s</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '40px' }}>
        {/* Charts */}
        <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '32px', boxShadow: 'var(--shadow-lg)' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart2 size={22} color="#4361ee" /> Question Status
          </h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '32px', boxShadow: 'var(--shadow-lg)' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>Subject-wise Marks</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="score" fill="#4361ee" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Solutions CTA */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1e293b, #334155)', 
        padding: '40px', 
        borderRadius: '32px', 
        color: 'white', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Review Your Mistakes</h2>
          <p style={{ opacity: 0.8 }}>Check step-by-step solutions for every question to improve your score.</p>
        </div>
        <button 
          onClick={() => navigate(`/review/${id}`)}
          className="btn-modern" 
          style={{ backgroundColor: 'white', color: '#1e293b', padding: '16px 32px' }}
        >
          View Full Solutions <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

export default ResultAnalysis;
