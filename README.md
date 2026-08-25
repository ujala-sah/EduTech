# EduTrack — Student Management & Learning Portal

EduTrack is a full-stack MERN web application that brings academic activities into one place. Students, teachers, and administrators can manage courses, assignments, attendance, notes, exam schedules, results, and notifications from a single portal.

This project was built as a college final-year / semester project.

## Problem statement

Students often have to use different systems for assignments, attendance, notes, exam schedules, and results. That makes it easy to miss deadlines, lose files, and lose track of academic progress.

EduTrack solves this by providing one role-based portal for academic management.

## Objectives

- Provide a centralized academic portal for students, teachers, and admins
- Implement secure JWT authentication and role-based authorization
- Support real CRUD operations through a REST API and MongoDB
- Allow assignment submission and resource uploads
- Track attendance, exams, results, and notifications
- Keep the implementation understandable for a college project presentation

## Features

- Register, login, logout, profile update, and password change
- Student, teacher, and admin dashboards with live statistics
- Course management and enrollment
- Assignment creation, search, filters, submission, and grading
- Notes and resource uploads with download
- Attendance marking and percentage summary
- Exam schedule management
- Result entry with automatic grade and GPA calculation
- Notifications with unread count
- Search and filters for assignments, resources, and users
- Protected routes on the frontend and role checks on the backend

## User roles

**Student**

- View dashboard, profile, courses, assignments, resources, attendance, exams, results, and notifications
- Submit assignments
- Cannot modify attendance, official results, courses, or other users

**Teacher**

- Manage assignments, resources, attendance, exams, and results for assigned courses
- View student submissions and give marks/feedback
- Send notifications to enrolled students

**Admin**

- Manage users, students, teachers, and courses
- Activate or deactivate accounts
- View system statistics and manage academic records

## Technology stack

- **Frontend:** React.js, Vite, React Router, Axios, CSS
- **Backend:** Node.js, Express.js, JWT, bcryptjs, Multer
- **Database:** MongoDB with Mongoose

## System architecture

```text
React UI
  → Axios
  → Express route
  → Auth / role middleware
  → Controller
  → Mongoose model
  → MongoDB
  → JSON response
  → React UI
```

## Database models

- User
- Course
- Assignment
- Submission
- Resource
- Attendance
- Exam
- Result
- Notification

Relationships use MongoDB ObjectId references. For example, a Course belongs to a Teacher and has many Students. An Assignment belongs to a Course. A Submission belongs to an Assignment and a Student.

## API endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Student registration |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/password` | Change password |
| GET | `/api/dashboard` | Role-based dashboard data |
| GET/POST/PUT/DELETE | `/api/courses` | Course management |
| GET/POST/PUT/DELETE | `/api/assignments` | Assignment management |
| POST | `/api/submissions` | Submit assignment |
| GET | `/api/submissions` | Teacher/admin submissions |
| PUT | `/api/submissions/:id/grade` | Grade a submission |
| GET/POST/DELETE | `/api/resources` | Notes and files |
| GET/POST | `/api/attendance` | Attendance records |
| GET | `/api/attendance/summary` | Attendance percentages |
| GET/POST/PUT/DELETE | `/api/exams` | Exam schedule |
| GET/POST | `/api/results` | Results and grades |
| GET | `/api/notifications` | User notifications |
| PUT | `/api/notifications/:id/read` | Mark one as read |
| POST | `/api/notifications` | Send notification |

## Folder structure

```text
.
├── client/                     # React frontend
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── services/
│       └── styles/
├── server/                     # Express backend
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── utils/
│   ├── seed.js
│   └── server.js
└── README.md
```

## Installation

Requirements:

- Node.js 18 or later
- npm
- MongoDB running locally, or a MongoDB Atlas URI

```bash
npm run install-all
```

## Environment variables

Create `server/.env` from `server/.env.example`:

```text
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/edutrack
JWT_SECRET=replace_this_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
CLIENT_URLS=https://your-frontend.pages.dev
JWT_EXPIRES_IN=7d
```

Create `client/.env` from `client/.env.example`:

```text
VITE_API_URL=/api
```

For a Cloudflare Pages production build, set this to the public API origin, for example `https://your-api-host/api`.

Port 5001 is used because macOS often occupies port 5000 with AirPlay Receiver.

## How to run the backend

```bash
cd server
npm run dev
```

API: [http://127.0.0.1:5001/api/health](http://127.0.0.1:5001/api/health)

## How to run the frontend

```bash
cd client
npm run dev
```

App: [http://127.0.0.1:5173](http://127.0.0.1:5173)

To run both from the project root:

```bash
npm run dev
```

## Deploy on Cloudflare

The React app is a static Vite SPA. Cloudflare Workers serves those files from `client/dist` using `wrangler.jsonc`. The Express + MongoDB API cannot run on this Worker; host it on a Node service (Render, Railway, Fly.io, or a VPS) and point the frontend at it.

Cloudflare dashboard settings when connecting this GitHub repo:

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Environment variable: `VITE_API_URL` = `https://your-api-host/api`
- Node version: 20

On the API host, set `CLIENT_URL` to your `https://*.workers.dev` or `https://*.pages.dev` (or custom) domain. Preview deployments on `*.pages.dev` are allowed automatically.

Local preview of the production frontend build:

```bash
npm run build
cd client && npm run preview
```

## Seed demo data

```bash
npm run seed
```

This creates demo users, courses, assignments, attendance, exams, results, and notifications.

## Demo credentials

Password for all demo accounts: `Demo@123`

| Role | Email |
|---|---|
| Admin | admin@edutrack.com |
| Teacher | teacher@edutrack.com |
| Student | student@edutrack.com |

## Screenshots

Add screenshots here for project submission:

- Login page
- Student dashboard
- Teacher dashboard
- Admin dashboard
- Assignment submission
- Attendance page

## Grading scale

The scale lives in `server/utils/grading.js` so it can be changed in one place.

| Marks | Grade | Grade point |
|---|---|---|
| 90–100 | A+ | 4.0 |
| 80–89 | A | 3.7 |
| 70–79 | B+ | 3.3 |
| 60–69 | B | 3.0 |
| 50–59 | C+ | 2.7 |
| 40–49 | C | 2.0 |
| Below 40 | F | 0 |

## Future improvements

- Email reminders for assignment deadlines
- Real-time chat between teacher and student
- Export results as PDF
- Cloud storage for uploaded files
- Forgot password via email

## Developer information

**Project:** EduTrack — Student Management & Learning Portal  
**Stack:** MongoDB, Express.js, React.js, Node.js  
**Type:** College full-stack project
