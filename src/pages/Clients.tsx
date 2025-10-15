"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useAuth } from "@/context/AuthContext";
import {
  Plus,
  Search,
  UserPlus,
  Users,
  TrendingUp,
  Calendar,
  Dumbbell,
  Mail,
  Phone,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const Clients = () => {
  const navigate = useNavigate();
  const { isSuperAdmin, currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Load trainees with stats
  const trainees =
    useQuery(
      api.trainees.getAllTraineesWithStats,
      currentUser
        ? {
            adminId: currentUser._id,
            role: currentUser.role,
          }
        : "skip"
    ) ?? [];
  // Load admins for assignment
  const admins = useQuery(api.user.getUsersByRole, { role: "admin" }) ?? [];

  const createUser = useMutation(api.user.createUser);

  // Form state
  const [newTrainee, setNewTrainee] = useState({
    name: "",
    email: "",
    phone: "",
    assignedAdminId: "" as Id<"users"> | "",
  });

  const handleCreateTrainee = async () => {
    if (!currentUser) return;

    try {
      await createUser({
        name: newTrainee.name,
        email: newTrainee.email,
        phone: newTrainee.phone,
        role: "trainee",
        assignedAdminId: newTrainee.assignedAdminId || currentUser._id,
      });

      setNewTrainee({
        name: "",
        email: "",
        phone: "",
        assignedAdminId: "",
      });
      setIsDialogOpen(false);
      alert("Trainee added successfully!");
    } catch (error) {
      console.error("Error creating trainee:", error);
      alert("Failed to add trainee");
    }
  };

  const filteredTrainees = trainees.filter(
    (trainee) =>
      trainee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trainee.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground mt-1">
            Manage your trainees and track their progress
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Trainee
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Trainee</DialogTitle>
              <DialogDescription>
                Add a new trainee to your roster
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={newTrainee.name}
                  onChange={(e) =>
                    setNewTrainee({ ...newTrainee, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={newTrainee.email}
                  onChange={(e) =>
                    setNewTrainee({ ...newTrainee, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="+1 (555) 000-0000"
                  value={newTrainee.phone}
                  onChange={(e) =>
                    setNewTrainee({ ...newTrainee, phone: e.target.value })
                  }
                />
              </div>
              {isSuperAdmin && admins.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="admin">Assign to Admin</Label>
                  <Select
                    value={newTrainee.assignedAdminId || ""}
                    onValueChange={(value) =>
                      setNewTrainee({
                        ...newTrainee,
                        assignedAdminId: value as Id<"users">,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an admin" />
                    </SelectTrigger>
                    <SelectContent>
                      {admins.map((admin) => (
                        <SelectItem key={admin._id} value={admin._id}>
                          {admin.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateTrainee}
                disabled={!newTrainee.name || !newTrainee.email}
              >
                Add Trainee
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Trainees
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainees.length}</div>
            <p className="text-xs text-muted-foreground">Active clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Workouts
            </CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trainees.reduce((sum, t) => sum + t.activeWorkouts, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total assignments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Class Enrollments
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trainees.reduce((sum, t) => sum + t.enrolledClasses, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Active enrollments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Attendance
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trainees.length > 0
                ? Math.round(
                    trainees.reduce((sum, t) => sum + t.attendanceRate, 0) /
                      trainees.length
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Overall rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Client List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Clients</CardTitle>
              <CardDescription>
                Manage and track your trainee roster
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
                placeholder="Search by name or email..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Trainee Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTrainees.map((trainee) => (
              <Card
                key={trainee._id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/clients/${trainee._id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={trainee.profileImage} />
                      <AvatarFallback>
                        {getInitials(trainee.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <h3 className="font-semibold">{trainee.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{trainee.email}</span>
                      </div>
                      {trainee.phone && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{trainee.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-xl font-bold">
                        {trainee.activeWorkouts}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Workouts
                      </div>
                    </div>
                    <div>
                      <div className="text-xl font-bold">
                        {trainee.enrolledClasses}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Classes
                      </div>
                    </div>
                    <div>
                      <div className="text-xl font-bold">
                        {trainee.attendanceRate}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Attendance
                      </div>
                    </div>
                  </div>

                  {trainee.assignedAdminName && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="text-xs text-muted-foreground">
                        Assigned to: {trainee.assignedAdminName}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTrainees.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-semibold">No trainees found</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search"
                  : "Add your first trainee to get started"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Clients;
