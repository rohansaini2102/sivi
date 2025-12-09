# Sivi Academy - Project Memory

This file is automatically loaded into Claude Code's context at session start.

## Quick Reference

| Aspect | Details |
|--------|---------|
| **Project** | SiviAcademy - LMS for Rajasthan govt exam prep |
| **Stack** | Next.js 16, Express.js, TypeScript, MongoDB, Mongoose |
| **Auth** | JWT with HttpOnly cookies, OTP via Hostinger SMTP |
| **Payments** | Razorpay (pending integration) |
| **Storage** | Cloudflare R2 (pending) |
| **Hosting** | Vercel (frontend), GCP Cloud Run (backend) |

---

## All Documentation (Auto-imported)

### Core Architecture
@docs/architecture.md
@docs/database-schema.md
@docs/prd.md

### Feature Systems
@docs/course-system.md
@docs/quiz-system.md
@docs/test-series.md
@docs/store-catalog.md
@docs/user.md

### Admin & Content
@docs/admin-dashboard.md
@docs/course-builder-plan.md
@docs/content-management.md

### Technical
@docs/payment-plan.md
@docs/security.md
@docs/analytics.md
@docs/ui-system.md
@docs/HOSTING.md

### Rules & Progress
@docs/rules.md
@docs/progress.md

### Fix Plans
@docs/quiz-system-fix-plan.md

---

## Key Conventions

### Code Style
- TypeScript strict mode everywhere
- Mongoose for all database operations
- Zod/Joi for input validation
- JWT stored in HttpOnly cookies (not localStorage)

### API Structure
- `/api/auth/*` - Authentication (public)
- `/api/store/*` - Catalog browsing (public)
- `/api/learn/*` - Course learning (authenticated)
- `/api/test/*` - Test series (authenticated)
- `/api/admin/*` - Admin operations (admin only)

### Security Rules
- Always validate payment amounts server-side
- Never trust client-side price data
- Use signed URLs for file access
- Rate limit auth endpoints
- Verify Razorpay signatures on webhooks

---

## Past Mistakes & Learnings

### Payment Security (Dec 2024)
- Issue: Client could manipulate payment amounts
- Fix: Always fetch price from database, never from request body
- File: `backend/src/routes/payment.routes.ts`

### Session Security
- Issue: JWT in localStorage was vulnerable to XSS
- Fix: Moved to HttpOnly cookies with proper CORS
- Files: `auth.middleware.ts`, `auth.controller.ts`

### Database Indexing
- Issue: Slow queries on enrollments
- Fix: Added compound indexes on frequently queried fields
- Collections: Enrollments, QuizAttempts, TestAttempts

---

## Auto-Generated Knowledge

Session insights are automatically saved by the note-taker hook:
@.claude/knowledge/index.md

---

## Common Commands

```bash
# Frontend
cd frontend && npm run dev

# Backend
cd backend && npm run dev

# Build
npm run build

# Deploy
git push origin main  # Auto-deploys via Vercel/GCP
```

## Important Files

### Backend Entry Points
- `backend/src/app.ts` - Express setup
- `backend/src/server.ts` - Server entry
- `backend/src/routes/index.ts` - Route aggregator

### Frontend Entry Points
- `frontend/src/app/page.tsx` - Landing page
- `frontend/src/app/layout.tsx` - Root layout
- `frontend/src/lib/api.ts` - API client

### Config Files
- `backend/.env` - Backend environment
- `frontend/.env` - Frontend environment
- `.claude/settings.local.json` - Claude Code settings
