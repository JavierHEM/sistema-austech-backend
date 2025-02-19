// src/controllers/auth.controller.js
import supabase from '../utils/supabase.js';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Autenticación con Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return res.status(401).json({
        message: 'Credenciales inválidas'
      });
    }

    // 2. Obtener datos del usuario
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError) {
      console.error('Error al obtener datos de usuario:', userError);
      return res.status(500).json({
        message: 'Error al obtener datos del usuario'
      });
    }

    // 3. Generar JWT
    const token = jwt.sign(
      {
        id: userData.id,
        email: userData.email,
        rol: userData.rol
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 4. Enviar respuesta
    res.json({
      id: userData.id,
      nombre: userData.nombre,
      email: userData.email,
      rol: userData.rol,
      token
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      message: 'Error en el servidor'
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const { data: userData, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) {
      console.error('Error al obtener perfil:', error);
      throw error;
    }

    if (!userData) {
      return res.status(404).json({
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      id: userData.id,
      nombre: userData.nombre,
      email: userData.email,
      rol: userData.rol
    });
  } catch (error) {
    console.error('Error en getProfile:', error);
    res.status(500).json({
      message: 'Error al obtener perfil'
    });
  }
};


// En auth.controller.js - Actualizar la función resetPassword
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        message: 'Email y nueva contraseña son requeridos'
      });
    }

    // Primero obtenemos el usuario por email
    const { data: user, error: userError } = await supabase.auth.admin
      .listUsers();

    if (userError) {
      console.error('Error al buscar usuario:', userError);
      return res.status(400).json({
        message: 'Error al buscar usuario',
        details: process.env.NODE_ENV === 'development' ? userError.message : undefined
      });
    }

    // Encontrar el usuario con el email específico
    const targetUser = user.users.find(u => u.email === email);

    if (!targetUser) {
      return res.status(404).json({
        message: 'Usuario no encontrado'
      });
    }

    console.log('Usuario encontrado:', targetUser.id);

    // Actualizar contraseña usando el admin API de Supabase
    const { data, error } = await supabase.auth.admin.updateUserById(
      targetUser.id,
      { password: newPassword }
    );

    if (error) {
      console.error('Error al restablecer contraseña:', error);
      return res.status(400).json({
        message: 'Error al restablecer contraseña',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    res.json({
      message: 'Contraseña restablecida exitosamente'
    });

  } catch (error) {
    console.error('Error en resetPassword:', error);
    res.status(500).json({
      message: 'Error en el servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};