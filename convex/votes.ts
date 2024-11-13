import { query } from "./_generated/server";
import { components } from "./_generated/api";
import { DataModel, Id } from "./_generated/dataModel";
import { TableAggregate } from "@convex-dev/aggregate";

// const aggregateByCracked = new TableAggregate<
//   [Id<"startups">, 0 | 1],
//   DataModel,
//   "votes"
// >(components.aggregateByCracked, {
//   // namespace: (doc) => undefined, // disable namespacing.
//   sortKey: (doc) => [doc.startupId, doc.vote === "CRACKED" ? 1 : 0], // Allows querying across time ranges.
//   // sumValue: (doc) => doc.vote === "CRACKED" ? 1 : 0, // The value to be used in `.sum` calculations.
// });

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    return await ctx.db
      .query("votes")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
  },
});
    
