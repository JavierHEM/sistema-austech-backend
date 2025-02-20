// src/controllers/usuarios.controller.js
import supabase from '../utils/supabase.js';

export const getUsuarios = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre, email, rol, estado, created_at')
      .order('nombre');

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      message: 'Error al obtener usuarios',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getUsuarioById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre, email, rol, estado, created_at')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        message: 'Usuario no encontrado'
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      message: 'Error al obtener usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const createUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    // Validación básica
    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({
        message: 'Nombre, email, password y rol son requeridos'
      });
    }

    // Verificar que el rol sea válido
    if (!['GERENTE', 'OPERARIO'].includes(rol)) {
      return res.status(400).json({
        message: 'Rol inválido. Debe ser GERENTE o OPERARIO'
      });
    }

    // 1. Primero crear el usuario en Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) {
      return res.status(400).json({
        message: 'Error al crear usuario en autenticación',
        error: process.env.NODE_ENV === 'development' ? authError.message : undefined
      });
    }

    // 2. Luego crear el registro en la tabla usuarios
    const { data, error } = await supabase
      .from('usuarios')
      .insert([
        { 
          id: authData.user.id,
          nombre, 
          email,
          password: 'password_hash', // No almacenamos la contraseña real
          rol,
          estado: true
        }
      ])
      .select()
      .single();

    if (error) {
      // Si falla la inserción en la tabla, intentar eliminar el usuario de Auth
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw error;
    }

    res.status(201).json({
      id: data.id,
      nombre: data.nombre,
      email: data.email,
      rol: data.rol,
      estado: data.estado
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({
      message: 'Error al crear usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol, estado } = req.body;

    // Validación básica
    if (!nombre || !email || !rol) {
      return res.status(400).json({
        message: 'Nombre, email y rol son requeridos'
      });
    }

    // Verificar que el rol sea válido
    if (!['GERENTE', 'OPERARIO'].includes(rol)) {
      return res.status(400).json({
        message: 'Rol inválido. Debe ser GERENTE o OPERARIO'
      });
    }

    // Actualizar usuario en tabla usuarios
    const { data, error } = await supabase
      .from('usuarios')
      .update({ 
        nombre,
        email,
        rol,
        estado: estado === undefined ? true : estado,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        message: 'Usuario no encontrado'
      });
    }

    // Si cambia el email, actualizar también en Auth
    const usuarioActual = await supabase
      .from('usuarios')
      .select('email')
      .eq('id', id)
      .single();

    if (usuarioActual.data && usuarioActual.data.email !== email) {
      await supabase.auth.admin.updateUserById(id, {
        email
      });
    }

    res.json({
      id: data.id,
      nombre: data.nombre,
      email: data.email,
      rol: data.rol,
      estado: data.estado
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({
      message: 'Error al actualizar usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete: actualizar estado a false
    const { data, error } = await supabase
      .from('usuarios')
      .update({ 
        estado: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        message: 'Usuario no encontrado'
      });
    }

    res.json({ message: 'Usuario desactivado correctamente' });

    // No eliminamos el usuario de Auth, solo lo desactivamos en nuestra tabla
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      message: 'Error al eliminar usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        message: 'Nueva contraseña es requerida'
      });
    }

    // Actualizar contraseña en Auth
    const { error } = await supabase.auth.admin.updateUserById(id, {
      password: newPassword
    });

    if (error) {
      return res.status(400).json({
        message: 'Error al restablecer contraseña',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    res.json({ message: 'Contraseña restablecida correctamente' });
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    res.status(500).json({
      message: 'Error al restablecer contraseña',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};