# Demonstrating the application

1. Start the backend with `npm run server` and the frontend with `npm run client`.
2. Open http://localhost:5173.
3. Choose Add Event; enter a name, description, date, and venue.
4. Create the event and show its dashboard row. The MongoDB ID and initial registration count of zero appear automatically.
5. Refresh to show persistence in Atlas.
6. Choose Update, change the venue/date, save, and refresh.
7. Choose Delete, confirm, and show the row is removed.
8. Resize to mobile width and scroll the events table horizontally to reach the action buttons.

## How the pieces fit

- `frontend/src/pages/EventForm.jsx`: collects input; POST creates and PUT updates.
- `frontend/src/pages/Dashboard.jsx`: GET loads events; DELETE removes an event; search/filter operate on the loaded list.
- `frontend/src/services/api.js`: shared backend URL and request timeout.
- `backend/src/routes/eventRoutes.js`: maps URLs and HTTP methods to controller functions.
- `backend/src/controllers/eventController.js`: validates the four editable fields and performs database operations.
- `backend/src/models/event.js`: defines the fields, required values, and default registration count.
- `backend/src/config/db.js`: connects to Atlas using MONGO_URI.

Request flow: browser → Express route → controller → Mongoose → Atlas → JSON response → React screen.

## Before submitting

- Run `npm run build` and `npm test --prefix backend`.
- Ensure the GitHub repository contains frontend and backend plus their dependencies and lockfiles.
- Include only exam/test credentials in the required .env files.
- Verify evaluator repository/database access and submit the repository link before the confirmed cutoff.
