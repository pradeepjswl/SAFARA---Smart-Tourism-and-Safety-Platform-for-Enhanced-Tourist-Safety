// src/components/LandingPage.tsx
// Updated UI from safara-updated, all features wired to the real backend
import { useState, useEffect, useRef, useCallback } from 'react';
import '@/styles/landing.css';
import { loginEmail, signup, requestOtp, verifyOtp } from '@/lib/auth';

// ─── Types ─────────────────────────────────────────────────────────────────
interface LandingPageProps {
  onLogin: (id: string, accessToken?: string) => void;
  onGuestMode: () => void;
}

type AuthMode = 'login' | 'signup';
type AuthStep = 'choose' | 'phone' | 'otp';

interface ChatMsg { role: 'bot' | 'user'; text: string; }

// ─── Static data ────────────────────────────────────────────────────────────
const FEATURES = [
  { title: 'AI Itinerary Builder',   desc: 'Plan day-by-day trips with AI suggestions',           icon: '🗺️', goto: 'plan-journey' },
  { title: 'Destination Finder',     desc: 'Discover hidden gems across 28 states & UTs',         icon: '🔍', goto: null },
  { title: 'Budget Calculator',      desc: 'Estimate trip costs in real time',                    icon: '💰', goto: null },
  { title: 'Currency Converter',     desc: 'INR to USD, EUR, GBP, AED instantly',                 icon: '💱', goto: null },
  { title: 'Packing Checklist',      desc: 'Personalised packing list builder',                   icon: '🎒', goto: null },
  { title: 'Festival Calendar',      desc: 'Never miss an Indian festival',                        icon: '🎉', goto: null },
  { title: 'Phrase Assistant',       desc: 'Key travel phrases in local languages',                icon: '🗣️', goto: null },
  { title: 'Weather Ready Tips',     desc: 'Season-smart guidance for every destination',         icon: '🌤️', goto: null },
  { title: 'Rail / Air Shortcuts',   desc: 'Quick links to IRCTC & airlines',                    icon: '✈️', goto: null },
  { title: 'Hotel Planning Notes',   desc: 'Save and compare stay options',                       icon: '🏨', goto: null },
  { title: 'Emergency Contacts',     desc: 'Police, ambulance, tourist helpline in one tap',      icon: '🆘', goto: 'personal-safety' },
  { title: 'Visa & ID Tracker',      desc: 'Track document status in real time',                  icon: '🪪', goto: 'personal-id' },
  { title: 'Smart Notifications',    desc: 'Geofence alerts and safety warnings',                 icon: '🔔', goto: 'track-location' },
  { title: 'Photo Spot Guide',       desc: 'Best photo spots at every destination',               icon: '📸', goto: null },
  { title: 'Group Trip Sharing',     desc: 'Share itineraries with your travel group',            icon: '👥', goto: null },
  { title: 'Customer Support Chat',  desc: 'AI guide available 24/7 in your language',            icon: '💬', goto: 'guide-chatbot' },
  { title: 'Testimonials & Reviews', desc: 'Real stories from Safara travellers',                 icon: '⭐', goto: null },
  { title: 'Lead Capture Form',      desc: 'Book a curated experience with one message',          icon: '📋', goto: null },
];

const DESTINATIONS = [
  { name: 'Jaipur',    tags: 'palace heritage desert',   region: 'north',   emoji: '🏰',
    img: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=600&q=80' },
  { name: 'Goa',       tags: 'beach nightlife portuguese', region: 'west',  emoji: '🏖️',
    img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80' },
  { name: 'Varanasi',  tags: 'temple spiritual ghat',    region: 'north',   emoji: '🪔',
    img: 'https://images.unsplash.com/photo-1561361058-c24e022afe5c?auto=format&fit=crop&w=600&q=80' },
  { name: 'Munnar',    tags: 'hill tea nature',           region: 'south',  emoji: '🍃',
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80' },
  { name: 'Shillong',  tags: 'waterfall clouds music',   region: 'east',   emoji: '🌧️',
    img: 'https://images.unsplash.com/photo-1601889088093-4e9aff02c0c8?auto=format&fit=crop&w=600&q=80' },
  { name: 'Khajuraho', tags: 'temple history art',        region: 'central',emoji: '🏛️',
    img: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80' },
  { name: 'Leh Ladakh',tags: 'mountain adventure bikes', region: 'north',   emoji: '⛰️',
    img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80' },
  { name: 'Mysuru',    tags: 'palace garden festival',   region: 'south',   emoji: '🌺',
    img: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=600&q=80' },
];

const FESTIVALS: Record<string, string[]> = {
  jan: ['Pongal', 'Jaipur Literature Festival', 'Republic Day'],
  feb: ['Vasant Panchami', 'Desert Festival (Jaisalmer)'],
  mar: ['Holi', 'Chapchar Kut', 'Ugadi'],
  apr: ['Baisakhi', 'Vishu', 'Ram Navami'],
  aug: ['Independence Day', 'Janmashtami', 'Onam'],
  oct: ['Navratri', 'Durga Puja', 'Dussehra'],
  nov: ['Diwali', 'Pushkar Camel Fair', 'Chhath Puja'],
  dec: ['Christmas', 'Hornbill Festival', 'New Year'],
};

const PHRASES = [
  'Namaste — Hello / Greetings',
  'Dhanyavaad — Thank you',
  'Kripya — Please',
  'Kitna hai? — How much?',
  'Madad chahiye — I need help',
  'Bahut sundar — Very beautiful',
  'Kahan hai? — Where is it?',
  'Mujhe hospital jana hai — I need to go to hospital',
];

const TESTIMONIALS = [
  { text: 'Safara made our Rajasthan circuit effortless and elegant. The SOS feature gave us real peace of mind.', author: 'Aditi M., Delhi' },
  { text: 'The budget + itinerary combo is exactly what I needed for my solo backpacking trip.', author: 'Rahul K., Pune' },
  { text: 'Design feels premium and the personal ID system worked perfectly at every checkpoint.', author: 'Sneha P., Bengaluru' },
  { text: 'Used the tourist ID across 4 states in Rajasthan — zero issues. Loved the chatbot too.', author: 'Priya S., Mumbai' },
];

const FAQS = [
  { q: 'Is Safara free to use?', a: 'Yes, the core planning experience is free for all travellers. Some identity features require account creation.' },
  { q: 'Can I use Safara on mobile?', a: 'Absolutely. Safara is fully optimised for phones, tablets, and desktops.' },
  { q: 'Does Safara support group trips?', a: 'Yes. Share itinerary plans and budgets with your entire travel group.' },
  { q: 'What is the Tourist ID?', a: 'A QR-enabled digital pass that authorities can scan for quick identity verification at checkpoints and hotels.' },
  { q: 'Is my data safe?', a: 'All documents are stored encrypted. Safara never shares your data with third parties without consent.' },
  { q: 'How does the SOS emergency feature work?', a: 'Tap SOS in your active tour, it instantly broadcasts your GPS location to emergency services and your family circle.' },
];

const INR_RATES: Record<string, number> = { USD: 0.012, EUR: 0.011, GBP: 0.0094, AED: 0.044, JPY: 1.78, CAD: 0.016 };

// ─── Gemini helper (same key/model as GuideChatbot.tsx) ─────────────────────
const GEMINI_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY || 'AIzaSyA5gJDHaYhugMU1H-IoMpGUoJDaO9-Ipl8';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_KEY}`;

async function askGemini(message: string): Promise<string> {
  const system = 'You are the Safara travel assistant for Indian tourism. Be concise, warm, and practical. Help with destinations, budgets, safety, food, culture, and itineraries across India.';
  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: `${system}\n\nUser: ${message}` }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 450 },
    }),
  });
  if (!res.ok) throw new Error('AI unavailable');
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'Sorry, I could not answer that right now.';
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function LandingPage({ onLogin, onGuestMode }: LandingPageProps) {
  // ── UI state ────────────────────────────────────────────────────────────
  const [isLight, setIsLight] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [preloaderHidden, setPreloaderHidden] = useState(false);
  const [showBackTop, setShowBackTop] = useState(false);

  // ── Auth modal state ─────────────────────────────────────────────────────
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [authStep, setAuthStep] = useState<AuthStep>('choose');
  const [authEmail, setAuthEmail] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authOtp, setAuthOtp] = useState('');
  const [authReqId, setAuthReqId] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // ── Feature section state ────────────────────────────────────────────────
  const [featureSearch, setFeatureSearch] = useState('');

  // ── Destination finder ───────────────────────────────────────────────────
  const [destQuery, setDestQuery] = useState('');
  const [destRegion, setDestRegion] = useState('all');

  // ── Planner tools ────────────────────────────────────────────────────────
  const [itineraryCity, setItineraryCity] = useState('');
  const [itinerary, setItinerary] = useState<string[]>([]);
  const [budgetDays, setBudgetDays] = useState(5);
  const [budgetDaily, setBudgetDaily] = useState(3000);
  const [budgetResult, setBudgetResult] = useState('');
  const [inrAmount, setInrAmount] = useState(10000);
  const [currency, setCurrency] = useState('USD');
  const [convertResult, setConvertResult] = useState('');

  // ── Packing / Festival / Phrase ──────────────────────────────────────────
  const [packingInput, setPackingInput] = useState('');
  const [packingItems, setPackingItems] = useState<string[]>([]);
  const [festivalMonth, setFestivalMonth] = useState('all');
  const [phraseIdx, setPhraseIdx] = useState(0);

  // ── Testimonials / FAQ ───────────────────────────────────────────────────
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // ── Lead form ─────────────────────────────────────────────────────────────
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadMsg, setLeadMsg] = useState('');
  const [leadResult, setLeadResult] = useState('');

  // ── Chat ──────────────────────────────────────────────────────────────────
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([
    { role: 'bot', text: 'Namaste! 🙏 I am your Safara travel assistant. Ask me about destinations, budgets, safety tips, food, or itinerary ideas across India.' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatLogRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  useEffect(() => { const t = setTimeout(() => setPreloaderHidden(true), 2100); return () => clearTimeout(t); }, []);

  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx(i => (i + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!preloaderHidden) return;
    const obs = new IntersectionObserver(
      es => es.forEach(e => e.target.classList.toggle('lp-visible', e.isIntersecting)),
      { threshold: 0.1 }
    );
    rootRef.current?.querySelectorAll('.lp-reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [preloaderHidden]);

  useEffect(() => {
    const h = () => setShowBackTop(window.scrollY > 500);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    if (chatLogRef.current) chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
  }, [chatMsgs]);

  // ── Auth helpers ──────────────────────────────────────────────────────────
  const openAuthModal = (mode: AuthMode = 'login') => {
    setAuthMode(mode); setAuthStep('choose');
    setAuthError(''); setAuthSuccess('');
    setAuthEmail(''); setAuthPass(''); setAuthPhone(''); setAuthOtp('');
    setShowAuth(true);
  };

  const closeAuth = () => { setShowAuth(false); setAuthError(''); setAuthSuccess(''); };

  const handleEmailAuth = async () => {
    setAuthError(''); setAuthLoading(true);
    try {
      const user = authMode === 'signup'
        ? await signup(authEmail, authPass)
        : await loginEmail(authEmail, authPass);
      onLogin(user.email || user.phone || authEmail);
    } catch (e: any) {
      setAuthError(e.message || 'Authentication failed. Please check your details.');
    } finally { setAuthLoading(false); }
  };

  const handleSendOtp = async () => {
    setAuthError('');
    if (authPhone.length !== 10) { setAuthError('Enter a valid 10-digit mobile number.'); return; }
    setAuthLoading(true);
    try {
      const { requestId } = await requestOtp(authPhone);
      setAuthReqId(requestId);
      setAuthStep('otp');
      setAuthSuccess(`OTP sent to +91 ${authPhone}`);
    } catch (e: any) { setAuthError(e.message || 'Failed to send OTP.'); }
    finally { setAuthLoading(false); }
  };

  const handleVerifyOtp = async () => {
    setAuthError('');
    if (authOtp.length !== 6) { setAuthError('Enter the 6-digit OTP.'); return; }
    setAuthLoading(true);
    try {
      const user = await verifyOtp(authReqId, authOtp);
      onLogin(user.phone || user.email || authPhone);
    } catch (e: any) { setAuthError(e.message || 'Invalid OTP.'); }
    finally { setAuthLoading(false); }
  };

  // ── Chat handler ──────────────────────────────────────────────────────────
  const sendChat = useCallback(async (msg: string) => {
    if (!msg.trim() || chatLoading) return;
    setChatMsgs(p => [...p, { role: 'user', text: msg }]);
    setChatInput('');
    setChatLoading(true);
    setChatMsgs(p => [...p, { role: 'bot', text: '…' }]);
    try {
      const reply = await askGemini(msg);
      setChatMsgs(p => { const n = [...p]; n[n.length - 1] = { role: 'bot', text: reply }; return n; });
    } catch {
      setChatMsgs(p => { const n = [...p]; n[n.length - 1] = { role: 'bot', text: 'Sorry, I could not reach the AI right now. Please try again.' }; return n; });
    } finally { setChatLoading(false); }
  }, [chatLoading]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const filteredFeatures = FEATURES.filter(f =>
    !featureSearch || f.title.toLowerCase().includes(featureSearch.toLowerCase()) ||
    f.desc.toLowerCase().includes(featureSearch.toLowerCase())
  );

  const filteredDests = DESTINATIONS.filter(d =>
    (destRegion === 'all' || d.region === destRegion) &&
    (!destQuery || `${d.name} ${d.tags}`.toLowerCase().includes(destQuery.toLowerCase()))
  );

  const festivalList = festivalMonth === 'all'
    ? Object.values(FESTIVALS).flat()
    : FESTIVALS[festivalMonth] || [];

  // ── Feature card click ────────────────────────────────────────────────────
  const handleFeatureClick = (feature: typeof FEATURES[0]) => {
    if (feature.goto) {
      // Features that require login navigate into app after auth
      openAuthModal('login');
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div ref={rootRef} className={`lp-root${isLight ? ' lp-light' : ''}`}>

      {/* ── Preloader ─────────────────────────────────────────────────── */}
      <div className={`lp-intro-screen${preloaderHidden ? ' lp-hidden' : ''}`}>
        <div className="lp-intro-content">
          <div className="lp-namaste-photo-wrap">
            <img className="lp-namaste-photo" src="/namaste-bg.jpg" alt="Namaste hands"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
          <p className="lp-intro-kicker">Welcome to Incredible India</p>
          <h1>Namaste 🙏</h1>
          <p className="lp-intro-copy">
            Discover journeys filled with heritage, colour, culture, and unforgettable destinations.
          </p>
          <div className="lp-loader" />
        </div>
      </div>

      {/* ── Auth Modal ────────────────────────────────────────────────── */}
      {showAuth && (
        <div className="lp-auth-overlay" onClick={e => { if (e.target === e.currentTarget) closeAuth(); }}>
          <div className="lp-auth-box">
            <button className="lp-auth-close" onClick={closeAuth} aria-label="Close">✕</button>

            {authStep === 'choose' && (
              <>
                <h2>Welcome to Safara</h2>
                <p>{authMode === 'login' ? 'Sign in to continue your journey' : 'Create your free Safara account'}</p>

                <div className="lp-auth-tabs">
                  <button className={`lp-auth-tab${authMode === 'login' ? ' lp-active' : ''}`}
                    onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccess(''); }}>Login</button>
                  <button className={`lp-auth-tab${authMode === 'signup' ? ' lp-active' : ''}`}
                    onClick={() => { setAuthMode('signup'); setAuthError(''); setAuthSuccess(''); }}>Sign Up</button>
                </div>

                {authError && <div className="lp-auth-error">⚠ {authError}</div>}
                {authSuccess && <div className="lp-auth-success">✓ {authSuccess}</div>}

                <div className="lp-auth-field">
                  <label>Email address</label>
                  <input type="email" placeholder="you@example.com" value={authEmail}
                    onChange={e => setAuthEmail(e.target.value)} autoComplete="email"
                    onKeyDown={e => e.key === 'Enter' && handleEmailAuth()} />
                </div>
                <div className="lp-auth-field">
                  <label>{authMode === 'signup' ? 'Create password (min 6 chars)' : 'Password'}</label>
                  <input type="password" placeholder="••••••••" value={authPass}
                    onChange={e => setAuthPass(e.target.value)}
                    autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                    onKeyDown={e => e.key === 'Enter' && handleEmailAuth()} />
                </div>
                <button className="lp-auth-btn-full"
                  onClick={handleEmailAuth}
                  disabled={!authEmail || authPass.length < 6 || authLoading}>
                  {authLoading ? 'Please wait…' : authMode === 'login' ? '🔒 Login with Email' : '✨ Create Account'}
                </button>

                <div className="lp-auth-divider">or</div>

                <button className="lp-auth-btn-outline"
                  onClick={() => { setAuthStep('phone'); setAuthError(''); setAuthSuccess(''); }}>
                  📱 Continue with Phone OTP
                </button>
                <button className="lp-guest-btn" onClick={() => { closeAuth(); onGuestMode(); }}>
                  Continue as Guest (browse only)
                </button>
              </>
            )}

            {authStep === 'phone' && (
              <>
                <button className="lp-auth-back" onClick={() => { setAuthStep('choose'); setAuthError(''); }}>← Back</button>
                <h2>Phone Sign-In</h2>
                <p>We'll send a 6-digit OTP to your mobile number</p>
                {authError && <div className="lp-auth-error">⚠ {authError}</div>}
                <div className="lp-auth-field">
                  <label>Mobile number</label>
                  <div className="lp-phone-prefix">
                    <span>+91</span>
                    <input type="tel" placeholder="9876543210" value={authPhone}
                      onChange={e => setAuthPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      onKeyDown={e => e.key === 'Enter' && handleSendOtp()} />
                  </div>
                </div>
                <button className="lp-auth-btn-full" onClick={handleSendOtp}
                  disabled={authPhone.length !== 10 || authLoading}>
                  {authLoading ? 'Sending…' : 'Send OTP'}
                </button>
              </>
            )}

            {authStep === 'otp' && (
              <>
                <button className="lp-auth-back" onClick={() => { setAuthStep('phone'); setAuthError(''); setAuthSuccess(''); }}>← Change number</button>
                <h2>Enter OTP</h2>
                <p>Code sent to +91 {authPhone}</p>
                {authError && <div className="lp-auth-error">⚠ {authError}</div>}
                {authSuccess && <div className="lp-auth-success">✓ {authSuccess}</div>}
                <div className="lp-auth-field">
                  <label>6-digit verification code</label>
                  <input type="text" inputMode="numeric" placeholder="1 2 3 4 5 6"
                    value={authOtp}
                    onChange={e => setAuthOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()}
                    style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5em' }} />
                </div>
                <button className="lp-auth-btn-full" onClick={handleVerifyOtp}
                  disabled={authOtp.length !== 6 || authLoading}>
                  {authLoading ? 'Verifying…' : 'Verify & Continue →'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Sidebar Nav ───────────────────────────────────────────────── */}
      <header className="lp-header" id="lp-top">
        <nav className="lp-container lp-nav">
          <button className="lp-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Safara
          </button>

          <button className="lp-menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">☰</button>

          <ul className={`lp-nav-links${menuOpen ? ' lp-open' : ''}`}>
            {[
              { href: '#lp-features', label: 'Features' },
              { href: '#lp-destinations', label: 'Destinations' },
              { href: '#lp-planner', label: 'Planner' },
              { href: '#lp-chat', label: 'Chat' },
              { href: '#lp-contact', label: 'Contact' },
            ].map(l => (
              <li key={l.href}>
                <a href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a>
              </li>
            ))}
            <li>
              <button className="lp-nav-link-btn lp-btn lp-primary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.88rem' }}
                onClick={() => { setMenuOpen(false); openAuthModal('login'); }}>
                Sign In
              </button>
            </li>
          </ul>

          <button className="lp-theme-toggle" onClick={() => setIsLight(!isLight)} aria-label="Toggle theme">
            {isLight ? '🌙' : '☀️'}
          </button>
        </nav>

        {/* ── Hero ────────────────────────────────────────────────────── */}
        <section className="lp-hero lp-container lp-reveal">
          <div>
            <p className="lp-tag">🇮🇳 India Tourism App</p>
            <h1>Safara — Plan Beautiful Trips Across India</h1>
            <p style={{ lineHeight: 1.7 }}>
              Packed with 18 professional features — AI trip planning, personal ID, SOS emergency,
              live geofencing, and multilingual chat — all in one beautiful app.
            </p>
            <div className="lp-hero-actions">
              <button className="lp-btn lp-primary" onClick={() => openAuthModal('signup')}>
                Start Planning →
              </button>
              <a href="#lp-features" className="lp-btn lp-ghost">Explore Features</a>
              <a href="#lp-chat" className="lp-btn lp-ghost">Chat Support</a>
            </div>
          </div>

          <div className="lp-hero-showcase">
            <div className="lp-hero-stats">
              <div><strong>18</strong><span>Core Features</span></div>
              <div><strong>28</strong><span>States & UTs</span></div>
              <div><strong>365</strong><span>Days to Explore</span></div>
            </div>
            <div className="lp-tourism-gallery">
              <article className="lp-tour-card lp-float-card">
                <img src="https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=900&q=80" alt="Taj Mahal" loading="lazy" />
                <div className="lp-tour-card-copy"><h3>Taj Mahal</h3><p>Agra, Uttar Pradesh</p></div>
              </article>
              <article className="lp-tour-card lp-delay-card lp-hawa-card">
                <img src="https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=900&q=80" alt="Hawa Mahal" loading="lazy" />
                <div className="lp-tour-card-copy"><h3>Hawa Mahal</h3><p>Jaipur, Rajasthan</p></div>
              </article>
              <article className="lp-tour-card lp-rise-card">
                <img src="https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=900&q=80" alt="Kerala Backwaters" loading="lazy" />
                <div className="lp-tour-card-copy"><h3>Kerala Backwaters</h3><p>Alappuzha, Kerala</p></div>
              </article>
            </div>
          </div>
        </section>
      </header>

      <main>
        {/* ── 18 Features ─────────────────────────────────────────────── */}
        <section id="lp-features" className="lp-section lp-container lp-reveal">
          <h2>18 Professional Features in Safara</h2>
          <div className="lp-feature-filter">
            <input type="text" placeholder="Search a feature…" value={featureSearch}
              onChange={e => setFeatureSearch(e.target.value)} />
          </div>
          <div className="lp-grid lp-features-grid">
            {filteredFeatures.map((f, i) => (
              <article key={f.title} className="lp-feature"
                onClick={() => handleFeatureClick(f)}
                title={f.goto ? 'Sign in to use this feature' : undefined}>
                <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{f.icon}</div>
                <h4 style={{ margin: '0 0 0.3rem' }}>{i + 1 + (featureSearch ? '' : '')}. {f.title}</h4>
                <p>{f.desc}</p>
                {f.goto && <div style={{ fontSize: '0.72rem', color: 'var(--lp-accent)', marginTop: '0.3rem' }}>Tap to access →</div>}
              </article>
            ))}
            {filteredFeatures.length === 0 && (
              <p style={{ color: 'var(--lp-muted)', gridColumn: '1/-1' }}>No features match "{featureSearch}"</p>
            )}
          </div>
        </section>

        {/* ── Destinations ─────────────────────────────────────────────── */}
        <section id="lp-destinations" className="lp-section lp-alt lp-reveal">
          <div className="lp-container">
            <h2>Destination Finder</h2>
            <div className="lp-dest-controls">
              <input placeholder="e.g. beach, temple, mountains" value={destQuery}
                onChange={e => setDestQuery(e.target.value)} />
              <select value={destRegion} onChange={e => setDestRegion(e.target.value)}>
                <option value="all">All Regions</option>
                <option value="north">North India</option>
                <option value="south">South India</option>
                <option value="east">East India</option>
                <option value="west">West India</option>
                <option value="central">Central India</option>
              </select>
            </div>
            <div className="lp-grid lp-destination-grid">
              {filteredDests.map(d => (
                <article key={d.name} className="lp-card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ height: 160, overflow: 'hidden', position: 'relative' }}>
                    <img src={d.img} alt={d.name} loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(7,16,31,.8), transparent)' }} />
                    <div style={{ position: 'absolute', bottom: 10, left: 12, color: '#fff' }}>
                      <strong style={{ fontSize: '1.1rem' }}>{d.emoji} {d.name}</strong>
                    </div>
                  </div>
                  <div style={{ padding: '0.75rem 1rem' }}>
                    <p style={{ color: 'var(--lp-muted)', margin: '0 0 0.3rem', fontSize: '0.85rem' }}>{d.tags}</p>
                    <small style={{ color: 'var(--lp-accent)', textTransform: 'capitalize' }}>📍 {d.region} India</small>
                  </div>
                </article>
              ))}
              {filteredDests.length === 0 && (
                <p style={{ color: 'var(--lp-muted)', gridColumn: '1/-1' }}>No destinations match your search.</p>
              )}
            </div>
          </div>
        </section>

        {/* ── Trip Planner Tools ───────────────────────────────────────── */}
        <section id="lp-planner" className="lp-section lp-container lp-reveal">
          <h2>Trip Planner Tools</h2>
          <div className="lp-grid lp-planner-grid">

            {/* Itinerary builder */}
            <div className="lp-card lp-stack">
              <h3 style={{ margin: '0 0 0.75rem', color: 'var(--lp-text)' }}>🗺️ Itinerary Builder</h3>
              <div className="lp-inline-form">
                <input placeholder="Add city (e.g. Jaipur)" value={itineraryCity}
                  onChange={e => setItineraryCity(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && itineraryCity.trim()) {
                      setItinerary(p => [...p, itineraryCity.trim()]); setItineraryCity('');
                    }
                  }} />
                <button className="lp-btn lp-primary" style={{ whiteSpace: 'nowrap' }}
                  onClick={() => { if (itineraryCity.trim()) { setItinerary(p => [...p, itineraryCity.trim()]); setItineraryCity(''); } }}>
                  + Add
                </button>
              </div>
              {itinerary.length > 0
                ? <ol style={{ margin: '0.75rem 0 0', paddingLeft: '1.4rem' }}>
                    {itinerary.map((c, i) => (
                      <li key={i} style={{ color: 'var(--lp-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <span>{c}</span>
                        <button onClick={() => setItinerary(p => p.filter((_, x) => x !== i))}
                          style={{ background: 'none', border: 'none', color: 'var(--lp-muted)', cursor: 'pointer', fontSize: '0.8rem' }}>✕</button>
                      </li>
                    ))}
                  </ol>
                : <p style={{ color: 'var(--lp-muted)', fontSize: '0.85rem', margin: '0.5rem 0 0' }}>Add cities to build your route.</p>
              }
              {itinerary.length > 0 && (
                <button className="lp-btn lp-primary" style={{ marginTop: '0.75rem' }}
                  onClick={() => openAuthModal('login')}>
                  Save to My Trips →
                </button>
              )}
            </div>

            {/* Budget calculator */}
            <div className="lp-card lp-stack">
              <h3 style={{ margin: '0 0 0.75rem', color: 'var(--lp-text)' }}>💰 Budget Calculator</h3>
              <label style={{ color: 'var(--lp-muted)', fontSize: '0.85rem' }}>Number of days</label>
              <input type="number" min={1} value={budgetDays} onChange={e => setBudgetDays(Number(e.target.value))} />
              <label style={{ color: 'var(--lp-muted)', fontSize: '0.85rem' }}>Daily spend (₹)</label>
              <input type="number" min={100} step={500} value={budgetDaily} onChange={e => setBudgetDaily(Number(e.target.value))} />
              <button className="lp-btn lp-primary"
                onClick={() => setBudgetResult(`Estimated: ₹${(budgetDays * budgetDaily).toLocaleString('en-IN')} for ${budgetDays} day${budgetDays !== 1 ? 's' : ''}`)}>
                Calculate
              </button>
              {budgetResult && <p style={{ color: 'var(--lp-accent)', margin: '0.25rem 0 0', fontWeight: 600 }}>{budgetResult}</p>}
            </div>

            {/* Currency converter */}
            <div className="lp-card lp-stack">
              <h3 style={{ margin: '0 0 0.75rem', color: 'var(--lp-text)' }}>💱 Currency Converter</h3>
              <label style={{ color: 'var(--lp-muted)', fontSize: '0.85rem' }}>Amount in ₹ INR</label>
              <input type="number" value={inrAmount} min={1} onChange={e => setInrAmount(Number(e.target.value))} />
              <label style={{ color: 'var(--lp-muted)', fontSize: '0.85rem' }}>Convert to</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)}>
                <option value="USD">🇺🇸 USD — US Dollar</option>
                <option value="EUR">🇪🇺 EUR — Euro</option>
                <option value="GBP">🇬🇧 GBP — British Pound</option>
                <option value="AED">🇦🇪 AED — UAE Dirham</option>
                <option value="JPY">🇯🇵 JPY — Japanese Yen</option>
                <option value="CAD">🇨🇦 CAD — Canadian Dollar</option>
              </select>
              <button className="lp-btn lp-primary"
                onClick={() => setConvertResult(`${currency} ${(inrAmount * INR_RATES[currency]).toFixed(2)} (approx.)`)}>
                Convert
              </button>
              {convertResult && <p style={{ color: 'var(--lp-accent)', margin: '0.25rem 0 0', fontWeight: 600 }}>{convertResult}</p>}
            </div>
          </div>
        </section>

        {/* ── Packing / Festivals / Phrases ───────────────────────────── */}
        <section className="lp-section lp-alt lp-reveal">
          <div className="lp-container">
            <div className="lp-grid lp-planner-grid">

              {/* Packing checklist */}
              <div className="lp-card lp-stack">
                <h3 style={{ margin: '0 0 0.75rem', color: 'var(--lp-text)' }}>🎒 Packing Checklist</h3>
                <div className="lp-inline-form">
                  <input placeholder="Add item (e.g. sunscreen)" value={packingInput}
                    onChange={e => setPackingInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && packingInput.trim()) {
                        setPackingItems(p => [...p, packingInput.trim()]); setPackingInput('');
                      }
                    }} />
                  <button className="lp-btn lp-primary"
                    onClick={() => { if (packingInput.trim()) { setPackingItems(p => [...p, packingInput.trim()]); setPackingInput(''); } }}>
                    Add
                  </button>
                </div>
                <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.2rem' }}>
                  {packingItems.length === 0
                    ? <li style={{ color: 'var(--lp-muted)', listStyle: 'none', padding: 0 }}>No items yet. Start adding!</li>
                    : packingItems.map((item, i) => (
                        <li key={i} style={{ color: 'var(--lp-muted)', display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                          <span>✓ {item}</span>
                          <button onClick={() => setPackingItems(p => p.filter((_, x) => x !== i))}
                            style={{ background: 'none', border: 'none', color: 'var(--lp-muted)', cursor: 'pointer' }}>✕</button>
                        </li>
                      ))
                  }
                </ul>
              </div>

              {/* Festival calendar */}
              <div className="lp-card lp-stack">
                <h3 style={{ margin: '0 0 0.75rem', color: 'var(--lp-text)' }}>🎉 Festival Calendar</h3>
                <select value={festivalMonth} onChange={e => setFestivalMonth(e.target.value)}>
                  <option value="all">All months</option>
                  <option value="jan">January</option>
                  <option value="feb">February</option>
                  <option value="mar">March</option>
                  <option value="apr">April</option>
                  <option value="aug">August</option>
                  <option value="oct">October</option>
                  <option value="nov">November</option>
                  <option value="dec">December</option>
                </select>
                <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.2rem' }}>
                  {festivalList.map(f => (
                    <li key={f} style={{ color: 'var(--lp-muted)', marginBottom: '0.3rem' }}>🎊 {f}</li>
                  ))}
                </ul>
              </div>

              {/* Phrase assistant */}
              <div className="lp-card lp-stack" style={{ alignContent: 'start' }}>
                <h3 style={{ margin: '0 0 0.75rem', color: 'var(--lp-text)' }}>🗣️ Phrase Assistant</h3>
                <p style={{ color: 'var(--lp-muted)', margin: '0 0 1rem', fontSize: '0.9rem' }}>
                  Learn essential travel phrases
                </p>
                <p style={{ color: 'var(--lp-text)', fontWeight: 600, fontSize: '1.05rem', margin: '0 0 1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: 10, border: '1px solid var(--lp-border)' }}>
                  💬 {PHRASES[phraseIdx]}
                </p>
                <button className="lp-btn lp-ghost" onClick={() => setPhraseIdx(i => (i + 1) % PHRASES.length)}>
                  Next Phrase →
                </button>
                <p style={{ color: 'var(--lp-muted)', fontSize: '0.75rem', margin: '0.5rem 0 0' }}>
                  {phraseIdx + 1} / {PHRASES.length}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Testimonials ─────────────────────────────────────────────── */}
        <section className="lp-section lp-container lp-reveal">
          <h2 style={{ textAlign: 'center' }}>What Travellers Say</h2>
          <div className="lp-testimonial lp-card" style={{ textAlign: 'center', padding: '2rem', maxWidth: 640, margin: '0 auto' }}>
            <p style={{ fontSize: '1.1rem', fontStyle: 'italic', color: 'var(--lp-text)', margin: '0 0 1rem' }}>
              "{TESTIMONIALS[testimonialIdx].text}"
            </p>
            <h4 style={{ margin: 0, color: 'var(--lp-accent)' }}>— {TESTIMONIALS[testimonialIdx].author}</h4>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginTop: '1.25rem' }}>
              {TESTIMONIALS.map((_, i) => (
                <button key={i} onClick={() => setTestimonialIdx(i)}
                  style={{ width: 8, height: 8, borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0,
                    background: i === testimonialIdx ? 'var(--lp-accent)' : 'var(--lp-border)', transition: 'background 0.3s' }}
                  aria-label={`Testimonial ${i + 1}`} />
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section className="lp-section lp-alt lp-reveal" id="lp-faq">
          <div className="lp-container">
            <h2>Frequently Asked Questions</h2>
            {FAQS.map((faq, i) => (
              <div key={i} className={`lp-faq-item${openFaq === i ? ' lp-open' : ''}`}>
                <button className="lp-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {openFaq === i ? '▾' : '▸'} {faq.q}
                </button>
                <p className="lp-faq-a">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Embedded Chat ─────────────────────────────────────────────── */}
        <section id="lp-chat" className="lp-section lp-container lp-reveal">
          <div className="lp-chat-section-head">
            <div>
              <p className="lp-tag">Always Available</p>
              <h2>Customer Support Chat</h2>
              <p>Ask about destinations, budgets, safety, food, or anything about India travel. Powered by Safara's AI guide.</p>
            </div>
            <button className="lp-btn lp-primary" onClick={() => openAuthModal('login')}>
              Open Full Chat →
            </button>
          </div>

          <article className="lp-chat-embed lp-card">
            <div className="lp-embedded-chat-shell">
              <div className="lp-embedded-chat-top">
                <h3>🤖 Safara Assistant</h3>
                <p className="lp-chat-status">{chatLoading ? 'Thinking…' : '● Connected · AI-powered by Gemini'}</p>
              </div>

              <div className="lp-embedded-chat-log" ref={chatLogRef}>
                {chatMsgs.map((m, i) => (
                  <article key={i} className={`lp-chat-bubble lp-${m.role}`}>
                    {m.text}
                  </article>
                ))}
              </div>

              <form className="lp-embedded-chat-form"
                onSubmit={e => { e.preventDefault(); sendChat(chatInput); }}>
                <input placeholder="Ask about destinations, budgets, food, itineraries…"
                  value={chatInput} onChange={e => setChatInput(e.target.value)}
                  disabled={chatLoading} autoComplete="off" />
                <button className="lp-btn lp-primary" type="submit" disabled={chatLoading || !chatInput.trim()}>
                  Send
                </button>
              </form>

              <div className="lp-embedded-quick-row">
                {['Suggest a 5 day Rajasthan trip', 'Top 10 places in India', 'Best foods in India', 'Budget India trip tips'].map(q => (
                  <button key={q} type="button" onClick={() => sendChat(q)} disabled={chatLoading}>{q}</button>
                ))}
              </div>
            </div>
          </article>
        </section>

        {/* ── Contact ──────────────────────────────────────────────────── */}
        <section id="lp-contact" className="lp-section lp-alt lp-reveal">
          <div className="lp-container">
            <h2>Plan with Safara</h2>
            <p style={{ color: 'var(--lp-muted)', marginBottom: '2rem' }}>
              Tell us about your dream India trip and we'll get back to you.
            </p>
            <form className="lp-card lp-lead-form" onSubmit={e => {
              e.preventDefault();
              setLeadResult(`Thanks ${leadName}! We'll reach out to ${leadEmail} shortly. ✓`);
              setLeadName(''); setLeadEmail(''); setLeadMsg('');
            }}>
              <input required placeholder="Your Name" value={leadName} onChange={e => setLeadName(e.target.value)} />
              <input required type="email" placeholder="Email Address" value={leadEmail} onChange={e => setLeadEmail(e.target.value)} />
              <textarea required rows={4} placeholder="Tell us your dream India trip — destinations, dates, budget…"
                value={leadMsg} onChange={e => setLeadMsg(e.target.value)} style={{ resize: 'vertical' }} />
              <button className="lp-btn lp-primary" type="submit">Send Inquiry →</button>
              {leadResult && <p style={{ color: 'var(--lp-accent)', margin: 0, fontWeight: 600, textAlign: 'center' }}>{leadResult}</p>}
            </form>
          </div>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="lp-footer">
        <p style={{ margin: '0 0 0.75rem' }}>© 2026 Safara. Crafted for incredible Indian tourism experiences. 🇮🇳</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Sign In', action: () => openAuthModal('login') },
            { label: 'Sign Up', action: () => openAuthModal('signup') },
          ].map(b => (
            <button key={b.label}
              style={{ background: 'none', border: 'none', color: 'var(--lp-muted)', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontSize: '0.9rem' }}
              onClick={b.action}>{b.label}</button>
          ))}
          {['#lp-features', '#lp-destinations', '#lp-chat'].map(href => (
            <a key={href} href={href}
              style={{ color: 'var(--lp-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
              {href.replace('#lp-', '').replace(/^\w/, c => c.toUpperCase())}
            </a>
          ))}
        </div>
      </footer>

      {/* ── Back to top ──────────────────────────────────────────────────── */}
      <button className={`lp-back-to-top${showBackTop ? ' lp-show' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">
        ↑
      </button>
    </div>
  );
}
