// src/services/googleSheetsService.ts
// Google Sheets API Integration Service

interface Exercise {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  sets: string;
  reps: string;
  duration: string;
  description: string;
  videoUrl: string;
}

interface WorkoutTemplate {
  id: string;
  name: string;
  type: string;
  duration: string;
  difficulty: string;
  exerciseIds: string[];
  description: string;
}

interface ClientProgress {
  date: string;
  clientId: string;
  clientName: string;
  workoutId: string;
  workoutName: string;
  completionPercentage: number;
  exercisesCompleted: string;
  timeSpent: string;
  notes: string;
}

class GoogleSheetsService {
  private sheetId: string;

  constructor() {
    // Get sheet ID from environment or local storage
    this.sheetId = localStorage.getItem("google_sheet_id") || "";
  }

  setSheetId(sheetId: string) {
    this.sheetId = sheetId;
    localStorage.setItem("google_sheet_id", sheetId);
  }

  // Test connection to Google Sheets
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.fetchSheetData("Exercises", "A1:A2");
      return response !== null;
    } catch (error) {
      console.error("Connection test failed:", error);
      return false;
    }
  }

  // Generic function to fetch data from sheet
  private async fetchSheetData(
    sheetName: string,
    range: string
  ): Promise<any[][]> {
    if (!this.sheetId) {
      throw new Error("Sheet ID not configured");
    }

    try {
      // Using Google Sheets API v4 public endpoint
      const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/${sheetName}!${range}?key=${apiKey}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.values || [];
    } catch (error) {
      console.error("Error fetching sheet data:", error);
      throw error;
    }
  }

  // Import exercises from Google Sheets
  async importExercises(): Promise<Exercise[]> {
    try {
      const data = await this.fetchSheetData("Exercises", "A2:I1000");

      const exercises: Exercise[] = data.map((row) => ({
        id: row[0] || "",
        name: row[1] || "",
        category: row[2] || "",
        difficulty: row[3] || "",
        sets: row[4] || "",
        reps: row[5] || "",
        duration: row[6] || "",
        description: row[7] || "",
        videoUrl: row[8] || "",
      }));

      // Store in local storage for offline access
      localStorage.setItem("imported_exercises", JSON.stringify(exercises));

      return exercises;
    } catch (error) {
      console.error("Error importing exercises:", error);
      throw error;
    }
  }

  // Import workout templates from Google Sheets
  async importWorkoutTemplates(): Promise<WorkoutTemplate[]> {
    try {
      const data = await this.fetchSheetData("WorkoutTemplates", "A2:G1000");

      const templates: WorkoutTemplate[] = data.map((row) => ({
        id: row[0] || "",
        name: row[1] || "",
        type: row[2] || "",
        duration: row[3] || "",
        difficulty: row[4] || "",
        exerciseIds: (row[5] || "").split(",").map((id: string) => id.trim()),
        description: row[6] || "",
      }));

      // Store in local storage
      localStorage.setItem(
        "imported_workout_templates",
        JSON.stringify(templates)
      );

      return templates;
    } catch (error) {
      console.error("Error importing workout templates:", error);
      throw error;
    }
  }

  // Export client progress to Google Sheets
  async exportClientProgress(progress: ClientProgress): Promise<boolean> {
    try {
      // This requires write access which needs server-side implementation
      // For now, we'll store locally and show a manual export option

      const existingProgress = this.getStoredProgress();
      existingProgress.push(progress);
      localStorage.setItem(
        "client_progress_export",
        JSON.stringify(existingProgress)
      );

      console.log(
        "Progress stored locally. Use manual export to sync with sheets."
      );
      return true;
    } catch (error) {
      console.error("Error exporting progress:", error);
      return false;
    }
  }

  // Get stored progress for manual export
  getStoredProgress(): ClientProgress[] {
    const stored = localStorage.getItem("client_progress_export");
    return stored ? JSON.parse(stored) : [];
  }

  // Generate CSV for manual export
  generateProgressCSV(): string {
    const progress = this.getStoredProgress();

    const headers = [
      "Date",
      "Client ID",
      "Client Name",
      "Workout ID",
      "Workout Name",
      "Completion %",
      "Exercises Completed",
      "Time Spent",
      "Notes",
    ];

    const rows = progress.map((p) => [
      p.date,
      p.clientId,
      p.clientName,
      p.workoutId,
      p.workoutName,
      p.completionPercentage.toString(),
      p.exercisesCompleted,
      p.timeSpent,
      p.notes,
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
      "\n"
    );

    return csv;
  }

  // Download CSV file
  downloadProgressCSV() {
    const csv = this.generateProgressCSV();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `client-progress-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  // Get cached exercises
  getCachedExercises(): Exercise[] {
    const stored = localStorage.getItem("imported_exercises");
    return stored ? JSON.parse(stored) : [];
  }

  // Get cached workout templates
  getCachedWorkoutTemplates(): WorkoutTemplate[] {
    const stored = localStorage.getItem("imported_workout_templates");
    return stored ? JSON.parse(stored) : [];
  }

  // Clear all cached data
  clearCache() {
    localStorage.removeItem("imported_exercises");
    localStorage.removeItem("imported_workout_templates");
    localStorage.removeItem("client_progress_export");
  }
}

export const googleSheetsService = new GoogleSheetsService();
export type { Exercise, WorkoutTemplate, ClientProgress };
