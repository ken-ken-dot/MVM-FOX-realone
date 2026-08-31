import { NextResponse } from "next/server";
import { signOut } from "@/lib/auth";

export async function POST() {
  try {
    await signOut({ redirect: false });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to sign out" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await signOut({ redirect: false });
    return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"));
  } catch {
    return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"));
  }
}
