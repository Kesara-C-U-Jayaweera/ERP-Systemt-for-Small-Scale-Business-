# 🏪 ERP System for Small-Scale Businesses

A full-featured, multi-tenant SaaS ERP and POS system built for Sri Lankan small businesses.

## ✨ Features

- 🛒 **Point of Sale** — Touch-friendly POS with barcode scan, cart, and payment processing
- 📦 **Inventory Management** — Real-time stock tracking, low-stock alerts
- 🧾 **Invoicing** — Professional invoices with PDF generation, WhatsApp delivery
- 📊 **Sales Reports** — Revenue analytics, top products, recent sales
- 🔐 **Multi-Tenant** — Every business gets fully isolated data
- 💰 **LKR Support** — Built for Sri Lankan VAT/NBT requirements

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Next.js API Routes, Server Actions |
| Database | PostgreSQL via Supabase + Prisma ORM |
| Auth | Supabase Auth (JWT) |
| Hosting | Vercel + Supabase |

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/Kesara-C-U-Jayaweera/ERP-Systemt-for-Small-Scale-Business-.git
cd ERP-Systemt-for-Small-Scale-Business-
npm install
```

### 2. Set up environment variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_pooler_connection_string
DIRECT_URL=your_pooler_connection_string
```

### 3. Push the database schema
```bash
npx prisma db push
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📦 Deployment (Vercel)

1. Push to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Add all environment variables in Vercel dashboard
4. Deploy!

## 📄 License

Private — All rights reserved © 2024 Kesara C U Jayaweera
