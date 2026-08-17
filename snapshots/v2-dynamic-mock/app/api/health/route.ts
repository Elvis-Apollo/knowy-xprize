import { NextResponse } from "next/server";
import { ensureStore } from "../_lib/store";
export async function GET() { try { await ensureStore(); return NextResponse.json({ ok: true, product: "Knowy AI" }); } catch (error) { return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Unavailable" }, { status: 500 }); } }
