// src/controllers/historial.controller.js
import supabase from '../utils/supabase.js';

export const getHistorial = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('historial')
      .select(`
        *,
        sierras (
          id,
          codigo,
          tipos_sierra (id, codigo, nombre),
          clientes (id, nombre)
        ),
        usuarios (id, nombre)
      `)
      .order('fecha', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({
      message: 'Error al obtener historial',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getHistorialById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('historial')
      .select(`
        *,
        sierras (
          id,
          codigo,
          tipos_sierra (id, codigo, nombre),
          clientes (id, nombre)
        ),
        usuarios (id, nombre)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        message: 'Registro de afilado no encontrado'
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Error al obtener registro de afilado:', error);
    res.status(500).json({
      message: 'Error al obtener registro de afilado',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const createHistorial = async (req, res) => {
  try {
    const { sierra_id, tipo_afilado, observaciones } = req.body;
    const usuario_id = req.user.id; // Obtenemos el ID del usuario autenticado

    // Validación básica
    if (!sierra_id || !tipo_afilado) {
      return res.status(400).json({
        message: 'Sierra y tipo de afilado son requeridos'
      });
    }

    // Verificar que el tipo_afilado sea válido
    if (!['LOMO', 'PECHO', 'COMPLETO'].includes(tipo_afilado)) {
      return res.status(400).json({
        message: 'Tipo de afilado inválido. Debe ser LOMO, PECHO o COMPLETO'
      });
    }

    // Verificar que la sierra existe y está activa
    const { data: sierra, error: sierraError } = await supabase
      .from('sierras')
      .select('*')
      .eq('id', sierra_id)
      .eq('estado', true)
      .single();

    if (!sierra) {
      return res.status(400).json({
        message: 'La sierra especificada no existe o no está activa'
      });
    }

    const { data, error } = await supabase
      .from('historial')
      .insert([
        { 
          sierra_id,
          tipo_afilado,
          observaciones,
          usuario_id,
          fecha: new Date().toISOString()
        }
      ])
      .select(`
        *,
        sierras (
          id,
          codigo,
          tipos_sierra (id, codigo, nombre),
          clientes (id, nombre)
        ),
        usuarios (id, nombre)
      `)
      .single();

    if (error) throw error;

    // Actualizar fecha_ultimo_afilado en la sierra
    await supabase
      .from('sierras')
      .update({ 
        fecha_ultimo_afilado: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', sierra_id);

    res.status(201).json(data);
  } catch (error) {
    console.error('Error al crear registro de afilado:', error);
    res.status(500).json({
      message: 'Error al crear registro de afilado',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const updateHistorial = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo_afilado, observaciones } = req.body;

    // Solo permitimos actualizar tipo_afilado y observaciones
    if (!tipo_afilado) {
      return res.status(400).json({
        message: 'Tipo de afilado es requerido'
      });
    }

    // Verificar que el tipo_afilado sea válido
    if (!['LOMO', 'PECHO', 'COMPLETO'].includes(tipo_afilado)) {
      return res.status(400).json({
        message: 'Tipo de afilado inválido. Debe ser LOMO, PECHO o COMPLETO'
      });
    }

    const { data, error } = await supabase
      .from('historial')
      .update({ 
        tipo_afilado,
        observaciones
      })
      .eq('id', id)
      .select(`
        *,
        sierras (
          id,
          codigo,
          tipos_sierra (id, codigo, nombre),
          clientes (id, nombre)
        ),
        usuarios (id, nombre)
      `)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        message: 'Registro de afilado no encontrado'
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Error al actualizar registro de afilado:', error);
    res.status(500).json({
      message: 'Error al actualizar registro de afilado',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Nota: No implementamos delete ya que los registros históricos no deberían eliminarse