import Link from "next/link";
import { Brain, Database, MessageSquare, Plug, Sparkles, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-border/60 backdrop-blur sticky top-0 z-50 bg-bg/80">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-mono text-lg">
            <Brain className="w-5 h-5 text-accent" />
            <span className="font-semibold">recallr</span>
          </Link>
          <div className="flex items-center gap-4 text-sm text-muted">
            <Link href="/dashboard" className="hover:text-text transition">Dashboard</Link>
            <Link href="/agents" className="hover:text-text transition">Agents</Link>
            <Link href="/docs" className="hover:text-text transition">Docs</Link>
            <Link
              href="/dashboard"
              className="px-3 py-1.5 bg-accent text-bg rounded-md font-medium hover:opacity-90 transition"
            >
              Try it →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative grid-bg">
        <div className="max-w-6xl mx-auto px-6 py-24 text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-panel text-xs text-muted mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent pulse-dot" />
            Powered by Xiaomi MiMo v2.5 Pro + VL
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Long-term memory<br />
            for <span className="gradient-text">AI agents</span>
          </h1>
          <p className="text-xl text-muted max-w-2xl mx-auto mb-10">
            Stop your agents from forgetting. Recallr is a persistent memory
            layer that any LLM can write to, search, and reason over &mdash;
            text, images, voice. MCP-native, drop-in for Claude, Cursor,
            Hermes, and more.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-accent text-bg rounded-md font-medium hover:opacity-90 transition"
            >
              Open Dashboard
            </Link>
            <Link
              href="/docs"
              className="px-6 py-3 border border-border rounded-md font-medium hover:bg-panel transition"
            >
              Read API Docs
            </Link>
          </div>

          {/* Demo card */}
          <div className="mt-16 max-w-3xl mx-auto bg-panel border border-border rounded-xl p-6 text-left glow">
            <div className="flex items-center gap-2 text-xs text-muted mb-4">
              <span className="w-2 h-2 rounded-full bg-red-500/60" />
              <span className="w-2 h-2 rounded-full bg-yellow-500/60" />
              <span className="w-2 h-2 rounded-full bg-green-500/60" />
              <span className="ml-auto font-mono">recallr.recall("user prefs")</span>
            </div>
            <pre className="font-mono text-sm overflow-auto scrollbar-thin">
{`> claude.tools.recallr.recall({ q: "language preference" })

  ┌── MiMo v2.5 Pro reasoning ──────────────────────────┐
  │ Found 2 memories tagged "preference,language".      │
  │ Top match (importance 9): "Indonesian for ops talk, │
  │ English for code reviews. Lo/gue casual."           │
  │ Cited: mem_a3f9k2lw9p                               │
  └─────────────────────────────────────────────────────┘

  → answer: User prefers Indonesian (lo/gue) for ops,
            English for code reviews. Match the channel.`}
            </pre>
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="border-t border-border bg-panel/30">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold mb-3 text-center">Why MiMo</h2>
          <p className="text-muted text-center mb-12 max-w-2xl mx-auto">
            Memory engines need three things: structured extraction from
            multimodal input, deep reasoning over retrieved context, and
            cheap embedding. Xiaomi MiMo nails the first two.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <Feature
              icon={<Brain />}
              title="MiMo v2.5 Pro"
              body="Reasoning model that explains why it cited each memory. Trace is stored alongside the answer for auditability."
            />
            <Feature
              icon={<Sparkles />}
              title="MiMo v2.5 VL"
              body="Captions screenshots, photos, sketches. Extracts structured tags so visual memories are searchable like text."
            />
            <Feature
              icon={<Zap />}
              title="Importance scoring"
              body="MiMo Pro rates each memory 0-10 for long-term relevance. Auto-decay rules use the score for retention."
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section>
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold mb-3 text-center">How it works</h2>
          <p className="text-muted text-center mb-12">Four operations. Two protocols. Zero vendor lock-in.</p>
          <div className="grid md:grid-cols-2 gap-6">
            <Op
              n="01"
              icon={<Database className="w-5 h-5" />}
              title="Write"
              body="Agent POSTs text/image/voice. MiMo VL extracts entities, MiMo Pro scores importance, embedding indexes for search."
              code={`POST /api/v1/memory
{ "agent": "claude",
  "content": "User prefers...",
  "tags": ["preference"] }`}
            />
            <Op
              n="02"
              icon={<MessageSquare className="w-5 h-5" />}
              title="Recall"
              body="Agent queries semantically. Top-K memories pass through MiMo Pro reasoning. Answer + reasoning trace + citations returned."
              code={`POST /api/v1/recall
{ "agent": "claude",
  "query": "what does user
            prefer?" }`}
            />
            <Op
              n="03"
              icon={<Plug className="w-5 h-5" />}
              title="MCP plugin"
              body="One-line install in any MCP client. Claude Desktop, Cursor, Hermes Agent — they all get recallr-remember and recallr-recall as native tools."
              code={`npx -y @recallr/mcp
# adds 3 tools:
# - recallr_remember
# - recallr_recall
# - recallr_forget`}
            />
            <Op
              n="04"
              icon={<Brain className="w-5 h-5" />}
              title="Forget"
              body="TTL rules per tag, manual delete via dashboard, or auto-decay based on importance score. Privacy by design."
              code={`POST /api/v1/forget
{ "id": "mem_a3f9k2lw9p" }
// or set retention rule per tag`}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-gradient-to-b from-bg to-panel/40">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Give your agent <span className="gradient-text">a brain that lasts</span>
          </h2>
          <p className="text-muted mb-8">
            Try the live dashboard with seeded demo memories, or wire it into
            your agent in 60 seconds via MCP.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-accent text-bg rounded-md font-medium hover:opacity-90 transition"
            >
              Try the dashboard
            </Link>
            <Link
              href="/docs"
              className="px-6 py-3 border border-border rounded-md font-medium hover:bg-panel transition"
            >
              Read the docs
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted gap-3">
          <div>
            Built for the{" "}
            <a
              href="https://100t.xiaomimimo.com"
              className="text-accent hover:underline"
              target="_blank"
              rel="noopener"
            >
              MiMo Orbit 100T grant
            </a>
            .
          </div>
          <div className="flex items-center gap-4">
            <Link href="/docs" className="hover:text-text">Docs</Link>
            <Link href="/agents" className="hover:text-text">Agents</Link>
            <a
              href="https://github.com/daretoleapp/recallr"
              className="hover:text-text"
              target="_blank"
              rel="noopener"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="bg-panel border border-border rounded-xl p-6">
      <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-4">
        {icon}
      </div>
      <div className="font-semibold mb-2">{title}</div>
      <p className="text-sm text-muted leading-relaxed">{body}</p>
    </div>
  );
}

function Op({
  n,
  icon,
  title,
  body,
  code,
}: {
  n: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  code: string;
}) {
  return (
    <div className="bg-panel border border-border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-3">
        <span className="font-mono text-xs text-muted">{n}</span>
        <div className="w-8 h-8 rounded bg-panel-2 text-accent flex items-center justify-center">
          {icon}
        </div>
        <div className="font-semibold">{title}</div>
      </div>
      <p className="text-sm text-muted mb-4 leading-relaxed">{body}</p>
      <pre className="bg-panel-2 border border-border rounded-md p-3 font-mono text-xs overflow-auto scrollbar-thin">
{code}
      </pre>
    </div>
  );
}
