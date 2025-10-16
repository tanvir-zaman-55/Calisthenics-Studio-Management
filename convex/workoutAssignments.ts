import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Assign workout to trainee
export const assignWorkout = mutation({
  args: {
    traineeId: v.id("users"),
    templateId: v.id("workoutTemplates"),
    assignedBy: v.id("users"),
    scheduledDays: v.array(v.string()),
    startDate: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify trainee is assigned to this admin
    const trainee = await ctx.db.get(args.traineeId);
    const admin = await ctx.db.get(args.assignedBy);

    if (!trainee || !admin) {
      throw new Error("User not found");
    }

    // Check if admin can assign to this trainee
    if (admin.role === "admin" && trainee.assignedAdminId !== args.assignedBy) {
      throw new Error("You can only assign workouts to your own trainees");
    }

    const assignmentId = await ctx.db.insert("workoutAssignments", {
      traineeId: args.traineeId,
      templateId: args.templateId,
      assignedBy: args.assignedBy,
      assignedAt: Date.now(),
      status: "active",
      scheduledDays: args.scheduledDays,
      startDate: args.startDate,
      notes: args.notes,
    });

    return assignmentId;
  },
});

// Get trainee's active assignments with full template and exercise details
export const getTraineeAssignments = query({
  args: {
    traineeId: v.id("users"),
    status: v.optional(
      v.union(v.literal("active"), v.literal("completed"), v.literal("paused"))
    ),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("workoutAssignments")
      .withIndex("by_trainee", (q) => q.eq("traineeId", args.traineeId));

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    const assignments = await query.collect();

    // Get full template details with exercises for each assignment
    const assignmentsWithDetails = [];

    for (const assignment of assignments) {
      const template = await ctx.db.get(assignment.templateId);
      const assignedBy = await ctx.db.get(assignment.assignedBy);

      // Skip if template or admin no longer exists
      if (!template || !assignedBy) {
        console.log(`Skipping orphaned assignment: ${assignment._id}`);
        continue;
      }

      // Get full exercise details for each exercise in the template
      const exercisesWithDetails = [];
      for (const workoutEx of template.exercises || []) {
        const exercise = await ctx.db.get(workoutEx.exerciseId);
        if (exercise) {
          exercisesWithDetails.push({
            ...workoutEx,
            exerciseDetails: exercise,
          });
        }
      }

      assignmentsWithDetails.push({
        ...assignment,
        template: {
          ...template,
          exercisesWithDetails,
        },
        assignedByName: assignedBy.name,
      });
    }

    return assignmentsWithDetails;
  },
});

// Get trainee's active assignments (with status filter)
export const getTraineeActiveAssignments = query({
  args: { traineeId: v.id("users") },
  handler: async (ctx, args) => {
    const assignments = await ctx.db
      .query("workoutAssignments")
      .withIndex("by_trainee_and_status", (q) =>
        q.eq("traineeId", args.traineeId).eq("status", "active")
      )
      .collect();

    const assignmentsWithDetails = await Promise.all(
      assignments.map(async (assignment) => {
        const template = await ctx.db.get(assignment.templateId);
        return {
          ...assignment,
          templateName: template?.name,
          templateDescription: template?.description,
          templateDuration: template?.duration,
        };
      })
    );

    return assignmentsWithDetails;
  },
});

// Get all assignments created by an admin (with trainee names)
export const getAssignmentsByAdmin = query({
  args: { adminId: v.id("users") },
  handler: async (ctx, args) => {
    const assignments = await ctx.db
      .query("workoutAssignments")
      .withIndex("by_assigned_by", (q) => q.eq("assignedBy", args.adminId))
      .order("desc")
      .collect();

    // Get template and trainee details
    const assignmentsWithDetails = await Promise.all(
      assignments.map(async (assignment) => {
        const template = await ctx.db.get(assignment.templateId);
        const trainee = await ctx.db.get(assignment.traineeId);

        return {
          ...assignment,
          templateName: template?.name,
          traineeName: trainee?.name,
          traineeEmail: trainee?.email,
        };
      })
    );

    return assignmentsWithDetails;
  },
});

// Update assignment status
export const updateAssignmentStatus = mutation({
  args: {
    assignmentId: v.id("workoutAssignments"),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("paused"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.assignmentId, {
      status: args.status,
    });

    return { success: true };
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
// Cleanup utility: Remove assignments with invalid templates or admins
export const cleanupOrphanedAssignments = mutation({
  handler: async (ctx) => {
    const allAssignments = await ctx.db.query("workoutAssignments").collect();

    let deletedCount = 0;
    for (const assignment of allAssignments) {
      // Check if template exists
      const template = await ctx.db.get(assignment.templateId);

      // Check if assigned admin exists
      const admin = await ctx.db.get(assignment.assignedBy);

      // Check if trainee exists
      const trainee = await ctx.db.get(assignment.traineeId);

      // Delete if any reference is invalid
      if (!template || !admin || !trainee) {
        await ctx.db.delete(assignment._id);
        deletedCount++;
        console.log(`Deleted orphaned assignment: ${assignment._id}`);
      }
    }

    return { deletedCount };
  },
});

// Delete all assignments for a specific trainee (utility)
export const deleteTraineeAssignments = mutation({
  args: {
    traineeId: v.id("users"),
    adminId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify admin permissions
    const admin = await ctx.db.get(args.adminId);
    if (!admin || (admin.role !== "admin" && admin.role !== "super_admin")) {
      throw new Error("Unauthorized");
    }

    // Get all assignments for this trainee
    const assignments = await ctx.db
      .query("workoutAssignments")
      .withIndex("by_trainee", (q) => q.eq("traineeId", args.traineeId))
      .collect();

    // Delete them
    for (const assignment of assignments) {
      // Regular admins can only delete their own assignments
      if (admin.role === "admin" && assignment.assignedBy !== args.adminId) {
        continue;
      }
      await ctx.db.delete(assignment._id);
    }

    return { deletedCount: assignments.length };
  },
});
