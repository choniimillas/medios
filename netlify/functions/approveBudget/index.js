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
        return { statusCode: 500, headers, body: JSON.stringify({ message: 'Missing credentials' }) };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    let body;
    try {
        body = JSON.parse(event.body || '{}');
    } catch (e) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'Invalid JSON' }) };
    }

    const { presupuesto_id, inicio, fin } = body;
    if (!presupuesto_id || !inicio || !fin) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'Missing required fields' }) };
    }

    try {
        // 1. Get the budget and its lines
        const { data: p, error: pErr } = await supabase
            .from('presupuestos')
            .select('*, lineas:presupuesto_propiedades(*)')
            .eq('id', presupuesto_id)
            .single();

        if (pErr || !p) throw new Error('Budget not found');
        if (p.estado === 'Aprobado') throw new Error('Budget is already approved');

        // 2. Determine Service Number
        const { count, error: countErr } = await supabase.from('servicios').select('*', { count: 'exact', head: true });
        if (countErr) throw countErr;
        const numero = `S-${String((count || 0) + 1).padStart(4, '0')}`;

        // 3. Create the Service
        const { data: sData, error: sErr } = await supabase
            .from('servicios')
            .insert({
                numero,
                inicio,
                fin,
                cliente_id: p.cliente_id,
                anunciante_id: p.anunciante_id,
                presupuesto_id: p.id
            })
            .select('id')
            .single();

        if (sErr) throw sErr;

        // 4. Copy properties to servicio_propiedad
        if (p.lineas && p.lineas.length > 0) {
            const spRows = p.lineas.map(l => ({
                sp_servicio: sData.id,
                sp_propiedad: l.propiedad_id,
                sp_inicio: inicio,
                sp_fin: fin
            }));
            const { error: spErr } = await supabase.from('servicio_propiedad').insert(spRows);
            if (spErr) {
                // Rollback service creation if line insertion fails
                await supabase.from('servicios').delete().eq('id', sData.id);
                throw spErr;
            }
        }

        // 5. Update budget status
        const { error: upErr } = await supabase
            .from('presupuestos')
            .update({ estado: 'Aprobado' })
            .eq('id', presupuesto_id);

        if (upErr) throw upErr;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, servicio_id: sData.id, numero })
        };

    } catch (err) {
        console.error('Approval Error:', err);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: err.message || 'Internal Server Error' })
        };
    }
};
