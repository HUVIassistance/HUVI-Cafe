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
            <h4 className="font-bold text-brand-navy text-xs sm:text-sm">Cybersécurité & Responsabilité</h4>
            <p className="text-[10px] text-slate-500 font-medium">Transactions 100% sécurisées via Stripe</p>
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
              <h5 className="font-bold text-brand-navy text-xs">Zéro Compromis Sécurité</h5>
              <p className="text-[11px] text-slate-500 mt-0.5">Architecture conforme aux plus hauts standards de l'industrie.</p>
            </div>
          </div>

          {/* Three columns/rows of clear guarantees */}
          <div className="grid grid-cols-1 gap-3.5">
            <div className="space-y-1">
              <h5 className="font-bold text-brand-navy flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-brand-orange" /> Directement via Stripe
              </h5>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Toutes les transactions financières se font directement sur les serveurs sécurisés et chiffrés de Stripe.
              </p>
            </div>

            <div className="space-y-1">
              <h5 className="font-bold text-brand-navy flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5 text-brand-orange" /> Aucun stockage local
              </h5>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Nous ne stockons ni ne voyons jamais vos coordonnées bancaires. Elles restent 100% anonymes pour notre application.
              </p>
            </div>

            <div className="space-y-1">
              <h5 className="font-bold text-brand-navy flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-orange" /> Responsabilité Limitée
              </h5>
              <p className="text-[11px] leading-relaxed text-slate-500">
                La passerelle Stripe vous décharge de toute responsabilité en matière de conformité PCI et de fraude. Vous n'êtes pas responsable en cas de problème.
              </p>
            </div>
          </div>

          {/* Core FAQ requested */}
          <div className="border-t border-brand-cream-dark/60 pt-3 space-y-3 mt-2">
            <div>
              <p className="font-bold text-brand-navy text-[11px]">Qui gère mes informations de carte bancaire ?</p>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                L'application est totalement "sans serveur de paiement". Toutes les données bancaires sont traitées directement par Stripe, leader mondial des transactions en ligne.
              </p>
            </div>

            <div>
              <p className="font-bold text-brand-navy text-[11px]">Risque de fuite de données ?</p>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                Aucune coordonnée bancaire (numéro de carte, CVV, date d'expiration) ne transite sur nos serveurs. Il est donc techniquement impossible que ces données soient interceptées ou piratées sur cette page.
              </p>
            </div>

            <div>
              <p className="font-bold text-brand-navy text-[11px]">Pourquoi est-ce rassurant pour vous ?</p>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                En utilisant Stripe Checkout, vous bénéficiez de leur infrastructure de sécurité de niveau bancaire. De plus, cela vous décharge de toute responsabilité juridique ou financière en cas de litige.
              </p>
            </div>
          </div>

          {/* Secure details footer */}
          <div className="pt-3 border-t border-brand-cream-dark/60 flex items-center justify-between text-[10px] text-slate-400">
            <span>Chiffrement SSL Standard Activé</span>
            <span className="font-mono">AES-256</span>
          </div>
        </div>
      )}
    </div>
  );
}
