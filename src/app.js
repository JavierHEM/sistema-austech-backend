// src/app.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

// Importar rutas
import authRoutes from './routes/auth.routes.js';
import clientesRoutes from './routes/clientes.routes.js';
import tiposSierraRoutes from './routes/tipos_sierra.routes.js';
import sierrasRoutes from './routes/sierras.routes.js';
import historialRoutes from './routes/historial.routes.js';
import reportesRoutes from './routes/reportes.routes.js';
import busquedaRoutes from './routes/busqueda.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

const app = express();

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "https://sistema-austech-backend-l2ri.onrender.com"
  ],
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'API Sistema Austech',
    status: 'OK',
    version: '1.0.0'
  });
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/tipos-sierra', tiposSierraRoutes);
app.use('/api/sierras', sierrasRoutes);
app.use('/api/historial', historialRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/busqueda', busquedaRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API funcionando correctamente' });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app;
