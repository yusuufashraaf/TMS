import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TaskService, Task, TaskStats } from '../../../Services/task.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard implements OnInit {
  @ViewChild('donutChart', { static: false }) donutChart!: ElementRef;

  dashboardData: TaskStats = {
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    tasksThisMonth: 0,
    priorityData: [
      { name: 'High', value: 0 },
      { name: 'Medium', value: 0 },
      { name: 'Low', value: 0 },
    ],
  };

  recentActivities: Task[] = [];

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Fetch task stats
    this.taskService.getTaskStats().subscribe({
      next: (stats) => {
        this.dashboardData = stats;
      },
      error: (err) => console.error('Failed to load task stats', err),
    });

    // Fetch recent tasks (limit to 7 latest)
    this.taskService.getAllTasks({ page: 1, limit: 7 }).subscribe({
      next: (res) => {
        this.recentActivities = res.tasks;
      },
      error: (err) => console.error('Failed to load recent tasks', err),
    });
  }

  getCompletionPercentage(): number {
    if (this.dashboardData.totalTasks === 0) return 0;
    return Math.round(
      (this.dashboardData.completedTasks / this.dashboardData.totalTasks) * 100
    );
  }

  getMaxPriorityValue(): number {
    const max = Math.max(
      ...this.dashboardData.priorityData.map((p) => p.value)
    );
    return max > 0 ? max : 1;
  }
  getAssignedNames(task: Task): string {
    if (!task.assignedTo) return '-';

    const assignedArray = Array.isArray(task.assignedTo)
      ? task.assignedTo
      : [task.assignedTo];

    if (assignedArray.length === 0) return '-';

    return assignedArray.map((a) => a.name).join(', ');
  }

  // Donut chart calculations
  getCompletedArc(): string {
    const circumference = 2 * Math.PI * 80;
    const completedPercentage =
      this.dashboardData.completedTasks / this.dashboardData.totalTasks || 0;
    return `${circumference * completedPercentage} ${circumference}`;
  }

  getPendingArc(): string {
    const circumference = 2 * Math.PI * 80;
    const pendingPercentage =
      this.dashboardData.pendingTasks / this.dashboardData.totalTasks || 0;
    return `${circumference * pendingPercentage} ${circumference}`;
  }

  getCompletedArcLength(): number {
    const circumference = 2 * Math.PI * 80;
    const completedPercentage =
      this.dashboardData.completedTasks / this.dashboardData.totalTasks || 0;
    return -(circumference * completedPercentage);
  }

  trackByTaskId(index: number, task: Task): string {
    return task._id!;
  }

  refreshDashboard(): void {
    this.loadDashboardData();
  }
}
