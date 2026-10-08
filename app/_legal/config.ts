// Datos del titular de Growlia. Obligatorios por el RGPD (art. 13) y la LSSI (art. 10).
// Rellenar cuando estén disponibles: mientras estén vacíos, las páginas solo muestran el email.
export const LEGAL = {
  titular: '',
  nif: '',
  domicilio: '',
  email: 'support@growlia.es',
  web: 'https://www.growlia.es',
  actualizado: '8 de octubre de 2026',
}

export const TITULAR = LEGAL.titular || 'Growlia'
export const HAS_IDENTITY = !!(LEGAL.titular && LEGAL.nif && LEGAL.domicilio)
