import { Client, Message } from 'whatsapp-web.js'
import { clientDB } from './db.js'
import {formatearDia, formatearHora} from './formateoDia.js'
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

async function crearTurno(sesion){
    clientDB.turno.create()
}

export async function comportamiento(msg, client){
    const userId = msg.from;
    const sesion = sesiones.get(userId) || {estado: 'inicio'};
    const msgContent = msg.body.trim()
    

    switch (sesion.estado){
        case 'inicio':{
            msg.reply(pelubotmessages.Inicio.first)
            sesiones.set(userId, {estado:"inicio_input"})
            break;
        }

        case 'inicio_input':{
            switch (msgContent){
                case '1':{
                    msg.reply(pelubotmessages.Turno.motivos)
                    sesiones.set(userId, {estado:"turno_motivos_input"})
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
        
        case 'turno_motivos_input':{
            // Volver a inicio
            if (msgContent === '0') { sesiones.set(userId, {estado:"inicio_opciones"}); msg.reply(pelubotmessages.Inicio); return;}
            //
            
            // el map castea a ints y filter remueve lo que no pudo ser casteado naturalmente
            const motivosNumero = msgContent.split(/[\s,]+/).map(Number).filter(n=> !isNaN(n))
            if (motivosNumero.length === 0 || motivosNumero.includes(0)) { pelubotmessages.Errormessage; return;}
            const motivos = motivosNumero.map(n => Object.values(motivoTurno)[n - 1])
             if (motivos.includes(undefined)) {
            msg.reply(pelubotmessages.Errormessage)
            return;
            }
            msg.reply("Elegiste los motivos " + motivos)
            sesiones.set(userId, {... sesion, estado:'turno_peluquero', motivos})
        }

        case 'turno_peluquero':{
            const {peluquerosText, peluqueros} = await traerPeluqueros(sesion)
            msg.reply(pelubotmessages.Peluquero.first + peluquerosText)
            sesiones.set(userId, {... sesion, estado: 'turno_peluquero_input', peluqueros})
            break;
        }

        case 'turno_peluquero_input':{
            // Volver a motivos
            if (msgContent === '0') { sesiones.set(userId, {... sesion, estado:"turno_motivos"}); msg.reply(pelubotmessages.Turno.solicitar) ; return;}
            //
            
            const indice = (Number(msgContent) - 1)
            if (sesion.peluqueros[indice]) { const peluquero = sesion.peluqueros[indice].nombre ;msg.reply(`$Elegiste a {peluquero}`)} else { msg.reply(pelubotmessages.Errormessage); return; }
            sesiones.set(userId, {... sesion, estado: 'turno_fecha', peluquero})
        }

        case 'turno_fecha':{
            msg.reply(pelubotmessages.Fecha.first)
            sesiones.set(userId, {... sesion, estado: 'turno_fecha_input'})
            break;
        }

        case 'turno_fecha_input':{
            if (msgContent === '0') { sesiones.set(userId, {estado:"turno_peluquero_input"}); sesion.peluqueros.map((p,i) => `${i + 1} - ${p.nombre}`).join('\n'); return; };

            const fecha = formatearDia(msgContent)
            if (fecha === 'pasado'){msg.reply(pelubotmessages.Fecha.pasado); return;}
            sesiones.set(userId, {...sesion, estado: "confirmando", fecha})
        }

        case 'confirmando':{
            msg.reply(`Confirmá tu turno: \n` 
                + `📋Motivo/s: ${sesion.motivos} \n`
                + `💇🏻‍♂️Estilista: ${sesion.peluquero}\n`
                + `🗓️Fecha: ${sesion.fecha} \n`
                + `0 - Descartar turno y volver a empezar \n`
                + `1 - Confirmar turno`
            )
        }

        case 'confirmando_input':{
            const rechazar = '0'
            const confirmar = '1'
            if (msgContent === rechazar){ sesiones.set(userId, {... sesion, estado:"inicio_opciones"})}
            if (msgContent === confirmar){ crearTurno() }
        }
        }

    }



