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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useAuth } from "@/context/AuthContext";
import { UserPlus, Shield, Users, Mail, Phone, Calendar } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const Admins = () => {
  const { currentUser } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Load admins
  const admins = useQuery(api.user.getUsersByRole, { role: "admin" }) ?? [];

  const createUser = useMutation(api.user.createUser);

  // Form state
  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const handleCreateAdmin = async () => {
    if (!currentUser) return;

    try {
      await createUser({
        name: newAdmin.name,
        email: newAdmin.email,
        phone: newAdmin.phone,
        role: "admin",
      });

      setNewAdmin({
        name: "",
        email: "",
        phone: "",
      });
      setIsDialogOpen(false);
      alert("Admin added successfully!");
    } catch (error) {
      console.error("Error creating admin:", error);
      alert("Failed to add admin");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Get stats for each admin
  const getAdminStats = async (adminId: string) => {
    // This would need additional queries - placeholder for now
    return {
      trainees: 0,
      classes: 0,
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Admin Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage coaches and administrators
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Admin</DialogTitle>
              <DialogDescription>
                Add a new coach or administrator
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Jane Smith"
                  value={newAdmin.name}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jane@example.com"
                  value={newAdmin.email}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="+1 (555) 000-0000"
                  value={newAdmin.phone}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, phone: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateAdmin}
                disabled={!newAdmin.name || !newAdmin.email}
              >
                Add Admin
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{admins.length}</div>
            <p className="text-xs text-muted-foreground">Active coaches</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Joins</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                admins.filter(
                  (a) => a._creationTime > Date.now() - 30 * 24 * 60 * 60 * 1000
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Role</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Admin</div>
            <p className="text-xs text-muted-foreground">Permission level</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin List */}
      <Card>
        <CardHeader>
          <CardTitle>All Admins</CardTitle>
          <CardDescription>Manage coaches and administrators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {admins.map((admin) => (
              <Card
                key={admin._id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={admin.profileImage} />
                      <AvatarFallback>{getInitials(admin.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{admin.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          Admin
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{admin.email}</span>
                      </div>
                      {admin.phone && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{admin.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="text-xs text-muted-foreground">
                      Joined{" "}
                      {new Date(admin._creationTime).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {admins.length === 0 && (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-semibold">No admins found</h3>
              <p className="text-muted-foreground">
                Add your first admin to get started
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Admins;
