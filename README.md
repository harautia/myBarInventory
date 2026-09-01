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

0.5l milk, 25g fresh yeast, 22.5g salt, 18g sugar, 125g butter,
1.1l bread flour, 0.19125kg rice, 1 onion, 450g ground meat,
1 garlic clove, 4.5g black pepper, 3.6g paprika powder.

Notes:
- Salt and butter are used at more than one step in the original recipe —
  dough, filling, and topping — and are combined here into one total
  quantity per ingredient.
- Water (6.5dl in the original recipe) is needed to cook but isn't
  purchased from the wholesaler, so it's intentionally left out of
  tracked ingredients and the purchase plan.
- Rice is tracked by dry weight rather than volume: 2.25dl converted to
  kg at 1dl = 85g dry rice.
- Salt, sugar, black pepper, and paprika powder are tracked by weight
  rather than teaspoons/tablespoons: 4.5tsp salt at 5g/tsp = 22.5g;
  1.5tbsp sugar (= 4.5tsp at 1tbsp = 3tsp) at 4g/tsp = 18g; 1.5tsp black
  pepper at 3g/tsp = 4.5g; 1.5tsp paprika powder at 2.4g/tsp = 3.6g.

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
