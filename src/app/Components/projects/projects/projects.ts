import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { ProjectService, Project } from '../../../Services/project.service';
import { TaskService, Task } from '../../../Services/task.service';
import { AuthService } from '../../../Services/auth.service';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { PdfService } from '../../../Services/pdf.service';

@Component({
  selector: 'app-project-overview',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './projects.html',
  styleUrls: ['./projects.css'],
})
export class Projects implements OnInit {
  notification = {
    show: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info',
  };

  projects: Project[] = [];
  searchTerm: string = '';
  selectedStatus: string = 'All Statuses';
  selectedPriority: string = 'All Priorities';
  selectedUser: string = 'All Users';

  showProjectModal = false;
  showTaskModal = false;
  isEditMode = false;

  currentProject: Project | null = null;
  currentTask: Task | null = null;
  currentProjectId: string = '';

  projectForm: Partial<Project> = {};
  taskForm: Partial<Task> = {};

  projectError: string = '';
  taskError: string = '';
  taskFormErrors: { [key: string]: string } = {};
  projectFormErrors: { [key: string]: string } = {};

  // Add validation states
  projectFormTouched: { [key: string]: boolean } = {};
  taskFormTouched: { [key: string]: boolean } = {};

  statusOptions = ['Pending', 'In Progress', 'Completed'];
  priorityOptions = ['Low', 'Medium', 'High'];
  userOptions: { _id: string; name: string }[] = [];

  constructor(
    private projectService: ProjectService,
    private taskService: TaskService,
    private authService: AuthService,
    private pdfService: PdfService
  ) {}
  ngOnInit(): void {
    this.loadUsers().then(() => {
      this.loadProjects();
    });
  }

  private showNotification(
    message: string,
    type: 'success' | 'error' | 'info'
  ) {
    this.notification = { show: true, message, type };
    setTimeout(() => this.hideNotification(), 3000);
  }

  private hideNotification() {
    this.notification.show = false;
  }

  // ================= Validation Methods =================
  validateProjectField(fieldName: string): string {
    if (!this.projectFormTouched[fieldName]) return '';

    const value = (this.projectForm as any)[fieldName];

    switch (fieldName) {
      case 'name':
        if (!value || value.trim() === '') {
          return 'Project name is required';
        }
        if (value.length < 3) {
          return 'Project name must be at least 3 characters long';
        }
        if (value.length > 100) {
          return 'Project name cannot exceed 100 characters';
        }
        break;

      case 'description':
        if (!value || value.trim() === '') {
          return 'Project description is required';
        }
        if (value.length < 10) {
          return 'Description must be at least 10 characters long';
        }
        if (value.length > 500) {
          return 'Description cannot exceed 500 characters';
        }
        break;
    }

    return '';
  }

  validateTaskField(fieldName: string): string {
    if (!this.taskFormTouched[fieldName]) return '';

    const value = (this.taskForm as any)[fieldName];

    switch (fieldName) {
      case 'title':
        if (!value || value.trim() === '') {
          return 'Task title is required';
        }
        if (value.length < 3) {
          return 'Task title must be at least 3 characters long';
        }
        if (value.length > 100) {
          return 'Task title cannot exceed 100 characters';
        }
        break;

      case 'description':
        if (!value || value.trim() === '') {
          return 'Task description is required';
        }
        if (value.length < 5) {
          return 'Description must be at least 5 characters long';
        }
        if (value.length > 500) {
          return 'Description cannot exceed 500 characters';
        }
        break;

      case 'status':
        if (!value || value.trim() === '') {
          return 'Status is required';
        }
        if (!this.statusOptions.includes(value)) {
          return 'Please select a valid status';
        }
        break;

      case 'priority':
        if (!value || value.trim() === '') {
          return 'Priority is required';
        }
        if (!this.priorityOptions.includes(value)) {
          return 'Please select a valid priority';
        }
        break;

      case 'assignedTo':
        if (!value || value.trim() === '') {
          return 'Assigned user is required';
        }
        break;

      case 'deadline':
        if (value) {
          const deadlineDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (deadlineDate < today) {
            return 'Deadline cannot be in the past';
          }
        }
        break;
    }

    return '';
  }

  isProjectFormValid(): boolean {
    const nameError = this.validateProjectField('name');
    const descriptionError = this.validateProjectField('description');
    return !nameError && !descriptionError;
  }

  isTaskFormValid(): boolean {
    const titleError = this.validateTaskField('title');
    const descriptionError = this.validateTaskField('description');
    const statusError = this.validateTaskField('status');
    const priorityError = this.validateTaskField('priority');
    const assignedToError = this.validateTaskField('assignedTo');
    const deadlineError = this.validateTaskField('deadline');

    return (
      !titleError &&
      !descriptionError &&
      !statusError &&
      !priorityError &&
      !assignedToError &&
      !deadlineError
    );
  }

  onProjectFieldBlur(fieldName: string): void {
    this.projectFormTouched[fieldName] = true;
  }

  onTaskFieldBlur(fieldName: string): void {
    this.taskFormTouched[fieldName] = true;
  }

  onProjectFieldInput(fieldName: string): void {
    // Clear server-side errors when user starts typing
    if (this.projectFormErrors[fieldName]) {
      delete this.projectFormErrors[fieldName];
    }
  }

  onTaskFieldInput(fieldName: string): void {
    // Clear server-side errors when user starts typing
    if (this.taskFormErrors[fieldName]) {
      delete this.taskFormErrors[fieldName];
    }
  }

  // ================= Project Methods =================
  loadProjects(): void {
    this.projectService.getProjects(1, 50, this.searchTerm).subscribe({
      next: (res) => {
        this.projects = res.data || [];

        const tasksObservables = this.projects.map((project) =>
          this.taskService
            .getTasksByProject(project._id!)
            .pipe(map((res: { tasks: Task[] }) => res.tasks))
        );

        forkJoin(tasksObservables).subscribe({
          next: (tasksArray: Task[][]) => {
            tasksArray.forEach((tasks: Task[], index: number) => {
              const project = this.projects[index];
              project.tasks = tasks
                .filter((t) => {
                  const pid =
                    typeof t.projectId === 'string'
                      ? t.projectId
                      : t.projectId?._id;
                  return pid === project._id;
                })
                .map((t) => ({
                  ...t,
                  assignedUserName:
                    this.userOptions.find((u) => u._id === t.assignedTo)
                      ?.name || 'Unassigned',
                }));
            });

            this.updateProjectStats();
          },
          error: (err) => console.error('Error loading project tasks', err),
        });
      },
      error: (err) => console.error('Error loading projects', err),
    });
  }

  openCreateProjectModal(): void {
    this.isEditMode = false;
    this.projectForm = { name: '', description: '' };
    this.projectError = '';
    this.projectFormErrors = {};
    this.projectFormTouched = {};
    this.showProjectModal = true;
  }

  openEditProjectModal(project: Project): void {
    this.isEditMode = true;
    this.currentProject = project;
    this.projectForm = { ...project };
    this.projectError = '';
    this.projectFormErrors = {};
    this.projectFormTouched = {};
    this.showProjectModal = true;
  }

  saveProject(): void {
    // Mark all fields as touched to show validation errors
    this.projectFormTouched = { name: true, description: true };

    if (!this.isProjectFormValid()) {
      return;
    }

    const payload: Partial<Project> = {
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
          error: (err) => {
            if (err.error?.errors) {
              this.projectFormErrors = err.error.errors;
            } else {
              this.projectError =
                err.error?.message || 'Error updating project';
            }
          },
        });
    } else {
      this.projectService.createProject(payload).subscribe({
        next: () => {
          this.loadProjects();
          this.closeProjectModal();
        },
        error: (err) => {
          if (err.error?.errors) {
            this.projectFormErrors = err.error.errors;
          } else {
            this.projectError = err.error?.message || 'Error creating project';
          }
        },
      });
    }
  }

  deleteProject(projectId: string): void {
    if (!confirm('Are you sure you want to delete this project?')) return;
    this.projectService.deleteProject(projectId).subscribe({
      next: () => this.loadProjects(),
      error: (err) => console.error('Error deleting project', err),
    });
  }

  closeProjectModal(): void {
    this.showProjectModal = false;
    this.currentProject = null;
    this.projectForm = {};
    this.projectError = '';
    this.projectFormErrors = {};
    this.projectFormTouched = {};
  }

  updateProjectStats(): void {
    this.projects.forEach((project: any) => {
      project.totalTasks = project.tasks?.length || 0;
      project.completedTasks =
        project.tasks?.filter((t: any) => t.status === 'Completed').length || 0;
      project.progress = project.totalTasks
        ? Math.round((project.completedTasks / project.totalTasks) * 100)
        : 0;
    });
  }

  // ================= Task Methods =================
  openCreateTaskModal(projectId: string): void {
    this.isEditMode = false;
    this.currentProjectId = projectId;
    this.currentTask = null;

    this.taskForm = {
      title: '',
      description: '',
      status: 'Pending',
      priority: 'Medium',
      assignedTo: '',
    };

    this.taskError = '';
    this.taskFormErrors = {};
    this.taskFormTouched = {};
    this.showTaskModal = true;
  }

  openEditTaskModal(projectId: string, task: Task): void {
    this.isEditMode = true;
    this.currentProjectId = projectId;
    this.currentTask = task;

    this.taskForm = {
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      deadline: task.deadline,
      assignedTo: task.assignedTo || '',
    };

    this.taskError = '';
    this.taskFormErrors = {};
    this.taskFormTouched = {};
    this.showTaskModal = true;
  }

  saveTask(): void {
    if (!this.currentProjectId) return;

    // Mark all fields as touched to show validation errors
    this.taskFormTouched = {
      title: true,
      description: true,
      status: true,
      priority: true,
      assignedTo: true,
      deadline: true,
    };

    if (!this.isTaskFormValid()) {
      return;
    }

    const payload = {
      title: this.taskForm.title,
      description: this.taskForm.description,
      priority: this.taskForm.priority,
      status: this.taskForm.status,
      deadline: this.taskForm.deadline,
      assignedTo: this.taskForm.assignedTo,
      projectId: this.currentProjectId,
    };

    if (this.isEditMode && this.currentTask?._id) {
      this.taskService.updateTask(this.currentTask._id, payload).subscribe({
        next: () => {
          this.loadProjects();
          this.closeTaskModal();
        },
        error: (err) => {
          if (err.error?.errors) {
            this.taskFormErrors = err.error.errors;
          } else {
            this.taskError = err.error?.message || 'Error updating task';
          }
        },
      });
    } else {
      this.taskService.createTask(payload).subscribe({
        next: () => {
          this.loadProjects();
          this.closeTaskModal();
        },
        error: (err) => {
          if (err.error?.errors) {
            this.taskFormErrors = err.error.errors;
          } else {
            this.taskError = err.error?.message || 'Error creating task';
          }
        },
      });
    }
  }

  deleteTask(taskId: string): void {
    if (!confirm('Are you sure you want to delete this task?')) return;
    this.taskService.deleteTask(taskId).subscribe({
      next: () => this.loadProjects(),
      error: (err) => console.error('Error deleting task', err),
    });
  }

  closeTaskModal(): void {
    this.showTaskModal = false;
    this.currentTask = null;
    this.taskForm = {};
    this.currentProjectId = '';
    this.taskError = '';
    this.taskFormErrors = {};
    this.taskFormTouched = {};
  }

  loadUsers(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.taskService.getAllUsers().subscribe({
        next: (users: any[]) => {
          this.userOptions = users.map((u) => ({
            _id: u._id || u.id,
            name: u.name,
          }));
          resolve();
        },
        error: (err) => {
          console.error('Error loading users', err);
          resolve(); // resolve anyway to not block
        },
      });
    });
  }

  // ================= Filtering =================
  get filteredProjects(): Project[] {
    return this.projects.filter((project) => {
      const matchesSearch =
        !this.searchTerm ||
        project.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        project.description
          ?.toLowerCase()
          .includes(this.searchTerm.toLowerCase());

      const matchesStatus =
        this.selectedStatus === 'All Statuses' ||
        project.tasks?.some((t) => t.status === this.selectedStatus);

      const matchesPriority =
        this.selectedPriority === 'All Priorities' ||
        project.tasks?.some((t) => t.priority === this.selectedPriority);

      const matchesUser =
        this.selectedUser === 'All Users' ||
        project.tasks?.some(
          (t) =>
            t.assignedTo &&
            this.userOptions.find((u) => u._id === t.assignedTo)?.name ===
              this.selectedUser
        );

      return matchesSearch && matchesStatus && matchesPriority && matchesUser;
    });
  }

  downloadProjectPDF(projectId: string) {
    this.pdfService.downloadProjectPDF(projectId).subscribe({
      next: (blob) => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `project_${projectId}.pdf`;
        link.click();
      },
      error: (err) => {
        console.error('Failed to download PDF', err);
        this.showNotification('Failed to download PDF', 'error');
      },
    });
  }
}
