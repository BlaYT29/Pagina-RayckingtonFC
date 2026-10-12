/* ===================================================
   RAYCKINGTON FC
   JUGADOR.JS · PERFIL PÚBLICO V2
   Supabase = ficha y estadísticas oficiales
   plantel.json = compatibilidad temporal de slug/capitán/categoría
=================================================== */

"use strict";

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";


/* ===================================================
   CONFIGURACIÓN
=================================================== */

const SUPABASE_URL =
    "https://auutiadcyhhwxzkeernd.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_luWCBHYOSUsFbmgPU4GoiQ_9nmBMRHe";

const supabase =
    createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

const RUTA_DATOS_JUGADOR =
    "assets/data/plantel/plantel.json";

const FOTO_JUGADOR_RESPALDO =
    "assets/img/jugadores/jugador-default.webp";

const LOGO_CLUB =
    "assets/img/logo/logo.png";

let jugadorActual = null;
let jugadorLegacy = null;
let estadisticasPublicas = [];
let acumuladoHistoricoClausura = null;

// Los acumulados migrados al 11/10/2026 corresponden a las Fechas 1 y 2.
// NO se reparten artificialmente entre partidos individuales.
const FIN_ACUMULADO_CLAUSURA = "2026-10-11";


/* ===================================================
   INICIO
=================================================== */

document.addEventListener(
    "DOMContentLoaded",
    iniciarPerfilJugador
);


/* ===================================================
   INICIAR PERFIL
=================================================== */

async function iniciarPerfilJugador() {

    try {

        const slug =
            obtenerParametroJugador(
                "slug"
            );

        if (!slug) {

            mostrarJugadorNoEncontrado();

            return;

        }


        /* ---------------------------------------------------
           Compatibilidad con las URL actuales.
           El JSON solamente se usa para localizar el slug
           existente y conservar datos que aún no migramos,
           como capitán/categoría.
        --------------------------------------------------- */

        const datosPlantel =
            await cargarPlantelJugador();

        const jugadoresLegacy =
            Array.isArray(
                datosPlantel.jugadores
            )
                ? datosPlantel.jugadores
                : [];

        jugadorLegacy =
            jugadoresLegacy.find(
                item =>
                    item.slug === slug &&
                    String(item.estado || "")
                        .toUpperCase() !== "INACTIVO"
            ) || null;

        if (!jugadorLegacy) {

            mostrarJugadorNoEncontrado();

            return;

        }


        // El histórico se consulta por slug; no depende de que la cuenta
        // del jugador ya esté vinculada a Supabase.
        const [perfilOficial, historico] = await Promise.all([
            cargarPerfilOficial(jugadorLegacy),
            cargarHistoricoClausuraJugador(jugadorLegacy.slug)
        ]);

        acumuladoHistoricoClausura = historico;

        if (!perfilOficial) {

            /*
             * Fallback temporal:
             * si todavía no se encuentra en Supabase,
             * la ficha antigua continúa funcionando.
             */

            jugadorActual =
                normalizarJugadorLegacy(
                    jugadorLegacy
                );

            estadisticasPublicas =
                combinarHistoricoConOficiales([], historico);

        } else {

            jugadorActual =
                combinarPerfilJugador(
                    perfilOficial,
                    jugadorLegacy
                );

            const oficiales =
                await cargarEstadisticasPublicas(perfilOficial.id);

            estadisticasPublicas =
                combinarHistoricoConOficiales(oficiales, historico);

        }


        renderizarPerfilJugador(
            jugadorActual,
            datosPlantel
        );

        ocultarCargaJugador();

    } catch (error) {

        console.error(
            "Error al cargar el perfil del jugador:",
            error
        );

        mostrarErrorJugador(
            "No fue posible cargar el perfil del jugador."
        );

    }

}


/* ===================================================
   CARGAR PLANTEL LEGACY
=================================================== */

async function cargarPlantelJugador() {

    const respuesta =
        await fetch(
            RUTA_DATOS_JUGADOR,
            {
                cache: "no-store"
            }
        );

    if (!respuesta.ok) {

        throw new Error(
            `Error ${respuesta.status} al cargar ${RUTA_DATOS_JUGADOR}`
        );

    }

    const datos =
        await respuesta.json();

    if (
        !datos ||
        !Array.isArray(
            datos.jugadores
        )
    ) {

        throw new Error(
            "plantel.json debe contener un arreglo llamado jugadores."
        );

    }

    return datos;

}


/* ===================================================
   PERFIL OFICIAL SUPABASE
=================================================== */

async function cargarPerfilOficial(
    legacy
) {

    const {
        data,
        error
    } =
        await supabase.rpc(
            "obtener_perfil_publico_jugador",
            {
                p_nombre:
                    legacy.nombre || null,

                p_nombre_completo:
                    legacy.nombreCompleto || null
            }
        );

    if (error) {

        console.warn(
            "No se pudo cargar perfil deportivo oficial:",
            error
        );

        return null;

    }

    return Array.isArray(data)
        ? data[0] || null
        : data || null;

}


/* ===================================================
   ESTADÍSTICAS OFICIALES PÚBLICAS
=================================================== */

async function cargarEstadisticasPublicas(
    jugadorId
) {

    const {
        data,
        error
    } =
        await supabase.rpc(
            "obtener_estadisticas_publicas_jugador",
            {
                p_jugador_id:
                    jugadorId
            }
        );

    if (error) {

        console.warn(
            "No se pudieron cargar estadísticas públicas:",
            error
        );

        return [];

    }

    return Array.isArray(data)
        ? data
        : [];

}


/* ===================================================
   HISTÓRICO CLAUSURA 2026 · ACUMULADO HASTA FECHA 2

   Política antduplicados:
   - La migración SQL contiene el acumulado de las dos primeras fechas.
   - Los registros oficiales de ese mismo período NO se vuelven a sumar.
   - Los partidos fechados después del 11/10/2026 sí se suman al resumen.
   - El acumulado aparece como un solo registro identificado, nunca
     como dos registros inventados de Fecha 1 y Fecha 2.
=================================================== */

async function cargarHistoricoClausuraJugador(slug) {
    if (!slug) return null;

    const { data, error } = await supabase
        .from("deportivo_estadisticas_historicas")
        .select("temporada,competicion,jugador_slug,partidos,titularidades,suplencias,minutos,goles,asistencias,amarillas,rojas,porterias_invictas,mvp")
        .eq("temporada", "Clausura 2026")
        .eq("competicion", "Liga Tobalaba Todo Competidor")
        .eq("jugador_slug", slug)
        .maybeSingle();

    if (error) {
        console.warn("Histórico del Clausura no disponible; se conservan las estadísticas anteriores:", error);
        return null;
    }
    return data || null;
}

function esEstadisticaOficialClausura2026(fila) {
    const etiqueta = `${fila.competicion_nombre || ""} ${fila.temporada_nombre || ""}`;
    return /clausura/i.test(etiqueta) && /2026/i.test(etiqueta);
}

function combinarHistoricoConOficiales(oficiales, historico) {
    const filas = Array.isArray(oficiales) ? oficiales : [];
    if (!historico) return filas;

    const clausura = filas.find(esEstadisticaOficialClausura2026);
    const posteriores = filas.filter(fila => {
        if (!esEstadisticaOficialClausura2026(fila)) return true;
        // Si no hay fecha fiable, no contabilizarla por duplicado.
        const fecha = String(fila.fecha_hora || "").slice(0, 10);
        return Boolean(fecha) && fecha > FIN_ACUMULADO_CLAUSURA;
    });

    const historicoFila = {
        registro_historico: true,
        temporada_id: clausura?.temporada_id || "historico-2026",
        temporada_nombre: clausura?.temporada_nombre || "Clausura 2026",
        competicion_id: clausura?.competicion_id || "historico-clausura-2026",
        competicion_nombre: clausura?.competicion_nombre || "Torneo Clausura 2026",
        partidos: Number(historico.partidos) || 0,
        titularidades: Number(historico.titularidades) || 0,
        minutos: Number(historico.minutos) || 0,
        goles: Number(historico.goles) || 0,
        asistencias: Number(historico.asistencias) || 0,
        amarillas: Number(historico.amarillas) || 0,
        rojas: Number(historico.rojas) || 0,
        mvp: Number(historico.mvp) || 0,
        vallasInvictas: Number(historico.porterias_invictas) || 0,
        penalesAtajados: 0
    };

    return [historicoFila, ...posteriores];
}


/* ===================================================
   COMBINAR PERFIL OFICIAL + COMPATIBILIDAD
=================================================== */

function combinarPerfilJugador(
    oficial,
    legacy
) {

    return {

        id:
            oficial.id,

        slug:
            legacy.slug,

        nombre:
            oficial.nombre_deportivo ||
            oficial.nombre ||
            legacy.nombre,

        nombreCompleto:
            oficial.nombre_completo ||
            legacy.nombreCompleto ||
            oficial.nombre ||
            legacy.nombre,

        numero:
            oficial.dorsal ??
            legacy.numero ??
            "—",

        posicion:
            oficial.posicion ||
            legacy.posicion ||
            "",

        nombrePosicion:
            obtenerNombrePosicion(
                oficial.posicion ||
                legacy.posicion
            ) ||
            legacy.nombrePosicion ||
            "Por definir",

        posicionSecundaria:
            oficial.posicion_secundaria ||
            "",

        piernaHabil:
            oficial.pierna_habil ||
            "",

        fechaIngreso:
            oficial.fecha_ingreso ||
            "",

        fechaNacimiento:
            oficial.fecha_nacimiento ||
            legacy.fechaNacimiento ||
            "",

        estado:
            oficial.estado ||
            legacy.estado ||
            "ACTIVO",

        categoria:
            legacy.categoria ||
            "Plantel Oficial",

        capitan:
            Boolean(
                legacy.capitan
            ),

        // No publicar fotos cargadas desde Portal Deportivo.
        foto:
            obtenerFotoPublicaClub(
                legacy.foto
            ),

        estadisticasLegacy:
            legacy.estadisticas ||
            {}

    };

}


function normalizarJugadorLegacy(
    legacy
) {

    return {

        slug:
            legacy.slug,

        nombre:
            legacy.nombre,

        nombreCompleto:
            legacy.nombreCompleto ||
            legacy.nombre,

        numero:
            legacy.numero ?? "—",

        posicion:
            legacy.posicion || "",

        nombrePosicion:
            legacy.nombrePosicion ||
            obtenerNombrePosicion(
                legacy.posicion
            ) ||
            "Por definir",

        posicionSecundaria:
            "",

        piernaHabil:
            "",

        fechaIngreso:
            "",

        fechaNacimiento:
            legacy.fechaNacimiento ||
            "",

        estado:
            legacy.estado ||
            "DISPONIBLE",

        categoria:
            legacy.categoria ||
            "Plantel Oficial",

        capitan:
            Boolean(
                legacy.capitan
            ),

        foto:
            legacy.foto ||
            FOTO_JUGADOR_RESPALDO,

        estadisticasLegacy:
            legacy.estadisticas ||
            {}

    };

}


/* ===================================================
   FOTO PÚBLICA DEL CLUB
   No leer foto_path (foto personal del Portal Deportivo).
   Se conserva la fotografía curada en plantel.json o el avatar.
=================================================== */

function obtenerFotoPublicaClub(fotoLegacy) {
    return fotoLegacy || FOTO_JUGADOR_RESPALDO || LOGO_CLUB;
}


/* ===================================================
   RENDERIZAR PERFIL
=================================================== */

function renderizarPerfilJugador(
    jugador,
    datosPlantel
) {

    document.title =
        `${jugador.nombre} | Rayckington FC`;

    actualizarHeroJugador(
        jugador,
        datosPlantel
    );

    const contenedor =
        document.getElementById(
            "jugador-detalle"
        );

    if (!contenedor) {
        return;
    }

    contenedor.innerHTML =
        crearFichaJugador(
            jugador,
            datosPlantel
        );

    configurarFiltrosPublicos();

}


/* ===================================================
   HERO
=================================================== */

function actualizarHeroJugador(
    jugador,
    datosPlantel
) {

    colocarTextoJugador(
        "jugador-categoria",
        jugador.categoria ||
        "Plantel Oficial"
    );

    colocarTextoJugador(
        "jugador-titulo",
        jugador.nombre
    );

    colocarTextoJugador(
        "jugador-subtitulo",
        `${jugador.nombrePosicion || "Jugador"} · ${
            datosPlantel.temporada ||
            "Rayckington FC"
        }`
    );

}


/* ===================================================
   FICHA PRINCIPAL
=================================================== */

function crearFichaJugador(
    jugador,
    datosPlantel
) {

    const edad =
        calcularEdadJugador(
            jugador.fechaNacimiento
        );

    const fechaVisible =
        obtenerFechaVisible(
            jugador.fechaNacimiento,
            "Por confirmar"
        );

    const ingresoVisible =
        obtenerFechaVisible(
            jugador.fechaIngreso,
            "Por confirmar"
        );

    const estado =
        obtenerEstadoPerfilJugador(
            jugador.estado
        );

    const resumenInicial =
        obtenerResumenActual();

    return `

        <article class="player-profile">

            <div class="row align-items-stretch g-0">

                <div class="col-lg-5">

                    <div class="player-profile-image">

                        <img
                            src="${escaparJugador(jugador.foto)}"
                            alt="${escaparJugador(jugador.nombre)}"
                            onerror="
                                this.onerror=null;
                                this.src='${FOTO_JUGADOR_RESPALDO}';
                            ">

                        <span class="player-profile-number">
                            ${escaparJugador(jugador.numero)}
                        </span>

                        <span class="player-profile-status ${estado.clase}">
                            <i class="${estado.icono}"></i>
                            ${estado.texto}
                        </span>

                        ${
                            jugador.capitan
                                ? `
                                    <span class="player-profile-captain">
                                        <i class="bi bi-award-fill"></i>
                                        Capitán
                                    </span>
                                `
                                : ""
                        }

                    </div>

                </div>

                <div class="col-lg-7">

                    <div class="player-profile-content">

                        <div class="player-profile-kicker">
                            Ficha oficial
                        </div>

                        <span class="player-profile-position">
                            ${escaparJugador(jugador.nombrePosicion)}
                        </span>

                        <h2>
                            ${escaparJugador(jugador.nombreCompleto)}
                        </h2>

                        <div class="player-fifa-overview">
                            ${crearMiniStat("PJ", resumenInicial.partidos)}
                            ${crearMiniStat("MIN", resumenInicial.minutos)}
                            ${crearMiniStat("G", resumenInicial.goles)}
                            ${crearMiniStat("A", resumenInicial.asistencias)}
                        </div>

                        <div class="player-profile-data">

                            ${crearDatoJugador(
                                "bi-person-fill",
                                "Edad",
                                edad !== null
                                    ? `${edad} años`
                                    : "Por confirmar"
                            )}

                            ${crearDatoJugador(
                                "bi-calendar3",
                                "Fecha de nacimiento",
                                fechaVisible
                            )}

                            ${crearDatoJugador(
                                "bi-hash",
                                "Dorsal",
                                jugador.numero
                            )}

                            ${crearDatoJugador(
                                "bi-diagram-3-fill",
                                "Posición",
                                jugador.nombrePosicion
                            )}

                            ${crearDatoJugador(
                                "bi-arrow-left-right",
                                "Posición secundaria",
                                jugador.posicionSecundaria
                                    ? obtenerNombrePosicion(jugador.posicionSecundaria)
                                    : "Por definir"
                            )}

                            ${crearDatoJugador(
                                "bi-lightning-charge-fill",
                                "Pierna hábil",
                                jugador.piernaHabil ||
                                "Por definir"
                            )}

                            ${crearDatoJugador(
                                "bi-calendar-check-fill",
                                "Ingreso al club",
                                ingresoVisible
                            )}

                            ${crearDatoJugador(
                                "bi-trophy-fill",
                                "Temporada",
                                datosPlantel.temporada ||
                                "Temporada 2026"
                            )}

                        </div>

                        <a
                            href="plantel.html"
                            class="btn btn-primary-club mt-4">

                            <i class="bi bi-arrow-left me-2"></i>
                            Volver al plantel

                        </a>

                    </div>

                </div>

            </div>

        </article>

        ${crearSeccionEstadisticas(jugador)}

    `;

}


function crearMiniStat(
    etiqueta,
    valor
) {

    return `
        <div class="player-mini-stat">
            <strong>${obtenerNumeroJugador(valor)}</strong>
            <span>${escaparJugador(etiqueta)}</span>
        </div>
    `;

}


/* ===================================================
   DATOS
=================================================== */

function crearDatoJugador(
    icono,
    etiqueta,
    valor
) {

    return `

        <div class="player-data-item">

            <div class="player-data-icon">
                <i class="bi ${icono}"></i>
            </div>

            <div>

                <span>
                    ${escaparJugador(etiqueta)}
                </span>

                <strong>
                    ${escaparJugador(valor ?? "Por confirmar")}
                </strong>

            </div>

        </div>

    `;

}


/* ===================================================
   SECCIÓN ESTADÍSTICAS
=================================================== */

function crearSeccionEstadisticas(
    jugador
) {

    const tieneOficiales =
        estadisticasPublicas.length > 0;

    const resumen =
        obtenerResumenActual();

    const controles =
        tieneOficiales
            ? crearControlesEstadisticas()
            : "";

    const historial =
        tieneOficiales
            ? crearHistorialPublico(
                estadisticasPublicas
            )
            : `
                <div class="player-stats-empty">
                    <i class="bi bi-bar-chart-line"></i>
                    <div>
                        <strong>Estadísticas oficiales en preparación</strong>
                        <span>
                            La ficha seguirá usando el registro actual del plantel
                            hasta que las competiciones oficiales sean publicadas.
                        </span>
                    </div>
                </div>
            `;

    return `

        <section class="player-profile-stats">

            <div class="section-title player-stats-heading">

                <div>
                    <span class="club-badge">
                        Rendimiento
                    </span>

                    <h2 class="mt-3">
                        Estadísticas del Jugador
                    </h2>

                    <p id="player-stats-description">
                        ${
                            acumuladoHistoricoClausura
                                ? "Clausura 2026: acumulado histórico de fechas 1 y 2, más registros posteriores aprobados."
                                : tieneOficiales
                                    ? "Registro oficial aprobado por Rayckington FC."
                                    : "Registro deportivo actual del plantel."
                        }
                    </p>
                </div>

                ${controles}

            </div>

            <div
                id="player-public-stats"
                class="row justify-content-center g-4">

                ${crearTarjetasEstadisticas(
                    resumen,
                    jugador.posicion
                )}

            </div>

            <div
                id="player-public-history"
                class="player-history-wrap">

                ${historial}

            </div>

        </section>

    `;

}


function crearControlesEstadisticas() {

    const temporadas =
        obtenerTemporadasPublicas();

    return `

        <div class="player-stats-toolbar">

            <label>
                <span>Temporada</span>
                <select id="player-filter-season">
                    <option value="">Toda la carrera</option>
                    ${
                        temporadas
                            .map(
                                item => `
                                    <option value="${escaparJugador(item.id)}">
                                        ${escaparJugador(item.nombre)}
                                    </option>
                                `
                            )
                            .join("")
                    }
                </select>
            </label>

            <label>
                <span>Competición</span>
                <select id="player-filter-competition">
                    <option value="">Todas las competiciones</option>
                </select>
            </label>

        </div>

    `;

}


function crearTarjetasEstadisticas(
    estadisticas,
    posicion
) {

    const esArquero =
        posicion === "PO";

    const tarjetas = [

        {
            etiqueta: "Partidos",
            valor: estadisticas.partidos,
            icono: "bi-shield-fill"
        },

        {
            etiqueta: "Titularidades",
            valor: estadisticas.titularidades,
            icono: "bi-person-check-fill"
        },

        {
            etiqueta: "Minutos",
            valor: estadisticas.minutos,
            icono: "bi-stopwatch-fill"
        },

        {
            etiqueta: "Goles",
            valor: estadisticas.goles,
            icono: "bi-dribbble"
        },

        {
            etiqueta: "Asistencias",
            valor: estadisticas.asistencias,
            icono: "bi-bullseye"
        },

        {
            etiqueta: "Amarillas",
            valor: estadisticas.amarillas,
            icono: "bi-square-fill",
            claseExtra: "stat-yellow"
        },

        {
            etiqueta: "Rojas",
            valor: estadisticas.rojas,
            icono: "bi-square-fill",
            claseExtra: "stat-red"
        },

        {
            etiqueta: "MVP",
            valor: estadisticas.mvp,
            icono: "bi-star-fill"
        }

    ];

    if (esArquero) {

        tarjetas.splice(
            5,
            0,
            {
                etiqueta: "Vallas invictas",
                valor: estadisticas.vallasInvictas,
                icono: "bi-lock-fill"
            },
            {
                etiqueta: "Penales atajados",
                valor: estadisticas.penalesAtajados,
                icono: "bi-hand-index-thumb-fill"
            }
        );

    }

    return tarjetas
        .map(
            tarjeta => `

                <div class="col-lg-3 col-md-4 col-6">

                    <article class="profile-stat-card ${tarjeta.claseExtra || ""}">

                        <i class="bi ${tarjeta.icono}"></i>

                        <strong>
                            ${obtenerNumeroJugador(tarjeta.valor)}
                        </strong>

                        <span>
                            ${escaparJugador(tarjeta.etiqueta)}
                        </span>

                    </article>

                </div>

            `
        )
        .join("");

}


/* ===================================================
   RESÚMENES
=================================================== */

function obtenerResumenActual(
    temporadaId = "",
    competicionId = ""
) {

    if (estadisticasPublicas.length) {

        const filtradas =
            estadisticasPublicas.filter(
                fila =>
                    (!temporadaId || fila.temporada_id === temporadaId) &&
                    (!competicionId || fila.competicion_id === competicionId)
            );

        return resumirEstadisticas(
            filtradas
        );

    }

    const legacy =
        jugadorActual?.estadisticasLegacy ||
        {};

    return {

        partidos:
            obtenerNumeroJugador(
                legacy.partidos
            ),

        titularidades:
            obtenerNumeroJugador(
                legacy.titularidades
            ),

        minutos:
            obtenerNumeroJugador(
                legacy.minutos
            ),

        goles:
            obtenerNumeroJugador(
                legacy.goles
            ),

        asistencias:
            obtenerNumeroJugador(
                legacy.asistencias
            ),

        amarillas:
            obtenerNumeroJugador(
                legacy.amarillas
            ),

        rojas:
            obtenerNumeroJugador(
                legacy.rojas
            ),

        mvp:
            obtenerNumeroJugador(
                legacy.mvp
            ),

        vallasInvictas:
            obtenerNumeroJugador(
                legacy.porteriasInvictas
            ),

        penalesAtajados:
            obtenerNumeroJugador(
                legacy.penalesAtajados
            )

    };

}


function resumirEstadisticas(
    filas
) {

    return filas.reduce(
        (
            total,
            fila
        ) => {

            if (fila.registro_historico) {
                total.partidos += Number(fila.partidos) || 0;
                total.titularidades += Number(fila.titularidades) || 0;
                total.minutos += Number(fila.minutos) || 0;
                total.goles += Number(fila.goles) || 0;
                total.asistencias += Number(fila.asistencias) || 0;
                total.amarillas += Number(fila.amarillas) || 0;
                total.rojas += Number(fila.rojas) || 0;
                total.mvp += Number(fila.mvp) || 0;
                total.vallasInvictas += Number(fila.vallasInvictas) || 0;
                return total;
            }

            if (fila.jugo) {
                total.partidos += 1;
            }

            if (
                fila.jugo &&
                fila.titular
            ) {
                total.titularidades += 1;
            }

            total.minutos +=
                Number(fila.minutos) || 0;

            total.goles +=
                Number(fila.goles) || 0;

            total.asistencias +=
                Number(fila.asistencias) || 0;

            total.amarillas +=
                Number(fila.amarillas) || 0;

            total.rojas +=
                Number(fila.rojas) || 0;

            total.mvp +=
                fila.mvp ? 1 : 0;

            total.vallasInvictas +=
                fila.valla_invicta ? 1 : 0;

            total.penalesAtajados +=
                Number(fila.penales_atajados) || 0;

            return total;

        },
        {
            partidos: 0,
            titularidades: 0,
            minutos: 0,
            goles: 0,
            asistencias: 0,
            amarillas: 0,
            rojas: 0,
            mvp: 0,
            vallasInvictas: 0,
            penalesAtajados: 0
        }
    );

}


/* ===================================================
   FILTROS PÚBLICOS
=================================================== */

function configurarFiltrosPublicos() {

    const season =
        document.getElementById(
            "player-filter-season"
        );

    const competition =
        document.getElementById(
            "player-filter-competition"
        );

    if (!season || !competition) {
        return;
    }

    const actualizarCompetencias = () => {

        const temporadaId =
            season.value;

        const actuales =
            obtenerCompeticionesPublicas(
                temporadaId
            );

        const anterior =
            competition.value;

        competition.innerHTML = `
            <option value="">Todas las competiciones</option>
            ${
                actuales
                    .map(
                        item => `
                            <option value="${escaparJugador(item.id)}">
                                ${escaparJugador(item.nombre)}
                            </option>
                        `
                    )
                    .join("")
            }
        `;

        if (
            actuales.some(
                item => item.id === anterior
            )
        ) {
            competition.value = anterior;
        }

    };

    const actualizar = () => {

        actualizarEstadisticasVisuales(
            season.value,
            competition.value
        );

    };

    season.addEventListener(
        "change",
        () => {
            actualizarCompetencias();
            actualizar();
        }
    );

    competition.addEventListener(
        "change",
        actualizar
    );

    actualizarCompetencias();

}


function actualizarEstadisticasVisuales(
    temporadaId,
    competicionId
) {

    const filtradas =
        estadisticasPublicas.filter(
            fila =>
                (!temporadaId || fila.temporada_id === temporadaId) &&
                (!competicionId || fila.competicion_id === competicionId)
        );

    const resumen =
        resumirEstadisticas(
            filtradas
        );

    const stats =
        document.getElementById(
            "player-public-stats"
        );

    const history =
        document.getElementById(
            "player-public-history"
        );

    if (stats) {

        stats.innerHTML =
            crearTarjetasEstadisticas(
                resumen,
                jugadorActual.posicion
            );

    }

    if (history) {

        history.innerHTML =
            crearHistorialPublico(
                filtradas
            );

    }

}


function obtenerTemporadasPublicas() {

    const mapa =
        new Map();

    estadisticasPublicas.forEach(
        fila => {

            if (
                fila.temporada_id &&
                !mapa.has(
                    fila.temporada_id
                )
            ) {

                mapa.set(
                    fila.temporada_id,
                    {
                        id:
                            fila.temporada_id,

                        nombre:
                            fila.temporada_nombre ||
                            `Temporada ${fila.temporada_anio || ""}`
                    }
                );

            }

        }
    );

    return [...mapa.values()];

}


function obtenerCompeticionesPublicas(
    temporadaId = ""
) {

    const mapa =
        new Map();

    estadisticasPublicas
        .filter(
            fila =>
                !temporadaId ||
                fila.temporada_id === temporadaId
        )
        .forEach(
            fila => {

                if (
                    fila.competicion_id &&
                    !mapa.has(
                        fila.competicion_id
                    )
                ) {

                    mapa.set(
                        fila.competicion_id,
                        {
                            id:
                                fila.competicion_id,

                            nombre:
                                fila.competicion_nombre ||
                                "Competición"
                        }
                    );

                }

            }
        );

    return [...mapa.values()];

}


/* ===================================================
   HISTORIAL PÚBLICO
=================================================== */

function crearHistorialPublico(
    filas
) {

    if (!filas.length) {

        return `
            <div class="player-stats-empty compact">
                <i class="bi bi-calendar-x"></i>
                <div>
                    <strong>Sin partidos en este filtro</strong>
                    <span>No existen registros oficiales publicados.</span>
                </div>
            </div>
        `;

    }

    return `

        <section class="player-history">

            <div class="player-history-head">

                <div>
                    <span class="club-badge">
                        Partido a partido
                    </span>

                    <h3>
                        Historial oficial
                    </h3>
                </div>

                <span class="player-history-count">
                    ${filas.filter(f => !f.registro_historico).length} registros por partido
                </span>

            </div>

            <div class="player-history-list">

                ${
                    filas
                        .map(
                            crearFilaHistorial
                        )
                        .join("")
                }

            </div>

        </section>

    `;

}


function crearFilaHistorial(
    fila
) {

    if (fila.registro_historico) {
        return `
            <article class="player-history-row">
                <div class="player-history-match">
                    <strong>Acumulado histórico · Clausura 2026</strong>
                    <span>Fechas 1 y 2 · sin desglose individual por partido</span>
                </div>
                <div class="player-history-score">${fila.partidos} PJ</div>
                ${crearHistorialMetrica(fila.minutos, "MIN")}
                ${crearHistorialMetrica(fila.goles, "G")}
                ${crearHistorialMetrica(fila.asistencias, "A")}
                ${crearHistorialMetrica(fila.amarillas, "TA")}
                ${crearHistorialMetrica(fila.rojas, "TR")}
                ${crearHistorialMetrica(fila.mvp, "MVP")}
            </article>
        `;
    }

    const local =
        String(
            fila.condicion ||
            "LOCAL"
        ).toUpperCase() === "LOCAL";

    const partido =
        local
            ? `Rayckington FC vs ${fila.rival_nombre}`
            : `${fila.rival_nombre} vs Rayckington FC`;

    const resultado =
        local
            ? `${fila.goles_rayckington} - ${fila.goles_rival}`
            : `${fila.goles_rival} - ${fila.goles_rayckington}`;

    return `

        <article class="player-history-row">

            <div class="player-history-match">

                <strong>
                    ${escaparJugador(partido)}
                </strong>

                <span>
                    ${escaparJugador(fila.competicion_nombre || "Competición")}
                    ${fila.jornada ? ` · Fecha ${fila.jornada}` : ""}
                    ${fila.fecha_hora ? ` · ${escaparJugador(formatearFechaCorta(fila.fecha_hora))}` : ""}
                </span>

            </div>

            <div class="player-history-score">
                ${escaparJugador(resultado)}
            </div>

            ${crearHistorialMetrica(fila.minutos, "MIN")}
            ${crearHistorialMetrica(fila.goles, "G")}
            ${crearHistorialMetrica(fila.asistencias, "A")}
            ${crearHistorialMetrica(fila.amarillas, "TA")}
            ${crearHistorialMetrica(fila.rojas, "TR")}
            ${crearHistorialMetrica(fila.mvp ? "★" : "—", "MVP")}

        </article>

    `;

}


function crearHistorialMetrica(
    valor,
    etiqueta
) {

    return `
        <div class="player-history-metric">
            <strong>${escaparJugador(valor ?? 0)}</strong>
            <span>${escaparJugador(etiqueta)}</span>
        </div>
    `;

}


/* ===================================================
   ESTADO
=================================================== */

function obtenerEstadoPerfilJugador(
    estado
) {

    const valor =
        String(
            estado ||
            "ACTIVO"
        ).toUpperCase();

    const estados = {

        ACTIVO: {
            texto: "Disponible",
            clase: "profile-status-available",
            icono: "bi bi-check-circle-fill"
        },

        DISPONIBLE: {
            texto: "Disponible",
            clase: "profile-status-available",
            icono: "bi bi-check-circle-fill"
        },

        LESIONADO: {
            texto: "Lesionado",
            clase: "profile-status-injured",
            icono: "bi bi-bandaid-fill"
        },

        INACTIVO: {
            texto: "Inactivo",
            clase: "profile-status-inactive",
            icono: "bi bi-dash-circle-fill"
        }

    };

    return (
        estados[valor] ||
        estados.ACTIVO
    );

}


/* ===================================================
   POSICIONES
=================================================== */

function obtenerNombrePosicion(
    codigo
) {

    const posiciones = {
        PO: "Arquero",
        DFC: "Defensa Central",
        LD: "Lateral Derecho",
        LI: "Lateral Izquierdo",
        CAD: "Carrilero Derecho",
        CAI: "Carrilero Izquierdo",
        MCD: "Mediocampista Defensivo",
        MC: "Mediocampista Central",
        MCO: "Mediocampista Ofensivo",
        MD: "Mediocampista Derecho",
        MI: "Mediocampista Izquierdo",
        ED: "Extremo Derecho",
        EI: "Extremo Izquierdo",
        SD: "Segundo Delantero",
        DC: "Delantero Centro"
    };

    const valor =
        String(
            codigo ||
            ""
        ).toUpperCase();

    return posiciones[valor] ||
        codigo ||
        "";

}


/* ===================================================
   FECHAS
=================================================== */

function calcularEdadJugador(
    fechaNacimiento
) {

    if (!fechaNacimiento) {
        return null;
    }

    const nacimiento =
        new Date(
            `${fechaNacimiento}T12:00:00`
        );

    if (
        Number.isNaN(
            nacimiento.getTime()
        )
    ) {
        return null;
    }

    const hoy =
        new Date();

    let edad =
        hoy.getFullYear() -
        nacimiento.getFullYear();

    const diferenciaMes =
        hoy.getMonth() -
        nacimiento.getMonth();

    const aunNoCumple =
        diferenciaMes < 0 ||
        (
            diferenciaMes === 0 &&
            hoy.getDate() <
            nacimiento.getDate()
        );

    if (aunNoCumple) {
        edad--;
    }

    return edad;

}


function obtenerFechaVisible(
    fechaValor,
    fallback = "Por confirmar"
) {

    if (!fechaValor) {
        return fallback;
    }

    const fecha =
        new Date(
            String(fechaValor).length <= 10
                ? `${fechaValor}T12:00:00`
                : fechaValor
        );

    if (
        Number.isNaN(
            fecha.getTime()
        )
    ) {
        return fallback;
    }

    return fecha.toLocaleDateString(
        "es-CL",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}


function formatearFechaCorta(
    valor
) {

    const fecha =
        new Date(valor);

    if (
        Number.isNaN(
            fecha.getTime()
        )
    ) {
        return "";
    }

    return fecha.toLocaleDateString(
        "es-CL",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* ===================================================
   UTILIDADES
=================================================== */

function obtenerNumeroJugador(
    valor
) {

    const numero =
        Number(valor);

    return Number.isFinite(numero)
        ? numero
        : 0;

}


function mostrarJugadorNoEncontrado() {

    document.title =
        "Jugador no encontrado | Rayckington FC";

    colocarTextoJugador(
        "jugador-categoria",
        "Error"
    );

    colocarTextoJugador(
        "jugador-titulo",
        "Jugador no encontrado"
    );

    colocarTextoJugador(
        "jugador-subtitulo",
        "El perfil solicitado no existe o el enlace es incorrecto."
    );

    const detalle =
        document.getElementById(
            "jugador-detalle"
        );

    const noEncontrado =
        document.getElementById(
            "jugador-no-encontrado"
        );

    if (detalle) {
        detalle.innerHTML = "";
    }

    if (noEncontrado) {
        noEncontrado.hidden = false;
    }

    ocultarCargaJugador();

}


function ocultarCargaJugador() {

    const carga =
        document.getElementById(
            "jugador-cargando"
        );

    if (carga) {
        carga.hidden = true;
    }

}


function mostrarErrorJugador(
    mensaje
) {

    const carga =
        document.getElementById(
            "jugador-cargando"
        );

    if (!carga) {
        return;
    }

    carga.hidden = false;

    carga.innerHTML = `
        <div class="container">
            <div class="alert alert-danger text-center mb-0">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                ${escaparJugador(
                    mensaje ||
                    "No fue posible cargar el perfil del jugador."
                )}
            </div>
        </div>
    `;

}


function obtenerParametroJugador(
    nombre
) {

    const parametros =
        new URLSearchParams(
            window.location.search
        );

    return parametros.get(
        nombre
    );

}


function colocarTextoJugador(
    id,
    valor
) {

    const elemento =
        document.getElementById(
            id
        );

    if (!elemento) {
        return;
    }

    elemento.textContent =
        valor ?? "";

}


function escaparJugador(
    valor
) {

    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


console.log(
    "👤 Perfil público deportivo V2 cargado."
);
