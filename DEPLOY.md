# Deploy Padel Tournament to Render (free)

Step-by-step guide to deploy this Laravel app on [Render](https://render.com) for free.

---

## SQLite vs PostgreSQL

| Option        | Possible? | Data persists? | Best for              |
|---------------|-----------|----------------|------------------------|
| **PostgreSQL** | ✅ Yes    | ✅ Yes         | Real use, recommended  |
| **SQLite**     | ✅ Yes    | ❌ No          | Quick demo only       |

- **PostgreSQL**: Render gives you a free database. Data survives restarts and redeploys. **Use this for a real deployment.**
- **SQLite**: You can run with SQLite (no DB setup), but Render’s disk is **ephemeral**. Every restart or redeploy **wipes the SQLite file** and all data. Fine only for a short-lived demo.

The steps below use **PostgreSQL** by default. At the end there is an optional section to use SQLite for a demo.

---

## Part 1: One-time setup

### 1. Generate `APP_KEY` (on your machine)

In the project directory:

```bash
php artisan key:generate --show
```

Copy the output (e.g. `base64:xxxxx...`). You’ll paste it into Render in step 5.

### 2. Push code to GitHub

Ensure your project is in a **GitHub** (or GitLab) repo and push the latest code. Render deploys from this repo.

### 3. Create a Render account

Go to [render.com](https://render.com) and sign up (e.g. with GitHub).

---

## Part 2: Deploy with Blueprint (PostgreSQL, recommended)

### 4. Create a Blueprint

1. In Render: **Dashboard** → **New** → **Blueprint**.
2. Connect your **GitHub** account if needed and select the **padel-tournament** repo.
3. Render will detect `render.yaml` and show:
   - 1 **PostgreSQL** database (`padel-tournament-db`)
   - 1 **Web Service** (`padel-tournament`, Docker)
4. Click **Apply**.

### 5. Add environment variables

After the first deploy is created (or from the service’s **Environment** tab):

1. Open the **padel-tournament** web service.
2. Go to **Environment**.
3. Add:

   | Key       | Value |
   |-----------|--------|
   | `APP_KEY` | The key from step 1 (`php artisan key:generate --show`) |
   | `APP_URL` | `https://<your-service-name>.onrender.com` (replace with the URL Render shows for this service) |

4. Save. Render will redeploy automatically.

### 6. Wait for deploy

- First deploy can take a few minutes (Docker build + installs).
- When it’s **Live**, open the service URL. You should see the app; migrations run on each deploy via the start script.

### 7. Create a user (optional)

If you use Breeze auth and need a user on production:

- Use your app’s register page, or
- Run locally against production DB (not recommended on free tier), or
- Add a one-off deploy script / seed that creates a user (advanced).

---

## Part 3: Deploy without Blueprint (manual)

If you prefer not to use `render.yaml`:

### 1. Create a PostgreSQL database

- **Dashboard** → **New** → **PostgreSQL**.
- Name it (e.g. `padel-tournament-db`), choose **Free** plan, Create.
- Open the database and copy the **Internal Database URL** (not External).

### 2. Create a Web Service

- **Dashboard** → **New** → **Web Service**.
- Connect the repo and select **padel-tournament**.
- Set:
  - **Runtime**: **Docker**.
  - **Name**: e.g. `padel-tournament`.
  - **Plan**: Free.
- **Environment** → Add:

  | Key            | Value |
  |----------------|--------|
  | `APP_KEY`      | From `php artisan key:generate --show` |
  | `APP_URL`      | `https://<your-service-name>.onrender.com` |
  | `APP_ENV`      | `production` |
  | `APP_DEBUG`    | `false` |
  | `DB_CONNECTION` | `pgsql` |
  | `DATABASE_URL` | Internal Database URL from step 1 |

- Create Web Service. Render will build from the repo’s **Dockerfile** and run the container.

---

## Optional: Use SQLite (demo only, data is lost on restart)

Only for a quick demo where you don’t care about keeping data.

1. Create a **Web Service** as in Part 3 (no database).
2. In **Environment**, do **not** set `DATABASE_URL` or `DB_CONNECTION`.
3. Add only:
   - `APP_KEY` = `php artisan key:generate --show`
   - `APP_URL` = `https://<your-service-name>.onrender.com`
   - `APP_ENV` = `production`
   - `APP_DEBUG` = `false`
4. The Dockerfile and start script already support SQLite: the app will create/use `database/database.sqlite` inside the container.  
   **Warning:** On every restart or redeploy, that file is wiped and all data is lost.

---

## Troubleshooting

- **500 error**: Check **Logs** for the web service. Often missing `APP_KEY` or wrong `APP_URL`.
- **White screen / assets broken**: Ensure `APP_URL` is exactly your Render URL (e.g. `https://padel-tournament-xxxx.onrender.com`) and that you forced HTTPS (already set in `AppServiceProvider` for production).
- **Database connection error**: With PostgreSQL, ensure `DB_CONNECTION=pgsql` and `DATABASE_URL` is the **Internal** URL. With SQLite, ensure you didn’t set `DATABASE_URL` or `DB_CONNECTION=pgsql`.
- **First request very slow**: On the free plan the service sleeps after inactivity; the first request after that wakes it up and can take 30–60 seconds.

---

## Summary

- **Recommended**: Use **PostgreSQL** and the **Blueprint** (`render.yaml`) for a free, persistent deploy.
- **SQLite**: Allowed for demos; data does **not** persist across restarts or redeploys.
