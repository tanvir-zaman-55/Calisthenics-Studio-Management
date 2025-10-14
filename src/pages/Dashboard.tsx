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
  Users,
  ClipboardList,
  Calendar,
  TrendingUp,
  Shield,
  UserCog,
  Dumbbell,
  Target,
} from "lucide-react";

const Dashboard = () => {
  const { currentUserRole, currentUser, isSuperAdmin, isAdmin, isTrainee } =
    useAuth();

  // Role-specific stats
  const superAdminStats = [
    {
      title: "Total Admins",
      value: "5",
      icon: UserCog,
      description: "Active administrators",
    },
    {
      title: "Total Trainees",
      value: "127",
      icon: Users,
      description: "Enrolled members",
    },
    {
      title: "Total Classes",
      value: "18",
      icon: ClipboardList,
      description: "Active classes",
    },
    {
      title: "Revenue",
      value: "$12,450",
      icon: TrendingUp,
      description: "This month",
    },
  ];

  const adminStats = [
    {
      title: "My Trainees",
      value: "45",
      icon: Users,
      description: "Assigned to you",
    },
    {
      title: "Classes Today",
      value: "4",
      icon: ClipboardList,
      description: "Scheduled sessions",
    },
    {
      title: "This Week",
      value: "28",
      icon: Calendar,
      description: "Total sessions",
    },
    {
      title: "Attendance",
      value: "92%",
      icon: TrendingUp,
      description: "Average rate",
    },
  ];

  const traineeStats = [
    {
      title: "Classes This Week",
      value: "5",
      icon: Calendar,
      description: "Completed: 3/5",
    },
    {
      title: "Workout Streak",
      value: "12 days",
      icon: Target,
      description: "Keep it up!",
    },
    {
      title: "Total Workouts",
      value: "48",
      icon: Dumbbell,
      description: "This month",
    },
    {
      title: "Progress",
      value: "85%",
      icon: TrendingUp,
      description: "Goal completion",
    },
  ];

  const getStats = () => {
    if (isSuperAdmin) return superAdminStats;
    if (isAdmin) return adminStats;
    return traineeStats;
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {currentUser?.name}
          </p>
        </div>
        <Badge
          variant={isSuperAdmin ? "default" : isAdmin ? "secondary" : "outline"}
          className="text-sm"
        >
          <Shield className="h-3 w-3 mr-1" />
          {currentUserRole.replace("_", " ").toUpperCase()}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Role-Specific Content */}
      {isSuperAdmin && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
              <CardDescription>
                Manage admins and monitor system health
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Admins</span>
                  <Badge variant="secondary">5</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pending Approvals</span>
                  <Badge variant="destructive">2</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">System Status</span>
                  <Badge variant="default">Healthy</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <button className="w-full text-left text-sm p-2 rounded hover:bg-accent">
                  Add New Admin
                </button>
                <button className="w-full text-left text-sm p-2 rounded hover:bg-accent">
                  View All Trainees
                </button>
                <button className="w-full text-left text-sm p-2 rounded hover:bg-accent">
                  Generate Reports
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isAdmin && !isSuperAdmin && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>Your classes for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 border rounded">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Core Training</p>
                    <p className="text-xs text-muted-foreground">
                      9:00 AM - 10:30 AM
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 border rounded">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Upper Body</p>
                    <p className="text-xs text-muted-foreground">
                      2:00 PM - 3:30 PM
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates from your trainees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">No recent activity</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isTrainee && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>My Schedule</CardTitle>
              <CardDescription>Upcoming classes and workouts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 border rounded">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Legs Day</p>
                    <p className="text-xs text-muted-foreground">
                      Tomorrow, 6:00 PM
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 border rounded">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Core Training</p>
                    <p className="text-xs text-muted-foreground">
                      Friday, 6:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Progress</CardTitle>
              <CardDescription>Track your fitness journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Weekly Goal</span>
                    <span className="text-sm font-medium">3/5 classes</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: "60%" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Monthly Goal</span>
                    <span className="text-sm font-medium">12/20 workouts</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: "60%" }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// Helper component
const Clock = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export default Dashboard;
