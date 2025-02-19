// src/routes/sierras.routes.js
import { Router } from 'express';
import { 
  getSierras,
  getSierraById,
  createSierra,
  updateSierra,
  deleteSierra
} from '../controllers/sierras.controller.js';
import { validateToken } from '../middleware/auth.middleware.js';
import { checkRole } from '../middleware/auth.middleware.js';

const router = Router();

// Rutas protegidas - requieren autenticación
router.get('/', validateToken, getSierras);
router.get('/:id', validateToken, getSierraById);

// Rutas protegidas - requieren rol GERENTE
router.post('/', [validateToken, checkRole(['GERENTE'])], createSierra);
router.put('/:id', [validateToken, checkRole(['GERENTE'])], updateSierra);
router.delete('/:id', [validateToken, checkRole(['GERENTE'])], deleteSierra);

export default router;