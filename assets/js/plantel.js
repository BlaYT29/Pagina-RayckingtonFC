/* ===================================================
   RAYCKINGTON FC
   PLANTEL.JS
=================================================== */

"use strict";


/* ===================================================
   CONFIGURACIÓN
=================================================== */

const RUTA_PLANTEL =
    "assets/data/plantel/plantel.json";

const FOTO_RESPALDO =
    "assets/img/jugadores/jugador-default.webp";


/* ===================================================
   ESTADO GENERAL
=================================================== */

let datosPlantel = null;

let jugadoresPlantel = [];


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

    EXD: 7,

    EXI: 8,

    F9: 9,

    DC: 10

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
        "MC"
    ],

    delanteros: [
        "EXD",
        "EXI",
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

        jugadoresPlantel =
            prepararJugadores(
                datosPlantel.jugadores
            );

        actualizarInformacionGeneral();

        renderizarPlantelCompleto();

        ocultarCargaPlantel();

    } catch (error) {

        console.error(
            "Error al cargar el plantel:",
            error
        );

        mostrarErrorPlantel(
            "No fue posible cargar el plantel. " +
            "Revisa plantel.json y abre la página con Live Server."
        );

    }

}


/* ===================================================
   CARGAR JSON
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
        !Array.isArray(datos.jugadores)
    ) {

        throw new Error(
            "plantel.json debe incluir un arreglo llamado jugadores."
        );

    }

    return datos;

}


/* ===================================================
   PREPARAR JUGADORES
=================================================== */

function prepararJugadores(jugadores) {

    return jugadores

        .filter(
            jugador =>
                jugador &&
                jugador.estado !== "INACTIVO"
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

                return numeroA - numeroB;

            }
        );

}


/* ===================================================
   ACTUALIZAR INFORMACIÓN GENERAL
=================================================== */

function actualizarInformacionGeneral() {

    const temporada =
        datosPlantel?.temporada ||
        "Temporada 2026";

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

function crearTarjetaJugador(jugador) {

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
                        jugador.posicion
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

                        <span>

                            Partidos

                        </span>

                    </div>

                    <div class="player-stat">

                        <strong>

                            ${obtenerNumeroSeguro(
                                estadisticas.goles
                            )}

                        </strong>

                        <span>

                            Goles

                        </span>

                    </div>

                    <div class="player-stat">

                        <strong>

                            ${obtenerNumeroSeguro(
                                estadisticas.asistencias
                            )}

                        </strong>

                        <span>

                            Asistencias

                        </span>

                    </div>

                </div>

                <a
                    href="${crearEnlacePerfilJugador(
                        jugador.slug
                    )}"
                    class="btn btn-primary-club player-profile-button">

                    Ver perfil

                    <i class="bi bi-arrow-right ms-2"></i>

                </a>

            </div>

        </article>

    `;

}


/* ===================================================
   ESTADO DEL JUGADOR
=================================================== */

function obtenerEstadoJugador(estado) {

    const valor =
        String(
            estado || "DISPONIBLE"
        ).toUpperCase();

    const estados = {

        DISPONIBLE: {
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

function crearEnlacePerfilJugador(slug) {

    return `jugador.html?slug=${encodeURIComponent(
        slug
    )}`;

}


/* ===================================================
   CALCULAR EDAD
=================================================== */

function calcularEdad(fechaNacimiento) {

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

function obtenerNumeroSeguro(valor) {

    const numero =
        Number(valor);

    return Number.isFinite(numero)
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

function mostrarErrorPlantel(mensaje) {

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

function colocarTextoPlantel(id, valor) {

    const elemento =
        document.getElementById(id);

    if (!elemento) {

        return;

    }

    elemento.textContent =
        valor ?? "";

}


/* ===================================================
   ESCAPAR TEXTO
=================================================== */

function escaparPlantel(valor) {

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
    "⚽ Sistema de plantel de Rayckington FC cargado."
);