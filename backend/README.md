# myBarInventory backend

Express + PostgreSQL (via Knex) API for planning meat pie production and generating
wholesale purchase lists.

## Local setup

```bash
# 1. Install PostgreSQL (macOS/Homebrew)
brew install postgresql@16
brew services start postgresql@16

# 2. Create the dev and test databases
createdb mybarinventory
createdb mybarinventory_test

# 3. Install dependencies
npm install

# 4. Configure environment
cp .env.example .env   # adjust DATABASE_URL/TEST_DATABASE_URL if needed

# 5. Run migrations and seed the fixed recipe
npm run migrate
npm run seed

# 6. Start the API (http://localhost:3003)
npm run dev
```

Run migrations/seed against the test database before running tests:

```bash
NODE_ENV=test npm run migrate
NODE_ENV=test npm run seed
npm test
```

## API

| Method | Path | Body | Description |
|---|---|---|---|
| GET | `/api/ingredients` | — | List ingredients with current stock |
| PUT | `/api/ingredients/:id/stock` | `{ "currentStock": number }` | Update an ingredient's stock level |
| GET | `/api/recipes` | — | List recipes |
| GET | `/api/recipes/:id` | — | Recipe with its ingredient line items |
| POST | `/api/recipes/:id/purchase-plan` | `{ "pieCount": number }` | Compute needed ingredients, shortfall, and purchase list for a target pie count |
