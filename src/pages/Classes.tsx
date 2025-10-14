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

// Mock class data
const mockClasses = [
  {
    id: "1",
    name: "Core Fundamentals",
    type: "Core",
    instructor: "Admin User",
    schedule: "Mon, Wed, Fri - 9:00 AM",
    duration: "90 min",
    capacity: 15,
    enrolled: 12,
    level: "Beginner",
    description: "Build a solid foundation with core strength exercises",
  },
  {
    id: "2",
    name: "Upper Body Mastery",
    type: "Upper Body",
    instructor: "Admin User",
    schedule: "Tue, Thu - 6:00 PM",
    duration: "90 min",
    capacity: 12,
    enrolled: 12,
    level: "Intermediate",
    description: "Advanced push, pull, and hold exercises",
  },
  {
    id: "3",
    name: "Leg Day Power",
    type: "Legs",
    instructor: "Admin User",
    schedule: "Sat - 10:00 AM",
    duration: "90 min",
    capacity: 15,
    enrolled: 10,
    level: "All Levels",
    description: "Strengthen your lower body with pistol squats and more",
  },
  {
    id: "4",
    name: "Advanced Core",
    type: "Core",
    instructor: "Admin User",
    schedule: "Wed, Fri - 7:00 PM",
    duration: "60 min",
    capacity: 10,
    enrolled: 8,
    level: "Advanced",
    description: "Dragon flags, front levers, and advanced progressions",
  },
];

const Classes = () => {
  const { isSuperAdmin, isAdmin, currentUser } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="class-type">Type</Label>
                    <Input
                      id="class-type"
                      placeholder="Core, Upper Body, Legs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="class-level">Level</Label>
                    <Input
                      id="class-level"
                      placeholder="Beginner, Intermediate"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input id="capacity" type="number" placeholder="15" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (min)</Label>
                    <Input id="duration" type="number" placeholder="90" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule">Schedule</Label>
                  <Input id="schedule" placeholder="Mon, Wed, Fri - 9:00 AM" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the class..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={() => setIsDialogOpen(false)}>
                    Create Class
                  </Button>
                </div>
              </div>
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
            <div className="text-2xl font-bold">
              {isSuperAdmin ? "18" : "12"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isSuperAdmin ? "All classes" : "Your classes"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isSuperAdmin ? "127" : "42"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Enrolled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
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
            <div className="text-2xl font-bold">87%</div>
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
            {mockClasses.map((classItem) => (
              <Card key={classItem.id} className="overflow-hidden">
                <div className="flex items-start justify-between p-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Dumbbell className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {classItem.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            className={
                              typeColors[
                                classItem.type as keyof typeof typeColors
                              ]
                            }
                          >
                            {classItem.type}
                          </Badge>
                          <Badge
                            className={
                              levelColors[
                                classItem.level as keyof typeof levelColors
                              ]
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
                        <span>{classItem.schedule}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{classItem.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {classItem.enrolled}/{classItem.capacity} enrolled
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Instructor: {classItem.instructor}
                      </div>
                    </div>
                  </div>

                  {isAdmin && (
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="px-6 pb-4">
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${
                          (classItem.enrolled / classItem.capacity) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Super Admin Only Section */}
      {isSuperAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Class Management</CardTitle>
            <CardDescription>
              Assign classes to admins and manage schedules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              <p>This section is only visible to Super Admins.</p>
              <p className="mt-2">Here you can:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Assign classes to specific admins</li>
                <li>View class performance metrics</li>
                <li>Manage class schedules and capacity</li>
                <li>Archive or delete classes</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Classes;
