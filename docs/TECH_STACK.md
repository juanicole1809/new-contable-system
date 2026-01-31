# Contable Software - Tech Stack

## Overview

Building a full accounting software to replace Google Apps Script workflows.

## Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                     Frontend + Backend API                     │
│                    Next.js 15+ with TypeScript                  │
│  • App Router (server components + API routes)                 │
│  • Type-safe financial calculations                            │
│  • Google OAuth authentication (estudiointegralka.com.ar)      │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                        Database Layer                          │
│                      Supabase (PostgreSQL)                     │
│  • Financial data tables (invoices, payments, reconciliations)  │
│  • Row Level Security (multi-tenant for different clients)     │
│  • Realtime sync                                               │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                    AI/ML Service (Python)                      │
│                    FastAPI + uvicorn                           │
│  • OCR for invoices (replace Redconar)                         │
│  • Bank statement analysis                                     │
│  • Intelligent reconciliation                                  │
└────────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend + API** | Next.js 15+ (App Router) |
| **Language** | TypeScript |
| **Database** | Supabase (PostgreSQL) + Supabase Client |
| **Auth** | Auth.js (NextAuth) |
| **AI/ML** | Python + FastAPI (Phase 3 - Optional) |
| **Deployment** | Vercel (Web), Railway (AI - optional) |

## Project Structure

```
contable-software/
├── app/
│   ├── dashboard/              # Accounting dashboard
│   ├── invoices/               # Invoice management
│   ├── bank/                   # Bank reconciliation
│   ├── providers/              # Provider database
│   ├── api/                    # API routes
│   │   ├── auth/               # NextAuth
│   │   ├── invoices/           # Invoice CRUD + Redconar sync
│   │   └── providers/          # Provider CRUD + Redconar sync
│   └── layout.tsx
│
├── components/                 # React components
│
├── lib/
│   ├── supabase.ts             # Supabase client config
│   ├── redconar.ts             # Redconar API client (PHPSESSID)
│   └── types.ts                # Generated types from Supabase
│
└── ai-service/                 # Python FastAPI (Phase 3 - Optional)
    └── ...
```

## Authentication

### Type Generation

Generate TypeScript types from Supabase schema:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/types.ts
```

### Google OAuth with Domain Restriction

Using **Auth.js** (NextAuth.js) with domain restriction to `estudiointegralka.com.ar`.

```typescript
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          hd: "estudiointegralka.com.ar"
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user }) {
      return user.email?.endsWith("@estudiointegralka.com.ar") ?? false
    }
  }
})
```

## Financial Considerations

### Always Use Decimal for Money

```typescript
// NEVER use Number for money
import { Decimal } from 'decimal.js';

const amount = new Decimal('1234.56');  // ✅ Precise
const bad = 1234.56;                    // ❌ Floating point errors
```

### Database Column Type

```sql
-- Always use DECIMAL for financial amounts
amount DECIMAL(12, 2) NOT NULL
-- 12 total digits, 2 decimal places
-- Max: 9999999999.99
```

## Database Schema (Initial)

```sql
-- Providers (sync from Redconar)
CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  redconar_id TEXT,
  name TEXT NOT NULL,
  legal_name TEXT,
  cuit TEXT UNIQUE,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Consortia (Buildings)
CREATE TABLE consortia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  redconar_id TEXT,
  name TEXT NOT NULL,
  cuit TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES providers(id),
  consortium_id UUID REFERENCES consortia(id),
  invoice_number TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  date DATE,
  description TEXT,
  cuit_provider TEXT,
  cuit_consortium TEXT,
  ocr_data JSONB,
  file_id TEXT,
  file_url TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bank statements
CREATE TABLE bank_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  description TEXT,
  amount DECIMAL(12, 2) NOT NULL,
  reference TEXT,
  raw_data JSONB,
  reconciled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
