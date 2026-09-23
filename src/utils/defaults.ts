import { CreatorProfile, Contribution } from '../types';

export const DEFAULT_PROFILE: CreatorProfile = {
  name: "Huvi Optimisation",
  subtitle: "Développeur, Designer & Expert en Optimisation Digitale",
  bio: "Bienvenue sur mon espace de soutien ! Passionné par le développement d'outils web performants, fluides et hautement sécurisés. Si mes solutions vous font gagner du temps ou enrichissent vos projets, vous pouvez m'offrir un café. Chaque soutien compte et m'aide à concevoir de nouveaux outils libres de droits !",
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
