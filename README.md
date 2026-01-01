# Calendrier Couple

Un calendrier partagé moderne et élégant conçu spécialement pour les couples. Gérez vos événements, tâches et planning à deux en toute simplicité.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38B2AC?style=flat-square&logo=tailwind-css)

---

## Fonctionnalités

### Calendrier Multi-Vues
- **Vue Mois** : Grille classique avec aperçu des événements
- **Vue Semaine** : Timeline détaillée sur 7 jours (6h-22h)
- **Vue Jour** : Créneaux horaires de 30 minutes
- **Vue Année** : 12 mini-mois cliquables pour une vision globale
- Navigation fluide entre les dates et les vues
- Jour actuel surligné visuellement

### Gestion des Événements
- Création rapide avec titre, dates, lieu et description
- **8 couleurs personnalisables** pour catégoriser visuellement
- **Visibilité configurable** :
  - `Privé` - Invisible pour votre partenaire
  - `Partagé` - Visible avec tous les détails
  - `Occupé` - Visible comme "Occupé" sans détails
- **Récurrence avancée** : Quotidien, Hebdomadaire, Bi-hebdomadaire, Mensuel, Annuel, Jours ouvrés
- **Rappels configurables** : 5min, 15min, 30min, 1h, 2h, 1 jour, 2 jours, 1 semaine avant
- Catégories personnalisées avec couleurs
- Historique complet des modifications

### Système Partenaire
- Invitation par email avec lien sécurisé
- Liaison bidirectionnelle des comptes
- Affichage des événements partagés du partenaire
- Statut de disponibilité visible (Disponible, Occupé, Hors France, Ne pas déranger)
- Mode privé : maximum 2 utilisateurs

### To-Do Lists
- Listes personnelles et partagées
- **4 niveaux de priorité** : Basse, Moyenne, Haute, Urgente
- Date d'échéance avec indicateur de retard
- Assignation de tâches au partenaire
- Conversion de tâche en événement calendrier

### Notifications
- Notifications in-app en temps réel
- Badge compteur de non-lus
- Alertes pour événements, tâches et actions partenaire
- Notifications email configurables

### Paramètres Personnalisables
- **Profil** : Nom, prénom, avatar
- **Apparence** : Thème (Clair/Sombre/Système), couleurs, format de date/heure
- **Notifications** : Préférences email, push, rappels par défaut
- **Catégories** : Création, modification, suppression de catégories personnalisées

### Authentification Sécurisée
- Connexion Email / Mot de passe
- **Google OAuth** en un clic
- **Magic Links** par email
- Réinitialisation de mot de passe
- Vérification d'email
- Restriction par liste d'emails autorisés

---

## Stack Technique

### Frontend
- **Next.js 14** (App Router)
- **React 18** avec Server Components
- **TypeScript** pour la sécurité des types
- **TailwindCSS** pour le styling
- **shadcn/ui** pour les composants UI
- **React Query** (@tanstack/react-query) pour le cache et data fetching
- **React Hook Form** + **Zod** pour les formulaires
- **date-fns** pour la manipulation des dates
- **RRule** pour la récurrence des événements
- **Lucide React** pour les icônes

### Backend
- **Next.js API Routes**
- **Prisma ORM** avec PostgreSQL
- **NextAuth.js v5** pour l'authentification
- **Nodemailer** pour les emails SMTP
- **bcrypt** pour le hachage des mots de passe

---

## Installation

### Prérequis
- Node.js 18+
- PostgreSQL (ou compte [Neon](https://neon.tech))
- Compte Google Cloud (pour OAuth)
- Serveur SMTP (pour les emails)

### 1. Cloner le projet

```bash
git clone https://github.com/votre-username/shared-calendar.git
cd shared-calendar
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Créer un fichier `.env.local` :

```env
# Base de données
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-secret-genere"  # openssl rand -base64 32

# Google OAuth
GOOGLE_CLIENT_ID="votre-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-votre-secret"

# SMTP Email
SMTP_HOST="smtp.votre-provider.com"
SMTP_PORT="465"
SMTP_USER="votre-email@domaine.com"
SMTP_PASSWORD="votre-mot-de-passe"
SMTP_SECURE="true"
EMAIL_FROM="Calendrier Couple <noreply@votre-domaine.com>"

# Restriction d'accès (emails autorisés, séparés par des virgules)
ALLOWED_EMAILS="email1@example.com,email2@example.com"
MAX_USERS="2"
```

### 4. Initialiser la base de données

```bash
npx prisma db push
npx prisma generate
```

### 5. Lancer le serveur de développement

```bash
npm run dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000)

---

## Configuration Google OAuth

1. Aller sur [Google Cloud Console](https://console.cloud.google.com)
2. Créer un nouveau projet
3. Activer l'API Google+
4. Configurer l'écran de consentement OAuth
5. Créer des identifiants OAuth 2.0 :
   - **Origines autorisées** : `http://localhost:3000`
   - **URI de redirection** : `http://localhost:3000/api/auth/callback/google`
6. Copier le Client ID et Client Secret dans `.env.local`

Pour la production, ajouter également les URLs de votre domaine.

---

## Structure du Projet

```
src/
├── app/
│   ├── (auth)/              # Pages publiques (login, register, etc.)
│   ├── (dashboard)/         # Pages protégées
│   │   ├── calendar/        # Calendrier principal
│   │   ├── todos/           # Liste des tâches
│   │   └── settings/        # Paramètres utilisateur
│   └── api/                 # API Routes
│       ├── auth/            # Authentification
│       ├── events/          # CRUD événements
│       ├── todos/           # CRUD tâches
│       ├── categories/      # CRUD catégories
│       ├── notifications/   # Notifications
│       ├── partner/         # Système partenaire
│       └── user/            # Profil utilisateur
├── components/
│   ├── ui/                  # Composants shadcn/ui
│   ├── calendar/            # Vues du calendrier
│   ├── events/              # Formulaires événements
│   ├── todos/               # Composants tâches
│   ├── notifications/       # Notifications
│   ├── partner/             # Partenaire
│   ├── auth/                # Formulaires auth
│   ├── layout/              # Header, navigation
│   └── providers/           # Context providers
├── hooks/                   # Hooks React Query
├── lib/                     # Utilitaires (auth, prisma, mail, recurrence, etc.)
└── middleware.ts            # Protection des routes
```

---

## Scripts Disponibles

| Script | Description |
|--------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Lancer en production |
| `npm run lint` | Vérification ESLint |

| Prisma | Description |
|--------|-------------|
| `npx prisma studio` | Interface visuelle BDD |
| `npx prisma db push` | Synchroniser le schéma |
| `npx prisma generate` | Générer le client Prisma |

---

## Checklist Déploiement

### Variables d'environnement
```env
NEXTAUTH_URL="https://votre-domaine.com"
NEXTAUTH_SECRET="nouveau-secret-genere"
```

### Google OAuth Console
- [ ] Ajouter `https://votre-domaine.com` aux origines autorisées
- [ ] Ajouter `https://votre-domaine.com/api/auth/callback/google` aux URIs de redirection
- [ ] Passer l'app en mode "Production"

### Sécurité
- [ ] Générer un nouveau NEXTAUTH_SECRET (`openssl rand -base64 32`)
- [ ] Vérifier que `.env` est dans `.gitignore`
- [ ] DATABASE_URL avec SSL (`?sslmode=require`)

---

## Roadmap

### Synchronisation Google Calendar
- [ ] Connexion OAuth2 avec scopes Calendar
- [ ] Import des événements Google vers l'application
- [ ] Export des événements vers Google Calendar
- [ ] Synchronisation bidirectionnelle en temps réel

### Import Intelligent d'Événements
- [ ] Parser emails Doctolib (rendez-vous médicaux)
- [ ] Parser emails Nibelis (congés, absences professionnelles)
- [ ] Parser billets d'avion (emails des compagnies aériennes)
- [ ] Parser réservations (hôtels, restaurants, spectacles)
- [ ] Détection automatique via IA

### Autres Améliorations
- [ ] PWA (Progressive Web App)
- [ ] Notifications push navigateur
- [ ] Mode hors-ligne avec synchronisation
- [ ] Widget calendrier pour bureau
- [ ] Export ICS/iCal
- [ ] Partage de calendrier par lien

---

## Licence

Ce projet est privé et destiné à un usage personnel.

---

Développé avec Next.js, TypeScript et beaucoup de soin pour les couples organisés.
