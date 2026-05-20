import Link from "next/link";
import { Brain } from "lucide-react";

export default function DocsPage() {
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
            <Link href="/docs" className="text-text">Docs</Link>
          </div>
        </div>
      </nav>

      <section className="max-w-3xl mx-auto px-6 py-12 prose prose-invert">
        <h1 className="text-4xl font-bold mb-2">API & MCP docs</h1>
        <p className="text-muted mb-10">
          Two ways to plug your agent in: REST API or native MCP server.
        </p>

        <Section title="MCP integration (recommended)">
          <p>
            Recallr ships an MCP server. Any MCP-compatible client (Claude
            Desktop, Cursor, Hermes Agent) gets three native tools:
            <code> recallr_remember</code>, <code>recallr_recall</code>,
            <code> recallr_forget</code>.
          </p>
          <Pre>{`# claude_desktop_config.json
{
  "mcpServers": {
    "recallr": {
      "command": "npx",
      "args": ["-y", "@recallr/mcp"],
      "env": {
        "RECALLR_API_KEY": "rcl_..."
      }
    }
  }
}`}</Pre>
        </Section>

        <Section title="REST: write a memory">
          <Pre>{`POST https://recallr.app/api/v1/memory
Authorization: Bearer rcl_...
Content-Type: application/json

{
  "agentId": "agent_claude",
  "type": "text",
  "content": "User prefers Indonesian for ops talk.",
  "tags": ["preference", "language"]
}`}</Pre>
          <p className="text-sm text-muted">
            MiMo VL captions any attached <code>imageUrl</code>. MiMo Pro
            scores importance and produces a one-line rationale. Both are
            stored on the memory record.
          </p>
        </Section>

        <Section title="REST: recall with reasoning">
          <Pre>{`POST https://recallr.app/api/v1/recall
Authorization: Bearer rcl_...
Content-Type: application/json

{
  "agentId": "agent_claude",
  "query": "what does the user prefer?"
}

# Response
{
  "answer": "User prefers Indonesian for ops, English for code.",
  "reasoning": "Two memories tagged 'preference,language'. Top match has importance 9.",
  "cited": ["mem_a3f9k2lw9p"],
  "source": "mimo"
}`}</Pre>
        </Section>

        <Section title="REST: forget">
          <Pre>{`POST /api/v1/forget
{ "id": "mem_a3f9k2lw9p" }

# or via tag retention
POST /api/v1/retention
{ "tag": "secret", "ttlDays": 1 }`}</Pre>
        </Section>

        <Section title="Reasoning trace">
          <p>
            Every recall response includes <code>reasoning</code> &mdash; a
            human-readable explanation from MiMo v2.5 Pro of why each
            citation was selected. Stored alongside the answer for
            auditability. When the OPENROUTER_API_KEY env is unset, the
            response shifts to <code>source: &quot;corpus&quot;</code> mode and
            returns top-K by recency without the reasoning step.
          </p>
        </Section>

        <Section title="Importance & decay">
          <p>
            MiMo Pro scores each memory 0&ndash;10 on long-term relevance
            at write time. Combined with per-tag TTL rules, low-importance
            memories auto-decay. Default policy: <code>importance &lt; 4</code>
            decays after 7 days, <code>4&ndash;7</code> after 90 days,
            <code>8+</code> persists indefinitely.
          </p>
        </Section>

        <Section title="Privacy">
          <p>
            Memories are scoped per agent API key. Cross-agent recall
            requires explicit grant via the agent settings page. No
            embeddings or content leave your account &mdash; OpenRouter
            calls are server-to-server with usage tracked per key.
          </p>
        </Section>
      </section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-text/90">{children}</div>
    </div>
  );
}

function Pre({ children }: { children: React.ReactNode }) {
  return (
    <pre className="bg-panel border border-border rounded-md p-4 font-mono text-xs overflow-auto scrollbar-thin">
{children}
    </pre>
  );
}
