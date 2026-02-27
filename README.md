# API CV Builder

API REST NestJS pour créer, modifier et exporter des CV au format PDF. Authentification JWT, base PostgreSQL avec Prisma, et génération de PDF via Playwright.

---

## Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Commandes](#commandes)
- [Structure du projet](#structure-du-projet)
- [Modèle de données](#modèle-de-données)
- [Endpoints API](#endpoints-api)
- [Tests](#tests)
- [Déploiement](#déploiement)

---

## Vue d'ensemble

| Élément | Détail |
|--------|--------|
| **Framework** | NestJS 11 |
| **Base de données** | PostgreSQL (Prisma 7) |
| **Auth** | JWT (Passport) |
| **Validation** | class-validator + Zod (config) |
| **PDF** | Playwright (rendu HTML → PDF) |
| **Node** | ES2023, TypeScript 5.7 |

Fonctionnalités principales :

- **Auth** : inscription, connexion, changement de mot de passe
- **Profil** : `GET /me`, mise à jour profil et mot de passe
- **CV** : CRUD, téléchargement PDF, champs personnalisables (expériences, formation, compétences, langues)

---

## Prérequis

- **Node.js** 18+ (recommandé 20+)
- **npm** 9+
- **PostgreSQL** (local ou fournisseur type Neon, Supabase, etc.)
- **Git**

---

## Installation

```bash
# Cloner le dépôt (si ce n'est pas déjà fait)
git clone <url-du-repo>
cd api-cv-builder

# Installer les dépendances
npm install

# Générer le client Prisma (après avoir configuré DATABASE_URL)
npx prisma generate
```

---

## Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet (ne commitez pas les secrets).

| Variable | Obligatoire | Description | Exemple |
|----------|-------------|-------------|---------|
| `DATABASE_URL` | Oui | URL de connexion PostgreSQL | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `PORT` | Non | Port du serveur (défaut: 3000) | `3000` |
| `JWT_SECRET` | Oui | Secret pour signer les JWT (min. 16 caractères) | Chaîne longue et aléatoire |
| `JWT_EXPIRES_IN` | Non | Durée de validité du token (défaut: 1h) | `1h`, `7d` |
| `BCRYPT_SALT_ROUNDS` | Non | Coût bcrypt (8–15, défaut: 10) | `10` |
| `ANTHROPIC_API_KEY` | Non | Clé API Anthropic (si fonctionnalités IA) | `sk-ant-...` |
| `FRONTEND_URL` | Non | URL du front (CORS / redirections) | `http://localhost:3001` |
| `PRINT_SECRET` | Non | Secret pour impression/export sécurisé | Chaîne secrète |

Exemple minimal `.env` :

```env
PORT=3000
JWT_SECRET=votre_secret_jwt_long_et_aleatoire_16_caracteres_min
JWT_EXPIRES_IN=1h
BCRYPT_SALT_ROUNDS=10
DATABASE_URL=postgresql://user:password@localhost:5432/cv_builder
```

### Base de données

```bash
# Appliquer les migrations
npx prisma migrate deploy

# (En dev) Réinitialiser la base et réappliquer les migrations
npx prisma migrate reset
```

---

## Commandes

| Commande | Description |
|----------|-------------|
| `npm run build` | Compile le projet TypeScript dans `dist/` |
| `npm run start` | Démarre l'app (après build) |
| `npm run start:dev` | Démarre en mode watch (rechargement à chaque modification) |
| `npm run start:debug` | Démarre avec debug Node (watch) |
| `npm run start:prod` | Lance `node dist/main` (pour production) |
| `npm run lint` | Lance ESLint et applique les correctifs automatiques |
| `npm run format` | Formate le code avec Prettier (`src/`, `test/`) |
| `npm run test` | Lance les tests unitaires (Jest) |
| `npm run test:watch` | Tests en mode watch |
| `npm run test:cov` | Tests avec rapport de couverture |
| `npm run test:e2e` | Tests end-to-end |

### Prisma

| Commande | Description |
|----------|-------------|
| `npx prisma generate` | Régénère le client Prisma dans `generated/prisma` |
| `npx prisma migrate dev` | Crée/applique une migration en dev |
| `npx prisma migrate deploy` | Applique les migrations en production |
| `npx prisma migrate reset` | Réinitialise la base et réapplique les migrations |
| `npx prisma studio` | Ouvre l'interface Prisma Studio sur la base |

---

## Structure du projet

```
api-cv-builder/
├── prisma/
│   ├── schema.prisma      # Modèles et config Prisma
│   └── migrations/        # Migrations SQL
├── generated/
│   └── prisma/            # Client Prisma généré (ne pas éditer)
├── src/
│   ├── main.ts            # Point d'entrée, config Express & ValidationPipe
│   ├── app.module.ts      # Module racine
│   ├── app.controller.ts  # Routes /me, /me/profile, /me/password
│   ├── config/
│   │   └── env.schema.ts  # Schéma Zod des variables d'env
│   ├── auth/              # Inscription, login, JWT, guards
│   ├── cvs/               # CRUD CV, export PDF
│   ├── users/             # Logique métier utilisateurs
│   └── prisma/            # Module et service Prisma
├── test/                  # Tests E2E
├── .env                   # Variables d'environnement (à créer, ne pas commiter)
├── nest-cli.json
├── tsconfig.json
├── prisma.config.ts       # Config Prisma (schema, migrations, datasource)
└── package.json
```

---

## Modèle de données

- **User** : `id`, `email`, `password`, `createdAt`, `updatedAt` — lien 1:1 avec `Profile`, 1:n avec `Cv`.
- **Profile** : `userId`, `fullName`, `avatarUrl` (table `profiles`).
- **Cv** : `userId`, `title`, `template`, `accentColor`, `photoUrl`, champs texte (fullName, jobTitle, email, phone, location, summary), blocs JSON (experiences, education, skills, languages), `currentStep`, `completed` (table `cvs`).

Les migrations sont dans `prisma/migrations/`. Le client est généré dans `generated/prisma` (config dans `schema.prisma`).

---

## Endpoints API

Base URL par défaut : `http://localhost:3000`

### Auth (sans token)

| Méthode | Route | Description |
|---------|--------|-------------|
| `POST` | `/auth/register` | Inscription (body: `email`, `password`) |
| `POST` | `/auth/login` | Connexion (body: `email`, `password`) → renvoie un token JWT |

### Utilisateur (JWT requis)

| Méthode | Route | Description |
|---------|--------|-------------|
| `GET` | `/me` | Utilisateur connecté + profil |
| `PATCH` | `/me/profile` | Mise à jour profil (`fullName`, `avatarUrl`) |
| `PATCH` | `/me/password` | Changement de mot de passe (body: `newPassword`) |

### CV (JWT requis)

| Méthode | Route | Description |
|---------|--------|-------------|
| `GET` | `/cvs` | Liste des CV de l'utilisateur |
| `GET` | `/cvs/:id` | Détail d'un CV |
| `GET` | `/cvs/:id/download` | Téléchargement du CV en PDF |
| `POST` | `/cvs` | Création d'un CV (body: CreateCvDto) |
| `PATCH` | `/cvs/:id` | Mise à jour (body: UpdateCvDto) |
| `DELETE` | `/cvs/:id` | Suppression |

Authentification : en-tête `Authorization: Bearer <token>` (ou cookie si configuré).

---

## Tests

```bash
# Tests unitaires
npm run test

# Avec couverture
npm run test:cov

# E2E
npm run test:e2e
```

Les tests unitaires utilisent Jest (config dans `package.json`). Les E2E sont dans `test/` avec la config `test/jest-e2e.json`.

---

## Déploiement

1. **Build** : `npm run build`
2. **Variables d'env** : définir toutes les variables obligatoires (et optionnelles selon besoin) sur la plateforme (Vercel, Railway, etc.).
3. **Migrations** : exécuter `npx prisma migrate deploy` avant ou au démarrage.
4. **Lancer** : `npm run start:prod` (ou `node dist/main`).

Pour un hébergement serverless, adapter le point d'entrée si nécessaire et s'assurer que la connexion base de données et Playwright (pour le PDF) sont supportées.

---

## Licence

Projet privé (UNLICENSED). Voir `package.json`.
