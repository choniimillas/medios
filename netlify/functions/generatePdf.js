/**
 * Netlify Function: Generar PDF Presupuesto
 * Fetches presupuesto + related data, generates PDF, uploads to Supabase Storage, updates pdf_url
 */

const { createClient } = require('@supabase/supabase-js')
const PDFDocument = require('pdfkit')

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

  const { presupuesto_id } = body
  if (!presupuesto_id) {
    return { statusCode: 400, body: JSON.stringify({ message: 'presupuesto_id is required' }) }
  }

  try {
    const { data: presupuesto, error: errPresupuesto } = await supabase
      .from('presupuestos')
      .select(`
        *,
        cliente:clientes(nombre),
        anunciante:anunciantes(nombre)
      `)
      .eq('id', presupuesto_id)
      .single()

    if (errPresupuesto || !presupuesto) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Presupuesto not found' }),
      }
    }

    const { data: lineas } = await supabase
      .from('presupuesto_propiedades')
      .select(`
        *,
        propiedad:propiedades(ref_n, ubicacion, localidad, m2, costo_colocacion, precio_mensual)
      `)
      .eq('presupuesto_id', presupuesto_id)

    const doc = new PDFDocument({ margin: 50 })
    const chunks = []
    doc.on('data', (chunk) => chunks.push(chunk))

    doc.fontSize(20).text('Presupuesto', { align: 'center' })
    doc.moveDown()
    doc.fontSize(12).text(`Número: ${presupuesto.numero || '—'}`, { align: 'left' })
    doc.text(`Fecha: ${presupuesto.fecha || '—'}`, { align: 'left' })
    doc.text(`Cliente: ${presupuesto.cliente?.nombre || '—'}`, { align: 'left' })
    doc.text(`Anunciante: ${presupuesto.anunciante?.nombre || '—'}`, { align: 'left' })
    doc.moveDown()

    doc.fontSize(14).text('Propiedades', { underline: true })
    doc.moveDown(0.5)

    ;(lineas || []).forEach((l, i) => {
      const prop = l.propiedad || {}
      doc.fontSize(10)
        .text(`${i + 1}. ${prop.ref_n || '—'} - ${prop.ubicacion || ''} ${prop.localidad || ''}`, { continued: false })
        .text(`   m²: ${prop.m2 ?? '—'} | Colocación: ${l.costo_colocacion ?? prop.costo_colocacion ?? '—'} | Mensual: ${l.precio_mensual ?? prop.precio_mensual ?? '—'}`)
    })

    doc.end()

    const pdfBuffer = await new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)
    })

    const fileName = `presupuestos/${presupuesto_id}.pdf`
    const { error: uploadErr } = await supabase.storage
      .from('pdfs')
      .upload(fileName, pdfBuffer, { contentType: 'application/pdf', upsert: true })

    if (uploadErr) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Error uploading PDF', error: uploadErr.message }),
      }
    }

    const { data: urlData } = supabase.storage.from('pdfs').getPublicUrl(fileName)
    const pdfUrl = urlData?.publicUrl

    const { error: updateErr } = await supabase
      .from('presupuestos')
      .update({ pdf_url: pdfUrl })
      .eq('id', presupuesto_id)

    if (updateErr) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Error updating presupuesto', error: updateErr.message }),
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pdf_url: pdfUrl }),
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.message || 'Internal server error' }),
    }
  }
}
