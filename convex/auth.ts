import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Simple password hashing (in production, use proper bcrypt or similar)
function hashPassword(password: string): string {
  // This is a simple hash - in production use bcrypt or argon2
  // For now, we'll store as-is (NOT SECURE FOR PRODUCTION)
  return password; // TODO: Implement proper hashing
}

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
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new Error("Email already registered");
    }

    // Create user
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      password: hashPassword(args.password),
      phone: args.phone,
      role: args.role || "trainee", // Default to trainee
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return userId;
  },
});

// Login user
export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Check password
    if (user.password !== hashPassword(args.password)) {
      throw new Error("Invalid email or password");
    }

    // Return user data (excluding password)
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
});

// Check if email exists
export const checkEmailExists = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    return !!user;
  },
});

// Get current user by ID
export const getCurrentUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
});
