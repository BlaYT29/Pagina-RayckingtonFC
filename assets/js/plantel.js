/* ===================================================
   RAYCKINGTON FC
   PLANTEL.JS · PLANTEL PÚBLICO V2
   Supabase = nómina y ficha deportiva oficial
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

const RUTA_PLANTEL =
    "assets/data/plantel/plantel.json";

// El SQL histórico contiene el acumulado de las primeras dos fechas.
// Solo se suman registros oficiales del Clausura fechados DESPUÉS del corte.
const FIN_ACUMULADO_CLAUSURA = "2026-10-11";

const FOTO_RESPALDO =
    "assets/img/jugadores/jugador-rayck-placeholder.svg";


/* ===================================================
   ESTADO GENERAL
=================================================== */

let datosPlantel = null;
let jugadoresPlantel = [];
let plantelOficialDisponible = false;
let estadisticasOficialesActivas = false;
let nombreCompeticionOficial = "";


/* ===================================================
   ORDEN DE LAS POSICIONES
=================================================== */

const ORDEN_POSICIONES = {

    PO: 1,

    DFC: 2,
    LI: 3,
    LD: 4,

    MCD: 5,
    MC: 6,
    MCO: 7,
    MD: 8,
    MI: 9,

    EXD: 10,
    EXI: 11,
    ED: 12,
    EI: 13,
    F9: 14,
    DC: 15

};


/* ===================================================
   GRUPOS PRINCIPALES
=================================================== */

const GRUPOS_PLANTEL = {

    arqueros: [
        "PO"
    ],

    defensas: [
        "DFC",
        "LI",
        "LD"
    ],

    mediocampistas: [
        "MCD",
        "MC",
        "MCO",
        "MD",
        "MI"
    ],

    delanteros: [
        "EXD",
        "EXI",
        "ED",
        "EI",
        "F9",
        "DC"
    ]

};


/* ===================================================
   INICIAR
=================================================== */

document.addEventListener(
    "DOMContentLoaded",
    iniciarPlantel
);


/* ===================================================
   INICIAR SISTEMA DEL PLANTEL
=================================================== */

async function iniciarPlantel() {

    try {

        datosPlantel =
            await cargarDatosPlantel();

        const jugadoresLegacy =
            Array.isArray(
                datosPlantel?.jugadores
            )
                ? datosPlantel.jugadores
                : [];

        const [oficiales, historicos] = await Promise.all([
            cargarPlantelOficial(),
            cargarHistoricosClausuraPlantel()
        ]);

        if (oficiales.length > 0) {

            plantelOficialDisponible = true;

            estadisticasOficialesActivas =
                oficiales.some(
                    jugador =>
                        Boolean(
                            jugador.modo_estadisticas_oficiales
                        )
                );

            nombreCompeticionOficial =
                oficiales.find(
                    jugador =>
                        jugador.competicion_nombre
                )?.competicion_nombre || "";

            // Completar fecha de ingreso, pierna y posición secundaria
            // sin cambiar ni duplicar las estadísticas oficiales.
            const camposPublicos = await cargarCamposPublicosPlantel();
            jugadoresPlantel =
                oficiales.map(
                    oficial => {
                        const extra = camposPublicos.get(oficial.id);
                        const combinado = extra ? {
                            ...oficial,
                            posicion_secundaria: extra.posicion_secundaria,
                            pierna_habil: extra.pierna_habil,
                            fecha_ingreso: extra.fecha_ingreso
                        } : oficial;
                        return combinarJugadorOficial(
                            combinado,
                            buscarJugadorLegacy(combinado, jugadoresLegacy),
                            historicos
                        );
                    }
                );

        } else {

            /*
             * Fallback seguro durante la migración.
             * Si Supabase no está disponible, el sitio público
             * continúa funcionando exactamente con plantel.json.
             */

            jugadoresPlantel =
                jugadoresLegacy.map(legacy =>
                    normalizarJugadorLegacy(
                        legacy,
                        historicos.get(legacy.slug)
                    )
                );

        }

        jugadoresPlantel =
            prepararJugadores(
                jugadoresPlantel
            );

        actualizarInformacionGeneral();

        renderizarPlantelCompleto();

        ocultarCargaPlantel();

        // La página se muestra inmediatamente con los acumulados.
        // Si ya existen registros posteriores aprobados, se actualizan
        // las tarjetas en segundo plano sin bloquear el render inicial.
        if (oficiales.length && historicos.size > 0) {
            actualizarAcumuladosClausuraPosteriores(historicos)
                .catch(error => console.warn(
                    "No se pudieron actualizar las estadísticas posteriores del plantel:",
                    error
                ));
        }

    } catch (error) {

        console.error(
            "Error al cargar el plantel:",
            error
        );

        mostrarErrorPlantel(
            "No fue posible cargar el plantel."
        );

    }

}


/* ===================================================
   CARGAR JSON DE COMPATIBILIDAD
=================================================== */

async function cargarDatosPlantel() {

    const respuesta =
        await fetch(
            RUTA_PLANTEL,
            {
                cache: "no-store"
            }
        );

    if (!respuesta.ok) {

        throw new Error(
            `Error ${respuesta.status} al cargar ${RUTA_PLANTEL}`
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
            "plantel.json debe incluir un arreglo llamado jugadores."
        );

    }

    return datos;

}


/* ===================================================
   CARGAR PLANTEL OFICIAL SUPABASE
=================================================== */

async function cargarPlantelOficial() {

    const {
        data,
        error
    } =
        await supabase.rpc(
            "obtener_plantel_publico"
        );

    if (error) {

        console.warn(
            "Supabase todavía no pudo alimentar el plantel público. Se mantiene plantel.json como respaldo:",
            error
        );

        return [];

    }

    return Array.isArray(data)
        ? data
        : [];

}


/* ===================================================
   CAMPOS DE FICHAS PÚBLICAS · UNA CONSULTA PARA EL PLANTEL
=================================================== */
async function cargarCamposPublicosPlantel() {
    const { data, error } = await supabase.rpc("obtener_campos_ficha_publica_v1");
    if (error) {
        console.warn("No se pudieron cargar los campos públicos del plantel:", error);
        return new Map();
    }
    return new Map((Array.isArray(data) ? data : [])
        .filter(fila => fila?.id)
        .map(fila => [fila.id, fila]));
}


/* ===================================================
   ACUMULADOS CLAUSURA DESDE SUPABASE (SOLO LECTURA)
=================================================== */

async function cargarHistoricosClausuraPlantel() {
    const { data, error } = await supabase
        .from("deportivo_estadisticas_historicas")
        .select("jugador_slug,partidos,titularidades,suplencias,minutos,goles,asistencias,amarillas,rojas,porterias_invictas,mvp")
        .eq("temporada", "Clausura 2026")
        .eq("competicion", "Liga Tobalaba Todo Competidor");

    if (error) {
        console.warn("No se pudo consultar el histórico del Clausura; el plantel mantiene su respaldo:", error);
        return new Map();
    }
    return new Map((data || []).map(fila => [fila.jugador_slug, fila]));
}

function convertirHistoricoAEstadisticas(fila) {
    return {
        partidos: Number(fila.partidos) || 0,
        titularidades: Number(fila.titularidades) || 0,
        suplencias: Number(fila.suplencias) || 0,
        minutos: Number(fila.minutos) || 0,
        goles: Number(fila.goles) || 0,
        asistencias: Number(fila.asistencias) || 0,
        amarillas: Number(fila.amarillas) || 0,
        rojas: Number(fila.rojas) || 0,
        mvp: Number(fila.mvp) || 0,
        porteriasInvictas: Number(fila.porterias_invictas) || 0,
        penalesAtajados: 0
    };
}


/* ===================================================
   CLAUSURA 2026 · ESTADÍSTICAS OFICIALES POSTERIORES
   Sin nuevo SQL, sin editar plantel.json y sin doble conteo.
   Se utiliza el mismo RPC público que usa jugador.js.
=================================================== */

function esNombreClausura2026(nombre = "") {
    const texto = String(nombre).toLowerCase();
    return texto.includes("clausura") && texto.includes("2026");
}

function esFilaOficialPosteriorClausura(fila) {
    if (!esNombreClausura2026(`${fila.competicion_nombre || ""} ${fila.temporada_nombre || ""}`)) {
        return false;
    }
    const fecha = String(fila.fecha_hora || "").slice(0, 10);
    // Si falta fecha, se excluye para prevenir duplicación.
    return Boolean(fecha) && fecha > FIN_ACUMULADO_CLAUSURA;
}

function combinarAcumuladoYPartidosPosteriores(historico, oficiales) {
    const total = convertirHistoricoAEstadisticas(historico);
    for (const fila of oficiales) {
        if (!esFilaOficialPosteriorClausura(fila)) continue;
        if (fila.jugo) total.partidos += 1;
        if (fila.jugo && fila.titular) total.titularidades += 1;
        if (fila.jugo && !fila.titular) total.suplencias += 1;
        total.minutos += Number(fila.minutos) || 0;
        total.goles += Number(fila.goles) || 0;
        total.asistencias += Number(fila.asistencias) || 0;
        total.amarillas += Number(fila.amarillas) || 0;
        total.rojas += Number(fila.rojas) || 0;
        total.mvp += fila.mvp ? 1 : 0;
        total.porteriasInvictas += fila.valla_invicta ? 1 : 0;
        total.penalesAtajados += Number(fila.penales_atajados) || 0;
    }
    return total;
}

async function actualizarAcumuladosClausuraPosteriores(historicos) {
    // El plantel es un resumen de la competición activa, no del historial
    // completo. No mezclamos estadísticas de Apertura o amistosos.
    if (!esNombreClausura2026(nombreCompeticionOficial)) return;

    const candidatos = jugadoresPlantel.filter(j =>
        j.usaHistoricoClausura && j.id && historicos.has(j.slug)
    );
    if (!candidatos.length) return;

    // Normalmente no hay fechas nuevas: una consulta ligera evita hacer
    // una petición por jugador innecesariamente.
    const partidos = await supabase.rpc("obtener_partidos_rayckington_web");
    if (!partidos.error && Array.isArray(partidos.data)) {
        const hayPartidosNuevos = partidos.data.some(p =>
            String(p.estado || "").toUpperCase() === "FINALIZADO" &&
            String(p.fecha_hora || "").slice(0, 10) > FIN_ACUMULADO_CLAUSURA
        );
        if (!hayPartidosNuevos) return;
    }

    // Limitar a cinco consultas simultáneas para cuidar el rendimiento.
    // Si falla una lectura, se conserva el acumulado anterior del jugador.
    let seActualizo = false;
    for (let i = 0; i < candidatos.length; i += 5) {
        const lote = candidatos.slice(i, i + 5);
        const resultados = await Promise.all(lote.map(async j => {
            const { data, error } = await supabase.rpc(
                "obtener_estadisticas_publicas_jugador",
                { p_jugador_id: j.id }
            );
            if (error || !Array.isArray(data)) return null;
            const posteriores = data.filter(esFilaOficialPosteriorClausura);
            if (!posteriores.length) return null;
            return {
                id: j.id,
                estadisticas: combinarAcumuladoYPartidosPosteriores(
                    historicos.get(j.slug), posteriores
                )
            };
        }));
        for (const resultado of resultados) {
            if (!resultado) continue;
            const jugador = jugadoresPlantel.find(j => j.id === resultado.id);
            if (jugador) {
                jugador.estadisticas = resultado.estadisticas;
                seActualizo = true;
            }
        }
    }
    if (seActualizo) renderizarPlantelCompleto();
}


/* ===================================================
   COMBINAR SUPABASE + COMPATIBILIDAD
=================================================== */

function combinarJugadorOficial(
    oficial,
    legacy,
    historicos
) {

    const posicion =
        oficial.posicion ||
        legacy?.posicion ||
        "";

    const usaEstadisticasOficiales =
        Boolean(
            oficial.modo_estadisticas_oficiales
        );

    const historico = historicos.get(legacy?.slug);
    // No se suma el total agregado del RPC al histórico: sus fechas 1 y 2
    // podrían estar incluidas. Las fechas posteriores se cargan aparte.
    const usarHistorico = Boolean(historico) && (
        !usaEstadisticasOficiales ||
        esNombreClausura2026(oficial.competicion_nombre || nombreCompeticionOficial)
    );

    const estadisticas =
        usarHistorico
            ? convertirHistoricoAEstadisticas(historico)
            : usaEstadisticasOficiales
            ? {
                partidos:
                    Number(oficial.partidos) || 0,

                titularidades:
                    Number(oficial.titularidades) || 0,

                minutos:
                    Number(oficial.minutos) || 0,

                goles:
                    Number(oficial.goles) || 0,

                asistencias:
                    Number(oficial.asistencias) || 0,

                amarillas:
                    Number(oficial.amarillas) || 0,

                rojas:
                    Number(oficial.rojas) || 0,

                mvp:
                    Number(oficial.mvp) || 0,

                porteriasInvictas:
                    Number(oficial.vallas_invictas) || 0,

                penalesAtajados:
                    Number(oficial.penales_atajados) || 0
            }
            : (
                legacy?.estadisticas ||
                {}
            );

    return {

        id:
            oficial.id,

        // Mantener el enlace clásico en las fichas que ya tenían JSON.
        tieneFichaLegacy: Boolean(legacy?.slug),

        slug:
            legacy?.slug ||
            crearSlugPlantel(
                oficial.nombre_deportivo ||
                oficial.nombre ||
                oficial.nombre_completo ||
                "jugador"
            ),

        nombre:
            oficial.nombre_deportivo ||
            oficial.nombre ||
            legacy?.nombre ||
            oficial.nombre_completo ||
            "Jugador",

        nombreCompleto:
            oficial.nombre_completo ||
            legacy?.nombreCompleto ||
            oficial.nombre ||
            legacy?.nombre ||
            "Jugador",

        numero:
            oficial.dorsal ??
            legacy?.numero ??
            "—",

        posicion,

        nombrePosicion:
            obtenerNombrePosicion(
                posicion
            ) ||
            legacy?.nombrePosicion ||
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
            legacy?.fechaNacimiento ||
            "",

        /*
         * ACTIVO/INACTIVO viene de Supabase.
         * El estado deportivo LESIONADO todavía vive en el JSON,
         * por eso se conserva temporalmente para jugadores activos.
         */
        estado:
            obtenerEstadoPublicoCombinado(
                oficial.estado,
                legacy?.estado
            ),

        categoria:
            legacy?.categoria ||
            "Adulta",

        capitan:
            Boolean(
                legacy?.capitan
            ),

        // La foto del portal personal NO debe publicarse.
        // Hasta tener foto_oficial separada, mostrar solo imágenes
        // seleccionadas por el club desde plantel.json.
        foto:
            obtenerFotoPublicaClub(
                legacy?.foto
            ),

        estadisticas,

        usaEstadisticasOficiales,
        usaHistoricoClausura: usarHistorico

    };

}


function normalizarJugadorLegacy(
    legacy,
    historico = null
) {

    return {

        ...legacy,

        foto:
            obtenerFotoPublicaClub(legacy?.foto),

        estadisticas:
            historico
                ? convertirHistoricoAEstadisticas(historico)
                : (legacy?.estadisticas || {}),

        usaEstadisticasOficiales:
            false

    };

}


/* ===================================================
   BUSCAR EQUIVALENTE LEGACY
=================================================== */

function buscarJugadorLegacy(
    oficial,
    jugadoresLegacy
) {

    const candidatos = [
        oficial.nombre_completo,
        oficial.nombre,
        oficial.nombre_deportivo
    ]
        .filter(Boolean)
        .map(normalizarTextoPlantel);

    return jugadoresLegacy.find(
        legacy => {

            const nombresLegacy = [
                legacy.nombreCompleto,
                legacy.nombre
            ]
                .filter(Boolean)
                .map(normalizarTextoPlantel);

            return candidatos.some(
                candidato =>
                    nombresLegacy.includes(
                        candidato
                    )
            );

        }
    ) || null;

}


/* ===================================================
   FOTO PÚBLICA DEL CLUB
   No leer foto_path (foto personal del Portal Deportivo).
   Se conserva la fotografía curada en plantel.json o el avatar.
=================================================== */

function obtenerFotoPublicaClub(fotoLegacy) {
    const ruta = String(fotoLegacy || "").trim();
    if (!ruta || /jugador-default\.webp(?:[?#]|$)/i.test(ruta)) {
        return FOTO_RESPALDO;
    }
    // Exclusivamente rutas del JSON seleccionadas por el club.
    return ruta;
}


/* ===================================================
   ESTADO PÚBLICO TEMPORAL
=================================================== */

function obtenerEstadoPublicoCombinado(
    estadoOficial,
    estadoLegacy
) {

    const oficial =
        String(
            estadoOficial ||
            "ACTIVO"
        ).toUpperCase();

    if (oficial === "INACTIVO") {
        return "INACTIVO";
    }

    const legacy =
        String(
            estadoLegacy ||
            ""
        ).toUpperCase();

    if (
        legacy === "LESIONADO" ||
        legacy === "DISPONIBLE"
    ) {
        return legacy;
    }

    return "DISPONIBLE";

}


/* ===================================================
   PREPARAR JUGADORES
=================================================== */

function prepararJugadores(
    jugadores
) {

    return jugadores

        .filter(
            jugador =>
                jugador &&
                String(
                    jugador.estado ||
                    ""
                ).toUpperCase() !==
                    "INACTIVO"
        )

        .sort(
            (jugadorA, jugadorB) => {

                const ordenA =
                    ORDEN_POSICIONES[
                        jugadorA.posicion
                    ] || 99;

                const ordenB =
                    ORDEN_POSICIONES[
                        jugadorB.posicion
                    ] || 99;

                if (ordenA !== ordenB) {
                    return ordenA - ordenB;
                }

                const numeroA =
                    Number(
                        jugadorA.numero
                    ) || 999;

                const numeroB =
                    Number(
                        jugadorB.numero
                    ) || 999;

                if (numeroA !== numeroB) {
                    return numeroA - numeroB;
                }

                return String(
                    jugadorA.nombre || ""
                ).localeCompare(
                    String(
                        jugadorB.nombre || ""
                    ),
                    "es"
                );

            }
        );

}


/* ===================================================
   ACTUALIZAR INFORMACIÓN GENERAL
=================================================== */

function actualizarInformacionGeneral() {

    let temporada =
        datosPlantel?.temporada ||
        "Temporada 2026";

    if (
        estadisticasOficialesActivas &&
        nombreCompeticionOficial
    ) {

        temporada =
            nombreCompeticionOficial
                .replace(
                    /^Torneo\s+/i,
                    ""
                );

    }

    const disponibles =
        jugadoresPlantel.filter(
            jugador =>
                jugador.estado ===
                "DISPONIBLE"
        ).length;

    const lesionados =
        jugadoresPlantel.filter(
            jugador =>
                jugador.estado ===
                "LESIONADO"
        ).length;

    colocarTextoPlantel(
        "plantel-temporada",
        temporada
    );
    colocarTextoPlantel("ranking-temporada", temporada);

    colocarTextoPlantel(
        "total-jugadores",
        jugadoresPlantel.length
    );

    colocarTextoPlantel(
        "jugadores-disponibles",
        disponibles
    );

    colocarTextoPlantel(
        "jugadores-lesionados",
        lesionados
    );

}


/* ===================================================
   RENDERIZAR PLANTEL COMPLETO
=================================================== */

function renderizarPlantelCompleto() {

    renderizarGrupoPlantel(
        "arqueros-listado",
        GRUPOS_PLANTEL.arqueros
    );

    renderizarGrupoPlantel(
        "defensas-listado",
        GRUPOS_PLANTEL.defensas
    );

    renderizarGrupoPlantel(
        "mediocampistas-listado",
        GRUPOS_PLANTEL.mediocampistas
    );

    renderizarGrupoPlantel(
        "delanteros-listado",
        GRUPOS_PLANTEL.delanteros
    );

    renderizarRankingsPlantel();

}


/* ===================================================
   RANKINGS PÚBLICOS · COMPETICIÓN ACTIVA
   Solo sobre jugadores preparados y cifras públicas ya consolidadas.
   No pide permisos financieros ni calcula valores de partidos no aprobados.
=================================================== */

const RANKING_CATEGORIAS = [
    { titulo: "Goleadores", etiqueta: "Goles", campo: "goles", icono: "bi-bullseye", unidad: "goles" },
    { titulo: "Asistidores", etiqueta: "Asistencias", campo: "asistencias", icono: "bi-stars", unidad: "asistencias" },
    { titulo: "Más minutos", etiqueta: "Minutos", campo: "minutos", icono: "bi-stopwatch", unidad: "min" },
    { titulo: "Más partidos", etiqueta: "Participaciones", campo: "partidos", icono: "bi-calendar-check", unidad: "PJ" },
    { titulo: "Más MVP", etiqueta: "Distinciones", campo: "mvp", icono: "bi-trophy", unidad: "MVP" },
    { titulo: "Vallas invictas", etiqueta: "Arqueros", campo: "porteriasInvictas", icono: "bi-shield-check", unidad: "vallas", arqueros: true }
];

function renderizarRankingsPlantel() {
    const contenedor = document.getElementById("rankings-listado");
    if (!contenedor) return;

    contenedor.innerHTML = RANKING_CATEGORIAS.map(categoria => {
        const elegibles = jugadoresPlantel
            .filter(jugador => !categoria.arqueros || jugador.posicion === "PO")
            .filter(jugador => Number(jugador.estadisticas?.[categoria.campo]) > 0)
            .sort((a, b) => {
                const diferencia = (Number(b.estadisticas?.[categoria.campo]) || 0) - (Number(a.estadisticas?.[categoria.campo]) || 0);
                return diferencia || String(a.nombre || "").localeCompare(String(b.nombre || ""), "es");
            })
            .slice(0, 5);

        const lista = elegibles.length
            ? `<ol class="rayck-ranking-list">${elegibles.map((jugador, indice) => `
                <li>
                    <a class="rayck-ranking-player" href="${escaparPlantel(crearEnlacePerfilJugador(jugador))}">
                        <span class="rayck-ranking-place">${indice + 1}</span>
                        <img src="${escaparPlantel(jugador.foto || FOTO_RESPALDO)}"
                            alt="" loading="lazy" onerror="this.onerror=null;this.src='${FOTO_RESPALDO}'">
                        <span class="rayck-ranking-name">${escaparPlantel(jugador.nombre || "Jugador")}</span>
                        <strong>${obtenerNumeroSeguro(jugador.estadisticas?.[categoria.campo])}<small>${categoria.unidad}</small></strong>
                    </a>
                </li>`).join("")}</ol>`
            : '<div class="rayck-ranking-empty">Aún no hay registros confirmados en esta categoría.</div>';

        return `<article class="rayck-ranking-card">
            <div class="rayck-ranking-card-head">
                <span class="rayck-ranking-icon"><i class="bi ${categoria.icono}" aria-hidden="true"></i></span>
                <div><small>${categoria.etiqueta}</small><h3>${categoria.titulo}</h3></div>
            </div>
            ${lista}
        </article>`;
    }).join("");
}

/* ===================================================
   RENDERIZAR GRUPO
=================================================== */

function renderizarGrupoPlantel(
    idContenedor,
    posicionesPermitidas
) {

    const contenedor =
        document.getElementById(
            idContenedor
        );

    if (!contenedor) {
        return;
    }

    const jugadores =
        jugadoresPlantel.filter(
            jugador =>
                posicionesPermitidas.includes(
                    jugador.posicion
                )
        );

    contenedor.innerHTML = "";

    if (!jugadores.length) {

        contenedor.innerHTML = `
            <div class="col-12">
                <div class="plantel-empty-state">
                    No hay jugadores registrados en esta posición.
                </div>
            </div>
        `;

        return;

    }

    jugadores.forEach(
        jugador => {

            const columna =
                document.createElement(
                    "div"
                );

            columna.className =
                "col-lg-4 col-md-6";

            columna.innerHTML =
                crearTarjetaJugador(
                    jugador
                );

            contenedor.appendChild(
                columna
            );

        }
    );

}


/* ===================================================
   CREAR TARJETA DE JUGADOR
=================================================== */

function crearTarjetaJugador(
    jugador
) {

    const edad =
        calcularEdad(
            jugador.fechaNacimiento
        );

    const estado =
        obtenerEstadoJugador(
            jugador.estado
        );

    const estadisticas =
        jugador.estadisticas || {};

    return `

        <article class="player-card">

            <div class="player-image">

                <img
                    src="${escaparPlantel(
                        jugador.foto
                    )}"
                    alt="${escaparPlantel(
                        jugador.nombre
                    )}"
                    loading="lazy"
                    onerror="
                        this.onerror=null;
                        this.src='${FOTO_RESPALDO}';
                    ">

                <span class="player-number">
                    ${escaparPlantel(
                        jugador.numero
                    )}
                </span>

                <span
                    class="player-status ${estado.clase}">

                    <i class="${estado.icono}"></i>
                    ${estado.texto}

                </span>

                ${
                    jugador.capitan
                        ? `
                            <span
                                class="player-captain"
                                title="Capitán del equipo">

                                <i class="bi bi-award-fill"></i>
                                Capitán

                            </span>
                        `
                        : ""
                }

            </div>

            <div class="player-content">

                <span class="player-position">
                    ${escaparPlantel(
                        jugador.nombrePosicion ||
                        jugador.posicion ||
                        "Por definir"
                    )}
                </span>

                <h3>
                    ${escaparPlantel(
                        jugador.nombre
                    )}
                </h3>

                <div class="player-info">

                    <span>
                        <i class="bi bi-person-fill me-2"></i>
                        ${
                            edad !== null
                                ? `${edad} años`
                                : "Edad por confirmar"
                        }
                    </span>

                    <span>
                        <i class="bi bi-shield-fill me-2"></i>
                        ${escaparPlantel(
                            jugador.categoria ||
                            "Adulta"
                        )}
                    </span>

                </div>

                <div class="player-stats">

                    <div class="player-stat">
                        <strong>
                            ${obtenerNumeroSeguro(
                                estadisticas.partidos
                            )}
                        </strong>
                        <span>Partidos</span>
                    </div>

                    <div class="player-stat">
                        <strong>
                            ${obtenerNumeroSeguro(
                                estadisticas.goles
                            )}
                        </strong>
                        <span>Goles</span>
                    </div>

                    <div class="player-stat">
                        <strong>
                            ${obtenerNumeroSeguro(
                                estadisticas.asistencias
                            )}
                        </strong>
                        <span>Asistencias</span>
                    </div>

                </div>

                <a
                    href="${escaparPlantel(crearEnlacePerfilJugador(
                        jugador
                    ))}"
                    class="btn btn-primary-club player-profile-button">

                    Ver perfil
                    <i class="bi bi-arrow-right ms-2"></i>

                </a>

            </div>

        </article>

    `;

}


/* ===================================================
   NOMBRE DE POSICIÓN
=================================================== */

function obtenerNombrePosicion(
    posicion
) {

    const posiciones = {

        PO: "Arquero",

        DFC: "Defensa central",
        LI: "Lateral izquierdo",
        LD: "Lateral derecho",

        MCD: "Mediocampista defensivo",
        MC: "Mediocampista",
        MCO: "Mediocampista ofensivo",
        MD: "Mediocampista derecho",
        MI: "Mediocampista izquierdo",

        EXD: "Extremo derecho",
        EXI: "Extremo izquierdo",
        ED: "Extremo derecho",
        EI: "Extremo izquierdo",
        F9: "Falso 9",
        DC: "Delantero centro"

    };

    return posiciones[
        String(
            posicion || ""
        ).toUpperCase()
    ] || "";

}


/* ===================================================
   ESTADO DEL JUGADOR
=================================================== */

function obtenerEstadoJugador(
    estado
) {

    const valor =
        String(
            estado ||
            "DISPONIBLE"
        ).toUpperCase();

    const estados = {

        DISPONIBLE: {
            texto: "Disponible",
            clase: "status-available",
            icono: "bi bi-check-circle-fill"
        },

        ACTIVO: {
            texto: "Disponible",
            clase: "status-available",
            icono: "bi bi-check-circle-fill"
        },

        LESIONADO: {
            texto: "Lesionado",
            clase: "status-injured",
            icono: "bi bi-bandaid-fill"
        },

        INACTIVO: {
            texto: "Inactivo",
            clase: "status-inactive",
            icono: "bi bi-dash-circle-fill"
        }

    };

    return (
        estados[valor] ||
        estados.DISPONIBLE
    );

}


/* ===================================================
   CREAR ENLACE AL PERFIL
=================================================== */

function crearEnlacePerfilJugador(jugador) {
    // No cambiar enlaces históricos que ya funcionan con plantel.json.
    if (jugador?.tieneFichaLegacy && jugador?.slug) {
        return `jugador.html?slug=${encodeURIComponent(jugador.slug)}`;
    }
    // Los fichajes nuevos usan su UUID estable de Supabase.
    if (jugador?.id &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(jugador.id))) {
        return `jugador.html?id=${encodeURIComponent(jugador.id)}`;
    }
    // Enlace legacy para un plantel cargado desde el JSON de respaldo.
    return `jugador.html?slug=${encodeURIComponent(jugador?.slug || "")}`;
}


/* ===================================================
   SLUG DE RESPALDO
=================================================== */

function crearSlugPlantel(
    valor
) {

    return normalizarTextoPlantel(
        valor
    )
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") ||
        "jugador";

}


/* ===================================================
   NORMALIZAR TEXTO PARA MATCH
=================================================== */

function normalizarTextoPlantel(
    valor
) {

    return String(
        valor || ""
    )
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

}


/* ===================================================
   CALCULAR EDAD
=================================================== */

function calcularEdad(
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


/* ===================================================
   NÚMERO SEGURO
=================================================== */

function obtenerNumeroSeguro(
    valor
) {

    const numero =
        Number(
            valor
        );

    return Number.isFinite(
        numero
    )
        ? numero
        : 0;

}


/* ===================================================
   OCULTAR CARGA DEL PLANTEL
=================================================== */

function ocultarCargaPlantel() {

    const carga =
        document.getElementById(
            "plantel-cargando"
        );

    if (carga) {
        carga.hidden = true;
    }

}


/* ===================================================
   MOSTRAR ERROR DEL PLANTEL
=================================================== */

function mostrarErrorPlantel(
    mensaje
) {

    const carga =
        document.getElementById(
            "plantel-cargando"
        );

    if (!carga) {
        return;
    }

    carga.hidden = false;

    carga.innerHTML = `

        <div class="container">

            <div class="alert alert-danger text-center mb-0">

                <i class="bi bi-exclamation-triangle-fill me-2"></i>

                ${escaparPlantel(
                    mensaje ||
                    "No fue posible cargar el plantel."
                )}

            </div>

        </div>

    `;

}


/* ===================================================
   COLOCAR TEXTO EN EL HTML
=================================================== */

function colocarTextoPlantel(
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


/* ===================================================
   ESCAPAR TEXTO
=================================================== */

function escaparPlantel(
    valor
) {

    return String(
        valor ?? ""
    )
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* ===================================================
   DEPURACIÓN
=================================================== */

console.log(
    "⚽ Plantel público conectado a Supabase."
);
