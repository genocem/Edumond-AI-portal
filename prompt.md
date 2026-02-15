# AI Agent Task: Build Next.js + tRPC Student Orientation Portal

## Project Overview
Create a production-ready Next.js application with tRPC for an AI-oriented student orientation portal that helps students find suitable programs from a predefined course pool.

## Tech Stack Requirements
- **Framework**: Next.js 14+ (App Router)
- **API Layer**: tRPC v10+
- **Authentication**: NextAuth.js or Clerk
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS with custom beige/white theme
- **State Management**: Zustand or React Context
- **Form Handling**: React Hook Form + Zod validation
- **Calendar Integration**: Google Calendar API

## Design System
### Color Palette
**Light Theme**:
- Primary: Beige (#F5F5DC, #E8E8D0)
- Secondary: White (#FFFFFF, #FAFAFA)
- Accent: Warm neutrals (#D4C5B0, #8B7E6A)

**Dark Theme**:
- Primary: Dark Brown (#2C2416, #3D3527)
- Secondary: Charcoal (#1A1A1A, #262626)
- Accent: Muted beige (#6B5E4F, #4A4034)

## Data Structure
### Course Pool (JSON)
```json
{
  "courses": {
    "language_courses": [
      {
        "id": "cours-allemand",
        "name": "Cours d'Allemand",
        "description": "Cours d'allemand du niveau A1 à C1...",
        "price": null,
        "format": "Présentiel/En ligne",
        "capacity": "8–12 étudiants",
        "levels": ["A1","A2","B1","B2","C1"],
        "duration": {...},
        "curriculum_highlights": [...]
      }
      // ... other language courses
    ],
    "test_preparation_courses": [...],
    "other_training_categories": [...]
  },
  "other_services": {
    "etudes_a_l_etranger": {...},
    "ausbildung_en_allemagne": {...}
  }
}
```

## User Journey Pipeline

### Phase 1: Landing Page
- **Requirement**: Appealing, conversion-optimized UI
- **Key Elements**:
  - Hero section with clear value proposition
  - CTA button leading to questionnaire
  - Features showcase
  - Testimonials/social proof
  - Responsive design

### Phase 2: Interactive Questionnaire (Chatbot-style)

**Visual Guide**: Animated assistant avatar accompanies user throughout the journey
- Default avatar introduces questionnaire and asks initial questions
- Avatar smoothly transitions to country-specific variant after country selection
- Avatar provides visual continuity and cultural personalization

**Question Flow**:
1. **Goal Selection**
   - "Are you searching to: Study abroad | Find jobs (recruitment) | Professional training abroad?"
   
2. **Country Selection**
   - Display interactive world map
   - Highlight available countries: Germany, Italy, Spain, Belgium, Turkey
   - Allow single country selection

3. **Language Proficiency**
   - Ask for English level: A1, A2, B1, B2, C1, C2
   - Ask for native language level of selected country

4. **Path-Specific Questions**:
   - **If Job Selected**: Display available job/Ausbildung options
   - **If Study Selected**: Display available study/training programs
   
5. **Meeting Scheduling**
   - Show available time slots
   - Allow user to select preferred meeting time

**Storage**: Use localStorage/sessionStorage before authentication

### Phase 3: Authentication Gate
- **Action**: Prompt user registration/login after questionnaire completion
- **Data Migration**: Transfer localStorage data to database upon successful auth
- **Provider Options**: Email/password, Google OAuth, LinkedIn OAuth

### Phase 4: Recommendation Display
- **AI Matching Algorithm**: Match user profile to best-fit programs
- **Display**:
  - Top 3-5 recommended programs
  - Match score/percentage
  - Program details (price, duration, format, levels)
  - CTA buttons (Enroll, Learn More, Save)

### Phase 5: Calendar Integration
- **Feature**: Save meeting to Google Calendar
- **Implementation**: OAuth flow + Calendar API
- **Details to Include**: Meeting time, description, location/link

## Required Interfaces

### 1. Authentication System
**Pages/Components**:
- `/auth/register` - Registration form
- `/auth/login` - Login form
- `/auth/forgot-password` - Password reset
- Protected route middleware

**Features**:
- Email verification
- Password strength validation
- Session management
- Role-based access (user/admin)

### 2. Questionnaire Interface
**Route**: `/questionnaire`
**Style**: Conversational chatbot UI with animated assistant avatar

**Avatar System**:
- **Default Avatar**: Generic, friendly assistant that guides users initially
- **Country-Specific Avatars**: After country selection, avatar transforms to match selected country's cultural representation
  - Germany: German-themed avatar (traditional or modern German aesthetic)
  - Italy: Italian-themed avatar (Mediterranean, Italian cultural elements)
  - Spain: Spanish-themed avatar (Spanish cultural representation)
  - Belgium: Belgian-themed avatar (Belgian cultural elements)
  - Turkey: Turkish-themed avatar (Turkish cultural representation)
- **Avatar Behavior**:
  - Animated transitions when switching avatars
  - Subtle idle animations (breathing, blinking)
  - Reaction animations to user interactions
  - Positioned consistently (typically left side or bottom corner)
  - Responsive sizing for mobile/tablet/desktop

**Components**:
- `AssistantAvatar` - Main avatar component with country-specific variants
- `AvatarTransition` - Smooth morphing/fade animation between avatars
- `ChatMessage` - Display question/answer bubbles
- `WorldMap` - Interactive SVG/Canvas map
- `LanguageSelector` - Dropdown with CEFR levels
- `ProgramCard` - Selectable program options
- `TimeSlotPicker` - Calendar-style time selection
- Progress indicator
- Back/Next navigation

### 3. Admin Dashboard
**Route**: `/admin/dashboard`
**Features**:
- Upcoming meetings table (sortable, filterable)
- User management interface
- Meeting details modal
- User profile quick view
- Analytics/statistics cards
- Export data functionality

**Key Views**:
- Calendar view of all meetings
- User list with filter by status/goal
- Individual user profile drill-down

### 4. User Profile
**Route**: `/profile`
**Sections**:
- Personal information editor
- Questionnaire responses history
- Recommended programs
- Scheduled meetings
- Saved programs/courses
- Account settings
- Role badge display

## Technical Implementation Details

### Project Structure
```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   ├── questionnaire/
│   │   ├── profile/
│   │   └── admin/
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── forms/
│   │   ├── questionnaire/
│   │   ├── avatars/            # Avatar components
│   │   │   ├── AssistantAvatar.tsx
│   │   │   ├── DefaultAvatar.tsx
│   │   │   ├── GermanyAvatar.tsx
│   │   │   ├── ItalyAvatar.tsx
│   │   │   ├── SpainAvatar.tsx
│   │   │   ├── BelgiumAvatar.tsx
│   │   │   └── TurkeyAvatar.tsx
│   │   └── layouts/
│   ├── server/
│   │   ├── api/                # tRPC routers
│   │   │   ├── auth.ts
│   │   │   ├── questionnaire.ts
│   │   │   ├── programs.ts
│   │   │   └── meetings.ts
│   │   └── db/                 # Prisma client
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── ai-matcher.ts       # AI recommendation logic
│   │   └── google-calendar.ts
│   ├── types/
│   └── data/
│       └── courses.json
├── prisma/
│   └── schema.prisma
├── public/
│   └── avatars/                # Avatar assets
│       ├── default.svg (or .png)
│       ├── germany.svg
│       ├── italy.svg
│       ├── spain.svg
│       ├── belgium.svg
│       └── turkey.svg
└── PROGRESS.md                 # Task tracking file
```

### Database Schema (Prisma)
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  password      String
  role          Role      @default(USER)
  responses     Response[]
  meetings      Meeting[]
  createdAt     DateTime  @default(now())
}

model Response {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  goal            String   // study_abroad | job | training
  country         String
  englishLevel    String
  nativeLevel     String?
  selectedPrograms String[] // JSON array
  createdAt       DateTime @default(now())
}

model Meeting {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  datetime    DateTime
  status      MeetingStatus @default(SCHEDULED)
  notes       String?
  createdAt   DateTime @default(now())
}

enum Role {
  USER
  ADMIN
}

enum MeetingStatus {
  SCHEDULED
  COMPLETED
  CANCELLED
}
```

### tRPC Routers Structure
```typescript
// Example router structure
export const appRouter = router({
  auth: authRouter,          // register, login, logout
  questionnaire: questionnaireRouter,  // save responses, get recommendations
  programs: programsRouter,   // get courses, filter, search
  meetings: meetingsRouter,   // create, update, list
  admin: adminRouter,         // dashboard data, user management
});
```

### AI Recommendation Logic
**File**: `src/lib/ai-matcher.ts`
**Algorithm**:
1. Parse user responses (goal, country, language levels)
2. Filter courses by availability in selected country
3. Match language level requirements
4. Score based on:
   - Language proficiency match (40%)
   - Goal alignment (30%)
   - Format preference (15%)
   - Availability/capacity (15%)
5. Return top 5 ranked programs with match scores

### Google Calendar Integration
**Requirements**:
- OAuth 2.0 setup
- Scope: `calendar.events`
- Store refresh tokens securely
- Handle token expiration

## Development Workflow

### Initial Setup Commands
```bash
npx create-next-app@latest student-portal --typescript --tailwind --app
cd student-portal
npm install @trpc/server @trpc/client @trpc/next @tanstack/react-query
npm install @prisma/client zod react-hook-form @hookform/resolvers
npm install next-auth zustand
npm install framer-motion  # For avatar animations
npm install -D prisma
npx prisma init
```

### Avatar Implementation Guide

**Animation Library**: Use Framer Motion for smooth transitions

**Avatar Component Structure**:
```typescript
// Example structure
interface AvatarProps {
  country: 'default' | 'germany' | 'italy' | 'spain' | 'belgium' | 'turkey';
  isAnimating?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const AssistantAvatar: React.FC<AvatarProps> = ({ country, isAnimating, size }) => {
  // Implementation with framer-motion transitions
  // Lottie or SVG animations for idle states
  // Smooth morphing between country variants
}
```

**Avatar Design Guidelines**:
- Use SVG or Lottie animations for scalability
- Keep file sizes under 200KB per avatar
- Implement lazy loading for non-active avatars
- Cultural sensitivity: Avatars should be respectful, modern representations
- Consistent art style across all variants
- Accessibility: Include alt text and reduced motion support

**Recommended Avatar Features**:
- Idle animations: gentle breathing, blinking (2-3 second loop)
- Transition animations: morphing/fading between avatars (0.5-0.8s duration)
- Interaction feedback: subtle nod or gesture when user selects an answer
- Loading state: subtle shimmer or pulse while processing

**Avatar State Management**:
```typescript
// Store in questionnaire state
const [currentAvatar, setCurrentAvatar] = useState<AvatarType>('default');

// Trigger change on country selection
const handleCountrySelect = (country: string) => {
  setCurrentAvatar(country as AvatarType);
  // Trigger transition animation
};
```

### Progress Tracking
**Create**: `PROGRESS.md` file with checkboxes for:
- [ ] Project initialization
- [ ] Database schema setup
- [ ] tRPC configuration
- [ ] Authentication system
- [ ] Landing page
- [ ] Avatar system
  - [ ] Default avatar design/integration
  - [ ] Country-specific avatar variants (5 countries)
  - [ ] Avatar transition animations
  - [ ] Idle animation states
- [ ] Questionnaire flow
  - [ ] Goal selection step
  - [ ] Interactive world map with country selection
  - [ ] Avatar transition on country selection
  - [ ] Language proficiency questions
  - [ ] Path-specific questions (job/study)
  - [ ] Meeting scheduling
- [ ] AI recommendation engine
- [ ] Admin dashboard
- [ ] User profile
- [ ] Google Calendar integration
- [ ] Testing
- [ ] Deployment

## Best Practices to Follow
1. **Next.js**:
   - Use Server Components by default
   - Client Components only when needed (interactivity)
   - Implement proper loading.tsx and error.tsx
   - Use metadata API for SEO

2. **tRPC**:
   - Type-safe procedures
   - Input validation with Zod
   - Proper error handling
   - Middleware for auth checks

3. **Security**:
   - Hash passwords with bcrypt
   - Implement CSRF protection
   - Validate all inputs
   - Use environment variables for secrets
   - Rate limiting on sensitive endpoints

4. **Performance**:
   - Lazy load components
   - Optimize images with next/image
   - Implement pagination for large lists
   - Use React.memo where appropriate

5. **Accessibility**:
   - Semantic HTML
   - ARIA labels
   - Keyboard navigation
   - Color contrast compliance
   - Reduced motion support for avatar animations (respect prefers-reduced-motion)
   - Screen reader announcements for avatar transitions

6. **Avatar & Animations**:
   - Use CSS transforms and Framer Motion for performance
   - Implement IntersectionObserver to pause animations when off-screen
   - Provide static fallback images for low-end devices
   - Respect user's reduced motion preferences
   - Keep animation files optimized (<200KB each)

## Deliverables Checklist
- [ ] Functional Next.js app with all routes
- [ ] Complete tRPC API layer
- [ ] Prisma schema and migrations
- [ ] Authentication system with role management
- [ ] Interactive questionnaire with data persistence
- [ ] Avatar system with smooth transitions
  - [ ] Default assistant avatar
  - [ ] 5 country-specific avatar variants
  - [ ] Animated transitions and idle states
- [ ] AI-powered recommendation system
- [ ] Admin dashboard with full CRUD
- [ ] User profile interface
- [ ] Google Calendar integration
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Dark/light theme toggle
- [ ] PROGRESS.md tracking file
- [ ] README with setup instructions
- [ ] Environment variables template (.env.example)

## Testing Requirements
- Unit tests for AI matcher
- Integration tests for tRPC routes
- E2E tests for critical flows (registration, questionnaire, booking)
- Test both light and dark themes

## Deployment Considerations
- Vercel (recommended for Next.js)
- Railway/Supabase for PostgreSQL
- Environment variables configuration
- Database migration strategy
- Error monitoring (Sentry)

---

## Agent Instructions
1. Start by creating PROGRESS.md to track your work
2. Initialize the Next.js project with all dependencies
3. Set up Prisma schema and tRPC configuration first
4. Build components in this order: Auth → Questionnaire → Profile → Admin
5. Test each feature before moving to the next
6. Update PROGRESS.md after completing each major task
7. Follow the color scheme strictly
8. Ensure type safety throughout
9. Write clean, documented code
10. Prioritize user experience and performance
