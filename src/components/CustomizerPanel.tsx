import React, { useState } from 'react';
import { 
  X, 
  Save, 
  RotateCcw, 
  Link, 
  Globe, 
  Twitter, 
  Github, 
  Instagram, 
  Linkedin,
  Facebook,
  Youtube,
  User,
  Users,
  FileText, 
  Palette,
  Target,
  Music,
  Upload,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';
import { CreatorProfile } from '../types';

interface CustomizerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CreatorProfile;
  onSave: (updatedProfile: CreatorProfile) => void;
  onReset: () => void;
}

export default function CustomizerPanel({ isOpen, onClose, profile, onSave, onReset }: CustomizerPanelProps) {
  const [name, setName] = useState(profile.name);
  const [subtitle, setSubtitle] = useState(profile.subtitle);
  const [bio, setBio] = useState(profile.bio);
  
  const [stripeLink, setStripeLink] = useState(profile.stripeLink);
  const [stripeLinkMonthly, setStripeLinkMonthly] = useState(profile.stripeLinkMonthly || '');
  const [paypalLink, setPaypalLink] = useState(profile.paypalLink || '');
  
  const [website, setWebsite] = useState(profile.socials.website || '');
  const [community, setCommunity] = useState(profile.socials.community || '');
  const [github, setGithub] = useState(profile.socials.github || '');
  const [instagram, setInstagram] = useState(profile.socials.instagram || '');
  const [linkedin, setLinkedin] = useState(profile.socials.linkedin || '');
  const [facebook, setFacebook] = useState(profile.socials.facebook || '');
  const [youtube, setYoutube] = useState(profile.socials.youtube || '');

  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || '');
  const [bannerUrl, setBannerUrl] = useState(profile.bannerUrl || '');

  const [showGoal, setShowGoal] = useState(profile.showGoal || false);
  const [goalTarget, setGoalTarget] = useState(profile.goalTarget || 500);

  const [defaultSoundtrack, setDefaultSoundtrack] = useState<'zen' | 'space' | 'warm'>(profile.defaultSoundtrack || 'zen');
  const [autoplayMusic, setAutoplayMusic] = useState(profile.autoplayMusic || false);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("L'image est trop lourde. Veuillez choisir une image de moins de 2 Mo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (type === 'avatar') {
        setAvatarUrl(base64);
      } else {
        setBannerUrl(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name.trim(),
      subtitle: subtitle.trim(),
      bio: bio.trim(),
      avatarUrl: avatarUrl.trim(),
      bannerUrl: bannerUrl.trim(),
      stripeLink: stripeLink.trim() || 'https://donate.stripe.com',
      stripeLinkMonthly: stripeLinkMonthly.trim() || undefined,
      paypalLink: paypalLink.trim() || undefined,
      showGoal: showGoal,
      goalTarget: goalTarget,
      defaultSoundtrack: defaultSoundtrack,
      autoplayMusic: autoplayMusic,
      socials: {
        website: website.trim(),
        community: community.trim(),
        github: github.trim(),
        instagram: instagram.trim(),
        linkedin: linkedin.trim(),
        facebook: facebook.trim(),
        youtube: youtube.trim()
      }
    });
    onClose();
  };

  const handleReset = () => {
    if (window.confirm("Voulez-vous vraiment réinitialiser les réglages à leur état d'origine ?")) {
      onReset();
      onClose();
    }
  };

  return (
    <div id="customizer-overlay" className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
      {/* Click outside to close */}
      <div id="customizer-backdrop-click" className="absolute inset-0" onClick={onClose} />

      {/* Slide-over Content */}
      <div 
        id="customizer-drawer" 
        className="relative w-full max-w-md bg-white border-l border-brand-cream-dark h-full flex flex-col shadow-2xl z-10 animate-slide-left text-brand-navy"
      >
        {/* Header */}
        <div className="p-5 border-b border-brand-cream-dark flex items-center justify-between bg-brand-navy text-white">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-brand-orange" />
            <div>
              <h3 className="font-bold text-sm text-white">Personnaliser ma page</h3>
              <p className="text-[10px] text-slate-350 font-medium">Modifiez votre profil et vos liens Stripe</p>
            </div>
          </div>
          <button 
            id="close-customizer-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form id="customizer-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* Section 1: Informations Générales */}
          <div className="space-y-2.5">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-450 flex items-center gap-1.5 pb-1 border-b border-brand-cream-dark/60">
              <User className="w-3.5 h-3.5 text-brand-orange" />
              Identité visuelle
            </h4>
            
            <div className="space-y-1">
              <label htmlFor="custom-name" className="text-xs text-slate-650 font-bold">Nom / Marque</label>
              <input
                id="custom-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 bg-brand-warm-cream border border-brand-cream-dark rounded-lg text-xs text-brand-navy focus:outline-none focus:border-brand-orange font-medium"
                placeholder="Ex: Studio Huvi"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="custom-subtitle" className="text-xs text-slate-650 font-bold">Slogan / Métier</label>
              <input
                id="custom-subtitle"
                type="text"
                required
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-3 py-1.5 bg-brand-warm-cream border border-brand-cream-dark rounded-lg text-xs text-brand-navy focus:outline-none focus:border-brand-orange"
                placeholder="Ex: Expert en Optimisation Digitale"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="custom-bio" className="text-xs text-slate-650 font-bold">Description / Biographie</label>
              <textarea
                id="custom-bio"
                rows={3}
                required
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-1.5 bg-brand-warm-cream border border-brand-cream-dark rounded-lg text-xs text-brand-navy focus:outline-none focus:border-brand-orange resize-none leading-relaxed"
                placeholder="Décrivez votre projet..."
              />
            </div>
          </div>

          {/* Section 2: Passerelle Stripe */}
          <div className="space-y-2.5">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-450 flex items-center gap-1.5 pb-1 border-b border-brand-cream-dark/60">
              <Link className="w-3.5 h-3.5 text-brand-orange" />
              Liens de Paiement Stripe
            </h4>
            
            <div className="space-y-1">
              <label htmlFor="custom-stripe" className="text-xs text-slate-650 font-bold">Lien Stripe : Don Unique</label>
              <input
                id="custom-stripe"
                type="url"
                required
                value={stripeLink}
                onChange={(e) => setStripeLink(e.target.value)}
                className="w-full px-3 py-1.5 bg-brand-warm-cream border border-brand-cream-dark rounded-lg text-xs text-brand-navy focus:outline-none focus:border-brand-orange"
                placeholder="https://donate.stripe.com/..."
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="custom-stripe-monthly" className="text-xs text-slate-650 font-bold">Lien Stripe : Don Mensuel (Optionnel)</label>
              <input
                id="custom-stripe-monthly"
                type="url"
                value={stripeLinkMonthly}
                onChange={(e) => setStripeLinkMonthly(e.target.value)}
                className="w-full px-3 py-1.5 bg-brand-warm-cream border border-brand-cream-dark rounded-lg text-xs text-brand-navy focus:outline-none focus:border-brand-orange"
                placeholder="https://donate.stripe.com/... (laissez vide si indisponible)"
              />
              <p className="text-[9px] text-slate-500 mt-0.5">
                Utilisez un abonnement ou produit récurrent Stripe pour les prélèvements automatiques mensuels.
              </p>
            </div>

            <div className="space-y-1 pt-1">
              <label htmlFor="custom-paypal" className="text-xs text-slate-650 font-bold">Lien PayPal (Optionnel)</label>
              <input
                id="custom-paypal"
                type="url"
                value={paypalLink}
                onChange={(e) => setPaypalLink(e.target.value)}
                className="w-full px-3 py-1.5 bg-brand-warm-cream border border-brand-cream-dark rounded-lg text-xs text-brand-navy focus:outline-none focus:border-brand-orange"
                placeholder="https://paypal.me/votre_pseudo/15"
              />
              <p className="text-[9px] text-slate-500 mt-0.5">
                Renseignez votre lien Paypal.Me pour proposer PayPal en alternative sécurisée à vos supporters.
              </p>
            </div>
          </div>

          {/* Section 3: Musique & Climat Sonore */}
          <div className="space-y-2.5">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-450 flex items-center gap-1.5 pb-1 border-b border-brand-cream-dark/60">
              <Music className="w-3.5 h-3.5 text-brand-orange" />
              Ambiance Sonore & Lecteur
            </h4>

            <div className="bg-brand-warm-cream p-3 rounded-xl border border-brand-cream-dark space-y-3">
              <div className="space-y-1">
                <label htmlFor="custom-default-sound" className="text-xs text-slate-650 font-bold">Soundtrack par défaut</label>
                <select
                  id="custom-default-sound"
                  value={defaultSoundtrack}
                  onChange={(e) => setDefaultSoundtrack(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-white border border-brand-cream-dark rounded-lg text-xs text-brand-navy focus:outline-none focus:border-brand-orange font-semibold cursor-pointer"
                >
                  <option value="zen">Zen Café (Do majeur 9)</option>
                  <option value="space">Oasis Spatial (Ré mineur 11)</option>
                  <option value="warm">Aube Dorée (Fa majeur 9/11)</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-brand-navy">Autoplay la musique</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoplayMusic}
                    onChange={(e) => setAutoplayMusic(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-orange"></div>
                </label>
              </div>
              <p className="text-[9.5px] text-slate-500 leading-normal">
                Si activé, l'ambiance démarrera discrètement dès le premier clic ou interaction du visiteur sur votre page (norme de sécurité des navigateurs).
              </p>
            </div>
          </div>

          {/* Section 4: Configuration Objectif Café */}
          <div className="space-y-2.5">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-450 flex items-center gap-1.5 pb-1 border-b border-brand-cream-dark/60">
              <Target className="w-3.5 h-3.5 text-brand-orange" />
              Objectif de Financement
            </h4>

            <div className="bg-brand-warm-cream p-3 rounded-xl border border-brand-cream-dark space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-navy">Activer l'objectif mensuel</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showGoal}
                    onChange={(e) => setShowGoal(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-orange"></div>
                </label>
              </div>

              {showGoal && (
                <div className="space-y-1 animate-fade-in pt-1">
                  <label htmlFor="custom-goal-target" className="text-[11px] text-slate-600 font-medium">Montant cible mensuel ($)</label>
                  <input
                    id="custom-goal-target"
                    type="number"
                    min="10"
                    max="10000"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(parseInt(e.target.value) || 100)}
                    className="w-full px-3 py-1 bg-white border border-brand-cream-dark rounded-lg text-xs text-brand-navy focus:outline-none focus:border-brand-orange font-bold"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 5: Liens Sociaux */}
          <div className="space-y-2.5">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-450 flex items-center gap-1.5 pb-1 border-b border-brand-cream-dark/60">
              <Globe className="w-3.5 h-3.5 text-brand-orange" />
              Réseaux Sociaux
            </h4>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-500 shrink-0" />
                <input
                  id="custom-social-website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-3 py-1 bg-brand-warm-cream border border-brand-cream-dark rounded-lg text-xs text-brand-navy focus:outline-none focus:border-brand-orange"
                  placeholder="Site Web"
                />
              </div>

              <div className="flex items-center gap-2">
                <Linkedin className="w-4 h-4 text-slate-500 shrink-0" />
                <input
                  id="custom-social-linkedin"
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="w-full px-3 py-1 bg-brand-warm-cream border border-brand-cream-dark rounded-lg text-xs text-brand-navy focus:outline-none focus:border-brand-orange"
                  placeholder="LinkedIn URL"
                />
              </div>

              <div className="flex items-center gap-2">
                <Youtube className="w-4 h-4 text-slate-500 shrink-0" />
                <input
                  id="custom-social-youtube"
                  type="url"
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  className="w-full px-3 py-1 bg-brand-warm-cream border border-brand-cream-dark rounded-lg text-xs text-brand-navy focus:outline-none focus:border-brand-orange"
                  placeholder="YouTube URL"
                />
              </div>

              <div className="flex items-center gap-2">
                <Facebook className="w-4 h-4 text-slate-500 shrink-0" />
                <input
                  id="custom-social-facebook"
                  type="url"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  className="w-full px-3 py-1 bg-brand-warm-cream border border-brand-cream-dark rounded-lg text-xs text-brand-navy focus:outline-none focus:border-brand-orange"
                  placeholder="Facebook URL"
                />
              </div>

              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-500 shrink-0" />
                <input
                  id="custom-social-community"
                  type="url"
                  value={community}
                  onChange={(e) => setCommunity(e.target.value)}
                  className="w-full px-3 py-1 bg-brand-warm-cream border border-brand-cream-dark rounded-lg text-xs text-brand-navy focus:outline-none focus:border-brand-orange"
                  placeholder="Lien Communauté (ex: Groupe FB)"
                />
              </div>

              <div className="flex items-center gap-2">
                <Github className="w-4 h-4 text-slate-500 shrink-0" />
                <input
                  id="custom-social-github"
                  type="url"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  className="w-full px-3 py-1 bg-brand-warm-cream border border-brand-cream-dark rounded-lg text-xs text-brand-navy focus:outline-none focus:border-brand-orange"
                  placeholder="GitHub URL"
                />
              </div>

              <div className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-slate-500 shrink-0" />
                <input
                  id="custom-social-instagram"
                  type="url"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="w-full px-3 py-1 bg-brand-warm-cream border border-brand-cream-dark rounded-lg text-xs text-brand-navy focus:outline-none focus:border-brand-orange"
                  placeholder="Instagram URL"
                />
              </div>
            </div>
          </div>

          {/* Section 6: Photos & Images */}
          <div className="space-y-3.5">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-450 flex items-center gap-1.5 pb-1 border-b border-brand-cream-dark/60">
              <ImageIcon className="w-3.5 h-3.5 text-brand-orange" />
              Photos de profil & Bannière
            </h4>

            {/* Photo de profil */}
            <div className="space-y-2 bg-brand-warm-cream/50 p-3 rounded-xl border border-brand-cream-dark/60">
              <span className="text-xs text-brand-navy font-bold block">Photo de profil</span>
              
              <div className="flex items-center gap-3">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Aperçu Profil" className="w-12 h-12 rounded-full object-cover border border-brand-cream-dark shrink-0" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-brand-orange flex items-center justify-center text-white text-xs font-black shrink-0">
                    HO
                  </div>
                )}
                
                <div className="flex-1 space-y-1.5">
                  <label className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 bg-brand-navy hover:bg-brand-navy/90 text-white rounded-lg text-[10.5px] font-bold transition-all shadow-sm select-none">
                    <Upload className="w-3 h-3 text-brand-orange" />
                    <span>Choisir une photo (JPEG/PNG)</span>
                    <input 
                      type="file" 
                      accept="image/png, image/jpeg, image/jpg, image/webp" 
                      className="hidden" 
                      onChange={(e) => handleImageUpload(e, 'avatar')} 
                    />
                  </label>
                  
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="text-[10px] font-bold text-red-600 hover:text-red-500 hover:underline flex items-center gap-0.5 ml-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Retirer la photo</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="custom-avatar-url" className="text-[10px] text-slate-500 font-medium">Ou coller l'URL d'une image existante :</label>
                <input
                  id="custom-avatar-url"
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-3 py-1 bg-white border border-brand-cream-dark rounded-lg text-xs text-brand-navy focus:outline-none focus:border-brand-orange"
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Photo de bannière */}
            <div className="space-y-2 bg-brand-warm-cream/50 p-3 rounded-xl border border-brand-cream-dark/60">
              <span className="text-xs text-brand-navy font-bold block">Photo de bannière</span>
              
              {bannerUrl ? (
                <div className="relative h-16 w-full rounded-lg overflow-hidden border border-brand-cream-dark shadow-inner">
                  <img src={bannerUrl} alt="Aperçu Bannière" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <button
                    type="button"
                    onClick={() => setBannerUrl('')}
                    className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-600 text-white rounded-md transition-colors"
                    title="Supprimer la bannière"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="h-12 w-full rounded-lg bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-[10px] font-medium">
                  Aucune image de bannière (arrière-plan uni par défaut)
                </div>
              )}

              <div className="pt-0.5">
                <label className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 bg-brand-navy hover:bg-brand-navy/90 text-white rounded-lg text-[10.5px] font-bold transition-all shadow-sm select-none">
                  <Upload className="w-3 h-3 text-brand-orange" />
                  <span>Choisir une bannière (JPEG/PNG)</span>
                  <input 
                    type="file" 
                    accept="image/png, image/jpeg, image/jpg, image/webp" 
                    className="hidden" 
                    onChange={(e) => handleImageUpload(e, 'banner')} 
                  />
                </label>
              </div>

              <div className="space-y-1">
                <label htmlFor="custom-banner-url" className="text-[10px] text-slate-500 font-medium">Ou coller l'URL d'une image existante :</label>
                <input
                  id="custom-banner-url"
                  type="url"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  className="w-full px-3 py-1 bg-white border border-brand-cream-dark rounded-lg text-xs text-brand-navy focus:outline-none focus:border-brand-orange"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer actions */}
        <div className="p-5 border-t border-brand-cream-dark bg-brand-warm-cream flex items-center justify-between gap-3">
          <button
            id="reset-customizer-btn"
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-500 hover:text-red-500 rounded-xl text-xs transition-colors flex items-center gap-1 cursor-pointer font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Réinitialiser
          </button>
          
          <button
            id="save-customizer-btn"
            onClick={handleSubmit}
            className="px-4.5 py-2.5 bg-brand-orange hover:bg-brand-orange/90 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1 shadow-md shadow-brand-orange/15 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            Enregistrer
          </button>
        </div>
      </div>

      <style>{`
        .animate-slide-left {
          animation: slideLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
