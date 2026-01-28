// Mapeo de orígenes a prefijos de radicado interno
export const ORIGEN_TO_PREFIJO: { [key: string]: string } = {
  'EJECUCIÓN MUNICIPAL - CIVIL 001 BARRANQUILLA': 'PC-01',
  'EJECUCIÓN MUNICIPAL - CIVIL 002 BARRANQUILLA': 'PC-02',
  'EJECUCIÓN MUNICIPAL - CIVIL 003 BARRANQUILLA': 'PC-03',
  'EJECUCIÓN MUNICIPAL - CIVIL 004 BARRANQUILLA': 'PC-04',
  'EJECUCIÓN MUNICIPAL - CIVIL 005 BARRANQUILLA': 'PC-05',
  'EJECUCIÓN MUNICIPAL - CIVIL 006 BARRANQUILLA': 'PC-06',
  'EJECUCIÓN MUNICIPAL - CIVIL 007 BARRANQUILLA': 'PC-07',
  'Juzgado 01 Civil del Circuito': 'C1',
  'Juzgado 02 Civil del Circuito': 'C2',
  'Juzgado 03 Civil del Circuito': 'C3',
  'Juzgado 04 Civil del Circuito': 'C4',
  'Juzgado 05 Civil del Circuito': 'C5',
  'Juzgado 06 Civil del Circuito': 'C6',
  'Juzgado 07 Civil del Circuito': 'C7',
  'Juzgado 08 Civil del Circuito': 'C8',
  'Juzgado 09 Civil del Circuito': 'C9',
  'Juzgado 10 Civil del Circuito': 'C10',
  'Juzgado 11 Civil del Circuito': 'C11',
  'Juzgado 12 Civil del Circuito': 'C12',
  'Juzgado 13 Civil del Circuito': 'C13',
  'Juzgado 14 Civil del Circuito': 'C14',
  'Juzgado 15 Civil del Circuito': 'C15',
  'Juzgado 16 Civil del Circuito': 'C16',
};

// Función para obtener el prefijo según el nombre del origen
export const getPrefijoByOrigenNombre = (origenNombre: string): string | null => {
  return ORIGEN_TO_PREFIJO[origenNombre] || null;
};
