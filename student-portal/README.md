# 🎓 Digital Minds — Student Orientation Portal

A modern, full-stack student orientation platform built with **Next.js 16**, **tRPC**, **Prisma**, and **Tailwind CSS**. The portal guides prospective students through a chatbot-style questionnaire to discover study, training, and career programs across Europe.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)

---

## ✨ Features

- **Chatbot-Style Questionnaire** — 6-step interactive flow with animated country avatars
- **AI Recommendation Engine** — Smart matching algorithm (language 40%, goals 30%, format 15%, availability 15%)
- **5-Country Avatar System** — Animated mascots for Germany, Italy, Spain, Belgium, and Turkey
- **World Map Selection** — Interactive country picker with visual markers
- **Program Discovery** — Browse language courses, test prep, vocational training, study abroad, and Ausbildung programs
- **Meeting Scheduler** — Book orientation sessions with time slot picker and Google Calendar integration
- **User Profiles** — View questionnaire history, saved programs, and scheduled meetings
- **Admin Dashboard** — Analytics, user management, meeting oversight, and CSV data export
- **Dark/Light Theme** — Beige/white light theme with dark brown/charcoal dark mode
- **Responsive Design** — Mobile-first, fully responsive across all devices
- **Type-Safe API** — End-to-end type safety with tRPC v10+ and Zod validation

---

## 🛠️ Tech Stack

| Layer          | Technology                        |
| -------------- | --------------------------------- |
| Framework      | Next.js 16 (App Router)           |
| Language       | TypeScript 5                      |
| Styling        | Tailwind CSS v4                   |
| API            | tRPC v11 (React Query)            |
| Database       | PostgreSQL + Prisma v7            |
| Authentication | NextAuth.js (Credentials + OAuth) |
| State          | Zustand (with persist)            |
| Animations     | Framer Motion                     |
| Forms          | React Hook Form + Zod             |
| Icons          | Lucide React                      |

---

## 📁 Project Structure

```
student-portal/
├── prisma/
│   └── schema.prisma           # Database schema (User, Response, Meeting, SavedProgram)
├── src/
│   ├── app/
│   │   ├── admin/dashboard/    # Admin dashboard page
│   │   ├── auth/               # Login, Register, Forgot Password pages
│   │   ├── profile/            # User profile page
│   │   ├── questionnaire/      # 6-step chatbot questionnaire
│   │   ├── api/
│   │   │   ├── auth/           # NextAuth route handler
│   │   │   └── trpc/           # tRPC route handler
│   │   ├── globals.css         # Theme variables & global styles
│   │   ├── layout.tsx          # Root layout with providers
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── avatars/            # Country avatar components (6 countries)
│   │   ├── layouts/            # Navbar & Footer
│   │   ├── providers/          # Session & Theme providers
│   │   ├── questionnaire/      # ChatMessage, WorldMap, ProgramCard, etc.
│   │   └── ui/                 # Button, Input, Card, Badge, etc.
│   ├── data/
│   │   └── courses.json        # Complete course & program database
│   ├── generated/prisma/       # Generated Prisma client
│   ├── lib/
│   │   ├── ai-matcher.ts       # AI recommendation scoring engine
│   │   ├── google-calendar.ts  # Calendar URL generators
│   │   ├── prisma.ts           # Database client singleton
│   │   ├── store.ts            # Zustand state management
│   │   ├── trpc.tsx            # tRPC React client & provider
│   │   └── utils.ts            # Utility functions
│   ├── server/
│   │   ├── api/                # tRPC routers (auth, programs, questionnaire, meetings, admin)
│   │   ├── root.ts             # Root router
│   │   └── trpc.ts             # tRPC initialization & middleware
│   ├── types/
│   │   └── index.ts            # TypeScript types & constants
│   └── middleware.ts           # Route protection middleware
├── .env.example                # Environment variable template
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **npm** or **yarn**
- **PostgreSQL** database (or use [Prisma Postgres](https://www.prisma.io/postgres))

### 1. Clone & Install

```bash
git clone <repository-url>
cd student-portal
npm install
```

### 2. Environment Setup

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Required variables:

```env
# Database
DATABASE_URL="prisma+postgres://..."

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Optional: Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. Database Setup

Generate the Prisma client and run migrations:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### 5. Build for Production

```bash
npm run build
npm start
```

---

## 🎨 Design System

### Light Theme (Default)
- **Background:** Beige `#F5F5DC` / White `#FFFFFF`
- **Text:** Dark Brown `#2C2416`
- **Accent:** Muted Gold `#8B7E6A`

### Dark Theme
- **Background:** Dark Brown `#2C2416` / Charcoal `#1A1A1A`
- **Text:** Warm White `#F5F0E8`
- **Accent:** Warm Bronze `#6B5E4F`

---

## 🤖 AI Recommendation Engine

The matching algorithm scores programs based on:

| Factor         | Weight | Description                         |
| -------------- | ------ | ----------------------------------- |
| Language Match | 40%    | Teaching language vs. student level |
| Goal Alignment | 30%    | Program type vs. student's goal     |
| Format Fit     | 15%    | Online/in-person/hybrid preferences |
| Availability   | 15%    | Schedule compatibility              |

Programs are ranked by composite score (0–100%) with human-readable match reasons.

---

## 🌍 Avatar System

Each country has an animated avatar mascot that appears during the questionnaire:

| Country | Emoji | Animation        |
| ------- | ----- | ---------------- |
| Germany | 🇩🇪    | Breathing + Ring |
| Italy   | 🇮🇹    | Breathing + Ring |
| Spain   | 🇪🇸    | Breathing + Ring |
| Belgium | 🇧🇪    | Breathing + Ring |
| Turkey  | 🇹🇷    | Breathing + Ring |
| Default | 🌍    | Breathing + Ring |

Avatars morph between countries with `rotateY` flip transition powered by Framer Motion.

---

## 📝 API Routes (tRPC)

| Router          | Procedures                                                         |
| --------------- | ------------------------------------------------------------------ |
| `auth`          | register, login, getProfile, updateProfile                         |
| `programs`      | getAll, getByCountry, getByCategory, getById, save, unsave         |
| `questionnaire` | saveResponses, getResponses, getLatestResponse, getRecommendations |
| `meetings`      | create, getMyMeetings, cancel, getAll (admin), updateStatus        |
| `admin`         | getStats, getUsers, getUserDetail, updateUserRole                  |

---

## 🔒 Authentication

- **Credentials:** Email/password with bcrypt hashing
- **Google OAuth:** Optional social login
- **JWT Strategy:** Secure session tokens
- **Route Protection:** Middleware guards for `/profile`, `/questionnaire`, `/admin`

---

## 📊 Admin Dashboard

- **Overview Stats:** Total users, responses, meetings, completion rates
- **Distribution Charts:** Goal and country breakdowns
- **Meeting Management:** View, filter, complete, or cancel meetings
- **User Management:** Search users, toggle admin roles
- **User Detail Modal:** Full user history and activity
- **CSV Export:** Download meeting and user data

---

## 📜 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npx prisma studio    # Open Prisma database GUI
npx prisma generate  # Regenerate Prisma client
npx prisma migrate dev  # Run database migrations
```

---

## 📄 License

This project is licensed under the MIT License.
