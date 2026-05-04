# Deploy Context — Project_dtdm (Ecommerce Microservices)

> Generated: 2026-04-27

---

## 1. Tech Stack

### Backend (all 3 services)
| Layer | Technology |
|---|---|
| Runtime | Node.js 20 (Alpine) |
| Framework | Express.js 4.18.2 |
| Database | PostgreSQL via Neon (serverless cloud, AWS ap-southeast-1) |
| DB client | pg (node-postgres) 8.11.3 — raw SQL, no ORM |
| Auth | JWT (jsonwebtoken 9.0.2) + bcryptjs password hashing |
| Validation | Joi 17.11.0 |
| Email | Nodemailer 6.9.7 (Gmail SMTP) |
| AI/LLM | Groq SDK 0.3.3 — Llama 3 (llama3-8b-8192) |
| HTTP client | Axios 1.6.2 (inter-service calls) |
| API docs | swagger-jsdoc 6.2.8 + swagger-ui-express 5.0.0 |
| Security | Helmet 7.1.0, express-rate-limit 7.1.5, CORS |
| Logging | Winston 3.11.0 |
| Testing | Jest 29.7.0 + Supertest 6.3.3 |
| Dev tooling | Nodemon 3.0.2 |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 19.0.0 |
| Build tool | Vite 6.3.5 |
| Styling | Tailwind CSS 4.1.7 + styled-components 6.1.17 |
| State | React Context API (Auth, User, Cart, Notifications) |
| Data fetching | TanStack React Query 5.76.1 |
| Routing | React Router 7.6.0 (primary), 5.3.4 (legacy) |
| Animation | Framer Motion 12.12.1 |
| Forms | React Hook Form 7.56.3 |
| Charts | Recharts 2.15.3 |
| Maps | OpenLayers (ol) 10.5.0 |
| Icons | React Icons 5.5.0, Heroicons, Ionicons |
| Backend (optional) | Supabase JS 2.49.8 |
| Toasts | React Hot Toast 2.5.2 |
| Linting | ESLint 8.57.1 |
| CSS processing | PostCSS 8.5.3 + Autoprefixer |

### DevOps / Deployment
| Layer | Technology |
|---|---|
| Containerization | Docker (node:20-alpine base) |
| Orchestration | Kubernetes (1.27+) |
| Container registry | Azure Container Registry — `ecommerceacr2026.azurecr.io` |
| Ingress | Nginx Ingress Controller |
| Infrastructure as code | Terraform (Azure) |

---

## 2. System Architecture

### Service Map

```
┌─────────────────────────────────────────────────────────────┐
│               FRONTEND  React + Vite                        │
│  Dev: http://localhost:5173   Prod: http://localhost:3000   │
│                                                             │
│  Context Providers: Auth · User · Cart · Notifications      │
│  TanStack Query for API calls via Axios                     │
│                                                             │
│  VITE_AUTH_SERVICE_URL  → http://localhost:3001             │
│  VITE_AI_SERVICE_URL    → http://localhost:3002             │
│  VITE_CORE_SERVICE_URL  → http://localhost:3003             │
└───────────────────┬────────────────┬───────────────┬────────┘
                    │                │               │
         ┌──────────▼──────┐ ┌──────▼──────┐ ┌─────▼───────┐
         │  AUTH SERVICE   │ │ AI SERVICE  │ │CORE SERVICE │
         │  Port 3001      │ │ Port 3002   │ │ Port 3003   │
         │                 │ │             │ │             │
         │ Register/Login  │ │ Chatbot     │ │ Products    │
         │ JWT issuance    │ │ Chat history│ │ Orders      │
         │ Token refresh   │ │ Recommends  │ │ Payments    │
         │ Password reset  │ │ Groq LLM    │ │ Categories  │
         │ User profiles   │ │ User prefs  │ │ Discounts   │
         │ Admin user mgmt │ │             │ │             │
         │                 │ │ → calls     │ │             │
         │  DB: auth_db    │ │   auth svc  │ │ DB: neondb  │
         │  (Neon)         │ │   core svc  │ │ (Neon)      │
         └─────────────────┘ │ DB: ai_db   │ └─────────────┘
                             │ (Neon)      │
                             └─────────────┘
```

### Inter-service Communication
- **AI Service → Auth Service**: validates JWT tokens on protected routes
- **AI Service → Core Service**: fetches product data for recommendations
- All calls are internal HTTP via env-configured service URLs
- In Docker: resolved via `ecommerce-network` bridge DNS
- In Kubernetes: resolved via cluster DNS (`auth-service:3001`, etc.)

### Kubernetes Ingress Routing
```
/api/auth  →  auth-service:3001
/api/ai    →  ai-service:3002
/api       →  core-service:3003
/          →  frontend:80
```

---

## 3. Directory Structure

```
Project_dtdm/
├── backend/
│   ├── auth-service/           # Port 3001
│   │   ├── src/
│   │   │   ├── app.js          # Express entry point
│   │   │   ├── config/         # DB, JWT, Swagger config
│   │   │   ├── controllers/    # Request handlers
│   │   │   ├── middleware/     # Auth validation, error handling
│   │   │   ├── models/         # User, RefreshToken, PasswordResetToken
│   │   │   ├── routes/         # Auth endpoints
│   │   │   ├── services/       # Business logic
│   │   │   └── utils/          # Logger, helpers
│   │   ├── database/schema.sql
│   │   ├── tests/
│   │   ├── package.json
│   │   ├── Dockerfile
│   │   ├── .env
│   │   └── .env.example
│   │
│   ├── ai-service/             # Port 3002
│   │   └── src/
│   │       ├── app.js
│   │       ├── config/
│   │       ├── controllers/    # Chat, Recommendation
│   │       ├── middleware/
│   │       ├── models/         # ChatHistory, UserPreferences
│   │       ├── routes/
│   │       ├── services/       # Groq integration
│   │       └── utils/
│   │
│   └── core-service/           # Port 3003
│       └── src/
│           ├── app.js
│           ├── config/
│           ├── controllers/    # Product, Order, Payment, Category
│           ├── middleware/
│           ├── models/         # Product, Order, Category, DiscountCode
│           ├── routes/
│           ├── services/
│           └── utils/
│
├── Ecommerce_Website/          # Frontend
│   ├── srcs/
│   │   ├── main.jsx            # React root + providers
│   │   ├── App.jsx             # Main routing
│   │   ├── adminRoute.jsx      # Admin dashboard routing
│   │   ├── components/
│   │   │   ├── features/       # Auth, Products, Cart, Admin, ChatBot
│   │   │   ├── pages/          # Page components
│   │   │   ├── ui/             # Layout components
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   └── services/       # API call wrappers
│   │   ├── utils/              # CartContext, ScrollToTop
│   │   ├── styles/
│   │   └── assets/
│   ├── public/
│   ├── docker/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── eslint.config.js
│   └── .env / .env.example
│
├── k8s/
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── auth-service.yaml
│   ├── ai-service.yaml
│   ├── core-service.yaml
│   ├── frontend.yaml
│   └── ingress.yaml
│
├── infrastructure/terraform/   # Azure IaC
├── docker-compose.yml          # Full-stack local orchestration
└── .env.example                # Root environment template
```

---

## 4. Entry Points

| Service | Entry Point | Port | Start Command |
|---|---|---|---|
| Auth Service | `backend/auth-service/src/app.js` | 3001 | `npm start` / `npm run dev` |
| AI Service | `backend/ai-service/src/app.js` | 3002 | `npm start` / `npm run dev` |
| Core Service | `backend/core-service/src/app.js` | 3003 | `npm start` / `npm run dev` |
| Frontend (dev) | `Ecommerce_Website/srcs/main.jsx` | 5173 | `npm run dev` |
| Frontend (prod) | `Ecommerce_Website/index.html` → `dist/` | 80 | `npm run build` |

All backend services:
1. Load `.env` config
2. Test PostgreSQL connection
3. Start Express listener

---

## 5. Dependencies (Full)

### Auth Service (`backend/auth-service/package.json`)
```json
"dependencies": {
  "bcryptjs": "^2.4.3",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "express": "^4.18.2",
  "express-rate-limit": "^7.1.5",
  "helmet": "^7.1.0",
  "joi": "^17.11.0",
  "jsonwebtoken": "^9.0.2",
  "nodemailer": "^6.9.7",
  "pg": "^8.11.3",
  "swagger-jsdoc": "^6.2.8",
  "swagger-ui-express": "^5.0.0",
  "uuid": "^9.0.1",
  "winston": "^3.11.0"
},
"devDependencies": {
  "@jest/globals": "^29.7.0",
  "jest": "^29.7.0",
  "nodemon": "^3.0.2",
  "supertest": "^6.3.3"
}
```

### AI Service (`backend/ai-service/package.json`)
```json
"dependencies": {
  "axios": "^1.6.2",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "express": "^4.18.2",
  "express-rate-limit": "^7.1.5",
  "groq-sdk": "^0.3.3",
  "helmet": "^7.1.0",
  "pg": "^8.11.3",
  "swagger-jsdoc": "^6.2.8",
  "swagger-ui-express": "^5.0.0",
  "uuid": "^9.0.1",
  "winston": "^3.11.0"
}
```

### Core Service (`backend/core-service/package.json`)
```json
"dependencies": {
  "axios": "^1.6.2",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "express": "^4.18.2",
  "express-rate-limit": "^7.1.5",
  "helmet": "^7.1.0",
  "joi": "^17.11.0",
  "pg": "^8.11.3",
  "swagger-jsdoc": "^6.2.8",
  "swagger-ui-express": "^5.0.0",
  "uuid": "^9.0.1",
  "winston": "^3.11.0"
}
```

### Frontend (`Ecommerce_Website/package.json`) — key packages
```json
"dependencies": {
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "react-router": "^5.3.4",
  "react-router-dom": "^7.6.0",
  "@tanstack/react-query": "^5.76.1",
  "axios": "^1.9.0",
  "framer-motion": "^12.12.1",
  "react-hook-form": "^7.56.3",
  "styled-components": "^6.1.17",
  "recharts": "^2.15.3",
  "react-hot-toast": "^2.5.2",
  "react-slick": "^0.30.3",
  "ol": "^10.5.0",
  "@supabase/supabase-js": "^2.49.8",
  "react-icons": "^5.5.0",
  "uuid": "^11.1.0"
},
"devDependencies": {
  "vite": "^6.3.5",
  "@vitejs/plugin-react": "^4.4.1",
  "tailwindcss": "^4.1.7",
  "eslint": "^8.57.1",
  "postcss": "^8.5.3",
  "autoprefixer": "^10.4.21"
}
```

---

## 6. Config Files

### Environment Variables

#### Auth Service (`.env.example`)
```
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@host/auth_db?sslmode=require
DB_SSL=true
DB_POOL_MAX=10
DB_POOL_MIN=2
DB_IDLE_TIMEOUT_MS=30000
DB_CONNECTION_TIMEOUT_MS=2000
JWT_SECRET=<min-32-chars>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<email>
SMTP_PASS=<app-password>
SMTP_FROM="Ecommerce <noreply@domain.com>"
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
BCRYPT_ROUNDS=12
```

#### AI Service (`.env.example`)
```
PORT=3002
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@host/ai_db?sslmode=require
AUTH_SERVICE_URL=http://localhost:3001
GROQ_API_KEY=<groq-key>
GROQ_MODEL=llama3-8b-8192
GROQ_MAX_TOKENS=1024
CORE_SERVICE_URL=http://localhost:3003
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
RATE_LIMIT_MAX=100
MAX_CHAT_HISTORY=50
```

#### Core Service (`.env.example`)
```
PORT=3003
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@host/neondb?sslmode=require
AUTH_SERVICE_URL=http://localhost:3001
STRIPE_SECRET_KEY=sk_test_...
PAYMENT_SUCCESS_URL=http://localhost:3000/payment-success
PAYMENT_CANCEL_URL=http://localhost:3000/payment-cancel
DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
RATE_LIMIT_MAX=200
```

#### Frontend (`.env.example`)
```
VITE_AUTH_SERVICE_URL=http://localhost:3001
VITE_AI_SERVICE_URL=http://localhost:3002
VITE_CORE_SERVICE_URL=http://localhost:3003
VITE_SUPABASE_URL=<optional>
VITE_SUPABASE_ANON_KEY=<optional>
```

### Docker

#### `docker-compose.yml` (root)
- 4 services: `auth-service`, `ai-service`, `core-service`, `frontend`
- Network: `ecommerce-network` (bridge)
- Port mapping: 3001, 3002, 3003 (backend), 3000→80 (frontend)
- Restart policy: `unless-stopped`
- Env from root `.env` file

#### Dockerfiles (all backend services — identical pattern)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src/ ./src/
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
HEALTHCHECK CMD wget -qO- http://localhost:PORT/health
CMD ["node", "src/app.js"]
```

#### Frontend Dockerfile
- Located: `Ecommerce_Website/docker/frontend/Dockerfile`
- Multi-stage: build with Node → serve static with Nginx

### Kubernetes (`k8s/`)

#### `namespace.yaml`
```yaml
namespace: ecommerce
```

#### `configmap.yaml`
```yaml
NODE_ENV: production
AUTH_SERVICE_URL: http://auth-service:3001
AI_SERVICE_URL: http://ai-service:3002
CORE_SERVICE_URL: http://core-service:3003
```

#### Deployment pattern (per service)
- Image: `ecommerceacr2026.azurecr.io/<service>:latest`
- Replicas: 1
- Resources: CPU 50-100m, Memory 64-128Mi
- Readiness + liveness probes: `GET /health`
- Secrets from Kubernetes Secrets

#### `ingress.yaml`
```yaml
/api/auth  → auth-service:3001
/api/ai    → ai-service:3002
/api       → core-service:3003
/          → frontend:80
proxy-read-timeout: "300"
proxy-body-size: "10m"
```

### Build Config

#### `vite.config.js`
- Plugins: `@vitejs/plugin-react`, `@tailwindcss/vite`
- Path alias: `@` → `./srcs`
- Manual chunk splitting by vendor packages
- Chunk size warning at 1000 KB

---

## 7. Database Schema

### Auth DB (`auth_db`)

**users**
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
email TEXT UNIQUE NOT NULL
password_hash TEXT NOT NULL
full_name TEXT NOT NULL
phone TEXT
role TEXT DEFAULT 'user'   -- 'user' | 'admin'
avatar_url TEXT
is_active BOOLEAN DEFAULT true
created_at TIMESTAMPTZ DEFAULT now()
updated_at TIMESTAMPTZ DEFAULT now()
```

**refresh_tokens**
```sql
id UUID PRIMARY KEY
user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE
token_hash TEXT NOT NULL
expires_at TIMESTAMPTZ NOT NULL
created_at TIMESTAMPTZ DEFAULT now()
```

**password_reset_tokens**
```sql
id UUID PRIMARY KEY
user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE
token_hash TEXT NOT NULL
expires_at TIMESTAMPTZ NOT NULL
used BOOLEAN DEFAULT false
created_at TIMESTAMPTZ DEFAULT now()
```

Seed: admin user `admin@ecommerce.com` / `Admin@123456` (bcrypt hash)

---

### Core DB (`neondb`)

**categories**
```sql
id UUID PRIMARY KEY
name TEXT NOT NULL
slug TEXT UNIQUE NOT NULL
description TEXT
image TEXT
parent_id UUID REFERENCES categories(id)
is_active BOOLEAN DEFAULT true
```

**products**
```sql
id UUID PRIMARY KEY
title TEXT NOT NULL
description TEXT
category TEXT
category_id UUID REFERENCES categories(id)
image TEXT
images JSONB
price NUMERIC(10,2) >= 0
original_price NUMERIC(10,2)
sale_price NUMERIC(10,2)
stock INTEGER >= 0 DEFAULT 0
rating NUMERIC(3,2) DEFAULT 0   -- 0 to 5
is_active BOOLEAN DEFAULT true
is_featured BOOLEAN DEFAULT false
```

**orders**
```sql
id UUID PRIMARY KEY
user_id UUID  -- nullable (guest checkout supported)
customer_name TEXT NOT NULL
phone TEXT NOT NULL
address JSONB NOT NULL
shipping_method TEXT
payment_method TEXT
product_price NUMERIC(10,2)
shipping_fee NUMERIC(10,2) DEFAULT 0
discount NUMERIC(10,2) DEFAULT 0
discount_code TEXT
total NUMERIC(10,2) NOT NULL
status TEXT DEFAULT 'pending'  -- pending|processing|shipped|delivered|cancelled|deleted
payment_status TEXT DEFAULT 'pending'  -- pending|paid|failed|refunded
order_date TIMESTAMPTZ DEFAULT now()
deleted_at TIMESTAMPTZ  -- soft delete
```

**order_items**
```sql
id UUID PRIMARY KEY
order_id UUID REFERENCES orders(id) ON DELETE CASCADE
product_id UUID  -- nullable (product may be deleted)
product_name TEXT NOT NULL
product_image TEXT
quantity INTEGER > 0
price NUMERIC(10,2) >= 0
```

**discount_codes**
```sql
id UUID PRIMARY KEY
code TEXT UNIQUE NOT NULL
discount_type TEXT  -- 'fixed' | 'percentage'
discount_value NUMERIC > 0
min_order_value NUMERIC
max_uses INTEGER
used_count INTEGER DEFAULT 0
is_active BOOLEAN DEFAULT true
starts_at TIMESTAMPTZ
expires_at TIMESTAMPTZ
```

Seed: 10 categories — Laptops, Desktops, Monitors, Keyboards, Mice, Headsets, GPUs, RAM, Storage, CPUs

---

### AI DB (`ai_db`)

**chat_history**
```sql
id UUID PRIMARY KEY
user_id UUID  -- nullable (anonymous sessions)
session_id UUID NOT NULL
role TEXT  -- 'user' | 'assistant' | 'system'
content TEXT NOT NULL
created_at TIMESTAMPTZ DEFAULT now()
```

**user_preferences**
```sql
id UUID PRIMARY KEY
user_id UUID UNIQUE NOT NULL
viewed_categories TEXT[]
viewed_products UUID[]
search_history TEXT[]
created_at TIMESTAMPTZ DEFAULT now()
updated_at TIMESTAMPTZ DEFAULT now()
```

---

## 8. API Routes

### Auth Service — `http://localhost:3001/api/v1/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /register | — | Register user |
| POST | /login | — | Login (returns JWT pair) |
| POST | /refresh | — | Refresh access token |
| POST | /logout | Bearer | Invalidate refresh token |
| GET | /verify | Bearer | Verify token (for other services) |
| GET | /profile | Bearer | Get own profile |
| PATCH | /profile | Bearer | Update own profile |
| POST | /change-password | Bearer | Change password |
| POST | /forgot-password | — | Send reset email |
| POST | /reset-password | — | Reset password with token |
| GET | /admin/users | Admin | List all users |
| PATCH | /admin/users/:id | Admin | Admin update user |
| DELETE | /admin/users/:id | Admin | Deactivate user |

### AI Service — `http://localhost:3002/api/v1`

**Chat (`/chat`)**
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /message | Optional | Send message to chatbot |
| GET | /sessions | Bearer | List user sessions |
| GET | /sessions/:id | Optional | Get session history |
| DELETE | /sessions/:id | Bearer | Delete session |

**Recommendations (`/recommendations`)**
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | / | Bearer | Personalized recommendations |
| GET | /similar/:product_id | Optional | Similar products |
| POST | /view | Bearer | Record product view |
| GET | /search | Optional | AI-powered search |
| GET | /suggest | — | Autocomplete suggestions |

### Core Service — `http://localhost:3003/api/v1`

**Products (`/products`)**
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | / | — | List products (filtered, paginated) |
| GET | /suggestions | — | Autocomplete |
| GET | /:id | — | Product detail |
| POST | / | Admin | Create product |
| PATCH | /:id | Admin | Update product |
| DELETE | /:id | Admin | Delete product |

**Orders (`/orders`)**
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | / | Optional | Create order |
| GET | /mine | Bearer | Own orders |
| GET | /admin | Admin | All orders |
| GET | /revenue | Admin | Revenue stats |
| GET | /:id | Bearer | Order detail |
| PATCH | /:id/status | Bearer | Update status |
| DELETE | /:id | Admin | Soft-delete order |

**Payments (`/payments`)**
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /process | Bearer | Process payment |
| GET | /verify/:order_id/:txn_id | Bearer | Verify payment |
| POST | /refund | Admin | Issue refund |
| POST | /discount/validate | — | Validate discount code |
| GET | /discounts | Admin | List discount codes |
| POST | /discounts | Admin | Create discount code |

**Categories (`/categories`)**
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | / | — | List all categories |
| GET | /:id | — | Category detail |
| POST | / | Admin | Create category |
| PATCH | /:id | Admin | Update category |
| DELETE | /:id | Admin | Delete category |

**Health endpoints:** `GET /health` on every service

**Swagger docs:** `GET /api-docs` on every service

---

## 9. Frontend Routes

**Public**
- `/home` — Homepage
- `/san-pham` — Products listing
- `/shopping-cart` — Cart
- `/product/:id` — Product detail
- `/login` — Login
- `/forgot-password` — Forgot password
- `/reset-password` — Reset password
- `/about`, `/jobs`, `/contact` — Company pages
- `/warranty-policy`, `/shipping-policy`, `/privacy-policy` — Policy pages
- `/showrooms`, `/shopping-guide`, `/payment-guide`, `/installment`, `/warranty-lookup`

**Protected (requires login)**
- `/user/*` — Profile, Address, Orders, Account settings
- `/checkout` — Checkout
- `/complete` — Order completion
- `/payment-page` — Payment
- `/ship-info` — Shipping info
- `/build-pc` — PC builder configurator
- `/order` — Order page

**Admin**
- Defined in `adminRoute.jsx` — dashboard and management pages

---

## 10. Deployment

### Local (Docker Compose)
```bash
cp .env.example .env          # fill in secrets
docker-compose up -d          # starts all 4 services
```

### Kubernetes (Azure)
```bash
# Build and push images
docker build -t ecommerceacr2026.azurecr.io/auth-service:latest ./backend/auth-service
docker build -t ecommerceacr2026.azurecr.io/ai-service:latest ./backend/ai-service
docker build -t ecommerceacr2026.azurecr.io/core-service:latest ./backend/core-service
docker build -t ecommerceacr2026.azurecr.io/frontend:latest ./Ecommerce_Website
docker push ecommerceacr2026.azurecr.io/auth-service:latest
docker push ecommerceacr2026.azurecr.io/ai-service:latest
docker push ecommerceacr2026.azurecr.io/core-service:latest
docker push ecommerceacr2026.azurecr.io/frontend:latest

# Apply k8s manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/auth-service.yaml
kubectl apply -f k8s/ai-service.yaml
kubectl apply -f k8s/core-service.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/ingress.yaml
```

### Frontend-only (local dev)
```bash
cd Ecommerce_Website
npm install
npm run dev      # Vite dev server on :5173
```

---

## 11. Notes & Gotchas

- **Groq API key** required for AI service — without it, chat/recommendation routes fail
- **Stripe test key** is committed in `core-service/.env` (development only — rotate before prod)
- **Guest checkout** is supported: orders can be created without authentication
- **Soft deletes** on orders (`deleted_at` column) — filter with `WHERE deleted_at IS NULL`
- **Rate limits**: auth/ai = 100 req/15min, core = 200 req/15min
- **JWT flow**: access token (15m) + refresh token (7d); refresh stored as hash in DB (one per user)
- **React Router version mismatch**: both v5.3.4 and v7.6.0 are installed; v7 is primary
- **Supabase** SDK is a dependency but appears optional / legacy — primary DB is Neon via raw `pg`
- **Vite chunk size** warnings above 1000 KB — consider code splitting if bundle grows
