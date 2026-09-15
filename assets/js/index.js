/* ===================================================
   RAYCKINGTON FC
   INDEX.JS
=================================================== */

"use strict";


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
    "assets/img/logo/rivales/default.png";

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

        prepararPaginaInicio();

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

    "rayckington fc":
        "assets/img/logo/logo.png",

    "real santa rosa":
        "assets/img/logo/rivales/logosgrande/santarosa.png",

    "el método":
        "assets/img/logo/rivales/logosgrande/ElMetodo.png",

    "el metodo":
        "assets/img/logo/rivales/logosgrande/ElMetodo.png",

    "atlético independiente":
        "assets/img/logo/rivales/logosgrande/atletico-independiente.png",

    "atletico independiente":
        "assets/img/logo/rivales/logosgrande/atletico-independiente.png",

    "atlético tobalaba":
        "assets/img/logo/rivales/logosgrande/atletico-tobalaba.png",

    "atletico tobalaba":
        "assets/img/logo/rivales/logosgrande/atletico-tobalaba.png",

    "huachalomo":
        "assets/img/logo/rivales/logosgrande/huachalomo.png",

    "la plaza united":
        "assets/img/logo/rivales/logosgrande/la-plaza-united.png",

    "unión gloriosa":
        "assets/img/logo/rivales/logosgrande/union-gloriosa.png",

    "union gloriosa":
        "assets/img/logo/rivales/logosgrande/union-gloriosa.png",

    "7h hermanos":
        "assets/img/logo/rivales/logosgrande/7h-hermanos.png",

    "atlético":
        "assets/img/logo/rivales/logosgrande/atletico.png",

    "atletico":
        "assets/img/logo/rivales/logosgrande/atletico.png",

    "unab medicina":
    "assets/img/logo/rivales/logosgrande/unabmedicina.png",

     "universidad andrés bello - medicina":
    "assets/img/logo/rivales/logosgrande/unabmedicina.png",

     "universidad andres bello - medicina":
    "assets/img/logo/rivales/logosgrande/unabmedicina.png",


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
   BUSCAR PRÓXIMO PARTIDO
=================================================== */

function buscarProximoPartidoInicio() {

    const hoy =
        obtenerInicioDia(
            new Date()
        );

    const candidatos =
        todosLosPartidosInicio

            .filter(
                partido =>
                    partido &&
                    partido.mostrarEnInicio === true
            )

            .filter(
                partido =>
                    participaRayckingtonInicio(
                        partido
                    )
            )

            .filter(
                partido =>
                    tieneFechaValidaInicio(
                        partido.fechaPartido
                    )
            )

            .filter(
                partido =>
                    !partidoFinalizadoInicio(
                        partido
                    )
            )

            .filter(
                partido => {

                    const fecha =
                        crearFechaHoraPartidoInicio(
                            partido.fechaPartido,
                            partido.hora
                        );

                    return fecha >= hoy;

                }
            )

            .sort(
                ordenarPartidosPorFechaYHoraInicio
            );

    if (candidatos.length > 0) {

        return normalizarPartidoInicio(
            candidatos[0]
        );

    }

    const respaldo =
        datosInicio
            ?.partidosRespaldo
            ?.proximoPartido;

    if (
        respaldo &&
        respaldo.mostrar === true
    ) {

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

    const candidatos =
        todosLosPartidosInicio

            .filter(
                partido =>
                    partido &&
                    partido.usarParaResultados === true
            )

            .filter(
                partido =>
                    participaRayckingtonInicio(
                        partido
                    )
            )

            .filter(
                partido =>
                    partidoFinalizadoInicio(
                        partido
                    )
            )

            .filter(
                partido =>
                    tieneFechaValidaInicio(
                        partido.fechaPartido
                    )
            )

            .sort(
                ordenarPartidosPorFechaYHoraInicio
            );

    if (candidatos.length > 0) {

        return normalizarPartidoInicio(
            candidatos[
                candidatos.length - 1
            ]
        );

    }

    const respaldo =
        datosInicio
            ?.partidosRespaldo
            ?.ultimoResultado;

    if (
        respaldo &&
        respaldo.mostrar === true
    ) {

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

    const horaValida =
        /^\d{2}:\d{2}$/.test(
            String(
                hora || ""
            )
        )
            ? hora
            : "12:00";

    return new Date(
        `${fecha}T${horaValida}:00`
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

    if (!contenedor) {

        return;

    }

    contenedor.innerHTML = `

        <small class="hero-match-label">

            PRÓXIMO PARTIDO

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

            <span>

                VS

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

                <p>

                    ${escaparInicio(
                        partido.hora
                    )}

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

    if (!contenedor) {

        return;

    }

    contenedor.innerHTML = `

        <div class="match-card">

            <div class="row align-items-center g-4">

                ${crearEquipoPartidoInicio(
                    partido.local
                )}

                <div class="col-lg-4 text-center">

                    <span class="match-badge">

                        ${escaparInicio(
                            partido.temporada
                        )}

                    </span>

                    <h2 class="match-vs-title">

                        VS

                    </h2>

                    <p>

                        <i class="bi bi-calendar-event me-2"></i>

                        ${escaparInicio(
                            partido.fechaTexto
                        )}

                    </p>

                    <p>

                        <i class="bi bi-clock me-2"></i>

                        ${escaparInicio(
                            partido.hora
                        )}

                    </p>

                    <p>

                        <i class="bi bi-geo-alt-fill me-2"></i>

                        ${escaparInicio(
                            partido.estadio
                        )}

                    </p>

                    <a
                        href="partidos.html"
                        class="btn btn-primary-club mt-3">

                        Ver Partidos

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

                <i class="bi bi-calendar-x display-5 text-warning"></i>

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

        }

    };

}
/* ===================================================
   NORMALIZAR PRÓXIMO PARTIDO DE RESPALDO
=================================================== */

function normalizarPartidoRespaldoInicio(
    partido
) {

    return {

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

        competencia:
            partido.competencia ||
            "Liga Tobalaba Todo Competidor",

        temporada:
            partido.temporada ||
            "Apertura 2026",

        fechaTexto:
            partido.fechaTexto ||
            "Último partido oficial",

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

const competencia =
    "Próximo partido por confirmar";

    return {

        competencia,

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
        .trim()
        .toLowerCase();

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
        new Date(fecha);

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

    if (!tieneFechaValidaInicio(fecha)) {

        return "Fecha por confirmar";

    }

    return crearFechaPartidoInicio(
        fecha
    ).toLocaleDateString(
        "es-CL",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}


/* ===================================================
   OBTENER MARCADOR
=================================================== */

function obtenerMarcadorInicio(
    valor
) {

    const numero =
        Number(valor);

    return Number.isFinite(numero)
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

    /* ==========================================
       BUSCAR LA COMPETICIÓN ACTIVA
    ========================================== */

    const estadisticaActiva =
        todasLasEstadisticasInicio.find(
            item => item.activa === true
        );

    const estadisticas =
        estadisticaActiva
            ? estadisticaActiva.estadisticas
            : {};

    const partidosJugados =
        obtenerNumeroInicio(
            estadisticas?.pj
        );

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
        Number(valor);

    return Number.isFinite(numero)
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

    if (destacados.length === 0) {

        contenedor.innerHTML = `

            <div class="col-12">

                <div class="card-custom text-center">

                    <i class="bi bi-people-fill display-5 text-warning"></i>

                    <h3 class="mt-3">

                        Jugadores destacados por confirmar

                    </h3>

                    <p>

                        Pronto conocerás a los protagonistas del plantel.

                    </p>

                </div>

            </div>

        `;

        return;

    }

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

        <article class="player-card inicio-player-card">

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

    if (publicadas.length === 0) {

        contenedor.innerHTML = `

            <div class="col-12">

                <div class="card-custom text-center">

                    <i class="bi bi-newspaper display-5 text-warning"></i>

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

        <article class="news-card inicio-news-card">

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

                    <i class="bi bi-arrow-right ms-2"></i>

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
            day: "numeric",
            month: "long",
            year: "numeric"
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

    if (seleccionadas.length === 0) {

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

                    <i class="bi bi-arrow-up-right"></i>

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

    if (activos.length === 0) {

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

                    <i class="bi bi-box-arrow-up-right"></i>

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

            <div class="alert alert-danger text-center mb-0">

                <i class="bi bi-exclamation-triangle-fill me-2"></i>

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