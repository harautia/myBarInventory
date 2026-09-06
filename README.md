# myBarInventory

A small internal tool for an imaginary bar: plan how many meat pies to
produce, convert that into required ingredient quantities from a fixed
recipe, compare against current stock, and generate a purchase list.

- `backend/` — Express API + PostgreSQL (via Knex). See [backend/README.md](backend/README.md).
- `frontend/` — React + Vite UI. See [frontend/README.md](frontend/README.md).

## Recipe (yields 20 pies)

Oven-baked yeast-dough meat pies, adapted from
[kinuskikissa.fi's lihapiirakat recipe](https://www.kinuskikissa.fi/lihapiirakat-uunissa):

0.5l milk, 25g fresh yeast, 22.5g salt, 18g sugar, 125g butter,
1.1l bread flour, 191.25g rice, 1 onion, 450g ground meat,
1 garlic clove, 4.5g black pepper, 3.6g paprika powder.

Notes:
- Salt and butter are used at more than one step in the original recipe —
  dough, filling, and topping — and are combined here into one total
  quantity per ingredient.
- Water (6.5dl in the original recipe) is needed to cook but isn't
  purchased from the wholesaler, so it's intentionally left out of
  tracked ingredients and the purchase plan.
- Rice is tracked by dry weight in grams rather than volume, to match
  the other weight-based ingredients: 2.25dl at 1dl = 85g dry rice =
  191.25g.
- Salt, sugar, black pepper, and paprika powder are tracked by weight
  rather than teaspoons/tablespoons: 4.5tsp salt at 5g/tsp = 22.5g;
  1.5tbsp sugar (= 4.5tsp at 1tbsp = 3tsp) at 4g/tsp = 18g; 1.5tsp black
  pepper at 3g/tsp = 4.5g; 1.5tsp paprika powder at 2.4g/tsp = 3.6g.

## Purchase plan rounding

The purchase amount (shortfall) for any gram-based ingredient is rounded
*up* to the nearest 10g — e.g. a 12g shortfall becomes 20g, never rounded
down to 10g. This means a purchase can leave a small surplus in stock,
but never leaves you short. Discrete ingredients (onion) are still
rounded up to the nearest whole item, as before.

Garlic cloves are tracked and used individually, but purchased as whole
garlics (10 cloves = 1 whole garlic): the breakdown table still shows
the raw clove shortfall, while the purchase list rounds up to whole
garlics — e.g. an 11-clove shortfall buys 2 whole garlics.

Gram amounts of 1000g or more are displayed as kilograms with one
decimal (e.g. 45000g shows as "45.0 kg") wherever a quantity is shown
in the UI — the underlying data stays in grams either way.

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

## Deploying to Render

The repo root has a `Dockerfile` that builds the frontend and serves it
as static files from the backend Express app — one combined service —
plus a `render.yaml` Blueprint that provisions both the web service and
a free Postgres database.

1. Push `Dockerfile`, `.dockerignore`, and `render.yaml` to GitHub.
2. In Render's dashboard: **New → Blueprint**, select this repo. Render
   reads `render.yaml` and shows both resources (web service +
   database) to create.
3. Apply the blueprint and wait for the first build to finish.
4. One-time only: load the recipe/ingredient data. Render's free plan
   has no Shell access, so this goes through a token-gated endpoint
   instead of `npm run seed` directly:
   - In the web service's **Environment** tab, add `SEED_TOKEN` with a
     secret value you choose, and save (this triggers a redeploy).
   - Once redeployed, run from your own machine:
     ```bash
     curl -X POST -H "x-seed-token: <your SEED_TOKEN value>" \
       https://<your-service>.onrender.com/api/admin/seed
     ```
   Migrations already ran automatically as part of the container's
   start command, so this only needs to load data, not the schema.
   Without `SEED_TOKEN` set, the endpoint always refuses — it's inert
   until you deliberately turn it on.
5. Visit the service's `*.onrender.com` URL and confirm a purchase-plan
   calculation works end-to-end.

This is a free-tier deployment, so two things are expected behavior,
not bugs: the service spins down after ~15 minutes idle (the first
request after a quiet period is slow), and Render's free Postgres
instance expires after 30 days.
