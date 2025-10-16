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
import { Textarea } from "@/components/ui/textarea";
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
import { useAuth } from "@/context/AuthContext";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Users,
  MapPin,
  Trash2,
  Plus,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const Schedule = () => {
  const { isAdmin, currentUser } = useAuth();
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay()); // Sunday
    start.setHours(0, 0, 0, 0);
    return start;
  });

  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Form state for creating session
  const [newSession, setNewSession] = useState({
    classId: "" as Id<"classes"> | "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    notes: "",
  });

  // Calculate week end
  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(currentWeekStart.getDate() + 7);

  // Load sessions for the week
  const sessions =
    useQuery(
      api.classSessions.getSessionsForWeek,
      currentUser
        ? {
            startDate: currentWeekStart.toISOString(),
            endDate: weekEnd.toISOString(),
            instructorId: currentUser._id,
            traineeId:
              currentUser.role === "trainee" ? currentUser._id : undefined,
            role: currentUser.role,
          }
        : "skip"
    ) ?? [];

  // Load classes for dropdown
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

  const createSession = useMutation(api.classSessions.createSession);
  const deleteSession = useMutation(api.classSessions.deleteSession);

  const navigateWeek = (direction: number) => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() + direction * 7);
    setCurrentWeekStart(newStart);
  };

  const goToToday = () => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
    setCurrentWeekStart(start);
  };

  const formatWeekRange = () => {
    const end = new Date(currentWeekStart);
    end.setDate(currentWeekStart.getDate() + 6);

    const startMonth = currentWeekStart.toLocaleDateString("en-US", {
      month: "short",
    });
    const endMonth = end.toLocaleDateString("en-US", { month: "short" });
    const startDay = currentWeekStart.getDate();
    const endDay = end.getDate();

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} - ${endDay}`;
    }
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const getSessionsForDay = (date: Date) => {
    return sessions.filter((session) => {
      const sessionDate = new Date(session.startTime);
      return isSameDay(sessionDate, date);
    });
  };

  const handleViewSession = (session: any) => {
    setSelectedSession(session);
    setIsViewDialogOpen(true);
  };

  const handleDeleteSession = async () => {
    if (!selectedSession) return;

    if (confirm(`Delete this session?`)) {
      try {
        await deleteSession({ sessionId: selectedSession._id });
        setIsViewDialogOpen(false);
        setSelectedSession(null);
        alert("Session deleted!");
      } catch (error) {
        console.error("Error deleting session:", error);
        alert("Failed to delete session");
      }
    }
  };

  const handleCreateSession = async () => {
    if (
      !newSession.classId ||
      !newSession.date ||
      !newSession.startTime ||
      !newSession.endTime
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      // Combine date and time into ISO strings
      const startDateTime = new Date(
        `${newSession.date}T${newSession.startTime}`
      );
      const endDateTime = new Date(`${newSession.date}T${newSession.endTime}`);

      await createSession({
        classId: newSession.classId as Id<"classes">,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        sessionDate: startDateTime.getTime(),
        location: newSession.location || undefined,
        notes: newSession.notes || undefined,
      });

      // Reset form
      setNewSession({
        classId: "" as Id<"classes"> | "",
        date: "",
        startTime: "",
        endTime: "",
        location: "",
        notes: "",
      });
      setIsCreateDialogOpen(false);
      alert("Session created successfully!");
    } catch (error) {
      console.error("Error creating session:", error);
      alert("Failed to create session");
    }
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
          <p className="text-muted-foreground mt-1">
            Weekly class schedule and sessions
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
                Create Session
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Class Session</DialogTitle>
                <DialogDescription>
                  Schedule a new session for a class
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Select Class *</Label>
                  <Select
                    value={newSession.classId || ""}
                    onValueChange={(value) =>
                      setNewSession({
                        ...newSession,
                        classId: value as Id<"classes">,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((classItem) => (
                        <SelectItem key={classItem._id} value={classItem._id}>
                          {classItem.name} - {classItem.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {classes.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No classes available. Create a class first.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Input
                    type="date"
                    value={newSession.date}
                    onChange={(e) =>
                      setNewSession({ ...newSession, date: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time *</Label>
                    <Input
                      type="time"
                      value={newSession.startTime}
                      onChange={(e) =>
                        setNewSession({
                          ...newSession,
                          startTime: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>End Time *</Label>
                    <Input
                      type="time"
                      value={newSession.endTime}
                      onChange={(e) =>
                        setNewSession({
                          ...newSession,
                          endTime: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Location (optional)</Label>
                  <Input
                    placeholder="e.g., Studio A"
                    value={newSession.location}
                    onChange={(e) =>
                      setNewSession({ ...newSession, location: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Notes (optional)</Label>
                  <Textarea
                    placeholder="Any special notes for this session..."
                    rows={2}
                    value={newSession.notes}
                    onChange={(e) =>
                      setNewSession({ ...newSession, notes: e.target.value })
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
                  disabled={
                    !newSession.classId ||
                    !newSession.date ||
                    !newSession.startTime ||
                    !newSession.endTime
                  }
                >
                  Create Session
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Week Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Weekly Schedule
              </CardTitle>
              <CardDescription className="mt-1">
                {formatWeekRange()}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek(-1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek(1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, index) => {
              const dayDate = new Date(currentWeekStart);
              dayDate.setDate(currentWeekStart.getDate() + index);
              const daySessions = getSessionsForDay(dayDate);
              const isToday = isSameDay(dayDate, new Date());

              return (
                <Card key={index} className={isToday ? "border-primary" : ""}>
                  <CardHeader className="pb-3">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground uppercase">
                        {day}
                      </div>
                      <div
                        className={`text-2xl font-bold ${
                          isToday ? "text-primary" : ""
                        }`}
                      >
                        {dayDate.getDate()}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="min-h-[100px]">
                    {daySessions.length > 0 ? (
                      <div className="space-y-2">
                        {daySessions.map((session) => (
                          <div
                            key={session._id}
                            className="p-2 bg-muted rounded text-xs cursor-pointer hover:bg-muted/80 transition-colors"
                            onClick={() => handleViewSession(session)}
                          >
                            <div className="font-medium truncate">
                              {session.className}
                            </div>
                            <div className="text-muted-foreground mt-1">
                              {formatTime(session.startTime)}-
                              {formatTime(session.endTime)}
                            </div>
                            {session.location && (
                              <div className="text-muted-foreground flex items-center gap-1 mt-1">
                                <span>📍</span>
                                <span className="truncate">
                                  {session.location}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Session Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedSession?.className}</DialogTitle>
            <DialogDescription>{selectedSession?.classType}</DialogDescription>
          </DialogHeader>

          {selectedSession && (
            <div className="space-y-4 pt-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Time</div>
                    <div className="text-sm text-muted-foreground">
                      {formatTime(selectedSession.startTime)} -{" "}
                      {formatTime(selectedSession.endTime)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Date</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(selectedSession.startTime).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </div>
                  </div>
                </div>

                {selectedSession.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Location</div>
                      <div className="text-sm text-muted-foreground">
                        {selectedSession.location}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Instructor</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedSession.instructorName}
                    </div>
                  </div>
                </div>

                {selectedSession.notes && (
                  <div className="p-3 bg-muted rounded">
                    <div className="text-sm font-medium mb-1">Notes</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedSession.notes}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      selectedSession.status === "scheduled"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {selectedSession.status}
                  </Badge>
                </div>
              </div>

              {isAdmin && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setIsViewDialogOpen(false)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteSession}
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Schedule;
