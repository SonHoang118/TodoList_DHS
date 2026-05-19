import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL!);

async function ensureTasksTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS calendar_tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      start_at TIMESTAMPTZ NOT NULL,
      deadline TIMESTAMPTZ NOT NULL,
      done BOOLEAN NOT NULL DEFAULT false
    )
  `;

  await sql`
    ALTER TABLE calendar_tasks
    ADD COLUMN IF NOT EXISTS user_id INTEGER
  `;
}

export async function GET(request: NextRequest) {
  const user = request.nextUrl.searchParams.get("user");

  try {
    await ensureTasksTable();

    if (!user) {
      return NextResponse.json([]);
    }

    const rows = await sql`
      SELECT id, title, description, start_at, deadline, done
      FROM calendar_tasks
      WHERE user_id = ${Number(user)}
      ORDER BY start_at ASC
    `;

    const tasks = rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      startAt: row.start_at,
      deadline: row.deadline,
      done: row.done,
    }));
    return NextResponse.json(tasks);
  } catch (err) {
    console.error("GET /api/tasks error:", err);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = request.nextUrl.searchParams.get("user");

  try {
    await ensureTasksTable();

    const body = await request.json();
    const { title, description, startAt, deadline, done, userId } = body;

    const resolvedUserId = userId ?? (user ? Number(user) : null);

    if (!resolvedUserId) {
      return NextResponse.json({ error: "User is required" }, { status: 400 });
    }

    const rows = await sql`
      INSERT INTO calendar_tasks (title, description, start_at, deadline, done, user_id)
      VALUES (${title}, ${description}, ${startAt}, ${deadline}, ${done ?? false}, ${Number(resolvedUserId)})
      RETURNING id, title, description, start_at, deadline, done
    `;

    const task = rows[0];

    return NextResponse.json({
      id: task.id,
      title: task.title,
      description: task.description,
      startAt: task.start_at,
      deadline: task.deadline,
      done: task.done,
    }, { status: 201 });
  } catch (err) {
    console.error("POST /api/tasks error:", err);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
