/**
 * Naive cosine-sim search over in-memory embeddings.
 * Production swaps to pgvector. Keeps demo deps zero.
 */
import type { Memory } from "./store";

export function cosine(a: number[], b: number[]): number {
  let dot = 0,
    na = 0,
    nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8);
}

/** Hash-based fake embedding when no OpenAI key. Stable per content. */
export function fakeEmbed(text: string, dim = 64): number[] {
  const v = new Array(dim).fill(0);
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    v[c % dim] += 1;
    v[(c * 7) % dim] += 0.5;
  }
  const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) + 1e-8;
  return v.map((x) => x / norm);
}

export function searchByText(memories: Memory[], q: string, k = 5): Memory[] {
  const qe = fakeEmbed(q.toLowerCase());
  const scored = memories
    .map((m) => ({
      m,
      s: cosine(qe, m.embedding ?? fakeEmbed(m.content.toLowerCase())),
    }))
    .sort((a, b) => b.s - a.s);
  return scored.slice(0, k).map((x) => x.m);
}
