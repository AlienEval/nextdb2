import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

// A simple utility to hash passwords using Web Crypto API since standard Node.js crypto
// might not be available in Edge runtime natively without polyfills.
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(req: NextRequest) {
  try {
    const { action, username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    // Access D1 database using any to bypass type errors for missing workers-types
    const db = (getRequestContext().env as any).DB;
    
    if (!db) {
      console.error("D1 Database binding 'DB' not found in env.");
      return NextResponse.json({ error: "Database configuration error" }, { status: 500 });
    }

    const hashedPassword = await hashPassword(password);

    if (action === "register") {
      // Check if user exists
      const existingUser = await db
        .prepare("SELECT * FROM users WHERE username = ?")
        .bind(username)
        .first();

      if (existingUser) {
        return NextResponse.json({ error: "Username already taken" }, { status: 409 });
      }

      // Insert user
      const result = await db
        .prepare("INSERT INTO users (username, password) VALUES (?, ?)")
        .bind(username, hashedPassword)
        .run();

      if (result.success) {
        return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
      } else {
        return NextResponse.json({ error: "Failed to register user" }, { status: 500 });
      }
    } else if (action === "login") {
      // Find user
      const user = await db
        .prepare("SELECT * FROM users WHERE username = ? AND password = ?")
        .bind(username, hashedPassword)
        .first();

      if (user) {
        return NextResponse.json({ message: "Login successful!" }, { status: 200 });
      } else {
        return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Auth API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
