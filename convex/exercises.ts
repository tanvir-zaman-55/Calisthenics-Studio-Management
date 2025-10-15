import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all exercises
// Get all exercises (filtered by creator for regular admins)
export const getAllExercises = query({
  args: {
    creatorId: v.optional(v.id("users")),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let exercises = await ctx.db.query("exercises").collect();

    // Filter for regular admins - only show exercises they created
    if (args.role === "admin" && args.creatorId) {
      exercises = exercises.filter((e) => e.createdBy === args.creatorId);
    }

    return exercises;
  },
});

// Get exercises by category
export const getExercisesByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("exercises")
      .filter((q) => q.eq(q.field("category"), args.category))
      .collect();
  },
});

// Get exercises by difficulty
export const getExercisesByDifficulty = query({
  args: {
    difficulty: v.union(
      v.literal("Beginner"),
      v.literal("Intermediate"),
      v.literal("Advanced")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("exercises")
      .withIndex("by_difficulty", (q) => q.eq("difficulty", args.difficulty))
      .collect();
  },
});

// Get single exercise
export const getExercise = query({
  args: { exerciseId: v.id("exercises") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.exerciseId);
  },
});

// Create new exercise
export const createExercise = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    difficulty: v.union(
      v.literal("Beginner"),
      v.literal("Intermediate"),
      v.literal("Advanced")
    ),
    primaryMuscles: v.array(v.string()),
    equipment: v.string(),
    description: v.string(),
    videoUrl: v.optional(v.string()),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const exerciseId = await ctx.db.insert("exercises", {
      name: args.name,
      category: args.category,
      difficulty: args.difficulty,
      primaryMuscles: args.primaryMuscles,
      equipment: args.equipment,
      description: args.description,
      videoUrl: args.videoUrl,
      importedFromSheets: false,
      createdBy: args.createdBy,
      createdAt: now,
      updatedAt: now,
    });

    return exerciseId;
  },
});

// Update exercise
export const updateExercise = mutation({
  args: {
    exerciseId: v.id("exercises"),
    name: v.optional(v.string()),
    category: v.optional(v.string()),
    difficulty: v.optional(
      v.union(
        v.literal("Beginner"),
        v.literal("Intermediate"),
        v.literal("Advanced")
      )
    ),
    primaryMuscles: v.optional(v.array(v.string())),
    equipment: v.optional(v.string()),
    description: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { exerciseId, ...updates } = args;

    await ctx.db.patch(exerciseId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return exerciseId;
  },
});

// Delete exercise
export const deleteExercise = mutation({
  args: { exerciseId: v.id("exercises") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.exerciseId);
    return { success: true };
  },
});

// Search exercises by name
export const searchExercises = query({
  args: { searchQuery: v.string() },
  handler: async (ctx, args) => {
    const allExercises = await ctx.db.query("exercises").collect();

    if (!args.searchQuery) {
      return allExercises;
    }

    const query = args.searchQuery.toLowerCase();
    return allExercises.filter((exercise) =>
      exercise.name.toLowerCase().includes(query)
    );
  },
});
