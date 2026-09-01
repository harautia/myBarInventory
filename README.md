# myBarInventory

A small internal tool for an imaginary bar: plan how many meat pies to
produce, convert that into required ingredient quantities from a fixed
recipe, compare against current stock, and generate a purchase list for
the wholesale supplier.

- `backend/` — Express API + PostgreSQL (via Knex). See [backend/README.md](backend/README.md).
- `frontend/` — React + Vite UI. See [frontend/README.md](frontend/README.md).

## Recipe (yields 20 pies)

Oven-baked yeast-dough meat pies, adapted from
[kinuskikissa.fi's lihapiirakat recipe](https://www.kinuskikissa.fi/lihapiirakat-uunissa):

0.5l milk, 25g fresh yeast, 4.5tsp salt, 1.5tbsp sugar, 125g butter,
1.1l bread flour, 0.65l water, 0.225l rice, 1 onion, 450g ground meat,
1 garlic clove, 1.5tsp black pepper, 1.5tsp paprika powder.

(Salt and butter are used at more than one step in the original recipe —
dough, filling, and topping — and are combined here into one total
quantity per ingredient.)

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
