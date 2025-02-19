// src/routes/reportes.routes.js
import { Router } from 'express';
import { 
  getHistorialPorSierra,
  getHistorialPorCliente,
  getSierrasPorCliente,
  getEstadisticasAfilados
} from '../controllers/reportes.controller.js';
import { validateToken } from '../middleware/auth.middleware.js';
import { checkRole } from '../middleware/auth.middleware.js';

const router = Router();

// Rutas protegidas - requieren autenticación
router.get('/sierra/:sierra_id/historial', validateToken, getHistorialPorSierra);
router.get('/cliente/:cliente_id/historial', validateToken, getHistorialPorCliente);
router.get('/cliente/:cliente_id/sierras', validateToken, getSierrasPorCliente);

// Estadísticas - solo accesible para GERENTE
router.get('/estadisticas', [validateToken, checkRole(['GERENTE'])], getEstadisticasAfilados);

export default router;