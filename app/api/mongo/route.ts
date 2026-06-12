import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// Table create karo (pehli baar run hoga)
async function initTable() {
  try {
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS hotel_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE,
        value TEXT
      )
    `);
  } catch (error) {
    console.error("Init error:", error);
  }
}

export async function GET(request: Request) {
  try {
    await initTable();
    const { searchParams } = new URL(request.url);
    const collectionName = searchParams.get("collection");
    
    const result = await turso.execute({
      sql: "SELECT value FROM hotel_data WHERE key = ?",
      args: [collectionName || "fullData"]
    });
    
    if (result.rows.length > 0) {
      return NextResponse.json(JSON.parse(result.rows[0].value as string));
    }
    return NextResponse.json({});
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({});
  }
}

export async function POST(request: Request) {
  try {
    await initTable();
    const body = await request.json();
    const { collection: collectionName, data } = body;
    
    if (collectionName && data) {
      await turso.execute({
        sql: "INSERT OR REPLACE INTO hotel_data (key, value) VALUES (?, ?)",
        args: [collectionName, JSON.stringify(data)]
      });
    } else {
      for (const [key, value] of Object.entries(body)) {
        await turso.execute({
          sql: "INSERT OR REPLACE INTO hotel_data (key, value) VALUES (?, ?)",
          args: [key, JSON.stringify(value)]
        });
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}