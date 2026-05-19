const { neon } = require('@neondatabase/serverless');

const fs = require('fs');
const envContent = fs.readFileSync('.env', 'utf8');
const match = envContent.match(/DATABASE_URL=['"]?([^'"\n]+)['"]?/);
const DATABASE_URL = match ? match[1] : '';

const sql = neon(DATABASE_URL);

sql`CREATE TABLE IF NOT EXISTS calendar_tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  start_at TIMESTAMPTZ NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  done BOOLEAN NOT NULL DEFAULT false
)`.then(() => {
  console.log('Table calendar_tasks created successfully');
  process.exit(0);
}).catch((e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
