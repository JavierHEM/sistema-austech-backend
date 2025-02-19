// src/middleware/error.middleware.js

// Manejo de errores de Supabase
export const handleSupabaseError = (err, req, res, next) => {
    if (err.status === 401) {
      return res.status(401).json({
        message: 'No autorizado'
      });
    }
  
    if (err.status === 403) {
      return res.status(403).json({
        message: 'Acceso prohibido'
      });
    }
  
    if (err.status === 404) {
      return res.status(404).json({
        message: 'Recurso no encontrado'
      });
    }
  
    // Log del error para debugging
    console.error('Error de Supabase:', err);
  
    // Respuesta genérica para errores no manejados
    res.status(500).json({
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  };
  
  // Manejo de errores de JWT
  export const handleJWTError = (err, req, res, next) => {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: 'Token inválido'
      });
    }
  
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token expirado'
      });
    }
  
    next(err);
  };
  
  // Manejo de errores generales
  export const handleGenericError = (err, req, res, next) => {
    console.error('Error:', err);
  
    res.status(500).json({
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  };