// src/pages/AuthPage.tsx
// Standalone login/signup page — styled to match the landing page aesthetic.
// Used when a user reaches /login or /signup directly.
import { useState } from 'react';
import '@/styles/landing.css';
import { loginEmail, signup, requestOtp, verifyOtp } from '@/lib/auth';

type AuthMode = 'login' | 'signup';
type Step = 'choose' | 'phone' | 'otp';

interface AuthPageProps {
  initialMode?: AuthMode;
  onLogin: (id: string) => void;
  onGuestMode: () => void;
  onBack: () => void;   // go back to landing
}

export default function AuthPage({ initialMode = 'login', onLogin, onGuestMode, onBack }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [step, setStep] = useState<Step>('choose');

  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [reqId, setReqId] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const reset = () => { setError(''); setSuccess(''); };

  const handleEmail = async () => {
    reset(); setLoading(true);
    try {
      const u = mode === 'signup' ? await signup(email, pass) : await loginEmail(email, pass);
      onLogin(u.email || u.phone || email);
    } catch (e: any) { setError(e.message || 'Authentication failed.'); }
    finally { setLoading(false); }
  };

  const handleSendOtp = async () => {
    reset();
    if (phone.length !== 10) { setError('Enter a valid 10-digit mobile number.'); return; }
    setLoading(true);
    try {
      const { requestId } = await requestOtp(phone);
      setReqId(requestId); setStep('otp'); setSuccess(`OTP sent to +91 ${phone}`);
    } catch (e: any) { setError(e.message || 'Failed to send OTP.'); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async () => {
    reset();
    if (otp.length !== 6) { setError('Enter the 6-digit OTP.'); return; }
    setLoading(true);
    try {
      const u = await verifyOtp(reqId, otp);
      onLogin(u.phone || u.email || phone);
    } catch (e: any) { setError(e.message || 'Invalid OTP.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="lp-root" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: 'min(440px, 100%)', display: 'grid', gap: '1.5rem' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center' }}>
          <button onClick={onBack}
            style={{ background: 'none', border: 'none', fontSize: '2.5rem', fontWeight: 800, color: 'var(--lp-text)', fontFamily: 'Poppins,sans-serif', cursor: 'pointer' }}>
            Safara
          </button>
          <p style={{ color: 'var(--lp-muted)', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
            🇮🇳 Your trusted India travel companion
          </p>
        </div>

        <div className="lp-auth-box" style={{ position: 'relative' }}>
          {step === 'choose' && (
            <>
              <h2>{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
              <p>{mode === 'login' ? 'Sign in to continue your journey' : 'Join Safara — it\'s free'}</p>

              <div className="lp-auth-tabs">
                <button className={`lp-auth-tab${mode === 'login' ? ' lp-active' : ''}`}
                  onClick={() => { setMode('login'); reset(); }}>Login</button>
                <button className={`lp-auth-tab${mode === 'signup' ? ' lp-active' : ''}`}
                  onClick={() => { setMode('signup'); reset(); }}>Sign Up</button>
              </div>

              {error && <div className="lp-auth-error">⚠ {error}</div>}

              <div className="lp-auth-field">
                <label>Email address</label>
                <input type="email" placeholder="you@example.com" value={email}
                  onChange={e => setEmail(e.target.value)} autoComplete="email"
                  onKeyDown={e => e.key === 'Enter' && handleEmail()} />
              </div>
              <div className="lp-auth-field">
                <label>{mode === 'signup' ? 'Create password (min 6 chars)' : 'Password'}</label>
                <input type="password" placeholder="••••••••" value={pass}
                  onChange={e => setPass(e.target.value)}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  onKeyDown={e => e.key === 'Enter' && handleEmail()} />
              </div>

              <button className="lp-auth-btn-full" onClick={handleEmail}
                disabled={!email || pass.length < 6 || loading}>
                {loading ? 'Please wait…' : mode === 'login' ? '🔒 Login with Email' : '✨ Create Account'}
              </button>

              <div className="lp-auth-divider">or</div>

              <button className="lp-auth-btn-outline"
                onClick={() => { setStep('phone'); reset(); }}>
                📱 Continue with Phone OTP
              </button>
              <button className="lp-guest-btn" onClick={onGuestMode}>
                Continue as Guest (browse only)
              </button>
            </>
          )}

          {step === 'phone' && (
            <>
              <button className="lp-auth-back" onClick={() => { setStep('choose'); reset(); }}>← Back</button>
              <h2>Phone Sign-In</h2>
              <p>We'll send a 6-digit OTP to your number</p>
              {error && <div className="lp-auth-error">⚠ {error}</div>}
              <div className="lp-auth-field">
                <label>Mobile number</label>
                <div className="lp-phone-prefix">
                  <span>+91</span>
                  <input type="tel" placeholder="9876543210" value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    onKeyDown={e => e.key === 'Enter' && handleSendOtp()} />
                </div>
              </div>
              <button className="lp-auth-btn-full" onClick={handleSendOtp}
                disabled={phone.length !== 10 || loading}>
                {loading ? 'Sending…' : 'Send OTP'}
              </button>
            </>
          )}

          {step === 'otp' && (
            <>
              <button className="lp-auth-back" onClick={() => { setStep('phone'); reset(); }}>← Change number</button>
              <h2>Enter OTP</h2>
              <p>Code sent to +91 {phone}</p>
              {error && <div className="lp-auth-error">⚠ {error}</div>}
              {success && <div className="lp-auth-success">✓ {success}</div>}
              <div className="lp-auth-field">
                <label>6-digit verification code</label>
                <input type="text" inputMode="numeric" placeholder="1 2 3 4 5 6" value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()}
                  style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5em' }} />
              </div>
              <button className="lp-auth-btn-full" onClick={handleVerifyOtp}
                disabled={otp.length !== 6 || loading}>
                {loading ? 'Verifying…' : 'Verify & Continue →'}
              </button>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', color: 'var(--lp-muted)', fontSize: '0.8rem', margin: 0 }}>
          By continuing, you agree to Safara's Terms of Service and Privacy Policy.
        </p>

        <button onClick={onBack}
          style={{ background: 'none', border: 'none', color: 'var(--lp-muted)', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontSize: '0.85rem', textAlign: 'center' }}>
          ← Back to Safara home
        </button>
      </div>
    </div>
  );
}
