import { NextResponse } from "next/server";
import { resetStore, resolveGithubIssue } from "../_lib/store";
export async function POST(request: Request) {
  const { action } = await request.json() as { action?: string };
  if (action === "reset") await resetStore();
  else if (action === "resolve") await resolveGithubIssue();
  else return NextResponse.json({ error: "Unknown demo action" }, { status: 400 });
  return NextResponse.json({ ok: true, action });
}
