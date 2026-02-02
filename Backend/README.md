# SignAge Backend ⚙️

Backend service for **SignAge**, a sign language learning platform.

Built using **Node.js, Express, and Firebase Admin SDK**, this backend provides secure APIs for authentication, lessons, user progress, and streak tracking.

---

## 🛠 Tech Stack

- Node.js
- Express
- Firebase Admin SDK
- Firestore
- dotenv

---

## 🔐 Authentication

- Uses Firebase Authentication
- Frontend sends Firebase ID token
- Protected routes require  
  `Authorization: Bearer <token>`

---

## 🔌 APIs

- `GET /` – Health check
- `GET /lessons` – Fetch lessons (protected)
- `GET /progress` / `POST /progress` – User progress
- `POST /streak` – Update streak
- `POST /ml/processGesture` – AI placeholder

---

## ⚙️ Setup

Create `.env` in project root:

```env
PORT=5001
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

▶️ Run Locally
npm install
npm run dev


Runs at:

http://localhost:5001

🔗 Related Repo

Frontend:
https://github.com/SamanPandey-in/SignAge-Web
