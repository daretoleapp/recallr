"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Brain, Search, Sparkles, Plus, Loader2, Send } from "lucide-react";
import type { Memory, Agent } from "@/lib/store";

type RecallResult = {
  answer: string;
  reasoning: string;
  cited: string[];
  source: "mimo" | "corpus";
};

export function DashboardClient({
  memories: initial,
  agents,
}: {
  memories: Memory[];
  agents: Agent[];
}) {
  const [memories, setMemories] = useState<Memory[]>(initial);
  const [q, setQ] = useState("");
  const [agentFilter, setAgentFilter] = useState<string>("all");
  const [recallQ, setRecallQ] = useState("");
  const [recall, setRecall] = useState<RecallResult | null>(null);
  const [recalling, setRecalling] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [adding, startAdd] = useTransition();

  const filtered = useMemo(() => {
    let out = memories;
    if (agentFilter !== "all") out = out.filter((m) => m.agentId === agentFilter);
    if (q) {
      const qq = q.toLowerCase();
      out = out.filter(
        (m) =>
          m.content.toLowerCase().includes(qq) ||
          m.tags.some((t) => t.toLowerCase().includes(qq)),
      );
    }
    return out;
  }, [memories, q, agentFilter]);

  async function doRecall() {
    if (!recallQ.trim()) return;
    setRecalling(true);
    setRecall(null);
    try {
      const r = await fetch("/api/v1/recall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: recallQ, agentId: agentFilter === "all" ? undefined : agentFilter }),
      });
      const data = await r.json();
      setRecall(data);
    } finally {
      setRecalling(false);
    }
  }

  async function addMemory(form: FormData) {
    const content = String(form.get("content") ?? "").trim();
    const tags = String(form.get("tags") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const agentId = String(form.get("agentId") ?? agents[0]?.id);
    if (!content) return;

    startAdd(async () => {
      const r = await fetch("/api/v1/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, tags, agentId }),
      });
      const data = await r.json();
      if (data.memory) setMemories((prev) => [data.memory, ...prev]);
      setShowAdd(false);
    });
  }

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6">
      {/* Main */}
      <div className="space-y-6">
        {/* Recall */}
        <div className="bg-panel border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-accent" />
            <div className="font-semibold">Ask MiMo over your memories</div>
          </div>
          <div className="flex gap-2">
            <input
              value={recallQ}
              onChange={(e) => setRecallQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doRecall()}
              placeholder='e.g. "what tooling does this user prefer?"'
              className="flex-1 bg-panel-2 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
            <button
              onClick={doRecall}
              disabled={recalling}
              className="px-4 py-2 bg-accent text-bg rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
            >
              {recalling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Recall
            </button>
          </div>

          {recall && (
            <div className="mt-4 border border-border rounded-md p-4 bg-panel-2">
              <div className="flex items-center gap-2 mb-2 text-xs">
                <span className={`px-2 py-0.5 rounded ${recall.source === "mimo" ? "bg-accent/20 text-accent" : "bg-muted/20 text-muted"}`}>
                  {recall.source === "mimo" ? "MiMo Pro" : "Corpus mode"}
                </span>
                <span className="text-muted">cited {recall.cited.length} memories</span>
              </div>
              <div className="text-sm mb-3 leading-relaxed">{recall.answer}</div>
              <div className="text-xs text-muted border-t border-border pt-3 leading-relaxed">
                <span className="font-medium text-text/80">Reasoning trace:</span> {recall.reasoning}
              </div>
              {recall.cited.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {recall.cited.map((id) => (
                    <Link
                      key={id}
                      href={`/memory/${id}`}
                      className="text-xs font-mono px-2 py-0.5 rounded bg-bg border border-border hover:border-accent transition"
                    >
                      {id}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Filters + add */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter memories…"
              className="w-full pl-9 bg-panel border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="bg-panel border border-border rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All agents</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <button
            onClick={() => setShowAdd((s) => !s)}
            className="px-3 py-2 border border-border rounded-md text-sm flex items-center gap-2 hover:bg-panel"
          >
            <Plus className="w-4 h-4" /> New
          </button>
        </div>

        {showAdd && (
          <form
            action={addMemory}
            className="bg-panel border border-border rounded-xl p-5 space-y-3"
          >
            <select name="agentId" className="w-full bg-panel-2 border border-border rounded-md px-3 py-2 text-sm">
              {agents.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <textarea
              name="content"
              required
              rows={3}
              placeholder="What should the agent remember?"
              className="w-full bg-panel-2 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
            <input
              name="tags"
              placeholder="tags, comma, separated"
              className="w-full bg-panel-2 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="px-3 py-2 border border-border rounded-md text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={adding}
                className="px-3 py-2 bg-accent text-bg rounded-md text-sm font-medium disabled:opacity-50"
              >
                {adding ? "Saving…" : "Save memory"}
              </button>
            </div>
          </form>
        )}

        {/* Timeline */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted text-sm border border-dashed border-border rounded-xl">
              No memories match. Adjust the filter or add a new one.
            </div>
          )}
          {filtered.map((m) => (
            <MemoryCard key={m.id} m={m} />
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <aside className="space-y-4">
        <div className="bg-panel border border-border rounded-xl p-5">
          <div className="text-sm font-semibold mb-3">Connected agents</div>
          <div className="space-y-2">
            {agents.map((a) => (
              <Link
                key={a.id}
                href="/agents"
                className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-panel-2 transition"
              >
                <div>
                  <div className="text-sm">{a.name}</div>
                  <div className="text-xs text-muted">{a.memoryCount} memories</div>
                </div>
                <span className="w-2 h-2 rounded-full bg-green-400 pulse-dot" />
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-panel border border-border rounded-xl p-5">
          <div className="text-sm font-semibold mb-3">Quick stats</div>
          <Stat label="Memories" value={initial.length} />
          <Stat label="Avg importance" value={(initial.reduce((s, m) => s + m.importance, 0) / Math.max(initial.length, 1)).toFixed(1)} />
          <Stat label="Image memories" value={initial.filter((m) => m.type === "image").length} />
          <Stat label="Tags in use" value={new Set(initial.flatMap((m) => m.tags)).size} />
        </div>

        <div className="bg-panel border border-border rounded-xl p-5">
          <div className="text-sm font-semibold mb-2">Try asking</div>
          <div className="space-y-2 text-xs text-muted">
            {[
              "what does the user prefer?",
              "what is the VPS setup?",
              "what's the active project?",
              "any database secrets?",
            ].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setRecallQ(s);
                }}
                className="block w-full text-left px-3 py-2 rounded bg-panel-2 hover:bg-bg border border-border hover:border-accent transition"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

function MemoryCard({ m }: { m: Memory }) {
  const ago = timeAgo(m.createdAt);
  return (
    <Link
      href={`/memory/${m.id}`}
      className="block bg-panel border border-border rounded-xl p-5 hover:border-accent/60 transition"
    >
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="px-2 py-0.5 rounded bg-panel-2 border border-border font-mono">
            {m.id}
          </span>
          <span>·</span>
          <span>{m.agentName}</span>
          <span>·</span>
          <span>{ago}</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <span className="text-accent">{m.importance}</span>
          <span className="text-muted">/10</span>
        </div>
      </div>
      <div className="text-sm leading-relaxed mb-3">{m.content}</div>
      <div className="flex flex-wrap gap-1">
        {m.tags.map((t) => (
          <span
            key={t}
            className="text-xs px-2 py-0.5 rounded bg-panel-2 text-muted border border-border"
          >
            #{t}
          </span>
        ))}
      </div>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/60 last:border-0 text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
