import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { ArrowLeft } from "lucide-react"
import { validarMonto } from "../lib/cajero-utils"
import { Banco, formatCurrency, deductFromBalance, getAccountBalance } from "../lib/retirar"
import TecladoNumerico from "./teclado-numerico"

interface Props {
  onVolver: () => void
}

export default function RetiroAhorroMano({ onVolver }: Props) {
  const [paso, setPaso] = useState<
    "numero" | "clave" | "monto" | "monto-personalizado" | "confirmar" | "clave-confirmacion" | "resultado"
  >("numero")
  const [numeroCuenta, setNumeroCuenta] = useState("")
  const [clave, setClave] = useState("")
  const [claveConfirmacion, setClaveConfirmacion] = useState("")
  const [montoSeleccionado, setMontoSeleccionado] = useState<number | null>(null)
  const [montoPersonalizado, setMontoPersonalizado] = useState("")
  const [resultado, setResultado] = useState<any>(null)
  const [error, setError] = useState("")

  const montosRapidos = [50000, 100000, 200000, 300000, 500000, 1000000]

  const generarNumeroTransaccion = () => {
    const timestamp = Date.now().toString()
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    return `TXA${timestamp.slice(-6)}${random}`
  }

  const obtenerFechaActual = () => {
    const ahora = new Date()
    return ahora.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const validarNumeroCuenta = (numero: string) => {
    // 11 dígitos, primer dígito 0 o 1, segundo dígito debe ser 3
    if (numero.length !== 11) return false
    if (numero[0] !== "0" && numero[0] !== "1") return false
    if (numero[1] !== "3") return false
    return /^\d{11}$/.test(numero)
  }

  const validarClave = (claveInput: string) => {
    return /^\d{4}$/.test(claveInput)
  }

  const handleValidarNumero = () => {
    if (!validarNumeroCuenta(numeroCuenta)) {
      setError("El número debe tener 11 dígitos, empezar por 0 o 1, y el segundo dígito debe ser 3")
      setTimeout(() => {
        setNumeroCuenta("")
        setError("")
      }, 5000)
      return
    }
    setError("")
    setPaso("clave")
  }

  const handleValidarClave = () => {
    if (!validarClave(clave)) {
      setError("La clave debe tener exactamente 4 dígitos")
      return
    }
    setError("")
    setPaso("monto")
  }

  const handleSeleccionarMonto = (monto: number) => {
    if (!validarMonto(monto)) {
      setError("Monto no válido. Solo se permiten billetes de $10.000, $20.000, $50.000 y $100.000")
      setTimeout(() => {
        setError("")
        setPaso("numero")
        setNumeroCuenta("")
        setClave("")
        setClaveConfirmacion("")
        setMontoSeleccionado(null)
        setMontoPersonalizado("")
        setResultado(null)
      }, 3000)
      return
    }
    setError("")
    setMontoSeleccionado(monto)
    setPaso("confirmar")
  }

  const handleMontoPersonalizado = () => {
    const monto = Number.parseInt(montoPersonalizado)
    if (isNaN(monto) || monto <= 0) {
      setError("Ingrese un monto válido")
      return
    }
    if (!validarMonto(monto)) {
      setError("Monto no válido. Solo se permiten billetes de $10.000, $20.000, $50.000 y $100.000")
      setTimeout(() => {
        setError("")
        setPaso("numero")
        setNumeroCuenta("")
        setClave("")
        setClaveConfirmacion("")
        setMontoSeleccionado(null)
        setMontoPersonalizado("")
        setResultado(null)
      }, 3000)
      return
    }
    setError("")
    setMontoSeleccionado(monto)
    setPaso("confirmar")
  }

  const handleValidarClaveConfirmacion = () => {
    if (claveConfirmacion.length !== 4) {
      setError("La clave de confirmación debe tener 4 dígitos")
      return
    }
    setError("")
    procesarRetiro(montoSeleccionado!)
  }

  const procesarRetiro = (monto: number) => {
    const banco = new Banco()
    const resultadoRetiro = banco.retirar(monto)

    // Verificar si hay suficiente saldo
    if (!deductFromBalance(monto)) {
      setError("Saldo insuficiente para realizar el retiro")
      return
    }

    setResultado({
      numeroCuenta,
      monto: resultadoRetiro.montoRetirado,
      billetes: resultadoRetiro.billetesEntregados,
      clave: "****", // Ocultar clave en el resultado
      fecha: obtenerFechaActual(),
      numeroTransaccion: generarNumeroTransaccion(),
      saldoRestante: getAccountBalance(),
      retirosRestantes: Math.floor(getAccountBalance() / monto),
    })
    setPaso("resultado")
  }

  if (paso === "numero") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
        <Card className="w-full max-w-md from-white to-white bg-gradient-to-br">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={onVolver}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-black-900">Ahorro a la Mano</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-lg font-semibold mb-4 block">Número de cuenta (11 dígitos)</Label>
              <div className="text-sm text-muted-foreground mb-4">
                Debe empezar por 0 o 1, segundo dígito debe ser 3
              </div>
              <TecladoNumerico
                valor={numeroCuenta}
                onChange={setNumeroCuenta}
                onAceptar={handleValidarNumero}
                maxLength={11}
                placeholder="03001234567"
              />
            </div>

            {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</div>}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (paso === "clave") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
        <Card className="w-full max-w-md from-white to-white bg-gradient-to-br">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={() => setPaso("numero")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-black-900">Ingrese su Clave</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-lg font-semibold mb-4 block">Clave de 4 dígitos</Label>
              <div className="mb-6 p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
                <div className="text-2xl font-mono text-center min-h-[2rem] flex items-center justify-center">
                  {clave ? "•".repeat(clave.length) : <span className="text-black-400">••••</span>}
                </div>
              </div>

              <div className="space-y-3">
                {[
                  ["1", "2", "3"],
                  ["4", "5", "6"],
                  ["7", "8", "9"],
                ].map((fila, filaIndex) => (
                  <div key={filaIndex} className="grid grid-cols-3 gap-3">
                    {fila.map((numero) => (
                      <Button
                        key={numero}
                        onClick={() => {
                          if (clave.length < 4) {
                            setClave(clave + numero)
                            setError("")
                          }
                        }}
                        variant="outline"
                        className="h-16 text-xl font-semibold hover:bg-gray-100 border-2"
                      >
                        {numero}
                      </Button>
                    ))}
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => {
                      if (clave.length < 4) {
                        setClave(clave + "0")
                        setError("")
                      }
                    }}
                    variant="outline"
                    className="h-16 text-xl font-semibold hover:bg-gray-100 border-2"
                  >
                    0
                  </Button>
                  <Button
                    onClick={() => setClave(clave.slice(0, -1))}
                    variant="outline"
                    className="h-16 text-lg font-semibold bg-red-100 hover:bg-red-200 text-red-700 border-2 border-red-300"
                  >
                    Borrar
                  </Button>
                </div>

                <Button
                  onClick={handleValidarClave}
                  className="w-full h-16 text-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={clave.length !== 4}
                >
                  Aceptar
                </Button>
              </div>
            </div>

            {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</div>}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (paso === "monto") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
        <Card className="w-full max-w-xl from-white to-white bg-gradient-to-br">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={() => setPaso("clave")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-black-900">Seleccionar Monto</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Montos rápidos:</h3>
              <div className="grid grid-cols-2 gap-3">
                {montosRapidos.map((monto) => (
                  <Button
                    key={monto}
                    onClick={() => handleSeleccionarMonto(monto)}
                    variant="outline"
                    className="h-16 text-lg"
                  >
                    ${monto.toLocaleString()}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Button onClick={() => setPaso("monto-personalizado")} variant="outline" className="w-full h-16 text-lg">
                Otro monto
              </Button>
            </div>

            {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</div>}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (paso === "monto-personalizado") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
        <Card className="w-full max-w-md from-white to-white bg-gradient-to-br">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={() => setPaso("monto")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-black-900">Monto Personalizado</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-lg font-semibold mb-4 block">Ingrese el monto a retirar</Label>
              <TecladoNumerico
                valor={montoPersonalizado}
                onChange={setMontoPersonalizado}
                onAceptar={handleMontoPersonalizado}
                maxLength={10}
                placeholder="Monto en pesos"
              />
            </div>

            {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</div>}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (paso === "confirmar") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
        <Card className="w-full max-w-md from-white to-white bg-gradient-to-br">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={() => setPaso("monto")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-black-900">Confirmar Retiro</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-center">
              <h3 className="text-xl font-bold text-black-800 mb-2">CONFIRMAR RETIRO</h3>
              <div className="space-y-2 text-black-700">
                <p>
                  <strong>Cuenta:</strong> {numeroCuenta}
                </p>
                <p>
                  <strong>Monto:</strong> ${montoSeleccionado?.toLocaleString()}
                </p>
                <p>
                  <strong>Fecha:</strong> {obtenerFechaActual()}
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button onClick={() => setPaso("clave-confirmacion")} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                Confirmar
              </Button>
              <Button onClick={() => setPaso("monto")} variant="outline" className="flex-1">
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (paso === "clave-confirmacion") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
        <Card className="w-full max-w-md from-white to-white bg-gradient-to-br">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={() => setPaso("confirmar")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-black-900">Clave de Confirmación</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-lg font-semibold mb-4 block">Ingrese su clave de 4 dígitos para confirmar</Label>
              <TecladoNumerico
                valor={claveConfirmacion}
                onChange={setClaveConfirmacion}
                onAceptar={handleValidarClaveConfirmacion}
                maxLength={4}
                placeholder="••••"
                esPassword={true}
              />
            </div>

            {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</div>}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (paso === "resultado" && resultado) {
    const billetes = resultado.billetes as Record<string, number>
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl from-white to-white bg-gradient-to-br">
          <CardHeader>
            <CardTitle className="text-black-900">Retiro Exitoso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-black-800 mb-2">Detalles del retiro:</h3>
              <div className="space-y-2 text-black-700">
                <p>
                  <strong>Cuenta:</strong> {resultado.numeroCuenta}
                </p>
                <p>
                  <strong>Monto:</strong> ${resultado.monto.toLocaleString()}
                </p>
                <p>
                  <strong>Número de transacción:</strong> {resultado.numeroTransaccion}
                </p>
                <p>
                  <strong>Fecha:</strong> {resultado.fecha}
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-black-800 mb-3">Billetes a dispensar:</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(billetes).map(([denominacion, cantidad]) => (
                  <div key={denominacion} className="flex justify-between bg-white p-2 rounded">
                    <span>
                      {denominacion === "10k" && "$10.000"}
                      {denominacion === "20k" && "$20.000"}
                      {denominacion === "50k" && "$50.000"}
                      {denominacion === "100k" && "$100.000"}
                    </span>
                    <span className="font-semibold">{cantidad} billetes</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-black-800 mb-2">Información adicional:</h3>
              <div className="space-y-1 text-black-700">
                <p>
                  <strong>Saldo restante:</strong> {formatCurrency(resultado.saldoRestante)}
                </p>
                <p>
                  <strong>Retiros posibles :</strong> {resultado.retirosRestantes}
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button onClick={onVolver} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                Nuevo Retiro
              </Button>
              <Button onClick={() => setPaso("numero")} variant="outline" className="flex-1">
                Otro Retiro Ahorro a la Mano
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
