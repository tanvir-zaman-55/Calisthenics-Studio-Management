import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get trainee's enrolled classes
export const getTraineeEnrollments = query({
  args: { traineeId: v.id("users") },
  handler: async (ctx, args) => {
    const enrollments = await ctx.db
      .query("classEnrollments")
      .withIndex("by_trainee_and_status", (q) =>
        q.eq("traineeId", args.traineeId).eq("status", "active")
      )
      .collect();

    const enrollmentsWithDetails = await Promise.all(
      enrollments.map(async (enrollment) => {
        const classItem = await ctx.db.get(enrollment.classId);
        const instructor = classItem
          ? await ctx.db.get(classItem.instructorId)
          : null;

        return {
          ...enrollment,
          class: classItem,
          instructorName: instructor?.name,
        };
      })
    );

    return enrollmentsWithDetails;
  },
});

// Check if trainee is enrolled in a class
export const isEnrolled = query({
  args: {
    traineeId: v.id("users"),
    classId: v.id("classes"),
  },
  handler: async (ctx, args) => {
    const enrollment = await ctx.db
      .query("classEnrollments")
      .withIndex("by_trainee_and_status", (q) =>
        q.eq("traineeId", args.traineeId).eq("status", "active")
      )
      .filter((q) => q.eq(q.field("classId"), args.classId))
      .first();

    return !!enrollment;
  },
});

// Enroll in class
export const enrollInClass = mutation({
  args: {
    traineeId: v.id("users"),
    classId: v.id("classes"),
  },
  handler: async (ctx, args) => {
    // Check if already enrolled
    const existing = await ctx.db
      .query("classEnrollments")
      .withIndex("by_trainee_and_status", (q) =>
        q.eq("traineeId", args.traineeId).eq("status", "active")
      )
      .filter((q) => q.eq(q.field("classId"), args.classId))
      .first();

    if (existing) {
      throw new Error("Already enrolled in this class");
    }

    // Check class capacity
    const classItem = await ctx.db.get(args.classId);
    if (!classItem) {
      throw new Error("Class not found");
    }

    const activeEnrollments = await ctx.db
      .query("classEnrollments")
      .withIndex("by_class", (q) => q.eq("classId", args.classId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    if (activeEnrollments.length >= classItem.capacity) {
      throw new Error("Class is full");
    }

    // Enroll (NO auto-assignment)
    const enrollmentId = await ctx.db.insert("classEnrollments", {
      classId: args.classId,
      traineeId: args.traineeId,
      enrolledAt: Date.now(),
      status: "active",
    });

    return enrollmentId;
  },
});

// Drop a class (mark enrollment as dropped)
export const dropClass = mutation({
  args: {
    traineeId: v.id("users"),
    classId: v.id("classes"),
  },
  handler: async (ctx, args) => {
    // Find the active enrollment
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
      throw new Error("Not enrolled in this class");
    }

    // Mark as dropped (not cancelled)
    await ctx.db.patch(enrollment._id, {
      status: "dropped", // ← CHANGE FROM "cancelled" TO "dropped"
      droppedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get enrollment stats
export const getEnrollmentStats = query({
  args: { traineeId: v.id("users") },
  handler: async (ctx, args) => {
    const allEnrollments = await ctx.db
      .query("classEnrollments")
      .withIndex("by_trainee", (q) => q.eq("traineeId", args.traineeId))
      .collect();

    return {
      total: allEnrollments.length,
      active: allEnrollments.filter((e) => e.status === "active").length,
      dropped: allEnrollments.filter((e) => e.status === "dropped").length,
    };
  },
});
// Cleanup utility: Remove enrollments for deleted classes or trainees
export const cleanupOrphanedEnrollments = mutation({
  handler: async (ctx) => {
    const allEnrollments = await ctx.db.query("classEnrollments").collect();

    let deletedCount = 0;
    for (const enrollment of allEnrollments) {
      // Check if class exists
      const classItem = await ctx.db.get(enrollment.classId);

      // Check if trainee exists
      const trainee = await ctx.db.get(enrollment.traineeId);

      // Delete if class or trainee no longer exists
      if (!classItem || !trainee) {
        await ctx.db.delete(enrollment._id);
        deletedCount++;
        console.log(`Deleted orphaned enrollment: ${enrollment._id}`);
      }
    }

    return { deletedCount };
  },
});
