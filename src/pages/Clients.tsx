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
import { useAuth } from "@/context/AuthContext";
import {
  Users,
  Search,
  UserPlus,
  Filter,
  MoreVertical,
  Mail,
  Phone,
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
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
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
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{client.name}</h3>
                      <Badge
                        variant={
                          client.status === "Active" ? "default" : "secondary"
                        }
                      >
                        {client.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
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
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {client.classes} classes
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Joined {new Date(client.joinDate).toLocaleDateString()}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
