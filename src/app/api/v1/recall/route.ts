import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { reasonOverMemories } from "@/lib/mimo";
import { searchByText } from "@/lib/search";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { query, agentId, k = 5 } = body as { query?: string; agentId?: string; k?: number };
  if (!query) return NextResponse.json({ error: "query required" }, { status: 400 });

  const candidates = store.list({ agentId });
  const top = searchByText(candidates, query, k);
  const result = await reasonOverMemories(query, top);
  return NextResponse.json(result);
}
