// src/controllers/usuarios.controller.js
import supabase from '../utils/supabase.js';

// Obtener todos los usuarios
export const getUsuarios = async (req, res) => {
  try {
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener usuarios:', error);
      return res.status(500).json({
        message: 'Error al obtener la lista de usuarios'
      });
    }

    res.json(usuarios);
  } catch (error) {
    console.error('Error en getUsuarios:', error);
    res.status(500).json({
      message: 'Error en el servidor'
    });
  }
};

// Obtener un usuario por ID
export const getUsuarioById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          message: 'Usuario no encontrado'
        });
      }
      console.error('Error al obtener usuario:', error);
      return res.status(500).json({
        message: 'Error al obtener información del usuario'
      });
    }

    res.json(usuario);
  } catch (error) {
    console.error('Error en getUsuarioById:', error);
    res.status(500).json({
      message: 'Error en el servidor'
    });
  }
};

// Crear un nuevo usuario
export const createUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    // Primero, crear usuario en Authentication
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) {
      console.error('Error al crear usuario en Auth:', authError);
      return res.status(400).json({
        message: authError.message
      });
    }

    // Luego, guardar datos del usuario en la tabla usuarios
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .insert([
        {
          id: authData.user.id,
          nombre,
          email,
          rol,
          estado: true
        }
      ])
      .select()
      .single();

    if (userError) {
      console.error('Error al guardar datos de usuario:', userError);
      // Intentar eliminar el usuario de Auth si falla
      await supabase.auth.admin.deleteUser(authData.user.id);
      return res.status(500).json({
        message: 'Error al crear usuario'
      });
    }

    res.status(201).json(userData);
  } catch (error) {
    console.error('Error en createUsuario:', error);
    res.status(500).json({
      message: 'Error en el servidor al crear usuario'
    });
  }
};

// Actualizar un usuario
export const updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol, estado } = req.body;

    // Actualizar datos en la tabla usuarios
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .update({ nombre, email, rol, estado })
      .eq('id', id)
      .select()
      .single();

    if (userError) {
      console.error('Error al actualizar usuario:', userError);
      return res.status(500).json({
        message: 'Error al actualizar usuario'
      });
    }

    // Si se cambió el correo, actualizarlo también en Auth
    if (email && email !== userData.email) {
      const { error: authError } = await supabase.auth.admin.updateUserById(id, {
        email
      });

      if (authError) {
        console.error('Error al actualizar email en Auth:', authError);
        // No fallamos la operación completa, solo registramos el error
      }
    }

    res.json(userData);
  } catch (error) {
    console.error('Error en updateUsuario:', error);
    res.status(500).json({
      message: 'Error en el servidor al actualizar usuario'
    });
  }
};

// Eliminar un usuario
export const deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que no se elimine a sí mismo
    if (id === req.user.id) {
      return res.status(400).json({
        message: 'No puedes eliminar tu propio usuario'
      });
    }

    // Eliminar de la tabla usuarios
    const { error: userError } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id);

    if (userError) {
      console.error('Error al eliminar usuario de la tabla:', userError);
      return res.status(500).json({
        message: 'Error al eliminar usuario'
      });
    }

    // Eliminar de Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(id);

    if (authError) {
      console.error('Error al eliminar usuario de Auth:', authError);
      // No fallamos la operación completa, solo registramos el error
    }

    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error en deleteUsuario:', error);
    res.status(500).json({
      message: 'Error en el servidor al eliminar usuario'
    });
  }
};

// Cambiar estado de un usuario (activar/desactivar)
export const changeUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    // Verificar que no se desactive a sí mismo
    if (id === req.user.id && estado === false) {
      return res.status(400).json({
        message: 'No puedes desactivar tu propio usuario'
      });
    }

    const { data: userData, error } = await supabase
      .from('usuarios')
      .update({ estado })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error al cambiar estado de usuario:', error);
      return res.status(500).json({
        message: 'Error al cambiar estado del usuario'
      });
    }

    res.json(userData);
  } catch (error) {
    console.error('Error al cambiar estado de usuario:', error);
    res.status(500).json({
      message: 'Error en el servidor al cambiar estado del usuario'
    });
  }
};

// Restablecer contraseña de usuario
export const resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    // Actualizar contraseña en Auth
    const { error } = await supabase.auth.admin.updateUserById(id, {
      password: newPassword
    });

    if (error) {
      console.error('Error al restablecer contraseña:', error);
      return res.status(500).json({
        message: 'Error al restablecer contraseña'
      });
    }

    res.json({ message: 'Contraseña restablecida correctamente' });
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    res.status(500).json({
      message: 'Error en el servidor al restablecer contraseña'
    });
  }
};