// src/routes/dashboard.routes.js
import { Router } from 'express';
import { getResumenDashboard } from '../controllers/dashboard.controller.js';
import { validateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/resumen', validateToken, getResumenDashboard);

export default router;