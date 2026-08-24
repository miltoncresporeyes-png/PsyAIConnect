import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

// Función para validar datos básicos antes de enviar a Python
function validarDatosBasicos(data: any): { valido: boolean; error?: string } {
  if (!data.paciente) {
    return { valido: false, error: 'Datos del paciente son requeridos' }
  }

  if (!data.paciente.rut || !data.paciente.nombre) {
    return { valido: false, error: 'RUT y nombre del paciente son requeridos' }
  }

  if (!data.servicio) {
    return { valido: false, error: 'Datos del servicio son requeridos' }
  }

  if (!data.servicio.descripcion || !data.servicio.fecha_servicio || !data.servicio.precio_unitario) {
    return { valido: false, error: 'Descripción, fecha y precio del servicio son requeridos' }
  }

  return { valido: true }
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json()

    // Validar datos básicos
    const validacion = validarDatosBasicos(body)
    if (!validacion.valido) {
      return NextResponse.json(
        { error: validacion.error },
        { status: 400 }
      )
    }

    // Preparar datos para el script Python
    const datosBoleta = {
      paciente: {
        rut: body.paciente.rut,
        nombre: body.paciente.nombre,
        email: body.paciente.email || null,
        telefono: body.paciente.telefono || null
      },
      servicio: {
        descripcion: body.servicio.descripcion,
        fecha_servicio: body.servicio.fecha_servicio,
        cantidad: body.servicio.cantidad || 1,
        precio_unitario: parseInt(body.servicio.precio_unitario),
        descuento: parseInt(body.servicio.descuento || 0)
      },
      notas_adicionales: body.notas_adicionales || null
    }

    // Ejecutar script Python
    const scriptPath = path.join(process.cwd(), 'scripts', 'boleta_emitter.py')

    return new Promise((resolve) => {
      const pythonProcess = spawn('python', [scriptPath], {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe']
      })

      let output = ''
      let errorOutput = ''

      // Enviar datos JSON al script Python
      pythonProcess.stdin.write(JSON.stringify(datosBoleta))
      pythonProcess.stdin.end()

      // Capturar salida estándar
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString()
      })

      // Capturar errores
      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString()
      })

      // Manejar finalización del proceso
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            // Intentar parsear la respuesta JSON
            const resultado = JSON.parse(output.trim())

            // Verificar si es una respuesta de error del script Python
            if (resultado.error) {
              resolve(NextResponse.json(
                { error: resultado.error },
                { status: 400 }
              ))
            } else {
              resolve(NextResponse.json(resultado))
            }
          } catch (parseError) {
            // Si no es JSON válido, devolver como texto
            resolve(NextResponse.json({
              success: true,
              message: output.trim(),
              raw_output: output.trim()
            }))
          }
        } else {
          // Error en el script Python
          console.error('Error en script Python:', errorOutput)

          resolve(NextResponse.json(
            {
              error: 'Error al procesar la boleta',
              details: errorOutput || 'Error desconocido en el script Python'
            },
            { status: 500 }
          ))
        }
      })

      // Timeout de 30 segundos
      setTimeout(() => {
        pythonProcess.kill()
        resolve(NextResponse.json(
          { error: 'Timeout: El procesamiento tomó demasiado tiempo' },
          { status: 408 }
        ))
      }, 30000)
    })

  } catch (error) {
    console.error('Error en API route:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Método GET para verificar estado de la API
export async function GET() {
  return NextResponse.json({
    status: 'API de emisión de boletas activa',
    endpoints: {
      POST: '/api/emitir-boleta - Emitir nueva boleta',
      GET: '/api/emitir-boleta - Verificar estado'
    },
    ejemplo_payload: {
      paciente: {
        rut: "11111111-1",
        nombre: "Juan Pérez González",
        email: "juan@email.com",
        telefono: "+56912345678"
      },
      servicio: {
        descripcion: "Sesión de psicoterapia individual",
        fecha_servicio: "2024-02-03",
        precio_unitario: 35000,
        descuento: 0
      },
      notas_adicionales: "Pago por transferencia"
    }
  })
}