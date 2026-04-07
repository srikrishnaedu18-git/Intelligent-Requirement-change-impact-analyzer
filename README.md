# Intelligent Requirement Change Impact Analyzer

A MERN-based SCM dashboard that demonstrates how software configuration
management concepts can be implemented as a practical decision-support system.
The project turns requirements into structured data and supports
identification, traceability, change control, impact analysis, status
accounting, and audit logging in one workflow.

## Overview

This project was designed as an academic SCM implementation inspired by
IEEE Std-828-2012 concepts. Instead of keeping requirements and changes only in
documents, the system stores them in MongoDB and exposes them through an
interactive React dashboard.

The application is built around four core SCM modules:

- `Requirements Manager`: create and manage requirements with IDs, priority, status, and tags
- `Traceability Matrix (RTM)`: link requirements to code modules and test cases
- `Change Request Portal`: analyze blast radius and classify change risk
- `Audit Log Dashboard`: track status-accounting activity and review the SCM journal

## Key Features

- Requirement creation with `reqId`, title, description, priority, status, and tags
- Searchable requirements register for quick lookup
- Traceability linking between requirements, code modules, and test cases
- Automatic orphan requirement detection
- Impact analysis endpoint for blast-radius scoring
- Change request workflow with risk classification: `Standard`, `Normal`, `Emergency`
- Automatic audit logging for requirement, traceability, and CR operations
- Status-accounting dashboard with coverage and lifecycle metrics

## Architecture

### Frontend

- `React`
- `Vite`
- `Tailwind CSS`
- `Lucide React`

### Backend

- `Node.js`
- `Express`
- `MongoDB Atlas`
- `Mongoose`

### Data Model

- `Requirement`
- `TraceabilityLink`
- `ChangeRequest`
- `AuditLog`

## SCM Mapping

| SCM Concept | System Implementation |
| --- | --- |
| Configuration Identification | Unique requirement IDs, tags, and lifecycle states |
| Change Control | Change Request Portal with blast-radius analysis |
| Status Accounting | Dashboard metrics for requirements, coverage, and CRs |
| Configuration Audits | Audit timeline of requirement/link/change activity |
| Traceability | RTM linking requirements to code and tests |

## Project Structure

```text
SCM/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
└── README.md
```

## Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd SCM
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 4. Configure environment variables

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.aqf276p.mongodb.net/scm_intelligence?retryWrites=true&w=majority&appName=Cluster0
```

Create `frontend/.env` if you want to override the default API base URL:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Running the Project

### Start the backend

```bash
cd backend
npm run dev
```

### Start the frontend

```bash
cd frontend
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend runs on
`http://localhost:5000`.

## API Modules

### Requirements

- `GET /api/requirements`
- `POST /api/requirements`

### Traceability

- `GET /api/traceability-links`
- `POST /api/traceability-links`

### Change Requests

- `GET /api/change-requests`
- `POST /api/change-requests`
- `GET /api/change-requests/analyze-impact/:reqId`

### Audit Logs

- `GET /api/audit-logs`

## Impact Score Logic

The current blast-radius logic is intentionally simple and presentation-friendly:

- Base score = `10`
- `+20` for each linked code module
- `+15` if requirement priority is `High`

Risk level is derived as:

- `Standard` if score `< 30`
- `Normal` if score is `30 - 60`
- `Emergency` if score `> 60`

## Demo Flow

For the best presentation/demo experience:

1. Create a few requirements such as login, payment, and admin access.
2. Link some requirements to code modules and test cases.
3. Leave one requirement unlinked to show orphan detection.
4. Raise a change request on a linked high-priority requirement.
5. Use the dashboard and audit timeline to explain SCM governance.

## Future Improvements

- Edit and delete actions for all modules
- User authentication and role-based approvals
- Better visual analytics with charts
- Seed script for sample demo data
- Exportable audit reports and dashboards

## Repository Description

`Intelligent Requirement Change Impact Analyzer built with MERN to demonstrate SCM concepts like requirements management, traceability, change control, impact analysis, audit logging, and status accounting.`

## License

This project is intended for academic and learning purposes.
