# POS_SYSTEM

Modern grocery POS system built with a MERN stack frontend and backend, plus Docker support for local development.

## Current status

- Backend API: Express + MongoDB + JWT authentication
- Frontend: React 19 + Vite + Tailwind CSS v4
- Admin screens: dashboard, products, categories, brands, inventory, users, reports, and sales history
- POS flow: barcode search, cart management, payment modal, and receipt printing
- Theme: Apple-style dark UI across the app
- Docker: backend, frontend, and MongoDB services are configured in [docker-compose.yml](docker-compose.yml)

## Tech stack

- Backend: Node.js, Express, Mongoose, MongoDB, JWT, bcryptjs
- Frontend: React, Vite, React Router, Tailwind CSS, Radix UI, Lucide, Recharts
- Testing: Jest, Supertest
- Tooling: ESLint, Prettier, Docker

## Project structure

- [backend/](backend) - API server, models, services, controllers, tests
- [frontend/](frontend) - React UI, pages, components, theme, services
- [docker-compose.yml](docker-compose.yml) - local development stack

## Key features

- Secure login with role-based access
- Product, category, brand, and inventory management
- Sales history and reports
- POS checkout with keyboard shortcuts
- Stock adjustment and purchase recording
- Barcode lookup and receipt printing

## Local development

### Backend

1. Set environment variables in [backend/.env](backend/.env) using [backend/.env.sample](backend/.env.sample)
2. Start the API:

```bash
cd backend
npm install
npm run dev
```

### Frontend

1. Start the UI:

```bash
cd frontend
npm install
npm run dev
```

### Docker

The current Docker setup includes:

- MongoDB on port 27017
- Backend API on port 3001
- Frontend on port 5173

Run the stack with:

```bash
docker compose up --build
```

## Environment variables

Backend expects:

- `PORT=3001`
- `NODE_ENV=development`
- `JWT_SECRET=...`
- `MONGODB_URI=mongodb://...`
- `CORS_ORIGIN=http://localhost:5173`

## Available scripts

### Backend

- `npm run dev` - start API in development
- `npm start` - start API in production mode
- `npm test` - run Jest tests
- `npm run db:seed` - seed demo data

### Frontend

- `npm run dev` - start Vite dev server
- `npm run build` - build for production
- `npm run lint` - run ESLint

## Validation status

- Backend tests: passing
- Frontend lint: passing
- Frontend production build: passing

## Notes

- The frontend API client currently points to `http://localhost:3001/api`.
- Docker is configured for local development, not production hardening.
- The UI has been restyled to a consistent Apple-inspired dark theme.
