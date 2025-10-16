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
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Calendar as CalendarIcon,
  Users,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const Attendance = () => {
  const { isAdmin, isSuperAdmin, isTrainee, currentUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState<Id<"classes"> | "">("");

  // Get all active classes (filtered by instructor for admins)
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

  // Get attendance for selected class and date
  const classAttendance =
    useQuery(
      api.attendance.getClassAttendance,
      selectedClass && selectedDate && currentUser
        ? {
            classId: selectedClass,
            scheduleDate: new Date(
              selectedDate.getFullYear(),
              selectedDate.getMonth(),
              selectedDate.getDate()
            ).getTime(),
            requestingAdminId: currentUser._id,
            requestingRole: currentUser.role,
          }
        : "skip"
    ) ?? [];

  // For trainees - get their attendance history
  const myAttendance =
    useQuery(
      api.attendance.getTraineeAttendance,
      currentUser && isTrainee ? { traineeId: currentUser._id } : "skip"
    ) ?? [];

  const attendanceStats = useQuery(
    api.attendance.getAttendanceStats,
    currentUser && isTrainee ? { traineeId: currentUser._id } : "skip"
  );

  const markAttendance = useMutation(api.attendance.markAttendance);

  const handleMarkAttendance = async (
    traineeId: Id<"users">,
    status: "present" | "absent" | "late"
  ) => {
    if (!currentUser || !selectedClass) return;

    try {
      await markAttendance({
        traineeId,
        classId: selectedClass,
        scheduleDate: new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate()
        ).getTime(),
        status,
        markedBy: currentUser._id,
      });
      console.log("Attendance marked successfully!");
    } catch (error) {
      console.error("Error marking attendance:", error);
      alert("Failed to mark attendance");
    }
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

  if (isTrainee) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Attendance</h1>
          <p className="text-muted-foreground mt-1">
            View your class attendance history
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Classes
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {attendanceStats?.total ?? 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Sessions attended
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {attendanceStats?.present ?? 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">On time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Late</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">
                {attendanceStats?.late ?? 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Arrived late</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Attendance Rate
              </CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {attendanceStats?.attendanceRate ?? 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Overall rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Attendance History */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance History</CardTitle>
            <CardDescription>Your recent class attendance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myAttendance.length > 0 ? (
                myAttendance.map((record) => (
                  <div
                    key={record._id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${getStatusColor(record.status)}`}
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
                      {record.status || "Not marked"}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No attendance records yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin view
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Attendance Tracking
        </h1>
        <p className="text-muted-foreground mt-1">
          Mark attendance for your classes
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Date & Class Selection */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Select Date</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Select Class</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedClass || ""}
                onValueChange={(value) =>
                  setSelectedClass(value as Id<"classes">)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((classItem) => (
                    <SelectItem key={classItem._id} value={classItem._id}>
                      {classItem.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Attendance List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedClass
                ? `${classes.find((c) => c._id === selectedClass)?.name} - ${selectedDate.toLocaleDateString()}`
                : "Select a class and date"}
            </CardTitle>
            <CardDescription>
              Mark attendance for enrolled trainees
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedClass ? (
              <div className="space-y-3">
                {classAttendance.length > 0 ? (
                  classAttendance.map((record) => (
                    <div
                      key={record.traineeId}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{record.traineeName}</div>
                        <div className="text-sm text-muted-foreground">
                          {record.traineeEmail}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {record.status && (
                          <Badge className={getStatusColor(record.status)}>
                            {record.status}
                          </Badge>
                        )}
                        <Button
                          size="sm"
                          variant={
                            record.status === "present" ? "default" : "outline"
                          }
                          onClick={() =>
                            handleMarkAttendance(record.traineeId, "present")
                          }
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={
                            record.status === "late" ? "default" : "outline"
                          }
                          onClick={() =>
                            handleMarkAttendance(record.traineeId, "late")
                          }
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={
                            record.status === "absent" ? "default" : "outline"
                          }
                          onClick={() =>
                            handleMarkAttendance(record.traineeId, "absent")
                          }
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No enrolled trainees for this class
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a class to view attendance</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Attendance;
