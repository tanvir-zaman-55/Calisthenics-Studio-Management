import { query } from "./_generated/server";
import { v } from "convex/values";

// Get all trainees with their stats (filtered by admin for regular admins)
export const getAllTraineesWithStats = query({
  args: {
    adminId: v.optional(v.id("users")),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get all trainees
    let trainees = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "trainee"))
      .collect();

    // If regular admin (not super admin), filter to only their assigned trainees
    if (args.role === "admin" && args.adminId) {
      trainees = trainees.filter((t) => t.assignedAdminId === args.adminId);
    }

    // Get stats for each trainee
    const traineesWithStats = await Promise.all(
      trainees.map(async (trainee) => {
        // ... rest of existing code (keep all the stats logic)
        // Get workout assignments
        const assignments = await ctx.db
          .query("workoutAssignments")
          .withIndex("by_trainee", (q) => q.eq("traineeId", trainee._id))
          .filter((q) => q.eq(q.field("status"), "active"))
          .collect();

        // Get class enrollments
        const enrollments = await ctx.db
          .query("classEnrollments")
          .withIndex("by_trainee", (q) => q.eq("traineeId", trainee._id))
          .filter((q) => q.eq(q.field("status"), "active"))
          .collect();

        // Get attendance records
        const attendance = await ctx.db
          .query("attendance")
          .withIndex("by_trainee", (q) => q.eq("traineeId", trainee._id))
          .collect();

        const totalAttendance = attendance.length;
        const presentCount = attendance.filter(
          (a) => a.status === "present"
        ).length;
        const attendanceRate =
          totalAttendance > 0
            ? Math.round((presentCount / totalAttendance) * 100)
            : 0;

        // Get assigned admin
        const assignedAdmin = trainee.assignedAdminId
          ? await ctx.db.get(trainee.assignedAdminId)
          : null;

        return {
          ...trainee,
          activeWorkouts: assignments.length,
          enrolledClasses: enrollments.length,
          attendanceRate,
          totalSessions: totalAttendance,
          assignedAdminName: assignedAdmin?.name,
        };
      })
    );

    return traineesWithStats.sort((a, b) => b._creationTime - a._creationTime);
  },
});

// Get single trainee with detailed stats
export const getTraineeWithDetails = query({
  args: { traineeId: v.id("users") },
  handler: async (ctx, args) => {
    const trainee = await ctx.db.get(args.traineeId);
    if (!trainee) return null;

    // Get workout assignments with template names
    const assignments = await ctx.db
      .query("workoutAssignments")
      .withIndex("by_trainee", (q) => q.eq("traineeId", args.traineeId))
      .collect();

    const assignmentsWithDetails = await Promise.all(
      assignments.map(async (assignment) => {
        const template = await ctx.db.get(assignment.templateId);
        const assignedBy = await ctx.db.get(assignment.assignedBy);
        return {
          ...assignment,
          templateName: template?.name,
          assignedByName: assignedBy?.name,
        };
      })
    );

    // Get class enrollments with class names
    const enrollments = await ctx.db
      .query("classEnrollments")
      .withIndex("by_trainee", (q) => q.eq("traineeId", args.traineeId))
      .collect();

    const enrollmentsWithDetails = await Promise.all(
      enrollments.map(async (enrollment) => {
        const classItem = await ctx.db.get(enrollment.classId);
        return {
          ...enrollment,
          className: classItem?.name,
          classType: classItem?.type,
        };
      })
    );

    // Get attendance
    const attendance = await ctx.db
      .query("attendance")
      .withIndex("by_trainee", (q) => q.eq("traineeId", args.traineeId))
      .order("desc")
      .collect();

    const attendanceWithDetails = await Promise.all(
      attendance.map(async (record) => {
        const classItem = await ctx.db.get(record.classId);
        return {
          ...record,
          className: classItem?.name,
        };
      })
    );

    // Get progress measurements
    const measurements = await ctx.db
      .query("progressMeasurements")
      .withIndex("by_trainee", (q) => q.eq("traineeId", args.traineeId))
      .order("desc")
      .collect();

    // Get assigned admin
    const assignedAdmin = trainee.assignedAdminId
      ? await ctx.db.get(trainee.assignedAdminId)
      : null;

    return {
      ...trainee,
      assignments: assignmentsWithDetails,
      enrollments: enrollmentsWithDetails,
      attendance: attendanceWithDetails,
      measurements,
      assignedAdminName: assignedAdmin?.name,
    };
  },
});
