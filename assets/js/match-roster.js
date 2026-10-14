/* =======================================================
   RAYCKINGTON F.C. · CONVOCATORIA Y CAMBIOS (MATCH CENTER)
   Datos aparte de las estadísticas oficiales e históricas.
   Las escrituras se validan en Supabase mediante funciones RPC.
======================================================= */
"use strict";

// Pura: permite probar el cálculo sin acceso a Supabase ni al DOM.
export function calcularMinutosConvocado(fila, minutoCorte, partidoComenzado) {
    if (!fila || fila.minuto_entrada == null || !partidoComenzado) return 0;
    const entrada = Number(fila.minuto_entrada);
    const fin = fila.minuto_salida == null ? Number(minutoCorte) : Number(fila.minuto_salida);
    if (!Number.isFinite(entrada) || !Number.isFinite(fin)) return 0;
    return Math.max(0, Math.min(180, Math.round(fin)) - Math.max(0, entrada));
}

/**
 * Reconstruye la participación sumando todos los intervalos en cancha.
 * TITULAR designa al once INICIAL, no el estado actual después de los cambios.
 * El historial de deportivo_cambios_partido es la fuente de verdad.
 */
export function calcularParticipacionesRotativas(alineacion = [], cambios = [], minutoCorte = 0, partidoComenzado = true) {
    const corte = Math.max(0, Math.min(180, Number(minutoCorte) || 0));
    const resultado = new Map();
    for (const f of alineacion) {
        if (!f?.jugador_id) continue;
        const inicio = partidoComenzado && f.rol === "TITULAR" ? 0 : null;
        resultado.set(f.jugador_id, {
            jugo: inicio != null, titular: f.rol === "TITULAR", minutos: 0,
            enCancha: inicio != null, entradaActual: inicio
        });
    }
    if (!partidoComenzado) return resultado;
    const ordenados = [...cambios].sort((a, b) => Number(a.minuto) - Number(b.minuto) || Number(a.id) - Number(b.id));
    for (const c of ordenados) {
        const m = Number(c.minuto);
        if (!Number.isFinite(m) || m < 0 || m > corte) continue;
        const sale = resultado.get(c.jugador_sale_id);
        const entra = resultado.get(c.jugador_entra_id);
        // Si hay registros históricos inconsistentes, no inventamos minutos.
        if (!sale?.enCancha || !entra || entra.enCancha || m < sale.entradaActual) continue;
        sale.minutos += Math.max(0, m - sale.entradaActual);
        sale.enCancha = false;
        sale.entradaActual = null;
        entra.jugo = true;
        entra.enCancha = true;
        entra.entradaActual = m;
    }
    for (const row of resultado.values()) {
        if (row.enCancha) row.minutos += Math.max(0, corte - row.entradaActual);
        row.minutos = Math.min(180, Math.round(row.minutos));
    }
    return resultado;
}

export function crearModuloPlantelPartido({ supabase, obtenerPartido, obtenerJugadores, nombreJugador, escapar, onSugerir, onActualizar = () => {}, recargarJugadores = async () => {} }) {
    const $ = (id) => document.getElementById(id);
    let partidoId = null;
    let alineacion = [];
    let cambios = [];
    let consultado = false;
    let disponible = true;
    let errorConsulta = "";
    let ocupada = false;

    const formatoNombre = (id) => {
        const j = obtenerJugadores().find((x) => x.id === id);
        return j ? nombreJugador(j) : "Jugador sin ficha";
    };
    const ordenNombre = (a, b) => formatoNombre(a.jugador_id).localeCompare(formatoNombre(b.jugador_id), "es");
    const iniciado = () => {
        const p = obtenerPartido();
        return !!p && ["EN_VIVO", "ENTRETIEMPO", "FINALIZADO", "SUSPENDIDO"].includes(p.estado) && (p.estado !== "SUSPENDIDO" || (p.periodo_partido || "PREVIA") !== "PREVIA");
    };
    const preparacion = () => {
        const p = obtenerPartido();
        return !!p && p.estado === "PROGRAMADO" && (p.periodo_partido || "PREVIA") === "PREVIA";
    };
    const cambioPermitido = () => {
        const p = obtenerPartido();
        return !!p && ["EN_VIVO", "ENTRETIEMPO"].includes(p.estado);
    };
    const segundoActual = (p) => {
        let segundos = Number(p.cronometro_segundos_acumulados) || 0;
        if (p.cronometro_corriendo && p.cronometro_inicio_at) {
            const desde = new Date(p.cronometro_inicio_at).getTime();
            if (Number.isFinite(desde)) segundos += Math.max(0, (Date.now() - desde) / 1000);
        }
        return segundos;
    };
    const minutoCorte = () => {
        const p = obtenerPartido();
        if (!p) return 0;
        const transcurrido = Math.floor(segundoActual(p) / 60);
        const ultimo = Number(p.minuto_actual) || 0;
        const real = Math.max(transcurrido, ultimo);
        if (p.estado === "FINALIZADO") return Math.max(real, Number(p.duracion_minutos) || 60);
        return Math.min(180, real);
    };
    const participaciones = () => calcularParticipacionesRotativas(alineacion, cambios, minutoCorte(), iniciado());
    const mensaje = (texto = "", tipo = "") => {
        const el = $("mc-roster-message");
        if (!el) return;
        el.textContent = texto;
        el.className = `form-message ${tipo}`.trim();
    };
    const opciones = (items, placeholder) => `<option value="">${escapar(placeholder)}</option>` +
        items.map((item) => `<option value="${escapar(item.id)}">${escapar(item.nombre)}</option>`).join("");
    const itemJugador = (fila) => ({ id: fila.jugador_id, nombre: formatoNombre(fila.jugador_id) });

    function render() {
        const p = obtenerPartido();
        if (!p || !partidoId || p.id !== partidoId) return;
        const lista = alineacion.slice().sort(ordenNombre);
        const titulares = lista.filter((x) => x.rol === "TITULAR");
        const suplentes = lista.filter((x) => x.rol === "SUPLENTE");
        const enCancha = lista.filter((x) => x.minuto_entrada != null && x.minuto_salida == null);
        // Un jugador que salió vuelve a quedar disponible, aunque haya empezado como TITULAR.
        const enBanco = lista.filter((x) => x.minuto_entrada == null || x.minuto_salida != null);
        const sePuedeConvocar = preparacion() && disponible && !ocupada;
        const sePuedeCambiar = cambioPermitido() && disponible && !ocupada && enCancha.length > 0 && enBanco.length > 0;

        $("mc-roster-starters-count").textContent = titulares.length;
        $("mc-roster-subs-count").textContent = suplentes.length;
        $("mc-roster-summary").innerHTML = `
            <span><strong>${lista.length}</strong> convocados</span>
            <span><strong>${titulares.length}</strong> titulares iniciales</span>
            <span><strong>${enBanco.length}</strong> en banco / disponibles</span>
            <span><strong>${cambios.length}</strong> cambios</span>
            <span><strong>${enCancha.length}</strong> en cancha</span>
        `;

        const nominados = new Set(lista.map((x) => x.jugador_id));
        const libres = obtenerJugadores()
            .filter((x) => String(x.estado || "").toUpperCase() !== "INACTIVO" && !nominados.has(x.id))
            .map((x) => ({ id: x.id, nombre: nombreJugador(x) }))
            .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
        const selectorJugador = $("mc-roster-player");
        const anterior = selectorJugador.value;
        selectorJugador.innerHTML = opciones(libres, "Selecciona un jugador");
        if (libres.some((x) => x.id === anterior)) selectorJugador.value = anterior;
        selectorJugador.disabled = !sePuedeConvocar || !libres.length;
        $("mc-roster-role").disabled = !sePuedeConvocar || !libres.length;
        $("mc-roster-add").disabled = !sePuedeConvocar || !libres.length;
        $("mc-roster-refresh").disabled = ocupada;
        $("mc-roster-undo").disabled = !cambioPermitido() || !disponible || ocupada || !cambios.length;

        const participacion = participaciones();
        const renderFila = (f) => {
            const entro = f.minuto_entrada != null;
            let descripcion = "Pendiente de ingresar";
            if (f.minuto_salida != null) descripcion = `En banco · salió al ${f.minuto_salida}' · puede reingresar`;
            else if (entro) descripcion = f.rol === "TITULAR" && Number(f.minuto_entrada) === 0
                ? "En cancha desde el inicio" : `En cancha · ingresó al ${f.minuto_entrada}'`;
            const min = iniciado() && participacion.get(f.jugador_id)?.jugo
                ? `${participacion.get(f.jugador_id).minutos} min acumulados` : "Sin minutos confirmados";
            const botones = sePuedeConvocar ? `
                <button class="btn btn-secondary compact-btn" type="button" data-roster-toggle="${escapar(f.jugador_id)}">${f.rol === "TITULAR" ? "A suplente" : "A titular"}</button>
                <button class="btn btn-secondary compact-btn" type="button" data-roster-remove="${escapar(f.jugador_id)}">Quitar</button>` : "";
            const sugerir = iniciado() && entro
                ? `<button class="btn btn-secondary compact-btn" type="button" data-roster-suggest="${escapar(f.jugador_id)}">Llevar a estadísticas</button>` : "";
            return `<article class="mc-roster-player">
                <div class="mc-roster-player-name">
                    <strong>${escapar(formatoNombre(f.jugador_id))}</strong>
                    <small>${escapar(descripcion)} · ${escapar(min)}</small>
                </div>
                <div class="mc-roster-player-actions">${botones}${sugerir}</div>
            </article>`;
        };
        $("mc-roster-starters").innerHTML = titulares.length ? titulares.map(renderFila).join("") : '<p class="mc-roster-empty">Todavía no hay titulares.</p>';
        $("mc-roster-subs").innerHTML = suplentes.length ? suplentes.map(renderFila).join("") : '<p class="mc-roster-empty">Todavía no hay suplentes.</p>';

        const salida = $("mc-sub-out");
        const entrada = $("mc-sub-in");
        const prevSale = salida.value;
        const prevEntra = entrada.value;
        salida.innerHTML = opciones(enCancha.map(itemJugador).sort((a,b) => a.nombre.localeCompare(b.nombre, "es")), "Jugador que sale");
        entrada.innerHTML = opciones(enBanco.map(itemJugador).sort((a,b) => a.nombre.localeCompare(b.nombre, "es")), "Jugador que entra o reingresa");
        if (enCancha.some((x) => x.jugador_id === prevSale)) salida.value = prevSale;
        if (enBanco.some((x) => x.jugador_id === prevEntra)) entrada.value = prevEntra;
        salida.disabled = !sePuedeCambiar;
        entrada.disabled = !sePuedeCambiar;
        $("mc-sub-minute").disabled = !sePuedeCambiar;
        $("mc-sub-use-current").disabled = !sePuedeCambiar;
        $("mc-sub-save").disabled = !sePuedeCambiar;

        $("mc-roster-changes").innerHTML = cambios.length
            ? cambios.map((c) => `<div class="mc-roster-change"><strong>${Number(c.minuto)}'</strong>
                <span><b>↓</b> ${escapar(formatoNombre(c.jugador_sale_id))}</span>
                <span><b>↑</b> ${escapar(formatoNombre(c.jugador_entra_id))}</span></div>`).join("")
            : '<p class="mc-roster-empty">Sin sustituciones registradas.</p>';
        if (!consultado) mensaje("Cargando alineación...");
        else if (!disponible) mensaje(`No se pudo cargar la convocatoria: ${errorConsulta || "verifica el SQL de Supabase."}`, "error");
        else if (!obtenerJugadores().length) mensaje("No se cargaron jugadores desde Supabase. Revisa Gestión Deportiva > Jugadores y los permisos de la cuenta.", "error");
        else if (!preparacion()) mensaje("La convocatoria solo se edita antes de iniciar un partido PROGRAMADO (fase PREVIA). En partidos en vivo o finalizados se puede consultar, pero no modificar.", "");
        else if (!libres.length) mensaje("Todos los jugadores disponibles ya están convocados. Puedes cambiar su rol o quitar alguno de la lista.");
        else if (consultado) mensaje("");
    }

    async function actualizar() {
        if (!partidoId) return;
        const id = partidoId;
        const [a, c] = await Promise.all([
            supabase.from("deportivo_alineacion_partido").select("*").eq("partido_id", id),
            supabase.from("deportivo_cambios_partido").select("*").eq("partido_id", id).order("minuto", { ascending: true }).order("id", { ascending: true })
        ]);
        if (partidoId !== id) return;
        consultado = true;
        disponible = !a.error && !c.error;
        errorConsulta = disponible ? "" : (a.error || c.error).message;
        if (!disponible) {
            console.error("Convocatoria:", a.error || c.error);
            mensaje((a.error || c.error).message, "error");
        } else {
            alineacion = a.data || [];
            cambios = c.data || [];
            mensaje("");
        }
        render();
        onActualizar();
    }

    async function ejecutar(nombreRPC, payload, mensajeExito) {
        if (ocupada || !disponible || !partidoId) return;
        const id = partidoId;
        ocupada = true;
        render();
        mensaje("Guardando...");
        try {
            const { error } = await supabase.rpc(nombreRPC, payload);
            if (error) { mensaje(error.message, "error"); return; }
            if (partidoId === id) {
                await actualizar();
                if (disponible) mensaje(mensajeExito, "success");
            }
        } catch (error) {
            if (partidoId === id) mensaje(error.message || "No se pudo guardar.", "error");
        } finally {
            ocupada = false;
            if (partidoId === id) render();
        }
    }

    $("mc-roster-add-form").addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!preparacion()) return mensaje("La convocatoria se cierra al iniciar el partido.", "error");
        const jugador = $("mc-roster-player").value;
        if (!jugador) return mensaje("Selecciona un jugador.", "error");
        await ejecutar("guardar_convocado_partido_admin", {
            p_partido_id: partidoId, p_jugador_id: jugador, p_rol: $("mc-roster-role").value
        }, "Jugador incorporado a la convocatoria.");
    });

    async function accionFila(event) {
        const quitar = event.target.closest("[data-roster-remove]");
        const cambiarRol = event.target.closest("[data-roster-toggle]");
        const sugerir = event.target.closest("[data-roster-suggest]");
        if (sugerir) return onSugerir(sugerir.dataset.rosterSuggest);
        if (!preparacion()) return;
        if (quitar) {
            const id = quitar.dataset.rosterRemove;
            if (!confirm(`¿Quitar a ${formatoNombre(id)} de la convocatoria?`)) return;
            await ejecutar("quitar_convocado_partido_admin", {
                p_partido_id: partidoId, p_jugador_id: id
            }, "Jugador eliminado de la convocatoria.");
        } else if (cambiarRol) {
            const id = cambiarRol.dataset.rosterToggle;
            const fila = alineacion.find((x) => x.jugador_id === id);
            if (!fila) return;
            const nuevo = fila.rol === "TITULAR" ? "SUPLENTE" : "TITULAR";
            await ejecutar("guardar_convocado_partido_admin", {
                p_partido_id: partidoId, p_jugador_id: id, p_rol: nuevo
            }, `${formatoNombre(id)} ahora es ${nuevo.toLowerCase()}.`);
        }
    }
    $("mc-roster-starters").addEventListener("click", accionFila);
    $("mc-roster-subs").addEventListener("click", accionFila);

    $("mc-sub-use-current").addEventListener("click", () => {
        if (cambioPermitido()) $("mc-sub-minute").value = minutoCorte();
    });

    $("mc-sub-form").addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!cambioPermitido()) return mensaje("Solo puedes registrar cambios durante el partido.", "error");
        const sale = $("mc-sub-out").value;
        const entra = $("mc-sub-in").value;
        const minuto = Number($("mc-sub-minute").value);
        if (!sale || !entra || sale === entra || !Number.isInteger(minuto) || minuto < 0 || minuto > 180) {
            return mensaje("Selecciona dos jugadores distintos y un minuto válido (0 a 180).", "error");
        }
        if (!confirm(`¿Confirmas el cambio al minuto ${minuto}'?\nSale: ${formatoNombre(sale)}\nEntra: ${formatoNombre(entra)}\n\nEste registro se guardará en el historial del partido.`)) return;
        await ejecutar("registrar_cambio_partido_admin", {
            p_partido_id: partidoId,
            p_sale_jugador_id: sale,
            p_entra_jugador_id: entra,
            p_minuto: minuto
        }, `Cambio registrado al minuto ${minuto}'.`);
    });
    $("mc-roster-refresh").addEventListener("click", async () => {
        mensaje("Actualizando jugadores y convocatoria...");
        await recargarJugadores();
        await actualizar();
    });
    $("mc-roster-undo").addEventListener("click", async () => {
        if (!cambioPermitido() || !cambios.length) return;
        const c = cambios[cambios.length - 1];
        if (!confirm(`¿Deshacer el último cambio del minuto ${c.minuto}'?\nVuelve: ${formatoNombre(c.jugador_sale_id)}\nSale: ${formatoNombre(c.jugador_entra_id)}\n\nLas estadísticas oficiales no se modificarán.`)) return;
        await ejecutar("deshacer_ultimo_cambio_partido_admin", {
            p_partido_id: partidoId
        }, "Último cambio deshecho. Revisa también las estadísticas oficiales si ya las registraste.");
    });

    return {
        async abrir(id) {
            partidoId = id;
            alineacion = [];
            cambios = [];
            consultado = false;
            disponible = true;
            errorConsulta = "";
            mensaje("");
            $("mc-sub-minute").value = minutoCorte();
            render();
            await actualizar();
        },
        render,
        recargar: actualizar,
        fotoEstado: () => ({
            partidoId, consultado, disponible,
            alineacion: alineacion.map((f) => ({ ...f })),
            cambios: cambios.map((c) => ({ ...c })),
            minutoCorte: minutoCorte()
        }),
        sugerencia(jugadorId) {
            const f = alineacion.find((x) => x.jugador_id === jugadorId);
            if (!f || !iniciado()) return null;
            const p = participaciones().get(jugadorId);
            return {
                titular: f.rol === "TITULAR",
                jugo: !!p?.jugo,
                minutos: p?.minutos ?? 0
            };
        }
    };
}
