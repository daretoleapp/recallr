/**
 * In-memory store. Production wires Postgres + pgvector via Drizzle.
 * Demo mode keeps everything in-process so the live URL works zero-config.
 */
import { nanoid } from "nanoid";

export type Memory = {
  id: string;
  agentId: string;
  agentName: string;
  type: "text" | "image" | "voice";
  content: string;
  imageUrl?: string;
  tags: string[];
  importance: number; // 0..10
  createdAt: number;
  expiresAt?: number;
  embedding?: number[];
  reasoning?: string;
};

export type Agent = {
  id: string;
  name: string;
  apiKey: string;
  description: string;
  createdAt: number;
  memoryCount: number;
};

class Store {
  memories: Memory[] = [];
  agents: Agent[] = [];

  constructor() {
    this.seed();
  }

  seed() {
    const ids = ["agent_hermes", "agent_claude", "agent_cursor"];
    const names = ["Hermes Agent", "Claude Desktop", "Cursor IDE"];
    const descs = [
      "Personal CLI assistant for development workflows",
      "Anthropic Claude with MCP plugins",
      "AI pair programmer in editor",
    ];
    ids.forEach((id, i) => {
      this.agents.push({
        id,
        name: names[i],
        apiKey: `rcl_${nanoid(24)}`,
        description: descs[i],
        createdAt: Date.now() - (i + 1) * 86400000 * 7,
        memoryCount: 0,
      });
    });

    const seeds: Array<Omit<Memory, "id" | "createdAt" | "embedding">> = [
      {
        agentId: "agent_hermes",
        agentName: "Hermes Agent",
        type: "text",
        content: "User prefers Indonesian for ops talk, English for code reviews. Lo/gue casual.",
        tags: ["preference", "language", "tone"],
        importance: 9,
        reasoning: "Stable user preference, surfaced repeatedly. Persist indefinitely.",
      },
      {
        agentId: "agent_hermes",
        agentName: "Hermes Agent",
        type: "text",
        content: "VPS Ubuntu 24.04 user `ubuntu`, public IP 114.122.115.13, CDP at 127.0.0.1:9222.",
        tags: ["environment", "vps", "infra"],
        importance: 10,
        reasoning: "Critical environment fact. Referenced in every server task.",
      },
      {
        agentId: "agent_claude",
        agentName: "Claude Desktop",
        type: "text",
        content: "Postgres connection string for staging: postgres://staging.db/app — never in git.",
        tags: ["secrets", "database"],
        importance: 8,
        reasoning: "Sensitive but stable — encrypted at rest, retrieved only on explicit query.",
      },
      {
        agentId: "agent_cursor",
        agentName: "Cursor IDE",
        type: "text",
        content: "Project uses pnpm workspaces, drizzle for migrations, no prisma.",
        tags: ["project", "stack"],
        importance: 7,
        reasoning: "Project convention. Prevents accidentally introducing competing tools.",
      },
      {
        agentId: "agent_hermes",
        agentName: "Hermes Agent",
        type: "image",
        content: "Architecture sketch: API gateway → memory service → pgvector → MiMo reasoning.",
        imageUrl: "/sketch-arch.svg",
        tags: ["diagram", "architecture"],
        importance: 6,
        reasoning: "Visual reference for the memory service architecture discussion.",
      },
      {
        agentId: "agent_claude",
        agentName: "Claude Desktop",
        type: "text",
        content: "User is shipping Recallr: long-term memory engine for AI agents, MiMo-powered.",
        tags: ["project", "current-work"],
        importance: 9,
        reasoning: "Active project context. Pulled into every session about Recallr.",
      },
    ];

    seeds.forEach((s, i) => {
      const m: Memory = {
        ...s,
        id: `mem_${nanoid(12)}`,
        createdAt: Date.now() - (i + 1) * 3600000 * 6,
      };
      this.memories.push(m);
    });
    this.recountAgents();
  }

  recountAgents() {
    for (const a of this.agents) {
      a.memoryCount = this.memories.filter((m) => m.agentId === a.id).length;
    }
  }

  add(m: Omit<Memory, "id" | "createdAt">): Memory {
    const mem: Memory = { ...m, id: `mem_${nanoid(12)}`, createdAt: Date.now() };
    this.memories.unshift(mem);
    this.recountAgents();
    return mem;
  }

  remove(id: string) {
    this.memories = this.memories.filter((m) => m.id !== id);
    this.recountAgents();
  }

  get(id: string) {
    return this.memories.find((m) => m.id === id);
  }

  list(filter?: { agentId?: string; tag?: string; q?: string }) {
    let out = [...this.memories];
    if (filter?.agentId) out = out.filter((m) => m.agentId === filter.agentId);
    if (filter?.tag) out = out.filter((m) => m.tags.includes(filter.tag!));
    if (filter?.q) {
      const q = filter.q.toLowerCase();
      out = out.filter(
        (m) =>
          m.content.toLowerCase().includes(q) ||
          m.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return out;
  }

  agentList() {
    return [...this.agents];
  }

  agentByKey(key: string) {
    return this.agents.find((a) => a.apiKey === key);
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __recallr_store: Store | undefined;
}

export const store: Store = globalThis.__recallr_store ?? new Store();
if (!globalThis.__recallr_store) globalThis.__recallr_store = store;
