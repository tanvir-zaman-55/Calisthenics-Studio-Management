import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all sessions for a date range
// Get all sessions for a date range (filtered by instructor for admins)
export const getSessionsByDateRange = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
    instructorId: v.optional(v.id("users")),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("classSessions")
      .withIndex("by_date", (q) =>
        q.gte("sessionDate", args.startDate).lte("sessionDate", args.endDate)
      )
      .collect();

    // Get class and instructor details
    const sessionsWithDetails = await Promise.all(
      sessions.map(async (session) => {
        const classItem = await ctx.db.get(session.classId);
        const instructor = classItem
          ? await ctx.db.get(classItem.instructorId)
          : null;

        return {
          ...session,
          class: classItem,
          instructorName: instructor?.name,
          instructorId: classItem?.instructorId,
        };
      })
    );

    // Filter by instructor for regular admins
    if (args.role === "admin" && args.instructorId) {
      return sessionsWithDetails.filter(
        (s) => s.instructorId === args.instructorId
      );
    }

    return sessionsWithDetails;
  },
});

// Get sessions for a specific class
export const getSessionsByClass = query({
  args: { classId: v.id("classes") },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("classSessions")
      .withIndex("by_class", (q) => q.eq("classId", args.classId))
      .order("desc")
      .collect();

    return sessions;
  },
});

// Create a single session
export const createSession = mutation({
  args: {
    classId: v.id("classes"),
    sessionDate: v.number(),
    startTime: v.string(), // "09:00"
    endTime: v.string(), // "10:30"
    location: v.optional(v.string()),
    maxCapacity: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const sessionId = await ctx.db.insert("classSessions", {
      classId: args.classId,
      sessionDate: args.sessionDate,
      startTime: args.startTime,
      endTime: args.endTime,
      location: args.location,
      maxCapacity: args.maxCapacity,
      status: "scheduled",
      notes: args.notes,
    });

    return sessionId;
  },
});

// Create recurring sessions (e.g., every Monday for 8 weeks)
export const createRecurringSessions = mutation({
  args: {
    classId: v.id("classes"),
    startDate: v.number(),
    weeksCount: v.number(),
    daysOfWeek: v.array(v.number()), // [1, 3, 5] for Mon, Wed, Fri
    startTime: v.string(),
    endTime: v.string(),
    location: v.optional(v.string()),
    maxCapacity: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const sessionIds = [];

    for (let week = 0; week < args.weeksCount; week++) {
      for (const dayOfWeek of args.daysOfWeek) {
        const date = new Date(args.startDate);
        date.setDate(date.getDate() + week * 7 + dayOfWeek);

        const sessionId = await ctx.db.insert("classSessions", {
          classId: args.classId,
          sessionDate: date.getTime(),
          startTime: args.startTime,
          endTime: args.endTime,
          location: args.location,
          maxCapacity: args.maxCapacity,
          status: "scheduled",
        });

        sessionIds.push(sessionId);
      }
    }

    return sessionIds;
  },
});

// Cancel a session
export const cancelSession = mutation({
  args: {
    sessionId: v.id("classSessions"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      status: "cancelled",
      notes: args.reason,
    });

    return { success: true };
  },
});

// Get trainee's upcoming sessions (based on enrollments)
export const getTraineeUpcomingSessions = query({
  args: { traineeId: v.id("users") },
  handler: async (ctx, args) => {
    // Get trainee's active enrollments
    const enrollments = await ctx.db
      .query("classEnrollments")
      .withIndex("by_trainee_and_status", (q) =>
        q.eq("traineeId", args.traineeId).eq("status", "active")
      )
      .collect();

    const classIds = enrollments.map((e) => e.classId);

    // Get all upcoming sessions for enrolled classes
    const now = Date.now();
    const twoWeeksFromNow = now + 14 * 24 * 60 * 60 * 1000;

    const allSessions = await ctx.db
      .query("classSessions")
      .withIndex("by_date", (q) =>
        q.gte("sessionDate", now).lte("sessionDate", twoWeeksFromNow)
      )
      .filter((q) => q.eq(q.field("status"), "scheduled"))
      .collect();

    // Filter to only sessions for enrolled classes
    const enrolledSessions = allSessions.filter((session) =>
      classIds.includes(session.classId)
    );

    // Get class details
    const sessionsWithDetails = await Promise.all(
      enrolledSessions.map(async (session) => {
        const classItem = await ctx.db.get(session.classId);
        return {
          ...session,
          className: classItem?.name,
          classType: classItem?.type,
        };
      })
    );

    return sessionsWithDetails.sort((a, b) => a.sessionDate - b.sessionDate);
  },
});
// Get session stats
// Get session stats (filtered by instructor)
export const getSessionStats = query({
  args: {
    instructorId: v.optional(v.id("users")),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const weekStart = now - (now % (7 * 24 * 60 * 60 * 1000));
    const weekEnd = weekStart + 7 * 24 * 60 * 60 * 1000;

    let thisWeekSessions = await ctx.db
      .query("classSessions")
      .withIndex("by_date", (q) =>
        q.gte("sessionDate", weekStart).lte("sessionDate", weekEnd)
      )
      .filter((q) => q.eq(q.field("status"), "scheduled"))
      .collect();

    // Filter for regular admins
    if (args.role === "admin" && args.instructorId) {
      const sessionsWithClasses = await Promise.all(
        thisWeekSessions.map(async (session) => {
          const classItem = await ctx.db.get(session.classId);
          return { ...session, instructorId: classItem?.instructorId };
        })
      );
      thisWeekSessions = sessionsWithClasses.filter(
        (s) => s.instructorId === args.instructorId
      );
    }

    return {
      thisWeekSessions: thisWeekSessions.length,
    };
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
