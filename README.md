# Medios — AppSheet Migration

Serverless monorepo: React (Vite) + Tailwind + Supabase + Netlify Functions.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Run the schema in **SQL Editor**:
   - Open `supabase/migrations/001_initial_schema.sql`
   - Execute the full script
3. Create a Storage bucket named `pdfs` (for PDF presupuestos).
4. Copy `.env.example` to `.env.local` and fill in:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### 3. Netlify (production)

1. Deploy to Netlify (connect repo or `netlify deploy`).
2. In Site settings → Environment variables, add:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

### 4. Local development

```bash
npm run dev
```

For local Netlify Functions:

```bash
npx netlify dev
```

This runs Vite and the functions together. Set the same env vars in `.env` for local functions.

## Routes

| Route         | Page              |
|---------------|-------------------|
| `/`           | Dashboard         |
| `/propiedades`| Propiedades (table + selection) |
| `/presupuestos` | Presupuestos list + form |
| `/servicios`  | Contratos         |
| `/compras`    | Compras dashboard |

## API

- `POST /api/presupuestos` — Create presupuesto + presupuesto_propiedades (bulk insert).
- `POST /api/generatePdf` — Generate PDF for a presupuesto, upload to Storage, update `pdf_url`.

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router, Zustand, React Query, React Hook Form, Zod
- **Backend:** Netlify Functions (Node.js)
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage
