import { useState, useEffect } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { queryClient } from './lib/queryClient';

// ── Session & auth ────────────────────────────────────────────────────────────
import {
  setSession,
  getSession,
  clearSession,
  clearUserPidData,
  getUserItem,
} from '@/lib/session';

// ── Pages ─────────────────────────────────────────────────────────────────────
import LandingPage from '@/components/LandingPage';
import AuthPage from '@/pages/AuthPage';

// ── App screens (unchanged from main) ─────────────────────────────────────────
import LanguageSelector    from '@/components/LanguageSelector';
import AuthScreen          from '@/components/AuthScreen';
import HomeScreen          from '@/components/HomeScreen';
import ActivatedTourMode   from '@/components/ActivatedTourMode';
import SOSEmergency        from '@/components/SOSEmergency';
import PersonalIdCreation  from '@/components/PersonalIdCreation';
import PersonalIdDocsUpload from '@/components/PersonalIdDocsUpload';
import PersonalIdDetails   from '@/components/PersonalIdDetails';
import JourneyPlanning     from '@/components/JourneyPlanning';
import PersonalSafety      from '@/components/PersonalSafety';
import FeedbackSystem      from '@/components/FeedbackSystem';
import Leaderboard         from '@/components/Leaderboard';
import MapComponent        from '@/components/MapComponent';
import GuideChatbot        from '@/components/GuideChatbot';
import QRCodeDisplay       from '@/components/QRCodeDisplay';
import PlanTripHub         from '@/components/PlanTripHub';
import AgencyBrowse        from '@/components/AgencyBrowse';
import DirectIdQuick       from '@/components/DirectIdQuick';
import TouristIdGenerate   from '@/components/TouristIdGenerate';
import TouristIdDocs       from '@/components/TouristIdDocs';
import { getMyTrips }      from '@/lib/tourist.service';

// ── Types ─────────────────────────────────────────────────────────────────────
interface User {
  phone: string;
  isGuest: boolean;
  personalId?: { status: 'pending' | 'verified' | 'rejected'; submittedAt: string };
}

interface TouristId {
  id: string;
  destination: string;
  validUntil: Date;
  status: 'active' | 'expiring' | 'expired';
  holderName: string;
  issueDate: Date;
  itinerary?: any;
  agency?: any;
}

// ── Router ────────────────────────────────────────────────────────────────────
function Router() {
  const [location, navigate] = useLocation();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [user, setUser]           = useState<User | null>(null);
  const [touristId, setTouristId] = useState<TouristId | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);

  // ── Hydrate session on mount ───────────────────────────────────────────────
  useEffect(() => {
    const s = getSession();
    if (s?.userId) setUser({ phone: s.userId, isGuest: false });
  }, []);

  // ── Geolocation ────────────────────────────────────────────────────────────
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      ()  => setUserLocation({ lat: 15.2993, lng: 74.124 })   // Goa fallback
    );
  }, []);

  // ── Hydrate tourist ID from localStorage ──────────────────────────────────
  useEffect(() => {
    const id     = getUserItem('tourist_id');
    const end    = getUserItem('tourist_id_end');
    const dest   = getUserItem('tourist_id_destination');
    const status = getUserItem('tourist_id_status') as 'active' | 'scheduled' | 'expired' | null;
    const created = getUserItem('tourist_id_created');
    if (id && status) {
      setTouristId({
        id,
        destination: dest || '',
        validUntil:  end ? new Date(end) : new Date(),
        status:      status as any,
        holderName:  user?.isGuest ? 'Guest User' : (user?.phone || 'User'),
        issueDate:   created ? new Date(created) : new Date(),
        itinerary:   getUserItem('tourist_id_itinerary') || '',
        agency:      getUserItem('tourist_id_agency') || '',
      });
    }
  }, [user]);

  // ── Fetch active trip from backend ────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user || user.isGuest) return;
      try {
        const data = await getMyTrips();
        const active = (data.trips || []).find((t: any) => t.status === 'active');
        if (!active || cancelled) return;
        setTouristId({
          id:          active.tid,
          destination: active.destination || '',
          validUntil:  active.endDate ? new Date(active.endDate) : new Date(),
          status:      'active',
          holderName:  user.phone || 'User',
          issueDate:   new Date(),
        } as any);
        navigate('/activated-mode');
      } catch { /* backend offline in dev — silent */ }
    })();
    return () => { cancelled = true; };
  }, [user]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const isActivatedMode =
    !!touristId && touristId.status === 'active' && new Date() < touristId.validUntil;

  // ── Handlers ─────────────────────────────────────────────────────────────
  /** Called by both LandingPage modal AND standalone AuthPage */
  const handleLogin = (phoneOrEmail: string) => {
    setSession(phoneOrEmail);
    setUser({ phone: phoneOrEmail, isGuest: false });
    navigate('/home');
  };

  const handleGuestMode = () => {
    clearSession();
    setUser({ phone: '', isGuest: true });
    navigate('/home');
  };

  const handleLogout = () => {
    clearUserPidData();
    clearSession();
    setUser(null);
    setTouristId(null);
    navigate('/');           // back to landing
  };

  const handlePersonalIdComplete = (idData: any) => {
    if (user) setUser({ ...user, personalId: idData });
    navigate('/home');
  };

  const handleTouristIdGenerated = (newId: any) => {
    const holderName = user?.isGuest ? 'Guest User' : (user?.phone || 'User');
    setTouristId({ ...newId, holderName });
    navigate('/activated-mode');
  };

  const handleNavigateToSection = (section: string) => {
    switch (section) {
      case 'personal-id':
        navigate(getUserItem('pid_personal_id') ? '/personal-id-details' : '/personal-id-creation');
        break;
      case 'plan-journey':    navigate('/plan-trip');         break;
      case 'personal-safety': navigate('/personal-safety');   break;
      case 'feedback':        navigate('/feedback');          break;
      case 'leaderboard':     navigate('/leaderboard');       break;
      case 'verify-identity': navigate('/qr-code');           break;
      case 'track-location':  navigate('/map');               break;
      case 'guide-chatbot':   navigate('/guide-chatbot');     break;
      default:                                                break;
    }
  };

  const handleGeofenceAlert = (g: any) => {
    if (g.type === 'danger') alert(`Safety Alert!\n\nEntering: ${g.name}\n${g.description}`);
  };

  const applicationId = getUserItem('pid_application_id') || '';

  // ── Common helpers for repeated JSX ──────────────────────────────────────
  const backBtn = (to?: string) => (
    <button
      onClick={() => to ? navigate(to) : history.back()}
      className="p-2 hover:bg-muted rounded-lg transition-colors"
    >←</button>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // ROUTES
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <Switch>

      {/* ── / — Landing (unauthenticated) or Home (authenticated) ────── */}
      <Route path="/">
        {user
          ? <HomeScreen
              userPhone={user.phone} isGuest={user.isGuest}
              onNavigate={handleNavigateToSection} onLogout={handleLogout}
            />
          : <LandingPage onLogin={handleLogin} onGuestMode={handleGuestMode} />
        }
      </Route>

      {/* ── /login — Standalone auth page (styled with landing UI) ───── */}
      <Route path="/login">
        <AuthPage
          initialMode="login"
          onLogin={handleLogin}
          onGuestMode={handleGuestMode}
          onBack={() => navigate('/')}
        />
      </Route>

      {/* ── /signup — Standalone signup page ─────────────────────────── */}
      <Route path="/signup">
        <AuthPage
          initialMode="signup"
          onLogin={handleLogin}
          onGuestMode={handleGuestMode}
          onBack={() => navigate('/')}
        />
      </Route>

      {/* ── /language-select — Kept for backwards compat ─────────────── */}
      <Route path="/language-select">
        <LanguageSelector
          onLanguageSelect={lang => setCurrentLanguage(lang)}
          onContinue={() => navigate('/login')}
        />
      </Route>

      {/* ── /auth — Legacy auth screen (shadcn version) ───────────────── */}
      <Route path="/auth">
        <AuthScreen onLogin={handleLogin} onGuestMode={handleGuestMode} />
      </Route>

      {/* ── /home ─────────────────────────────────────────────────────── */}
      <Route path="/home">
        <HomeScreen
          userPhone={user?.phone} isGuest={user?.isGuest}
          onNavigate={handleNavigateToSection} onLogout={handleLogout}
        />
      </Route>

      {/* ── Personal ID ───────────────────────────────────────────────── */}
      <Route path="/personal-id-creation">
        <PersonalIdCreation
          onComplete={handlePersonalIdComplete}
          onBack={() => navigate('/home')}
        />
      </Route>

      <Route path="/personal-id-docs">
        <PersonalIdDocsUpload
          applicationId={applicationId}
          onBack={() => navigate('/personal-id-creation')}
          onDone={() => navigate('/home')}
        />
      </Route>

      <Route path="/personal-id-details">
        <PersonalIdDetails
          onBack={() => navigate('/home')}
          onShowQr={() => navigate('/qr-code')}
        />
      </Route>

      {/* ── Trip planning ─────────────────────────────────────────────── */}
      <Route path="/plan-trip">
        <PlanTripHub />
      </Route>

      <Route path="/plan-trip/agencies">
        <AgencyBrowse />
      </Route>

      <Route path="/plan-trip/direct">
        <DirectIdQuick />
      </Route>

      <Route path="/tourist-id-generate">
        <TouristIdGenerate />
      </Route>

      <Route path="/tourist-id-docs">
        <TouristIdDocs />
      </Route>

      {/* ── Activated tour mode ───────────────────────────────────────── */}
      <Route path="/activated-mode">
        {isActivatedMode && touristId
          ? <ActivatedTourMode
              touristId={touristId as any}
              onSOS={() => navigate('/sos-emergency')}
              onNavigate={handleNavigateToSection}
              onLogout={handleLogout}
            />
          : <HomeScreen
              userPhone={user?.phone} isGuest={user?.isGuest}
              onNavigate={handleNavigateToSection} onLogout={handleLogout}
            />
        }
      </Route>

      {/* ── SOS ───────────────────────────────────────────────────────── */}
      <Route path="/sos-emergency">
        <SOSEmergency
          userLocation={userLocation || undefined}
          onCancel={() => navigate(isActivatedMode ? '/activated-mode' : '/home')}
          onEscalate={() => {
            alert('Connecting to Emergency Services (112)…');
            navigate(isActivatedMode ? '/activated-mode' : '/home');
          }}
        />
      </Route>

      {/* ── Legacy journey planning ───────────────────────────────────── */}
      <Route path="/journey-planning">
        <JourneyPlanning
          onTouristIdGenerated={handleTouristIdGenerated}
          onBack={() => navigate('/home')}
        />
      </Route>

      {/* ── Personal safety ───────────────────────────────────────────── */}
      <Route path="/personal-safety">
        <PersonalSafety
          isGuest={user?.isGuest}
          onBack={() => navigate(isActivatedMode ? '/activated-mode' : '/home')}
        />
      </Route>

      {/* ── Feedback ──────────────────────────────────────────────────── */}
      <Route path="/feedback">
        <FeedbackSystem
          onBack={() => navigate(isActivatedMode ? '/activated-mode' : '/home')}
        />
      </Route>

      {/* ── Leaderboard ───────────────────────────────────────────────── */}
      <Route path="/leaderboard">
        <Leaderboard
          isGuest={user?.isGuest}
          onBack={() => navigate(isActivatedMode ? '/activated-mode' : '/home')}
        />
      </Route>

      {/* ── Map / Track Location ──────────────────────────────────────── */}
      <Route path="/map">
        <div className="h-screen relative">
          <MapComponent
            userLocation={userLocation || undefined}
            onGeofenceAlert={handleGeofenceAlert}
            isFullscreen={isMapFullscreen}
            onToggleFullscreen={() => setIsMapFullscreen(v => !v)}
          />
          {!isMapFullscreen && (
            <div className="absolute top-4 left-4 z-[9999]">
              <button
                onClick={() => navigate(isActivatedMode ? '/activated-mode' : '/home')}
                className="bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
              >←</button>
            </div>
          )}
        </div>
      </Route>

      {/* ── Guide Chatbot ─────────────────────────────────────────────── */}
      <Route path="/guide-chatbot">
        <div className="h-screen flex flex-col">
          <div className="bg-card border-b p-4">
            <div className="flex items-center gap-3">
              {backBtn(isActivatedMode ? '/activated-mode' : '/home')}
              <h1 className="text-xl font-bold">SaFara Guide</h1>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <GuideChatbot
              language={currentLanguage}
              userLocation={userLocation || undefined}
              onLocationRequest={() => {}}
            />
          </div>
        </div>
      </Route>

      {/* ── QR Code / Tourist ID Verification ────────────────────────── */}
      <Route path="/qr-code">
        <div className="min-h-screen bg-background">
          <div className="bg-card border-b p-4">
            <div className="flex items-center gap-3">
              {backBtn('/activated-mode')}
              <h1 className="text-xl font-bold">Tourist ID Verification</h1>
            </div>
          </div>
          {touristId && <QRCodeDisplay touristId={touristId} />}
        </div>
      </Route>

      {/* ── Fallback / 404 ────────────────────────────────────────────── */}
      <Route>
        {!user
          ? <LandingPage onLogin={handleLogin} onGuestMode={handleGuestMode} />
          : isActivatedMode
            ? <ActivatedTourMode
                touristId={touristId!}
                onSOS={() => navigate('/sos-emergency')}
                onNavigate={handleNavigateToSection}
                onLogout={handleLogout}
              />
            : <HomeScreen
                userPhone={user?.phone} isGuest={user?.isGuest}
                onNavigate={handleNavigateToSection} onLogout={handleLogout}
              />
        }
      </Route>

    </Switch>
  );
}

// ── App root ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background font-sans">
          <Router />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
