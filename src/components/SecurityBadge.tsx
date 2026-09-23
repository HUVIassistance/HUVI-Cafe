import { useState } from 'react';
import { ShieldCheck, Lock, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';

export default function SecurityBadge() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div id="security-badge-section" className="w-full bg-brand-cream-light border border-brand-cream-dark rounded-2xl overflow-hidden transition-all duration-300">
      {/* Header Button */}
      <button
        id="toggle-security-accordion"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-brand-warm-cream/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-500/15">
            <ShieldCheck className="w-4.5 h-4.5" />
          </div>
          <div>
            <h4 className="font-bold text-brand-navy text-xs sm:text-sm">Paiement & données bancaires</h4>
            <p className="text-[10px] text-slate-500 font-medium">Paiements traités par Stripe</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-brand-orange">
            {isOpen ? 'Masquer' : 'En savoir plus'}
          </span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-brand-orange" />
          ) : (
            <ChevronDown className="w-4 h-4 text-brand-orange" />
          )}
        </div>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div id="security-details-content" className="px-5 pb-5 border-t border-brand-cream-dark/55 pt-4 space-y-4 text-xs text-slate-600 animate-fade-in">
          {/* Top general guarantee */}
          <div className="bg-brand-warm-cream/80 p-3 rounded-xl border border-brand-cream-dark/40 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-brand-navy text-xs">Paiement délégué à Stripe</h5>
              <p className="text-[11px] text-slate-500 mt-0.5">Cette page ouvre un lien de paiement hébergé par Stripe. Le paiement est traité par Stripe, pas par ce site.</p>
            </div>
          </div>

          {/* Three columns/rows of clear guarantees */}
          <div className="grid grid-cols-1 gap-3.5">
            <div className="space-y-1">
              <h5 className="font-bold text-brand-navy flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-brand-orange" /> Chez Stripe, pas ici
              </h5>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Le montant choisi est transmis à la page de paiement Stripe. La saisie de la carte et le traitement de la transaction se font sur l'infrastructure de Stripe.
              </p>
            </div>

            <div className="space-y-1">
              <h5 className="font-bold text-brand-navy flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5 text-brand-orange" /> Aucune donnée bancaire sur ce site
              </h5>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Cette page est statique. Elle ne reçoit, ne transmet et ne stocke aucun numéro de carte, aucun code de sécurité et aucune date d'expiration.
              </p>
            </div>

            <div className="space-y-1">
              <h5 className="font-bold text-brand-navy flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-orange" /> Aucune conformité PCI revendiquée ici
              </h5>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Ce site n'est pas un service de traitement de paiement et ne revendique aucune conformité PCI. La conformité du traitement des cartes relève de Stripe.
              </p>
            </div>
          </div>

          {/* Core FAQ requested */}
          <div className="border-t border-brand-cream-dark/60 pt-3 space-y-3 mt-2">
            <div>
              <p className="font-bold text-brand-navy text-[11px]">Qui traite les informations de carte bancaire ?</p>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                Stripe. Le numéro de carte est saisi directement sur la page de paiement hébergée par Stripe. Il ne passe jamais par cette page.
              </p>
            </div>

            <div>
              <p className="font-bold text-brand-navy text-[11px]">Des données bancaires transitent-elles par ce site ?</p>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                Non. Aucune coordonnée bancaire (numéro de carte, code de sécurité, date d'expiration) n'est saisie ni stockée sur cette page.
              </p>
            </div>

            <div>
              <p className="font-bold text-brand-navy text-[11px]">Que faut-il savoir avant de payer ?</p>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                Le montant choisi est prérempli dans le lien de paiement. La transaction se termine sur la page de Stripe, selon ses propres conditions.
              </p>
            </div>
          </div>

          {/* Secure details footer */}
          <div className="pt-3 border-t border-brand-cream-dark/60 flex items-center justify-between text-[10px] text-slate-400">
            <span>Page statique</span>
            <span className="font-mono">Aucun traitement de paiement ici</span>
          </div>
        </div>
      )}
    </div>
  );
}
