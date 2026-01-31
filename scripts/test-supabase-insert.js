// Test: Insertar factura en Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Usamos service_role para bypass RLS

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan credenciales en .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  console.log('🔌 Conectando a Supabase...');
  console.log(`   URL: ${supabaseUrl}`);

  // Factura de prueba (similar a lo que devuelve Redconar OCR)
  const facturaPrueba = {
    nro_factura: '00003-00002916',
    detalle: '131-mortimer,107- guante mapa,279- rejilla migitorio,195-alcohol x 5 lts,267- bolson elegante 24 rollos,54- caja de toalla elegante,124-lysoform aerosol,134 - new scent,77 - desodorante x5,105 glade canasta liquida,78 - detergente x 5,160 - raid azul sin olor,65 - cif gel,63- cif crema,325 - esponja borramax',
    importe: 306820.92,
    cuit_emisor: '30-715689770-0',
    cuit_receptor: '30-718413377-7',
    fecha_factura: '2025-07-08',
    ocr_data: {
      cuit_emisor: '30-715689770-0',
      cuit_destinatario: '30-718413377-7',
      descripcion: '131-mortimer,107- guante mapa,279- rejilla migitorio...',
      fecha: '08-07-2025',
      monto_total: 306820.92,
      numero: '00003-00002916',
      proveedor: 'GS CLEANING SRL',
      tipo: 'factura'
    }
  };

  console.log('\n📄 Insertando factura de prueba:');
  console.log(`   N°: ${facturaPrueba.nro_factura}`);
  console.log(`   Importe: $${facturaPrueba.importe}`);
  console.log(`   CUIT Emisor: ${facturaPrueba.cuit_emisor}`);
  console.log(`   CUIT Receptor: ${facturaPrueba.cuit_receptor}`);

  try {
    const { data, error, status, statusText } = await supabase
      .from('facturas')
      .insert(facturaPrueba)
      .select();

    if (error) {
      console.error('\n❌ Error al insertar:');
      console.error(`   Status: ${status} ${statusText}`);
      console.error(`   Message: ${error.message}`);
      console.error(`   Details: ${error.details}`);
      console.error(`   Hint: ${error.hint}`);
      process.exit(1);
    }

    console.log('\n✅ Factura insertada correctamente:');
    console.log(`   ID: ${data[0].id}`);
    console.log(`   Creada: ${data[0].created_at}`);

    // Ahora leer todas las facturas
    console.log('\n📋 Leyendo todas las facturas...');
    const { data: facturas, error: errorRead } = await supabase
      .from('facturas')
      .select('*')
      .order('created_at', { ascending: false });

    if (errorRead) {
      console.error('❌ Error al leer:', errorRead);
      process.exit(1);
    }

    console.log(`\n📊 Total de facturas en BD: ${facturas.length}`);
    facturas.forEach((f, i) => {
      console.log(`\n   ${i + 1}. Factura #${f.nro_factura}`);
      console.log(`      Importe: $${f.importe}`);
      console.log(`      Emisor: ${f.cuit_emisor}`);
    });

  } catch (err) {
    console.error('\n❌ Error inesperado:', err.message);
    process.exit(1);
  }
}

testInsert();
