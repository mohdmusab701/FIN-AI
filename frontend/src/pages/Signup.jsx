import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n';
import { registerUser } from '../api/client';
import { DollarSign, Mail, Lock, User, Building, ArrowRight, CheckCircle2, Sparkles, TrendingUp, FileText, Calculator } from 'lucide-react';
import toast from 'react-hot-toast';

const benefits = [
  { icon: Sparkles, text: 'AI-powered expense categorization', color: '#a78bfa' },
  { icon: TrendingUp, text: 'Smart cash flow predictions', color: '#34d399' },
  { icon: FileText, text: 'Professional PDF invoices', color: '#60a5fa' },
  { icon: Calculator, text: 'GST-ready tax estimation', color: '#fbbf24' },
];

const businessTypes = [
  { value: 'retail', label: 'Retail' },
  { value: 'services', label: 'Services' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'technology', label: 'Technology' },
  { value: 'food', label: 'Food & Beverage' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'other', label: 'Other' },
];

const Signup = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    businessName: '', businessType: 'other'
  });
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
      const { data } = await registerUser(form);
      login(data, data.token);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ name, label, type = 'text', icon: Icon, placeholder, required = true, minLength }) => (
    <div className={`sp-fld ${focusedField === name ? 'sp-fld-on' : ''}`}>
      <label className="sp-lbl">{label}</label>
      <div className="sp-inp-wrap">
        <div className="sp-inp-ico"><Icon size={18} /></div>
        <input type={type} className="sp-inp" placeholder={placeholder}
          value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })}
          onFocus={() => setFocusedField(name)} onBlur={() => setFocusedField(null)}
          required={required} minLength={minLength} id={`signup-${name}`} />
        <div className="sp-inp-glow" />
      </div>
    </div>
  );

  return (
    <>
      <style>{signupStyles}</style>
      <div className="sp-page">
        {/* Animated BG */}
        <div className="sp-bg">
          <div className="sp-grad sp-grad-1" />
          <div className="sp-grad sp-grad-2" />
          <div className="sp-grad sp-grad-3" />
          <div className="sp-grid-lines" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`sp-orb sp-orb-${i + 1}`} />
          ))}
        </div>

        <div className="sp-container">
          {/* Left Showcase */}
          <div className={`sp-left ${mounted ? 'sp-left-on' : ''}`}>
            <div className="sp-left-inner">
              {/* Logo */}
              <div className="sp-logo-wrap">
                <div className="sp-logo-ring" />
                <div className="sp-logo-ring sp-logo-ring2" />
                <div className="sp-logo-box">
                  <DollarSign size={36} color="#fff" />
                </div>
              </div>

              <h1 className="sp-brand">Join <span className="sp-brand-ai">FinAI</span></h1>
              <p className="sp-tagline">Start managing your business finances with the power of AI</p>

              {/* Benefits */}
              <div className="sp-benefits">
                {benefits.map((b, i) => (
                  <div key={i} className="sp-benefit" style={{ animationDelay: `${0.5 + i * 0.12}s`, '--bc': b.color }}>
                    <div className="sp-benefit-check" style={{ background: `${b.color}20`, color: b.color }}>
                      <CheckCircle2 size={16} />
                    </div>
                    <div className="sp-benefit-ico" style={{ color: b.color }}>
                      <b.icon size={16} />
                    </div>
                    <span className="sp-benefit-txt">{b.text}</span>
                  </div>
                ))}
              </div>

              {/* Testimonial */}
              <div className="sp-testimonial">
                <p className="sp-testi-text">"FinAI saved us ₹2.5L in tax planning last year. The AI insights are incredibly accurate."</p>
                <div className="sp-testi-author">
                  <div className="sp-testi-avatar">RK</div>
                  <div>
                    <p className="sp-testi-name">Rajesh Kumar</p>
                    <p className="sp-testi-role">CEO, TechStar Solutions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div className={`sp-right ${mounted ? 'sp-right-on' : ''}`}>
            <div className="sp-card">
              {/* Mobile logo */}
              <div className="sp-mob-logo">
                <div className="sp-mob-ico"><DollarSign size={22} color="#fff" /></div>
                <span className="sp-mob-txt">Fin<span style={{ color: '#10b981' }}>AI</span></span>
              </div>

              <div className="sp-heading">
                <h2 className="sp-title">{t('auth.createAccount')} <span className="sp-rocket">🚀</span></h2>
                <p className="sp-sub">Get started in minutes — no credit card required</p>
              </div>

              <form onSubmit={handleSubmit} className="sp-form">
                <Field name="name" label={t('auth.name')} icon={User} placeholder="John Doe" />
                <Field name="email" label={t('auth.email')} type="email" icon={Mail} placeholder="you@company.com" />
                <Field name="password" label={t('auth.password')} type="password" icon={Lock} placeholder="Min. 6 characters" minLength={6} />

                <div className="sp-row">
                  <Field name="businessName" label={t('auth.businessName')} icon={Building} placeholder="My Business" required={false} />
                  <div className={`sp-fld ${focusedField === 'businessType' ? 'sp-fld-on' : ''}`}>
                    <label className="sp-lbl">{t('auth.businessType')}</label>
                    <div className="sp-inp-wrap">
                      <select className="sp-inp sp-select" value={form.businessType}
                        onChange={(e) => setForm({ ...form, businessType: e.target.value })}
                        onFocus={() => setFocusedField('businessType')} onBlur={() => setFocusedField(null)}
                        id="signup-businessType">
                        {businessTypes.map((type) => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                      <div className="sp-inp-glow" />
                    </div>
                  </div>
                </div>

                <button type="submit" className="sp-btn" disabled={loading} id="signup-submit-btn">
                  <div className="sp-btn-bg" />
                  <span className="sp-btn-txt">
                    {loading ? <div className="sp-spin" /> : <>{t('auth.signup')} <ArrowRight size={18} className="sp-btn-arr" /></>}
                  </span>
                </button>
              </form>

              <p className="sp-link">
                {t('auth.hasAccount')}{' '}
                <Link to="/login" className="sp-anchor">{t('auth.login')} <ArrowRight size={14} /></Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const signupStyles = `
/* ===== SIGNUP PAGE ===== */
.sp-page { min-height: 100vh; position: relative; overflow: hidden; font-family: 'Inter', system-ui, sans-serif; }

/* BG — emerald/teal theme */
.sp-bg { position: fixed; inset: 0; z-index: 0; background: linear-gradient(135deg, #ecfdf5 0%, #e6fffa 30%, #f0fdfa 60%, #ecfdf5 100%); }
.sp-grad { position: absolute; border-radius: 50%; }
.sp-grad-1 { width: 800px; height: 800px; top: -200px; left: -200px; background: radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%); animation: spF1 15s ease-in-out infinite; }
.sp-grad-2 { width: 600px; height: 600px; bottom: -100px; right: -100px; background: radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%); animation: spF2 18s ease-in-out infinite; }
.sp-grad-3 { width: 500px; height: 500px; top: 50%; left: 50%; transform: translate(-50%, -50%); background: radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%); animation: spF3 12s ease-in-out infinite; }
.sp-grid-lines { position: absolute; inset: 0; background-image: linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px); background-size: 60px 60px; mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%); -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%); }

.sp-orb { position: absolute; border-radius: 50%; filter: blur(1px); animation: spOrb 20s ease-in-out infinite; }
.sp-orb-1 { width: 6px; height: 6px; background: #34d399; top: 15%; left: 20%; animation-delay: 0s; animation-duration: 22s; }
.sp-orb-2 { width: 5px; height: 5px; background: #22d3ee; top: 40%; left: 10%; animation-delay: -3s; animation-duration: 18s; }
.sp-orb-3 { width: 7px; height: 7px; background: #60a5fa; top: 65%; left: 30%; animation-delay: -7s; animation-duration: 25s; }
.sp-orb-4 { width: 5px; height: 5px; background: #a78bfa; top: 20%; right: 25%; animation-delay: -5s; animation-duration: 20s; }
.sp-orb-5 { width: 6px; height: 6px; background: #fb923c; top: 55%; right: 15%; animation-delay: -10s; animation-duration: 24s; }
.sp-orb-6 { width: 8px; height: 8px; background: #f472b6; top: 75%; right: 35%; animation-delay: -2s; animation-duration: 16s; }

@keyframes spOrb { 0%,100%{transform:translate(0,0) scale(1);opacity:.4} 25%{transform:translate(30px,-40px) scale(1.5);opacity:.8} 50%{transform:translate(-20px,20px) scale(.8);opacity:.3} 75%{transform:translate(40px,30px) scale(1.3);opacity:.7} }
@keyframes spF1 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(80px,60px)} 66%{transform:translate(-40px,80px)} }
@keyframes spF2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-60px,-80px) scale(1.15)} }
@keyframes spF3 { 0%,100%{transform:translate(-50%,-50%) scale(1);opacity:.12} 50%{transform:translate(-50%,-50%) scale(1.3);opacity:.22} }

/* Layout */
.sp-container { position: relative; z-index: 1; min-height: 100vh; display: flex; }

/* Left */
.sp-left { display: none; width: 50%; padding: 48px; align-items: center; justify-content: center; opacity: 0; transform: translateX(-40px); transition: all .8s cubic-bezier(.16,1,.3,1); }
.sp-left-on { opacity: 1; transform: translateX(0); }
@media(min-width:1024px) { .sp-left { display: flex; } }
.sp-left-inner { max-width: 440px; width: 100%; }

/* Logo */
.sp-logo-wrap { position: relative; width: 80px; height: 80px; margin-bottom: 32px; }
.sp-logo-box { width: 80px; height: 80px; border-radius: 24px; background: linear-gradient(135deg, #059669, #10b981, #06b6d4); display: flex; align-items: center; justify-content: center; position: relative; z-index: 2; box-shadow: 0 8px 32px rgba(16,185,129,0.3), inset 0 1px 0 rgba(255,255,255,0.2); }
.sp-logo-ring { position: absolute; inset: -6px; border-radius: 28px; border: 2px solid rgba(16,185,129,0.2); animation: spRing 8s linear infinite; z-index: 1; }
.sp-logo-ring2 { inset: -12px; border-radius: 32px; border-color: rgba(6,182,212,0.1); animation-duration: 12s; animation-direction: reverse; }
@keyframes spRing { 0%{transform:rotate(0deg);border-color:rgba(16,185,129,.2)} 50%{border-color:rgba(6,182,212,.35)} 100%{transform:rotate(360deg);border-color:rgba(16,185,129,.2)} }

/* Brand */
.sp-brand { font-size: 48px; font-weight: 800; color: #1e293b; letter-spacing: -1px; margin-bottom: 8px; }
.sp-brand-ai { background: linear-gradient(135deg, #059669, #10b981, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.sp-tagline { color: #64748b; font-size: 16px; line-height: 1.6; margin-bottom: 36px; }

/* Benefits */
.sp-benefits { display: flex; flex-direction: column; gap: 10px; margin-bottom: 36px; }
.sp-benefit { padding: 14px 16px; border-radius: 14px; background: rgba(255,255,255,0.6); border: 1px solid rgba(16,185,129,0.08); display: flex; align-items: center; gap: 12px; transition: all .3s; opacity: 0; transform: translateX(-20px); animation: spBenIn .5s ease-out forwards; box-shadow: 0 2px 8px rgba(16,185,129,0.05); }
.sp-benefit:hover { background: rgba(255,255,255,0.85); border-color: var(--bc, rgba(16,185,129,.12)); transform: translateX(4px); box-shadow: 0 4px 16px rgba(16,185,129,0.08); }
@keyframes spBenIn { to { opacity: 1; transform: translateX(0); } }
.sp-benefit-check { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.sp-benefit-ico { flex-shrink: 0; }
.sp-benefit-txt { font-size: 13px; font-weight: 500; color: #334155; }

/* Testimonial */
.sp-testimonial { padding: 20px; border-radius: 16px; background: rgba(255,255,255,0.6); border: 1px solid rgba(16,185,129,0.08); box-shadow: 0 2px 8px rgba(16,185,129,0.05); }
.sp-testi-text { font-size: 14px; color: #475569; font-style: italic; line-height: 1.6; margin-bottom: 16px; }
.sp-testi-author { display: flex; align-items: center; gap: 12px; }
.sp-testi-avatar { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #10b981, #06b6d4); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #fff; flex-shrink: 0; }
.sp-testi-name { font-size: 13px; font-weight: 600; color: #1e293b; }
.sp-testi-role { font-size: 11px; color: #64748b; margin-top: 1px; }

/* Right */
.sp-right { width: 100%; display: flex; align-items: center; justify-content: center; padding: 24px; opacity: 0; transform: translateY(30px); transition: all .8s cubic-bezier(.16,1,.3,1) .2s; }
.sp-right-on { opacity: 1; transform: translateY(0); }
@media(min-width:1024px) { .sp-right { width: 50%; padding: 32px; } }

/* Card */
.sp-card { width: 100%; max-width: 460px; padding: 36px; border-radius: 28px; background: rgba(255,255,255,0.7); border: 1px solid rgba(16,185,129,0.1); backdrop-filter: blur(24px); box-shadow: 0 24px 64px rgba(16,185,129,0.06), 0 4px 12px rgba(0,0,0,0.04); }

/* Mobile logo */
.sp-mob-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
@media(min-width:1024px) { .sp-mob-logo { display: none; } }
.sp-mob-ico { width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #059669, #10b981); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(16,185,129,0.3); }
.sp-mob-txt { font-size: 22px; font-weight: 800; color: #1e293b; }

/* Heading */
.sp-heading { margin-bottom: 28px; }
.sp-title { font-size: 26px; font-weight: 800; color: #1e293b; letter-spacing: -0.5px; margin-bottom: 6px; display: flex; align-items: center; gap: 8px; }
.sp-rocket { display: inline-block; animation: spRocket 3s ease-in-out infinite; }
@keyframes spRocket { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
.sp-sub { color: #64748b; font-size: 14px; }

/* Form */
.sp-form { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
.sp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media(max-width:480px) { .sp-row { grid-template-columns: 1fr; } }
.sp-fld { position: relative; }
.sp-lbl { display: block; font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
.sp-inp-wrap { position: relative; border-radius: 12px; overflow: hidden; }
.sp-inp-ico { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8; z-index: 2; transition: color .3s; }
.sp-fld-on .sp-inp-ico { color: #10b981; }
.sp-inp { width: 100%; padding: 12px 14px 12px 44px; background: rgba(241,245,249,0.8); border: 1.5px solid rgba(16,185,129,0.1); border-radius: 12px; color: #1e293b; font-size: 14px; font-family: inherit; outline: none; transition: all .3s cubic-bezier(.16,1,.3,1); position: relative; z-index: 1; }
.sp-inp::placeholder { color: #94a3b8; }
.sp-inp:focus { border-color: rgba(16,185,129,0.4); background: #fff; box-shadow: 0 0 0 4px rgba(16,185,129,0.08), 0 4px 16px rgba(16,185,129,0.06); }
.sp-select { padding-left: 14px; appearance: none; background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e"); background-position: right 12px center; background-repeat: no-repeat; background-size: 20px; padding-right: 36px; cursor: pointer; }
.sp-select option { background: #fff; color: #1e293b; }
.sp-inp-glow { position: absolute; inset: -1px; border-radius: 12px; background: linear-gradient(135deg, #10b981, #06b6d4, #3b82f6); opacity: 0; transition: opacity .3s; z-index: 0; }
.sp-fld-on .sp-inp-glow { opacity: 0.08; }

/* Button */
.sp-btn { position: relative; width: 100%; padding: 15px; border: none; border-radius: 14px; cursor: pointer; overflow: hidden; margin-top: 4px; background: transparent; transition: transform .2s, box-shadow .3s; }
.sp-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(16,185,129,0.3); }
.sp-btn:active:not(:disabled) { transform: translateY(0); }
.sp-btn:disabled { opacity: .7; cursor: not-allowed; }
.sp-btn-bg { position: absolute; inset: 0; background: linear-gradient(135deg, #059669, #10b981, #06b6d4); border-radius: 14px; z-index: 0; }
.sp-btn-bg::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%); animation: spShim 3s ease-in-out infinite; }
@keyframes spShim { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
.sp-btn-txt { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 15px; font-weight: 700; color: #fff; letter-spacing: .3px; }
.sp-btn-arr { transition: transform .3s; }
.sp-btn:hover .sp-btn-arr { transform: translateX(4px); }
.sp-spin { width: 20px; height: 20px; border: 2.5px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spSpin .6s linear infinite; }
@keyframes spSpin { to { transform: rotate(360deg); } }

/* Link */
.sp-link { text-align: center; font-size: 14px; color: #64748b; }
.sp-anchor { color: #059669; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; transition: all .2s; }
.sp-anchor:hover { color: #10b981; gap: 8px; }
`;

export default Signup;
