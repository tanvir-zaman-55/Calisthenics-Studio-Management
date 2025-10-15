import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // 1. USERS TABLE - All user types (Super Admin, Admin, Trainee)
  users: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    role: v.union(
      v.literal("super_admin"),
      v.literal("admin"),
      v.literal("trainee")
    ),
    status: v.union(v.literal("active"), v.literal("inactive")),
    passwordHash: v.string(),
    joinedAt: v.number(),
    profileImage: v.optional(v.string()),
    // Trainee-specific
    assignedAdminId: v.optional(v.id("users")),
    weeklyGoal: v.optional(v.number()),
    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_assigned_admin", ["assignedAdminId"]),

  // 2. EXERCISES TABLE - Exercise library
  exercises: defineTable({
    name: v.string(),
    category: v.string(),
    difficulty: v.union(
      v.literal("Beginner"),
      v.literal("Intermediate"),
      v.literal("Advanced")
    ),
    primaryMuscles: v.array(v.string()),
    equipment: v.string(),
    description: v.string(),
    videoUrl: v.optional(v.string()),
    videoStorageId: v.optional(v.string()),
    imageStorageId: v.optional(v.string()),
    importedFromSheets: v.boolean(),
    sheetRowId: v.optional(v.string()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_difficulty", ["difficulty"])
    .index("by_imported", ["importedFromSheets"]),

  // 3. WORKOUT TEMPLATES TABLE
  workoutTemplates: defineTable({
    name: v.string(),
    description: v.string(),
    difficulty: v.union(
      v.literal("Beginner"),
      v.literal("Intermediate"),
      v.literal("Advanced")
    ),
    duration: v.number(),
    exercises: v.array(
      v.object({
        exerciseId: v.id("exercises"),
        sets: v.number(),
        reps: v.string(),
        rest: v.number(),
        notes: v.optional(v.string()),
      })
    ),
    importedFromSheets: v.boolean(),
    sheetRowId: v.optional(v.string()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_difficulty", ["difficulty"])
    .index("by_created_by", ["createdBy"]),

  // 4. WORKOUT ASSIGNMENTS TABLE - Admin assigns workouts to trainees
  workoutAssignments: defineTable({
    traineeId: v.id("users"),
    templateId: v.id("workoutTemplates"),
    assignedBy: v.id("users"),
    assignedAt: v.number(),
    scheduledDays: v.array(v.string()),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    notes: v.optional(v.string()),
  })
    .index("by_trainee", ["traineeId"])
    .index("by_template", ["templateId"])
    .index("by_trainee_and_status", ["traineeId", "status"]),

  // 5. WORKOUT LOGS TABLE - Trainee workout completions
  workoutLogs: defineTable({
    traineeId: v.id("users"),
    assignmentId: v.optional(v.id("workoutAssignments")),
    templateId: v.id("workoutTemplates"),
    completedAt: v.number(),
    duration: v.number(),
    completedExercises: v.array(v.id("exercises")),
    notes: v.string(),
    exerciseDetails: v.optional(
      v.array(
        v.object({
          exerciseId: v.id("exercises"),
          setsCompleted: v.number(),
          repsCompleted: v.array(v.number()),
          weight: v.optional(v.number()),
          notes: v.optional(v.string()),
        })
      )
    ),
  })
    .index("by_trainee", ["traineeId"])
    .index("by_assignment", ["assignmentId"])
    .index("by_date", ["completedAt"]),

  // 6. CLASSES TABLE
  classes: defineTable({
    name: v.string(),
    type: v.string(),
    description: v.string(),
    level: v.string(),
    capacity: v.number(),
    duration: v.number(),
    instructorId: v.id("users"),
    location: v.string(),
    status: v.union(v.literal("active"), v.literal("inactive")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_instructor", ["instructorId"])
    .index("by_status", ["status"]),

  // 7. CLASS SCHEDULE TABLE
  classSchedule: defineTable({
    classId: v.id("classes"),
    dayOfWeek: v.union(
      v.literal("Monday"),
      v.literal("Tuesday"),
      v.literal("Wednesday"),
      v.literal("Thursday"),
      v.literal("Friday"),
      v.literal("Saturday"),
      v.literal("Sunday")
    ),
    startTime: v.string(),
    endTime: v.string(),
    effectiveFrom: v.number(),
    effectiveUntil: v.optional(v.number()),
  })
    .index("by_class", ["classId"])
    .index("by_day", ["dayOfWeek"]),

  // 8. CLASS ENROLLMENTS TABLE
  classEnrollments: defineTable({
    classId: v.id("classes"),
    traineeId: v.id("users"),
    enrolledAt: v.number(),
    status: v.union(v.literal("active"), v.literal("dropped")),
    droppedAt: v.optional(v.number()),
  })
    .index("by_class", ["classId"])
    .index("by_trainee", ["traineeId"])
    .index("by_trainee_and_status", ["traineeId", "status"]),

  // 9. ATTENDANCE TABLE
  attendance: defineTable({
    classId: v.id("classes"),
    traineeId: v.id("users"),
    scheduleDate: v.number(),
    status: v.union(
      v.literal("present"),
      v.literal("absent"),
      v.literal("late")
    ),
    markedAt: v.number(),
    markedBy: v.id("users"),
    notes: v.optional(v.string()),
  })
    .index("by_class", ["classId"])
    .index("by_trainee", ["traineeId"])
    .index("by_date", ["scheduleDate"]),

  // 10. PROGRESS MEASUREMENTS TABLE
  progressMeasurements: defineTable({
    traineeId: v.id("users"),
    measurementType: v.union(
      v.literal("body_weight"),
      v.literal("body_fat"),
      v.literal("personal_record"),
      v.literal("measurement")
    ),
    weight: v.optional(v.number()),
    bodyFat: v.optional(v.number()),
    measurementName: v.optional(v.string()),
    measurementValue: v.optional(v.number()),
    measurementUnit: v.optional(v.string()),
    exerciseId: v.optional(v.id("exercises")),
    prValue: v.optional(v.string()),
    prNotes: v.optional(v.string()),
    recordedAt: v.number(),
    notes: v.optional(v.string()),
  })
    .index("by_trainee", ["traineeId"])
    .index("by_type", ["measurementType"])
    .index("by_trainee_and_type", ["traineeId", "measurementType"]),

  // 11. GOOGLE SHEETS SYNC LOG
  sheetsSyncLog: defineTable({
    syncType: v.union(v.literal("exercises"), v.literal("templates")),
    status: v.union(v.literal("success"), v.literal("failed")),
    itemsImported: v.number(),
    errorMessage: v.optional(v.string()),
    syncedBy: v.id("users"),
    syncedAt: v.number(),
  }).index("by_sync_type", ["syncType"]),
});
