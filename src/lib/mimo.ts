/**
 * MiMo via OpenRouter — reasoning + multimodal.
 * Falls back to deterministic stubs if OPENROUTER_API_KEY is unset
 * so the live demo always works (corpus mode).
 */

export class MimoUnavailableError extends Error {
  constructor() {
    super("OPENROUTER_API_KEY missing");
  }
}

export class MimoUpstreamError extends Error {
  constructor(public status: number, msg: string) {
    super(msg);
  }
}

export const isMimoFallback = (e: unknown): boolean =>
  e instanceof MimoUnavailableError || e instanceof MimoUpstreamError;

const OR_BASE = "https://openrouter.ai/api/v1";
const PRO = process.env.MIMO_PRO_MODEL ?? "xiaomi/mimo-v2.5-pro";
const VL = process.env.MIMO_VL_MODEL ?? "xiaomi/mimo-v2.5";

type Msg = { role: "system" | "user" | "assistant"; content: string | Array<unknown> };

async function chat(model: string, messages: Msg[], maxTokens = 600): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new MimoUnavailableError();

  const r = await fetch(`${OR_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://recallr-orcin.vercel.app",
      "X-Title": "Recallr",
    },
    body: JSON.stringify({ model, messages, max_tokens: maxTokens }),
  });
  if (!r.ok) {
    const body = await r.text().catch(() => "");
    console.error(`[mimo] upstream ${r.status}:`, body.slice(0, 300));
    throw new MimoUpstreamError(r.status, body.slice(0, 500));
  }
  const data = await r.json().catch((e) => {
    console.error("[mimo] json parse failed:", e);
    return null;
  });
  if (!data) {
    throw new MimoUpstreamError(0, "invalid JSON");
  }
  const msg = data.choices?.[0]?.message ?? {};
  // MiMo Pro on DeepInfra returns reasoning text in `reasoning` field with content null.
  // Prefer content; fall back to reasoning so the answer is never empty.
  const content =
    (typeof msg.content === "string" && msg.content) ||
    (typeof msg.reasoning === "string" && msg.reasoning) ||
    "";
  if (!content) {
    console.error("[mimo] empty content. Raw msg:", JSON.stringify(msg).slice(0, 300));
  }
  return content;
}

type RecallShape = { answer: string; reasoning: string; cited: string[] };

export async function reasonOverMemories(
  query: string,
  memories: Array<{ id: string; content: string; tags: string[] }>,
): Promise<RecallShape & { source: "mimo" | "corpus"; debug?: string }> {
  const ctx = memories
    .map((m, i) => `[${i + 1}] (${m.id}) tags=${m.tags.join(",")} :: ${m.content}`)
    .join("\n");
  const sys = `You are MiMo, a careful retrieval-augmented reasoner for the Recallr memory layer.
Given a user query and candidate memories, return JSON:
{"answer": "...", "reasoning": "...", "cited": ["mem_id", ...]}
Only cite memories that materially support the answer. If no memory is relevant, say so honestly.`;

  try {
    const raw = await chat(
      PRO,
      [
        { role: "system", content: sys },
        { role: "user", content: `Query: ${query}\n\nMemories:\n${ctx}` },
      ],
      1500,
    );
    const json = extractJson<Partial<RecallShape>>(raw);
    return {
      answer: json.answer ?? raw.slice(0, 400),
      reasoning: json.reasoning ?? "MiMo Pro answered without structured JSON; raw response shown.",
      cited: json.cited ?? memories.slice(0, 3).map((m) => m.id),
      source: "mimo" as const,
    };
  } catch (e) {
    const errMsg = `${(e as Error).name}: ${(e as Error).message}`.slice(0, 200);
    if (!isMimoFallback(e)) throw e;
    const top = memories.slice(0, 3);
    return {
      answer:
        top.length > 0
          ? `Based on ${top.length} memories: ${top.map((m) => m.content).join(" | ")}`
          : "No matching memory in corpus.",
      reasoning:
        "Corpus mode (set OPENROUTER_API_KEY for MiMo Pro reasoning). Returned top-K by recency.",
      cited: top.map((m) => m.id),
      source: "corpus" as const,
      debug: errMsg,
    };
  }
}

export async function extractEntitiesFromImage(
  imageUrl: string,
): Promise<{ summary: string; tags: string[]; source: "mimo" | "corpus" }> {
  try {
    const raw = await chat(
      VL,
      [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Describe this image in 1-2 sentences for memory storage. Then list 3-6 tags.
Return JSON: {"summary": "...", "tags": ["...", ...]}`,
            },
            { type: "image_url", image_url: { url: imageUrl } },
          ] as unknown as Array<unknown>,
        },
      ],
      800,
    );
    const json = extractJson<{ summary?: string; tags?: string[] }>(raw);
    return {
      summary: json.summary ?? "",
      tags: json.tags ?? [],
      source: "mimo" as const,
    };
  } catch (e) {
    if (!isMimoFallback(e)) throw e;
    return {
      summary: "Image stored. Set OPENROUTER_API_KEY for MiMo VL captioning.",
      tags: ["image", "uncaptioned"],
      source: "corpus" as const,
    };
  }
}

export async function scoreImportance(
  content: string,
): Promise<{ importance: number; rationale: string; source: "mimo" | "corpus" }> {
  try {
    const raw = await chat(
      PRO,
      [
        {
          role: "system",
          content:
            "Rate the long-term importance of this memory on 0-10 (0 = ephemeral, 10 = always relevant). Reply JSON: {\"importance\": N, \"rationale\": \"short\"}.",
        },
        { role: "user", content },
      ],
      400,
    );
    const json = extractJson<{ importance?: number; rationale?: string }>(raw);
    return {
      importance: typeof json.importance === "number" ? json.importance : 5,
      rationale: json.rationale ?? "",
      source: "mimo" as const,
    };
  } catch (e) {
    if (!isMimoFallback(e)) throw e;
    return {
      importance: 5,
      rationale: "Default mid-importance (corpus mode).",
      source: "corpus" as const,
    };
  }
}

function extractJson<T = Record<string, unknown>>(raw: string): T {
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) return {} as T;
  try {
    return JSON.parse(m[0]) as T;
  } catch {
    return {} as T;
  }
}
