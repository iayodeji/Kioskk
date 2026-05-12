import { z } from "zod";

export const aiConfigSchema = z.object({
  headline: z.string().min(1),
  heroCopy: z.string().min(1),
  colorScheme: z.object({
    primary: z.string().regex(/^#([0-9a-fA-F]{6})$/),
    bg: z.string().regex(/^#([0-9a-fA-F]{6})$/),
  }),
  howItWorks: z
    .array(
      z.object({
        step: z.string().min(1),
        title: z.string().min(1),
        desc: z.string().min(1),
      }),
    )
    .length(3),
  orderInstructions: z.string().min(1),
  whatsappMessage: z.string().min(1),
  ownerInsights: z
    .array(
      z.object({
        label: z.string().min(1),
        value: z.string().min(1),
      }),
    )
    .length(3),
});

export type AiConfig = z.infer<typeof aiConfigSchema>;

