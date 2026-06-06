import * as chrono from 'chrono-node'

export function formatearDia(texto){
    const fecha = chrono.es.parseDate(texto)
    if (!fecha) return null
    if (fecha < new Date()) return 'pasado'
    return fecha
}
