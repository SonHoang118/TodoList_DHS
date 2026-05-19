import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

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

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureTasksTable();

    const { id } = await params;
    const body = await request.json();
    const { title, description, startAt, deadline, done, userId } = body;
    if (!userId) {
      return NextResponse.json({ error: "User is required" }, { status: 400 });
    }
    // Chỉ cho phép update nếu đúng user
    const check = await sql`SELECT id FROM calendar_tasks WHERE id = ${Number(id)} AND user_id = ${Number(userId)}`;
    if (check.length === 0) {
      return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    }
    const rows = await sql`
      UPDATE calendar_tasks
      SET title = ${title},
          description = ${description},
          start_at = ${startAt},
          deadline = ${deadline},
          done = ${done}
      WHERE id = ${Number(id)} AND user_id = ${Number(userId)}
      RETURNING id, title, description, start_at, deadline, done
    `;
    if (rows.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    const task = rows[0];
    return NextResponse.json({
      id: task.id,
      title: task.title,
      description: task.description,
      startAt: task.start_at,
      deadline: task.deadline,
      done: task.done,
    });
  } catch (err) {
    console.error("PUT /api/tasks/[id] error:", err);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureTasksTable();

    const { id } = await params;
    const { userId } = await request.json().catch(() => ({}));
    if (!userId) {
      return NextResponse.json({ error: "User is required" }, { status: 400 });
    }
    // Chỉ cho phép xóa nếu đúng user
    const check = await sql`SELECT id FROM calendar_tasks WHERE id = ${Number(id)} AND user_id = ${Number(userId)}`;
    if (check.length === 0) {
      return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    }
    await sql`DELETE FROM calendar_tasks WHERE id = ${Number(id)} AND user_id = ${Number(userId)}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/tasks/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
