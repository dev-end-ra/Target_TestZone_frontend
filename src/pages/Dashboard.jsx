import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, 
  History, 
  User, 
  LogOut, 
  Target, 
  Flame, 
  Calendar, 
  Clock, 
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';

function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview'); // overview, history, profile
  const [userProfile, setUserProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Profile Form State
  const [formData, setFormData] = useState({ name: '', phone: '', targetExam: '' });
  const [saveStatus, setSaveStatus] = useState('');

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        // Fetch Profile
        const profileRes = await axios.get('http://localhost:5000/api/users/me', config);
        setUserProfile(profileRes.data);
        setFormData({
          name: profileRes.data.name || '',
          phone: profileRes.data.phone || '',
          targetExam: profileRes.data.targetExam || ''
        });

        // Fetch History
        const historyRes = await axios.get('http://localhost:5000/api/users/me/submissions', config);
        setHistory(historyRes.data);
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
        if (error.response?.status === 401) {
          handleLogout();
        }
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaveStatus('Saving...');
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.put('http://localhost:5000/api/users/me', formData, config);
      setUserProfile(res.data);
      // Update local storage user snippet
      const updatedUser = { id: res.data._id, name: res.data.name, email: res.data.email };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setSaveStatus('Profile updated successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Failed to update profile', error);
      setSaveStatus('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '20px'}}>
        <Loader2 size={48} className="animate-spin" style={{ color: '#4361ee' }} />
        <div style={{ fontSize: '18px', fontWeight: '500', color: '#64748b' }}>Preparing your dashboard...</div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } .animate-spin { animation: spin 1s linear infinite; }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      
      {/* Sidebar */}
      <div className="animate-fade-in" style={{ width: '280px', backgroundColor: '#1e293b', color: 'white', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ padding: '32px 24px', textAlign: 'center' }}>
          <div style={{ 
            width: '90px', 
            height: '90px', 
            borderRadius: '24px', 
            background: 'linear-gradient(135deg, #4361ee, #7209b7)', 
            margin: '0 auto 16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '36px', 
            fontWeight: '700',
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
            color: 'white'
          }}>
            {userProfile?.name?.charAt(0).toUpperCase()}
          </div>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '600' }}>{userProfile?.name}</h3>
          <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>{userProfile?.email}</p>
        </div>
        
        <nav style={{ flex: 1, padding: '0 16px' }}>
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'history', label: 'Test History', icon: History },
            { id: 'profile', label: 'My Profile', icon: User }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                textAlign: 'left', 
                backgroundColor: activeTab === item.id ? 'rgba(67, 97, 238, 0.15)' : 'transparent', 
                border: 'none', 
                color: activeTab === item.id ? '#60a5fa' : '#cbd5e1', 
                cursor: 'pointer', 
                fontSize: '16px',
                fontWeight: activeTab === item.id ? '600' : '400',
                borderRadius: '12px',
                marginBottom: '8px',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <item.icon size={20} />
              {item.label}
              {activeTab === item.id && <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#60a5fa' }}></div>}
            </button>
          ))}
        </nav>

        <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button 
            onClick={handleLogout}
            className="btn-modern"
            style={{ width: '100%', backgroundColor: 'rgba(231, 29, 54, 0.1)', color: '#ef4444', border: '1px solid rgba(231, 29, 54, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="animate-slide-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div>
                <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>Dashboard Overview</h1>
                <p style={{ color: '#64748b' }}>Track your progress and attempt new mock tests.</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '12px 24px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Target size={24} style={{ color: '#4361ee' }} />
                <div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>TARGET EXAM</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>{userProfile?.targetExam || 'Not Set'}</div>
                </div>
              </div>
            </div>
            
            <section style={{ marginBottom: '40px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#334155', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Flame size={20} style={{ color: '#2ec4b6' }} /> Active Mock Tests
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
                <div style={{ 
                  backgroundColor: 'white', 
                  padding: '24px', 
                  borderRadius: '24px', 
                  boxShadow: 'var(--shadow-md)',
                  transition: 'transform 0.3s ease',
                  border: '1px solid #f1f5f9',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-8px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: '#4361ee' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ backgroundColor: '#eef2ff', color: '#4361ee', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>MHT-CET</span>
                    <span style={{ color: '#64748b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FileText size={14} /> 150 Questions
                    </span>
                  </div>
                  <h3 style={{ color: '#1e293b', fontSize: '22px', fontWeight: '700', marginBottom: '12px' }}>MHT-CET Mock Test 1</h3>
                  <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '15px' }}>Full syllabus MHT-CET (PCM) designed for speed and accuracy.</p>
                  <button 
                    onClick={() => navigate('/exam')}
                    className="btn-modern btn-primary"
                    style={{ width: '100%' }}
                  >
                    Start Exam Now
                  </button>
                </div>
              </div>
            </section>

            <section>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#334155', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={20} style={{ color: '#ff9f1c' }} /> Upcoming Tests
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
                <div style={{ 
                  backgroundColor: '#f8fafc', 
                  padding: '24px', 
                  borderRadius: '24px', 
                  border: '2px dashed #e2e8f0',
                  position: 'relative'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ backgroundColor: '#fff', color: '#94a3b8', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', border: '1px solid #e2e8f0' }}>JEE MAIN</span>
                  </div>
                  <h3 style={{ color: '#94a3b8', fontSize: '22px', fontWeight: '700', marginBottom: '12px' }}>JEE Main Mock Test 1</h3>
                  <p style={{ color: '#94a3b8', marginBottom: '24px', fontSize: '15px' }}>Full syllabus JEE Main. Includes numerical value type questions.</p>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    color: '#f97316', 
                    fontWeight: '600',
                    fontSize: '14px',
                    backgroundColor: '#fff7ed',
                    padding: '8px 16px',
                    borderRadius: '12px',
                    width: 'fit-content'
                  }}>
                    <Clock size={16} /> Available in 2 Days
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="animate-slide-up">
            <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', marginBottom: '32px' }}>Test History</h1>
            {history.length === 0 ? (
              <div style={{ backgroundColor: 'white', padding: '60px', borderRadius: '24px', textAlign: 'center', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                  <History size={64} style={{ color: '#94a3b8' }} />
                </div>
                <h3 style={{ color: '#1e293b', marginBottom: '8px' }}>No tests taken yet</h3>
                <p style={{ color: '#64748b' }}>Start your first mock test to see your performance analysis here.</p>
                <button onClick={() => setActiveTab('overview')} className="btn-modern btn-primary" style={{ marginTop: '24px' }}>Go to Overview</button>
              </div>
            ) : (
              <div style={{ backgroundColor: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '1px solid #f1f5f9' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ backgroundColor: '#f8fafc' }}>
                    <tr>
                      <th style={{ padding: '20px 24px', color: '#64748b', fontWeight: '600', fontSize: '14px' }}>DATE</th>
                      <th style={{ padding: '20px 24px', color: '#64748b', fontWeight: '600', fontSize: '14px' }}>TEST NAME</th>
                      <th style={{ padding: '20px 24px', color: '#64748b', fontWeight: '600', fontSize: '14px' }}>SCORE</th>
                      <th style={{ padding: '20px 24px', color: '#64748b', fontWeight: '600', fontSize: '14px' }}>ACCURACY</th>
                      <th style={{ padding: '20px 24px', color: '#64748b', fontWeight: '600', fontSize: '14px' }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((sub, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <td style={{ padding: '20px 24px', fontWeight: '500' }}>{new Date(sub.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td style={{ padding: '20px 24px', fontWeight: '700', color: '#1e293b' }}>{sub.testId?.title || 'Mock MHT-CET Test'}</td>
                        <td style={{ padding: '20px 24px' }}>
                          <span style={{ fontSize: '18px', fontWeight: '700', color: '#4361ee' }}>{sub.totalScore}</span>
                          <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '4px' }}>/ 200</span>
                        </td>
                        <td style={{ padding: '20px 24px' }}>
                          <div style={{ width: '100px', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: '75%', height: '100%', backgroundColor: '#2ec4b6' }}></div>
                          </div>
                        </td>
                        <td style={{ padding: '20px 24px' }}>
                          <span style={{ backgroundColor: '#f0fdf4', color: '#16a34a', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}>
                            <CheckCircle2 size={12} /> Completed
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="animate-slide-up">
            <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', marginBottom: '32px' }}>My Profile</h1>
            <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '24px', boxShadow: 'var(--shadow-lg)', maxWidth: '700px', border: '1px solid #f1f5f9' }}>
              
              <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid #f1f5f9' }}>
                 <div style={{ width: '100px', height: '100px', borderRadius: '24px', background: 'linear-gradient(135deg, #4361ee, #7209b7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: '700', color: 'white' }}>
                    {userProfile?.name?.charAt(0).toUpperCase()}
                 </div>
                 <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: '0 0 4px 0' }}>{userProfile?.name}</h2>
                    <p style={{ color: '#64748b', margin: 0 }}>Student Account • Joined {new Date(userProfile?.createdAt).toLocaleDateString()}</p>
                 </div>
              </div>

              <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>FULL NAME</label>
                    <input 
                      className="input-modern"
                      type="text" 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      style={{ width: '100%' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>PHONE NUMBER</label>
                    <input 
                      className="input-modern"
                      type="tel" 
                      value={formData.phone} 
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      placeholder="Enter phone number"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>EMAIL ADDRESS</label>
                  <input 
                    className="input-modern"
                    type="email" 
                    value={userProfile?.email || ''} 
                    disabled
                    style={{ width: '100%', backgroundColor: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed' }}
                  />
                  <small style={{ color: '#94a3b8', marginTop: '4px', display: 'block' }}>Primary email address cannot be changed.</small>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>TARGET EXAM</label>
                  <select 
                    className="input-modern"
                    value={formData.targetExam} 
                    onChange={e => setFormData({...formData, targetExam: e.target.value})}
                    style={{ width: '100%', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center', backgroundSize: '16px' }}
                  >
                    <option value="">Select an exam</option>
                    <option value="JEE">JEE Main / Advanced</option>
                    <option value="MHT-CET (PCM)">MHT-CET (PCM)</option>
                    <option value="MHT-CET (PCB)">MHT-CET (PCB)</option>
                  </select>
                </div>

                {saveStatus && (
                  <div className="animate-fade-in" style={{ 
                    padding: '12px 16px', 
                    borderRadius: '12px', 
                    backgroundColor: saveStatus.includes('Failed') ? '#fef2f2' : '#f0fdf4', 
                    color: saveStatus.includes('Failed') ? '#ef4444' : '#16a34a', 
                    fontWeight: '600',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    {saveStatus.includes('Failed') ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />} {saveStatus}
                  </div>
                )}

                <button type="submit" className="btn-modern btn-primary" style={{ marginTop: '12px', padding: '16px' }}>
                  Save Profile Changes
                </button>
              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Dashboard;
