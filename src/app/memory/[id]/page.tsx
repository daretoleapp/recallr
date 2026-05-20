import Link from "next/link";
import { notFound } from "next/navigation";
import { Brain, ArrowLeft, Trash2, Tag } from "lucide-react";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function MemoryDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const m = store.get(id);
  if (!m) return notFound();

  const related = store
    .list({ agentId: m.agentId })
    .filter((x) => x.id !== m.id && x.tags.some((t) => m.tags.includes(t)))
    .slice(0, 4);

  return (
    <main className="min-h-screen">
      <nav className="border-b border-border/60 sticky top-0 z-50 bg-bg/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-mono text-lg">
            <Brain className="w-5 h-5 text-accent" />
            <span className="font-semibold">recallr</span>
          </Link>
          <div className="flex items-center gap-4 text-sm text-muted">
            <Link href="/dashboard" className="hover:text-text transition">Dashboard</Link>
            <Link href="/agents" className="hover:text-text transition">Agents</Link>
            <Link href="/docs" className="hover:text-text transition">Docs</Link>
          </div>
        </div>
      </nav>

      <section className="max-w-3xl mx-auto px-6 py-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-text mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </Link>

        <div className="bg-panel border border-border rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 text-xs text-muted mb-4">
            <span className="px-2 py-0.5 rounded bg-panel-2 border border-border font-mono">{m.id}</span>
            <span>·</span>
            <span>{m.agentName}</span>
            <span>·</span>
            <span>{new Date(m.createdAt).toLocaleString()}</span>
            <span className="ml-auto flex items-center gap-1">
              <span className="text-accent text-base">{m.importance}</span>
              <span>/10</span>
            </span>
          </div>

          <div className="text-base leading-relaxed mb-4">{m.content}</div>

          <div className="flex flex-wrap gap-1 mb-4">
            {m.tags.map((t) => (
              <span key={t} className="text-xs px-2 py-0.5 rounded bg-panel-2 text-muted border border-border">
                #{t}
              </span>
            ))}
          </div>

          {m.reasoning && (
            <div className="border-t border-border pt-4 mt-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted mb-2">
                <Brain className="w-3 h-3" />
                MiMo Pro reasoning
              </div>
              <p className="text-sm text-muted leading-relaxed">{m.reasoning}</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button className="px-3 py-2 border border-red-500/40 text-red-400 rounded-md text-sm flex items-center gap-2 hover:bg-red-500/10">
            <Trash2 className="w-4 h-4" /> Forget this memory
          </button>
          <button className="px-3 py-2 border border-border rounded-md text-sm flex items-center gap-2 hover:bg-panel">
            <Tag className="w-4 h-4" /> Edit tags
          </button>
        </div>

        {related.length > 0 && (
          <div className="mt-10">
            <div className="text-sm font-semibold mb-3">Related memories</div>
            <div className="space-y-2">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/memory/${r.id}`}
                  className="block bg-panel border border-border rounded-md p-3 hover:border-accent/60 transition"
                >
                  <div className="flex items-center gap-2 text-xs text-muted mb-1">
                    <span className="font-mono">{r.id}</span>
                    <span>·</span>
                    <span>{r.tags.slice(0, 3).map((t) => `#${t}`).join(" ")}</span>
                  </div>
                  <div className="text-sm">{r.content.slice(0, 140)}{r.content.length > 140 ? "…" : ""}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
