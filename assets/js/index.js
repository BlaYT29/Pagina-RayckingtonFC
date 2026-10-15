/* ===================================================
   RAYCKINGTON FC
   INDEX.JS
=================================================== */

"use strict";

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL_INICIO = "https://auutiadcyhhwxzkeernd.supabase.co";
const SUPABASE_KEY_INICIO = "sb_publishable_luWCBHYOSUsFbmgPU4GoiQ_9nmBMRHe";
// Consultas públicas aisladas de la sesión de los portales privados.
// Evita que un token viejo en el teléfono afecte Inicio.
const supabaseInicio = createClient(SUPABASE_URL_INICIO, SUPABASE_KEY_INICIO, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
    }
});



/* ===================================================
   RUTAS GENERALES
=================================================== */

const RUTAS_INICIO = {

    inicio:
        "assets/data/inicio/inicio.json",

    plantel:
        "assets/data/plantel/plantel.json",

    noticias:
        "assets/data/noticias/noticias.json",

    galeria:
        "assets/data/galeria/galeria.json",

    sponsors:
        "assets/data/sponsors/sponsors.json"

};


const LOGO_RAYCKINGTON =
    "assets/img/logo/logo.png";

const LOGO_RIVAL_DEFAULT =
    "assets/img/logo/rivales/rival-default.svg";

const FOTO_JUGADOR_DEFAULT =
    "assets/img/jugadores/jugador-default.webp";

const IMAGEN_NOTICIA_DEFAULT =
    "assets/img/noticias/noticia-default.webp";

const IMAGEN_GALERIA_DEFAULT =
    "assets/img/gallery/galeria-default.webp";


/* ===================================================
   ESTADO GENERAL DEL INICIO
=================================================== */

let datosInicio = null;

let datosPlantelInicio = null;

let noticiasInicio = [];

let galeriaInicio = [];

let sponsorsInicio = [];

let datosCompeticionesInicio = {
    competiciones: []
};

let competicionesCargadasInicio = [];

let todosLosPartidosInicio = [];

let todasLasEstadisticasInicio = [];

let modoDeportivoSupabaseInicio = false;
let competicionesSupabaseInicio = [];
let partidosSupabaseInicio = [];
let intervaloDeportivoInicio = null;
let intervaloRelojInicio = null;


/* ===================================================
   INICIAR PORTADA
=================================================== */

document.addEventListener(
    "DOMContentLoaded",
    iniciarPaginaInicio
);


/* ===================================================
   CARGAR TODA LA INFORMACIÓN
=================================================== */

async function iniciarPaginaInicio() {

    try {

        datosInicio =
            await cargarJsonInicio(
                RUTAS_INICIO.inicio
            );

        const configuracionTemporadas =
            obtenerConfiguracionTemporadasInicio();

        const rutaBaseAnio =
            construirRutaBaseAnioInicio(
                configuracionTemporadas.anioActivo
            );

        const rutaCompeticiones =
            `${rutaBaseAnio}/${configuracionTemporadas.archivoCompeticiones}`;

        const resultadosGenerales =
            await Promise.all([

                cargarJsonSeguroInicio(
                    RUTAS_INICIO.plantel,
                    {
                        jugadores: []
                    }
                ),

                cargarJsonSeguroInicio(
                    RUTAS_INICIO.noticias,
                    []
                ),

                cargarJsonSeguroInicio(
                    RUTAS_INICIO.galeria,
                    []
                ),

                cargarJsonSeguroInicio(
                    RUTAS_INICIO.sponsors,
                    {
                        patrocinadores: []
                    }
                ),

                cargarJsonSeguroInicio(
                    rutaCompeticiones,
                    {
                        anio:
                            configuracionTemporadas.anioActivo,

                        competiciones: []
                    }
                )

            ]);

        datosPlantelInicio =
            resultadosGenerales[0];

        noticiasInicio =
            resultadosGenerales[1];

        galeriaInicio =
            resultadosGenerales[2];

        sponsorsInicio =
            resultadosGenerales[3];

        datosCompeticionesInicio =
            resultadosGenerales[4];

        await cargarCompeticionesInicio(
            rutaBaseAnio
        );

        /*
         * Supabase pasa a ser la fuente prioritaria de partidos,
         * resultados y tabla. Si todavía no hay competición pública
         * (o no estamos autenticados como admin para previsualizar),
         * la portada conserva automáticamente los JSON actuales.
         */
        await cargarDeportivoSupabaseInicio();

        prepararPaginaInicio();

        iniciarActualizacionDeportivoInicio();

    } catch (error) {

        console.error(
            "Error al iniciar la portada:",
            error
        );

        mostrarErrorGeneralInicio();

    }

}


/* ===================================================
   CARGAR TODAS LAS COMPETICIONES
=================================================== */

async function cargarCompeticionesInicio(
    rutaBaseAnio
) {

    const competiciones =
        Array.isArray(
            datosCompeticionesInicio?.competiciones
        )
            ? datosCompeticionesInicio.competiciones
            : [];

    const disponibles =
        competiciones

            .filter(
                competicion =>
                    competicion &&
                    (
                        competicion.activa === true ||
                        competicion.mostrarEnInicio === true ||
                        competicion.usarParaResultados === true
                    )
            )

            .sort(
                (competicionA, competicionB) =>
                    obtenerNumeroInicio(
                        competicionA.orden
                    ) -
                    obtenerNumeroInicio(
                        competicionB.orden
                    )
            );

    const cargas =
        disponibles.map(
            async competicion => {

                const rutaCompeticion =
                    `${rutaBaseAnio}/${competicion.id}`;

                const datos =
                    await Promise.all([

                        cargarJsonSeguroInicio(
                            `${rutaCompeticion}/config.json`,
                            null
                        ),

                        cargarJsonSeguroInicio(
                            `${rutaCompeticion}/fixture.json`,
                            []
                        ),

                        cargarJsonSeguroInicio(
                            `${rutaCompeticion}/estadisticas.json`,
                            null
                        )

                    ]);

                return {

                    ...competicion,

                    ruta:
                        rutaCompeticion,

                    config:
                        datos[0],

                    fixture:
                        Array.isArray(datos[1])
                            ? datos[1]
                            : [],

                    estadisticas:
                        datos[2]

                };

            }
        );

    competicionesCargadasInicio =
        await Promise.all(
            cargas
        );

    todosLosPartidosInicio =
        competicionesCargadasInicio
            .flatMap(
                competicion =>
                    competicion.fixture.map(
                        partido => ({

                            ...partido,

                            competicionId:
                                competicion.id,

                            competicionConfig:
                                competicion.config,

                            mostrarEnInicio:
                                competicion.mostrarEnInicio === true,

                            usarParaResultados:
                                competicion.usarParaResultados === true

                        })
                    )
            );

    todasLasEstadisticasInicio =
        competicionesCargadasInicio

            .filter(
                competicion =>
                    competicion.estadisticas
            )

            .map(
                competicion => ({

                    competicionId:
                        competicion.id,

                    activa:
                        competicion.activa === true,

                    estadisticas:
                        competicion.estadisticas

                })
            );

}



/* ===================================================
   DEPORTIVO DESDE SUPABASE
=================================================== */

async function cargarDeportivoSupabaseInicio() {

    try {

        const {
            data: competiciones,
            error: errorCompeticiones
        } = await supabaseInicio.rpc(
            "obtener_competiciones_web"
        );

        if (errorCompeticiones) {
            throw errorCompeticiones;
        }

        const listaCompeticiones =
            Array.isArray(competiciones)
                ? competiciones
                : [];

        if (listaCompeticiones.length === 0) {

            modoDeportivoSupabaseInicio = false;

            return false;
        }

        const {
            data: partidos,
            error: errorPartidos
        } = await supabaseInicio.rpc(
            "obtener_partidos_rayckington_web"
        );

        if (errorPartidos) {
            throw errorPartidos;
        }

        competicionesSupabaseInicio =
            listaCompeticiones;

        partidosSupabaseInicio =
            Array.isArray(partidos)
                ? partidos
                : [];

        todosLosPartidosInicio =
            partidosSupabaseInicio.map(
                normalizarPartidoSupabaseInicio
            );

        try {
            await cargarTablaSupabaseInicio();
        } catch (errorTabla) {
            console.warn("La tabla de posiciones no está disponible en Inicio:", errorTabla);
        }

        modoDeportivoSupabaseInicio = true;

        return true;

    } catch (error) {

        console.warn(
            "Supabase deportivo no disponible en Inicio. Se mantienen los JSON:",
            error
        );

        modoDeportivoSupabaseInicio = false;

        return false;
    }

}


async function cargarTablaSupabaseInicio() {

    const competicionLiga =
        competicionesSupabaseInicio
            .filter(
                item =>
                    String(item.tipo || "").toUpperCase() === "LIGA"
            )
            .sort(
                (a, b) => {

                    const activaA =
                        String(a.estado || "").toUpperCase() === "ACTIVA"
                            ? 1
                            : 0;

                    const activaB =
                        String(b.estado || "").toUpperCase() === "ACTIVA"
                            ? 1
                            : 0;

                    if (activaA !== activaB) {
                        return activaB - activaA;
                    }

                    return (
                        Number(b.temporada_anio || 0) -
                        Number(a.temporada_anio || 0)
                    );
                }
            )[0];

    if (!competicionLiga) {
        return;
    }

    const {
        data: tabla,
        error
    } = await supabaseInicio.rpc(
        "obtener_tabla_competicion_publica",
        {
            p_competicion_id:
                competicionLiga.id
        }
    );

    if (error) {
        console.warn(
            "No se pudo cargar tabla pública en Inicio:",
            error
        );
        return;
    }

    const filaRayckington =
        (Array.isArray(tabla) ? tabla : [])
            .find(
                fila =>
                    normalizarTextoEquipoInicio(
                        fila.equipo
                    ) === "rayckington fc"
            );

    if (!filaRayckington) {
        return;
    }

    todasLasEstadisticasInicio = [
        {
            competicionId:
                competicionLiga.id,

            activa:
                String(
                    competicionLiga.estado || ""
                ).toUpperCase() === "ACTIVA",

            estadisticas: {
                posicion:
                    filaRayckington.posicion,

                pj:
                    filaRayckington.pj,

                pg:
                    filaRayckington.pg,

                pe:
                    filaRayckington.pe,

                pp:
                    filaRayckington.pp,

                gf:
                    filaRayckington.gf,

                gc:
                    filaRayckington.gc,

                dg:
                    filaRayckington.dg,

                pts:
                    filaRayckington.puntos
            }
        }
    ];

}


function normalizarPartidoSupabaseInicio(
    partido
) {

    const rayckingtonLocal =
        String(
            partido.condicion || ""
        ).toUpperCase() === "LOCAL";

    const fechaHora =
        partido.fecha_hora
            ? new Date(partido.fecha_hora)
            : null;

    const fechaPartido =
        fechaHora && !Number.isNaN(fechaHora.getTime())
            ? (() => {
                const piezas = Object.fromEntries(
                    new Intl.DateTimeFormat("es-CL", {
                        timeZone: "America/Santiago", year: "numeric", month: "2-digit", day: "2-digit"
                    }).formatToParts(fechaHora).map(pieza => [pieza.type, pieza.value])
                );
                return `${piezas.year}-${piezas.month}-${piezas.day}`;
            })()
            : "";

    const hora =
        fechaHora &&
        !Number.isNaN(fechaHora.getTime())
            ? fechaHora.toLocaleTimeString(
                "es-CL",
                {
                    hour: "2-digit", minute: "2-digit", hour12: false,
                    timeZone: "America/Santiago"
                }
            )
            : "Horario por confirmar";

    return {

        id:
            partido.id,

        estado:
            traducirEstadoSupabaseInicio(
                partido.estado
            ),

        estadoSupabase:
            partido.estado,

        competencia:
            partido.competicion_nombre ||
            "Partido de Rayckington FC",

        temporada:
            partido.temporada_nombre ||
            "Temporada 2026",

        tipoCompeticion:
            partido.competicion_tipo ||
            "",

        competicionId:
            partido.competicion_id ||
            "",

        mostrarEnInicio:
            true,

        usarParaResultados:
            true,

        fechaPartido,

        hora,

        estadio:
            partido.lugar ||
            "Recinto por confirmar",

        local:
            rayckingtonLocal
                ? "Rayckington FC"
                : partido.rival_nombre,

        visita:
            rayckingtonLocal
                ? partido.rival_nombre
                : "Rayckington FC",

        golesLocal:
            rayckingtonLocal
                ? partido.goles_rayckington
                : partido.goles_rival,

        golesVisita:
            rayckingtonLocal
                ? partido.goles_rival
                : partido.goles_rayckington,

        minutoActual:
            partido.minuto_actual,

        periodoPartido:
            partido.periodo_partido,

        cronometroInicioAt:
            partido.cronometro_inicio_at,

        cronometroSegundosAcumulados:
            partido.cronometro_segundos_acumulados,

        cronometroCorriendo:
            partido.cronometro_corriendo,

        duracionMinutos:
            partido.duracion_minutos,

        duracionPrimerTiempo:
            partido.duracion_primer_tiempo
    };

}


function traducirEstadoSupabaseInicio(
    estado
) {

    const valor =
        String(
            estado || ""
        ).toUpperCase();

    const estados = {
        PROGRAMADO:
            "Programado",

        EN_VIVO:
            "En juego",

        ENTRETIEMPO:
            "En juego",

        FINALIZADO:
            "Finalizado",

        SUSPENDIDO:
            "Suspendido",

        CANCELADO:
            "Cancelado"
    };

    return (
        estados[valor] ||
        estado ||
        "Programado"
    );

}


function fechaLocalISOInicio(
    fecha
) {

    const anio =
        fecha.getFullYear();

    const mes =
        String(
            fecha.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const dia =
        String(
            fecha.getDate()
        ).padStart(
            2,
            "0"
        );

    return `${anio}-${mes}-${dia}`;

}


function partidoEnDirectoInicio(
    partido
) {

    const estado =
        String(
            partido?.estadoSupabase ||
            partido?.estado ||
            ""
        )
            .trim()
            .toLowerCase();

    return (
        estado === "en_vivo" ||
        estado === "entretiempo" ||
        estado.includes("en juego") ||
        estado.includes("en vivo") ||
        estado.includes("en directo") ||
        estado.includes("en curso")
    );

}


function obtenerSegundosRelojInicio(
    partido
) {

    let segundos =
        Number(
            partido?.cronometroSegundosAcumulados ??
            partido?.cronometro_segundos_acumulados ??
            0
        );

    if (!Number.isFinite(segundos)) {
        segundos = 0;
    }

    const corriendo =
        Boolean(
            partido?.cronometroCorriendo ??
            partido?.cronometro_corriendo
        );

    const inicio =
        partido?.cronometroInicioAt ??
        partido?.cronometro_inicio_at;

    if (
        corriendo &&
        inicio
    ) {

        const inicioMs =
            new Date(
                inicio
            ).getTime();

        if (!Number.isNaN(inicioMs)) {

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

    return segundos;

}


function formatearRelojInicio(
    partido
) {

    const segundos =
        obtenerSegundosRelojInicio(
            partido
        );

    const minutos =
        Math.floor(
            segundos / 60
        );

    const resto =
        segundos % 60;

    return (
        `${String(minutos).padStart(2, "0")}:` +
        `${String(resto).padStart(2, "0")}`
    );

}


function etiquetaPeriodoInicio(
    partido
) {

    const periodo =
        String(
            partido?.periodoPartido ||
            partido?.periodo_partido ||
            ""
        ).toUpperCase();

    const etiquetas = {
        PREVIA:
            "PREVIA",

        PRIMER_TIEMPO:
            "1ER TIEMPO",

        ENTRETIEMPO:
            "ENTRETIEMPO",

        SEGUNDO_TIEMPO:
            "2º TIEMPO",

        FINALIZADO:
            "FINAL"
    };

    return (
        etiquetas[periodo] ||
        "EN VIVO"
    );

}


function textoRelojPartidoInicio(
    partido
) {

    if (!partidoEnDirectoInicio(partido)) {
        return "";
    }

    return (
        `${etiquetaPeriodoInicio(partido)} · ` +
        `${formatearRelojInicio(partido)}`
    );

}


function iniciarActualizacionDeportivoInicio() {

    if (
        intervaloDeportivoInicio
    ) {
        clearInterval(
            intervaloDeportivoInicio
        );
    }

    if (
        intervaloRelojInicio
    ) {
        clearInterval(
            intervaloRelojInicio
        );
    }

    intervaloRelojInicio =
        window.setInterval(
            actualizarRelojesVisiblesInicio,
            1000
        );

    intervaloDeportivoInicio =
        window.setInterval(
            async () => {

                if (
                    !modoDeportivoSupabaseInicio
                ) {
                    return;
                }

                const actualizado =
                    await cargarDeportivoSupabaseInicio();

                if (!actualizado) {
                    return;
                }

                renderizarPartidosInicio();

                renderizarEstadisticasInicio();

            },
            10000
        );

}


function actualizarRelojesVisiblesInicio() {

    const partido =
        buscarProximoPartidoInicio();

    if (
        !partido ||
        !partidoEnDirectoInicio(partido)
    ) {
        return;
    }

    const texto =
        textoRelojPartidoInicio(
            partido
        );

    [
        "hero-live-clock",
        "inicio-live-clock"
    ].forEach(
        id => {

            const elemento =
                document.getElementById(
                    id
                );

            if (elemento) {
                elemento.textContent =
                    texto;
            }
        }
    );

}



/* ===================================================
   PREPARAR TODA LA PORTADA
=================================================== */

function prepararPaginaInicio() {

    renderizarHeroInicio();

    renderizarPartidosInicio();

    renderizarEstadisticasInicio();

    renderizarHistoriaInicio();

    renderizarJugadoresDestacadosInicio();

    renderizarNoticiasInicio();

    renderizarGaleriaInicio();

    renderizarSponsorsInicio();

    ocultarCargaInicio();

}


/* ===================================================
   CONFIGURACIÓN DE TEMPORADAS
=================================================== */

function obtenerConfiguracionTemporadasInicio() {

    const temporadas =
        datosInicio
            ?.configuracion
            ?.temporadas ||
        {};

    return {

        anioActivo:
            Number(
                temporadas.anioActivo
            ) || 2026,

        archivoCompeticiones:
            String(
                temporadas.archivoCompeticiones ||
                "competiciones.json"
            ).trim()

    };

}


/* ===================================================
   RUTA BASE DEL AÑO
=================================================== */

function construirRutaBaseAnioInicio(
    anio
) {

    return (
        `assets/data/temporadas/${anio}`
    );

}


/* ===================================================
   CARGAR JSON OBLIGATORIO
=================================================== */

async function cargarJsonInicio(
    ruta
) {

    const respuesta =
        await fetch(
            ruta,
            {
                cache: "no-store"
            }
        );

    if (!respuesta.ok) {

        throw new Error(
            `Error ${respuesta.status} al cargar ${ruta}`
        );

    }

    return respuesta.json();

}


/* ===================================================
   CARGAR JSON SIN DETENER LA PÁGINA
=================================================== */

async function cargarJsonSeguroInicio(
    ruta,
    respaldo
) {

    try {

        const respuesta =
            await fetch(
                ruta,
                {
                    cache: "no-store"
                }
            );

        if (!respuesta.ok) {

            console.warn(
                `No se pudo cargar ${ruta}. ` +
                "Se utilizará información de respaldo."
            );

            return respaldo;

        }

        return await respuesta.json();

    } catch (error) {

        console.warn(
            `Error al leer ${ruta}:`,
            error
        );

        return respaldo;

    }

}


/* ===================================================
   LOGOS DE EQUIPOS
=================================================== */

const LOGOS_EQUIPOS_INICIO = {
    "rayckington fc": "assets/img/logo/logo.png",
    "real santa rosa": "assets/img/logo/rivales/logos-pequenos/rsr-115x128.png",
    "el metodo": "assets/img/logo/rivales/logos-pequenos/el-metodo-115x128.png",
    "atletico independiente": "assets/img/logo/rivales/logos-pequenos/atl-independiente-128x126.png",
    "atletico tobalaba": "assets/img/logo/rivales/logos-pequenos/atletico-tobalaba-128x126.png",
    "huachalomo": "assets/img/logo/rivales/logos-pequenos/huachalomofc-128x128.png",
    "huachalomo f.c": "assets/img/logo/rivales/logos-pequenos/huachalomofc-128x128.png",
    "huachalomo fc": "assets/img/logo/rivales/logos-pequenos/huachalomofc-128x128.png",
    "la plaza": "assets/img/logo/rivales/logos-pequenos/plaza-115x128.png",
    "la plaza united": "assets/img/logo/rivales/logos-pequenos/plaza-115x128.png",
    "atletico": "assets/img/logo/rivales/logos-pequenos/atletico-fc-1-128x126.png",
    "atletico f.c": "assets/img/logo/rivales/logos-pequenos/atletico-fc-1-128x126.png",
    "atletico fc": "assets/img/logo/rivales/logos-pequenos/atletico-fc-1-128x126.png",
    "unab medicina": "assets/img/logo/rivales/logos-pequenos/unab-medicina.png",
    "universidad andres bello - medicina": "assets/img/logo/rivales/logos-pequenos/unab-medicina.png",
    "atletico valle central": "assets/img/logo/rivales/logos-pequenos/atletico-valle-central.png",
    "valle central": "assets/img/logo/rivales/logos-pequenos/atletico-valle-central.png"
};


/* ===================================================
   RENDERIZAR HERO
=================================================== */

function renderizarHeroInicio() {

    const hero =
        datosInicio?.hero ||
        {};

    colocarTextoInicio(
        "hero-etiqueta",
        hero.etiqueta ||
        "Sitio Oficial"
    );

    colocarTextoInicio(
        "hero-titulo",
        hero.titulo ||
        "RAYCKINGTON FC"
    );

    colocarTextoInicio(
        "hero-subtitulo",
        hero.subtitulo ||
        "Un proyecto construido desde cero."
    );

    colocarTextoInicio(
        "hero-descripcion",
        hero.descripcion ||
        ""
    );

    configurarEnlaceInicio(
        "hero-boton-principal",
        hero.botonPrincipal
    );

    configurarEnlaceInicio(
        "hero-boton-secundario",
        hero.botonSecundario
    );

}
/* ===================================================
   RENDERIZAR PARTIDOS
=================================================== */

function renderizarPartidosInicio() {

    const proximoPartido =
        buscarProximoPartidoInicio();

    const ultimoResultado =
        buscarUltimoResultadoInicio();

    renderizarPartidoHeroInicio(
        proximoPartido
    );

    renderizarProximoPartidoInicio(
        proximoPartido
    );

    renderizarUltimoResultadoInicio(
        ultimoResultado
    );

}


/* ===================================================
   RENDERIZAR PARTIDO DEL HERO
=================================================== */

function renderizarPartidoHeroInicio(
    partido
) {

    const contenedor =
        document.getElementById(
            "hero-proximo-partido"
        );

    if (!contenedor || !partido) {
        return;
    }

    const estado =
        String(
            partido.estado || ""
        )
            .trim()
            .toLowerCase();

    const enDirecto = partidoEnDirectoInicio(partido);
    const ultimoResultado = partido.esUltimoResultado === true;
    const mostrarResultado = enDirecto || ultimoResultado;

    const golesLocal =
        partido.local?.goles !== null &&
        partido.local?.goles !== undefined &&
        partido.local?.goles !== ""
            ? partido.local.goles
            : 0;

    const golesVisita =
        partido.visita?.goles !== null &&
        partido.visita?.goles !== undefined &&
        partido.visita?.goles !== ""
            ? partido.visita.goles
            : 0;

    const etiquetaPartido =
        enDirecto
            ? `
                <span class="live-dot"></span>
                EN DIRECTO
              `
            : ultimoResultado ? "ÚLTIMO RESULTADO" : "PRÓXIMO PARTIDO";

    const textoCentral = mostrarResultado
        ? `${golesLocal} - ${golesVisita}` : "VS";

    const textoHora = enDirecto
        ? textoRelojPartidoInicio(partido)
        : ultimoResultado ? "Finalizado" : escaparInicio(partido.hora);

    contenedor.innerHTML = `

        <small class="
            hero-match-label
            ${enDirecto ? "hero-match-live" : ""}
        ">

            ${etiquetaPartido}

        </small>

        <h3>

            ${escaparInicio(
                partido.competencia
            )}

        </h3>

        <div class="hero-vs">

            ${crearEquipoHeroInicio(
                partido.local
            )}

            <span class="
                ${mostrarResultado ? "hero-live-score" : ""}
            ">

                ${textoCentral}

            </span>

            ${crearEquipoHeroInicio(
                partido.visita
            )}

        </div>

        <hr>

        <div class="row text-center g-3">

            <div class="col">

                <strong>

                    ${escaparInicio(
                        partido.fechaTexto
                    )}

                </strong>

                <p id="${enDirecto ? "hero-live-clock" : ""}">

                    ${textoHora}

                </p>

            </div>

            <div class="col">

                <strong>
                    Recinto
                </strong>

                <p>

                    ${escaparInicio(
                        partido.estadio
                    )}

                </p>

            </div>

        </div>

    `;

}


/* ===================================================
   CREAR EQUIPO DEL HERO
=================================================== */

function crearEquipoHeroInicio(
    equipo
) {

    return `

        <div>

            <img
                src="${escaparInicio(
                    equipo.logo
                )}"
                alt="${escaparInicio(
                    equipo.nombre
                )}"
                loading="lazy"
                onerror="
                    this.onerror=null;
                    this.src='${LOGO_RIVAL_DEFAULT}';
                ">

            <p>

                ${escaparInicio(
                    equipo.nombre
                )}

            </p>

        </div>

    `;

}


/* ===================================================
   RENDERIZAR PRÓXIMO PARTIDO PRINCIPAL
=================================================== */

function renderizarProximoPartidoInicio(
    partido
) {

    const contenedor =
        document.getElementById(
            "inicio-proximo-partido"
        );

    if (!contenedor || !partido) {
        return;
    }

    const estado =
        String(
            partido.estado || ""
        )
            .trim()
            .toLowerCase();

    const enDirecto = partidoEnDirectoInicio(partido);
    const ultimoResultado = partido.esUltimoResultado === true;
    const mostrarResultado = enDirecto || ultimoResultado;

    const golesLocal =
        partido.local?.goles !== null &&
        partido.local?.goles !== undefined &&
        partido.local?.goles !== ""
            ? partido.local.goles
            : 0;

    const golesVisita =
        partido.visita?.goles !== null &&
        partido.visita?.goles !== undefined &&
        partido.visita?.goles !== ""
            ? partido.visita.goles
            : 0;

    const etiqueta = enDirecto
        ? `<span class="live-dot"></span> EN DIRECTO`
        : ultimoResultado ? "ÚLTIMO RESULTADO" : escaparInicio(partido.temporada);

    const marcador = mostrarResultado
        ? `${golesLocal} - ${golesVisita}` : "VS";

    const textoHora = enDirecto
        ? textoRelojPartidoInicio(partido)
        : ultimoResultado ? "Finalizado" : escaparInicio(partido.hora);

    contenedor.innerHTML = `

        <div class="match-card">

            <div class="row align-items-center g-4">

                ${crearEquipoPartidoInicio(
                    partido.local
                )}

                <div class="col-lg-4 text-center">

                    <span class="
                        match-badge
                        ${enDirecto ? "hero-match-live" : ""}
                    ">

                        ${etiqueta}

                    </span>

                    <h2 class="
                        match-vs-title
                        ${mostrarResultado ? "hero-live-score" : ""}
                    ">

                        ${marcador}

                    </h2>

                    <p>

                        <i class="bi bi-calendar-event me-2"></i>

                        ${escaparInicio(
                            partido.fechaTexto
                        )}

                    </p>

                    <p>

                        <i class="bi bi-clock me-2"></i>

                        <span id="${enDirecto ? "inicio-live-clock" : ""}">
                            ${textoHora}
                        </span>

                    </p>

                    <p>

                        <i class="bi bi-geo-alt-fill me-2"></i>

                        ${escaparInicio(
                            partido.estadio
                        )}

                    </p>

                    <a
                        href="${ultimoResultado && partido.id ? `seguimiento.html?partido=${encodeURIComponent(partido.id)}` : "partidos.html"}"
                        class="btn btn-primary-club mt-3">
                        ${ultimoResultado && partido.id ? "Ver resumen" : "Ver Partidos"}
                    </a>

                </div>

                ${crearEquipoPartidoInicio(
                    partido.visita
                )}

            </div>

        </div>

    `;

}


/* ===================================================
   EQUIPO EN TARJETA DE PARTIDO
=================================================== */

function crearEquipoPartidoInicio(
    equipo
) {

    return `

        <div class="col-lg-4 text-center">

            <img
                src="${escaparInicio(
                    equipo.logo
                )}"
                class="team-logo"
                alt="${escaparInicio(
                    equipo.nombre
                )}"
                loading="lazy"
                onerror="
                    this.onerror=null;
                    this.src='${LOGO_RIVAL_DEFAULT}';
                ">

            <h3 class="mt-3">

                ${escaparInicio(
                    equipo.nombre
                )}

            </h3>

        </div>

    `;

}


/* ===================================================
   RENDERIZAR ÚLTIMO RESULTADO
=================================================== */

function renderizarUltimoResultadoInicio(
    partido
) {

    const contenedor =
        document.getElementById(
            "inicio-ultimo-resultado"
        );

    if (!contenedor) {
        return;
    }

    if (!partido) {

        contenedor.innerHTML = `

            <div class="result-card text-center">

                <i class="
                    bi bi-calendar-x
                    display-5
                    text-warning
                "></i>

                <h3 class="mt-3">
                    Resultado no disponible
                </h3>

                <p>
                    Todavía no existen resultados cargados.
                </p>

            </div>

        `;

        return;

    }

    contenedor.innerHTML = `

        <div class="result-card">

            <div class="row align-items-center g-4">

                ${crearEquipoResultadoInicio(
                    partido.local
                )}

                <div class="col-md-4 text-center">

                    <span class="match-badge">

                        ${escaparInicio(
                            partido.temporada
                        )}

                    </span>

                    <h2 class="result-score">

                        ${obtenerMarcadorInicio(
                            partido.local.goles
                        )}

                        -

                        ${obtenerMarcadorInicio(
                            partido.visita.goles
                        )}

                    </h2>

                    <p class="mb-1">

                        ${escaparInicio(
                            partido.competencia
                        )}

                    </p>

                    <small>

                        ${escaparInicio(
                            partido.fechaTexto
                        )}

                    </small>

                </div>

                ${crearEquipoResultadoInicio(
                    partido.visita
                )}

            </div>

        </div>

    `;

}


/* ===================================================
   EQUIPO DEL ÚLTIMO RESULTADO
=================================================== */

function crearEquipoResultadoInicio(
    equipo
) {

    return `

        <div class="col-md-4 text-center">

            <img
                src="${escaparInicio(
                    equipo.logo
                )}"
                class="team-logo"
                alt="${escaparInicio(
                    equipo.nombre
                )}"
                loading="lazy"
                onerror="
                    this.onerror=null;
                    this.src='${LOGO_RIVAL_DEFAULT}';
                ">

            <h4 class="mt-3">

                ${escaparInicio(
                    equipo.nombre
                )}

            </h4>

        </div>

    `;

}


/* ===================================================
   NORMALIZAR PARTIDO DE CUALQUIER COMPETICIÓN
=================================================== */

function normalizarPartidoInicio(
    partido
) {

    const config =
        partido.competicionConfig ||
        {};

    return {

        id: partido.id || null,
        estado:
            partido.estado ||
            "Programado",

        competencia:
            partido.competencia ||
            config.competencia ||
            config.torneo ||
            "Partido de Rayckington FC",

        temporada:
            partido.temporada ||
            config.temporada ||
            "Temporada 2026",

        tipoCompeticion:
            config.categoria ||
            "",

        competicionId:
            partido.competicionId ||
            "",

        fechaTexto:
            formatearFechaPartidoInicio(
                partido.fechaPartido
            ),

        hora:
            partido.hora ||
            "Horario por confirmar",

        estadio:
            partido.estadio ||
            "Recinto por confirmar",

        local: {

            nombre:
                partido.local ||
                "Equipo local",

            logo:
                obtenerLogoEquipoInicio(
                    partido.local
                ),

            goles:
                partido.golesLocal

        },

        visita: {

            nombre:
                partido.visita ||
                "Equipo visitante",

            logo:
                obtenerLogoEquipoInicio(
                    partido.visita
                ),

            goles:
                partido.golesVisita

        },

        estadoSupabase:
            partido.estadoSupabase ||
            partido.estado_supabase ||
            "",

        minutoActual:
            partido.minutoActual ??
            partido.minuto_actual ??
            0,

        periodoPartido:
            partido.periodoPartido ||
            partido.periodo_partido ||
            "",

        cronometroInicioAt:
            partido.cronometroInicioAt ||
            partido.cronometro_inicio_at ||
            null,

        cronometroSegundosAcumulados:
            partido.cronometroSegundosAcumulados ??
            partido.cronometro_segundos_acumulados ??
            0,

        cronometroCorriendo:
            partido.cronometroCorriendo ??
            partido.cronometro_corriendo ??
            false,

        duracionMinutos:
            partido.duracionMinutos ??
            partido.duracion_minutos ??
            null,

        duracionPrimerTiempo:
            partido.duracionPrimerTiempo ??
            partido.duracion_primer_tiempo ??
            null

    };

}


/* ===================================================
   NORMALIZAR PRÓXIMO PARTIDO DE RESPALDO
=================================================== */

function normalizarPartidoRespaldoInicio(
    partido
) {

    return {

        estado:
            partido.estado ||
            "Programado",

        competencia:
            partido.competencia ||
            "Liga Tobalaba Todo Competidor",

        temporada:
            partido.temporada ||
            "Clausura 2026",

        fechaTexto:
            partido.fechaTexto ||
            "Fecha por confirmar",

        hora:
            partido.hora ||
            "Horario por confirmar",

        estadio:
            partido.estadio ||
            "Recinto por confirmar",

        local: {

            nombre:
                partido.local?.nombre ||
                "Rayckington FC",

            logo:
                partido.local?.logo ||
                LOGO_RAYCKINGTON,

            goles:
                partido.local?.goles ??
                null

        },

        visita: {

            nombre:
                partido.visita?.nombre ||
                "Rival por confirmar",

            logo:
                partido.visita?.logo ||
                LOGO_RIVAL_DEFAULT,

            goles:
                partido.visita?.goles ??
                null

        }

    };

}


/* ===================================================
   NORMALIZAR RESULTADO DE RESPALDO
=================================================== */

function normalizarResultadoRespaldoInicio(
    partido
) {

    return {

        estado:
            "Finalizado",

        competencia:
            partido.competencia ||
            "Partido de Rayckington FC",

        temporada:
            partido.temporada ||
            "Temporada 2026",

        fechaTexto:
            partido.fechaTexto ||
            "Último partido",

        hora:
            "",

        estadio:
            "",

        local: {

            nombre:
                partido.local?.nombre ||
                "Rayckington FC",

            logo:
                partido.local?.logo ||
                LOGO_RAYCKINGTON,

            goles:
                partido.local?.goles

        },

        visita: {

            nombre:
                partido.visita?.nombre ||
                "Rival",

            logo:
                partido.visita?.logo ||
                LOGO_RIVAL_DEFAULT,

            goles:
                partido.visita?.goles

        }

    };

}


/* ===================================================
   PARTIDO PENDIENTE
=================================================== */

function crearProximoPartidoPendienteInicio() {

    const configuracion =
        datosInicio
            ?.configuracion
            ?.temporadas ||
        {};

    const anio =
        Number(
            configuracion.anioActivo
        ) || 2026;

    const temporada =
        `Temporada ${anio}`;

    return {

        estado:
            "Programado",

        competencia:
            "Próximo partido por confirmar",

        temporada,

        fechaTexto:
            "Fecha por confirmar",

        hora:
            "Horario por confirmar",

        estadio:
            "Recinto por confirmar",

        local: {

            nombre:
                "Rayckington FC",

            logo:
                LOGO_RAYCKINGTON,

            goles:
                null

        },

        visita: {

            nombre:
                "Rival por confirmar",

            logo:
                LOGO_RIVAL_DEFAULT,

            goles:
                null

        }

    };

}


/* ===================================================
   OBTENER LOGO DEL EQUIPO
=================================================== */

function obtenerLogoEquipoInicio(
    nombreEquipo
) {

    const clave =
        normalizarTextoEquipoInicio(
            nombreEquipo
        );

    return (
        LOGOS_EQUIPOS_INICIO[clave] ||
        LOGO_RIVAL_DEFAULT
    );

}


/* ===================================================
   NORMALIZAR NOMBRE DE EQUIPO
=================================================== */

function normalizarTextoEquipoInicio(
    texto
) {

    return String(
        texto || ""
    )
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .trim()
        .toLowerCase()
        .replace(
            /\s+/g,
            " "
        );

}


/* ===================================================
   PARTICIPA RAYCKINGTON
=================================================== */

function participaRayckingtonInicio(
    partido
) {

    const local =
        normalizarTextoEquipoInicio(
            partido?.local
        );

    const visita =
        normalizarTextoEquipoInicio(
            partido?.visita
        );

    return (
        local === "rayckington fc" ||
        visita === "rayckington fc"
    );

}


/* ===================================================
   PARTIDO FINALIZADO
=================================================== */

function partidoFinalizadoInicio(
    partido
) {

    const estado =
        String(
            partido?.estado || ""
        )
            .trim()
            .toLowerCase();

    const estadosNoFinalizados = [

        "programado",
        "en juego",
        "en directo",
        "en curso",
        "en_vivo",
        "en vivo",
        "entretiempo",
        "suspendido",
        "aplazado",
        "postergado"

    ];

    if (
        estadosNoFinalizados.some(
            estadoPendiente =>
                estado.includes(
                    estadoPendiente
                )
        )
    ) {

        return false;

    }

    const golesLocalValidos =
        partido?.golesLocal !== null &&
        partido?.golesLocal !== undefined &&
        partido?.golesLocal !== "" &&
        Number.isFinite(
            Number(
                partido.golesLocal
            )
        );

    const golesVisitaValidos =
        partido?.golesVisita !== null &&
        partido?.golesVisita !== undefined &&
        partido?.golesVisita !== "" &&
        Number.isFinite(
            Number(
                partido.golesVisita
            )
        );

    const tieneMarcador =
        golesLocalValidos &&
        golesVisitaValidos;

    return (
        estado.includes("finalizado") ||
        estado.includes("jugado") ||
        estado.includes("terminado") ||
        tieneMarcador
    );

}


/* ===================================================
   BUSCAR PRÓXIMO PARTIDO
=================================================== */

function buscarProximoPartidoInicio() {

    const enVivo =
        todosLosPartidosInicio
            .filter(
                partido =>
                    partido.mostrarEnInicio === true &&
                    participaRayckingtonInicio(
                        partido
                    ) &&
                    partidoEnDirectoInicio(
                        partido
                    )
            )
            .sort(
                ordenarPartidosPorFechaYHoraInicio
            );

    if (
        enVivo.length > 0
    ) {

        return normalizarPartidoInicio(
            enVivo[0]
        );
    }

    const hoy =
        new Date();

    hoy.setHours(
        0,
        0,
        0,
        0
    );

    const candidatos =
        todosLosPartidosInicio

            .filter(
                partido => {

                    if (
                        partido.mostrarEnInicio !== true
                    ) {
                        return false;
                    }

                    if (
                        !participaRayckingtonInicio(
                            partido
                        )
                    ) {
                        return false;
                    }

                    if (
                        !partido.fechaPartido
                    ) {
                        return false;
                    }

                    if (
                        partidoFinalizadoInicio(
                            partido
                        )
                    ) {
                        return false;
                    }

                    const fechaPartido =
                        crearFechaHoraPartidoInicio(
                            partido.fechaPartido,
                            partido.hora
                        );

                    if (
                        Number.isNaN(
                            fechaPartido.getTime()
                        )
                    ) {
                        return false;
                    }

                    return (
                        fechaPartido >= hoy
                    );

                }
            )

            .sort(
                ordenarPartidosPorFechaYHoraInicio
            );

    if (
        candidatos.length > 0
    ) {

        return normalizarPartidoInicio(
            candidatos[0]
        );

    }

    // Si Supabase está disponible y no hay próximo encuentro, destacar
    // el resultado final más reciente en vez del marcador ficticio.
    if (modoDeportivoSupabaseInicio) {
        const ultimo = buscarUltimoResultadoInicio();
        return ultimo
            ? { ...ultimo, esUltimoResultado: true }
            : crearProximoPartidoPendienteInicio();
    }

    const respaldo =
        datosInicio
            ?.partidosRespaldo
            ?.proximoPartido;

    if (respaldo) {

        return normalizarPartidoRespaldoInicio(
            respaldo
        );

    }

    return crearProximoPartidoPendienteInicio();

}


/* ===================================================
   BUSCAR ÚLTIMO RESULTADO
=================================================== */

function buscarUltimoResultadoInicio() {

    const resultados =
        todosLosPartidosInicio

            .filter(
                partido => {

                    if (
                        partido.usarParaResultados !== true
                    ) {
                        return false;
                    }

                    if (
                        !participaRayckingtonInicio(
                            partido
                        )
                    ) {
                        return false;
                    }

                    if (
                        !partido.fechaPartido
                    ) {
                        return false;
                    }

                    return partidoFinalizadoInicio(
                        partido
                    );

                }
            )

            .sort(
                ordenarPartidosPorFechaYHoraInicio
            );

    if (
        resultados.length > 0
    ) {

        const ultimoPartido =
            resultados[
                resultados.length - 1
            ];

        return normalizarPartidoInicio(
            ultimoPartido
        );

    }

    if (modoDeportivoSupabaseInicio) return null;

    const respaldo =
        datosInicio
            ?.partidosRespaldo
            ?.ultimoResultado;

    if (respaldo) {

        return normalizarResultadoRespaldoInicio(
            respaldo
        );

    }

    return null;

}


/* ===================================================
   ORDENAR PARTIDOS POR FECHA Y HORA
=================================================== */

function ordenarPartidosPorFechaYHoraInicio(
    partidoA,
    partidoB
) {

    const fechaA =
        crearFechaHoraPartidoInicio(
            partidoA.fechaPartido,
            partidoA.hora
        );

    const fechaB =
        crearFechaHoraPartidoInicio(
            partidoB.fechaPartido,
            partidoB.hora
        );

    return fechaA - fechaB;

}


/* ===================================================
   CREAR FECHA Y HORA DEL PARTIDO
=================================================== */

function crearFechaHoraPartidoInicio(
    fecha,
    hora
) {

    const fechaValida =
        String(
            fecha || ""
        ).trim();

    if (!fechaValida) {

        return new Date(
            "Invalid Date"
        );

    }

    const horaValida =
        /^\d{2}:\d{2}$/.test(
            String(
                hora || ""
            )
        )
            ? hora
            : "12:00";

    return new Date(
        `${fechaValida}T${horaValida}:00`
    );

}


/* ===================================================
   FECHA VÁLIDA
=================================================== */

function tieneFechaValidaInicio(
    fecha
) {

    if (!fecha) {
        return false;
    }

    const objetoFecha =
        crearFechaPartidoInicio(
            fecha
        );

    return !Number.isNaN(
        objetoFecha.getTime()
    );

}


/* ===================================================
   CREAR FECHA DEL PARTIDO
=================================================== */

function crearFechaPartidoInicio(
    fecha
) {

    return new Date(
        `${fecha}T12:00:00`
    );

}


/* ===================================================
   INICIO DEL DÍA
=================================================== */

function obtenerInicioDia(
    fecha
) {

    const copia =
        new Date(
            fecha
        );

    copia.setHours(
        0,
        0,
        0,
        0
    );

    return copia;

}


/* ===================================================
   ORDENAR PARTIDOS POR FECHA
=================================================== */

function ordenarPartidosPorFechaInicio(
    partidoA,
    partidoB
) {

    const fechaA =
        crearFechaPartidoInicio(
            partidoA.fechaPartido
        );

    const fechaB =
        crearFechaPartidoInicio(
            partidoB.fechaPartido
        );

    return fechaA - fechaB;

}


/* ===================================================
   FORMATEAR FECHA DEL PARTIDO
=================================================== */

function formatearFechaPartidoInicio(
    fecha
) {

    if (
        !tieneFechaValidaInicio(
            fecha
        )
    ) {

        return "Fecha por confirmar";

    }

    return crearFechaPartidoInicio(
        fecha
    ).toLocaleDateString(
        "es-CL",
        {
            weekday:
                "long",

            day:
                "numeric",

            month:
                "long",

            year:
                "numeric"
        }
    );

}


/* ===================================================
   OBTENER MARCADOR
=================================================== */

function obtenerMarcadorInicio(
    valor
) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {

        return "-";

    }

    const numero =
        Number(
            valor
        );

    return Number.isFinite(
        numero
    )
        ? numero
        : "-";

}
/* ===================================================
   RENDERIZAR ESTADÍSTICAS DEL INICIO
=================================================== */

function renderizarEstadisticasInicio() {

    const jugadores =
        Array.isArray(
            datosPlantelInicio?.jugadores
        )
            ? datosPlantelInicio.jugadores
            : [];

    const jugadoresActivos =
        jugadores.filter(
            jugador =>
                jugador &&
                jugador.estado !== "INACTIVO"
        );

    const categorias =
        new Set(
            jugadoresActivos
                .map(
                    jugador =>
                        jugador.categoria
                )
                .filter(Boolean)
        );

    const fundacion =
        datosInicio
            ?.estadisticasClub
            ?.fundacion ||
        2025;

    const temporadasOficiales =
        datosInicio
            ?.estadisticasClub
            ?.temporadasOficiales ||
        1;


    /* ===================================================
       BUSCAR COMPETICIÓN ACTIVA
    =================================================== */

    const estadisticaActiva =
        todasLasEstadisticasInicio.find(
            item =>
                item.activa === true
        );

    const estadisticas =
        estadisticaActiva
            ? estadisticaActiva.estadisticas
            : {};

    const partidosJugados =
        obtenerNumeroInicio(
            estadisticas?.pj
        );


    /* ===================================================
       MOSTRAR DATOS
    =================================================== */

    colocarTextoInicio(
        "inicio-total-jugadores",
        jugadoresActivos.length
    );

    colocarTextoInicio(
        "inicio-total-categorias",
        categorias.size ||
        datosInicio
            ?.estadisticasClub
            ?.categorias ||
        2
    );

    colocarTextoInicio(
        "inicio-fundacion",
        fundacion
    );

    colocarTextoInicio(
        "inicio-partidos-jugados",
        partidosJugados
    );

    colocarTextoInicio(
        "inicio-temporadas-oficiales",
        temporadasOficiales
    );

}


/* ===================================================
   NÚMERO SEGURO
=================================================== */

function obtenerNumeroInicio(
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
   RENDERIZAR HISTORIA
=================================================== */

function renderizarHistoriaInicio() {

    const historia =
        datosInicio?.historia ||
        {};

    colocarTextoInicio(
        "inicio-historia-etiqueta",
        historia.etiqueta ||
        "Nuestra Historia"
    );

    colocarTextoInicio(
        "inicio-historia-titulo",
        historia.titulo ||
        "Un proyecto construido desde cero."
    );


    /* ===================================================
       IMAGEN
    =================================================== */

    const imagen =
        document.getElementById(
            "inicio-historia-imagen"
        );

    if (imagen) {

        imagen.src =
            historia.imagen ||
            "assets/img/hero/hero-bg.jpg";

        imagen.alt =
            "Historia de Rayckington FC";

    }


    /* ===================================================
       PÁRRAFOS
    =================================================== */

    const parrafosContenedor =
        document.getElementById(
            "inicio-historia-parrafos"
        );

    if (parrafosContenedor) {

        const parrafos =
            Array.isArray(
                historia.parrafos
            )
                ? historia.parrafos
                : [];

        parrafosContenedor.innerHTML =
            parrafos
                .map(
                    parrafo => `

                        <p>

                            ${escaparInicio(
                                parrafo
                            )}

                        </p>

                    `
                )
                .join("");

    }


    /* ===================================================
       BOTÓN
    =================================================== */

    configurarEnlaceInicio(
        "inicio-historia-boton",
        historia.boton
    );

}


/* ===================================================
   RENDERIZAR JUGADORES DESTACADOS
=================================================== */

function renderizarJugadoresDestacadosInicio() {

    const contenedor =
        document.getElementById(
            "inicio-jugadores-destacados"
        );

    if (!contenedor) {
        return;
    }

    const jugadores =
        Array.isArray(
            datosPlantelInicio?.jugadores
        )
            ? datosPlantelInicio.jugadores
            : [];

    const slugsDestacados =
        Array.isArray(
            datosInicio?.jugadoresDestacados
        )
            ? datosInicio.jugadoresDestacados
            : [];

    const cantidad =
        Number(
            datosInicio
                ?.configuracion
                ?.cantidadJugadoresDestacados
        ) || 4;

    const destacados =
        slugsDestacados

            .map(
                slug =>
                    jugadores.find(
                        jugador =>
                            jugador.slug === slug &&
                            jugador.estado !== "INACTIVO"
                    )
            )

            .filter(Boolean)

            .slice(
                0,
                cantidad
            );

    contenedor.innerHTML = "";


    /* ===================================================
       SIN JUGADORES DESTACADOS
    =================================================== */

    if (
        destacados.length === 0
    ) {

        contenedor.innerHTML = `

            <div class="col-12">

                <div class="card-custom text-center">

                    <i class="
                        bi bi-people-fill
                        display-5
                        text-warning
                    "></i>

                    <h3 class="mt-3">

                        Jugadores destacados por confirmar

                    </h3>

                    <p>

                        Pronto conocerás a los protagonistas
                        del plantel.

                    </p>

                </div>

            </div>

        `;

        return;

    }


    /* ===================================================
       CREAR TARJETAS
    =================================================== */

    destacados.forEach(
        jugador => {

            const columna =
                document.createElement(
                    "div"
                );

            columna.className =
                "col-lg-3 col-md-6";

            columna.innerHTML =
                crearTarjetaJugadorDestacadoInicio(
                    jugador
                );

            contenedor.appendChild(
                columna
            );

        }
    );

}


/* ===================================================
   TARJETA DE JUGADOR DESTACADO
=================================================== */

function crearTarjetaJugadorDestacadoInicio(
    jugador
) {

    const estado =
        String(
            jugador.estado ||
            "DISPONIBLE"
        ).toUpperCase();

    const textoEstado =
        estado === "LESIONADO"
            ? "Lesionado"
            : "Disponible";

    const claseEstado =
        estado === "LESIONADO"
            ? "inicio-player-status injured"
            : "inicio-player-status available";

    return `

        <article class="
            player-card
            inicio-player-card
        ">

            <div class="inicio-player-image">

                <img
                    src="${escaparInicio(
                        jugador.foto ||
                        FOTO_JUGADOR_DEFAULT
                    )}"
                    alt="${escaparInicio(
                        jugador.nombre
                    )}"
                    loading="lazy"
                    onerror="
                        this.onerror=null;
                        this.src='${FOTO_JUGADOR_DEFAULT}';
                    ">

                <span class="inicio-player-number">

                    #${escaparInicio(
                        jugador.numero
                    )}

                </span>

                <span class="${claseEstado}">

                    ${textoEstado}

                </span>

                ${
                    jugador.capitan
                        ? `

                            <span class="inicio-player-captain">

                                <i class="bi bi-award-fill"></i>

                                Capitán

                            </span>

                        `
                        : ""
                }

            </div>


            <div class="p-4">

                <span class="inicio-player-position">

                    ${escaparInicio(
                        jugador.nombrePosicion ||
                        jugador.posicion
                    )}

                </span>

                <h4 class="mt-2">

                    ${escaparInicio(
                        jugador.nombre
                    )}

                </h4>

                <p>

                    ${escaparInicio(
                        jugador.categoria ||
                        "Adulta"
                    )}

                </p>

                <a
                    href="jugador.html?slug=${encodeURIComponent(
                        jugador.slug
                    )}"
                    class="btn btn-primary-club">

                    Ver perfil

                </a>

            </div>

        </article>

    `;

}
/* ===================================================
   RENDERIZAR ÚLTIMAS NOTICIAS
=================================================== */

function renderizarNoticiasInicio() {

    const contenedor =
        document.getElementById(
            "inicio-ultimas-noticias"
        );

    if (!contenedor) {
        return;
    }

    const cantidad =
        Number(
            datosInicio
                ?.configuracion
                ?.cantidadNoticias
        ) || 3;

    const noticias =
        Array.isArray(
            noticiasInicio
        )
            ? noticiasInicio
            : [];

    const publicadas =
        noticias
            .filter(
                noticia =>
                    noticia &&
                    noticia.publicada === true
            )
            .sort(
                (noticiaA, noticiaB) =>
                    new Date(
                        noticiaB.fecha
                    ) -
                    new Date(
                        noticiaA.fecha
                    )
            )
            .slice(
                0,
                cantidad
            );

    contenedor.innerHTML = "";

    if (
        publicadas.length === 0
    ) {

        contenedor.innerHTML = `

            <div class="col-12">

                <div class="card-custom text-center">

                    <i class="
                        bi bi-newspaper
                        display-5
                        text-warning
                    "></i>

                    <h3 class="mt-3">

                        No hay noticias disponibles

                    </h3>

                    <p>

                        Pronto publicaremos nuevas novedades del club.

                    </p>

                </div>

            </div>

        `;

        return;

    }

    publicadas.forEach(
        noticia => {

            const columna =
                document.createElement(
                    "div"
                );

            columna.className =
                "col-lg-4 col-md-6";

            columna.innerHTML =
                crearTarjetaNoticiaInicio(
                    noticia
                );

            contenedor.appendChild(
                columna
            );

        }
    );

}


/* ===================================================
   CREAR TARJETA DE NOTICIA
=================================================== */

function crearTarjetaNoticiaInicio(
    noticia
) {

    return `

        <article class="
            news-card
            inicio-news-card
        ">

            <a
                href="noticia.html?slug=${encodeURIComponent(
                    noticia.slug
                )}"
                class="inicio-news-image">

                <img
                    src="${escaparInicio(
                        noticia.imagen ||
                        IMAGEN_NOTICIA_DEFAULT
                    )}"
                    alt="${escaparInicio(
                        noticia.imagenAlt ||
                        noticia.titulo
                    )}"
                    loading="lazy"
                    onerror="
                        this.onerror=null;
                        this.src='${IMAGEN_NOTICIA_DEFAULT}';
                    ">

                ${
                    noticia.destacada
                        ? `

                            <span class="inicio-news-featured">

                                Destacada

                            </span>

                        `
                        : ""
                }

            </a>

            <div class="p-4">

                <div class="inicio-news-meta">

                    <span>

                        ${escaparInicio(
                            noticia.categoria ||
                            "Noticias"
                        )}

                    </span>

                    <small>

                        ${escaparInicio(
                            noticia.fechaTexto ||
                            formatearFechaNoticiaInicio(
                                noticia.fecha
                            )
                        )}

                    </small>

                </div>

                <h4 class="mt-3">

                    ${escaparInicio(
                        noticia.titulo
                    )}

                </h4>

                <p>

                    ${escaparInicio(
                        noticia.resumen ||
                        noticia.subtitulo ||
                        ""
                    )}

                </p>

                <a
                    href="noticia.html?slug=${encodeURIComponent(
                        noticia.slug
                    )}"
                    class="btn btn-primary-club">

                    Leer más

                    <i class="
                        bi bi-arrow-right
                        ms-2
                    "></i>

                </a>

            </div>

        </article>

    `;

}


/* ===================================================
   FORMATEAR FECHA DE NOTICIA
=================================================== */

function formatearFechaNoticiaInicio(
    fecha
) {

    if (!fecha) {
        return "";
    }

    const objetoFecha =
        new Date(
            `${fecha}T12:00:00`
        );

    if (
        Number.isNaN(
            objetoFecha.getTime()
        )
    ) {

        return "";

    }

    return objetoFecha.toLocaleDateString(
        "es-CL",
        {
            day:
                "numeric",

            month:
                "long",

            year:
                "numeric"
        }
    );

}


/* ===================================================
   RENDERIZAR GALERÍA
=================================================== */

function renderizarGaleriaInicio() {

    const contenedor =
        document.getElementById(
            "inicio-galeria"
        );

    if (!contenedor) {
        return;
    }

    const cantidad =
        Number(
            datosInicio
                ?.configuracion
                ?.cantidadFotosGaleria
        ) || 6;

    const elementos =
        Array.isArray(
            galeriaInicio
        )
            ? galeriaInicio
            : [];

    const publicadas =
        elementos
            .filter(
                elemento =>
                    elemento &&
                    elemento.publicada === true
            );

    const destacadas =
        publicadas
            .filter(
                elemento =>
                    elemento.destacada === true
            )
            .sort(
                ordenarGaleriaPorFechaInicio
            );

    const restantes =
        publicadas
            .filter(
                elemento =>
                    elemento.destacada !== true
            )
            .sort(
                ordenarGaleriaPorFechaInicio
            );

    const seleccionadas = [
        ...destacadas,
        ...restantes
    ]
        .slice(
            0,
            cantidad
        );

    contenedor.innerHTML = "";

    if (
        seleccionadas.length === 0
    ) {

        contenedor.innerHTML = `

            <div class="gallery-empty">

                <i class="bi bi-images"></i>

                <h3>

                    Galería en preparación

                </h3>

                <p>

                    Pronto publicaremos nuevos momentos del club.

                </p>

            </div>

        `;

        return;

    }

    seleccionadas.forEach(
        elemento => {

            const item =
                document.createElement(
                    "a"
                );

            item.href =
                "galeria.html";

            item.className =
                "inicio-gallery-item";

            item.setAttribute(
                "aria-label",
                elemento.titulo ||
                "Ver galería"
            );

            item.innerHTML = `

                <img
                    src="${escaparInicio(
                        elemento.imagen ||
                        IMAGEN_GALERIA_DEFAULT
                    )}"
                    alt="${escaparInicio(
                        elemento.titulo ||
                        "Galería Rayckington FC"
                    )}"
                    loading="lazy"
                    onerror="
                        this.onerror=null;
                        this.src='${IMAGEN_GALERIA_DEFAULT}';
                    ">

                <div class="inicio-gallery-overlay">

                    <span>

                        ${escaparInicio(
                            elemento.categoria ||
                            "Galería"
                        )}

                    </span>

                    <h4>

                        ${escaparInicio(
                            elemento.titulo ||
                            "Rayckington FC"
                        )}

                    </h4>

                    <i class="
                        bi bi-arrow-up-right
                    "></i>

                </div>

            `;

            contenedor.appendChild(
                item
            );

        }
    );

}


/* ===================================================
   ORDENAR GALERÍA POR FECHA
=================================================== */

function ordenarGaleriaPorFechaInicio(
    elementoA,
    elementoB
) {

    const fechaA =
        new Date(
            elementoA.fecha ||
            "1970-01-01"
        );

    const fechaB =
        new Date(
            elementoB.fecha ||
            "1970-01-01"
        );

    return fechaB - fechaA;

}
/* ===================================================
   RENDERIZAR PATROCINADORES
=================================================== */

function renderizarSponsorsInicio() {

    const contenedor =
        document.getElementById(
            "inicio-patrocinadores"
        );

    if (!contenedor) {
        return;
    }

    const patrocinadores =
        Array.isArray(
            sponsorsInicio?.patrocinadores
        )
            ? sponsorsInicio.patrocinadores
            : [];

    const activos =
        patrocinadores
            .filter(
                patrocinador =>
                    patrocinador &&
                    patrocinador.activo === true
            )
            .sort(
                (patrocinadorA, patrocinadorB) =>
                    obtenerNumeroInicio(
                        patrocinadorA.orden
                    ) -
                    obtenerNumeroInicio(
                        patrocinadorB.orden
                    )
            );

    contenedor.innerHTML = "";

    if (
        activos.length === 0
    ) {

        contenedor.innerHTML = `

            <div class="sponsors-empty">

                <i class="bi bi-handshake-fill"></i>

                <h3>

                    Patrocinadores por confirmar

                </h3>

                <p>

                    Próximamente presentaremos a las empresas
                    que apoyan el crecimiento de Rayckington FC.

                </p>

            </div>

        `;

        return;

    }

    activos.forEach(
        patrocinador => {

            const enlace =
                document.createElement(
                    "a"
                );

            enlace.href =
                obtenerEnlaceSeguroInicio(
                    patrocinador.enlace
                );

            enlace.className =
                "sponsor-card";

            enlace.setAttribute(
                "aria-label",
                `Visitar ${patrocinador.nombre}`
            );

            if (
                patrocinador.enlace &&
                patrocinador.enlace !== "#"
            ) {

                enlace.target =
                    "_blank";

                enlace.rel =
                    "noopener noreferrer";

            }

            enlace.innerHTML = `

                <div class="sponsor-logo-wrapper">

                    <img
                        src="${escaparInicio(
                            patrocinador.logo
                        )}"
                        alt="${escaparInicio(
                            patrocinador.nombre
                        )}"
                        loading="lazy">

                </div>

                <span class="sponsor-name">

                    ${escaparInicio(
                        patrocinador.nombre
                    )}

                </span>

                <span class="sponsor-link">

                    ${escaparInicio(
                        patrocinador.textoEnlace ||
                        "Visitar sitio"
                    )}

                    <i class="
                        bi bi-box-arrow-up-right
                    "></i>

                </span>

            `;

            contenedor.appendChild(
                enlace
            );

        }
    );

}


/* ===================================================
   CONFIGURAR ENLACE
=================================================== */

function configurarEnlaceInicio(
    id,
    configuracion
) {

    const enlace =
        document.getElementById(
            id
        );

    if (!enlace) {
        return;
    }

    if (
        configuracion?.texto
    ) {

        enlace.textContent =
            configuracion.texto;

    }

    enlace.href =
        obtenerEnlaceSeguroInicio(
            configuracion?.enlace
        );

}


/* ===================================================
   ENLACE SEGURO
=================================================== */

function obtenerEnlaceSeguroInicio(
    enlace
) {

    const valor =
        String(
            enlace || "#"
        ).trim();

    if (!valor) {
        return "#";
    }

    const permitido =
        valor.startsWith("#") ||
        valor.startsWith("http://") ||
        valor.startsWith("https://") ||
        valor.startsWith("mailto:") ||
        valor.startsWith("tel:") ||
        /^[a-zA-Z0-9_\-./?=&%]+$/.test(
            valor
        );

    return permitido
        ? valor
        : "#";

}


/* ===================================================
   COLOCAR TEXTO
=================================================== */

function colocarTextoInicio(
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
   OCULTAR CARGA
=================================================== */

function ocultarCargaInicio() {

    const carga =
        document.getElementById(
            "inicio-cargando"
        );

    if (carga) {

        carga.hidden = true;

    }

}


/* ===================================================
   MOSTRAR ERROR GENERAL
=================================================== */

function mostrarErrorGeneralInicio() {

    const carga =
        document.getElementById(
            "inicio-cargando"
        );

    if (!carga) {
        return;
    }

    carga.hidden = false;

    carga.innerHTML = `

        <div class="container">

            <div class="
                alert
                alert-danger
                text-center
                mb-0
            ">

                <i class="
                    bi
                    bi-exclamation-triangle-fill
                    me-2
                "></i>

                No fue posible cargar completamente la portada.
                Revisa los archivos JSON y abre la página con Live Server.

            </div>

        </div>

    `;

}


/* ===================================================
   ESCAPAR TEXTO
=================================================== */

function escaparInicio(
    valor
) {

    return String(
        valor ?? ""
    )

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
   DEPURACIÓN
=================================================== */

console.log(
    "🏠 Sistema dinámico de Inicio cargado."
);