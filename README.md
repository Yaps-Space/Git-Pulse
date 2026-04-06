# GitPulse

Platform analisis kinerja repository GitHub dan evaluasi kolaborasi tim berbasis Machine Learning.

## Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS v4
- **Auth**: NextAuth v4 (GitHub OAuth)
- **Database**: Firebase Firestore
- **ML Service**: Python, FastAPI, scikit-learn

## Prerequisites

- Node.js >= 20
- Python >= 3.12
- pip

## Getting Started

### 1. Clone repository
```bash
git clone https://github.com/username/gitpulse.git
cd gitpulse
```

### 2. Setup ML Service (FastAPI)

Masuk ke folder ML service:
```bash
cd github-analytics-ml
```

Buat virtual environment dan aktifkan:
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python -m venv venv
source venv/bin/activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

Jalankan FastAPI server:
```bash
cd api
uvicorn main:app --reload --port 8000
```

ML Service akan berjalan di `http://127.0.0.1:8000`.

### 3. Setup Web App (Next.js)

Buka terminal baru, masuk ke folder web app:
```bash
cd gitpulse
```

Install dependencies:
```bash
npm install
```

Buat file `.env.local` dan isi dengan kredensial kamu:
```env
GITHUB_ID=
GITHUB_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_ML_SERVICE_URL=http://127.0.0.1:8000
```

Jalankan development server:
```bash
npm run dev
```

Web app akan berjalan di `http://localhost:3000`.

## Menjalankan Project

Pastikan kedua service berjalan bersamaan:

| Service     | URL                       | Perintah                                      |
|-------------|---------------------------|-----------------------------------------------|
| ML Service  | http://127.0.0.1:8000     | `uvicorn main:app --reload --port 8000`       |
| Web App     | http://localhost:3000     | `npm run dev`                                 |

## Struktur Project
```
gitpulse/                        # Next.js web app
github-analytics-ml/             # Python FastAPI ML service
├── api/
│   └── main.py
├── models/
│   ├── model1_productivity.pkl
│   ├── model2_healthscore.pkl
│   ├── model2_grade_thresholds.json
│   ├── model3_memberstatus.pkl
│   └── model3_scaler.pkl
└── venv/
```

## Struktur Project

**gitpulse/** — Next.js web app

**github-analytics-ml/** — Python FastAPI ML service
- `api/main.py` — entry point FastAPI
- `models/model1_productivity.pkl`
- `models/model2_healthscore.pkl`
- `models/model2_grade_thresholds.json`
- `models/model3_memberstatus.pkl`
- `models/model3_scaler.pkl`
- `venv/` — virtual environment (tidak di-push ke git)