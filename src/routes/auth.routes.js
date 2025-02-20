// src/routes/auth.routes.js
import { Router } from 'express';
import { login, getProfile, resetPassword } from '../controllers/auth.controller.js';
import { validateToken, checkRole } from '../middleware/auth.middleware.js';

const router = Router();

// Rutas públicas
router.post('/login', login);

// Rutas protegidas para cualquier usuario autenticado
router.get('/profile', validateToken, getProfile);

// Ruta para resetear contraseña
router.post('/reset-password', resetPassword);

export default router;