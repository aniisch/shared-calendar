# Calendrier Couple

Un calendrier partagé moderne et élégant conçu pour les couples. Organisez votre vie à deux avec des événements, des tâches et un suivi en temps réel.

## Fonctionnalités

### Calendrier Partagé
- **4 vues** : Jour, Semaine, Mois, Année
- **Drag & drop** pour déplacer les événements
- **Superposition visuelle** des événements de votre partenaire
- Navigation intuitive et fluide

### Gestion des Événements
- **Visibilité configurable** :
  - `Privé` - Invisible pour votre partenaire
  - `Partagé` - Visible avec tous les détails
  - `Occupé` - Visible comme "Occupé" sans détails
- Statuts : Disponible, Occupé, Hors France, Ne pas déranger
- Catégories personnalisables avec couleurs
- Récurrence (quotidien, hebdomadaire, mensuel, annuel)
- Rappels et notifications

### To-Do Lists
- Liste personnelle pour chaque utilisateur
- Liste partagée (tâches en commun)
- Priorités : Low, Medium, High, Urgent
- Conversion automatique todo → événement
- Assignation au partenaire

### Système de Partenariat
- Invitation par email
- Vue "Où est l'autre" (statut en temps réel)
- Liaison/Déliaison des comptes

### Interface Moderne
- Design élégant avec thème clair/sombre
- Responsive (mobile, tablette, desktop)
- Animations fluides
- Composants shadcn/ui

## Stack Technique

- **Frontend** : Next.js 14+ (App Router), React 18, TypeScript
- **Styling** : TailwindCSS, shadcn/ui, Lucide icons
- **Base de données** : PostgreSQL avec Prisma ORM
- **Authentification** : NextAuth v5 (Email/Password, Magic Links, Google OAuth)
- **State Management** : Zustand, TanStack Query
- **Emails** : Nodemailer avec SMTP
- **Calendrier** : date-fns, @dnd-kit, rrule

## Prérequis

- Node.js 18+
- PostgreSQL 14+
- Compte Google Cloud (pour OAuth)
- Serveur SMTP (pour les emails)

## Installation

### 1. Cloner le repository

```bash
git clone https://github.com/votre-username/shared-calendar.git
cd shared-calendar
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Copier le fichier `.env.example` en `.env.local` :

```bash
cp .env.example .env.local
```

Puis remplir les variables :

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/shared_calendar"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-secret-genere"

# Google OAuth (optionnel)
GOOGLE_CLIENT_ID="votre-client-id"
GOOGLE_CLIENT_SECRET="votre-client-secret"

# SMTP
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="noreply@example.com"
SMTP_PASSWORD="votre-password"
EMAIL_FROM="Calendrier Couple <noreply@example.com>"
```

### 4. Initialiser la base de données

```bash
# Générer le client Prisma
npm run db:generate

# Créer les tables
npm run db:push

# (Optionnel) Lancer Prisma Studio pour visualiser les données
npm run db:studio
```

### 5. Lancer le serveur de développement

```bash
npm run dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000)

## Scripts Disponibles

| Script | Description |
|--------|-------------|
| `npm run dev` | Lance le serveur de développement |
| `npm run build` | Build pour la production |
| `npm run start` | Lance le serveur de production |
| `npm run lint` | Vérifie le code avec ESLint |
| `npm run db:generate` | Génère le client Prisma |
| `npm run db:push` | Synchronise le schema avec la BDD |
| `npm run db:migrate` | Crée une migration |
| `npm run db:studio` | Lance Prisma Studio |
| `npm run db:seed` | Peuple la BDD avec des données de test |

## Structure du Projet

```
shared-calendar/
├── prisma/
│   ├── schema.prisma          # Schema de base de données
│   └── seed.ts                # Données de test
├── src/
│   ├── app/                   # App Router Next.js
│   │   ├── (auth)/            # Pages d'authentification
│   │   ├── (dashboard)/       # Pages protégées
│   │   └── api/               # Routes API
│   ├── components/
│   │   ├── ui/                # Composants shadcn/ui
│   │   ├── calendar/          # Composants calendrier
│   │   ├── events/            # Composants événements
│   │   ├── todos/             # Composants todos
│   │   └── ...
│   ├── lib/                   # Utilitaires et configs
│   ├── hooks/                 # Custom hooks React
│   ├── stores/                # Zustand stores
│   ├── types/                 # Types TypeScript
│   └── services/              # Logique métier
├── public/                    # Assets statiques
└── ...
```

## Restriction d'accès (Mode Privé)

Cette application peut être verrouillée pour un usage privé (ex: couple uniquement).

Dans `.env` et `.env.local`, ajoutez :

```env
# Liste des emails autorisés (séparés par des virgules)
ALLOWED_EMAILS="email1@example.com,email2@example.com"
```

- Seuls ces emails pourront s'inscrire ou se connecter
- Maximum 2 utilisateurs par défaut (modifiable dans `src/lib/auth.ts`)

## Déploiement

### Vercel (Recommandé)

1. Connecter votre repository à Vercel
2. Ajouter les variables d'environnement
3. Déployer

### Docker

```bash
docker build -t shared-calendar .
docker run -p 3000:3000 shared-calendar
```

### Self-hosted

```bash
npm run build
npm run start
```

## Configuration Google OAuth

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un nouveau projet
3. Configurer l'écran de consentement OAuth (External)
4. Créer des identifiants OAuth 2.0 (Web application)
5. Ajouter les URLs :

**Origines JavaScript autorisées :**
- `http://localhost:3000` (dev)
- `https://votre-domaine.com` (prod)

**URI de redirection autorisés :**
- `http://localhost:3000/api/auth/callback/google` (dev)
- `https://votre-domaine.com/api/auth/callback/google` (prod)

6. Copier le Client ID et Client Secret dans `.env.local`

## Checklist Passage en Production

Avant de déployer en production, vérifiez ces points :

### 1. Variables d'environnement
```env
# Changer localhost par votre domaine
NEXTAUTH_URL="https://votre-domaine.com"
```

### 2. Google OAuth Console
- [ ] Ajouter `https://votre-domaine.com` aux origines autorisées
- [ ] Ajouter `https://votre-domaine.com/api/auth/callback/google` aux URIs de redirection
- [ ] Passer l'app en mode "Production" (pas "Testing")
- [ ] Soumettre pour vérification si nécessaire

### 3. Configuration SMTP
- [ ] Vérifier que EMAIL_FROM utilise un domaine valide
- [ ] Tester l'envoi d'emails depuis le serveur de production

### 4. Base de données
- [ ] Utiliser une connexion SSL (`?sslmode=require`)
- [ ] Configurer les backups automatiques

### 5. Sécurité
- [ ] Générer un nouveau NEXTAUTH_SECRET pour la production
- [ ] Ne jamais commiter les fichiers `.env` avec les secrets

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## Licence

MIT License - voir [LICENSE](LICENSE) pour plus de détails.

---

Fait avec amour pour les couples organisés
