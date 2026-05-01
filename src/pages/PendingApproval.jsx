import { useNavigate } from 'react-router-dom';
import { Clock, GraduationCap, LogOut, CheckCircle, Mail } from 'lucide-react';

function PendingApproval() {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #ede9fe 100%)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px'
    }}>
      {/* Top logo strip */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '68px', background: 'white', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 32px', gap: '12px' }}>
        <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, var(--brand), #7c3aed)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <GraduationCap size={20} color="white" />
        </div>
        <div>
          <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--slate-900)', lineHeight: 1 }}>Target TestZone</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--brand)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Premium Coaching Platform</div>
        </div>
        <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--slate-500)' }}>
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div className="animate-slide-up" style={{ 
        maxWidth: '520px', 
        width: '100%', 
        background: 'white', 
        borderRadius: '32px', 
        padding: '56px 48px', 
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid var(--border)',
        textAlign: 'center'
      }}>
        <div style={{ 
          width: '88px', 
          height: '88px', 
          background: 'var(--warning-light)', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 28px',
          animation: 'pulse-ring 2s ease infinite'
        }}>
          <Clock size={44} color="var(--warning)" />
        </div>

        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--slate-900)', marginBottom: '12px' }}>
          Account Pending Approval
        </h1>

        <p style={{ color: 'var(--slate-500)', marginBottom: '36px', lineHeight: 1.8 }}>
          Hi <strong style={{ color: 'var(--slate-800)' }}>{user.name}</strong>, your registration is complete! 
          Your account is currently under review. The admin will verify your enrollment and assign 
          you a permanent <strong>Student ID</strong> shortly.
        </p>

        <div style={{ background: 'var(--slate-50)', borderRadius: 'var(--r-lg)', padding: '24px', marginBottom: '32px', textAlign: 'left' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--slate-700)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>What happens next?</h4>
          {[
            { icon: CheckCircle, color: 'var(--success)', text: 'Admin reviews your registration details' },
            { icon: CheckCircle, color: 'var(--success)', text: 'A permanent Student ID (e.g. TZ-2025-001) is assigned' },
            { icon: CheckCircle, color: 'var(--success)', text: 'You gain full access to all scheduled mock tests' },
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: i < 2 ? '12px' : 0 }}>
              <step.icon size={18} color={step.color} />
              <span style={{ fontSize: '0.9rem', color: 'var(--slate-600)' }}>{step.text}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px', background: 'var(--accent-light)', borderRadius: 'var(--r-md)', justifyContent: 'center', fontSize: '0.88rem', color: '#0c4a6e', fontWeight: '500' }}>
          <Mail size={16} />
          Contact your coaching center if this takes more than 24 hours.
        </div>
      </div>
    </div>
  );
}

export default PendingApproval;
