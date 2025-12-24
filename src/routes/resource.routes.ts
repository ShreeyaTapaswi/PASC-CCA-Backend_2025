import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware';
import {
  createResource,
  getResources,
  updateResource,
  deleteResource
} from '../controllers/resource.controller';

const router = Router();

// Admin routes
router.post('/', authenticateToken, requireAdmin, createResource);
router.put('/:resourceId', authenticateToken, requireAdmin, updateResource);
router.delete('/:resourceId', authenticateToken, requireAdmin, deleteResource);

// Public routes
router.get('/event/:eventId', getResources);

export default router;


