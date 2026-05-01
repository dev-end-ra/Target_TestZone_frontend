import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, BookOpen, Plus, Upload, FileJson, CheckCircle2, AlertCircle, Clock, UserCheck, UserX, Shield, BarChart2 } from 'lucide-react';

const TABS = ['overview', 'students', 'tests', 'import'];

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ totalStudents: 0, pendingApprovals: 0, totalTests: 0 });
  const [users, setUsers] = useState([]);
  const [tests, setTests] = useState([]);
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [newTest, setNewTest] = useState({ title: '', type: 'MHTCET-PCM', durationSeconds: 10800, subjects: 'Physics,Chemistry,Mathematics' });
  const [selectedTestId, setSelectedTestId] = useState('');
  const [importJson, setImportJson] = useState('');
  // For approval modal
  const [approvingUser, setApprovingUser] = useState(null);
  const [assignId, setAssignId] = useState('');

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [statsRes, usersRes, testsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/stats', config),
        axios.get('http://localhost:5000/api/admin/users', config),
        axios.get('http://localhost:5000/api/admin/tests', config),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setTests(testsRes.data);
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    }
  };

  const showStatus = (type, msg) => {
    setStatus({ type, msg });
    setTimeout(() => setStatus({ type: '', msg: '' }), 4000);
  };

  const handleApprove = async () => {
    if (!assignId) return showStatus('error', 'Please enter a Student ID');
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${approvingUser._id}/approve`, { studentId: assignId }, config);
      showStatus('success', `Student "${approvingUser.name}" approved with ID ${assignId}`);
      setApprovingUser(null);
      setAssignId('');
      fetchAll();
    } catch (err) {
      showStatus('error', err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (userId, userName) => {
    if (!window.confirm(`Reject ${userName}?`)) return;
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${userId}/reject`, {}, config);
      showStatus('success', 'Student rejected');
      fetchAll();
    } catch (err) {
      showStatus('error', 'Failed to reject');
    }
  };

  const handleCreateTest = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/admin/tests', {
        ...newTest,
        subjects: newTest.subjects.split(',').map(s => s.trim()),
        durationSeconds: parseInt(newTest.durationSeconds)
      }, config);
      showStatus('success', 'Test created successfully!');
      setNewTest({ title: '', type: 'MHTCET-PCM', durationSeconds: 10800, subjects: 'Physics,Chemistry,Mathematics' });
      fetchAll();
    } catch (err) {
      showStatus('error', 'Failed to create test');
    }
  };

  const handleImportQuestions = async () => {
    if (!selectedTestId || !importJson) return showStatus('error', 'Select a test and provide JSON');
    try {
      const questions = JSON.parse(importJson);
      await axios.post(`http://localhost:5000/api/admin/tests/${selectedTestId}/questions/import`, { questions }, config);
      showStatus('success', `${questions.length} questions imported!`);
      setImportJson('');
      fetchAll();
    } catch (err) {
      showStatus('error', 'Invalid JSON or server error');
    }
  };

  const pendingUsers = users.filter(u => !u.studentId && u.status !== 'rejected');
  const approvedUsers = users.filter(u => u.studentId || u.status === 'approved');

  return (
    <div className="page-wrapper">
      <div className="page-header animate-slide-up flex-between">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '14px' }}><Shield size={32} color="var(--brand)" /> Admin Hub</h1>
          <p>Manage students, tests, and platform settings.</p>
        </div>
        {stats.pendingApprovals > 0 && (
          <div className="badge badge-warning" style={{ fontSize: '0.85rem', padding: '10px 18px' }}>
            <Clock size={15} /> {stats.pendingApprovals} Pending Approval{stats.pendingApprovals > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {status.msg && (
        <div className={`alert animate-fade-in ${status.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '24px' }}>
          {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />} {status.msg}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', background: 'var(--slate-100)', padding: '6px', borderRadius: 'var(--r-lg)', marginBottom: '32px', width: 'fit-content' }} className="animate-slide-up">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart2 },
          { id: 'students', label: 'Students', icon: Users, badge: stats.pendingApprovals },
          { id: 'tests', label: 'Create Test', icon: Plus },
          { id: 'import', label: 'Import Questions', icon: Upload },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`btn btn-md ${activeTab === tab.id ? 'btn-primary' : 'btn-ghost'}`} style={{ gap: '8px', position: 'relative' }}>
            <tab.icon size={16} />{tab.label}
            {tab.badge > 0 && <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--danger)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{tab.badge}</span>}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="animate-slide-up">
          <div className="grid-3 stagger" style={{ marginBottom: '40px' }}>
            <div className="stat-card"><div className="stat-icon stat-icon-primary"><Users size={28} /></div><div><div className="stat-label">Total Students</div><div className="stat-value">{stats.totalStudents}</div></div></div>
            <div className="stat-card"><div className="stat-icon stat-icon-warning"><Clock size={28} /></div><div><div className="stat-label">Pending Approvals</div><div className="stat-value">{stats.pendingApprovals}</div></div></div>
            <div className="stat-card"><div className="stat-icon stat-icon-success"><BookOpen size={28} /></div><div><div className="stat-label">Total Tests</div><div className="stat-value">{stats.totalTests}</div></div></div>
          </div>
          <h3 style={{ marginBottom: '20px' }}>Recently Registered Students</h3>
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>Name</th><th>Email</th><th>Student ID</th><th>Status</th><th>Joined</th></tr></thead>
              <tbody>
                {users.slice(0, 10).map(u => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: '700' }}>{u.name}</td>
                    <td style={{ color: 'var(--slate-500)' }}>{u.email}</td>
                    <td>{u.studentId ? <span className="badge badge-primary">{u.studentId}</span> : <span style={{ color: 'var(--slate-300)' }}>—</span>}</td>
                    <td>
                      {u.status === 'approved' && <span className="badge badge-success">Approved</span>}
                      {u.status === 'pending' && <span className="badge badge-warning">Pending</span>}
                      {u.status === 'rejected' && <span className="badge badge-danger">Rejected</span>}
                    </td>
                    <td style={{ color: 'var(--slate-500)', fontSize: '0.85rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STUDENTS */}
      {activeTab === 'students' && (
        <div className="animate-slide-up">
          {pendingUsers.length > 0 && (
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={20} color="var(--warning)" /> Pending Approvals ({pendingUsers.length})
              </h3>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead><tr><th>Name</th><th>Email</th><th>Registered</th><th>Actions</th></tr></thead>
                  <tbody>
                    {pendingUsers.map(u => (
                      <tr key={u._id}>
                        <td style={{ fontWeight: '700' }}>{u.name}</td>
                        <td style={{ color: 'var(--slate-500)' }}>{u.email}</td>
                        <td style={{ color: 'var(--slate-500)', fontSize: '0.85rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-sm btn-success" style={{ display: 'flex', alignItems: 'center', gap: '5px' }} onClick={() => { setApprovingUser(u); setAssignId(''); }}>
                              <UserCheck size={13} /> Approve
                            </button>
                            <button className="btn btn-sm btn-danger" style={{ display: 'flex', alignItems: 'center', gap: '5px' }} onClick={() => handleReject(u._id, u.name)}>
                              <UserX size={13} /> Reject
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
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserCheck size={20} color="var(--success)" /> Approved Students ({approvedUsers.length})
          </h3>
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>Name</th><th>Email</th><th>Student ID</th><th>Target Exam</th></tr></thead>
              <tbody>
                {approvedUsers.map(u => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: '700' }}>{u.name}</td>
                    <td style={{ color: 'var(--slate-500)' }}>{u.email}</td>
                    <td><span className="badge badge-primary">{u.studentId}</span></td>
                    <td>{u.targetExam ? <span className="badge badge-neutral">{u.targetExam}</span> : <span style={{ color: 'var(--slate-300)' }}>Not set</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE TEST */}
      {activeTab === 'tests' && (
        <div className="animate-slide-up" style={{ maxWidth: '600px' }}>
          <div className="card card-body">
            <h3 style={{ marginBottom: '28px' }}>Create New Test</h3>
            <form onSubmit={handleCreateTest}>
              <div className="form-group">
                <label className="form-label">Test Title</label>
                <input className="form-input" placeholder="e.g. MHT-CET Mock Test 2" value={newTest.title} onChange={e => setNewTest({ ...newTest, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Exam Type</label>
                <select className="form-select" value={newTest.type} onChange={e => setNewTest({ ...newTest, type: e.target.value })}>
                  <option value="MHTCET-PCM">MHT-CET (PCM)</option>
                  <option value="MHTCET-PCB">MHT-CET (PCB)</option>
                  <option value="JEE">JEE Main</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Duration (seconds)</label>
                <input className="form-input" type="number" value={newTest.durationSeconds} onChange={e => setNewTest({ ...newTest, durationSeconds: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Subjects (comma-separated)</label>
                <input className="form-input" value={newTest.subjects} onChange={e => setNewTest({ ...newTest, subjects: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary btn-full btn-lg">Create Test</button>
            </form>
          </div>
        </div>
      )}

      {/* IMPORT */}
      {activeTab === 'import' && (
        <div className="animate-slide-up" style={{ maxWidth: '700px' }}>
          <div className="card card-body">
            <h3 style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '10px' }}><FileJson size={22} color="var(--brand)" /> Bulk Question Import</h3>
            <div className="form-group">
              <label className="form-label">Select Test</label>
              <select className="form-select" value={selectedTestId} onChange={e => setSelectedTestId(e.target.value)}>
                <option value="">Choose a test...</option>
                {tests.map(t => <option key={t._id} value={t._id}>{t.title} ({t.totalQuestions} Qs)</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">JSON Question Array</label>
              <textarea className="form-textarea" style={{ minHeight: '220px', fontFamily: 'monospace', fontSize: '0.82rem' }} placeholder='[{"subject":"Physics","text":"...","options":["A","B","C","D"],"correctOptionIndex":0,"solutionText":"..."}]' value={importJson} onChange={e => setImportJson(e.target.value)} />
              <p style={{ marginTop: '6px', fontSize: '0.8rem', color: 'var(--slate-400)' }}>Must be a valid JSON array of question objects.</p>
            </div>
            <button className="btn btn-primary btn-full btn-lg" onClick={handleImportQuestions}>Execute Import</button>
          </div>
        </div>
      )}

      {/* Approve Modal Overlay */}
      {approvingUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="animate-slide-up card card-body" style={{ maxWidth: '420px', width: '100%' }}>
            <h3 style={{ marginBottom: '8px' }}>Approve Student</h3>
            <p style={{ marginBottom: '24px', color: 'var(--slate-500)' }}>Assign a permanent Student ID to <strong>{approvingUser.name}</strong>.</p>
            <div className="form-group">
              <label className="form-label">Student ID</label>
              <input className="form-input" placeholder="e.g. TZ-2025-001" value={assignId} onChange={e => setAssignId(e.target.value.toUpperCase())} />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-success btn-full btn-md" onClick={handleApprove}><UserCheck size={16} /> Approve & Assign</button>
              <button className="btn btn-secondary btn-md" onClick={() => setApprovingUser(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
