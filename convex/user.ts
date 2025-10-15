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
      phone: args.phone,
      role: args.role,
      status: "active",
      passwordHash: "temp_hash_" + now, // Temporary
      joinedAt: now,
      assignedAdminId: args.assignedAdminId,
      weeklyGoal: args.weeklyGoal,
      createdAt: now,
      updatedAt: now,
    });

    return userId;
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

// Simple login (temporary - just checks if user exists)
export const simpleLogin = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    if (user.status === "inactive") {
      throw new Error("User account is inactive");
    }

    return {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  },
});
