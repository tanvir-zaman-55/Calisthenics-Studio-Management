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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import {
  Plus,
  Users,
  Calendar,
  TrendingUp,
  Clock,
  Target,
  User,
  Trash2,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const Classes = () => {
  const { isAdmin, isTrainee, currentUser } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Load classes from Convex
  const classes =
    useQuery(
      api.classes.getAllClasses,
      currentUser
        ? {
            instructorId: currentUser._id,
            role: currentUser.role,
          }
        : "skip"
    ) ?? [];

  // Get my enrollments if trainee
  const myEnrollments =
    useQuery(
      api.classEnrollments.getTraineeEnrollments,
      currentUser && isTrainee ? { traineeId: currentUser._id } : "skip"
    ) ?? [];

  // Get stats
  const sessionStats = useQuery(
    api.classSessions.getSessionStats,
    currentUser
      ? {
          instructorId: currentUser._id,
          role: currentUser.role,
        }
      : "skip"
  );

  const overallAttendance = useQuery(api.attendance.getOverallAttendanceStats);

  // Mutations
  const createClass = useMutation(api.classes.createClass);
  const deleteClass = useMutation(api.classes.deleteClass);
  const enrollInClass = useMutation(api.classEnrollments.enrollInClass);
  const dropClass = useMutation(api.classEnrollments.dropClass);

  // Form state
  const [newClass, setNewClass] = useState({
    name: "",
    type: "",
    difficulty: "Beginner" as "Beginner" | "Intermediate" | "Advanced",
    description: "",
    capacity: 15,
    duration: 60,
    schedule: "",
  });

  // Difficulty colors
  const difficultyColors = {
    Beginner: "bg-green-500/10 text-green-500",
    Intermediate: "bg-blue-500/10 text-blue-500",
    Advanced: "bg-red-500/10 text-red-500",
  };

  const handleCreateClass = async () => {
    if (!currentUser) return;

    try {
      await createClass({
        name: newClass.name,
        type: newClass.type,
        difficulty: newClass.difficulty, // This will be mapped to level in the mutation
        description: newClass.description,
        capacity: newClass.capacity,
        duration: newClass.duration,
        schedule: newClass.schedule,
        instructorId: currentUser._id,
      });

      setNewClass({
        name: "",
        type: "",
        difficulty: "Beginner",
        description: "",
        capacity: 15,
        duration: 60,
        schedule: "",
      });
      setIsDialogOpen(false);
      alert("Class created successfully!");
    } catch (error) {
      console.error("Error creating class:", error);
      alert("Failed to create class");
    }
  };

  const handleEnroll = async (classId: Id<"classes">) => {
    if (!currentUser) return;

    try {
      await enrollInClass({
        traineeId: currentUser._id,
        classId: classId,
      });
      alert("Successfully enrolled!");
    } catch (error) {
      console.error("Error enrolling:", error);
      alert(
        error instanceof Error ? error.message : "Failed to enroll in class"
      );
    }
  };

  const handleDrop = async (classId: Id<"classes">) => {
    if (!currentUser) return;

    try {
      await dropClass({
        traineeId: currentUser._id, // Now correctly passing traineeId
        classId: classId,
      });
      alert("Successfully dropped class");
    } catch (error) {
      console.error("Error dropping class:", error);
      alert("Failed to drop class");
    }
  };

  const isEnrolled = (classId: Id<"classes">) => {
    return myEnrollments.some((e) => e.classId === classId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Classes</h1>
          <p className="text-muted-foreground mt-1">
            {isTrainee
              ? "Browse and enroll in classes"
              : "Manage group fitness classes"}
          </p>
        </div>
        {isAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Class
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Class</DialogTitle>
                <DialogDescription>
                  Add a new group fitness class
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Class Name</Label>
                  <Input
                    placeholder="e.g., Core Fundamentals"
                    value={newClass.name}
                    onChange={(e) =>
                      setNewClass({ ...newClass, name: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={newClass.type}
                      onValueChange={(value) =>
                        setNewClass({ ...newClass, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Core">Core</SelectItem>
                        <SelectItem value="Upper Body">Upper Body</SelectItem>
                        <SelectItem value="Lower Body">Lower Body</SelectItem>
                        <SelectItem value="Full Body">Full Body</SelectItem>
                        <SelectItem value="Flexibility">Flexibility</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select
                      value={newClass.difficulty}
                      onValueChange={(
                        value: "Beginner" | "Intermediate" | "Advanced"
                      ) => setNewClass({ ...newClass, difficulty: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
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
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe the class..."
                    rows={3}
                    value={newClass.description}
                    onChange={(e) =>
                      setNewClass({ ...newClass, description: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Capacity</Label>
                    <Input
                      type="number"
                      value={newClass.capacity}
                      onChange={(e) =>
                        setNewClass({
                          ...newClass,
                          capacity: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Duration (min)</Label>
                    <Input
                      type="number"
                      value={newClass.duration}
                      onChange={(e) =>
                        setNewClass({
                          ...newClass,
                          duration: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Schedule</Label>
                  <Input
                    placeholder="e.g., Mon/Wed/Fri 6:00 PM"
                    value={newClass.schedule}
                    onChange={(e) =>
                      setNewClass({ ...newClass, schedule: e.target.value })
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
                  onClick={handleCreateClass}
                  disabled={
                    !newClass.name || !newClass.type || !newClass.description
                  }
                >
                  Create Class
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Classes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classes.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Available to join
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Enrolled
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {classes.reduce((sum, c) => sum + (c.enrolled || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all classes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessionStats?.thisWeekSessions ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Sessions scheduled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Attendance
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overallAttendance?.attendanceRate ?? 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Classes List */}
      <Card>
        <CardHeader>
          <CardTitle>All Classes</CardTitle>
          <CardDescription>
            {isTrainee
              ? "Browse available classes and enroll"
              : "Manage your group fitness classes"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {classes.map((classItem) => (
              <Card
                key={classItem._id}
                className="overflow-hidden hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">
                        {classItem.name}
                      </CardTitle>
                      <CardDescription>{classItem.type}</CardDescription>
                    </div>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={async () => {
                          if (confirm(`Delete "${classItem.name}"?`)) {
                            try {
                              await deleteClass({
                                classId: classItem._id,
                              });
                              alert("Class deleted!");
                            } catch (error) {
                              console.error("Error deleting class:", error);
                              alert("Failed to delete class");
                            }
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <Badge
                    className={
                      difficultyColors[
                        classItem.difficulty as keyof typeof difficultyColors
                      ]
                    }
                  >
                    {classItem.difficulty}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {classItem.description}
                  </p>

                  <div className="space-y-2 text-sm border-t pt-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Schedule:</span>
                      <span className="font-medium ml-auto">
                        {classItem.schedule || "TBD"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium ml-auto">
                        {classItem.duration} min
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Enrolled:</span>
                      <span className="font-medium ml-auto">
                        {classItem.enrolled || 0}/{classItem.capacity}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Instructor:</span>
                      <span className="font-medium ml-auto truncate max-w-[120px]">
                        {classItem.instructorName || "Unknown"}
                      </span>
                    </div>
                  </div>

                  {isTrainee && (
                    <Button
                      className="w-full mt-3"
                      variant={
                        isEnrolled(classItem._id) ? "outline" : "default"
                      }
                      onClick={() =>
                        isEnrolled(classItem._id)
                          ? handleDrop(classItem._id)
                          : handleEnroll(classItem._id)
                      }
                      disabled={
                        !isEnrolled(classItem._id) &&
                        (classItem.enrolled || 0) >= classItem.capacity
                      }
                    >
                      {isEnrolled(classItem._id)
                        ? "Drop Class"
                        : (classItem.enrolled || 0) >= classItem.capacity
                          ? "Class Full"
                          : "Enroll"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {classes.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-semibold">
                No classes available
              </h3>
              <p className="text-muted-foreground">
                {isAdmin
                  ? "Create your first class to get started"
                  : "Check back later for new classes"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Classes;
