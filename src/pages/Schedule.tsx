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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const Schedule = () => {
  const { isTrainee, isAdmin, currentUser } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [currentWeek, setCurrentWeek] = useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Get trainee's enrolled classes
  const myEnrollments =
    useQuery(
      api.classEnrollments.getTraineeEnrollments,
      currentUser && isTrainee ? { traineeId: currentUser._id } : "skip"
    ) ?? [];

  // Get all classes for admin
  const classes = useQuery(api.classes.getAllClasses) ?? [];

  // Get trainee's upcoming sessions
  const upcomingSessions =
    useQuery(
      api.classSessions.getTraineeUpcomingSessions,
      currentUser && isTrainee ? { traineeId: currentUser._id } : "skip"
    ) ?? [];

  // Get sessions for current week
  // Get sessions for current week
  const weekDates = getWeekDates(currentWeek);
  const weekStart = new Date(
    weekDates[0].getFullYear(),
    weekDates[0].getMonth(),
    weekDates[0].getDate()
  ).getTime();
  const weekEnd = new Date(
    weekDates[6].getFullYear(),
    weekDates[6].getMonth(),
    weekDates[6].getDate(),
    23,
    59,
    59
  ).getTime();

  const allWeekSessions =
    useQuery(api.classSessions.getSessionsByDateRange, {
      startDate: weekStart,
      endDate: weekEnd,
    }) ?? [];

  // Filter sessions for trainees - only show enrolled classes
  const weekSessions =
    useQuery(
      api.classSessions.getSessionsByDateRange,
      currentUser
        ? {
            startDate: weekStart,
            endDate: weekEnd,
            instructorId: currentUser._id,
            role: currentUser.role,
          }
        : "skip"
    ) ?? [];

  // Mutations
  const createSession = useMutation(api.classSessions.createSession);
  const createRecurringSessions = useMutation(
    api.classSessions.createRecurringSessions
  );

  // Form state for creating sessions
  const [sessionForm, setSessionForm] = useState({
    classId: "" as Id<"classes"> | "",
    sessionDate: Date.now(),
    startTime: "09:00",
    endTime: "10:30",
    location: "",
    isRecurring: false,
    weeksCount: 4,
    selectedDays: [] as number[],
  });

  function getWeekDates(weekOffset: number) {
    const today = new Date();
    const currentDay = today.getDay();
    const diff = today.getDate() - currentDay + weekOffset * 7;
    const sunday = new Date(today.setDate(diff));

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(sunday);
      date.setDate(sunday.getDate() + i);
      return date;
    });
  }

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const toggleDay = (dayIndex: number) => {
    const days = sessionForm.selectedDays;
    if (days.includes(dayIndex)) {
      setSessionForm({
        ...sessionForm,
        selectedDays: days.filter((d) => d !== dayIndex),
      });
    } else {
      setSessionForm({
        ...sessionForm,
        selectedDays: [...days, dayIndex],
      });
    }
  };

  const handleCreateSession = async () => {
    if (!sessionForm.classId) {
      alert("Please select a class");
      return;
    }

    try {
      if (sessionForm.isRecurring) {
        if (sessionForm.selectedDays.length === 0) {
          alert("Please select at least one day");
          return;
        }

        await createRecurringSessions({
          classId: sessionForm.classId,
          startDate: sessionForm.sessionDate,
          weeksCount: sessionForm.weeksCount,
          daysOfWeek: sessionForm.selectedDays,
          startTime: sessionForm.startTime,
          endTime: sessionForm.endTime,
          location: sessionForm.location,
        });

        alert(`Created ${sessionForm.weeksCount} weeks of sessions!`);
      } else {
        await createSession({
          classId: sessionForm.classId,
          sessionDate: sessionForm.sessionDate,
          startTime: sessionForm.startTime,
          endTime: sessionForm.endTime,
          location: sessionForm.location,
        });

        alert("Session created!");
      }

      setIsCreateDialogOpen(false);
      setSessionForm({
        classId: "",
        sessionDate: Date.now(),
        startTime: "09:00",
        endTime: "10:30",
        location: "",
        isRecurring: false,
        weeksCount: 4,
        selectedDays: [],
      });
    } catch (error) {
      console.error("Error creating session:", error);
      alert("Failed to create session");
    }
  };

  const getSessionsForDate = (date: Date) => {
    const dateTime = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ).getTime();

    return weekSessions.filter((session) => {
      const sessionDate = new Date(session.sessionDate);
      return (
        sessionDate.getDate() === date.getDate() &&
        sessionDate.getMonth() === date.getMonth() &&
        sessionDate.getFullYear() === date.getFullYear()
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
          <p className="text-muted-foreground mt-1">
            {isTrainee
              ? "View your class schedule"
              : "Manage class sessions and schedule"}
          </p>
        </div>
        {isAdmin && (
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Session
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Schedule Class Session</DialogTitle>
                <DialogDescription>
                  Create a single session or recurring sessions
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Class</Label>
                  <Select
                    value={sessionForm.classId || ""}
                    onValueChange={(value) =>
                      setSessionForm({
                        ...sessionForm,
                        classId: value as Id<"classes">,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((classItem) => (
                        <SelectItem key={classItem._id} value={classItem._id}>
                          {classItem.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="recurring"
                    checked={sessionForm.isRecurring}
                    onCheckedChange={(checked) =>
                      setSessionForm({
                        ...sessionForm,
                        isRecurring: checked === true,
                      })
                    }
                  />
                  <label
                    htmlFor="recurring"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Recurring Sessions
                  </label>
                </div>

                {sessionForm.isRecurring ? (
                  <>
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={
                          new Date(sessionForm.sessionDate)
                            .toISOString()
                            .split("T")[0]
                        }
                        onChange={(e) =>
                          setSessionForm({
                            ...sessionForm,
                            sessionDate: new Date(e.target.value).getTime(),
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Number of Weeks</Label>
                      <Input
                        type="number"
                        min="1"
                        max="52"
                        value={sessionForm.weeksCount}
                        onChange={(e) =>
                          setSessionForm({
                            ...sessionForm,
                            weeksCount: parseInt(e.target.value) || 1,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Days of Week</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {dayNames.map((day, index) => (
                          <div
                            key={day}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`day-${index}`}
                              checked={sessionForm.selectedDays.includes(index)}
                              onCheckedChange={() => toggleDay(index)}
                            />
                            <label
                              htmlFor={`day-${index}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {day}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Label>Session Date</Label>
                    <Input
                      type="date"
                      value={
                        new Date(sessionForm.sessionDate)
                          .toISOString()
                          .split("T")[0]
                      }
                      onChange={(e) =>
                        setSessionForm({
                          ...sessionForm,
                          sessionDate: new Date(e.target.value).getTime(),
                        })
                      }
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={sessionForm.startTime}
                      onChange={(e) =>
                        setSessionForm({
                          ...sessionForm,
                          startTime: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={sessionForm.endTime}
                      onChange={(e) =>
                        setSessionForm({
                          ...sessionForm,
                          endTime: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Location (Optional)</Label>
                  <Input
                    placeholder="Studio A"
                    value={sessionForm.location}
                    onChange={(e) =>
                      setSessionForm({
                        ...sessionForm,
                        location: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateSession}
                  disabled={!sessionForm.classId}
                >
                  {sessionForm.isRecurring
                    ? `Create ${sessionForm.weeksCount} Weeks`
                    : "Create Session"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Main Layout */}
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Calendar Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={(selectedDate) => {
                  if (selectedDate) {
                    setDate(selectedDate);

                    // Calculate which week offset this date is in
                    const today = new Date();
                    const daysDiff = Math.floor(
                      (selectedDate.getTime() - today.getTime()) /
                        (1000 * 60 * 60 * 24)
                    );
                    const weeksDiff = Math.floor(daysDiff / 7);
                    setCurrentWeek(weeksDiff);
                  }
                }}
                className="rounded-md"
              />
            </CardContent>
          </Card>

          {/* Trainee's Upcoming Sessions */}
          {isTrainee && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Upcoming Sessions</CardTitle>
                <CardDescription>Next 2 weeks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingSessions.length > 0 ? (
                    upcomingSessions.slice(0, 5).map((session) => (
                      <div
                        key={session._id}
                        className="p-3 rounded-lg border bg-card text-card-foreground"
                      >
                        <div className="font-medium text-sm">
                          {session.className}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(session.sessionDate).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {session.startTime} - {session.endTime}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      No upcoming sessions
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Weekly Schedule */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Weekly Schedule</CardTitle>
                <CardDescription>
                  {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentWeek(currentWeek - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentWeek(0)}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentWeek(currentWeek + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-2">
                {weekDates.map((date, index) => (
                  <div
                    key={index}
                    className={`text-center p-3 rounded-lg ${
                      isToday(date)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <div className="text-xs font-medium">{dayNames[index]}</div>
                    <div className="text-lg font-bold mt-1">
                      {date.getDate()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Sessions Grid */}
              <div className="grid grid-cols-7 gap-2">
                {weekDates.map((date, index) => {
                  const daySessions = getSessionsForDate(date);

                  return (
                    <div key={index} className="space-y-2 min-h-[100px]">
                      {daySessions.length > 0 ? (
                        daySessions.map((session) => (
                          <Card
                            key={session._id}
                            className="p-2 bg-primary/10 border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
                          >
                            <div className="text-xs font-medium truncate">
                              {session.class?.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {session.startTime}- {session.endTime}
                            </div>
                            {session.location && (
                              <div className="text-xs text-muted-foreground truncate">
                                📍 {session.location}
                              </div>
                            )}
                          </Card>
                        ))
                      ) : (
                        <div className="text-xs text-muted-foreground text-center py-4">
                          No sessions
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Schedule;
