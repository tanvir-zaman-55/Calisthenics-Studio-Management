"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  Users,
  Dumbbell,
  TrendingUp,
  Calendar,
  Activity,
  Clock,
  Target,
  Award,
  ArrowRight,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { isSuperAdmin, isAdmin, isTrainee, currentUser } = useAuth();
  const navigate = useNavigate();

  // Load dashboard stats based on role
  const adminStats = useQuery(
    api.dashboard.getAdminDashboardStats,
    isAdmin || isSuperAdmin
      ? {
          adminId: currentUser?._id,
          role: currentUser?.role,
        }
      : "skip"
  );

  const traineeStats = useQuery(
    api.dashboard.getTraineeDashboardStats,
    currentUser && isTrainee ? { traineeId: currentUser._id } : "skip"
  );

  const recentActivity = useQuery(
    api.dashboard.getRecentActivity,
    currentUser
      ? {
          limit: 5,
          adminId: currentUser._id,
          role: currentUser.role,
        }
      : "skip"
  );

  if (isTrainee) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {currentUser?.name}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's your training overview
          </p>
        </div>

        {/* Trainee Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Workouts
              </CardTitle>
              <Dumbbell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {traineeStats?.activeWorkouts ?? 0}
              </div>
              <p className="text-xs text-muted-foreground">Assigned programs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Enrolled Classes
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {traineeStats?.enrolledClasses ?? 0}
              </div>
              <p className="text-xs text-muted-foreground">Active classes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {traineeStats?.workoutsThisWeek ?? 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Workouts completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {traineeStats?.totalMinutes ?? 0}
              </div>
              <p className="text-xs text-muted-foreground">Minutes trained</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with your training</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full justify-between"
                onClick={() => navigate("/workouts")}
              >
                <span>Start Today's Workout</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => navigate("/schedule")}
              >
                <span>View Schedule</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => navigate("/classes")}
              >
                <span>Browse Classes</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
              <CardDescription>Track your improvements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Weekly Goal</span>
                  </div>
                  <span className="text-sm font-medium">
                    {traineeStats?.workoutsThisWeek ?? 0}/3 workouts
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Measurements</span>
                  </div>
                  <span className="text-sm font-medium">
                    {traineeStats?.totalMeasurements ?? 0} recorded
                  </span>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View Full Progress
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Admin/Super Admin Dashboard
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isSuperAdmin ? "Studio Overview" : "Dashboard"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isSuperAdmin
            ? "Complete studio management and analytics"
            : "Manage your trainees and classes"}
        </p>
      </div>

      {/* Admin Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Trainees
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {adminStats?.totalTrainees ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +{adminStats?.recentEnrollments ?? 0} this week
            </p>
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
              {adminStats?.activeWorkouts ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +{adminStats?.recentAssignments ?? 0} assigned this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Classes
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {adminStats?.activeClasses ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {adminStats?.totalEnrollments ?? 0} total enrollments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Exercise Library
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {adminStats?.totalExercises ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {adminStats?.totalTemplates ?? 0} templates
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your studio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity && recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 text-sm border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {activity.type === "workout_assigned" ? (
                        <Dumbbell className="h-4 w-4 text-primary" />
                      ) : (
                        <Calendar className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      {activity.type === "workout_assigned" ? (
                        <>
                          <p className="font-medium">
                            {activity.assignedByName} assigned{" "}
                            <span className="text-primary">
                              {activity.templateName}
                            </span>{" "}
                            to {activity.traineeName}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-medium">
                            {activity.traineeName} enrolled in{" "}
                            <span className="text-primary">
                              {activity.className}
                            </span>
                          </p>
                        </>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent activity
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your studio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              className="w-full justify-between"
              onClick={() => navigate("/workouts")}
            >
              <span>Manage Workouts</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => navigate("/classes")}
            >
              <span>Manage Classes</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => navigate("/clients")}
            >
              <span>View Clients</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
