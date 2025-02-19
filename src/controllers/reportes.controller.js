// src/controllers/reportes.controller.js
import supabase from '../utils/supabase.js';

export const getHistorialPorSierra = async (req, res) => {
  try {
    const { sierra_id } = req.params;
    
    // Verificar que la sierra existe
    const { data: sierra, error: sierraError } = await supabase
      .from('sierras')
      .select(`
        *,
        tipos_sierra (codigo, nombre),
        clientes (nombre)
      `)
      .eq('id', sierra_id)
      .single();

    if (!sierra) {
      return res.status(404).json({
        message: 'Sierra no encontrada'
      });
    }

    // Obtener el historial de la sierra
    const { data: historial, error: historialError } = await supabase
      .from('historial')
      .select(`
        *,
        usuarios (nombre)
      `)
      .eq('sierra_id', sierra_id)
      .order('fecha', { ascending: false });

    if (historialError) throw historialError;

    // Estructurar la respuesta
    const reporte = {
      sierra: {
        id: sierra.id,
        codigo: sierra.codigo,
        tipo_sierra: sierra.tipos_sierra,
        cliente: sierra.clientes,
        fecha_ultimo_afilado: sierra.fecha_ultimo_afilado
      },
      historial: historial.map(h => ({
        id: h.id,
        fecha: h.fecha,
        tipo_afilado: h.tipo_afilado,
        observaciones: h.observaciones,
        operario: h.usuarios.nombre
      })),
      resumen: {
        total_afilados: historial.length,
        afilados_por_tipo: historial.reduce((acc, h) => {
          acc[h.tipo_afilado] = (acc[h.tipo_afilado] || 0) + 1;
          return acc;
        }, {})
      }
    };

    res.json(reporte);
  } catch (error) {
    console.error('Error al obtener historial por sierra:', error);
    res.status(500).json({
      message: 'Error al obtener historial',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getHistorialPorCliente = async (req, res) => {
    try {
      const { cliente_id } = req.params;
      
      // Verificar que el cliente existe
      const { data: cliente, error: clienteError } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', cliente_id)
        .single();
  
      if (!cliente) {
        return res.status(404).json({
          message: 'Cliente no encontrado'
        });
      }
  
      // Obtener todas las sierras del cliente
      const { data: sierras, error: sierrasError } = await supabase
        .from('sierras')
        .select(`
          id,
          codigo,
          fecha_ultimo_afilado,
          tipos_sierra (id, codigo, nombre),
          historial (
            id,
            fecha,
            tipo_afilado,
            observaciones,
            usuarios (nombre)
          )
        `)
        .eq('cliente_id', cliente_id)
        .eq('estado', true);
  
      if (sierrasError) throw sierrasError;
  
      // Estructurar la respuesta
      const reporte = {
        cliente: {
          id: cliente.id,
          nombre: cliente.nombre,
          telefono: cliente.telefono,
          direccion: cliente.direccion
        },
        sierras: sierras.map(sierra => ({
          id: sierra.id,
          codigo: sierra.codigo,
          tipo_sierra: sierra.tipos_sierra,
          fecha_ultimo_afilado: sierra.fecha_ultimo_afilado,
          historial: sierra.historial.map(h => ({
            id: h.id,
            fecha: h.fecha,
            tipo_afilado: h.tipo_afilado,
            observaciones: h.observaciones,
            operario: h.usuarios.nombre
          })).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        })),
        resumen: {
          total_sierras: sierras.length,
          total_afilados: sierras.reduce((acc, sierra) => 
            acc + sierra.historial.length, 0
          ),
          afilados_por_tipo: sierras.reduce((acc, sierra) => {
            sierra.historial.forEach(h => {
              acc[h.tipo_afilado] = (acc[h.tipo_afilado] || 0) + 1;
            });
            return acc;
          }, {})
        }
      };
  
      res.json(reporte);
    } catch (error) {
      console.error('Error al obtener historial por cliente:', error);
      res.status(500).json({
        message: 'Error al obtener historial',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
};

export const getSierrasPorCliente = async (req, res) => {
    try {
      const { cliente_id } = req.params;
      const { desde, hasta } = req.query;  // Parámetros opcionales para filtrar por fecha
  
      // Verificar que el cliente existe
      const { data: cliente, error: clienteError } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', cliente_id)
        .single();
  
      if (!cliente) {
        return res.status(404).json({
          message: 'Cliente no encontrado'
        });
      }
  
      // Construir la consulta base
      let query = supabase
        .from('sierras')
        .select(`
          id,
          codigo,
          estado,
          fecha_ultimo_afilado,
          tipos_sierra (id, codigo, nombre),
          historial (
            fecha,
            tipo_afilado
          )
        `)
        .eq('cliente_id', cliente_id);
  
      // Filtrar por fechas si se proporcionan
      if (desde) {
        query = query.gte('fecha_ultimo_afilado', desde);
      }
      if (hasta) {
        query = query.lte('fecha_ultimo_afilado', hasta);
      }
  
      const { data: sierras, error: sierrasError } = await query;
  
      if (sierrasError) throw sierrasError;
  
      // Procesar y estructurar la información
      const sierrasProcessed = sierras.map(sierra => {
        const afiladosUltimos30Dias = sierra.historial.filter(h => {
          const fechaAfilado = new Date(h.fecha);
          const hace30Dias = new Date();
          hace30Dias.setDate(hace30Dias.getDate() - 30);
          return fechaAfilado >= hace30Dias;
        }).length;
  
        return {
          id: sierra.id,
          codigo: sierra.codigo,
          tipo_sierra: sierra.tipos_sierra,
          estado: sierra.estado,
          fecha_ultimo_afilado: sierra.fecha_ultimo_afilado,
          total_afilados: sierra.historial.length,
          afilados_ultimos_30_dias: afiladosUltimos30Dias,
          estado_afilado: sierra.fecha_ultimo_afilado ? 
            calcularEstadoAfilado(new Date(sierra.fecha_ultimo_afilado)) : 
            'SIN AFILAR'
        };
      });
  
      // Preparar el resumen
      const resumen = {
        total_sierras: sierrasProcessed.length,
        sierras_activas: sierrasProcessed.filter(s => s.estado).length,
        sierras_por_estado_afilado: sierrasProcessed.reduce((acc, sierra) => {
          acc[sierra.estado_afilado] = (acc[sierra.estado_afilado] || 0) + 1;
          return acc;
        }, {})
      };
  
      res.json({
        cliente: {
          id: cliente.id,
          nombre: cliente.nombre,
          telefono: cliente.telefono,
          direccion: cliente.direccion
        },
        sierras: sierrasProcessed,
        resumen
      });
  
    } catch (error) {
      console.error('Error al obtener sierras por cliente:', error);
      res.status(500).json({
        message: 'Error al obtener sierras',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
  
  // Función auxiliar para calcular el estado del afilado
  function calcularEstadoAfilado(fechaUltimoAfilado) {
    const diasDesdeUltimoAfilado = Math.floor(
      (new Date() - fechaUltimoAfilado) / (1000 * 60 * 60 * 24)
    );
  
    if (diasDesdeUltimoAfilado <= 30) {
      return 'RECIENTE';
    } else if (diasDesdeUltimoAfilado <= 60) {
      return 'REGULAR';
    } else {
      return 'REQUIERE ATENCIÓN';
    }
  }

  export const getEstadisticasAfilados = async (req, res) => {
    try {
      const { desde, hasta } = req.query;
      
      // Establecer fechas por defecto si no se proporcionan
      const fechaHasta = hasta ? new Date(hasta) : new Date();
      const fechaDesde = desde ? new Date(desde) : new Date(fechaHasta);
      fechaDesde.setMonth(fechaHasta.getMonth() - 1); // Por defecto, último mes
  
      // Obtener todos los afilados en el rango de fechas
      const { data: afilados, error: afiladosError } = await supabase
        .from('historial')
        .select(`
          *,
          sierras (
            codigo,
            cliente_id,
            tipos_sierra (codigo, nombre)
          ),
          usuarios (nombre)
        `)
        .gte('fecha', fechaDesde.toISOString())
        .lte('fecha', fechaHasta.toISOString())
        .order('fecha', { ascending: false });
  
      if (afiladosError) throw afiladosError;
  
      // Obtener información de clientes para los afilados
      const clientesIds = [...new Set(afilados.map(a => a.sierras.cliente_id))];
      const { data: clientes, error: clientesError } = await supabase
        .from('clientes')
        .select('id, nombre')
        .in('id', clientesIds);
  
      if (clientesError) throw clientesError;
  
      // Mapear clientes para acceso rápido
      const clientesMap = clientes.reduce((acc, cliente) => {
        acc[cliente.id] = cliente;
        return acc;
      }, {});
  
      // Procesar estadísticas
      const estadisticas = {
        periodo: {
          desde: fechaDesde.toISOString(),
          hasta: fechaHasta.toISOString()
        },
        totales: {
          afilados: afilados.length,
          clientes_atendidos: new Set(afilados.map(a => a.sierras.cliente_id)).size,
          sierras_afiladas: new Set(afilados.map(a => a.sierra_id)).size
        },
        por_tipo_afilado: afilados.reduce((acc, afilado) => {
          acc[afilado.tipo_afilado] = (acc[afilado.tipo_afilado] || 0) + 1;
          return acc;
        }, {}),
        por_operario: afilados.reduce((acc, afilado) => {
          const operario = afilado.usuarios.nombre;
          acc[operario] = (acc[operario] || 0) + 1;
          return acc;
        }, {}),
        top_clientes: Object.entries(
          afilados.reduce((acc, afilado) => {
            const clienteId = afilado.sierras.cliente_id;
            acc[clienteId] = (acc[clienteId] || 0) + 1;
            return acc;
          }, {})
        )
          .map(([clienteId, cantidad]) => ({
            cliente: clientesMap[clienteId].nombre,
            cantidad
          }))
          .sort((a, b) => b.cantidad - a.cantidad)
          .slice(0, 5),
        promedio_diario: Math.round(
          afilados.length / 
          ((fechaHasta - fechaDesde) / (1000 * 60 * 60 * 24))
        )
      };
  
      // Agrupar por días para el análisis de tendencia
      const afiladosPorDia = afilados.reduce((acc, afilado) => {
        const fecha = afilado.fecha.split('T')[0];
        acc[fecha] = (acc[fecha] || 0) + 1;
        return acc;
      }, {});
  
      // Añadir análisis de tendencia
      estadisticas.tendencia = Object.keys(afiladosPorDia)
        .sort()
        .map(fecha => ({
          fecha,
          cantidad: afiladosPorDia[fecha]
        }));
  
      res.json(estadisticas);
  
    } catch (error) {
      console.error('Error al obtener estadísticas de afilados:', error);
      res.status(500).json({
        message: 'Error al obtener estadísticas',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };