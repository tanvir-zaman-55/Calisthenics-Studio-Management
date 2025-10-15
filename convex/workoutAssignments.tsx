import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all assignments for a trainee
export const getTraineeAssignments = query({
  args: { traineeId: v.id("users") },
  handler: async (ctx, args) => {
    const assignments = await ctx.db
      .query("workoutAssignments")
      .withIndex("by_trainee_and_status", (q) =>
        q.eq("traineeId", args.traineeId).eq("status", "active")
      )
      .collect();

    // Fetch template details for each assignment
    const assignmentsWithDetails = await Promise.all(
      assignments.map(async (assignment) => {
        const template = await ctx.db.get(assignment.templateId);
        const assignedBy = await ctx.db.get(assignment.assignedBy);

        return {
          ...assignment,
          template,
          assignedByName: assignedBy?.name,
        };
      })
    );

    return assignmentsWithDetails;
  },
});

// Get all assignments (for admins)
export const getAllAssignments = query({
  handler: async (ctx) => {
    const assignments = await ctx.db
      .query("workoutAssignments")
      .order("desc")
      .collect();

    const assignmentsWithDetails = await Promise.all(
      assignments.map(async (assignment) => {
        const template = await ctx.db.get(assignment.templateId);
        const trainee = await ctx.db.get(assignment.traineeId);
        const assignedBy = await ctx.db.get(assignment.assignedBy);

        return {
          ...assignment,
          template,
          traineeName: trainee?.name,
          assignedByName: assignedBy?.name,
        };
      })
    );

    return assignmentsWithDetails;
  },
});

// Get assignments by template (to see who has this workout)
export const getAssignmentsByTemplate = query({
  args: { templateId: v.id("workoutTemplates") },
  handler: async (ctx, args) => {
    const assignments = await ctx.db
      .query("workoutAssignments")
      .withIndex("by_template", (q) => q.eq("templateId", args.templateId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    const assignmentsWithTrainees = await Promise.all(
      assignments.map(async (assignment) => {
        const trainee = await ctx.db.get(assignment.traineeId);
        return {
          ...assignment,
          trainee,
        };
      })
    );

    return assignmentsWithTrainees;
  },
});

// Assign workout to trainee
export const assignWorkout = mutation({
  args: {
    traineeId: v.id("users"),
    templateId: v.id("workoutTemplates"),
    assignedBy: v.id("users"),
    scheduledDays: v.array(v.string()),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if there's already an active assignment for this trainee+template
    const existing = await ctx.db
      .query("workoutAssignments")
      .withIndex("by_trainee_and_status", (q) =>
        q.eq("traineeId", args.traineeId).eq("status", "active")
      )
      .filter((q) => q.eq(q.field("templateId"), args.templateId))
      .first();

    if (existing) {
      throw new Error("This workout is already assigned to this trainee");
    }

    const assignmentId = await ctx.db.insert("workoutAssignments", {
      traineeId: args.traineeId,
      templateId: args.templateId,
      assignedBy: args.assignedBy,
      assignedAt: Date.now(),
      scheduledDays: args.scheduledDays,
      startDate: args.startDate,
      endDate: args.endDate,
      status: "active",
      notes: args.notes,
    });

    return assignmentId;
  },
});

// Update assignment
export const updateAssignment = mutation({
  args: {
    assignmentId: v.id("workoutAssignments"),
    scheduledDays: v.optional(v.array(v.string())),
    endDate: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("completed"),
        v.literal("cancelled")
      )
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { assignmentId, ...updates } = args;

    await ctx.db.patch(assignmentId, updates);
    return assignmentId;
  },
});

// Cancel/remove assignment
export const cancelAssignment = mutation({
  args: { assignmentId: v.id("workoutAssignments") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.assignmentId, {
      status: "cancelled",
    });
    return { success: true };
  },
});

// Get assignment stats for a trainee
export const getTraineeAssignmentStats = query({
  args: { traineeId: v.id("users") },
  handler: async (ctx, args) => {
    const allAssignments = await ctx.db
      .query("workoutAssignments")
      .withIndex("by_trainee", (q) => q.eq("traineeId", args.traineeId))
      .collect();

    return {
      total: allAssignments.length,
      active: allAssignments.filter((a) => a.status === "active").length,
      completed: allAssignments.filter((a) => a.status === "completed").length,
      cancelled: allAssignments.filter((a) => a.status === "cancelled").length,
    };
  },
});

// Get assignment stats for admin (filtered)
export const getAssignmentStats = query({
  args: {
    adminId: v.optional(v.id("users")),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let allAssignments = await ctx.db.query("workoutAssignments").collect();

    // Filter for regular admins
    if (args.role === "admin" && args.adminId) {
      allAssignments = allAssignments.filter(
        (a) => a.assignedBy === args.adminId
      );
    }

    const activeAssignments = allAssignments.filter(
      (a) => a.status === "active"
    );

    return {
      totalAssignments: allAssignments.length,
      activeAssignments: activeAssignments.length,
      completedAssignments: allAssignments.filter(
        (a) => a.status === "completed"
      ).length,
    };
  },
});
