/**
 * Netlify Function: POST /api/presupuestos
 * Al crear un presupuesto, crear un registro por cada PresupuestoPropiedad
 * Replicates AppSheet bot: bulk insert presupuesto + presupuesto_propiedades
 */

const { createClient } = require('@supabase/supabase-js')

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) }
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' }),
    }
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, body: JSON.stringify({ message: 'Invalid JSON body' }) }
  }

  const { cliente_id, anunciante_id, estado = 'Borrador', propiedad_ids = [] } = body

  if (!cliente_id || !anunciante_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'cliente_id and anunciante_id are required' }),
    }
  }

  if (!Array.isArray(propiedad_ids) || propiedad_ids.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'At least one propiedad_id is required' }),
    }
  }

  try {
    const { count } = await supabase.from('presupuestos').select('*', { count: 'exact', head: true })
    const numero = `P-${String((count ?? 0) + 1).padStart(4, '0')}`

    const { data: presupuesto, error: errPresupuesto } = await supabase
      .from('presupuestos')
      .insert({ numero, cliente_id, anunciante_id, estado })
      .select('id')
      .single()

    if (errPresupuesto) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Error creating presupuesto', error: errPresupuesto.message }),
      }
    }

    const { data: propiedades } = await supabase
      .from('propiedades')
      .select('id, costo_colocacion, precio_mensual')
      .in('id', propiedad_ids)

    const propMap = (propiedades || []).reduce((acc, p) => {
      acc[p.id] = p
      return acc
    }, {})

    const rows = propiedad_ids.map((propiedad_id) => {
      const p = propMap[propiedad_id] || {}
      return {
        presupuesto_id: presupuesto.id,
        propiedad_id,
        costo_colocacion: p.costo_colocacion ?? null,
        precio_mensual: p.precio_mensual ?? null,
      }
    })

    const { error: errPropiedades } = await supabase.from('presupuesto_propiedades').insert(rows)

    if (errPropiedades) {
      await supabase.from('presupuestos').delete().eq('id', presupuesto.id)
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Error creating presupuesto_propiedades', error: errPropiedades.message }),
      }
    }

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: presupuesto.id, numero }),
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.message || 'Internal server error' }),
    }
  }
}
