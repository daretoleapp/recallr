import Link from "next/link";
import { Brain, Plus, Copy } from "lucide-react";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function AgentsPage() {
  const agents = store.agentList();

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
            <Link href="/agents" className="text-text">Agents</Link>
            <Link href="/docs" className="hover:text-text transition">Docs</Link>
            <Link href="/settings" className="hover:text-text transition">Settings</Link>
          </div>
        </div>
      </nav>

      <section className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Connected agents</h1>
            <p className="text-muted text-sm">
              Each agent gets an API key. Use it as <span className="font-mono">Authorization: Bearer ...</span> on every memory call.
            </p>
          </div>
          <button className="px-3 py-2 border border-border rounded-md text-sm flex items-center gap-2 hover:bg-panel">
            <Plus className="w-4 h-4" /> New agent
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {agents.map((a) => (
            <div key={a.id} className="bg-panel border border-border rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold">{a.name}</div>
                  <div className="text-xs text-muted font-mono">{a.id}</div>
                </div>
                <span className="px-2 py-0.5 text-xs rounded bg-green-500/10 text-green-400 border border-green-500/30">
                  active
                </span>
              </div>
              <p className="text-sm text-muted mb-4">{a.description}</p>
              <div className="bg-panel-2 border border-border rounded-md p-3 font-mono text-xs break-all relative group">
                <button className="absolute top-2 right-2 p-1 rounded hover:bg-bg opacity-0 group-hover:opacity-100 transition">
                  <Copy className="w-3 h-3" />
                </button>
                {a.apiKey}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted">
                <span>{a.memoryCount} memories</span>
                <span>created {new Date(a.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
