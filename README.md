<div align="center">

# EventHub Admin — Event Registration System

<p align="center">
  <strong>High-performance, Neo-Brutalist Admin Panel for Event Registration built on the MERN Stack.</strong>
</p>

[![MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Express.js](https://img.shields.io/badge/Backend-Express.js%205-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![React 19](https://img.shields.io/badge/Frontend-React%2019-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Runtime-Node.js%20LTS-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Bundler-Vite%208-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Vercel Deployed](https://img.shields.io/badge/Deployment-Vercel%20Live-black?style=for-the-badge&logo=vercel&logoColor=white)](https://event-admin-panel-mern.vercel.app)

<br />

**[View Live Production Demo](https://event-admin-panel-mern.vercel.app)** &nbsp;&bull;&nbsp; **[Jump to API Docs](#rest-api-reference)** &nbsp;&bull;&nbsp; **[Getting Started](#getting-started-local-setup)**

<br />

<p align="center">
  <img src="assets/dashboard-preview.png" alt="EventHub Admin Dashboard Preview" width="100%" style="border-radius: 8px; border: 2px solid #000;" />
</p>

</div>

---

## Exam Requirements Compliance Checklist

All evaluation requirements have been designed, implemented, and verified end-to-end:

| # | Requirement | Implementation Details | Status |
|---|---|---|:---:|
| **1** | **Dashboard Listing** | Event ID, Name, Date, Venue, and Total Registrations | **Complete** |
| **2** | **Navbar Navigation** | `Dashboard` and `Add Event` tabs with active routing | **Complete** |
| **3** | **Update & Delete** | Per-row action buttons with confirmation & instant sync | **Complete** |
| **4** | **Add Event Form** | Name, Description, Date, and Venue input fields | **Complete** |
| **5** | **Update Functionality** | Pre-populated edit view and backend PUT mutation | **Complete** |
| **6** | **Backend & Database** | Node.js / Express REST API connected to MongoDB Atlas | **Complete** |
| **7** | **UI/UX Craft** | Distinct Neo-Brutalist design, clashing neon palette, 100% responsive | **Complete** |
| **8** | **Environment Files** | Evaluator-ready `.env` files committed to repository | **Complete** |

---

## UI/UX Design System: Neo-Brutalism

This application is built using the **Brutalist / Neo-Brutalist** aesthetic for high visual impact and memorable UX:

* **Stark Black Outlines**: 3px solid black borders (`#000000`) defining all functional interactive elements.
* **Hard Block Shadows**: High-contrast zero-blur shadows (`4px 4px 0px #000`) with tactile push-down click physics.
* **Clashing Neon Color Palette**:
  * **Electric Canary Yellow** (`#ffe600`) — Total Events & Primary Accents
  * **Acid Neon Lime** (`#00ff66`) — Upcoming Events & Status Badges
  * **Electric Cyan** (`#00e5ff`) — Total Registrations & Update Buttons
  * **Hot Bubblegum Pink** (`#ff3399`) — Delete Confirmations & Pass Cutouts
* **Live Ticket Pass Preview**: The Add/Edit event form features a real-time reactive concert/festival VIP pass with barcode simulation and punch-hole cutouts that updates as you type.
* **Click-to-Copy Event ID**: Clickable monospace hash badges (`#671d...`) with instant visual clipboard feedback.

---

## Architecture & Project Structure

```text
event-admin-panel-mern/
├── assets/
│   └── dashboard-preview.png       # Live application screenshot
├── backend/                        # Express.js REST API
│   ├── src/
│   │   ├── config/db.js            # MongoDB Atlas Mongoose connection
│   │   ├── controllers/
│   │   │   └── eventController.js  # CRUD controller with server validation
│   │   ├── models/
│   │   │   └── event.js            # Event schema (name, description, date, location, totalReg)
│   │   ├── routes/
│   │   │   └── eventRoutes.js      # Express router (/api/events)
│   │   ├── middleware/
│   │   │   └── errorHandler.js    # Central error handler (CastError, ValidationError)
│   │   ├── app.js                  # Express middleware & route mounting
│   │   └── server.js               # Server bootstrap & port listener
│   ├── .env                        # Included MongoDB Atlas connection string
│   └── package.json
├── frontend/                       # React 19 + Vite Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Neo-brutalist navigation bar
│   │   │   ├── CalendarDate.jsx    # Stamp-style calendar date badge
│   │   │   └── Icon.jsx            # Clean custom SVG icon library
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx       # Event metrics, filter bar & data table
│   │   │   └── EventForm.jsx       # Dual-mode Add/Edit form + Live Pass
│   │   ├── services/
│   │   │   └── api.js              # Centralized Axios HTTP client
│   │   ├── App.jsx                 # React Router v7 routes
│   │   ├── index.css               # Neo-Brutalist stylesheet
│   │   └── main.jsx
│   ├── .env                        # Vite API URL configuration
│   └── package.json
├── vercel.json                     # Unified full-stack Vercel deployment
└── package.json                    # Root runner scripts
```

---

## REST API Reference

All endpoints are mounted under `/api/events` and return JSON responses:

| Method | Endpoint | Description | Request Body |
|---|---|---|---|
| `GET` | `/api/health` | Health check endpoint | _None_ |
| `GET` | `/api/events` | List all events (sorted by date) | _None_ |
| `GET` | `/api/events/:id` | Retrieve single event by ID | _None_ |
| `POST` | `/api/events` | Create a new event | `{ name, description, date, location }` |
| `PUT` | `/api/events/:id` | Update an existing event | `{ name, description, date, location }` |
| `DELETE` | `/api/events/:id` | Delete an event permanently | _None_ |

### Example Request (`POST /api/events`)

```bash
curl -X POST https://event-admin-panel-mern.vercel.app/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Global AI & Web3 Summit 2026",
    "description": "Annual conference on distributed systems and agentic coding.",
    "date": "2026-11-20",
    "location": "Grand Convention Center, Hall 4"
  }'
```

---

## Getting Started (Local Setup)

### Prerequisites
* **Node.js**: v20+ or v22 LTS recommended
* **npm**: v10+

### 1. Clone the Repository
```bash
git clone https://github.com/milan-kb/event-admin-panel-mern.git
cd event-admin-panel-mern
```

### 2. Install Dependencies
```bash
npm run install:all
```

### 3. Verify Environment Variables
Both `.env` files are already included for evaluators:

* `backend/.env`:
  ```env
  PORT=5000
  MONGO_URI="mongodb+srv://kbmilan95_db_user:dutK0bStSAxR5Rqy@cluster0.3hqw8fp.mongodb.net"
  CLIENT_URL=http://localhost:5173
  ```
* `frontend/.env`:
  ```env
  VITE_API_URL=http://localhost:5000
  ```

### 4. Run Development Servers
Open two terminal windows:

```bash
# Terminal 1: Start Express Backend (watch mode on http://localhost:5000)
npm run server

# Terminal 2: Start Vite Frontend (live HMR on http://localhost:5173)
npm run client
```

Navigate to `http://localhost:5173` in your browser.

---

## Build & Production Verification

```bash
# Verify frontend bundle compilation
npm run build --prefix frontend

# Run backend syntax & validation check
node --check backend/src/server.js
```

---

<div align="center">
  <sub>Built for the Exit Examination: Full Stack Development (MERN). Powered by MongoDB Atlas, Express, React, and Node.js.</sub>
</div>
