# Database Migrations

Jalankan dari Git Bash:

```bash
cd backend
npm install
npm run db:migrate
```

Runner membaca `SUPABASE_DB_URL` dari `backend/.env`.

Format URL:

```env
SUPABASE_DB_URL=postgresql://postgres.<project-ref>:<database-password>@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres
```

Migrasi yang sudah berhasil dijalankan akan dicatat di tabel `schema_migrations`, jadi command aman dijalankan ulang.
