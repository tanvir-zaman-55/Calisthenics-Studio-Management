"use client";

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import {
  Home,
  Users,
  Calendar,
  ClipboardList,
  ArrowRight,
  Dumbbell,
  Target,
  TrendingUp,
} from "lucide-react";

const Index = () => {
  const { currentUser, currentUserRole, isSuperAdmin, isAdmin, isTrainee } =
    useAuth();

  const features = [
    {
      icon: Users,
      title: "Client Management",
      description: "Track and manage all your trainees",
      link: "/clients",
      roles: ["super_admin", "admin"],
    },
    {
      icon: ClipboardList,
      title: "Class Management",
      description: "Organize and schedule your classes",
      link: "/classes",
      roles: ["super_admin", "admin"],
    },
    {
      icon: Calendar,
      title: "Schedule",
      description: "View and manage your schedule",
      link: "/schedule",
      roles: ["super_admin", "admin", "trainee"],
    },
    {
      icon: Target,
      title: "Progress Tracking",
      description: "Monitor your fitness journey",
      link: "/dashboard",
      roles: ["trainee"],
    },
  ];

  const getRoleMessage = () => {
    if (isSuperAdmin) {
      return {
        title: "Welcome, Super Admin!",
        description:
          "You have full access to all features and can manage admins and the entire studio.",
      };
    }
    if (isAdmin) {
      return {
        title: "Welcome, Admin!",
        description:
          "Manage your trainees, classes, and schedules efficiently.",
      };
    }
    return {
      title: "Welcome to Your Fitness Journey!",
      description:
        "Track your classes, monitor progress, and achieve your calisthenics goals.",
    };
  };

  const roleMessage = getRoleMessage();

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Dumbbell className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Calisthenics Studio</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {roleMessage.description}
        </p>
        <div className="flex items-center justify-center gap-2">
          <Badge
            variant={
              isSuperAdmin ? "default" : isAdmin ? "secondary" : "outline"
            }
          >
            {currentUserRole.replace("_", " ").toUpperCase()}
          </Badge>
          <span className="text-sm text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">
            {currentUser?.name}
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-center gap-4">
        <Button asChild size="lg">
          <Link to="/dashboard">
            <Home className="h-5 w-5 mr-2" />
            Go to Dashboard
          </Link>
        </Button>
        {(isAdmin || isSuperAdmin) && (
          <Button asChild size="lg" variant="outline">
            <Link to="/clients">
              <Users className="h-5 w-5 mr-2" />
              Manage Clients
            </Link>
          </Button>
        )}
        {isTrainee && (
          <Button asChild size="lg" variant="outline">
            <Link to="/schedule">
              <Calendar className="h-5 w-5 mr-2" />
              My Schedule
            </Link>
          </Button>
        )}
      </div>

      {/* Features Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
        {features
          .filter((feature) => feature.roles.includes(currentUserRole))
          .map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="ghost" className="w-full">
                    <Link to={feature.link}>
                      Explore
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
      </div>

      {/* Role-Specific Stats */}
      {isSuperAdmin && (
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
            <CardDescription>
              Quick glance at your studio's performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold">5</div>
                <div className="text-sm text-muted-foreground">
                  Active Admins
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold">127</div>
                <div className="text-sm text-muted-foreground">
                  Total Trainees
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold">18</div>
                <div className="text-sm text-muted-foreground">
                  Active Classes
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isAdmin && !isSuperAdmin && (
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Your Overview</CardTitle>
            <CardDescription>
              Your classes and trainees at a glance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold">45</div>
                <div className="text-sm text-muted-foreground">
                  Your Trainees
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold">12</div>
                <div className="text-sm text-muted-foreground">
                  Your Classes
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold">92%</div>
                <div className="text-sm text-muted-foreground">Attendance</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isTrainee && (
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
            <CardDescription>Keep up the great work!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold">12</div>
                <div className="text-sm text-muted-foreground">Day Streak</div>
              </div>
              <div>
                <div className="text-3xl font-bold">5</div>
                <div className="text-sm text-muted-foreground">
                  Classes/Week
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold">85%</div>
                <div className="text-sm text-muted-foreground">
                  Goal Complete
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Banner */}
      <div className="max-w-3xl mx-auto">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <TrendingUp className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">
                  {isTrainee ? "Stay Consistent!" : "Manage Efficiently!"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isTrainee
                    ? "Regular training is key to progress. Check your schedule and never miss a session!"
                    : "Use our comprehensive tools to manage your studio and help your trainees achieve their goals."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
