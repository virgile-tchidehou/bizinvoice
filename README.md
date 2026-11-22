# BizInvoice

BizInvoice est une application web mobile-first de création et de gestion de factures. Elle permet aux entrepreneurs de suivre leur activité, de générer des PDF professionnels et de partager leurs factures.

## Fonctionnalités

- Authentification par e-mail/mot de passe et Google avec Firebase
- Gestion de plusieurs entreprises, devises et logos
- Création et édition de factures
- Calcul automatique des totaux, taxes et montants
- Génération et téléchargement de factures PDF
- Tableau de bord avec revenus et statuts des factures
- Recherche, filtrage et gestion des factures
- Abonnements Stripe avec offre gratuite limitée et plan Premium
- Interface responsive adaptée aux écrans mobiles

## Stack technique

- Next.js 16 avec App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Firebase Authentication, Firestore et Storage
- Stripe Checkout
- `@react-pdf/renderer`
- Lucide React

## Prérequis

- Node.js 20 ou une version plus récente
- npm
- Un projet Firebase
- Un compte Stripe pour activer les paiements

## Installation

```bash
git clone https://github.com/virgile-tchidehou/bizinvoice.git
cd bizinvoice
npm install
```

Créez ensuite un fichier `.env.local` à la racine du projet :

```dotenv
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe — ne jamais utiliser une clé secrète côté navigateur
STRIPE_SECRET_KEY=
STRIPE_PRICE_ID=
```

Configurez dans Firebase :

1. Activez l’authentification E-mail/Mot de passe.
2. Activez l’authentification Google si elle est utilisée.
3. Créez une base Firestore.
4. Ajoutez les domaines autorisés utilisés en développement et en production.

Dans Stripe, créez un produit avec un prix récurrent et renseignez son identifiant dans `STRIPE_PRICE_ID`.

## Développement

```bash
npm run dev
```

L’application est disponible sur [http://localhost:3000](http://localhost:3000).

## Scripts disponibles

```bash
npm run dev      # serveur de développement
npm run build    # build de production
npm run start    # démarrage du build
npm run lint     # vérification ESLint
```

## Structure principale

```text
app/
  api/stripe/checkout/   Route serveur Stripe Checkout
  dashboard/             Tableau de bord et gestion des factures
  i/[id]/               Page publique ou de consultation
  login/                 Connexion
  register/              Inscription
components/              Composants UI et génération PDF
context/                 Contextes React, notamment l’authentification
lib/                     Configuration Firebase, Firestore et utilitaires
public/                  Ressources publiques
```

## Déploiement

Le projet peut être déployé sur Vercel ou toute plateforme compatible Next.js.

Avant le déploiement :

- Ajoutez toutes les variables d’environnement sur la plateforme.
- Utilisez l’URL publique de l’application dans `NEXT_PUBLIC_APP_URL`.
- Configurez les domaines Firebase autorisés.
- Utilisez une clé Stripe de production pour `STRIPE_SECRET_KEY`.
- Ne commitez jamais `.env.local`, les clés privées ou les identifiants Stripe.

## Sécurité

Les variables sans préfixe `NEXT_PUBLIC_` sont réservées au serveur. Les clés Firebase publiques ne sont pas des secrets, mais les clés Stripe secrètes doivent rester exclusivement dans l’environnement serveur ou le fournisseur de déploiement.

## Licence

Le projet est privé.
