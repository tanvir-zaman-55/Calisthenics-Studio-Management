import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Mark attendance for a trainee in a class
export const markAttendance = mutation({
  args: {
    traineeId: v.id("users"),
    classId: v.id("classes"),
    scheduleDate: v.number(),
    status: v.union(
      v.literal("present"),
      v.literal("absent"),
      v.literal("late")
    ),
    markedBy: v.id("users"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // SECURITY: Verify the admin marking attendance teaches this class
    const classItem = await ctx.db.get(args.classId);
    if (!classItem) {
      throw new Error("Class not found");
    }

    const markedByUser = await ctx.db.get(args.markedBy);
    if (
      markedByUser?.role === "admin" &&
      classItem.instructorId !== args.markedBy
    ) {
      throw new Error("You can only mark attendance for your own classes");
    }

    // SECURITY: Verify the trainee is enrolled in this class
    const enrollment = await ctx.db
      .query("classEnrollments")
      .withIndex("by_trainee", (q) => q.eq("traineeId", args.traineeId))
      .filter((q) =>
        q.and(
          q.eq(q.field("classId"), args.classId),
          q.eq(q.field("status"), "active")
        )
      )
      .first();

    if (!enrollment) {
      throw new Error("Trainee is not enrolled in this class");
    }

    // Check if attendance already exists for this date
    const existing = await ctx.db
      .query("attendance")
      .withIndex("by_trainee", (q) => q.eq("traineeId", args.traineeId))
      .filter((q) =>
        q.and(
          q.eq(q.field("classId"), args.classId),
          q.eq(q.field("scheduleDate"), args.scheduleDate)
        )
      )
      .first();

    if (existing) {
      // Update existing attendance
      await ctx.db.patch(existing._id, {
        status: args.status,
        notes: args.notes,
        markedAt: Date.now(),
        markedBy: args.markedBy,
      });
      return existing._id;
    }

    // Create new attendance record
    const attendanceId = await ctx.db.insert("attendance", {
      traineeId: args.traineeId,
      classId: args.classId,
      scheduleDate: args.scheduleDate,
      status: args.status,
      markedAt: Date.now(),
      markedBy: args.markedBy,
      notes: args.notes,
    });

    return attendanceId;
  },
});

// Get attendance for a trainee across all classes
export const getTraineeAttendance = query({
  args: { traineeId: v.id("users") },
  handler: async (ctx, args) => {
    const attendance = await ctx.db
      .query("attendance")
      .withIndex("by_trainee", (q) => q.eq("traineeId", args.traineeId))
      .order("desc")
      .collect();

    // Get class details for each attendance record
    const attendanceWithDetails = await Promise.all(
      attendance.map(async (record) => {
        const classItem = await ctx.db.get(record.classId);
        return {
          ...record,
          className: classItem?.name,
          classType: classItem?.type,
        };
      })
    );

    return attendanceWithDetails;
  },
});

// Get attendance stats for a trainee
export const getAttendanceStats = query({
  args: { traineeId: v.id("users") },
  handler: async (ctx, args) => {
    const attendance = await ctx.db
      .query("attendance")
      .withIndex("by_trainee", (q) => q.eq("traineeId", args.traineeId))
      .collect();

    const total = attendance.length;
    const present = attendance.filter((a) => a.status === "present").length;
    const late = attendance.filter((a) => a.status === "late").length;
    const absent = attendance.filter((a) => a.status === "absent").length;

    const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

    return {
      total,
      present,
      late,
      absent,
      attendanceRate,
    };
  },
});

// Get attendance for a class on a specific date
export const getClassAttendance = query({
  args: {
    classId: v.id("classes"),
    scheduleDate: v.number(),
    requestingAdminId: v.optional(v.id("users")),
    requestingRole: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify admin owns this class
    if (args.requestingRole === "admin" && args.requestingAdminId) {
      const classItem = await ctx.db.get(args.classId);
      if (!classItem || classItem.instructorId !== args.requestingAdminId) {
        // Admin doesn't teach this class - return empty
        return [];
      }
    }

    // Get all active enrollments for THIS SPECIFIC class
    const enrollments = await ctx.db
      .query("classEnrollments")
      .withIndex("by_class", (q) => q.eq("classId", args.classId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    // Get attendance for each enrolled trainee on this date
    const attendanceRecords = [];
    for (const enrollment of enrollments) {
      const trainee = await ctx.db.get(enrollment.traineeId);

      const attendance = await ctx.db
        .query("attendance")
        .withIndex("by_trainee", (q) => q.eq("traineeId", enrollment.traineeId))
        .filter((q) =>
          q.and(
            q.eq(q.field("classId"), args.classId),
            q.eq(q.field("scheduleDate"), args.scheduleDate)
          )
        )
        .first();

      attendanceRecords.push({
        traineeId: enrollment.traineeId,
        traineeName: trainee?.name,
        traineeEmail: trainee?.email,
        status: attendance?.status,
        notes: attendance?.notes,
        attendanceId: attendance?._id,
      });
    }

    return attendanceRecords;
  },
});
// Get overall attendance stats
export const getOverallAttendanceStats = query({
  handler: async (ctx) => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    const recentAttendance = await ctx.db
      .query("attendance")
      .filter((q) => q.gte(q.field("scheduleDate"), thirtyDaysAgo))
      .collect();

    const total = recentAttendance.length;
    const present = recentAttendance.filter(
      (a) => a.status === "present"
    ).length;

    return {
      total,
      present,
      attendanceRate: total > 0 ? Math.round((present / total) * 100) : 0,
    };
  },
});
