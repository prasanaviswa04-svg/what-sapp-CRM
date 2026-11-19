# EstateFlow AI | Real Estate WhatsApp CRM & Automation Platform

![EstateFlow AI](https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80)

EstateFlow AI is an enterprise-grade, production-ready, AI-Powered Customer Relationship Management (CRM) and WhatsApp Business Automation Platform engineered specifically for luxury real estate firms, brokers, builders, and property dealers.

It unifies property inventory management, multi-channel customer relationship records, a 10-stage visual sales pipeline, an AI property recommendation engine, automated follow-up cadences, property site visit scheduling, booking agreements, financial transaction ledgers, and official Meta WhatsApp Cloud API communication into one centralized, high-performance web platform.

---

## 🌟 Key Architecture & Highlights

- **Full-Stack SaaS Architecture:**
  - **Frontend:** React 18, Vite, Tailwind CSS, Recharts, Lucide Icons, Socket.IO Client, React Router v6.
  - **Backend:** Node.js, Express.js REST API, Socket.IO for real-time live messaging and notifications.
  - **Database:** MongoDB with Mongoose schemas, compound indexes, phone normalization, multi-tenant isolation, and aggregation pipelines.
  - **Embedded Database Fallback:** Automatically initializes `mongodb-memory-server` in local development if an external MongoDB URI is not supplied, ensuring **100% out-of-the-box functionality with zero initial setup**.
  - **AI Engine:** OpenAI API integration (`gpt-4o-mini`, `gpt-4o`) with database-grounded recommendations (never invents property prices or availability) and an intelligent built-in conversational fallback engine when external API keys are not supplied.
  - **Official WhatsApp Cloud API:** Full webhook verification, HMAC-SHA256 signature verification, media sending/receiving, interactive buttons, 24-hour service window tracking, and template messaging.
  - **Interactive Webhook Simulator:** Built-in tool in the UI allowing brokers and developers to simulate customer WhatsApp messages and watch AI auto-responses and CRM lead capture in real time!
  - **Human Takeover Control:** Brokers can pause AI auto-replies with 1 click to chat personally with high-priority buyers.

---

## 🧭 Application Modules & Navigation

The platform features a responsive, collapsible sidebar with all 18 enterprise modules:

1. **Overview Dashboard:** Live KPI cards (Customers, Leads, Available/Sold Properties, Site Visits, Bookings, Revenue, Messages), Recharts monthly inquiry bar chart, category distribution pie chart, lead funnel, and broker performance leaderboard.
2. **Customers (CRM):** Complete customer database with phone normalization (E.164 deduplication), advanced search, budget filters, CSV export, and detailed customer profile tabs (Preferences, Matched Properties, Leads, WhatsApp Chat, Visits, Bookings, Audit Timeline).
3. **Leads & Pipeline:** 10-stage interactive Kanban board (*New Enquiry, Contacted, Requirements Collected, Qualified, Property Recommended, Site Visit Scheduled, Negotiation, Booking Confirmed, Converted, Lost*) with AI score (0-100) and lost-reason tracking.
4. **Properties Inventory:** Verified property listings across Apartments, Villas, Commercial, Plots, and Rentals with status controls (*Available, Reserved, Sold, Under Negotiation*), built-up area, price per sq.ft, image galleries, and booking safety locks.
5. **AI Property Matching:** Intelligent recommendation engine evaluating customer budget, locality, bedrooms, and amenities using weighted scoring (0-100%) with matching factor explanations and 1-click WhatsApp sharing.
6. **WhatsApp Inbox:** 3-panel WhatsApp Web-style interface with real-time Socket.IO chat, delivery status ticks (*sent, delivered, read*), property card inserter, customer summary sidebar, and Human Takeover toggle.
7. **AI Assistant & Knowledge Base:** AI personality configuration, system prompt guidelines, auto-reply toggle, knowledge base FAQ and policy manager, and live AI Chat Playground.
8. **Bookings & Visits (Appointments):** Site walkthrough scheduler with conflict detection (prevents double-booking brokers), calendar and list views, and WhatsApp reminders.
9. **Follow-Up Automation:** Configurable cadence workflows (*New Enquiry Welcome, 24h Site Visit Reminder, Post-Visit Feedback, Inactive Lead Re-engagement*) with delay nodes and execution logs.
10. **Tasks & Reminders:** Operational task management with status tracking (*Pending, In Progress, Completed*), priority flags, and due date alerts.
11. **Campaigns & Broadcasts:** WhatsApp Broadcast campaigns targeted by customer segment (*Hot Leads, Luxury Seekers, New Prospects*) with delivery analytics.
12. **Payments & Transactions:** Financial ledgers tracking booking advances, milestone payments, remaining balances, and downloadable printable official receipts.
13. **Reports & Analytics:** Business intelligence reports powered by MongoDB aggregations, date range selectors, and lost-lead breakdown charts.
14. **Team Management:** Broker and sales agent roster, role-based access control, active lead workload distribution, and account activation controls.
15. **Integrations Center:** Official Meta WhatsApp Business Cloud API credentials, OpenAI API key configuration, and webhook status indicators.
16. **Activity & Audit Logs:** Comprehensive immutable audit trail capturing actor, entity, action, and timestamp for all platform events.
17. **Settings:** Agency branding, currency symbol, timezone, and **One-Click Demo Data Seeder / Reset**.
18. **Help & Support:** Full operational guide, Meta developer configuration walkthrough, and WhatsApp 24-hr customer service window policies.

---

## ⚡ Quick Start & Local Development

### Prerequisites
- Node.js v18+ and npm installed

### 1. Installation
Install all dependencies for root, server, and client:
```bash
# Install root, backend, and frontend dependencies
npm run install:all
```

### 2. Environment Configuration
Create a `.env` file in the `server` directory (or use default zero-configuration mode):
```bash
cp server/.env.example server/.env
```

Contents of `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI= # Leave empty to use embedded in-memory MongoDB automatically!
JWT_SECRET=estateflow-super-secret-jwt-key-2026
JWT_EXPIRES_IN=2h
JWT_REFRESH_SECRET=estateflow-refresh-secret-jwt-key-2026
JWT_REFRESH_EXPIRES_IN=7d

# Meta WhatsApp Cloud API credentials
META_WHATSAPP_TOKEN=
META_PHONE_NUMBER_ID=
META_WABA_ID=
META_APP_SECRET=
META_WEBHOOK_VERIFY_TOKEN=estateflow_verify_token_2026
META_API_VERSION=v21.0

# OpenAI Configuration
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

### 3. Start Application
```bash
# Start backend server (runs on http://localhost:5000)
npm run server

# In another terminal, start React frontend dev server (runs on http://localhost:5173)
npm run client
```

*Note: The backend also automatically serves the compiled production build from `http://localhost:5000` when built.*

### 4. Default Login Credentials
Open your browser to `http://localhost:5173` (or `http://localhost:5000`):
- **Email:** `admin@estateflow.io`
- **Password:** `Admin@12345`
*(There is also a convenient "Fill Demo Admin Credentials" button on the login screen for 1-click access!)*

---

## 📲 Official Meta WhatsApp Cloud API Webhook Setup

1. Open [Meta for Developers](https://developers.facebook.com) and navigate to your WhatsApp Business App.
2. In the sidebar under **WhatsApp &gt; Configuration**:
   - **Callback URL:** `https://your-domain.com/api/whatsapp/webhook`
   - **Verify Token:** `estateflow_verify_token_2026` (or the token configured in your EstateFlow Integrations page)
3. Click **Verify and Save**.
4. Under **Webhook fields**, click **Manage** and subscribe to:
   - `messages`
   - `message_deliveries`
5. In **Business Manager**, generate a Permanent System User Token with `whatsapp_business_messaging` permissions and paste it into **EstateFlow &gt; Integrations**.

### Testing Without Meta Credentials
EstateFlow includes a built-in **WhatsApp Webhook Simulator**:
- Click the **WhatsApp AI Simulator** button in the top navigation bar.
- Choose a sample buyer persona (e.g., "3 BHK Apartment Discovery", "Villa Seeker", or "Human Broker Escalation").
- Click **Simulate Incoming Webhook** to test the entire lead creation, AI requirement extraction, and grounded property response loop instantly!

---

## 🛡️ Security & Reliability Policies

- **Bcrypt Password Hashing:** All user passwords are encrypted with salted hashes.
- **Role-Based Access Control:** Super Admin, Company Admin, Real Estate Manager, Property Broker, Sales Agent, Customer Support Agent.
- **Tenant Isolation:** Every document is strictly bound to `companyId`.
- **Double-Selling Prevention:** Atomic status updates ensure that a property with an active confirmed booking cannot be re-booked or marked Available until cancelled.
- **Audit Logging:** Every administrative action, booking confirmation, and communication event is recorded in the activity audit trail.
- **Customer Consent:** Tracks marketing consent and strictly honors WhatsApp opt-out requests.

---

## 🚀 Cloud Deployment

### 1. Frontend (Vercel)
- Set Root Directory to `client`
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variables: `VITE_API_BASE_URL=https://your-backend.onrender.com/api`

### 2. Backend (Render / Railway / AWS)
- Set Root Directory to `server`
- Build Command: `npm install`
- Start Command: `npm start`
- Provide `MONGO_URI`, `JWT_SECRET`, and Meta credentials in the environment variables.

---

## 📄 License
EstateFlow AI is licensed under the ISC License. Copyright 2026 EstateFlow AI Team.
