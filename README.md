# 🏠 LOCABENIN — Plateforme Immobilière SaaS du Bénin

> **"La confiance digitalisée"** — Marketplace immobilière P2P intelligente, transparente et sécurisée pour Cotonou et le Bénin.

---

## 📋 Table des matières

- [Vision du projet](#-vision-du-projet)
- [Problèmes résolus](#-problèmes-résolus)
- [Architecture technique](#-architecture-technique)
- [Rôles utilisateurs](#-rôles-utilisateurs)
- [Modèle économique SaaS](#-modèle-économique-saas)
- [Fonctionnalités — État complet](#-fonctionnalités--état-complet)
- [Pages réalisées — Détail complet](#-pages-réalisées--détail-complet)
- [Composants réutilisables](#-composants-réutilisables)
- [État d'avancement global](#-état-davancement-global)
- [Roadmap d'implémentation](#-roadmap-dimplémentation)
- [Structure du projet](#-structure-du-projet)
- [Installation](#-installation)
- [Comptes de démonstration](#-comptes-de-démonstration)

---

## 🎯 Vision du projet

LOCABENIN est la **première plateforme immobilière SaaS** conçue spécifiquement pour le marché locatif béninois. Elle vise à digitaliser et sécuriser l'ensemble du parcours locatif — de la recherche du bien à la signature du bail, en passant par le paiement sécurisé des cautions.

### Proposition de valeur unique
- **Pour les locataires** : Trouver un logement vérifié, visiter en confiance, payer sa caution en sécurité
- **Pour les propriétaires** : Publier facilement, trouver des locataires fiables, gérer ses biens
- **Pour les agences** : Outils SaaS professionnels, gestion multi-biens, reporting

---

## 🔧 Problèmes résolus

| Problème du marché béninois | Solution LOCABENIN |
|---|---|
| Annonces trompeuses et fausses photos | ✅ Vérification obligatoire (photos réelles, badges certifiés, IA de détection) |
| Arnaques aux cautions | ✅ Compte séquestre sécurisé via Mobile Money (MTN/Moov) |
| Flou juridique sur les baux | ✅ Contrats numériques conformes à la loi béninoise |
| Commissions abusives | ✅ Plafond légal de 50% appliqué et calculé automatiquement |
| Manque de transparence environnementale | ✅ Indicateurs de risque d'inondation et niveau sonore |
| Frais de visite excessifs | ✅ Zéro frais de visite — politique stricte |

---

## 🏗 Architecture technique

### Stack Frontend (✅ Implémenté)
| Couche | Technologies |
|---|---|
| **Framework** | React 18, TypeScript, Vite |
| **UI** | Tailwind CSS, shadcn/ui, Framer Motion |
| **Cartographie** | Leaflet, React-Leaflet, OpenStreetMap |
| **Graphiques** | Recharts (BarChart, LineChart, PieChart) |
| **Routing** | React Router DOM v6 (20+ routes, protégées par rôle) |
| **État** | React Query (TanStack), Context API (Auth, Langue) |
| **Formulaires** | React Hook Form + Zod (validation) |
| **Polices** | Space Grotesk (titres), Plus Jakarta Sans (corps) |
| **Palette** | Tons terreux, vert confiance (#3A7D5C), doré (#D4A843) |
| **i18n** | Système multilingue FR/EN avec Context |

### Stack Backend (✅ Lovable Cloud — Opérationnel)
| Couche | Technologie |
|---|---|
| **Base de données** | PostgreSQL (Lovable Cloud) |
| **Authentification** | Lovable Cloud Auth (email + password, email verification) |
| **Stockage fichiers** | Lovable Cloud Storage (photos, avatars) |
| **API serverless** | Edge Functions (Deno) |
| **Temps réel** | Realtime WebSocket (messagerie, notifications) |
| **Sécurité** | Row-Level Security (RLS) sur toutes les tables |

---

## 👥 Rôles utilisateurs

### 🏠 Locataire (`locataire`)
| Fonctionnalité | Détail |
|---|---|
| Recherche & filtrage | Quartier, budget, type, surface, risque inondation, bruit |
| Favoris | Sauvegarder des biens pour plus tard |
| Visites | Planifier des créneaux de visite |
| Contrats | Signer des baux numériques |
| Paiements | Caution séquestrée + loyer via Mobile Money |
| Maintenance | Signaler des réparations nécessaires |
| Avis | Noter et commenter les propriétaires/biens |
| Premium | Alertes prioritaires, historique, score qualité |

### 🏢 Propriétaire (`proprietaire`)
| Fonctionnalité | Détail |
|---|---|
| Publication | Créer/modifier des annonces multi-étapes |
| Gestion des biens | Tableau de bord avec stats par bien |
| Demandes | Voir et gérer les demandes de visite |
| Contrats | Générer des baux conformes à la loi |
| Revenus | Suivi des loyers et statistiques financières |
| Maintenance | Recevoir et traiter les demandes de réparation |
| Premium | Boost d'annonces, analytics avancés, badge vérifié |

### ⚙️ Administrateur (`admin`)
| Fonctionnalité | Détail | Statut |
|---|---|---|
| KPIs plateforme | Revenus, utilisateurs, transactions, croissance | ✅ |
| Modération annonces | Validation/rejet/édition des annonces | ✅ |
| CRUD Annonces | Création, lecture, modification, suppression | ✅ |
| Prévisualisation | Aperçu complet des annonces avant publication | ✅ |
| Gestion utilisateurs | Recherche, vérification KYC, suspension | ✅ |
| Signalements | Traitement des litiges et abus | ✅ |
| Notifications auto | Alertes admin sur nouveaux signalements | ✅ |
| Consultation contrats | Lecture détaillée de tous les contrats | ✅ |
| Configuration | Commissions, règles SaaS, paramètres plateforme | ✅ |
| Journaux d'activité | Historique complet des actions admin | ✅ |
| Export de données | CSV et PDF (utilisateurs, paiements, signalements) | ✅ |

---

## 💼 Modèle économique SaaS

### Sources de revenus
| Source | Détail | Commission |
|---|---|---|
| Commission sur transaction | Appliquée à chaque mise en relation réussie | 3-7% du loyer (plafond légal 50%) |
| Frais de séquestre | Gestion du compte séquestre pour les cautions | 2-3% de la caution |
| Abonnement Premium Locataire | Alertes prioritaires, biens vérifiés, historique, score | 2 500 FCFA/mois |
| Abonnement Premium Propriétaire | Annonces illimitées, boost, stats, badge, support dédié | 5 000 FCFA/mois |
| SaaS Agences immobilières | Dashboard multi-agences, API, reporting avancé | Sur devis |

### Règles de gestion
- **Zéro frais de visite** : Politique stricte, jamais de frais pour visiter un bien
- **Commission plafonnée** : Maximum légal de 50% du loyer mensuel (loi béninoise)
- **Caution séquestrée** : Jamais versée directement au propriétaire
- **Libération conditionnelle** : Caution libérée uniquement sur accord mutuel des deux parties

---

## ✨ Fonctionnalités — État complet

### Légende
- ✅ **Complet** : UI + logique fonctionnelle + persistance
- ⚠️ **UI seule** : Interface réalisée, backend partiel
- 🔲 **Non implémenté** : À développer

### 🔍 Recherche & Découverte
| Fonctionnalité | Description | Statut |
|---|---|---|
| Recherche avancée | Filtres par quartier, budget, type, surface | ✅ Fonctionnel |
| Carte interactive Leaflet | Biens géolocalisés avec prix, cliquables | ✅ Fonctionnel |
| Toggle Grille/Carte | Basculer entre vue liste et vue carte | ✅ Fonctionnel |
| Badges filtres actifs | Affichage et suppression des filtres appliqués | ✅ Fonctionnel |
| Indicateurs transparence | Risque d'inondation + niveau sonore par bien | ✅ Fonctionnel |
| Visite virtuelle 360° | Modal immersive pour explorer le bien | ✅ UI (mock) |
| Galerie d'images | Carousel, miniatures, plein écran, navigation clavier | ✅ Fonctionnel |

### 🔐 Authentification & Sécurité
| Fonctionnalité | Description | Statut |
|---|---|---|
| Inscription (email/password) | Formulaire avec sélection de rôle | ✅ Fonctionnel |
| Connexion | Formulaire avec gestion d'erreurs | ✅ Fonctionnel |
| Déconnexion | Nettoyage de session | ✅ Fonctionnel |
| Rôles (Locataire/Propriétaire/Admin) | Redirection automatique par rôle | ✅ Fonctionnel |
| Routes protégées | Restriction d'accès par rôle | ✅ Fonctionnel |
| Mot de passe oublié | Formulaire + email de récupération | ✅ Fonctionnel |
| RLS (Row-Level Security) | Protection des données par utilisateur | ✅ Fonctionnel |
| Vérification KYC | Badges identité vérifiée | ⚠️ UI seule |
| MFA (double facteur) | Sécurité renforcée | 🔲 Non implémenté |
| OAuth (Google/Apple) | Connexion sociale | 🔲 Non implémenté |

### 📊 Tableaux de bord
| Fonctionnalité | Description | Statut |
|---|---|---|
| Dashboard Locataire | Actions rapides, location en cours, favoris, notifications | ✅ Fonctionnel |
| Dashboard Propriétaire | Analytics avancés : vues, revenus, taux d'occupation, graphiques | ✅ Fonctionnel |
| Dashboard Admin | KPIs, graphiques, modération, gestion complète | ✅ Fonctionnel |
| Redirection intelligente | Après connexion, redirection vers dashboard du rôle | ✅ Fonctionnel |
| Filtres temporels | 7j, 30j, 90j pour l'analyse des performances | ✅ Fonctionnel |
| Graphiques interactifs | AreaChart, LineChart, PieChart, BarChart | ✅ Fonctionnel |

### 📝 Annonces
| Fonctionnalité | Description | Statut |
|---|---|---|
| Publication multi-étapes | 5 étapes : Infos → Localisation → Équipements → Photos → Validation | ✅ Fonctionnel |
| Upload photos | Zone de drop avec stockage Cloud, multi-fichiers | ✅ Fonctionnel |
| Upload vidéos | Vidéos courtes jusqu'à 50MB (MP4, MOV, WebM) | ✅ Fonctionnel |
| CRUD Admin | Création, lecture, modification, suppression par admin | ✅ Fonctionnel |
| Prévisualisation | Aperçu complet avant publication | ✅ Fonctionnel |
| Modération admin | Workflow validation avant publication | ✅ Fonctionnel |
| Badges certifiés | "Annonce vérifiée" avec contrôle qualité | ✅ Fonctionnel |
| Signalement | Utilisateurs peuvent reporter les annonces suspectes | ✅ Fonctionnel |

### 💰 Paiements & Transactions
| Fonctionnalité | Description | Statut |
|---|---|---|
| Simulateur de paiement | Calcul loyer + caution + commission légale | ✅ Fonctionnel |
| Calculateur de commission | Commission max légale vs commission LOCABENIN | ✅ Fonctionnel |
| Historique paiements | Suivi des paiements par contrat | ✅ Fonctionnel |
| Export paiements | CSV et PDF | ✅ Fonctionnel |
| Compte séquestre | Blocage caution via FedaPay / Mobile Money | 🔲 Non implémenté |
| Paiement Mobile Money | MTN Money, Moov Money (Bénin) | 🔲 Non implémenté |

### 📄 Contrats & Juridique
| Fonctionnalité | Description | Statut |
|---|---|---|
| Liste des contrats | 3 statuts : Actif / En attente / Terminé | ✅ Fonctionnel |
| Consultation admin | Détail complet (parties, montants, signatures) | ✅ Fonctionnel |
| Générateur de bail | Conforme loi béninoise | ⚠️ UI seule |
| Signature électronique | Signature en ligne des contrats | 🔲 Non implémenté |
| Export PDF | Téléchargement du contrat | ✅ Fonctionnel |
| Guide juridique | FAQ juridique + calculateur commission | ✅ Fonctionnel |

### 💬 Communication
| Fonctionnalité | Description | Statut |
|---|---|---|
| Messagerie | Chat avec liste de conversations + bulles | ✅ Fonctionnel |
| Notifications in-app | Liste dans dashboard, temps réel | ✅ Fonctionnel |
| Notifications admin | Alertes automatiques sur signalements | ✅ Fonctionnel |
| Notifications Push | Web Push API | 🔲 Non implémenté |
| Emails transactionnels | Confirmation, alertes, rappels | 🔲 Non implémenté |
| Partage social | WhatsApp, Facebook, Twitter, copie lien | ✅ Fonctionnel |
| Assistant IA | Chatbot d'aide intégré en bas de page | ✅ UI complète |

### 🔧 Administration
| Fonctionnalité | Description | Statut |
|---|---|---|
| Gestion utilisateurs | Liste, recherche, filtres, vérification | ✅ Fonctionnel |
| Gestion annonces | CRUD complet, prévisualisation, modération | ✅ Fonctionnel |
| Gestion signalements | Traitement (résoudre/rejeter), export | ✅ Fonctionnel |
| Gestion contrats | Consultation détaillée, PDF | ✅ Fonctionnel |
| Paramètres plateforme | Configuration des règles métier | ✅ Fonctionnel |
| Journaux d'activité | Historique des actions admin | ✅ Fonctionnel |
| Export de données | CSV et PDF multi-tables | ✅ Fonctionnel |

---

## 📄 Pages réalisées — Détail complet

### 21 pages implémentées

| # | Page | Route | Fichier | Accès |
|---|---|---|---|---|
| 1 | Accueil | `/` | `Index.tsx` | Public (redirection si connecté) |
| 2 | Recherche | `/recherche` | `SearchPage.tsx` | Public |
| 3 | Détail bien | `/bien/:id` | `PropertyDetail.tsx` | Public |
| 4 | Connexion | `/connexion` | `LoginPage.tsx` | Public |
| 5 | Inscription | `/inscription` | `RegisterPage.tsx` | Public |
| 6 | Mot de passe oublié | `/mot-de-passe-oublie` | `ForgotPasswordPage.tsx` | Public |
| 7 | Réinitialisation | `/reinitialiser-mot-de-passe` | `ResetPasswordPage.tsx` | Public |
| 8 | Premium | `/premium` | `PremiumPage.tsx` | Public |
| 9 | Juridique | `/juridique` | `LegalPage.tsx` | Public |
| 10 | À propos | `/a-propos` | `AboutPage.tsx` | Public |
| 11 | Contact | `/contact` | `ContactPage.tsx` | Public |
| 12 | Centre d'aide | `/aide` | `HelpCenterPage.tsx` | Public |
| 13 | Communauté | `/communaute` | `CommunityPage.tsx` | Public |
| 14 | Publier une annonce | `/publier` | `PublishPage.tsx` | 🔒 Authentifié |
| 15 | Messages | `/messages` | `MessagesPage.tsx` | 🔒 Authentifié |
| 16 | Contrats | `/contrats` | `ContractsPage.tsx` | 🔒 Authentifié |
| 17 | Paiements | `/paiements` | `PaymentsPage.tsx` | 🔒 Authentifié |
| 18 | Profil | `/profil` | `ProfilePage.tsx` | 🔒 Authentifié |
| 19 | Dashboard Locataire | `/tableau-de-bord` | `DashboardTenant.tsx` | 🔒 Locataire |
| 20 | Dashboard Propriétaire | `/espace-proprietaire` | `DashboardOwner.tsx` | 🔒 Propriétaire |
| 21 | Administration | `/ctrl-panel-x` | `AdminPage.tsx` | 🔒 Admin |

---

## 🧩 Composants réutilisables

| Composant | Description |
|---|---|
| `Navbar` | Navigation principale avec méga-menu "Explorer", état auth dynamique |
| `Footer` | Pied de page avec liens, réseaux sociaux, copyright |
| `PropertyCard` | Carte d'annonce (image, prix, localisation, badges, notation) |
| `ImageGallery` | Galerie avec miniatures, navigation, plein écran |
| `MapView` | Carte Leaflet avec marqueurs cliquables |
| `PaymentSimulator` | Simulateur loyer + caution + commission |
| `VisitScheduler` | Planificateur de créneaux de visite |
| `VirtualTourModal` | Modal de visite virtuelle 360° |
| `ReputationBadge` | Score et badge de réputation |
| `SocialShare` | Partage sur réseaux sociaux |
| `AIAssistant` | Chatbot d'aide intégré |
| `LanguageSwitcher` | Sélecteur FR/EN |
| `ProtectedRoute` | HOC de protection par rôle |
| `ReportDialog` | Dialog de signalement d'annonce |
| `AdminPropertyDialog` | Dialog CRUD annonces (admin) |
| `AdminContractDialog` | Dialog consultation contrat (admin) |
| `AdminSidebar` | Navigation latérale admin |

---

## 📈 État d'avancement global

```
Frontend UI          ████████████████████ 95%
Logique métier front █████████████████░░░ 85%
Backend / Database   ████████████████░░░░ 80%
Authentification     ████████████████████ 100%
Administration       ████████████████████ 100%
Paiements            ██░░░░░░░░░░░░░░░░░░ 10%
Temps réel           ██████████░░░░░░░░░░ 50%
Tests                ██░░░░░░░░░░░░░░░░░░ 10%
```

---

## 🗺 Roadmap d'implémentation

### Phase 1 — Fondations Backend ✅ COMPLÉTÉ
> Objectif : Backend fonctionnel avec auth réelle et persistance

- [x] Activer Lovable Cloud (PostgreSQL + Auth + Storage)
- [x] Schéma de base de données complet
- [x] Politiques RLS pour chaque table
- [x] Authentification réelle (email + password)
- [x] Rôles via `user_roles` (security definer function)
- [x] Triggers : auto-création profil, notifications admin

### Phase 2 — CRUD & Fonctionnalités cœur ✅ COMPLÉTÉ
> Objectif : Toutes les opérations métier fonctionnelles

- [x] CRUD annonces avec upload médias
- [x] Système de favoris persistant
- [x] Planification de visites
- [x] Messagerie temps réel
- [x] Système d'avis et notation
- [x] Demandes de maintenance
- [x] Profil utilisateur éditable avec avatar
- [x] Modération admin des annonces
- [x] Système de signalements complet
- [x] Notifications admin automatisées

### Phase 3 — Contrats & Juridique ⏳ EN COURS
> Objectif : Digitalisation complète du parcours juridique

- [x] Liste et consultation des contrats
- [x] Export PDF des contrats
- [ ] Génération automatique de contrats
- [ ] Signature électronique
- [ ] Gestion du cycle de vie des contrats

### Phase 4 — Monétisation & Paiements
> Objectif : Revenus actifs sur la plateforme

- [ ] Intégration FedaPay (Edge Function)
- [ ] Paiement Mobile Money (MTN/Moov Bénin)
- [ ] Système de séquestre pour cautions
- [ ] Abonnements Premium récurrents
- [ ] Commission automatique sur transactions

### Phase 5 — Confiance & Qualité
> Objectif : Confiance maximale entre utilisateurs

- [ ] Vérification KYC (identité)
- [ ] Badges certifiés dynamiques
- [ ] Notifications email transactionnelles
- [ ] Notifications Push (Web Push API)
- [ ] IA : tagging photos, détection fraudes

---

## 📁 Structure du projet

```
locabenin/
├── public/                  # Fichiers statiques
├── src/
│   ├── assets/              # Images
│   ├── components/          # Composants réutilisables
│   │   ├── ui/              # Design system shadcn/ui
│   │   ├── AdminPropertyDialog.tsx
│   │   ├── AdminContractDialog.tsx
│   │   ├── AdminSidebar.tsx
│   │   ├── ReportDialog.tsx
│   │   └── ...
│   ├── contexts/            # Contextes React (Auth, Language)
│   ├── hooks/               # Hooks personnalisés
│   │   ├── useProperties.ts
│   │   ├── useContracts.ts
│   │   ├── useReports.ts
│   │   ├── useMessages.ts
│   │   └── ...
│   ├── integrations/        # Intégrations (Supabase)
│   ├── lib/                 # Utilitaires
│   │   └── pdfExport.ts
│   └── pages/               # Pages de l'application
├── supabase/
│   ├── functions/           # Edge Functions
│   │   ├── notify-report/
│   │   ├── payment-reminders/
│   │   └── generate-contract-pdf/
│   └── config.toml
└── README.md
```

---

## 🚀 Installation

```bash
# Cloner le projet
git clone https://github.com/votre-repo/locabenin.git
cd locabenin

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

---

## 👤 Comptes de démonstration

| Rôle | Email | Accès |
|---|---|---|
| Admin | `ametepemalthus16@gmail.com` | `/ctrl-panel-x` |
| Admin | `learninhack@gmail.com` | `/ctrl-panel-x` |

---

## 📝 Changelog récent

### v2.6.0 (Mars 2025)
- ✅ Upload photos et vidéos dans le CRUD admin (multi-fichiers, max 50MB vidéos)
- ✅ Dashboard propriétaire avec analytics avancés
- ✅ Graphiques de performance : vues, revenus, taux d'occupation
- ✅ Répartition des biens par type et par ville
- ✅ Filtres temporels (7j, 30j, 90j) pour l'analyse

### v2.5.0 (Mars 2025)
- ✅ CRUD complet des annonces pour admin (création, modification, prévisualisation)
- ✅ Consultation détaillée des contrats (parties, montants, signatures, PDF)
- ✅ Notifications admin automatiques sur nouveaux signalements
- ✅ Export CSV/PDF des signalements
- ✅ Amélioration de la navigation admin

### v2.4.0
- ✅ Système de signalements complet
- ✅ Redirection intelligente post-connexion par rôle
- ✅ Exports PDF/CSV pour données admin

---

**LOCABENIN** — *La confiance digitalisée* 🏠
