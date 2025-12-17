# SmashBook — Badminton Court Booking System

Production-style full-stack demo for multi-resource badminton bookings with atomic validation, dynamic pricing, and a lightweight admin panel.

## Tech Stack
- Backend: Node.js, Express, in-memory store (Mongo-ready schema style), dayjs
- Frontend: React (Vite), Tailwind CSS
- API proxy: Vite dev proxy to Express

## Deliverables Checklist
- Repo with README (setup, deploy, assumptions) — this file.
- Seed data for courts, equipment, coaches, pricing rules: [backend/data/seedData.js](backend/data/seedData.js).
- Short write-up (DB design & pricing engine, ~300–500 words) — see section below.

## Quickstart
1) Install deps
```bash
cd backend && npm install
cd ../frontend && npm install
```
2) Run backend
```bash
cd backend
npm run dev # or npm start
```
3) Run frontend (new terminal)
```bash
cd frontend
npm run dev
```
The frontend dev server proxies `/api` to `http://localhost:4000`.

### Deploying the frontend (e.g., Vercel)
- Root directory: `frontend`
- Install: `npm install`
- Build: `npm run build`
- Output: `dist`
- Env: set `VITE_API_BASE` to your deployed backend URL (e.g., `https://your-backend.example.com/api`). Without this, Vercel will call `/api` on the static host and return 404.
- After setting the env var, trigger a fresh deploy so the build picks it up.

## Seed Data
Courts (4), Equipment (rackets/shoes), Coaches (3 with availability), Pricing rules (peak, weekend, indoor premium, equipment fee, coach fee) are preloaded from [backend/data/seedData.js](backend/data/seedData.js).

## API Surface (key routes)
- `GET /api/health` — service check
- `GET/POST/PUT /api/courts`
- `GET/POST/PUT /api/equipment`
- `GET/POST/PUT /api/coaches`
- `GET/POST/PUT/DELETE /api/pricing-rules`
- `GET /api/availability?date=YYYY-MM-DD&startTime=HH:MM&endTime=HH:MM`
- `POST /api/bookings` — atomic booking
- `POST /api/bookings/quote` — price preview
- `GET /api/bookings` — history

## Frontend UX
- Booking flow: pick date + slot → live availability → choose court/equipment/coach → live price → confirm → history
- Admin: manage courts, equipment, coaches, pricing rules (toggle/CRUD)
- Responsive layout, custom typography (Space Grotesk), Tailwind utility theming

## 300–500 Word Write-Up (Design & Pricing)
The system models courts, equipment, coaches, pricing rules, and bookings as discrete collections held in an in-memory store that mirrors a Mongo-style shape. Each entity uses stable IDs and minimal schemas so the store can later be swapped for Mongoose models without changing controllers or services. Courts carry type (indoor/outdoor), status, and a base hourly rate. Equipment retains inventory counts and rental fees. Coaches include hourly rate, active flag, and day-of-week availability with slot ranges. Pricing rules are first-class documents with `type`, `criteria`, `amount`, `mode`, and `enabled` flags, enabling feature toggles and stackable adjustments. Bookings capture all selected resources plus a `price` breakdown snapshot to keep historical totals immutable even if pricing changes later.

Atomic booking lives in a dedicated service: it validates payload shape, ensures time ordering, verifies court status, and performs overlap checks for court, coach, and equipment against existing bookings. Equipment checks sum reserved quantities in overlapping slots to avoid over-allocation. Coach validation also respects declared availability windows. Only when all resources pass does the service compute price and persist a booking, preventing partial successes. A simple cancel endpoint flips status without deleting history. The availability service reuses the same overlap logic to present slot-ready views for courts, coaches, and equipment.

The pricing engine is configuration-driven: base total = court rate * hours + equipment rentals * hours + coach hourly * hours. Rules are evaluated dynamically with contextual data (day-of-week, start hour, court type, equipment count, coach presence). Supported modes include percent uplift, flat additions, and flat-per-item fees. Rules can be toggled or edited from the admin panel, and the frontend requests `/bookings/quote` after each selection change to show live breakdowns. Because adjustments are additive deltas applied to a base total, stacking multiple rules is straightforward and transparent; applied rules are echoed back to the client for clarity. This structure allows easy future extension (e.g., member discounts) without touching booking logic. Swapping to Mongo would keep the same service boundaries while persisting documents and enabling transactional guarantees.

## Testing Notes
- Use `curl` or Postman against `/api` to verify endpoints.
- Validate pricing by toggling rules in the admin panel and watching the price breakdown update.

## Assumptions
- Time slots are hour-based and validated client-side; server enforces ordering and overlaps.
- In-memory store keeps state for the running process; persist-to-disk or Mongo can replace `data/db.js` without API changes.
- No auth; admin panel is open for demo purposes.
