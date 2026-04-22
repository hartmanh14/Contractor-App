// Shared Anthropic client + structured-output helpers used by every analysis
// endpoint. Centralizes three improvements over the original regex approach:
//
//  1. Prompt caching on system prompts (cache_control: ephemeral) so repeated
//     calls to the same agent are ~90% cheaper after the first request.
//  2. Tool-use for structured JSON — the model is forced to call a tool with
//     a schema-validated input, which eliminates the brittle /\{[\s\S]*\}/
//     regex parse (it would silently corrupt when the model wrapped its JSON
//     in markdown fences, added a trailing explanation, or nested braces).
//  3. Request timeouts so a stalled API call can't hang the Express handler.

import Anthropic from "@anthropic-ai/sdk";

const DEFAULT_MODEL = "claude-sonnet-4-6";
const DEFAULT_MAX_TOKENS = 4096;
const DEFAULT_TIMEOUT_MS = 110_000; // leave headroom under proxy/load-balancer limits

let _client = null;
export function getAnthropic() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not configured on the server");
  }
  if (!_client) {
    _client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      timeout: DEFAULT_TIMEOUT_MS,
    });
  }
  return _client;
}

export function hasAnthropicKey() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

// Convert raw photo payloads from the client into Anthropic image+text content
// blocks. Accepts `{ base64, mimeType, caption }` — strips the data URL prefix
// if present.
export function photosToContent(photos = [], { captionPrefix = "Photo caption" } = {}) {
  const content = [];
  for (const photo of photos) {
    if (!photo?.base64) continue;
    const base64Data = photo.base64.includes(",") ? photo.base64.split(",")[1] : photo.base64;
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: photo.mimeType || "image/jpeg",
        data: base64Data,
      },
    });
    if (photo.caption) {
      content.push({ type: "text", text: `${captionPrefix}: ${photo.caption}` });
    }
  }
  return content;
}

// Force the model to return structured JSON matching `schema` (JSON Schema).
// Uses Anthropic tool_use with tool_choice forcing the named tool — the model
// cannot respond with free-form text, so the output is always parseable.
//
// Options:
//   system       — system prompt string (will be prompt-cached automatically)
//   userContent  — array of content blocks for the user turn
//   schema       — JSON Schema for the tool input
//   toolName     — name of the synthetic tool (default: "submit_result")
//   model, maxTokens
export async function extractStructured({
  system,
  userContent,
  schema,
  toolName = "submit_result",
  toolDescription = "Submit the structured analysis back to the caller.",
  model = DEFAULT_MODEL,
  maxTokens = DEFAULT_MAX_TOKENS,
}) {
  const client = getAnthropic();

  const systemBlocks = Array.isArray(system)
    ? system
    : [{ type: "text", text: system, cache_control: { type: "ephemeral" } }];

  const message = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system: systemBlocks,
    tools: [{ name: toolName, description: toolDescription, input_schema: schema }],
    tool_choice: { type: "tool", name: toolName },
    messages: [{ role: "user", content: userContent }],
  });

  const toolUse = message.content.find(c => c.type === "tool_use" && c.name === toolName);
  if (!toolUse) {
    throw new Error(`Model did not invoke ${toolName} — got ${message.stop_reason}`);
  }
  return toolUse.input;
}
