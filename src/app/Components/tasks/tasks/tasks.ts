import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { TaskService, Task, TaskStatus } from '../../../Services/task.service';
import { AuthService } from '../../../Services/auth.service';

interface Filters {
  status: string;
  priority: string;
}

interface Notification {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Component({
  selector: 'app-task-manager',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './tasks.html',
  styleUrls: ['./tasks.css'],
})
export class Tasks implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  isLoading = false;

  filters: Filters = { status: 'all', priority: 'all' };
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  notification: Notification = { show: false, message: '', type: 'success' };
  mobileMenuOpen = false;

  currentUserName: string;

  constructor(
    private taskService: TaskService,
    private authService: AuthService
  ) {
    this.currentUserName = this.authService.currentUser.value?.name || '';
  }

  ngOnInit(): void {
    this.loadTasks();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTasks(): void {
    this.isLoading = true;
    this.taskService
      .getMyTasks()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.tasks = res.tasks.map((t) => ({
            ...t,
            assignedTo: this.currentUserName,
          }));
          this.applyFilters();
          this.calculatePagination();
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.showNotification('Failed to load tasks', 'error');
          console.error(err);
        },
      });
  }

  applyFilters(): void {
    let filtered = [...this.tasks];
    if (this.filters.status !== 'all')
      filtered = filtered.filter((t) => t.status === this.filters.status);
    if (this.filters.priority !== 'all')
      filtered = filtered.filter((t) => t.priority === this.filters.priority);
    this.filteredTasks = filtered;
    this.currentPage = 1;
    this.calculatePagination();
  }

  private calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredTasks.length / this.itemsPerPage);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPages - 1);
    if (endPage - startPage < maxPages - 1)
      startPage = Math.max(1, endPage - maxPages + 1);
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  }

  updateTaskStatus(taskId: string, event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const newStatus = selectElement.value as TaskStatus;

    const task = this.tasks.find((t) => t._id === taskId);
    if (!task) return;

    if (task.assignedTo !== this.currentUserName) {
      this.showNotification('You are not allowed to update this task', 'error');
      return;
    }

    const oldStatus = task.status;
    task.status = newStatus;

    this.taskService.updateMyTaskStatus(taskId, newStatus).subscribe({
      next: (updatedTask) => {
        task.status = updatedTask.status;
        this.applyFilters();
        this.showNotification(
          `Task status updated to: ${newStatus}`,
          'success'
        );
      },
      error: (err) => {
        task.status = oldStatus;
        this.showNotification('Failed to update task status', 'error');
        console.error(err);
      },
    });
  }

  deleteTask(taskId: string): void {
    const task = this.tasks.find((t) => t._id === taskId);
    if (!task) return;

    if (!confirm(`Are you sure you want to delete "${task.title}"?`)) return;

    this.taskService.deleteTask(taskId).subscribe({
      next: () => {
        this.tasks = this.tasks.filter((t) => t._id !== taskId);
        this.applyFilters();
        if (this.currentPage > this.totalPages && this.totalPages > 0)
          this.currentPage = this.totalPages;
        this.showNotification('Task deleted successfully', 'success');
      },
      error: (err) => {
        this.showNotification('Failed to delete task', 'error');
        console.error(err);
      },
    });
  }

  previousPage(): void {
    if (this.currentPage > 1) this.currentPage--;
    this.scrollToTop();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
    this.scrollToTop();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
    this.scrollToTop();
  }

  private scrollToTop(): void {
    document
      .querySelector('.tasks-container')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private showNotification(
    message: string,
    type: 'success' | 'error' | 'info'
  ): void {
    this.notification = { show: true, message, type };
    setTimeout(() => this.hideNotification(), 3000);
  }

  private hideNotification(): void {
    this.notification.show = false;
  }

  searchTasks(query: string): void {
    if (!query.trim()) {
      this.applyFilters();
      return;
    }

    this.filteredTasks = this.tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query.toLowerCase()) ||
        task.description?.toLowerCase().includes(query.toLowerCase())
    );
    this.currentPage = 1;
    this.calculatePagination();
  }

  sortTasks(field: keyof Task, direction: 'asc' | 'desc' = 'asc'): void {
    this.tasks.sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];

      if (aValue instanceof Date && bValue instanceof Date)
        return direction === 'asc'
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();

      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    this.applyFilters();
    this.showNotification(`Tasks sorted by ${field}`, 'success');
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  logout(): void {
    this.authService.logout(); // Ensure AuthService has a logout method
  }

  trackByTaskId(index: number, task: Task) {
    return task._id;
  }

  trackByPage(index: number, page: number) {
    return page;
  }

  getAssignedUserName(task: Task) {
    return task.assignedTo || 'Unassigned';
  }

  onSortChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const direction = select.value as 'asc' | 'desc';
    this.sortTasks('deadline', direction);
  }
}
