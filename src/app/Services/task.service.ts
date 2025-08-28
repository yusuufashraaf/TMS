import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  deadline?: Date;
  assignedTo?: any[];
  createdBy?: any;
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
  private baseUrl = 'http://localhost:8000/api/v1/tasks'; // base tasks URL

  constructor(private http: HttpClient) {}

  // Fetch all tasks with optional query params
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

  // Fetch dashboard stats including priority data
  getTaskStats(): Observable<TaskStats> {
    return this.http
      .get<any>(`${this.baseUrl}/dashboard-stats`)
      .pipe(map((res) => res.data));
  }
}
