# 🔒 SecureDeal — Escrow Platform

SecureDeal is a full-stack micro SaaS escrow platform that acts as a neutral intermediary between buyers and sellers, eliminating payment fraud.

## Architecture

```
securedeal/
├── backend/          # NestJS API (port 4000)
│   ├── src/
│   │   ├── auth/             # JWT auth
│   │   ├── users/            # User management + dashboard
│   │   ├── deals/            # Core deal lifecycle
│   │   ├── payments/         # Stripe integration
│   │   ├── disputes/         # Dispute resolution
│   │   ├── notifications/    # In-app notifications
│   │   └── email/            # Email service (nodemailer)
│   └── prisma/
│       ├── schema.prisma     # Database schema
│       └── seed.ts           # Demo data
│
├── frontend/         # Next.js 14 App Router (port 3000)
│   ├── app/
│   │   ├── (auth)/           # Login / Register
│   │   ├── dashboard/        # User dashboard
│   │   ├── deals/            # Deal list, create, detail
│   │   ├── notifications/    # Notification center
│   │   └── admin/            # Admin panel (disputes, users, deals)
│   ├── components/
│   └── lib/                  # API client, auth config, utils
│
└── docker-compose.yml
```

## Deal Flow

```
PENDING → FUNDED → DELIVERED → COMPLETED
              ↓         ↓
           DISPUTED → [Admin resolves] → COMPLETED or REFUNDED
```

| Status | Description |
|--------|-------------|
| PENDING | Deal created, waiting for buyer to fund |
| FUNDED | Payment held in escrow by SecureDeal |
| DELIVERED | Seller marked delivery complete |
| COMPLETED | Buyer confirmed receipt, funds released |
| DISPUTED | Either party raised a dispute |
| REFUNDED | Admin resolved in buyer's favor |
| CANCELLED | Deal cancelled before funding |

## Business Model

- **5% platform fee** deducted from seller payout
- Transparent fee breakdown shown before payment
- Example: $1,000 deal → seller receives $950, SecureDeal earns $50

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend API | NestJS + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT + NextAuth |
| Payments | Stripe Payment Intents |
| Frontend | Next.js 14 App Router + Tailwind CSS |
| Email | Nodemailer (SMTP) |
| Containerization | Docker + docker-compose |

---

## Quick Start

### Option 1: Docker (Recommended)

```bash
# 1. Clone and configure environment
cp .env.example .env
# Edit .env with your Stripe keys, SMTP credentials, JWT secret

# 2. Start all services
docker-compose up --build

# Access:
# Frontend: http://localhost:3000
# Backend API: http://localhost:4000/api
# API Docs: http://localhost:4000/api/docs
```

### Option 2: Local Development

#### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- A Stripe account (test mode)

#### Backend

```bash
cd backend
npm install

# Set up environment
cp .env.example .env
# Edit .env with your DATABASE_URL, JWT_SECRET, STRIPE_SECRET_KEY, SMTP credentials

# Run database migrations + seed
npx prisma migrate dev --name init
npx prisma db seed

# Start development server
npm run start:dev
# API at http://localhost:4000/api
# Swagger docs at http://localhost:4000/api/docs
```

#### Frontend

```bash
cd frontend
npm install

# Set up environment
cp .env.local.example .env.local
# Edit with your NEXTAUTH_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

# Start development server
npm run dev
# Frontend at http://localhost:3000
```

---

## Environment Variables

### Backend (`.env`)

```env
DATABASE_URL="postgresql://securedeal:securedeal_pass@localhost:5432/securedeal"

# JWT (min 32 chars, change in production!)
JWT_SECRET="your_super_secret_jwt_key_min_32_chars"
JWT_EXPIRY="7d"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (use Mailtrap for dev, or SendGrid/SES for prod)
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT=587
SMTP_USER="your_smtp_user"
SMTP_PASS="your_smtp_pass"
SMTP_FROM="noreply@securedeal.com"

# App
PORT=4000
FRONTEND_URL="http://localhost:3000"
ESCROW_FEE_PERCENT=5
```

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## Demo Accounts (seeded automatically)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@securedeal.com | Admin@123 |
| Buyer | buyer@example.com | Buyer@123 |
| Seller | seller@example.com | Seller@123 |

---

## API Reference

Full interactive docs available at `http://localhost:4000/api/docs` (Swagger UI).

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, get JWT |
| GET | `/api/auth/me` | Current user profile |

### Deals
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/deals` | Create deal (buyer) |
| GET | `/api/deals` | List user's deals |
| GET | `/api/deals/:id` | Get deal details |
| PATCH | `/api/deals/:id/deliver` | Mark as delivered (seller) |
| PATCH | `/api/deals/:id/confirm` | Confirm receipt (buyer) |
| DELETE | `/api/deals/:id` | Cancel deal |
| GET | `/api/deals/admin/all` | All deals (admin) |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/deals/:id/intent` | Create Stripe PaymentIntent |
| POST | `/api/payments/deals/:id/confirm` | Confirm funding (dev/test) |
| POST | `/api/payments/deals/:id/release` | Release funds to seller |
| GET | `/api/payments/deals/:id/status` | Payment status |
| POST | `/api/payments/webhook` | Stripe webhook |

### Disputes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/disputes/deals/:id` | Raise dispute |
| GET | `/api/disputes` | List disputes (admin) |
| PATCH | `/api/disputes/:id/review` | Mark under review (admin) |
| PATCH | `/api/disputes/:id/resolve` | Resolve dispute (admin) |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get user notifications |
| GET | `/api/notifications/unread-count` | Unread count |
| PATCH | `/api/notifications/:id/read` | Mark as read |
| PATCH | `/api/notifications/read-all` | Mark all as read |

---

## Stripe Integration

SecureDeal uses **Stripe Payment Intents** for escrow-like fund holding:

1. **Create Intent**: Buyer triggers a PaymentIntent for the deal amount
2. **Confirm Payment**: Stripe processes the card, funds are captured
3. **Webhook**: Stripe notifies our server → deal moves to FUNDED
4. **Release**: On buyer confirmation, funds are transferred to seller (via Stripe Connect in production)

### Setting up Stripe Webhooks (local dev)

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:4000/api/payments/webhook

# Copy the webhook secret and set STRIPE_WEBHOOK_SECRET in .env
```

### Production: Stripe Connect

For production fund releases, set up Stripe Connect to transfer directly to seller bank accounts:
1. Enable Stripe Connect in your dashboard
2. Add `stripeAccountId` to the User model
3. Use `stripe.transfers.create()` in `PaymentsService.releaseFunds()`

---

## Deploying to Production

1. **Database**: Use managed PostgreSQL (Railway, Supabase, RDS)
2. **Backend**: Deploy to Railway, Render, or EC2
3. **Frontend**: Deploy to Vercel (zero-config with Next.js)
4. **Secrets**: Use environment variable management (never commit `.env`)
5. **SMTP**: Use SendGrid, AWS SES, or Postmark
6. **Stripe**: Switch to live keys and set up production webhooks

---

## Security Considerations

- Passwords hashed with **bcrypt** (salt rounds: 10)
- **JWT** tokens with configurable expiry
- All deal mutations require **ownership verification** (buyer/seller IDs checked)
- Admin routes protected by **RolesGuard**
- **Input validation** on all DTOs via class-validator
- CORS configured to allow only frontend origin
- Stripe webhook **signature verification** prevents spoofing

---

## License

MIT
# YULRRED
