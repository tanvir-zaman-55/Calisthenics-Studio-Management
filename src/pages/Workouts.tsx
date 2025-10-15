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
  const [searchQuery, setSearchQuery] = useState("");

  // Load data from Convex (replaces localStorage)
  const exercises = useQuery(api.exercises.getAllExercises) ?? [];
  const workoutTemplates = useQuery(api.workoutTemplates.getAllTemplates) ?? [];

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
                    <Input placeholder="e.g., Muscle-up" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="core">Core</SelectItem>
                          <SelectItem value="upper">Upper Body</SelectItem>
                          <SelectItem value="legs">Legs</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Difficulty</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">
                            Intermediate
                          </SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe the exercise and proper form..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Video URL (optional)</Label>
                    <Input type="url" placeholder="https://youtube.com/..." />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={() => setIsDialogOpen(false)}>
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
            <div className="text-2xl font-bold">-</div>
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
            <div className="text-2xl font-bold">-</div>
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
                            {exercise.videoUrl && (
                              <Button variant="ghost" size="icon">
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
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
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
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
                          >
                            View
                          </Button>
                          {isAdmin && (
                            <Button size="sm" className="flex-1">
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
    </div>
  );
};

export default Workouts;
