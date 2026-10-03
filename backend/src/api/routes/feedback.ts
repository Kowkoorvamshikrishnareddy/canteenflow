import { Router, Response } from 'express';
import { db } from '../../database/index.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';

const router = Router();

// GET /api/feedback - Retrieve feedback and aggregate metrics
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const canteenId = req.query.canteenId as string | undefined;
  const list = db.getFeedbacks(canteenId);

  const totalCount = list.length;
  const sumRatings = list.reduce((acc, f) => acc + f.rating, 0);
  const averageRating = totalCount > 0 ? Math.round((sumRatings / totalCount) * 10) / 10 : 5.0;

  const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  for (const item of list) {
    if (distribution[item.rating] !== undefined) {
      distribution[item.rating] += 1;
    }
  }

  res.json({
    totalCount,
    averageRating,
    distribution,
    items: list,
  });
});

// POST /api/feedback - Student submits feedback for an order
router.post('/', (req: AuthenticatedRequest, res: Response) => {
  const { orderId, rating, comments } = req.body;

  if (!orderId || !rating) {
    return res.status(400).json({
      error: 'MISSING_FIELDS',
      message: 'orderId and rating are required',
    });
  }

  const numericRating = Number(rating);
  if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({
      error: 'INVALID_RATING',
      message: 'Rating must be an integer between 1 and 5',
    });
  }

  const order = db.getOrderById(orderId);
  const canteenId = order ? order.canteenId : '22222222-2222-2222-2222-222222222222';
  const userName = req.user?.fullName || order?.userName || 'Aarav Sharma';
  const userId = req.user?.id || order?.userId || '55555555-5555-5555-5555-555555555555';

  const feedback = db.addFeedback({
    orderId,
    userId,
    userName,
    canteenId,
    rating: Math.round(numericRating),
    comments: comments ? String(comments).trim() : 'Great service!',
  });

  res.status(201).json({
    message: 'Feedback submitted successfully. Thank you for your response!',
    feedback,
  });
});

export default router;
