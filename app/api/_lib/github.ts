import type { DemoSource } from "./store";

type GitHubIssue = {
  number: number;
  title: string;
  body: string | null;
  html_url: string;
  updated_at: string;
  state: string;
  user?: { login?: string };
  pull_request?: unknown;
};

type GitHubSearchResponse = { total_count: number; items: GitHubIssue[] };

export const githubRepository = () => process.env.GITHUB_REPOSITORY || "openai/openai-node";

export function isGitHubQuestion(question: string) {
  return /\b(github|repo|repository|openai[- ]node|pull request|latest open issues?)\b/i.test(question);
}

export async function searchGitHub(question: string): Promise<{ repository: string; total: number; sources: DemoSource[] }> {
  const repository = githubRepository();
  const terms = question.toLowerCase().includes("latest") ? "" : question.replace(/github|repository|repo|openai[- ]node|issues?|latest|open/gi, " ").trim();
  const query = [`repo:${repository}`, "is:issue", "is:open", terms].filter(Boolean).join(" ");
  const headers: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "Knowy-AI-Hackathon", "X-GitHub-Api-Version": "2022-11-28" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const response = await fetch(`https://api.github.com/search/issues?q=${encodeURIComponent(query)}&sort=updated&order=desc&per_page=5`, { headers });
  if (!response.ok) throw new Error(`GitHub connector returned ${response.status}`);
  const data = await response.json() as GitHubSearchResponse;
  const issues = data.items.filter((item) => !item.pull_request).slice(0, 3);
  return {
    repository,
    total: data.total_count,
    sources: issues.map((issue) => ({
      id: `github-live-${issue.number}`,
      source: "GitHub Live",
      title: `Issue #${issue.number} · ${issue.title}`,
      content: `${issue.title}. ${(issue.body || "No description provided").replace(/\s+/g, " ").slice(0, 700)} State: ${issue.state}. Author: ${issue.user?.login || "unknown"}.`,
      version: issue.updated_at,
      updatedAt: new Date(issue.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      url: issue.html_url,
    })),
  };
}
