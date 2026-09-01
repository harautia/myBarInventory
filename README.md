# myBarInventory

A small internal tool for an imaginary bar: plan how many meat pies to
produce, convert that into required ingredient quantities from a fixed
recipe, compare against current stock, and generate a purchase list for
the wholesale supplier.

- `backend/` — Express API + PostgreSQL (via Knex). See [backend/README.md](backend/README.md).
- `frontend/` — React + Vite UI. See [frontend/README.md](frontend/README.md).

## Recipe (yields 10 pies)

100g butter, 5dl flour, 200g meat, 10g salt, 5g pepper, 1dl sour cream, 1 egg.

## Quick start

```bash
# Backend
cd backend
npm install
cp .env.example .env   # adjust DATABASE_URL if needed
npm run migrate
npm run seed
npm run dev             # http://localhost:3003

# Frontend (separate terminal)
cd frontend
npm install
npm run dev              # http://localhost:5173
```
