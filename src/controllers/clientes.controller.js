// src/controllers/clientes.controller.js
import supabase from '../utils/supabase.js';

// Crear un nuevo cliente
export const createCliente = async (req, res) => {
  try {
    const { nombre, direccion, telefono } = req.body;

    // Validación básica
    if (!nombre) {
      return res.status(400).json({
        message: 'El nombre es requerido'
      });
    }

    const { data, error } = await supabase
      .from('clientes')
      .insert([
        { 
          nombre, 
          direccion, 
          telefono,
          estado: true
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({
      message: 'Error al crear cliente',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Actualizar un cliente
export const updateCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, direccion, telefono } = req.body;

    // Validación básica
    if (!nombre) {
      return res.status(400).json({
        message: 'El nombre es requerido'
      });
    }

    const { data, error } = await supabase
      .from('clientes')
      .update({ 
        nombre, 
        direccion, 
        telefono,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        message: 'Cliente no encontrado'
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({
      message: 'Error al actualizar cliente',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Los otros métodos (getClientes, getClienteById, deleteCliente) permanecen igual
export const getClientes = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nombre');

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({
      message: 'Error al obtener clientes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getClienteById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        message: 'Cliente no encontrado'
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({
      message: 'Error al obtener cliente',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const deleteCliente = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('clientes')
      .update({ estado: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        message: 'Cliente no encontrado'
      });
    }

    res.json({ message: 'Cliente eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({
      message: 'Error al eliminar cliente',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};