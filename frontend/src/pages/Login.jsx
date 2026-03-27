import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n';
import { loginUser } from '../api/client';
import { DollarSign, Mail, Lock, ArrowRight, Sparkles, TrendingUp, Shield, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const features = [
  { icon: Sparkles, label: 'AI Insights', desc: 'Smart financial analysis', color: '#a78bfa' },
  { icon: TrendingUp, label: 'Cash Flow', desc: 'Real-time tracking', color: '#34d399' },
  { icon: Shield, label: 'GST Ready', desc: 'Tax compliance built-in', color: '#60a5fa' },
  { icon: Zap, label: 'Invoices', desc: 'Professional PDFs', color: '#fbbf24' },
];

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await loginUser(form);
      login(data, data.token);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{loginStyles}</style>
      <div className="lp-page">
        {/* Animated BG */}
        <div className="lp-bg">
          <div className="lp-grad lp-grad-1" />
          <div className="lp-grad lp-grad-2" />
          <div className="lp-grad lp-grad-3" />
          <div className="lp-grid-lines" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`lp-orb lp-orb-${i + 1}`} />
          ))}
        </div>

        <div className="lp-container">
          {/* Left Showcase */}
          <div className={`lp-left ${mounted ? 'lp-left-on' : ''}`}>
            <div className="lp-left-inner">
              {/* Logo */}
              <div className="lp-logo-wrap">
                <div className="lp-logo-ring" />
                <div className="lp-logo-ring lp-logo-ring2" />
                <div className="lp-logo-box">
                  <DollarSign size={36} color="#fff" />
                </div>
              </div>

              <h1 className="lp-brand">Fin<span className="lp-brand-ai">AI</span></h1>
              <p className="lp-tagline">{t('app.tagline')}</p>

              {/* Feature cards */}
              <div className="lp-feats">
                {features.map((f, i) => (
                  <div key={f.label} className="lp-feat" style={{ animationDelay: `${0.6 + i * 0.15}s`, '--fc': f.color }}>
                    <div className="lp-feat-ico" style={{ background: `${f.color}20`, color: f.color }}>
                      <f.icon size={18} />
                    </div>
                    <div>
                      <p className="lp-feat-name">{f.label}</p>
                      <p className="lp-feat-desc">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="lp-stats">
                <div className="lp-stat"><span className="lp-stat-v">10K+</span><span className="lp-stat-l">Businesses</span></div>
                <div className="lp-stat-div" />
                <div className="lp-stat"><span className="lp-stat-v">₹50Cr+</span><span className="lp-stat-l">Tracked</span></div>
                <div className="lp-stat-div" />
                <div className="lp-stat"><span className="lp-stat-v">99.9%</span><span className="lp-stat-l">Uptime</span></div>
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div className={`lp-right ${mounted ? 'lp-right-on' : ''}`}>
            <div className="lp-card">
              {/* Mobile logo */}
              <div className="lp-mob-logo">
                <div className="lp-mob-ico"><DollarSign size={22} color="#fff" /></div>
                <span className="lp-mob-txt">Fin<span style={{ color: '#8b5cf6' }}>AI</span></span>
              </div>

              <div className="lp-heading">
                <h2 className="lp-title">{t('auth.welcome')} <span className="lp-wave">👋</span></h2>
                <p className="lp-sub">Sign in to access your financial dashboard</p>
              </div>

              <form onSubmit={handleSubmit} className="lp-form">
                <div className={`lp-fld ${focusedField === 'email' ? 'lp-fld-on' : ''}`}>
                  <label className="lp-lbl">{t('auth.email')}</label>
                  <div className="lp-inp-wrap">
                    <div className="lp-inp-ico"><Mail size={18} /></div>
                    <input type="email" className="lp-inp" placeholder="you@company.com"
                      value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                      required id="login-email" />
                    <div className="lp-inp-glow" />
                  </div>
                </div>

                <div className={`lp-fld ${focusedField === 'password' ? 'lp-fld-on' : ''}`}>
                  <label className="lp-lbl">{t('auth.password')}</label>
                  <div className="lp-inp-wrap">
                    <div className="lp-inp-ico"><Lock size={18} /></div>
                    <input type="password" className="lp-inp" placeholder="••••••••"
                      value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                      onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                      required id="login-password" />
                    <div className="lp-inp-glow" />
                  </div>
                </div>

                <button type="submit" className="lp-btn" disabled={loading} id="login-submit-btn">
                  <div className="lp-btn-bg" />
                  <span className="lp-btn-txt">
                    {loading ? <div className="lp-spin" /> : <>{t('auth.login')} <ArrowRight size={18} className="lp-btn-arr" /></>}
                  </span>
                </button>
              </form>

              {/* Divider */}
              <div className="lp-divider"><span>or continue with</span></div>

              {/* Social buttons */}
              <div className="lp-socials">
                <button type="button" className="lp-soc" title="Google">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                </button>
                <button type="button" className="lp-soc" title="GitHub">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                </button>
                <button type="button" className="lp-soc" title="Microsoft">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="1" y="1" width="10" height="10" fill="#F25022"/><rect x="13" y="1" width="10" height="10" fill="#7FBA00"/><rect x="1" y="13" width="10" height="10" fill="#00A4EF"/><rect x="13" y="13" width="10" height="10" fill="#FFB900"/></svg>
                </button>
              </div>

              <p className="lp-link">
                {t('auth.noAccount')}{' '}
                <Link to="/signup" className="lp-anchor">{t('auth.signup')} <ArrowRight size={14} /></Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const loginStyles = `
/* ===== LOGIN PAGE ===== */
.lp-page { min-height: 100vh; position: relative; overflow: hidden; font-family: 'Inter', system-ui, sans-serif; }

/* BG */
.lp-bg { position: fixed; inset: 0; z-index: 0; background: linear-gradient(135deg, #f0f4ff 0%, #e8eeff 30%, #f5f3ff 60%, #eef2ff 100%); }
.lp-grad { position: absolute; border-radius: 50%; }
.lp-grad-1 { width: 800px; height: 800px; top: -200px; left: -200px; background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%); animation: lpF1 15s ease-in-out infinite; }
.lp-grad-2 { width: 600px; height: 600px; bottom: -100px; right: -100px; background: radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%); animation: lpF2 18s ease-in-out infinite; }
.lp-grad-3 { width: 500px; height: 500px; top: 50%; left: 50%; transform: translate(-50%, -50%); background: radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%); animation: lpF3 12s ease-in-out infinite; }
.lp-grid-lines { position: absolute; inset: 0; background-image: linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px); background-size: 60px 60px; mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%); -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%); }

.lp-orb { position: absolute; border-radius: 50%; filter: blur(1px); animation: lpOrb 20s ease-in-out infinite; }
.lp-orb-1 { width: 6px; height: 6px; background: #818cf8; top: 15%; left: 25%; animation-delay: 0s; animation-duration: 22s; }
.lp-orb-2 { width: 5px; height: 5px; background: #a78bfa; top: 45%; left: 15%; animation-delay: -3s; animation-duration: 18s; }
.lp-orb-3 { width: 7px; height: 7px; background: #60a5fa; top: 70%; left: 35%; animation-delay: -7s; animation-duration: 25s; }
.lp-orb-4 { width: 5px; height: 5px; background: #34d399; top: 25%; right: 30%; animation-delay: -5s; animation-duration: 20s; }
.lp-orb-5 { width: 6px; height: 6px; background: #f472b6; top: 60%; right: 20%; animation-delay: -10s; animation-duration: 24s; }
.lp-orb-6 { width: 8px; height: 8px; background: #fbbf24; top: 80%; right: 40%; animation-delay: -2s; animation-duration: 16s; }

@keyframes lpOrb { 0%,100%{transform:translate(0,0) scale(1);opacity:.4} 25%{transform:translate(30px,-40px) scale(1.5);opacity:.8} 50%{transform:translate(-20px,20px) scale(.8);opacity:.3} 75%{transform:translate(40px,30px) scale(1.3);opacity:.7} }
@keyframes lpF1 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(80px,60px)} 66%{transform:translate(-40px,80px)} }
@keyframes lpF2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-60px,-80px) scale(1.15)} }
@keyframes lpF3 { 0%,100%{transform:translate(-50%,-50%) scale(1);opacity:.15} 50%{transform:translate(-50%,-50%) scale(1.3);opacity:.25} }

/* Layout */
.lp-container { position: relative; z-index: 1; min-height: 100vh; display: flex; }

/* Left */
.lp-left { display: none; width: 50%; padding: 48px; align-items: center; justify-content: center; opacity: 0; transform: translateX(-40px); transition: all .8s cubic-bezier(.16,1,.3,1); }
.lp-left-on { opacity: 1; transform: translateX(0); }
@media(min-width:1024px) { .lp-left { display: flex; } }
.lp-left-inner { max-width: 440px; width: 100%; }

/* Logo */
.lp-logo-wrap { position: relative; width: 80px; height: 80px; margin-bottom: 32px; }
.lp-logo-box { width: 80px; height: 80px; border-radius: 24px; background: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7); display: flex; align-items: center; justify-content: center; position: relative; z-index: 2; box-shadow: 0 8px 32px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.2); }
.lp-logo-ring { position: absolute; inset: -6px; border-radius: 28px; border: 2px solid rgba(139,92,246,0.25); animation: lpRing 8s linear infinite; z-index: 1; }
.lp-logo-ring2 { inset: -12px; border-radius: 32px; border-color: rgba(99,102,241,0.12); animation-duration: 12s; animation-direction: reverse; }
@keyframes lpRing { 0%{transform:rotate(0deg);border-color:rgba(139,92,246,.25)} 50%{border-color:rgba(99,102,241,.4)} 100%{transform:rotate(360deg);border-color:rgba(139,92,246,.25)} }

/* Brand */
.lp-brand { font-size: 48px; font-weight: 800; color: #1e293b; letter-spacing: -1px; margin-bottom: 8px; }
.lp-brand-ai { background: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.lp-tagline { color: #64748b; font-size: 16px; line-height: 1.6; margin-bottom: 40px; }

/* Features */
.lp-feats { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 40px; }
.lp-feat { padding: 16px; border-radius: 16px; background: rgba(255,255,255,0.6); border: 1px solid rgba(99,102,241,0.08); backdrop-filter: blur(12px); display: flex; align-items: center; gap: 12px; cursor: default; transition: all .3s cubic-bezier(.16,1,.3,1); opacity: 0; transform: translateY(20px); animation: lpFeatIn .6s ease-out forwards; box-shadow: 0 2px 8px rgba(99,102,241,0.06); }
.lp-feat:hover { background: rgba(255,255,255,0.8); border-color: var(--fc, rgba(99,102,241,0.15)); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(99,102,241,0.1); }
@keyframes lpFeatIn { to { opacity: 1; transform: translateY(0); } }
.lp-feat-ico { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.lp-feat-name { font-weight: 600; font-size: 13px; color: #1e293b; }
.lp-feat-desc { font-size: 11px; color: #64748b; margin-top: 1px; }

/* Stats */
.lp-stats { display: flex; align-items: center; gap: 24px; padding: 20px 24px; border-radius: 16px; background: rgba(255,255,255,0.6); border: 1px solid rgba(99,102,241,0.08); box-shadow: 0 2px 8px rgba(99,102,241,0.06); }
.lp-stat { text-align: center; flex: 1; }
.lp-stat-v { display: block; font-size: 20px; font-weight: 800; color: #1e293b; letter-spacing: -0.5px; }
.lp-stat-l { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; display: block; }
.lp-stat-div { width: 1px; height: 32px; background: rgba(99,102,241,0.12); }

/* Right */
.lp-right { width: 100%; display: flex; align-items: center; justify-content: center; padding: 32px; opacity: 0; transform: translateY(30px); transition: all .8s cubic-bezier(.16,1,.3,1) .2s; }
.lp-right-on { opacity: 1; transform: translateY(0); }
@media(min-width:1024px) { .lp-right { width: 50%; } }

/* Card */
.lp-card { width: 100%; max-width: 420px; padding: 40px; border-radius: 28px; background: rgba(255,255,255,0.7); border: 1px solid rgba(99,102,241,0.1); backdrop-filter: blur(24px); box-shadow: 0 24px 64px rgba(99,102,241,0.08), 0 4px 12px rgba(0,0,0,0.04); }

/* Mobile logo */
.lp-mob-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; }
@media(min-width:1024px) { .lp-mob-logo { display: none; } }
.lp-mob-ico { width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #6366f1, #8b5cf6); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(99,102,241,0.3); }
.lp-mob-txt { font-size: 22px; font-weight: 800; color: #1e293b; }

/* Heading */
.lp-heading { margin-bottom: 32px; }
.lp-title { font-size: 28px; font-weight: 800; color: #1e293b; letter-spacing: -0.5px; margin-bottom: 6px; display: flex; align-items: center; gap: 8px; }
.lp-wave { display: inline-block; animation: lpWave 2.5s ease-in-out infinite; transform-origin: 70% 70%; }
@keyframes lpWave { 0%,60%,100%{transform:rotate(0)} 10%{transform:rotate(14deg)} 20%{transform:rotate(-8deg)} 30%{transform:rotate(14deg)} 40%{transform:rotate(-4deg)} 50%{transform:rotate(10deg)} }
.lp-sub { color: #64748b; font-size: 14px; }

/* Form */
.lp-form { display: flex; flex-direction: column; gap: 20px; margin-bottom: 24px; }
.lp-fld { position: relative; }
.lp-lbl { display: block; font-size: 13px; font-weight: 600; color: #64748b; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
.lp-inp-wrap { position: relative; border-radius: 14px; overflow: hidden; }
.lp-inp-ico { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #94a3b8; z-index: 2; transition: color .3s; }
.lp-fld-on .lp-inp-ico { color: #6366f1; }
.lp-inp { width: 100%; padding: 14px 16px 14px 48px; background: rgba(241,245,249,0.8); border: 1.5px solid rgba(99,102,241,0.1); border-radius: 14px; color: #1e293b; font-size: 14px; font-family: inherit; outline: none; transition: all .3s cubic-bezier(.16,1,.3,1); position: relative; z-index: 1; }
.lp-inp::placeholder { color: #94a3b8; }
.lp-inp:focus { border-color: rgba(99,102,241,0.4); background: #fff; box-shadow: 0 0 0 4px rgba(99,102,241,0.08), 0 4px 16px rgba(99,102,241,0.06); }
.lp-inp-glow { position: absolute; inset: -1px; border-radius: 14px; background: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7); opacity: 0; transition: opacity .3s; z-index: 0; }
.lp-fld-on .lp-inp-glow { opacity: 0.08; }

/* Button */
.lp-btn { position: relative; width: 100%; padding: 16px; border: none; border-radius: 14px; cursor: pointer; overflow: hidden; margin-top: 4px; background: transparent; transition: transform .2s, box-shadow .3s; }
.lp-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(99,102,241,0.4); }
.lp-btn:active:not(:disabled) { transform: translateY(0); }
.lp-btn:disabled { opacity: .7; cursor: not-allowed; }
.lp-btn-bg { position: absolute; inset: 0; background: linear-gradient(135deg, #6366f1, #7c3aed, #8b5cf6); border-radius: 14px; z-index: 0; }
.lp-btn-bg::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%); animation: lpShim 3s ease-in-out infinite; }
@keyframes lpShim { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
.lp-btn-txt { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 15px; font-weight: 700; color: #fff; letter-spacing: .3px; }
.lp-btn-arr { transition: transform .3s; }
.lp-btn:hover .lp-btn-arr { transform: translateX(4px); }
.lp-spin { width: 20px; height: 20px; border: 2.5px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: lpSpin .6s linear infinite; }
@keyframes lpSpin { to { transform: rotate(360deg); } }

/* Divider */
.lp-divider { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
.lp-divider::before, .lp-divider::after { content: ''; flex: 1; height: 1px; background: rgba(99,102,241,0.1); }
.lp-divider span { font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; white-space: nowrap; }

/* Social */
.lp-socials { display: flex; gap: 12px; margin-bottom: 24px; }
.lp-soc { flex: 1; padding: 12px; border-radius: 12px; background: rgba(241,245,249,0.8); border: 1px solid rgba(99,102,241,0.08); display: flex; align-items: center; justify-content: center; cursor: pointer; color: #64748b; transition: all .3s; }
.lp-soc:hover { background: #fff; border-color: rgba(99,102,241,0.15); transform: translateY(-2px); box-shadow: 0 4px 16px rgba(99,102,241,0.1); }

/* Link */
.lp-link { text-align: center; font-size: 14px; color: #64748b; }
.lp-anchor { color: #6366f1; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; transition: all .2s; }
.lp-anchor:hover { color: #8b5cf6; gap: 8px; }
`;

export default Login;
