import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all classes with enrollment counts (filtered by instructor for admins)
export const getAllClasses = query({
  args: {
    instructorId: v.optional(v.id("users")),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let classes = await ctx.db
      .query("classes")
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    // Filter by instructor for regular admins
    if (args.role === "admin" && args.instructorId) {
      classes = classes.filter((c) => c.instructorId === args.instructorId);
    }

    // Get enrollment count and instructor details for each class
    const classesWithDetails = [];

    for (const classItem of classes) {
      const instructor = await ctx.db.get(classItem.instructorId);

      // Skip if instructor doesn't exist or isn't an admin/super_admin
      if (
        !instructor ||
        (instructor.role !== "admin" && instructor.role !== "super_admin")
      ) {
        continue;
      }

      const enrollments = await ctx.db
        .query("classEnrollments")
        .withIndex("by_class", (q) => q.eq("classId", classItem._id))
        .filter((q) => q.eq(q.field("status"), "active"))
        .collect();

      classesWithDetails.push({
        ...classItem,
        enrolled: enrollments.length,
        instructorName: instructor.name,
        instructorEmail: instructor.email,
        difficulty: classItem.level, // Map level to difficulty for UI
      });
    }

    return classesWithDetails;
  },
});

// Get classes by instructor
export const getClassesByInstructor = query({
  args: { instructorId: v.id("users") },
  handler: async (ctx, args) => {
    const classes = await ctx.db
      .query("classes")
      .withIndex("by_instructor", (q) =>
        q.eq("instructorId", args.instructorId)
      )
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    const classesWithEnrollments = await Promise.all(
      classes.map(async (classItem) => {
        const enrollments = await ctx.db
          .query("classEnrollments")
          .withIndex("by_class", (q) => q.eq("classId", classItem._id))
          .filter((q) => q.eq(q.field("status"), "active"))
          .collect();

        return {
          ...classItem,
          enrolled: enrollments.length,
        };
      })
    );

    return classesWithEnrollments;
  },
});

// Get single class with details
export const getClassWithDetails = query({
  args: { classId: v.id("classes") },
  handler: async (ctx, args) => {
    const classItem = await ctx.db.get(args.classId);
    if (!classItem) return null;

    const instructor = await ctx.db.get(classItem.instructorId);

    const enrollments = await ctx.db
      .query("classEnrollments")
      .withIndex("by_class", (q) => q.eq("classId", args.classId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    const enrolledTrainees = await Promise.all(
      enrollments.map(async (enrollment) => {
        const trainee = await ctx.db.get(enrollment.traineeId);
        return {
          ...enrollment,
          trainee,
        };
      })
    );

    return {
      ...classItem,
      instructor,
      enrolled: enrollments.length,
      enrolledTrainees,
    };
  },
});

// Create a new class
export const createClass = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    difficulty: v.union(
      v.literal("Beginner"),
      v.literal("Intermediate"),
      v.literal("Advanced")
    ),
    description: v.string(),
    duration: v.number(),
    capacity: v.number(),
    schedule: v.string(),
    instructorId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const classId = await ctx.db.insert("classes", {
      name: args.name,
      type: args.type,
      level: args.difficulty, // Map difficulty to level for schema
      description: args.description,
      duration: args.duration,
      capacity: args.capacity,
      location: args.schedule, // Map schedule to location for schema
      instructorId: args.instructorId,
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(), // ← ADD THIS
    });

    return classId;
  },
});

// Update class
export const updateClass = mutation({
  args: {
    classId: v.id("classes"),
    name: v.optional(v.string()),
    type: v.optional(v.string()),
    description: v.optional(v.string()),
    level: v.optional(v.string()),
    capacity: v.optional(v.number()),
    duration: v.optional(v.number()),
    location: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
  },
  handler: async (ctx, args) => {
    const { classId, ...updates } = args;

    await ctx.db.patch(classId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return classId;
  },
});

// Delete/deactivate class
export const deactivateClass = mutation({
  args: { classId: v.id("classes") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.classId, {
      status: "inactive",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
// Delete classes with invalid instructors (cleanup utility)
export const cleanupOrphanedClasses = mutation({
  handler: async (ctx) => {
    const allClasses = await ctx.db.query("classes").collect();

    let deletedCount = 0;
    for (const classItem of allClasses) {
      const instructor = await ctx.db.get(classItem.instructorId);

      // Delete if instructor doesn't exist or isn't an admin
      if (
        !instructor ||
        (instructor.role !== "admin" && instructor.role !== "super_admin")
      ) {
        await ctx.db.delete(classItem._id);
        deletedCount++;
      }
    }

    return { deletedCount };
  },
});
// Delete a class
export const deleteClass = mutation({
  args: {
    classId: v.id("classes"),
  },
  handler: async (ctx, args) => {
    // Delete the class
    await ctx.db.delete(args.classId);

    // Also delete all enrollments for this class
    const enrollments = await ctx.db
      .query("classEnrollments")
      .withIndex("by_class", (q) => q.eq("classId", args.classId))
      .collect();

    for (const enrollment of enrollments) {
      await ctx.db.delete(enrollment._id);
    }

    return { success: true };
  },
});
