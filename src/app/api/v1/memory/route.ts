import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { scoreImportance, extractEntitiesFromImage } from "@/lib/mimo";
import { fakeEmbed } from "@/lib/search";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const agentId = searchParams.get("agent") ?? undefined;
  const tag = searchParams.get("tag") ?? undefined;
  const q = searchParams.get("q") ?? undefined;
  return NextResponse.json({ memories: store.list({ agentId, tag, q }) });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { content, tags = [], agentId, type = "text", imageUrl } = body as {
    content?: string;
    tags?: string[];
    agentId?: string;
    type?: "text" | "image" | "voice";
    imageUrl?: string;
  };

  if (!content) {
    return NextResponse.json({ error: "content required" }, { status: 400 });
  }

  const agent = store.agentList().find((a) => a.id === agentId) ?? store.agentList()[0];

  let finalTags = tags;
  let finalContent = content;
  let visualSource: "mimo" | "corpus" | undefined;

  if (type === "image" && imageUrl) {
    const { summary, tags: vTags, source } = await extractEntitiesFromImage(imageUrl);
    if (summary) finalContent = `${content}\n\nMiMo VL caption: ${summary}`;
    finalTags = Array.from(new Set([...tags, ...vTags]));
    visualSource = source;
  }

  const { importance, rationale, source: scoreSource } = await scoreImportance(finalContent);

  const mem = store.add({
    agentId: agent.id,
    agentName: agent.name,
    type,
    content: finalContent,
    imageUrl,
    tags: finalTags,
    importance: typeof importance === "number" ? importance : 5,
    reasoning: rationale,
    embedding: fakeEmbed(finalContent.toLowerCase()),
  });

  return NextResponse.json({
    memory: mem,
    meta: { mimo: { score: scoreSource, vision: visualSource } },
  });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  store.remove(id);
  return NextResponse.json({ ok: true });
}
