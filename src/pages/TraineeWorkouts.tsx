"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  Play,
  Clock,
  Target,
  Calendar,
  CheckCircle2,
  Circle,
  Dumbbell,
  AlertCircle,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useAuth } from "@/context/AuthContext";

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
  assignmentId?: Id<"workoutAssignments">;
  assignedByName?: string;
  scheduledDays?: string[];
  assignmentNotes?: string;
}

export default function TraineeWorkouts() {
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutTemplate | null>(
    null
  );
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<
    Set<Id<"exercises">>
  >(new Set());
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [workoutStartTime, setWorkoutStartTime] = useState<number | null>(null);

  const { currentUser } = useAuth();

  // Get assignments for this trainee
  const myAssignments =
    useQuery(
      api.workoutAssignments.getTraineeAssignments,
      currentUser ? { traineeId: currentUser._id } : "skip"
    ) ?? [];

  // Extract templates from assignments
  const workoutTemplates: WorkoutTemplate[] = myAssignments
    .filter((assignment) => assignment.template)
    .map((assignment) => ({
      ...assignment.template!,
      assignmentId: assignment._id,
      assignedByName: assignment.assignedByName,
      scheduledDays: assignment.scheduledDays,
      assignmentNotes: assignment.notes,
    }));

  // Load workout logs
  const workoutLogs =
    useQuery(
      api.workoutLogs.getTraineeWorkoutLogs,
      currentUser ? { traineeId: currentUser._id } : "skip"
    ) ?? [];

  const workoutStats = useQuery(
    api.workoutLogs.getWorkoutStats,
    currentUser ? { traineeId: currentUser._id } : "skip"
  );

  const logWorkout = useMutation(api.workoutLogs.logWorkout);

  const getExerciseById = (id: Id<"exercises">): Exercise | undefined => {
    // Get exercise from assignment templates
    for (const assignment of myAssignments) {
      if (assignment?.template?.exercisesWithDetails) {
        const found = assignment.template.exercisesWithDetails.find(
          (ex) => ex.exerciseDetails?._id === id
        );
        if (found?.exerciseDetails) {
          return found.exerciseDetails;
        }
      }
    }
    return undefined;
  };

  const startWorkout = (template: WorkoutTemplate) => {
    setCurrentWorkout(template);
    setIsWorkoutActive(true);
    setCompletedExercises(new Set());
    setWorkoutNotes("");
    setWorkoutStartTime(Date.now());
  };

  const toggleExerciseCompletion = (exerciseId: Id<"exercises">) => {
    const newCompleted = new Set(completedExercises);
    if (newCompleted.has(exerciseId)) {
      newCompleted.delete(exerciseId);
    } else {
      newCompleted.add(exerciseId);
    }
    setCompletedExercises(newCompleted);
  };

  const completeWorkout = async () => {
    if (!currentWorkout || !workoutStartTime || !currentUser) return;

    const duration = Math.floor((Date.now() - workoutStartTime) / 1000 / 60);

    try {
      await logWorkout({
        traineeId: currentUser._id,
        templateId: currentWorkout._id,
        completedExercises: Array.from(completedExercises),
        duration,
        notes: workoutNotes,
      });

      alert("Workout logged successfully!");

      setIsWorkoutActive(false);
      setCompletedExercises(new Set());
      setWorkoutNotes("");
      setWorkoutStartTime(null);
    } catch (error) {
      console.error("Error logging workout:", error);
      alert("Failed to log workout");
    }
  };

  const calculateProgress = () => {
    if (!currentWorkout) return 0;
    const total = currentWorkout.exercises?.length || 0;
    const completed = completedExercises.size;
    return total > 0 ? (completed / total) * 100 : 0;
  };

  const getRecentWorkouts = () => {
    return workoutLogs
      .sort((a, b) => b.completedAt - a.completedAt)
      .slice(0, 5);
  };

  const getTodaysWorkout = (): WorkoutTemplate | null => {
    return workoutTemplates.length > 0 ? workoutTemplates[0] : null;
  };

  const getWeeklyStats = () => {
    return {
      workoutsCompleted: workoutStats?.workoutsThisWeek ?? 0,
      totalMinutes: workoutStats?.totalMinutes ?? 0,
      averageCompletion: 100,
    };
  };

  if (workoutTemplates.length === 0) {
    return (
      <div className="p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">My Workouts</h1>
          <p className="text-muted-foreground mt-1">
            Track your progress and complete your training
          </p>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No workouts available yet. Your trainer will assign workouts to you
            soon.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const todaysWorkout = getTodaysWorkout();
  const weeklyStats = getWeeklyStats();

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">My Workouts</h1>
        <p className="text-muted-foreground mt-1">
          Track your progress and complete your training
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Workouts This Week
            </CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {weeklyStats.workoutsCompleted}
            </div>
            <p className="text-xs text-muted-foreground">
              Keep up the momentum!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Minutes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyStats.totalMinutes}</div>
            <p className="text-xs text-muted-foreground">
              Time invested in training
            </p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Completion
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {weeklyStats.averageCompletion}%
            </div>
            <p className="text-xs text-muted-foreground">
              Exercise completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="all">All Programs</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          {isWorkoutActive && currentWorkout ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Play className="h-5 w-5 text-green-500" />
                      Workout in Progress
                    </CardTitle>
                    <CardDescription>{currentWorkout.name}</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-green-500">
                    <Circle className="h-2 w-2 fill-current mr-1" />
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>
                      {completedExercises.size} /{" "}
                      {currentWorkout.exercises?.length || 0} exercises
                    </span>
                  </div>
                  <Progress value={calculateProgress()} />
                </div>

                <div className="space-y-3">
                  {(currentWorkout.exercises || []).map((workoutEx) => {
                    const exercise = getExerciseById(workoutEx.exerciseId);
                    if (!exercise) return null;

                    const isCompleted = completedExercises.has(exercise._id);

                    return (
                      <Card
                        key={exercise._id}
                        className={isCompleted ? "bg-muted/50" : ""}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={isCompleted}
                              onCheckedChange={() =>
                                toggleExerciseCompletion(exercise._id)
                              }
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="font-medium break-words">
                                  {exercise.name}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {exercise.difficulty}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <div>
                                  {workoutEx.sets} sets × {workoutEx.reps} reps
                                </div>
                                <div>Rest: {workoutEx.rest}s</div>
                                {workoutEx.notes && (
                                  <div className="text-xs italic">
                                    {workoutEx.notes}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Workout Notes</label>
                  <Textarea
                    placeholder="How did the workout feel? Any notes for next time..."
                    value={workoutNotes}
                    onChange={(e) => setWorkoutNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 flex-col sm:flex-row">
                  <Button
                    onClick={completeWorkout}
                    className="flex-1"
                    disabled={completedExercises.size === 0}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Complete Workout
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsWorkoutActive(false);
                      setCompletedExercises(new Set());
                      setWorkoutStartTime(null);
                    }}
                    className="sm:w-auto"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {todaysWorkout ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      <CardTitle>Today's Workout</CardTitle>
                    </div>
                    <CardDescription>
                      {todaysWorkout.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-sm flex-wrap">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{todaysWorkout.duration} min</span>
                        </div>
                        <Badge>{todaysWorkout.difficulty}</Badge>
                        <Badge variant="outline">
                          {todaysWorkout.exercises?.length || 0} exercises
                        </Badge>
                      </div>

                      {todaysWorkout.scheduledDays &&
                        todaysWorkout.scheduledDays.length > 0 && (
                          <div className="flex items-start gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-xs text-muted-foreground mb-1">
                                Scheduled Days:
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {todaysWorkout.scheduledDays.map((day) => (
                                  <Badge
                                    key={day}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {day}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                      {todaysWorkout.assignmentNotes && (
                        <div className="flex items-start gap-2 text-sm p-2 bg-muted rounded">
                          <AlertCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-xs mb-0.5">
                              Trainer Notes:
                            </div>
                            <div className="text-muted-foreground break-words">
                              {todaysWorkout.assignmentNotes}
                            </div>
                          </div>
                        </div>
                      )}

                      {todaysWorkout.assignedByName && (
                        <div className="text-xs text-muted-foreground">
                          Assigned by {todaysWorkout.assignedByName}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="font-medium text-sm">Exercises:</div>
                      <div className="space-y-1">
                        {(todaysWorkout.exercises || [])
                          .slice(0, 3)
                          .map((workoutEx) => {
                            const exercise = getExerciseById(
                              workoutEx.exerciseId
                            );
                            if (!exercise) return null;
                            return (
                              <div
                                key={exercise._id}
                                className="text-sm text-muted-foreground break-words"
                              >
                                • {exercise.name} - {workoutEx.sets}×
                                {workoutEx.reps}
                              </div>
                            );
                          })}
                        {(todaysWorkout.exercises || []).length > 3 && (
                          <div className="text-sm text-muted-foreground">
                            + {(todaysWorkout.exercises || []).length - 3} more
                            exercises
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={() => startWorkout(todaysWorkout)}
                      className="w-full"
                      size="lg"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Workout
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No workout scheduled for today. Check your program or
                    contact your trainer.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {workoutTemplates.map((template) => (
              <Card key={template._id}>
                <CardHeader>
                  <CardTitle className="break-words">{template.name}</CardTitle>
                  <CardDescription className="break-words">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4 text-sm flex-wrap">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{template.duration} min</span>
                      </div>
                      <Badge>{template.difficulty}</Badge>
                      <Badge variant="outline">
                        {template.exercises?.length || 0} exercises
                      </Badge>
                    </div>

                    {template.scheduledDays &&
                      template.scheduledDays.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {template.scheduledDays.join(", ")}
                        </div>
                      )}
                  </div>

                  <Button
                    onClick={() => startWorkout(template)}
                    className="w-full"
                    variant={
                      currentWorkout?._id === template._id
                        ? "default"
                        : "outline"
                    }
                    disabled={isWorkoutActive}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {isWorkoutActive
                      ? "Finish current workout first"
                      : "Start Workout"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {getRecentWorkouts().length > 0 ? (
            <div className="space-y-3">
              {getRecentWorkouts().map((log) => {
                const workout = workoutTemplates.find(
                  (w) => w._id === log.templateId
                );
                if (!workout) return null;

                const completionRate = Math.round(
                  (log.completedExercises.length /
                    (workout.exercises?.length || 1)) *
                    100
                );

                return (
                  <Card key={log._id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="font-medium break-words">
                            {workout.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(log.completedAt).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm flex-wrap">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {log.duration} min
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              {completionRate}% complete
                            </span>
                          </div>
                          {log.notes && (
                            <p className="text-sm text-muted-foreground italic mt-2 break-words">
                              "{log.notes}"
                            </p>
                          )}
                        </div>
                        <Badge
                          variant={
                            completionRate === 100 ? "default" : "secondary"
                          }
                          className="flex-shrink-0"
                        >
                          {log.completedExercises.length}/
                          {workout.exercises?.length || 0}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No workout history yet. Complete your first workout to see it
                here!
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
