# 🌿 Swachh AI - Smart Garbage Monitoring & Collection System

AI-powered platform for citizens to report garbage, with municipal admin task management, employee/NGO tracking, and Razorpay donations.

## Features

- 🗑️ **Citizen Module** — Report garbage with image + location, track complaints, give feedback
- 👨‍💼 **Admin Module** — View all complaints, assign employees/NGOs, monitor progress
- 👷 **Employee Module** — View assigned tasks, update status, upload completion proof
- 🏢 **NGO Module** — Volunteer for cleaning tasks, manage assignments
- 💰 **Razorpay Donations** — Preset & custom amounts, payment verification
- 🔐 **JWT Authentication** — Role-based access control (citizen/admin/employee/ngo)
- ✨ **Animations** — Framer Motion page transitions, staggered lists, counters

## Tech Stack

| Layer      | Technology                     |
|------------|-------------------------------|
| Frontend   | React 18, Vite, TailwindCSS, Framer Motion |
| Backend    | Node.js, Express              |
| Database   | MongoDB (Mongoose)            |
| Auth       | JWT + bcryptjs                |
| Payments   | Razorpay                      |
| Uploads    | Multer                        |

## Project Structure

```
swachh-ai/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components (10 pages)
│   │   ├── context/         # AuthContext
│   │   ├── utils/           # Axios API instance
│   │   ├── App.jsx          # Router
│   │   └── main.jsx         # Entry point
│   ├── vercel.json          # Vercel deployment config
│   └── package.json
├── server/                  # Express backend
│   ├── models/              # Mongoose schemas (5 models)
│   ├── controllers/         # Route handlers (6 controllers)
│   ├── routes/              # API routes (6 route files)
│   ├── middleware/          # Auth, upload, error handler
│   ├── config/              # DB connection + seed script
│   ├── render.yaml          # Render deployment config
│   ├── server.js            # Entry point
│   └── package.json
└── README.md
```

## Local Development

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Razorpay account (for donations)

### 1. Clone & setup environment

```bash
cd swachh-ai

# Server env
cp .env.example server/.env
# Edit server/.env with your values:
#   MONGO_URI=mongodb://localhost:27017/swachh-ai
#   JWT_SECRET=any_random_secret_string
#   RAZORPAY_KEY_ID=rzp_test_xxxxx
#   RAZORPAY_KEY_SECRET=xxxxx

# Client env (optional for local dev — Vite proxy handles it)
cp client/.env.example client/.env
```

### 2. Start backend

```bash
cd server
npm install
npm run seed    # Creates default admin (admin@swachh.ai / admin123)
npm run dev     # Starts on port 5000
```

### 3. Start frontend

```bash
cd client
npm install
npm run dev     # Starts on port 3000
```

Open http://localhost:3000

### Default Admin Login
- **Email:** admin@swachh.ai
- **Password:** admin123

## API Endpoints

| Method | Endpoint                    | Auth | Description              |
|--------|----------------------------|------|--------------------------|
| POST   | /api/auth/register         | No   | Register user            |
| POST   | /api/auth/login            | No   | Login user               |
| GET    | /api/auth/me               | Yes  | Get current user         |
| POST   | /api/complaints            | Yes  | Create complaint         |
| GET    | /api/complaints            | Yes  | List complaints          |
| GET    | /api/complaints/:id        | Yes  | Get complaint detail     |
| PUT    | /api/complaints/:id/status | Yes  | Update status            |
| POST   | /api/assignments           | Admin| Assign employee/NGO      |
| GET    | /api/assignments           | Yes  | List assignments         |
| PUT    | /api/assignments/:id       | Yes  | Update with proof        |
| POST   | /api/feedback              | Yes  | Submit feedback          |
| GET    | /api/feedback/:complaintId | Yes  | Get feedback             |
| POST   | /api/donations/create-order| Yes  | Create Razorpay order    |
| POST   | /api/donations/verify-payment| Yes| Verify payment          |
| GET    | /api/donations             | Yes  | Donation history         |
| GET    | /api/ngo/available-complaints| Yes | Unassigned complaints   |
| POST   | /api/ngo/volunteer/:id     | Yes  | Volunteer for task       |

---

## 🚀 Deployment

### Backend → Render

1. Push `server/` to a GitHub repo (or use the monorepo)
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your repo
4. Settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment:** Node
5. Add environment variables:
   - `MONGO_URI` — your MongoDB Atlas connection string
   - `JWT_SECRET` — a secure random string
   - `RAZORPAY_KEY_ID` — from Razorpay dashboard
   - `RAZORPAY_KEY_SECRET` — from Razorpay dashboard
   - `CLIENT_URL` — your Vercel frontend URL (e.g. https://swachh-ai.vercel.app)
   - `NODE_ENV` — `production`
6. Deploy!

Copy the Render URL (e.g. `https://swachh-ai-api.onrender.com`)

### Frontend → Vercel

1. Push `client/` to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your repo
4. Settings:
   - **Root Directory:** `client`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Add environment variables:
   - `VITE_API_URL` — your Render backend URL + `/api` (e.g. `https://swachh-ai-api.onrender.com/api`)
   - `VITE_RAZORPAY_KEY_ID` — your Razorpay key ID
6. Deploy!

### Post-Deployment

1. Update `CLIENT_URL` on Render to your Vercel URL
2. Run the seed script once:
   ```bash
   # In Render shell or locally pointing to production DB
   cd server && npm run seed
   ```
3. Test login with admin@swachh.ai / admin123

---

## License

MIT
