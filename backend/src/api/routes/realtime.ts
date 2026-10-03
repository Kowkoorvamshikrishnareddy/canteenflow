import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { realtimeHub } from '../../modules/realtime/sse.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';

const router = Router();

// Stream live events via SSE
router.get('/stream', (req: AuthenticatedRequest, res: Response) => {
  const clientId = (req.query.clientId as string) || uuidv4();
  const userId = req.user?.id;
  const role = req.user?.role;

  realtimeHub.addClient(clientId, res, userId, role);
});

export default router;
