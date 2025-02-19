// src/controllers/sierras.controller.js
import supabase from '../utils/supabase.js';

export const getSierras = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('sierras')
      .select(`
        *,
        tipos_sierra (id, codigo, nombre),
        clientes (id, nombre, telefono)
      `)
      .order('codigo');

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error al obtener sierras:', error);
    res.status(500).json({
      message: 'Error al obtener sierras',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getSierraById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('sierras')
      .select(`
        *,
        tipos_sierra (id, codigo, nombre),
        clientes (id, nombre, telefono)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        message: 'Sierra no encontrada'
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Error al obtener sierra:', error);
    res.status(500).json({
      message: 'Error al obtener sierra',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const createSierra = async (req, res) => {
  try {
    const { codigo, tipo_sierra_id, cliente_id } = req.body;

    // Validación básica
    if (!codigo || !tipo_sierra_id || !cliente_id) {
      return res.status(400).json({
        message: 'Código, tipo de sierra y cliente son requeridos'
      });
    }

    // Verificar si el código ya existe
    const { data: existing, error: searchError } = await supabase
      .from('sierras')
      .select('id')
      .eq('codigo', codigo)
      .single();

    if (existing) {
      return res.status(400).json({
        message: 'Ya existe una sierra con este código'
      });
    }

    // Verificar que exista el tipo de sierra
    const { data: tipoSierra, error: tipoError } = await supabase
      .from('tipos_sierra')
      .select('id')
      .eq('id', tipo_sierra_id)
      .single();

    if (!tipoSierra) {
      return res.status(400).json({
        message: 'El tipo de sierra especificado no existe'
      });
    }

    // Verificar que exista el cliente
    const { data: cliente, error: clienteError } = await supabase
      .from('clientes')
      .select('id')
      .eq('id', cliente_id)
      .single();

    if (!cliente) {
      return res.status(400).json({
        message: 'El cliente especificado no existe'
      });
    }

    const { data, error } = await supabase
      .from('sierras')
      .insert([
        { 
          codigo,
          tipo_sierra_id,
          cliente_id,
          estado: true
        }
      ])
      .select(`
        *,
        tipos_sierra (id, codigo, nombre),
        clientes (id, nombre, telefono)
      `)
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error al crear sierra:', error);
    res.status(500).json({
      message: 'Error al crear sierra',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const updateSierra = async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo, tipo_sierra_id, cliente_id } = req.body;

    // Validación básica
    if (!codigo || !tipo_sierra_id || !cliente_id) {
      return res.status(400).json({
        message: 'Código, tipo de sierra y cliente son requeridos'
      });
    }

    // Verificar si el código ya existe en otra sierra
    const { data: existing, error: searchError } = await supabase
      .from('sierras')
      .select('id')
      .eq('codigo', codigo)
      .neq('id', id)
      .single();

    if (existing) {
      return res.status(400).json({
        message: 'Ya existe otra sierra con este código'
      });
    }

    const { data, error } = await supabase
      .from('sierras')
      .update({ 
        codigo,
        tipo_sierra_id,
        cliente_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        tipos_sierra (id, codigo, nombre),
        clientes (id, nombre, telefono)
      `)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        message: 'Sierra no encontrada'
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Error al actualizar sierra:', error);
    res.status(500).json({
      message: 'Error al actualizar sierra',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const deleteSierra = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si hay historial de afilados activos
    const { data: historial, error: historialError } = await supabase
      .from('historial')
      .select('id')
      .eq('sierra_id', id)
      .eq('estado', true);

    if (historial && historial.length > 0) {
      return res.status(400).json({
        message: 'No se puede eliminar la sierra porque tiene historial de afilados asociado'
      });
    }

    const { data, error } = await supabase
      .from('sierras')
      .update({ estado: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        message: 'Sierra no encontrada'
      });
    }

    res.json({ message: 'Sierra eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar sierra:', error);
    res.status(500).json({
      message: 'Error al eliminar sierra',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

