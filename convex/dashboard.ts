import { query } from "./_generated/server";
import { v } from "convex/values";

// Get dashboard stats for admin/super admin
export const getAdminDashboardStats = query({
  args: {
    adminId: v.optional(v.id("users")),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Total users by role
    const allUsers = await ctx.db.query("users").collect();
    let trainees = allUsers.filter((u) => u.role === "trainee");
    const admins = allUsers.filter((u) => u.role === "admin");

    // Filter trainees for regular admins
    if (args.role === "admin" && args.adminId) {
      trainees = trainees.filter((t) => t.assignedAdminId === args.adminId);
    }

    // Active workouts (assignments) - filter by admin
    let activeAssignments = await ctx.db
      .query("workoutAssignments")
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    if (args.role === "admin" && args.adminId) {
      activeAssignments = activeAssignments.filter(
        (a) => a.assignedBy === args.adminId
      );
    }

    // Classes - filter by instructor
    let activeClasses = await ctx.db
      .query("classes")
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    if (args.role === "admin" && args.adminId) {
      activeClasses = activeClasses.filter(
        (c) => c.instructorId === args.adminId
      );
    }

    // Total enrollments - only for this admin's classes
    const classIds = activeClasses.map((c) => c._id);
    let activeEnrollments = await ctx.db
      .query("classEnrollments")
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    if (args.role === "admin" && args.adminId) {
      activeEnrollments = activeEnrollments.filter((e) =>
        classIds.includes(e.classId)
      );
    }

    // Exercises and templates (shared across all admins)
    const exercises = await ctx.db.query("exercises").collect();
    const templates = await ctx.db.query("workoutTemplates").collect();

    // Get recent activity (last 7 days) - filtered
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentAssignments = activeAssignments.filter(
      (a) => a.assignedAt >= sevenDaysAgo
    );

    // Filter recent enrollments to only this admin's classes
    const recentEnrollments = activeEnrollments.filter(
      (e) => e.enrolledAt >= sevenDaysAgo
    );

    return {
      totalTrainees: trainees.length,
      totalAdmins: admins.length,
      totalUsers: allUsers.length,
      activeWorkouts: activeAssignments.length,
      activeClasses: activeClasses.length,
      totalEnrollments: activeEnrollments.length,
      totalExercises: exercises.length,
      totalTemplates: templates.length,
      recentAssignments: recentAssignments.length,
      recentEnrollments: recentEnrollments.length,
    };
  },
});

// Get dashboard stats for trainee (unchanged)
export const getTraineeDashboardStats = query({
  args: { traineeId: v.id("users") },
  handler: async (ctx, args) => {
    const myAssignments = await ctx.db
      .query("workoutAssignments")
      .withIndex("by_trainee_and_status", (q) =>
        q.eq("traineeId", args.traineeId).eq("status", "active")
      )
      .collect();

    const myEnrollments = await ctx.db
      .query("classEnrollments")
      .withIndex("by_trainee_and_status", (q) =>
        q.eq("traineeId", args.traineeId).eq("status", "active")
      )
      .collect();

    const myMeasurements = await ctx.db
      .query("progressMeasurements")
      .withIndex("by_trainee", (q) => q.eq("traineeId", args.traineeId))
      .collect();

    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentMeasurements = myMeasurements.filter(
      (m) => m.recordedAt >= oneWeekAgo
    );

    return {
      activeWorkouts: myAssignments.length,
      enrolledClasses: myEnrollments.length,
      totalMeasurements: myMeasurements.length,
      recentMeasurements: recentMeasurements.length,
      workoutsThisWeek: 0,
      totalMinutes: 0,
    };
  },
});

// Get recent activity feed (filtered)
export const getRecentActivity = query({
  args: {
    limit: v.optional(v.number()),
    adminId: v.optional(v.id("users")),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;

    // Get recent assignments
    let assignments = await ctx.db
      .query("workoutAssignments")
      .order("desc")
      .take(limit * 2);

    // Filter assignments for regular admins
    if (args.role === "admin" && args.adminId) {
      assignments = assignments.filter((a) => a.assignedBy === args.adminId);
    }

    // Get recent enrollments - filter by admin's classes
    let enrollments = await ctx.db
      .query("classEnrollments")
      .order("desc")
      .take(limit * 2);

    if (args.role === "admin" && args.adminId) {
      // Get admin's classes
      const adminClasses = await ctx.db
        .query("classes")
        .filter((q) => q.eq(q.field("instructorId"), args.adminId))
        .collect();
      const classIds = adminClasses.map((c) => c._id);

      enrollments = enrollments.filter((e) => classIds.includes(e.classId));
    }

    const activities = [];

    for (const assignment of assignments) {
      const trainee = await ctx.db.get(assignment.traineeId);
      const template = await ctx.db.get(assignment.templateId);
      const assignedBy = await ctx.db.get(assignment.assignedBy);

      activities.push({
        type: "workout_assigned" as const,
        date: assignment.assignedAt,
        traineeName: trainee?.name,
        templateName: template?.name,
        assignedByName: assignedBy?.name,
      });
    }

    for (const enrollment of enrollments) {
      const trainee = await ctx.db.get(enrollment.traineeId);
      const classItem = await ctx.db.get(enrollment.classId);

      activities.push({
        type: "class_enrolled" as const,
        date: enrollment.enrolledAt,
        traineeName: trainee?.name,
        className: classItem?.name,
      });
    }

    return activities.sort((a, b) => b.date - a.date).slice(0, limit);
  },
});
