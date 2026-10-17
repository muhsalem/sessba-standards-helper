import { z } from "zod";

export const gitSyncInputSchema = z.object({
  gitLog: z.string().trim().max(20000),
  gitStatus: z.string().trim().max(20000),
  notes: z.string().trim().max(2000).optional(),
}).refine((v) => v.gitLog.length + v.gitStatus.length > 0, "empty");

export const gitSyncResultSchema = z.object({
  summary: z.string(),
  unsyncedChanges: z.array(z.object({ item: z.string(), kind: z.string(), detail: z.string() })),
  likelyCause: z.string(),
  nextSteps: z.array(z.string()),
  confidence: z.enum(["low", "medium", "high"]),
});

export type GitSyncAnalysis = z.infer<typeof gitSyncResultSchema>;
export const canAnalyzeGitSync = (roles: readonly string[]) => roles.includes("admin");