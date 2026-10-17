import { strict as assert } from "node:assert";
import { canAnalyzeGitSync, gitSyncInputSchema } from "./git-sync-data";

assert.equal(canAnalyzeGitSync(["admin"]), true);
for (const roles of [[], ["user"], ["reviewer"], ["expert"]]) {
  assert.equal(canAnalyzeGitSync(roles), false);
}
assert.equal(gitSyncInputSchema.safeParse({ gitLog: " ", gitStatus: " " }).success, false);
assert.equal(gitSyncInputSchema.safeParse({ gitLog: "a".repeat(20001), gitStatus: "" }).success, false);
assert.equal(gitSyncInputSchema.safeParse({ gitLog: "abc123 add standard", gitStatus: "" }).success, true);
console.log("Git sync input and administrator rules passed");