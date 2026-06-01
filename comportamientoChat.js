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

async function traerPeluqueros(sesion){
            const peluqueros = await clientDB.peluquero.findMany({where:{habilidades: {hasSome: sesion.motivos}}})
            const peluquerosText = peluqueros.map((p,i) => `${i + 1} - ${p.nombre}`).join('\n')
            return {peluquerosText, peluqueros}
}

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
                    sesiones.set(userId, {estado:"turno_motivos"})
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
        
        case 'turno_motivos':{
            // Volver a inicio
            if (msgContent === '0') { sesiones.set(userId, {estado:"inicio_opciones"}); msg.reply(pelubotmessages.Inicio); return;}
            //
            
            // el map castea a ints y filter remueve lo que no pudo ser casteado naturalmente
            const motivosNumero = msgContent.split(/[\s,]+/).map(Number).filter(n=> !isNaN(n))
            if (motivosNumero.length === 0 || motivos.includes('0')) { pelubotmessages.Errormessage; return;}
            const motivos = motivosNumero.map(n => Object.values(motivoTurno)[n - 1])
             if (motivos.includes(undefined)) {
            msg.reply(pelubotmessages.Errormessage)
            return;
            }

            /* Preparar para la siguiente etapa; es necesario mostrar los peluqueros acá
            porque si lo dejo para el case de abajo el bot quedaría un ciclo de conversación
            sin decir absolutamente nada y el usuario tendría que volver a hablarle */
            const {peluqueroText, peluquero} = await traerPeluqueros(sesion)
            msg.reply(pelubotmessages.Peluquero.first + peluquerosText)
            // Acá sesiones almacena la lista de peluqueros porque la siguiente fase valida el input que hagas acá
            sesiones.set(userId, {estado: 'turno_peluquero', motivos, peluqueros})
            break;
        }

        case 'turno_peluquero':{
            // Volver a motivos
            if (msgContent === '0') { sesiones.set(userId, {estado:"turno_motivos"}); msg.reply(pelubotmessages.Turno.solicitar) ; return;}
            //
            
            const indice = (Number(msgContent) - 1)
            if (sesion.peluqueros[indice]) { const peluquero = sesion.peluqueros[indice].nombre ;msg.reply("$Elegiste a {peluquero}"); msg.reply(pelubotmessages.Fecha.first) }
            sesiones.set(userId, {... sesion, estado: 'turno_fecha', peluquero})
        }

        case 'turno_fecha':{
            if (msgContent === '0') { sesiones.set(userId, {estado:"turno_peluquero"});
            const {peluqueroText, peluquero} = await traerPeluqueros(sesion)
            msg.reply(pelubotmessages.Peluquero.first + peluquerosText); return;}
            //

            const fecha = formatearHora(msgContent)
            if (hora === 'pasado'){msg.reply(pelubotmessages.Fecha.pasado)}
            // printear mensaje de confirmacion
            sesiones.set(... sesion,{estado: "confirmando", fecha})

        }

        }

    }



