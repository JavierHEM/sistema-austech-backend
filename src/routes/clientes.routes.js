// src/routes/clientes.routes.js
import { Router } from 'express';
import { getClientes, getClienteById, createCliente, updateCliente, deleteCliente } from '../controllers/clientes.controller.js';
import { validateToken } from '../middleware/auth.middleware.js';
import { checkRole } from '../middleware/auth.middleware.js';

const router = Router();

// Rutas protegidas - requieren autenticación
router.get('/', validateToken, getClientes);
router.get('/:id', validateToken, getClienteById);

// Rutas protegidas - requieren rol GERENTE
router.post('/', [validateToken, checkRole(['GERENTE'])], createCliente);
router.put('/:id', [validateToken, checkRole(['GERENTE'])], updateCliente);
router.delete('/:id', [validateToken, checkRole(['GERENTE'])], deleteCliente);

export default router;