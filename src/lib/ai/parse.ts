export function extractFirstJsonObject(text: string): string {
  const trimmed = text.trim().replace(/```json|```/gi, "").trim();

  const firstBrace = trimmed.indexOf("{");
  if (firstBrace === -1) return trimmed;

  let depth = 0;
  for (let i = firstBrace; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (ch === "{") depth++;
    if (ch === "}") depth--;
    if (depth === 0) return trimmed.slice(firstBrace, i + 1);
  }

  return trimmed.slice(firstBrace);
}

