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
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Target,
  TrendingUp,
  Zap,
  Flame,
  Award,
} from "lucide-react";

// Mock assigned workouts for trainee
const mockAssignedWorkouts = {
  today: [
    {
      id: "1",
      name: "Core Fundamentals",
      type: "Core",
      exercises: [
        {
          id: "e1",
          name: "Plank Hold",
          sets: 3,
          reps: "30 sec",
          completed: true,
        },
        {
          id: "e2",
          name: "Hollow Body",
          sets: 3,
          reps: "20 sec",
          completed: true,
        },
        { id: "e3", name: "Dead Bug", sets: 3, reps: "10", completed: false },
        {
          id: "e4",
          name: "L-Sit Hold",
          sets: 3,
          reps: "15 sec",
          completed: false,
        },
      ],
      duration: "30 min",
      completed: 2,
      total: 4,
    },
  ],
  upcoming: [
    {
      id: "2",
      name: "Upper Body Power",
      type: "Upper Body",
      date: "Tomorrow",
      exercises: 6,
      duration: "45 min",
    },
    {
      id: "3",
      name: "Leg Day",
      type: "Legs",
      date: "Friday",
      exercises: 5,
      duration: "40 min",
    },
  ],
  completed: [
    {
      id: "4",
      name: "Core Session",
      type: "Core",
      date: "Yesterday",
      completionRate: 100,
    },
    {
      id: "5",
      name: "Upper Body",
      type: "Upper Body",
      date: "2 days ago",
      completionRate: 85,
    },
  ],
};

const TraineeWorkouts = () => {
  const [selectedTab, setSelectedTab] = useState("today");

  const typeColors = {
    Core: "bg-orange-500",
    "Upper Body": "bg-cyan-500",
    Legs: "bg-pink-500",
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Streak
            </CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 days</div>
            <p className="text-xs text-muted-foreground mt-1">Keep it up! 🔥</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5 / 5</div>
            <p className="text-xs text-muted-foreground mt-1">
              Workouts completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.5 hrs</div>
            <p className="text-xs text-muted-foreground mt-1">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground mt-1">Average rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Workout Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">History</TabsTrigger>
        </TabsList>

        {/* Today's Workout */}
        <TabsContent value="today" className="space-y-4">
          {mockAssignedWorkouts.today.map((workout) => (
            <Card key={workout.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          typeColors[workout.type as keyof typeof typeColors]
                        }`}
                      />
                      <CardTitle>{workout.name}</CardTitle>
                    </div>
                    <CardDescription>
                      {workout.duration} • {workout.exercises.length} exercises
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      workout.completed === workout.total
                        ? "default"
                        : "secondary"
                    }
                  >
                    {workout.completed}/{workout.total} completed
                  </Badge>
                </div>
                <div className="mt-4">
                  <Progress
                    value={(workout.completed / workout.total) * 100}
                    className="h-2"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {workout.exercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        exercise.completed
                          ? "bg-accent/50 border-primary/20"
                          : "hover:bg-accent"
                      }`}
                    >
                      <Checkbox
                        checked={exercise.completed}
                        className="h-5 w-5"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-medium ${
                              exercise.completed
                                ? "line-through text-muted-foreground"
                                : ""
                            }`}
                          >
                            {exercise.name}
                          </span>
                          {exercise.completed && (
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {exercise.sets} sets × {exercise.reps}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {workout.completed === workout.total ? (
                  <Button className="w-full mt-4" variant="outline" disabled>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Workout Completed!
                  </Button>
                ) : (
                  <Button className="w-full mt-4">
                    <Zap className="h-4 w-4 mr-2" />
                    Start Workout
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Motivation Card */}
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">You're on fire! 🔥</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete today's workout to maintain your 12-day streak
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upcoming Workouts */}
        <TabsContent value="upcoming" className="space-y-3">
          {mockAssignedWorkouts.upcoming.map((workout) => (
            <Card
              key={workout.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                      typeColors[workout.type as keyof typeof typeColors]
                    }/10`}
                  >
                    <Target
                      className={`h-6 w-6 ${
                        typeColors[workout.type as keyof typeof typeColors]
                      } opacity-70`}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{workout.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {workout.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {workout.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {workout.exercises} exercises
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Completed Workouts */}
        <TabsContent value="completed" className="space-y-3">
          {mockAssignedWorkouts.completed.map((workout) => (
            <Card
              key={workout.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{workout.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {workout.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {workout.completionRate}%
                    </div>
                    <p className="text-xs text-muted-foreground">Completion</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Weekly Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Progress</CardTitle>
          <CardDescription>Your training consistency this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Mon</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-32 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: "100%" }}
                  />
                </div>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Tue</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-32 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: "100%" }}
                  />
                </div>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Wed</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-32 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: "100%" }}
                  />
                </div>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Thu</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-32 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "50%" }} />
                </div>
                <Circle className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Fri</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-32 bg-secondary rounded-full" />
                <Circle className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TraineeWorkouts;
