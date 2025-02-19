// src/controllers/busqueda.controller.js
import supabase from '../utils/supabase.js';

export const buscarSierras = async (req, res) => {
  try {
    const { codigo } = req.query;

    if (!codigo) {
      return res.status(400).json({
        message: 'Se requiere un código para la búsqueda'
      });
    }

    const { data, error } = await supabase
      .from('sierras')
      .select(`
        *,
        tipos_sierra (id, codigo, nombre),
        clientes (id, nombre, telefono)
      `)
      .ilike('codigo', `%${codigo}%`)
      .eq('estado', true)
      .order('codigo');

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error al buscar sierras:', error);
    res.status(500).json({
      message: 'Error al buscar sierras',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const buscarClientes = async (req, res) => {
  try {
    const { nombre } = req.query;

    if (!nombre) {
      return res.status(400).json({
        message: 'Se requiere un nombre para la búsqueda'
      });
    }

    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .ilike('nombre', `%${nombre}%`)
      .eq('estado', true)
      .order('nombre');

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error al buscar clientes:', error);
    res.status(500).json({
      message: 'Error al buscar clientes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const buscarHistorial = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, tipo_afilado } = req.query;

    let query = supabase
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
      `);

    // Aplicar filtros si se proporcionan
    if (fecha_inicio) {
      query = query.gte('fecha', fecha_inicio);
    }
    if (fecha_fin) {
      query = query.lte('fecha', fecha_fin);
    }
    if (tipo_afilado) {
      query = query.eq('tipo_afilado', tipo_afilado.toUpperCase());
    }

    const { data, error } = await query.order('fecha', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error al buscar historial:', error);
    res.status(500).json({
      message: 'Error al buscar historial',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};