// lib/ai/schema.ts
import { z } from "zod";

export const StructuredPostSchema = z.object({
    title: z.string().min(3),
    markdown: z.string().min(20),
    questions: z
        .array(
            z.object({
                name: z.string().min(2),
                tags: z.array(z.string()).optional().default([]),
                synonyms: z.array(z.string()).optional().default([]),
            })
        )
        .optional()
        .default([]),
    topicsDetected: z
        .array(z.enum(["CN", "OS", "DBMS", "DSA"]))
        .optional()
        .default([]),
    searchQueries: z
        .array(
            z.object({
                question: z.string(),
                queries: z.array(z.string()).min(1),
            })
        )
        .optional()
        .default([]),
});

export type StructuredPost = z.infer<typeof StructuredPostSchema>;
