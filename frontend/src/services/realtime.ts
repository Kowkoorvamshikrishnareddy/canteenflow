type EventCallback = (data: any) => void;

class RealtimeClient {
  private eventSource: EventSource | null = null;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private reconnectTimer: any = null;

  connect() {
    if (this.eventSource) return;

    const url =
      import.meta.env.VITE_REALTIME_URL ||
      (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
        ? '/api/realtime/stream'
        : 'http://localhost:5000/api/realtime/stream');
    try {
      this.eventSource = new EventSource(url);

      this.eventSource.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.event) {
            this.emit(payload.event, payload.payload);
          }
        } catch (err) {
          // ignore keepalive or non-json
        }
      };

      this.eventSource.onerror = () => {
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }
        // Auto-reconnect after 4s
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => this.connect(), 4000);
      };
    } catch (e) {
      console.warn('Realtime connection could not be established; polling fallback active');
    }
  }

  on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // ensure connected
    this.connect();

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  private emit(event: string, data: any) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      for (const fn of handlers) {
        fn(data);
      }
    }
  }
}

export const realtime = new RealtimeClient();
