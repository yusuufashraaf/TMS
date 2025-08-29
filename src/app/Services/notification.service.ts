// notification.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:8000'); // backend URL
  }

  joinUserRoom(userId: string) {
    this.socket.emit('user-online', userId);
  }

  onNewTask(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('new-task', (data) => observer.next(data));
    });
  }
}
