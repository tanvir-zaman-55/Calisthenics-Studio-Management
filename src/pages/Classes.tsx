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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import {
  Plus,
  Search,
  Filter,
  Clock,
  Users,
  Dumbbell,
  MoreVertical,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const Classes = () => {
  const { isSuperAdmin, isAdmin, isTrainee, currentUser } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Load classes from Convex
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
  const createClass = useMutation(api.classes.createClass);
  const deactivateClass = useMutation(api.classes.deactivateClass);
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
  // For trainees - get enrollments
  const myEnrollments =
    useQuery(
      api.classEnrollments.getTraineeEnrollments,
      currentUser && isTrainee ? { traineeId: currentUser._id } : "skip"
    ) ?? [];

  const enrollInClass = useMutation(api.classEnrollments.enrollInClass);
  const dropClass = useMutation(api.classEnrollments.dropClass);

  // Get list of class IDs trainee is enrolled in
  const enrolledClassIds = myEnrollments.map((e) => e.classId);

  // Form state for new class
  const [newClass, setNewClass] = useState({
    name: "",
    type: "",
    description: "",
    level: "",
    capacity: 15,
    duration: 90,
    location: "",
  });

  const handleCreateClass = async () => {
    if (!currentUser) return;

    try {
      await createClass({
        name: newClass.name,
        type: newClass.type,
        description: newClass.description,
        level: newClass.level,
        capacity: newClass.capacity,
        duration: newClass.duration,
        instructorId: currentUser._id,
        location: newClass.location,
      });

      // Reset form
      setNewClass({
        name: "",
        type: "",
        description: "",
        level: "",
        capacity: 15,
        duration: 90,
        location: "",
      });
      setIsDialogOpen(false);

      alert("Class created successfully!");
    } catch (error) {
      console.error("Error creating class:", error);
      alert("Failed to create class");
    }
  };

  const levelColors = {
    Beginner: "bg-green-500/10 text-green-500",
    Intermediate: "bg-blue-500/10 text-blue-500",
    Advanced: "bg-red-500/10 text-red-500",
    "All Levels": "bg-purple-500/10 text-purple-500",
  };

  const typeColors = {
    Core: "bg-orange-500/10 text-orange-500",
    "Upper Body": "bg-cyan-500/10 text-cyan-500",
    Legs: "bg-pink-500/10 text-pink-500",
    "Full Body": "bg-purple-500/10 text-purple-500",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Classes</h1>
          <p className="text-muted-foreground mt-1">
            {isSuperAdmin
              ? "Manage all classes across the studio"
              : isTrainee
                ? "Browse and enroll in classes"
                : "View and manage your classes"}
          </p>
        </div>
        {isAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Class
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Class</DialogTitle>
                <DialogDescription>
                  Add a new class to your schedule
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="class-name">Class Name</Label>
                  <Input
                    id="class-name"
                    placeholder="e.g., Core Fundamentals"
                    value={newClass.name}
                    onChange={(e) =>
                      setNewClass({ ...newClass, name: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="class-type">Type</Label>
                    <Input
                      id="class-type"
                      placeholder="Core, Upper Body, Legs"
                      value={newClass.type}
                      onChange={(e) =>
                        setNewClass({ ...newClass, type: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="class-level">Level</Label>
                    <Input
                      id="class-level"
                      placeholder="Beginner, Intermediate"
                      value={newClass.level}
                      onChange={(e) =>
                        setNewClass({ ...newClass, level: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
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
                    <Label htmlFor="duration">Duration (min)</Label>
                    <Input
                      id="duration"
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
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Studio A"
                    value={newClass.location}
                    onChange={(e) =>
                      setNewClass({ ...newClass, location: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the class..."
                    rows={3}
                    value={newClass.description}
                    onChange={(e) =>
                      setNewClass({ ...newClass, description: e.target.value })
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
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classes.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isSuperAdmin
                ? "All classes"
                : isTrainee
                  ? "Available"
                  : "Your classes"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isTrainee ? "My Enrollments" : "Total Students"}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isTrainee
                ? myEnrollments.length
                : classes.reduce((sum, c) => sum + c.enrolled, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isTrainee ? "Classes enrolled" : "Enrolled"}
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

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Classes</CardTitle>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search classes by name or type..."
                className="pl-9"
              />
            </div>
          </div>

          {/* Class List */}
          <div className="space-y-4">
            {classes.map((classItem) => {
              const isEnrolled = enrolledClassIds.includes(classItem._id);
              const isFull = classItem.enrolled >= classItem.capacity;

              return (
                <Card key={classItem._id} className="overflow-hidden">
                  <div className="flex items-start justify-between p-6">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Dumbbell className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg flex items-center gap-2 flex-wrap">
                            {classItem.name}
                            {isEnrolled && (
                              <Badge variant="default" className="text-xs">
                                Enrolled
                              </Badge>
                            )}
                            {isFull && (
                              <Badge variant="destructive" className="text-xs">
                                Full
                              </Badge>
                            )}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge
                              className={
                                typeColors[
                                  classItem.type as keyof typeof typeColors
                                ] || "bg-gray-500/10 text-gray-500"
                              }
                            >
                              {classItem.type}
                            </Badge>
                            <Badge
                              className={
                                levelColors[
                                  classItem.level as keyof typeof levelColors
                                ] || "bg-purple-500/10 text-purple-500"
                              }
                            >
                              {classItem.level}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {classItem.description}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Schedule TBD</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{classItem.duration} min</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {classItem.enrolled}/{classItem.capacity} enrolled
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Instructor: {classItem.instructorName}
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0 ml-4">
                      {isTrainee && (
                        <>
                          {isEnrolled ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                const enrollment = myEnrollments.find(
                                  (e) => e.classId === classItem._id
                                );
                                if (
                                  enrollment &&
                                  confirm(`Drop ${classItem.name}?`)
                                ) {
                                  try {
                                    await dropClass({
                                      enrollmentId: enrollment._id,
                                    });
                                    alert("Dropped successfully!");
                                  } catch (error) {
                                    console.error(
                                      "Error dropping class:",
                                      error
                                    );
                                    alert("Failed to drop class");
                                  }
                                }
                              }}
                            >
                              Drop Class
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              disabled={isFull}
                              onClick={async () => {
                                if (!currentUser) return;
                                try {
                                  await enrollInClass({
                                    traineeId: currentUser._id,
                                    classId: classItem._id,
                                  });
                                  alert(`Enrolled in ${classItem.name}!`);
                                } catch (error) {
                                  console.error("Error enrolling:", error);
                                  alert(
                                    error instanceof Error
                                      ? error.message
                                      : "Failed to enroll"
                                  );
                                }
                              }}
                            >
                              {isFull ? "Class Full" : "Enroll"}
                            </Button>
                          )}
                        </>
                      )}

                      {isAdmin && (
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="px-6 pb-4">
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          isFull ? "bg-destructive" : "bg-primary"
                        }`}
                        style={{
                          width: `${
                            (classItem.enrolled / classItem.capacity) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {classes.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No classes available</p>
              <p className="text-sm">
                {isAdmin
                  ? "Click 'Add Class' to create your first class"
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
