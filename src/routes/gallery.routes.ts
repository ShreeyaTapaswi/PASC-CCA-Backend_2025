import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware';
import {
  addGalleryImage,
  getGallery,
  getAllGallery,
  updateGalleryImage,
  deleteGalleryImage
} from '../controllers/gallery.controller';

const router = Router();

// Admin routes
router.post('/', authenticateToken, requireAdmin, addGalleryImage);
router.put('/:imageId', authenticateToken, requireAdmin, updateGalleryImage);
router.delete('/:imageId', authenticateToken, requireAdmin, deleteGalleryImage);

// Public routes
router.get('/', getAllGallery);
router.get('/event/:eventId', getGallery);

export default router;


