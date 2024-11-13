import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("startups").collect();
    },
});

export const getById = query({
    args: { id: v.id("startups") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const create = mutation({
    args: {
        name: v.string(),
        description: v.string(),
        imageUrl: v.string(),
        category: v.string(),
        password: v.string(),
    },
    handler: async (ctx, args) => {

        if (!args.name) {
            throw new Error("Name is required");
        }

        if (!args.password || args.password !== "eggilicious") {
            throw new Error("Invalid password");
        }

        if (await ctx.db.query("startups").withIndex("by_name", (q) => q.eq("name", args.name)).first()) {
            throw new Error("Startup already exists");
        }


        return await ctx.db.insert("startups", {
            ...{ name: args.name, description: args.description, imageUrl: args.imageUrl, category: args.category },
            crackedCount: 0,
            cookedCount: 0,
            createdAt: Date.now(),
        });
    },
});

export const vote = mutation({
    args: {
        startupName: v.string(),
        vote: v.union(v.literal("CRACKED"), v.literal("COOKED")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthorized");
        }

        const startup = await ctx.db.query("startups").withIndex("by_name", (q) => q.eq("name", args.startupName)).first();
        if (!startup) {
            throw new Error("Startup not found");
        }

        // Check if user has already voted
        let existingVote = await ctx.db
        .query("votes")
        .withIndex("by_startup_user", (q) =>
                   q.eq("startupName", startup.name).eq("userId", identity.subject)
                  )
                  .first();
                let voteId: Id<"votes">;
                  let crackedCount = startup.crackedCount;
                  let cookedCount = startup.cookedCount;

                  if (existingVote) {
                      ctx.db.replace(existingVote._id, {
                        startupName: startup.name,
                          userId: identity.subject,
                          vote: args.vote,
                          createdAt: Date.now(),
                      });
                    voteId = existingVote._id;
                      if (existingVote.vote === "CRACKED") {
                          crackedCount -= 1;
                      } else  {
                          cookedCount -= 1;
                      }
                  } else  {
                      // Record the vote
                      voteId = await ctx.db.insert("votes", {
                        startupName: startup.name,
                          userId: identity.subject,
                          vote: args.vote,
                          createdAt: Date.now(),
                      });
                  }

                  // Update startup counts
                  if (args.vote === "CRACKED") {
                      crackedCount += 1;
                  } else {
                      cookedCount += 1;
                  }


                  await ctx.db.patch(startup._id, {
                      crackedCount,
                      cookedCount,
                  });

                return voteId;
    },
});
