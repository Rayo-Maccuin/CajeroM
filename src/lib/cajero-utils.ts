// Utilidades para el cajero automático

// Denominaciones disponibles (sin billetes de $5.000)
const DENOMINACIONES = [100000, 50000, 20000, 10000]

/**
 * Valida si un monto puede ser dispensado con las denominaciones disponibles
 */
export function validarMonto(monto: number): boolean {
  if (monto <= 0 || monto > 2000000) return false
  if (monto % 10000 !== 0) return false

  // Verificar si el monto puede ser formado con las denominaciones disponibles
  return puedeFormarMonto(monto, DENOMINACIONES)
}

/**
 * Verifica si un monto puede ser formado con las denominaciones dadas
 */
function puedeFormarMonto(monto: number, denominaciones: number[]): boolean {
  if (monto === 0) return true
  if (monto < 0) return false

  for (const denominacion of denominaciones) {
    if (monto >= denominacion) {
      if (puedeFormarMonto(monto - denominacion, denominaciones)) {
        return true
      }
    }
  }

  return false
}

/**
 * Calcula la cantidad de billetes usando la metodología del acarreo
 * (algoritmo greedy - siempre toma la denominación más grande posible)
 */
export function calcularBilletes(monto: number): Record<string, number> {
  const billetes: Record<string, number> = {}
  let montoRestante = monto

  // Inicializar todas las denominaciones en 0
  DENOMINACIONES.forEach((denominacion) => {
    billetes[denominacion.toString()] = 0
  })

  // Aplicar metodología del acarreo
  for (const denominacion of DENOMINACIONES) {
    if (montoRestante >= denominacion) {
      const cantidad = Math.floor(montoRestante / denominacion)
      billetes[denominacion.toString()] = cantidad
      montoRestante -= cantidad * denominacion
    }
  }

  return billetes
}

/**
 * Calcula cuántos retiros más son posibles con un saldo dado
 */
export function calcularRetirosRestantes(saldoDisponible: number, montoRetiro: number): number {
  if (montoRetiro <= 0) return 0
  return Math.floor(saldoDisponible / montoRetiro)
}

/**
 * Formatea un número como moneda colombiana
 */
export function formatearMoneda(monto: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(monto)
}
