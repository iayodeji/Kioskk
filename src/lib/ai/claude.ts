import "server-only";

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
  const pickColors = (category: string) => {
    if (/food|snack|grocery/i.test(category)) return { primary: "#D97706", bg: "#FFF7ED" };
    if (/beauty|skincare/i.test(category)) return { primary: "#BE185D", bg: "#FFF1F2" };
    if (/fashion|clothing/i.test(category)) return { primary: "#1E3A8A", bg: "#EEF2FF" };
    if (/electronics/i.test(category)) return { primary: "#065F46", bg: "#ECFDF5" };
    if (/laundry|cleaning/i.test(category)) return { primary: "#0F766E", bg: "#F0FDFA" };
    return { primary: "#0F172A", bg: "#FFFFFF" };
  };

  const colors = pickColors(input.category || "");
  const config = {
    headline: `${input.businessName} — Open for orders`,
    heroCopy: `Order from ${input.businessName} for quick delivery on campus.`,
    colorScheme: { primary: colors.primary, bg: colors.bg },
    howItWorks: [
      { step: "1", title: "Browse", desc: "Pick items you want from the menu." },
      { step: "2", title: "Order", desc: "Send an order through WhatsApp or the form." },
      { step: "3", title: "Receive", desc: "Confirm the order and get it delivered." },
    ],
    orderInstructions: "After placing an order, you will receive a confirmation via WhatsApp.",
    whatsappMessage: `Hi ${input.ownerName}! I placed an order on ${input.businessName}. Order ID: {{orderId}}\nMy name: {{name}}\nItems: {{items}}\nTotal: {{total}}\nDelivery to: {{hostel}}`,
    ownerInsights: [
      { label: "tip", value: "Highlight your bestsellers at the top." },
      { label: "tip", value: "Offer a single discounted combo to increase order size." },
      { label: "tip", value: "Respond quickly on WhatsApp to confirm orders." },
    ],
  };

  const parsed = aiConfigSchema.safeParse(config);
  if (!parsed.success) {
    throw new Error("Template config is invalid.");
  }
  return parsed.data;
}

