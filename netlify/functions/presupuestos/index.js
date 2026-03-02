const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ message: 'Method Not Allowed' }) };
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ message: 'Missing Supabase credentials' }) };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ message: 'Invalid JSON' }) };
  }

  const { cliente_id, anunciante_id, estado = 'Borrador', lineas = [] } = body;

  if (!cliente_id || !anunciante_id || lineas.length === 0) {
    return { statusCode: 400, headers, body: JSON.stringify({ message: 'Missing required fields: cliente_id, anunciante_id, or lineas' }) };
  }

  try {
    // 1. Get next number
    const { count, error: countErr } = await supabase.from('presupuestos').select('*', { count: 'exact', head: true });
    if (countErr) throw countErr;
    const numero = `P-${String((count || 0) + 1).padStart(4, '0')}`;

    // 2. Insert budget
    const { data: pData, error: pErr } = await supabase
      .from('presupuestos')
      .insert({ numero, cliente_id, anunciante_id, estado })
      .select('id')
      .single();

    if (pErr) throw pErr;

    // 3. Insert lines
    const rows = lineas.map(l => ({
      presupuesto_id: pData.id,
      propiedad_id: l.propiedad_id,
      costo_colocacion: l.costo_colocacion,
      precio_mensual: l.precio_mensual
    }));

    const { error: lErr } = await supabase.from('presupuesto_propiedades').insert(rows);
    if (lErr) {
      // Cleanup
      await supabase.from('presupuestos').delete().eq('id', pData.id);
      throw lErr;
    }

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ id: pData.id, numero })
    };

  } catch (err) {
    console.error('Function Error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: err.message || 'Internal Server Error' })
    };
  }
};
