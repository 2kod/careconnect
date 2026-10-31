# CareConnect Deployment Guide

CareConnect is a full-stack **PERN** application (PostgreSQL + Express + React + Node.js). 

Here are the two simplest, 100% free ways to deploy it live on the internet:

---

## 🌟 Method 1: 1-Click Deployment on Render (Recommended)
This deploys the **entire application (PostgreSQL Database + Backend API + Frontend)** together under a single live URL with zero cost.

### Steps:
1. Log in to [Render.com](https://render.com) using your GitHub account.
2. Click **New +** in the top navigation and select **Blueprint**.
3. Connect your GitHub repository: `https://github.com/2kod/careconnect`.
4. Render will automatically detect the included `render.yaml` blueprint:
   - **PostgreSQL Database:** Automatically provisions a free cloud PostgreSQL database (`careconnect-db`).
   - **Web Service:** Automatically builds the React frontend, runs database migrations/seeds, and starts the Express server.
5. Click **Apply**.
6. In ~2-3 minutes, your live link (e.g. `https://careconnect.onrender.com`) will be online and fully functional!

---

## ⚡ Method 2: Vercel (Frontend) + Render / Neon (Backend & Database)
If you prefer deploying the frontend with Vercel:

### Step 1: Create a Free Cloud PostgreSQL Database
1. Go to [Neon.tech](https://neon.tech) or [Render.com](https://render.com) and create a free PostgreSQL database.
2. Copy the **Connection String** (`DATABASE_URL`).

### Step 2: Deploy the Backend (Express API) on Render
1. Go to [Render.com](https://render.com) → **New +** → **Web Service**.
2. Connect `https://github.com/2kod/careconnect`.
3. Set:
   - **Root Directory:** `server`
   - **Build Command:** `npm install && npm run db:migrate && npm run db:seed`
   - **Start Command:** `npm start`
4. Under **Environment Variables**, add:
   - `DATABASE_URL`: *(Your connection string from Step 1)*
   - `JWT_SECRET`: *(Any secret text)*
   - `NODE_ENV`: `production`
5. Click **Deploy Web Service** and copy your backend URL (e.g. `https://careconnect-api.onrender.com`).

### Step 3: Deploy the Frontend on Vercel
1. Go to [Vercel.com](https://vercel.com) and click **Add New...** → **Project**.
2. Import `https://github.com/2kod/careconnect`.
3. Set:
   - **Root Directory:** `client`
   - **Framework Preset:** `Vite`
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://careconnect-api.onrender.com/api` *(Your Render backend URL + /api)*
5. Click **Deploy**. Your Vercel frontend is live!

---

### Verifying Your Deployment
Once deployed, you can verify:
- **API Health Check:** `GET /api/health` returns `{"status": "healthy"}`.
- **Sample User Login:**
  - Email: `ramesh@careconnect.org`
  - Password: `Password123!`

