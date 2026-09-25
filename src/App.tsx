import { useState, useEffect, lazy, Suspense } from 'react';
import { 
  Coffee as CoffeeIcon, 
  Heart as HeartIcon, 
  ShieldCheck as ShieldCheckIcon, 
  Globe as GlobeIcon, 
  Twitter as TwitterIcon, 
  Github as GithubIcon, 
  Instagram as InstagramIcon, 
  Linkedin as LinkedinIcon,
  Facebook as FacebookIcon,
  Youtube as YoutubeIcon,
  Settings as SettingsIcon, 
  Users as UsersIcon, 
  Lock as LockIcon
} from 'lucide-react';
import { CreatorProfile, Contribution } from './types';
import { DEFAULT_PROFILE, DEFAULT_CONTRIBUTIONS } from './utils/defaults';
import SecurityBadge from './components/SecurityBadge';
import ContributionModal from './components/ContributionModal';
import ContributionTicker from './components/ContributionTicker';
import AmbientPlayer from './components/AmbientPlayer';

// Panneau de personnalisation = outil de gestion LOCAL (dev) uniquement.
// `import.meta.env.DEV` est remplacé par `false` au build : Rollup élimine alors
// le dynamic import, donc le composant n'existe plus dans le bundle public.
const DevCustomizerPanel = import.meta.env.DEV
  ? lazy(() => import('./components/CustomizerPanel'))
  : null;

function formatRelativeTime(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    if (diffMs < 60000) return "À l'instant";
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return new Date(isoString).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  } catch (e) {
    return "Récemment";
  }
}

export default function App() {
  const [profile, setProfile] = useState<CreatorProfile>(DEFAULT_PROFILE);
  const [contributions, setContributions] = useState<Contribution[]>(DEFAULT_CONTRIBUTIONS);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [modalInitialSuccess, setModalInitialSuccess] = useState(false);
  const [lastPaymentAmount, setLastPaymentAmount] = useState<number>(0);
  // Identité du paiement en cours de retour (nom + message) : le modal ouvert par
  // l'URL de retour n'a jamais vu le formulaire, donc ses états name/isAnonymous
  // sont vides et tout s'affichait « Anonyme ».
  const [lastPaymentName, setLastPaymentName] = useState<string>('');
  const [lastPaymentMessage, setLastPaymentMessage] = useState<string>('');

  // Load contributions from localstorage on mount.
  // Le profil public est TOUJOURS celui compilé dans src/utils/defaults.ts : la
  // surcharge localStorage (outil de gestion local) n'existe qu'en développement.
  useEffect(() => {
    if (import.meta.env.DEV) {
      const savedProfile = localStorage.getItem('creator_profile');
      if (savedProfile) {
        try {
          setProfile(JSON.parse(savedProfile));
        } catch (e) {
          console.error("Error parsing saved profile, using defaults", e);
        }
      }
    }

    let currentContribs = DEFAULT_CONTRIBUTIONS;
    const savedContribs = localStorage.getItem('contributions');
    if (savedContribs) {
      try {
        currentContribs = JSON.parse(savedContribs);
        setContributions(currentContribs);
      } catch (e) {
        console.error("Error parsing saved contributions, using defaults", e);
      }
    }

    // Smart Post-Payment Redirect Detection:
    // If returning from Stripe/PayPal with ?payment_success=true, auto-publish the pending contribution!
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('payment_success') === 'true') {
      const pendingStr = localStorage.getItem('pending_contribution');
      if (pendingStr) {
        try {
          const pending = JSON.parse(pendingStr);
          // Capturer l'identité AVANT le localStorage.removeItem('pending_contribution')
          // (dans le finally ci-dessous), sinon l'écran de succès ne peut plus la lire.
          setLastPaymentName(pending.name || '');
          setLastPaymentMessage(pending.message || '');
          const contribution: Contribution = {
            id: `contrib-${Date.now()}`,
            name: pending.name || "Anonyme",
            amount: pending.amount || 15,
            message: pending.message || "",
            timestamp: new Date().toISOString()
          };
          
          const updated = [contribution, ...currentContribs];
          setContributions(updated);
          localStorage.setItem('contributions', JSON.stringify(updated));
          
          // Open the modal directly in the Success view
          setLastPaymentAmount(contribution.amount);
          setModalInitialSuccess(true);
          setIsModalOpen(true);
        } catch (err) {
          console.error("Error parsing pending contribution", err);
        } finally {
          // Clear the temporary pending contribution
          localStorage.removeItem('pending_contribution');
        }
      }

      // Clean the URL bar immediately so refreshing doesn't duplicate the action
      const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
    }
  }, []);

  const handleSaveProfile = (updatedProfile: CreatorProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem('creator_profile', JSON.stringify(updatedProfile));
  };

  const handleResetProfile = () => {
    setProfile(DEFAULT_PROFILE);
    setContributions(DEFAULT_CONTRIBUTIONS);
    localStorage.removeItem('creator_profile');
    localStorage.removeItem('contributions');
  };

  const handleAddContribution = (newContrib: Omit<Contribution, 'id' | 'timestamp'>) => {
    const contribution: Contribution = {
      ...newContrib,
      id: `contrib-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    
    const updated = [contribution, ...contributions];
    setContributions(updated);
    localStorage.setItem('contributions', JSON.stringify(updated));
  };

  // Calculate statistics
  const totalAmount = contributions.reduce((sum, item) => sum + item.amount, 0);
  const totalSupporters = contributions.length;
  
  // Use customizable target, default to 500
  const targetGoal = profile.goalTarget || 500;
  const progressPercent = Math.min(Math.round((totalAmount / targetGoal) * 100), 100);

  return (
    <div id="main-layout" className="min-h-screen bg-brand-warm-cream text-brand-navy flex flex-col font-sans selection:bg-brand-orange/20 selection:text-brand-navy">
      
      {/* 1. BRAND-NAVY TOP HEADER */}
      <header id="app-top-header" className="bg-brand-navy border-b border-slate-800/80 sticky top-0 z-30 text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo-mark.png" alt="HUVI Optimisation" className="w-8 h-8 rounded-lg shadow-sm" />
            <span className="font-extrabold text-xs sm:text-sm tracking-wider text-white uppercase">HUVI Café</span>
          </div>

          {/* Secure indicator & Owner Mode toggle */}
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] sm:text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/15 flex items-center gap-1">
              <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-400" />
              Sécurisé Stripe
            </span>

            {/* Outil de gestion local : DEV uniquement, absent du bundle public */}
            {import.meta.env.DEV && (
              <>
                <div className="h-4 w-px bg-slate-800" />

                <button
                  id="admin-mode-toggle"
                  onClick={() => setIsAdminView(!isAdminView)}
                  className={`text-[10px] sm:text-xs px-2.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                    isAdminView 
                      ? 'bg-brand-orange/20 text-brand-orange border border-brand-orange/30' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <SettingsIcon className={`w-3.5 h-3.5 ${isAdminView ? 'animate-spin-slow' : ''}`} />
                  <span>{isAdminView ? "Éditeur : ON" : "Accès Créateur"}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Admin Quick Action Bar — DEV uniquement */}
      {import.meta.env.DEV && isAdminView && (
        <div id="admin-quick-bar" className="bg-brand-orange/10 border-b border-brand-orange/20 text-center py-2 px-4 animate-fade-in text-xs text-brand-orange flex items-center justify-center gap-3">
          <span className="font-semibold">Mode d'édition activé : Vous pouvez personnaliser les liens Stripe et les réseaux sociaux.</span>
          <button 
            id="open-customizer-btn-quick"
            onClick={() => setIsCustomizerOpen(true)}
            className="bg-brand-navy hover:bg-brand-navy/90 text-white font-bold px-3 py-1 rounded-md text-[11px] shadow-sm transition-all cursor-pointer"
          >
            Configurer la Page & Stripe
          </button>
        </div>
      )}

      {/* 2. DYNAMIC PREMIUM BANNER & FLOATING AVATAR */}
      <section id="hero-profile-header" className="relative w-full h-36 sm:h-44 bg-brand-cream-dark/45 border-b border-brand-cream-dark overflow-hidden">
        {profile.bannerUrl ? (
          <img 
            id="custom-profile-banner"
            src={profile.bannerUrl} 
            alt="Profile banner" 
            className="w-full h-full object-cover opacity-80"
            referrerPolicy="no-referrer"
          />
        ) : (
          /* Subtle premium geometric lines for minimalism */
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-warm-cream to-brand-cream-dark/40">
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: 'radial-gradient(#111a2e 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }} />
          </div>
        )}
      </section>

      {/* 3. CORE PRESENTATION */}
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 relative z-10 -mt-10 mb-8">
        <div className="flex flex-col items-center text-center space-y-3.5">
          {/* Avatar frame */}
          <div className="relative">
            {profile.avatarUrl ? (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-brand-warm-cream overflow-hidden shadow-md bg-white flex items-center justify-center">
                <img 
                  id="creator-avatar"
                  src={profile.avatarUrl} 
                  alt={profile.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              /* Premium elegant initials avatar */
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-brand-orange border-4 border-brand-warm-cream flex items-center justify-center text-white relative shadow-md overflow-hidden">
                <span className="font-extrabold text-xl tracking-wider text-white">
                  {profile.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || "HO"}
                </span>
              </div>
            )}
            <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-brand-warm-cream shadow-sm" title="Actif" />
          </div>

          {/* Titles */}
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-brand-navy tracking-tight">{profile.name}</h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">{profile.subtitle}</p>
          </div>
        </div>
      </div>

      {/* 4. MAIN BENTO GRID DASHBOARD */}
      <main id="dashboard-content" className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pb-20 space-y-6">
        
        {/* Dynamic mini-metrics grid */}
        <div id="stats-dashboard-grid" className="grid grid-cols-3 gap-3">
          <div className="bg-brand-cream-light border border-brand-cream-dark/80 rounded-xl p-3 text-center">
            <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">Soutiens</span>
            <span className="text-sm sm:text-base font-extrabold text-brand-navy mt-0.5 flex items-center justify-center gap-1">
              <HeartIcon className="w-3.5 h-3.5 text-brand-orange fill-current" />
              {totalSupporters}
            </span>
          </div>

          <div className="bg-brand-cream-light border border-brand-cream-dark/80 rounded-xl p-3 text-center">
            <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">Cafés récoltés</span>
            <span className="text-sm sm:text-base font-extrabold text-brand-navy mt-0.5 flex items-center justify-center gap-1">
              <CoffeeIcon className="w-3.5 h-3.5 text-brand-orange fill-current" />
              {Math.round(totalAmount / 5)}
            </span>
          </div>

          <div className="bg-brand-cream-light border border-brand-cream-dark/80 rounded-xl p-3 text-center">
            <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">Sécurité</span>
            <span className="text-sm sm:text-base font-extrabold text-emerald-600 mt-0.5 flex items-center justify-center gap-1">
              <LockIcon className="w-3 h-3 text-emerald-500" />
              Stripe Direct
            </span>
          </div>
        </div>

        {/* Layout split */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Bio, unified social media links, and collapsible security */}
          <div className="md:col-span-5 space-y-6">
            
            {/* About Card */}
            <div id="about-card" className="bg-brand-cream-light border border-brand-cream-dark/80 rounded-2xl p-5 space-y-4">
              <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-brand-cream-dark/40 pb-2">
                À propos
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                {profile.bio}
              </p>

              {/* Enhanced social links including LinkedIn, YouTube, Facebook */}
              <div id="socials-dock" className="flex flex-wrap gap-1.5 pt-2">
                {profile.socials.website && (
                  <a 
                    href={profile.socials.website} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="p-2 rounded-lg bg-brand-warm-cream hover:bg-brand-orange/10 text-brand-navy hover:text-brand-orange border border-brand-cream-dark/60 transition-all flex items-center gap-1 text-[11px] font-bold"
                  >
                    <GlobeIcon className="w-3.5 h-3.5" />
                    <span>Site</span>
                  </a>
                )}
                
                {profile.socials.linkedin && (
                  <a 
                    href={profile.socials.linkedin} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="p-2 rounded-lg bg-brand-warm-cream hover:bg-brand-orange/10 text-brand-navy hover:text-brand-orange border border-brand-cream-dark/60 transition-all flex items-center gap-1 text-[11px] font-bold"
                  >
                    <LinkedinIcon className="w-3.5 h-3.5 text-blue-600" />
                    <span>LinkedIn</span>
                  </a>
                )}

                {profile.socials.youtube && (
                  <a 
                    href={profile.socials.youtube} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="p-2 rounded-lg bg-brand-warm-cream hover:bg-brand-orange/10 text-brand-navy hover:text-brand-orange border border-brand-cream-dark/60 transition-all flex items-center gap-1 text-[11px] font-bold"
                  >
                    <YoutubeIcon className="w-3.5 h-3.5 text-red-600" />
                    <span>YouTube</span>
                  </a>
                )}

                {profile.socials.facebook && (
                  <a 
                    href={profile.socials.facebook} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="p-2 rounded-lg bg-brand-warm-cream hover:bg-brand-orange/10 text-brand-navy hover:text-brand-orange border border-brand-cream-dark/60 transition-all flex items-center gap-1 text-[11px] font-bold"
                  >
                    <FacebookIcon className="w-3.5 h-3.5 text-blue-700" />
                    <span>Facebook</span>
                  </a>
                )}

                {profile.socials.community && (
                  <a 
                    href={profile.socials.community} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="p-2 rounded-lg bg-brand-warm-cream hover:bg-brand-orange/10 text-brand-navy hover:text-brand-orange border border-brand-cream-dark/60 transition-all flex items-center gap-1 text-[11px] font-bold"
                  >
                    <UsersIcon className="w-3.5 h-3.5 text-brand-orange" />
                    <span>Communauté</span>
                  </a>
                )}

                {profile.socials.github && (
                  <a 
                    href={profile.socials.github} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="p-2 rounded-lg bg-brand-warm-cream hover:bg-brand-orange/10 text-brand-navy hover:text-brand-orange border border-brand-cream-dark/60 transition-all flex items-center gap-1 text-[11px] font-bold"
                  >
                    <GithubIcon className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                  </a>
                )}

                {profile.socials.instagram && (
                  <a 
                    href={profile.socials.instagram} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="p-2 rounded-lg bg-brand-warm-cream hover:bg-brand-orange/10 text-brand-navy hover:text-brand-orange border border-brand-cream-dark/60 transition-all flex items-center gap-1 text-[11px] font-bold"
                  >
                    <InstagramIcon className="w-3.5 h-3.5 text-pink-600" />
                    <span>Instagram</span>
                  </a>
                )}
              </div>
            </div>

            {/* Subtle, Collapsible Security Accordion */}
            <SecurityBadge />
          </div>

          {/* RIGHT COLUMN: Support Call to Action & Supporter Wall */}
          <div className="md:col-span-7 space-y-6">
            
            {/* CTA Box (Premium, airy minimalist design) */}
            <div id="cta-card" className="bg-brand-cream-light border border-brand-cream-dark rounded-2xl p-6 sm:p-7 space-y-5 text-center relative overflow-hidden">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-brand-orange/10 border border-brand-orange/15 rounded-full text-brand-orange text-[10px] font-bold uppercase tracking-wider">
                  ☕ Soutien Indépendant
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-brand-navy">
                  Offrez un café pour soutenir mes créations
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Votre soutien m'aide grandement à continuer de concevoir, bâtir et partager des dizaines d'outils performants et gratuits pour la communauté.
                </p>
              </div>

              {/* Progress Bar towards Coffee Goal - ONLY visible if showGoal is true */}
              {profile.showGoal && (
                <div id="goal-container-block" className="space-y-2 max-w-sm mx-auto bg-brand-warm-cream/70 p-3.5 rounded-xl border border-brand-cream-dark/80 animate-fade-in">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-brand-navy font-bold text-[11px] flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-brand-orange" />
                      Objectif café mensuel
                    </span>
                    <span className="text-brand-orange font-bold text-xs">{totalAmount}$ / {targetGoal}$</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-brand-orange h-2 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Progrès : {progressPercent}%</span>
                    <span className="italic">Soutien direct Stripe</span>
                  </div>
                </div>
              )}

              {/* Trigger Button - Changed label to "Payer un café" */}
              <div className="pt-1 max-w-xs mx-auto">
                <button
                  id="trigger-donation-modal-btn"
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-3 px-5 bg-brand-orange hover:bg-brand-orange/95 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-brand-orange/15 flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
                >
                  <CoffeeIcon className="w-4 h-4 fill-current" />
                  <span>Payer un café</span>
                </button>
                <p className="text-[9px] text-slate-400 mt-2">
                  🔒 Paiement traité par Stripe. Aucune donnée bancaire sur ce site.
                </p>
              </div>
            </div>

            {/* Supporters Wall */}
            <div id="contributions-wall" className="bg-brand-cream-light border border-brand-cream-dark/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-brand-cream-dark/40 pb-2.5">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <UsersIcon className="w-4 h-4 text-brand-orange" />
                  Mur de soutien ({totalSupporters})
                </h3>
                <span className="text-[10px] font-mono text-slate-400">
                  Récent
                </span>
              </div>

              {/* Wall list items */}
              <div id="wall-messages-list" className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {contributions.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    Aucun message pour l'instant. Laissez une trace de votre soutien !
                  </div>
                ) : (
                  contributions.map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-brand-warm-cream/40 border border-brand-cream-dark/50 hover:border-slate-300 p-3.5 rounded-xl space-y-1.5 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-brand-navy">
                            {item.name}
                          </p>
                          <p className="text-[9px] text-slate-400">
                            {formatRelativeTime(item.timestamp)}
                          </p>
                        </div>
                        
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded border border-brand-orange/15">
                          ☕ {item.amount}$
                        </span>
                      </div>

                      {item.message && (
                        <p className="text-xs text-slate-600 leading-relaxed italic border-l-2 border-brand-orange/30 pl-2.5 py-0.5">
                          "{item.message}"
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* 5. BRAND-NAVY STATIC FOOTER */}
      <footer id="app-footer" className="bg-brand-navy border-t border-slate-800 text-slate-400 text-[11px] py-9 text-center mt-auto">
        <div className="max-w-4xl mx-auto px-4 space-y-3.5">
          <p className="text-slate-300 font-semibold text-xs">
            HUVI Optimisation — Hugo Viens
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px]">
            <a href="https://huvioptimisation.com" target="_blank" rel="noopener noreferrer" className="text-brand-orange hover:underline font-bold transition-colors">Site principal</a>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <a href="https://bilan.huvioptimisation.com" target="_blank" rel="noopener noreferrer" className="text-brand-orange hover:underline font-bold transition-colors">Bilan IA (gratuit)</a>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <a href="https://marges.huvioptimisation.com" target="_blank" rel="noopener noreferrer" className="text-brand-orange hover:underline font-bold transition-colors">Marges IQ</a>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <a href="https://www.facebook.com/groups/peakperformeur" target="_blank" rel="noopener noreferrer" className="text-brand-orange hover:underline font-bold transition-colors">Groupe Facebook</a>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <a href="mailto:info@huvioptimisation.com" className="text-brand-orange hover:underline font-bold transition-colors">Contact</a>
          </nav>
          <p className="max-w-md mx-auto text-[10px] leading-relaxed text-slate-400">
            Paiements traités par Stripe. Aucune donnée bancaire ne transite ni n'est stockée par ce site.
          </p>
          <div className="text-[10px] text-slate-500 flex items-center justify-center gap-3 pt-1">
            <span>© 2026 HUVI Optimisation</span>
          </div>
        </div>
      </footer>

      {/* 6. SIDE CUSTOMIZER PANEL — DEV UNIQUEMENT (jamais dans le bundle public) */}
      {DevCustomizerPanel && (
        <Suspense fallback={null}>
          <DevCustomizerPanel
            isOpen={isCustomizerOpen}
            onClose={() => setIsCustomizerOpen(false)}
            profile={profile}
            onSave={handleSaveProfile}
            onReset={handleResetProfile}
          />
        </Suspense>
      )}

      {/* 7. SUPPORT MODAL (One-time/Monthly support) */}
      <ContributionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setModalInitialSuccess(false);
        }}
        stripeLink={profile.stripeLink}
        stripeLinkMonthly={profile.stripeLinkMonthly}
        paypalLink={profile.paypalLink}
        onAddContribution={handleAddContribution}
        initialSuccess={modalInitialSuccess}
        successAmount={lastPaymentAmount}
        initialName={lastPaymentName}
        initialMessage={lastPaymentMessage}
      />

      {/* 8. REAL-TIME CELEBRATIVE WALL TICKER */}
      <ContributionTicker contributions={contributions} />

      {/* 9. AMBIENT MUSIC PLAYER WITH FULL PROFILE CUSTOMIZATION & AUTOPLAY SUPPORT */}
      <AmbientPlayer 
        defaultPreset={profile.defaultSoundtrack}
        autoplay={profile.autoplayMusic}
      />
    </div>
  );
}
