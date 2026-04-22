// Unified API client for project / DIY / contract analysis.
// - Encodes photos via shared photoUtils
// - Calls the backend endpoint (trade-routed when possible)
// - Falls back to caller-supplied mock data on any failure (no API key, offline,
//   server error, timeout) so the UI stays functional without credentials.

import { encodePhotos } from "@/lib/photoUtils";

const DEFAULT_TIMEOUT_MS = 120_000; // vision + DALL-E can be slow

async function postJson(path, body, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) {
      throw new Error(data.error || `Request failed (${res.status})`);
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

export async function checkHealth() {
  try {
    const res = await fetch("/api/health", { method: "GET" });
    if (!res.ok) return { available: false };
    return await res.json();
  } catch {
    return { available: false };
  }
}

// Analyze a general contracting project. Routes to the specialized trade agent
// when the backend can detect one, otherwise falls back to the general agent.
// `mockFallback` is invoked only when the real call fails.
export async function analyzeProject(form, { mockFallback } = {}) {
  const photos = await encodePhotos(form.photos);
  const payload = {
    name: form.name,
    address: form.address,
    description: form.description,
    budget: form.budget,
    photos,
  };
  try {
    const data = await postJson("/api/analyze-trade", payload);
    return { analysis: data.analysis, trade: data.trade, source: "api" };
  } catch (err) {
    console.warn("analyze-trade failed, falling back:", err.message);
    if (!mockFallback) throw err;
    const analysis = await mockFallback(form);
    return { analysis, trade: null, source: "mock" };
  }
}

export async function analyzeDIYProject(form, { mockFallback } = {}) {
  const photos = await encodePhotos(form.photos);
  const payload = { ...form, photos };
  try {
    const data = await postJson("/api/analyze-diy", payload);
    return { analysis: data.analysis, source: "api" };
  } catch (err) {
    console.warn("analyze-diy failed, falling back:", err.message);
    if (!mockFallback) throw err;
    const analysis = await mockFallback(form);
    return { analysis, source: "mock" };
  }
}

export async function reviewContract(body, { mockFallback } = {}) {
  try {
    const data = await postJson("/api/review-contract", body);
    return { review: data.review, source: "api" };
  } catch (err) {
    console.warn("review-contract failed, falling back:", err.message);
    if (!mockFallback) throw err;
    const review = await mockFallback(body);
    return { review, source: "mock" };
  }
}
