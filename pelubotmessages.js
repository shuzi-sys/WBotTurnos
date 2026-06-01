import { motivoTurno } from "@prisma/client"

const motivosMap = Object.fromEntries(
    Object.values(motivoTurno).map((motivo,i) => [i + 1, motivo])
)

const motivosTexto = Object.entries(motivosMap).map(([num,motivo]) => `${num} - ${motivo}`).join('\n')

export const pelubotmessages = {
    Inicio: {
        first: 
        `¡Hola! Soy pelu-bot, para continuar elegí una opción escribiendo el número correspondiente a la opción. 

1 - Solicitar un turno
2 - Modificar un turno
3 - Cancelar un turno
`
    },
    Turno: {
        solicitar:
        `Para solicitar un turno, primero escogé el / los motivo/s de tu visita con un numero y separando con coma (Ej: 1, 2, 3, 4, etc) 👉
        0 - Volver atrás
        ${motivosTexto}
        `,
        modificar:
        `Para modificar un turno que hayas sacado, escogé el turno escribiendo el número que le corresponde (No podes modificar turnos que ya pasaron) 👉`,
        cancelar:
        `Para cancelar un turno que hayas sacado, escogé el turno escribiendo el número que le corresponde (No podes modificar turnos que ya pasaron) 👉`
    },
    Peluquero: {
        first:
        `Escogé un peluquero para vos 👉:`
    },
    Fecha: {
        first:
        `🕰️🗓️ Escribí una fecha y horario para tu turno, o escribí "Hoy + hora deseada" si el turno es para hoy
        Nota: El horario no puede ser a menos de 25 minutos del cierre para un corte, o menos de 3hr para tinturas (Dependiendo del largo de tu pelo y cantidad a teñir)
        Escribí sólamente "0" para volver atrás`,
        pasado:`La fecha introducida no es válida porque ya pasó, intentá nuevamente con una fecha futura o escribí "0" para volver atrás`
    },
    Errormessage: 
        ` La opción elegida no forma parte de las disponibles, o el formato no fue el correcto. Intentalo nuevamente`
}