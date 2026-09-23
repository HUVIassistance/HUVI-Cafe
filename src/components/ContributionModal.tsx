import React, { useState, useEffect } from 'react';
import { X, Coffee, ShieldCheck, ArrowRight, CheckCircle2, Calendar, Sparkles, AlertCircle, Heart, Loader2 } from 'lucide-react';
import { Contribution } from '../types';

interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  stripeLink: string;
  stripeLinkMonthly?: string;
  paypalLink?: string;
  onAddContribution: (contribution: Omit<Contribution, 'id' | 'timestamp'>) => void;
  initialSuccess?: boolean;
  successAmount?: number;
}

export default function ContributionModal({ 
  isOpen, 
  onClose, 
  stripeLink, 
  stripeLinkMonthly, 
  paypalLink,
  onAddContribution,
  initialSuccess = false,
  successAmount = 0
}: ContributionModalProps) {
  const [paymentType, setPaymentType] = useState<'one-time' | 'monthly'>('one-time');
  const [coffeesCount, setCoffeesCount] = useState<number | 'custom'>(3);
  const [customAmount, setCustomAmount] = useState<string>('15');
  const [name, setName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState('');
  const [step, setStep] = useState<'form' | 'pending' | 'success'>('form');
  const [selectedGateway, setSelectedGateway] = useState<'stripe' | 'paypal'>('stripe');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Synchronize initial success view when modal is opened via URL redirect
  useEffect(() => {
    if (isOpen) {
      if (initialSuccess) {
        setStep('success');
      } else {
        setStep('form');
      }
    }
  }, [isOpen, initialSuccess]);

  if (!isOpen) return null;

  const coffeeValue = 5; // $5 per coffee

  const getFinalAmount = (): number => {
    if (initialSuccess && successAmount > 0) {
      return successAmount;
    }
    if (paymentType === 'monthly') {
      return 7.50;
    }
    if (coffeesCount === 'custom') {
      const parsed = parseFloat(customAmount);
      return isNaN(parsed) ? 0 : parsed;
    }
    return coffeesCount * coffeeValue;
  };

  const finalAmount = getFinalAmount();

  const handleGatewaySelection = (gateway: 'stripe' | 'paypal') => {
    setSelectedGateway(gateway);
    if (gateway === 'paypal') {
      setPaymentType('one-time');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validate minimum $2 constraint
    if (finalAmount < 2) {
      setErrorMsg("Le montant minimum d'un don est de 2$ pour couvrir les frais de transaction.");
      return;
    }

    const contributorName = isAnonymous || !name.trim() ? "Anonyme" : name.trim();
    const finalComment = message.trim();

    // 1. SAVE to temporary storage so it can be verified on success redirect!
    localStorage.setItem('pending_contribution', JSON.stringify({
      name: contributorName,
      amount: finalAmount,
      message: finalComment
    }));

    // 2. Prepare checkout link redirection
    let targetUrl = '';

    if (selectedGateway === 'stripe') {
      if (paymentType === 'monthly' && stripeLinkMonthly) {
        targetUrl = stripeLinkMonthly;
      } else {
        const baseStripe = stripeLink;
        try {
          const urlObj = new URL(baseStripe);
          urlObj.searchParams.set('prefilled_value', String(Math.round(finalAmount * 100)));
          targetUrl = urlObj.toString();
        } catch (err) {
          const separator = baseStripe.includes('?') ? '&' : '?';
          targetUrl = `${baseStripe}${separator}prefilled_value=${Math.round(finalAmount * 100)}`;
        }
      }
    } else {
      const basePaypal = paypalLink || 'https://paypal.me';
      try {
        if (basePaypal.includes('paypal.me')) {
          const cleanBase = basePaypal.replace(/\/+$/, '');
          targetUrl = `${cleanBase}/${finalAmount}`;
        } else {
          targetUrl = basePaypal;
        }
      } catch (err) {
        targetUrl = basePaypal;
      }
    }

    // 3. Open transaction tab safely
    window.open(targetUrl, '_blank', 'noopener,noreferrer');

    // 4. Change view to "pending" to wait for confirmation or fallback click
    setStep('pending');
  };

  // Fallback for manual confirmation when automatic redirect is skipped or blocked
  const handleManualConfirm = () => {
    const pendingStr = localStorage.getItem('pending_contribution');
    if (pendingStr) {
      try {
        const pending = JSON.parse(pendingStr);
        onAddContribution({
          name: pending.name,
          amount: pending.amount,
          message: pending.message
        });
      } catch (err) {
        console.error("Error confirming manually", err);
      } finally {
        localStorage.removeItem('pending_contribution');
      }
    } else {
      // Direct fallback if cache is empty
      onAddContribution({
        name: isAnonymous || !name.trim() ? "Anonyme" : name.trim(),
        amount: finalAmount,
        message: message.trim()
      });
    }

    setStep('success');
  };

  const handleCloseSuccess = () => {
    setStep('form');
    // Reset state values
    setName('');
    setMessage('');
    setIsAnonymous(false);
    onClose();
  };

  return (
    <div id="modal-overlay" className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div 
        id="modal-card" 
        className="bg-brand-cream-light border border-brand-cream-dark/80 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden transition-all duration-300 text-brand-navy animate-fade-in"
      >
        {/* Top Accent Strip */}
        <div className="h-1 bg-brand-orange w-full" />

        {/* Close Button */}
        <button 
          id="close-modal-btn"
          onClick={handleCloseSuccess}
          className="absolute top-4.5 right-4.5 p-1.5 rounded-lg text-slate-400 hover:text-brand-navy hover:bg-brand-warm-cream transition-colors"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        {step === 'form' && (
          <form id="donation-form" onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4">
            <div className="text-center">
              <div className="mx-auto w-10 h-10 bg-brand-orange/10 rounded-full flex items-center justify-center text-brand-orange border border-brand-orange/15 mb-2">
                <Coffee className="w-5 h-5 fill-current animate-bounce-slow" />
              </div>
              <h2 className="text-base sm:text-lg font-black text-brand-navy">Offrir un café</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Soutenez librement et directement mes créations.</p>
            </div>

            {/* Optional Gateway Toggle (Stripe vs PayPal) */}
            {paypalLink && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Passerelle de paiement</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleGatewaySelection('stripe')}
                    className={`py-1.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      selectedGateway === 'stripe'
                        ? 'bg-brand-navy border-brand-navy text-white shadow-sm'
                        : 'bg-white border-brand-cream-dark hover:border-slate-300 text-slate-650'
                    }`}
                  >
                    <span className="text-emerald-500 font-extrabold">💳</span> Stripe Direct
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGatewaySelection('paypal')}
                    className={`py-1.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      selectedGateway === 'paypal'
                        ? 'bg-[#003087] border-[#003087] text-white shadow-sm'
                        : 'bg-white border-brand-cream-dark hover:border-slate-300 text-slate-650'
                    }`}
                  >
                    <span className="text-blue-400 font-extrabold">🅿️</span> PayPal Alternative
                  </button>
                </div>
              </div>
            )}

            {/* Frequency Selection (Only for Stripe) */}
            {selectedGateway === 'stripe' && stripeLinkMonthly && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fréquence du don</label>
                <div className="grid grid-cols-2 p-1 bg-brand-warm-cream rounded-xl border border-brand-cream-dark/60">
                  <button
                    type="button"
                    onClick={() => setPaymentType('one-time')}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                      paymentType === 'one-time'
                        ? 'bg-white text-brand-navy shadow-sm'
                        : 'text-slate-500 hover:text-brand-navy'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
                    <span>Unique</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentType('monthly')}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                      paymentType === 'monthly'
                        ? 'bg-white text-brand-navy shadow-sm'
                        : 'text-slate-500 hover:text-brand-navy'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5 text-brand-orange" />
                    <span>Mensuel</span>
                  </button>
                </div>
              </div>
            )}

            {paymentType === 'monthly' ? (
              <div className="bg-brand-orange/5 border border-brand-orange/20 rounded-xl p-4 text-center space-y-2 animate-fade-in">
                <div className="inline-flex items-center justify-center bg-brand-orange/10 p-2.5 rounded-full text-brand-orange">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Abonnement Récurrent</span>
                  <p className="text-xl font-black text-brand-navy">7.50$ <span className="text-xs font-normal text-slate-500">/ mois</span></p>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                  Soutenez durablement les projets et tutoriels de <span className="font-semibold text-brand-navy">Huvi Optimisation</span> avec un prélèvement automatique mensuel réversible à tout moment.
                </p>
              </div>
            ) : (
              <>
                {/* Coffee selection grid */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Montant du soutien</label>
                    <span className="text-[10px] text-slate-400 font-medium">1 café = 5$</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 3, 5].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => {
                          setCoffeesCount(count);
                          setErrorMsg(null);
                        }}
                        className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center transition-all ${
                          coffeesCount === count
                            ? 'bg-brand-navy border-brand-navy text-white shadow-sm'
                            : 'bg-white border-brand-cream-dark hover:border-slate-300 text-brand-navy'
                        }`}
                      >
                        <span className="font-bold text-xs">{count} ☕</span>
                        <span className={`text-[9px] font-bold ${coffeesCount === count ? 'text-brand-orange' : 'text-slate-500'}`}>{count * coffeeValue}$</span>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setCoffeesCount('custom');
                        setErrorMsg(null);
                      }}
                      className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center transition-all ${
                        coffeesCount === 'custom'
                          ? 'bg-brand-navy border-brand-navy text-white shadow-sm'
                          : 'bg-white border-brand-cream-dark hover:border-slate-300 text-brand-navy'
                      }`}
                    >
                      <span className="font-bold text-xs">Libre</span>
                      <span className="text-[9px] text-slate-500">Montant</span>
                    </button>
                  </div>
                </div>

                {/* Custom Input */}
                {coffeesCount === 'custom' && (
                  <div className="space-y-1 animate-fade-in">
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-slate-400 font-bold text-xs">$</span>
                      </div>
                      <input
                        id="custom-donation-amount"
                        type="number"
                        min="2"
                        max="5000"
                        required
                        value={customAmount}
                        onChange={(e) => {
                          setCustomAmount(e.target.value);
                          setErrorMsg(null);
                        }}
                        className="block w-full pl-7 pr-3 py-1.5 bg-white border border-brand-cream-dark rounded-xl text-brand-navy focus:outline-none focus:border-brand-orange text-xs font-bold"
                        placeholder="15"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Validation Error Box */}
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 text-red-700 text-xs animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span className="font-semibold">{errorMsg}</span>
              </div>
            )}

            {/* Identité du donateur */}
            <div className="space-y-2.5 pt-1">
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <label htmlFor="donor-name">Votre nom / Pseudo</label>
                  <label className="flex items-center gap-1 cursor-pointer select-none normal-case text-slate-500 font-medium">
                    <input
                      id="is-anonymous-checkbox"
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="rounded bg-white border-slate-300 text-brand-orange focus:ring-0"
                    />
                    Anonyme
                  </label>
                </div>
                {!isAnonymous && (
                  <input
                    id="donor-name"
                    type="text"
                    required={!isAnonymous}
                    disabled={isAnonymous}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full px-3 py-1.5 bg-white border border-brand-cream-dark rounded-xl text-xs text-brand-navy focus:outline-none focus:border-brand-orange disabled:opacity-40"
                    placeholder="Ex: Jean Mercier"
                  />
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="donor-message" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mot d'encouragement (Public)</label>
                <textarea
                  id="donor-message"
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="block w-full px-3 py-1.5 bg-white border border-brand-cream-dark rounded-xl text-xs text-brand-navy focus:outline-none focus:border-brand-orange resize-none"
                  placeholder="Ex: Merci pour tes créations !"
                  maxLength={160}
                />
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-center gap-1.5 justify-center text-[10px] text-slate-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Chiffrement bancaire direct de bout en bout</span>
            </div>

            {/* Submit Action */}
            <button
              id="donation-submit-btn"
              type="submit"
              disabled={coffeesCount === 'custom' && (!customAmount || parseFloat(customAmount) < 2)}
              className="w-full py-3 bg-brand-orange hover:bg-brand-orange/95 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-brand-orange/10 flex items-center justify-center gap-2 text-xs cursor-pointer disabled:opacity-50"
            >
              <span>{selectedGateway === 'stripe' ? 'Soutenir avec Stripe' : 'Soutenir avec PayPal'}</span>
              <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-mono">{finalAmount}$</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* STEP 1.5: SECURE PENDING TRANSACTION (Stripe is open in another tab) */}
        {step === 'pending' && (
          <div id="donation-pending-step" className="p-6 sm:p-7 text-center space-y-4 animate-fade-in">
            <div className="mx-auto w-12 h-12 bg-brand-orange/10 rounded-full flex items-center justify-center text-brand-orange border border-brand-orange/15">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-base sm:text-lg font-black text-brand-navy">Transaction en cours</h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                L'espace de paiement sécurisé <strong className="text-brand-orange">{selectedGateway === 'stripe' ? 'Stripe Direct' : 'PayPal'}</strong> a été ouvert dans un nouvel onglet de votre navigateur.
              </p>
            </div>

            <div className="bg-brand-warm-cream border border-brand-cream-dark/65 p-3.5 rounded-xl text-left max-w-xs mx-auto text-xs space-y-1.5">
              <span className="font-extrabold text-brand-navy flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Validation automatisée
              </span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Une fois votre paiement complété sur Stripe, vous serez automatiquement redirigé ici pour afficher votre message de soutien et incrémenter le compteur.
              </p>
            </div>

            {/* Helpful fallback button */}
            <div className="space-y-2 pt-2">
              <button
                id="pending-fallback-confirm-btn"
                type="button"
                onClick={handleManualConfirm}
                className="w-full py-2.5 bg-brand-orange hover:bg-brand-orange/95 text-white font-black rounded-xl text-xs transition-all shadow-md cursor-pointer"
              >
                J'ai complété mon paiement !
              </button>
              
              <button
                id="pending-cancel-btn"
                type="button"
                onClick={() => setStep('form')}
                className="text-[10px] font-bold text-slate-400 hover:text-slate-650 transition-colors block mx-auto underline cursor-pointer"
              >
                Retourner au formulaire
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: BEAUTIFUL AUTO-CONFIRMED THANK YOU SCREEN */}
        {step === 'success' && (
          <div id="donation-success-step" className="p-6 sm:p-7 text-center space-y-4 animate-fade-in">
            <div className="mx-auto w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600 border border-emerald-500/15 animate-bounce-slow">
              <CheckCircle2 className="w-6 h-6 fill-current text-emerald-500" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-base sm:text-lg font-black text-brand-navy">Merci infiniment !</h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Votre soutien de <strong className="text-brand-orange font-bold">{finalAmount}$</strong> a bien été reçu ! Votre message est désormais visible par tous sur le mur de soutien.
              </p>
              
              <div className="bg-brand-warm-cream border border-brand-cream-dark/65 p-3.5 rounded-xl text-left max-w-xs mx-auto mt-2 text-xs space-y-1">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Votre publication :</p>
                <p className="font-extrabold text-brand-navy">{isAnonymous ? 'Anonyme' : name || 'Anonyme'}</p>
                {message.trim() && <p className="text-[10px] text-slate-500 italic">"{message}"</p>}
              </div>
            </div>

            {/* Single friendly confirmation action */}
            <div className="pt-2">
              <button
                id="close-success-final-btn"
                type="button"
                onClick={handleCloseSuccess}
                className="w-full py-2.5 bg-brand-navy hover:bg-brand-navy/90 text-white font-extrabold rounded-xl text-xs transition-all shadow-md shadow-brand-navy/15 cursor-pointer"
              >
                Super !
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

