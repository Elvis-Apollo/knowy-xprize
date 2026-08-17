import { NextResponse } from "next/server";
import { listAgentExecutions } from "../_lib/store";

export async function GET() {
  try {
    return NextResponse.json({ executions: await listAgentExecutions() });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load executions" }, { status: 500 });
  }
}
