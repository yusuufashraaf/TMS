import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

export interface Task {
  _id?: string;
  title: string;
  description?: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  deadline?: Date;
  assignedTo?: string;
  createdBy?: any;
  projectId?: string | { _id: string };
  createdAt?: Date;
}

export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  tasksThisMonth: number;
  priorityData: { name: string; value: number }[];
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  users: any[] = [];
  private baseUrl = 'http://localhost:8000/api/v1/tasks';

  constructor(private http: HttpClient) {}

  /** Fetch all tasks */
  getAllTasks(paramsObj?: any): Observable<{ tasks: Task[]; total: number }> {
    let params = new HttpParams();
    if (paramsObj) {
      Object.keys(paramsObj).forEach((key) => {
        if (paramsObj[key] !== undefined && paramsObj[key] !== null) {
          params = params.set(key, paramsObj[key]);
        }
      });
    }

    return this.http.get<any>(`${this.baseUrl}`, { params }).pipe(
      map((res) => ({
        tasks: res.data,
        total: res.total,
      }))
    );
  }

  /** Fetch tasks assigned to the logged-in user */
  getMyTasks(paramsObj?: any): Observable<{ tasks: Task[]; total: number }> {
    let params = new HttpParams();
    if (paramsObj) {
      Object.keys(paramsObj).forEach((key) => {
        if (paramsObj[key] !== undefined && paramsObj[key] !== null) {
          params = params.set(key, paramsObj[key]);
        }
      });
    }

    return this.http.get<any>(`${this.baseUrl}/my-tasks`, { params }).pipe(
      map((res) => ({
        tasks: res.data,
        total: res.total,
      }))
    );
  }

  /** Get single task by ID */
  getTaskById(taskId: string): Observable<Task> {
    return this.http
      .get<any>(`${this.baseUrl}/${taskId}`)
      .pipe(map((res) => res.data));
  }

  /** Create a new task */
  createTask(task: Partial<Task>): Observable<Task> {
    return this.http
      .post<any>(`${this.baseUrl}`, task)
      .pipe(map((res) => res.data));
  }

  /** Update an existing task */
  updateTask(taskId: string, task: Partial<Task>): Observable<Task> {
    return this.http
      .put<any>(`${this.baseUrl}/${taskId}`, task)
      .pipe(map((res) => res.data));
  }

  /** Update status of a task assigned to the logged-in user */
  updateMyTaskStatus(taskId: string, status: Task['status']): Observable<Task> {
    return this.http
      .patch<any>(`${this.baseUrl}/${taskId}/status`, { status })
      .pipe(map((res) => res.data));
  }

  /** Delete a task */
  deleteTask(taskId: string): Observable<{ message: string }> {
    return this.http
      .delete<any>(`${this.baseUrl}/${taskId}`)
      .pipe(map((res) => res));
  }

  /** Fetch dashboard stats including priority breakdown */
  getTaskStats(): Observable<TaskStats> {
    return this.http
      .get<any>(`${this.baseUrl}/dashboard-stats`)
      .pipe(map((res) => res.data));
  }

  /** Fetch all users */
  getAllUsers(): Observable<{ id: string; name: string }[]> {
    return this.http.get<any>('http://localhost:8000/api/v1/users').pipe(
      map((res) => {
        if (res.status === 'success') {
          this.users = res.data.map((u: any) => ({
            id: u._id,
            name: u.name,
          }));
          return this.users;
        } else {
          return [];
        }
      })
    );
  }

  /** Fetch tasks belonging to a specific project */
  getTasksByProject(
    projectId: string,
    paramsObj?: any
  ): Observable<{ tasks: Task[]; total: number }> {
    let params = new HttpParams().set('projectId', projectId);

    if (paramsObj) {
      Object.keys(paramsObj).forEach((key) => {
        if (paramsObj[key] !== undefined && paramsObj[key] !== null) {
          params = params.set(key, paramsObj[key]);
        }
      });
    }

    return this.http.get<any>(`${this.baseUrl}`, { params }).pipe(
      map((res) => ({
        tasks: res.data,
        total: res.total,
      }))
    );
  }
}
