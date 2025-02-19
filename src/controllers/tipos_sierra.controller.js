// src/controllers/tipos_sierra.controller.js
import supabase from '../utils/supabase.js';

export const getTiposSierra = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tipos_sierra')
      .select('*')
      .order('codigo');

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error al obtener tipos de sierra:', error);
    res.status(500).json({
      message: 'Error al obtener tipos de sierra',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getTipoSierraById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('tipos_sierra')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        message: 'Tipo de sierra no encontrado'
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Error al obtener tipo de sierra:', error);
    res.status(500).json({
      message: 'Error al obtener tipo de sierra',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const createTipoSierra = async (req, res) => {
  try {
    const { codigo, nombre, descripcion } = req.body;

    // Validación básica
    if (!codigo || !nombre) {
      return res.status(400).json({
        message: 'Código y nombre son requeridos'
      });
    }

    // Verificar si el código ya existe
    const { data: existing, error: searchError } = await supabase
      .from('tipos_sierra')
      .select('id')
      .eq('codigo', codigo)
      .single();

    if (existing) {
      return res.status(400).json({
        message: 'Ya existe un tipo de sierra con este código'
      });
    }

    const { data, error } = await supabase
      .from('tipos_sierra')
      .insert([
        { 
          codigo,
          nombre,
          descripcion,
          estado: true
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error al crear tipo de sierra:', error);
    res.status(500).json({
      message: 'Error al crear tipo de sierra',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const updateTipoSierra = async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo, nombre, descripcion } = req.body;

    // Validación básica
    if (!codigo || !nombre) {
      return res.status(400).json({
        message: 'Código y nombre son requeridos'
      });
    }

    // Verificar si el código ya existe en otro registro
    const { data: existing, error: searchError } = await supabase
      .from('tipos_sierra')
      .select('id')
      .eq('codigo', codigo)
      .neq('id', id)
      .single();

    if (existing) {
      return res.status(400).json({
        message: 'Ya existe otro tipo de sierra con este código'
      });
    }

    const { data, error } = await supabase
      .from('tipos_sierra')
      .update({ 
        codigo,
        nombre,
        descripcion,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        message: 'Tipo de sierra no encontrado'
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Error al actualizar tipo de sierra:', error);
    res.status(500).json({
      message: 'Error al actualizar tipo de sierra',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const deleteTipoSierra = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si hay sierras asociadas
    const { data: sierras, error: sierrasError } = await supabase
      .from('sierras')
      .select('id')
      .eq('tipo_sierra_id', id)
      .eq('estado', true);

    if (sierras && sierras.length > 0) {
      return res.status(400).json({
        message: 'No se puede eliminar el tipo de sierra porque hay sierras activas asociadas'
      });
    }

    const { data, error } = await supabase
      .from('tipos_sierra')
      .update({ estado: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        message: 'Tipo de sierra no encontrado'
      });
    }

    res.json({ message: 'Tipo de sierra eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar tipo de sierra:', error);
    res.status(500).json({
      message: 'Error al eliminar tipo de sierra',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};