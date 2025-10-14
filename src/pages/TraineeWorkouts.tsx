import React, { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Play,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Circle,
  Flame,
  Award,
  Dumbbell,
  AlertCircle,
} from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  primaryMuscles: string[];
  equipment: string;
  description: string;
  videoUrl?: string;
}

interface WorkoutExercise {
  exerciseId: string;
  sets: number;
  reps: string;
  rest: number;
  notes?: string;
}

interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  duration: number;
  exercises: WorkoutExercise[];
  createdAt: string;
}

interface WorkoutLog {
  id: string;
  workoutId: string;
  date: string;
  completedExercises: string[];
  notes: string;
  duration: number;
}

export default function TraineeWorkouts() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workoutTemplates, setWorkoutTemplates] = useState<WorkoutTemplate[]>(
    []
  );
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutTemplate | null>(
    null
  );
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(
    new Set()
  );
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [workoutStartTime, setWorkoutStartTime] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const storedExercises = localStorage.getItem("imported_exercises");
      const storedTemplates = localStorage.getItem(
        "imported_workout_templates"
      );
      const storedLogs = localStorage.getItem("workoutLogs");

      if (storedExercises) {
        setExercises(JSON.parse(storedExercises));
      }

      if (storedTemplates) {
        const templates = JSON.parse(storedTemplates);
        setWorkoutTemplates(templates);

        if (templates.length > 0 && !currentWorkout) {
          setCurrentWorkout(templates[0]);
        }
      }

      if (storedLogs) {
        setWorkoutLogs(JSON.parse(storedLogs));
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const getExerciseById = (id: string): Exercise | undefined => {
    return exercises.find((ex) => ex.id === id);
  };

  const startWorkout = (template: WorkoutTemplate) => {
    setCurrentWorkout(template);
    setIsWorkoutActive(true);
    setCompletedExercises(new Set());
    setWorkoutNotes("");
    setWorkoutStartTime(Date.now());
  };

  const toggleExerciseCompletion = (exerciseId: string) => {
    const newCompleted = new Set(completedExercises);
    if (newCompleted.has(exerciseId)) {
      newCompleted.delete(exerciseId);
    } else {
      newCompleted.add(exerciseId);
    }
    setCompletedExercises(newCompleted);
  };

  const completeWorkout = () => {
    if (!currentWorkout || !workoutStartTime) return;

    const duration = Math.floor((Date.now() - workoutStartTime) / 1000 / 60);

    const newLog: WorkoutLog = {
      id: Date.now().toString(),
      workoutId: currentWorkout.id,
      date: new Date().toISOString(),
      completedExercises: Array.from(completedExercises),
      notes: workoutNotes,
      duration,
    };

    const updatedLogs = [...workoutLogs, newLog];
    setWorkoutLogs(updatedLogs);
    localStorage.setItem("workoutLogs", JSON.stringify(updatedLogs));

    setIsWorkoutActive(false);
    setCompletedExercises(new Set());
    setWorkoutNotes("");
    setWorkoutStartTime(null);
  };

  const calculateProgress = () => {
    if (!currentWorkout) return 0;
    const total = currentWorkout.exercises?.length || 0;
    const completed = completedExercises.size;
    return total > 0 ? (completed / total) * 100 : 0;
  };

  const getRecentWorkouts = () => {
    return workoutLogs
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  };

  const getTodaysWorkout = (): WorkoutTemplate | null => {
    return workoutTemplates.length > 0 ? workoutTemplates[0] : null;
  };

  const getWeeklyStats = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyLogs = workoutLogs.filter(
      (log) => new Date(log.date) >= oneWeekAgo
    );

    return {
      workoutsCompleted: weeklyLogs.length,
      totalMinutes: weeklyLogs.reduce((sum, log) => sum + log.duration, 0),
      averageCompletion:
        weeklyLogs.length > 0
          ? Math.round(
              weeklyLogs.reduce((sum, log) => {
                const workout = workoutTemplates.find(
                  (w) => w.id === log.workoutId
                );
                if (!workout || !workout.exercises) return sum;
                return (
                  sum +
                  (log.completedExercises.length / workout.exercises.length) *
                    100
                );
              }, 0) / weeklyLogs.length
            )
          : 0,
    };
  };

  if (exercises.length === 0 && workoutTemplates.length === 0) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No workouts available yet. Your trainer will assign workouts to you
            soon. Please contact your admin if you think this is an error.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const todaysWorkout = getTodaysWorkout();
  const weeklyStats = getWeeklyStats();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Workouts</h1>
        <p className="text-muted-foreground">
          Track your progress and complete your training
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
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

        <Card>
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
        <TabsList>
          <TabsTrigger value="today">Today's Workout</TabsTrigger>
          <TabsTrigger value="all">All Programs</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          {isWorkoutActive && currentWorkout ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
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
                  {(currentWorkout.exercises || []).map((workoutEx, index) => {
                    const exercise = getExerciseById(workoutEx.exerciseId);
                    if (!exercise) return null;

                    const isCompleted = completedExercises.has(exercise.id);

                    return (
                      <Card
                        key={exercise.id}
                        className={isCompleted ? "bg-muted/50" : ""}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={isCompleted}
                              onCheckedChange={() =>
                                toggleExerciseCompletion(exercise.id)
                              }
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">
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

                <div className="flex gap-2">
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
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{todaysWorkout.duration} min</span>
                      </div>
                      <Badge>{todaysWorkout.difficulty}</Badge>
                      <Badge variant="outline">
                        {todaysWorkout.exercises?.length || 0} exercises
                      </Badge>
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
                                key={exercise.id}
                                className="text-sm text-muted-foreground"
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
          <div className="grid gap-4 md:grid-cols-2">
            {workoutTemplates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{template.duration} min</span>
                    </div>
                    <Badge>{template.difficulty}</Badge>
                    <Badge variant="outline">
                      {template.exercises?.length || 0} exercises
                    </Badge>
                  </div>

                  <Button
                    onClick={() => startWorkout(template)}
                    className="w-full"
                    variant={
                      currentWorkout?.id === template.id ? "default" : "outline"
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

          {workoutTemplates.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No workout programs available. Your trainer will assign programs
                soon.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {getRecentWorkouts().length > 0 ? (
            <div className="space-y-3">
              {getRecentWorkouts().map((log) => {
                const workout = workoutTemplates.find(
                  (w) => w.id === log.workoutId
                );
                if (!workout) return null;

                const completionRate = Math.round(
                  (log.completedExercises.length /
                    (workout.exercises?.length || 1)) *
                    100
                );

                return (
                  <Card key={log.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="font-medium">{workout.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(log.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                          <div className="flex items-center gap-3 text-sm">
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
                            <p className="text-sm text-muted-foreground italic mt-2">
                              "{log.notes}"
                            </p>
                          )}
                        </div>
                        <Badge
                          variant={
                            completionRate === 100 ? "default" : "secondary"
                          }
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
