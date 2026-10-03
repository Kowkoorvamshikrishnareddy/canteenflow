import { Router, Response } from 'express';
import { db } from '../../database/index.js';
import { AuthenticatedRequest, requireRole } from '../../middleware/auth.js';
import { DietaryTag } from '../../shared/types.js';

const router = Router();

// Get full menu (Categories + Items)
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const canteenId = (req.query.canteenId as string) || req.user?.canteenId || '22222222-2222-2222-2222-222222222222';
  const categoryFilter = req.query.category as string;
  const searchQuery = (req.query.q as string)?.toLowerCase();
  const dietaryFilter = req.query.dietary as DietaryTag;
  const availableOnly = req.query.available === 'true';

  const categories = db.getMenuCategories(canteenId);
  let items = db.getMenuItems(canteenId);

  if (categoryFilter) {
    items = items.filter((item) => item.categoryId === categoryFilter);
  }
  if (searchQuery) {
    items = items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery) ||
        item.description.toLowerCase().includes(searchQuery)
    );
  }
  if (dietaryFilter) {
    items = items.filter((item) => item.dietaryTags.includes(dietaryFilter));
  }
  if (availableOnly) {
    items = items.filter((item) => item.isAvailable);
  }

  res.json({
    categories,
    items,
  });
});

// Get single menu item
router.get('/:id', (req: AuthenticatedRequest, res: Response) => {
  const item = db.getMenuItem(String(req.params.id));
  if (!item) {
    return res.status(404).json({ error: 'ITEM_NOT_FOUND', message: 'Food item not found' });
  }
  res.json(item);
});

// Create menu item (Staff or Admin)
router.post('/', requireRole(['staff', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  const canteenId = req.user?.canteenId || '22222222-2222-2222-2222-222222222222';
  const { name, categoryId, description, price, imagePath, dietaryTags, preparationMinutes, isAvailable, availableQuantity } = req.body;

  if (!name || !price || !categoryId) {
    return res.status(400).json({ error: 'MISSING_FIELDS', message: 'Name, price, and categoryId are required' });
  }

  const newItem = db.createMenuItem({
    canteenId,
    categoryId,
    name,
    description: description || '',
    price: Number(price),
    imagePath: imagePath || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop',
    dietaryTags: dietaryTags || ['veg'],
    preparationMinutes: Number(preparationMinutes) || 10,
    isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
    availableQuantity: availableQuantity ? Number(availableQuantity) : 50,
  });

  res.status(201).json(newItem);
});

// Update menu item (Staff or Admin)
router.put('/:id', requireRole(['staff', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateMenuItem(String(req.params.id), req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(404).json({ error: 'UPDATE_FAILED', message: err.message });
  }
});

// Add Category (Staff or Admin)
router.post('/categories', requireRole(['staff', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  const canteenId = req.user?.canteenId || '22222222-2222-2222-2222-222222222222';
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'NAME_REQUIRED', message: 'Category name is required' });
  }

  const category = db.createCategory(canteenId, name, description);
  res.status(201).json(category);
});

export default router;
