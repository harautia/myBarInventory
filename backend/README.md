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
| POST | `/api/recipes/:id/purchase-plan` | `{ "pieCount": number }` | Compute needed ingredients, shortfall, purchase list, and price comparison for a target pie count |
| GET | `/api/suppliers` | — | List suppliers |
| POST | `/api/suppliers` | `{ "name", "deliveryFee"?, "freeDeliveryThreshold"? }` | Create a supplier |
| PUT | `/api/suppliers/:id` | any of the above fields | Update a supplier |
| DELETE | `/api/suppliers/:id` | — | Remove a supplier (and its prices) |
| GET | `/api/suppliers/prices/all` | — | List every supplier's price for every ingredient |
| PUT | `/api/suppliers/:supplierId/prices/:ingredientId` | `{ "pricePerNaturalUnit": number }` | Set a supplier's price for an ingredient, entered in its natural unit (€/kg for gram ingredients, €/l, €/piece, etc.) |
| DELETE | `/api/suppliers/:supplierId/prices/:ingredientId` | — | Remove a supplier's price for an ingredient |

### Price comparison

The purchase-plan response includes a `priceComparison` object with two views:
- `perIngredientCheapest` — the cheapest supplier for each ingredient independently (may split the order across suppliers, each with its own delivery fee), plus a per-supplier subtotal/delivery/total and a grand total. Ingredients nobody has priced are listed under `unpriced`, never silently dropped.
- `singleSupplierRanking` — suppliers ranked by total cost (items + one delivery fee), but only for suppliers who have a price for every ingredient on the purchase list; suppliers missing some prices are listed with `canFulfillAll: false` and which ingredients are missing.

Each supplier's delivery fee is waived once their order subtotal reaches their `freeDeliveryThreshold` (if set).
