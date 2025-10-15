import { query } from "./_generated/server";

export const hello = query({
  handler: async () => {
    return {
      message: "✅ Convex is connected!",
      timestamp: Date.now(),
      status: "healthy",
    };
  },
});
