// src/routes/historial.routes.js
import { Router } from 'express';
import { 
  getHistorial,
  getHistorialById,
  createHistorial,
  updateHistorial
} from '../controllers/historial.controller.js';
import { validateToken } from '../middleware/auth.middleware.js';
import { checkRole } from '../middleware/auth.middleware.js';

const router = Router();

// Rutas protegidas - todos los usuarios autenticados pueden ver
router.get('/', validateToken, getHistorial);
router.get('/:id', validateToken, getHistorialById);

// Rutas protegidas - GERENTE y OPERARIO pueden crear y actualizar
router.post('/', [validateToken, checkRole(['GERENTE', 'OPERARIO'])], createHistorial);
router.put('/:id', [validateToken, checkRole(['GERENTE', 'OPERARIO'])], updateHistorial);

export default router;