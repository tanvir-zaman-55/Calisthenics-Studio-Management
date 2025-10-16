import { internalMutation } from "./_generated/server";

export const seedDatabase = internalMutation({
  handler: async (ctx) => {
    // Check if data already exists
    const existingUsers = await ctx.db.query("users").collect();
    if (existingUsers.length > 0) {
      return { message: "Database already seeded" };
    }

    const now = Date.now();

    // Create Super Admin
    const superAdminId = await ctx.db.insert("users", {
      name: "Super Admin",
      email: "superadmin@calisthenics.com",
      password: "admin123", // Default password
      phone: "+880 1234 567890",
      role: "super_admin",
      createdAt: now,
      updatedAt: now,
    });

    // Create Admin
    const adminId = await ctx.db.insert("users", {
      name: "Admin User",
      email: "admin@calisthenics.com",
      password: "admin123",
      phone: "+880 1234 567891",
      role: "admin",
      createdAt: now,
      updatedAt: now,
    });

    // Create Trainee
    const traineeId = await ctx.db.insert("users", {
      name: "Ahmed Hassan",
      email: "ahmed@calisthenics.com",
      password: "trainee123",
      phone: "+880 1234 567892",
      role: "trainee",
      assignedAdminId: adminId,
      weeklyGoal: 5,
      createdAt: now,
      updatedAt: now,
    });

    // Create Sample Exercise
    const exerciseId = await ctx.db.insert("exercises", {
      name: "Push-ups",
      category: "Upper Body",
      difficulty: "Beginner",
      primaryMuscles: ["Chest", "Triceps", "Shoulders"],
      equipment: "Bodyweight",
      description: "Classic bodyweight pushing exercise",
      importedFromSheets: false,
      createdBy: adminId,
      createdAt: now,
      updatedAt: now,
    });

    // Create Sample Workout Template
    const templateId = await ctx.db.insert("workoutTemplates", {
      name: "Beginner Upper Body",
      description: "Foundation upper body workout",
      difficulty: "Beginner",
      duration: 45,
      exercises: [
        {
          exerciseId: exerciseId,
          sets: 3,
          reps: "10-12",
          rest: 60,
          notes: "Focus on form",
        },
      ],
      importedFromSheets: false,
      createdBy: adminId,
      createdAt: now,
      updatedAt: now,
    });

    return {
      message: "Database seeded successfully!",
      users: { superAdminId, adminId, traineeId },
      exercises: { exerciseId },
      templates: { templateId },
    };
  },
});
