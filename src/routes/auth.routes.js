// src/routes/auth.routes.js
import { Router } from 'express';
import { login, getProfile, resetPassword } from '../controllers/auth.controller.js';
import { validateToken } from '../middleware/auth.middleware.js';

const router = Router();

// Rutas públicas
router.post('/login', login);
router.post('/reset-password', resetPassword);

// Rutas protegidas
router.get('/profile', validateToken, getProfile);

export default router;