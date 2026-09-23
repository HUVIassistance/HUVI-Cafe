import { CreatorProfile, Contribution } from '../types';

export const DEFAULT_PROFILE: CreatorProfile = {
  name: "Hugo Viens",
  subtitle: "Fondateur d'HUVI Optimisation, analyste d'affaires & architecte de systèmes pour PME",
  bio: "Passionné de plein-air, ancien juriste et propriétaire d'une entreprise spécialisée dans la création de systèmes de gestion d'entreprise sur-mesure et d'automatisation, ma mission dans la vie est de rendre la productivité simple et accessible pour tous.\n\nJ'ai aussi une chaîne YouTube et une communauté privée où je donne un maximum de valeur gratuite sur l'organisation, la structure, la productivité et la technologie sous la forme de lives, de formations, d'outils et de ressources gratuites à tous les travailleurs autonomes, professionnels et propriétaires de PME.\n\nTu as un enjeu présentement ? Écris-moi, j'ai fort probablement quelque chose pour t'aider !",
  avatarUrl: "", // We will render a stunning SVG avatar dynamically if empty
  bannerUrl: "", // We will render a stunning premium dynamic canvas banner if empty
  stripeLink: "https://donate.stripe.com/3cI4gzbMlacdahRdiE8Vi04", // Custom Stripe payment link
  stripeLinkMonthly: "https://donate.stripe.com/4gM7sL17Hckley792o8Vi05", // Custom Monthly subscription Stripe link
  socials: {
    website: "https://huvioptimisation.com",
    github: "https://github.com/HUVIoptimisation/huvi-skills",
    instagram: "https://www.instagram.com/hugo.viens63/",
    linkedin: "https://www.linkedin.com/in/hugo-viens-34607817b/",
    facebook: "https://www.facebook.com/hugo.viens.12/",
    community: "https://www.facebook.com/groups/peakperformeur",
    youtube: "",
  },
  showGoal: false,
  goalTarget: 500,
  defaultSoundtrack: 'zen',
  autoplayMusic: false,
  paypalLink: ''
};

export const DEFAULT_CONTRIBUTIONS: Contribution[] = [
  {
    id: "contrib-1",
    name: "Alexandre Tremblay",
    amount: 15,
    message: "Merci pour ton aide précieuse sur mon application React. Les performances sont dingues !",
    timestamp: new Date(Date.now() - 4 * 24 * 3600000).toISOString(), // 4 days ago
    isSimulated: true,
  },
  {
    id: "contrib-2",
    name: "Élise Gauthier",
    amount: 25,
    message: "Ton approche de la cybersécurité et de la protection des données fait toute la différence. Bravo pour cette page !",
    timestamp: new Date(Date.now() - 12 * 24 * 3600000).toISOString(), // 12 days ago
    isSimulated: true,
  },
  {
    id: "contrib-3",
    name: "Simon Mercier",
    amount: 15,
    message: "De super conseils et un travail toujours impeccable. Bon café !",
    timestamp: new Date(Date.now() - 26 * 24 * 3600000).toISOString(), // 26 days ago
    isSimulated: true,
  }
];
