"use client";

import React, { useState, useEffect } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Users,
  TrendingUp,
  Calendar,
  Dumbbell,
  Mail,
  Phone,
  UserPlus,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const Clients = () => {
  const navigate = useNavigate();
  const { isSuperAdmin, currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [emailToCheck, setEmailToCheck] = useState("");
  const [existingUser, setExistingUser] = useState<any>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);

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
  const register = useMutation(api.auth.register);
  const checkUserByEmail = useQuery(
    api.user.checkUserByEmail,
    emailToCheck ? { email: emailToCheck } : "skip"
  );
  const assignExistingTrainee = useMutation(api.user.assignExistingTrainee);

  // Form state
  const [newTrainee, setNewTrainee] = useState({
    name: "",
    email: "",
    phone: "",
    assignedAdminId: "" as Id<"users"> | "",
  });

  // Check email when it changes
  useEffect(() => {
    if (checkUserByEmail !== undefined) {
      setExistingUser(checkUserByEmail);
      setCheckingEmail(false);
    }
  }, [checkUserByEmail]);

  const handleEmailBlur = () => {
    if (newTrainee.email && newTrainee.email.includes("@")) {
      setCheckingEmail(true);
      setEmailToCheck(newTrainee.email);
    }
  };

  const handleCreateOrAssignTrainee = async () => {
    if (!currentUser) return;

    try {
      if (existingUser) {
        // User exists - assign them
        if (existingUser.role !== "trainee") {
          alert(`This email belongs to a ${existingUser.role}, not a trainee.`);
          return;
        }

        if (existingUser.assignedAdminId) {
          alert(
            `${existingUser.name} is already assigned to another coach.\n\nPlease contact a Super Admin to reassign them.`
          );
          return;
        }

        await assignExistingTrainee({
          traineeId: existingUser._id,
          adminId: currentUser._id,
          phone: newTrainee.phone || undefined,
        });

        alert(`${existingUser.name} has been added to your client list!`);
      } else {
        // User doesn't exist - create new account with temp password
        const tempPassword = `Trainee${Math.random().toString(36).slice(-8)}!`;

        await register({
          name: newTrainee.name,
          email: newTrainee.email,
          password: tempPassword,
          phone: newTrainee.phone,
          role: "trainee",
        });

        // Assign to admin
        const user = await checkUserByEmail;
        if (user) {
          await assignExistingTrainee({
            traineeId: user._id,
            adminId: newTrainee.assignedAdminId || currentUser._id,
            phone: newTrainee.phone,
          });
        }

        alert(
          `Trainee added successfully!\n\nTemporary Password: ${tempPassword}\n\nPlease share this with ${newTrainee.name}.`
        );
      }

      // Reset form
      setNewTrainee({
        name: "",
        email: "",
        phone: "",
        assignedAdminId: "",
      });
      setEmailToCheck("");
      setExistingUser(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error adding trainee:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to add trainee. Please try again."
      );
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
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              // Reset on close
              setNewTrainee({
                name: "",
                email: "",
                phone: "",
                assignedAdminId: "",
              });
              setEmailToCheck("");
              setExistingUser(null);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Trainee
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Trainee</DialogTitle>
              <DialogDescription>
                Enter trainee's email. If they're registered, we'll add them to
                your clients. If not, we'll create their account.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="trainee@example.com"
                  value={newTrainee.email}
                  onChange={(e) => {
                    setNewTrainee({ ...newTrainee, email: e.target.value });
                    setExistingUser(null);
                    setEmailToCheck("");
                  }}
                  onBlur={handleEmailBlur}
                />
                {checkingEmail && (
                  <p className="text-xs text-muted-foreground">
                    Checking email...
                  </p>
                )}
              </div>

              {/* Show if user exists */}
              {existingUser && (
                <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    <div className="font-medium text-green-900 dark:text-green-100">
                      User Found: {existingUser.name}
                    </div>
                    <div className="text-xs text-green-700 dark:text-green-300 mt-1">
                      {existingUser.assignedAdminId
                        ? "⚠️ Already assigned to another coach"
                        : "✓ Available to add to your clients"}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Show if user doesn't exist */}
              {emailToCheck &&
                !checkingEmail &&
                existingUser === null &&
                newTrainee.email.includes("@") && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No account found. We'll create a new account with a
                      temporary password.
                    </AlertDescription>
                  </Alert>
                )}

              {/* Name field - only for new users */}
              {(!existingUser || existingUser === null) && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={existingUser ? existingUser.name : newTrainee.name}
                    onChange={(e) =>
                      setNewTrainee({ ...newTrainee, name: e.target.value })
                    }
                    disabled={!!existingUser}
                  />
                </div>
              )}

              {/* Phone field */}
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone {existingUser ? "(optional - update)" : ""}
                </Label>
                <Input
                  id="phone"
                  placeholder="+1 (555) 000-0000"
                  value={newTrainee.phone}
                  onChange={(e) =>
                    setNewTrainee({ ...newTrainee, phone: e.target.value })
                  }
                />
                {existingUser?.phone && (
                  <p className="text-xs text-muted-foreground">
                    Current: {existingUser.phone}
                  </p>
                )}
              </div>

              {/* Admin assignment - only for super admin creating new users */}
              {isSuperAdmin && !existingUser && admins.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="admin">Assign to Coach</Label>
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
                      <SelectValue placeholder="Select a coach" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={currentUser?._id || ""}>
                        Myself
                      </SelectItem>
                      {admins
                        .filter((admin) => admin._id !== currentUser?._id)
                        .map((admin) => (
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
                onClick={handleCreateOrAssignTrainee}
                disabled={
                  !newTrainee.email ||
                  (!existingUser && !newTrainee.name) ||
                  (existingUser && existingUser.assignedAdminId)
                }
              >
                {existingUser ? "Add to My Clients" : "Create & Add"}
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
                        Coach: {trainee.assignedAdminName}
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
