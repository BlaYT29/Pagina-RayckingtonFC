/* ===================================================
   RAYCKINGTON FC
   PARTIDOS.JS
=================================================== */

"use strict";

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL_PARTIDOS = "https://auutiadcyhhwxzkeernd.supabase.co";
const SUPABASE_KEY_PARTIDOS = "sb_publishable_luWCBHYOSUsFbmgPU4GoiQ_9nmBMRHe";
const supabasePartidos = createClient(SUPABASE_URL_PARTIDOS, SUPABASE_KEY_PARTIDOS);


/* ===================================================
   CONFIGURACIÓN GENERAL
=================================================== */

const RUTA_BASE = "assets/data/temporadas";
const CLUB_DESTACADO = "Rayckington FC";

const LOGOS_EQUIPOS_PARTIDOS = {
    "rayckington fc": "assets/img/logo/logo.png",
    "real santa rosa": "assets/img/logo/rivales/logospequeños/rsr-115x128.png",
    "el metodo": "assets/img/logo/rivales/logospequeños/el-metodo-115x128.png",
    "atletico independiente": "assets/img/logo/rivales/logospequeños/atl-independiente-128x126.png",
    "atletico tobalaba": "assets/img/logo/rivales/logospequeños/atletico-tobalaba-128x126.png",
    "huachalomo": "assets/img/logo/rivales/logospequeños/huachalomofc-128x128.png",
    "huachalomo f.c": "assets/img/logo/rivales/logospequeños/huachalomofc-128x128.png",
    "huachalomo fc": "assets/img/logo/rivales/logospequeños/huachalomofc-128x128.png",
    "la plaza": "assets/img/logo/rivales/logospequeños/plaza-115x128.png",
    "la plaza united": "assets/img/logo/rivales/logospequeños/plaza-115x128.png",
    "atletico": "assets/img/logo/rivales/logospequeños/atletico-fc-1-128x126.png",
    "atletico f.c": "assets/img/logo/rivales/logospequeños/atletico-fc-1-128x126.png",
    "atletico fc": "assets/img/logo/rivales/logospequeños/atletico-fc-1-128x126.png",
    "unab medicina": "assets/img/logo/rivales/logospequeños/unab-medicina.png",
    "universidad andres bello - medicina": "assets/img/logo/rivales/logospequeños/unab-medicina.png",
    "atletico valle central": "assets/img/logo/rivales/logospequeños/atletico-valle-central.png",
    "valle central": "assets/img/logo/rivales/logospequeños/atletico-valle-central.png"
};

/* ===================================================
   ELEMENTOS DEL DOM
=================================================== */

const selectorTemporada = document.getElementById("selector-temporada");
const estadoCarga = document.getElementById("estado-carga");
const contenidoPartidos = document.getElementById("contenido-partidos");
const estadoTemporada = document.getElementById("estado-temporada");

let competicionesSupabasePartidos = [];
let modoSupabasePartidos = false;
let competicionActualPartidos = null;
let competicionActualTipoPartidos = "";
let libresPorFechaPartidos = {};
let intervaloRecargaPartidos = null;
let intervaloRelojesPartidos = null;

/* ===================================================
   INICIO
=================================================== */

document.addEventListener(
    "DOMContentLoaded",
    iniciarSistemaPartidos
);


async function iniciarSistemaPartidos() {

    if (!selectorTemporada) {

        console.error(
            "No se encontró el selector de temporada."
        );

        return;
    }

    selectorTemporada.addEventListener(
        "change",
        () => {
            cargarTemporada(
                selectorTemporada.value
            );
        }
    );

    const supabaseDisponible =
        await prepararSelectorSupabasePartidos();

    if (supabaseDisponible) {

        const ligaActiva =
            competicionesSupabasePartidos.find(
                item =>
                    String(item.tipo || "").toUpperCase() === "LIGA" &&
                    String(item.estado || "").toUpperCase() === "ACTIVA"
            );

        const predeterminada =
            ligaActiva ||
            competicionesSupabasePartidos[0];

        selectorTemporada.value =
            `sb:${predeterminada.id}`;

        await cargarTemporada(
            selectorTemporada.value
        );

    } else {

        selectorTemporada.value =
            "2026/clausura";

        await cargarTemporada(
            selectorTemporada.value
        );

        // Respaldo de 2026/Clausura: solamente contiene fechas 1 y 2.
        // Avisar si la conexión a Supabase falló, especialmente en celulares.
        if (estadoTemporada && !document.getElementById("aviso-fixture-respaldo")) {
            const aviso = document.createElement("div");
            aviso.id = "aviso-fixture-respaldo";
            aviso.className = "alert alert-warning mt-3 text-start";
            aviso.setAttribute("role", "status");
            aviso.innerHTML = `<strong>Calendario no actualizado:</strong> no se pudo conectar con Supabase. Se muestra una copia local que solo llega hasta la fecha 2. `;
            const reintentar = document.createElement("button");
            reintentar.type = "button";
            reintentar.className = "btn btn-sm btn-dark ms-2 mt-1";
            reintentar.textContent = "Reintentar conexión";
            reintentar.addEventListener("click", () => window.location.reload());
            aviso.appendChild(reintentar);
            estadoTemporada.insertAdjacentElement("afterend", aviso);
        }
    }

    iniciarRelojesPartidos();
}


/* ===================================================
   SUPABASE · COMPETICIONES PÚBLICAS / PREVISUALIZACIÓN ADMIN
=================================================== */

async function prepararSelectorSupabasePartidos() {

    try {

        const {
            data,
            error
        } = await supabasePartidos.rpc(
            "obtener_competiciones_web"
        );

        if (error) {
            throw error;
        }

        competicionesSupabasePartidos =
            Array.isArray(data)
                ? data
                : [];

        if (
            competicionesSupabasePartidos.length === 0
        ) {
            return false;
        }

        const opciones = [];

        competicionesSupabasePartidos.forEach(
            competicion => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    `sb:${competicion.id}`;

                option.textContent =
                    competicion.nombre;

                opciones.push(
                    option
                );
            }
        );

        const tieneApertura =
            competicionesSupabasePartidos.some(
                item =>
                    String(
                        item.nombre || ""
                    )
                        .toLowerCase()
                        .includes(
                            "apertura"
                        )
            );

        if (!tieneApertura) {

            const optionApertura =
                document.createElement(
                    "option"
                );

            optionApertura.value =
                "2026/apertura";

            optionApertura.textContent =
                "Apertura 2026 · histórico";

            opciones.push(
                optionApertura
            );
        }

        selectorTemporada.innerHTML =
            "";

        opciones.forEach(
            option =>
                selectorTemporada.appendChild(
                    option
                )
        );

        return true;

    } catch (error) {

        console.warn(
            "Supabase deportivo no disponible en Partidos. Se mantienen los JSON:",
            error
        );

        return false;
    }

}


async function cargarCompeticionSupabasePartidos(
    competicionId,
    silencioso = false
) {

    if (!silencioso) {
        mostrarCarga();
    }

    try {

        const competicion =
            competicionesSupabasePartidos.find(
                item =>
                    item.id ===
                    competicionId
            );

        if (!competicion) {

            throw new Error(
                "No se encontró la competición seleccionada."
            );
        }

        competicionActualPartidos =
            competicion;

        competicionActualTipoPartidos =
            String(
                competicion.tipo || ""
            ).toUpperCase();

        const {
            data: partidosClub,
            error: errorPartidosClub
        } = await supabasePartidos.rpc(
            "obtener_partidos_rayckington_web"
        );

        if (errorPartidosClub) {
            throw errorPartidosClub;
        }

        const partidosRayckington =
            (
                Array.isArray(partidosClub)
                    ? partidosClub
                    : []
            )
                .filter(
                    partido =>
                        partido.competicion_id ===
                        competicionId
                );

        let fixture = [];
        let tabla = [];
        libresPorFechaPartidos = {};

        if (
            competicionActualTipoPartidos ===
            "LIGA"
        ) {

            const [
                fixtureRespuesta,
                tablaRespuesta,
                libresRespuesta
            ] = await Promise.all([

                supabasePartidos.rpc(
                    "obtener_fixture_competicion_web",
                    {
                        p_competicion_id:
                            competicionId
                    }
                ),

                supabasePartidos.rpc(
                    "obtener_tabla_competicion",
                    {
                        p_competicion_id:
                            competicionId
                    }
                ),

                supabasePartidos.rpc(
                    "obtener_jornadas_libres_web",
                    {
                        p_competicion_id:
                            competicionId
                    }
                )

            ]);

            if (fixtureRespuesta.error) {
                throw fixtureRespuesta.error;
            }

            if (tablaRespuesta.error) {
                throw tablaRespuesta.error;
            }

            if (libresRespuesta.error) {
                throw libresRespuesta.error;
            }

            fixture =
                (
                    Array.isArray(
                        fixtureRespuesta.data
                    )
                        ? fixtureRespuesta.data
                        : []
                )
                    .map(
                        normalizarFixtureSupabasePartidos
                    );

            // Rayckington Live: añadir al calendario un partido oficial del club
            // cuando aún no exista su fila correspondiente en el fixture de liga.
            // Conservar el fixture completo; nunca reemplazarlo por los partidos del club.
            fixture = incorporarPartidosClubFaltantesFixture(
                fixture,
                partidosRayckington
            );

            tabla =
                (
                    Array.isArray(
                        tablaRespuesta.data
                    )
                        ? tablaRespuesta.data
                        : []
                )
                    .map(
                        fila => ({
                            pos:
                                fila.posicion,

                            club:
                                fila.equipo,

                            pj:
                                fila.pj,

                            v:
                                fila.pg,

                            e:
                                fila.pe,

                            d:
                                fila.pp,

                            gf:
                                fila.gf,

                            gc:
                                fila.gc,

                            dg:
                                fila.dg,

                            pts:
                                fila.puntos
                        })
                    );

            (
                Array.isArray(
                    libresRespuesta.data
                )
                    ? libresRespuesta.data
                    : []
            ).forEach(
                item => {
                    libresPorFechaPartidos[
                        Number(item.jornada)
                    ] =
                        item.equipo;
                }
            );

        } else {

            fixture =
                partidosRayckington.map(
                    (
                        partido,
                        indice
                    ) =>
                        normalizarPartidoClubSupabasePartidos(
                            partido,
                            indice
                        )
                );
        }

        const estadisticas =
            construirEstadisticasSupabasePartidos(
                tabla,
                partidosRayckington
            );

        const config = {
            temporada:
                competicion.nombre,

            descripcion:
                competicionActualTipoPartidos === "LIGA"
                    ? "Fixture, resultados y clasificación oficial."
                    : "Partidos y resultados de Rayckington FC.",

            competencia:
                competicion.nombre,

            categoria:
                competicionActualTipoPartidos === "AMISTOSO"
                    ? "Amistosos"
                    : competicionActualTipoPartidos,

            estado:
                competicion.estado,

            clubDestacado:
                CLUB_DESTACADO
        };

        renderizarConfiguracion(
            config
        );

        renderizarEstadisticas(
            estadisticas
        );

        renderizarTabla(
            tabla,
            CLUB_DESTACADO
        );

        renderizarFixture(
            fixture,
            CLUB_DESTACADO
        );

        modoSupabasePartidos = true;

        if (!silencioso) {
            ocultarCarga();
        } else if (contenidoPartidos) {
            contenidoPartidos.hidden =
                false;
        }

        iniciarRecargaPartidos();

        return true;

    } catch (error) {

        console.error(
            "Error al cargar competición desde Supabase:",
            error
        );

        if (!silencioso) {

            mostrarError(
                "No fue posible cargar la competición desde Supabase."
            );
        }

        return false;
    }

}


/* ===================================================
   COMPLETAR FIXTURE CON PARTIDOS DEL CLUB
   No duplica un partido si ya está enlazado por UUID
   o si coincide la jornada y el par de equipos.
=================================================== */

function incorporarPartidosClubFaltantesFixture(fixtureOriginal, partidosClub) {
    const fixture = Array.isArray(fixtureOriginal)
        ? fixtureOriginal.slice()
        : [];

    for (const [indice, partido] of (Array.isArray(partidosClub) ? partidosClub : []).entries()) {
        const jornada = Number(partido.jornada);
        // Sin jornada confirmada no inventamos una nueva fecha de liga.
        if (!Number.isInteger(jornada) || jornada < 1) continue;

        const nuevo = normalizarPartidoClubSupabasePartidos(partido, indice);
        const nuevoId = String(partido.id || "");
        const equiposNuevos = [normalizar(nuevo.local), normalizar(nuevo.visita)].sort();

        const yaExiste = fixture.some(existente => {
            if (nuevoId && String(existente.partidoRayckingtonId || "") === nuevoId) {
                return true;
            }
            if (Number(existente.fecha) !== jornada) return false;
            const equiposExistentes = [normalizar(existente.local), normalizar(existente.visita)].sort();
            return equiposExistentes[0] === equiposNuevos[0] &&
                   equiposExistentes[1] === equiposNuevos[1];
        });

        if (!yaExiste) fixture.push(nuevo);
    }

    return fixture;
}


function normalizarFixtureSupabasePartidos(
    partido
) {

    return {

        id:
            partido.id,

        partidoRayckingtonId:
            partido.partido_rayckington_id,

        fecha:
            Number(
                partido.jornada
            ) || 0,

        orden:
            Number(
                partido.orden_jornada
            ) || 0,

        local:
            partido.equipo_local,

        visita:
            partido.equipo_visitante,

        golesLocal:
            partido.goles_local,

        golesVisita:
            partido.goles_visitante,

        estado:
            partido.estado,

        fechaHora:
            partido.fecha_hora,

        lugar:
            partido.lugar,

        periodoPartido:
            partido.periodo_partido,

        cronometroInicioAt:
            partido.cronometro_inicio_at,

        cronometroSegundosAcumulados:
            partido.cronometro_segundos_acumulados,

        cronometroCorriendo:
            partido.cronometro_corriendo,

        resultadoRayckington:
            obtenerResultadoRayckingtonFixture(
                partido
            )
    };

}


function normalizarPartidoClubSupabasePartidos(
    partido,
    indice
) {

    const rayLocal =
        String(
            partido.condicion || ""
        ).toUpperCase() === "LOCAL";

    return {

        id:
            partido.id,

        partidoRayckingtonId:
            partido.id,

        fecha:
            Number(
                partido.jornada
            ) ||
            indice + 1,

        orden:
            indice + 1,

        local:
            rayLocal
                ? CLUB_DESTACADO
                : partido.rival_nombre,

        visita:
            rayLocal
                ? partido.rival_nombre
                : CLUB_DESTACADO,

        golesLocal:
            rayLocal
                ? partido.goles_rayckington
                : partido.goles_rival,

        golesVisita:
            rayLocal
                ? partido.goles_rival
                : partido.goles_rayckington,

        estado:
            partido.estado,

        fechaHora:
            partido.fecha_hora,

        lugar:
            partido.lugar,

        periodoPartido:
            partido.periodo_partido,

        cronometroInicioAt:
            partido.cronometro_inicio_at,

        cronometroSegundosAcumulados:
            partido.cronometro_segundos_acumulados,

        cronometroCorriendo:
            partido.cronometro_corriendo,

        resultadoRayckington:
            obtenerResultadoRayckingtonSimple(
                partido
            )
    };

}


function obtenerResultadoRayckingtonFixture(
    partido
) {

    if (
        String(
            partido.estado || ""
        ).toUpperCase() !== "FINALIZADO"
    ) {
        return "";
    }

    const local =
        normalizar(
            partido.equipo_local
        );

    const visita =
        normalizar(
            partido.equipo_visitante
        );

    const rayEsLocal =
        local ===
        normalizar(
            CLUB_DESTACADO
        );

    const rayEsVisita =
        visita ===
        normalizar(
            CLUB_DESTACADO
        );

    if (
        !rayEsLocal &&
        !rayEsVisita
    ) {
        return "";
    }

    const gf =
        rayEsLocal
            ? Number(
                partido.goles_local
            )
            : Number(
                partido.goles_visitante
            );

    const gc =
        rayEsLocal
            ? Number(
                partido.goles_visitante
            )
            : Number(
                partido.goles_local
            );

    if (
        !Number.isFinite(gf) ||
        !Number.isFinite(gc)
    ) {
        return "";
    }

    if (gf > gc) {
        return "Victoria";
    }

    if (gf < gc) {
        return "Derrota";
    }

    return "Empate";

}


function obtenerResultadoRayckingtonSimple(
    partido
) {

    if (
        String(
            partido.estado || ""
        ).toUpperCase() !== "FINALIZADO"
    ) {
        return "";
    }

    const gf =
        Number(
            partido.goles_rayckington
        );

    const gc =
        Number(
            partido.goles_rival
        );

    if (
        !Number.isFinite(gf) ||
        !Number.isFinite(gc)
    ) {
        return "";
    }

    if (gf > gc) {
        return "Victoria";
    }

    if (gf < gc) {
        return "Derrota";
    }

    return "Empate";

}


function construirEstadisticasSupabasePartidos(
    tabla,
    partidosRayckington
) {

    if (
        competicionActualTipoPartidos ===
        "LIGA"
    ) {

        const fila =
            tabla.find(
                item =>
                    normalizar(
                        item.club
                    ) ===
                    normalizar(
                        CLUB_DESTACADO
                    )
            );

        if (fila) {

            return {
                posicion:
                    fila.pos,

                pj:
                    fila.pj,

                pg:
                    fila.v,

                pe:
                    fila.e,

                pp:
                    fila.d,

                gf:
                    fila.gf,

                gc:
                    fila.gc,

                dg:
                    fila.dg,

                pts:
                    fila.pts
            };
        }
    }

    const finalizados =
        partidosRayckington.filter(
            partido =>
                String(
                    partido.estado || ""
                ).toUpperCase() ===
                "FINALIZADO"
        );

    let pg = 0;
    let pe = 0;
    let pp = 0;
    let gf = 0;
    let gc = 0;

    finalizados.forEach(
        partido => {

            const golesFavor =
                Number(
                    partido.goles_rayckington
                ) || 0;

            const golesContra =
                Number(
                    partido.goles_rival
                ) || 0;

            gf +=
                golesFavor;

            gc +=
                golesContra;

            if (
                golesFavor >
                golesContra
            ) {
                pg++;
            } else if (
                golesFavor <
                golesContra
            ) {
                pp++;
            } else {
                pe++;
            }
        }
    );

    const programados =
        partidosRayckington.filter(
            partido => {
                const estado = String(
                    partido.estado || ""
                ).toUpperCase();

                return estado === "PROGRAMADO" ||
                    estado === "EN_VIVO" ||
                    estado === "ENTRETIEMPO";
            }
        ).length;

    return {
        posicion: 0,
        pj: finalizados.length,
        pg,
        pe,
        pp,
        gf,
        gc,
        dg: gf - gc,
        pts: 0,
        programados
    };

}


function iniciarRecargaPartidos() {

    detenerRecargaPartidos();

    intervaloRecargaPartidos =
        window.setInterval(
            async () => {

                if (
                    !modoSupabasePartidos ||
                    !competicionActualPartidos
                ) {
                    return;
                }

                await cargarCompeticionSupabasePartidos(
                    competicionActualPartidos.id,
                    true
                );

            },
            10000
        );

}


function detenerRecargaPartidos() {

    if (
        intervaloRecargaPartidos
    ) {

        clearInterval(
            intervaloRecargaPartidos
        );

        intervaloRecargaPartidos =
            null;
    }

}


function iniciarRelojesPartidos() {

    if (
        intervaloRelojesPartidos
    ) {

        clearInterval(
            intervaloRelojesPartidos
        );
    }

    intervaloRelojesPartidos =
        window.setInterval(
            actualizarRelojesFixturePartidos,
            1000
        );

}


function actualizarRelojesFixturePartidos() {

    document
        .querySelectorAll(
            ".fixture-live-clock"
        )
        .forEach(
            elemento => {

                const inicio =
                    elemento.dataset.inicio ||
                    "";

                const acumulados =
                    Number(
                        elemento.dataset.acumulados ||
                        0
                    );

                const corriendo =
                    elemento.dataset.corriendo ===
                    "true";

                const periodo =
                    elemento.dataset.periodo ||
                    "";

                let segundos =
                    Number.isFinite(
                        acumulados
                    )
                        ? acumulados
                        : 0;

                if (
                    corriendo &&
                    inicio
                ) {

                    const inicioMs =
                        new Date(
                            inicio
                        ).getTime();

                    if (
                        !Number.isNaN(
                            inicioMs
                        )
                    ) {

                        segundos +=
                            Math.max(
                                0,
                                Math.floor(
                                    (
                                        Date.now() -
                                        inicioMs
                                    ) / 1000
                                )
                            );
                    }
                }

                const minutos =
                    Math.floor(
                        segundos / 60
                    );

                const resto =
                    segundos % 60;

                elemento.textContent =
                    `${etiquetaPeriodoFixture(
                        periodo
                    )} · ` +
                    `${String(minutos).padStart(2, "0")}:` +
                    `${String(resto).padStart(2, "0")}`;
            }
        );

}


function etiquetaPeriodoFixture(
    periodo
) {

    const etiquetas = {
        PRIMER_TIEMPO:
            "1T",

        ENTRETIEMPO:
            "ET",

        SEGUNDO_TIEMPO:
            "2T"
    };

    return (
        etiquetas[
            String(
                periodo || ""
            ).toUpperCase()
        ] ||
        "EN VIVO"
    );

}



/* ===================================================
   CARGAR TEMPORADA
=================================================== */

async function cargarTemporada(rutaTemporada) {

    if (
        String(
            rutaTemporada || ""
        ).startsWith(
            "sb:"
        )
    ) {

        const competicionId =
            String(
                rutaTemporada
            ).slice(
                3
            );

        return cargarCompeticionSupabasePartidos(
            competicionId
        );
    }

    modoSupabasePartidos = false;
    competicionActualPartidos = null;
    competicionActualTipoPartidos =
        String(rutaTemporada || "").toLowerCase().includes("amistoso")
            ? "AMISTOSO"
            : "LIGA";
    libresPorFechaPartidos = {};

    detenerRecargaPartidos();

    mostrarCarga();

    try {

        const ruta = `${RUTA_BASE}/${rutaTemporada}`;

        const [
            config,
            tabla,
            fixture,
            estadisticas,
            goleadores,
            mvp,
            tarjetas
        ] = await Promise.all([

            cargarJson(`${ruta}/config.json`),

            cargarJson(`${ruta}/tabla.json`),

            cargarJson(`${ruta}/fixture.json`),

            cargarJson(`${ruta}/estadisticas.json`),

            cargarJson(`${ruta}/goleadores.json`),

            cargarJson(`${ruta}/mvp.json`),

            cargarJson(`${ruta}/tarjetas.json`)

        ]);

const tablaNormalizada = normalizarTabla(tabla);

const fixtureNormalizado = normalizarFixture(fixture);

const estadisticasNormalizadas =
    normalizarEstadisticas(estadisticas);

renderizarConfiguracion(config);

renderizarEstadisticas(
    estadisticasNormalizadas
);

renderizarTabla(
    tablaNormalizada,
    config.clubDestacado || CLUB_DESTACADO
);

renderizarFixture(
    fixtureNormalizado,
    config.clubDestacado || CLUB_DESTACADO
);

        console.info("Goleadores:", goleadores);

        console.info("MVP:", mvp);

        console.info("Tarjetas:", tarjetas);

        ocultarCarga();

    } catch (error) {

        console.error(error);

        mostrarError(
            "No se pudieron cargar los archivos JSON. " +
            "Abre el proyecto con Live Server y revisa las rutas."
        );

    }

}

/* ===================================================
   CARGAR JSON
=================================================== */

async function cargarJson(url) {

    const respuesta = await fetch(url, {

        cache: "no-store"

    });

    if (!respuesta.ok) {

        throw new Error(
            `Error ${respuesta.status} al cargar ${url}`
        );

    }

    return respuesta.json();

}
/* ===================================================
   RENDERIZAR CONFIGURACIÓN
=================================================== */

function renderizarConfiguracion(config) {

    colocarTexto(
        "hero-temporada",
        config.temporada || "Temporada"
    );

    colocarTexto(
        "hero-descripcion",
        config.descripcion ||
        "Información oficial del torneo."
    );

    colocarTexto(
        "titulo-resumen",
        config.temporada || "Temporada"
    );

    colocarTexto(
        "texto-resumen",
        `${config.competencia || "Competencia"} · ${config.categoria || ""}`
    );

    configurarVistaCompeticionPartidos();

    if (estadoTemporada) {
        estadoTemporada.textContent =
            `Estado: ${config.estado || "Sin información"}`;
    }

    document.title =
        `${config.temporada || "Partidos"} | Rayckington FC`;
}


function configurarVistaCompeticionPartidos() {

    const esAmistoso =
        competicionActualTipoPartidos === "AMISTOSO";

    const seccionTabla =
        document.getElementById("seccion-tabla");

    const heroPosicion =
        document.getElementById("hero-stat-posicion-card");

    const heroPuntos =
        document.getElementById("hero-stat-puntos-card");

    if (seccionTabla) {
        seccionTabla.hidden = esAmistoso;
    }

    if (heroPosicion) {
        heroPosicion.hidden = esAmistoso;
    }

    if (heroPuntos) {
        heroPuntos.hidden = esAmistoso;
    }

    colocarTexto(
        "titulo-fixture",
        esAmistoso
            ? "Partidos Amistosos"
            : "Fixture del Torneo"
    );

    colocarTexto(
        "texto-fixture",
        esAmistoso
            ? "Próximos encuentros y resultados amistosos de Rayckington FC."
            : "Cada fecha con sus partidos, estados y resultados oficiales."
    );

    colocarTexto(
        "stat-pts-label",
        esAmistoso
            ? "Programados / en vivo"
            : "Puntos"
    );

    const icono =
        document.getElementById("stat-pts-icono");

    if (icono) {
        icono.className = esAmistoso
            ? "bi bi-calendar-check-fill"
            : "bi bi-award-fill";
    }
}


/* ===================================================
   RENDERIZAR ESTADÍSTICAS
=================================================== */

function renderizarEstadisticas(datos) {

    const posicion = Number(datos.posicion) > 0
        ? `${datos.posicion}°`
        : "--";

    colocarTexto("hero-posicion", posicion);
    colocarTexto("hero-puntos", valorSeguro(datos.pts));
    colocarTexto("hero-gf", valorSeguro(datos.gf));
    colocarTexto("hero-gc", valorSeguro(datos.gc));

    colocarTexto("stat-pj", valorSeguro(datos.pj));
    colocarTexto("stat-pg", valorSeguro(datos.pg));
    colocarTexto("stat-pe", valorSeguro(datos.pe));
    colocarTexto("stat-pp", valorSeguro(datos.pp));
    colocarTexto("stat-gf", valorSeguro(datos.gf));
    colocarTexto("stat-gc", valorSeguro(datos.gc));
    colocarTexto("stat-dg", valorSeguro(datos.dg));

    colocarTexto(
        "stat-pts",
        competicionActualTipoPartidos === "AMISTOSO"
            ? valorSeguro(datos.programados)
            : valorSeguro(datos.pts)
    );
}


/* ===================================================
   RENDERIZAR TABLA
=================================================== */

function renderizarTabla(tabla, clubDestacado) {

    const cuerpo =
        document.getElementById("tabla-posiciones");

    const contenedor =
        document.getElementById("contenedor-tabla");

    const mensajeVacio =
        document.getElementById("tabla-vacia");

    if (!cuerpo || !contenedor || !mensajeVacio) {
        return;
    }

    cuerpo.innerHTML = "";

    if (competicionActualTipoPartidos === "AMISTOSO") {
        contenedor.hidden = true;
        mensajeVacio.hidden = true;
        return;
    }

    if (!Array.isArray(tabla) || tabla.length === 0) {
        contenedor.hidden = true;
        mensajeVacio.hidden = false;
        return;
    }

    contenedor.hidden = false;
    mensajeVacio.hidden = true;

    tabla
        .slice()
        .sort((a, b) => Number(a.pos) - Number(b.pos))
        .forEach((equipo) => {

            const fila = document.createElement("tr");

            if (normalizar(equipo.club) === normalizar(clubDestacado)) {
                fila.classList.add("rayckington-row");
            }

            fila.innerHTML = `
                <td>${escapar(equipo.pos)}</td>
                <td class="tabla-club-cell">
                    <div class="tabla-club-identidad">
                        ${crearEscudoEquipoPartidos(equipo.club, "tabla")}
                        <span>${escapar(equipo.club)}</span>
                    </div>
                </td>
                <td>${escapar(equipo.pj)}</td>
                <td>${escapar(equipo.v)}</td>
                <td>${escapar(equipo.e)}</td>
                <td>${escapar(equipo.d)}</td>
                <td>${escapar(equipo.gf)}</td>
                <td>${escapar(equipo.gc)}</td>
                <td>${formatearDiferencia(equipo.dg)}</td>
                <td><strong>${escapar(equipo.pts)}</strong></td>
            `;

            cuerpo.appendChild(fila);
        });
}


/* ===================================================
   RENDERIZAR FIXTURE
=================================================== */

function renderizarFixture(partidos, clubDestacado) {

    const listado =
        document.getElementById("fixture-listado");

    const mensajeVacio =
        document.getElementById("fixture-vacio");

    if (!listado || !mensajeVacio) {
        return;
    }

    listado.innerHTML = "";

    if (!Array.isArray(partidos) || partidos.length === 0) {
        listado.hidden = true;
        mensajeVacio.hidden = false;
        return;
    }

    listado.hidden = false;
    mensajeVacio.hidden = true;

    if (competicionActualTipoPartidos === "AMISTOSO") {
        renderizarAmistososPartidos(partidos, listado, clubDestacado);
        return;
    }

    renderizarLigaPartidos(partidos, listado, clubDestacado);
}


function renderizarLigaPartidos(partidos, listado, clubDestacado) {

    const partidosPorFecha = agruparPorFecha(partidos);

    Object
        .keys(partidosPorFecha)
        .map(Number)
        .sort((a, b) => a - b)
        .forEach((numeroFecha) => {

            const columna = document.createElement("div");
            columna.className = "col-12";

            const tarjeta = document.createElement("article");
            tarjeta.className = "fixture-card fixture-round-card";

            const cabecera = document.createElement("div");
            cabecera.className = "fixture-round-header";
            cabecera.innerHTML = `
                <div>
                    <span class="fixture-round-kicker">Torneo</span>
                    <h3>Fecha ${numeroFecha}</h3>
                </div>
                <span class="fixture-round-count">
                    ${partidosPorFecha[numeroFecha].length} partidos
                </span>
            `;

            tarjeta.appendChild(cabecera);

            const grilla = document.createElement("div");
            grilla.className = "fixture-round-grid";

            partidosPorFecha[numeroFecha]
                .slice()
                .sort((a, b) => Number(a.orden) - Number(b.orden))
                .forEach((partido) => {
                    grilla.appendChild(
                        crearTarjetaVisualPartido(partido, clubDestacado, "liga")
                    );
                });

            tarjeta.appendChild(grilla);

            if (libresPorFechaPartidos[numeroFecha]) {
                const libre = document.createElement("div");
                libre.className = "fixture-free-team";
                libre.innerHTML = `
                    <i class="bi bi-pause-circle"></i>
                    <span>Libre: ${escapar(libresPorFechaPartidos[numeroFecha])}</span>
                `;
                tarjeta.appendChild(libre);
            }

            columna.appendChild(tarjeta);
            listado.appendChild(columna);
        });
}


function renderizarAmistososPartidos(partidos, listado, clubDestacado) {

    const ordenados = partidos
        .slice()
        .sort(ordenarAmistososPartidos);

    ordenados.forEach((partido) => {
        const columna = document.createElement("div");
        columna.className = "col-xl-6 col-lg-6 col-12";

        columna.appendChild(
            crearTarjetaVisualPartido(partido, clubDestacado, "amistoso")
        );

        listado.appendChild(columna);
    });
}


function ordenarAmistososPartidos(a, b) {

    const prioridad = (partido) => {
        const estado = String(partido.estado || "").toUpperCase();
        if (estado === "EN_VIVO" || estado === "ENTRETIEMPO") return 0;
        if (estado === "PROGRAMADO") return 1;
        if (estado === "FINALIZADO") return 2;
        return 3;
    };

    const pa = prioridad(a);
    const pb = prioridad(b);

    if (pa !== pb) return pa - pb;

    const fa = a.fechaHora ? new Date(a.fechaHora).getTime() : 0;
    const fb = b.fechaHora ? new Date(b.fechaHora).getTime() : 0;

    if (pa === 2) return fb - fa;
    return fa - fb;
}


function crearTarjetaVisualPartido(partido, clubDestacado, modo) {

    const tarjeta = document.createElement("article");
    tarjeta.className =
        modo === "amistoso"
            ? "match-visual-card friendly-match-card"
            : "match-visual-card league-match-card";

    const participaRayckington =
        normalizar(partido.local) === normalizar(clubDestacado) ||
        normalizar(partido.visita) === normalizar(clubDestacado);

    if (participaRayckington) {
        tarjeta.classList.add("rayckington-match-visual");
    }

    const estado = String(partido.estado || "").toUpperCase();
    const marcador = obtenerMarcador(partido);
    const meta = construirMetaPartidoVisual(partido, modo);

    tarjeta.innerHTML = `
        <div class="match-visual-top">
            <span class="match-visual-type">
                ${modo === "amistoso" ? "AMISTOSO" : (participaRayckington ? "RAYCKINGTON FC" : "PARTIDO")}
            </span>
            ${crearEstadoVisualPartido(partido)}
        </div>

        <div class="match-visual-main">
            ${crearEquipoVisualFixture(partido.local, clubDestacado)}

            <div class="match-visual-score">
                <strong>${escapar(marcador)}</strong>
                <small>${estado === "PROGRAMADO" ? "Próximo" : "Marcador"}</small>
            </div>

            ${crearEquipoVisualFixture(partido.visita, clubDestacado)}
        </div>

        ${meta}

        ${participaRayckington && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(partido.partidoRayckingtonId || "")) ? `
          <div class="rayck-live-card-action text-center mt-3">
            <a class="btn btn-danger w-100 fw-bold" href="seguimiento.html?partido=${encodeURIComponent(partido.partidoRayckingtonId)}">
              ${estado === "PROGRAMADO" ? "Ver previa" : ["EN_VIVO","ENTRETIEMPO"].includes(estado) ? "● Seguir en vivo" : "Ver resumen"} →
            </a>
          </div>
        ` : ""}

        ${partido.resultadoRayckington ? `
            <div class="match-visual-result ${obtenerClaseResultado(partido.resultadoRayckington)}">
                ${escapar(partido.resultadoRayckington)}
            </div>
        ` : ""}
    `;

    return tarjeta;
}


function crearEquipoVisualFixture(nombre, clubDestacado) {

    const esRay = normalizar(nombre) === normalizar(clubDestacado);

    return `
        <div class="match-visual-team ${esRay ? "is-rayckington" : ""}">
            <div class="match-visual-logo">
                ${crearEscudoEquipoPartidos(nombre, "partido")}
            </div>
            <span>${escapar(nombre || "Equipo")}</span>
        </div>
    `;
}


function crearEscudoEquipoPartidos(nombre, contexto = "partido") {

    const clave = normalizar(nombre);
    const ruta = LOGOS_EQUIPOS_PARTIDOS[clave];
    const iniciales = obtenerInicialesEquipoPartidos(nombre);

    const clase = contexto === "tabla"
        ? "team-crest team-crest-table"
        : "team-crest";

    if (!ruta) {
        return `<span class="${clase} team-crest-fallback">${escapar(iniciales)}</span>`;
    }

    return `
        <span class="${clase}">
            <img
                src="${escapar(ruta)}"
                alt="${escapar(nombre)}"
                loading="lazy"
                onerror="this.hidden=true;this.nextElementSibling.hidden=false;">
            <span class="team-crest-fallback" hidden>${escapar(iniciales)}</span>
        </span>
    `;
}


function obtenerInicialesEquipoPartidos(nombre) {

    const palabras = String(nombre || "EQ")
        .replace(/[.]/g, " ")
        .split(/\s+/)
        .filter(Boolean);

    if (palabras.length === 0) return "EQ";

    if (palabras.length === 1) {
        return palabras[0].slice(0, 3).toUpperCase();
    }

    return palabras
        .slice(0, 3)
        .map(p => p[0])
        .join("")
        .toUpperCase();
}


function crearEstadoVisualPartido(partido) {

    const estado = String(partido.estado || "").toUpperCase();

    if (estado === "EN_VIVO" || estado === "ENTRETIEMPO") {
        return `
            <span class="match-visual-status live">
                <span class="live-dot"></span>
                EN VIVO
                <span
                    class="fixture-live-clock"
                    data-inicio="${escapar(partido.cronometroInicioAt || "")}"
                    data-acumulados="${escapar(partido.cronometroSegundosAcumulados ?? 0)}"
                    data-corriendo="${partido.cronometroCorriendo ? "true" : "false"}"
                    data-periodo="${escapar(partido.periodoPartido || "")}">
                </span>
            </span>
        `;
    }

    const etiquetas = {
        PROGRAMADO: "Programado",
        FINALIZADO: "Finalizado",
        SUSPENDIDO: "Suspendido",
        CANCELADO: "Cancelado"
    };

    return `
        <span class="match-visual-status ${estado.toLowerCase()}">
            ${escapar(etiquetas[estado] || estado || "Partido")}
        </span>
    `;
}


function construirMetaPartidoVisual(partido, modo) {

    const fecha = formatearFechaHoraVisual(partido.fechaHora);
    const lugar = partido.lugar || "Recinto por confirmar";

    if (modo !== "amistoso" && !partido.fechaHora && !partido.lugar) {
        return "";
    }

    return `
        <div class="match-visual-meta">
            <span>
                <i class="bi bi-calendar-event"></i>
                ${escapar(fecha)}
            </span>
            <span>
                <i class="bi bi-geo-alt-fill"></i>
                ${escapar(lugar)}
            </span>
        </div>
    `;
}


function formatearFechaHoraVisual(valor) {

    if (!valor) return "Fecha por confirmar";

    const fecha = new Date(valor);

    if (Number.isNaN(fecha.getTime())) {
        return "Fecha por confirmar";
    }

    return fecha.toLocaleString("es-CL", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}


/* ===================================================
   CREAR FILA DE PARTIDO
=================================================== */

function crearFilaPartido(
    partido,
    clubDestacado
) {

    const fila =
        document.createElement("div");

    fila.className =
        "fixture-match";

    const participaRayckington =
        normalizar(partido.local) ===
        normalizar(clubDestacado) ||

        normalizar(partido.visita) ===
        normalizar(clubDestacado);

    if (participaRayckington) {

        fila.classList.add(
            "rayckington-match"
        );

    }

    const local =
        document.createElement("span");

    local.className =
        "fixture-team";

    local.textContent =
        partido.local || "Local";

    const resultado =
        document.createElement("span");

    resultado.className =
        "fixture-vs";

    resultado.textContent =
        obtenerMarcador(partido);

    const visita =
        document.createElement("span");

    visita.className =
        "fixture-team";

    visita.textContent =
        partido.visita || "Visita";

    fila.append(
        local,
        resultado,
        visita
    );

    const estado =
        String(
            partido.estado || ""
        ).toUpperCase();

    if (
        estado === "EN_VIVO" ||
        estado === "ENTRETIEMPO"
    ) {

        fila.classList.add(
            "fixture-match-live"
        );

        const etiquetaLive =
            document.createElement(
                "span"
            );

        etiquetaLive.className =
            "fixture-live-badge";

        etiquetaLive.innerHTML = `
            <span class="live-dot"></span>
            <span>EN VIVO</span>
            <span
                class="fixture-live-clock"
                data-inicio="${escapar(
                    partido.cronometroInicioAt || ""
                )}"
                data-acumulados="${escapar(
                    partido.cronometroSegundosAcumulados ?? 0
                )}"
                data-corriendo="${partido.cronometroCorriendo ? "true" : "false"}"
                data-periodo="${escapar(
                    partido.periodoPartido || ""
                )}">
            </span>
        `;

        fila.appendChild(
            etiquetaLive
        );

    } else if (
        estado === "PROGRAMADO"
    ) {

        const programado =
            document.createElement(
                "span"
            );

        programado.className =
            "fixture-status-badge";

        programado.textContent =
            "Programado";

        fila.appendChild(
            programado
        );
    }

    if (
        partido.resultadoRayckington
    ) {

        const etiqueta =
            document.createElement("span");

        etiqueta.className =
            obtenerClaseResultado(
                partido.resultadoRayckington
            );

        etiqueta.textContent =
            partido.resultadoRayckington;

        fila.appendChild(etiqueta);

    }

    return fila;

}


/* ===================================================
   AGRUPAR PARTIDOS POR FECHA
=================================================== */

function agruparPorFecha(partidos) {

    return partidos.reduce(
        (grupos, partido) => {

            const fecha =
                Number(partido.fecha) || 0;

            if (!grupos[fecha]) {

                grupos[fecha] = [];

            }

            grupos[fecha].push(partido);

            return grupos;

        },
        {}
    );

}


/* ===================================================
   OBTENER MARCADOR
=================================================== */

function obtenerMarcador(partido) {

    const estado =
        String(
            partido?.estado || ""
        ).toUpperCase();

    if (
        estado === "PROGRAMADO"
    ) {
        return "VS";
    }

    const tieneLocal =

        partido.golesLocal !== null &&

        partido.golesLocal !== undefined &&

        partido.golesLocal !== "";

    const tieneVisita =

        partido.golesVisita !== null &&

        partido.golesVisita !== undefined &&

        partido.golesVisita !== "";

    if (
        tieneLocal &&
        tieneVisita
    ) {

        return `${partido.golesLocal} - ${partido.golesVisita}`;

    }

    return "VS";

}


/* ===================================================
   CLASE SEGÚN RESULTADO
=================================================== */

function obtenerClaseResultado(resultado) {

    const valor =
        normalizar(resultado);

    if (
        valor.includes("victoria")
    ) {

        return "badge-win";

    }

    if (
        valor.includes("empate")
    ) {

        return "badge-draw";

    }

    if (
        valor.includes("derrota")
    ) {

        return "badge-loss";

    }

    return "club-badge";

}
/* ===================================================
   MOSTRAR CARGA
=================================================== */

function mostrarCarga() {

    if (estadoCarga) {

        estadoCarga.hidden = false;

        estadoCarga.innerHTML = `

            <div class="container text-center">

                <div
                    class="spinner-border text-warning"
                    role="status"
                    aria-hidden="true">
                </div>

                <p class="mt-3 mb-0">

                    Cargando información del torneo...

                </p>

            </div>

        `;

    }

    if (contenidoPartidos) {

        contenidoPartidos.hidden = true;

    }

}


/* ===================================================
   OCULTAR CARGA
=================================================== */

function ocultarCarga() {

    if (estadoCarga) {

        estadoCarga.hidden = true;

    }

    if (contenidoPartidos) {

        contenidoPartidos.hidden = false;

    }

}


/* ===================================================
   MOSTRAR ERROR
=================================================== */

function mostrarError(mensaje) {

    if (estadoCarga) {

        estadoCarga.hidden = false;

        estadoCarga.innerHTML = `

            <div class="container">

                <div
                    class="alert alert-danger text-center mb-0">

                    <i
                        class="bi bi-exclamation-triangle-fill me-2">
                    </i>

                    ${escapar(mensaje)}

                </div>

            </div>

        `;

    }

    if (contenidoPartidos) {

        contenidoPartidos.hidden = true;

    }

}


/* ===================================================
   COLOCAR TEXTO EN ELEMENTO
=================================================== */

function colocarTexto(id, valor) {

    const elemento =
        document.getElementById(id);

    if (elemento) {

        elemento.textContent = valor;

    }

}


/* ===================================================
   VALOR SEGURO
=================================================== */

function valorSeguro(valor) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {

        return 0;

    }

    return valor;

}


/* ===================================================
   FORMATEAR DIFERENCIA DE GOL
=================================================== */

function formatearDiferencia(valor) {

    const numero = Number(valor);

    if (!Number.isFinite(numero)) {

        return "0";

    }

    if (numero > 0) {

        return `+${numero}`;

    }

    return String(numero);

}


/* ===================================================
   NORMALIZAR TEXTO
=================================================== */

function normalizar(texto) {

    return String(texto || "")

        .normalize("NFD")

        .replace(
            /[\u0300-\u036f]/g,
            ""
        )

        .trim()

        .toLowerCase();

}


/* ===================================================
   ESCAPAR HTML
=================================================== */

function escapar(valor) {

    return String(valor ?? "")

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}
/* ===================================================
   NORMALIZAR ARCHIVO DE TABLA
=================================================== */

function normalizarTabla(datos) {

    if (Array.isArray(datos)) {

        return datos;

    }

    if (
        datos &&
        Array.isArray(datos.tabla)
    ) {

        return datos.tabla;

    }

    if (
        datos &&
        Array.isArray(datos.equipos)
    ) {

        return datos.equipos;

    }

    return [];

}


/* ===================================================
   NORMALIZAR ESTADÍSTICAS
=================================================== */

function normalizarEstadisticas(datos) {

    const origen =
        datos?.estadisticas ||
        datos?.resumen ||
        datos ||
        {};

    return {

        club:
            origen.club ||
            CLUB_DESTACADO,

        posicion:
            origen.posicion ??
            origen.pos ??
            0,

        pj:
            origen.pj ??
            origen.partidosJugados ??
            0,

        pg:
            origen.pg ??
            origen.v ??
            origen.victorias ??
            0,

        pe:
            origen.pe ??
            origen.e ??
            origen.empates ??
            0,

        pp:
            origen.pp ??
            origen.d ??
            origen.derrotas ??
            0,

        gf:
            origen.gf ??
            origen.golesFavor ??
            0,

        gc:
            origen.gc ??
            origen.golesContra ??
            0,

        dg:
            origen.dg ??
            origen.diferenciaGol ??
            0,

        pts:
            origen.pts ??
            origen.puntos ??
            0

    };

}


/* ===================================================
   NORMALIZAR FIXTURE
=================================================== */

function normalizarFixture(datos) {

    let origen = datos;

    if (
        datos &&
        !Array.isArray(datos) &&
        Array.isArray(datos.fixture)
    ) {

        origen = datos.fixture;

    }

    if (!Array.isArray(origen)) {

        return [];

    }

    const resultado = [];

    origen.forEach((elemento) => {

        /*
         * Formato antiguo:
         * {
         *   "fecha": 1,
         *   "partidos": [...]
         * }
         */

        if (Array.isArray(elemento.partidos)) {

            elemento.partidos.forEach(
                (partido, indice) => {

                    resultado.push({

                        ...partido,

                        fecha:
                            partido.fecha ??
                            elemento.fecha,

                        orden:
                            partido.orden ??
                            indice + 1,

                        estado:
                            partido.estado ??
                            elemento.estado ??
                            ""

                    });

                }
            );

            return;

        }

        /*
         * Formato nuevo:
         * cada elemento ya es un partido.
         */

        resultado.push(elemento);

    });

    return resultado;

}