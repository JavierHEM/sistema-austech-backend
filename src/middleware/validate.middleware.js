// src/middleware/validate.middleware.js

// Validación básica de campos requeridos
export const validateRequired = (fields) => {
    return (req, res, next) => {
      for (const field of fields) {
        if (!req.body[field]) {
          return res.status(400).json({
            message: `El campo ${field} es requerido`
          });
        }
      }
      next();
    };
  };
  
  // Validación de formato de email
  export const validateEmail = (req, res, next) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
      return res.status(400).json({
        message: 'Formato de email inválido'
      });
    }
    next();
  };
  
  // Validación de contraseña
  export const validatePassword = (req, res, next) => {
    if (req.body.password && req.body.password.length < 6) {
      return res.status(400).json({
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }
    next();
  };
  
  // Validación de tipos de afilado
  export const validateTipoAfilado = (req, res, next) => {
    const tiposValidos = ['LOMO', 'PECHO', 'COMPLETO'];
    if (!tiposValidos.includes(req.body.tipoAfilado)) {
      return res.status(400).json({
        message: 'Tipo de afilado inválido'
      });
    }
    next();
  };
  
  // Validación de roles
  export const validateRol = (req, res, next) => {
    const rolesValidos = ['GERENTE', 'JEFE_SUCURSAL', 'OPERADOR'];
    if (!rolesValidos.includes(req.body.rol)) {
      return res.status(400).json({
        message: 'Rol inválido'
      });
    }
    next();
  };