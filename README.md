# HUVI Café

Page de soutien publique de HUVI Optimisation, en ligne sur **https://cafe.huvioptimisation.com**.

## Objectif

Permettre à un visiteur d'offrir un café à Hugo Viens (don unique ou abonnement mensuel de 7,50 $)
via des liens de paiement Stripe. La page est **non indexable** (`noindex, nofollow`) et n'est pas
référencée dans la navigation des autres sites HUVI.

## Périmètre

- Application 100 % statique (React 19 + Vite 8 + Tailwind 4). Aucun backend, aucun serveur, aucune base de données.
- Aucun secret ni variable d'environnement : les deux liens de paiement Stripe sont des constantes dans `src/utils/defaults.ts`.
- Aucune donnée bancaire ne transite par cette page. Le paiement est délégué à Stripe (lien externe).
- Aucune surface d'édition publique : le panneau de personnalisation n'existe qu'en local, en mode `dev`.
- Le mur de soutien est local au navigateur du visiteur (localStorage). Il n'y a pas de compteur global.

## Structure des fichiers

```
index.html                        gabarit HTML (lang=fr, noindex, meta OG, polices Manrope + JetBrains Mono)
CNAME                             domaine personnalisé GitHub Pages : cafe.huvioptimisation.com
package.json / package-lock.json  dépendances et build (lockfile commité pour des builds reproductibles)
vite.config.ts                    config Vite (React + Tailwind)
tsconfig.json                     config TypeScript (build = `tsc --noEmit`)
.github/workflows/deploy.yml      CI de déploiement GitHub Pages
src/main.tsx                      point d'entrée React
src/App.tsx                       page complète (header, profil, CTA, mur de soutien, footer)
src/types.ts                      types partagés (CreatorProfile, Contribution, AudioTrack)
src/index.css                     thème Tailwind (palette de marque + polices)
src/utils/defaults.ts             SOURCE DE VÉRITÉ du contenu et des liens Stripe
src/utils/audioSynth.ts           synthétiseur d'ambiance (Web Audio, aucun fichier audio)
src/components/CustomizerPanel.tsx    panneau de gestion, DEV uniquement (exclu du build de production)
src/components/ContributionModal.tsx  modale de don (don unique / mensuel, redirection Stripe)
src/components/ContributionTicker.tsx notification du dernier soutien
src/components/SecurityBadge.tsx      encart explicatif paiement et données bancaires
src/components/AmbientPlayer.tsx      lecteur d'ambiance sonore
```

## Modifier le contenu ou les liens Stripe

1. Éditer `src/utils/defaults.ts` (nom, sous-titre, bio, liens sociaux, liens Stripe, objectif).
2. Ou lancer `npm run dev`, utiliser le panneau (bouton « Accès Créateur ») puis « Exporter la config » :
   le bloc TypeScript généré se colle dans `src/utils/defaults.ts`.
3. Commiter et pousser sur `main` : le workflow reconstruit et redéploie le site.

## Builder en local

Prérequis : Node.js >= 20.19 (le workflow Pages utilise Node 22).

```bash
npm ci          # installation reproductible depuis package-lock.json
npm run build   # génère dist/
npm run lint    # vérification TypeScript (tsc --noEmit)
npm run preview # sert dist/ en local
npm run dev     # serveur de développement sur le port 3000
```

## Déployer

Le déploiement est automatique : chaque push sur `main` déclenche
`.github/workflows/deploy.yml` (checkout, Node 22, `npm ci`, `npm run build`, upload de `dist/`,
puis déploiement GitHub Pages avec `environment: github-pages`).

Côté GitHub, le repo doit rester configuré avec :
- Pages : source **GitHub Actions** (build_type `workflow`)
- Domaine personnalisé : `cafe.huvioptimisation.com` (également présent dans le fichier `CNAME`)
- DNS : CNAME `cafe` -> `<compte>.github.io`, proxy Cloudflare, SSL/TLS en mode **Full**

## Variables d'environnement

Aucune. Le build ne dépend d'aucun secret.

## Dépendances

- runtime : `react`, `react-dom`, `lucide-react` (icônes)
- build : `vite`, `@vitejs/plugin-react`, `@tailwindcss/vite`, `tailwindcss`, `typescript`
- `motion` est encore déclaré mais n'est importé nulle part dans `src/` : candidat à retrait lors d'une passe ultérieure.

## Rollback

Le site et son contenu sont entièrement versionnés, donc réversibles :

```bash
git revert <sha>      # annule un commit de contenu puis redéploie
git checkout <sha> -- .   # ou restaure des fichiers précis
```

`package-lock.json` étant commité, un retour arrière sur une dépendance redonne un build identique.
En cas de besoin urgent, GitHub permet aussi de relancer un ancien run de workflow (Actions > Deploy React/Vite to GitHub Pages > Re-run).

## URL live

- https://cafe.huvioptimisation.com
- Retour de paiement : `https://cafe.huvioptimisation.com/?payment_success=true` (paramètre géré par `src/App.tsx`)
