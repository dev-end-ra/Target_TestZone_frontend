import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { GraduationCap, Mail, Lock, User, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const saveAndRedirect = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    if (user.role === 'admin') return navigate('/home');
    if (user.status !== 'approved') return navigate('/pending');
    navigate('/home');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await axios.post(`http://localhost:5000${endpoint}`, formData);
      saveAndRedirect(res.data.token, res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/google', { credential: credentialResponse.credential });
      saveAndRedirect(res.data.token, res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'linear-gradient(135deg, #f8fafc 0%, #ede9fe 100%)',
    }}>
      {/* Left branding panel */}
      <div style={{
        flex: '1 1 0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px 72px',
        background: 'linear-gradient(160deg, #1e1b4b 0%, #4f46e5 60%, #7c3aed 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 350, height: 350, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 280, height: 280, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />
        
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '60px' }}>
            <div style={{ width: '52px', height: '52px', background: 'rgba(255,255,255,0.15)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
              <GraduationCap size={28} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: '900', fontSize: '1.4rem', color: 'white', lineHeight: 1 }}>Target TestZone</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Premium Coaching Platform</div>
            </div>
          </div>

          <h1 style={{ color: 'white', fontSize: '2.8rem', fontWeight: '900', lineHeight: 1.15, marginBottom: '24px' }}>
            Your JEE & MHT-CET journey starts here.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', lineHeight: 1.7, maxWidth: '380px', marginBottom: '48px' }}>
            Practice with TCS iON-format mock tests, review step-by-step solutions, and track your improvement over time.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {['TCS iON exam interface format', 'Subject-wise performance analytics', 'Admin-controlled student access'].map((feat, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem', fontWeight: '500' }}>
                <div style={{ width: '8px', height: '8px', background: '#a5b4fc', borderRadius: '50%', flexShrink: 0 }} />
                {feat}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login form */}
      <div style={{ flex: '0 0 480px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', background: 'white' }}>
        <div className="animate-slide-up" style={{ width: '100%', maxWidth: '400px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--slate-900)', marginBottom: '8px' }}>
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </h2>
          <p style={{ color: 'var(--slate-500)', marginBottom: '36px' }}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setIsLogin(!isLogin); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--brand)', fontWeight: '700', cursor: 'pointer', fontSize: 'inherit', padding: 0, textDecoration: 'underline' }}>
              {isLogin ? 'Create one' : 'Sign in'}
            </button>
          </p>

          {error && (
            <div className="alert alert-error animate-fade-in" style={{ marginBottom: '24px' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group animate-fade-in">
                <label className="form-label"><User size={12} style={{ display: 'inline', marginRight: '5px' }} />Full Name</label>
                <input className="form-input" type="text" name="name" placeholder="Enter your full name" value={formData.name} onChange={handleChange} required />
              </div>
            )}
            <div className="form-group">
              <label className="form-label"><Mail size={12} style={{ display: 'inline', marginRight: '5px' }} />Email Address</label>
              <input className="form-input" type="email" name="email" placeholder="name@example.com" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label"><Lock size={12} style={{ display: 'inline', marginRight: '5px' }} />Password</label>
              <input className="form-input" type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginBottom: '24px', marginTop: '8px' }}>
              {loading ? <Loader2 size={20} className="animate-spin" /> : <>{isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={18} /></>}
            </button>
          </form>

          <div style={{ position: 'relative', textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ position: 'absolute', top: '50%', width: '100%', height: '1px', background: 'var(--border)' }} />
            <span style={{ position: 'relative', background: 'white', padding: '0 16px', color: 'var(--slate-400)', fontSize: '0.82rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>or continue with</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google login failed')} theme="outline" shape="rectangular" width="370" />
          </div>

          {!isLogin && (
            <p style={{ marginTop: '28px', fontSize: '0.8rem', color: 'var(--slate-400)', textAlign: 'center', lineHeight: 1.6 }}>
              After registering, your account will be reviewed by the admin before you can access tests.
            </p>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default Login;
