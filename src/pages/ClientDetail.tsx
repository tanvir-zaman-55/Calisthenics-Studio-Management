"use client";

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Target,
  TrendingUp,
  Clock,
  Award,
  Plus,
  CheckCircle2,
  Dumbbell,
  Users,
  Activity,
} from "lucide-react";

// Mock client data
const mockClients: Record<string, any> = {
  "1": {
    id: "1",
    name: "Ahmed Hassan",
    email: "ahmed@example.com",
    phone: "+880 1234 567890",
    status: "Active",
    joinDate: "2024-01-15",
    classes: ["Core Fundamentals", "Upper Body Mastery"],
    assignedWorkouts: [
      {
        id: "w1",
        name: "Core Fundamentals",
        type: "Core",
        assignedDate: "2024-01-20",
        completed: 12,
        total: 15,
        lastCompleted: "Today",
      },
      {
        id: "w2",
        name: "Upper Body Power",
        type: "Upper Body",
        assignedDate: "2024-01-22",
        completed: 8,
        total: 10,
        lastCompleted: "2 days ago",
      },
    ],
    progress: {
      totalWorkouts: 48,
      completionRate: 87,
      currentStreak: 8,
      weeklyGoal: 5,
      weeklyCompleted: 4,
    },
    recentActivity: [
      { date: "Today", workout: "Core Fundamentals", completion: 100 },
      { date: "Yesterday", workout: "Upper Body", completion: 100 },
      { date: "2 days ago", workout: "Legs Day", completion: 85 },
    ],
    personalBests: [
      { exercise: "Push-ups", value: "45 reps", date: "2 weeks ago" },
      { exercise: "Plank Hold", value: "2:30 min", date: "1 week ago" },
      { exercise: "Pull-ups", value: "15 reps", date: "3 days ago" },
    ],
  },
  "2": {
    id: "2",
    name: "Sara Ibrahim",
    email: "sara@example.com",
    phone: "+880 1234 567891",
    status: "Active",
    joinDate: "2024-02-20",
    classes: ["Core Fundamentals"],
    assignedWorkouts: [
      {
        id: "w3",
        name: "Beginner Core",
        type: "Core",
        assignedDate: "2024-02-25",
        completed: 5,
        total: 8,
        lastCompleted: "Yesterday",
      },
    ],
    progress: {
      totalWorkouts: 24,
      completionRate: 92,
      currentStreak: 12,
      weeklyGoal: 4,
      weeklyCompleted: 4,
    },
    recentActivity: [
      { date: "Yesterday", workout: "Core Fundamentals", completion: 100 },
      { date: "2 days ago", workout: "Core Fundamentals", completion: 100 },
    ],
    personalBests: [
      { exercise: "Plank Hold", value: "1:45 min", date: "1 week ago" },
      { exercise: "Hollow Body", value: "45 sec", date: "3 days ago" },
    ],
  },
};

// Available workout templates to assign
const availableWorkouts = [
  {
    id: "t1",
    name: "Beginner Core Fundamentals",
    type: "Core",
    duration: "30 min",
  },
  {
    id: "t2",
    name: "Upper Body Power",
    type: "Upper Body",
    duration: "45 min",
  },
  { id: "t3", name: "Leg Day Intense", type: "Legs", duration: "40 min" },
  {
    id: "t4",
    name: "Full Body Workout",
    type: "Full Body",
    duration: "60 min",
  },
];

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSuperAdmin, isAdmin } = useAuth();
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const client = mockClients[id || "1"];

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Client not found</p>
        <Button onClick={() => navigate("/clients")} className="mt-4">
          Back to Clients
        </Button>
      </div>
    );
  }

  const typeColors = {
    Core: "bg-orange-500/10 text-orange-500",
    "Upper Body": "bg-cyan-500/10 text-cyan-500",
    Legs: "bg-pink-500/10 text-pink-500",
    "Full Body": "bg-purple-500/10 text-purple-500",
  };

  const weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const handleAssignWorkout = () => {
    console.log(
      "Assigning workout:",
      selectedWorkout,
      "on days:",
      selectedDays
    );
    // API call would go here
    setIsAssignDialogOpen(false);
    setSelectedWorkout("");
    setSelectedDays([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/clients")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{client.name}</h1>
          <p className="text-muted-foreground mt-1">
            Member since {new Date(client.joinDate).toLocaleDateString()}
          </p>
        </div>
        <Badge variant={client.status === "Active" ? "default" : "secondary"}>
          {client.status}
        </Badge>
      </div>

      {/* Contact Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{client.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{client.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Joined {new Date(client.joinDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Workouts
            </CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {client.progress.totalWorkouts}
            </div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {client.progress.completionRate}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Streak
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {client.progress.currentStreak} days
            </div>
            <p className="text-xs text-muted-foreground mt-1">Consistent!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {client.progress.weeklyCompleted}/{client.progress.weeklyGoal}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Weekly goal</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="workouts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workouts">Assigned Workouts</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
        </TabsList>

        {/* Assigned Workouts Tab */}
        <TabsContent value="workouts" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Assigned Workouts</h3>
            {isAdmin && (
              <Dialog
                open={isAssignDialogOpen}
                onOpenChange={setIsAssignDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Assign Workout
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Assign Workout to {client.name}</DialogTitle>
                    <DialogDescription>
                      Select a workout template and schedule
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Workout Template</Label>
                      <Select
                        value={selectedWorkout}
                        onValueChange={setSelectedWorkout}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select workout" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableWorkouts.map((workout) => (
                            <SelectItem key={workout.id} value={workout.id}>
                              {workout.name} ({workout.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Schedule (Select days)</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {weekDays.map((day) => (
                          <div
                            key={day}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={day}
                              checked={selectedDays.includes(day)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedDays([...selectedDays, day]);
                                } else {
                                  setSelectedDays(
                                    selectedDays.filter((d) => d !== day)
                                  );
                                }
                              }}
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
                      disabled={!selectedWorkout || selectedDays.length === 0}
                    >
                      Assign Workout
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {client.assignedWorkouts.map((workout: any) => (
              <Card key={workout.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{workout.name}</CardTitle>
                      <CardDescription>
                        Assigned{" "}
                        {new Date(workout.assignedDate).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge
                      className={
                        typeColors[workout.type as keyof typeof typeColors]
                      }
                    >
                      {workout.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span className="font-medium">
                        {workout.completed}/{workout.total} sessions
                      </span>
                    </div>
                    <Progress
                      value={(workout.completed / workout.total) * 100}
                      className="h-2"
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Last: {workout.lastCompleted}
                    </span>
                    <span>
                      {Math.round((workout.completed / workout.total) * 100)}%
                      complete
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {client.recentActivity.map((activity: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium text-sm">
                            {activity.workout}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.date}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{activity.completion}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Personal Bests</CardTitle>
                <CardDescription>Recent achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {client.personalBests.map((pb: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Award className="h-5 w-5 text-amber-500" />
                        <div>
                          <p className="font-medium text-sm">{pb.exercise}</p>
                          <p className="text-xs text-muted-foreground">
                            {pb.date}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-sm">{pb.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Progress</CardTitle>
              <CardDescription>
                Goal: {client.progress.weeklyGoal} workouts per week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    {client.progress.weeklyCompleted} /{" "}
                    {client.progress.weeklyGoal} completed
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(
                      (client.progress.weeklyCompleted /
                        client.progress.weeklyGoal) *
                        100
                    )}
                    %
                  </span>
                </div>
                <Progress
                  value={
                    (client.progress.weeklyCompleted /
                      client.progress.weeklyGoal) *
                    100
                  }
                  className="h-3"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Classes Tab */}
        <TabsContent value="classes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Classes</CardTitle>
              <CardDescription>
                Classes {client.name} is attending
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {client.classes.map((className: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 border rounded-lg"
                  >
                    <Users className="h-5 w-5 text-primary" />
                    <span className="font-medium">{className}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientDetail;
