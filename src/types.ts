export interface SocialLinks {
  twitter?: string;
  youtube?: string;
  instagram?: string;
  github?: string;
  website?: string;
  linkedin?: string;
  facebook?: string;
  community?: string;
}

export interface CreatorProfile {
  name: string;
  subtitle: string;
  bio: string;
  avatarUrl: string;
  bannerUrl: string;
  stripeLink: string; // One-time Stripe link
  stripeLinkMonthly?: string; // Monthly subscription Stripe link
  socials: SocialLinks;
  showGoal?: boolean;
  goalTarget?: number;
  defaultSoundtrack?: 'zen' | 'space' | 'warm';
  autoplayMusic?: boolean;
  paypalLink?: string;
}

export interface Contribution {
  id: string;
  name: string;
  amount: number;
  message: string;
  timestamp: string; // ISO string
  isSimulated?: boolean;
}

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  url: string; // fallback or primary
  type: 'synth' | 'url';
}
