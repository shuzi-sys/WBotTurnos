import { Client, Message } from 'whatsapp-web.js'
import { clientDB } from './db.js'
import {formatearHora} from './formateoHora.js'
import { pelubotmessages } from './pelubotmessages.js'
import { motivoTurno } from '@prisma/client'

const motivosEnum = motivosNumero.map(n => Object.values(motivoTurno)[n - 1])
const sesiones = new Map()
/**
 * @param {Message} msg
 * @param {Client} client
 */

export async function comportamiento(msg, client){
    const userId = msg.from;
    const sesion = sesiones.get(userId) || {estado: 'inicio'};
    const msgContent = msg.body.trim()
    switch (sesion.estado){
        case 'inicio':{
            msg.reply(pelubotmessages.Inicio.first)
            sesiones.set(userId, {estado:"inicio_opciones"})
            break;
        }

        case 'inicio_opciones':{
            switch (msgContent){
                case '1':{
                    msg.reply(pelubotmessages.Turno.solicitar)
                    sesiones.set(userId, {estado:"turno_solicitar"})
                    break;
                }
                case '2':{
                    // aca hay que llamar de la DB los turnos del user y printearlos!!!
                    msg.reply(pelubotmessages.Turno.modificar)
                    sesiones.set(userId, {estado:"turno_modificar"})
                    break;
                }
                case '3':{
                    // Lo mismo acá!!!
                    msg.reply(pelubotmessages.Turno.cancelar)
                    sesiones.set(userId, {estado:"turno_cancelar"})
                    break;
                }
                default:{
                    msg.reply(pelubotmessages.Errormessage)
                    break;
                }
            }
        }
        
        case 'turno_solicitar':{
            if (msgContent === '0') { sesiones.set(userId, {estado:"inicio_opciones"}); msg.reply(pelubotmessages.Inicio); return;}
            // el map castea a ints y filter remueve lo que no pudo ser casteado naturalmente
            const motivosNumero = msgContent.split(/[\s,]+/).map(Number).filter(n=> !isNaN(n))
            if (motivosNumero.length === 0 || motivos.includes('0')) { pelubotmessages.Errormessage; return;}
            const motivos = motivosNumero.map(n => Object.values(motivoTurno)[n - 1])
             if (motivos.includes(undefined)) {
            msg.reply(pelubotmessages.Errormessage)
            return;
            }
            const peluqueros = await clientDB.peluquero.findMany({where:{habilidades: {hasSome: sesion.motivos}}})
            const peluquerosText = peluqueros.map((p,i) => `${i + 1} - ${p.nombre}`).join('\n')
            msg.reply(pelubotmessages.Peluquero.first + peluquerosText)
            sesiones.set(userId, {estado: 'turno_peluquero', motivos, peluqueros})
            break;
        }

        case 'turno_peluquero':{
            if (msgContent === '0') { sesiones.set(userId, {estado:"turno_solicitar"}); msg.reply(); return;}
            const indice = (Number(msgContent) - 1)
            if (sesion.peluqueros[indice]) { msg.reply('') }
            sesiones.set(userId, {estado: 'turno_fecha', motivos, peluqueros})
        }

        case 'turno_fecha':{

        }

        }

    }
if (msg.body === 'turno'){
    sesiones.set(userId, {estado:"esperando_peluquero"})
    var listapeluqueros = await clientDB.peluquero.findMany()
    var respuesta = 'Elegí tu peluquero:'
    for (const peluquero of listapeluqueros){
        string += '\n' + peluquero.nombre;
    }
    msg.reply(respuesta);
    return;
}
if (sesion.estado === 'esperando_peluquero'){
    var listapeluqueros = await clientDB.peluquero.findMany()
    for (const peluquero of listapeluqueros){
        if (msg.body.toLowerCase().includes(peluquero.nombre.toLowerCase)){
            sesiones.set(userId, {...sesion, estado: "esperando_fecha", peluqueroelegido: peluquero.nombre.toLowerCase, peluqueroid: peluquero.id})
            msg.reply('Elegi un dia entre lunes a viernes y un horario entre 10AM y 7:40PM')
            break;
            return;
        }
    }
    msg.reply('No pudimos encontrar el peluquero que solicitaste, porfavor, asegurate de escribir bien el nombre e intentalo denuevo');
    return;
}

if (sesion.estado === 'esperando_fecha'){
    var fecha = formatearHora(msg.body) 
    if (fecha == 'pasado')
        { msg.reply('No podes escoger una fecha pasada, intentalo denuevo.'); return;}
    sesiones.set(userId, {...sesion, horarioelegido: fecha})
    const finalSesion = sesiones.get(userId)
    msg.reply('Turno agendado con: ' + finalSesion.peluqueroelegido 
        + '\nFecha: ' + finalSession.horarioelegido 
    )
    /*
    clientDB.turno.create({
        data: {
            peluqueroId: finalSesion.peluqueroId,
            telefonoCliente: msg.userId,
            solicitadopara: finalSesion.horarioelegido
        }
    })
        */
    return; 
}


}
