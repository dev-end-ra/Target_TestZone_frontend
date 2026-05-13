import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Phone, Globe, Share2, ExternalLink } from 'lucide-react';
import logo from '../assets/logo.png';

function Footer() {
  const navigate = useNavigate();

  return (
    <footer style={{ 
      background: '#fff', 
      borderTop: '1px solid var(--border)', 
      padding: '60px 20px 30px', 
      marginTop: '40px'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px' }}>
        
        {/* Brand Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <img src={logo} alt="Logo" style={{ height: '40px', width: 'auto' }} />
            <div style={{ lineHeight: 1.1 }}>
              <div style={{ fontWeight: '800', fontSize: '1rem', color: '#111827' }}>Target</div>
              <div style={{ fontWeight: '700', fontSize: '0.65rem', color: 'var(--brand)', textTransform: 'uppercase' }}>TestZone</div>
            </div>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '300px' }}>
            Empowering students to achieve their dreams in MHT-CET, JEE, and NEET with professional mock tests and real-time analytics.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ marginBottom: '20px', fontSize: '0.9rem', color: '#111827' }}>Platform</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <li onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>Home</li>
            <li onClick={() => navigate('/tests')} style={{ cursor: 'pointer' }}>Mock Test Series</li>
            <li onClick={() => navigate('/practice')} style={{ cursor: 'pointer' }}>Chapter Practice</li>
            <li onClick={() => navigate('/results')} style={{ cursor: 'pointer' }}>Performance Analysis</li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 style={{ marginBottom: '20px', fontSize: '0.9rem', color: '#111827' }}>Support</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={14} /> support@targettestzone.in</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={14} /> +91 98765 43210</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>Privacy Policy <ExternalLink size={12} /></li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>Terms of Service <ExternalLink size={12} /></li>
          </ul>
        </div>

        {/* Newsletter / Social */}
        <div>
          <h4 style={{ marginBottom: '20px', fontSize: '0.9rem', color: '#111827' }}>Stay Connected</h4>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Globe size={18} /></div>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Share2 size={18} /></div>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Shield size={18} /></div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '40px auto 0', paddingTop: '20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>© {new Date().getFullYear()} Target TestZone. All rights reserved.</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>
          Made for the next generation of engineers & doctors.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
