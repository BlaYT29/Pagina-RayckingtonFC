/* ===================================================
   RAYCKINGTON FC
   JUGADOR.JS
=================================================== */

"use strict";


/* ===================================================
   CONFIGURACIÓN
=================================================== */

const RUTA_DATOS_JUGADOR =
    "assets/data/plantel/plantel.json";

const FOTO_JUGADOR_RESPALDO =
    "assets/img/jugadores/jugador-default.webp";


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

        const datos =
            await cargarPlantelJugador();

        const jugadores =
            Array.isArray(
                datos.jugadores
            )
                ? datos.jugadores
                : [];

        const jugador =
            jugadores.find(
                item =>
                    item.slug === slug &&
                    item.estado !== "INACTIVO"
            );

        if (!jugador) {

            mostrarJugadorNoEncontrado();

            return;

        }

        renderizarPerfilJugador(
            jugador,
            datos
        );

        ocultarCargaJugador();

    } catch (error) {

        console.error(
            "Error al cargar el perfil del jugador:",
            error
        );

        mostrarErrorJugador(
            "No fue posible cargar el perfil. " +
            "Revisa plantel.json y abre la web con Live Server."
        );

    }

}


/* ===================================================
   CARGAR PLANTEL
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

}


/* ===================================================
   ACTUALIZAR HERO
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
        `${jugador.nombrePosicion || jugador.posicion} · ${
            datosPlantel.temporada || "Temporada 2026"
        }`
    );

}


/* ===================================================
   CREAR FICHA PRINCIPAL
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
        obtenerFechaNacimientoVisible(
            jugador.fechaNacimiento
        );

    const estado =
        obtenerEstadoPerfilJugador(
            jugador.estado
        );

    const estadisticas =
        jugador.estadisticas || {};

    return `

        <article class="player-profile">

            <div class="row align-items-stretch g-0">

                <div class="col-lg-5">

                    <div class="player-profile-image">

                        <img
                            src="${escaparJugador(
                                jugador.foto
                            )}"
                            alt="${escaparJugador(
                                jugador.nombre
                            )}"
                            onerror="
                                this.onerror=null;
                                this.src='${FOTO_JUGADOR_RESPALDO}';
                            ">

                        <span class="player-profile-number">

                            ${escaparJugador(
                                jugador.numero
                            )}

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

                        <span class="player-profile-position">

                            ${escaparJugador(
                                jugador.nombrePosicion ||
                                jugador.posicion
                            )}

                        </span>

                        <h2>

                            ${escaparJugador(
                                jugador.nombreCompleto ||
                                jugador.nombre
                            )}

                        </h2>

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
                                "bi-shield-fill",
                                "Categoría",
                                jugador.categoria ||
                                "Adulta"
                            )}

                            ${crearDatoJugador(
                                "bi-hash",
                                "Dorsal",
                                jugador.numero
                            )}

                            ${crearDatoJugador(
                                "bi-diagram-3-fill",
                                "Posición",
                                jugador.nombrePosicion ||
                                jugador.posicion
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

        ${crearEstadisticasJugador(
            estadisticas,
            jugador.posicion
        )}

    `;

}
/* ===================================================
   CREAR DATO DEL JUGADOR
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

                    ${escaparJugador(
                        etiqueta
                    )}

                </span>

                <strong>

                    ${escaparJugador(
                        valor ?? "Por confirmar"
                    )}

                </strong>

            </div>

        </div>

    `;

}


/* ===================================================
   CREAR ESTADÍSTICAS
=================================================== */

function crearEstadisticasJugador(
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
            etiqueta: "Suplencias",
            valor: estadisticas.suplencias,
            icono: "bi-person-dash-fill"
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
            6,
            0,
            {
                etiqueta: "Porterías Invictas",
                valor:
                    estadisticas.porteriasInvictas,
                icono: "bi-lock-fill"
            }
        );

    }

    const tarjetasHtml =
        tarjetas
            .map(
                tarjeta => `

                    <div class="col-lg-3 col-md-4 col-6">

                        <article class="profile-stat-card ${tarjeta.claseExtra || ""}">

                            <i class="bi ${tarjeta.icono}"></i>

                            <strong>

                                ${obtenerNumeroJugador(
                                    tarjeta.valor
                                )}

                            </strong>

                            <span>

                                ${escaparJugador(
                                    tarjeta.etiqueta
                                )}

                            </span>

                        </article>

                    </div>

                `
            )
            .join("");

    return `

        <section class="player-profile-stats">

            <div class="section-title">

                <span class="club-badge">

                    Rendimiento

                </span>

                <h2 class="mt-3">

                    Estadísticas del Jugador

                </h2>

                <p>

                    Registro deportivo correspondiente a la temporada actual.

                </p>

            </div>

            <div class="row justify-content-center g-4">

                ${tarjetasHtml}

            </div>

        </section>

    `;

}


/* ===================================================
   OBTENER ESTADO
=================================================== */

function obtenerEstadoPerfilJugador(
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
        estados.DISPONIBLE
    );

}


/* ===================================================
   CALCULAR EDAD
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


/* ===================================================
   FECHA DE NACIMIENTO VISIBLE
=================================================== */

function obtenerFechaNacimientoVisible(
    fechaNacimiento
) {

    if (!fechaNacimiento) {

        return "Por confirmar";

    }

    const fecha =
        new Date(
            `${fechaNacimiento}T12:00:00`
        );

    if (
        Number.isNaN(
            fecha.getTime()
        )
    ) {

        return "Por confirmar";

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


/* ===================================================
   NÚMERO SEGURO
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
/* ===================================================
   JUGADOR NO ENCONTRADO
=================================================== */

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


/* ===================================================
   OCULTAR ESTADO DE CARGA
=================================================== */

function ocultarCargaJugador() {

    const carga =
        document.getElementById(
            "jugador-cargando"
        );

    if (carga) {

        carga.hidden = true;

    }

}


/* ===================================================
   MOSTRAR ERROR
=================================================== */

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


/* ===================================================
   OBTENER PARÁMETRO DE LA URL
=================================================== */

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


/* ===================================================
   COLOCAR TEXTO
=================================================== */

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


/* ===================================================
   ESCAPAR TEXTO
=================================================== */

function escaparJugador(
    valor
) {

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
   DEPURACIÓN
=================================================== */

console.log(
    "👤 Sistema de perfiles de jugadores cargado."
);