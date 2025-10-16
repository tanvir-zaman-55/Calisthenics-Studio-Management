import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get user by email
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    return user;
  },
});

// Get user by ID
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Get all users (for Super Admin)
export const getAllUsers = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

// Get users by role
export const getUsersByRole = query({
  args: {
    role: v.union(
      v.literal("super_admin"),
      v.literal("admin"),
      v.literal("trainee")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", args.role))
      .collect();
  },
});

// Get trainees assigned to an admin
export const getTraineesByAdmin = query({
  args: { adminId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_assigned_admin", (q) =>
        q.eq("assignedAdminId", args.adminId)
      )
      .collect();
  },
});

// Create new user (for admins creating trainees)
export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    role: v.union(
      v.literal("super_admin"),
      v.literal("admin"),
      v.literal("trainee")
    ),
    assignedAdminId: v.optional(v.id("users")),
    weeklyGoal: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check if email already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      throw new Error("User with this email already exists");
    }

    const now = Date.now();

    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      password: "temp123", // Temporary password - user should change
      phone: args.phone,
      role: args.role,
      assignedAdminId: args.assignedAdminId,
      weeklyGoal: args.weeklyGoal,
      createdAt: now,
      updatedAt: now,
    });

    return userId;
  },
});
// Get trainees with no assigned admin
export const getUnassignedTrainees = query({
  handler: async (ctx) => {
    const trainees = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "trainee"))
      .collect();

    // Filter to only unassigned
    return trainees.filter((t) => !t.assignedAdminId);
  },
});

// Claim an unassigned trainee
export const claimTrainee = mutation({
  args: {
    traineeId: v.id("users"),
    adminId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const trainee = await ctx.db.get(args.traineeId);
    if (!trainee || trainee.role !== "trainee") {
      throw new Error("Invalid trainee");
    }

    if (trainee.assignedAdminId) {
      throw new Error("Trainee already assigned to another admin");
    }

    await ctx.db.patch(args.traineeId, {
      assignedAdminId: args.adminId,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
// Update user
export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
    weeklyGoal: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;

    await ctx.db.patch(userId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return userId;
  },
});
// Check if user exists by email
export const checkUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) return null;

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      assignedAdminId: user.assignedAdminId,
    };
  },
});

// Assign existing trainee to admin
export const assignExistingTrainee = mutation({
  args: {
    traineeId: v.id("users"),
    adminId: v.id("users"),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const trainee = await ctx.db.get(args.traineeId);
    if (!trainee) {
      throw new Error("User not found");
    }

    if (trainee.role !== "trainee") {
      throw new Error("User is not a trainee");
    }

    // Update trainee with new admin and optional phone
    await ctx.db.patch(args.traineeId, {
      assignedAdminId: args.adminId,
      ...(args.phone && { phone: args.phone }),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
