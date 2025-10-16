import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all workout templates (filtered by creator for regular admins)
export const getAllTemplates = query({
  args: {
    creatorId: v.optional(v.id("users")),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let templates = await ctx.db.query("workoutTemplates").collect();

    // Filter for regular admins - only show templates they created
    if (args.role === "admin" && args.creatorId) {
      templates = templates.filter((t) => t.createdBy === args.creatorId);
    }

    return templates;
  },
});

// Get templates by difficulty
export const getTemplatesByDifficulty = query({
  args: {
    difficulty: v.union(
      v.literal("Beginner"),
      v.literal("Intermediate"),
      v.literal("Advanced")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("workoutTemplates")
      .withIndex("by_difficulty", (q) => q.eq("difficulty", args.difficulty))
      .collect();
  },
});

// Get single template with exercise details
export const getTemplateWithExercises = query({
  args: { templateId: v.id("workoutTemplates") },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    if (!template) return null;

    // Fetch all exercises in this template
    const exercisesWithDetails = await Promise.all(
      template.exercises.map(async (workoutEx) => {
        const exercise = await ctx.db.get(workoutEx.exerciseId);
        return {
          ...workoutEx,
          exerciseDetails: exercise,
        };
      })
    );

    return {
      ...template,
      exercisesWithDetails,
    };
  },
});

// Create workout template
export const createTemplate = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    difficulty: v.union(
      v.literal("Beginner"),
      v.literal("Intermediate"),
      v.literal("Advanced")
    ),
    duration: v.number(),
    exercises: v.array(
      v.object({
        exerciseId: v.id("exercises"),
        sets: v.number(),
        reps: v.string(),
        rest: v.number(),
        notes: v.optional(v.string()),
      })
    ),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const templateId = await ctx.db.insert("workoutTemplates", {
      name: args.name,
      description: args.description,
      difficulty: args.difficulty,
      duration: args.duration,
      exercises: args.exercises,
      importedFromSheets: false,
      createdBy: args.createdBy,
      createdAt: now,
      updatedAt: now,
    });

    return templateId;
  },
});

// Update template
export const updateTemplate = mutation({
  args: {
    templateId: v.id("workoutTemplates"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    difficulty: v.optional(
      v.union(
        v.literal("Beginner"),
        v.literal("Intermediate"),
        v.literal("Advanced")
      )
    ),
    duration: v.optional(v.number()),
    exercises: v.optional(
      v.array(
        v.object({
          exerciseId: v.id("exercises"),
          sets: v.number(),
          reps: v.string(),
          rest: v.number(),
          notes: v.optional(v.string()),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const { templateId, ...updates } = args;

    await ctx.db.patch(templateId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return templateId;
  },
});

// Delete template
export const deleteTemplate = mutation({
  args: { templateId: v.id("workoutTemplates") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.templateId);
    return { success: true };
  },
});
