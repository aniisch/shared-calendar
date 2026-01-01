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
13. [Roadmap Future](#roadmap-future)

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
| 10 | Paramètres | ✅ Complété |
| 11 | Optimisation & Finition | ✅ Complété |
| 12 | Déploiement | ⏳ À faire |

---

## Phase 1 : Initialisation ✅

### 1.1 Setup du Projet
- [x] Créer le projet Next.js 14 avec TypeScript
- [x] Configurer TailwindCSS
- [x] Ajouter le package.json avec toutes les dépendances
- [x] Configurer tsconfig.json
- [x] Configurer next.config.ts
- [x] Configurer tailwind.config.ts avec les couleurs custom
- [x] Créer postcss.config.mjs
- [x] Créer components.json pour shadcn/ui

### 1.2 Dépendances principales
- `next`, `react`, `react-dom` - Framework
- `next-auth`, `@auth/prisma-adapter` - Authentification
- `@prisma/client`, `prisma` - ORM
- `tailwindcss`, `tailwindcss-animate` - Styling
- `@radix-ui/*` - Composants headless
- `lucide-react` - Icônes
- `date-fns` - Manipulation dates
- `react-hook-form`, `zod` - Formulaires
- `nodemailer` - Emails
- `next-themes` - Thèmes dark/light
- `@tanstack/react-query` - Data fetching & caching
- `rrule` - Récurrence événements

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
│   ├── todos/            # Composants tâches
│   ├── notifications/    # Composants notifications
│   ├── partner/          # Composants partenaire
│   ├── auth/             # Composants auth
│   ├── layout/           # Header, etc.
│   └── providers/        # Context providers
├── hooks/                # Custom hooks React Query
├── lib/                  # Utilitaires
└── middleware.ts         # Protection routes
```

---

## Phase 2 : Authentification ✅

### 2.1 Configuration NextAuth v5
- [x] Provider Credentials (email/mot de passe)
- [x] Provider Google OAuth
- [x] Provider Magic Link (custom avec tokens)
- [x] JWT strategy avec session étendue
- [x] Prisma Adapter

### 2.2 Pages d'Authentification
- [x] `/login` - Page de connexion
- [x] `/register` - Page d'inscription
- [x] `/forgot-password` - Mot de passe oublié
- [x] `/reset-password` - Reset mot de passe
- [x] `/verify-email` - Vérification email

### 2.3 API Routes Auth
- [x] `/api/auth/[...nextauth]`
- [x] `/api/auth/register`
- [x] `/api/auth/magic-link`
- [x] `/api/auth/verify-email`
- [x] `/api/auth/forgot-password`
- [x] `/api/auth/reset-password`

### 2.4 Sécurité
- [x] Middleware de protection des routes
- [x] ALLOWED_EMAILS pour limiter les inscriptions
- [x] MAX_USERS = 2 pour mode couple privé
- [x] Hachage bcrypt des mots de passe
- [x] Tokens sécurisés avec expiration

---

## Phase 3 : Base de Données ✅

### 3.1 Modèles Prisma
- [x] `User` - Utilisateur avec relation partenaire self-referencing
- [x] `UserSettings` - Paramètres utilisateur
- [x] `Account` - Comptes OAuth (NextAuth)
- [x] `Session` - Sessions utilisateur
- [x] `Token` - Tokens custom (magic link, reset password)
- [x] `PartnerInvitation` - Invitations partenaire
- [x] `Event` - Événements calendrier avec récurrence
- [x] `Reminder` - Rappels d'événements
- [x] `Todo` - Tâches à faire
- [x] `Category` - Catégories personnalisées
- [x] `Notification` - Notifications in-app
- [x] `EventHistory` - Historique des modifications

### 3.2 Enums
- `UserStatus` - AVAILABLE, BUSY, OUT_OF_FRANCE, DO_NOT_DISTURB, OFFLINE
- `EventVisibility` - PRIVATE, SHARED, BUSY_ONLY
- `EventStatus` - BUSY, AVAILABLE, OUT_OF_FRANCE, TENTATIVE
- `TodoPriority` - LOW, MEDIUM, HIGH, URGENT
- `NotificationType` - EVENT_REMINDER, EVENT_CREATED, TODO_ASSIGNED, etc.

---

## Phase 4 : UI/UX de Base ✅

### 4.1 Composants Layout
- [x] Header responsive avec navigation
- [x] ThemeToggle (dark/light/system)
- [x] UserMenu avec dropdown
- [x] NotificationBell avec badge

### 4.2 Composants shadcn/ui
- button, card, input, label, separator
- dropdown-menu, avatar, dialog, select
- textarea, switch, popover, calendar
- alert-dialog, scroll-area, sonner (toasts)

### 4.3 Providers
- [x] ThemeProvider (next-themes)
- [x] SessionProvider (next-auth)
- [x] QueryProvider (react-query)

---

## Phase 5 : Calendrier ✅

### 5.1 Vues Calendrier
- [x] `MonthView` - Grille 6x7 avec événements
- [x] `WeekView` - Timeline 7 jours avec créneaux
- [x] `DayView` - Créneaux horaires 30min
- [x] `YearView` - 12 mini-mois cliquables

### 5.2 Fonctionnalités
- [x] Navigation entre dates
- [x] Bouton "Aujourd'hui"
- [x] Jour actuel surligné
- [x] Navigation entre vues
- [x] Locale française

---

## Phase 6 : Gestion des Événements ✅

### 6.1 API Events
- [x] `GET /api/events` - Liste avec filtres (view, date, includePartner)
- [x] `POST /api/events` - Créer événement
- [x] `GET /api/events/[id]` - Détails
- [x] `PUT /api/events/[id]` - Modifier
- [x] `DELETE /api/events/[id]` - Supprimer
- [x] `GET/PUT /api/events/[id]/reminders` - Rappels

### 6.2 Fonctionnalités
- [x] Formulaire complet (titre, dates, lieu, description)
- [x] Sélecteur de couleurs (8 choix)
- [x] Catégories personnalisées
- [x] Visibilité (Privé/Partagé/Occupé)
- [x] Récurrence (quotidien, hebdo, mensuel, annuel)
- [x] Rappels configurables
- [x] Historique des modifications

---

## Phase 7 : To-Do Lists ✅

### 7.1 API Todos
- [x] `GET /api/todos` - Liste (filter, shared, priority)
- [x] `POST /api/todos` - Créer
- [x] `PUT /api/todos/[id]` - Modifier
- [x] `DELETE /api/todos/[id]` - Supprimer
- [x] `PATCH /api/todos/[id]` - Toggle completion
- [x] `POST /api/todos/[id]/convert` - Convertir en événement

### 7.2 Fonctionnalités
- [x] Priorités (LOW, MEDIUM, HIGH, URGENT)
- [x] Date d'échéance avec indicateur retard
- [x] Partage avec partenaire
- [x] Assignation au partenaire
- [x] Conversion todo → événement

---

## Phase 8 : Système Partenaire ✅

### 8.1 API Partner
- [x] `GET /api/partner` - Info partenaire + invitations
- [x] `POST /api/partner/invite` - Envoyer invitation
- [x] `DELETE /api/partner/invite` - Annuler invitation
- [x] `GET /api/partner/invite/[token]` - Détails invitation
- [x] `POST /api/partner/accept` - Accepter invitation
- [x] `POST /api/partner/decline` - Refuser invitation
- [x] `DELETE /api/partner/unlink` - Dissocier partenaire

### 8.2 Fonctionnalités
- [x] Invitation par email
- [x] Page d'acceptation publique
- [x] Liaison bidirectionnelle des comptes
- [x] Affichage statut partenaire (icône coeur)
- [x] Email de notification

---

## Phase 9 : Notifications ✅

### 9.1 API Notifications
- [x] `GET /api/notifications` - Liste (limit, unread)
- [x] `PATCH /api/notifications` - Marquer comme lu
- [x] `DELETE /api/notifications` - Supprimer

### 9.2 Types de Notifications
- EVENT_CREATED, EVENT_UPDATED, EVENT_DELETED
- TODO_ASSIGNED, TODO_COMPLETED
- PARTNER_INVITATION, PARTNER_ACCEPTED

### 9.3 Fonctionnalités
- [x] Badge compteur non-lus
- [x] Dropdown avec liste des notifications
- [x] Marquer tout comme lu
- [x] Notifications automatiques

---

## Phase 10 : Paramètres ✅

### 10.1 Pages Settings
- [x] `/settings/profile` - Nom, prénom, avatar
- [x] `/settings/appearance` - Thème, couleurs, formats date/heure
- [x] `/settings/notifications` - Préférences email, push, rappels
- [x] `/settings/categories` - Gestion catégories personnalisées
- [x] `/settings/partner` - Gestion partenaire

### 10.2 API User
- [x] `GET/PUT /api/user/profile`
- [x] `GET/PUT /api/user/settings`
- [x] `GET/PUT/DELETE /api/categories/[id]`

---

## Phase 11 : Optimisation & Finition ✅

### 11.1 React Query
- [x] QueryProvider configuré
- [x] Hooks personnalisés (useEvents, useTodos)
- [x] Cache automatique (1 minute staleTime)
- [x] Invalidation automatique après mutations

### 11.2 Composants Partagés
- [x] LoadingSpinner, PageLoader, InlineLoader
- [x] EmptyState (events, todos, notifications)
- [x] ErrorBoundary, ErrorDisplay

### 11.3 Récurrence & Rappels
- [x] Bibliothèque RRule pour récurrence
- [x] Presets (quotidien, hebdo, mensuel, annuel, jours ouvrés)
- [x] Date de fin optionnelle
- [x] Expansion des occurrences dans l'API
- [x] Rappels configurables par événement

---

## Phase 12 : Déploiement ⏳

### 12.1 Checklist pré-déploiement
- [ ] Variables d'environnement configurées
- [ ] Base de données PostgreSQL prête
- [ ] Google OAuth configuré avec URLs de prod
- [ ] SMTP fonctionnel
- [ ] Build sans erreurs (`npm run build`)

### 12.2 Variables Production
```env
NEXTAUTH_URL="https://ton-domaine.com"
NEXTAUTH_SECRET="nouveau-secret-genere"
DATABASE_URL="postgresql://..."
```

### 12.3 Google OAuth Console
- Ajouter domaine aux origines autorisées
- Ajouter callback URL
- Passer en mode "Production"

---

## Roadmap Future

### Synchronisation Google Calendar
- [ ] Connexion OAuth2 avec scopes Calendar
- [ ] Import des événements Google → App
- [ ] Export des événements App → Google
- [ ] Synchronisation bidirectionnelle en temps réel

### Import Intelligent d'Événements
- [ ] Parser emails Doctolib (RDV médicaux)
- [ ] Parser emails Nibelis (congés, absences)
- [ ] Parser billets d'avion (emails compagnies)
- [ ] Parser réservations (hôtels, restaurants)
- [ ] Détection automatique via IA

### Autres Améliorations
- [ ] PWA (Progressive Web App)
- [ ] Notifications push navigateur
- [ ] Mode hors-ligne
- [ ] Widget calendrier
- [ ] Export ICS/iCal

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

*Dernière mise à jour : 01 Janvier 2026*
