# GitPulse

GitPulse adalah platform analisis kinerja repository dan evaluasi kolaborasi tim berbasis Machine Learning. Aplikasi ini membantu pengguna melihat produktivitas repository, health score, serta gambaran performa tim secara lebih objektif.

## Fitur utama

- Login menggunakan GitHub, GitLab, atau akun email/username + password
- Dashboard ringkasan repository dan tim
- Koneksi akun GitHub/GitLab untuk mengambil repository pengguna
- Analisis repository untuk menghasilkan:
  - productivity state
  - health score
  - health grade
  - rekomendasi kesehatan repository
- Team space untuk mengelompokkan repository dan anggota tim
- Pengaturan akun untuk mengubah profil, password, dan menghubungkan/memutuskan provider

## Teknologi yang dipakai

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS v4
- Auth: NextAuth v4
- Database: Firebase Firestore
- UI: Radix UI, shadcn/ui, Framer Motion
- ML Service: Python + FastAPI + scikit-learn

## Prasyarat

- Node.js >= 20
- npm atau pnpm
- Python >= 3.12
- pip

## Instalasi

### 1. Clone repository

```bash
git clone <repo-url>
cd gitpulse
```

### 2. Install dependencies

Project ini sudah menyertakan lockfile, jadi disarankan memakai pnpm.

#### Opsi A: pakai pnpm (disarankan)

```bash
corepack enable
pnpm install
```

#### Opsi B: pakai npm

```bash
npm install
```

### 3. Siapkan file environment

Salin file contoh environment:

```bash
copy .env.local.example .env.local
```

Isi nilai yang diperlukan di file `.env.local`:

```env
GITHUB_ID=
GITHUB_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

GITHUB_CONNECT_ID=
GITHUB_CONNECT_SECRET=

GITLAB_ID=
GITLAB_SECRET=

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

NEXT_PUBLIC_ML_SERVICE_URL=http://127.0.0.1:8000
```

## Menjalankan ML Service

GitPulse membutuhkan service analitik ML yang berjalan terpisah. Pastikan service FastAPI sudah aktif sebelum memakai fitur analisis repository.

Contoh jalannya service:

```bash
cd github-analytics-ml
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cd api
uvicorn main:app --reload --port 8000
```

Service ML biasanya berjalan di:

```text
http://127.0.0.1:8000
```

## Menjalankan aplikasi web

### Dengan pnpm

```bash
pnpm dev
```

### Dengan npm

```bash
npm run dev
```

Aplikasi akan berjalan di:

```text
http://localhost:3000
```

## Alur utama aplikasi

### 1. Login
Pengguna bisa masuk melalui:
- GitHub OAuth
- GitLab OAuth
- email/username + password

### 2. Dashboard
Setelah login, pengguna melihat ringkasan dashboard yang memuat informasi repository dan team yang terkait.

### 3. Repository
Pengguna dapat:
- menghubungkan akun GitHub/GitLab
- melihat daftar repository
- menganalisis repository
- melihat hasil productivity dan health score

### 4. Team Space
Pengguna bisa membuat team space, mengaitkan repository, dan melihat performa tim secara kolektif.

### 5. Account Settings
Pengguna bisa mengatur:
- nama profil
- password
- koneksi GitHub/GitLab
- pemutusan koneksi provider

## Struktur folder penting

```text
gitpulse/
  src/
    app/                # routing Next.js App Router
    features/           # fitur UI utama (auth, dashboard, repo, team-space, account)
    shared/             # komponen, hooks, helper, auth, dan util bersama
  public/
  package.json
  pnpm-lock.yaml
```

## Catatan penting

- Jika ingin memakai pnpm, pastikan Node.js sudah support corepack.
- Jika memakai npm, perintah yang dipakai adalah `npm install` dan `npm run dev`.
- Nilai `NEXT_PUBLIC_ML_SERVICE_URL` harus mengarah ke service FastAPI yang berjalan.