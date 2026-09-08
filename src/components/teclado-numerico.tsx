"use client"

import { Button } from "../ui/button"

interface Props {
  valor: string
  onChange: (valor: string) => void
  onAceptar: () => void
  maxLength?: number
  placeholder?: string
  esPassword?: boolean
}

export default function TecladoNumerico({
  valor,
  onChange,
  onAceptar,
  maxLength = 20,
  placeholder = "Ingrese el valor",
  esPassword = false,
}: Props) {
  const handleNumero = (numero: string) => {
    if (valor.length < maxLength) {
      onChange(valor + numero)
    }
  }

  const handleBorrar = () => {
    onChange(valor.slice(0, -1))
  }

  const numeros = [["1", "2", "3"], ["4", "5", "6"], ["7", "8", "9"], ["0"]]

  const mostrarValor = () => {
    if (!valor) {
      return <span className="text-gray-400">{placeholder}</span>
    }
    return esPassword ? "•".repeat(valor.length) : valor
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Display */}
      <div className="mb-6 p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
        <div className="text-2xl font-mono text-center min-h-[2rem] flex items-center justify-center">
          {mostrarValor()}
        </div>
      </div>

      {/* Teclado */}
      <div className="space-y-3">
        {numeros.slice(0, 3).map((fila, filaIndex) => (
          <div key={filaIndex} className="grid grid-cols-3 gap-3">
            {fila.map((numero) => (
              <Button
                key={numero}
                onClick={() => handleNumero(numero)}
                variant="outline"
                className="h-16 text-xl font-semibold hover:bg-gray-100 border-2"
              >
                {numero}
              </Button>
            ))}
          </div>
        ))}

        {/* Última fila con 0, Borrar */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => handleNumero("0")}
            variant="outline"
            className="h-16 text-xl font-semibold hover:bg-gray-100 border-2"
          >
            0
          </Button>
          <Button
            onClick={handleBorrar}
            variant="outline"
            className="h-16 text-lg font-semibold bg-red-100 hover:bg-red-200 text-red-700 border-2 border-red-300"
          >
            Borrar
          </Button>
        </div>

        {/* Botón Aceptar */}
        <Button
          onClick={onAceptar}
          className="w-full h-16 text-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white"
          disabled={valor.length === 0}
        >
          Aceptar
        </Button>
      </div>
    </div>
  )
}
