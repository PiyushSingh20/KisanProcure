# 🌾 KisanProcure (किसानप्रोक्योर)

> **Intelligent Agricultural Procurement & Queue Management Ecosystem**  
> *Built for Smart India Hackathon 2026 — Problem Statement SIH26032*

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Capacitor](https://img.shields.io/badge/Capacitor-Android_Native-119EFF?logo=capacitor&logoColor=white)](https://capacitorjs.com/)
[![NestJS](https://img.shields.io/badge/NestJS-10.0-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Redis](https://img.shields.io/badge/Redis-Cache_%26_Queue-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📌 Executive Summary

Agricultural procurement centres (Mandis / PACS) across India witness severe congestion during peak harvest seasons. Farmers often wait 8–36 hours without accurate scheduling information, leading to produce spoilage, distress selling below Minimum Support Price (MSP), and logistical chaos.

**KisanProcure** addresses problem statement **SIH26032** through an integrated, multi-role digital ecosystem:
- 📱 **Progressive Web App & Native Android APK** for seamless farmer, officer, and administrator access.
- ⏱️ **Real-Time Virtual Queue & Slot Booking Engine** backed by WebSocket subscriptions and deterministic state machines.
- 🤖 **Multi-Agent Decision Intelligence Engine (8 Autonomous Agents)** for dynamic wait-time estimation, crowd forecasting, and conversational vernacular support (**Kisan Sahayak**).
- ⚖️ **Transparent Procurement & Direct Payment Pipeline** tracking quality grading, weighbridge data, and digital receipt generation.

---

## 🏛️ System Architecture

The platform is designed with a **Two-Layer Architecture**: a zero-downtime **Deterministic Core** for mission-critical operations and a **Multi-Agent Intelligence Layer** for predictive analytics.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT / APPLICATION LAYER                      │
│   Farmer Mobile App (Android APK)  │  Officer Tablet  │  Admin Web Portal   │
│   (React 19 + Tailwind v4 + Capacitor Native + Leaflet + Lucide)        │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                         REST API / WebSockets
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          API GATEWAY (NestJS)                          │
│   • JWT Auth + Refresh Tokens   • Role-Based Access Control (RBAC)     │
│   • Rate Limiting & Helmet      • Zod & Class-Validator DTO Schemas   │
└────────────────────────────────────────────────────────────────────────┘
                    │                                    │
                    ▼                                    ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│        DETERMINISTIC CORE            │  │  MULTI-AGENT AI LAYER (8)    │
│ • User & Farmer Identity             │  │ • QueuePredictionAgent       │
│ • Time-Slot Scheduling               │  │ • SlotRecommendationAgent    │
│ • Atomic Token Allocation            │  │ • CenterRecommendationAgent  │
│ • State Machine (Procurement)        │  │ • CrowdPredictionAgent       │
│ • Weighbridge & Quality Logging      │  │ • KisanSahayak (Bilingual)   │
│ • Direct Benefit Transfer (DBT) Mock │  │ • NotificationAgent          │
│ • Audit Trail & Tamper Resistance    │  │ • ProcurementOperationsAgent │
└──────────────────────────────────────┘  │ • DemandForecastAgent        │
                    │                     └──────────────────────────────┘
                    ▼                                    ▲
┌────────────────────────────────────────────────────────┴───────────────┐
│                          DATA & STREAMING LAYER                        │
│   PostgreSQL (Prisma ORM)  │  Redis (BullMQ & Cache)  │  Socket.IO WSS  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🌟 Key Features & Role Portals

### 👨‍🌾 1. Farmer Portal (Mobile-First / Android APK)
- **Instant OTP Login & Profile Management**: Multi-lingual onboarding tailored for rural usability.
- **Smart Centre Finder**: Interactive Leaflet maps displaying nearby procurement centers with live distance, operational status, and capacity.
- **AI Slot Booking & Token Generation**: Intelligent recommendations ranking optimal arrival slots to eliminate physical waiting lines.
- **Live Queue Tracking**: Real-time position tracking (`Position #4`, `Estimated Wait: 18 min`) powered by WebSockets.
- **Quality & Weight Transparency**: Real-time view of grain moisture %, deductions, accepted weight, and total calculated payout.
- **Digital Receipts & Instant Payments**: Downloadable procurement slips with verified token numbers (`KSN-YYYYMMDD-NNNN`).
- **Kisan Sahayak (AI Assistant)**: Bilingual (Hindi & English) query resolution grounded in verified government MSP gazettes and APMC guidelines.

### 👮 2. Procurement Officer Portal
- **Centre Operations Dashboard**: Real-time overview of expected, arrived, and processed farmers.
- **One-Click Token Calling**: Atomic queue calling mechanism preventing dual-booking conflicts.
- **Digital Inspection & Grading**: Entry of moisture analysis, foreign matter %, and grain classification.
- **Electronic Weighbridge Integration**: Log net and gross truck/trolley weights.
- **Procurement State Machine**:
  $$\text{BOOKED} \rightarrow \text{SCHEDULED} \rightarrow \text{WAITING} \rightarrow \text{CALLED} \rightarrow \text{QUALITY\_CHECK} \rightarrow \text{WEIGHMENT} \rightarrow \text{COMPLETED} \rightarrow \text{PAID}$$

### 🏛️ 3. Administrative & State Monitoring Dashboard
- **District & State Level Aggregations**: Procurement volume by crop, district-wise target progress, and fund disbursements.
- **Predictive Crowd & Demand Heatmaps**: Anticipate mandi bottlenecks before peak arrivals.
- **Officer & Center Allocation**: Re-route incoming traffic to under-utilized nearby sub-centers.
- **Comprehensive Audit Logs & Grievance Resolution**: Track farmer complaints with SLA monitoring.

---

## 🤖 AI / ML & Multi-Agent Intelligence

| Agent / Model | Purpose | Technique / Algorithm |
|---|---|---|
| **QueuePredictionAgent** | Dynamic wait-time computation | $M_t / G / c$ queueing model factoring moisture test time & unload speeds |
| **SlotRecommendationAgent** | Personalized slot ranking | Multi-objective scoring balancing farmer distance, centre load, and weather |
| **CenterRecommendationAgent** | Center load rebalancing | Proximity score with penalty on high wait queue depth |
| **CrowdPredictionAgent** | 7-day mandi footfall forecasting | Seasonal LightGBM model with harvest date lag terms |
| **KisanSahayakAgent** | Vernacular farmer Q&A | Grounded Bilingual RAG with pgvector embeddings; zero-hallucination constraint |
| **NotificationAgent** | Proactive dispatching | Smart multi-channel trigger (In-App, SMS, WhatsApp) 45m before token call |
| **ProcurementOpsAgent** | Officer efficiency insights | Bottleneck detection in inspection vs weighment stages |
| **DemandForecastAgent** | State buffer planning | Agmarknet arrival trends & historical procurement curves |

---

## 📁 Repository Directory Structure

```
kisanprocure/
├── android/                   # Capacitor Android Native project & Gradle build scripts
├── apk/                       # Generated installable Android APKs
│   └── KisanProcure.apk       # Ready-to-install Android APK (v1.0.0)
├── kisanprocure-backend/      # Production NestJS Backend Microservice
│   └── kisanprocure-backend/
│       ├── prisma/            # Prisma schema (PostgreSQL relational data models)
│       ├── src/
│       │   ├── auth/          # JWT authentication & OTP verification
│       │   ├── bookings/      # Slot booking engine & conflict management
│       │   ├── tokens/        # Atomic token generator (KSN-YYYYMMDD-NNNN)
│       │   ├── queue/         # Socket.IO WebSocket real-time queue management
│       │   ├── procurement/   # State machine for quality inspection & weighment
│       │   ├── agents/        # 8 Multi-agent decision intelligence implementations
│       │   ├── analytics/     # Government impact & procurement throughput metrics
│       │   └── payments/      # Payment processing & digital receipts
│       ├── Dockerfile         # Backend container definition
│       └── docker-compose.yml # Full-stack orchestration (NestJS + Postgres + Redis)
├── ai/                        # Standalone AI/ML research pipelines & model definitions
│   ├── models/                # Price prediction, queue models, and RAG assistant
│   └── README.md              # Detailed ML architecture documentation
├── src/                       # Frontend Web & Mobile Application (React 19)
│   ├── components/            # Reusable UI components (Navbar, Sidebar, Modals, Cards)
│   ├── pages/
│   │   ├── farmer/            # Farmer portal (Home, Booking, Queue, Map, Payment, etc.)
│   │   ├── officer/           # Officer portal (Dashboard, Queue, Requests, Quality Check)
│   │   └── admin/             # Admin portal (Analytics, Centers, Procurement, Settings)
│   ├── services/              # API clients and WebSocket event handlers
│   ├── routes.ts              # Application routing structure
│   ├── App.tsx                # Main application component
│   └── index.css              # Tailwind CSS v4 styling rules
├── capacitor.config.ts        # Capacitor mobile configuration
├── vite.config.ts             # Vite build & plugin configuration
├── package.json               # Root dependencies & cross-platform scripts
├── ANDROID_APK_GUIDE.md       # Step-by-step Android installation and compilation manual
└── README.md                  # Project documentation
```

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js**: `v20.x` or higher
- **Package Manager**: `npm` or `pnpm`
- **Database**: PostgreSQL 15+ & Redis 7+ (or Docker)
- **Java Toolchain** *(Optional for Android APK building)*: OpenJDK 21 & Android SDK

---

### 1. Frontend Setup (Web & PWA)

```bash
# Clone the repository
git clone https://github.com/PiyushSingh20/KisanProcure.git
cd KisanProcure

# Install dependencies
npm install
# or
pnpm install

# Start the Vite development server
npm run dev
```
Open your browser at `http://localhost:8443` (or the port specified in terminal).

---

### 2. Backend Setup (NestJS + Prisma + Redis)

#### Option A: Running via Docker (Recommended)
```bash
cd kisanprocure-backend/kisanprocure-backend
docker-compose up -d
```
The NestJS API will be available at `http://localhost:3000/api/v1` and Swagger documentation at `http://localhost:3000/docs`.

#### Option B: Manual Local Setup
```bash
cd kisanprocure-backend/kisanprocure-backend

# Install backend dependencies
npm install

# Set up environment variables
cp .env.example .env
# Configure DATABASE_URL and REDIS_URL in .env

# Run database migrations and seed demo data
npx prisma migrate dev
npm run prisma:seed

# Launch backend in development mode
npm run start:dev
```

---

## 📱 Android Native APK (Capacitor)

The project includes an **installable Android application** targeting Android 7.0 (API 24) to Android 16 (API 36).

### 📥 Direct Installation
An installable APK is provided:
- **Root Directory**: `KisanProcure.apk`
- **APK Folder**: `apk/KisanProcure.apk`

Transfer the APK to any Android phone and enable **"Install from unknown sources"** to install.

### 🔨 Rebuilding the Android APK
```powershell
# 1. Build the production React web bundle
npm run build:prod

# 2. Sync web assets to Capacitor Android wrapper
npx cap sync android

# 3. Build the debug APK via Gradle
cd android
.\gradlew.bat assembleDebug

# Output APK located at:
# android/app/build/outputs/apk/debug/app-debug.apk
```
*For detailed mobile build instructions, review [ANDROID_APK_GUIDE.md](file:///d:/New%20folder/ANDROID_APK_GUIDE.md).*

---

## ⚙️ Environment Variables

### Frontend (`.env.production` / `.env.development`)
```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_SOCKET_URL=http://localhost:3000
```

### Backend (`kisanprocure-backend/kisanprocure-backend/.env`)
```env
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kisanprocure?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="kisanprocure_jwt_super_secret"
JWT_REFRESH_SECRET="kisanprocure_refresh_secret"
DEMO_MODE_ENABLED="true"
```

---

## 🧪 Testing & Validation

```bash
# Frontend code formatting & linting
npm run format

# Backend unit and end-to-end tests
cd kisanprocure-backend/kisanprocure-backend
npm run test
npm run test:e2e
```

Critical test suites validate:
1. **Concurrent Slot Booking**: Ensures no double-booking for the same procurement center bay.
2. **State Machine Integrity**: Strictly prohibits skipping verification or weighbridge steps.
3. **Queue Reordering**: Ensures deterministic position calculation when emergency VIP or delayed tokens occur.

---

## 🏆 Smart India Hackathon (SIH 2026) Demo Walkthrough

1. **Farmer Registration**: Navigate to `/register` or launch the APK; sign up with mobile number and OTP.
2. **Produce Declaration**: Register wheat/paddy quantity, moisture estimate, and view current MSP benchmark.
3. **Smart Slot Selection**: Review center recommendations with distance and live queue depth. Select AI-recommended green slot.
4. **Token Generation**: Receive unique token number (e.g. `KSN-20260918-0042`).
5. **Officer Verification**: Open `/officer` on another tab; view pending tokens, click **Call Next**, enter moisture % & weighbridge readout.
6. **Payment & Receipt**: Farmer dashboard updates in real time via WebSockets to show **Procurement Completed** with downloadable invoice slip.
7. **Admin Analytics**: Open `/admin` to inspect real-time turnaround time (TAT), capacity saturation, and farmer satisfaction metrics.

---

## 📄 License & Attribution

This project is licensed under the **MIT License**.  
Developed for **Smart India Hackathon 2026** (Problem Statement: **SIH26032**).
