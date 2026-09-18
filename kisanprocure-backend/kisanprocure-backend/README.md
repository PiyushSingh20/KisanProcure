# KisanProcure Backend

**Intelligent Farmer Procurement Management Platform for SIH 2026 (Problem Statement SIH26032)**

## 🎯 Problem Statement

Farmers often face long waiting times, lack of information regarding procurement schedules, and uncertainty about procurement status. KisanProcure solves this through:

- **Real-time queue management** with WebSocket updates
- **Intelligent scheduling** with AI-powered slot recommendations
- **Procurement tracking** with state machine
- **Multi-channel notifications** (In-app, Push, SMS, WhatsApp)
- **Analytics & impact measurement**
- **Multi-agent AI intelligence** (8 specialized agents)

## 🏗️ Architecture

```
Frontend
    ↓
API Gateway (NestJS)
    ↓
Authentication & Authorization (JWT + RBAC)
    ↓
Core Business Services (Deterministic Core)
    ↓
PostgreSQL (Primary) + Redis (Cache/Queue/Real-time)
    ↓
Message Queue (BullMQ/Redis)
    ↓
Notification + Analytics + AI Agent Layer
```

### Two-Layer Design

**Deterministic Core** - Handles critical operations (never depends on AI):
- Authentication, User management
- Slot booking, Token generation
- Queue updates, Procurement records
- Weighment, Payment status
- Permissions, Audit logs

**Intelligence Layer** - AI/Multi-agent services:
- Waiting-time prediction
- Crowd prediction
- Slot/Center recommendation
- Demand forecasting
- Farmer assistance
- Operational insights

AI agents recommend; deterministic services validate and execute.

## 🤖 Multi-Agent Architecture

```
Agent Orchestrator
    |
    ├── QueuePredictionAgent
    ├── SlotRecommendationAgent
    ├── CenterRecommendationAgent
    ├── CrowdPredictionAgent
    ├── NotificationAgent
    ├── KisanSahayakAgent (Farmer Support)
    ├── ProcurementOperationsAgent
    └── DemandForecastAgent
```

All agents communicate through structured JSON, access data via secure tools, and have graceful fallbacks.

## 🛠️ Tech Stack

- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: NestJS (modular, dependency injection)
- **Database**: PostgreSQL with Prisma ORM
- **Cache/Queue**: Redis with BullMQ
- **Real-time**: Socket.IO WebSockets
- **Auth**: JWT with refresh tokens, RBAC (FARMER/OFFICER/ADMIN)
- **API Docs**: Swagger/OpenAPI
- **Validation**: class-validator + Zod
- **Containerization**: Docker + Docker Compose

## 📦 Project Structure

```
src/
├── auth/                 # Authentication & OTP
├── users/                # User management
├── farmers/              # Farmer profiles & produce
├── officers/             # Officer management
├── admins/               # Admin management
├── centers/              # Procurement centers
├── crops/                # Crop management
├── schedules/            # Schedules & slots
├── bookings/             # Booking management
├── tokens/               # Token system
├── queue/                # Real-time queue + WebSocket
├── procurement/          # Procurement state machine
├── payments/             # Payment abstraction
├── notifications/        # Multi-channel notifications
├── complaints/           # Complaint management
├── analytics/            # Analytics & impact
├── events/               # Event-driven architecture
├── agents/               # AI agents + orchestrator
├── demo/                 # SIH demo simulation
├── health/               # Health checks
├── orchestrator/         # Agent orchestrator
├── queue-agent/          # Queue prediction agent
├── slot-agent/           # Slot recommendation agent
├── center-agent/         # Center recommendation agent
├── crowd-agent/          # Crowd prediction agent
├── notification-agent/   # Notification agent
├── support-agent/        # KisanSahayak agent
├── operations-agent/     # Operations agent
├── demand-agent/         # Demand forecast agent
└── common/               # Shared utilities
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Docker (optional)

### Local Development

```bash
# Clone and install
cd kisanprocure-backend
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database/redis URLs

# Setup database
npx prisma migrate dev
npm run prisma:seed

# Start development server
npm run start:dev

# Or with Docker (one command)
docker-compose up -d
```

### API Documentation

- Swagger UI: http://localhost:3000/docs
- API Base: http://localhost:3000/api/v1

## 🔐 Authentication

### OTP Flow (Recommended)
```bash
# Send OTP
POST /api/v1/auth/send-otp { "mobileNumber": "9876543210" }

# Verify OTP
POST /api/v1/auth/verify-otp { "mobileNumber": "9876543210", "otp": "123456" }
```

### Password Login
```bash
POST /api/v1/auth/login { "mobileNumber": "9876543210", "password": "farmer123" }
```

### Refresh Token
```bash
POST /api/v1/auth/refresh { "refreshToken": "..." }
```

## 📋 Key API Endpoints

### Farmer Endpoints
- `GET /api/v1/farmers/me` - Profile
- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/bookings/me` - My bookings
- `GET /api/v1/tokens/me` - My tokens
- `GET /api/v1/queue/center/:centerId/farmer` - Queue status
- `GET /api/v1/procurement/me` - Procurement history
- `GET /api/v1/payments/me` - Payments
- `POST /api/v1/agents/slot-recommendation` - AI slot recommendation
- `POST /api/v1/agents/support` - Ask KisanSahayak

### Officer Endpoints
- `GET /api/v1/officers/me/center` - Assigned center
- `POST /api/v1/tokens/call-next` - Call next token
- `POST /api/v1/procurement/start` - Start procurement
- `POST /api/v1/procurement/:id/quality-check` - Quality check
- `POST /api/v1/procurement/:id/weighment` - Weighment
- `POST /api/v1/procurement/:id/complete` - Complete with pricing
- `POST /api/v1/payments` - Create payment

### Admin Endpoints
- `GET /api/v1/analytics/overview` - System overview
- `GET /api/v1/analytics/impact` - Impact metrics
- `GET /api/v1/analytics/centers` - All centers analytics
- `POST /api/v1/demo/simulate` - Demo simulation

## 🐳 Docker Deployment

```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Services
- **backend**: NestJS API (port 3000)
- **postgres**: PostgreSQL 15 (port 5432)
- **redis**: Redis 7 (port 6379)
- **worker**: Background job processor (optional)

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

### Critical Tests
- Concurrent slot booking (2 farmers, 1 slot)
- Concurrent token calling (2 officers, 1 token)
- State machine transitions
- RBAC permissions

## 📊 Key Features Implemented

### Real-time Queue
- WebSocket subscriptions per center
- Live position updates
- Estimated wait times
- Token called notifications

### Token System
- Format: `KSN-YYYYMMDD-NNNN`
- Unique, traceable, time-bound
- Race-condition free (DB transactions)

### Procurement State Machine
```
BOOKED → SCHEDULED → WAITING → CALLED → ARRIVED 
    → QUALITY_CHECK → WEIGHMENT → PROCUREMENT_COMPLETED 
    → PAYMENT_PENDING → PAYMENT_COMPLETED
```

### Payment Abstraction
- Mock provider for demo
- Interface ready for real providers
- Receipt generation

### AI Agents (8)
1. **QueuePredictionAgent** - Wait time prediction
2. **SlotRecommendationAgent** - Best slot ranking
3. **CenterRecommendationAgent** - Alternative centers
4. **CrowdPredictionAgent** - Daily crowd forecast
5. **NotificationAgent** - Smart notification timing
6. **KisanSahayakAgent** - Farmer Q&A (no hallucination)
7. **ProcurementOperationsAgent** - Officer insights
8. **DemandForecastAgent** - Seasonal demand

### Demo Mode
```bash
POST /api/v1/demo/simulate { "action": "full_flow", "params": {...} }
```
Simulates: booking → queue → officer → procurement → payment

## 🔒 Security

- JWT with short expiry (15min) + refresh tokens
- Rate limiting per endpoint type
- Input validation (class-validator + Zod)
- RBAC on all endpoints
- Audit logging for sensitive operations
- Prompt injection protection for AI agents
- No direct DB access for agents

## 📈 Analytics & Impact

- Average waiting time
- Center utilization
- Slot utilization
- No-show rate
- Payment completion rate
- **Impact metrics**: Estimated wait reduction, visits avoided

## 🎮 Demo Flow for SIH

1. Farmer registers → OTP verification
2. Adds wheat produce (quantity, expected price)
3. Finds nearby procurement center
4. Views real-time queue
5. **AI recommends best slot** (11:30 AM - "Lowest expected wait")
6. Books slot → Token generated (KSN-20240115-0042)
6. Receives notification
7. Views live queue (position 8, est. 32 min)
8. Officer calls token → Farmer status: CALLED
9. Quality check → Weighment
10. Procurement completed → Payment initiated
11. Payment completed → Digital receipt
12. History updated → Analytics updated

## 📝 Environment Variables

See `.env.example` for all variables:
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_URL` - Redis connection
- `JWT_SECRET` - Access token secret
- `JWT_REFRESH_SECRET` - Refresh token secret
- `DEMO_MODE_ENABLED` - Enable demo endpoints

## 📄 License

MIT License - Built for SIH 2026