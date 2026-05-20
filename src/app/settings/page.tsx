import Link from "next/link";
import { Brain, Shield, Clock, Download, AlertTriangle } from "lucide-react";

export default function SettingsPage() {
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
            <Link href="/settings" className="text-text">Settings</Link>
          </div>
        </div>
      </nav>

      <section className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Settings</h1>
          <p className="text-muted text-sm">Retention, privacy, export.</p>
        </div>

        <Card icon={<Clock className="w-4 h-4" />} title="Retention rules">
          <p className="text-sm text-muted mb-4">
            Auto-decay based on importance score from MiMo Pro. Override per
            tag for tighter control on sensitive data.
          </p>
          <div className="space-y-2">
            {[
              ["importance < 4", "7 days"],
              ["importance 4 — 7", "90 days"],
              ["importance 8 +", "indefinite"],
              ["tag: secret", "1 day"],
              ["tag: ephemeral", "12 hours"],
            ].map(([rule, ttl]) => (
              <div
                key={rule}
                className="flex items-center justify-between bg-panel-2 border border-border rounded-md px-3 py-2 text-sm"
              >
                <span className="font-mono">{rule}</span>
                <span className="text-muted">{ttl}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card icon={<Shield className="w-4 h-4" />} title="Privacy">
          <Toggle label="Encrypt content at rest (AES-256)" on />
          <Toggle label="Cross-agent recall" />
          <Toggle label="Allow MiMo VL on user images" on />
          <Toggle label="Share anonymous usage stats" />
        </Card>

        <Card icon={<Download className="w-4 h-4" />} title="Export your data">
          <p className="text-sm text-muted mb-4">
            JSON dump of every memory across every agent. Includes embeddings,
            reasoning traces, and raw image URLs.
          </p>
          <button className="px-3 py-2 bg-accent text-bg rounded-md text-sm font-medium">
            Download recallr-export.json
          </button>
        </Card>

        <Card icon={<AlertTriangle className="w-4 h-4" />} title="Danger zone">
          <p className="text-sm text-muted mb-4">
            Wipe all memories from a specific agent or the whole account. Not
            reversible.
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 border border-red-500/40 text-red-400 rounded-md text-sm hover:bg-red-500/10">
              Forget all memories from one agent
            </button>
            <button className="px-3 py-2 border border-red-500/40 text-red-400 rounded-md text-sm hover:bg-red-500/10">
              Delete entire account
            </button>
          </div>
        </Card>
      </section>
    </main>
  );
}

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-accent">{icon}</span>
        <div className="font-semibold">{title}</div>
      </div>
      {children}
    </div>
  );
}

function Toggle({ label, on = false }: { label: string; on?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/60 last:border-0 text-sm">
      <span>{label}</span>
      <span
        className={`w-9 h-5 rounded-full relative transition ${
          on ? "bg-accent" : "bg-panel-2 border border-border"
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-bg transition ${
            on ? "left-[18px]" : "left-0.5"
          }`}
        />
      </span>
    </div>
  );
}
