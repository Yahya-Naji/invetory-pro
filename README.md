# Inventory Pro — Inventory Management System

A full-stack inventory management application built with Next.js, Supabase, and AI-powered features.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Row Level Security)
- **AI**: OpenAI GPT-4o via Vercel AI SDK
- **Hosting**: Vercel

## Features

- **Inventory Management** — Full CRUD with SKU, barcode, pricing, and reorder levels
- **Stock Movements** — Track in/out/adjustment with full audit log
- **Category & Supplier Management** — Organize items by category and supplier
- **Role-Based Access** — Admin, Manager, and Viewer roles with RLS enforcement
- **Authentication** — Email/password + Google SSO via Supabase Auth
- **AI Smart Search** — Natural language queries like "items running low in warehouse A"
- **AI Demand Forecast** — Predict stock needs based on movement patterns
- **AI Optimization** — Reorder suggestions and dead stock detection
- **AI Assistant** — Chat with an AI assistant about your inventory
- **Low Stock Alerts** — Automatic alerts for out-of-stock and low-stock items
- **Analytics Dashboard** — Status and category breakdowns with visual charts
- **Responsive Design** — Mobile-first with sidebar navigation

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- An [OpenAI](https://platform.openai.com) API key

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set Up the Database

1. Go to your Supabase project's **SQL Editor**
2. Run the contents of `supabase-schema.sql` to create all tables, triggers, and RLS policies

### 4. Enable Google OAuth (Optional)

1. In Supabase Dashboard → Authentication → Providers → Google
2. Add your Google OAuth client ID and secret
3. Set the redirect URL to `{your_url}/auth/callback`

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login & register pages
│   ├── (dashboard)/     # Protected routes (sidebar layout)
│   │   ├── dashboard/   # KPI overview
│   │   ├── inventory/   # Item catalog, detail, add/edit
│   │   ├── categories/  # Category management
│   │   ├── suppliers/   # Supplier management
│   │   ├── movements/   # Stock movement audit log
│   │   ├── alerts/      # Low stock alerts
│   │   ├── ai/          # AI features (search, forecast, optimize, assistant)
│   │   ├── analytics/   # Charts and breakdowns
│   │   └── settings/    # Profile settings
│   ├── api/ai/          # AI API routes
│   └── auth/callback/   # OAuth callback
├── components/
│   ├── ui/              # shadcn/ui primitives
│   ├── layout/          # Sidebar, topbar, mobile nav
│   └── shared/          # Page header, empty state
├── lib/
│   ├── supabase/        # Client, server, middleware, admin
│   ├── openai.ts        # AI client
│   ├── constants.ts     # Enums and config
│   └── utils.ts         # Utility functions
├── providers/           # Auth provider
└── types/               # TypeScript interfaces
```

## Roles

| Role    | Permissions                                                  |
|---------|--------------------------------------------------------------|
| Admin   | Full access — manage inventory, categories, suppliers, users |
| Manager | Add/edit items, manage stock movements                       |
| Viewer  | View dashboard and inventory (read-only)                     |
