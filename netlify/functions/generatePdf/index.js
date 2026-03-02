const { createClient } = require('@supabase/supabase-js');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

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

  const { presupuesto_id } = body;
  if (!presupuesto_id) {
    return { statusCode: 400, headers, body: JSON.stringify({ message: 'presupuesto_id required' }) };
  }

  try {
    const { data: p, error: pErr } = await supabase
      .from('presupuestos')
      .select('*, cliente:clientes(nombre), anunciante:anunciantes(nombre)')
      .eq('id', presupuesto_id)
      .single();

    if (pErr || !p) throw new Error('Budget not found');

    const { data: lineas, error: lErr } = await supabase
      .from('presupuesto_propiedades')
      .select('*, propiedad:propiedades(ref_n, ubicacion, localidad, m2)')
      .eq('presupuesto_id', presupuesto_id);

    if (lErr) throw lErr;

    // Create a new PDFDocument
    const pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    let yOffset = height - 50;

    page.drawText(`Presupuesto ${p.numero}`, { x: 50, y: yOffset, size: 20, font: timesRomanBold, color: rgb(0, 0, 0) });
    yOffset -= 30;

    page.drawText(`Cliente: ${p.cliente?.nombre || '—'}`, { x: 50, y: yOffset, size: 12, font: timesRomanFont });
    yOffset -= 20;
    page.drawText(`Anunciante: ${p.anunciante?.nombre || '—'}`, { x: 50, y: yOffset, size: 12, font: timesRomanFont });
    yOffset -= 30;

    lineas.forEach((l, i) => {
      const prop = l.propiedad || {};
      const lineText = `${i + 1}. ${prop.ref_n} - ${prop.ubicacion} | $${l.precio_mensual || 0}`;
      page.drawText(lineText, { x: 50, y: yOffset, size: 10, font: timesRomanFont });
      yOffset -= 20;
    });

    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);

    const fileName = `presupuestos/${presupuesto_id}.pdf`;
    const { error: upErr } = await supabase.storage
      .from('pdfs')
      .upload(fileName, pdfBuffer, { contentType: 'application/pdf', upsert: true });

    if (upErr) throw upErr;

    const { data: urlData } = supabase.storage.from('pdfs').getPublicUrl(fileName);
    const pdfUrl = urlData.publicUrl;

    await supabase.from('presupuestos').update({ pdf_url: pdfUrl }).eq('id', presupuesto_id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ pdf_url: pdfUrl })
    };

  } catch (err) {
    console.error('PDF Error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: err.message || 'Internal Server Error' })
    };
  }
};
