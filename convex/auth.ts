import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Register new user
export const register = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    phone: v.optional(v.string()),
    role: v.optional(
      v.union(
        v.literal("super_admin"),
        v.literal("admin"),
        v.literal("trainee")
      )
    ),
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

    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      password: args.password,
      phone: args.phone,
      role: args.role || "trainee",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const user = await ctx.db.get(userId);

    return {
      _id: user!._id,
      name: user!.name,
      email: user!.email,
      role: user!.role,
      profileImage: user!.profileImage,
      assignedAdminId: user!.assignedAdminId,
    };
  },
});

// Login user
export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Handle both password and passwordHash (for old production data)
    // @ts-ignore - accessing potentially old field
    const storedPassword = user.password || user.passwordHash;

    if (!storedPassword) {
      throw new Error(
        "User account is not properly configured. Please contact support."
      );
    }

    if (storedPassword !== args.password) {
      throw new Error("Invalid credentials");
    }

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      assignedAdminId: user.assignedAdminId,
    };
  },
});

// Get current user by ID
export const getCurrentUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      return null;
    }

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      profileImage: user.profileImage,
      assignedAdminId: user.assignedAdminId,
      weeklyGoal: user.weeklyGoal,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      totalWorkouts: user.totalWorkouts,
      joinDate: user.joinDate,
      emergencyContact: user.emergencyContact,
      medicalNotes: user.medicalNotes,
    };
  },
});
