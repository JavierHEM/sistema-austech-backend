// src/routes/busqueda.routes.js
import { Router } from 'express';
import { 
  buscarSierras,
  buscarClientes,
  buscarHistorial
} from '../controllers/busqueda.controller.js';
import { validateToken } from '../middleware/auth.middleware.js';

const router = Router();

// Rutas protegidas - requieren autenticación
router.get('/sierras', validateToken, buscarSierras);
router.get('/clientes', validateToken, buscarClientes);
router.get('/historial', validateToken, buscarHistorial);

export default router;