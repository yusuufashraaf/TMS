import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { ProjectService, Project } from '../../../Services/project.service';
import { AuthService } from '../../../Services/auth.service';

@Component({
  selector: 'app-project-overview',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './projects.html',
  styleUrls: ['./projects.css'],
})
export class Projects implements OnInit {
  projects: Project[] = [];

  searchTerm: string = '';
  selectedStatus: string = 'All Statuses';
  selectedPriority: string = 'All Priorities';
  selectedUser: string = 'All Users';

  // Modal states
  showProjectModal = false;
  showTaskModal = false;
  isEditMode = false;

  // Current editing items
  currentProject: Project | null = null;
  currentTask: any | null = null;
  currentProjectId: string = '';

  // Form data
  projectForm: Partial<Project> = {};
  taskForm: any = {};

  // Dropdown options
  statusOptions = ['Pending', 'In Progress', 'Completed'];
  priorityOptions = ['Low', 'Medium', 'High'];
  userOptions: string[] = [];

  constructor(
    private projectService: ProjectService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  // Fetch all projects
  loadProjects(): void {
    this.projectService.getProjects(1, 50, this.searchTerm).subscribe({
      next: (res) => {
        this.projects = res.data || [];
        this.updateProjectStats();
      },
      error: (err) => console.error('Error loading projects', err),
    });
  }

  // Project CRUD
  openCreateProjectModal(): void {
    this.isEditMode = false;
    this.projectForm = {
      name: '',
      description: '',
    };
    this.showProjectModal = true;
  }

  openEditProjectModal(project: Project): void {
    this.isEditMode = true;
    this.currentProject = project;
    this.projectForm = { ...project };
    this.showProjectModal = true;
  }

  saveProject(): void {
    const user = this.authService.currentUser.value;

    if (!user) {
      console.error('No logged-in user found');
      return;
    }

    const payload: any = {
      name: this.projectForm.name,
      description: this.projectForm.description,
    };

    if (this.isEditMode && this.currentProject?._id) {
      this.projectService
        .updateProject(this.currentProject._id, payload)
        .subscribe({
          next: () => {
            this.loadProjects();
            this.closeProjectModal();
          },
          error: (err) => console.error('Error updating project', err),
        });
    } else {
      this.projectService.createProject(payload).subscribe({
        next: () => {
          this.loadProjects();
          this.closeProjectModal();
        },
        error: (err) => console.error('Error creating project', err),
      });
    }
  }

  deleteProject(projectId: string): void {
    if (confirm('Are you sure you want to delete this project?')) {
      this.projectService.deleteProject(projectId).subscribe({
        next: () => this.loadProjects(),
        error: (err) => console.error('Error deleting project', err),
      });
    }
  }

  // Task CRUD (placeholder until TaskService exists)
  openCreateTaskModal(projectId: string): void {
    this.isEditMode = false;
    this.currentProjectId = projectId;
    this.taskForm = {
      name: '',
      description: '',
      status: 'pending',
      priority: 'Medium',
      assignedUser: '',
    };
    this.showTaskModal = true;
  }

  openEditTaskModal(projectId: string, task: any): void {
    this.isEditMode = true;
    this.currentProjectId = projectId;
    this.currentTask = task;
    this.taskForm = { ...task };
    this.showTaskModal = true;
  }

  saveTask(): void {
    this.closeTaskModal();
  }

  deleteTask(projectId: string, taskId: string): void {}

  // Modal controls
  closeProjectModal(): void {
    this.showProjectModal = false;
    this.currentProject = null;
    this.projectForm = {};
  }

  closeTaskModal(): void {
    this.showTaskModal = false;
    this.currentTask = null;
    this.taskForm = {};
    this.currentProjectId = '';
  }

  // Utility
  updateProjectStats(): void {
    this.projects.forEach((project: any) => {
      project.totalTasks = project.tasks?.length || 0;
      project.completedTasks = project.tasks?.filter(
        (t: any) => t.status === 'Completed'
      ).length;
      if (project.totalTasks > 0) {
        project.progress = Math.round(
          (project.completedTasks / project.totalTasks) * 100
        );
      } else {
        project.progress = 0;
      }
    });
  }

  get filteredProjects(): Project[] {
    return this.projects.filter((project) => {
      const matchesSearch =
        !this.searchTerm ||
        project.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        project.description
          ?.toLowerCase()
          .includes(this.searchTerm.toLowerCase());
      return matchesSearch;
    });
  }
}
