// Array de billetes
export const billetes = [10000, 20000, 50000, 100000]

// Función para calcular el monto a retirar usando el array de billetes
export function retirar(solicitar: number, valores: number[][] = []): number {
  let monto = 0

  // Se asegura de que los valores son un array y tienen el tamaño suficiente
  if (!Array.isArray(valores)) {
    valores = []
  }
  while (valores.length < billetes.length) {
    valores.push([])
  }

  for (let i = 0; i < billetes.length; i++) {
    if (billetes[i] + monto <= solicitar) {
      for (let j = i; j < billetes.length; j++) {
        if (monto + billetes[j] <= solicitar) {
          monto += billetes[j]
          valores[i].push(billetes[j])
        }
      }
    } else {
      return monto
    }
  }
  return monto
}

// Se formatea la cantidad de billetes entregados
export function formatear(valores: number[][]): Record<string, number> {
  const numeroBilletes = {
    "10k": 0,
    "20k": 0,
    "50k": 0,
    "100k": 0,
  }

  for (const fila of valores) {
    for (const billete of fila) {
      switch (billete) {
        case 10000:
          numeroBilletes["10k"]++
          break
        case 20000:
          numeroBilletes["20k"]++
          break
        case 50000:
          numeroBilletes["50k"]++
          break
        case 100000:
          numeroBilletes["100k"]++
          break
        default:
          console.warn(`Billete inesperado: ${billete}`)
          break
      }
    }
  }

  return numeroBilletes
}

export class Banco {
  saldo: number

  constructor() {
    this.saldo = 1000000 // Saldo en pesos
  }

  retirar(solicitar: number) {
    const valores: number[][] = []
    let monto = 0

    while (monto < solicitar) {
      monto += retirar(solicitar - monto, valores)
    }

    return { montoRetirado: monto, billetesEntregados: formatear(valores) }
  }
}

// New functions for account balance management
export const getAccountBalance = (): number => {
  const storedBalance = localStorage.getItem("accountBalance")
  // Default balance if none exists yet
  return storedBalance ? Number.parseInt(storedBalance) : 2500000
}

export const updateAccountBalance = (newBalance: number): void => {
  localStorage.setItem("accountBalance", newBalance.toString())
}

export const deductFromBalance = (amount: number): boolean => {
  const currentBalance = getAccountBalance()
  if (currentBalance >= amount) {
    updateAccountBalance(currentBalance - amount)
    return true
  }
  return false
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount)
}
