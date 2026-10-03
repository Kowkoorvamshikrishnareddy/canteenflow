import { Response } from 'express';

interface Client {
  id: string;
  res: Response;
  userId?: string;
  role?: string;
}

class RealtimeHub {
  private clients: Map<string, Client> = new Map();

  addClient(id: string, res: Response, userId?: string, role?: string) {
    this.clients.set(id, { id, res, userId, role });

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    // Send initial handshake
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', clientId: id, timestamp: new Date().toISOString() })}\n\n`);

    // Keepalive ping every 25 seconds
    const interval = setInterval(() => {
      if (this.clients.has(id)) {
        res.write(`: keepalive\n\n`);
      } else {
        clearInterval(interval);
      }
    }, 25000);

    res.on('close', () => {
      clearInterval(interval);
      this.clients.delete(id);
    });
  }

  broadcast(event: string, payload: any) {
    const data = `data: ${JSON.stringify({ event, payload, timestamp: new Date().toISOString() })}\n\n`;
    for (const [id, client] of this.clients.entries()) {
      try {
        client.res.write(data);
      } catch (err) {
        this.clients.delete(id);
      }
    }
  }

  sendToUser(userId: string, event: string, payload: any) {
    const data = `data: ${JSON.stringify({ event, payload, timestamp: new Date().toISOString() })}\n\n`;
    for (const [id, client] of this.clients.entries()) {
      if (client.userId === userId) {
        try {
          client.res.write(data);
        } catch (err) {
          this.clients.delete(id);
        }
      }
    }
  }

  getConnectedCount() {
    return this.clients.size;
  }
}

export const realtimeHub = new RealtimeHub();
