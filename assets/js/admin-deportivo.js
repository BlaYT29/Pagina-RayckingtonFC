/* ===================================================
   RAYCKINGTON FC · GESTIÓN DEPORTIVA
=================================================== */

"use strict";

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import { crearModuloPlantelPartido } from "./match-roster.js";
import { prepararBorradorCierre } from "./match-close.js";
import { crearPizarraTactica } from "./match-formation.js";

const SUPABASE_URL = "https://auutiadcyhhwxzkeernd.supabase.co";
const SUPABASE_KEY = "sb_publishable_luWCBHYOSUsFbmgPU4GoiQ_9nmBMRHe";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const $ = (id) => document.getElementById(id);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

const loginAdmin = $("login-admin");
const panelAdmin = $("panel-admin");
const formLoginAdmin = $("form-login-admin");
const mensajeLogin = $("mensaje-login");
const globalMessage = $("global-message");

let adminActual = null;
let temporadas = [];
let competiciones = [];
let partidos = [];
let jugadores = [];
let solicitudes = [];
let estadisticasOficiales = [];
let statsTabActual = "pendientes";
let partidoActual = null;
let eventosActuales = [];
let equipos = [];
let equiposCompeticion = [];
let fixtureCompeticion = [];
let jornadasLibres = [];
let tablaCompeticion = [];
let competicionVistaId = null;
let clockTicker = null;
let realtimeMatchChannel = null;
let realtimeEventsChannel = null;
let quickTeam = "RAYCKINGTON";
let quickPendingEvent = null;
let mostrarPlantelCompletoMC = false;
const cargaV4 = { eventos: false, oficiales: false, solicitudes: false };

const TITULOS = {
    inicio: "Gestión Deportiva",
    partidos: "Partidos",
    competicion: "Competición",
    temporadas: "Temporadas",
    estadisticas: "Estadísticas",
    jugadores: "Jugadores",
    "match-center": "Match Center"
};

/* ===================================================
   HELPERS
=================================================== */

function esc(valor = "") {
    return String(valor)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function estadoClase(estado = "PROGRAMADO") {
    return `status-${String(estado).toLowerCase().replaceAll("_", "-")}`;
}

function labelEstado(estado = "") {
    const labels = {
        PROGRAMADO: "PROGRAMADO",
        EN_VIVO: "EN VIVO",
        ENTRETIEMPO: "ENTRETIEMPO",
        FINALIZADO: "FINALIZADO",
        SUSPENDIDO: "SUSPENDIDO",
        CANCELADO: "CANCELADO"
    };
    return labels[estado] || estado;
}

function fmtFecha(fechaHora) {
    if (!fechaHora) return "Fecha y hora por confirmar";
    const d = new Date(fechaHora);
    return new Intl.DateTimeFormat("es-CL", {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(d);
}

function toDatetimeLocal(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
}

function showMessage(texto, tipo = "info") {
    globalMessage.hidden = !texto;
    globalMessage.textContent = texto || "";
    globalMessage.style.borderColor = tipo === "error" ? "#793b43" : tipo === "success" ? "#275d4d" : "#455a75";
    if (texto) setTimeout(() => { if (globalMessage.textContent === texto) globalMessage.hidden = true; }, 4500);
}

function setFormMessage(el, texto = "", tipo = "") {
    el.textContent = texto;
    el.className = `form-message ${tipo}`.trim();
}

function getTemporada(id) { return temporadas.find((x) => x.id === id); }
function getCompeticion(id) { return competiciones.find((x) => x.id === id); }
function getJugador(id) { return jugadores.find((x) => x.id === id); }
function getPartido(id) { return partidos.find((x) => x.id === id); }
function getEquipo(id) { return equipos.find((x) => x.id === id); }

function nombreEquipo(id) {
    const e = getEquipo(id);
    return e?.nombre_corto || e?.nombre || "Equipo";
}

function fmtCrono(segundos = 0) {
    const total = Math.max(0, Math.floor(Number(segundos) || 0));
    const min = Math.floor(total / 60);
    const sec = total % 60;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function segundosCronometro(partido) {
    if (!partido) return 0;
    let segundos = Number(partido.cronometro_segundos_acumulados) || 0;
    if (partido.cronometro_corriendo && partido.cronometro_inicio_at) {
        const inicio = new Date(partido.cronometro_inicio_at).getTime();
        if (Number.isFinite(inicio)) segundos += Math.max(0, Math.floor((Date.now() - inicio) / 1000));
    }
    return segundos;
}

function etiquetaPeriodo(periodo = "PREVIA") {
    return ({ PREVIA: "PREVIA", PRIMER_TIEMPO: "1ER TIEMPO", ENTRETIEMPO: "ENTRETIEMPO", SEGUNDO_TIEMPO: "2º TIEMPO", FINALIZADO: "FINAL" })[periodo] || periodo.replaceAll("_", " ");
}

function nombreJugador(j) {
    return j?.nombre_deportivo || j?.nombre_completo || j?.nombre || "Jugador";
}

function fotoJugadorUrl(j) {
    if (!j?.foto_path) return "assets/img/logo/logo.png";
    const { data } = supabase.storage
        .from("fotos-jugadores")
        .getPublicUrl(j.foto_path);
    return data?.publicUrl || "assets/img/logo/logo.png";
}

let pizarraFifa = null;
const plantelPartido = crearModuloPlantelPartido({
    supabase,
    obtenerPartido: () => partidoActual,
    obtenerJugadores: () => jugadores,
    nombreJugador,
    escapar: esc,
    onSugerir: (jugadorId) => abrirControlManualDesdeMatchCenter(jugadorId),
    recargarJugadores: () => cargarJugadores(),
    onActualizar: () => { renderCierreV4(); pizarraFifa?.actualizarDesdePlantel(); }
});
pizarraFifa = crearPizarraTactica({
    supabase,
    obtenerPartido: () => partidoActual,
    obtenerJugadores: () => jugadores,
    obtenerAlineacion: () => plantelPartido.fotoEstado().alineacion,
    nombreJugador,
    escapar: esc,
    refrescarConvocatoria: () => plantelPartido.recargar()
});

function resumenJugador(jugadorId) {
    return estadisticasOficiales
        .filter((e) => e.jugador_id === jugadorId)
        .reduce((acc, e) => {
            if (e.jugo) acc.pj += 1;
            acc.minutos += Number(e.minutos) || 0;
            acc.goles += Number(e.goles) || 0;
            acc.asistencias += Number(e.asistencias) || 0;
            acc.mvp += e.mvp ? 1 : 0;
            return acc;
        }, { pj: 0, minutos: 0, goles: 0, asistencias: 0, mvp: 0 });
}

/* ===================================================
   AUTH
=================================================== */

formLoginAdmin.addEventListener("submit", async (e) => {
    e.preventDefault();
    mensajeLogin.textContent = "Ingresando...";

    const { error } = await supabase.auth.signInWithPassword({
        email: $("admin-email").value.trim(),
        password: $("admin-password").value
    });

    if (error) {
        mensajeLogin.textContent = error.message;
        return;
    }

    await cargarAplicacion();
});

async function verificarAdministrador() {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) return false;

    const { data: admin, error } = await supabase
        .from("administradores")
        .select("id,user_id,nombre,estado")
        .eq("user_id", userData.user.id)
        .eq("estado", "ACTIVO")
        .maybeSingle();

    if (error || !admin) return false;
    adminActual = { ...admin, email: userData.user.email || "" };
    return true;
}

async function cargarAplicacion() {
    mensajeLogin.textContent = "Verificando permisos...";
    const ok = await verificarAdministrador();

    if (!ok) {
        await supabase.auth.signOut();
        panelAdmin.hidden = true;
        loginAdmin.style.display = "grid";
        mensajeLogin.textContent = "Esta cuenta no tiene permisos administrativos.";
        return;
    }

    loginAdmin.style.display = "none";
    panelAdmin.hidden = false;
    mensajeLogin.textContent = "";

    $("admin-name").textContent = adminActual.nombre || "Administrador";
    $("admin-avatar").textContent = (adminActual.nombre || "R").charAt(0).toUpperCase();
    $("saludo-admin").textContent = `Buenos días, ${(adminActual.nombre || "Administrador").split(" ")[0]}`;

    await cargarTodo();
    mostrarVista("inicio");
}

$("btn-logout").addEventListener("click", async () => {
    limpiarRealtime();
    await supabase.auth.signOut();
    location.reload();
});

/* ===================================================
   NAV
=================================================== */

function mostrarVista(nombre) {
    $$(".view").forEach((v) => v.classList.remove("active"));
    $$(".nav-btn").forEach((b) => b.classList.toggle("active", b.dataset.view === nombre));

    const view = $(`view-${nombre}`);
    if (view) view.classList.add("active");
    $("page-title").textContent = TITULOS[nombre] || "Gestión Deportiva";

    if (nombre !== "match-center") limpiarRealtime();
    if (nombre === "competicion") refrescarCompeticionActual();
    cerrarSidebar();
}

$$(".nav-btn").forEach((b) => b.addEventListener("click", () => mostrarVista(b.dataset.view)));
$$("[data-go]").forEach((b) => b.addEventListener("click", () => mostrarVista(b.dataset.go)));

function cerrarSidebar() {
    $("admin-sidebar").classList.remove("open");
    $("sidebar-backdrop").classList.remove("show");
}
$("btn-menu").addEventListener("click", () => {
    $("admin-sidebar").classList.toggle("open");
    $("sidebar-backdrop").classList.toggle("show");
});
$("sidebar-backdrop").addEventListener("click", cerrarSidebar);

/* ===================================================
   DATA
=================================================== */

async function cargarTodo() {
    await Promise.all([
        cargarTemporadasYCompeticiones(),
        cargarJugadores(),
        cargarPartidos(),
        cargarSolicitudes(),
        cargarEstadisticasOficiales(),
        cargarEstructuraCompeticion()
    ]);

    poblarSelects();
    renderInicio();
    renderPartidos();
    renderTemporadas();
    renderModuloEstadisticas();
    renderJugadores();
    await prepararVistaCompeticion();
}

async function cargarTemporadasYCompeticiones() {
    const [t, c] = await Promise.all([
        supabase.from("deportivo_temporadas").select("*").order("anio", { ascending: false }),
        supabase.from("deportivo_competiciones").select("*").order("created_at", { ascending: false })
    ]);
    if (t.error) console.error(t.error); else temporadas = t.data || [];
    if (c.error) console.error(c.error); else competiciones = c.data || [];
}

async function cargarJugadores() {
    // Consultar todas las columnas evita que un campo opcional inexistente
    // deje el plantel completo en blanco. RLS continúa vigente.
    const { data, error } = await supabase.from("jugadores").select("*");
    if (error) {
        console.error("No se pudieron cargar jugadores de Supabase:", error);
        showMessage("No se pudo cargar el plantel desde Supabase. Comprueba permisos y conexión.", "error");
    } else {
        jugadores = (data || []).sort((a,b)=>nombreJugador(a).localeCompare(nombreJugador(b),"es"));
    }
    return {error, cantidad: jugadores.length};
}

async function cargarPartidos() {
    const { data, error } = await supabase
        .from("deportivo_partidos")
        .select("*")
        .order("jornada", { ascending: true });
    if (error) console.error(error); else partidos = data || [];
}

async function cargarSolicitudes() {
    const { data, error } = await supabase
        .from("deportivo_solicitudes_estadisticas")
        .select("*")
        .order("created_at", { ascending: false });
    cargaV4.solicitudes = !error;
    if (error) console.error(error); else solicitudes = data || [];
    renderCierreV4();
}

async function cargarEstadisticasOficiales() {
    const { data, error } = await supabase
        .from("deportivo_estadisticas_jugador")
        .select("*")
        .order("aprobado_at", { ascending: false });
    cargaV4.oficiales = !error;
    if (error) console.error(error); else estadisticasOficiales = data || [];
    renderCierreV4();
}

async function cargarEstructuraCompeticion() {
    const [eq, ce, fx, jl] = await Promise.all([
        supabase.from("deportivo_equipos").select("*").order("nombre", { ascending: true }),
        supabase.from("deportivo_competicion_equipos").select("*"),
        supabase.from("deportivo_partidos_competicion").select("*").order("jornada", { ascending: true }),
        supabase.from("deportivo_jornadas_libres").select("*").order("jornada", { ascending: true })
    ]);
    if (eq.error) console.error(eq.error); else equipos = eq.data || [];
    if (ce.error) console.error(ce.error); else equiposCompeticion = ce.data || [];
    if (fx.error) console.error(fx.error); else fixtureCompeticion = fx.data || [];
    if (jl.error) console.error(jl.error); else jornadasLibres = jl.data || [];
}

/* ===================================================
   INICIO
=================================================== */

function renderInicio() {
    $("stat-partidos").textContent = partidos.length;
    $("stat-vivo").textContent = partidos.filter((p) => ["EN_VIVO", "ENTRETIEMPO"].includes(p.estado)).length;
    $("stat-proximos").textContent = partidos.filter((p) => p.estado === "PROGRAMADO").length;

    const pendientes = solicitudes.filter((s) => s.estado === "PENDIENTE").length;
    $("stat-solicitudes").textContent = pendientes;
    $("nav-pendientes").hidden = pendientes === 0;
    $("nav-pendientes").textContent = pendientes;

    const programados = partidos.filter((p) => p.estado === "PROGRAMADO");
    const conFecha = programados.filter((p) => p.fecha_hora).sort((a,b) => new Date(a.fecha_hora) - new Date(b.fecha_hora));
    const proximo = conFecha[0] || programados.sort((a,b) => (a.jornada || 999) - (b.jornada || 999))[0];

    if (!proximo) {
        $("next-match").className = "empty-state";
        $("next-match").textContent = "No hay partidos programados.";
        return;
    }

    const comp = getCompeticion(proximo.competicion_id);
    const rayLocal = proximo.condicion === "LOCAL";
    $("next-match").className = "next-match-content";
    $("next-match").innerHTML = `
        <div class="next-match-score">
            <span class="next-match-team">${rayLocal ? "Rayckington FC" : esc(proximo.rival_nombre)}</span>
            <span class="next-match-vs">VS</span>
            <span class="next-match-team">${rayLocal ? esc(proximo.rival_nombre) : "Rayckington FC"}</span>
        </div>
        <div class="next-match-meta">
            <span class="meta-chip">${esc(comp?.nombre || "Sin competición")}</span>
            <span class="meta-chip">Fecha ${proximo.jornada ?? "—"}</span>
            <span class="meta-chip">${esc(fmtFecha(proximo.fecha_hora))}</span>
            ${proximo.lugar ? `<span class="meta-chip">${esc(proximo.lugar)}</span>` : ""}
        </div>
        <button class="btn btn-primary" type="button" data-open-match="${proximo.id}">Abrir Match Center</button>
    `;
    $("next-match").querySelector("[data-open-match]").addEventListener("click", () => abrirMatchCenter(proximo.id));
}

/* ===================================================
   PARTIDOS
=================================================== */

function poblarSelects() {
    const seasonOptions = temporadas.map((t) => `<option value="${t.id}">${esc(t.nombre)} (${t.anio})</option>`).join("");
    $("match-season").innerHTML = seasonOptions;
    $("competition-season").innerHTML = seasonOptions;

    const compOptions = competiciones.map((c) => `<option value="${c.id}">${esc(c.nombre)}</option>`).join("");
    $("filter-match-competition").innerHTML = `<option value="TODAS">Todas</option>${compOptions}`;
    $("competition-view-select").innerHTML = compOptions || `<option value="">Sin competiciones</option>`;
    if (!competicionVistaId || !competiciones.some((c) => c.id === competicionVistaId)) {
        competicionVistaId = competiciones.find((c) => c.nombre === "Torneo Clausura 2026")?.id || competiciones[0]?.id || null;
    }
    if (competicionVistaId) $("competition-view-select").value = competicionVistaId;
    actualizarCompetenciasMatch();
}

function actualizarCompetenciasMatch() {
    const seasonId = $("match-season").value;
    const opts = competiciones.filter((c) => !seasonId || c.temporada_id === seasonId);
    $("match-competition").innerHTML = `<option value="">Sin competición</option>${opts.map((c) => `<option value="${c.id}">${esc(c.nombre)}</option>`).join("")}`;
}
$("match-season").addEventListener("change", actualizarCompetenciasMatch);

function partidosFiltrados() {
    const estado = $("filter-match-status").value;
    const comp = $("filter-match-competition").value;
    const q = $("filter-match-search").value.trim().toLowerCase();

    return partidos.filter((p) =>
        (estado === "TODOS" || p.estado === estado) &&
        (comp === "TODAS" || p.competicion_id === comp) &&
        (!q || p.rival_nombre.toLowerCase().includes(q))
    );
}

function renderPartidos() {
    const lista = partidosFiltrados();
    const root = $("matches-list");

    if (!lista.length) {
        root.innerHTML = `<div class="empty-state">No hay partidos que coincidan con los filtros.</div>`;
        return;
    }

    root.innerHTML = lista.map((p) => {
        const comp = getCompeticion(p.competicion_id);
        const rayLocal = p.condicion === "LOCAL";
        const score = p.estado === "FINALIZADO" || p.estado === "EN_VIVO" || p.estado === "ENTRETIEMPO"
            ? `<span class="match-score-mini">${p.goles_rayckington}–${p.goles_rival}</span>` : "";
        return `
            <article class="match-row">
                <div class="match-round"><span>${esc(comp?.nombre || "PARTIDO")}</span><strong>Fecha ${p.jornada ?? "—"}</strong></div>
                <div class="match-main">
                    <strong>${rayLocal ? "Rayckington FC" : esc(p.rival_nombre)} ${score} ${rayLocal ? esc(p.rival_nombre) : "Rayckington FC"}</strong>
                    <small>${esc(fmtFecha(p.fecha_hora))}${p.lugar ? ` · ${esc(p.lugar)}` : ""} · ${esc(p.condicion)}</small>
                </div>
                <div class="match-actions">
                    <span class="status-pill ${estadoClase(p.estado)}">${labelEstado(p.estado)}</span>
                    <button class="btn btn-secondary" type="button" data-edit-match="${p.id}">Editar</button>
                    <button class="btn btn-primary" type="button" data-open-match="${p.id}">Match Center</button>
                </div>
            </article>
        `;
    }).join("");

    $$('[data-open-match]', root).forEach((b) => b.addEventListener("click", () => abrirMatchCenter(b.dataset.openMatch)));
    $$('[data-edit-match]', root).forEach((b) => b.addEventListener("click", () => abrirModalPartido(getPartido(b.dataset.editMatch))));
}

["filter-match-status", "filter-match-competition", "filter-match-search"].forEach((id) => $(id).addEventListener("input", renderPartidos));
$("btn-new-match").addEventListener("click", () => abrirModalPartido(null));

function abrirModalPartido(p = null) {
    $("match-form").reset();
    $("match-id").value = p?.id || "";
    $("match-modal-title").textContent = p ? "Editar partido" : "Nuevo partido";
    $("match-season").value = p?.temporada_id || temporadas[0]?.id || "";
    actualizarCompetenciasMatch();
    $("match-competition").value = p?.competicion_id || "";
    $("match-round").value = p?.jornada ?? "";
    $("match-condition").value = p?.condicion || "LOCAL";
    $("match-rival").value = p?.rival_nombre || "";
    $("match-datetime").value = toDatetimeLocal(p?.fecha_hora);
    $("match-duration").value = p?.duracion_minutos || 60;
    $("match-first-half").value = p?.duracion_primer_tiempo || 30;
    $("match-place").value = p?.lugar || "";
    $("match-published").checked = !!p?.publicado;
    $("match-notes").value = p?.observaciones || "";
    setFormMessage($("match-form-message"));
    $("match-modal").hidden = false;
}

$("match-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = $("match-id").value;
    const fecha = $("match-datetime").value;
    const payload = {
        temporada_id: $("match-season").value,
        competicion_id: $("match-competition").value || null,
        jornada: $("match-round").value ? Number($("match-round").value) : null,
        rival_nombre: $("match-rival").value.trim(),
        condicion: $("match-condition").value,
        fecha_hora: fecha ? new Date(fecha).toISOString() : null,
        duracion_minutos: Number($("match-duration").value || 60),
        duracion_primer_tiempo: Number($("match-first-half").value || 30),
        lugar: $("match-place").value.trim() || null,
        publicado: $("match-published").checked,
        observaciones: $("match-notes").value.trim() || null,
        updated_at: new Date().toISOString()
    };

    setFormMessage($("match-form-message"), "Guardando...");
    const query = id
        ? supabase.from("deportivo_partidos").update(payload).eq("id", id)
        : supabase.from("deportivo_partidos").insert({ ...payload, estado: "PROGRAMADO" });
    const { error } = await query;

    if (error) {
        setFormMessage($("match-form-message"), error.message, "error");
        return;
    }

    setFormMessage($("match-form-message"), "Partido guardado.", "success");
    await cargarPartidos();
    renderPartidos(); renderInicio();
    setTimeout(() => $("match-modal").hidden = true, 450);
});

/* ===================================================
   MATCH CENTER
=================================================== */

async function abrirMatchCenter(id) {
    partidoActual = getPartido(id);
    if (!partidoActual) return;

    cargaV4.eventos = false;
    eventosActuales = [];
    mostrarVista("match-center");
    renderMatchHeader();
    // Reintentar la consulta al abrir: no depender solo del inicio de sesión.
    const resultadoJugadores = await cargarJugadores();
    if (partidoActual?.id !== id) return;
    if (!resultadoJugadores.error && jugadores.length === 0) {
        showMessage("No hay jugadores registrados o visibles para esta cuenta. Revisa Gestión Deportiva > Jugadores.", "error");
    }
    poblarJugadoresEvento();
    mostrarPlantelCompletoMC = false;
    await Promise.all([cargarEstadisticasOficiales(), cargarSolicitudes()]);
    // Si el usuario cambió de partido antes de terminar las consultas, no
    // suscribirse al anterior.
    if (partidoActual?.id !== id) return;
    await cargarEventosPartido();
    if (partidoActual?.id !== id) return;
    await plantelPartido.abrir(id);
    if (partidoActual?.id !== id) return;
    await pizarraFifa.abrir(id);
    if (partidoActual?.id === id) {
        renderCierreV4();
        activarRealtime(id);
        // activarRealtime limpia el ticker anterior: restaurarlo para
        // que el reloj siga avanzando sin requerir un nuevo evento.
        asegurarTickerCrono();
    }
}

$("btn-back-matches").addEventListener("click", () => mostrarVista("partidos"));

function renderMatchHeader() {
    if (!partidoActual) return;
    const comp = getCompeticion(partidoActual.competicion_id);
    $("mc-competition").textContent = comp?.nombre || "PARTIDO";
    $("mc-round").textContent = `Fecha ${partidoActual.jornada ?? "—"}`;
    $("mc-status").className = `status-pill ${estadoClase(partidoActual.estado)}`;
    $("mc-status").textContent = labelEstado(partidoActual.estado);
    $("mc-score-home").textContent = partidoActual.goles_rayckington;
    $("mc-score-away").textContent = partidoActual.goles_rival;
    const segundos = segundosCronometro(partidoActual);
    const minutoVisual = Math.floor(segundos / 60);
    $("mc-minute").textContent = partidoActual.estado === "PROGRAMADO" ? "0'" : `${minutoVisual}'`;
    $("mc-minute-input").value = partidoActual.minuto_actual || minutoVisual || 0;
    if (document.activeElement !== $("event-minute")) $("event-minute").value = minutoVisual || partidoActual.minuto_actual || 0;
    $("mc-rival").textContent = partidoActual.rival_nombre;
    $("mc-details").textContent = [fmtFecha(partidoActual.fecha_hora), partidoActual.lugar, partidoActual.condicion].filter(Boolean).join(" · ");
    $("mc-period").textContent = etiquetaPeriodo(partidoActual.periodo_partido);
    $("mc-clock").textContent = fmtCrono(segundos);
    $("mc-clock-config").textContent = `${partidoActual.duracion_minutos || 60} min · ${partidoActual.duracion_primer_tiempo || 30} + ${(partidoActual.duracion_minutos || 60) - (partidoActual.duracion_primer_tiempo || 30)}`;
    if (quickPendingEvent && $("quick-event-editor") && !$("quick-event-editor").hidden) {
        $("quick-event-minute-label").textContent = `MINUTO ${minutoEventoAutomatico()}' · ${quickTeam === "RAYCKINGTON" ? "RAYCKINGTON" : "RIVAL"}`;
    }
    actualizarEstadoBotonesCrono();
    plantelPartido.render();
    renderCierreV4();
    asegurarTickerCrono();
}

function asegurarTickerCrono() {
    if (clockTicker) return;
    clockTicker = setInterval(() => {
        if (!partidoActual || !$("view-match-center").classList.contains("active")) return;
        const segundos = segundosCronometro(partidoActual);
        $("mc-clock").textContent = fmtCrono(segundos);
        const minuto = Math.floor(segundos / 60);
        $("mc-minute").textContent = partidoActual.estado === "PROGRAMADO" ? "0'" : `${minuto}'`;
        if (document.activeElement !== $("event-minute")) $("event-minute").value = minuto;
    }, 500);
}

function actualizarEstadoBotonesCrono() {
    if (!partidoActual) return;
    const periodo = partidoActual.periodo_partido || "PREVIA";
    const corriendo = !!partidoActual.cronometro_corriendo;
    $$('[data-clock-action]').forEach((btn) => {
        const a = btn.dataset.clockAction;
        let disabled = false;
        if (a === "INICIAR") disabled = corriendo || periodo === "FINALIZADO" || periodo === "ENTRETIEMPO";
        if (a === "PAUSAR") disabled = !corriendo || periodo === "FINALIZADO";
        if (a === "ENTRETIEMPO") disabled = periodo !== "PRIMER_TIEMPO";
        if (a === "SEGUNDO_TIEMPO") disabled = periodo !== "ENTRETIEMPO";
        if (a === "FINALIZAR") disabled = periodo === "FINALIZADO" || periodo === "PREVIA";
        btn.disabled = disabled;
    });
}

$$('[data-clock-action]').forEach((b) => b.addEventListener("click", async () => {
    if (!partidoActual) return;
    const accion = b.dataset.clockAction;
    if (accion === "FINALIZAR" && !confirm("¿Finalizar oficialmente este partido? El resultado pasará a la tabla de la competición.")) return;
    const { error } = await supabase.rpc("controlar_cronometro_partido_admin", {
        p_partido_id: partidoActual.id,
        p_accion: accion
    });
    if (error) { showMessage(error.message, "error"); return; }
    await refrescarPartidoActual();
    if (accion === "FINALIZAR") {
        await refrescarCompeticionActual();
        renderCierreV4();
        $("mc-v4-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}));

function poblarJugadoresEvento() {
    const activos = jugadores.filter((j) => String(j.estado).toUpperCase() !== "INACTIVO");
    const opts = activos.map((j) => `<option value="${j.id}">${esc(nombreJugador(j))}${j.dorsal ? ` · #${j.dorsal}` : ""}</option>`).join("");
    $("event-player").innerHTML = `<option value="">Sin seleccionar</option>${opts}`;
    $("event-assist").innerHTML = `<option value="">Sin asistencia</option>${opts}`;
    if ($("quick-player")) $("quick-player").innerHTML = `<option value="">Seleccionar jugador</option>${opts}`;
    if ($("quick-assist")) $("quick-assist").innerHTML = `<option value="">Sin asistencia</option>${opts}`;
}

async function cargarEventosPartido() {
    if (!partidoActual) return;
    const partidoId = partidoActual.id;
    const { data, error } = await supabase
        .from("deportivo_eventos")
        .select("*")
        .eq("partido_id", partidoId)
        .order("minuto", { ascending: false })
        .order("adicional", { ascending: false })
        .order("created_at", { ascending: false });
    if (partidoActual?.id !== partidoId) return;
    cargaV4.eventos = !error;
    if (error) {
        console.error(error);
        eventosActuales = [];
        $("mc-control-list").innerHTML = `<div class="empty-state">No se pudieron obtener los eventos. Vuelve a actualizar antes de registrar estadísticas.</div>`;
        renderCierreV4();
        return;
    }
    eventosActuales = data || [];
    renderEventos();
    renderStatsLocal();
    renderControlCierrePartido();
    renderCierreV4();
}

function renderEventos() {
    const root = $("mc-events");
    if (!eventosActuales.length) {
        root.innerHTML = `<div class="empty-state">Todavía no hay eventos registrados.</div>`;
        return;
    }

    root.innerHTML = eventosActuales.map((e) => {
        const j = getJugador(e.jugador_id);
        const asist = getJugador(e.asistencia_jugador_id);
        const nombre = e.equipo === "RAYCKINGTON" ? nombreJugador(j) : (e.jugador_rival || "Rival");
        const extra = e.adicional ? `+${e.adicional}` : "";
        const secundario = asist ? `Asistencia: ${nombreJugador(asist)}` : (e.detalle || e.equipo);
        return `
            <div class="event-row ${e.anulado ? "anulado" : ""}">
                <span class="event-time">${e.minuto ?? 0}'${extra}</span>
                <div class="event-main"><strong>${esc(e.tipo.replaceAll("_", " "))} · ${esc(nombre)}</strong><small>${esc(secundario || "")}</small></div>
                ${!e.anulado ? `<button class="btn btn-ghost" data-annul-event="${e.id}" type="button">Anular</button>` : `<span class="muted">Anulado</span>`}
            </div>
        `;
    }).join("");

    $$('[data-annul-event]', root).forEach((b) => b.addEventListener("click", async () => {
        if (!confirm("¿Anular este evento? Quedará registrado en el historial.")) return;
        const { error } = await supabase.rpc("anular_evento_partido_admin", { p_evento_id: b.dataset.annulEvent });
        if (error) { showMessage(error.message, "error"); return; }
        await refrescarPartidoActual();
    }));
}

function renderStatsLocal() {
    const valid = eventosActuales.filter((e) => !e.anulado);
    const count = (equipo, tipos) => valid.filter((e) => e.equipo === equipo && tipos.includes(e.tipo)).length;
    const gol = (equipo) => count(equipo, ["GOL"]) + count(equipo === "RAYCKINGTON" ? "RIVAL" : "RAYCKINGTON", ["AUTOGOL"]);

    const rows = [
        ["Goles", gol("RAYCKINGTON"), gol("RIVAL")],
        // Un gol también cuenta como tiro y tiro al arco.
        // Un tiro al arco también cuenta dentro de los tiros totales.
        [
            "Tiros",
            count("RAYCKINGTON", ["TIRO", "TIRO_ARCO", "GOL"]) + count("RIVAL", ["AUTOGOL"]),
            count("RIVAL", ["TIRO", "TIRO_ARCO", "GOL"]) + count("RAYCKINGTON", ["AUTOGOL"])
        ],
        [
            "Tiros al arco",
            count("RAYCKINGTON", ["TIRO_ARCO", "GOL"]) + count("RIVAL", ["AUTOGOL"]),
            count("RIVAL", ["TIRO_ARCO", "GOL"]) + count("RAYCKINGTON", ["AUTOGOL"])
        ],
        ["Córners", count("RAYCKINGTON", ["CORNER"]), count("RIVAL", ["CORNER"])],
        ["Faltas", count("RAYCKINGTON", ["FALTA"]), count("RIVAL", ["FALTA"])],
        ["Amarillas", count("RAYCKINGTON", ["AMARILLA", "SEGUNDA_AMARILLA"]), count("RIVAL", ["AMARILLA", "SEGUNDA_AMARILLA"])],
        ["Rojas", count("RAYCKINGTON", ["ROJA"]), count("RIVAL", ["ROJA"])],
        ["Offsides", count("RAYCKINGTON", ["OFFSIDE"]), count("RIVAL", ["OFFSIDE"])]
    ];

    $("mc-stats").innerHTML = rows.map(([label, home, away]) => {
        const total = Math.max(home + away, 1);
        const hp = Math.round(home / total * 100);
        const ap = Math.round(away / total * 100);
        return `
            <div class="stat-line">
                <span>${home}</span>
                <div>
                    <div class="stat-line-label"><span>${esc(label)}</span><span></span><span></span></div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:5px">
                        <div class="stat-bar"><i style="width:${hp}%"></i></div>
                        <div class="stat-bar away"><i style="width:${ap}%"></i></div>
                    </div>
                </div>
                <span>${away}</span>
            </div>
        `;
    }).join("");
}

/* ===================================================
   CONTROL DE CIERRE: MATCH CENTER ↔ ESTADÍSTICA OFICIAL
   Solo consulta datos. La confirmación se guarda mediante el RPC
   administrativo que ya existía en el formulario manual.
=================================================== */

function resumenEventosJugadorPartido(jugadorId) {
    const resultado = { goles: 0, asistencias: 0, amarillas: 0, rojas: 0, eventos: 0 };
    for (const e of eventosActuales) {
        if (e.anulado || e.equipo !== "RAYCKINGTON") continue;
        if (e.jugador_id === jugadorId) {
            resultado.eventos++;
            if (e.tipo === "GOL") resultado.goles++;
            if (e.tipo === "AMARILLA" || e.tipo === "SEGUNDA_AMARILLA") resultado.amarillas++;
            if (e.tipo === "ROJA") resultado.rojas++;
        }
        if (e.tipo === "GOL" && e.asistencia_jugador_id === jugadorId) {
            resultado.asistencias++;
            // La asistencia también convierte al jugador en relevante,
            // aunque no aparezca como protagonista de otro evento.
            if (e.jugador_id !== jugadorId) resultado.eventos++;
        }
    }
    return resultado;
}

function datosControlCierrePartido() {
    if (!partidoActual) return [];
    const oficiales = estadisticasOficiales.filter((e) => e.partido_id === partidoActual.id);
    const pendientes = solicitudes.filter((e) => e.partido_id === partidoActual.id && e.estado === "PENDIENTE");
    const ids = new Set(jugadores.map((j) => j.id));
    oficiales.forEach((e) => ids.add(e.jugador_id));
    pendientes.forEach((e) => ids.add(e.jugador_id));
    eventosActuales.filter((e) => !e.anulado && e.equipo === "RAYCKINGTON").forEach((e) => {
        if (e.jugador_id) ids.add(e.jugador_id);
        if (e.tipo === "GOL" && e.asistencia_jugador_id) ids.add(e.asistencia_jugador_id);
    });
    return [...ids].map((id) => {
        const registro = oficiales.find((e) => e.jugador_id === id) || null;
        const pendiente = pendientes.find((e) => e.jugador_id === id) || null;
        const mc = resumenEventosJugadorPartido(id);
        const discrepancia = !!registro && ["goles", "asistencias", "amarillas", "rojas"]
            .some((k) => Number(registro[k] || 0) !== mc[k]);
        return {
            id, jugador: getJugador(id), registro, pendiente, mc,
            discrepancia,
            relevante: !!registro || !!pendiente || mc.eventos > 0
        };
    }).sort((a, b) => nombreJugador(a.jugador).localeCompare(nombreJugador(b.jugador), "es"));
}

function renderControlCierrePartido() {
    const summary = $("mc-control-summary");
    const root = $("mc-control-list");
    if (!summary || !root || !partidoActual) return;
    const datos = datosControlCierrePartido();
    const relevantes = datos.filter((d) => d.relevante);
    const conEventos = relevantes.filter((d) => d.mc.eventos > 0).length;
    const conOficial = relevantes.filter((d) => d.registro).length;
    const conPendientes = relevantes.filter((d) => d.pendiente).length;
    const diferencias = relevantes.filter((d) => d.discrepancia).length;
    const sinNombre = eventosActuales.filter((e) => !e.anulado && e.equipo === "RAYCKINGTON" &&
        ["GOL", "AMARILLA", "SEGUNDA_AMARILLA", "ROJA"].includes(e.tipo) && !e.jugador_id).length;

    summary.innerHTML = `
        <span><strong>${conEventos}</strong> con eventos</span>
        <span><strong>${conOficial}</strong> oficiales</span>
        <span><strong>${conPendientes}</strong> solicitudes pendientes</span>
        <span class="${diferencias ? "mc-control-alert" : ""}"><strong>${diferencias}</strong> con diferencias</span>
        ${sinNombre ? `<span class="mc-control-alert"><strong>${sinNombre}</strong> evento(s) sin jugador</span>` : ""}
    `;
    $("mc-control-toggle-all").textContent = mostrarPlantelCompletoMC ? "Ver solo registrados" : "Ver plantel completo";
    $("mc-control-toggle-all").setAttribute("aria-pressed", String(mostrarPlantelCompletoMC));
    const lista = mostrarPlantelCompletoMC ? datos : relevantes;
    if (!lista.length) {
        root.innerHTML = `<div class="empty-state">No hay eventos ni estadísticas oficiales asignadas todavía. Usa «Registrar jugador» para ingresar las participaciones del partido.</div>`;
        return;
    }

    root.innerHTML = lista.map((d) => {
        const { registro: o, pendiente: p, mc } = d;
        const nombre = d.jugador ? nombreJugador(d.jugador) : "Jugador sin ficha";
        const estado = d.discrepancia ? "Diferencias por revisar" : o ? "Registro oficial" : p ? "Solicitud pendiente" : mc.eventos ? "Sin registro oficial" : "Sin registros";
        const tipoEstado = d.discrepancia ? "warning" : o ? "ok" : p ? "pending" : "missing";
        const met = (datos) => `G ${Number(datos.goles || 0)} · A ${Number(datos.asistencias || 0)} · TA ${Number(datos.amarillas || 0)} · TR ${Number(datos.rojas || 0)}`;
        const btn = o
            ? `<button class="btn btn-secondary compact-btn" data-mc-edit-stat="${esc(d.id)}" type="button">Editar oficial</button>`
            : p
                ? `<button class="btn btn-secondary compact-btn" data-mc-review-stat="${esc(d.id)}" type="button">Revisar solicitud</button>`
                : `<button class="btn btn-primary compact-btn" data-mc-new-stat="${esc(d.id)}" type="button">Registrar / confirmar</button>`;
        return `<article class="mc-control-player">
            <div class="mc-control-player-info">
                <strong>${esc(nombre)}</strong>
                <small class="mc-control-status mc-control-status-${tipoEstado}">${estado}</small>
            </div>
            <div class="mc-control-player-metrics">
                <span><small>EVENTOS</small>${esc(met(mc))}</span>
                <span><small>OFICIAL</small>${o ? esc(met(o)) : "Sin registro"}</span>
            </div>
            <div class="mc-control-player-actions">${btn}</div>
        </article>`;
    }).join("");

    $$('[data-mc-edit-stat]', root).forEach((b) => b.addEventListener("click", () => {
        const o = estadisticasOficiales.find((e) => e.partido_id === partidoActual?.id && e.jugador_id === b.dataset.mcEditStat);
        if (o) abrirRegistroManual(o);
    }));
    $$('[data-mc-review-stat]', root).forEach((b) => b.addEventListener("click", () => {
        const p = solicitudes.find((e) => e.partido_id === partidoActual?.id && e.jugador_id === b.dataset.mcReviewStat && e.estado === "PENDIENTE");
        if (p) abrirRevision(p);
    }));
    $$('[data-mc-new-stat]', root).forEach((b) => b.addEventListener("click", () => abrirControlManualDesdeMatchCenter(b.dataset.mcNewStat)));
}

function abrirControlManualDesdeMatchCenter(jugadorId = "") {
    if (!partidoActual) return;
    // Si ya existe un registro oficial, editarlo: nunca crear un duplicado.
    const existente = estadisticasOficiales.find((e) => e.partido_id === partidoActual.id && e.jugador_id === jugadorId);
    if (existente) { abrirRegistroManual(existente); return; }
    if (jugadorId && !getJugador(jugadorId)) {
        showMessage("El jugador no tiene una ficha disponible para registrar estadísticas.", "error");
        return;
    }
    abrirRegistroManual();
    $("manual-stat-match").value = partidoActual.id;
    if (jugadorId) {
        $("manual-stat-player").value = jugadorId;
        const mc = resumenEventosJugadorPartido(jugadorId);
        $("manual-stat-goals").value = mc.goles;
        $("manual-stat-assists").value = mc.asistencias;
        $("manual-stat-yellows").value = mc.amarillas;
        $("manual-stat-reds").value = mc.rojas;
    }
    if (jugadorId) {
        const sugerencia = plantelPartido.sugerencia(jugadorId);
        if (sugerencia) {
            $("manual-stat-played").checked = sugerencia.jugo;
            $("manual-stat-starter").checked = sugerencia.titular;
            $("manual-stat-minutes").value = sugerencia.minutos;
            actualizarCamposJugadorManual();
        }
    }
    setFormMessage($("manual-stat-message"), "Borrador desde eventos y alineación. Revisa minutos, titularidad, posición, tarjetas, MVP y datos de portero antes de guardar.");
}

$("mc-control-add")?.addEventListener("click", () => abrirControlManualDesdeMatchCenter());
$("mc-control-toggle-all")?.addEventListener("click", () => {
    mostrarPlantelCompletoMC = !mostrarPlantelCompletoMC;
    renderControlCierrePartido();
});
$("mc-control-refresh")?.addEventListener("click", async () => {
    if (!partidoActual) return;
    const boton = $("mc-control-refresh");
    boton.disabled = true;
    try {
        const id = partidoActual.id;
        await Promise.all([cargarEstadisticasOficiales(), cargarSolicitudes()]);
        if (partidoActual?.id === id) await cargarEventosPartido();
    } finally { boton.disabled = false; }
});

/* ===================================================
   MATCH CENTER V4 · BORRADOR DE CIERRE
   Solo lee eventos, convocatoria, solicitudes y oficiales.
   Al confirmar abre el mismo formulario seguro que ya usa RPC.
=================================================== */
function esPartidoNuevoParaCierre(p) {
    const comp = getCompeticion(p?.competicion_id);
    const temp = getTemporada(p?.temporada_id);
    const anio = Number(temp?.anio || 0);
    if (anio >= 2027) return true;
    return anio === 2026 && /clausura/i.test(`${comp?.nombre || ""} ${temp?.nombre || ""}`) && Number(p?.jornada) >= 3;
}

function renderCierreV4() {
    const root = $("mc-v4-list");
    if (!root || !partidoActual) return;
    const estado = $("mc-v4-state");
    const summary = $("mc-v4-summary");
    const alerts = $("mc-v4-alerts");
    const snapshot = plantelPartido.fotoEstado();
    if (snapshot.partidoId !== partidoActual.id) {
        estado.textContent = "Cargando convocatoria del encuentro...";
        root.innerHTML = "";
        summary.innerHTML = "";
        alerts.innerHTML = "";
        return;
    }
    const p = partidoActual;
    const finalizado = p.estado === "FINALIZADO";
    const habilitado = esPartidoNuevoParaCierre(p);
    const completo = snapshot.consultado && snapshot.disponible && cargaV4.eventos && cargaV4.oficiales && cargaV4.solicitudes;
    const habilitarBotones = finalizado && habilitado && completo;
    const listaOficial = estadisticasOficiales.filter((o) => o.partido_id === p.id);
    const listaSolicitudes = solicitudes.filter((o) => o.partido_id === p.id);
    const borrador = prepararBorradorCierre({
        alineacion: snapshot.alineacion,
        eventos: cargaV4.eventos ? eventosActuales : [],
        oficiales: cargaV4.oficiales ? listaOficial : [],
        solicitudes: cargaV4.solicitudes ? listaSolicitudes : [],
        minutoFinal: snapshot.minutoCorte
    });
    if (!snapshot.consultado) estado.textContent = "Cargando convocatoria para preparar el cierre...";
    else if (!completo) estado.textContent = "No pudimos consultar todos los datos. Actualiza el borrador; no confirmes estadísticas todavía.";
    else if (!habilitado) estado.textContent = "Este encuentro pertenece al historial anterior al Clausura 2026, Fecha 3. No se generarán estadísticas nuevas desde V4 para evitar duplicaciones.";
    else if (!finalizado) estado.textContent = "Vista preliminar: finaliza el encuentro para habilitar la confirmación de estadísticas.";
    else estado.textContent = "Partido finalizado. Revisa los datos sugeridos y confirma cada jugador; todavía no se publica nada automáticamente.";
    summary.innerHTML = `
        <span><strong>${borrador.rows.length}</strong> jugadores para revisar</span>
        <span><strong>${borrador.conOficial}</strong> fichas oficiales</span>
        <span><strong>${borrador.conSolicitud}</strong> solicitudes pendientes</span>
        <span><strong>${borrador.porConfirmar}</strong> por registrar</span>`;
    alerts.innerHTML = borrador.incidencias.map((txt) => `<p class="mc-v4-alert">⚠ ${esc(txt)}</p>`).join("");
    if (!borrador.rows.length) {
        root.innerHTML = `<div class="empty-state">No hay convocados que hayan jugado, eventos identificados ni fichas para este encuentro. Comprueba la convocatoria antes de cerrar.</div>`;
        return;
    }
    const ordenadas = [...borrador.rows].sort((a,b) => nombreJugador(getJugador(a.jugadorId)).localeCompare(nombreJugador(getJugador(b.jugadorId)),"es"));
    root.innerHTML = ordenadas.map((fila) => {
        const nombre = nombreJugador(getJugador(fila.jugadorId));
        const tipo = fila.estado === "OFICIAL" ? "Ficha oficial" : fila.estado === "SOLICITUD" ? "Solicitud pendiente" : "Por confirmar";
        const accion = fila.estado === "OFICIAL" ? "Revisar oficial" : fila.estado === "SOLICITUD" ? "Revisar solicitud" : "Preparar ficha";
        const minutes = fila.minutos === null ? "Sin dato de minutos" : `${fila.minutos} min estimados`;
        const participacion = fila.jugo === null ? "Participación sin confirmar" : fila.jugo ? (fila.titular ? "Titular" : "Suplente que ingresó") : "No ingresó";
        return `<article class="mc-v4-row">
            <div class="mc-v4-name"><strong>${esc(nombre)}</strong><small>${esc(tipo)}</small></div>
            <div class="mc-v4-metric"><span>${esc(participacion)} · ${esc(minutes)}</span>
                <small>Confirmar con acta del partido</small></div>
            <div class="mc-v4-metric"><span>⚽ ${fila.mc.goles} · Asist. ${fila.mc.asistencias} · 🟨 ${fila.mc.amarillas} · 🟥 ${fila.mc.rojas}</span>
                <small>${fila.avisos.length ? `<span class="mc-v4-flags">${esc(fila.avisos.join(" · "))}</span>` : "Valores orientativos del Match Center"}</small></div>
            <div><button type="button" class="btn ${fila.estado === "OFICIAL" ? "btn-secondary" : "btn-primary"} compact-btn" data-v4-review="${esc(fila.jugadorId)}" ${habilitarBotones ? "" : "disabled"}>${esc(accion)}</button></div>
        </article>`;
    }).join("");
    root.querySelectorAll("[data-v4-review]").forEach((b) => b.addEventListener("click", () => {
        if (!habilitarBotones || partidoActual?.id !== p.id) return;
        const id = b.dataset.v4Review;
        const oficial = listaOficial.find((o) => o.jugador_id === id);
        const solicitud = listaSolicitudes.find((o) => o.jugador_id === id && o.estado === "PENDIENTE");
        if (oficial) abrirRegistroManual(oficial);
        else if (solicitud) abrirRevision(solicitud);
        else abrirControlManualDesdeMatchCenter(id);
    }));
}

$("mc-v4-refresh")?.addEventListener("click", async () => {
    if (!partidoActual) return;
    const id = partidoActual.id;
    const boton = $("mc-v4-refresh");
    boton.disabled = true;
    cargaV4.eventos = false;
    cargaV4.oficiales = false;
    cargaV4.solicitudes = false;
    renderCierreV4();
    try {
        await Promise.all([
            plantelPartido.recargar(),
            cargarEventosPartido(),
            cargarEstadisticasOficiales(),
            cargarSolicitudes()
        ]);
        if (partidoActual?.id === id) renderCierreV4();
    } catch (e) { console.error(e); showMessage("No se pudo actualizar el borrador. Inténtalo de nuevo.", "error"); }
    finally { boton.disabled = false; }
});

/* ===================================================
   ACCIONES RÁPIDAS DEL MATCH CENTER
=================================================== */

function minutoEventoAutomatico() {
    if (!partidoActual) return 0;
    const porCronometro = Math.floor(segundosCronometro(partidoActual) / 60);
    return Math.max(0, porCronometro, Number(partidoActual.minuto_actual) || 0);
}

function etiquetaEventoRapido(tipo) {
    return ({
        GOL: "Gol",
        TIRO_ARCO: "Tiro al arco",
        TIRO: "Tiro",
        CORNER: "Córner",
        FALTA: "Falta",
        OFFSIDE: "Offside",
        AMARILLA: "Tarjeta amarilla",
        ROJA: "Tarjeta roja"
    })[tipo] || tipo.replaceAll("_", " ");
}

function actualizarEquipoRapido(equipo) {
    quickTeam = equipo;
    $$('[data-quick-team]').forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.quickTeam === quickTeam);
    });
    if (quickPendingEvent) abrirEditorRapido(quickPendingEvent);
}

function cerrarEditorRapido() {
    quickPendingEvent = null;
    if ($("quick-event-editor")) $("quick-event-editor").hidden = true;
    if ($("quick-event-message")) setFormMessage($("quick-event-message"), "");
    if ($("quick-rival-player")) $("quick-rival-player").value = "";
    if ($("quick-player")) $("quick-player").value = "";
    if ($("quick-assist")) $("quick-assist").value = "";
}

function abrirEditorRapido(tipo) {
    quickPendingEvent = tipo;
    const minuto = minutoEventoAutomatico();
    $("quick-event-editor").hidden = false;
    $("quick-event-minute-label").textContent = `MINUTO ${minuto}' · ${quickTeam === "RAYCKINGTON" ? "RAYCKINGTON" : "RIVAL"}`;
    $("quick-event-title").textContent = etiquetaEventoRapido(tipo);

    const requiereJugador = ["GOL", "AMARILLA", "ROJA"].includes(tipo);
    $("quick-player-wrap").hidden = quickTeam !== "RAYCKINGTON" || !requiereJugador;
    $("quick-assist-wrap").hidden = quickTeam !== "RAYCKINGTON" || tipo !== "GOL";
    $("quick-rival-player-wrap").hidden = quickTeam !== "RIVAL" || !requiereJugador;
    $("quick-event-confirm").textContent = `Registrar ${etiquetaEventoRapido(tipo).toLowerCase()}`;
}

async function registrarEventoRapido(tipo, opciones = {}) {
    if (!partidoActual) return false;
    const minuto = minutoEventoAutomatico();
    setFormMessage($("quick-event-message"), `Registrando ${etiquetaEventoRapido(tipo).toLowerCase()} en ${minuto}'...`);

    const payload = {
        p_partido_id: partidoActual.id,
        p_equipo: quickTeam,
        p_tipo: tipo,
        p_minuto: minuto,
        p_adicional: 0,
        p_jugador_id: quickTeam === "RAYCKINGTON" ? (opciones.jugadorId || null) : null,
        p_asistencia_jugador_id: quickTeam === "RAYCKINGTON" && tipo === "GOL" ? (opciones.asistenciaId || null) : null,
        p_jugador_rival: quickTeam === "RIVAL" ? (opciones.jugadorRival || null) : null,
        p_detalle: opciones.detalle || null
    };

    const { error } = await supabase.rpc("registrar_evento_partido_admin", payload);
    if (error) {
        setFormMessage($("quick-event-message"), error.message, "error");
        return false;
    }

    setFormMessage($("quick-event-message"), `${etiquetaEventoRapido(tipo)} registrado en ${minuto}'.`, "success");
    await refrescarPartidoActual();
    return true;
}

$$('[data-quick-team]').forEach((btn) => btn.addEventListener("click", () => {
    actualizarEquipoRapido(btn.dataset.quickTeam);
}));

$$('[data-quick-event]').forEach((btn) => btn.addEventListener("click", async () => {
    const tipo = btn.dataset.quickEvent;
    const requiereDetalle = ["GOL", "AMARILLA", "ROJA"].includes(tipo);
    if (requiereDetalle) {
        abrirEditorRapido(tipo);
        return;
    }
    cerrarEditorRapido();
    await registrarEventoRapido(tipo);
}));

$("quick-event-cancel")?.addEventListener("click", cerrarEditorRapido);

$("quick-event-confirm")?.addEventListener("click", async () => {
    if (!quickPendingEvent) return;

    const requiereJugador = ["GOL", "AMARILLA", "ROJA"].includes(quickPendingEvent);
    const jugadorId = $("quick-player").value || null;
    const jugadorRival = $("quick-rival-player").value.trim() || null;

    if (quickTeam === "RAYCKINGTON" && requiereJugador && !jugadorId) {
        setFormMessage($("quick-event-message"), "Selecciona al jugador de Rayckington.", "error");
        return;
    }

    const asistenciaId = $("quick-assist").value || null;
    if (quickPendingEvent === "GOL" && quickTeam === "RAYCKINGTON" && jugadorId === asistenciaId) {
        setFormMessage($("quick-event-message"), "Goleador y asistidor no pueden ser la misma persona.", "error");
        return;
    }
    const ok = await registrarEventoRapido(quickPendingEvent, {
        jugadorId,
        asistenciaId,
        jugadorRival
    });

    if (ok) cerrarEditorRapido();
});

$("event-team").addEventListener("change", actualizarCamposEvento);
$("event-type").addEventListener("change", actualizarCamposEvento);
function actualizarCamposEvento() {
    const ray = $("event-team").value === "RAYCKINGTON";
    const tipo = $("event-type").value;
    $("event-player-wrap").hidden = !ray;
    $("event-rival-player-wrap").hidden = ray;
    $("event-assist-wrap").hidden = !ray || tipo !== "GOL";
}
actualizarCamposEvento();

$("event-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!partidoActual) return;

    if ($("event-team").value === "RAYCKINGTON" && $("event-type").value === "GOL") {
        const goleador = $("event-player").value;
        const asistidor = $("event-assist").value;
        if (!goleador) {
            setFormMessage($("event-message"), "Selecciona al autor del gol.", "error");
            return;
        }
        if (goleador === asistidor) {
            setFormMessage($("event-message"), "Goleador y asistidor deben ser jugadores distintos.", "error");
            return;
        }
    }

    setFormMessage($("event-message"), "Registrando...");
    const payload = {
        p_partido_id: partidoActual.id,
        p_equipo: $("event-team").value,
        p_tipo: $("event-type").value,
        p_minuto: Number($("event-minute").value || 0),
        p_adicional: Number($("event-extra").value || 0),
        p_jugador_id: $("event-team").value === "RAYCKINGTON" ? ($("event-player").value || null) : null,
        p_asistencia_jugador_id: $("event-team").value === "RAYCKINGTON" && $("event-type").value === "GOL" ? ($("event-assist").value || null) : null,
        p_jugador_rival: $("event-team").value === "RIVAL" ? ($("event-rival-player").value.trim() || null) : null,
        p_detalle: $("event-detail").value.trim() || null
    };

    const { error } = await supabase.rpc("registrar_evento_partido_admin", payload);
    if (error) {
        setFormMessage($("event-message"), error.message, "error");
        return;
    }

    setFormMessage($("event-message"), "Evento registrado.", "success");
    $("event-detail").value = "";
    $("event-rival-player").value = "";
    await refrescarPartidoActual();
});

$$("[data-match-state]").forEach((b) => b.addEventListener("click", async () => {
    if (!partidoActual) return;
    const estado = b.dataset.matchState;
    if (estado === "SUSPENDIDO" && !confirm("¿Suspender este partido? El cronómetro se detendrá.")) return;

    if (partidoActual.cronometro_corriendo) {
        const pausa = await supabase.rpc("controlar_cronometro_partido_admin", { p_partido_id: partidoActual.id, p_accion: "PAUSAR" });
        if (pausa.error) { showMessage(pausa.error.message, "error"); return; }
    }
    const { error } = await supabase.rpc("cambiar_estado_partido_admin", {
        p_partido_id: partidoActual.id,
        p_estado: estado,
        p_minuto: Number($("mc-minute-input").value || 0)
    });
    if (error) { showMessage(error.message, "error"); return; }
    await refrescarPartidoActual();
}));

$("btn-update-minute").addEventListener("click", async () => {
    if (!partidoActual) return;
    const { error } = await supabase.rpc("actualizar_minuto_partido_admin", {
        p_partido_id: partidoActual.id,
        p_minuto: Number($("mc-minute-input").value || 0)
    });
    if (error) { showMessage(error.message, "error"); return; }
    $("event-minute").value = Number($("mc-minute-input").value || 0);
    await refrescarPartidoActual();
});

async function refrescarPartidoActual() {
    if (!partidoActual) return;
    const { data, error } = await supabase.from("deportivo_partidos").select("*").eq("id", partidoActual.id).single();
    if (!error && data) {
        partidoActual = data;
        const idx = partidos.findIndex((p) => p.id === data.id);
        if (idx >= 0) partidos[idx] = data;
        renderMatchHeader();
        renderInicio();
        renderPartidos();
    }
    await cargarEventosPartido();
}

function activarRealtime(id) {
    limpiarRealtime();
    realtimeMatchChannel = supabase.channel(`deportivo-partido-${id}`)
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "deportivo_partidos", filter: `id=eq.${id}` }, () => refrescarPartidoActual())
        .subscribe();
    realtimeEventsChannel = supabase.channel(`deportivo-eventos-${id}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "deportivo_eventos", filter: `partido_id=eq.${id}` }, () => refrescarPartidoActual())
        .subscribe();
}

function limpiarRealtime() {
    if (realtimeMatchChannel) supabase.removeChannel(realtimeMatchChannel);
    if (realtimeEventsChannel) supabase.removeChannel(realtimeEventsChannel);
    realtimeMatchChannel = null;
    realtimeEventsChannel = null;
    if (clockTicker) { clearInterval(clockTicker); clockTicker = null; }
}

/* ===================================================
   COMPETICIÓN · TABLA + RESULTADOS
=================================================== */

async function prepararVistaCompeticion() {
    if (!competiciones.length) {
        $("competition-fixture").innerHTML = `<div class="empty-state">No hay competiciones disponibles.</div>`;
        $("standings-body").innerHTML = `<tr><td colspan="10">Sin datos</td></tr>`;
        return;
    }
    if (!competicionVistaId) competicionVistaId = competiciones.find((c) => c.nombre === "Torneo Clausura 2026")?.id || competiciones[0].id;
    $("competition-view-select").value = competicionVistaId;
    await refrescarCompeticionActual();
}

$("competition-view-select").addEventListener("change", async () => {
    competicionVistaId = $("competition-view-select").value || null;
    await refrescarCompeticionActual();
});

async function refrescarCompeticionActual() {
    if (!competicionVistaId) return;

    const [fx, jl, ce, tabla] = await Promise.all([
        supabase.from("deportivo_partidos_competicion").select("*").eq("competicion_id", competicionVistaId).order("jornada", { ascending: true }),
        supabase.from("deportivo_jornadas_libres").select("*").eq("competicion_id", competicionVistaId).order("jornada", { ascending: true }),
        supabase.from("deportivo_competicion_equipos").select("*").eq("competicion_id", competicionVistaId),
        supabase.rpc("obtener_tabla_competicion", { p_competicion_id: competicionVistaId })
    ]);

    if (fx.error) console.error(fx.error); else {
        fixtureCompeticion = fixtureCompeticion.filter((x) => x.competicion_id !== competicionVistaId).concat(fx.data || []);
    }
    if (jl.error) console.error(jl.error); else {
        jornadasLibres = jornadasLibres.filter((x) => x.competicion_id !== competicionVistaId).concat(jl.data || []);
    }
    if (ce.error) console.error(ce.error); else {
        equiposCompeticion = equiposCompeticion.filter((x) => x.competicion_id !== competicionVistaId).concat(ce.data || []);
    }
    if (tabla.error) { console.error(tabla.error); tablaCompeticion = []; } else tablaCompeticion = tabla.data || [];

    renderCompeticion();
}

function renderCompeticion() {
    const comp = getCompeticion(competicionVistaId);
    const fx = fixtureCompeticion.filter((x) => x.competicion_id === competicionVistaId);
    const ce = equiposCompeticion.filter((x) => x.competicion_id === competicionVistaId && x.activo !== false);

    $("comp-stat-teams").textContent = ce.length;
    $("comp-stat-rounds").textContent = comp?.total_jornadas || Math.max(0, ...fx.map((x) => x.jornada || 0));
    $("comp-stat-finished").textContent = fx.filter((x) => x.estado === "FINALIZADO").length;
    $("comp-stat-matches").textContent = fx.length;

    renderTablaCompeticion();
    renderFixtureCompeticion();
}

function renderTablaCompeticion() {
    const body = $("standings-body");
    if (!tablaCompeticion.length) {
        body.innerHTML = `<tr class="table-empty"><td colspan="10">Aún no hay resultados finalizados. La tabla partirá en cero.</td></tr>`;
        return;
    }
    body.innerHTML = tablaCompeticion.map((r) => {
        const equipoObj = getEquipo(r.equipo_id);
        const ray = !!equipoObj?.es_rayckington;
        const dg = Number(r.dg || 0);
        return `
            <tr class="${ray ? "ray-row" : ""}">
                <td class="pos-cell">${r.posicion}</td>
                <td class="team-cell">${ray ? `<img src="assets/img/logo/logo.png" alt="">` : `<span class="mini-team-badge">${esc((r.equipo || "E").charAt(0))}</span>`}<strong>${esc(r.equipo)}</strong></td>
                <td>${r.pj}</td><td>${r.pg}</td><td>${r.pe}</td><td>${r.pp}</td><td>${r.gf}</td><td>${r.gc}</td><td>${dg > 0 ? "+" : ""}${dg}</td><td class="pts-cell">${r.puntos}</td>
            </tr>`;
    }).join("");
}

function renderFixtureCompeticion() {
    const root = $("competition-fixture");
    const fx = fixtureCompeticion.filter((x) => x.competicion_id === competicionVistaId);
    if (!fx.length) {
        root.innerHTML = `<div class="empty-state">Esta competición todavía no tiene fixture completo.</div>`;
        return;
    }

    const jornadas = [...new Set(fx.map((x) => x.jornada))].sort((a,b) => a-b);
    root.innerHTML = jornadas.map((jornada) => {
        const juegos = fx.filter((x) => x.jornada === jornada);
        const libre = jornadasLibres.find((x) => x.competicion_id === competicionVistaId && x.jornada === jornada);
        return `
            <article class="round-card">
                <div class="round-card-head">
                    <div><span class="eyebrow">JORNADA</span><h4>Fecha ${jornada}</h4></div>
                    ${libre ? `<span class="free-team">Libre: ${esc(nombreEquipo(libre.equipo_id))}</span>` : ""}
                </div>
                <div class="round-games">
                    ${juegos.map(renderJuegoCompeticion).join("")}
                </div>
            </article>`;
    }).join("");

    $$('[data-save-league-result]', root).forEach((btn) => btn.addEventListener("click", async () => {
        const id = btn.dataset.saveLeagueResult;
        const local = root.querySelector(`[data-goals-local="${id}"]`);
        const visita = root.querySelector(`[data-goals-away="${id}"]`);
        if (!local || !visita || local.value === "" || visita.value === "") {
            showMessage("Ingresa ambos marcadores antes de guardar.", "error");
            return;
        }
        btn.disabled = true;
        const { error } = await supabase.rpc("guardar_resultado_competicion_admin", {
            p_partido_id: id,
            p_goles_local: Number(local.value),
            p_goles_visitante: Number(visita.value),
            p_estado: "FINALIZADO"
        });
        btn.disabled = false;
        if (error) { showMessage(error.message, "error"); return; }
        showMessage("Resultado guardado. Tabla actualizada.", "success");
        await refrescarCompeticionActual();
    }));

    $$('[data-open-linked-match]', root).forEach((btn) => btn.addEventListener("click", () => abrirMatchCenter(btn.dataset.openLinkedMatch)));
}

function renderJuegoCompeticion(p) {
    const local = nombreEquipo(p.equipo_local_id);
    const visita = nombreEquipo(p.equipo_visitante_id);
    const linked = p.partido_rayckington_id;
    const finalizado = p.estado === "FINALIZADO";
    const scoreLocal = p.goles_local ?? "";
    const scoreAway = p.goles_visitante ?? "";

    if (linked) {
        return `
            <div class="league-game ray-game">
                <div class="league-team local">${esc(local)}</div>
                <div class="league-score official-score"><strong>${p.goles_local ?? 0}</strong><span>–</span><strong>${p.goles_visitante ?? 0}</strong></div>
                <div class="league-team away">${esc(visita)}</div>
                <span class="status-pill ${estadoClase(p.estado)}">${labelEstado(p.estado)}</span>
                <button class="btn btn-primary compact-btn" type="button" data-open-linked-match="${linked}">Match Center</button>
            </div>`;
    }

    return `
        <div class="league-game">
            <div class="league-team local">${esc(local)}</div>
            <div class="league-score editable-score">
                <input data-goals-local="${p.id}" type="number" min="0" value="${scoreLocal}" aria-label="Goles ${esc(local)}">
                <span>–</span>
                <input data-goals-away="${p.id}" type="number" min="0" value="${scoreAway}" aria-label="Goles ${esc(visita)}">
            </div>
            <div class="league-team away">${esc(visita)}</div>
            <span class="status-pill ${estadoClase(p.estado)}">${labelEstado(p.estado)}</span>
            <button class="btn ${finalizado ? "btn-secondary" : "btn-success"} compact-btn" type="button" data-save-league-result="${p.id}">${finalizado ? "Corregir" : "Guardar"}</button>
        </div>`;
}

/* ===================================================
   TEMPORADAS
=================================================== */

function renderTemporadas() {
    const root = $("seasons-list");
    if (!temporadas.length) {
        root.innerHTML = `<div class="empty-state">No hay temporadas creadas.</div>`;
        return;
    }
    root.innerHTML = temporadas.map((t) => {
        const comps = competiciones.filter((c) => c.temporada_id === t.id);
        return `
            <article class="season-card">
                <div class="season-card-head">
                    <div><span class="eyebrow">${t.anio}</span><h3>${esc(t.nombre)}</h3></div>
                    <span class="status-pill ${t.estado === "ACTIVA" ? "status-en-vivo" : "status-finalizado"}">${esc(t.estado)}</span>
                </div>
                <div class="competition-list">
                    ${comps.length ? comps.map((c) => `<div class="competition-item"><div><strong>${esc(c.nombre)}</strong><small>${esc(c.tipo)} · ${c.total_jornadas || "—"} jornadas</small></div><span class="muted">${c.estado}</span></div>`).join("") : `<div class="empty-state">Sin competiciones.</div>`}
                </div>
            </article>
        `;
    }).join("");
}

$("btn-new-season").addEventListener("click", () => {
    $("season-form").reset(); setFormMessage($("season-message")); $("season-modal").hidden = false;
});
$("season-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    setFormMessage($("season-message"), "Creando...");
    const { error } = await supabase.from("deportivo_temporadas").insert({
        nombre: $("season-name").value.trim(),
        anio: Number($("season-year").value),
        estado: "ACTIVA",
        publicada: false
    });
    if (error) { setFormMessage($("season-message"), error.message, "error"); return; }
    await cargarTemporadasYCompeticiones(); poblarSelects(); renderTemporadas();
    setFormMessage($("season-message"), "Temporada creada.", "success");
    setTimeout(() => $("season-modal").hidden = true, 400);
});

$("btn-new-competition").addEventListener("click", () => {
    $("competition-form").reset();
    $("competition-season").innerHTML = temporadas.map((t) => `<option value="${t.id}">${esc(t.nombre)}</option>`).join("");
    setFormMessage($("competition-message")); $("competition-modal").hidden = false;
});
$("competition-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    setFormMessage($("competition-message"), "Creando...");
    const { error } = await supabase.from("deportivo_competiciones").insert({
        temporada_id: $("competition-season").value,
        nombre: $("competition-name").value.trim(),
        tipo: $("competition-type").value,
        estado: "ACTIVA",
        publicada: false,
        total_jornadas: $("competition-rounds").value ? Number($("competition-rounds").value) : null
    });
    if (error) { setFormMessage($("competition-message"), error.message, "error"); return; }
    await cargarTemporadasYCompeticiones(); poblarSelects(); renderTemporadas();
    setFormMessage($("competition-message"), "Competición creada.", "success");
    setTimeout(() => $("competition-modal").hidden = true, 400);
});

/* ===================================================
   ESTADÍSTICAS DE JUGADORES
=================================================== */

function renderModuloEstadisticas() {
    const pendientes = solicitudes.filter((s) => s.estado === "PENDIENTE");
    $("review-pending-count").textContent = pendientes.length;
    $("review-approved-count").textContent = solicitudes.filter((s) => s.estado === "APROBADA").length;
    $("review-rejected-count").textContent = solicitudes.filter((s) => s.estado === "RECHAZADA").length;
    $("official-stats-count").textContent = estadisticasOficiales.length;

    $("nav-pendientes").hidden = pendientes.length === 0;
    $("nav-pendientes").textContent = pendientes.length;

    renderSolicitudes();
    renderEstadisticasOficiales();
    activarStatsTab(statsTabActual);
}

function activarStatsTab(tab) {
    statsTabActual = tab === "oficiales" ? "oficiales" : "pendientes";
    $$('[data-stats-tab]').forEach((b) => b.classList.toggle("active", b.dataset.statsTab === statsTabActual));
    $("stats-pane-pending").classList.toggle("active", statsTabActual === "pendientes");
    $("stats-pane-official").classList.toggle("active", statsTabActual === "oficiales");
}

$$('[data-stats-tab]').forEach((b) => b.addEventListener("click", () => activarStatsTab(b.dataset.statsTab)));

function renderSolicitudes() {
    const pendientes = solicitudes.filter((s) => s.estado === "PENDIENTE");
    const root = $("stats-requests-list");

    if (!pendientes.length) {
        root.innerHTML = `
            <div class="empty-state stats-empty">
                <strong>No hay estadísticas pendientes de revisión.</strong>
                <span>Cuando los jugadores envíen sus datos aparecerán aquí para comparar con el Match Center.</span>
            </div>
        `;
        return;
    }

    root.innerHTML = pendientes.map((s) => {
        const j = getJugador(s.jugador_id);
        const p = getPartido(s.partido_id);
        const comp = p ? getCompeticion(p.competicion_id) : null;
        return `
            <article class="request-card">
                <div class="request-player">
                    <strong>${esc(nombreJugador(j))}</strong>
                    <small>${p ? `${esc(comp?.nombre || "Partido")} · vs ${esc(p.rival_nombre)}${p.jornada ? ` · Fecha ${p.jornada}` : ""}` : "Partido"}</small>
                </div>
                <div class="request-metrics">
                    <span class="metric-chip">${s.minutos} min</span>
                    <span class="metric-chip">${s.goles} goles</span>
                    <span class="metric-chip">${s.asistencias} asist.</span>
                    <span class="metric-chip">${s.amarillas} amarillas</span>
                    <span class="metric-chip">${s.rojas} rojas</span>
                    ${s.titular ? `<span class="metric-chip">Titular</span>` : `<span class="metric-chip">Suplente</span>`}
                </div>
                <div class="request-actions">
                    <span class="status-pill status-entretiempo">PENDIENTE</span>
                    <button class="btn btn-primary" type="button" data-review-request="${s.id}">Comparar y revisar</button>
                </div>
            </article>
        `;
    }).join("");

    $$('[data-review-request]', root).forEach((b) => b.addEventListener("click", () => abrirRevision(getSolicitud(b.dataset.reviewRequest))));
}

function renderEstadisticasOficiales() {
    const root = $("official-stats-list");
    if (!estadisticasOficiales.length) {
        root.innerHTML = `
            <div class="empty-state stats-empty">
                <strong>Todavía no hay estadísticas oficiales.</strong>
                <span>Aprueba un envío o registra una estadística manualmente.</span>
            </div>
        `;
        return;
    }

    root.innerHTML = estadisticasOficiales.map((e) => {
        const j = getJugador(e.jugador_id);
        const p = getPartido(e.partido_id);
        const comp = p ? getCompeticion(p.competicion_id) : null;
        const fecha = e.aprobado_at ? new Intl.DateTimeFormat("es-CL", { dateStyle: "medium" }).format(new Date(e.aprobado_at)) : "";
        return `
            <article class="official-stat-card">
                <div class="official-stat-main">
                    <div class="official-player-avatar">${j?.foto_path ? `<img src="${esc(j.foto_path)}" alt="${esc(nombreJugador(j))}">` : esc(nombreJugador(j).charAt(0).toUpperCase())}</div>
                    <div>
                        <strong>${esc(nombreJugador(j))}</strong>
                        <small>${p ? `${esc(comp?.nombre || "Partido")} · vs ${esc(p.rival_nombre)}${p.jornada ? ` · Fecha ${p.jornada}` : ""}` : "Partido"}</small>
                    </div>
                </div>
                <div class="official-stat-metrics">
                    <span><small>PJ</small><strong>${e.jugo ? 1 : 0}</strong></span>
                    <span><small>MIN</small><strong>${e.minutos}</strong></span>
                    <span><small>G</small><strong>${e.goles}</strong></span>
                    <span><small>A</small><strong>${e.asistencias}</strong></span>
                    <span><small>TA</small><strong>${e.amarillas}</strong></span>
                    <span><small>TR</small><strong>${e.rojas}</strong></span>
                    <span><small>MVP</small><strong>${e.mvp ? "★" : "—"}</strong></span>
                </div>
                <div class="official-stat-actions">
                    <span class="source-badge ${e.fuente === "ADMIN" ? "source-admin" : "source-player"}">${e.fuente === "ADMIN" ? "ADMIN" : "SOLICITUD APROBADA"}</span>
                    ${fecha ? `<small>${esc(fecha)}</small>` : ""}
                    <button class="btn btn-secondary compact-btn" type="button" data-edit-official="${e.id}">Editar</button>
                </div>
            </article>
        `;
    }).join("");

    $$('[data-edit-official]', root).forEach((b) => {
        b.addEventListener("click", () => abrirRegistroManual(estadisticasOficiales.find((x) => x.id === b.dataset.editOfficial)));
    });
}

function getSolicitud(id) {
    return solicitudes.find((x) => x.id === id);
}

async function abrirRevision(s) {
    if (!s) return;
    const j = getJugador(s.jugador_id);
    const p = getPartido(s.partido_id);
    $("review-title").textContent = `${nombreJugador(j)} · ${p ? `vs ${p.rival_nombre}` : "Partido"}`;
    $("review-request-id").value = s.id;
    $("review-minutes").value = s.minutos;
    $("review-goals").value = s.goles;
    $("review-assists").value = s.asistencias;
    $("review-yellows").value = s.amarillas;
    $("review-reds").value = s.rojas;
    $("review-position").value = s.posicion || "";
    $("review-goals-against").value = s.goles_recibidos;
    $("review-penalties-saved").value = s.penales_atajados;
    $("review-starter").checked = s.titular;
    $("review-mvp").checked = false;
    $("review-clean-sheet").checked = s.valla_invicta;
    $("review-comparison").innerHTML = `<div class="empty-state">Cargando comparación con Match Center...</div>`;
    setFormMessage($("review-message"));
    $("review-modal").hidden = false;
    await cargarComparacionRevision(s.id);
}

async function cargarComparacionRevision(solicitudId) {
    const root = $("review-comparison");
    const { data, error } = await supabase.rpc("obtener_control_estadistica_solicitud_admin", {
        p_solicitud_id: solicitudId
    });

    if (error) {
        root.innerHTML = `<div class="comparison-error">No se pudo consultar el Match Center: ${esc(error.message)}</div>`;
        return;
    }

    const declarado = data?.declarado || {};
    const match = data?.match_center || {};
    const items = [
        ["Goles", Number(declarado.goles || 0), Number(match.goles || 0)],
        ["Asistencias", Number(declarado.asistencias || 0), Number(match.asistencias || 0)],
        ["Amarillas", Number(declarado.amarillas || 0), Number(match.amarillas || 0)],
        ["Rojas", Number(declarado.rojas || 0), Number(match.rojas || 0)]
    ];

    root.innerHTML = items.map(([label, decl, oficial]) => {
        const coincide = decl === oficial;
        return `
            <article class="comparison-item ${coincide ? "comparison-ok" : "comparison-warning"}">
                <span>${label}</span>
                <div class="comparison-values">
                    <div><small>Jugador</small><strong>${decl}</strong></div>
                    <div class="comparison-arrow">${coincide ? "✓" : "≠"}</div>
                    <div><small>Match Center</small><strong>${oficial}</strong></div>
                </div>
                <small class="comparison-status">${coincide ? "Coincide" : "Revisar antes de aprobar"}</small>
            </article>
        `;
    }).join("");
}

$("review-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    setFormMessage($("review-message"), "Aprobando...");
    const { error } = await supabase.rpc("revisar_estadistica_jugador_admin", {
        p_solicitud_id: $("review-request-id").value,
        p_accion: "APROBAR",
        p_titular: $("review-starter").checked,
        p_minutos: Number($("review-minutes").value || 0),
        p_goles: Number($("review-goals").value || 0),
        p_asistencias: Number($("review-assists").value || 0),
        p_amarillas: Number($("review-yellows").value || 0),
        p_rojas: Number($("review-reds").value || 0),
        p_mvp: $("review-mvp").checked,
        p_posicion: $("review-position").value.trim() || null,
        p_goles_recibidos: Number($("review-goals-against").value || 0),
        p_penales_atajados: Number($("review-penalties-saved").value || 0),
        p_valla_invicta: $("review-clean-sheet").checked,
        p_motivo_rechazo: null
    });
    if (error) {
        setFormMessage($("review-message"), error.message, "error");
        return;
    }

    await Promise.all([cargarSolicitudes(), cargarEstadisticasOficiales()]);
    renderModuloEstadisticas();
    renderInicio();
    renderControlCierrePartido();
    renderCierreV4();
    setFormMessage($("review-message"), "Estadística aprobada y oficializada.", "success");
    statsTabActual = "oficiales";
    setTimeout(() => {
        $("review-modal").hidden = true;
        renderModuloEstadisticas();
    }, 500);
});

$("btn-reject-request").addEventListener("click", async () => {
    const motivo = prompt("Motivo del rechazo (opcional):") ?? null;
    if (motivo === null) return;
    setFormMessage($("review-message"), "Rechazando...");
    const { error } = await supabase.rpc("revisar_estadistica_jugador_admin", {
        p_solicitud_id: $("review-request-id").value,
        p_accion: "RECHAZAR",
        p_motivo_rechazo: motivo || null
    });
    if (error) {
        setFormMessage($("review-message"), error.message, "error");
        return;
    }
    await cargarSolicitudes();
    renderModuloEstadisticas();
    renderInicio();
    $("review-modal").hidden = true;
    showMessage("Solicitud rechazada.", "success");
});

/* ===================================================
   REGISTRO MANUAL DE ESTADÍSTICAS
=================================================== */

function poblarRegistroManual() {
    const partidosOrdenados = [...partidos].sort((a, b) => {
        const compA = getCompeticion(a.competicion_id)?.nombre || "";
        const compB = getCompeticion(b.competicion_id)?.nombre || "";
        if (compA !== compB) return compA.localeCompare(compB, "es");
        return Number(a.jornada || 999) - Number(b.jornada || 999);
    });

    $("manual-stat-match").innerHTML = partidosOrdenados.map((p) => {
        const c = getCompeticion(p.competicion_id);
        const jornada = p.jornada ? ` · Fecha ${p.jornada}` : "";
        return `<option value="${p.id}">${esc(c?.nombre || "Sin competición")}${jornada} · vs ${esc(p.rival_nombre)} · ${esc(labelEstado(p.estado))}</option>`;
    }).join("");

    // Los partidos históricos pueden incluir jugadores ahora inactivos.
    $("manual-stat-player").innerHTML = jugadores.map((j) => `<option value="${j.id}">${esc(nombreJugador(j))}${String(j.estado).toUpperCase() === "INACTIVO" ? " (inactivo)" : ""}</option>`).join("");
}

function limpiarRegistroManual() {
    $("manual-stat-played").checked = true;
    $("manual-stat-starter").checked = false;
    $("manual-stat-mvp").checked = false;
    $("manual-stat-clean-sheet").checked = false;
    $("manual-stat-minutes").value = 0;
    $("manual-stat-goals").value = 0;
    $("manual-stat-assists").value = 0;
    $("manual-stat-yellows").value = 0;
    $("manual-stat-reds").value = 0;
    $("manual-stat-position").value = "";
    $("manual-stat-goals-against").value = 0;
    $("manual-stat-penalties-saved").value = 0;
    setFormMessage($("manual-stat-message"));
    actualizarCamposJugadorManual();
}

function abrirRegistroManual(registro = null) {
    poblarRegistroManual();
    limpiarRegistroManual();

    if (registro) {
        $("manual-stat-title").textContent = "Editar estadística oficial";
        $("manual-stat-match").value = registro.partido_id;
        $("manual-stat-player").value = registro.jugador_id;
        $("manual-stat-match").disabled = true;
        $("manual-stat-player").disabled = true;
        $("manual-stat-played").checked = Boolean(registro.jugo);
        $("manual-stat-starter").checked = Boolean(registro.titular);
        $("manual-stat-mvp").checked = Boolean(registro.mvp);
        $("manual-stat-clean-sheet").checked = Boolean(registro.valla_invicta);
        $("manual-stat-minutes").value = registro.minutos || 0;
        $("manual-stat-goals").value = registro.goles || 0;
        $("manual-stat-assists").value = registro.asistencias || 0;
        $("manual-stat-yellows").value = registro.amarillas || 0;
        $("manual-stat-reds").value = registro.rojas || 0;
        $("manual-stat-position").value = registro.posicion || "";
        $("manual-stat-goals-against").value = registro.goles_recibidos || 0;
        $("manual-stat-penalties-saved").value = registro.penales_atajados || 0;
    } else {
        $("manual-stat-title").textContent = "Registrar estadísticas manualmente";
        $("manual-stat-match").disabled = false;
        $("manual-stat-player").disabled = false;
    }

    actualizarCamposJugadorManual();
    $("manual-stat-modal").hidden = false;
}

function actualizarCamposJugadorManual() {
    const jugo = $("manual-stat-played").checked;
    [
        "manual-stat-starter", "manual-stat-mvp", "manual-stat-clean-sheet",
        "manual-stat-minutes", "manual-stat-goals", "manual-stat-assists",
        "manual-stat-yellows", "manual-stat-reds", "manual-stat-position",
        "manual-stat-goals-against", "manual-stat-penalties-saved"
    ].forEach((id) => { $(id).disabled = !jugo; });

    if (!jugo) {
        $("manual-stat-starter").checked = false;
        $("manual-stat-mvp").checked = false;
        $("manual-stat-clean-sheet").checked = false;
        $("manual-stat-minutes").value = 0;
        $("manual-stat-goals").value = 0;
        $("manual-stat-assists").value = 0;
        $("manual-stat-yellows").value = 0;
        $("manual-stat-reds").value = 0;
        $("manual-stat-position").value = "";
        $("manual-stat-goals-against").value = 0;
        $("manual-stat-penalties-saved").value = 0;
    }
}

$("btn-manual-stat").addEventListener("click", () => abrirRegistroManual());
$("manual-stat-played").addEventListener("change", actualizarCamposJugadorManual);

$("manual-stat-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const partidoId = $("manual-stat-match").value;
    const jugadorId = $("manual-stat-player").value;

    const pendienteMismoPartido = solicitudes.find((s) =>
        s.estado === "PENDIENTE" && s.partido_id === partidoId && s.jugador_id === jugadorId
    );

    if (pendienteMismoPartido && !confirm("Este jugador ya tiene una solicitud pendiente para este partido. ¿Quieres registrar/editar la estadística oficial directamente de todas formas?")) {
        return;
    }

    setFormMessage($("manual-stat-message"), "Guardando estadística oficial...");
    const { error } = await supabase.rpc("registrar_estadistica_jugador_admin", {
        p_partido_id: partidoId,
        p_jugador_id: jugadorId,
        p_jugo: $("manual-stat-played").checked,
        p_titular: $("manual-stat-starter").checked,
        p_minutos: Number($("manual-stat-minutes").value || 0),
        p_goles: Number($("manual-stat-goals").value || 0),
        p_asistencias: Number($("manual-stat-assists").value || 0),
        p_amarillas: Number($("manual-stat-yellows").value || 0),
        p_rojas: Number($("manual-stat-reds").value || 0),
        p_mvp: $("manual-stat-mvp").checked,
        p_posicion: $("manual-stat-position").value.trim() || null,
        p_goles_recibidos: Number($("manual-stat-goals-against").value || 0),
        p_penales_atajados: Number($("manual-stat-penalties-saved").value || 0),
        p_valla_invicta: $("manual-stat-clean-sheet").checked
    });

    if (error) {
        setFormMessage($("manual-stat-message"), error.message, "error");
        return;
    }

    await cargarEstadisticasOficiales();
    statsTabActual = "oficiales";
    renderModuloEstadisticas();
    renderControlCierrePartido();
    renderCierreV4();
    setFormMessage($("manual-stat-message"), "Estadística oficial guardada correctamente.", "success");
    setTimeout(() => {
        $("manual-stat-modal").hidden = true;
        showMessage("Estadística oficial actualizada.", "success");
    }, 450);
});

/* ===================================================
   JUGADORES
=================================================== */

function renderJugadores() {
    const activos = jugadores.filter((j) => String(j.estado).toUpperCase() !== "INACTIVO");

    $("players-grid").innerHTML = activos.map((j) => {
        const resumen = resumenJugador(j.id);
        const portal = Boolean(j.user_id);

        return `
            <article class="player-card">
                <span class="player-number">${j.dorsal ? `#${j.dorsal}` : "—"}</span>

                <div class="player-avatar">
                    <img src="${esc(fotoJugadorUrl(j))}" alt="${esc(nombreJugador(j))}">
                </div>

                <h3>${esc(nombreJugador(j))}</h3>

                <p>
                    ${esc(j.posicion || "Posición por definir")}
                    ${j.pierna_habil ? ` · ${esc(j.pierna_habil)}` : ""}
                </p>

                <div class="player-meta-line">
                    <span class="player-meta-chip ${portal ? "portal" : "no-portal"}">
                        ${portal ? "Portal vinculado" : "Sin portal"}
                    </span>

                    ${j.posicion_secundaria ? `
                        <span class="player-meta-chip">
                            ${esc(j.posicion_secundaria)}
                        </span>
                    ` : ""}
                </div>

                <div class="player-season-summary">
                    <div><strong>${resumen.pj}</strong><span>PJ</span></div>
                    <div><strong>${resumen.goles}</strong><span>G</span></div>
                    <div><strong>${resumen.asistencias}</strong><span>A</span></div>
                </div>

                <div class="player-card-actions">
                    <button
                        class="btn btn-secondary"
                        type="button"
                        data-edit-player="${j.id}"
                    >
                        Editar ficha
                    </button>
                </div>
            </article>
        `;
    }).join("");

    $$("[data-edit-player]", $("players-grid"))
        .forEach((btn) => {
            btn.addEventListener(
                "click",
                () => abrirFichaJugador(btn.dataset.editPlayer)
            );
        });
}

function setSelectValueIfExists(select, value) {
    const normalized = String(value || "").toUpperCase();
    const option = [...select.options]
        .find((o) => String(o.value).toUpperCase() === normalized);

    select.value = option ? option.value : "";
}

function renderResumenFichaAdmin(jugadorId) {
    const s = resumenJugador(jugadorId);

    $("player-profile-stats-preview").innerHTML = `
        <div><strong>${s.pj}</strong><span>PJ</span></div>
        <div><strong>${s.minutos}</strong><span>MIN</span></div>
        <div><strong>${s.goles}</strong><span>GOLES</span></div>
        <div><strong>${s.asistencias}</strong><span>ASIST.</span></div>
        <div><strong>${s.mvp}</strong><span>MVP</span></div>
    `;
}

function abrirFichaJugador(jugadorId) {
    const j = getJugador(jugadorId);

    if (!j) {
        showMessage("No se pudo encontrar al jugador.", "error");
        return;
    }

    $("player-profile-id").value = j.id;
    $("player-profile-title").textContent = nombreJugador(j);
    $("player-profile-preview-name").textContent = nombreJugador(j);
    $("player-profile-preview-meta").textContent =
        `${j.dorsal ? `#${j.dorsal} · ` : ""}${j.posicion || "Posición por definir"} · Rayckington FC`;

    $("player-profile-photo-preview").src = fotoJugadorUrl(j);

    $("player-profile-sport-name").value = j.nombre_deportivo || "";
    $("player-profile-number").value = j.dorsal ?? "";

    setSelectValueIfExists($("player-profile-position"), j.posicion);
    setSelectValueIfExists($("player-profile-position-2"), j.posicion_secundaria);

    $("player-profile-foot").value = j.pierna_habil || "";
    $("player-profile-entry").value = j.fecha_ingreso || "";
    $("player-profile-photo-input").value = "";

    setFormMessage($("player-profile-message"), "");
    renderResumenFichaAdmin(j.id);

    $("player-profile-modal").hidden = false;
}

$("player-profile-photo-input")?.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setFormMessage(
            $("player-profile-message"),
            "La foto debe ser JPG, PNG o WEBP.",
            "error"
        );
        event.target.value = "";
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        setFormMessage(
            $("player-profile-message"),
            "La foto supera los 5 MB.",
            "error"
        );
        event.target.value = "";
        return;
    }

    const localUrl = URL.createObjectURL(file);
    $("player-profile-photo-preview").src = localUrl;
});

$("player-profile-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const msg = $("player-profile-message");
    const jugadorId = $("player-profile-id").value;
    const j = getJugador(jugadorId);

    if (!j) {
        setFormMessage(msg, "No se encontró el jugador.", "error");
        return;
    }

    setFormMessage(msg, "Guardando ficha...");

    let fotoPath = null;
    const foto = $("player-profile-photo-input").files?.[0];

    if (foto) {
        const ext = foto.name.split(".").pop()?.toLowerCase() || "jpg";
        fotoPath = `admin/${jugadorId}/perfil.${ext}`;

        const { error: uploadError } = await supabase.storage
            .from("fotos-jugadores")
            .upload(
                fotoPath,
                foto,
                {
                    upsert: true,
                    contentType: foto.type
                }
            );

        if (uploadError) {
            console.error(uploadError);
            setFormMessage(
                msg,
                "No se pudo subir la foto.",
                "error"
            );
            return;
        }
    }

    const dorsalValue = $("player-profile-number").value.trim();

    const { error } = await supabase.rpc(
        "actualizar_perfil_deportivo_jugador_admin",
        {
            p_jugador_id: jugadorId,
            p_nombre_deportivo:
                $("player-profile-sport-name").value.trim() || null,
            p_dorsal:
                dorsalValue ? Number(dorsalValue) : null,
            p_posicion:
                $("player-profile-position").value || null,
            p_posicion_secundaria:
                $("player-profile-position-2").value || null,
            p_pierna_habil:
                $("player-profile-foot").value || null,
            p_fecha_ingreso:
                $("player-profile-entry").value || null,
            p_foto_path:
                fotoPath
        }
    );

    if (error) {
        console.error(error);
        setFormMessage(
            msg,
            error.message || "No se pudo guardar la ficha.",
            "error"
        );
        return;
    }

    await cargarJugadores();
    renderJugadores();
    poblarJugadoresEvento();

    setFormMessage(
        msg,
        "Ficha deportiva guardada correctamente.",
        "success"
    );

    setTimeout(() => {
        $("player-profile-modal").hidden = true;
        showMessage("Ficha deportiva actualizada.", "success");
    }, 450);
});


/* ===================================================
   MODALES
=================================================== */

$$('[data-close-modal]').forEach((b) => b.addEventListener("click", () => $(b.dataset.closeModal).hidden = true));
$$(".modal").forEach((m) => m.addEventListener("click", (e) => { if (e.target === m) m.hidden = true; }));

/* ===================================================
   INIT
=================================================== */

supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") limpiarRealtime();
});

(async function init() {
    const { data } = await supabase.auth.getSession();
    if (data?.session) await cargarAplicacion();
    else {
        panelAdmin.hidden = true;
        loginAdmin.style.display = "grid";
    }
})();
