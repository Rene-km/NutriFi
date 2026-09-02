# NutriFi

A cross-platform mobile app for nutrition and fitness tracking. NutriFi combines
recipe discovery and AI-generated meal plans with a workout tracker that uses
on-device pose estimation to count reps and check form, backed by a personal
dashboard for progress over time.

## Features

- **Home dashboard** – daily calorie / macro summary and progress charts.
- **Workout** – guided exercise sessions with real-time pose tracking
  (MediaPipe), automatic rep counting, and per-exercise history.
- **Recipes** – search recipes, view full nutrition and instructions, and
  generate multi-day meal plans from a natural-language prompt.
- **Profile** – user details, goals, BMI calculator, and weekly stats.
- **Auth** – email/password sign-up and login via Supabase.

## Tech stack

| Layer      | Technology |
|------------|------------|
| App        | Expo (SDK 54), React Native 0.81, React 19, TypeScript, expo-router, Zustand, React Hook Form |
| Charts     | react-native-gifted-charts |
| Pose       | @thinksys/react-native-mediapipe, @mediapipe/tasks-vision |
| Backend    | FastAPI (Python 3.13), Uvicorn |
| AI / data  | OpenAI API, Spoonacular API |
| Database   | PostgreSQL (Supabase), Drizzle ORM + drizzle-kit |
| Auth       | Supabase Auth |
| Testing    | Jest, @testing-library/react-native |

## Repository structure

```
.
├── app/nutriFi/        Expo / React Native application
│   ├── app/            expo-router routes — (auth) and (tabs) groups
│   ├── components/     UI components grouped by feature (Auth, Dashboard, Profile, Recipe, Workout)
│   ├── hooks/          feature hooks
│   ├── stores/         Zustand stores
│   ├── lib/            api client (api.ts) and Supabase client (supabase.ts)
│   ├── utils/          shared helpers
│   └── __tests__/      unit, component, and integration tests
├── server/             FastAPI backend (recipe search, recipe info, meal-plan generation)
└── db/                 Drizzle ORM schema, config, and SQL migrations
```

## Prerequisites

- Node.js 20+ and npm
- Python 3.13+
- A Supabase project (URL, anon key, service key)
- API keys: OpenAI, Spoonacular, and a RapidAPI key for the app

## Setup

Clone the repo, then set up each component.

### 1. Backend (`server/`)

```bash
cd server
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env              # then fill in the values
uvicorn main:app --reload         # serves on http://localhost:8000
```

### 2. Database (`db/`)

```bash
cd db
npm install
cp .env.example .env              # set DATABASE_URL
npx drizzle-kit generate          # generate migrations from schema.tsx
npx drizzle-kit migrate           # apply migrations
```

### 3. App (`app/nutriFi/`)

```bash
cd app/nutriFi
npm install
cp .env.example .env              # then fill in the values
npx expo start
```

Press `i` / `a` in the Expo CLI for the iOS / Android simulator, or scan the QR
code with Expo Go / a dev client. Pose tracking requires a physical device or a
dev build (`npx expo run:ios` / `npx expo run:android`).

## Environment variables

### `app/nutriFi/.env`

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_SERVER_URL` | Base URL of the FastAPI backend |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `EXPO_PUBLIC_RAPIDAPI_KEY` | RapidAPI key |

### `server/.env`

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key (read automatically by the OpenAI SDK) |
| `API_KEY` | Spoonacular API key |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_KEY` | Supabase service key |

### `db/.env`

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (Supabase pooler) |

## Backend API

| Method | Route | Purpose |
|--------|-------|---------|
| `GET`  | `/` | Health check |
| `POST` | `/recipes/search` | Search recipes by query |
| `GET`  | `/recipes/{recipe_id}/information` | Full recipe information (cached in Supabase) |
| `POST` | `/mealPlan` | Generate a meal plan from a prompt |

## Testing

App tests (from `app/nutriFi/`):

```bash
npm test                          # watch mode
npm run test:ci                   # unit + component/integration with coverage
```

## License

This project is provided for educational purposes.
