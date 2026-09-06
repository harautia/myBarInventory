# Builds the frontend, then serves it as static files from the backend
# Express app -- one image, one process, for a single Render web service.

FROM node:22-alpine AS frontend-build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY backend/ ./
COPY --from=frontend-build /app/dist ./dist

# migrate:latest is a no-op once the schema is current, so it's safe to
# run on every boot. Seeding is deliberately NOT run here -- it deletes
# existing data first, so it must stay a manual one-time step.
CMD ["sh", "-c", "npx knex migrate:latest && node index.js"]
