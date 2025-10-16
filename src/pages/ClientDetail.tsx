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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Dumbbell,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  Users,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const ClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Load trainee details
  const traineeDetails = useQuery(
    api.trainees.getTraineeWithDetails,
    id ? { traineeId: id as Id<"users"> } : "skip"
  );

  if (!traineeDetails) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-muted-foreground">Loading trainee details...</p>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "present":
        return "bg-green-500/10 text-green-500";
      case "late":
        return "bg-yellow-500/10 text-yellow-500";
      case "absent":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "present":
        return <CheckCircle2 className="h-4 w-4" />;
      case "late":
        return <Clock className="h-4 w-4" />;
      case "absent":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  // Calculate attendance rate
  const attendanceRecords = traineeDetails.attendance || [];
  const totalSessions = attendanceRecords.length;
  const presentCount = attendanceRecords.filter(
    (a) => a.status === "present"
  ).length;
  const attendanceRate =
    totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;

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
          <h1 className="text-3xl font-bold tracking-tight">Client Details</h1>
          <p className="text-muted-foreground mt-1">
            Manage trainee information and track progress
          </p>
        </div>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={traineeDetails.profileImage} />
              <AvatarFallback className="text-2xl">
                {getInitials(traineeDetails.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{traineeDetails.name}</h2>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span>{traineeDetails.email}</span>
                </div>
                {traineeDetails.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    <span>{traineeDetails.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Joined{" "}
                    {new Date(traineeDetails._creationTime).toLocaleDateString(
                      "en-US",
                      { month: "short", year: "numeric" }
                    )}
                  </span>
                </div>
              </div>
              {traineeDetails.assignedAdminName && (
                <div className="mt-3">
                  <Badge variant="secondary">
                    Coach: {traineeDetails.assignedAdminName}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Workouts
            </CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {traineeDetails.assignments?.filter((a) => a.status === "active")
                .length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Assigned programs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Enrolled Classes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {traineeDetails.enrollments?.filter((e) => e.status === "active")
                .length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Active classes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Sessions
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Classes attended
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Attendance Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Overall rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="workouts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workouts">Workouts</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        {/* Workouts Tab */}
        <TabsContent value="workouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Workouts</CardTitle>
              <CardDescription>
                Current workout programs assigned to this trainee
              </CardDescription>
            </CardHeader>
            <CardContent>
              {traineeDetails.assignments &&
              traineeDetails.assignments.length > 0 ? (
                <div className="space-y-3">
                  {traineeDetails.assignments.map((assignment) => (
                    <Card key={assignment._id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold">
                              {assignment.templateName}
                            </h3>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span>
                                Assigned{" "}
                                {new Date(
                                  assignment.assignedAt
                                ).toLocaleDateString()}
                              </span>
                              <span>By {assignment.assignedByName}</span>
                            </div>
                            {assignment.scheduledDays &&
                              assignment.scheduledDays.length > 0 && (
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-xs text-muted-foreground">
                                    Schedule:
                                  </span>
                                  {assignment.scheduledDays.map((day) => (
                                    <Badge
                                      key={day}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {day}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            {assignment.notes && (
                              <p className="text-sm text-muted-foreground mt-2 italic">
                                {assignment.notes}
                              </p>
                            )}
                          </div>
                          <Badge
                            variant={
                              assignment.status === "active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {assignment.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Dumbbell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No workouts assigned yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Classes Tab */}
        <TabsContent value="classes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Class Enrollments</CardTitle>
              <CardDescription>
                Classes this trainee is currently enrolled in
              </CardDescription>
            </CardHeader>
            <CardContent>
              {traineeDetails.enrollments &&
              traineeDetails.enrollments.length > 0 ? (
                <div className="space-y-3">
                  {traineeDetails.enrollments.map((enrollment) => (
                    <Card key={enrollment._id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">
                              {enrollment.className}
                            </h3>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {enrollment.classType}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Enrolled{" "}
                                {new Date(
                                  enrollment.enrolledAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <Badge
                            variant={
                              enrollment.status === "active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {enrollment.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Not enrolled in any classes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>Recent class attendance records</CardDescription>
            </CardHeader>
            <CardContent>
              {attendanceRecords.length > 0 ? (
                <div className="space-y-3">
                  {attendanceRecords.slice(0, 10).map((record) => (
                    <div
                      key={record._id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${getStatusColor(
                            record.status
                          )}`}
                        >
                          {getStatusIcon(record.status)}
                        </div>
                        <div>
                          <div className="font-medium">{record.className}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(record.scheduleDate).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(record.status)}>
                        {record.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No attendance records yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientDetail;
