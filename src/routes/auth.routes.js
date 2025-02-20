// src/routes/auth.routes.js
import { Router } from 'express';
import { 
  login, 
  getProfile, 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser, 
  changeUserStatus, 
  resetUserPassword 
} from '../controllers/auth.controller.js';
import { validateToken, checkRole } from '../middleware/auth.middleware.js';

const router = Router();

// Rutas públicas
router.post('/login', login);

// Rutas protegidas para cualquier usuario autenticado
router.get('/profile', validateToken, getProfile);

// Rutas para gestión de usuarios (solo GERENTE)
router.get('/usuarios', validateToken, checkRole(['GERENTE']), getAllUsers);
router.get('/usuarios/:id', validateToken, checkRole(['GERENTE']), getUserById);
router.post('/usuarios', validateToken, checkRole(['GERENTE']), createUser);
router.put('/usuarios/:id', validateToken, checkRole(['GERENTE']), updateUser);
router.delete('/usuarios/:id', validateToken, checkRole(['GERENTE']), deleteUser);
router.patch('/usuarios/:id/estado', validateToken, checkRole(['GERENTE']), changeUserStatus);
router.post('/usuarios/:id/reset-password', validateToken, checkRole(['GERENTE']), resetUserPassword);

export default router;