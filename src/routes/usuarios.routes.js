// src/routes/usuarios.routes.js
import { Router } from 'express';
import { 
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  resetPassword
} from '../controllers/usuarios.controller.js';
import { validateToken } from '../middleware/auth.middleware.js';
import { checkRole } from '../middleware/auth.middleware.js';

const router = Router();

// Todas las rutas de usuarios requieren rol GERENTE
router.get('/', [validateToken, checkRole(['GERENTE'])], getUsuarios);
router.get('/:id', [validateToken, checkRole(['GERENTE'])], getUsuarioById);
router.post('/', [validateToken, checkRole(['GERENTE'])], createUsuario);
router.put('/:id', [validateToken, checkRole(['GERENTE'])], updateUsuario);
router.delete('/:id', [validateToken, checkRole(['GERENTE'])], deleteUsuario);
router.post('/:id/reset-password', [validateToken, checkRole(['GERENTE'])], resetPassword);

export default router;