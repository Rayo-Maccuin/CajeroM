import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import { validarMonto } from "../lib/cajero-utils"
import { Banco, formatCurrency, deductFromBalance, getAccountBalance } from "../lib/retirar"
import TecladoNumerico from "../components/teclado-numerico"

interface Props {
  onVolver: () => void
}

export default function RetiroNequi({ onVolver }: Props) {
  const [paso, setPaso] = useState<
    "numero" | "clave" | "monto" | "monto-personalizado" | "confirmar" | "clave-confirmacion" | "resultado"
  >("numero")
  const [numeroTelefono, setNumeroTelefono] = useState("")
  const [clave, setClave] = useState("")
  const [claveIngresada, setClaveIngresada] = useState("")
  const [claveConfirmacion, setClaveConfirmacion] = useState("")
  const [mostrarClave, setMostrarClave] = useState(true)
  const [tiempoRestante, setTiempoRestante] = useState(60)
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
    return `TXN${timestamp.slice(-6)}${random}`
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

  useEffect(() => {
    if (paso === "clave" && !clave) {
      const nuevaClave = Math.floor(100000 + Math.random() * 900000).toString()
      setClave(nuevaClave)
      setTiempoRestante(60)
      setMostrarClave(true)
    }
  }, [paso, clave])

  useEffect(() => {
    if (paso === "clave" && tiempoRestante > 0) {
      const timer = setTimeout(() => {
        setTiempoRestante((prev) => {
          if (prev === 1) {
            setMostrarClave(false)
          }
          return prev - 1
        })
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [paso, tiempoRestante])

  const validarNumeroTelefono = (numero: string) => {
    const regex = /^3\d{9}$/
    return regex.test(numero)
  }

  const handleValidarNumero = () => {
    if (!validarNumeroTelefono(numeroTelefono)) {
      setError("El número debe empezar con 3 y tener exactamente 10 dígitos numéricos")
      setTimeout(() => {
        setNumeroTelefono("")
        setError("")
      }, 5000) // Mostrar error por 2 segundos antes de limpiar
      return
    }
    setError("")
    setPaso("clave")
  }

  const handleValidarClave = () => {
    if (claveIngresada !== clave) {
      setError("La clave ingresada no es correcta")
      return
    }
    if (claveIngresada.length !== 6) {
      setError("La clave debe tener 6 dígitos")
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
        setNumeroTelefono("")
        setClave("")
        setClaveIngresada("")
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
        setNumeroTelefono("")
        setClave("")
        setClaveIngresada("")
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

    if (!deductFromBalance(monto)) {
      setError("Saldo insuficiente para realizar el retiro")
      return
    }

    const numeroCompleto = "0" + numeroTelefono

    setResultado({
      numeroCompleto,
      monto: resultadoRetiro.montoRetirado,
      billetes: resultadoRetiro.billetesEntregados,
      clave,
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
              <CardTitle className="text-black-900">Retiro NEQUI</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-lg font-semibold mb-4 block">Número de celular (debe empezar con 3)</Label>
              <TecladoNumerico
                valor={numeroTelefono}
                onChange={setNumeroTelefono}
                onAceptar={handleValidarNumero}
                maxLength={10}
                placeholder="3001234567"
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
              <CardTitle className="text-black-900">Ingrese la Clave</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-black-800">Clave temporal:</h3>
                  <div className="text-2xl font-mono font-bold text-black-900">{mostrarClave ? clave : "••••••"}</div>
                </div>
                <div className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => setMostrarClave(!mostrarClave)}>
                    {mostrarClave ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <div className="text-sm text-black-700">{tiempoRestante > 0 ? `${tiempoRestante}s` : "Oculta"}</div>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-lg font-semibold mb-4 block">Ingrese la clave de 6 dígitos</Label>
              <TecladoNumerico
                valor={claveIngresada}
                onChange={setClaveIngresada}
                onAceptar={handleValidarClave}
                maxLength={6}
                placeholder="••••••"
                esPassword={true}
              />
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
                  <strong>Número:</strong> 0{numeroTelefono}
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
              <Button onClick={() => setPaso("clave-confirmacion")} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
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
                  <strong>Número completo:</strong> {resultado.numeroCompleto}
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
              <h3 className="font-semibold text-black-900 mb-3">Billetes a dispensar:</h3>
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
              <Button onClick={onVolver} className="flex-1 bg-blue-500 hover:bg-blue-700 text-white">
                Nuevo Retiro
              </Button>
              <Button onClick={() => setPaso("numero")} variant="outline" className="flex-1">
                Otro Retiro NEQUI
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
