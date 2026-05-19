import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL!);

async function ensureUsersTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      full_name TEXT NOT NULL
    )
  `;
}

export async function GET() {
  try {
    await ensureUsersTable();
    const rows = await sql`
      SELECT id, full_name
      FROM users
      ORDER BY id ASC
    `;

    return NextResponse.json(
      rows.map((row) => ({
        id: row.id,
        fullName: row.full_name,
      }))
    );
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureUsersTable();
    const { fullName } = await req.json();
    if (!fullName || typeof fullName !== "string") {
      return NextResponse.json({ error: "Missing fullName" }, { status: 400 });
    }

    const rows = await sql`
      INSERT INTO users (full_name)
      VALUES (${fullName.trim()})
      RETURNING id, full_name
    `;

    const user = rows[0];
    return NextResponse.json({ id: user.id, fullName: user.full_name }, { status: 201 });
  } catch (error) {
    console.error("POST /api/users error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await ensureUsersTable();
    const { id, fullName } = await req.json();
    if (!id || !fullName || typeof fullName !== "string") {
      return NextResponse.json({ error: "Missing id or fullName" }, { status: 400 });
    }

    const rows = await sql`
      UPDATE users
      SET full_name = ${fullName.trim()}
      WHERE id = ${Number(id)}
      RETURNING id, full_name
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = rows[0];
    return NextResponse.json({ id: user.id, fullName: user.full_name });
  } catch (error) {
    console.error("PUT /api/users error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await ensureUsersTable();
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await sql`DELETE FROM users WHERE id = ${Number(id)}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/users error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
