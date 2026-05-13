import { useNavigate } from 'react-router-dom';
import { CheckCircle2, BookOpen, BarChart3, Target, Zap, ShieldCheck, ArrowRight, PlayCircle } from 'lucide-react';
import logo from '../assets/logo.png';

function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ background: 'transparent' }}>
      
      {/* ── HERO SECTION ──────────────────────────────── */}
      <section style={{ 
        padding: '120px 20px 80px', 
        textAlign: 'center', 
        maxWidth: '1200px', 
        margin: '0 auto' 
      }}>
        <div className="animate-slide-up" style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px', 
          background: '#fff', 
          padding: '8px 16px', 
          borderRadius: '100px', 
          border: '1px solid var(--border)',
          fontSize: '0.85rem',
          fontWeight: '600',
          color: 'var(--brand)',
          marginBottom: '24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          <Zap size={14} fill="currentColor" /> The #1 Platform for MHT-CET & JEE
        </div>

        <h1 className="animate-slide-up" style={{ 
          fontSize: 'clamp(2.5rem, 6vw, 4rem)', 
          fontWeight: '900', 
          lineHeight: 1.1, 
          color: '#111827',
          letterSpacing: '-0.03em',
          marginBottom: '24px'
        }}>
          Master Your Exams with <br />
          <span style={{ color: 'var(--brand)' }}>Target TestZone</span>
        </h1>

        <p className="animate-slide-up" style={{ 
          fontSize: 'clamp(1rem, 2vw, 1.25rem)', 
          color: '#4b5563', 
          maxWidth: '700px', 
          margin: '0 auto 40px',
          lineHeight: 1.6
        }}>
          Simulate the real exam environment with 10,000+ high-quality questions, 
          real-time performance analytics, and chapter-wise practice.
        </p>

        <div className="animate-slide-up" style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/login')} className="btn btn-primary btn-lg" style={{ padding: '16px 32px', fontSize: '1.1rem', gap: '10px' }}>
            Get Started Free <ArrowRight size={20} />
          </button>
          <button className="btn btn-secondary btn-lg" style={{ padding: '16px 32px', fontSize: '1.1rem', gap: '10px', background: '#fff' }}>
            <PlayCircle size={20} /> Watch Demo
          </button>
        </div>

        {/* Hero Image / Mockup Placeholder */}
        <div className="animate-fade-in" style={{ marginTop: '60px', position: 'relative' }}>
          <div style={{ 
            background: '#fff', 
            borderRadius: '24px', 
            border: '1px solid var(--border)', 
            padding: '12px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            <div style={{ background: '#f8fafc', borderRadius: '16px', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '1.2rem', fontWeight: '600' }}>
               {/* This represents a screenshot of your beautiful Exam UI */}
               <div style={{ textAlign: 'center' }}>
                  <ShieldCheck size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                  <div>Professional Exam Interface</div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ──────────────────────────── */}
      <section id="features" style={{ padding: '100px 20px', background: '#fff', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '16px' }}>Everything you need to excel</h2>
            <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Built by experts to help you crack competitive exams with confidence.</p>
          </div>

          <div className="grid-3">
            <FeatureCard 
              icon={<BookOpen size={24} color="var(--brand)" />} 
              title="Full Mock Tests" 
              desc="Time-bound simulations that exactly mimic MHT-CET and JEE exam patterns." 
            />
            <FeatureCard 
              icon={<Zap size={24} color="#f59e0b" />} 
              title="Instant Results" 
              desc="Get detailed scorecards and subject-wise accuracy as soon as you submit." 
            />
            <FeatureCard 
              icon={<BarChart3 size={24} color="#10b981" />} 
              title="Deep Analytics" 
              desc="Track your progress over time and identify weak chapters with heatmaps." 
            />
            <FeatureCard 
              icon={<Target size={24} color="#ef4444" />} 
              title="Chapter Practice" 
              desc="Don't wait for a full test. Practice specific chapters you find difficult." 
            />
            <FeatureCard 
              icon={<ShieldCheck size={24} color="#6366f1" />} 
              title="Official Syllabus" 
              desc="All questions are curated strictly according to the latest NTA and State Board norms." 
            />
            <FeatureCard 
              icon={<Zap size={24} color="var(--brand)" />} 
              title="Mistake Vault" 
              desc="Automatically save and revisit questions you got wrong to ensure zero gaps." 
            />
          </div>
        </div>
      </section>

      {/* ── TRUST SECTION (ABOUT) ─────────────────────── */}
      <section id="about" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '40px' }}>
          Trusted by Students from Top Colleges
        </h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '60px', flexWrap: 'wrap', opacity: 0.6, filter: 'grayscale(1)' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>VJTI</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>COEP</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>ICT</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>WALCHAND</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>PICT</div>
        </div>
      </section>

      {/* ── CTA SECTION ───────────────────────────────── */}
      <section style={{ padding: '100px 20px' }}>
        <div style={{ 
          maxWidth: '1000px', 
          margin: '0 auto', 
          background: 'var(--brand)', 
          borderRadius: '32px', 
          padding: '60px 40px', 
          textAlign: 'center',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '20px' }}>Ready to start your journey?</h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '40px', opacity: 0.9 }}>Join thousands of students who are already using Target TestZone to ace their exams.</p>
          <button onClick={() => navigate('/login')} className="btn btn-lg" style={{ background: '#fff', color: 'var(--brand)', padding: '16px 40px', fontSize: '1.1rem', fontWeight: '700' }}>
            Create Free Account
          </button>
          
          {/* Subtle design element */}
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
        </div>
      </section>

    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="card" style={{ padding: '32px', transition: 'all 0.3s ease' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
        {icon}
      </div>
      <h3 style={{ marginBottom: '12px', fontSize: '1.25rem' }}>{title}</h3>
      <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}

export default Landing;
