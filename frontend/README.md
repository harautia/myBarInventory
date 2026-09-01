# myBarInventory frontend

React + Vite frontend for planning meat pie production and viewing/updating
ingredient stock. Talks to the backend (see `../backend`) via `/api`, proxied
by Vite in dev.

## Local setup

```bash
npm install
npm run dev      # http://localhost:5173, expects backend running on :3003
```

## Pages

- **Plan production** — enter a target pie count, see needed ingredients,
  current stock, shortfall, and the resulting purchase list.
- **Inventory** — view and edit current stock levels for each ingredient.

## Testing / linting

```bash
npm test    # Vitest + Testing Library
npm run lint
```
