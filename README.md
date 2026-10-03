# CanteenFlow 🍽️⚡
### Smart Campus Canteen Management & Online Food Ordering Platform
> **Tagline:** *Your campus canteen, without the chaos.*

---

## 1. Overview & Vision
College canteens face severe congestion during short meal breaks, leading to long queues, uncertain food availability, and delayed payment processing. **CanteenFlow** eliminates counter bottlenecks through:
- **Immediate & Capacity-Aware Scheduled Ordering:** Students can place instant kitchen orders or reserve guaranteed 15-minute pickup slots, protected against overbooking.
- **Transparent Menus & Real-time Stock:** Dietary tags (Veg, Vegan, High-Protein, Gluten-Free), preparation estimates, and live stock tracking prevent overselling.
- **Digital Tokens & QR Counter Handover:** Visual order progress (Placed → In Kitchen → Ready → Collected) paired with clean digital pickup tokens (`#CF-101`).
- **Flexible Payments:** Integrated UPI & Razorpay support, plus configurable Cash-at-Counter payment tracking.
- **Operational Staff & Admin Cockpits:** Real-time Kanban kitchen queue, pickup verification station, inventory restock logging, and institutional dining analytics.

---

## 2. Design System: Premium White Liquid Glass
CanteenFlow implements a modern **White Liquid Glass** aesthetic inspired by translucent glass surfaces:
- **Primary Theme:** Crisp Warm White (`#FAFBFC`) & Pure White (`#FFFFFF`).
- **Text:** High-contrast Dark Charcoal (`#172033`) & Secondary Slate (`#687386`).
- **Accents:** Electric Campus Blue (`#477DE0`), Fresh Emerald (`#269566`), Warm Amber (`#E5A33E`), and Rose (`#D94F52`).
- **Translucency & Depth:** `backdrop-filter: blur(16px)`, fine borders (`#E8ECF2`), soft shadows, and fluid Framer Motion transitions.

---

## 3. Technology Stack

### Frontend
- **Framework:** React 18 with TypeScript & Vite
- **Styling:** Tailwind CSS with custom Liquid Glass design tokens
- **Animations:** Framer Motion
- **Routing:** React Router v7
- **Server State:** TanStack React Query
- **Icons:** Lucide React
- **Celebrations:** Canvas Confetti

### Backend
- **Runtime:** Node.js with TypeScript & Express
- **Architecture:** Modular monolith (`modules/`, `database/`, `middleware/`, `config/`)
- **Realtime:** Server-Sent Events (SSE) live event broadcaster
- **Validation:** Zod schemas
- **Security:** Helmet, CORS, Express Rate Limit, Cookie Parser

### Database & Payments
- **PostgreSQL / Supabase:** Complete multi-tenant schema with Row Level Security (RLS) policies in `supabase/migrations/20251003_canteenflow_init.sql`
- **Dual Execution Engine:**
  - **Live Supabase Mode:** Active when `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided.
  - **Development Sandbox Mode:** Pre-populated in-memory & persisted repository for Apex Institute of Technology & Green Leaf Canteen, with instant 1-click persona testing.
- **Payment Gateway:** Razorpay order generation & HMAC SHA-256 webhook verification + Development Simulator.

---

## 4. User Roles & Workflows

### 🎓 Role A: Student (Aarav Sharma)
- **Home Dashboard:** Personalized time-based greeting, canteen open status, active live order banner.
- **Menu Explorer:** Search, category filters, dietary filter pills, live stock counter, and food details modal.
- **Checkout:** Mode selector between **Immediate** and **Scheduled 15-min Pickup Window** (with live remaining capacity calculation), payment method selection (UPI, Card, Cash at Counter).
- **Live Order Tracker:** Progress stepper with digital token (`#CF-101`), scannable QR simulation, and cancellation rule support.

### 👨‍🍳 Role B: Canteen Staff (Chef Vikram Patel)
- **Staff Dashboard:** KPI cards for incoming orders, kitchen queue, ready counter items, and daily revenue.
- **Live Order Kanban:** Realtime order board columns (Incoming → Accepted → Cooking → Ready → Collected) with 1-click state transitions.
- **Counter Pickup Station:** Rapid token search (`CF-101`), QR verification, and 1-click collection confirmation.
- **Menu & Inventory Manager:** CRUD menu items, toggle sold-out status, set preparation estimates, and log inventory adjustments with reasons.
- **Sales Reports & Settings:** Daily reconciliation breakdown and operating schedule configuration.

### 🏛️ Role C: College Administrator (Dean Priya Menon)
- **Executive Dashboard:** Total meal volume, gross campus revenue, peak rush hour heatmap (12:00-14:00 & 16:00-17:00).
- **Performance Analytics:** Day-of-week demand, item revenue matrix, and payment channel distribution.
- **Financial Ledger & Reconciliation:** Searchable transaction history across UPI, Card, and Cash with refund processing and CSV export.
- **Student Reviews & Feedback:** CSAT score, star distribution breakdown, and verified dining feedback feed.
- **User & Role Access:** Assign student, canteen staff, and admin permissions.
- **Canteen Policies & Audit:** Configure tenant billing, campus tax rate, cancellation cutoff, and inspect operational audit logs.

---

## 5. Application Routes Summary

| Category | Route | Purpose |
| :--- | :--- | :--- |
| **Public** | `/` | Liquid-glass marketing landing page |
| | `/login` & `/signup` | Campus authentication & credentials |
| | `/privacy` & `/terms` | Editable institutional legal policies |
| **Student** | `/student/home` | Personalized hub, active order banner, quick menu links |
| | `/student/menu` | Search, dietary pills (Veg, Vegan, Gluten-free), modal view |
| | `/student/checkout` | Immediate vs. 15-min scheduled slot, UPI/Card/Cash selection |
| | `/student/orders` | Historical & active order overview with reordering |
| | `/student/orders/:id` | Realtime progress stepper, digital token (`#CF-101`), meal review |
| | `/student/profile` | Contact information & dining preferences |
| **Staff** | `/staff/dashboard` | Shift KPIs, kitchen queue, ready counter items, revenue |
| | `/staff/orders` | Realtime Kanban board (Incoming → Cooking → Ready → Collected) |
| | `/staff/pickup` | Fast token search, barcode verification, collection confirm |
| | `/staff/menu` | Item creation, category ordering, price adjustments, sold-out toggle |
| | `/staff/inventory` | Live stock levels, low-stock alerts, adjustment logging |
| | `/staff/reports` | Daily sales summary and payment breakdown |
| | `/staff/settings` | Operating hours and canteen configuration |
| **Admin** | `/admin/dashboard` | Campus dining overview, active orders, today's revenue |
| | `/admin/analytics` | Peak hour heatmap, weekday trends, revenue leaders |
| | `/admin/payments` | Financial ledger, transaction search, refund processing, CSV export |
| | `/admin/feedback` | CSAT score (4.6/5.0), star distribution, verified student reviews |
| | `/admin/users` | User management & role assignment |
| | `/admin/canteens` | Multi-canteen tenant settings |
| | `/admin/audit` | Tamper-evident operational audit trail |
| | `/admin/settings` | Tax rate, advance order horizon, cancellation window |

---

## 6. Local Quickstart

### Prerequisites
- Node.js 18+ & npm

### Installation
```bash
# Install root, backend, and frontend dependencies
npm run install:all
```

### Run in Development Mode
```bash
# Starts both Backend (Port 5000) and Frontend (Port 5173) concurrently
npm run dev
```

Open your browser to [http://localhost:5173](http://localhost:5173).

---

## 7. One-Click Demo Personas
When launched, CanteenFlow displays a persistent **Quick Switch Role** bar at the top of the screen:
- Click **Student (Aarav)** to test browsing, cart, immediate/scheduled checkout, live order tracking, and meal rating.
- Click **Staff (Vikram)** to test kitchen order dispatch, Kanban transitions, inventory restock, and counter pickup verification.
- Click **Admin (Priya)** to inspect campus analytics, peak hour heatmaps, payment ledger, feedback moderation, and audit logs.

---

## 8. Running Automated Tests & Production Build

```bash
# Run backend vitest suite (Unit, Concurrency, and Order Transition tests)
npm test

# Build both backend and frontend for production deployment
npm run build
```

---

## 9. Supabase & Razorpay Production Deployment

1. Create a project in [Supabase](https://supabase.com).
2. Execute the SQL migration file in `supabase/migrations/20251003_canteenflow_init.sql` using the Supabase SQL Editor.
3. Configure your production environment variables:
   ```env
   PORT=5000
   NODE_ENV=production
   CLIENT_URL=https://your-canteenflow-app.vercel.app
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   RAZORPAY_KEY_ID=rzp_live_your_key_id
   RAZORPAY_KEY_SECRET=your_key_secret
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
   ```
4. Deploy the frontend to **Vercel** and the backend to **Render** or any standard Node.js container host.

---

## 10. Deploying to GitHub (Security Checklist & Steps)

CanteenFlow has been audited and configured with strict security standards so that it is **100% safe to deploy and publish on GitHub**:

### Security Protections in Place:
- :white_check_mark: **Comprehensive `.gitignore`**: Secret `.env` files, `.local`, `node_modules/`, `dist/`, logs, and IDE caches are strictly excluded from git tracking.
- :white_check_mark: **Cryptographic JWT & RBAC**: Requests are verified using HMAC SHA-256 JWTs. In production, unauthenticated requests and header spoofing are blocked.
- :white_check_mark: **Safe Template**: Only `.env.example` with non-sensitive variable names and empty secret values is tracked.
- :white_check_mark: **GitHub Actions CI**: Automated `.github/workflows/ci.yml` validates dependencies, runs the 29-test security & workflow suite, and tests production compilation on every push.
- :white_check_mark: **Security Policy**: Full vulnerability disclosure guidance and control explanations documented in [`SECURITY.md`](SECURITY.md).

### Pushing to your GitHub Repository:
```bash
# 1. Stage all tracked files (verifying .env and dist are excluded)
git add .

# 2. Check staged files to confirm no credentials are included
git status

# 3. Create your initial commit
git commit -m "feat: Initial commit of CanteenFlow platform with hardened security"

# 4. Link your GitHub repository and push:
git branch -M main
git remote add origin https://github.com/<your-username>/canteenflow.git
git push -u origin main
```

