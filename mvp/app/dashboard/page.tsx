"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DepartmentCard } from "@/components/department-card";
import { ActivityFeed } from "@/components/activity-feed";
import { OverviewTab } from "@/components/overview-tab";
import { OutputsTab } from "@/components/outputs-tab";
import { mockProject, type Project, type Activity } from "@/lib/mock-data";
import {
  Settings,
  Download,
  Clock,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [project, setProject] = useState<Project>(mockProject);
  const [activities, setActivities] = useState<Activity[]>(mockProject.activities);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate progress updates
      setProject((prev) => {
        const newProject = { ...prev };

        // Update running departments
        newProject.departments = newProject.departments.map((dept) => {
          if (dept.status === "running" && dept.progress < 100) {
            return {
              ...dept,
              progress: Math.min(dept.progress + Math.random() * 3, 100)
            };
          }
          return dept;
        });

        // Update overall progress
        const totalProgress =
          newProject.departments.reduce((sum, d) => sum + d.progress, 0) /
          newProject.departments.length;
        newProject.overallProgress = Math.round(totalProgress);

        return newProject;
      });

      // Occasionally add new activities
      if (Math.random() > 0.7) {
        const runningDept = project.departments.find(
          (d) => d.status === "running"
        );
        if (runningDept) {
          const workingAgent = runningDept.agents.find(
            (a) => a.status === "working"
          );
          if (workingAgent) {
            const newActivity: Activity = {
              id: `act_${Date.now()}`,
              timestamp: "just now",
              departmentId: runningDept.id,
              departmentName: runningDept.name,
              message: `${workingAgent.name} is making progress...`,
              type: "info",
              agentName: workingAgent.name
            };
            setActivities((prev) => [newActivity, ...prev]);
          }
        }
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [project.departments]);

  const completedDepts = project.departments.filter(
    (d) => d.status === "completed"
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">
                  🎯 openpreneurship - {project.name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {project.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <div className="text-sm text-muted-foreground">
                  Overall Progress
                </div>
                <div className="text-2xl font-bold">
                  {project.overallProgress}%
                </div>
              </div>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Export All
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {project.timeElapsed} elapsed
                </span>
                <span className="text-muted-foreground">
                  {completedDepts}/{project.departments.length} departments
                  completed
                </span>
              </div>
              <span className="font-medium">{project.overallProgress}%</span>
            </div>
            <Progress value={project.overallProgress} className="h-3" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="departments" className="space-y-6">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 md:grid-cols-3">
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="outputs">Outputs</TabsTrigger>
          </TabsList>

          {/* Departments Tab (Main View) */}
          <TabsContent value="departments" className="space-y-6">
            {/* Department Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {project.departments.map((dept) => (
                <DepartmentCard key={dept.id} department={dept} />
              ))}
            </div>

            {/* Activity Feed */}
            <ActivityFeed activities={activities} maxHeight="400px" />
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <OverviewTab project={project} />
          </TabsContent>

          {/* Outputs Tab */}
          <TabsContent value="outputs">
            <OutputsTab project={project} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer Stats */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-6">
              <span>{project.totalAgents} agents working</span>
              <span>{project.totalOutputs} outputs generated</span>
              <span>{project.toolsConnected} tools connected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span>System operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
