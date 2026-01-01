# DEVBOOK - Calendrier Couple

Guide de développement complet avec toutes les étapes d'implémentation.

---

## Table des Matières

1. [Phase 1 : Initialisation](#phase-1--initialisation)
2. [Phase 2 : Authentification](#phase-2--authentification)
3. [Phase 3 : Base de Données](#phase-3--base-de-données)
4. [Phase 4 : UI/UX de Base](#phase-4--uiux-de-base)
5. [Phase 5 : Calendrier](#phase-5--calendrier)
6. [Phase 6 : Gestion des Événements](#phase-6--gestion-des-événements)
7. [Phase 7 : To-Do Lists](#phase-7--to-do-lists)
8. [Phase 8 : Système Partenaire](#phase-8--système-partenaire)
9. [Phase 9 : Notifications](#phase-9--notifications)
10. [Phase 10 : Paramètres](#phase-10--paramètres)
11. [Phase 11 : Optimisation & Finition](#phase-11--optimisation--finition)
12. [Phase 12 : Déploiement](#phase-12--déploiement)

---

## État d'Avancement Global

| Phase | Description | Statut |
|-------|-------------|--------|
| 1 | Initialisation | ✅ Complété |
| 2 | Authentification | ✅ Complété |
| 3 | Base de Données | ✅ Complété |
| 4 | UI/UX de Base | ✅ Complété |
| 5 | Calendrier | ✅ Complété |
| 6 | Gestion des Événements | ✅ Complété |
| 7 | To-Do Lists | ✅ Complété |
| 8 | Système Partenaire | ✅ Complété |
| 9 | Notifications | ✅ Complété |
| 10 | Paramètres | ⏳ À faire |
| 11 | Optimisation & Finition | ⏳ À faire |
| 12 | Déploiement | ⏳ À faire |

---

## 🧪 À TESTER MAINTENANT

```bash
npm run dev
```

### Checklist de test :

#### 1. Authentification
- [ ] Aller sur http://localhost:3000/login
- [ ] Se connecter avec Google
- [ ] Vérifier la redirection vers /calendar
- [ ] Tester le menu utilisateur (en haut à droite)
- [ ] Tester la déconnexion

#### 2. Calendrier - Navigation
- [ ] Vue Mois s'affiche par défaut
- [ ] Cliquer "Semaine" → vue semaine
- [ ] Cliquer "Jour" → vue jour
- [ ] Cliquer "Année" → vue année
- [ ] Flèches < > pour naviguer
- [ ] Bouton "Aujourd'hui"

#### 3. Événements - CRUD
- [ ] Cliquer "+ Événement" → modal s'ouvre
- [ ] Créer un événement avec titre, dates, couleur
- [ ] Vérifier qu'il apparaît sur le calendrier
- [ ] Cliquer sur l'événement → modifier
- [ ] Supprimer l'événement (bouton rouge)

#### 4. Thème
- [ ] Cliquer sur l'icône soleil/lune
- [ ] Tester Light / Dark / System

#### 5. Tâches (Todos)
- [ ] Cliquer sur "Tâches" dans le menu
- [ ] Créer une tâche personnelle
- [ ] Modifier une tâche
- [ ] Cocher/décocher une tâche
- [ ] Filtrer par statut (Toutes/En cours/Terminées)
- [ ] Basculer vers "Partagées"
- [ ] Convertir une tâche en événement
- [ ] Supprimer une tâche

#### 6. Partenaire
- [ ] Cliquer sur l'icône coeur dans le header
- [ ] Envoyer une invitation (email du partenaire)
- [ ] Vérifier l'email reçu
- [ ] Accepter l'invitation (depuis le lien email)
- [ ] Vérifier que le coeur devient rose plein
- [ ] Voir les infos partenaire dans /settings/partner

---

## Phase 1 : Initialisation ✅

### 1.1 Setup du Projet
- [x] Créer le projet Next.js avec TypeScript
- [x] Configurer TailwindCSS
- [x] Ajouter le package.json avec toutes les dépendances
- [x] Configurer tsconfig.json
- [x] Configurer next.config.ts
- [x] Configurer tailwind.config.ts avec les couleurs custom
- [x] Créer postcss.config.mjs
- [x] Créer components.json pour shadcn/ui

### 1.2 Installation des Dépendances
```bash
npm install
```

**Dépendances principales :**
- `next`, `react`, `react-dom` - Framework
- `next-auth`, `@auth/prisma-adapter` - Authentification
- `@prisma/client`, `prisma` - ORM
- `tailwindcss`, `tailwindcss-animate` - Styling
- `@radix-ui/*` - Composants headless
- `lucide-react` - Icônes
- `date-fns`, `date-fns-tz` - Manipulation dates
- `react-hook-form`, `zod` - Formulaires
- `nodemailer` - Emails
- `next-themes` - Thèmes dark/light
- `sonner` - Toasts

### 1.3 Structure des Dossiers
```
src/
├── app/
│   ├── (auth)/           # Routes publiques auth
│   ├── (dashboard)/      # Routes protégées
│   └── api/              # API Routes
├── components/
│   ├── ui/               # shadcn/ui
│   ├── calendar/         # Composants calendrier
│   ├── events/           # Composants événements
│   ├── auth/             # Composants auth
│   ├── layout/           # Header, etc.
│   └── providers/        # Context providers
├── lib/                  # Utilitaires
└── middleware.ts         # Protection routes
```

### 1.4 Fichiers de Configuration
- [x] `.env.example` - Template variables d'environnement
- [x] `.gitignore` - Fichiers à ignorer
- [x] `.eslintrc.json` - Configuration ESLint

---

## Phase 2 : Authentification ✅

### 2.1 Configuration NextAuth v5
- [x] Créer `src/lib/auth.ts` avec config NextAuth
- [x] Provider Credentials (email/mot de passe)
- [x] Provider Google OAuth
- [x] Provider Magic Link (custom avec tokens)
- [x] JWT strategy avec session étendue

### 2.2 Pages d'Authentification
- [x] `/login` - Page de connexion
- [x] `/register` - Page d'inscription
- [x] `/forgot-password` - Mot de passe oublié
- [x] `/reset-password` - Reset mot de passe
- [x] `/verify-email` - Vérification email

### 2.3 API Routes Auth
- [x] `src/app/api/auth/[...nextauth]/route.ts`
- [x] `src/app/api/auth/register/route.ts`
- [x] `src/app/api/auth/magic-link/route.ts`
- [x] `src/app/api/auth/verify-email/route.ts`
- [x] `src/app/api/auth/forgot-password/route.ts`
- [x] `src/app/api/auth/reset-password/route.ts`

### 2.4 Middleware de Protection
- [x] Créer `src/middleware.ts`
- [x] Redirection automatique /login si non connecté
- [x] Redirection /calendar si déjà connecté sur pages auth

### 2.5 Service Email
- [x] Créer `src/lib/mail.ts` avec Nodemailer
- [x] Configuration SMTP Hostinger
- [x] Templates emails HTML (magic link, reset password, verification)

### 2.6 Restrictions d'Accès
- [x] ALLOWED_EMAILS pour limiter les inscriptions
- [x] MAX_USERS = 2 pour mode couple privé

---

## Phase 3 : Base de Données ✅

### 3.1 Schema Prisma
- [x] Créer `prisma/schema.prisma` complet

### 3.2 Modèles Créés
- [x] `User` - Utilisateur avec relation partenaire self-referencing
- [x] `UserSettings` - Paramètres utilisateur
- [x] `Account` - Comptes OAuth (NextAuth)
- [x] `Session` - Sessions utilisateur (NextAuth)
- [x] `VerificationToken` - Tokens NextAuth
- [x] `Token` - Tokens custom (magic link, reset password)
- [x] `PartnerInvitation` - Invitations partenaire
- [x] `Event` - Événements calendrier
- [x] `Reminder` - Rappels d'événements
- [x] `Todo` - Tâches à faire
- [x] `Category` - Catégories personnalisées
- [x] `Notification` - Notifications in-app
- [x] `EventHistory` - Historique des modifications

### 3.3 Enums
- [x] `UserStatus` - AVAILABLE, BUSY, OUT_OF_FRANCE, DO_NOT_DISTURB, OFFLINE
- [x] `Theme` - LIGHT, DARK, SYSTEM
- [x] `CalendarView` - DAY, WEEK, MONTH, YEAR
- [x] `EventVisibility` - PRIVATE, SHARED, BUSY_ONLY
- [x] `EventStatus` - BUSY, AVAILABLE, OUT_OF_FRANCE, TENTATIVE
- [x] `TodoPriority` - LOW, MEDIUM, HIGH, URGENT
- [x] `NotificationType` - EVENT_REMINDER, EVENT_CREATED, etc.

### 3.4 Configuration
- [x] Créer `src/lib/prisma.ts` (singleton)
- [x] Exécuter `npx prisma generate`
- [x] Exécuter `npx prisma db push`
- [x] Catégories par défaut créées à l'inscription (dans auth.ts)

---

## Phase 4 : UI/UX de Base ✅

### 4.1 Layout Dashboard
- [x] Créer `src/app/(dashboard)/layout.tsx`
- [x] Structure avec Header responsive

### 4.2 Composants Layout
- [x] `Header.tsx` - Navigation principale, user menu, notifications placeholder
- [x] `ThemeToggle.tsx` - Bouton dark/light/system mode
- [x] `UserMenu.tsx` - Dropdown utilisateur avec avatar

### 4.3 Composants shadcn/ui Installés
- [x] button, card, input, label, separator
- [x] dropdown-menu, avatar
- [x] dialog, select, textarea, switch
- [x] popover, calendar (date picker)
- [x] sonner (toasts)

### 4.4 Theme Provider
- [x] `src/components/providers/theme-provider.tsx`
- [x] Integration next-themes

---

## Phase 5 : Calendrier ✅

### 5.1 Container Principal
- [x] `CalendarView.tsx` - Container avec state management
- [x] State: currentDate, view (month/week/day/year)
- [x] Navigation: goToToday, goToPrevious, goToNext
- [x] Sélecteur de vue

### 5.2 Vues Calendrier
- [x] `MonthView.tsx` - Grille 6x7 avec vraies dates
- [x] `WeekView.tsx` - Timeline 7 jours avec créneaux 6h-22h
- [x] `DayView.tsx` - Créneaux horaires 30min, 0h-23h
- [x] `YearView.tsx` - 12 mini-mois cliquables

### 5.3 Fonctionnalités
- [x] Navigation entre dates (flèches < >)
- [x] Bouton "Aujourd'hui"
- [x] Jour actuel surligné (cercle bleu)
- [x] Navigation entre vues (clic jour → vue jour)
- [x] Locale française (date-fns/locale/fr)

### 5.4 Index des Exports
- [x] `src/components/calendar/index.ts`

---

## Phase 6 : Gestion des Événements ✅

### 6.1 API Events
- [x] `GET /api/events` - Liste événements (filtres: view, date, includePartner)
- [x] `POST /api/events` - Créer événement
- [x] `GET /api/events/[id]` - Détails événement
- [x] `PUT /api/events/[id]` - Modifier événement
- [x] `DELETE /api/events/[id]` - Supprimer événement

### 6.2 API Categories
- [x] `GET /api/categories` - Liste catégories
- [x] `POST /api/categories` - Créer catégorie

### 6.3 Composants Events
- [x] `EventForm.tsx` - Modal formulaire création/édition
  - Titre, description, lieu
  - Sélecteur de dates avec calendrier
  - Heures début/fin
  - Toggle "Journée entière"
  - Visibilité (Privé/Partagé/Occupé)
  - Statut (Occupé/Disponible/Provisoire/Absent)
  - Sélection catégorie
  - Palette de couleurs (8 choix)
  - Bouton supprimer (mode édition)
- [x] `EventCard.tsx` - Affichage compact d'un événement
- [x] `EventList.tsx` - Liste d'événements dans une cellule

### 6.4 Intégration Calendrier
- [x] MonthView affiche les événements avec EventList
- [x] WeekView affiche les événements + barre "Journée entière"
- [x] DayView affiche les événements avec durée proportionnelle

### 6.5 Logique de Visibilité
- [x] PRIVATE : Invisible pour le partenaire
- [x] SHARED : Visible avec tous les détails
- [x] BUSY_ONLY : Visible comme "Occupé(e)" sans détails

### 6.6 Historique
- [x] EventHistory créé à chaque création/modification

### 6.7 À faire plus tard (Phase 11)
- [ ] Récurrence (quotidien, hebdo, mensuel, annuel)
- [ ] Rappels

---

## Phase 7 : To-Do Lists ✅

### 7.1 API Todos
| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/todos` | GET | Liste todos (filter: all/active/completed, shared) |
| `/api/todos` | POST | Créer todo |
| `/api/todos/[id]` | GET | Détails todo |
| `/api/todos/[id]` | PUT | Modifier todo |
| `/api/todos/[id]` | DELETE | Supprimer todo |
| `/api/todos/[id]` | PATCH | Toggle completion |
| `/api/todos/[id]/convert` | POST | Convertir en événement |

### 7.2 Composants Todos
- [x] `TodoItem.tsx` - Affichage todo avec checkbox, priorité, actions
- [x] `TodoForm.tsx` - Modal formulaire création/édition
- [x] `index.ts` - Exports

### 7.3 Page Todos
- [x] `/todos` - Page principale avec onglets (Personnelles/Partagées)
- [x] Filtres (Toutes/En cours/Terminées)
- [x] Actions: créer, modifier, supprimer, toggle completion
- [x] Conversion todo → événement calendrier

### 7.4 Fonctionnalités
- [x] Priorités : LOW (gris), MEDIUM (bleu), HIGH (orange), URGENT (rouge)
- [x] Date d'échéance avec indicateur retard
- [x] Catégories avec couleurs
- [x] Partage avec partenaire
- [x] Assignation au partenaire
- [x] Navigation dans le Header

---

## Phase 8 : Système Partenaire ✅

### 8.1 API Partner
| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/partner` | GET | Info partenaire + invitations |
| `/api/partner/invite` | POST | Envoyer invitation |
| `/api/partner/invite` | DELETE | Annuler invitation |
| `/api/partner/invite/[token]` | GET | Détails invitation |
| `/api/partner/accept` | POST | Accepter invitation |
| `/api/partner/decline` | POST | Refuser invitation |
| `/api/partner/unlink` | DELETE | Dissocier partenaire |

### 8.2 Checklist Phase 8
- [x] Créer `src/app/api/partner/route.ts`
- [x] Créer `src/app/api/partner/invite/route.ts`
- [x] Créer `src/app/api/partner/invite/[token]/route.ts`
- [x] Créer `src/app/api/partner/accept/route.ts`
- [x] Créer `src/app/api/partner/decline/route.ts`
- [x] Créer `src/app/api/partner/unlink/route.ts`
- [x] Créer page `/partner/invite/[token]` (acceptation publique)
- [x] Créer page `/settings/partner` (gestion partenaire)
- [x] Créer `PartnerCard.tsx` (affichage partenaire)
- [x] Créer `PartnerInviteForm.tsx` (formulaire invitation)
- [x] Template email d'invitation (déjà dans mail.ts)
- [x] Icône partenaire dans le Header (coeur rose)

---

## Phase 9 : Notifications ✅

### 9.1 Types de Notifications
| Type | Trigger | Message |
|------|---------|---------|
| `EVENT_CREATED` | Partenaire crée event partagé | "{partner} a créé {title}" |
| `EVENT_UPDATED` | Partenaire modifie event | "{partner} a modifié {title}" |
| `EVENT_DELETED` | Partenaire supprime event | "{partner} a supprimé {title}" |
| `TODO_ASSIGNED` | Partenaire assigne todo | "{partner} vous a assigné {title}" |
| `TODO_COMPLETED` | Partenaire termine todo | "{partner} a terminé {title}" |
| `PARTNER_INVITATION` | Invitation reçue | "{name} vous invite" |
| `PARTNER_ACCEPTED` | Invitation acceptée | "{partner} a accepté" |

### 9.2 API Notifications
| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/notifications` | GET | Liste notifications (limit, unread) |
| `/api/notifications` | PATCH | Marquer comme lu (ids, markAllRead) |
| `/api/notifications` | DELETE | Supprimer (id, clearAll) |

### 9.3 Checklist Phase 9
- [x] Créer `src/app/api/notifications/route.ts`
- [x] Créer `src/lib/notifications.ts` (fonctions helper)
- [x] Créer `NotificationBell.tsx` (dropdown avec badge)
- [x] Intégrer dans le Header
- [x] Notifications automatiques événements (create/update/delete)
- [x] Notifications automatiques todos (assign/complete)

---

## Phase 10 : Paramètres ⏳

### 10.1 Pages Settings
```
/settings
├── /profile        # Nom, avatar
├── /appearance     # Thème, couleurs, formats
├── /notifications  # Préférences notifications
└── /categories     # Gestion catégories
```

### 10.2 Checklist Phase 10
- [ ] Créer `src/app/api/user/settings/route.ts`
- [ ] Créer `src/app/(dashboard)/settings/page.tsx`
- [ ] Créer `ProfileForm.tsx`
- [ ] Créer `AppearanceSettings.tsx`
- [ ] Créer `CategoryManager.tsx`

---

## Phase 11 : Optimisation & Finition ⏳

### 11.1 Checklist Phase 11
- [ ] Configurer React Query cache
- [ ] Implémenter lazy loading
- [ ] Ajouter la pagination
- [ ] Récurrence événements
- [ ] Rappels événements
- [ ] Error boundaries
- [ ] Tests

---

## Phase 12 : Déploiement ⏳

### 12.1 Checklist pré-déploiement
- [ ] Variables d'environnement configurées
- [ ] Base de données PostgreSQL prête
- [ ] Google OAuth configuré avec URLs de prod
- [ ] SMTP fonctionnel
- [ ] Build sans erreurs (`npm run build`)

### 12.2 Notes Production

**Variables à changer :**
```env
NEXTAUTH_URL="https://ton-domaine.com"
NEXTAUTH_SECRET="nouveau-secret-genere"
```

**Google OAuth Console :**
- Ajouter `https://ton-domaine.com` aux origines autorisées
- Ajouter `https://ton-domaine.com/api/auth/callback/google` aux URIs de redirection
- Passer en mode "Production"

---

## Commandes Utiles

```bash
# Développement
npm run dev                    # Lancer le serveur dev

# Build
npm run build                  # Build production
npm run start                  # Lancer en production

# Base de données
npx prisma studio              # Interface visuelle BDD
npx prisma db push             # Sync schema → BDD
npx prisma generate            # Générer client Prisma

# Composants UI
npx shadcn@latest add [name]   # Ajouter composant shadcn
```

---

## Configuration Actuelle (Dev)

```env
DATABASE_URL="postgresql://neondb_owner:...@neon.tech/neondb?sslmode=require"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="991484520280-..."
GOOGLE_CLIENT_SECRET="GOCSPX-..."
ALLOWED_EMAILS="anischaarana@gmail.com,partener@gmail.com"
SMTP_HOST="smtp.hostinger.com"
SMTP_PORT="465"
SMTP_USER="noreplay@anis-chaarana.fr"
SMTP_SECURE="true"
EMAIL_FROM="Calendrier Couple <noreplay@anis-chaarana.fr>"
```

---

*Dernière mise à jour : 01 Janvier 2026*
