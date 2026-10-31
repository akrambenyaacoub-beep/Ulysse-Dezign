# Ulysse DeZign

Ulysse DeZign est une application web de gestion et de vente pour une activite d'impression et de communication visuelle. Elle regroupe un espace ERP protege pour l'equipe, une boutique en ligne et un portail client.

L'application peut etre utilisee comme site web avec Vite et embarquee dans des applications Android et iOS avec Capacitor.

## Fonctionnalites

- Tableau de bord et indicateurs d'activite
- Gestion des clients, commandes, ventes et depenses
- Catalogue de produits et boutique en ligne
- Panier et parcours client
- Gestion de l'equipage, de l'equipe et du planning
- Tresorerie et journal de caisse
- Statistiques d'equipage
- Portail client avec inscription, connexion et tableau de bord
- Administration des produits
- Export de documents PDF
- Authentification et donnees synchronisees avec Supabase

## Stack technique

- React 19 et React Router
- Vite
- Tailwind CSS et Framer Motion
- Supabase pour l'authentification, la base de donnees et le temps reel
- Capacitor pour Android et iOS
- Recharts pour les graphiques
- jsPDF et xlsx pour les exports

## Prerequis

- Node.js 20 ou une version plus recente
- npm
- Un projet Supabase configure
- Android Studio pour la compilation Android
- Xcode et macOS pour la compilation iOS

## Installation

```bash
npm install
```

Creer un fichier `.env.local` a la racine du projet :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon
```

Les noms des variables doivent correspondre exactement a ceux utilises par les clients Supabase de l'application.

## Developpement

Demarrer le serveur de developpement :

```bash
npm run dev
```

Puis ouvrir l'URL affichee par Vite, generalement `http://localhost:5173`.

Commandes disponibles :

| Commande | Description |
| --- | --- |
| `npm run dev` | Demarre Vite en mode developpement |
| `npm run build` | Cree le build de production dans `dist/` |
| `npm run preview` | Sert localement le build de production |
| `npm run lint` | Lance ESLint |
| `npm run optimize-images` | Optimise les images du projet |
| `npm run vercel-build` | Build utilise pour Vercel |

## Principales routes

### Routes publiques

- `/` : page d'accueil
- `/login` : connexion de l'equipe
- `/boutique` : boutique et catalogue public
- `/panier` : panier
- `/client/login` : connexion client
- `/client/register` : inscription client
- `/client/dashboard` : espace client

### Routes protegees

Les routes ERP necessitent une session utilisateur :

`/dashboard`, `/clients`, `/commandes`, `/catalogue`, `/equipage`, `/tresors`, `/depenses`, `/ventes`, `/equipe`, `/journal-caisse`, `/equipage-stats`, `/planning` et `/admin/produits`.

## Build mobile

Construire les fichiers web avant de synchroniser Capacitor :

```bash
npm run build
npx cap sync
```

Ouvrir ensuite le projet natif :

```bash
npx cap open android
npx cap open ios
```

L'identifiant de l'application est `com.ulysse.dezign` et son nom natif est `Ulysse DeZign`.

## Deploiement

Le projet est configure pour Vercel. Le build de deploiement est :

```bash
npm run vercel-build
```

Les variables Supabase doivent etre ajoutees dans les variables d'environnement du projet de deploiement.

## Securite

Ne jamais placer une cle Supabase `service_role` dans une variable `VITE_*` ou dans le code execute par le navigateur : Vite l'integre au bundle public. La variable `VITE_SUPABASE_SERVICE_ROLE_KEY` est actuellement lue par `src/lib/supabaseErp.js` ; les operations admin doivent etre deplacees vers une API serveur ou une Edge Function Supabase avant une mise en production.

Les politiques RLS Supabase doivent egalement etre activees et testees pour toutes les tables accessibles par le client.
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
