# KSLU Circle

<div align="center">
  <img src="frontend/public/logo-icon.svg" width="90" height="90" alt="KSLU Circle Emblem" />
  <h3>Your Academic World, All in One Circle.</h3>
  <p><strong>Independent Student Peer-Learning and Academic Resource Platform for Law Students in Karnataka</strong></p>
</div>

---

> [!IMPORTANT]
> **Independent Academic Disclaimer**
> 
> **KSLU Circle** is an independent student peer-learning and academic repository platform. It is **not affiliated with, endorsed by, sponsored by, or operated by Karnataka State Law University (KSLU)** or any governmental entity. All university circulars, dates, and official syllabus guidelines must be cross-verified on the official university portal at [kslu.karnataka.gov.in](https://kslu.karnataka.gov.in).

---

## 1. Project Overview

**KSLU Circle** unites law students across Karnataka's affiliated law colleges (Bangalore, Hubballi, Dharwad, Mangalore, Mysuru, Belagavi, Kalaburagi, and Tumakuru) into a single, high-performance academic ecosystem.

### Core Modules & Capabilities:
- **Academic Hierarchy Management**: Direct structural support for **Three-Year LL.B** (6 Semesters) and **Five-Year Integrated B.A. LL.B, B.B.A. LL.B, B.Com. LL.B, and B.Sc. LL.B** (10 Semesters). Centrally manages subjects, subject codes, credits, and marking schemes (**Scheme 80 Marks** and **Scheme 100 Marks**).
- **Previous Year Question Papers (PYQ Library)**: Comprehensive filtering by Course, Semester, Subject, Scheme, and Examination Year. Features an in-browser PDF viewer with page navigation, zoom in/out, fullscreen mode, bookmarks, and download tracking.
- **Moderated Study Notes Repository**: Students upload handwritten lecture notes, doctrine analyses, and case briefs. Notes undergo an administrative review queue (**Pending, Approved, Rejected with Reason**) before public indexing, alongside community voting (upvotes/downvotes) and resource reporting.
- **AI Study Assistant**: Pedagogical legal assistant configured for Indian jurisprudence. Explains doctrines (e.g. *Article 21 Due Process Evolution*, *Strict vs. Absolute Liability*, *Damnum Sine Injuria*), generates high-yield 16-mark and 8-mark practice questions, and helps students structure model answers.
- **Student Community Forum**: Subject-wise discussion boards with questions, answers, upvoting, nested comments, and verified accepted solutions.
- **Law Career & Moot Hub**: Curated listings for judicial research clerkships at the High Court of Karnataka, Tier-1 law firm internships, national moot court competitions, and research fellowships.
- **Announcements & Academic Updates**: Real-time notifications for examination timetables, revaluation windows, and university circulars with verified source links.
- **Role-Based Administration Portal**: Executive dashboards with platform analytics, content moderation, syllabus and PYQ management, report resolution, and immutable audit logs. Superadmin maintains exclusive control over role elevation.
- **Bilingual & Responsive Interface**: Professional legal design in Deep Navy (`#0F172A`) and Muted Gold (`#D97706`), supporting Light/Dark themes and English/Kannada (`KN`) language toggles.

---

## 2. Technology Stack

### Frontend
- **Framework**: React 18, Vite 6
- **Styling**: Tailwind CSS (custom legal navy/gold color palette), Lucide React
- **Motion & UI**: Framer Motion
- **Routing**: React Router v6
- **State & Context**: Context API (AuthContext, ThemeContext, LanguageContext, NotificationContext)
- **Forms & Validation**: React Hook Form, Zod
- **Networking**: Axios with request/response interceptors & HttpOnly cookie support
- **Real-Time**: Socket.io Client
- **SEO & Metadata**: React Helmet Async

### Backend
- **Runtime**: Node.js (v18+ / v24 compatible)
- **Server**: Express.js, Socket.io
- **ORM & Database**: Prisma ORM, PostgreSQL (Neon Serverless PostgreSQL in production) with zero-config SQLite local dev fallback
- **Authentication**: JWT (JSON Web Tokens), HttpOnly Secure Cookies, Bcrypt.js password hashing
- **File Storage**: Dual storage architecture — Cloudinary for permanent cloud storage in production, local disk storage with static streaming fallback for offline local development
- **Uploads & Validation**: Multer with MIME-type and 25MB file-size validation
- **Security**: Helmet, CORS with strict whitelist, Express Rate Limit, Input Sanitization
- **Logging**: Morgan HTTP logger and database-backed `AuditLog` model

---

## 3. Project Architecture

```
kslu-circle/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma           # 18 Relational database models
│   │   └── seed.js                 # Realistic KSLU academic seed data & PDFs
│   ├── scripts/
│   │   └── setup-db.js             # Automated DB provider adapter (Neon/Postgres/SQLite)
│   ├── src/
│   │   ├── config/                 # DB singleton, JWT config, Cloudinary
│   │   ├── controllers/            # Auth, Academic, PYQs, Notes, AI, Community, Admin
│   │   ├── middleware/             # Auth, RBAC, Upload, Rate Limiter, Error, Audit
│   │   ├── routes/                 # Express route definitions
│   │   ├── services/               # File service, Email service, Socket.io, AI service
│   │   ├── utils/                  # API response helpers, Logger, PDF generator
│   │   ├── validators/             # Zod validation schemas
│   │   ├── tests/                  # Integration API test suite (Node test runner)
│   │   └── server.js               # Main HTTP & Socket.io Express server
│   ├── uploads/                    # Local storage for PYQs and notes
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/                     # Favicons, logo-icon.svg
│   ├── src/
│   │   ├── api/                    # Centralized Axios client with interceptors
│   │   ├── components/
│   │   │   ├── common/             # Navbar, Footer, Toast, SkeletonLoader, EmptyState
│   │   │   └── pdf/                # PDFViewerModal with zoom, pages & fullscreen
│   │   ├── contexts/               # Auth, Theme, Language, Notification contexts
│   │   ├── layouts/                # PublicLayout, StudentLayout, AdminLayout
│   │   ├── pages/
│   │   │   ├── public/             # Home, About, Contact, CourseExplorer
│   │   │   ├── pyq/                # PYQLibraryPage
│   │   │   ├── notes/              # NotesLibraryPage, UploadNotePage
│   │   │   ├── ai/                 # AIAssistantPage
│   │   │   ├── community/          # CommunityPage
│   │   │   ├── career/             # CareerHubPage
│   │   │   ├── announcements/      # AnnouncementsPage
│   │   │   ├── student/            # Dashboard, Bookmarks, Contributions, Profile
│   │   │   ├── admin/              # AdminDashboard, Moderation, Academic, Users, etc.
│   │   │   └── auth/               # Login, Register, ForgotPassword, ResetPassword
│   │   ├── routes/                 # ProtectedRoute, AdminRoute, AppRoutes
│   │   ├── i18n/                   # English & Kannada translations
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vercel.json                 # SPA rewrite rules
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── .env.example
│   └── package.json
│
├── render.yaml                     # Render backend deployment descriptor
├── package.json                    # Monorepo workspace configuration
└── README.md
```

---

## 4. Quick Start & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Step 1: Clone and Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-username/kslu-circle.git
cd kslu-circle

# Install dependencies across all workspaces
npm install
```

### Step 2: Initialize Database and Seed Data
```bash
# Automatically sets up the database schema and seeds official KSLU programs, subjects, PYQs, and notes
cd backend
npm run setup:db
npm run seed
cd ..
```

### Step 3: Start Development Servers
From the root directory, launch both backend and frontend concurrently:
```bash
npm run dev
```
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- **Backend Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 5. Demo Accounts for Instant Evaluation

The database seed script provides three pre-configured accounts. On the Login page ([http://localhost:5173/login](http://localhost:5173/login)), one-click demo buttons automatically populate these credentials:

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Student** | `student@kslucircle.org` | `Student@2025!` | Browse PYQs, Download, Upload notes, Bookmarks, Forum |
| **Admin** | `admin@kslucircle.org` | `Admin@2025!` | Notes moderation queue, Upload PYQs, Subject management |
| **Superadmin** | `superadmin@kslucircle.org` | `SuperAdmin@2025!` | Exclusive user role management, system audit logs, full access |

---

## 6. Environment Variables

### Backend (`backend/.env`)
```ini
PORT=5000
NODE_ENV=development

# Database: Neon PostgreSQL connection string in production (or file:./dev.db for local dev)
DATABASE_URL="file:./dev.db"

# Authentication & Security
JWT_SECRET="kslu_circle_dev_secret_jwt_key_at_least_32_characters_long"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173,https://kslu-circle.vercel.app"
CLIENT_URL="http://localhost:5173"

# File Storage (Cloudinary for Production, local for Development)
UPLOAD_STORAGE="local"
UPLOAD_DIR="./uploads"
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
CLOUDINARY_FOLDER="kslu-circle"

# Email Configuration (Nodemailer)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM="KSLU Circle <noreply@kslucircle.org>"

# AI Study Assistant
GEMINI_API_KEY=""
```

### Frontend (`frontend/.env`)
```ini
VITE_API_URL="http://localhost:5000/api"
VITE_SOCKET_URL="http://localhost:5000"
VITE_APP_NAME="KSLU Circle"
```

---

## 7. Automated Testing Suite

The backend includes a comprehensive integration test suite verifying health checks, authentication, curriculum indexing, PYQs, note retrieval, community discussions, and AI explanations:

```bash
cd backend
npm test
```

All 12 integration tests run against the live schema and verify end-to-end functionality.

---

## 8. Production Deployment Guide

### A. Database Deployment (Neon Serverless PostgreSQL)
1. Sign up at [neon.tech](https://neon.tech) and create a new project named `kslu-circle`.
2. Copy the pooled connection string:
   ```
   postgresql://username:password@ep-xxxx.neon.tech/kslu_circle?sslmode=require
   ```
3. Set `DATABASE_URL` in your production environment.
4. Run `npx prisma generate && npx prisma db push` to synchronize the schema.
5. Run `node prisma/seed.js` to populate the initial curriculum and administrator accounts.

### B. Backend Deployment (Render)
1. In [Render Dashboard](https://dashboard.render.com), create a new **Web Service** pointing to the repository.
2. Root Directory: `backend`
3. Environment: `Node`
4. Build Command: `npm install && npx prisma generate`
5. Start Command: `npm start`
6. Add the environment variables listed in `backend/.env.example`.
7. For persistent file storage across server restarts, supply `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` with `UPLOAD_STORAGE=cloudinary`.

### C. Frontend Deployment (Vercel)
1. In [Vercel Dashboard](https://vercel.com), import the Git repository.
2. Root Directory: `frontend`
3. Framework Preset: `Vite`
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Environment Variables:
   - `VITE_API_URL`: Your Render backend API URL (e.g. `https://kslu-circle-backend.onrender.com/api`)
   - `VITE_SOCKET_URL`: Your Render backend URL (e.g. `https://kslu-circle-backend.onrender.com`)
7. Deploy. Single-page application routing is automatically handled by `frontend/vercel.json`.

---

## 9. Security & Governance

- **Password Hashing**: Bcrypt with a salt factor of 10.
- **Session Protection**: HttpOnly, SameSite cookies and Bearer tokens for secure mobile/desktop sessions.
- **Input Sanitization**: Strictly validated against Zod schemas before database execution.
- **Role-Based Access Control**: Route-level middleware guarding `USER`, `ADMIN`, and `SUPERADMIN` access tiers. Sensitive operations (such as role elevation) are strictly locked to `SUPERADMIN`.
- **Audit Logging**: Sensitive events (logins, role alterations, note approvals, resource deletions) write immutable records to the `AuditLog` table.
- **File Validation**: Multi-layer validation confirming MIME types and file extensions, enforcing a 25MB ceiling for legal manuscripts and scans.

---

## 10. License

KSLU Circle is open-source educational software distributed under the **MIT License**.
