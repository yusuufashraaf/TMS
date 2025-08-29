import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment.prod';
export interface Project {
  _id?: string;
  name: string;
  description: string;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  members?: {
    _id: string;
    name: string;
    email: string;
  }[];
  createdAt?: Date;
  updatedAt?: Date;

  // ✅ optional frontend-only fields
  expanded?: boolean;
  tasks?: any[];
  totalTasks?: number;
  completedTasks?: number;
  progress?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private apiUrl = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) {}

  // Get all projects with pagination + search
  getProjects(
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ): Observable<any> {
    let url = `${this.apiUrl}?page=${page}&limit=${limit}`;
    if (search) url += `&search=${search}`;
    return this.http.get<any>(url);
  }

  // Get project by ID
  getProjectById(id: string): Observable<{ status: string; data: Project }> {
    return this.http.get<{ status: string; data: Project }>(
      `${this.apiUrl}/${id}`
    );
  }

  // Create project
  createProject(
    project: Partial<Project>
  ): Observable<{ status: string; data: Project }> {
    return this.http.post<{ status: string; data: Project }>(
      this.apiUrl,
      project
    );
  }

  // Update project
  updateProject(
    id: string,
    project: Partial<Project>
  ): Observable<{ status: string; data: Project }> {
    return this.http.put<{ status: string; data: Project }>(
      `${this.apiUrl}/${id}`,
      project
    );
  }

  // Delete project
  deleteProject(id: string): Observable<{ status: string; message: string }> {
    return this.http.delete<{ status: string; message: string }>(
      `${this.apiUrl}/${id}`
    );
  }
}
