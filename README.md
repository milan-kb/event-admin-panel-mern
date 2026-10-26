# Gather — Event Administration

A MERN admin panel for creating, viewing, updating, and deleting events. The dashboard displays Event ID, Event Name, Event Date, Venue, Total Registrations, and management actions.

## Features

- Dashboard and Add Event navigation with React Router.
- Event creation and editing with required fields and server-side validation.
- Confirmed deletion, success feedback, loading, error, and empty states.
- Search by event name, venue, or ID; filter upcoming and past events.
- Summary counts and a responsive table that scrolls horizontally on mobile.
- MongoDB Atlas persistence with Mongoose.

Registration totals default to zero. Attendee registration creation is outside the assessment's specified flows; counts are stored and displayed, not fabricated or edited in the event form. There is no authentication layer in this assessment implementation.

## Structure

```text
frontend/                 React + Vite application
  src/pages/              Dashboard and shared add/edit form
  src/components/         Navigation
  src/services/api.js     Shared Axios client
backend/                  Express application
  src/models/event.js     Mongoose event schema
  src/controllers/        Event CRUD and input validation
  src/routes/             REST endpoint wiring
  src/config/             Database connection
  src/middleware/         Central error responses
  test/events.test.js     API integration tests using the configured database
```

## Install

Use Node.js 22.12+ or a compatible newer version. From the project root:

```sh
npm run install:all
```

For reproducible installs using the included lockfiles:

```sh
npm ci --prefix backend
npm ci --prefix frontend
```

## Environment

`backend/.env`:

```dotenv
PORT=5000
MONGO_URI=your_exam_atlas_connection_string
CLIENT_URL=http://localhost:5173
```

`frontend/.env`:

```dotenv
VITE_API_URL=http://localhost:5000
```

Example files are included. Copy them to `.env` if needed, replace the Atlas URI with your exam database connection string, and allow your current IP under Atlas Network Access. The URI must include a database name. Restart the relevant server after changing configuration.

The assessment explicitly requires `.env` files. Only `frontend/.env` and `backend/.env` are exempted from Git's environment-file exclusions. Use an isolated exam/test database account; never publish personal or production credentials. If evaluator access requires Atlas network changes, configure that explicitly for the exam database.

## Run

In separate terminals, from this directory:

```sh
npm run server
```

```sh
npm run client
```

Open http://localhost:5173. The backend connects to MongoDB before listening on port 5000. Use the localhost frontend origin that matches `CLIENT_URL`.

## API

| Method | Route | Result |
| --- | --- | --- |
| GET | `/api/health` | HTTP health check |
| GET | `/api/events` | `{ events: [...] }` |
| GET | `/api/events/:id` | `{ event: {...} }` |
| POST | `/api/events` | Create event, status 201 |
| PUT | `/api/events/:id` | Replace the four editable fields |
| DELETE | `/api/events/:id` | Delete event |

Create/update JSON uses `name`, `description`, `date` (YYYY-MM-DD), and `location`. MongoDB `_id` is the displayed Event ID. `totalReg` is the registration count. Invalid input returns 400; nonexistent events return 404. Date-only event values are displayed in UTC to preserve the selected calendar day.

Example:

```sh
curl -X POST http://localhost:5000/api/events \
  -H 'Content-Type: application/json' \
  -d '{"name":"Tech Meetup","description":"A MERN workshop","date":"2026-11-10","location":"Hall A"}'
```

## Verification

```sh
npm run build
npm test --prefix backend
```

API tests connect to the database configured in `backend/.env`, start an independent temporary server, create disposable records, and clean up those records. Run only against an exam/test database. They verify CRUD, persistence across reads, input validation, dates, missing records, and IDs.

Browser checks performed: event creation, editing date and venue, deletion, and desktop/mobile dashboard rendering at 375px width.

## Submission

Push both application folders, package manifests, lockfiles, and the required exam-only configuration to your GitHub repository. Confirm evaluator access and submit the repository URL before the instructor-confirmed cutoff. The supplied assessment text lists conflicting deadlines; confirm the actual submission time.
