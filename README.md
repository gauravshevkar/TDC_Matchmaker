# 💑 TDC Matchmaker — Internal Matchmaking Dashboard

> An internal tool for **The Date Crew** matchmakers to manage client profiles, suggest AI-powered matches, and send personalized introductions.

🔗 **Live Demo:** [https://tdc-matchmaker-frontend.vercel.app/](https://tdc-matchmaker-frontend.vercel.app/)

> ⚠️ **Note:** Backend is hosted on Render's free tier — first login may take **30–60 seconds** while the server wakes up. Please be patient.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Matching Logic](#matching-logic)
- [AI Integration](#ai-integration)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Sample Credentials](#sample-credentials)
- [Assumptions](#assumptions)

---

## ✨ Features

- 🔐 **Matchmaker Login** — JWT-based authentication
- 👥 **Customer Dashboard** — List view with search, filter by status & gender, pagination
- 📋 **Customer Detailed View** — Full biodata: personal, education, career, family, lifestyle, preferences
- 🤖 **AI-Powered Match Scoring** — Gemini AI scores top 2 matches with explanation & factor breakdown
- 📊 **Rule-Based Matching** — Gender-specific algorithm for remaining matches
- 📧 **Send Match** — Gemini generates a personalized intro email; fallback template if credits exhausted
- ✏️ **Notes** — Quick notes from meetings/calls on each customer profile
- 🏷️ **Status Management** — Track customer journey: New → Active → Matched → On Hold → Inactive
- ➕ **Add / Delete Customer** — Full CRUD on customer profiles

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router, Axios, React Hot Toast |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| AI | Google Gemini 2.5 Flash API |
| Auth | JWT (JSON Web Tokens) + bcrypt |
| Hosting | Vercel (Frontend) + Render (Backend) |

---

## 📁 Project Structure

```
TDC_assignment/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login/
│   │   │   ├── Dashboard/
│   │   │   ├── CustomerDetail/
│   │   │   └── AddCustomer/
│   │   ├── components/
│   │   │   ├── Navbar/
│   │   │   └── CustomerCard/
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   └── customerService.js
│   │   └── context/
│   │       └── AuthContext.jsx
│   └── .env.example
│
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── customerController.js
│   │   └── matchController.js
│   ├── services/
│   │   ├── matchingService.js     ← Rule-based algorithm
│   │   └── geminiService.js       ← AI scoring & email generation
│   ├── models/
│   │   ├── User.js
│   │   ├── Customer.js
│   │   └── Match.js
│   ├── routes/
│   ├── middleware/
│   ├── data/
│   │   ├── customers.json         ← 100+ dummy profiles
│   │   └── users.json             ← Matchmaker accounts
│   ├── scripts/
│   │   └── insertData.js          ← DB seed script
│   └── .env.example
```

---

## 🧠 Matching Logic

### For Male Customers (Traditional preferences)
| Factor | Weight | Logic |
|---|---|---|
| Age | 20pts | Female 0–5 years younger = ideal |
| Height | 15pts | Female 5–20cm shorter = ideal |
| Income | 15pts | Female earning ≤ male = preferred |
| Kids preference | 15pts | Both aligned = full points |
| Religion/Caste | 15pts | Same religion + caste bonus |
| Diet | 8pts | Same dietary preference |
| Family Values | 7pts | Matching values |
| Marital Status | 5pts | First marriage preferred |

### For Female Customers (Holistic compatibility)
| Factor | Weight | Logic |
|---|---|---|
| Age | 20pts | Male 1–7 years older = ideal |
| Education | 12pts | Similar education levels |
| Career stability | 12pts | Employed/Business preferred |
| Kids preference | 15pts | Both aligned |
| Relocation | 8pts | Flexible or same city |
| Family values | 10pts | Aligned values |
| Lifestyle | 10pts | Diet, pets, smoking, drinking |
| Religion | 8pts | Same religion |
| Income | 5pts | Good income level |

### AI Enhancement (Top 2 matches)
Top 2 rule-based matches are sent to **Gemini AI** which:
- Re-scores on a 0–100 scale with cultural context
- Final score = `(rule_score × 0.4) + (AI_score × 0.6)`
- Returns category: High Potential / Good Match / Moderate Match / Exploratory
- Provides factor-wise breakdown and highlights

Remaining matches (3–15) use rule-based score only.

---

## 🤖 AI Integration (Gemini 2.5 Flash)

Three AI-powered features:

1. **Match Scoring** — Analyzes two profiles culturally and returns compatibility score with explanation
2. **Intro Email Generation** — When "Send Match" is clicked, Gemini writes a warm, personalized introduction email
3. **Profile Summary** — Optional AI-generated 2-line profile summary

> ⚠️ **Gemini Free Tier Limitation:** Free API credits are limited. After 2–3 requests the quota may be exhausted. When AI is unavailable, the system gracefully falls back to rule-based scoring and a template email. No errors are shown to the user.

---

## 🚀 Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key (free at [aistudio.google.com](https://aistudio.google.com/app/apikey))

### 1. Clone the repo

```bash
git clone https://github.com/your-username/tdc-matchmaker.git
cd tdc-matchmaker
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values (see below)
```

### 3. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
# Add your backend URL
```

### 4. Run locally

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Frontend: `http://localhost:5173`
Backend: `http://localhost:5000`

---

## ⚙️ Environment Variables

### Backend — `backend/.env`

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/tdc
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key_here
```

### Frontend — `frontend/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🗄️ Database Setup

MongoDB mein 3 collections hain: `users`, `customers`, `matches`

`users` aur `customers` ke liye data files `backend/data/` folder mein hain.

### Insert data using script

```bash
cd backend
node scripts/insertData.js
```

### Ya manually Atlas GUI se insert karo

1. MongoDB Atlas → Browse Collections → `tdc` database
2. `users` collection → Insert Documents → `backend/data/users.json` paste karo
3. `customers` collection → Insert Documents → `backend/data/customers.json` paste karo

> Passwords `users.json` mein already bcrypt hashed hain.

---

## 🔑 Sample Credentials

```
Username: matchmaker1
Password: TDC@2024
```

---

## 📝 Write-up

### Tech Choices
React was chosen for the frontend for its component model and fast iteration. Express + MongoDB gives a flexible, schema-light backend ideal for evolving biodata fields. Gemini 2.5 Flash was chosen over OpenAI for its generous free tier and strong multilingual/cultural understanding relevant to Indian matrimonial context.

### Matching Logic
A weighted rule-based engine runs first for all profiles in the pool — gender-specific weights reflect real Indian matrimonial preferences observed across platforms like Shaadi.com and Jeevansathi. The top 2 candidates are then re-evaluated by Gemini AI which adds cultural nuance, returning a blended final score. This hybrid approach ensures the system works even when AI credits are exhausted.

### AI Usage
Gemini is used in three places: match scoring with factor breakdown, personalized intro email generation on "Send Match", and optional profile summaries. All AI calls have graceful fallbacks — if the API is unavailable or quota is exceeded, rule-based scores and template emails are used seamlessly.

### Assumptions
- Matchmakers are internal TDC staff — no self-registration flow needed
- "Send Match" triggers a mock email (shown in modal/toast) — no real SMTP integration
- Income is stored in LPA (Lakhs Per Annum) as is standard in Indian job market
- Profiles are assumed heterosexual for matching pool filtering (can be extended)
- Free Gemini API tier used — production would require a paid key for consistent AI responses

---
