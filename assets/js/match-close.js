/* Rayckington FC · Match Center V4
   Solo calcula borradores. Ninguna función de este archivo escribe en Supabase.
   Los jugadores sin convocatoria tienen minutos DESCONOCIDOS, no cero inferido.
*/
"use strict";

import { calcularParticipacionesRotativas } from "./match-roster.js";

const ESTADISTICAS = ["goles", "asistencias", "amarillas", "rojas"];
const TIPOS_JUGADOR = new Set(["GOL", "AMARILLA", "SEGUNDA_AMARILLA", "ROJA"]);

export function prepararBorradorCierre({ alineacion = [], cambios = [], eventos = [], oficiales = [], solicitudes = [], minutoFinal = 0 } = {}) {
    const ids = new Set();
    const filasAlineacion = new Map();
    const registroOficial = new Map();
    const registroSolicitud = new Map();
    const eventosPorJugador = new Map();
    const incidencias = [];
    const participaciones = calcularParticipacionesRotativas(alineacion, cambios, minutoFinal, true);

    for (const fila of alineacion) {
        if (!fila?.jugador_id) continue;
        filasAlineacion.set(fila.jugador_id, fila);
        // El suplente que no entró no debe sumar participación.
        if (participaciones.get(fila.jugador_id)?.jugo) ids.add(fila.jugador_id);
    }
    for (const row of oficiales) {
        if (row?.jugador_id) { ids.add(row.jugador_id); registroOficial.set(row.jugador_id, row); }
    }
    for (const row of solicitudes) {
        if (row?.jugador_id && row.estado === "PENDIENTE") {
            ids.add(row.jugador_id); registroSolicitud.set(row.jugador_id, row);
        }
    }
    const add = (id, clave) => {
        if (!id) return;
        ids.add(id);
        if (!eventosPorJugador.has(id)) eventosPorJugador.set(id, { goles: 0, asistencias: 0, amarillas: 0, rojas: 0 });
        eventosPorJugador.get(id)[clave]++;
    };
    let sinAutor = 0;
    for (const e of eventos) {
        if (!e || e.anulado || e.equipo !== "RAYCKINGTON") continue;
        if (TIPOS_JUGADOR.has(e.tipo) && !e.jugador_id) sinAutor++;
        if (e.tipo === "GOL") {
            add(e.jugador_id, "goles");
            // Sin nombre del goleador no atribuimos la asistencia a nadie.
            if (e.jugador_id && e.asistencia_jugador_id && e.asistencia_jugador_id !== e.jugador_id) add(e.asistencia_jugador_id, "asistencias");
        }
        if (e.tipo === "AMARILLA" || e.tipo === "SEGUNDA_AMARILLA") add(e.jugador_id, "amarillas");
        if (e.tipo === "ROJA") add(e.jugador_id, "rojas");
    }
    if (sinAutor) incidencias.push(`${sinAutor} evento(s) de gol o tarjeta sin jugador identificado.`);
    const corte = Number(minutoFinal);
    if (!Number.isFinite(corte) || corte < 0 || corte > 180) incidencias.push("El minuto final del encuentro no es válido; hay que revisar los minutos.");
    if (!alineacion.length) incidencias.push("No existe convocatoria guardada: los minutos y la titularidad deberán ingresarse manualmente.");

    const rows = [...ids].map((id) => {
        const fila = filasAlineacion.get(id);
        const mc = eventosPorJugador.get(id) || { goles: 0, asistencias: 0, amarillas: 0, rojas: 0 };
        const oficial = registroOficial.get(id) || null;
        const pendiente = registroSolicitud.get(id) || null;
        const avisos = [];
        const participacion = participaciones.get(id);
        const jugo = !!participacion?.jugo;
        const minutos = fila && jugo && Number.isFinite(corte) && corte >= 0 && corte <= 180
            ? participacion.minutos : null;
        if (!fila) avisos.push("Sin convocatoria: participación y minutos por confirmar.");
        else if (!jugo) avisos.push("Figura como suplente sin ingreso.");
        if (fila && jugo && minutos == null) avisos.push("Revisar entrada, salida y minuto final.");
        if (minutos === 0 && Object.values(mc).some(Boolean)) avisos.push("Hay eventos de un jugador con cero minutos estimados.");
        if (pendiente) avisos.push("Existe una solicitud pendiente: revisarla antes de registrar otra ficha.");
        const diferente = !!oficial && ESTADISTICAS.some((k) => Number(oficial[k] || 0) !== mc[k]);
        if (diferente) avisos.push("Las estadísticas oficiales no coinciden con los eventos registrados.");
        return {
            jugadorId: id, titular: fila ? fila.rol === "TITULAR" : null,
            jugo: fila ? jugo : null, minutos, mc, oficial, pendiente, avisos,
            diferente, // Comparación orientativa: puede haber eventos incompletos.
            estado: oficial ? "OFICIAL" : pendiente ? "SOLICITUD" : "FALTA_CONFIRMAR"
        };
    });
    return {
        rows, incidencias,
        conOficial: rows.filter((r) => r.oficial).length,
        conSolicitud: rows.filter((r) => !r.oficial && r.pendiente).length,
        porConfirmar: rows.filter((r) => !r.oficial && !r.pendiente).length,
        conAvisos: rows.filter((r) => r.avisos.length).length
    };
}
