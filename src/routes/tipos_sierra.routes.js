// src/routes/tipos_sierra.routes.js
import { Router } from 'express';
import { 
  getTiposSierra, 
  getTipoSierraById, 
  createTipoSierra, 
  updateTipoSierra, 
  deleteTipoSierra 
} from '../controllers/tipos_sierra.controller.js';
import { validateToken } from '../middleware/auth.middleware.js';
import { checkRole } from '../middleware/auth.middleware.js';

const router = Router();

// Rutas protegidas - requieren autenticación
router.get('/', validateToken, getTiposSierra);
router.get('/:id', validateToken, getTipoSierraById);

// Rutas protegidas - requieren rol GERENTE
router.post('/', [validateToken, checkRole(['GERENTE'])], createTipoSierra);
router.put('/:id', [validateToken, checkRole(['GERENTE'])], updateTipoSierra);
router.delete('/:id', [validateToken, checkRole(['GERENTE'])], deleteTipoSierra);

export default router;