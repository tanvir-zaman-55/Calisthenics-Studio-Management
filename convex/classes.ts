import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all classes with enrollment counts
// Get all classes with enrollment counts (filtered by instructor for admins)
export const getAllClasses = query({
  args: {
    instructorId: v.optional(v.id("users")),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let classesQuery = ctx.db
      .query("classes")
      .filter((q) => q.eq(q.field("status"), "active"));

    // If regular admin (not super admin), filter to only their classes
    let classes = await classesQuery.collect();

    if (args.role === "admin" && args.instructorId) {
      classes = classes.filter((c) => c.instructorId === args.instructorId);
    }

    // Get enrollment count for each class
    const classesWithEnrollments = await Promise.all(
      classes.map(async (classItem) => {
        const enrollments = await ctx.db
          .query("classEnrollments")
          .withIndex("by_class", (q) => q.eq("classId", classItem._id))
          .filter((q) => q.eq(q.field("status"), "active"))
          .collect();

        const instructor = await ctx.db.get(classItem.instructorId);

        return {
          ...classItem,
          enrolled: enrollments.length,
          instructorName: instructor?.name,
        };
      })
    );

    return classesWithEnrollments;
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

// Create new class
export const createClass = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    description: v.string(),
    level: v.string(),
    capacity: v.number(),
    duration: v.number(),
    instructorId: v.id("users"),
    location: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const classId = await ctx.db.insert("classes", {
      name: args.name,
      type: args.type,
      description: args.description,
      level: args.level,
      capacity: args.capacity,
      duration: args.duration,
      instructorId: args.instructorId,
      location: args.location,
      status: "active",
      createdAt: now,
      updatedAt: now,
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
