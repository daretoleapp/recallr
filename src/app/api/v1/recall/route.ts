import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { reasonOverMemories } from "@/lib/mimo";
import { searchByText } from "@/lib/search";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { query, agentId, k = 5, debug = false } = body as { query?: string; agentId?: string; k?: number; debug?: boolean };
  if (!query) return NextResponse.json({ error: "query required" }, { status: 400 });

  const candidates = store.list({ agentId });
  const top = searchByText(candidates, query, k);
  try {
    const result = await reasonOverMemories(query, top);
    return NextResponse.json(result);
  } catch (e) {
    if (debug) {
      return NextResponse.json({
        error: String(e),
        message: (e as Error).message,
        name: (e as Error).name,
        stack: (e as Error).stack?.split("\n").slice(0, 5),
      }, { status: 500 });
    }
    throw e;
  }
}

