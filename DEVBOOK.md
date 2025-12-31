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

## Phase 1 : Initialisation

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
- `@dnd-kit/*` - Drag & drop
- `react-hook-form`, `zod` - Formulaires
- `zustand`, `@tanstack/react-query` - State management
- `nodemailer` - Emails
- `ical-generator`, `ical.js`, `rrule` - Calendrier
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
│   ├── todos/            # Composants todos
│   ├── auth/             # Composants auth
│   ├── partner/          # Composants partenaire
│   ├── layout/           # Header, Sidebar...
│   ├── providers/        # Context providers
│   └── shared/           # Composants réutilisables
├── lib/                  # Utilitaires
├── hooks/                # Custom hooks
├── stores/               # Zustand stores
├── types/                # Types TypeScript
└── services/             # Logique métier
```

### 1.4 Fichiers de Configuration
- [x] `.env.example` - Template variables d'environnement
- [x] `.gitignore` - Fichiers à ignorer
- [x] `.eslintrc.json` - Configuration ESLint

---

## Phase 2 : Authentification

### 2.1 Configuration NextAuth v5

**Fichier : `src/lib/auth.ts`**
```typescript
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({...}),
    CredentialsProvider({...}),
    EmailProvider({...}),
  ],
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
    verifyRequest: "/verify-email",
  },
  callbacks: {
    jwt({ token, user }) {...},
    session({ session, token }) {...},
  },
});
```

### 2.2 Pages d'Authentification

| Route | Description | Composants |
|-------|-------------|------------|
| `/login` | Page de connexion | LoginForm, OAuthButtons, MagicLinkForm |
| `/register` | Page d'inscription | RegisterForm, OAuthButtons |
| `/forgot-password` | Mot de passe oublié | ForgotPasswordForm |
| `/reset-password` | Reset mot de passe | ResetPasswordForm |
| `/verify-email` | Vérification email | VerifyEmailPage |

### 2.3 Middleware de Protection

**Fichier : `src/middleware.ts`**
```typescript
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith("/login") || ...;

  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/calendar", req.url));
  }

  return NextResponse.next();
});
```

### 2.4 Service Email

**Fichier : `src/lib/mail.ts`**
```typescript
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendMagicLink(email: string, token: string) {...}
export async function sendPasswordReset(email: string, token: string) {...}
export async function sendPartnerInvitation(email: string, senderName: string, token: string) {...}
```

### 2.5 Checklist Phase 2
- [ ] Créer `src/lib/auth.ts` avec NextAuth config
- [ ] Créer `src/app/api/auth/[...nextauth]/route.ts`
- [ ] Créer `src/app/api/auth/register/route.ts`
- [ ] Créer les pages (auth) : login, register, forgot-password, reset-password
- [ ] Créer les composants auth : LoginForm, RegisterForm, etc.
- [ ] Créer `src/middleware.ts`
- [ ] Créer `src/lib/mail.ts` avec Nodemailer
- [ ] Tester le flow complet d'authentification

---

## Phase 3 : Base de Données

### 3.1 Schema Prisma

**Modèles principaux :**

| Modèle | Description |
|--------|-------------|
| `User` | Utilisateur avec relation partenaire self-referencing |
| `UserSettings` | Paramètres utilisateur (thème, notifications...) |
| `Account` | Comptes OAuth (NextAuth) |
| `Session` | Sessions utilisateur (NextAuth) |
| `Token` | Tokens magic link / reset password |
| `PartnerInvitation` | Invitations partenaire |
| `Event` | Événements calendrier |
| `Reminder` | Rappels d'événements |
| `Todo` | Tâches à faire |
| `Category` | Catégories personnalisées |
| `Notification` | Notifications in-app |
| `EventHistory` | Historique des modifications |

### 3.2 Enums

```prisma
enum UserStatus { AVAILABLE, BUSY, OUT_OF_FRANCE, DO_NOT_DISTURB, OFFLINE }
enum Theme { LIGHT, DARK, SYSTEM }
enum CalendarView { DAY, WEEK, MONTH, YEAR }
enum TimeFormat { H12, H24 }
enum TokenType { MAGIC_LINK, PASSWORD_RESET, EMAIL_VERIFICATION }
enum InvitationStatus { PENDING, ACCEPTED, DECLINED, EXPIRED, CANCELLED }
enum EventVisibility { PRIVATE, SHARED, BUSY_ONLY }
enum EventStatus { BUSY, AVAILABLE, OUT_OF_FRANCE, TENTATIVE }
enum ReminderType { NOTIFICATION, EMAIL, BOTH }
enum TodoPriority { LOW, MEDIUM, HIGH, URGENT }
enum NotificationType { EVENT_REMINDER, EVENT_CREATED, ... }
enum HistoryAction { CREATED, UPDATED, DELETED, VISIBILITY_CHANGED, MOVED }
```

### 3.3 Relations Importantes

**Relation Couple (self-referencing) :**
```prisma
model User {
  partnerId      String?   @unique
  partner        User?     @relation("CouplePartnership", fields: [partnerId], references: [id])
  partnerOf      User?     @relation("CouplePartnership")
}
```

**Visibilité des Événements :**
- `PRIVATE` : Invisible pour le partenaire
- `SHARED` : Visible avec tous les détails
- `BUSY_ONLY` : Visible comme "Occupé" sans détails

### 3.4 Seed Data

**Fichier : `prisma/seed.ts`**
```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Créer catégories par défaut
  const defaultCategories = [
    { name: "Travail", color: "#3b82f6", icon: "briefcase", isSystem: true },
    { name: "Personnel", color: "#22c55e", icon: "user", isSystem: true },
    { name: "Couple", color: "#ec4899", icon: "heart", isSystem: true },
    { name: "Santé", color: "#ef4444", icon: "heart-pulse", isSystem: true },
    { name: "Loisirs", color: "#f59e0b", icon: "gamepad", isSystem: true },
  ];

  // ...
}
```

### 3.5 Checklist Phase 3
- [x] Créer `prisma/schema.prisma` complet
- [x] Créer `src/lib/prisma.ts` (singleton)
- [ ] Exécuter `npm run db:generate`
- [ ] Exécuter `npm run db:push` ou `npm run db:migrate`
- [ ] Créer `prisma/seed.ts`
- [ ] Exécuter `npm run db:seed`

---

## Phase 4 : UI/UX de Base

### 4.1 Layout Principal

**Structure du Dashboard :**
```
┌─────────────────────────────────────────────────┐
│  Header (Logo, Nav, Partner, Notifs, User)      │
├─────────────┬───────────────────────────────────┤
│  Sidebar    │                                   │
│  - Mini Cal │         Main Content              │
│  - Actions  │         (Calendar/Todos/...)      │
│  - Partner  │                                   │
│  - Cats     │                                   │
└─────────────┴───────────────────────────────────┘
```

### 4.2 Composants shadcn/ui à Installer

```bash
npx shadcn@latest add button card dialog dropdown-menu form input label \
  popover select separator tabs toast avatar badge checkbox switch tooltip \
  calendar skeleton progress accordion alert-dialog
```

### 4.3 Composants Layout

| Composant | Description |
|-----------|-------------|
| `Header` | Navigation principale, user menu, notifications |
| `Sidebar` | Mini-calendrier, quick actions, catégories |
| `MobileNav` | Navigation mobile (bottom tabs) |
| `ThemeToggle` | Bouton dark/light mode |
| `UserMenu` | Dropdown utilisateur |
| `NotificationBell` | Icône + badge + dropdown notifications |

### 4.4 Composants Partagés

| Composant | Description |
|-----------|-------------|
| `LoadingSpinner` | Indicateur de chargement |
| `EmptyState` | État vide avec illustration |
| `ErrorBoundary` | Gestion des erreurs React |
| `ConfirmDialog` | Dialog de confirmation |
| `DatePicker` | Sélecteur de date |
| `TimePicker` | Sélecteur d'heure |
| `ColorPicker` | Sélecteur de couleur |

### 4.5 Checklist Phase 4
- [ ] Installer les composants shadcn/ui
- [ ] Créer `src/app/(dashboard)/layout.tsx`
- [ ] Créer `Header.tsx` avec navigation
- [ ] Créer `Sidebar.tsx` avec mini-calendrier
- [ ] Créer `ThemeToggle.tsx`
- [ ] Créer `UserMenu.tsx`
- [ ] Créer `MobileNav.tsx`
- [ ] Créer les composants partagés
- [ ] Tester le responsive

---

## Phase 5 : Calendrier

### 5.1 Architecture du Calendrier

```
CalendarView
├── CalendarHeader
│   ├── ViewSelector (day/week/month/year)
│   ├── DateNavigator (prev/next/today)
│   └── TodayButton
│
├── CalendarGrid
│   ├── DayView
│   │   ├── TimeColumn
│   │   ├── DayColumn (events)
│   │   └── AllDaySection
│   │
│   ├── WeekView
│   │   ├── WeekHeader (jours)
│   │   └── TimeGrid (7 colonnes)
│   │
│   ├── MonthView
│   │   ├── MonthHeader (jours semaine)
│   │   └── DayCell[] (28-35 cellules)
│   │
│   └── YearView
│       └── MonthMiniature[] (12 mois)
│
└── EventCard / EventPreview
```

### 5.2 Composants Calendrier

| Composant | Props | Description |
|-----------|-------|-------------|
| `CalendarView` | `view, date, events, onEventClick` | Container principal |
| `CalendarHeader` | `view, date, onViewChange, onDateChange` | Navigation |
| `DayView` | `date, events` | Vue jour avec créneaux horaires |
| `WeekView` | `date, events` | Vue semaine 7 colonnes |
| `MonthView` | `date, events` | Vue mois grille |
| `YearView` | `year, events` | Vue année 12 minis |
| `EventCard` | `event, variant` | Carte événement |
| `TimeSlot` | `time, events, onDrop` | Créneau horaire (drop target) |
| `DayCell` | `date, events, onDrop` | Cellule jour (drop target) |

### 5.3 Hooks Calendrier

```typescript
// useCalendar.ts
function useCalendar() {
  const [view, setView] = useState<CalendarView>("month");
  const [date, setDate] = useState(new Date());

  const goToToday = () => setDate(new Date());
  const goToPrev = () => { /* selon view */ };
  const goToNext = () => { /* selon view */ };

  return { view, date, setView, setDate, goToToday, goToPrev, goToNext };
}

// useEvents.ts
function useEvents(dateRange: { start: Date; end: Date }) {
  return useQuery({
    queryKey: ["events", dateRange],
    queryFn: () => fetchEvents(dateRange),
  });
}
```

### 5.4 Drag & Drop avec @dnd-kit

```typescript
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";

function EventCard({ event }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: event.id,
    data: { event },
  });
  // ...
}

function TimeSlot({ time }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${time}`,
    data: { time },
  });
  // ...
}
```

### 5.5 Checklist Phase 5
- [ ] Créer `src/hooks/useCalendar.ts`
- [ ] Créer `src/hooks/useEvents.ts`
- [ ] Créer `CalendarView.tsx`
- [ ] Créer `CalendarHeader.tsx`
- [ ] Créer `DayView.tsx`
- [ ] Créer `WeekView.tsx`
- [ ] Créer `MonthView.tsx`
- [ ] Créer `YearView.tsx`
- [ ] Créer `EventCard.tsx`
- [ ] Créer `TimeSlot.tsx` et `DayCell.tsx`
- [ ] Implémenter le drag & drop
- [ ] Créer `MiniCalendar.tsx` pour la sidebar

---

## Phase 6 : Gestion des Événements

### 6.1 API Events

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/events` | GET | Liste événements (filtres: start, end, visibility) |
| `/api/events` | POST | Créer événement |
| `/api/events/[id]` | GET | Détails événement |
| `/api/events/[id]` | PUT | Modifier événement |
| `/api/events/[id]` | DELETE | Supprimer événement |
| `/api/events/shared` | GET | Événements visibles du couple |

### 6.2 Logique de Visibilité

```typescript
// Filtrer les événements pour le partenaire
function getVisibleEventsForPartner(events: Event[], partnerId: string) {
  return events
    .filter(e => e.visibility !== "PRIVATE")
    .map(e => {
      if (e.visibility === "BUSY_ONLY") {
        return {
          ...e,
          title: "Occupé",
          description: null,
          location: null,
        };
      }
      return e;
    });
}
```

### 6.3 Formulaire Événement

**Champs du formulaire :**
- `title` (requis)
- `description`
- `startDate`, `endDate`
- `isAllDay`
- `visibility` (PRIVATE, SHARED, BUSY_ONLY)
- `status` (BUSY, AVAILABLE, OUT_OF_FRANCE)
- `category`
- `color` (override catégorie)
- `location`
- `recurrence` (optionnel)
- `reminders[]`

### 6.4 Récurrence avec RRule

```typescript
import { RRule } from "rrule";

// Créer une règle de récurrence
const rule = new RRule({
  freq: RRule.WEEKLY,
  interval: 1,
  byweekday: [RRule.MO, RRule.WE, RRule.FR],
  until: new Date(2025, 12, 31),
});

// Générer les occurrences
const occurrences = rule.between(startDate, endDate);
```

### 6.5 Export/Import iCal

```typescript
import ical from "ical-generator";

// Export
function exportToIcal(events: Event[]) {
  const calendar = ical({ name: "Mon Calendrier" });
  events.forEach(e => calendar.createEvent({...}));
  return calendar.toString();
}

// Import
import ICAL from "ical.js";
function importFromIcal(icalString: string): Event[] {...}
```

### 6.6 Checklist Phase 6
- [ ] Créer `src/app/api/events/route.ts`
- [ ] Créer `src/app/api/events/[id]/route.ts`
- [ ] Créer `src/app/api/events/shared/route.ts`
- [ ] Créer `EventModal.tsx`
- [ ] Créer `EventForm.tsx`
- [ ] Créer `VisibilitySelector.tsx`
- [ ] Créer `RecurrenceSelector.tsx`
- [ ] Créer `ReminderSelector.tsx`
- [ ] Créer `CategoryPicker.tsx`
- [ ] Créer `src/lib/ical.ts` (export/import)
- [ ] Créer `src/lib/recurrence.ts`
- [ ] Intégrer avec le calendrier

---

## Phase 7 : To-Do Lists

### 7.1 API Todos

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/todos` | GET | Liste todos personnels |
| `/api/todos` | POST | Créer todo |
| `/api/todos/[id]` | PUT | Modifier todo |
| `/api/todos/[id]` | DELETE | Supprimer todo |
| `/api/todos/[id]/complete` | PATCH | Toggle completion |
| `/api/todos/shared` | GET | Todos partagés |
| `/api/todos/[id]/convert` | POST | Convertir en événement |
| `/api/todos/reorder` | PUT | Réordonner |

### 7.2 Interface Todos

```
TodosPage
├── TodoTabs
│   ├── PersonalTab (mes todos)
│   └── SharedTab (todos partagés)
│
├── TodoFilters
│   ├── StatusFilter (all/active/completed)
│   ├── PriorityFilter
│   └── CategoryFilter
│
├── TodoList
│   └── TodoItem
│       ├── Checkbox
│       ├── Title
│       ├── PriorityBadge
│       ├── DueDateBadge
│       ├── AssigneeBadge
│       └── Actions (edit, convert, delete)
│
└── AddTodoForm (quick add)
```

### 7.3 Conversion Todo → Événement

```typescript
async function convertTodoToEvent(todoId: string) {
  const todo = await prisma.todo.findUnique({ where: { id: todoId } });

  const event = await prisma.event.create({
    data: {
      title: todo.title,
      description: todo.description,
      startDate: todo.dueDate || new Date(),
      endDate: todo.dueDate || new Date(),
      isAllDay: true,
      visibility: todo.isShared ? "SHARED" : "PRIVATE",
      ownerId: todo.ownerId,
      categoryId: todo.categoryId,
      convertedFromTodoId: todoId,
    },
  });

  return event;
}
```

### 7.4 Checklist Phase 7
- [ ] Créer `src/app/api/todos/route.ts`
- [ ] Créer `src/app/api/todos/[id]/route.ts`
- [ ] Créer `src/app/api/todos/shared/route.ts`
- [ ] Créer `src/app/api/todos/[id]/convert/route.ts`
- [ ] Créer `src/app/(dashboard)/todos/page.tsx`
- [ ] Créer `TodoList.tsx`
- [ ] Créer `TodoItem.tsx`
- [ ] Créer `TodoForm.tsx`
- [ ] Créer `TodoFilters.tsx`
- [ ] Créer `PriorityBadge.tsx`
- [ ] Implémenter le drag & drop pour réordonner
- [ ] Implémenter la conversion en événement

---

## Phase 8 : Système Partenaire

### 8.1 API Partner

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/partner` | GET | Info partenaire actuel |
| `/api/partner/invite` | POST | Envoyer invitation |
| `/api/partner/invite/[token]` | GET | Vérifier invitation |
| `/api/partner/accept` | POST | Accepter invitation |
| `/api/partner/decline` | POST | Refuser invitation |
| `/api/partner/unlink` | DELETE | Dissocier partenaire |
| `/api/partner/status` | GET/PUT | Statut temps réel |

### 8.2 Flow d'Invitation

```
1. User A envoie invitation → /api/partner/invite
   - Crée PartnerInvitation avec token
   - Envoie email à User B

2. User B reçoit email avec lien
   - Clique sur lien → /partner/invite/[token]
   - Si pas connecté → redirect login puis retour
   - Affiche page acceptation

3. User B accepte → /api/partner/accept
   - Update PartnerInvitation.status = ACCEPTED
   - Update User A partnerId = User B id
   - Update User B partnerId = User A id
   - Notifier User A

4. Users A et B sont maintenant liés
```

### 8.3 Statut Temps Réel

**Options :**
1. **Polling** : Requête toutes les X secondes
2. **Pusher/Ably** : WebSocket pour temps réel
3. **Server-Sent Events** : Pour les mises à jour unidirectionnelles

```typescript
// Hook pour le statut partenaire
function usePartnerStatus() {
  const { data: partner } = usePartner();

  // Polling simple
  const { data: status } = useQuery({
    queryKey: ["partner-status", partner?.id],
    queryFn: () => fetchPartnerStatus(partner.id),
    refetchInterval: 30000, // 30 secondes
  });

  return status;
}
```

### 8.4 Checklist Phase 8
- [ ] Créer `src/app/api/partner/route.ts`
- [ ] Créer `src/app/api/partner/invite/route.ts`
- [ ] Créer `src/app/api/partner/accept/route.ts`
- [ ] Créer `src/app/api/partner/unlink/route.ts`
- [ ] Créer `src/app/(dashboard)/partner/page.tsx`
- [ ] Créer `src/app/(dashboard)/partner/invite/[token]/page.tsx`
- [ ] Créer `PartnerCard.tsx`
- [ ] Créer `PartnerInvite.tsx`
- [ ] Créer `PartnerStatus.tsx`
- [ ] Créer le template email d'invitation
- [ ] Implémenter le statut temps réel

---

## Phase 9 : Notifications

### 9.1 Types de Notifications

| Type | Trigger | Message |
|------|---------|---------|
| `EVENT_REMINDER` | X min avant événement | "Rappel: {title} dans {time}" |
| `EVENT_CREATED` | Partenaire crée event partagé | "{partner} a créé {title}" |
| `EVENT_UPDATED` | Partenaire modifie event | "{partner} a modifié {title}" |
| `TODO_ASSIGNED` | Partenaire assigne todo | "{partner} t'a assigné {title}" |
| `TODO_COMPLETED` | Partenaire complète todo partagé | "{partner} a terminé {title}" |
| `PARTNER_INVITATION` | Invitation reçue | "{name} vous invite" |
| `PARTNER_STATUS` | Changement statut partenaire | "{partner} est maintenant {status}" |

### 9.2 API Notifications

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/notifications` | GET | Liste (avec pagination) |
| `/api/notifications/unread-count` | GET | Nombre non lues |
| `/api/notifications/[id]/read` | PATCH | Marquer comme lue |
| `/api/notifications/mark-all-read` | POST | Tout marquer lu |

### 9.3 Système de Rappels

```typescript
// Cron job ou edge function pour envoyer les rappels
async function processReminders() {
  const dueReminders = await prisma.reminder.findMany({
    where: {
      sent: false,
      event: {
        startDate: {
          lte: addMinutes(new Date(), reminder.time),
        },
      },
    },
    include: { event: { include: { owner: true } } },
  });

  for (const reminder of dueReminders) {
    // Créer notification
    await prisma.notification.create({...});

    // Envoyer email si configuré
    if (reminder.type === "EMAIL" || reminder.type === "BOTH") {
      await sendReminderEmail(reminder);
    }

    // Marquer comme envoyé
    await prisma.reminder.update({
      where: { id: reminder.id },
      data: { sent: true, sentAt: new Date() },
    });
  }
}
```

### 9.4 Checklist Phase 9
- [ ] Créer `src/app/api/notifications/route.ts`
- [ ] Créer `src/app/api/notifications/[id]/read/route.ts`
- [ ] Créer `NotificationBell.tsx`
- [ ] Créer `NotificationList.tsx`
- [ ] Créer `NotificationItem.tsx`
- [ ] Créer le service de rappels
- [ ] Configurer un cron job (Vercel cron, etc.)

---

## Phase 10 : Paramètres

### 10.1 Pages Settings

```
/settings
├── /profile        # Nom, avatar, email
├── /appearance     # Thème, couleurs, formats
├── /notifications  # Préférences notifications
└── /categories     # Gestion catégories
```

### 10.2 Paramètres Disponibles

**Profil :**
- Nom, Prénom
- Avatar (upload)
- Email (lecture seule si OAuth)

**Apparence :**
- Thème (Light/Dark/System)
- Couleur primaire
- Premier jour de la semaine (Lundi/Dimanche)
- Vue calendrier par défaut
- Format heure (12h/24h)
- Format date

**Notifications :**
- Notifications email (on/off)
- Rappel par défaut (minutes)
- Notifications partenaire (on/off)

**Confidentialité :**
- Partager statut avec partenaire
- Montrer "occupé" par défaut

### 10.3 Gestion des Catégories

```
CategoryManager
├── CategoryList
│   └── CategoryItem
│       ├── ColorDot
│       ├── Icon
│       ├── Name
│       └── Actions (edit, delete)
│
└── CategoryForm
    ├── NameInput
    ├── ColorPicker
    └── IconPicker
```

### 10.4 Checklist Phase 10
- [ ] Créer `src/app/api/user/settings/route.ts`
- [ ] Créer `src/app/api/categories/route.ts`
- [ ] Créer `src/app/(dashboard)/settings/page.tsx`
- [ ] Créer `src/app/(dashboard)/settings/profile/page.tsx`
- [ ] Créer `src/app/(dashboard)/settings/appearance/page.tsx`
- [ ] Créer `src/app/(dashboard)/settings/notifications/page.tsx`
- [ ] Créer `src/app/(dashboard)/settings/categories/page.tsx`
- [ ] Créer `ProfileForm.tsx`
- [ ] Créer `AppearanceSettings.tsx`
- [ ] Créer `NotificationSettings.tsx`
- [ ] Créer `CategoryManager.tsx`
- [ ] Créer `ColorPicker.tsx`

---

## Phase 11 : Optimisation & Finition

### 11.1 Performance

**React Query :**
- Configurer le cache correctement
- Utiliser `staleTime` et `cacheTime`
- Implémenter optimistic updates

**Lazy Loading :**
```typescript
const MonthView = lazy(() => import("./MonthView"));
const YearView = lazy(() => import("./YearView"));
```

**Pagination :**
- Events : par plage de dates
- Todos : curseur ou offset
- Notifications : infinite scroll

### 11.2 Accessibilité

- Labels ARIA sur tous les composants interactifs
- Navigation au clavier
- Contraste des couleurs
- Screen reader friendly

### 11.3 SEO & Meta

```typescript
// Metadata dynamique
export async function generateMetadata({ params }) {
  return {
    title: `Calendrier - ${format(date, "MMMM yyyy")}`,
    description: "Votre calendrier partagé",
  };
}
```

### 11.4 Error Handling

- Error boundaries React
- Try/catch sur toutes les API
- Messages d'erreur user-friendly
- Logging des erreurs (Sentry, etc.)

### 11.5 Tests

**Types de tests :**
- Unit tests : Fonctions utilitaires
- Integration tests : API routes
- E2E tests : Flows critiques (auth, events)

```bash
npm install -D vitest @testing-library/react playwright
```

### 11.6 Checklist Phase 11
- [ ] Configurer React Query cache
- [ ] Implémenter lazy loading
- [ ] Ajouter la pagination
- [ ] Vérifier l'accessibilité
- [ ] Ajouter les meta tags
- [ ] Implémenter error boundaries
- [ ] Écrire les tests critiques
- [ ] Optimiser les images
- [ ] Vérifier le bundle size

---

## Phase 12 : Déploiement

### 12.1 Préparation

**Checklist pré-déploiement :**
- [ ] Variables d'environnement configurées
- [ ] Base de données PostgreSQL prête
- [ ] Google OAuth configuré avec URLs de prod
- [ ] SMTP fonctionnel
- [ ] Build sans erreurs

### 12.2 Vercel (Recommandé)

1. Connecter le repo GitHub à Vercel
2. Configurer les variables d'environnement
3. Ajouter la base de données (Vercel Postgres ou externe)
4. Déployer

**vercel.json (optionnel) :**
```json
{
  "crons": [{
    "path": "/api/cron/reminders",
    "schedule": "*/5 * * * *"
  }]
}
```

### 12.3 Docker

**Dockerfile :**
```dockerfile
FROM node:18-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

### 12.4 Self-hosted

```bash
# Build
npm run build

# Start avec PM2
pm2 start npm --name "calendar" -- start

# Nginx reverse proxy
server {
    listen 80;
    server_name calendar.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 12.5 Checklist Déploiement
- [ ] Build de production réussi
- [ ] Base de données migrée
- [ ] Variables d'environnement configurées
- [ ] SSL/HTTPS configuré
- [ ] Domaine configuré
- [ ] Tester le flow complet en production
- [ ] Configurer les cron jobs
- [ ] Mettre en place le monitoring

---

## Ressources

### Documentation
- [Next.js](https://nextjs.org/docs)
- [NextAuth.js v5](https://authjs.dev)
- [Prisma](https://www.prisma.io/docs)
- [TailwindCSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [date-fns](https://date-fns.org)
- [@dnd-kit](https://dndkit.com)
- [Zustand](https://zustand-demo.pmnd.rs)
- [TanStack Query](https://tanstack.com/query)

### Icônes
- [Lucide Icons](https://lucide.dev/icons)

### Outils
- [Prisma Studio](https://www.prisma.io/studio) - GUI pour la base de données
- [Thunder Client](https://www.thunderclient.com) - Tester les API
- [React DevTools](https://react.dev/learn/react-developer-tools)

---

*Dernière mise à jour : Décembre 2024*
