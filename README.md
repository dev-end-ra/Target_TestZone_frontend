# 🎯 Target TestZone — Frontend

<div align="center">

  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/React_Router-v6-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white" />
  <img src="https://img.shields.io/badge/Recharts-2-22B5BF?style=for-the-badge" />

</div>

<br />

> The client-side application for Target TestZone — a premium mock test platform for **MHT-CET** and **JEE** aspirants. Built with React + Vite, featuring a TCS iON-style exam interface, interactive analytics, and an admin management panel.

---

## 📁 Folder Structure

```
frontend/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Sticky navbar: logo | nav links | profile dropdown
│   │   └── Layout.jsx          # Wraps pages with Navbar for authenticated routes
│   │
│   ├── pages/
│   │   ├── Login.jsx           # Two-column auth page (credentials + Google OAuth)
│   │   ├── Home.jsx            # Personalized dashboard: hero, stats, test cards
│   │   ├── MockTests.jsx       # Test library with search, type filter, live status
│   │   ├── Exam.jsx            # Full TCS iON-style exam interface
│   │   ├── ResultAnalysis.jsx  # Pie & bar charts, KPI cards, PDF download
│   │   ├── SolutionReview.jsx  # Per-question solution with correct/wrong highlight
│   │   ├── Results.jsx         # Full test history table
│   │   ├── Profile.jsx         # Avatar upload, personal info, performance stats
│   │   ├── AdminDashboard.jsx  # Admin: students, tests, bulk import
│   │   └── PendingApproval.jsx # Screen shown to unapproved students
│   │
│   ├── App.jsx                 # Router with ProtectedRoute / ApprovedRoute / AdminRoute
│   ├── main.jsx                # Entry: BrowserRouter + GoogleOAuthProvider
│   └── index.css               # Full design system (tokens, components, animations)
│
├── .env                        # Environment variables (VITE_GOOGLE_CLIENT_ID)
├── index.html
├── vite.config.js
└── package.json
```

---

## ⚙️ Setup & Installation

**1. Install dependencies**
```bash
npm install
```

**2. Create `.env` file**
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

**3. Start development server**
```bash
npm run dev
```

App runs at → **http://localhost:5173**

---

## 🧭 Pages & Routes

| Route | Page | Access |
|-------|------|--------|
| `/login` | Login / Register | Public |
| `/pending` | Awaiting Admin Approval | Logged in (not approved) |
| `/home` | Home Dashboard | Approved students |
| `/tests` | Mock Test Library | Approved students |
| `/exam` | Exam Interface | Approved students |
| `/results` | Test History | Approved students |
| `/result/:id` | Result Analysis | Approved students |
| `/review/:id` | Solution Review | Approved students |
| `/profile` | Student Profile | All logged-in users |
| `/admin` | Admin Hub | Admin role only |

---

## 📦 Key Dependencies

| Package | Purpose |
|---------|---------|
| `react-router-dom` | Client-side routing |
| `axios` | HTTP requests to backend |
| `@react-oauth/google` | Google One-Tap / OAuth |
| `recharts` | Interactive charts (pie, bar) |
| `jspdf` + `jspdf-autotable` | PDF report generation |
| `lucide-react` | Icon library |

---

## 🎨 Design System

- **Font**: [Outfit](https://fonts.google.com/specimen/Outfit) (Google Fonts)
- **Color tokens**: CSS custom properties (`--brand`, `--success`, `--danger`, etc.)
- **Components**: `.card`, `.btn`, `.badge`, `.alert`, `.stat-card`, `.data-table`
- **Animations**: `fadeIn`, `slideUp`, `slideInLeft` keyframes with stagger support
- **Exam palette**: `not-visited`, `not-answered`, `answered`, `marked`, `marked-answered`

---

## 🔐 Route Guards

```
ProtectedRoute   → Requires valid JWT token
ApprovedRoute    → Requires JWT + status === 'approved' (admin bypasses)
AdminRoute       → Requires JWT + role === 'admin'
```

---

> 📌 Backend API runs at `http://localhost:5000` — make sure it is running before starting the frontend.
