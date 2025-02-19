// src/middleware/auth.middleware.js
import jwt from 'jsonwebtoken';

export const validateToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'No se proporcionó token de autenticación'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error de autenticación:', error);
    return res.status(401).json({
      message: 'Token inválido o expirado'
    });
  }
};

export const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: 'Usuario no autenticado'
        });
      }

      if (!allowedRoles.includes(req.user.rol)) {
        return res.status(403).json({
          message: 'No tiene permisos para realizar esta acción'
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        message: 'Error al verificar permisos',
        error: error.message
      });
    }
  };
};