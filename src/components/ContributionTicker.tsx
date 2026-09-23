import { useState, useEffect, useRef } from 'react';
import { Coffee, X, Sparkles, Flame } from 'lucide-react';
import { Contribution } from '../types';

interface ContributionTickerProps {
  contributions: Contribution[];
}

function formatTickerTime(isoString: string): string {
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

export default function ContributionTicker({ contributions }: ContributionTickerProps) {
  const [activeItem, setActiveItem] = useState<Contribution | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLiveDonation, setIsLiveDonation] = useState(false);
  
  // Ref to track the initial contribution on mount so we can distinguish subsequent live ones
  const initialContributionIdRef = useRef<string | null>(null);

  // Load the newest contribution on mount or when contributions list changes
  useEffect(() => {
    if (contributions.length === 0) return;

    const newest = contributions[0];

    // Set initial contribution ref on mount
    if (initialContributionIdRef.current === null) {
      initialContributionIdRef.current = newest.id;

      // Check if user previously dismissed this exact contribution
      const dismissedId = sessionStorage.getItem('dismissed_contrib_id');
      if (dismissedId !== newest.id) {
        // Show the last contribution non-intrusively shortly after mount
        const timer = setTimeout(() => {
          setActiveItem(newest);
          setIsLiveDonation(false);
          setIsVisible(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    } else {
      // If a contribution gets added and its ID is different from our starting/previous ID,
      // and it's not a simulated one, or simply it's a new runtime event
      if (newest.id !== initialContributionIdRef.current) {
        // Update ref
        initialContributionIdRef.current = newest.id;
        
        // This is a LIVE donation in real-time! Show it immediately
        setActiveItem(newest);
        setIsLiveDonation(true);
        setIsVisible(true);
      }
    }
  }, [contributions]);

  // Auto-hide live donations after 8 seconds, but keep historical ones visible or dismissible manually
  useEffect(() => {
    let hideTimer: NodeJS.Timeout;
    if (isVisible && isLiveDonation) {
      hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 8000);
    }
    return () => {
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [isVisible, isLiveDonation]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (activeItem) {
      // Persist dismissal so it doesn't pop up again for this session
      sessionStorage.setItem('dismissed_contrib_id', activeItem.id);
    }
  };

  if (!activeItem || !isVisible) return null;

  return (
    <div 
      id="contribution-ticker-container" 
      className="fixed bottom-24 left-6 z-40 max-w-sm w-[calc(100%-3rem)] sm:w-80 bg-brand-navy-light/95 border border-brand-orange/30 backdrop-blur-md rounded-2xl p-4 shadow-2xl text-white transition-all duration-500 ease-out transform"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
      }}
    >
      <button 
        id="close-ticker-btn"
        onClick={handleDismiss}
        className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
        aria-label="Fermer la notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <div className="flex gap-3">
        {/* Animated Badge Icon */}
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
          isLiveDonation 
            ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 animate-bounce' 
            : 'bg-brand-orange/20 border border-brand-orange/30 text-brand-orange animate-pulse'
        }`}>
          {isLiveDonation ? <Flame className="w-4.5 h-4.5 fill-current" /> : <Coffee className="w-4.5 h-4.5 fill-current" />}
        </div>

        <div className="flex-1 pr-4">
          <div className="flex items-center gap-1.5">
            <span className={`text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5 px-1.5 py-0.5 rounded ${
              isLiveDonation 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : 'bg-brand-orange/20 text-brand-orange'
            }`}>
              <Sparkles className="w-2.5 h-2.5 inline" /> {isLiveDonation ? "Soutien en Direct !" : "Dernier Soutien"}
            </span>
            <span className="text-[9px] text-slate-400 font-medium">
              {formatTickerTime(activeItem.timestamp)}
            </span>
          </div>
          
          <p className="text-xs text-slate-200 mt-2">
            <span className="font-bold text-slate-100">{activeItem.name}</span> a offert{' '}
            <span className="font-bold text-brand-orange">{activeItem.amount}$</span> !
          </p>
          
          {activeItem.message && (
            <p className="text-[11px] text-slate-400 italic mt-1.5 line-clamp-2 leading-relaxed bg-brand-navy-dark/40 p-2 rounded-lg border border-slate-800">
              "{activeItem.message}"
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
