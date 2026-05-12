import "server-only";

import { getServerEnv } from "@/lib/env";
import { extractFirstJsonObject } from "@/lib/ai/parse";
import { aiConfigSchema, type AiConfig } from "@/lib/ai/schema";

type GenerateInput = {
  businessName: string;
  ownerName: string;
  category: string;
  location: string;
  currencySymbol: string;
  items: Array<{ name: string; price: number }>;
};

export async function generateAiConfig(input: GenerateInput): Promise<AiConfig> {
  const { anthropicApiKey } = getServerEnv();

  const prompt = `Generate a micro-business storefront config. Return ONLY raw JSON, zero markdown, no backticks, no preamble.

Business: ${input.businessName}
Owner: ${input.ownerName}
Category: ${input.category}
Location: ${input.location}
Currency symbol: ${input.currencySymbol}
Products: ${JSON.stringify(input.items)}

JSON schema:
{
  "headline": "4-6 word tagline",
  "heroCopy": "2 compelling customer-facing sentences",
  "colorScheme": {"primary":"#hex","bg":"#hex"},
  "howItWorks": [
    {"step":"1","title":"Browse","desc":"one sentence"},
    {"step":"2","title":"Order","desc":"one sentence"},
    {"step":"3","title":"Receive","desc":"one sentence"}
  ],
  "orderInstructions": "1-2 sentences: what happens after order",
  "whatsappMessage": "Hi ${input.ownerName}! I just placed an order on ${input.businessName}.\\n\\nOrder ID: {{orderId}}\\nMy name: {{name}}\\nItems: {{items}}\\nTotal: {{total}}\\nDelivery to: {{hostel}}\\n\\nPlease confirm, thank you!",
  "ownerInsights": [
    {"label":"tip","value":"actionable growth tip"},
    {"label":"tip","value":"actionable growth tip"},
    {"label":"tip","value":"actionable growth tip"}
  ]
}

Color scheme logic: food=warm amber, beauty=blush/rose, groceries=fresh green, fashion=deep navy. Use category to infer.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": anthropicApiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data: unknown = await res.json();
  if (!res.ok) {
    const message =
      typeof data === "object" && data && "error" in data
        ? JSON.stringify((data as { error: unknown }).error)
        : `Claude API error (${res.status})`;
    throw new Error(message);
  }

  const text =
    typeof data === "object" &&
    data &&
    "content" in data &&
    Array.isArray((data as { content?: unknown }).content) &&
    (data as { content: Array<{ text?: unknown }> }).content[0] &&
    typeof (data as { content: Array<{ text?: unknown }> }).content[0].text === "string"
      ? (data as { content: Array<{ text: string }> }).content[0].text
      : null;

  if (!text) throw new Error("Claude returned an unexpected response.");

  const raw = extractFirstJsonObject(text);
  const parsed = aiConfigSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    throw new Error("Claude returned invalid JSON config.");
  }
  return parsed.data;
}

