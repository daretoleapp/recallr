import Link from "next/link";
import { Brain, Search, Plus } from "lucide-react";
import { store } from "@/lib/store";
import { DashboardClient } from "./client";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const memories = store.list();
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
            <Link href="/dashboard" className="text-text">Dashboard</Link>
            <Link href="/agents" className="hover:text-text transition">Agents</Link>
            <Link href="/docs" className="hover:text-text transition">Docs</Link>
            <Link href="/settings" className="hover:text-text transition">Settings</Link>
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Memory dashboard</h1>
            <p className="text-muted text-sm">
              {memories.length} memories across {agents.length} agents.
              Powered by MiMo v2.5 Pro reasoning.
            </p>
          </div>
        </div>

        <DashboardClient memories={memories} agents={agents} />
      </section>
    </main>
  );
}
