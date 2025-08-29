// notification.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment.prod';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private socket: Socket;

  constructor() {
    this.socket = io(environment.socketUrl);
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
