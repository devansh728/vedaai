// src/services/websocket.ts
import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;
  private activeAssignmentId: string | null = null;

  connect() {
    if (this.socket) return this.socket;

    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:5000';
    
    this.socket = io(wsUrl, {
      autoConnect: false,
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.socket.on('connect', () => {
      console.log('🔌 Connected to VedaAI WebSocket Server:', this.socket?.id);
      if (this.activeAssignmentId) {
        this.subscribeToAssignment(this.activeAssignmentId);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('🔌 Disconnected from VedaAI WebSocket Server:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 WebSocket connection error:', error);
    });

    this.socket.on('subscribed', (payload) => {
      console.log('👤 Successfully joined socket channel room:', payload.room);
    });

    this.socket.connect();
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.activeAssignmentId = null;
  }

  getSocket() {
    return this.socket;
  }

  subscribeToAssignment(assignmentId: string) {
    this.activeAssignmentId = assignmentId;
    if (this.socket && this.socket.connected) {
      console.log('👤 Requesting room subscription for assignment:', assignmentId);
      this.socket.emit('subscribe_to_assignment', { assignmentId });
    }
  }

  onStatusUpdate(cb: (data: { status: 'pending' | 'processing' | 'completed' | 'failed'; assignmentId: string }) => void) {
    this.socket?.on('status_update', cb);
  }

  onGenerationSuccess(cb: (data: { status: 'completed'; assignmentId: string; paperData: any }) => void) {
    this.socket?.on('generation_success', cb);
  }

  onGenerationFailed(cb: (data: { status: 'failed'; assignmentId: string; error: string }) => void) {
    this.socket?.on('generation_failed', cb);
  }

  onPdfReady(cb: (data: { status: 'completed'; assignmentId: string; pdfUrl: string }) => void) {
    this.socket?.on('pdf_ready', cb);
  }

  removeListeners() {
    if (this.socket) {
      this.socket.off('status_update');
      this.socket.off('generation_success');
      this.socket.off('generation_failed');
      this.socket.off('pdf_ready');
    }
  }
}

export const webSocketService = new WebSocketService();
