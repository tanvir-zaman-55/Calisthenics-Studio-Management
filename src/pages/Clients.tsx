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
  Users,
  Search,
  UserPlus,
  Filter,
  Mail,
  Phone,
  ArrowRight,
  Dumbbell,
  Eye,
} from "lucide-react";

// Mock client data
const mockClients = [
  {
    id: "1",
    name: "Ahmed Hassan",
    email: "ahmed@example.com",
    phone: "+880 1234 567890",
    status: "Active",
    joinDate: "2024-01-15",
    classes: 12,
  },
  {
    id: "2",
    name: "Sara Ibrahim",
    email: "sara@example.com",
    phone: "+880 1234 567891",
    status: "Active",
    joinDate: "2024-02-20",
    classes: 8,
  },
  {
    id: "3",
    name: "Mohamed Ali",
    email: "mohamed@example.com",
    phone: "+880 1234 567892",
    status: "Inactive",
    joinDate: "2023-12-10",
    classes: 3,
  },
  {
    id: "4",
    name: "Fatima Nour",
    email: "fatima@example.com",
    phone: "+880 1234 567893",
    status: "Active",
    joinDate: "2024-03-05",
    classes: 15,
  },
  {
    id: "5",
    name: "Omar Khalil",
    email: "omar@example.com",
    phone: "+880 1234 567894",
    status: "Active",
    joinDate: "2024-01-28",
    classes: 10,
  },
];

const Clients = () => {
  const { isSuperAdmin, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedWorkout, setSelectedWorkout] = useState("");

  const availableWorkouts = [
    { id: "t1", name: "Beginner Core Fundamentals", type: "Core" },
    { id: "t2", name: "Upper Body Power", type: "Upper Body" },
    { id: "t3", name: "Leg Day Intense", type: "Legs" },
  ];

  const handleAssignWorkout = () => {
    console.log(
      "Assigning workout:",
      selectedWorkout,
      "to client:",
      selectedClient?.id
    );
    setIsAssignDialogOpen(false);
    setSelectedWorkout("");
    setSelectedClient(null);
  };

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Adding new client");
    setIsAddClientDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground mt-1">
            {isSuperAdmin
              ? "Manage all trainees across the studio"
              : "View and manage your assigned trainees"}
          </p>
        </div>
        {isAdmin && (
          <Dialog
            open={isAddClientDialogOpen}
            onOpenChange={setIsAddClientDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
                <DialogDescription>
                  Create a new trainee account
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddClient}>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="John Doe" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+880 1234 567890"
                      required
                    />
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddClientDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Add Client</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isSuperAdmin ? "127" : "45"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isSuperAdmin ? "All trainees" : "Your trainees"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isSuperAdmin ? "115" : "42"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently enrolled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              New This Month
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isSuperAdmin ? "18" : "7"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Classes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">9.5</div>
            <p className="text-xs text-muted-foreground mt-1">
              Per client/month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Clients</CardTitle>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients by name or email..."
                className="pl-9"
              />
            </div>
          </div>

          {/* Client List */}
          <div className="space-y-3">
            {mockClients.map((client) => (
              <div
                key={client.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer group"
                onClick={() => navigate(`/clients/${client.id}`)}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium">{client.name}</h3>
                      <Badge
                        variant={
                          client.status === "Active" ? "default" : "secondary"
                        }
                      >
                        {client.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {client.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {client.phone}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-center hidden sm:block">
                    <div className="text-sm font-medium">{client.classes}</div>
                    <div className="text-xs text-muted-foreground">classes</div>
                  </div>
                  <div className="text-right hidden md:block">
                    <div className="text-xs text-muted-foreground">Joined</div>
                    <div className="text-sm font-medium">
                      {new Date(client.joinDate).toLocaleDateString()}
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClient(client);
                          setIsAssignDialogOpen(true);
                        }}
                      >
                        <Dumbbell className="h-3 w-3 mr-1" />
                        Assign
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/clients/${client.id}`);
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  )}
                  {!isAdmin && (
                    <Button variant="ghost" size="icon">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Assign Workout Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Workout to {selectedClient?.name}</DialogTitle>
            <DialogDescription>
              Quickly assign a workout template to this trainee
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Workout Template</Label>
              <Select
                value={selectedWorkout}
                onValueChange={setSelectedWorkout}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select workout" />
                </SelectTrigger>
                <SelectContent>
                  {availableWorkouts.map((workout) => (
                    <SelectItem key={workout.id} value={workout.id}>
                      {workout.name} ({workout.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAssignDialogOpen(false);
                setSelectedClient(null);
                setSelectedWorkout("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignWorkout} disabled={!selectedWorkout}>
              Assign Workout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Super Admin Only Section */}
      {isSuperAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Admin Management</CardTitle>
            <CardDescription>
              Assign clients to admins or update admin permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              <p>This section is only visible to Super Admins.</p>
              <p className="mt-2">Here you can:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Assign clients to specific admins</li>
                <li>View admin performance metrics</li>
                <li>Manage admin permissions</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Clients;
