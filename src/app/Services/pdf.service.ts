// src/app/Services/pdf.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  private baseUrl = `${environment.apiUrl}/pdf`;

  constructor(private http: HttpClient) {}

  downloadProjectPDF(projectId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${projectId}`, {
      responseType: 'blob', // important for binary files
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
    });
  }
}
