"use client";

import React, { useState, useEffect } from "react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { googleSheetsService } from "@/services/googleSheetsService";
import {
  Settings as SettingsIcon,
  Check,
  X,
  RefreshCw,
  Download,
  Upload,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Trash2,
} from "lucide-react";

const Settings = () => {
  const { isSuperAdmin, isAdmin } = useAuth();
  const [sheetId, setSheetId] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [importStats, setImportStats] = useState({
    exercises: 0,
    templates: 0,
  });

  useEffect(() => {
    // Load saved sheet ID
    const savedSheetId = localStorage.getItem("google_sheet_id");
    if (savedSheetId) {
      setSheetId(savedSheetId);
      googleSheetsService.setSheetId(savedSheetId);
    }

    // Load last sync time
    const savedSync = localStorage.getItem("last_sync_time");
    if (savedSync) {
      setLastSync(savedSync);
    }

    // Load import stats
    const exercises = googleSheetsService.getCachedExercises();
    const templates = googleSheetsService.getCachedWorkoutTemplates();
    setImportStats({
      exercises: exercises.length,
      templates: templates.length,
    });
  }, []);

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      googleSheetsService.setSheetId(sheetId);
      const result = await googleSheetsService.testConnection();
      setIsConnected(result);
      if (result) {
        localStorage.setItem("google_sheet_id", sheetId);
      }
    } catch (error) {
      console.error("Connection failed:", error);
      setIsConnected(false);
    } finally {
      setIsTesting(false);
    }
  };

  const handleImportData = async () => {
    setIsImporting(true);
    try {
      const exercises = await googleSheetsService.importExercises();
      const templates = await googleSheetsService.importWorkoutTemplates();

      setImportStats({
        exercises: exercises.length,
        templates: templates.length,
      });

      const syncTime = new Date().toISOString();
      setLastSync(syncTime);
      localStorage.setItem("last_sync_time", syncTime);

      alert(
        `Successfully imported ${exercises.length} exercises and ${templates.length} workout templates!`
      );
    } catch (error) {
      console.error("Import failed:", error);
      alert("Import failed. Please check your sheet configuration.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportProgress = () => {
    googleSheetsService.downloadProgressCSV();
  };

  const handleClearCache = () => {
    if (confirm("Are you sure you want to clear all cached data?")) {
      googleSheetsService.clearCache();
      setImportStats({ exercises: 0, templates: 0 });
      setLastSync(null);
      localStorage.removeItem("last_sync_time");
    }
  };

  if (!isAdmin) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You don't have permission to access settings.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure Google Sheets integration and manage data sync
        </p>
      </div>

      {/* Google Sheets Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Google Sheets Integration</CardTitle>
              <CardDescription>
                Connect your Google Sheet to import exercises and export
                progress
              </CardDescription>
            </div>
            {isConnected && (
              <Badge variant="default">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sheet-id">Google Sheet ID</Label>
            <div className="flex gap-2">
              <Input
                id="sheet-id"
                placeholder="1AbC...XyZ (from sheet URL)"
                value={sheetId}
                onChange={(e) => setSheetId(e.target.value)}
              />
              <Button
                onClick={handleTestConnection}
                disabled={!sheetId || isTesting}
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    {isConnected ? (
                      <Check className="h-4 w-4 mr-2" />
                    ) : (
                      <X className="h-4 w-4 mr-2" />
                    )}
                    Test Connection
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Find this in your Google Sheet URL:
              docs.google.com/spreadsheets/d/<strong>[THIS_PART]</strong>/edit
            </p>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Setup Required</AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-1 text-sm">
                <p>To use Google Sheets integration:</p>
                <ol className="list-decimal list-inside space-y-1 mt-2">
                  <li>Follow the setup guide to configure API access</li>
                  <li>Add your Sheet ID above</li>
                  <li>Test the connection</li>
                  <li>Import your data</li>
                </ol>
                <a
                  href="#"
                  className="text-primary hover:underline inline-flex items-center gap-1 mt-2"
                >
                  View Setup Guide
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Data Sync */}
      <Card>
        <CardHeader>
          <CardTitle>Data Synchronization</CardTitle>
          <CardDescription>
            Import exercises and templates, export client progress
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Import from Sheets</h3>
              <p className="text-xs text-muted-foreground">
                Pull exercises and workout templates from your Google Sheet
              </p>
              <Button
                onClick={handleImportData}
                disabled={!isConnected || isImporting}
                className="w-full"
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Data
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Export to CSV</h3>
              <p className="text-xs text-muted-foreground">
                Download client progress data to upload to your sheet manually
              </p>
              <Button
                onClick={handleExportProgress}
                variant="outline"
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Progress
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="text-sm font-medium">Import Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {importStats.exercises}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Exercises imported
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {importStats.templates}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Workout templates
                  </p>
                </CardContent>
              </Card>
            </div>

            {lastSync && (
              <p className="text-xs text-muted-foreground">
                Last synced: {new Date(lastSync).toLocaleString()}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Options */}
      {isSuperAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Advanced Options</CardTitle>
            <CardDescription>
              Manage cached data and reset configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="text-sm font-medium">Clear Cached Data</h3>
                <p className="text-xs text-muted-foreground">
                  Remove all imported exercises, templates, and progress data
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearCache}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cache
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>Sheet not connecting?</strong> Make sure the Sheet ID is
            correct and you've completed the API setup.
          </p>
          <p>
            <strong>Import failing?</strong> Check that your sheet has the
            correct column headers and tab names.
          </p>
          <p>
            <strong>Need to update data?</strong> Edit your Google Sheet and
            click "Import Data" again to refresh.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
