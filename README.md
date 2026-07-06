# API CV Builder

API REST construite avec **NestJS 11** pour la gestion de comptes utilisateurs, de profils et de CV. Elle expose une authentification par JWT, une persistance **PostgreSQL** via **Prisma 7**, et un endpoint de formulaire de contact par e-mail.

<p>
  <img alt="NestJS" src="https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white">
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white">
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white">
  <img alt="License" src="https://img.shields.io/badge/license-UNLICENSED-lightgrey">
</p>

---

## Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Base de données](#base-de-données)
- [Démarrage](#démarrage)
- [Scripts](#scripts)
- [Architecture](#architecture)
- [Modèle de données](#modèle-de-données)
- [Endpoints API](#endpoints-api)
- [Tests](#tests)
- [Déploiement](#déploiement)
- [Licence](#licence)

---

## Vue d'ensemble

| Élément | Détail |
|---|---|
| **Framework** | NestJS 11 (Express) |
| **Langage** | TypeScript 5.9 |
| **Base de données** | PostgreSQL |
| **ORM** | Prisma 7 (adaptateur `@prisma/adapter-pg`) |
| **Authentification** | JWT via Passport (`passport-jwt`) |
| **Hachage** | bcrypt |
| **Validation** | `class-validator` / `class-transformer` (requêtes) + `zod` (variables d'environnement) |
| **E-mail** | `@nestjs-modules/mailer` + Nodemailer (SMTP Gmail) |

### Fonctionnalités

- **Authentification** — inscription et connexion, émission d'un JWT (validité 1 h).
- **Compte** — récupération du compte connecté, mise à jour du profil et changement de mot de passe.
- **CV** — CRUD complet des CV rattachés à l'utilisateur, avec blocs structurés (expériences, formation, compétences, langues).
- **Contact** — envoi d'un e-mail de contact formaté en HTML à une adresse de destination configurée.

> **Note** — Certaines dépendances présentes dans `package.json` (Playwright, `pdf-parse`, SDK Anthropic, React Email) sont destinées à des fonctionnalités futures (export PDF, import de CV, assistance IA) et **ne sont pas encore branchées** dans le code de l'API.

---

## Prérequis

- **Node.js** 20 ou supérieur
- **npm** 9 ou supérieur
- **PostgreSQL** (instance locale ou hébergée : Neon, Supabase, Railway, etc.)

---

## Installation

```bash
# Cloner le dépôt
git clone <url-du-repo>
cd api-cv-builder

# Installer les dépendances
npm install
```

---

## Configuration

Créez un fichier `.env` à la racine du projet. Les variables sont **validées au démarrage** par un schéma Zod ([src/config/env.schema.ts](src/config/env.schema.ts)) — l'application refuse de démarrer si une variable requise est absente ou invalide.

| Variable | Requis | Description | Exemple |
|---|:---:|---|---|
| `DATABASE_URL` | ✅ | URL de connexion PostgreSQL | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `JWT_SECRET` | ✅ | Secret de signature des JWT (min. 16 caractères) | Chaîne longue et aléatoire |
| `MAIL_USER` | ✅ | Adresse Gmail utilisée pour l'envoi (SMTP) | `contact@gmail.com` |
| `MAIL_PASS` | ✅ | Mot de passe d'application Gmail | *(voir ci-dessous)* |
| `MAIL_TO` | ✅ | Adresse destinataire du formulaire de contact | `you@example.com` |
| `PORT` | ❌ | Port d'écoute (défaut : `3000`) | `3000` |
| `ANTHROPIC_API_KEY` | ❌ | Clé API Anthropic (fonctionnalités IA à venir) | `sk-ant-...` |

### Exemple de `.env`

```env
DATABASE_URL=postgresql://user:password@localhost:5432/cv_builder
JWT_SECRET=un_secret_long_et_aleatoire_de_16_caracteres_minimum
PORT=3000

# E-mail (formulaire de contact)
MAIL_USER=contact@gmail.com
MAIL_PASS=xxxx-xxxx-xxxx-xxxx
MAIL_TO=destinataire@example.com
```

### Configuration e-mail (Gmail)

L'envoi utilise le SMTP Gmail (`smtp.gmail.com:587`, configuré dans [src/mail/mail.module.ts](src/mail/mail.module.ts)). Gmail n'accepte pas le mot de passe de compte pour le SMTP : générez un **mot de passe d'application**.

1. Activez la **validation en deux étapes** sur votre compte Google.
2. Rendez-vous sur [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) et générez un mot de passe d'application.
3. Renseignez `MAIL_USER` (l'adresse Gmail) et `MAIL_PASS` (le mot de passe d'application généré).

---

## Base de données

Le client Prisma est généré dans `generated/prisma` (voir le bloc `generator` de [prisma/schema.prisma](prisma/schema.prisma)). La configuration de la datasource et des migrations se trouve dans [prisma.config.ts](prisma.config.ts).

```bash
# Générer le client Prisma
npx prisma generate

# Appliquer les migrations (production)
npx prisma migrate deploy

# Créer / appliquer une migration (développement)
npx prisma migrate dev

# Explorer la base avec Prisma Studio
npx prisma studio
```

---

## Démarrage

```bash
# Mode développement (rechargement à chaud)
npm run start:dev

# Mode production
npm run build
npm run start:prod
```

L'API écoute par défaut sur `http://localhost:3000`. Le CORS est activé pour toutes les origines avec support des cookies (adapter en production).

---

## Scripts

| Commande | Description |
|---|---|
| `npm run start` | Démarre l'application |
| `npm run start:dev` | Démarre en mode watch (rechargement à chaud) |
| `npm run start:debug` | Démarre en mode watch avec le débogueur Node |
| `npm run start:prod` | Exécute la build compilée (`node dist/main`) |
| `npm run build` | Compile le projet dans `dist/` |
| `npm run lint` | Lance ESLint avec correction automatique |
| `npm run format` | Formate le code avec Prettier |
| `npm run test` | Lance les tests unitaires (Jest) |
| `npm run test:watch` | Tests unitaires en mode watch |
| `npm run test:cov` | Tests avec rapport de couverture |
| `npm run test:e2e` | Tests end-to-end |

---

## Architecture

```
api-cv-builder/
├── prisma/
│   ├── schema.prisma        # Modèles de données
│   └── migrations/          # Migrations SQL
├── generated/
│   └── prisma/              # Client Prisma généré (ne pas éditer)
├── src/
│   ├── main.ts              # Point d'entrée : Express, CORS, ValidationPipe
│   ├── app.module.ts        # Module racine (validation env, imports)
│   ├── app.controller.ts    # Routes /me, /me/profile, /me/password
│   ├── config/
│   │   └── env.schema.ts     # Schéma Zod des variables d'environnement
│   ├── auth/                # Inscription, connexion, JWT, guard, stratégie
│   ├── cvs/                 # CRUD des CV
│   ├── users/               # Module utilisateurs
│   ├── mail/                # Formulaire de contact (POST /contact)
│   └── prisma/              # Module et service Prisma
├── test/                    # Tests end-to-end
├── prisma.config.ts
├── nest-cli.json
├── tsconfig.json
└── package.json
```

---

## Modèle de données

Défini dans [prisma/schema.prisma](prisma/schema.prisma).

### `User`
Compte utilisateur. Relation 1‑1 avec `Profile`, 1‑n avec `Cv`.

| Champ | Type | Détail |
|---|---|---|
| `id` | `String` | Identifiant (cuid) |
| `email` | `String` | Unique |
| `password` | `String` | Haché avec bcrypt |
| `createdAt` / `updatedAt` | `DateTime` | Horodatage |

### `Profile` (table `profiles`)

| Champ | Type | Détail |
|---|---|---|
| `userId` | `String` | Clé étrangère unique (cascade à la suppression) |
| `firstName` | `String?` | Prénom |
| `lastName` | `String?` | Nom |
| `avatarUrl` | `String?` | URL de l'avatar |

### `Cv` (table `cvs`)

| Champ | Type | Détail |
|---|---|---|
| `userId` | `String` | Propriétaire (cascade à la suppression) |
| `title` | `String` | Titre du CV (défaut `"Mon CV"`) |
| `template` | `String` | Modèle (défaut `"classic"`) |
| `accentColor` | `String` | Couleur d'accent (défaut `"#4F46E5"`) |
| `photoUrl` | `String?` | Photo |
| `fullName`, `jobTitle`, `email`, `phone`, `location`, `summary` | `String` | Champs texte de l'en-tête |
| `experiences`, `education`, `skills`, `languages` | `Json` | Blocs structurés (défaut `[]`) |
| `currentStep` | `Int` | Étape courante de l'assistant (défaut `1`) |
| `completed` | `Boolean` | CV finalisé (défaut `false`) |

---

## Endpoints API

Base URL par défaut : `http://localhost:3000`

### Authentification

| Méthode | Route | Auth | Description |
|---|---|:---:|---|
| `POST` | `/auth/register` | — | Inscription. Body : `email`, `password` (min. 8), `firstName`, `lastName`. Renvoie `access_token` + `user`. |
| `POST` | `/auth/login` | — | Connexion. Body : `email`, `password`. Renvoie `access_token` + `user`. |

### Compte utilisateur

| Méthode | Route | Auth | Description |
|---|---|:---:|---|
| `GET` | `/me` | JWT | Compte connecté et profil associé. |
| `PATCH` | `/me/profile` | JWT | Met à jour le profil. Body : `firstName?`, `lastName?`, `avatarUrl?`. |
| `PATCH` | `/me/password` | JWT | Change le mot de passe. Body : `newPassword`. |

### CV

| Méthode | Route | Auth | Description |
|---|---|:---:|---|
| `GET` | `/cvs` | JWT | Liste des CV de l'utilisateur (triés par date de mise à jour). |
| `GET` | `/cvs/:id` | JWT | Détail d'un CV. |
| `POST` | `/cvs` | JWT | Crée un CV. Body : `CreateCvDto` (`title` requis). |
| `PATCH` | `/cvs/:id` | JWT | Met à jour un CV. Body : `UpdateCvDto`. |
| `DELETE` | `/cvs/:id` | JWT | Supprime un CV. |

### Contact

| Méthode | Route | Auth | Description |
|---|---|:---:|---|
| `POST` | `/contact` | — | Envoie un e-mail de contact à `MAIL_TO`. Body : `name`, `email`, `message`. |

**Authentification** — les routes protégées attendent l'en-tête `Authorization: Bearer <access_token>`.

---

## Tests

```bash
npm run test        # tests unitaires
npm run test:cov    # avec couverture
npm run test:e2e    # tests end-to-end
```

Les tests unitaires reposent sur Jest (configuration dans [package.json](package.json)). Les tests end-to-end se trouvent dans [test/](test/) et utilisent `test/jest-e2e.json`.

---

## Déploiement

1. Provisionner une base PostgreSQL et définir l'ensemble des variables d'environnement requises sur la plateforme d'hébergement.
2. Installer les dépendances : `npm ci`.
3. Générer le client Prisma et appliquer les migrations : `npx prisma generate && npx prisma migrate deploy`.
4. Compiler : `npm run build`.
5. Lancer : `npm run start:prod`.

> En production, restreignez l'origine CORS (actuellement ouverte à toutes les origines dans [src/main.ts](src/main.ts)) au domaine de votre front-end.

---

## Licence

Projet privé — **UNLICENSED**. Voir [package.json](package.json).
