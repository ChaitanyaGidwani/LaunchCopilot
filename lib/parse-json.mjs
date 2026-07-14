// Extract a JSON object from LLM output, tolerating code fences / preamble.
// Pure ESM module so it can be unit-tested with `node --test` directly.

export function parseJSON(text) {
  // 1. Try all fenced code blocks first (last match is often best)
  const fencePattern = /```(?:json)?\s*([\s\S]*?)```/g;
  const blocks = [];
  let match;
  while ((match = fencePattern.exec(text)) !== null) {
    blocks.push(match[1]);
  }

  // Try blocks in reverse order (last block is most likely the final answer)
  for (let i = blocks.length - 1; i >= 0; i--) {
    const candidate = blocks[i];
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start !== -1 && end !== -1) {
      try {
        return JSON.parse(candidate.slice(start, end + 1));
      } catch {
        // Try next block
      }
    }
  }

  // 2. Fallback: find the outermost { ... } in the raw text
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Model did not return JSON. Raw output: " + text.slice(0, 200));
  }
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch (e) {
    throw new Error("Model returned invalid JSON. Parse error: " + e.message + ". Raw: " + text.slice(0, 300));
  }
}
