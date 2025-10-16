import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
// Create a new class session
export const createSession = mutation({
  args: {
    classId: v.id("classes"),
    startTime: v.string(),
    endTime: v.string(),
    sessionDate: v.number(),
    location: v.optional(v.string()),
    maxCapacity: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const sessionId = await ctx.db.insert("classSessions", {
      classId: args.classId,
      startTime: args.startTime,
      endTime: args.endTime,
      sessionDate: args.sessionDate,
      status: "scheduled",
      ...(args.location && { location: args.location }),
      ...(args.maxCapacity && { maxCapacity: args.maxCapacity }),
      ...(args.notes && { notes: args.notes }),
    });

    return sessionId;
  },
});

// Get sessions for a specific week with filtering
export const getSessionsForWeek = query({
  args: {
    startDate: v.string(), // ISO format date string
    endDate: v.string(), // ISO format date string
    instructorId: v.optional(v.id("users")),
    traineeId: v.optional(v.id("users")),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get all sessions in the date range
    let allSessions = await ctx.db
      .query("classSessions")
      .filter((q) =>
        q.and(
          q.gte(q.field("startTime"), args.startDate),
          q.lte(q.field("startTime"), args.endDate)
        )
      )
      .collect();

    // For trainees: Get their enrolled classes
    let enrolledClassIds: Set<string> | null = null;
    if (args.role === "trainee" && args.traineeId) {
      // ✅ Already checking args.traineeId exists
      const enrollments = await ctx.db
        .query("classEnrollments")
        .withIndex("by_trainee_and_status", (q) =>
          q
            .eq("traineeId", args.traineeId!) // ← ADD ! to assert it's not undefined
            .eq("status", "active")
        )
        .collect();

      enrolledClassIds = new Set(enrollments.map((e) => e.classId));
    }

    // Get class and instructor details, filter based on role
    const sessionsWithDetails = [];

    for (const session of allSessions) {
      const classItem = await ctx.db.get(session.classId);

      // Skip if class doesn't exist
      if (!classItem) continue;

      // For trainees: only show sessions for enrolled classes
      if (enrolledClassIds && !enrolledClassIds.has(session.classId)) {
        continue;
      }

      const instructor = await ctx.db.get(classItem.instructorId);

      // Skip if instructor doesn't exist or isn't valid
      if (
        !instructor ||
        (instructor.role !== "admin" && instructor.role !== "super_admin")
      ) {
        continue;
      }

      // Filter by instructor for regular admins
      if (
        args.role === "admin" &&
        args.instructorId &&
        classItem.instructorId !== args.instructorId
      ) {
        continue;
      }

      sessionsWithDetails.push({
        ...session,
        className: classItem.name,
        classType: classItem.type,
        instructorName: instructor.name,
        location: session.location || classItem.location,
      });
    }

    return sessionsWithDetails;
  },
});

// Get session stats
export const getSessionStats = query({
  args: {
    instructorId: v.optional(v.id("users")),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    let sessions = await ctx.db
      .query("classSessions")
      .filter((q) =>
        q.and(
          q.gte(q.field("startTime"), weekStart.toISOString()),
          q.lt(q.field("startTime"), weekEnd.toISOString())
        )
      )
      .collect();

    // Filter by instructor for regular admins
    if (args.role === "admin" && args.instructorId) {
      const filteredSessions = [];
      for (const session of sessions) {
        const classItem = await ctx.db.get(session.classId);
        if (classItem?.instructorId === args.instructorId) {
          filteredSessions.push(session);
        }
      }
      sessions = filteredSessions;
    }

    return {
      thisWeekSessions: sessions.length,
      totalSessions: sessions.length,
    };
  },
});

// Delete a session
export const deleteSession = mutation({
  args: {
    sessionId: v.id("classSessions"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.sessionId);
    return { success: true };
  },
});

// Delete all sessions (for cleanup)
export const deleteAllSessions = mutation({
  handler: async (ctx) => {
    const allSessions = await ctx.db.query("classSessions").collect();

    for (const session of allSessions) {
      await ctx.db.delete(session._id);
    }

    return { deletedCount: allSessions.length };
  },
});

// Cleanup orphaned sessions
export const cleanupOrphanedSessions = mutation({
  handler: async (ctx) => {
    const allSessions = await ctx.db.query("classSessions").collect();

    let deletedCount = 0;
    for (const session of allSessions) {
      const classItem = await ctx.db.get(session.classId);

      if (!classItem) {
        await ctx.db.delete(session._id);
        deletedCount++;
        continue;
      }

      const instructor = await ctx.db.get(classItem.instructorId);
      if (
        !instructor ||
        (instructor.role !== "admin" && instructor.role !== "super_admin")
      ) {
        await ctx.db.delete(session._id);
        deletedCount++;
      }
    }

    return { deletedCount };
  },
});
