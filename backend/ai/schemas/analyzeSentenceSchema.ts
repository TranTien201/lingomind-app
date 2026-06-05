import { Type } from "@google/genai";
import { z } from "zod";

export const analyzeSentenceChunkSchema = z.object({
  english: z.string().min(1),
  vietnamese: z.string().min(1),
  type: z.string().min(1),
  color: z.enum(["blue", "green", "purple", "pink", "amber", "indigo", "rose", "teal"]),
});

export const analyzeSentenceResponseSchema = z.object({
  chunks: z.array(analyzeSentenceChunkSchema),
});

export type AnalyzeSentenceResult = z.infer<typeof analyzeSentenceResponseSchema>;

export const analyzeSentenceResponseJsonSchema = {
  type: Type.OBJECT,
  properties: {
    chunks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          english: { type: Type.STRING },
          vietnamese: { type: Type.STRING },
          type: { type: Type.STRING },
          color: { type: Type.STRING, enum: ["blue", "green", "purple", "pink", "amber", "indigo", "rose", "teal"] },
        },
        required: ["english", "vietnamese", "type", "color"],
      },
    },
  },
  required: ["chunks"],
} as const;
