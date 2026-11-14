# UNT QuickBytes

UNT QuickBytes is a mobile-first university food discovery web application. It helps University of North Texas students browse campus food, search by dish or dining location, filter results by dietary preference, and locate restaurants on an interactive map.

> Academic team project: the repository preserves the project's original identity and credits team work from the Git history below.

## What the application does

- Creates local user accounts and verifies passwords with bcrypt.
- Guides new users through a five-step preference survey.
- Lists and ranks food recommendations from a SQLite catalog.
- Searches food names, categories, restaurants, and campus locations.
- Filters and sorts results by dietary tag, rating, price, or name.
- Saves favorite-food selections in the browser.
- Displays dining locations on a Leaflet/OpenStreetMap campus map.
- Shows a local user profile and saved dietary preferences.

The application does **not** currently scan food, provide nutrition/macronutrient data, reset forgotten passwords, or deploy to a public production URL.

## Technology

| Area | Technologies |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Router |
| Maps | Leaflet, React Leaflet, OpenStreetMap tiles |
| Backend | Node.js, Express, bcryptjs |
| Data | SQLite food catalog; local JSON account store |
| Quality | ESLint, TypeScript, Vitest, React Testing Library, Supertest |
| Automation | GitHub Actions |

## Architecture

The React client calls same-origin `/api` routes. During development, Vite proxies those requests to the Express server on port `5001`. The server keeps route handling in `server/src/app.js`, validation in `server/src/validation.js`, local account persistence in `server/src/user-store.js`, and parameterized SQLite access in `server/src/food-repository.js`.

SQLite is a local runtime artifact and is not committed. On first start, the server creates the schema and imports the repository's non-personal seed catalog (`5` restaurants and `281` foods) from `server/data/seed-data.json`. Account data is also local and ignored by Git.

```text
.
├── .github/workflows/ci.yml   # Pull-request and branch checks
├── docs/                     # Security and design references
├── server/
│   ├── data/                 # Public catalog seed; empty user example
│   ├── scripts/              # Database initialization utilities
│   ├── src/                  # API, validation, persistence, repositories
│   └── test/                 # API and database tests
├── src/
│   ├── api/                  # Typed frontend API client
│   ├── app/                  # Shared UI and authentication pages
│   ├── pages/                # Home, search, map, profile, survey flows
│   ├── test/                 # Browser-test setup
│   └── utils/                # Safe browser-storage helpers
├── Figma UI App Design.pdf   # Original six-page design reference
└── vite.config.ts
```

## Local setup

### Prerequisites

- Node.js 22 or later
- npm 10 or later
- A native build toolchain supported by the `sqlite3` package (prebuilt binaries are used when available)

### Install and initialize

```bash
git clone https://github.com/Azula19-b/3444-CP-.git
cd 3444-CP-
npm ci
npm --prefix server ci
npm --prefix server run db:init
```

Database initialization is idempotent. The backend also initializes an empty database automatically when it starts.

### Run the application

Use two terminals from the repository root:

```bash
# Terminal 1: Express API at http://localhost:5001
npm --prefix server run dev

# Terminal 2: Vite client at http://localhost:5173
npm run dev
```

Open `http://localhost:5173` and create a new local account. Passwords must contain between 8 and 128 characters.

## Configuration

Copy `server/.env.example` values into your shell or process manager when overrides are needed. Node does not load `.env` files automatically in this project.

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `5001` | Express listen port |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Allowed browser origin for CORS |
| `DATABASE_PATH` | `../database.db` | SQLite path, resolved from `server/` |
| `USERS_PATH` | `./data/users.json` | Local account-store path, resolved from `server/` |
| `VITE_API_BASE_URL` | empty | Optional client API base URL; empty uses the Vite proxy |

Do not commit `.env` files, database files, or `server/data/users.json`.

## Tests and quality checks

```bash
# Frontend component, interaction, validation, navigation, and state tests
npm test

# Backend authentication, validation, search, error, and repository tests
npm --prefix server test

# Frontend lint, tests, type check, and production build
npm run check

# Full local equivalent of CI
npm ci && npm --prefix server ci
npm run check && npm --prefix server run check
```

GitHub Actions runs the frontend and backend checks for pushes and pull requests to `main` or `master`.

## API reference

All request and response bodies use JSON unless noted.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/` | Plain-text health response |
| `POST` | `/api/signup` | Create a local account from `name`, `email`, `password`, and `confirmPassword` |
| `POST` | `/api/login` | Verify `email` and `password` |
| `GET` | `/api/foods` | List foods with restaurant details |
| `GET` | `/api/search-foods?query=...` | Search the catalog; query is limited to 100 characters |
| `GET` | `/api/restaurants` | List restaurants and coordinates |
| `POST` | `/api/add-restaurant` | Add a validated restaurant |
| `POST` | `/api/add-food` | Add one food or a batch of up to 100 foods |

Write endpoints validate lengths, numeric ranges, and required relationships. Database search values are parameterized, and internal database errors are not returned to clients.

## Design reference

The repository includes the original six-page [Figma UI design export](./Figma%20UI%20App%20Design.pdf). The source [Figma project](https://www.figma.com/design/xw2Dd8iOO3rXfdhqreYdlZ/UNT-Quick-Bytes?node-id=0-1&p=f&t=Cy5C78GwKInY8XY4-0) is also referenced by the project history. No live demo or application screenshots are currently published.

## Known limitations and next steps

- Account storage is intentionally local and file-based; there are no sessions, authorization middleware, email verification, or password recovery. A production deployment should use a managed user store and secure session cookies.
- Browser favorites and survey preferences are device-local and are not synchronized to an account.
- Several profile-menu actions are visual placeholders.
- Map markers fall back to predefined campus coordinates when restaurant coordinates are absent.
- The catalog is seed data and has no administrative interface or automated freshness process.
- Rate limiting and CSRF protection should be added before exposing write routes publicly.

See [docs/SECURITY.md](docs/SECURITY.md) for the repository data-handling review and historical-remediation note.

## Contributors

The following summary is limited to work visible in this repository's Git history:

- **Kingston Armstrong** — initial project setup, backend/database work, food and restaurant search, integration, and map work.
- **Bahar Ozer** — login, signup, survey, and home-page work.
- **Abraham Cerritos** — food collection and search-results frontend work.
- **Friba / Friba Fakori** — user-profile page and Figma design export updates.

Commit history contains earlier informal messages. Correcting them would require rewriting shared history, so this project leaves historical authorship and commits intact and uses clear, action-oriented messages for new work.
