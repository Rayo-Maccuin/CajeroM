"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { CreditCard, Smartphone, Wallet } from "lucide-react"
import RetiroNequi from "../components/retiro-nequi"
import RetiroAhorroMano from "./retiro-ahorro-mano"
import RetiroCuentaAhorros from "../components/retiro-cuenta-ahorros"

type TipoRetiro = "nequi" | "ahorro-mano" | "cuenta-ahorros" | null

export default function CajeroAutomatico() {
  const [tipoRetiro, setTipoRetiro] = useState<TipoRetiro>(null)

  const handleVolver = () => {
    setTipoRetiro(null)
  }

  if (tipoRetiro === "nequi") {
    return <RetiroNequi onVolver={handleVolver} />
  }

  if (tipoRetiro === "ahorro-mano") {
    return <RetiroAhorroMano onVolver={handleVolver} />
  }

  if (tipoRetiro === "cuenta-ahorros") {
    return <RetiroCuentaAhorros onVolver={handleVolver} />
  }

  return (

     <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl from-white to-white bg-gradient-to-br">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-black-900">Cajero Automático</CardTitle>
          <CardDescription className="text-lg">Selecciona el tipo de retiro que deseas realizar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Button
              onClick={() => setTipoRetiro("nequi")}
              className="h-32 flex flex-col items-center justify-center space-y-2 bg-purple-500 hover:bg-purple-700"
            >
              <Smartphone className="h-8 w-8" />
              <div className="text-center text-white">
                <div className="font-semibold">Retiro NEQUI</div>
              </div>
            </Button>

            <Button
              onClick={() => setTipoRetiro("ahorro-mano")}
              className="h-32 flex flex-col items-center justify-center space-y-2 bg-green-500 hover:bg-green-700"
            >
              <Wallet className="h-8 w-8" />
              <div className="text-center text-white">
                <div className="font-semibold">Ahorro a la Mano</div>
              </div>
            </Button>

            <Button
              onClick={() => setTipoRetiro("cuenta-ahorros")}
              className="h-32 flex flex-col items-center justify-center space-y-2 bg-blue-500 hover:bg-blue-700"
            >
              <CreditCard className="h-8 w-8" />
              <div className="text-center text-white">
                <div className="font-semibold">Cuenta de Ahorros</div>
              </div>
            </Button>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-black-900 mb-2">Información:</h3>
            <ul className="text-sm text-black-800 space-y-1">
              <li>• Solo se dispensan billetes de $10.000, $20.000, $50.000 y $100.000</li>
              <li>• Los montos deben ser múltiplos de $10.000</li>
              <li>• Máximo retiro: $2.000.000 por transacción</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
