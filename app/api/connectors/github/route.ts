import { NextResponse } from "next/server";
import { githubRepository, searchGitHub } from "../../_lib/github";

export async function GET() {
  return NextResponse.json({ connector: "github", configured: true, repository: githubRepository(), authentication: process.env.GITHUB_TOKEN ? "token" : "public" });
}

export async function POST(request: Request) {
  try {
    const { question = "latest open issues" } = await request.json() as { question?: string };
    return NextResponse.json(await searchGitHub(question));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "GitHub search failed" }, { status: 502 });
  }
}
