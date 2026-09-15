/* ===================================================
   RAYCKINGTON FC
   NOTICIAS.JS
=================================================== */

"use strict";


/* ===================================================
   CONFIGURACIÓN GENERAL
=================================================== */

const RUTA_NOTICIAS =
    "assets/data/noticias/noticias.json";

const IMAGEN_RESPALDO =
    "assets/img/noticias/noticia-default.jpg";


/* ===================================================
   ESTADO DEL SISTEMA
=================================================== */

let todasLasNoticias = [];

let categoriaActiva = "todas";

let textoBusqueda = "";


/* ===================================================
   INICIO
=================================================== */

document.addEventListener(
    "DOMContentLoaded",
    iniciarSistemaNoticias
);


/* ===================================================
   INICIAR SISTEMA
=================================================== */

async function iniciarSistemaNoticias() {

    try {

        const noticias =
            await cargarNoticias();

        todasLasNoticias =
            prepararNoticias(noticias);

        /*
         * Página general:
         * noticias.html
         */

        const esPaginaNoticias =
            document.getElementById(
                "noticia-destacada"
            ) !== null ||
            document.getElementById(
                "noticias-listado"
            ) !== null;

        if (esPaginaNoticias) {

            renderizarPaginaNoticias(
                todasLasNoticias
            );

        }

        /*
         * Página individual:
         * noticia.html
         */

        const esDetalleNoticia =
            document.getElementById(
                "detalle-noticia"
            ) !== null;

        if (esDetalleNoticia) {

            renderizarDetalleNoticia(
                todasLasNoticias
            );

        }

    } catch (error) {

        console.error(
            "Error al iniciar el sistema de noticias:",
            error
        );

        mostrarErrorNoticias(
            "No fue posible cargar las noticias. " +
            "Revisa el archivo noticias.json y abre la web con Live Server."
        );

    }

}


/* ===================================================
   CARGAR ARCHIVO JSON
=================================================== */

async function cargarNoticias() {

    const respuesta = await fetch(
        RUTA_NOTICIAS,
        {
            cache: "no-store"
        }
    );

    if (!respuesta.ok) {

        throw new Error(
            `Error ${respuesta.status} al cargar ${RUTA_NOTICIAS}`
        );

    }

    const datos =
        await respuesta.json();

    if (!Array.isArray(datos)) {

        throw new Error(
            "El archivo noticias.json debe contener un arreglo de noticias."
        );

    }

    return datos;

}


/* ===================================================
   PREPARAR Y ORDENAR NOTICIAS
=================================================== */

function prepararNoticias(noticias) {

    return noticias

        /*
         * Ocultar publicaciones marcadas
         * como no publicadas.
         */

        .filter(
            noticia =>
                noticia &&
                noticia.publicada !== false
        )

        /*
         * Evitar noticias sin slug o título.
         */

        .filter(
            noticia =>
                typeof noticia.slug === "string" &&
                noticia.slug.trim() !== "" &&
                typeof noticia.titulo === "string" &&
                noticia.titulo.trim() !== ""
        )

        /*
         * Ordenar desde la más reciente
         * hasta la más antigua.
         */

        .sort(
            (a, b) =>
                convertirFecha(b.fecha) -
                convertirFecha(a.fecha)
        );

}


/* ===================================================
   RENDERIZAR PÁGINA GENERAL
=================================================== */

function renderizarPaginaNoticias(noticias) {

    ocultarCargaGeneral();

    const noticiaDestacada =
        obtenerNoticiaDestacada(
            noticias
        );

    renderizarDestacada(
        noticiaDestacada
    );

    renderizarListadoNoticias(
        noticias,
        noticiaDestacada
    );

    configurarBuscadorYFiltros();

}


/* ===================================================
   OBTENER NOTICIA DESTACADA
=================================================== */

function obtenerNoticiaDestacada(noticias) {

    if (
        !Array.isArray(noticias) ||
        noticias.length === 0
    ) {

        return null;

    }

    const marcadaComoDestacada =
        noticias.find(
            noticia =>
                noticia.destacada === true
        );

    return (
        marcadaComoDestacada ||
        noticias[0]
    );

}
/* ===================================================
   RENDERIZAR NOTICIA DESTACADA
=================================================== */

function renderizarDestacada(noticia) {

    const contenedor =
        document.getElementById(
            "noticia-destacada"
        );

    if (!contenedor) {

        return;

    }

    if (!noticia) {

        contenedor.innerHTML = `

            <div class="card-custom text-center">

                <i class="bi bi-newspaper fs-1 text-warning"></i>

                <h3 class="mt-3">

                    No hay noticias destacadas

                </h3>

                <p class="mb-0">

                    Las publicaciones aparecerán aquí automáticamente.

                </p>

            </div>

        `;

        return;

    }

    contenedor.innerHTML = `

        <article class="featured-news">

            <div class="row align-items-stretch g-0">

                <div class="col-lg-7">

                    <div class="featured-news-image">

                        <img
                            src="${escaparAtributo(
                                noticia.imagen
                            )}"
                            alt="${escaparAtributo(
                                noticia.imagenAlt ||
                                noticia.titulo
                            )}"
                            onerror="
                                this.onerror=null;
                                this.src='${IMAGEN_RESPALDO}';
                            ">

                        <span class="featured-news-category">

                            ${escaparTexto(
                                noticia.categoria ||
                                "Actualidad"
                            )}

                        </span>

                    </div>

                </div>

                <div class="col-lg-5">

                    <div class="featured-news-content">

                        <div class="news-meta">

                            <span>

                                <i class="bi bi-calendar3 me-2"></i>

                                ${escaparTexto(
                                    obtenerFechaVisible(
                                        noticia
                                    )
                                )}

                            </span>

                            <span>

                                <i class="bi bi-person-fill me-2"></i>

                                ${escaparTexto(
                                    noticia.autor ||
                                    "Rayckington FC"
                                )}

                            </span>

                        </div>

                        <h2>

                            ${escaparTexto(
                                noticia.titulo
                            )}

                        </h2>

                        ${
                            noticia.subtitulo
                                ? `
                                    <p class="featured-subtitle">

                                        ${escaparTexto(
                                            noticia.subtitulo
                                        )}

                                    </p>
                                `
                                : ""
                        }

                        <p>

                            ${escaparTexto(
                                noticia.resumen || ""
                            )}

                        </p>

                        <a
                            href="${crearEnlaceNoticia(
                                noticia.slug
                            )}"
                            class="btn btn-primary-club">

                            Leer noticia

                            <i class="bi bi-arrow-right ms-2"></i>

                        </a>

                    </div>

                </div>

            </div>

        </article>

    `;

}


/* ===================================================
   RENDERIZAR LISTADO DE NOTICIAS
=================================================== */

function renderizarListadoNoticias(
    noticias,
    noticiaDestacada
) {

    const listado =
        document.getElementById(
            "noticias-listado"
        );

    const mensajeVacio =
        document.getElementById(
            "noticias-vacio"
        );

    if (!listado) {

        return;

    }

    listado.innerHTML = "";

    const publicaciones =
        noticias.filter(
            noticia =>
                noticia.id !==
                noticiaDestacada?.id
        );

    if (
        !Array.isArray(publicaciones) ||
        publicaciones.length === 0
    ) {

        if (mensajeVacio) {

            mensajeVacio.hidden = false;

        }

        return;

    }

    if (mensajeVacio) {

        mensajeVacio.hidden = true;

    }

    publicaciones.forEach(
        noticia => {

            const columna =
                document.createElement(
                    "div"
                );

            columna.className =
                "col-lg-4 col-md-6";

            columna.innerHTML =
                crearTarjetaNoticia(
                    noticia
                );

            listado.appendChild(
                columna
            );

        }
    );

}


/* ===================================================
   CREAR TARJETA DE NOTICIA
=================================================== */

function crearTarjetaNoticia(noticia) {

    return `

        <article class="news-grid-card">

            <div class="news-grid-image">

                <img
                    src="${escaparAtributo(
                        noticia.imagen
                    )}"
                    alt="${escaparAtributo(
                        noticia.imagenAlt ||
                        noticia.titulo
                    )}"
                    loading="lazy"
                    onerror="
                        this.onerror=null;
                        this.src='${IMAGEN_RESPALDO}';
                    ">

                <span class="news-grid-category">

                    ${escaparTexto(
                        noticia.categoria ||
                        "Actualidad"
                    )}

                </span>

            </div>

            <div class="news-grid-content">

                <div class="news-meta">

                    <span>

                        <i class="bi bi-calendar3 me-2"></i>

                        ${escaparTexto(
                            obtenerFechaVisible(
                                noticia
                            )
                        )}

                    </span>

                </div>

                <h3>

                    ${escaparTexto(
                        noticia.titulo
                    )}

                </h3>

                <p>

                    ${escaparTexto(
                        noticia.resumen || ""
                    )}

                </p>

                <a
                    href="${crearEnlaceNoticia(
                        noticia.slug
                    )}"
                    class="news-card-button">

                    Leer noticia

                    <i class="bi bi-arrow-right ms-2"></i>

                </a>

            </div>

        </article>

    `;

}
/* ===================================================
   CONFIGURAR BUSCADOR Y FILTROS
=================================================== */

function configurarBuscadorYFiltros() {

    const buscador =
        document.getElementById(
            "buscador-noticias"
        );

    const filtros =
        document.querySelectorAll(
            ".news-filter"
        );

    if (buscador) {

        buscador.addEventListener(
            "input",
            (evento) => {

                textoBusqueda =
                    evento.target.value
                        .trim()
                        .toLowerCase();

                aplicarFiltrosNoticias();

            }
        );

    }

    filtros.forEach(
        boton => {

            boton.addEventListener(
                "click",
                () => {

                    filtros.forEach(
                        item => {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );

                    boton.classList.add(
                        "active"
                    );

                    categoriaActiva =
                        boton.dataset.categoria ||
                        "todas";

                    aplicarFiltrosNoticias();

                }
            );

        }
    );

}


/* ===================================================
   APLICAR FILTROS
=================================================== */

function aplicarFiltrosNoticias() {

    const noticiaDestacada =
        obtenerNoticiaDestacada(
            todasLasNoticias
        );

    const noticiasFiltradas =
        todasLasNoticias.filter(
            noticia => {

                const categoria =
                    String(
                        noticia.categoria ||
                        ""
                    );

                const coincideCategoria =
                    categoriaActiva === "todas" ||
                    normalizarTexto(categoria) ===
                    normalizarTexto(
                        categoriaActiva
                    );

                const contenidoBusqueda = `

                    ${noticia.titulo || ""}

                    ${noticia.subtitulo || ""}

                    ${noticia.resumen || ""}

                    ${noticia.categoria || ""}

                    ${noticia.autor || ""}

                `;

                const coincideBusqueda =
                    normalizarTexto(
                        contenidoBusqueda
                    ).includes(
                        normalizarTexto(
                            textoBusqueda
                        )
                    );

                return (
                    coincideCategoria &&
                    coincideBusqueda
                );

            }
        );

    renderizarListadoNoticias(
        noticiasFiltradas,
        noticiaDestacada
    );

}


/* ===================================================
   NORMALIZAR TEXTO PARA BÚSQUEDA
=================================================== */

function normalizarTexto(texto) {

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
   RENDERIZAR DETALLE DE NOTICIA
=================================================== */

function renderizarDetalleNoticia(noticias) {

    const slug =
        obtenerParametroUrl(
            "slug"
        );

    const contenedor =
        document.getElementById(
            "detalle-noticia"
        );

    if (!contenedor) {

        return;

    }

    if (!slug) {

        mostrarNoticiaNoEncontrada(
            contenedor
        );

        return;

    }

    const noticia =
        noticias.find(
            item =>
                item.slug === slug
        );

    if (!noticia) {

        mostrarNoticiaNoEncontrada(
            contenedor
        );

        return;

    }

    document.title =
        `${noticia.titulo} | Rayckington FC`;

    actualizarHeroDetalle(
        noticia
    );

    contenedor.innerHTML =
        crearContenidoNoticia(
            noticia
        );

    renderizarRelacionadas(
        noticia,
        noticias
    );

    ocultarCargaDetalle();

}


/* ===================================================
   ACTUALIZAR HERO DEL DETALLE
=================================================== */

function actualizarHeroDetalle(noticia) {

    colocarTexto(
        "detalle-categoria",
        noticia.categoria ||
        "Actualidad"
    );

    colocarTexto(
        "detalle-titulo",
        noticia.titulo
    );

    colocarTexto(
        "detalle-resumen",
        noticia.subtitulo ||
        noticia.resumen ||
        ""
    );

}


/* ===================================================
   CREAR CONTENIDO COMPLETO
=================================================== */

function crearContenidoNoticia(noticia) {

    const parrafos =
        Array.isArray(
            noticia.contenido
        )
            ? noticia.contenido
            : [];

    const contenidoHtml =
        parrafos
            .map(
                parrafo => `

                    <p>

                        ${escaparTexto(
                            parrafo
                        )}

                    </p>

                `
            )
            .join("");

    return `

        <article class="article-detail">

            <header class="article-detail-header">

                <div class="news-meta">

                    <span>

                        <i class="bi bi-calendar3 me-2"></i>

                        ${escaparTexto(
                            obtenerFechaVisible(
                                noticia
                            )
                        )}

                    </span>

                    <span>

                        <i class="bi bi-person-fill me-2"></i>

                        ${escaparTexto(
                            noticia.autor ||
                            "Rayckington FC"
                        )}

                    </span>

                    <span>

                        <i class="bi bi-tag-fill me-2"></i>

                        ${escaparTexto(
                            noticia.categoria ||
                            "Actualidad"
                        )}

                    </span>

                </div>

            </header>

            <figure class="article-main-image">

                <img
                    src="${escaparAtributo(
                        noticia.imagen
                    )}"
                    alt="${escaparAtributo(
                        noticia.imagenAlt ||
                        noticia.titulo
                    )}"
                    onerror="
                        this.onerror=null;
                        this.src='${IMAGEN_RESPALDO}';
                    ">

            </figure>

            <div class="article-body">

                ${
                    noticia.subtitulo
                        ? `

                            <p class="article-lead">

                                ${escaparTexto(
                                    noticia.subtitulo
                                )}

                            </p>

                        `
                        : ""
                }

                ${contenidoHtml}

                ${crearVideoNoticia(
                    noticia.video
                )}

                ${crearEnlaceExterno(
                    noticia.enlaceExterno
                )}

                ${crearGaleriaNoticia(
                    noticia.galeria
                )}

            </div>

            <footer class="article-footer">

                <a
                    href="noticias.html"
                    class="btn btn-primary-club">

                    <i class="bi bi-arrow-left me-2"></i>

                    Volver a noticias

                </a>

            </footer>

        </article>

    `;

}


/* ===================================================
   GALERÍA DE LA NOTICIA
=================================================== */

function crearGaleriaNoticia(galeria) {

    if (
        !Array.isArray(galeria) ||
        galeria.length === 0
    ) {

        return "";

    }

    const imagenes =
        galeria
            .map(
                (imagen, indice) => `

                    <div class="col-lg-4 col-md-6">

                        <a
                            href="${escaparAtributo(
                                imagen
                            )}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="article-gallery-item">

                            <img
                                src="${escaparAtributo(
                                    imagen
                                )}"
                                alt="Galería de la noticia ${indice + 1}"
                                loading="lazy"
                                onerror="
                                    this.onerror=null;
                                    this.src='${IMAGEN_RESPALDO}';
                                ">

                        </a>

                    </div>

                `
            )
            .join("");

    return `

        <section class="article-gallery">

            <h3>

                Galería

            </h3>

            <div class="row g-4">

                ${imagenes}

            </div>

        </section>

    `;

}


/* ===================================================
   VIDEO
=================================================== */

function crearVideoNoticia(video) {

    if (!video) {

        return "";

    }

    return `

        <div class="article-video">

            <h3>

                Video

            </h3>

            <a
                href="${escaparAtributo(
                    video
                )}"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-outline-light">

                <i class="bi bi-play-circle-fill me-2"></i>

                Ver video

            </a>

        </div>

    `;

}


/* ===================================================
   ENLACE EXTERNO
=================================================== */

function crearEnlaceExterno(enlace) {

    if (!enlace) {

        return "";

    }

    return `

        <div class="article-external-link">

            <a
                href="${escaparAtributo(
                    enlace
                )}"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-outline-light">

                Más información

                <i class="bi bi-box-arrow-up-right ms-2"></i>

            </a>

        </div>

    `;

}
/* ===================================================
   RENDERIZAR DETALLE DE NOTICIA
=================================================== */

function renderizarDetalleNoticia(noticias) {

    const slug =
        obtenerParametroUrl(
            "slug"
        );

    const contenedor =
        document.getElementById(
            "detalle-noticia"
        );

    if (!contenedor) {

        return;

    }

    if (!slug) {

        mostrarNoticiaNoEncontrada(
            contenedor
        );

        return;

    }

    const noticia =
        noticias.find(
            item =>
                item.slug === slug
        );

    if (!noticia) {

        mostrarNoticiaNoEncontrada(
            contenedor
        );

        return;

    }

    document.title =
        `${noticia.titulo} | Rayckington FC`;

    actualizarHeroDetalle(
        noticia
    );

    contenedor.innerHTML =
        crearContenidoNoticia(
            noticia
        );

    renderizarRelacionadas(
        noticia,
        noticias
    );

    ocultarCargaDetalle();

}


/* ===================================================
   ACTUALIZAR HERO DEL DETALLE
=================================================== */

function actualizarHeroDetalle(noticia) {

    colocarTexto(
        "detalle-categoria",
        noticia.categoria ||
        "Actualidad"
    );

    colocarTexto(
        "detalle-titulo",
        noticia.titulo
    );

    colocarTexto(
        "detalle-resumen",
        noticia.subtitulo ||
        noticia.resumen ||
        ""
    );

}


/* ===================================================
   CREAR CONTENIDO COMPLETO
=================================================== */

function crearContenidoNoticia(noticia) {

    const parrafos =
        Array.isArray(
            noticia.contenido
        )
            ? noticia.contenido
            : [];

    const contenidoHtml =
        parrafos
            .map(
                parrafo => `

                    <p>

                        ${escaparTexto(
                            parrafo
                        )}

                    </p>

                `
            )
            .join("");

    return `

        <article class="article-detail">

            <header class="article-detail-header">

                <div class="news-meta">

                    <span>

                        <i class="bi bi-calendar3 me-2"></i>

                        ${escaparTexto(
                            obtenerFechaVisible(
                                noticia
                            )
                        )}

                    </span>

                    <span>

                        <i class="bi bi-person-fill me-2"></i>

                        ${escaparTexto(
                            noticia.autor ||
                            "Rayckington FC"
                        )}

                    </span>

                    <span>

                        <i class="bi bi-tag-fill me-2"></i>

                        ${escaparTexto(
                            noticia.categoria ||
                            "Actualidad"
                        )}

                    </span>

                </div>

            </header>

            <figure class="article-main-image">

                <img
                    src="${escaparAtributo(
                        noticia.imagen
                    )}"
                    alt="${escaparAtributo(
                        noticia.imagenAlt ||
                        noticia.titulo
                    )}"
                    onerror="
                        this.onerror=null;
                        this.src='${IMAGEN_RESPALDO}';
                    ">

            </figure>

            <div class="article-body">

                ${
                    noticia.subtitulo
                        ? `

                            <p class="article-lead">

                                ${escaparTexto(
                                    noticia.subtitulo
                                )}

                            </p>

                        `
                        : ""
                }

                ${contenidoHtml}

                ${crearVideoNoticia(
                    noticia.video
                )}

                ${crearEnlaceExterno(
                    noticia.enlaceExterno
                )}

                ${crearGaleriaNoticia(
                    noticia.galeria
                )}

            </div>

            <footer class="article-footer">

                <a
                    href="noticias.html"
                    class="btn btn-primary-club">

                    <i class="bi bi-arrow-left me-2"></i>

                    Volver a noticias

                </a>

            </footer>

        </article>

    `;

}


/* ===================================================
   GALERÍA DE LA NOTICIA
=================================================== */

function crearGaleriaNoticia(galeria) {

    if (
        !Array.isArray(galeria) ||
        galeria.length === 0
    ) {

        return "";

    }

    const imagenes =
        galeria
            .map(
                (imagen, indice) => `

                    <div class="col-lg-4 col-md-6">

                        <a
                            href="${escaparAtributo(
                                imagen
                            )}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="article-gallery-item">

                            <img
                                src="${escaparAtributo(
                                    imagen
                                )}"
                                alt="Galería de la noticia ${indice + 1}"
                                loading="lazy"
                                onerror="
                                    this.onerror=null;
                                    this.src='${IMAGEN_RESPALDO}';
                                ">

                        </a>

                    </div>

                `
            )
            .join("");

    return `

        <section class="article-gallery">

            <h3>

                Galería

            </h3>

            <div class="row g-4">

                ${imagenes}

            </div>

        </section>

    `;

}


/* ===================================================
   VIDEO
=================================================== */

function crearVideoNoticia(video) {

    if (!video) {

        return "";

    }

    return `

        <div class="article-video">

            <h3>

                Video

            </h3>

            <a
                href="${escaparAtributo(
                    video
                )}"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-outline-light">

                <i class="bi bi-play-circle-fill me-2"></i>

                Ver video

            </a>

        </div>

    `;

}


/* ===================================================
   ENLACE EXTERNO
=================================================== */

function crearEnlaceExterno(enlace) {

    if (!enlace) {

        return "";

    }

    return `

        <div class="article-external-link">

            <a
                href="${escaparAtributo(
                    enlace
                )}"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-outline-light">

                Más información

                <i class="bi bi-box-arrow-up-right ms-2"></i>

            </a>

        </div>

    `;

}
/* ===================================================
   NOTICIAS RELACIONADAS
=================================================== */

function renderizarRelacionadas(
    noticiaActual,
    todasLasNoticias
) {

    const contenedor =
        document.getElementById(
            "noticias-relacionadas"
        );

    const seccion =
        document.getElementById(
            "seccion-relacionadas"
        );

    if (!contenedor) {

        return;

    }

    let relacionadas = [];

    /*
     * Primero intenta usar los slugs
     * definidos en noticias.json.
     */

    if (
        Array.isArray(
            noticiaActual.relacionadas
        )
    ) {

        relacionadas =
            noticiaActual.relacionadas

                .map(
                    slug =>
                        todasLasNoticias.find(
                            noticia =>
                                noticia.slug ===
                                slug
                        )
                )

                .filter(Boolean);

    }

    /*
     * Si no existen relacionadas,
     * utiliza publicaciones de la
     * misma categoría.
     */

    if (relacionadas.length === 0) {

        relacionadas =
            todasLasNoticias.filter(
                noticia =>

                    noticia.id !==
                    noticiaActual.id &&

                    normalizarTexto(
                        noticia.categoria
                    ) ===
                    normalizarTexto(
                        noticiaActual.categoria
                    )
            );

    }

    /*
     * Como último respaldo, muestra
     * las publicaciones más recientes.
     */

    if (relacionadas.length === 0) {

        relacionadas =
            todasLasNoticias.filter(
                noticia =>
                    noticia.id !==
                    noticiaActual.id
            );

    }

    relacionadas =
        relacionadas.slice(0, 3);

    if (relacionadas.length === 0) {

        if (seccion) {

            seccion.hidden = true;

        }

        return;

    }

    if (seccion) {

        seccion.hidden = false;

    }

    contenedor.innerHTML = "";

    relacionadas.forEach(
        noticia => {

            const columna =
                document.createElement(
                    "div"
                );

            columna.className =
                "col-lg-4 col-md-6";

            columna.innerHTML =
                crearTarjetaNoticia(
                    noticia
                );

            contenedor.appendChild(
                columna
            );

        }
    );

}


/* ===================================================
   NOTICIA NO ENCONTRADA
=================================================== */

function mostrarNoticiaNoEncontrada(
    contenedor
) {

    document.title =
        "Noticia no encontrada | Rayckington FC";

    colocarTexto(
        "detalle-categoria",
        "Error"
    );

    colocarTexto(
        "detalle-titulo",
        "Noticia no encontrada"
    );

    colocarTexto(
        "detalle-resumen",
        "La publicación solicitada no existe o su enlace es incorrecto."
    );

    contenedor.innerHTML = `

        <div class="card-custom text-center">

            <i class="bi bi-exclamation-circle fs-1 text-warning"></i>

            <h2 class="mt-4">

                No encontramos esta noticia

            </h2>

            <p>

                La publicación pudo haber sido eliminada,
                todavía no está publicada o el enlace contiene
                un identificador incorrecto.

            </p>

            <a
                href="noticias.html"
                class="btn btn-primary-club mt-3">

                <i class="bi bi-arrow-left me-2"></i>

                Volver a noticias

            </a>

        </div>

    `;

    ocultarCargaDetalle();

}


/* ===================================================
   CREAR ENLACE DE NOTICIA
=================================================== */

function crearEnlaceNoticia(slug) {

    return `noticia.html?slug=${encodeURIComponent(
        slug
    )}`;

}


/* ===================================================
   OBTENER PARÁMETRO DE LA URL
=================================================== */

function obtenerParametroUrl(nombre) {

    const parametros =
        new URLSearchParams(
            window.location.search
        );

    return parametros.get(
        nombre
    );

}
/* ===================================================
   CONVERTIR FECHA
=================================================== */

function convertirFecha(fecha) {

    if (!fecha) {

        return new Date(0);

    }

    return new Date(
        `${fecha}T12:00:00`
    );

}


/* ===================================================
   FECHA VISIBLE
=================================================== */

function obtenerFechaVisible(noticia) {

    if (noticia.fechaTexto) {

        return noticia.fechaTexto;

    }

    if (!noticia.fecha) {

        return "Fecha por confirmar";

    }

    return convertirFecha(
        noticia.fecha
    ).toLocaleDateString(
        "es-CL",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}


/* ===================================================
   OCULTAR CARGA GENERAL
=================================================== */

function ocultarCargaGeneral() {

    const carga =
        document.getElementById(
            "noticias-cargando"
        );

    if (carga) {

        carga.hidden = true;

    }

}


/* ===================================================
   OCULTAR CARGA DEL DETALLE
=================================================== */

function ocultarCargaDetalle() {

    const carga =
        document.getElementById(
            "detalle-cargando"
        );

    if (carga) {

        carga.hidden = true;

    }

}


/* ===================================================
   MOSTRAR ERROR GENERAL
=================================================== */

function mostrarErrorNoticias(mensaje) {

    const cargaGeneral =
        document.getElementById(
            "noticias-cargando"
        );

    const cargaDetalle =
        document.getElementById(
            "detalle-cargando"
        );

    const contenidoError = `

        <div class="container">

            <div class="alert alert-danger text-center mb-0">

                <i class="bi bi-exclamation-triangle-fill me-2"></i>

                ${escaparTexto(
                    mensaje ||
                    "No fue posible cargar las noticias."
                )}

            </div>

        </div>

    `;

    if (cargaGeneral) {

        cargaGeneral.hidden = false;

        cargaGeneral.innerHTML =
            contenidoError;

    }

    if (cargaDetalle) {

        cargaDetalle.hidden = false;

        cargaDetalle.innerHTML =
            contenidoError;

    }

}


/* ===================================================
   COLOCAR TEXTO
=================================================== */

function colocarTexto(id, valor) {

    const elemento =
        document.getElementById(id);

    if (!elemento) {

        return;

    }

    elemento.textContent =
        valor || "";

}


/* ===================================================
   ESCAPAR TEXTO
=================================================== */

function escaparTexto(valor) {

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
   ESCAPAR ATRIBUTOS
=================================================== */

function escaparAtributo(valor) {

    return escaparTexto(
        valor
    );

}


/* ===================================================
   DEPURACIÓN
=================================================== */

console.log(
    "📰 Sistema de noticias de Rayckington FC cargado."
);