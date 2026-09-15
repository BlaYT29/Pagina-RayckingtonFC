/* ===================================================
   RAYCKINGTON FC
   PARTIDOS.JS
=================================================== */

"use strict";

/* ===================================================
   CONFIGURACIÓN GENERAL
=================================================== */

const RUTA_BASE = "assets/data/temporadas";
const CLUB_DESTACADO = "Rayckington FC";

/* ===================================================
   ELEMENTOS DEL DOM
=================================================== */

const selectorTemporada = document.getElementById("selector-temporada");
const estadoCarga = document.getElementById("estado-carga");
const contenidoPartidos = document.getElementById("contenido-partidos");
const estadoTemporada = document.getElementById("estado-temporada");

/* ===================================================
   INICIO
=================================================== */

document.addEventListener("DOMContentLoaded", () => {

    if (!selectorTemporada) {

        console.error(
            "No se encontró el selector de temporada."
        );

        return;

    }

    selectorTemporada.addEventListener("change", () => {

        cargarTemporada(selectorTemporada.value);

    });

    cargarTemporada(selectorTemporada.value);

});

/* ===================================================
   CARGAR TEMPORADA
=================================================== */

async function cargarTemporada(rutaTemporada) {

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

    if (estadoTemporada) {

        estadoTemporada.textContent =
            `Estado: ${config.estado || "Sin información"}`;

    }

    document.title =
        `${config.temporada || "Partidos"} | Rayckington FC`;

}


/* ===================================================
   RENDERIZAR ESTADÍSTICAS
=================================================== */

function renderizarEstadisticas(datos) {

    const posicion = Number(datos.posicion) > 0
        ? `${datos.posicion}°`
        : "--";

    colocarTexto(
        "hero-posicion",
        posicion
    );

    colocarTexto(
        "hero-puntos",
        valorSeguro(datos.pts)
    );

    colocarTexto(
        "hero-gf",
        valorSeguro(datos.gf)
    );

    colocarTexto(
        "hero-gc",
        valorSeguro(datos.gc)
    );

    colocarTexto(
        "stat-pj",
        valorSeguro(datos.pj)
    );

    colocarTexto(
        "stat-pg",
        valorSeguro(datos.pg)
    );

    colocarTexto(
        "stat-pe",
        valorSeguro(datos.pe)
    );

    colocarTexto(
        "stat-pp",
        valorSeguro(datos.pp)
    );

    colocarTexto(
        "stat-gf",
        valorSeguro(datos.gf)
    );

    colocarTexto(
        "stat-gc",
        valorSeguro(datos.gc)
    );

    colocarTexto(
        "stat-dg",
        valorSeguro(datos.dg)
    );

    colocarTexto(
        "stat-pts",
        valorSeguro(datos.pts)
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

    if (
        !cuerpo ||
        !contenedor ||
        !mensajeVacio
    ) {

        return;

    }

    cuerpo.innerHTML = "";

    if (
        !Array.isArray(tabla) ||
        tabla.length === 0
    ) {

        contenedor.hidden = true;

        mensajeVacio.hidden = false;

        return;

    }

    contenedor.hidden = false;

    mensajeVacio.hidden = true;

    tabla
        .slice()
        .sort(
            (a, b) =>
                Number(a.pos) - Number(b.pos)
        )
        .forEach((equipo) => {

            const fila =
                document.createElement("tr");

            if (
                normalizar(equipo.club) ===
                normalizar(clubDestacado)
            ) {

                fila.classList.add(
                    "rayckington-row"
                );

            }

            fila.innerHTML = `

                <td>
                    ${escapar(equipo.pos)}
                </td>

                <td>
                    ${escapar(equipo.club)}
                </td>

                <td>
                    ${escapar(equipo.pj)}
                </td>

                <td>
                    ${escapar(equipo.v)}
                </td>

                <td>
                    ${escapar(equipo.e)}
                </td>

                <td>
                    ${escapar(equipo.d)}
                </td>

                <td>
                    ${escapar(equipo.gf)}
                </td>

                <td>
                    ${escapar(equipo.gc)}
                </td>

                <td>
                    ${formatearDiferencia(
                        equipo.dg
                    )}
                </td>

                <td>
                    <strong>
                        ${escapar(equipo.pts)}
                    </strong>
                </td>

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

    if (
        !listado ||
        !mensajeVacio
    ) {

        return;

    }

    listado.innerHTML = "";

    if (
        !Array.isArray(partidos) ||
        partidos.length === 0
    ) {

        listado.hidden = true;

        mensajeVacio.hidden = false;

        return;

    }

    listado.hidden = false;

    mensajeVacio.hidden = true;

    const partidosPorFecha =
        agruparPorFecha(partidos);

    Object
        .keys(partidosPorFecha)
        .map(Number)
        .sort((a, b) => a - b)
        .forEach((numeroFecha) => {

            const columna =
                document.createElement("div");

            columna.className =
                "col-lg-4 col-md-6";

            const tarjeta =
                document.createElement("article");

            tarjeta.className =
                "fixture-card";

            const titulo =
                document.createElement("h3");

            titulo.textContent =
                `Fecha ${numeroFecha}`;

            tarjeta.appendChild(titulo);

            partidosPorFecha[numeroFecha]
                .slice()
                .sort(
                    (a, b) =>
                        Number(a.orden) -
                        Number(b.orden)
                )
                .forEach((partido) => {

                    const filaPartido =
                        crearFilaPartido(
                            partido,
                            clubDestacado
                        );

                    tarjeta.appendChild(
                        filaPartido
                    );

                });

            columna.appendChild(tarjeta);

            listado.appendChild(columna);

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