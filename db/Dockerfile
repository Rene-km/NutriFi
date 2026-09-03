FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Applies the SQL migrations in ./drizzle to the database at $DATABASE_URL
CMD ["npx", "drizzle-kit", "migrate"]
