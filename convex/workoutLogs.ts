import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all workout logs for a trainee
export const getTraineeWorkoutLogs = query({
  args: { traineeId: v.id("users") },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("workoutLogs")
      .withIndex("by_trainee", (q) => q.eq("traineeId", args.traineeId))
      .order("desc")
      .collect();

    // Get template names for each log
    const logsWithDetails = await Promise.all(
      logs.map(async (log) => {
        const template = await ctx.db.get(log.templateId);
        return {
          ...log,
          templateName: template?.name,
        };
      })
    );

    return logsWithDetails;
  },
});

// Get workout logs for last 7 days (for stats)
export const getRecentWorkoutLogs = query({
  args: { traineeId: v.id("users") },
  handler: async (ctx, args) => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const logs = await ctx.db
      .query("workoutLogs")
      .withIndex("by_trainee", (q) => q.eq("traineeId", args.traineeId))
      .filter((q) => q.gte(q.field("completedAt"), sevenDaysAgo))
      .collect();

    return logs;
  },
});

// Log a completed workout
export const logWorkout = mutation({
  args: {
    traineeId: v.id("users"),
    templateId: v.id("workoutTemplates"),
    completedExercises: v.array(v.id("exercises")),
    duration: v.number(), // in minutes
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const logData: any = {
      traineeId: args.traineeId,
      templateId: args.templateId,
      completedExercises: args.completedExercises,
      completedAt: Date.now(),
      duration: args.duration,
    };

    // Only add notes if provided
    if (args.notes !== undefined) {
      logData.notes = args.notes;
    }

    const logId = await ctx.db.insert("workoutLogs", logData);

    return logId;
  },
});

// Get workout stats for trainee
export const getWorkoutStats = query({
  args: { traineeId: v.id("users") },
  handler: async (ctx, args) => {
    const allLogs = await ctx.db
      .query("workoutLogs")
      .withIndex("by_trainee", (q) => q.eq("traineeId", args.traineeId))
      .collect();

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentLogs = allLogs.filter((log) => log.completedAt >= sevenDaysAgo);

    const totalMinutes = recentLogs.reduce((sum, log) => sum + log.duration, 0);

    return {
      totalWorkouts: allLogs.length,
      workoutsThisWeek: recentLogs.length,
      totalMinutes,
      averageDuration:
        recentLogs.length > 0
          ? Math.round(totalMinutes / recentLogs.length)
          : 0,
    };
  },
});

// Get workout logs for a specific template (for completion rate)
export const getTemplateCompletionRate = query({
  args: { templateId: v.id("workoutTemplates") },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    if (!template) return { completionRate: 0, totalLogs: 0 };

    const logs = await ctx.db
      .query("workoutLogs")
      .filter((q) => q.eq(q.field("templateId"), args.templateId))
      .collect();

    const totalExercises = template.exercises?.length || 0;

    if (totalExercises === 0 || logs.length === 0) {
      return { completionRate: 0, totalLogs: 0 };
    }

    const totalCompletionRate = logs.reduce((sum, log) => {
      const completed = log.completedExercises.length;
      return sum + (completed / totalExercises) * 100;
    }, 0);

    return {
      completionRate: Math.round(totalCompletionRate / logs.length),
      totalLogs: logs.length,
    };
  },
});
