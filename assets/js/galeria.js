/* ===================================================
   RAYCKINGTON FC
   GALERIA.JS
=================================================== */

"use strict";


/* ===================================================
   CONFIGURACIÓN
=================================================== */

const RUTA_GALERIA =
    "assets/data/galeria/galeria.json";

const IMAGEN_RESPALDO =
    "assets/img/gallery/galeria-default.jpg";


/* ===================================================
   ESTADO
=================================================== */

let todasLasFotos = [];

let categoriaGaleriaActiva =
    "todas";

let textoBusquedaGaleria =
    "";


/* ===================================================
   INICIO
=================================================== */

document.addEventListener(
    "DOMContentLoaded",
    iniciarGaleria
);


/* ===================================================
   INICIAR GALERÍA
=================================================== */

async function iniciarGaleria() {

    try {

        const datos =
            await cargarGaleria();

        todasLasFotos =
            prepararFotos(datos);

        renderizarGaleria(
            todasLasFotos
        );

        configurarBuscadorGaleria();

        configurarFiltrosGaleria();

        configurarModalGaleria();

        ocultarCargaGaleria();

    } catch (error) {

        console.error(
            "Error al cargar la galería:",
            error
        );

        mostrarErrorGaleria(
            "No fue posible cargar la galería. " +
            "Revisa galeria.json y abre la web con Live Server."
        );

    }

}


/* ===================================================
   CARGAR JSON
=================================================== */

async function cargarGaleria() {

    const respuesta =
        await fetch(
            RUTA_GALERIA,
            {
                cache: "no-store"
            }
        );

    if (!respuesta.ok) {

        throw new Error(
            `Error ${respuesta.status} al cargar ${RUTA_GALERIA}`
        );

    }

    const datos =
        await respuesta.json();

    if (!Array.isArray(datos)) {

        throw new Error(
            "galeria.json debe contener un arreglo."
        );

    }

    return datos;

}


/* ===================================================
   PREPARAR FOTOS
=================================================== */

function prepararFotos(fotos) {

    return fotos

        .filter(
            foto =>
                foto &&
                foto.publicada !== false
        )

        .filter(
            foto =>
                typeof foto.imagen ===
                    "string" &&
                foto.imagen.trim() !== ""
        )

        .sort(
            (a, b) =>
                convertirFechaGaleria(
                    b.fecha
                ) -
                convertirFechaGaleria(
                    a.fecha
                )
        );

}


/* ===================================================
   RENDERIZAR GALERÍA
=================================================== */

function renderizarGaleria(fotos) {

    const listado =
        document.getElementById(
            "galeria-listado"
        );

    const mensajeVacio =
        document.getElementById(
            "galeria-vacia"
        );

    if (!listado) {

        return;

    }

    listado.innerHTML = "";

    if (
        !Array.isArray(fotos) ||
        fotos.length === 0
    ) {

        if (mensajeVacio) {

            mensajeVacio.hidden = false;

        }

        return;

    }

    if (mensajeVacio) {

        mensajeVacio.hidden = true;

    }

    fotos.forEach(
        foto => {

            const columna =
                document.createElement(
                    "div"
                );

            columna.className =
                "col-lg-4 col-md-6";

            columna.innerHTML =
                crearTarjetaGaleria(
                    foto
                );

            listado.appendChild(
                columna
            );

        }
    );

    configurarEventosFotos();

}


/* ===================================================
   CREAR TARJETA
=================================================== */

function crearTarjetaGaleria(foto) {

    return `

        <article class="gallery-card">

            <button
                type="button"
                class="gallery-open"
                data-id="${escaparGaleria(
                    foto.id
                )}"
                aria-label="Abrir imagen: ${escaparGaleria(
                    foto.titulo
                )}">

                <div class="gallery-card-image">

                    <img
                        src="${escaparGaleria(
                            foto.imagen
                        )}"
                        alt="${escaparGaleria(
                            foto.titulo ||
                            "Imagen de Rayckington FC"
                        )}"
                        loading="lazy"
                        onerror="
                            this.onerror=null;
                            this.src='${IMAGEN_RESPALDO}';
                        ">

                    <div class="gallery-card-overlay">

                        <i class="bi bi-arrows-fullscreen"></i>

                    </div>

                    <span class="gallery-category">

                        ${escaparGaleria(
                            foto.categoria ||
                            "Galería"
                        )}

                    </span>

                </div>

                <div class="gallery-card-content">

                    <h3>

                        ${escaparGaleria(
                            foto.titulo ||
                            "Rayckington FC"
                        )}

                    </h3>

                    <p class="gallery-date">

                        <i class="bi bi-calendar3 me-2"></i>

                        ${escaparGaleria(
                            obtenerFechaGaleria(
                                foto
                            )
                        )}

                    </p>

                    <p>

                        ${escaparGaleria(
                            foto.descripcion ||
                            ""
                        )}

                    </p>

                </div>

            </button>

        </article>

    `;

}


/* ===================================================
   EVENTOS DE FOTOS
=================================================== */

function configurarEventosFotos() {

    const botones =
        document.querySelectorAll(
            ".gallery-open"
        );

    botones.forEach(
        boton => {

            boton.addEventListener(
                "click",
                () => {

                    const id =
                        boton.dataset.id;

                    abrirFotoGaleria(
                        id
                    );

                }
            );

        }
    );

}


/* ===================================================
   ABRIR FOTO
=================================================== */

function abrirFotoGaleria(id) {

    const foto =
        todasLasFotos.find(
            item =>
                item.id === id
        );

    if (!foto) {

        return;

    }

    const imagen =
        document.getElementById(
            "modal-galeria-imagen"
        );

    const titulo =
        document.getElementById(
            "modal-galeria-titulo"
        );

    const categoria =
        document.getElementById(
            "modal-galeria-categoria"
        );

    const fecha =
        document.getElementById(
            "modal-galeria-fecha"
        );

    const descripcion =
        document.getElementById(
            "modal-galeria-descripcion"
        );

    if (imagen) {

        imagen.src =
            foto.imagen;

        imagen.alt =
            foto.titulo ||
            "Imagen de Rayckington FC";

        imagen.onerror = () => {

            imagen.onerror = null;

            imagen.src =
                IMAGEN_RESPALDO;

        };

    }

    if (titulo) {

        titulo.textContent =
            foto.titulo ||
            "Rayckington FC";

    }

    if (categoria) {

        categoria.textContent =
            foto.categoria ||
            "Galería";

    }

    if (fecha) {

        fecha.textContent =
            obtenerFechaGaleria(
                foto
            );

    }

    if (descripcion) {

        descripcion.textContent =
            foto.descripcion ||
            "";

    }

    const modalElemento =
        document.getElementById(
            "modalGaleria"
        );

    if (!modalElemento) {

        return;

    }

    const modal =
        bootstrap.Modal.getOrCreateInstance(
            modalElemento
        );

    modal.show();

}


/* ===================================================
   BUSCADOR
=================================================== */

function configurarBuscadorGaleria() {

    const buscador =
        document.getElementById(
            "buscador-galeria"
        );

    if (!buscador) {

        return;

    }

    buscador.addEventListener(
        "input",
        evento => {

            textoBusquedaGaleria =
                normalizarGaleria(
                    evento.target.value
                );

            aplicarFiltrosGaleria();

        }
    );

}


/* ===================================================
   FILTROS
=================================================== */

function configurarFiltrosGaleria() {

    const filtros =
        document.querySelectorAll(
            ".gallery-filter"
        );

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

                    categoriaGaleriaActiva =
                        boton.dataset.categoria ||
                        "todas";

                    aplicarFiltrosGaleria();

                }
            );

        }
    );

}


/* ===================================================
   APLICAR FILTROS
=================================================== */

function aplicarFiltrosGaleria() {

    const filtradas =
        todasLasFotos.filter(
            foto => {

                const categoria =
                    normalizarGaleria(
                        foto.categoria
                    );

                const coincideCategoria =
                    categoriaGaleriaActiva ===
                        "todas" ||
                    categoria ===
                        normalizarGaleria(
                            categoriaGaleriaActiva
                        );

                const contenido = `

                    ${foto.titulo || ""}

                    ${foto.descripcion || ""}

                    ${foto.categoria || ""}

                    ${foto.fechaTexto || ""}

                `;

                const coincideBusqueda =
                    normalizarGaleria(
                        contenido
                    ).includes(
                        textoBusquedaGaleria
                    );

                return (
                    coincideCategoria &&
                    coincideBusqueda
                );

            }
        );

    renderizarGaleria(
        filtradas
    );

}


/* ===================================================
   CONFIGURAR MODAL
=================================================== */

function configurarModalGaleria() {

    const modal =
        document.getElementById(
            "modalGaleria"
        );

    if (!modal) {

        return;

    }

    modal.addEventListener(
        "hidden.bs.modal",
        () => {

            const imagen =
                document.getElementById(
                    "modal-galeria-imagen"
                );

            if (imagen) {

                imagen.src = "";

                imagen.alt = "";

            }

        }
    );

}


/* ===================================================
   FECHAS
=================================================== */

function convertirFechaGaleria(
    fecha
) {

    if (!fecha) {

        return new Date(0);

    }

    return new Date(
        `${fecha}T12:00:00`
    );

}


function obtenerFechaGaleria(
    foto
) {

    if (foto.fechaTexto) {

        return foto.fechaTexto;

    }

    if (!foto.fecha) {

        return "Fecha por confirmar";

    }

    return convertirFechaGaleria(
        foto.fecha
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
   CARGA Y ERRORES
=================================================== */

function ocultarCargaGaleria() {

    const carga =
        document.getElementById(
            "galeria-cargando"
        );

    if (carga) {

        carga.hidden = true;

    }

}


function mostrarErrorGaleria(
    mensaje
) {

    const carga =
        document.getElementById(
            "galeria-cargando"
        );

    if (!carga) {

        return;

    }

    carga.hidden = false;

    carga.innerHTML = `

        <div class="container">

            <div class="alert alert-danger text-center mb-0">

                <i class="bi bi-exclamation-triangle-fill me-2"></i>

                ${escaparGaleria(
                    mensaje
                )}

            </div>

        </div>

    `;

}


/* ===================================================
   UTILIDADES
=================================================== */

function normalizarGaleria(
    texto
) {

    return String(texto || "")

        .normalize("NFD")

        .replace(
            /[\u0300-\u036f]/g,
            ""
        )

        .trim()

        .toLowerCase();

}


function escaparGaleria(
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


console.log(
    "📸 Sistema de galería de Rayckington FC cargado."
);