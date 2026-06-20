# Customer List Management System

A MERN-stack app for managing customer lists and their contacts, with bulk
contact import processed asynchronously through a BullMQ queue and worker.

Built for the audience-management use case seen in WhatsApp marketing / CRM tools:
create lists (VIP Customers, Ahmedabad Customers, …), manage contacts inside each
list, and import contacts in bulk without blocking the API.

## Tech stack

- **Backend:** Node.js + Express
- **Database:** MongoDB (Mongoose)
- **Queue:** BullMQ + Redis
- **Frontend:** React (Vite) + React Router + Axios

## Features

- List CRUD (create, view, update, delete)
- Contact CRUD inside a list
- Search contacts by name, phone or email
- Bulk import via an API that enqueues work; a separate worker inserts the
  contacts in the background
- Import job tracking with status `Pending → Processing → Completed / Failed`
  and live counts (total / inserted / duplicates / failed)

## Validation rules

- A contact's **phone is required**.
- **A phone number is unique within a list** (the same number may appear in
  different lists). Enforced by a compound unique index `{ listId, phone }`.

## Project structure

```
backend/
  config/        db + redis connections
  models/        List, Contact, ImportJob (Mongoose schemas)
  controllers/   request handlers (business logic)
  routes/        REST endpoints
  middleware/    asyncHandler + central error handler
  queues/        BullMQ queue (producer)
  workers/       BullMQ worker (consumer) — runs as its own process
  utils/         ApiError
  app.js         Express app (middleware + routes)
  server.js      connects DB, starts the HTTP server
frontend/frontend/
  src/api/       axios client + endpoint wrappers
  src/pages/     Lists, Contacts, Import pages
  src/components/ Navbar, Modal
```

## Prerequisites

- Node.js 18+
- MongoDB running locally (or a connection string)
- Redis running locally

Quick start for the services (Docker is the simplest):

```bash
docker run -d -p 27017:27017 --name mongo mongo
docker run -d -p 6379:6379 --name redis redis
```

## Setup & run

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env        # adjust values if needed
npm run dev                 # starts the API on http://localhost:3000
```

Open a **second terminal** for the worker (it is a separate process):

```bash
cd backend
npm run worker:dev          # listens for import jobs
```

### 2. Frontend

```bash
cd frontend/frontend
npm install
npm run dev                 # starts Vite on http://localhost:5173
```

If your API is not on `http://localhost:3000`, create `frontend/frontend/.env`:

```
VITE_API_URL=http://localhost:3000/api
```

## API reference

Base URL: `http://localhost:3000/api`

### Lists
| Method | Path           | Description     |
| ------ | -------------- | --------------- |
| POST   | `/lists`       | Create a list   |
| GET    | `/lists`       | List all lists  |
| GET    | `/lists/:id`   | Get one list    |
| PUT    | `/lists/:id`   | Update a list   |
| DELETE | `/lists/:id`   | Delete a list (and its contacts) |

### Contacts
| Method | Path                              | Description                  |
| ------ | --------------------------------- | ---------------------------- |
| GET    | `/lists/:listId/contacts?search=` | List/search contacts in a list |
| POST   | `/lists/:listId/contacts`         | Add a contact                |
| PUT    | `/contacts/:id`                   | Update a contact             |
| DELETE | `/contacts/:id`                   | Delete a contact             |

### Import
| Method | Path                      | Description                          |
| ------ | ------------------------- | ------------------------------------ |
| POST   | `/lists/:listId/import`   | Queue a bulk import (returns job id)  |
| GET    | `/import/:id`             | Get an import job's status/counts     |

Import request body:

```json
{
  "contacts": [
    { "name": "Ravi Patel", "phone": "9876543210", "email": "ravi@example.com" },
    { "name": "Neha Shah",  "phone": "9123456780" }
  ]
}
```

Response: `202 Accepted` with `{ "importJobId": "<id>" }`. Poll
`GET /import/:id` to watch progress.

## How the async import works

1. `POST /lists/:listId/import` creates an `ImportJob` (status `Pending`) and
   adds a job to the `contact-import` queue, then returns `202` immediately.
2. The worker picks up the job, sets status `Processing`, and inserts contacts
   one by one — counting `inserted`, `duplicates` (DB duplicate-key errors) and
   `failed` (e.g. missing phone).
3. When finished it writes the totals and sets status `Completed` (or `Failed`
   if the whole job throws).
4. The frontend polls `GET /import/:id` every second to show live progress.
