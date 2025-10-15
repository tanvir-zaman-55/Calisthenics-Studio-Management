"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import {
  Plus,
  Search,
  Dumbbell,
  Play,
  Target,
  TrendingUp,
  Zap,
  List,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

interface Exercise {
  _id: Id<"exercises">;
  name: string;
  category: string;
  difficulty: string;
  primaryMuscles: string[];
  equipment: string;
  description: string;
  videoUrl?: string;
}

interface WorkoutExercise {
  exerciseId: Id<"exercises">;
  sets: number;
  reps: string;
  rest: number;
  notes?: string;
}

interface WorkoutTemplate {
  _id: Id<"workoutTemplates">;
  name: string;
  description: string;
  difficulty: string;
  duration: number;
  exercises: WorkoutExercise[];
  createdAt: number;
}

const Workouts = () => {
  const { isAdmin, isSuperAdmin, currentUser } = useAuth();
  const [selectedTab, setSelectedTab] = useState("exercises");
  const [exerciseTab, setExerciseTab] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewTemplateId, setViewTemplateId] =
    useState<Id<"workoutTemplates"> | null>(null); // ← ADD
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false); // ← ADD
  const [assignTemplateId, setAssignTemplateId] =
    useState<Id<"workoutTemplates"> | null>(null); // ← ADD
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false); // ← ADD

  // Load data from Convex (replaces localStorage)
  // Load data from Convex (replaces localStorage)
  const exercises =
    useQuery(
      api.exercises.getAllExercises,
      currentUser
        ? {
            creatorId: currentUser._id,
            role: currentUser.role,
          }
        : "skip"
    ) ?? [];
  const workoutTemplates = useQuery(api.workoutTemplates.getAllTemplates) ?? [];
  const createTemplate = useMutation(api.workoutTemplates.createTemplate);
  const deleteTemplate = useMutation(api.workoutTemplates.deleteTemplate);
  const assignmentStats = useQuery(
    api.workoutAssignments.getAssignmentStats,
    currentUser
      ? {
          adminId: currentUser._id,
          role: currentUser.role,
        }
      : "skip"
  );

  // Query for viewing template details // ← ADD
  const viewTemplate = useQuery(
    api.workoutTemplates.getTemplateWithExercises,
    viewTemplateId ? { templateId: viewTemplateId } : "skip"
  );

  const allTrainees =
    useQuery(api.user.getUsersByRole, { role: "trainee" }) ?? [];

  // Mutations
  const createExercise = useMutation(api.exercises.createExercise);
  const deleteExercise = useMutation(api.exercises.deleteExercise);
  const assignWorkout = useMutation(api.workoutAssignments.assignWorkout);

  // Form state for new exercise
  const [newExercise, setNewExercise] = useState({
    name: "",
    category: "",
    difficulty: "Beginner" as "Beginner" | "Intermediate" | "Advanced",
    equipment: "Bodyweight",
    description: "",
    primaryMuscles: [] as string[],
    videoUrl: "",
  });

  // NEW: Form state for new template
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    difficulty: "Beginner" as "Beginner" | "Intermediate" | "Advanced",
    duration: 45,
    exercises: [] as Array<{
      exerciseId: Id<"exercises">;
      sets: number;
      reps: string;
      rest: number;
      notes?: string;
    }>,
  });

  // NEW: Form state for workout assignment
  const [assignmentForm, setAssignmentForm] = useState({
    traineeId: "" as Id<"users">,
    scheduledDays: [] as string[],
    startDate: Date.now(),
    notes: "",
  });

  // NEW: Temporary exercise being added to template
  const [tempExercise, setTempExercise] = useState({
    exerciseId: "" as Id<"exercises">,
    sets: 3,
    reps: "10-12",
    rest: 60,
    notes: "",
  });

  const handleCreateExercise = async () => {
    if (!currentUser) return;

    try {
      await createExercise({
        name: newExercise.name,
        category: newExercise.category,
        difficulty: newExercise.difficulty,
        equipment: newExercise.equipment,
        description: newExercise.description,
        primaryMuscles: newExercise.primaryMuscles,
        videoUrl: newExercise.videoUrl || undefined,
        createdBy: currentUser._id,
      });

      // Reset form and close dialog
      setNewExercise({
        name: "",
        category: "",
        difficulty: "Beginner",
        equipment: "Bodyweight",
        description: "",
        primaryMuscles: [],
        videoUrl: "",
      });
      setIsDialogOpen(false);

      // Show success message (you can use toast here)
      console.log("Exercise created successfully!");
    } catch (error) {
      console.error("Error creating exercise:", error);
      alert("Failed to create exercise. Please try again.");
    }
  };

  // NEW: Handle create template
  const handleCreateTemplate = async () => {
    if (!currentUser) return;

    if (newTemplate.exercises.length === 0) {
      alert("Please add at least one exercise to the template");
      return;
    }

    try {
      await createTemplate({
        name: newTemplate.name,
        description: newTemplate.description,
        difficulty: newTemplate.difficulty,
        duration: newTemplate.duration,
        exercises: newTemplate.exercises,
        createdBy: currentUser._id,
      });

      // Reset form and close dialog
      setNewTemplate({
        name: "",
        description: "",
        difficulty: "Beginner",
        duration: 45,
        exercises: [],
      });
      setIsTemplateDialogOpen(false);

      console.log("Template created successfully!");
    } catch (error) {
      console.error("Error creating template:", error);
      alert("Failed to create template. Please try again.");
    }
  };

  // NEW: Add exercise to template
  const handleAddExerciseToTemplate = () => {
    if (!tempExercise.exerciseId) {
      alert("Please select an exercise");
      return;
    }

    setNewTemplate({
      ...newTemplate,
      exercises: [...newTemplate.exercises, { ...tempExercise }],
    });

    // Reset temp exercise
    setTempExercise({
      exerciseId: "" as Id<"exercises">,
      sets: 3,
      reps: "10-12",
      rest: 60,
      notes: "",
    });
  };

  // NEW: Remove exercise from template
  const handleRemoveExerciseFromTemplate = (index: number) => {
    setNewTemplate({
      ...newTemplate,
      exercises: newTemplate.exercises.filter((_, i) => i !== index),
    });
  };

  const handleViewTemplate = (templateId: Id<"workoutTemplates">) => {
    setViewTemplateId(templateId);
    setIsViewDialogOpen(true);
  };

  const handleOpenAssignDialog = (templateId: Id<"workoutTemplates">) => {
    setAssignTemplateId(templateId);
    setIsAssignDialogOpen(true);
  };

  const handleAssignWorkout = async () => {
    if (!currentUser || !assignTemplateId) return;

    if (!assignmentForm.traineeId) {
      alert("Please select a trainee");
      return;
    }

    if (assignmentForm.scheduledDays.length === 0) {
      alert("Please select at least one day");
      return;
    }

    try {
      await assignWorkout({
        traineeId: assignmentForm.traineeId,
        templateId: assignTemplateId,
        assignedBy: currentUser._id,
        scheduledDays: assignmentForm.scheduledDays,
        startDate: assignmentForm.startDate,
        notes: assignmentForm.notes,
      });

      // Reset form and close dialog
      setAssignmentForm({
        traineeId: "" as Id<"users">,
        scheduledDays: [],
        startDate: Date.now(),
        notes: "",
      });
      setIsAssignDialogOpen(false);

      alert("Workout assigned successfully!");
    } catch (error) {
      console.error("Error assigning workout:", error);
      alert(
        error instanceof Error ? error.message : "Failed to assign workout"
      );
    }
  };

  const toggleScheduledDay = (day: string) => {
    const days = assignmentForm.scheduledDays;
    if (days.includes(day)) {
      setAssignmentForm({
        ...assignmentForm,
        scheduledDays: days.filter((d) => d !== day),
      });
    } else {
      setAssignmentForm({
        ...assignmentForm,
        scheduledDays: [...days, day],
      });
    }
  };
  // Remove the old useEffect and loadData function

  const difficultyColors = {
    Beginner: "bg-green-500/10 text-green-500",
    Intermediate: "bg-blue-500/10 text-blue-500",
    Advanced: "bg-red-500/10 text-red-500",
  };

  const getExercises = () => {
    if (exercises.length === 0) return [];

    let filtered = exercises;

    // Filter by category
    if (exerciseTab !== "all") {
      filtered = exercises.filter((ex) => {
        const category = ex.category.toLowerCase();
        switch (exerciseTab) {
          case "core":
            return category.includes("core") || category.includes("abs");
          case "upper":
            return (
              category.includes("upper") ||
              category.includes("chest") ||
              category.includes("back") ||
              category.includes("arm") ||
              category.includes("shoulder")
            );
          case "legs":
            return category.includes("leg") || category.includes("lower");
          default:
            return true;
        }
      });
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((ex) =>
        ex.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const displayedExercises = getExercises();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Workout Planning
          </h1>
          <p className="text-muted-foreground mt-1">
            Exercise library and workout templates
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Exercise
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Exercise</DialogTitle>
                  <DialogDescription>
                    Add a new exercise to your library
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Exercise Name</Label>
                    <Input
                      placeholder="e.g., Muscle-up"
                      value={newExercise.name}
                      onChange={(e) =>
                        setNewExercise({ ...newExercise, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        value={newExercise.category}
                        onValueChange={(value) =>
                          setNewExercise({ ...newExercise, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Core">Core</SelectItem>
                          <SelectItem value="Upper Body">Upper Body</SelectItem>
                          <SelectItem value="Legs">Legs</SelectItem>
                          <SelectItem value="Full Body">Full Body</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Difficulty</Label>
                      <Select
                        value={newExercise.difficulty}
                        onValueChange={(
                          value: "Beginner" | "Intermediate" | "Advanced"
                        ) =>
                          setNewExercise({ ...newExercise, difficulty: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">
                            Intermediate
                          </SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Equipment</Label>
                    <Input
                      placeholder="e.g., Bodyweight, Pull-up Bar"
                      value={newExercise.equipment}
                      onChange={(e) =>
                        setNewExercise({
                          ...newExercise,
                          equipment: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Primary Muscles (comma-separated)</Label>
                    <Input
                      placeholder="e.g., Chest, Triceps, Shoulders"
                      value={newExercise.primaryMuscles.join(", ")}
                      onChange={(e) =>
                        setNewExercise({
                          ...newExercise,
                          primaryMuscles: e.target.value
                            .split(",")
                            .map((m) => m.trim()),
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe the exercise and proper form..."
                      rows={3}
                      value={newExercise.description}
                      onChange={(e) =>
                        setNewExercise({
                          ...newExercise,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Video URL (optional)</Label>
                    <Input
                      type="url"
                      placeholder="https://youtube.com/..."
                      value={newExercise.videoUrl}
                      onChange={(e) =>
                        setNewExercise({
                          ...newExercise,
                          videoUrl: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateExercise}
                    disabled={
                      !newExercise.name ||
                      !newExercise.category ||
                      !newExercise.description
                    }
                  >
                    Add Exercise
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Exercises
            </CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exercises.length}</div>
            <p className="text-xs text-muted-foreground mt-1">In library</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Workout Templates
            </CardTitle>
            <List className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workoutTemplates.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Ready to use</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Assignments
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assignmentStats?.activeAssignments ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">To trainees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assignmentStats && assignmentStats.totalAssignments > 0
                ? Math.round(
                    (assignmentStats.completedAssignments /
                      assignmentStats.totalAssignments) *
                      100
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground mt-1">Average rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="exercises">Exercise Library</TabsTrigger>
          <TabsTrigger value="templates">Workout Templates</TabsTrigger>
        </TabsList>

        {/* Exercise Library Tab */}
        <TabsContent value="exercises" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Exercise Library</CardTitle>
                  <CardDescription>
                    Browse exercises by category
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search exercises..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Exercise Type Tabs */}
              <Tabs value={exerciseTab} onValueChange={setExerciseTab}>
                <TabsList className="grid w-full grid-cols-4 mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="core">Core</TabsTrigger>
                  <TabsTrigger value="upper">Upper Body</TabsTrigger>
                  <TabsTrigger value="legs">Legs</TabsTrigger>
                </TabsList>

                {displayedExercises.length > 0 ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {displayedExercises.map((exercise) => (
                      <Card
                        key={exercise._id}
                        className="overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-1">
                                {exercise.name}
                              </h3>
                              <div className="flex gap-2 mb-2">
                                <Badge
                                  className={
                                    difficultyColors[
                                      exercise.difficulty as keyof typeof difficultyColors
                                    ] || difficultyColors.Beginner
                                  }
                                >
                                  {exercise.difficulty}
                                </Badge>
                                <Badge variant="outline">
                                  {exercise.category}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {exercise.videoUrl && (
                                <Button variant="ghost" size="icon">
                                  <Play className="h-4 w-4" />
                                </Button>
                              )}
                              {isAdmin && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={async () => {
                                    if (confirm(`Delete "${exercise.name}"?`)) {
                                      try {
                                        await deleteExercise({
                                          exerciseId: exercise._id,
                                        });
                                        console.log("Exercise deleted!");
                                      } catch (error) {
                                        console.error(
                                          "Error deleting exercise:",
                                          error
                                        );
                                        alert("Failed to delete exercise");
                                      }
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              )}
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground mb-3">
                            {exercise.description}
                          </p>

                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Zap className="h-3 w-3 text-muted-foreground" />
                              <span>{exercise.equipment || "Bodyweight"}</span>
                            </div>
                            {exercise.primaryMuscles &&
                              exercise.primaryMuscles.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <Target className="h-3 w-3 text-muted-foreground" />
                                  <span>{exercise.primaryMuscles[0]}</span>
                                </div>
                              )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {exercises.length === 0
                        ? "No exercises available. Import data from Google Sheets in Settings."
                        : "No exercises found matching your search."}
                    </AlertDescription>
                  </Alert>
                )}
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workout Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Workout Templates</CardTitle>
                  <CardDescription>Pre-built workout programs</CardDescription>
                </div>
                {isAdmin && (
                  <Dialog
                    open={isTemplateDialogOpen}
                    onOpenChange={setIsTemplateDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Template
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Create Workout Template</DialogTitle>
                        <DialogDescription>
                          Build a workout program by adding exercises
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4 pt-4">
                        {/* Basic Info */}
                        <div className="space-y-2">
                          <Label>Template Name</Label>
                          <Input
                            placeholder="e.g., Beginner Full Body"
                            value={newTemplate.name}
                            onChange={(e) =>
                              setNewTemplate({
                                ...newTemplate,
                                name: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            placeholder="Describe this workout program..."
                            rows={2}
                            value={newTemplate.description}
                            onChange={(e) =>
                              setNewTemplate({
                                ...newTemplate,
                                description: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Difficulty</Label>
                            <Select
                              value={newTemplate.difficulty}
                              onValueChange={(
                                value: "Beginner" | "Intermediate" | "Advanced"
                              ) =>
                                setNewTemplate({
                                  ...newTemplate,
                                  difficulty: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Beginner">
                                  Beginner
                                </SelectItem>
                                <SelectItem value="Intermediate">
                                  Intermediate
                                </SelectItem>
                                <SelectItem value="Advanced">
                                  Advanced
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Duration (minutes)</Label>
                            <Input
                              type="number"
                              value={newTemplate.duration}
                              onChange={(e) =>
                                setNewTemplate({
                                  ...newTemplate,
                                  duration: parseInt(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                        </div>

                        <Separator />

                        {/* Add Exercises Section */}
                        <div className="space-y-3">
                          <h3 className="font-semibold">Add Exercises</h3>

                          <div className="space-y-2">
                            <Label>Select Exercise</Label>
                            <Select
                              value={tempExercise.exerciseId}
                              onValueChange={(value: Id<"exercises">) =>
                                setTempExercise({
                                  ...tempExercise,
                                  exerciseId: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Choose an exercise" />
                              </SelectTrigger>
                              <SelectContent>
                                {exercises.map((exercise) => (
                                  <SelectItem
                                    key={exercise._id}
                                    value={exercise._id}
                                  >
                                    {exercise.name} ({exercise.category})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-2">
                              <Label>Sets</Label>
                              <Input
                                type="number"
                                value={tempExercise.sets}
                                onChange={(e) =>
                                  setTempExercise({
                                    ...tempExercise,
                                    sets: parseInt(e.target.value) || 0,
                                  })
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Reps</Label>
                              <Input
                                placeholder="10-12"
                                value={tempExercise.reps}
                                onChange={(e) =>
                                  setTempExercise({
                                    ...tempExercise,
                                    reps: e.target.value,
                                  })
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Rest (sec)</Label>
                              <Input
                                type="number"
                                value={tempExercise.rest}
                                onChange={(e) =>
                                  setTempExercise({
                                    ...tempExercise,
                                    rest: parseInt(e.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Notes (optional)</Label>
                            <Input
                              placeholder="Form cues, tempo, etc."
                              value={tempExercise.notes}
                              onChange={(e) =>
                                setTempExercise({
                                  ...tempExercise,
                                  notes: e.target.value,
                                })
                              }
                            />
                          </div>

                          <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={handleAddExerciseToTemplate}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add to Template
                          </Button>
                        </div>

                        <Separator />

                        {/* Exercise List */}
                        <div className="space-y-2">
                          <h3 className="font-semibold">
                            Exercises in Template (
                            {newTemplate.exercises.length})
                          </h3>

                          {newTemplate.exercises.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              No exercises added yet
                            </p>
                          ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {newTemplate.exercises.map((ex, index) => {
                                const exercise = exercises.find(
                                  (e) => e._id === ex.exerciseId
                                );
                                return (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between p-2 border rounded text-sm"
                                  >
                                    <div className="flex-1">
                                      <div className="font-medium">
                                        {exercise?.name}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {ex.sets} sets × {ex.reps} reps •{" "}
                                        {ex.rest}s rest
                                        {ex.notes && ` • ${ex.notes}`}
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleRemoveExerciseFromTemplate(index)
                                      }
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsTemplateDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleCreateTemplate}
                          disabled={
                            !newTemplate.name ||
                            !newTemplate.description ||
                            newTemplate.exercises.length === 0
                          }
                        >
                          Create Template
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {workoutTemplates.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {workoutTemplates.map((template) => (
                    <Card
                      key={template._id}
                      className="overflow-hidden hover:shadow-md transition-shadow border-2"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">
                              {template.name}
                            </CardTitle>
                            <CardDescription>
                              {template.description}
                            </CardDescription>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge
                                className={
                                  difficultyColors[
                                    template.difficulty as keyof typeof difficultyColors
                                  ] || difficultyColors.Beginner
                                }
                              >
                                {template.difficulty}
                              </Badge>
                            </div>
                          </div>
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={async () => {
                                if (
                                  confirm(`Delete template "${template.name}"?`)
                                ) {
                                  try {
                                    await deleteTemplate({
                                      templateId: template._id,
                                    });
                                    console.log("Template deleted!");
                                  } catch (error) {
                                    console.error(
                                      "Error deleting template:",
                                      error
                                    );
                                    alert("Failed to delete template");
                                  }
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-2 text-sm mb-4">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              Duration
                            </span>
                            <span className="font-medium">
                              {template.duration} min
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              Exercises
                            </span>
                            <span className="font-medium">
                              {template.exercises?.length || 0}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleViewTemplate(template._id)}
                          >
                            View
                          </Button>
                          {isAdmin && (
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() =>
                                handleOpenAssignDialog(template._id)
                              }
                            >
                              Assign
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No workout templates available. Import data from Google
                    Sheets in Settings.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewTemplate?.name}</DialogTitle>
            <DialogDescription>{viewTemplate?.description}</DialogDescription>
          </DialogHeader>

          {viewTemplate && (
            <div className="space-y-4 pt-4">
              {/* Template Info */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground">
                    Difficulty
                  </div>
                  <Badge
                    className={
                      difficultyColors[
                        viewTemplate.difficulty as keyof typeof difficultyColors
                      ]
                    }
                  >
                    {viewTemplate.difficulty}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                  <div className="font-semibold">
                    {viewTemplate.duration} min
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Exercises</div>
                  <div className="font-semibold">
                    {viewTemplate.exercisesWithDetails?.length || 0}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Exercise List */}
              <div className="space-y-3">
                <h3 className="font-semibold">Exercises</h3>
                {viewTemplate.exercisesWithDetails?.map((item, index) => {
                  const exercise = item.exerciseDetails;
                  if (!exercise) return null;

                  return (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{exercise.name}</h4>
                              <Badge variant="secondary" className="text-xs">
                                {exercise.difficulty}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {exercise.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {exercise.description}
                            </p>
                            <div className="flex gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">
                                  Sets:
                                </span>{" "}
                                <span className="font-medium">{item.sets}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Reps:
                                </span>{" "}
                                <span className="font-medium">{item.reps}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Rest:
                                </span>{" "}
                                <span className="font-medium">
                                  {item.rest}s
                                </span>
                              </div>
                            </div>
                            {item.notes && (
                              <div className="mt-2 text-sm italic text-muted-foreground">
                                Note: {item.notes}
                              </div>
                            )}
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <Zap className="h-3 w-3" />
                              <span>{exercise.equipment}</span>
                              {exercise.primaryMuscles &&
                                exercise.primaryMuscles.length > 0 && (
                                  <>
                                    <span>•</span>
                                    <Target className="h-3 w-3" />
                                    <span>
                                      {exercise.primaryMuscles.join(", ")}
                                    </span>
                                  </>
                                )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Workout</DialogTitle>
            <DialogDescription>
              Assign this workout to a trainee with a schedule
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            {/* Select Trainee */}
            <div className="space-y-2">
              <Label>Select Trainee</Label>
              <Select
                value={assignmentForm.traineeId}
                onValueChange={(value: Id<"users">) =>
                  setAssignmentForm({ ...assignmentForm, traineeId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a trainee" />
                </SelectTrigger>
                <SelectContent>
                  {allTrainees.map((trainee) => (
                    <SelectItem key={trainee._id} value={trainee._id}>
                      {trainee.name} ({trainee.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {allTrainees.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No trainees available. Add trainees in the Clients page.
                </p>
              )}
            </div>

            {/* Schedule Days */}
            <div className="space-y-2">
              <Label>Schedule (Select Days)</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={day}
                      checked={assignmentForm.scheduledDays.includes(day)}
                      onCheckedChange={() => toggleScheduledDay(day)}
                    />
                    <label
                      htmlFor={day}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {day}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="Any special instructions or modifications..."
                rows={3}
                value={assignmentForm.notes}
                onChange={(e) =>
                  setAssignmentForm({
                    ...assignmentForm,
                    notes: e.target.value,
                  })
                }
              />
            </div>

            {/* Selected Days Preview */}
            {assignmentForm.scheduledDays.length > 0 && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium mb-1">
                  Schedule Summary:
                </div>
                <div className="text-sm text-muted-foreground">
                  {assignmentForm.scheduledDays.join(", ")}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAssignDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignWorkout}
              disabled={
                !assignmentForm.traineeId ||
                assignmentForm.scheduledDays.length === 0
              }
            >
              Assign Workout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Workouts;
