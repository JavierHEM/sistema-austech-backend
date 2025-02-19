// src/controllers/dashboard.controller.js
import supabase from '../utils/supabase.js';

export const getResumenDashboard = async (req, res) => {
  try {
    // Obtener fecha actual y fechas para filtros
    const ahora = new Date();
    const inicioDia = new Date(ahora.setHours(0, 0, 0, 0)).toISOString();
    const finDia = new Date(ahora.setHours(23, 59, 59, 999)).toISOString();
    
    const inicioSemana = new Date(ahora);
    inicioSemana.setDate(ahora.getDate() - ahora.getDay());
    
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

    // 1. Afilados del día
    const { data: afiladosHoy, error: errorHoy } = await supabase
      .from('historial')
      .select(`
        *,
        sierras (
          codigo,
          clientes (nombre)
        ),
        usuarios (nombre)
      `)
      .gte('fecha', inicioDia)
      .lte('fecha', finDia)
      .order('fecha', { ascending: false });

    // 2. Resumen de la semana
    const { data: afiladosSemana, error: errorSemana } = await supabase
      .from('historial')
      .select('tipo_afilado, fecha')
      .gte('fecha', inicioSemana.toISOString())
      .lte('fecha', finDia);

    // 3. Resumen del mes
    const { data: afiladosMes, error: errorMes } = await supabase
      .from('historial')
      .select('tipo_afilado, fecha')
      .gte('fecha', inicioMes.toISOString())
      .lte('fecha', finDia);

    // 4. Sierras que requieren atención (no afiladas en más de 60 días)
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 60);
    
    const { data: sierrasAtencion, error: errorSierras } = await supabase
      .from('sierras')
      .select(`
        id,
        codigo,
        fecha_ultimo_afilado,
        tipos_sierra (nombre),
        clientes (nombre)
      `)
      .or(`fecha_ultimo_afilado.lt.${fechaLimite.toISOString()},fecha_ultimo_afilado.is.null`)
      .eq('estado', true)
      .order('fecha_ultimo_afilado', { ascending: true });

    // Estructurar respuesta
    const dashboard = {
      afilados_hoy: {
        total: afiladosHoy?.length || 0,
        detalle: afiladosHoy?.map(a => ({
          id: a.id,
          hora: new Date(a.fecha).toLocaleTimeString(),
          tipo: a.tipo_afilado,
          sierra: a.sierras.codigo,
          cliente: a.sierras.clientes.nombre,
          operario: a.usuarios.nombre
        }))
      },
      resumen_semana: {
        total: afiladosSemana?.length || 0,
        por_tipo: afiladosSemana?.reduce((acc, a) => {
          acc[a.tipo_afilado] = (acc[a.tipo_afilado] || 0) + 1;
          return acc;
        }, {})
      },
      resumen_mes: {
        total: afiladosMes?.length || 0,
        por_tipo: afiladosMes?.reduce((acc, a) => {
          acc[a.tipo_afilado] = (acc[a.tipo_afilado] || 0) + 1;
          return acc;
        }, {})
      },
      sierras_requieren_atencion: sierrasAtencion?.map(s => ({
        id: s.id,
        codigo: s.codigo,
        tipo: s.tipos_sierra.nombre,
        cliente: s.clientes.nombre,
        ultimo_afilado: s.fecha_ultimo_afilado,
        dias_sin_afilar: s.fecha_ultimo_afilado ? 
          Math.floor((new Date() - new Date(s.fecha_ultimo_afilado)) / (1000 * 60 * 60 * 24)) :
          'Nunca afilada'
      }))
    };

    res.json(dashboard);
  } catch (error) {
    console.error('Error al obtener resumen del dashboard:', error);
    res.status(500).json({
      message: 'Error al obtener datos del dashboard',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};