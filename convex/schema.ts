import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  startups: defineTable({
    name: v.string(),
    description: v.string(),
    imageUrl: v.string(),
    category: v.string(),
    crackedCount: v.number(),
    cookedCount: v.number(),
    createdAt: v.number(),
  })
  .index("by_created_at", ["createdAt"])
  .index("by_name", ["name"])
  ,

  votes: defineTable({
    startupName: v.string(),
    userId: v.string(),
    vote: v.union(v.literal("CRACKED"), v.literal("COOKED")),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_startup", ["startupName"])
    .index("by_startup_user", ["startupName", "userId"]),
});
