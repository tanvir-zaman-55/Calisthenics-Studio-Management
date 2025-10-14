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
import { useAuth } from "@/context/AuthContext";
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";

// Mock schedule data
const mockSchedule = {
  Monday: [
    {
      id: "1",
      time: "9:00 AM",
      class: "Core Fundamentals",
      type: "Core",
      instructor: "Admin User",
      enrolled: 12,
      capacity: 15,
      location: "Studio A",
    },
    {
      id: "2",
      time: "6:00 PM",
      class: "Upper Body Mastery",
      type: "Upper Body",
      instructor: "Admin User",
      enrolled: 12,
      capacity: 12,
      location: "Studio A",
    },
  ],
  Tuesday: [
    {
      id: "3",
      time: "6:00 PM",
      class: "Upper Body Mastery",
      type: "Upper Body",
      instructor: "Admin User",
      enrolled: 12,
      capacity: 12,
      location: "Studio A",
    },
  ],
  Wednesday: [
    {
      id: "4",
      time: "9:00 AM",
      class: "Core Fundamentals",
      type: "Core",
      instructor: "Admin User",
      enrolled: 12,
      capacity: 15,
      location: "Studio A",
    },
    {
      id: "5",
      time: "7:00 PM",
      class: "Advanced Core",
      type: "Core",
      instructor: "Admin User",
      enrolled: 8,
      capacity: 10,
      location: "Studio B",
    },
  ],
  Thursday: [
    {
      id: "6",
      time: "6:00 PM",
      class: "Upper Body Mastery",
      type: "Upper Body",
      instructor: "Admin User",
      enrolled: 12,
      capacity: 12,
      location: "Studio A",
    },
  ],
  Friday: [
    {
      id: "7",
      time: "9:00 AM",
      class: "Core Fundamentals",
      type: "Core",
      instructor: "Admin User",
      enrolled: 12,
      capacity: 15,
      location: "Studio A",
    },
    {
      id: "8",
      time: "7:00 PM",
      class: "Advanced Core",
      type: "Core",
      instructor: "Admin User",
      enrolled: 8,
      capacity: 10,
      location: "Studio B",
    },
  ],
  Saturday: [
    {
      id: "9",
      time: "10:00 AM",
      class: "Leg Day Power",
      type: "Legs",
      instructor: "Admin User",
      enrolled: 10,
      capacity: 15,
      location: "Studio A",
    },
  ],
  Sunday: [],
};

// Trainee's enrolled classes
const traineeEnrolled = ["1", "3", "7", "9"];

const Schedule = () => {
  const { isSuperAdmin, isAdmin, isTrainee, currentUser } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedDay, setSelectedDay] = useState("Monday");

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const typeColors = {
    Core: "bg-orange-500",
    "Upper Body": "bg-cyan-500",
    Legs: "bg-pink-500",
  };

  const getCurrentDaySchedule = () => {
    const schedule = mockSchedule[selectedDay as keyof typeof mockSchedule];
    if (isTrainee) {
      // Only show classes the trainee is enrolled in
      return schedule.filter((session) => traineeEnrolled.includes(session.id));
    }
    return schedule;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
          <p className="text-muted-foreground mt-1">
            {isSuperAdmin
              ? "Manage all studio schedules"
              : isAdmin
              ? "Manage your class schedules"
              : "View your class schedule"}
          </p>
        </div>
        {isAdmin && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Session
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
        {/* Calendar Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Calendar</CardTitle>
              <CardDescription>Select a date to view schedule</CardDescription>
            </CardHeader>
            <CardContent className="p-3">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border w-full"
              />
            </CardContent>
          </Card>

          {/* Legend Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Class Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="h-3 w-3 rounded-full bg-orange-500" />
                <span>Core Day</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="h-3 w-3 rounded-full bg-cyan-500" />
                <span>Upper Body</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="h-3 w-3 rounded-full bg-pink-500" />
                <span>Legs Day</span>
              </div>
            </CardContent>
          </Card>

          {/* Trainee Summary */}
          {isTrainee && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">My Schedule Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Classes This Week</span>
                  <Badge>4 classes</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Hours</span>
                  <Badge variant="secondary">6 hours</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Next Class</span>
                  <Badge variant="outline">Mon 9:00 AM</Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Schedule View */}
        <div className="space-y-4">
          {/* Day Selector */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const currentIndex = days.indexOf(selectedDay);
                    setSelectedDay(
                      days[
                        currentIndex === 0 ? days.length - 1 : currentIndex - 1
                      ]
                    );
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-xl font-bold">{selectedDay}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const currentIndex = days.indexOf(selectedDay);
                    setSelectedDay(
                      days[
                        currentIndex === days.length - 1 ? 0 : currentIndex + 1
                      ]
                    );
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Day Pills */}
              <div className="flex flex-wrap gap-2">
                {days.map((day) => (
                  <Button
                    key={day}
                    variant={selectedDay === day ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDay(day)}
                  >
                    {day.slice(0, 3)}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sessions */}
          <div className="space-y-3">
            {getCurrentDaySchedule().length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground py-12">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-lg font-medium">No classes scheduled</p>
                  <p className="text-sm">for {selectedDay}</p>
                </CardContent>
              </Card>
            ) : (
              getCurrentDaySchedule().map((session) => (
                <Card key={session.id} className="overflow-hidden">
                  <div className="flex">
                    <div
                      className={`w-1 ${
                        typeColors[session.type as keyof typeof typeColors]
                      }`}
                    />
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-3 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-lg">
                              {session.class}
                            </h3>
                            {isTrainee &&
                              traineeEnrolled.includes(session.id) && (
                                <Badge>Enrolled</Badge>
                              )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 flex-shrink-0" />
                              <span>{session.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 flex-shrink-0" />
                              <span>{session.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 flex-shrink-0" />
                              <span>
                                {session.enrolled}/{session.capacity} enrolled
                              </span>
                            </div>
                            {(isAdmin || isSuperAdmin) && (
                              <div className="text-sm truncate">
                                Instructor: {session.instructor}
                              </div>
                            )}
                          </div>

                          {/* Progress Bar */}
                          <div className="pt-1">
                            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  typeColors[
                                    session.type as keyof typeof typeColors
                                  ]
                                }`}
                                style={{
                                  width: `${
                                    (session.enrolled / session.capacity) * 100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                          {isAdmin && (
                            <Button variant="ghost" size="sm">
                              Manage
                            </Button>
                          )}
                          {isTrainee &&
                            !traineeEnrolled.includes(session.id) && (
                              <Button size="sm">Enroll</Button>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
