/* ===================================================
   RAYCKINGTON FC
   PANEL ADMINISTRATIVO
=================================================== */

"use strict";


/* ===================================================
   SUPABASE
=================================================== */

import {
    createClient
} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";


const SUPABASE_URL =
    "https://auutiadcyhhwxzkeernd.supabase.co";


const SUPABASE_KEY =
    "sb_publishable_luWCBHYOSUsFbmgPU4GoiQ_9nmBMRHe";


const supabase =
    createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* ===================================================
   ELEMENTOS
=================================================== */

const loginAdmin =
    document.getElementById(
        "login-admin"
    );


const panelAdmin =
    document.getElementById(
        "panel-admin"
    );


const formLoginAdmin =
    document.getElementById(
        "form-login-admin"
    );


const mensajeLogin =
    document.getElementById(
        "mensaje-login"
    );


const mensaje =
    document.getElementById(
        "mensaje"
    );


const listaPagos =
    document.getElementById(
        "lista-pagos"
    );


const btnCerrar =
    document.getElementById(
        "btn-cerrar-admin"
    );


const statPendientes =
    document.getElementById(
        "stat-pendientes"
    );


const statRecaudado =
    document.getElementById(
        "stat-recaudado"
    );


const statAprobados =
    document.getElementById(
        "stat-aprobados"
    );


const statRechazados =
    document.getElementById(
        "stat-rechazados"
    );


const statSaldoNeto = document.getElementById("stat-saldo-neto");
const statDeudaJugadores = document.getElementById("stat-deuda-jugadores");
const statEgresosDashboard = document.getElementById("stat-egresos-dashboard");
const statJugadoresDeuda = document.getElementById("stat-jugadores-deuda");
let totalRecaudacionGeneral = 0;


const badgePendientes =
    document.getElementById(
        "badge-pendientes"
    );

const menuBotones =
    document.querySelectorAll(
        ".menu-btn"
    );


const vistaResumen =
    document.getElementById(
        "vista-resumen"
    );


const vistaJugadores =
    document.getElementById(
        "vista-jugadores"
    );


const vistaMensualidades =
    document.getElementById(
        "vista-mensualidades"
    );


const vistaPagos =
    document.getElementById(
        "vista-pagos"
    );


const vistaRifas =
    document.getElementById(
        "vista-rifas"
    );


const vistaEgresos =
    document.getElementById(
        "vista-egresos"
    );


const vistaCuenta =
    document.getElementById(
        "vista-cuenta"
    );


const vistaDetalleRifa =
    document.getElementById(
        "vista-detalle-rifa"
    );


/* ===================================================
   ELEMENTOS PANEL ADMINISTRATIVO
=================================================== */

const adminSidebar =
    document.getElementById(
        "admin-sidebar"
    );


const btnAdminMenu =
    document.getElementById(
        "btn-admin-menu"
    );


const adminTituloVista =
    document.getElementById(
        "admin-titulo-vista"
    );


const adminNombreHeader =
    document.getElementById(
        "admin-nombre-header"
    );


const adminCuentaNombre =
    document.getElementById(
        "admin-cuenta-nombre"
    );


const adminCuentaEmail =
    document.getElementById(
        "admin-cuenta-email"
    );


const adminSaludo =
    document.getElementById(
        "admin-saludo"
    );


const adminAvatar =
    document.querySelector(
        ".admin-avatar"
    );


const botonesAccesoRapido =
    document.querySelectorAll(
        "[data-acceso-vista]"
    );


let administradorActual =
    null;


const listaJugadores =
    document.getElementById(
        "lista-jugadores"
    );


const buscarJugadorInput =
    document.getElementById(
        "buscar-jugador"
    );


const badgeJugadores =
    document.getElementById(
        "badge-jugadores"
    );


let jugadoresTesoreria = [];

let historialPagosTesoreria = [];
let administradoresTesoreria = [];

let filtroEstadoPago =
    "TODOS";


/* ===================================================
   EGRESOS
=================================================== */

const formEgresoAdmin =
    document.getElementById(
        "form-egreso-admin"
    );

const egresoFechaInput =
    document.getElementById(
        "egreso-fecha"
    );

const egresoCategoriaInput =
    document.getElementById(
        "egreso-categoria"
    );

const egresoConceptoInput =
    document.getElementById(
        "egreso-concepto"
    );

const egresoMontoInput =
    document.getElementById(
        "egreso-monto"
    );

const egresoMetodoInput =
    document.getElementById(
        "egreso-metodo"
    );

const egresoComprobanteInput =
    document.getElementById(
        "egreso-comprobante"
    );

const egresoObservacionesInput =
    document.getElementById(
        "egreso-observaciones"
    );

const btnRegistrarEgreso =
    document.getElementById(
        "btn-registrar-egreso"
    );

const mensajeEgreso =
    document.getElementById(
        "mensaje-egreso"
    );

const listaEgresosAdmin =
    document.getElementById(
        "lista-egresos-admin"
    );

const filtroEgresosInput =
    document.getElementById(
        "filtro-egresos"
    );

const badgeEgresos =
    document.getElementById(
        "badge-egresos"
    );

const egresosTotal =
    document.getElementById(
        "egresos-total"
    );

const egresosMes =
    document.getElementById(
        "egresos-mes"
    );

const egresosCantidad =
    document.getElementById(
        "egresos-cantidad"
    );

const egresosAnulados =
    document.getElementById(
        "egresos-anulados"
    );


let egresosTesoreria = [];

let filtroEstadoEgreso =
    "TODOS";


if (egresoFechaInput) {

    egresoFechaInput.value =
        obtenerFechaHoyAdmin();

    egresoFechaInput.max =
        obtenerFechaHoyAdmin();

}


const botonesFiltroPago =
    document.querySelectorAll(
        ".filtro-pago-btn"
    );


const listaHistorialPagos =
    document.getElementById(
        "lista-historial-pagos"
    );


const buscarPagoInput =
    document.getElementById(
        "buscar-pago"
    );


const badgeTotalPagos =
    document.getElementById(
        "badge-total-pagos"
    );


/* ===================================================
   ELEMENTOS RIFAS
=================================================== */

const formRifaAdmin =
    document.getElementById(
        "form-rifa-admin"
    );


const rifaNumeroInput =
    document.getElementById(
        "rifa-numero"
    );


const rifaPeriodoInput =
    document.getElementById(
        "rifa-periodo"
    );


const rifaTituloInput =
    document.getElementById(
        "rifa-titulo"
    );


const rifaDescripcionInput =
    document.getElementById(
        "rifa-descripcion"
    );


const rifaValorInput =
    document.getElementById(
        "rifa-valor"
    );


const rifaFechaInicioInput =
    document.getElementById(
        "rifa-fecha-inicio"
    );


const rifaFechaCierreInput =
    document.getElementById(
        "rifa-fecha-cierre"
    );


const rifaEstadoSelect =
    document.getElementById(
        "rifa-estado"
    );


const premiosRifaAdmin =
    document.getElementById(
        "premios-rifa-admin"
    );


const btnAgregarPremio =
    document.getElementById(
        "btn-agregar-premio"
    );


const btnCrearRifa =
    document.getElementById(
        "btn-crear-rifa"
    );


const mensajeRifa =
    document.getElementById(
        "mensaje-rifa"
    );


const listaRifasAdmin =
    document.getElementById(
        "lista-rifas-admin"
    );


const badgeRifas =
    document.getElementById(
        "badge-rifas"
    );    


/* ===================================================
   ELEMENTOS EDITAR RIFA
=================================================== */

const btnVolverRifas =
    document.getElementById(
        "btn-volver-rifas"
    );


const detalleRifaTitulo =
    document.getElementById(
        "detalle-rifa-titulo"
    );


const formEditarRifa =
    document.getElementById(
        "form-editar-rifa"
    );


const editarRifaId =
    document.getElementById(
        "editar-rifa-id"
    );


const editarRifaNumero =
    document.getElementById(
        "editar-rifa-numero"
    );


const editarRifaPeriodo =
    document.getElementById(
        "editar-rifa-periodo"
    );


const editarRifaValor =
    document.getElementById(
        "editar-rifa-valor"
    );


const editarRifaEstado =
    document.getElementById(
        "editar-rifa-estado"
    );


const editarRifaFechaInicio =
    document.getElementById(
        "editar-rifa-fecha-inicio"
    );


const editarRifaFechaCierre =
    document.getElementById(
        "editar-rifa-fecha-cierre"
    );


const editarRifaTitulo =
    document.getElementById(
        "editar-rifa-titulo"
    );


const editarRifaDescripcion =
    document.getElementById(
        "editar-rifa-descripcion"
    );


const premiosRifaEditar =
    document.getElementById(
        "premios-rifa-editar"
    );


const btnAgregarPremioEditar =
    document.getElementById(
        "btn-agregar-premio-editar"
    );


const btnGuardarRifa =
    document.getElementById(
        "btn-guardar-rifa"
    );


const mensajeEditarRifa =
    document.getElementById(
        "mensaje-editar-rifa"
    );


/* ===================================================
   BOTÓN ELIMINAR RIFA
=================================================== */

let btnEliminarRifa =
    document.getElementById(
        "btn-eliminar-rifa"
    );


if (
    !btnEliminarRifa &&
    formEditarRifa &&
    mensajeEditarRifa
) {

    btnEliminarRifa =
        document.createElement(
            "button"
        );


    btnEliminarRifa.type =
        "button";


    btnEliminarRifa.id =
        "btn-eliminar-rifa";


    btnEliminarRifa.className =
        "btn btn-eliminar-rifa";


    btnEliminarRifa.textContent =
        "Eliminar rifa";


    btnEliminarRifa.style.marginTop =
        "12px";


    btnEliminarRifa.style.background =
        "rgba(180, 35, 44, .17)";


    btnEliminarRifa.style.color =
        "#ff777f";


    btnEliminarRifa.style.border =
        "1px solid rgba(255, 119, 127, .35)";


    btnEliminarRifa.style.width =
        "100%";


    formEditarRifa.insertBefore(
        btnEliminarRifa,
        mensajeEditarRifa
    );

}


/* ===================================================
   EXPORTAR RIFA A EXCEL
=================================================== */

let bloqueExportarRifa =
    document.getElementById(
        "bloque-exportar-rifa"
    );


let btnExportarRifa =
    document.getElementById(
        "btn-exportar-rifa"
    );


let mensajeExportarRifa =
    document.getElementById(
        "mensaje-exportar-rifa"
    );


if (
    !bloqueExportarRifa &&
    vistaDetalleRifa
) {

    bloqueExportarRifa =
        document.createElement(
            "section"
        );


    bloqueExportarRifa.id =
        "bloque-exportar-rifa";


    bloqueExportarRifa.style.marginTop =
        "24px";


    bloqueExportarRifa.style.padding =
        "24px";


    bloqueExportarRifa.style.borderRadius =
        "20px";


    bloqueExportarRifa.style.background =
        "linear-gradient(145deg, rgba(18,31,47,.96), rgba(11,23,36,.96))";


    bloqueExportarRifa.style.border =
        "1px solid rgba(255,255,255,.08)";


    bloqueExportarRifa.style.boxShadow =
        "0 18px 40px rgba(0,0,0,.18)";


    bloqueExportarRifa.innerHTML = `
        <div style="
            display:flex;
            gap:18px;
            align-items:flex-start;
            justify-content:space-between;
            flex-wrap:wrap;
        ">

            <div style="max-width:720px;">

                <span class="admin-eyebrow">
                    Respaldo
                </span>

                <h2 style="
                    margin:8px 0 8px;
                    font-size:1.45rem;
                ">
                    Exportar rifa a Excel
                </h2>

                <p style="
                    margin:0;
                    color:#aebccd;
                    line-height:1.6;
                ">
                    Descarga el respaldo completo de la rifa:
                    resumen, participaciones aprobadas, entregas,
                    ranking, premios y ganadores.
                </p>

            </div>

            <button
                type="button"
                id="btn-exportar-rifa"
                class="btn btn-primary"
                style="
                    min-width:190px;
                    min-height:46px;
                "
            >
                Exportar Excel
            </button>

        </div>

        <div
            id="mensaje-exportar-rifa"
            style="
                margin-top:16px;
                color:#aebccd;
            "
        ></div>
    `;


    /*
        Lo colocamos antes del bloque de sorteo para que
        el respaldo esté disponible aun cuando la rifa
        todavía no haya sido sorteada.
    */

    vistaDetalleRifa.appendChild(
        bloqueExportarRifa
    );


    btnExportarRifa =
        document.getElementById(
            "btn-exportar-rifa"
        );


    mensajeExportarRifa =
        document.getElementById(
            "mensaje-exportar-rifa"
        );

}


/* ===================================================
   CARGAR LIBRERÍA EXCEL
=================================================== */

let promesaLibreriaExcel =
    null;


async function cargarLibreriaExcel() {

    if (!promesaLibreriaExcel) {

        promesaLibreriaExcel =
            import(
                "https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs"
            );

    }


    return await promesaLibreriaExcel;

}


/* ===================================================
   UTILIDADES EXCEL
=================================================== */

function obtenerNombreJugadorRifa(
    jugadorId
) {

    const jugador =
        jugadoresTesoreria.find(
            (item) =>
                item.id ===
                jugadorId
        );


    return (
        jugador?.nombre_completo ||
        jugador?.nombre ||
        "Jugador"
    );

}


function limpiarNombreArchivoExcel(
    texto
) {

    return String(
        texto ||
        "Rifa_Rayckington_FC"
    )
        .normalize(
            "NFD"
        )
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .replace(
            /[^a-zA-Z0-9_-]+/g,
            "_"
        )
        .replace(
            /_+/g,
            "_"
        )
        .replace(
            /^_|_$/g,
            ""
        )
        .slice(
            0,
            80
        ) ||
        "Rifa_Rayckington_FC";

}


function ajustarColumnasExcel(
    hoja,
    filas
) {

    if (
        !hoja ||
        !Array.isArray(
            filas
        ) ||
        !filas.length
    ) {

        return;

    }


    const columnas =
        Object.keys(
            filas[0]
        );


    hoja["!cols"] =
        columnas.map(
            (columna) => {

                let ancho =
                    String(
                        columna
                    ).length;


                filas.forEach(
                    (fila) => {

                        const valor =
                            fila?.[
                                columna
                            ];


                        ancho =
                            Math.max(
                                ancho,
                                String(
                                    valor ??
                                    ""
                                ).length
                            );

                    }
                );


                return {
                    wch:
                        Math.min(
                            Math.max(
                                ancho + 2,
                                12
                            ),
                            42
                        )
                };

            }
        );


    if (hoja["!ref"]) {

        const ultimaColumna =
            hoja["!ref"]
                .split(
                    ":"
                )[1]
                ?.replace(
                    /\d+/g,
                    ""
                );


        if (ultimaColumna) {

            hoja["!autofilter"] = {
                ref:
                    `A1:${ultimaColumna}1`
            };

        }

    }

}


/* ===================================================
   EXPORTAR RIFA
=================================================== */

btnExportarRifa
    ?.addEventListener(
        "click",
        async () => {

            const rifaId =
                editarRifaId
                    ?.value;


            if (!rifaId) {

                mensajeExportarRifa.textContent =
                    "No se pudo identificar la rifa.";

                return;

            }


            const rifa =
                rifasAdmin.find(
                    (item) =>
                        item.id ===
                        rifaId
                );


            if (!rifa) {

                mensajeExportarRifa.textContent =
                    "No se pudo cargar la información de la rifa.";

                return;

            }


            btnExportarRifa.disabled =
                true;


            btnExportarRifa.textContent =
                "Generando...";


            mensajeExportarRifa.textContent =
                "Preparando respaldo de la rifa...";


            try {

                /*
                    Recargamos la operación para exportar
                    siempre la información más reciente.
                */

                await cargarOperacionesRifa(
                    rifaId
                );


                const {
                    data: ganadoresData,
                    error: errorGanadores
                } =
                    await supabase.rpc(
                        "obtener_ganadores_rifa_admin",
                        {
                            p_rifa_id:
                                rifaId
                        }
                    );


                if (errorGanadores) {

                    throw errorGanadores;

                }


                const ganadores =
                    Array.isArray(
                        ganadoresData
                    )
                        ? ganadoresData
                        : [];


                const aprobadas =
                    entregasRifaAdmin.filter(
                        (entrega) => {

                            const estado =
                                normalizarEstado(
                                    entrega.estado
                                );


                            return (
                                estado ===
                                    "APROBADA" ||
                                estado ===
                                    "APROBADO"
                            );

                        }
                    );


                const pendientes =
                    entregasRifaAdmin.filter(
                        (entrega) =>
                            normalizarEstado(
                                entrega.estado
                            ) ===
                            "PENDIENTE"
                    );


                const rechazadas =
                    entregasRifaAdmin.filter(
                        (entrega) => {

                            const estado =
                                normalizarEstado(
                                    entrega.estado
                                );


                            return (
                                estado ===
                                    "RECHAZADA" ||
                                estado ===
                                    "RECHAZADO"
                            );

                        }
                    );


                const participacionesAprobadas =
                    aprobadas.reduce(
                        (
                            total,
                            entrega
                        ) =>
                            total +
                            obtenerParticipacionesEntregaRifa(
                                entrega
                            ),
                        0
                    );


                const montoAprobado =
                    aprobadas.reduce(
                        (
                            total,
                            entrega
                        ) =>
                            total +
                            obtenerMontoEntregaRifa(
                                entrega
                            ),
                        0
                    );


                const premios =
                    Array.isArray(
                        rifa.premios_rifa
                    )
                        ? [
                            ...rifa.premios_rifa
                        ]
                        : [];


                premios.sort(
                    (
                        a,
                        b
                    ) =>
                        Number(
                            a.orden
                        ) -
                        Number(
                            b.orden
                        )
                );


                /*
                    HOJA 1: RESUMEN
                */

                const resumen = [
                    {
                        Indicador:
                            "Rifa",
                        Valor:
                            rifa.titulo ||
                            `Rifa ${rifa.numero}`
                    },
                    {
                        Indicador:
                            "Número",
                        Valor:
                            rifa.numero
                    },
                    {
                        Indicador:
                            "Periodo",
                        Valor:
                            String(
                                rifa.periodo ||
                                ""
                            ).slice(
                                0,
                                10
                            )
                    },
                    {
                        Indicador:
                            "Estado",
                        Valor:
                            normalizarEstado(
                                rifa.estado
                            )
                    },
                    {
                        Indicador:
                            "Valor por participación",
                        Valor:
                            Number(
                                rifa.valor_participacion
                            ) ||
                            0
                    },
                    {
                        Indicador:
                            "Fecha inicio",
                        Valor:
                            rifa.fecha_inicio ||
                            ""
                    },
                    {
                        Indicador:
                            "Fecha cierre",
                        Valor:
                            rifa.fecha_cierre ||
                            ""
                    },
                    {
                        Indicador:
                            "Premios",
                        Valor:
                            premios.length
                    },
                    {
                        Indicador:
                            "Entregas totales",
                        Valor:
                            entregasRifaAdmin.length
                    },
                    {
                        Indicador:
                            "Entregas aprobadas",
                        Valor:
                            aprobadas.length
                    },
                    {
                        Indicador:
                            "Entregas pendientes",
                        Valor:
                            pendientes.length
                    },
                    {
                        Indicador:
                            "Entregas rechazadas",
                        Valor:
                            rechazadas.length
                    },
                    {
                        Indicador:
                            "Participaciones reales aprobadas",
                        Valor:
                            participacionesAprobadas
                    },
                    {
                        Indicador:
                            "Recaudación real aprobada",
                        Valor:
                            montoAprobado
                    },
                    {
                        Indicador:
                            "Rifa sorteada",
                        Valor:
                            ganadores.length > 0
                                ? "SÍ"
                                : "NO"
                    },
                    {
                        Indicador:
                            "Fecha de exportación",
                        Valor:
                            new Date()
                                .toLocaleString(
                                    "es-CL"
                                )
                    }
                ];


                /*
                    HOJA 2: PARTICIPACIONES REALES
                    Solo compradores de entregas aprobadas.
                */

                const participaciones = [];


                aprobadas.forEach(
                    (entrega) => {

                        const compradores =
                            compradoresRifaAdmin.filter(
                                (comprador) =>
                                    comprador.entrega_id ===
                                    entrega.id
                            );


                        compradores.forEach(
                            (comprador) => {

                                const cantidad =
                                    obtenerCantidadCompradorRifa(
                                        comprador
                                    );


                                participaciones.push({
                                    "Jugador responsable":
                                        obtenerNombreJugadorRifa(
                                            entrega.jugador_id
                                        ),

                                    "Comprador":
                                        obtenerNombreCompradorRifa(
                                            comprador
                                        ),

                                    "Participaciones":
                                        cantidad,

                                    "Valor unitario":
                                        Number(
                                            rifa.valor_participacion
                                        ) ||
                                        0,

                                    "Monto equivalente":
                                        cantidad *
                                        (
                                            Number(
                                                rifa.valor_participacion
                                            ) ||
                                            0
                                        ),

                                    "Fecha entrega":
                                        entrega.fecha_entrega ||
                                        entrega.fecha_transferencia ||
                                        "",

                                    "N° operación":
                                        entrega.numero_operacion ||
                                        "",

                                    "ID entrega":
                                        entrega.id
                                });

                            }
                        );

                    }
                );


                /*
                    HOJA 3: ENTREGAS
                */

                const entregasExcel =
                    entregasRifaAdmin.map(
                        (entrega) => ({

                            "Jugador responsable":
                                obtenerNombreJugadorRifa(
                                    entrega.jugador_id
                                ),

                            "Estado":
                                normalizarEstado(
                                    entrega.estado
                                ),

                            "Participaciones":
                                obtenerParticipacionesEntregaRifa(
                                    entrega
                                ),

                            "Monto":
                                obtenerMontoEntregaRifa(
                                    entrega
                                ),

                            "Fecha entrega":
                                entrega.fecha_entrega ||
                                entrega.fecha_transferencia ||
                                "",

                            "N° operación":
                                entrega.numero_operacion ||
                                "",

                            "Observaciones":
                                entrega.observaciones ||
                                "",

                            "Motivo rechazo":
                                entrega.motivo_rechazo ||
                                "",

                            "Revisado por":
                                entrega.revisado_por
                                    ? obtenerNombreAdministrador(
                                        entrega.revisado_por
                                    )
                                    : "",

                            "Fecha revisión":
                                entrega.revisado_at ||
                                "",

                            "Comprobante":
                                entrega.comprobante_path
                                    ? "SÍ"
                                    : "NO",

                            "ID entrega":
                                entrega.id
                        })
                    );


                /*
                    HOJA 4: RANKING
                */

                const acumuladoRanking =
                    new Map();


                aprobadas.forEach(
                    (entrega) => {

                        const jugadorId =
                            entrega.jugador_id;


                        const existente =
                            acumuladoRanking.get(
                                jugadorId
                            ) || {
                                jugadorId,
                                participaciones:
                                    0,
                                monto:
                                    0,
                                entregas:
                                    0
                            };


                        existente.participaciones +=
                            obtenerParticipacionesEntregaRifa(
                                entrega
                            );


                        existente.monto +=
                            obtenerMontoEntregaRifa(
                                entrega
                            );


                        existente.entregas +=
                            1;


                        acumuladoRanking.set(
                            jugadorId,
                            existente
                        );

                    }
                );


                const ranking =
                    Array.from(
                        acumuladoRanking.values()
                    )
                        .sort(
                            (
                                a,
                                b
                            ) =>
                                b.participaciones -
                                a.participaciones ||
                                b.monto -
                                a.monto
                        )
                        .map(
                            (
                                fila,
                                indice
                            ) => ({
                                "Posición":
                                    indice + 1,

                                "Jugador":
                                    obtenerNombreJugadorRifa(
                                        fila.jugadorId
                                    ),

                                "Participaciones aprobadas":
                                    fila.participaciones,

                                "Recaudación aprobada":
                                    fila.monto,

                                "Entregas aprobadas":
                                    fila.entregas
                            })
                        );


                /*
                    HOJA 5: PREMIOS
                */

                const premiosExcel =
                    premios.map(
                        (premio) => {

                            const ganador =
                                ganadores.find(
                                    (item) =>
                                        item.premio_id ===
                                        premio.id
                                );


                            return {
                                "Orden":
                                    premio.orden,

                                "Premio":
                                    premio.nombre,

                                "Descripción":
                                    premio.descripcion ||
                                    "",

                                "Ganador":
                                    ganador?.nombre_comprador ||
                                    "",

                                "Jugador responsable":
                                    ganador
                                        ? obtenerNombreJugadorRifa(
                                            ganador.jugador_id
                                        )
                                        : "",

                                "Sorteado":
                                    ganador
                                        ? "SÍ"
                                        : "NO"
                            };

                        }
                    );


                /*
                    HOJA 6: GANADORES
                */

                const ganadoresExcel =
                    ganadores.map(
                        (ganador) => ({
                            "Orden premio":
                                ganador.orden_premio,

                            "Premio":
                                ganador.premio_nombre,

                            "Ganador":
                                ganador.nombre_comprador,

                            "Jugador responsable":
                                obtenerNombreJugadorRifa(
                                    ganador.jugador_id
                                ),

                            "Fecha sorteo":
                                ganador.created_at ||
                                "",

                            "ID comprador":
                                ganador.comprador_id
                        })
                    );


                const XLSX =
                    await cargarLibreriaExcel();


                const libro =
                    XLSX.utils.book_new();


                const agregarHoja = (
                    nombre,
                    filas
                ) => {

                    /*
                        SheetJS necesita al menos una fila
                        para crear encabezados cuando no hay datos.
                    */

                    const datos =
                        filas.length
                            ? filas
                            : [
                                {
                                    Estado:
                                        "Sin registros"
                                }
                            ];


                    const hoja =
                        XLSX.utils.json_to_sheet(
                            datos
                        );


                    ajustarColumnasExcel(
                        hoja,
                        datos
                    );


                    XLSX.utils.book_append_sheet(
                        libro,
                        hoja,
                        nombre
                    );

                };


                agregarHoja(
                    "Resumen",
                    resumen
                );


                agregarHoja(
                    "Participaciones",
                    participaciones
                );


                agregarHoja(
                    "Entregas",
                    entregasExcel
                );


                agregarHoja(
                    "Ranking",
                    ranking
                );


                agregarHoja(
                    "Premios",
                    premiosExcel
                );


                agregarHoja(
                    "Ganadores",
                    ganadoresExcel
                );


                const tituloArchivo =
                    limpiarNombreArchivoExcel(
                        rifa.titulo ||
                        `Rifa_${rifa.numero}_${String(
                            rifa.periodo ||
                            ""
                        ).slice(
                            0,
                            7
                        )}`
                    );


                const nombreArchivo =
                    `${tituloArchivo}_Rayckington_FC.xlsx`;


                XLSX.writeFile(
                    libro,
                    nombreArchivo,
                    {
                        compression:
                            true
                    }
                );


                mensajeExportarRifa.textContent =
                    "Excel generado correctamente.";


            } catch (error) {

                console.error(
                    "Error exportando rifa:",
                    error
                );


                mensajeExportarRifa.textContent =
                    error?.message ||
                    "No se pudo generar el Excel.";

            } finally {

                btnExportarRifa.disabled =
                    false;


                btnExportarRifa.textContent =
                    "Exportar Excel";

            }

        }
    );


/* ===================================================
   SORTEO DE RIFA
=================================================== */

let bloqueSorteoRifa =
    document.getElementById(
        "bloque-sorteo-rifa"
    );


let btnSortearRifa =
    document.getElementById(
        "btn-sortear-rifa"
    );


let mensajeSorteoRifa =
    document.getElementById(
        "mensaje-sorteo-rifa"
    );


let resultadosSorteoRifa =
    document.getElementById(
        "resultados-sorteo-rifa"
    );


if (
    !bloqueSorteoRifa &&
    vistaDetalleRifa
) {

    bloqueSorteoRifa =
        document.createElement(
            "section"
        );


    bloqueSorteoRifa.id =
        "bloque-sorteo-rifa";


    bloqueSorteoRifa.style.marginTop =
        "24px";


    bloqueSorteoRifa.style.padding =
        "24px";


    bloqueSorteoRifa.style.borderRadius =
        "20px";


    bloqueSorteoRifa.style.background =
        "linear-gradient(145deg, rgba(18,31,47,.96), rgba(11,23,36,.96))";


    bloqueSorteoRifa.style.border =
        "1px solid rgba(255,255,255,.08)";


    bloqueSorteoRifa.style.boxShadow =
        "0 18px 40px rgba(0,0,0,.18)";


    bloqueSorteoRifa.innerHTML = `
        <div style="
            display:flex;
            gap:18px;
            align-items:flex-start;
            justify-content:space-between;
            flex-wrap:wrap;
        ">

            <div style="max-width:720px;">

                <span class="admin-eyebrow">
                    Sorteo oficial
                </span>

                <h2 style="
                    margin:8px 0 8px;
                    font-size:1.45rem;
                ">
                    Ganadores de la rifa
                </h2>

                <p style="
                    margin:0;
                    color:#aebccd;
                    line-height:1.6;
                ">
                    El sorteo utiliza únicamente participaciones
                    pertenecientes a entregas aprobadas. Una misma
                    persona puede ganar más de un premio si todavía
                    conserva participaciones disponibles.
                </p>

            </div>

            <button
                type="button"
                id="btn-sortear-rifa"
                class="btn btn-primary"
                style="
                    min-width:190px;
                    min-height:46px;
                "
            >
                Realizar sorteo
            </button>

        </div>

        <div
            id="mensaje-sorteo-rifa"
            style="
                margin-top:16px;
                color:#aebccd;
            "
        ></div>

        <div
            id="resultados-sorteo-rifa"
            style="
                margin-top:20px;
                display:grid;
                gap:12px;
            "
        ></div>
    `;


    vistaDetalleRifa.appendChild(
        bloqueSorteoRifa
    );


    btnSortearRifa =
        document.getElementById(
            "btn-sortear-rifa"
        );


    mensajeSorteoRifa =
        document.getElementById(
            "mensaje-sorteo-rifa"
        );


    resultadosSorteoRifa =
        document.getElementById(
            "resultados-sorteo-rifa"
        );

}


/* ===================================================
   CLICK ROBUSTO DEL SORTEO

   Usamos delegación de eventos para que el botón funcione
   aunque el bloque haya sido creado dinámicamente.
=================================================== */

document.addEventListener(
    "click",
    async (event) => {

        const boton =
            event.target
                ?.closest?.(
                    "#btn-sortear-rifa"
                );


        if (!boton) {

            return;

        }


        event.preventDefault();


        const rifaId =
            editarRifaId
                ?.value;


        if (!rifaId) {

            if (mensajeSorteoRifa) {

                mensajeSorteoRifa.textContent =
                    "No se pudo identificar la rifa.";

            }


            return;

        }


        /*
            Si el botón está deshabilitado, no ejecutamos nada.
            El mensaje de estado ya explica la razón.
        */

        if (boton.disabled) {

            return;

        }


        if (mensajeSorteoRifa) {

            mensajeSorteoRifa.textContent =
                "Preparando sorteo oficial...";

        }


        const confirmar =
            window.confirm(
                "¿Realizar el sorteo oficial de esta rifa?\n\n" +
                "Los resultados quedarán guardados y esta rifa no podrá sortearse nuevamente."
            );


        if (!confirmar) {

            await cargarSorteoRifa(
                rifaId
            );


            return;

        }


        boton.disabled =
            true;


        boton.textContent =
            "Sorteando...";


        if (mensajeSorteoRifa) {

            mensajeSorteoRifa.textContent =
                "Realizando sorteo oficial...";

        }


        const {
            data,
            error
        } =
            await supabase.rpc(
                "sortear_rifa_admin",
                {
                    p_rifa_id:
                        rifaId
                }
            );


        if (error) {

            console.error(
                "Error realizando sorteo:",
                error
            );


            const detalleError =
                [
                    error.message,
                    error.details,
                    error.hint,
                    error.code
                        ? `Código: ${error.code}`
                        : null
                ]
                    .filter(Boolean)
                    .join(" · ");


            if (mensajeSorteoRifa) {

                mensajeSorteoRifa.textContent =
                    detalleError ||
                    "No se pudo realizar el sorteo.";

            }


            boton.textContent =
                "Realizar sorteo";


            boton.disabled =
                false;


            alert(
                detalleError ||
                "No se pudo realizar el sorteo."
            );


            return;

        }


        if (mensajeSorteoRifa) {

            mensajeSorteoRifa.textContent =
                "Sorteo realizado correctamente. Los resultados quedaron guardados oficialmente.";

        }


        boton.textContent =
            "Sorteo realizado";


        boton.disabled =
            true;


        await cargarSorteoRifa(
            rifaId
        );

    }
);


/* ===================================================
   ELEMENTOS OPERACIÓN DE RIFA
=================================================== */

const badgeEntregasRifa =
    document.getElementById(
        "badge-entregas-rifa"
    );


const rifaStatPendientes =
    document.getElementById(
        "rifa-stat-pendientes"
    );


const rifaStatAprobadas =
    document.getElementById(
        "rifa-stat-aprobadas"
    );


const rifaStatParticipaciones =
    document.getElementById(
        "rifa-stat-participaciones"
    );


const rifaStatRecaudado =
    document.getElementById(
        "rifa-stat-recaudado"
    );


const listaEntregasRifaPendientes =
    document.getElementById(
        "lista-entregas-rifa-pendientes"
    );


const listaEntregasRifaHistorial =
    document.getElementById(
        "lista-entregas-rifa-historial"
    );


const listaRankingRifa =
    document.getElementById(
        "lista-ranking-rifa"
    );


let rifasAdmin =
    [];


let entregasRifaAdmin =
    [];


let compradoresRifaAdmin =
    [];


let contadorPremiosEditar =
    0;

const vistaDetalleJugador =
    document.getElementById(
        "vista-detalle-jugador"
    );


const btnVolverJugadores =
    document.getElementById(
        "btn-volver-jugadores"
    );


const detalleJugadorNombre =
    document.getElementById(
        "detalle-jugador-nombre"
    );


const detalleJugadorTipo =
    document.getElementById(
        "detalle-jugador-tipo"
    );


const detalleJugadorEstado =
    document.getElementById(
        "detalle-jugador-estado"
    );


const detalleTotalPagado =
    document.getElementById(
        "detalle-total-pagado"
    );


const detalleSaldoAnterior =
    document.getElementById(
        "detalle-saldo-anterior"
    );


const detalleMensualidadesPendientes =
    document.getElementById(
        "detalle-mensualidades-pendientes"
    );


const detalleTotalPendiente =
    document.getElementById(
        "detalle-total-pendiente"
    );


const detalleListaCuotas =
    document.getElementById(
        "detalle-lista-cuotas"
    );

const btnGenerarMensualidades =
    document.getElementById(
        "btn-generar-mensualidades"
    );


const mensajeGeneracionCuotas =
    document.getElementById(
        "mensaje-generacion-cuotas"
    );


const mensualidadesDeudaTotal =
    document.getElementById(
        "mensualidades-deuda-total"
    );


const mensualidadesSaldoAnterior =
    document.getElementById(
        "mensualidades-saldo-anterior"
    );


const mensualidadesMesesPendientes =
    document.getElementById(
        "mensualidades-meses-pendientes"
    );


const mensualidadesJugadoresDeuda =
    document.getElementById(
        "mensualidades-jugadores-deuda"
    );


const badgeDeudores =
    document.getElementById(
        "badge-deudores"
    );


const buscarDeudaJugadorInput =
    document.getElementById(
        "buscar-deuda-jugador"
    );


const filtroDeudaJugadorInput =
    document.getElementById(
        "filtro-deuda-jugador"
    );


const listaDeudasJugadores =
    document.getElementById(
        "lista-deudas-jugadores"
    );


let vistaOrigenDetalleJugador =
    "jugadores";    


/* ===================================================
   LOGIN
=================================================== */

formLoginAdmin.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        mensajeLogin.textContent =
            "Ingresando...";


        const email =
            document
                .getElementById(
                    "admin-email"
                )
                .value
                .trim();


        const password =
            document
                .getElementById(
                    "admin-password"
                )
                .value;


        const {
            error
        } =
            await supabase.auth
                .signInWithPassword({
                    email,
                    password
                });


        if (error) {

            console.error(
                "Error login:",
                error
            );


            mensajeLogin.textContent =
                error.message;


            return;
        }


        await cargarPanel();

    }
);


/* ===================================================
   VERIFICAR ADMINISTRADOR
=================================================== */

async function verificarAdministrador() {

    const {
        data: usuarioData,
        error: errorUsuario
    } =
        await supabase.auth
            .getUser();


    if (
        errorUsuario ||
        !usuarioData?.user
    ) {

        if (errorUsuario) {

            console.error(
                "Error usuario:",
                errorUsuario
            );

        }


        administradorActual =
            null;


        return false;

    }


    const usuario =
        usuarioData.user;


    const {
        data: admin,
        error
    } =
        await supabase
            .from(
                "administradores"
            )
            .select(`
                id,
                user_id,
                nombre,
                estado
            `)
            .eq(
                "user_id",
                usuario.id
            )
            .eq(
                "estado",
                "ACTIVO"
            )
            .maybeSingle();


    if (error) {

        console.error(
            "Error administrador:",
            error
        );


        administradorActual =
            null;


        return false;

    }


    if (!admin) {

        administradorActual =
            null;


        return false;

    }


    administradorActual = {

        ...admin,

        email:
            usuario.email ||
            ""

    };


    return true;

}


/* ===================================================
   RECORDAR VISTA ACTUAL DEL ADMIN
=================================================== */

function obtenerEstadoVistaAdminActual() {

    if (
        vistaDetalleRifa
            ?.classList
            .contains(
                "activa"
            )
    ) {

        return {
            tipo:
                "detalle-rifa",

            rifaId:
                editarRifaId
                    ?.value ||
                null
        };

    }


    const vistas = [
        [
            "resumen",
            vistaResumen
        ],
        [
            "jugadores",
            vistaJugadores
        ],
        [
            "mensualidades",
            vistaMensualidades
        ],
        [
            "pagos",
            vistaPagos
        ],
        [
            "rifas",
            vistaRifas
        ],
        [
            "egresos",
            vistaEgresos
        ],
        [
            "cuenta",
            vistaCuenta
        ]
    ];


    for (
        const [
            nombre,
            vista
        ]
        of vistas
    ) {

        if (
            vista
                ?.classList
                .contains(
                    "activa"
                )
        ) {

            return {
                tipo:
                    "normal",

                vista:
                    nombre
            };

        }

    }


    return {
        tipo:
            "normal",

        vista:
            "resumen"
    };

}


/* ===================================================
   CARGAR PANEL
=================================================== */

async function cargarPanel() {

    const estadoVistaAnterior =
        obtenerEstadoVistaAdminActual();


    mensajeLogin.textContent =
        "Verificando permisos...";


    const esAdmin =
        await verificarAdministrador();


    if (!esAdmin) {

        await supabase.auth
            .signOut();


        panelAdmin.style.display =
            "none";


        loginAdmin.style.display =
            "flex";


        mensajeLogin.textContent =
            "Esta cuenta no tiene permisos administrativos.";


        return;

    }


    loginAdmin.style.display =
        "none";


    panelAdmin.style.display =
        "block";


    mensajeLogin.textContent =
        "";


    actualizarIdentidadAdministrador();


    await cargarAdministradoresTesoreria();


    await Promise.all([

        cargarPagos(),

        cargarJugadores(),

        cargarRifas(),

        cargarEgresos()

    ]);


    await actualizarRecaudacionGeneral();


    if (
        estadoVistaAnterior
            .tipo ===
            "detalle-rifa" &&
        estadoVistaAnterior
            .rifaId
    ) {

        await abrirDetalleRifa(
            estadoVistaAnterior
                .rifaId
        );

    } else {

        mostrarVistaAdmin(
            estadoVistaAnterior
                .vista ||
            "resumen"
        );

    }

}

/* ===================================================
   CARGAR ADMINISTRADORES
=================================================== */

async function cargarAdministradoresTesoreria() {

    const {
        data,
        error
    } =
        await supabase
            .from(
                "administradores"
            )
            .select(`
                user_id,
                nombre,
                estado
            `)
            .eq(
                "estado",
                "ACTIVO"
            );


    if (error) {

        console.error(
            "Error cargando administradores:",
            error
        );

        administradoresTesoreria =
            [];

        return;

    }


    administradoresTesoreria =
        data || [];

}

/* ===================================================
   CARGAR PAGOS
=================================================== */

async function cargarPagos() {

    mensaje.textContent =
        "Cargando pagos...";


    const {
        data: pagos,
        error
    } =
        await supabase
            .from(
                "pagos"
            )
.select(`
    id,
    jugador_id,
    monto_total,
    fecha_transferencia,
    numero_operacion,
    comprobante_path,
    estado,
    observaciones,
    revisado_por,
    revisado_at,
    motivo_rechazo,
    created_at,
    jugadores (
        id,
        nombre,
        nombre_completo
    )
`)
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Error cargando pagos:",
            error
        );


        mensaje.textContent =
            "No se pudieron cargar los pagos.";


        return;
    }


    const lista =
        pagos || [];


    mensaje.textContent =
        "";


renderizarEstadisticas(
    lista
);


renderizarPagos(
    lista
);


historialPagosTesoreria =
    lista;


renderizarHistorialPagos(
    historialPagosTesoreria
);

}


/* ===================================================
   ESTADÍSTICAS GENERALES
=================================================== */

function renderizarEstadisticas(
    pagos
) {

    const pendientes =
        pagos.filter(
            (pago) =>
                normalizarEstado(
                    pago.estado
                ) === "PENDIENTE"
        );


    const aprobados =
        pagos.filter(
            (pago) =>
                normalizarEstado(
                    pago.estado
                ) === "APROBADO"
        );


    const rechazados =
        pagos.filter(
            (pago) =>
                normalizarEstado(
                    pago.estado
                ) === "RECHAZADO"
        );


    const recaudado =
        aprobados.reduce(
            (
                total,
                pago
            ) => {

                return (
                    total +
                    (
                        Number(
                            pago.monto_total
                        ) || 0
                    )
                );

            },
            0
        );


    if (statPendientes) {

        statPendientes.textContent =
            pendientes.length;

    }


    if (statAprobados) {

        statAprobados.textContent =
            aprobados.length;

    }


    if (statRechazados) {

        statRechazados.textContent =
            rechazados.length;

    }


    if (statRecaudado) {

        statRecaudado.textContent =
            formatearDinero(
                recaudado
            );

    }


    if (badgePendientes) {

        badgePendientes.textContent =
            pendientes.length === 1
                ? "1 pendiente"
                : `${pendientes.length} pendientes`;

    }

}


/* ===================================================
   RENDERIZAR PAGOS PENDIENTES
=================================================== */

function renderizarPagos(
    pagos
) {

    const pendientes =
        pagos.filter(
            (pago) =>
                normalizarEstado(
                    pago.estado
                ) === "PENDIENTE"
        );


    if (!pendientes.length) {

        listaPagos.innerHTML = `
            <div class="vacio">
                No hay pagos pendientes
                de revisión.
            </div>
        `;


        return;
    }


    listaPagos.innerHTML =
        pendientes
            .map(
                (pago) => {

                    const jugador =
                        pago.jugadores;


                    const nombre =
                        jugador
                            ?.nombre_completo ||
                        jugador
                            ?.nombre ||
                        "Jugador";


                    const operacion =
                        pago.numero_operacion ||
                        "No informado";


                    const observaciones =
                        pago.observaciones
                            ? `
                                <div class="dato">
                                    <span>
                                        Observaciones
                                    </span>

                                    ${escaparHTML(
                                        pago.observaciones
                                    )}
                                </div>
                              `
                            : "";


                    return `
                        <article
                            class="pago-card"
                        >

                            <div
                                class="pago-top"
                            >

                                <div>

                                    <h3
                                        class="pago-jugador"
                                    >
                                        ${escaparHTML(
                                            nombre
                                        )}
                                    </h3>


                                    <div
                                        class="pago-concepto"
                                    >
                                        Transferencia
                                        pendiente de revisión
                                    </div>

                                </div>


                                <div
                                    class="monto"
                                >
                                    ${formatearDinero(
                                        pago.monto_total
                                    )}
                                </div>

                            </div>


                            <div
                                class="datos"
                            >

                                <div
                                    class="dato"
                                >

                                    <span>
                                        Fecha
                                    </span>

                                    ${formatearFecha(
                                        pago.fecha_transferencia
                                    )}

                                </div>


                                <div
                                    class="dato"
                                >

                                    <span>
                                        N° operación
                                    </span>

                                    ${escaparHTML(
                                        operacion
                                    )}

                                </div>


                                <div
                                    class="dato"
                                >

                                    <span>
                                        Estado
                                    </span>

                                    PENDIENTE

                                </div>


                                ${observaciones}

                            </div>


                            <div
                                class="acciones"
                            >

                                <button
                                    type="button"
                                    class="
                                        btn
                                        btn-comprobante
                                    "
                                    data-comprobante="${escaparHTML(
                                        pago.comprobante_path ||
                                        ""
                                    )}"
                                >
                                    Ver comprobante
                                </button>


                                <button
                                    type="button"
                                    class="
                                        btn
                                        btn-aprobar
                                    "
                                    data-aprobar="${escaparHTML(
                                        pago.id
                                    )}"
                                >
                                    Aprobar
                                </button>


                                <button
                                    type="button"
                                    class="
                                        btn
                                        btn-rechazar
                                    "
                                    data-rechazar="${escaparHTML(
                                        pago.id
                                    )}"
                                >
                                    Rechazar
                                </button>

                            </div>

                        </article>
                    `;

                }
            )
            .join("");


    conectarBotones();

}


/* ===================================================
   CONECTAR BOTONES
=================================================== */

function conectarBotones() {

    const botonesComprobante =
        document.querySelectorAll(
            "[data-comprobante]"
        );


    botonesComprobante.forEach(
        (boton) => {

            boton.addEventListener(
                "click",
                async () => {

                    await abrirComprobante(
                        boton.dataset
                            .comprobante
                    );

                }
            );

        }
    );


    const botonesAprobar =
        document.querySelectorAll(
            "[data-aprobar]"
        );


    botonesAprobar.forEach(
        (boton) => {

            boton.addEventListener(
                "click",
                async () => {

                    await aprobarPago(
                        boton.dataset
                            .aprobar
                    );

                }
            );

        }
    );


    const botonesRechazar =
        document.querySelectorAll(
            "[data-rechazar]"
        );


    botonesRechazar.forEach(
        (boton) => {

            boton.addEventListener(
                "click",
                async () => {

                    await rechazarPago(
                        boton.dataset
                            .rechazar
                    );

                }
            );

        }
    );

}


/* ===================================================
   VER COMPROBANTE
=================================================== */

async function abrirComprobante(
    ruta
) {

    mensaje.textContent =
        "";


    if (!ruta) {

        mensaje.textContent =
            "Este pago no tiene comprobante asociado.";


        return;
    }


    const {
        data,
        error
    } =
        await supabase.storage
            .from(
                "comprobantes-pagos"
            )
            .createSignedUrl(
                ruta,
                60
            );


    if (error) {

        console.error(
            "Error comprobante:",
            error
        );


        mensaje.textContent =
            "No se pudo abrir el comprobante.";


        return;
    }


    if (!data?.signedUrl) {

        mensaje.textContent =
            "No se pudo generar el enlace del comprobante.";


        return;
    }


    window.open(
        data.signedUrl,
        "_blank",
        "noopener,noreferrer"
    );

}


async function aprobarPago(
    pagoId
) {

    if (!pagoId) {
        return;
    }


    const confirmar =
        confirm(
            "¿Confirmas que recibiste correctamente esta transferencia?"
        );


    if (!confirmar) {
        return;
    }


    mensaje.textContent =
        "Aprobando pago...";


    /* ===============================================
       OBTENER ADMINISTRADOR CONECTADO
    =============================================== */

    const {
        data: usuarioData,
        error: errorUsuario
    } =
        await supabase.auth
            .getUser();


    if (
        errorUsuario ||
        !usuarioData?.user
    ) {

        mensaje.textContent =
            "No se pudo identificar al administrador.";

        return;
    }


    const usuario =
        usuarioData.user;


    /* ===============================================
       OBTENER CUOTAS ASOCIADAS
    =============================================== */

    const {
        data: relaciones,
        error: errorRelaciones
    } =
        await supabase
            .from(
                "pago_cuotas"
            )
            .select(`
                cuota_id,
                monto_aplicado
            `)
            .eq(
                "pago_id",
                pagoId
            );


    if (errorRelaciones) {

        console.error(
            errorRelaciones
        );

        mensaje.textContent =
            "No se pudieron cargar las cuotas asociadas.";

        return;
    }


    const cuotaIds =
        (relaciones || [])
            .map(
                (relacion) =>
                    relacion.cuota_id
            )
            .filter(Boolean);


    /* ===============================================
       MARCAR CUOTAS PAGADAS
    =============================================== */

    if (cuotaIds.length > 0) {

        const {
            error: errorCuotas
        } =
            await supabase
                .from(
                    "cuotas"
                )
                .update({
                    estado: "PAGADO"
                })
                .in(
                    "id",
                    cuotaIds
                );


        if (errorCuotas) {

            console.error(
                errorCuotas
            );

            mensaje.textContent =
                "No se pudieron actualizar las cuotas.";

            return;
        }

    }


    /* ===============================================
       APROBAR PAGO
    =============================================== */

    const {
        error: errorPago
    } =
        await supabase
            .from(
                "pagos"
            )
            .update({

                estado:
                    "APROBADO",

                revisado_por:
                    usuario.id,

                revisado_at:
                    new Date()
                        .toISOString(),

                motivo_rechazo:
                    null

            })
            .eq(
                "id",
                pagoId
            );


    if (errorPago) {

        console.error(
            errorPago
        );

        mensaje.textContent =
            "No se pudo aprobar el pago.";

        return;
    }


    mensaje.textContent =
        "Pago aprobado correctamente.";


    await Promise.all([
        cargarPagos(),
        cargarJugadores()
    ]);

    await actualizarRecaudacionGeneral();

}


async function rechazarPago(
    pagoId
) {

    if (!pagoId) {
        return;
    }


    const motivo =
        prompt(
            "Indica el motivo del rechazo:"
        );


    if (motivo === null) {
        return;
    }


    if (!motivo.trim()) {

        alert(
            "Debes indicar un motivo para rechazar el pago."
        );

        return;
    }


    const confirmar =
        confirm(
            "¿Confirmas que deseas rechazar este pago?"
        );


    if (!confirmar) {
        return;
    }


    mensaje.textContent =
        "Rechazando pago...";


    /* ===============================================
       OBTENER ADMINISTRADOR CONECTADO
    =============================================== */

    const {
        data: usuarioData,
        error: errorUsuario
    } =
        await supabase.auth
            .getUser();


    if (
        errorUsuario ||
        !usuarioData?.user
    ) {

        mensaje.textContent =
            "No se pudo identificar al administrador.";

        return;
    }


    const usuario =
        usuarioData.user;


    /* ===============================================
       RECHAZAR
    =============================================== */

    const {
        error
    } =
        await supabase
            .from(
                "pagos"
            )
            .update({

                estado:
                    "RECHAZADO",

                revisado_por:
                    usuario.id,

                revisado_at:
                    new Date()
                        .toISOString(),

                motivo_rechazo:
                    motivo.trim()

            })
            .eq(
                "id",
                pagoId
            );


    if (error) {

        console.error(
            error
        );

        mensaje.textContent =
            "No se pudo rechazar el pago.";

        return;
    }


    mensaje.textContent =
        "Pago rechazado correctamente.";


    await Promise.all([
        cargarPagos(),
        cargarJugadores()
    ]);

    await actualizarRecaudacionGeneral();

}
/* ===================================================
   CARGAR EGRESOS
=================================================== */

async function cargarEgresos() {

    const {
        data,
        error
    } =
        await supabase
            .from(
                "egresos"
            )
            .select(`
                id,
                fecha,
                categoria,
                concepto,
                monto,
                metodo_pago,
                comprobante_path,
                observaciones,
                estado,
                creado_por,
                created_at,
                updated_at
            `)
            .order(
                "fecha",
                {
                    ascending: false
                }
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Error cargando egresos:",
            error
        );


        if (listaEgresosAdmin) {

            listaEgresosAdmin.innerHTML = `
                <div class="vacio">
                    No se pudieron cargar los egresos.
                </div>
            `;

        }


        return;

    }


    egresosTesoreria =
        data || [];


    renderizarEgresos();
    actualizarResumenFinancieroInicio();

}


/* ===================================================
   RESUMEN EGRESOS
=================================================== */

function actualizarResumenEgresos() {

    const activos =
        egresosTesoreria.filter(
            (egreso) =>
                normalizarEstado(
                    egreso.estado
                ) ===
                "REGISTRADO"
        );


    const anulados =
        egresosTesoreria.filter(
            (egreso) =>
                normalizarEstado(
                    egreso.estado
                ) ===
                "ANULADO"
        );


    const total =
        activos.reduce(
            (
                acumulado,
                egreso
            ) =>
                acumulado +
                (
                    Number(
                        egreso.monto
                    ) ||
                    0
                ),
            0
        );


    const ahora =
        new Date();


    const anioActual =
        ahora.getFullYear();


    const mesActual =
        ahora.getMonth() + 1;


    const totalMes =
        activos.reduce(
            (
                acumulado,
                egreso
            ) => {

                const partes =
                    String(
                        egreso.fecha ||
                        ""
                    )
                        .slice(
                            0,
                            10
                        )
                        .split(
                            "-"
                        );


                const anio =
                    Number(
                        partes[0]
                    );


                const mes =
                    Number(
                        partes[1]
                    );


                if (
                    anio ===
                        anioActual &&
                    mes ===
                        mesActual
                ) {

                    return (
                        acumulado +
                        (
                            Number(
                                egreso.monto
                            ) ||
                            0
                        )
                    );

                }


                return acumulado;

            },
            0
        );


    if (egresosTotal) {

        egresosTotal.textContent =
            formatearDinero(
                total
            );

    }


    if (egresosMes) {

        egresosMes.textContent =
            formatearDinero(
                totalMes
            );

    }


    if (egresosCantidad) {

        egresosCantidad.textContent =
            activos.length;

    }


    if (egresosAnulados) {

        egresosAnulados.textContent =
            anulados.length;

    }


    if (badgeEgresos) {

        badgeEgresos.textContent =
            egresosTesoreria.length ===
            1
                ? "1 movimiento"
                : `${egresosTesoreria.length} movimientos`;

    }

}


/* ===================================================
   RENDERIZAR EGRESOS
=================================================== */

function renderizarEgresos() {

    actualizarResumenEgresos();


    if (!listaEgresosAdmin) {

        return;

    }


    const filtrados =
        egresosTesoreria.filter(
            (egreso) => {

                if (
                    filtroEstadoEgreso ===
                    "TODOS"
                ) {

                    return true;

                }


                return (
                    normalizarEstado(
                        egreso.estado
                    ) ===
                    filtroEstadoEgreso
                );

            }
        );


    if (!filtrados.length) {

        listaEgresosAdmin.innerHTML = `
            <div class="vacio">
                No hay egresos para este filtro.
            </div>
        `;


        return;

    }


    listaEgresosAdmin.innerHTML = `
        <div class="egresos-lista">

            ${filtrados

                .map(
                    (egreso) => {

                        const estado =
                            normalizarEstado(
                                egreso.estado
                            ) ||
                            "REGISTRADO";


                        const esAnulado =
                            estado ===
                            "ANULADO";


                        const categoria =
                            formatearCategoriaEgreso(
                                egreso.categoria
                            );


                        const metodo =
                            formatearMetodoEgreso(
                                egreso.metodo_pago
                            );


                        return `
                            <article
                                class="egreso-card ${
                                    esAnulado
                                        ? "anulado"
                                        : ""
                                }"
                            >

                                <div class="egreso-card-top">

                                    <div>

                                        <span class="egreso-categoria">
                                            ${escaparHTML(
                                                categoria
                                            )}
                                        </span>

                                        <h4>
                                            ${escaparHTML(
                                                egreso.concepto
                                            )}
                                        </h4>

                                        <span
                                            class="egreso-estado ${
                                                esAnulado
                                                    ? "anulado"
                                                    : "registrado"
                                            }"
                                        >
                                            ${estado}
                                        </span>

                                    </div>

                                    <div class="egreso-monto">
                                        ${formatearDinero(
                                            egreso.monto
                                        )}
                                    </div>

                                </div>

                                <div class="egreso-meta">

                                    <span>
                                        Fecha:
                                        ${formatearFecha(
                                            egreso.fecha
                                        )}
                                    </span>

                                    <span>
                                        Método:
                                        ${escaparHTML(
                                            metodo
                                        )}
                                    </span>

                                    <span>
                                        Registrado por:
                                        ${escaparHTML(
                                            obtenerNombreAdministrador(
                                                egreso.creado_por
                                            )
                                        )}
                                    </span>

                                </div>

                                ${
                                    egreso.observaciones
                                        ? `
                                            <div class="egreso-observaciones">
                                                ${escaparHTML(
                                                    egreso.observaciones
                                                )}
                                            </div>
                                          `
                                        : ""
                                }

                                <div class="egreso-acciones">

                                    ${
                                        egreso.comprobante_path
                                            ? `
                                                <button
                                                    type="button"
                                                    class="btn btn-secondary btn-comprobante-egreso"
                                                    data-egreso-comprobante="${escaparHTML(
                                                        egreso.comprobante_path
                                                    )}"
                                                >
                                                    Ver comprobante
                                                </button>
                                              `
                                            : ""
                                    }

                                    ${
                                        !esAnulado
                                            ? `
                                                <button
                                                    type="button"
                                                    class="btn btn-anular-egreso"
                                                    data-anular-egreso="${escaparHTML(
                                                        egreso.id
                                                    )}"
                                                >
                                                    Anular movimiento
                                                </button>
                                              `
                                            : ""
                                    }

                                </div>

                            </article>
                        `;

                    }
                )

                .join("")}

        </div>
    `;

}


/* ===================================================
   FILTRO EGRESOS
=================================================== */

filtroEgresosInput
    ?.addEventListener(
        "change",
        () => {

            filtroEstadoEgreso =
                filtroEgresosInput.value ||
                "TODOS";


            renderizarEgresos();

        }
    );


/* ===================================================
   REGISTRAR EGRESO
=================================================== */

formEgresoAdmin
    ?.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            if (
                !administradorActual
            ) {

                mensajeEgreso.textContent =
                    "No se pudo identificar al administrador.";

                return;

            }


            const fecha =
                egresoFechaInput
                    ?.value;


            const categoria =
                egresoCategoriaInput
                    ?.value
                    ?.trim();


            const concepto =
                egresoConceptoInput
                    ?.value
                    ?.trim();


            const monto =
                Number(
                    egresoMontoInput
                        ?.value
                );


            const metodo =
                egresoMetodoInput
                    ?.value
                    ?.trim() ||
                null;


            const observaciones =
                egresoObservacionesInput
                    ?.value
                    ?.trim() ||
                null;


            const archivo =
                egresoComprobanteInput
                    ?.files?.[0] ||
                null;


            if (!fecha) {

                mensajeEgreso.textContent =
                    "Debes indicar la fecha.";

                return;

            }


            if (
                fecha >
                obtenerFechaHoyAdmin()
            ) {

                mensajeEgreso.textContent =
                    "La fecha del egreso no puede ser futura.";

                return;

            }


            if (!categoria) {

                mensajeEgreso.textContent =
                    "Selecciona una categoría.";

                return;

            }


            if (
                !concepto ||
                concepto.length < 3
            ) {

                mensajeEgreso.textContent =
                    "Ingresa un concepto válido.";

                return;

            }


            if (
                !Number.isInteger(
                    monto
                ) ||
                monto <= 0
            ) {

                mensajeEgreso.textContent =
                    "Ingresa un monto válido.";

                return;

            }


            if (
                archivo &&
                archivo.size >
                    10 * 1024 * 1024
            ) {

                mensajeEgreso.textContent =
                    "El comprobante no puede superar los 10 MB.";

                return;

            }


            btnRegistrarEgreso.disabled =
                true;


            btnRegistrarEgreso.textContent =
                "Registrando...";


            mensajeEgreso.textContent =
                "Registrando egreso...";


            const egresoId =
                crypto.randomUUID();


            let rutaComprobante =
                null;


            try {

                if (archivo) {

                    const extension =
                        obtenerExtensionArchivoAdmin(
                            archivo.name
                        );


                    rutaComprobante =
                        `${administradorActual.user_id}/${egresoId}/comprobante.${extension}`;


                    mensajeEgreso.textContent =
                        "Subiendo comprobante...";


                    const {
                        error: errorArchivo
                    } =
                        await supabase.storage
                            .from(
                                "comprobantes-egresos"
                            )
                            .upload(
                                rutaComprobante,
                                archivo,
                                {
                                    upsert:
                                        false
                                }
                            );


                    if (errorArchivo) {

                        throw errorArchivo;

                    }

                }


                const {
                    error
                } =
                    await supabase
                        .from(
                            "egresos"
                        )
                        .insert({
                            id:
                                egresoId,

                            fecha,

                            categoria,

                            concepto,

                            monto,

                            metodo_pago:
                                metodo,

                            comprobante_path:
                                rutaComprobante,

                            observaciones,

                            estado:
                                "REGISTRADO",

                            creado_por:
                                administradorActual.user_id
                        });


                if (error) {

                    throw error;

                }


                mensajeEgreso.textContent =
                    "Egreso registrado correctamente.";


                formEgresoAdmin.reset();


                if (egresoFechaInput) {

                    egresoFechaInput.value =
                        obtenerFechaHoyAdmin();


                    egresoFechaInput.max =
                        obtenerFechaHoyAdmin();

                }


                await cargarEgresos();


            } catch (error) {

                console.error(
                    "Error registrando egreso:",
                    error
                );


                if (rutaComprobante) {

                    await supabase.storage
                        .from(
                            "comprobantes-egresos"
                        )
                        .remove([
                            rutaComprobante
                        ]);

                }


                mensajeEgreso.textContent =
                    error?.message ||
                    "No se pudo registrar el egreso.";

            } finally {

                btnRegistrarEgreso.disabled =
                    false;


                btnRegistrarEgreso.textContent =
                    "Registrar egreso";

            }

        }
    );


/* ===================================================
   ACCIONES EGRESOS
=================================================== */

document.addEventListener(
    "click",
    async (event) => {

        const btnComprobante =
            event.target
                ?.closest?.(
                    "[data-egreso-comprobante]"
                );


        if (btnComprobante) {

            const ruta =
                btnComprobante.dataset
                    .egresoComprobante;


            const {
                data,
                error
            } =
                await supabase.storage
                    .from(
                        "comprobantes-egresos"
                    )
                    .createSignedUrl(
                        ruta,
                        60
                    );


            if (
                error ||
                !data?.signedUrl
            ) {

                console.error(
                    "Error comprobante egreso:",
                    error
                );


                alert(
                    "No se pudo abrir el comprobante."
                );


                return;

            }


            window.open(
                data.signedUrl,
                "_blank",
                "noopener,noreferrer"
            );


            return;

        }


        const btnAnular =
            event.target
                ?.closest?.(
                    "[data-anular-egreso]"
                );


        if (!btnAnular) {

            return;

        }


        const egresoId =
            btnAnular.dataset
                .anularEgreso;


        const egreso =
            egresosTesoreria.find(
                (item) =>
                    item.id ===
                    egresoId
            );


        if (!egreso) {

            return;

        }


        const confirmar =
            window.confirm(
                `¿Anular el egreso "${egreso.concepto}" por ${formatearDinero(
                    egreso.monto
                )}?\n\nEl movimiento seguirá visible en el historial, pero dejará de contabilizarse en los totales.`
            );


        if (!confirmar) {

            return;

        }


        btnAnular.disabled =
            true;


        btnAnular.textContent =
            "Anulando...";


        const {
            error
        } =
            await supabase
                .from(
                    "egresos"
                )
                .update({
                    estado:
                        "ANULADO",

                    updated_at:
                        new Date()
                            .toISOString()
                })
                .eq(
                    "id",
                    egresoId
                );


        if (error) {

            console.error(
                "Error anulando egreso:",
                error
            );


            alert(
                error.message ||
                "No se pudo anular el egreso."
            );


            btnAnular.disabled =
                false;


            btnAnular.textContent =
                "Anular movimiento";


            return;

        }


        await cargarEgresos();

    }
);


/* ===================================================
   HELPERS EGRESOS
=================================================== */

function formatearCategoriaEgreso(
    categoria
) {

    const mapa = {

        CANCHAS:
            "Canchas",

        TORNEOS:
            "Torneos y ligas",

        TRANSPORTE:
            "Transporte",

        INDUMENTARIA:
            "Indumentaria",

        IMPLEMENTOS:
            "Implementos deportivos",

        ARBITRAJE:
            "Arbitraje",

        ADMINISTRACION:
            "Administración",

        ALIMENTACION:
            "Alimentación",

        MARKETING:
            "Marketing y difusión",

        OTROS:
            "Otros"

    };


    return (
        mapa[
            normalizarEstado(
                categoria
            )
        ] ||
        String(
            categoria ||
            "Otros"
        )
    );

}


function formatearMetodoEgreso(
    metodo
) {

    const mapa = {

        TRANSFERENCIA:
            "Transferencia",

        EFECTIVO:
            "Efectivo",

        DEBITO_CREDITO:
            "Débito / Crédito",

        MERCADO_PAGO:
            "Mercado Pago",

        OTRO:
            "Otro"

    };


    if (!metodo) {

        return "No informado";

    }


    return (
        mapa[
            normalizarEstado(
                metodo
            )
        ] ||
        String(
            metodo
        )
    );

}


function obtenerFechaHoyAdmin() {

    const ahora =
        new Date();


    const anio =
        ahora.getFullYear();


    const mes =
        String(
            ahora.getMonth() + 1
        )
            .padStart(
                2,
                "0"
            );


    const dia =
        String(
            ahora.getDate()
        )
            .padStart(
                2,
                "0"
            );


    return `${anio}-${mes}-${dia}`;

}


function obtenerExtensionArchivoAdmin(
    nombre
) {

    const partes =
        String(
            nombre ||
            ""
        )
            .split(
                "."
            );


    if (
        partes.length <
        2
    ) {

        return "bin";

    }


    return (
        partes
            .pop()
            .toLowerCase()
            .replace(
                /[^a-z0-9]/g,
                ""
            ) ||
        "bin"
    );

}


/* ===================================================
   NAVEGACIÓN PANEL ADMINISTRATIVO
=================================================== */

const titulosVistasAdmin = {

    resumen:
        "Panel Administrativo",

    jugadores:
        "Jugadores",

    mensualidades:
        "Mensualidades",

    pagos:
        "Pagos",

    rifas:
        "Rifas",

    egresos:
        "Egresos",

    cuenta:
        "Mi cuenta"

};


/* ===================================================
   MOSTRAR VISTA
=================================================== */

function mostrarVistaAdmin(
    nombreVista
) {

    const vistas = {

        resumen:
            vistaResumen,

        jugadores:
            vistaJugadores,

        mensualidades:
            vistaMensualidades,

        pagos:
            vistaPagos,

        rifas:
            vistaRifas,

        egresos:
            vistaEgresos,

        cuenta:
            vistaCuenta

    };


    if (!vistas[nombreVista]) {

        nombreVista =
            "resumen";

    }


    Object
        .values(
            vistas
        )
        .forEach(
            (vista) => {

                vista?.classList
                    .remove(
                        "activa"
                    );

            }
        );


    vistaDetalleJugador
        ?.classList
        .remove(
            "activa"
        );


    vistaDetalleRifa
        ?.classList
        .remove(
            "activa"
        );


    const vistaFinal =
        vistas[
            nombreVista
        ] ||
        vistaResumen;


    vistaFinal
        ?.classList
        .add(
            "activa"
        );


    if (nombreVista === "mensualidades") {
        renderizarResumenMensualidades();
    }


    menuBotones.forEach(
        (boton) => {

            boton.classList
                .toggle(
                    "activo",
                    boton.dataset.vista ===
                        nombreVista
                );

        }
    );


    if (adminTituloVista) {

        adminTituloVista.textContent =
            titulosVistasAdmin[
                nombreVista
            ] ||
            "Panel Administrativo";

    }


    cerrarSidebarAdmin();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* ===================================================
   BOTONES SIDEBAR
=================================================== */

menuBotones.forEach(
    (boton) => {

        boton.addEventListener(
            "click",
            () => {

                mostrarVistaAdmin(
                    boton.dataset.vista
                );

            }
        );

    }
);


/* ===================================================
   ACCESOS RÁPIDOS
=================================================== */

botonesAccesoRapido.forEach(
    (boton) => {

        boton.addEventListener(
            "click",
            () => {

                mostrarVistaAdmin(
                    boton.dataset
                        .accesoVista
                );

            }
        );

    }
);


/* ===================================================
   MENÚ MÓVIL
=================================================== */

if (
    btnAdminMenu &&
    adminSidebar
) {

    btnAdminMenu.addEventListener(
        "click",
        () => {

            adminSidebar.classList
                .toggle(
                    "abierto"
                );

        }
    );

}


/* ===================================================
   CERRAR SIDEBAR
=================================================== */

function cerrarSidebarAdmin() {

    if (!adminSidebar) {
        return;
    }


    adminSidebar.classList
        .remove(
            "abierto"
        );

}


/* ===================================================
   IDENTIDAD DEL ADMINISTRADOR
=================================================== */

function actualizarIdentidadAdministrador() {

    if (!administradorActual) {
        return;
    }


    const nombre =
        administradorActual.nombre ||
        "Administrador";


    const email =
        administradorActual.email ||
        "Sin correo registrado";


    if (adminNombreHeader) {

        adminNombreHeader.textContent =
            nombre;

    }


    if (adminCuentaNombre) {

        adminCuentaNombre.textContent =
            nombre;

    }


    if (adminCuentaEmail) {

        adminCuentaEmail.textContent =
            email;

    }


    if (adminAvatar) {

        const inicial =
            nombre
                .trim()
                .charAt(0)
                .toUpperCase();


        adminAvatar.textContent =
            inicial ||
            "R";

    }


    if (adminSaludo) {

        adminSaludo.textContent =
            `${obtenerSaludoAdmin()}, ${obtenerPrimerNombreAdmin(
                nombre
            )}`;

    }

}


/* ===================================================
   PRIMER NOMBRE
=================================================== */

function obtenerPrimerNombreAdmin(
    nombre
) {

    return String(
        nombre ||
        "Administrador"
    )
        .trim()
        .split(
            /\s+/
        )[0];

}


/* ===================================================
   SALUDO
=================================================== */

function obtenerSaludoAdmin() {

    const hora =
        new Date()
            .getHours();


    if (hora < 12) {

        return "Buenos días";

    }


    if (hora < 20) {

        return "Buenas tardes";

    }


    return "Buenas noches";

}


/* ===================================================
   CARGAR JUGADORES
=================================================== */

async function cargarJugadores() {

    const [resultadoJugadores, resultadoCuotas, resultadoPagos] =
        await Promise.all([
            supabase
                .from("jugadores")
                .select(`
                    id,
                    user_id,
                    nombre,
                    nombre_completo,
                    estado,
                    fecha_ingreso,
                    fecha_nacimiento,
                    exento_mensualidad
                `)
                .order("nombre_completo", { ascending: true }),

            supabase
                .from("cuotas")
                .select(`
                    id,
                    jugador_id,
                    concepto,
                    periodo,
                    monto,
                    fecha_vencimiento,
                    estado
                `),

            supabase
                .from("pagos")
                .select(`
                    id,
                    jugador_id,
                    monto_total,
                    estado
                `)
        ]);


    if (
        resultadoJugadores.error ||
        resultadoCuotas.error ||
        resultadoPagos.error
    ) {
        console.error(
            "Error cargando jugadores:",
            resultadoJugadores.error,
            resultadoCuotas.error,
            resultadoPagos.error
        );

        if (listaJugadores) {
            listaJugadores.innerHTML = `
                <div class="vacio">No se pudieron cargar los jugadores.</div>
            `;
        }

        if (listaDeudasJugadores) {
            listaDeudasJugadores.innerHTML = `
                <div class="vacio">No se pudo cargar el resumen de deuda.</div>
            `;
        }
        return;
    }


    const jugadores = resultadoJugadores.data || [];
    const cuotas = resultadoCuotas.data || [];
    const pagos = resultadoPagos.data || [];


    jugadoresTesoreria =
        jugadores.map((jugador) => {

            const cuotasJugador =
                cuotas.filter((cuota) =>
                    cuota.jugador_id === jugador.id
                );

            const cuotasMensuales =
                cuotasJugador.filter((cuota) =>
                    normalizarEstado(cuota.concepto) === "MENSUALIDAD"
                );

            const cuotasSaldoAnterior =
                cuotasJugador.filter((cuota) =>
                    normalizarEstado(cuota.concepto) === "SALDO_ANTERIOR"
                );

            const cuotasMensualesPendientes =
                cuotasMensuales.filter((cuota) =>
                    normalizarEstado(cuota.estado) === "PENDIENTE"
                );

            const saldosAnterioresPendientes =
                cuotasSaldoAnterior.filter((cuota) =>
                    normalizarEstado(cuota.estado) === "PENDIENTE"
                );

            const montoMensualidadesPendientes =
                cuotasMensualesPendientes.reduce(
                    (total, cuota) => total + (Number(cuota.monto) || 0),
                    0
                );

            const saldoAnteriorPendiente =
                saldosAnterioresPendientes.reduce(
                    (total, cuota) => total + (Number(cuota.monto) || 0),
                    0
                );

            const deudaTotal =
                montoMensualidadesPendientes +
                saldoAnteriorPendiente;

            const pagosAprobados =
                pagos.filter((pago) =>
                    pago.jugador_id === jugador.id &&
                    normalizarEstado(pago.estado) === "APROBADO"
                );

            const pagado =
                pagosAprobados.reduce(
                    (total, pago) => total + (Number(pago.monto_total) || 0),
                    0
                );

            let estadoFinanciero = "AL DÍA";

            if (normalizarEstado(jugador.estado) === "INACTIVO") {
                estadoFinanciero = "INACTIVO";
            } else if (jugador.exento_mensualidad) {
                estadoFinanciero = "EXENTO";
            } else if (deudaTotal > 0) {
                estadoFinanciero = "CON DEUDA";
            } else if (
                cuotasMensuales.length === 0 &&
                cuotasSaldoAnterior.length === 0
            ) {
                estadoFinanciero = "SIN CUOTAS";
            }

            return {
                ...jugador,
                totalPagado: pagado,
                saldoAnteriorPendiente,
                mensualidadesPendientes: montoMensualidadesPendientes,
                totalPendiente: deudaTotal,
                cuotasPendientes:
                    cuotasMensualesPendientes.length +
                    saldosAnterioresPendientes.length,
                cuotasMensualesPendientes:
                    cuotasMensualesPendientes.length,
                cuotas: cuotasJugador,
                estadoFinanciero
            };
        });


    if (badgeJugadores) {
        badgeJugadores.textContent = `${jugadoresTesoreria.length} jugadores`;
    }

    renderizarJugadores(jugadoresTesoreria);
    renderizarResumenMensualidades();
    actualizarResumenFinancieroInicio();
}


/* ===================================================
   RENDERIZAR JUGADORES
=================================================== */

function renderizarJugadores(
    jugadores
) {

    if (!listaJugadores) {
        return;
    }


    if (!jugadores.length) {

        listaJugadores.innerHTML = `
            <div class="vacio">
                No se encontraron jugadores.
            </div>
        `;

        return;
    }


    listaJugadores.innerHTML =
        jugadores
            .map(
                (jugador) => {

                    const nombre =
                        jugador.nombre_completo ||
                        jugador.nombre ||
                        "Jugador";


                    const estado =
                        jugador.estadoFinanciero;


                    let claseEstado =
                        "estado-ok";


                    if (
                        estado ===
                        "CON DEUDA"
                    ) {

                        claseEstado =
                            "estado-deuda";

                    }


                    if (
                        estado ===
                        "EXENTO"
                    ) {

                        claseEstado =
                            "estado-exento";

                    }


                    if (
                        estado ===
                        "INACTIVO"
                    ) {

                        claseEstado =
                            "estado-inactivo";

                    }


                    if (
                        estado ===
                        "SIN CUOTAS"
                    ) {

                        claseEstado =
                            "estado-sin-cuotas";

                    }


                    let tipoJugador =
                        "Jugador antiguo";


                    if (
                        jugador
                            .exento_mensualidad
                    ) {

                        tipoJugador =
                            "Exento de mensualidad";

                    } else if (
                        jugador.fecha_ingreso
                    ) {

                        tipoJugador =
                            `Ingreso: ${
                                formatearMes(
                                    jugador.fecha_ingreso
                                )
                            }`;

                    }


                    const portal =
                        jugador.user_id
                            ? `
                                <span
                                    class="portal-activo"
                                >
                                    ACTIVO
                                </span>
                              `
                            : `
                                <span
                                    class="portal-inactivo"
                                >
                                    SIN ACTIVAR
                                </span>
                              `;


                    return `
                        <article
                            class="jugador-admin-card"
                        >

                            <div
                                class="jugador-admin-header"
                            >

                                <div>

                                    <h3>
                                        ${escaparHTML(
                                            nombre
                                        )}
                                    </h3>

                                    <div
                                        class="jugador-tipo"
                                    >
                                        ${escaparHTML(
                                            tipoJugador
                                        )}
                                    </div>

                                </div>


                                <span
                                    class="
                                        estado-financiero
                                        ${claseEstado}
                                    "
                                >
                                    ${estado}
                                </span>

                            </div>


                            <div class="jugador-finanzas">

                                <div class="jugador-finanza jugador-finanza-historico">
                                    <span>Saldo anterior</span>
                                    <strong>${formatearDinero(jugador.saldoAnteriorPendiente)}</strong>
                                </div>

                                <div class="jugador-finanza">
                                    <span>Mensualidades</span>
                                    <strong>${formatearDinero(jugador.mensualidadesPendientes)}</strong>
                                </div>

                                <div class="jugador-finanza jugador-finanza-total">
                                    <span>Total pendiente</span>
                                    <strong>${formatearDinero(jugador.totalPendiente)}</strong>
                                </div>

                            </div>

                            <div
                                class="portal-estado"
                            >
                                Portal del jugador:
                                ${portal}
                            </div>

                            <button
    type="button"
    class="btn btn-detalle"
    data-ver-jugador="${jugador.id}"
>
    Ver detalle
</button>

                        </article>
                    `;

                }
            )
            .join("");

            conectarBotonesDetalleJugador();

}


/* ===================================================
   BUSCADOR JUGADORES
=================================================== */

buscarJugadorInput.addEventListener(
    "input",
    () => {

        const busqueda =
            buscarJugadorInput
                .value
                .trim()
                .toLowerCase();


        const filtrados =
            jugadoresTesoreria.filter(
                (jugador) => {

                    const nombre =
                        String(
                            jugador
                                .nombre_completo ||
                            jugador.nombre ||
                            ""
                        )
                            .toLowerCase();


                    return nombre.includes(
                        busqueda
                    );

                }
            );


        renderizarJugadores(
            filtrados
        );

    }
);


/* ===================================================
   FORMATEAR MES
=================================================== */

function formatearMes(
    fecha
) {

    if (!fecha) {
        return "";
    }


    const objetoFecha =
        new Date(
            `${fecha}T00:00:00`
        );


    return new Intl.DateTimeFormat(
        "es-CL",
        {
            month:
                "long",

            year:
                "numeric"
        }
    )
        .format(
            objetoFecha
        );

}

/* ===================================================
   BOTONES DETALLE JUGADOR
=================================================== */

function conectarBotonesDetalleJugador() {

    document
        .querySelectorAll(
            "[data-ver-jugador]"
        )
        .forEach(
            (boton) => {

                if (boton.dataset.detalleConectado === "1") {
                    return;
                }

                boton.dataset.detalleConectado = "1";

                boton.addEventListener(
                    "click",
                    async () => {
                        await abrirDetalleJugador(
                            boton.dataset.verJugador
                        );
                    }
                );

            }
        );

}


/* ===================================================
   ABRIR DETALLE JUGADOR
=================================================== */

async function abrirDetalleJugador(
    jugadorId
) {

    const jugador =
        jugadoresTesoreria.find(
            (item) =>
                item.id ===
                jugadorId
        );


    if (!jugador) {

        return;

    }


    vistaOrigenDetalleJugador =
        vistaMensualidades?.classList.contains("activa")
            ? "mensualidades"
            : "jugadores";


    vistaResumen.classList.remove(
        "activa"
    );


    vistaJugadores.classList.remove(
        "activa"
    );


    vistaMensualidades?.classList.remove(
        "activa"
    );

    vistaDetalleJugador.classList.remove(
    "activa"
);


    vistaDetalleJugador.classList.add(
        "activa"
    );


    if (adminTituloVista) {

        adminTituloVista.textContent =
            "Ficha del jugador";

    }


    detalleJugadorNombre.textContent =
        jugador.nombre_completo ||
        jugador.nombre;


    let tipo =
        "Jugador antiguo";


    if (
        jugador.exento_mensualidad
    ) {

        tipo =
            "Exento de mensualidad";

    } else if (
        jugador.fecha_ingreso
    ) {

        tipo =
            `Ingreso: ${
                formatearMes(
                    jugador.fecha_ingreso
                )
            }`;

    }


    detalleJugadorTipo.textContent =
        tipo;


    configurarEstadoDetalle(
        jugador.estadoFinanciero
    );


    detalleTotalPagado.textContent =
        formatearDinero(jugador.totalPagado);

    detalleSaldoAnterior.textContent =
        formatearDinero(jugador.saldoAnteriorPendiente);

    detalleMensualidadesPendientes.textContent =
        formatearDinero(jugador.mensualidadesPendientes);

    detalleTotalPendiente.textContent =
        formatearDinero(jugador.totalPendiente);


    detalleListaCuotas.innerHTML = `
        <div class="vacio">
            Cargando mensualidades...
        </div>
    `;


    const {
        data: cuotas,
        error
    } =
        await supabase
            .from(
                "cuotas"
            )
            .select(`
                id,
                concepto,
                periodo,
                monto,
                fecha_vencimiento,
                estado
            `)
            .eq(
                "jugador_id",
                jugadorId
            )
            .in(
                "concepto",
                ["SALDO_ANTERIOR", "MENSUALIDAD"]
            );


    if (error) {

        console.error(
            "Error detalle cuotas:",
            error
        );


        detalleListaCuotas.innerHTML = `
            <div class="detalle-sin-cuotas">
                No se pudieron cargar
                las mensualidades.
            </div>
        `;


        return;

    }


    renderizarDetalleCuotas(
        cuotas || []
    );

}


/* ===================================================
   ESTADO DETALLE
=================================================== */

function configurarEstadoDetalle(
    estado
) {

    detalleJugadorEstado.className =
        "estado-financiero";


    let clase =
        "estado-ok";


    if (
        estado ===
        "CON DEUDA"
    ) {

        clase =
            "estado-deuda";

    } else if (
        estado ===
        "EXENTO"
    ) {

        clase =
            "estado-exento";

    } else if (
        estado ===
        "INACTIVO"
    ) {

        clase =
            "estado-inactivo";

    } else if (
        estado ===
        "SIN CUOTAS"
    ) {

        clase =
            "estado-sin-cuotas";

    }


    detalleJugadorEstado.classList.add(
        clase
    );


    detalleJugadorEstado.textContent =
        estado;

}


/* ===================================================
   RENDERIZAR CUOTAS DEL JUGADOR
=================================================== */

function renderizarDetalleCuotas(
    cuotas
) {

    if (!cuotas.length) {
        detalleListaCuotas.innerHTML = `
            <div class="detalle-sin-cuotas">
                Este jugador no tiene obligaciones registradas.
            </div>
        `;
        return;
    }

    const cuotasOrdenadas = [...cuotas].sort((a, b) => {
        const aHistorico = normalizarEstado(a.concepto) === "SALDO_ANTERIOR";
        const bHistorico = normalizarEstado(b.concepto) === "SALDO_ANTERIOR";
        if (aHistorico && !bHistorico) return -1;
        if (!aHistorico && bHistorico) return 1;
        return String(a.periodo || "").localeCompare(String(b.periodo || ""));
    });

    detalleListaCuotas.innerHTML =
        cuotasOrdenadas.map((cuota) => {
            const estado = normalizarEstado(cuota.estado);
            const estaPagada = estado === "PAGADO";
            const esSaldoAnterior =
                normalizarEstado(cuota.concepto) === "SALDO_ANTERIOR";
            const claseEstado = estaPagada ? "cuota-pagada" : "cuota-pendiente";
            const titulo =
                esSaldoAnterior ? "Saldo anterior" : formatearMes(cuota.periodo);
            const subtitulo =
                esSaldoAnterior
                    ? "Deuda histórica · abril a agosto 2026"
                    : "Mensualidad";
            const etiquetaFecha =
                esSaldoAnterior ? "Corte histórico" : "Vencimiento";
            const valorFecha =
                esSaldoAnterior ? "31/08/2026" : formatearFecha(cuota.fecha_vencimiento);

            return `
                <article class="cuota-detalle ${esSaldoAnterior ? "cuota-detalle-historica" : ""}">
                    <div class="cuota-detalle-periodo">
                        <strong>${escaparHTML(titulo)}</strong>
                        <span>${escaparHTML(subtitulo)}</span>
                    </div>

                    <div class="cuota-detalle-dato">
                        <span>Monto</span>
                        <strong>${formatearDinero(cuota.monto)}</strong>
                    </div>

                    <div class="cuota-detalle-dato">
                        <span>${escaparHTML(etiquetaFecha)}</span>
                        <strong>${escaparHTML(valorFecha)}</strong>
                    </div>

                    <div>
                        <span class="cuota-estado ${claseEstado}">${estado}</span>
                    </div>
                </article>
            `;
        }).join("");
}


/* ===================================================
   VOLVER A JUGADORES
=================================================== */

btnVolverJugadores.addEventListener(
    "click",
    () => {
        vistaDetalleJugador.classList.remove("activa");
        mostrarVistaAdmin(
            vistaOrigenDetalleJugador || "jugadores"
        );
    }
);

/* ===================================================
   RESUMEN DE MENSUALIDADES Y DEUDAS
=================================================== */

function renderizarResumenMensualidades() {
    const deudaTotal = jugadoresTesoreria.reduce(
        (total, jugador) => total + (Number(jugador.totalPendiente) || 0),
        0
    );

    const saldoAnterior = jugadoresTesoreria.reduce(
        (total, jugador) => total + (Number(jugador.saldoAnteriorPendiente) || 0),
        0
    );

    const mensualidadesPendientes = jugadoresTesoreria.reduce(
        (total, jugador) => total + (Number(jugador.mensualidadesPendientes) || 0),
        0
    );

    const jugadoresConDeuda = jugadoresTesoreria.filter(
        (jugador) => Number(jugador.totalPendiente) > 0
    );

    if (mensualidadesDeudaTotal) {
        mensualidadesDeudaTotal.textContent = formatearDinero(deudaTotal);
    }
    if (mensualidadesSaldoAnterior) {
        mensualidadesSaldoAnterior.textContent = formatearDinero(saldoAnterior);
    }
    if (mensualidadesMesesPendientes) {
        mensualidadesMesesPendientes.textContent = formatearDinero(mensualidadesPendientes);
    }
    if (mensualidadesJugadoresDeuda) {
        mensualidadesJugadoresDeuda.textContent = jugadoresConDeuda.length;
    }
    if (badgeDeudores) {
        badgeDeudores.textContent =
            jugadoresConDeuda.length === 1
                ? "1 con deuda"
                : `${jugadoresConDeuda.length} con deuda`;
    }

    aplicarFiltrosMensualidades();
}


function aplicarFiltrosMensualidades() {
    if (!listaDeudasJugadores) return;

    const busqueda = String(buscarDeudaJugadorInput?.value || "")
        .trim()
        .toLowerCase();
    const filtro = filtroDeudaJugadorInput?.value || "CON_DEUDA";

    const filtrados = jugadoresTesoreria
        .filter((jugador) => {
            const nombre = String(
                jugador.nombre_completo || jugador.nombre || ""
            ).toLowerCase();
            const tieneDeuda = Number(jugador.totalPendiente) > 0;
            const cumpleFiltro =
                filtro === "TODOS" ||
                (filtro === "CON_DEUDA" && tieneDeuda) ||
                (filtro === "AL_DIA" && !tieneDeuda);
            return cumpleFiltro && nombre.includes(busqueda);
        })
        .sort((a, b) =>
            Number(b.totalPendiente) - Number(a.totalPendiente) ||
            String(a.nombre_completo || a.nombre || "")
                .localeCompare(
                    String(b.nombre_completo || b.nombre || ""),
                    "es"
                )
        );

    renderizarListaDeudasJugadores(filtrados);
}


function renderizarListaDeudasJugadores(jugadores) {
    if (!listaDeudasJugadores) return;

    if (!jugadores.length) {
        listaDeudasJugadores.innerHTML = `
            <div class="vacio">No hay jugadores que coincidan con este filtro.</div>
        `;
        return;
    }

    listaDeudasJugadores.innerHTML = jugadores.map((jugador) => {
        const nombre = jugador.nombre_completo || jugador.nombre || "Jugador";

        const cuotasPendientes = (jugador.cuotas || [])
            .filter((cuota) =>
                normalizarEstado(cuota.concepto) === "MENSUALIDAD" &&
                normalizarEstado(cuota.estado) === "PENDIENTE"
            )
            .sort((a, b) =>
                String(a.periodo || "").localeCompare(String(b.periodo || ""))
            );

        const meses = cuotasPendientes.length
            ? cuotasPendientes.map((cuota) => `
                <span class="deuda-mes-chip">
                    ${escaparHTML(formatearMesCorto(cuota.periodo))}
                    · ${formatearDinero(cuota.monto)}
                </span>
            `).join("")
            : `
                <span class="deuda-mes-chip deuda-mes-chip-ok">
                    Sin mensualidades pendientes
                </span>
            `;

        const tieneDeuda = Number(jugador.totalPendiente) > 0;
        const estadoTexto = tieneDeuda ? "CON DEUDA" : jugador.estadoFinanciero;
        const claseEstado = tieneDeuda
            ? "estado-deuda"
            : jugador.estadoFinanciero === "EXENTO"
                ? "estado-exento"
                : jugador.estadoFinanciero === "INACTIVO"
                    ? "estado-inactivo"
                    : "estado-ok";

        return `
            <article class="deuda-jugador-card">
                <div class="deuda-jugador-top">
                    <div>
                        <span class="admin-eyebrow">Estado financiero</span>
                        <h3>${escaparHTML(nombre)}</h3>
                    </div>
                    <span class="estado-financiero ${claseEstado}">
                        ${escaparHTML(estadoTexto)}
                    </span>
                </div>

                <div class="deuda-jugador-resumen">
                    <div class="deuda-dato deuda-dato-historico">
                        <span>Saldo anterior</span>
                        <strong>${formatearDinero(jugador.saldoAnteriorPendiente)}</strong>
                    </div>
                    <div class="deuda-dato">
                        <span>Mensualidades</span>
                        <strong>${formatearDinero(jugador.mensualidadesPendientes)}</strong>
                    </div>
                    <div class="deuda-dato deuda-dato-total">
                        <span>Total pendiente</span>
                        <strong>${formatearDinero(jugador.totalPendiente)}</strong>
                    </div>
                </div>

                <div class="deuda-meses">
                    <span class="deuda-meses-label">Mensualidades pendientes</span>
                    <div class="deuda-meses-chips">${meses}</div>
                </div>

                <button
                    type="button"
                    class="btn btn-detalle deuda-btn-detalle"
                    data-ver-jugador="${jugador.id}"
                >
                    Ver ficha financiera
                </button>
            </article>
        `;
    }).join("");

    conectarBotonesDetalleJugador();
}


function formatearMesCorto(fecha) {
    if (!fecha) return "";

    const objetoFecha = new Date(`${fecha}T00:00:00`);
    if (Number.isNaN(objetoFecha.getTime())) return String(fecha);

    const texto = new Intl.DateTimeFormat(
        "es-CL",
        { month: "short", year: "2-digit" }
    ).format(objetoFecha).replace(".", "");

    return texto.charAt(0).toUpperCase() + texto.slice(1);
}


buscarDeudaJugadorInput?.addEventListener(
    "input",
    aplicarFiltrosMensualidades
);


filtroDeudaJugadorInput?.addEventListener(
    "change",
    aplicarFiltrosMensualidades
);


/* ===================================================
   HISTORIAL DE PAGOS
=================================================== */

function renderizarHistorialPagos(
    pagos
) {

    if (!listaHistorialPagos) {
        return;
    }


    if (badgeTotalPagos) {

        badgeTotalPagos.textContent =
            pagos.length === 1
                ? "1 pago"
                : `${pagos.length} pagos`;

    }


    if (!pagos.length) {

        listaHistorialPagos.innerHTML = `
            <div class="vacio">
                No hay pagos registrados.
            </div>
        `;

        return;
    }


    listaHistorialPagos.innerHTML =
        pagos
            .map(
                (pago) => {

                    const jugador =
                        pago.jugadores;


                    const nombre =
                        jugador
                            ?.nombre_completo ||
                        jugador
                            ?.nombre ||
                        "Jugador";


                    const estado =
                        normalizarEstado(
                            pago.estado
                        );

                        const nombreRevisor =
    obtenerNombreAdministrador(
        pago.revisado_por
    );


let informacionRevision =
    "";


if (
    pago.revisado_por &&
    pago.revisado_at
) {

    informacionRevision = `
        <div class="revision-pago">

            <strong>
                ${
                    estado === "RECHAZADO"
                        ? "Rechazado por"
                        : "Aprobado por"
                }:
                ${escaparHTML(
                    nombreRevisor
                )}
            </strong>

            <span>
                ${formatearFechaHora(
                    pago.revisado_at
                )}
            </span>

            ${
                estado === "RECHAZADO" &&
                pago.motivo_rechazo

                    ? `
                        <span class="motivo-rechazo">
                            Motivo:
                            ${escaparHTML(
                                pago.motivo_rechazo
                            )}
                        </span>
                      `

                    : ""
            }

        </div>
    `;

}


                    let claseEstado =
                        "cuota-pendiente";


                    if (
                        estado ===
                        "APROBADO"
                    ) {

                        claseEstado =
                            "cuota-pagada";

                    } else if (
                        estado ===
                        "RECHAZADO"
                    ) {

                        claseEstado =
                            "pago-rechazado";

                    }


                    const botonComprobante =
                        pago.comprobante_path
                            ? `
                                <button
                                    type="button"
                                    class="
                                        btn
                                        btn-comprobante
                                    "
                                    data-historial-comprobante="${escaparHTML(
                                        pago.comprobante_path
                                    )}"
                                >
                                    Ver comprobante
                                </button>
                              `
                            : `
                                <span
                                    class="sin-comprobante"
                                >
                                    Pago histórico
                                </span>
                              `;


                    return `
                        <article
                            class="pago-card"
                        >

                            <div
                                class="pago-top"
                            >

                                <div>

                                    <h3
                                        class="pago-jugador"
                                    >
                                        ${escaparHTML(
                                            nombre
                                        )}
                                    </h3>


                                    <div
                                        class="pago-concepto"
                                    >
                                        ${
                                            escaparHTML(
                                                pago.observaciones ||
                                                "Pago registrado"
                                            )
                                        }
                                    </div>

                                </div>


                                <div
                                    class="monto"
                                >
                                    ${formatearDinero(
                                        pago.monto_total
                                    )}
                                </div>

                            </div>


                            <div class="datos">

                                <div class="dato">

                                    <span>
                                        Fecha
                                    </span>

                                    ${formatearFecha(
                                        pago.fecha_transferencia
                                    )}

                                </div>


                                <div class="dato">

                                    <span>
                                        N° operación
                                    </span>

                                    ${escaparHTML(
                                        pago.numero_operacion ||
                                        "No informado"
                                    )}

                                </div>


                                <div class="dato">

                                    <span>
                                        Estado
                                    </span>

                                    <span
                                        class="
                                            cuota-estado
                                            ${claseEstado}
                                        "
                                    >
                                        ${estado}
                                    </span>

                                </div>

                            </div>

                            ${informacionRevision}
 
                            <div class="acciones">

                                ${botonComprobante}

                            </div>

                        </article>
                    `;

                }
            )
            .join("");


    conectarComprobantesHistorial();

}


/* ===================================================
   COMPROBANTES DEL HISTORIAL
=================================================== */

function conectarComprobantesHistorial() {

    document
        .querySelectorAll(
            "[data-historial-comprobante]"
        )
        .forEach(
            (boton) => {

                boton.addEventListener(
                    "click",
                    async () => {

                        await abrirComprobante(
                            boton.dataset
                                .historialComprobante
                        );

                    }
                );

            }
        );

}


/* ===================================================
   APLICAR FILTROS HISTORIAL
=================================================== */

function aplicarFiltrosHistorialPagos() {

    const busqueda =
        String(
            buscarPagoInput?.value ||
            ""
        )
            .trim()
            .toLowerCase();


    const filtrados =
        historialPagosTesoreria
            .filter(
                (pago) => {

                    /* ===============================
                       FILTRO ESTADO
                    =============================== */

                    const estado =
                        normalizarEstado(
                            pago.estado
                        );


                    const cumpleEstado =
                        filtroEstadoPago ===
                            "TODOS"
                            ||
                        estado ===
                            filtroEstadoPago;


                    /* ===============================
                       BUSCADOR
                    =============================== */

                    const jugador =
                        pago.jugadores;


                    const nombre =
                        String(
                            jugador
                                ?.nombre_completo ||
                            jugador
                                ?.nombre ||
                            ""
                        )
                            .toLowerCase();


                    const observacion =
                        String(
                            pago.observaciones ||
                            ""
                        )
                            .toLowerCase();


                    const operacion =
                        String(
                            pago.numero_operacion ||
                            ""
                        )
                            .toLowerCase();


                    const cumpleBusqueda =
                        !busqueda ||
                        nombre.includes(
                            busqueda
                        ) ||
                        estado
                            .toLowerCase()
                            .includes(
                                busqueda
                            ) ||
                        observacion.includes(
                            busqueda
                        ) ||
                        operacion.includes(
                            busqueda
                        );


                    return (
                        cumpleEstado &&
                        cumpleBusqueda
                    );

                }
            );


    renderizarHistorialPagos(
        filtrados
    );

}


/* ===================================================
   BUSCADOR HISTORIAL
=================================================== */

if (buscarPagoInput) {

    buscarPagoInput.addEventListener(
        "input",
        () => {

            aplicarFiltrosHistorialPagos();

        }
    );

}


/* ===================================================
   BOTONES FILTRO ESTADO
=================================================== */

botonesFiltroPago.forEach(
    (boton) => {

        boton.addEventListener(
            "click",
            () => {

                filtroEstadoPago =
                    boton.dataset
                        .estadoPago ||
                    "TODOS";


                botonesFiltroPago.forEach(
                    (item) => {

                        item.classList.remove(
                            "activo"
                        );

                    }
                );


                boton.classList.add(
                    "activo"
                );


                aplicarFiltrosHistorialPagos();

            }
        );

    }
);

/* ===================================================
   NOMBRE ADMINISTRADOR
=================================================== */

function obtenerNombreAdministrador(
    userId
) {

    if (!userId) {

        return "Sin registrar";

    }


    const administrador =
        administradoresTesoreria
            .find(
                (admin) =>
                    admin.user_id ===
                    userId
            );


    return administrador
        ?.nombre ||
        "Administrador";

}


/* ===================================================
   FECHA Y HORA
=================================================== */

function formatearFechaHora(
    fecha
) {

    if (!fecha) {

        return "";

    }


    const objetoFecha =
        new Date(
            fecha
        );


    return new Intl.DateTimeFormat(
        "es-CL",
        {
            day:
                "2-digit",

            month:
                "2-digit",

            year:
                "numeric",

            hour:
                "2-digit",

            minute:
                "2-digit"
        }
    )
        .format(
            objetoFecha
        );

}

/* ===================================================
   NORMALIZAR ESTADO
=================================================== */

function normalizarEstado(
    estado
) {

    return String(
        estado ||
        ""
    )
        .trim()
        .toUpperCase();

}


/* ===================================================
   FORMATEAR DINERO
=================================================== */

function formatearDinero(
    monto
) {

    return new Intl.NumberFormat(
        "es-CL",
        {
            style:
                "currency",

            currency:
                "CLP",

            maximumFractionDigits:
                0
        }
    )
        .format(
            Number(
                monto
            ) || 0
        );

}


/* ===================================================
   FORMATEAR FECHA
=================================================== */

function formatearFecha(
    fecha
) {

    if (!fecha) {

        return "Sin fecha";
    }


    const objetoFecha =
        new Date(
            `${fecha}T00:00:00`
        );


    if (
        Number.isNaN(
            objetoFecha.getTime()
        )
    ) {

        return fecha;
    }


    return new Intl.DateTimeFormat(
        "es-CL",
        {
            day:
                "2-digit",

            month:
                "2-digit",

            year:
                "numeric"
        }
    )
        .format(
            objetoFecha
        );

}


/* ===================================================
   ESCAPAR HTML
=================================================== */

function escaparHTML(
    texto
) {

    return String(
        texto ??
        ""
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
            "\"",
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}

/* ===================================================
   GENERAR MENSUALIDADES MANUALMENTE
=================================================== */

if (btnGenerarMensualidades) {

    btnGenerarMensualidades.addEventListener(
        "click",
        async () => {

            const confirmar =
                confirm(
                    "¿Generar las mensualidades faltantes del mes actual?\n\nEl sistema no duplicará cuotas existentes."
                );


            if (!confirmar) {
                return;
            }


            btnGenerarMensualidades.disabled =
                true;


            btnGenerarMensualidades.textContent =
                "Generando...";


            mensajeGeneracionCuotas.textContent =
                "";


            const {
                data,
                error
            } =
                await supabase.rpc(
                    "generar_mensualidades_mes_actual_admin"
                );


            if (error) {

                console.error(
                    "Error generando mensualidades:",
                    error
                );


                mensajeGeneracionCuotas.textContent =
                    "No se pudieron generar las mensualidades.";


                btnGenerarMensualidades.disabled =
                    false;


                btnGenerarMensualidades.textContent =
                    "Generar mensualidades";


                return;

            }


            const cantidad =
                Number(data) || 0;


            if (cantidad === 0) {

                mensajeGeneracionCuotas.textContent =
                    "No había mensualidades nuevas por generar.";

            } else {

                mensajeGeneracionCuotas.textContent =
                    `Se generaron ${cantidad} mensualidades correctamente.`;

            }


            await cargarJugadores();


            btnGenerarMensualidades.disabled =
                false;


            btnGenerarMensualidades.textContent =
                "Generar mensualidades";

        }
    );

}

/* ===================================================
   RIFAS
=================================================== */

let contadorPremiosRifa =
    0;


/* ===================================================
   VALORES INICIALES RIFA
=================================================== */

function establecerValoresInicialesRifa() {

    const hoy =
        new Date();


    const anio =
        hoy.getFullYear();


    const mes =
        String(
            hoy.getMonth() + 1
        )
            .padStart(
                2,
                "0"
            );


    const dia =
        String(
            hoy.getDate()
        )
            .padStart(
                2,
                "0"
            );


    if (rifaPeriodoInput) {

        rifaPeriodoInput.value =
            `${anio}-${mes}`;

    }


    if (rifaFechaInicioInput) {

        rifaFechaInicioInput.value =
            `${anio}-${mes}-${dia}`;

    }


    if (rifaValorInput) {

        rifaValorInput.value =
            "1000";

    }


    if (rifaEstadoSelect) {

        rifaEstadoSelect.value =
            "BORRADOR";

    }

}


/* ===================================================
   AGREGAR PREMIO
=================================================== */

function agregarFilaPremio(
    nombre = "",
    descripcion = ""
) {

    if (!premiosRifaAdmin) {
        return;
    }


    contadorPremiosRifa +=
        1;


    const fila =
        document.createElement(
            "div"
        );


    fila.className =
        "premio-rifa-fila";


    fila.innerHTML = `

        <div class="premio-rifa-numero">
            ${contadorPremiosRifa}
        </div>


        <input
            type="text"
            class="premio-nombre"
            maxlength="150"
            placeholder="Nombre del premio"
            value="${escaparHTML(
                nombre
            )}"
        >


        <input
            type="text"
            class="premio-descripcion"
            maxlength="250"
            placeholder="Descripción opcional"
            value="${escaparHTML(
                descripcion
            )}"
        >


        <button
            type="button"
            class="btn btn-eliminar-premio"
        >
            Eliminar
        </button>
    `;


    premiosRifaAdmin.appendChild(
        fila
    );


    fila
        .querySelector(
            ".btn-eliminar-premio"
        )
        ?.addEventListener(
            "click",
            () => {

                fila.remove();

                renumerarPremiosRifa();

            }
        );

}


/* ===================================================
   RENUMERAR PREMIOS
=================================================== */

function renumerarPremiosRifa() {

    if (!premiosRifaAdmin) {
        return;
    }


    const filas =
        premiosRifaAdmin
            .querySelectorAll(
                ".premio-rifa-fila"
            );


    filas.forEach(
        (
            fila,
            index
        ) => {

            const numero =
                fila.querySelector(
                    ".premio-rifa-numero"
                );


            if (numero) {

                numero.textContent =
                    index + 1;

            }

        }
    );


    contadorPremiosRifa =
        filas.length;

}


/* ===================================================
   BOTÓN AGREGAR PREMIO
=================================================== */

if (btnAgregarPremio) {

    btnAgregarPremio.addEventListener(
        "click",
        () => {

            agregarFilaPremio();

        }
    );

}


/* ===================================================
   OBTENER PREMIOS DEL FORMULARIO
=================================================== */

function obtenerPremiosFormulario() {

    if (!premiosRifaAdmin) {

        return [];

    }


    return Array.from(
        premiosRifaAdmin
            .querySelectorAll(
                ".premio-rifa-fila"
            )
    )
        .map(
            (fila) => {

                const nombre =
                    fila
                        .querySelector(
                            ".premio-nombre"
                        )
                        ?.value
                        ?.trim() ||
                    "";


                const descripcion =
                    fila
                        .querySelector(
                            ".premio-descripcion"
                        )
                        ?.value
                        ?.trim() ||
                    "";


                return {
                    nombre,
                    descripcion
                };

            }
        )
        .filter(
            (premio) =>
                premio.nombre
        );

}


/* ===================================================
   CREAR RIFA
=================================================== */

formRifaAdmin?.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        mensajeRifa.textContent =
            "";


        const numero =
            Number(
                rifaNumeroInput.value
            );


        const periodo =
            rifaPeriodoInput.value;


        const valor =
            Number(
                rifaValorInput.value
            );


        const fechaInicio =
            rifaFechaInicioInput.value;


        const fechaCierre =
            rifaFechaCierreInput.value ||
            null;


        const estado =
            rifaEstadoSelect.value;


        const premios =
            obtenerPremiosFormulario();


        if (
            !numero ||
            numero < 1
        ) {

            mensajeRifa.textContent =
                "El número de rifa no es válido.";

            return;

        }


        if (!periodo) {

            mensajeRifa.textContent =
                "Debes seleccionar el mes.";

            return;

        }


        if (
            !valor ||
            valor <= 0
        ) {

            mensajeRifa.textContent =
                "El valor de participación no es válido.";

            return;

        }


        if (!fechaInicio) {

            mensajeRifa.textContent =
                "Debes seleccionar la fecha de inicio.";

            return;

        }


        if (
            fechaCierre &&
            fechaCierre <
            fechaInicio
        ) {

            mensajeRifa.textContent =
                "La fecha de cierre no puede ser anterior a la fecha de inicio.";

            return;

        }


        if (
            estado === "ACTIVA" &&
            premios.length === 0
        ) {

            mensajeRifa.textContent =
                "Una rifa activa debe tener al menos un premio.";

            return;

        }


        btnCrearRifa.disabled =
            true;


        btnCrearRifa.textContent =
            "Creando rifa...";


        const {
            data,
            error
        } =
            await supabase.rpc(
                "crear_rifa_admin",
                {

                    p_numero:
                        numero,

                    p_periodo:
                        `${periodo}-01`,

                    p_titulo:
                        rifaTituloInput
                            .value
                            .trim() ||
                        null,

                    p_descripcion:
                        rifaDescripcionInput
                            .value
                            .trim() ||
                        null,

                    p_valor_participacion:
                        valor,

                    p_fecha_inicio:
                        fechaInicio,

                    p_fecha_cierre:
                        fechaCierre,

                    p_estado:
                        estado,

                    p_premios:
                        premios

                }
            );


        if (error) {

            console.error(
                "Error creando rifa:",
                error
            );


            mensajeRifa.textContent =
                error.message ||
                "No se pudo crear la rifa.";


            btnCrearRifa.disabled =
                false;


            btnCrearRifa.textContent =
                "Crear rifa";


            return;

        }


        console.log(
            "Rifa creada:",
            data
        );


        mensajeRifa.textContent =
            "Rifa creada correctamente.";


        formRifaAdmin.reset();


        premiosRifaAdmin.innerHTML =
            "";


        contadorPremiosRifa =
            0;


        establecerValoresInicialesRifa();


        agregarFilaPremio();


        await cargarRifas();


        btnCrearRifa.disabled =
            false;


        btnCrearRifa.textContent =
            "Crear rifa";

    }
);


/* ===================================================
   CARGAR RIFAS
=================================================== */

async function cargarRifas() {

    if (!listaRifasAdmin) {
        return;
    }


    const {
        data,
        error
    } =
        await supabase
            .from(
                "rifas"
            )
            .select(`
                id,
                numero,
                periodo,
                titulo,
                descripcion,
                valor_participacion,
                fecha_inicio,
                fecha_cierre,
                estado,
                created_at,
                premios_rifa (
                    id,
                    orden,
                    nombre,
                    descripcion
                )
            `)
            .order(
                "periodo",
                {
                    ascending:
                        false
                }
            )
            .order(
                "numero",
                {
                    ascending:
                        false
                }
            );


    if (error) {

        console.error(
            "Error cargando rifas:",
            error
        );


        listaRifasAdmin.innerHTML = `
            <div class="vacio">
                No se pudieron cargar las rifas.
            </div>
        `;


        return;

    }


    rifasAdmin =
        data || [];


    renderizarRifas(
        rifasAdmin
    );

}


/* ===================================================
   RENDERIZAR RIFAS
=================================================== */

function renderizarRifas(
    rifas
) {

    if (!listaRifasAdmin) {
        return;
    }


    if (badgeRifas) {

        badgeRifas.textContent =
            rifas.length === 1
                ? "1 rifa"
                : `${rifas.length} rifas`;

    }


    if (!rifas.length) {

        listaRifasAdmin.innerHTML = `
            <div class="vacio">
                Todavía no existen rifas registradas.
            </div>
        `;


        return;

    }


    listaRifasAdmin.innerHTML =
        rifas
            .map(
                (rifa) => {

                    const estado =
                        normalizarEstado(
                            rifa.estado
                        );


                    let claseEstado =
                        "rifa-estado-borrador";


                    if (
                        estado ===
                        "ACTIVA"
                    ) {

                        claseEstado =
                            "rifa-estado-activa";

                    } else if (
                        estado ===
                        "CERRADA"
                    ) {

                        claseEstado =
                            "rifa-estado-cerrada";

                    }


                    const premios =
                        Array.isArray(
                            rifa.premios_rifa
                        )
                            ? rifa.premios_rifa
                            : [];


                    premios.sort(
                        (
                            a,
                            b
                        ) =>
                            Number(
                                a.orden
                            ) -
                            Number(
                                b.orden
                            )
                    );


                    const titulo =
                        rifa.titulo ||
                        `Rifa ${
                            rifa.numero
                        } · ${
                            capitalizarPrimera(
                                formatearMes(
                                    rifa.periodo
                                )
                            )
                        }`;


                    const textoPremios =
                        premios.length
                            ? premios
                                .slice(
                                    0,
                                    5
                                )
                                .map(
                                    (premio) =>
                                        `${premio.orden}. ${
                                            escaparHTML(
                                                premio.nombre
                                            )
                                        }`
                                )
                                .join(
                                    " · "
                                )
                            : "Sin premios registrados";


                    return `
                        <article
                            class="rifa-admin-card"
                        >

                            <div
                                class="rifa-admin-top"
                            >

                                <div>

                                    <h3>
                                        ${escaparHTML(
                                            titulo
                                        )}
                                    </h3>

                                    <div
                                        class="rifa-admin-subtitulo"
                                    >
                                        Rifa ${
                                            rifa.numero
                                        } · ${
                                            capitalizarPrimera(
                                                formatearMes(
                                                    rifa.periodo
                                                )
                                            )
                                        }
                                    </div>

                                </div>


                                <span
                                    class="
                                        rifa-estado
                                        ${claseEstado}
                                    "
                                >
                                    ${estado}
                                </span>

                            </div>


                            <div
                                class="rifa-admin-datos"
                            >

                                <div
                                    class="rifa-admin-dato"
                                >

                                    <span>
                                        Participación
                                    </span>

                                    <strong>
                                        ${formatearDinero(
                                            rifa
                                                .valor_participacion
                                        )}
                                    </strong>

                                </div>


                                <div
                                    class="rifa-admin-dato"
                                >

                                    <span>
                                        Inicio
                                    </span>

                                    <strong>
                                        ${formatearFecha(
                                            rifa
                                                .fecha_inicio
                                        )}
                                    </strong>

                                </div>


                                <div
                                    class="rifa-admin-dato"
                                >

                                    <span>
                                        Cierre
                                    </span>

                                    <strong>
                                        ${
                                            rifa.fecha_cierre
                                                ? formatearFecha(
                                                    rifa.fecha_cierre
                                                )
                                                : "Sin definir"
                                        }
                                    </strong>

                                </div>


                                <div
                                    class="rifa-admin-dato"
                                >

                                    <span>
                                        Premios
                                    </span>

                                    <strong>
                                        ${
                                            premios.length
                                        }
                                    </strong>

                                </div>

                            </div>


                            <div
                                class="rifa-premios-resumen"
                            >

                                <strong>
                                    Premios:
                                </strong>

                                ${textoPremios}

                                ${
                                    premios.length > 5
                                        ? ` · +${
                                            premios.length - 5
                                        } más`
                                        : ""
                                }

                            </div>


                            <button
                                type="button"
                                class="btn btn-detalle"
                                data-administrar-rifa="${escaparHTML(
                                    rifa.id
                                )}"
                            >
                                Administrar rifa
                            </button>

                        </article>
                    `;

                }
            )
            .join("");


    conectarBotonesAdministrarRifa();

}


/* ===================================================
   ADMINISTRAR RIFA EXISTENTE
=================================================== */

function conectarBotonesAdministrarRifa() {

    document
        .querySelectorAll(
            "[data-administrar-rifa]"
        )
        .forEach(
            (boton) => {

                boton.addEventListener(
                    "click",
                    async () => {

                        await abrirDetalleRifa(
                            boton.dataset
                                .administrarRifa
                        );

                    }
                );

            }
        );

}


/* ===================================================
   ABRIR DETALLE RIFA
=================================================== */

async function abrirDetalleRifa(
    rifaId
) {

    const rifa =
        rifasAdmin.find(
            (item) =>
                item.id ===
                rifaId
        );


    if (!rifa) {

        alert(
            "No se pudo encontrar la rifa."
        );

        return;

    }


    [
        vistaResumen,
        vistaJugadores,
        vistaMensualidades,
        vistaPagos,
        vistaRifas,
        vistaEgresos,
        vistaCuenta,
        vistaDetalleJugador
    ]
        .forEach(
            (vista) => {

                vista?.classList
                    .remove(
                        "activa"
                    );

            }
        );


    vistaDetalleRifa
        ?.classList
        .add(
            "activa"
        );


    menuBotones.forEach(
        (boton) => {

            boton.classList
                .toggle(
                    "activo",
                    boton.dataset.vista ===
                        "rifas"
                );

        }
    );


    if (adminTituloVista) {

        adminTituloVista.textContent =
            "Administrar rifa";

    }


    const tituloVisible =
        rifa.titulo ||
        `Rifa ${rifa.numero} · ${
            capitalizarPrimera(
                formatearMes(
                    rifa.periodo
                )
            )
        }`;


    if (detalleRifaTitulo) {

        detalleRifaTitulo.textContent =
            tituloVisible;

    }


    editarRifaId.value =
        rifa.id;


    editarRifaNumero.value =
        rifa.numero;


    editarRifaPeriodo.value =
        String(
            rifa.periodo ||
            ""
        )
            .slice(
                0,
                7
            );


    editarRifaValor.value =
        rifa.valor_participacion;


    editarRifaEstado.value =
        normalizarEstado(
            rifa.estado
        );


    editarRifaFechaInicio.value =
        rifa.fecha_inicio ||
        "";


    editarRifaFechaCierre.value =
        rifa.fecha_cierre ||
        "";


    editarRifaTitulo.value =
        rifa.titulo ||
        "";


    editarRifaDescripcion.value =
        rifa.descripcion ||
        "";


    mensajeEditarRifa.textContent =
        "";


    premiosRifaEditar.innerHTML =
        "";


    contadorPremiosEditar =
        0;


    const premios =
        Array.isArray(
            rifa.premios_rifa
        )
            ? [...rifa.premios_rifa]
            : [];


    premios.sort(
        (
            a,
            b
        ) =>
            Number(
                a.orden
            ) -
            Number(
                b.orden
            )
    );


    premios.forEach(
        (premio) => {

            agregarFilaPremioEditar(
                premio.nombre,
                premio.descripcion ||
                ""
            );

        }
    );


    if (!premios.length) {

        agregarFilaPremioEditar();

    }


    await cargarOperacionesRifa(
        rifa.id
    );


    await cargarSorteoRifa(
        rifa.id
    );


    cerrarSidebarAdmin();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* ===================================================
   CARGAR SORTEO DE UNA RIFA
=================================================== */

async function cargarSorteoRifa(
    rifaId
) {

    if (
        !bloqueSorteoRifa ||
        !btnSortearRifa ||
        !mensajeSorteoRifa ||
        !resultadosSorteoRifa ||
        !rifaId
    ) {

        return;

    }


    mensajeSorteoRifa.textContent =
        "Consultando estado del sorteo...";


    resultadosSorteoRifa.innerHTML =
        "";


    btnSortearRifa.disabled =
        true;


    btnSortearRifa.textContent =
        "Realizar sorteo";


    /*
        Ahora Supabase calcula TODO el estado del sorteo.
        El frontend ya no depende de variables locales para
        decidir si el botón debe habilitarse.
    */

    const {
        data: estadoData,
        error: errorEstado
    } =
        await supabase.rpc(
            "estado_sorteo_rifa_admin",
            {
                p_rifa_id:
                    rifaId
            }
        );


    if (errorEstado) {

        console.error(
            "Error consultando estado del sorteo:",
            errorEstado
        );


        mensajeSorteoRifa.textContent =
            errorEstado.message ||
            "No se pudo consultar el estado del sorteo.";


        return;

    }


    const estado =
        Array.isArray(
            estadoData
        )
            ? estadoData[0]
            : estadoData;


    if (!estado) {

        mensajeSorteoRifa.textContent =
            "No se recibió información del estado del sorteo.";


        return;

    }


    /*
        Si ya fue sorteada, consultamos los ganadores
        guardados y los mostramos.
    */

    if (estado.ya_sorteada === true) {

        const {
            data: ganadores,
            error: errorGanadores
        } =
            await supabase.rpc(
                "obtener_ganadores_rifa_admin",
                {
                    p_rifa_id:
                        rifaId
                }
            );


        if (errorGanadores) {

            console.error(
                "Error cargando ganadores:",
                errorGanadores
            );


            mensajeSorteoRifa.textContent =
                errorGanadores.message ||
                "La rifa ya fue sorteada, pero no se pudieron cargar los ganadores.";


            return;

        }


        const lista =
            Array.isArray(
                ganadores
            )
                ? ganadores
                : [];


        mensajeSorteoRifa.textContent =
            "Sorteo realizado. Estos resultados quedaron guardados oficialmente.";


        btnSortearRifa.disabled =
            true;


        btnSortearRifa.textContent =
            "Sorteo realizado";


        await renderizarGanadoresRifa(
            lista
        );


        return;

    }


    /*
        Mostramos exactamente el mensaje calculado
        por Supabase.
    */

    mensajeSorteoRifa.textContent =
        estado.mensaje ||
        "Estado del sorteo consultado.";


    btnSortearRifa.disabled =
        estado.listo_para_sortear !== true;


    if (
        estado.listo_para_sortear ===
        true
    ) {

        btnSortearRifa.textContent =
            "Realizar sorteo";

    }

}


/* ===================================================
   RENDERIZAR GANADORES
=================================================== */

async function renderizarGanadoresRifa(
    ganadores
) {

    if (!resultadosSorteoRifa) {

        return;

    }


    const idsJugadores = [
        ...new Set(
            ganadores
                .map(
                    (ganador) =>
                        ganador.jugador_id
                )
                .filter(Boolean)
        )
    ];


    const nombresJugadores =
        new Map();


    if (idsJugadores.length > 0) {

        const {
            data: jugadores,
            error
        } =
            await supabase
                .from(
                    "jugadores"
                )
                .select(`
                    id,
                    nombre,
                    nombre_completo
                `)
                .in(
                    "id",
                    idsJugadores
                );


        if (!error) {

            (
                jugadores ||
                []
            )
                .forEach(
                    (jugador) => {

                        nombresJugadores.set(
                            jugador.id,
                            jugador.nombre_completo ||
                            jugador.nombre ||
                            "Jugador"
                        );

                    }
                );

        }

    }


    resultadosSorteoRifa.innerHTML =
        ganadores

            .map(
                (
                    ganador,
                    indice
                ) => {

                    const responsable =
                        nombresJugadores.get(
                            ganador.jugador_id
                        ) ||
                        "Jugador";


                    return `
                        <article style="
                            display:grid;
                            grid-template-columns:auto 1fr auto;
                            gap:16px;
                            align-items:center;
                            padding:16px 18px;
                            border-radius:16px;
                            background:rgba(255,255,255,.045);
                            border:1px solid rgba(255,255,255,.075);
                        ">

                            <div style="
                                width:46px;
                                height:46px;
                                border-radius:50%;
                                display:grid;
                                place-items:center;
                                font-weight:800;
                                font-size:1.05rem;
                                background:rgba(255,196,59,.14);
                                border:1px solid rgba(255,196,59,.28);
                                color:#ffd56a;
                            ">
                                ${Number(
                                    ganador.orden_premio
                                ) || indice + 1}
                            </div>

                            <div>

                                <span style="
                                    display:block;
                                    color:#8fa3b8;
                                    font-size:.82rem;
                                    margin-bottom:3px;
                                ">
                                    ${
                                        Number(
                                            ganador.orden_premio
                                        ) || indice + 1
                                    }° premio
                                </span>

                                <strong style="
                                    display:block;
                                    font-size:1.03rem;
                                    margin-bottom:5px;
                                ">
                                    ${escaparHTML(
                                        ganador.premio_nombre
                                    )}
                                </strong>

                                <span style="
                                    display:block;
                                    color:#d9e3ec;
                                ">
                                    Ganador:
                                    <strong>
                                        ${escaparHTML(
                                            ganador.nombre_comprador
                                        )}
                                    </strong>
                                </span>

                                <small style="
                                    display:block;
                                    color:#8396aa;
                                    margin-top:4px;
                                ">
                                    Venta registrada por
                                    ${escaparHTML(
                                        responsable
                                    )}
                                </small>

                            </div>

                            <div style="
                                font-size:1.35rem;
                            ">
                                🏆
                            </div>

                        </article>
                    `;

                }
            )

            .join("");

}



/* ===================================================
   CARGAR OPERACIÓN DE UNA RIFA
=================================================== */

async function cargarOperacionesRifa(
    rifaId
) {

    if (!rifaId) {
        return;
    }


    if (listaEntregasRifaPendientes) {

        listaEntregasRifaPendientes.innerHTML = `
            <div class="vacio">
                Cargando entregas...
            </div>
        `;

    }


    if (listaEntregasRifaHistorial) {

        listaEntregasRifaHistorial.innerHTML = `
            <div class="vacio">
                Cargando historial...
            </div>
        `;

    }


    const {
        data: entregas,
        error: errorEntregas
    } =
        await supabase
            .from(
                "entregas_rifa"
            )
            .select("*")
            .eq(
                "rifa_id",
                rifaId
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (errorEntregas) {

        console.error(
            "Error cargando entregas de rifa:",
            errorEntregas
        );


        if (listaEntregasRifaPendientes) {

            listaEntregasRifaPendientes.innerHTML = `
                <div class="vacio">
                    No se pudieron cargar las entregas.
                </div>
            `;

        }


        if (listaEntregasRifaHistorial) {

            listaEntregasRifaHistorial.innerHTML = `
                <div class="vacio">
                    No se pudo cargar el historial.
                </div>
            `;

        }


        return;

    }


    entregasRifaAdmin =
        entregas || [];


    compradoresRifaAdmin =
        [];


    const idsEntregas =
        entregasRifaAdmin
            .map(
                (entrega) =>
                    entrega.id
            )
            .filter(Boolean);


    if (idsEntregas.length > 0) {

        const {
            data: compradores,
            error: errorCompradores
        } =
            await supabase
                .from(
                    "compradores_rifa"
                )
                .select("*")
                .in(
                    "entrega_id",
                    idsEntregas
                );


        if (errorCompradores) {

            console.error(
                "Error cargando compradores de rifa:",
                errorCompradores
            );

        } else {

            compradoresRifaAdmin =
                compradores || [];

        }

    }


    renderizarOperacionRifa();

}


/* ===================================================
   RENDERIZAR OPERACIÓN DE RIFA
=================================================== */

function renderizarOperacionRifa() {

    const pendientes =
        entregasRifaAdmin.filter(
            (entrega) =>
                normalizarEstado(
                    entrega.estado
                ) === "PENDIENTE"
        );


    const aprobadas =
        entregasRifaAdmin.filter(
            (entrega) => {

                const estado =
                    normalizarEstado(
                        entrega.estado
                    );


                return (
                    estado === "APROBADA" ||
                    estado === "APROBADO"
                );

            }
        );


    const participacionesAprobadas =
        aprobadas.reduce(
            (
                total,
                entrega
            ) =>
                total +
                obtenerParticipacionesEntregaRifa(
                    entrega
                ),
            0
        );


    const montoAprobado =
        aprobadas.reduce(
            (
                total,
                entrega
            ) =>
                total +
                obtenerMontoEntregaRifa(
                    entrega
                ),
            0
        );


    if (badgeEntregasRifa) {

        badgeEntregasRifa.textContent =
            entregasRifaAdmin.length === 1
                ? "1 entrega"
                : `${entregasRifaAdmin.length} entregas`;

    }


    if (rifaStatPendientes) {

        rifaStatPendientes.textContent =
            pendientes.length;

    }


    if (rifaStatAprobadas) {

        rifaStatAprobadas.textContent =
            aprobadas.length;

    }


    if (rifaStatParticipaciones) {

        rifaStatParticipaciones.textContent =
            participacionesAprobadas;

    }


    if (rifaStatRecaudado) {

        rifaStatRecaudado.textContent =
            formatearDinero(
                montoAprobado
            );

    }


    renderizarEntregasRifa(
        listaEntregasRifaPendientes,
        pendientes,
        true
    );


    renderizarEntregasRifa(
        listaEntregasRifaHistorial,
        entregasRifaAdmin,
        false
    );


    renderizarRankingRifa(
        aprobadas
    );


    conectarBotonesEntregasRifa();

}


/* ===================================================
   RENDERIZAR ENTREGAS DE RIFA
=================================================== */

function renderizarEntregasRifa(
    contenedor,
    entregas,
    permitirRevision
) {

    if (!contenedor) {
        return;
    }


    if (!entregas.length) {

        contenedor.innerHTML = `
            <div class="vacio">
                ${
                    permitirRevision
                        ? "No hay entregas pendientes de revisión."
                        : "Todavía no existen entregas para esta rifa."
                }
            </div>
        `;


        return;

    }


    contenedor.innerHTML =
        entregas
            .map(
                (entrega) =>
                    crearTarjetaEntregaRifa(
                        entrega,
                        permitirRevision
                    )
            )
            .join("");

}


/* ===================================================
   TARJETA DE ENTREGA DE RIFA
=================================================== */

function crearTarjetaEntregaRifa(
    entrega,
    permitirRevision
) {

    const estado =
        normalizarEstado(
            entrega.estado
        ) ||
        "PENDIENTE";


    const jugador =
        jugadoresTesoreria.find(
            (item) =>
                item.id ===
                entrega.jugador_id
        );


    const nombreJugador =
        jugador?.nombre_completo ||
        jugador?.nombre ||
        "Jugador";


    const compradores =
        compradoresRifaAdmin.filter(
            (comprador) =>
                comprador.entrega_id ===
                entrega.id
        );


    const participaciones =
        obtenerParticipacionesEntregaRifa(
            entrega
        );


    const monto =
        obtenerMontoEntregaRifa(
            entrega
        );


    let claseEstado =
        "rifa-entrega-estado-pendiente";


    if (
        estado === "APROBADA" ||
        estado === "APROBADO"
    ) {

        claseEstado =
            "rifa-entrega-estado-aprobada";

    } else if (
        estado === "RECHAZADA" ||
        estado === "RECHAZADO"
    ) {

        claseEstado =
            "rifa-entrega-estado-rechazada";

    }


    const listaCompradores =
        compradores.length
            ? compradores
                .map(
                    (comprador) => `
                        <div class="rifa-comprador-fila">

                            <span>
                                ${escaparHTML(
                                    obtenerNombreCompradorRifa(
                                        comprador
                                    )
                                )}
                            </span>

                            <strong>
                                ${obtenerCantidadCompradorRifa(
                                    comprador
                                )}
                                participaciones
                            </strong>

                        </div>
                    `
                )
                .join("")
            : `
                <div class="rifa-compradores-vacio">
                    Sin compradores visibles.
                </div>
            `;


    let revision =
        "";


    if (
        entrega.revisado_por ||
        entrega.revisado_at
    ) {

        const nombreRevisor =
            obtenerNombreAdministrador(
                entrega.revisado_por
            );


        revision = `
            <div class="rifa-entrega-revision">

                <strong>
                    ${
                        estado === "RECHAZADA" ||
                        estado === "RECHAZADO"
                            ? "Rechazado por"
                            : "Aprobado por"
                    }:
                    ${escaparHTML(
                        nombreRevisor
                    )}
                </strong>

                ${
                    entrega.revisado_at
                        ? `
                            <span>
                                ${formatearFechaHora(
                                    entrega.revisado_at
                                )}
                            </span>
                          `
                        : ""
                }

                ${
                    (
                        estado === "RECHAZADA" ||
                        estado === "RECHAZADO"
                    ) &&
                    entrega.motivo_rechazo

                        ? `
                            <span class="motivo-rechazo">
                                Motivo:
                                ${escaparHTML(
                                    entrega.motivo_rechazo
                                )}
                            </span>
                          `
                        : ""
                }

            </div>
        `;

    }


    const accionesRevision =
        permitirRevision &&
        estado === "PENDIENTE"
            ? `
                <button
                    type="button"
                    class="btn btn-aprobar"
                    data-aprobar-entrega-rifa="${escaparHTML(
                        entrega.id
                    )}"
                >
                    Aprobar entrega
                </button>

                <button
                    type="button"
                    class="btn btn-rechazar"
                    data-rechazar-entrega-rifa="${escaparHTML(
                        entrega.id
                    )}"
                >
                    Rechazar
                </button>
              `
            : "";


    return `
        <article class="rifa-entrega-card">

            <div class="rifa-entrega-top">

                <div>
                    <span class="admin-eyebrow">
                        Jugador responsable
                    </span>

                    <h3>
                        ${escaparHTML(
                            nombreJugador
                        )}
                    </h3>
                </div>

                <span
                    class="rifa-entrega-estado ${claseEstado}"
                >
                    ${escaparHTML(
                        estado
                    )}
                </span>

            </div>


            <div class="rifa-entrega-resumen">

                <div>
                    <span>Participaciones</span>
                    <strong>${participaciones}</strong>
                </div>

                <div>
                    <span>Monto</span>
                    <strong>${formatearDinero(monto)}</strong>
                </div>

                <div>
                    <span>Transferencia</span>
                    <strong>
                        ${formatearFecha(
                            entrega.fecha_entrega ||
                            entrega.fecha_transferencia
                        )}
                    </strong>
                </div>

                <div>
                    <span>N° operación</span>
                    <strong>
                        ${escaparHTML(
                            entrega.numero_operacion ||
                            "No informado"
                        )}
                    </strong>
                </div>

            </div>


            ${
                entrega.observaciones
                    ? `
                        <div class="rifa-entrega-observacion">
                            <strong>Observaciones:</strong>
                            ${escaparHTML(
                                entrega.observaciones
                            )}
                        </div>
                      `
                    : ""
            }


            <div class="rifa-compradores-bloque">

                <div class="rifa-compradores-titulo">
                    <strong>Compradores</strong>
                    <span>
                        ${compradores.length}
                        ${
                            compradores.length === 1
                                ? "comprador"
                                : "compradores"
                        }
                    </span>
                </div>

                <div class="rifa-compradores-lista">
                    ${listaCompradores}
                </div>

            </div>


            ${revision}


            <div class="acciones rifa-entrega-acciones">

                ${
                    entrega.comprobante_path
                        ? `
                            <button
                                type="button"
                                class="btn btn-comprobante"
                                data-rifa-comprobante="${escaparHTML(
                                    entrega.comprobante_path
                                )}"
                            >
                                Ver comprobante
                            </button>
                          `
                        : `
                            <span class="sin-comprobante">
                                Sin comprobante
                            </span>
                          `
                }

                ${accionesRevision}

            </div>

        </article>
    `;

}


/* ===================================================
   RANKING DE RIFA
=================================================== */

function renderizarRankingRifa(
    aprobadas
) {

    if (!listaRankingRifa) {
        return;
    }


    const acumulado =
        new Map();


    aprobadas.forEach(
        (entrega) => {

            const jugadorId =
                entrega.jugador_id ||
                "sin-jugador";


            const existente =
                acumulado.get(
                    jugadorId
                ) ||
                {
                    jugadorId,
                    participaciones: 0,
                    monto: 0,
                    entregas: 0
                };


            existente.participaciones +=
                obtenerParticipacionesEntregaRifa(
                    entrega
                );


            existente.monto +=
                obtenerMontoEntregaRifa(
                    entrega
                );


            existente.entregas +=
                1;


            acumulado.set(
                jugadorId,
                existente
            );

        }
    );


    const ranking =
        Array.from(
            acumulado.values()
        )
            .sort(
                (
                    a,
                    b
                ) =>
                    b.participaciones -
                    a.participaciones ||
                    b.monto -
                    a.monto
            );


    if (!ranking.length) {

        listaRankingRifa.innerHTML = `
            <div class="vacio">
                Aún no hay entregas aprobadas.
            </div>
        `;


        return;

    }


    listaRankingRifa.innerHTML =
        ranking
            .map(
                (
                    fila,
                    index
                ) => {

                    const jugador =
                        jugadoresTesoreria.find(
                            (item) =>
                                item.id ===
                                fila.jugadorId
                        );


                    const nombre =
                        jugador?.nombre_completo ||
                        jugador?.nombre ||
                        "Jugador";


                    return `
                        <article class="rifa-ranking-fila">

                            <div class="rifa-ranking-posicion">
                                ${index + 1}
                            </div>

                            <div class="rifa-ranking-jugador">
                                <strong>
                                    ${escaparHTML(
                                        nombre
                                    )}
                                </strong>

                                <span>
                                    ${fila.entregas}
                                    ${
                                        fila.entregas === 1
                                            ? "entrega aprobada"
                                            : "entregas aprobadas"
                                    }
                                </span>
                            </div>

                            <div class="rifa-ranking-dato">
                                <span>Participaciones</span>
                                <strong>
                                    ${fila.participaciones}
                                </strong>
                            </div>

                            <div class="rifa-ranking-dato">
                                <span>Recaudado</span>
                                <strong>
                                    ${formatearDinero(
                                        fila.monto
                                    )}
                                </strong>
                            </div>

                        </article>
                    `;

                }
            )
            .join("");

}


/* ===================================================
   RESUMEN FINANCIERO DEL INICIO
=================================================== */
function actualizarResumenFinancieroInicio() {
    const totalDeuda = jugadoresTesoreria.reduce(
        (total, jugador) => total + (Number(jugador.totalPendiente) || 0),
        0
    );

    const jugadoresConDeuda = jugadoresTesoreria.filter(
        (jugador) => (Number(jugador.totalPendiente) || 0) > 0
    ).length;

    const totalEgresos = egresosTesoreria
        .filter((egreso) => normalizarEstado(egreso.estado) === "REGISTRADO")
        .reduce((total, egreso) => total + (Number(egreso.monto) || 0), 0);

    const saldoNeto = totalRecaudacionGeneral - totalEgresos;

    if (statDeudaJugadores) statDeudaJugadores.textContent = formatearDinero(totalDeuda);
    if (statEgresosDashboard) statEgresosDashboard.textContent = formatearDinero(totalEgresos);
    if (statSaldoNeto) statSaldoNeto.textContent = formatearDinero(saldoNeto);
    if (statJugadoresDeuda) statJugadoresDeuda.textContent = jugadoresConDeuda;
}


/* ===================================================
   RECAUDACIÓN GENERAL DEL PANEL
   Pagos aprobados + entregas de rifa aprobadas
=================================================== */

async function actualizarRecaudacionGeneral() {

    const pagosAprobados =
        historialPagosTesoreria.filter(
            (pago) =>
                normalizarEstado(
                    pago.estado
                ) === "APROBADO"
        );


    const totalPagos =
        pagosAprobados.reduce(
            (total, pago) =>
                total +
                (Number(
                    pago.monto_total
                ) || 0),
            0
        );


    const {
        data: entregas,
        error
    } =
        await supabase
            .from(
                "entregas_rifa"
            )
            .select(`
                monto_recaudado,
                estado
            `);


    if (error) {

        console.error(
            "Error cargando recaudación de rifas:",
            error
        );


        totalRecaudacionGeneral = totalPagos;

        if (statRecaudado) {
            statRecaudado.textContent = formatearDinero(totalRecaudacionGeneral);
        }

        actualizarResumenFinancieroInicio();
        return;

    }


    const totalRifas =
        (entregas || [])
            .filter(
                (entrega) => {

                    const estado =
                        normalizarEstado(
                            entrega.estado
                        );


                    return (
                        estado === "APROBADA" ||
                        estado === "APROBADO"
                    );

                }
            )
            .reduce(
                (total, entrega) =>
                    total +
                    (Number(
                        entrega.monto_recaudado
                    ) || 0),
                0
            );


    totalRecaudacionGeneral = totalPagos + totalRifas;

    if (statRecaudado) {
        statRecaudado.textContent = formatearDinero(totalRecaudacionGeneral);
    }

    actualizarResumenFinancieroInicio();

}


/* ===================================================
   DATOS NORMALIZADOS DE RIFA
=================================================== */

function obtenerParticipacionesEntregaRifa(
    entrega
) {

    return Number(
        entrega?.total_participaciones ??
        entrega?.cantidad_participaciones ??
        entrega?.participaciones ??
        entrega?.cantidad ??
        0
    ) || 0;

}


function obtenerMontoEntregaRifa(
    entrega
) {

    return Number(
        entrega?.monto_recaudado ??
        entrega?.monto_total ??
        entrega?.monto ??
        0
    ) || 0;

}


function obtenerNombreCompradorRifa(
    comprador
) {

    return String(
        comprador?.nombre ??
        comprador?.nombre_comprador ??
        comprador?.comprador ??
        "Comprador"
    );

}


function obtenerCantidadCompradorRifa(
    comprador
) {

    return Number(
        comprador?.cantidad ??
        comprador?.participaciones ??
        comprador?.cantidad_participaciones ??
        0
    ) || 0;

}


/* ===================================================
   BOTONES DE ENTREGAS DE RIFA
=================================================== */

function conectarBotonesEntregasRifa() {

    document
        .querySelectorAll(
            "[data-rifa-comprobante]"
        )
        .forEach(
            (boton) => {

                boton.addEventListener(
                    "click",
                    async () => {

                        await abrirComprobanteRifa(
                            boton.dataset
                                .rifaComprobante
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            "[data-aprobar-entrega-rifa]"
        )
        .forEach(
            (boton) => {

                boton.addEventListener(
                    "click",
                    async () => {

                        await aprobarEntregaRifa(
                            boton.dataset
                                .aprobarEntregaRifa
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            "[data-rechazar-entrega-rifa]"
        )
        .forEach(
            (boton) => {

                boton.addEventListener(
                    "click",
                    async () => {

                        await rechazarEntregaRifa(
                            boton.dataset
                                .rechazarEntregaRifa
                        );

                    }
                );

            }
        );

}


/* ===================================================
   COMPROBANTE DE RIFA
=================================================== */

async function abrirComprobanteRifa(
    ruta
) {

    if (!ruta) {

        alert(
            "Esta entrega no tiene comprobante."
        );

        return;

    }


    const {
        data,
        error
    } =
        await supabase.storage
            .from(
                "comprobantes-rifas"
            )
            .createSignedUrl(
                ruta,
                60
            );


    if (
        error ||
        !data?.signedUrl
    ) {

        console.error(
            "Error abriendo comprobante de rifa:",
            error
        );


        alert(
            "No se pudo abrir el comprobante."
        );


        return;

    }


    window.open(
        data.signedUrl,
        "_blank",
        "noopener,noreferrer"
    );

}


/* ===================================================
   APROBAR ENTREGA DE RIFA
=================================================== */

async function aprobarEntregaRifa(
    entregaId
) {

    if (!entregaId) {
        return;
    }


    const confirmar =
        confirm(
            "¿Confirmas que recibiste correctamente esta transferencia de la rifa?"
        );


    if (!confirmar) {
        return;
    }


    const {
        error
    } =
        await supabase.rpc(
            "revisar_entrega_rifa_admin",
            {
                p_entrega_id:
                    entregaId,

                p_estado:
                    "APROBADA",

                p_motivo:
                    null
            }
        );


    if (error) {

        console.error(
            "Error aprobando entrega de rifa:",
            error
        );


        alert(
            error.message ||
            "No se pudo aprobar la entrega."
        );


        return;

    }


    await cargarOperacionesRifa(
        editarRifaId?.value
    );


    await actualizarRecaudacionGeneral();

}


/* ===================================================
   RECHAZAR ENTREGA DE RIFA
=================================================== */

async function rechazarEntregaRifa(
    entregaId
) {

    if (!entregaId) {
        return;
    }


    const motivo =
        prompt(
            "Indica el motivo del rechazo:"
        );


    if (motivo === null) {
        return;
    }


    if (!motivo.trim()) {

        alert(
            "Debes indicar un motivo para rechazar la entrega."
        );


        return;

    }


    const confirmar =
        confirm(
            "¿Confirmas que deseas rechazar esta entrega de rifa?"
        );


    if (!confirmar) {
        return;
    }


    const {
        error
    } =
        await supabase.rpc(
            "revisar_entrega_rifa_admin",
            {
                p_entrega_id:
                    entregaId,

                p_estado:
                    "RECHAZADA",

                p_motivo:
                    motivo.trim()
            }
        );


    if (error) {

        console.error(
            "Error rechazando entrega de rifa:",
            error
        );


        alert(
            error.message ||
            "No se pudo rechazar la entrega."
        );


        return;

    }


    await cargarOperacionesRifa(
        editarRifaId?.value
    );


    await actualizarRecaudacionGeneral();

}


/* ===================================================
   FILA PREMIO EN EDICIÓN
=================================================== */

function agregarFilaPremioEditar(
    nombre = "",
    descripcion = ""
) {

    if (!premiosRifaEditar) {
        return;
    }


    contadorPremiosEditar +=
        1;


    const fila =
        document.createElement(
            "div"
        );


    fila.className =
        "premio-rifa-fila";


    fila.innerHTML = `

        <div class="premio-rifa-numero">
            ${contadorPremiosEditar}
        </div>


        <input
            type="text"
            class="premio-nombre-editar"
            maxlength="150"
            placeholder="Nombre del premio"
            value="${escaparHTML(
                nombre
            )}"
        >


        <input
            type="text"
            class="premio-descripcion premio-descripcion-editar"
            maxlength="250"
            placeholder="Descripción opcional"
            value="${escaparHTML(
                descripcion
            )}"
        >


        <button
            type="button"
            class="btn btn-eliminar-premio"
        >
            Eliminar
        </button>
    `;


    premiosRifaEditar.appendChild(
        fila
    );


    fila
        .querySelector(
            ".btn-eliminar-premio"
        )
        ?.addEventListener(
            "click",
            () => {

                fila.remove();

                renumerarPremiosEditar();

            }
        );

}


/* ===================================================
   RENUMERAR PREMIOS EDICIÓN
=================================================== */

function renumerarPremiosEditar() {

    if (!premiosRifaEditar) {
        return;
    }


    const filas =
        premiosRifaEditar
            .querySelectorAll(
                ".premio-rifa-fila"
            );


    filas.forEach(
        (
            fila,
            index
        ) => {

            const numero =
                fila.querySelector(
                    ".premio-rifa-numero"
                );


            if (numero) {

                numero.textContent =
                    index + 1;

            }

        }
    );


    contadorPremiosEditar =
        filas.length;

}


/* ===================================================
   AGREGAR PREMIO EDICIÓN
=================================================== */

btnAgregarPremioEditar
    ?.addEventListener(
        "click",
        () => {

            agregarFilaPremioEditar();

        }
    );


/* ===================================================
   OBTENER PREMIOS EDICIÓN
=================================================== */

function obtenerPremiosEditar() {

    if (!premiosRifaEditar) {

        return [];

    }


    return Array.from(
        premiosRifaEditar
            .querySelectorAll(
                ".premio-rifa-fila"
            )
    )
        .map(
            (fila) => {

                const nombre =
                    fila
                        .querySelector(
                            ".premio-nombre-editar"
                        )
                        ?.value
                        ?.trim() ||
                    "";


                const descripcion =
                    fila
                        .querySelector(
                            ".premio-descripcion-editar"
                        )
                        ?.value
                        ?.trim() ||
                    "";


                return {
                    nombre,
                    descripcion
                };

            }
        )
        .filter(
            (premio) =>
                premio.nombre
        );

}


/* ===================================================
   GUARDAR CAMBIOS RIFA
=================================================== */

formEditarRifa
    ?.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            mensajeEditarRifa.textContent =
                "";


            const rifaId =
                editarRifaId.value;


            const numero =
                Number(
                    editarRifaNumero.value
                );


            const periodo =
                editarRifaPeriodo.value;


            const valor =
                Number(
                    editarRifaValor.value
                );


            const estado =
                editarRifaEstado.value;


            const fechaInicio =
                editarRifaFechaInicio.value;


            const fechaCierre =
                editarRifaFechaCierre.value ||
                null;


            const premios =
                obtenerPremiosEditar();


            if (!rifaId) {

                mensajeEditarRifa.textContent =
                    "No se pudo identificar la rifa.";

                return;

            }


            if (
                !numero ||
                numero < 1
            ) {

                mensajeEditarRifa.textContent =
                    "El número de rifa no es válido.";

                return;

            }


            if (!periodo) {

                mensajeEditarRifa.textContent =
                    "Debes seleccionar el mes.";

                return;

            }


            if (
                !valor ||
                valor <= 0
            ) {

                mensajeEditarRifa.textContent =
                    "El valor de participación no es válido.";

                return;

            }


            if (!fechaInicio) {

                mensajeEditarRifa.textContent =
                    "Debes indicar la fecha de inicio.";

                return;

            }


            if (
                fechaCierre &&
                fechaCierre <
                    fechaInicio
            ) {

                mensajeEditarRifa.textContent =
                    "La fecha de cierre no puede ser anterior a la fecha de inicio.";

                return;

            }


            if (
                estado === "ACTIVA" &&
                premios.length === 0
            ) {

                mensajeEditarRifa.textContent =
                    "Una rifa activa debe tener al menos un premio.";

                return;

            }


            btnGuardarRifa.disabled =
                true;


            btnGuardarRifa.textContent =
                "Guardando...";


            const {
                error
            } =
                await supabase.rpc(
                    "editar_rifa_admin",
                    {

                        p_rifa_id:
                            rifaId,

                        p_numero:
                            numero,

                        p_periodo:
                            `${periodo}-01`,

                        p_titulo:
                            editarRifaTitulo
                                .value
                                .trim() ||
                            null,

                        p_descripcion:
                            editarRifaDescripcion
                                .value
                                .trim() ||
                            null,

                        p_valor_participacion:
                            valor,

                        p_fecha_inicio:
                            fechaInicio,

                        p_fecha_cierre:
                            fechaCierre,

                        p_estado:
                            estado,

                        p_premios:
                            premios

                    }
                );


            if (error) {

                console.error(
                    "Error editando rifa:",
                    error
                );


                mensajeEditarRifa.textContent =
                    error.message ||
                    "No se pudieron guardar los cambios.";


                btnGuardarRifa.disabled =
                    false;


                btnGuardarRifa.textContent =
                    "Guardar cambios";


                return;

            }


            await cargarRifas();


            const actualizada =
                rifasAdmin.find(
                    (item) =>
                        item.id ===
                        rifaId
                );


            if (actualizada) {

                const tituloActualizado =
                    actualizada.titulo ||
                    `Rifa ${actualizada.numero} · ${
                        capitalizarPrimera(
                            formatearMes(
                                actualizada.periodo
                            )
                        )
                    }`;


                detalleRifaTitulo.textContent =
                    tituloActualizado;

            }


            mensajeEditarRifa.textContent =
                "Cambios guardados correctamente.";


            await cargarOperacionesRifa(
                rifaId
            );


            await cargarSorteoRifa(
                rifaId
            );


            btnGuardarRifa.disabled =
                false;


            btnGuardarRifa.textContent =
                "Guardar cambios";

        }
    );


/* ===================================================
   ELIMINAR RIFA
=================================================== */

btnEliminarRifa
    ?.addEventListener(
        "click",
        async () => {

            const rifaId =
                editarRifaId
                    ?.value;


            if (!rifaId) {

                mensajeEditarRifa.textContent =
                    "No se pudo identificar la rifa.";

                return;

            }


            const rifa =
                rifasAdmin.find(
                    (item) =>
                        item.id ===
                        rifaId
                );


            const nombreRifa =
                rifa?.titulo ||
                (
                    rifa
                        ? `Rifa ${rifa.numero} · ${
                            capitalizarPrimera(
                                formatearMes(
                                    rifa.periodo
                                )
                            )
                        }`
                        : "esta rifa"
                );


            const confirmar =
                window.confirm(
                    `¿Eliminar definitivamente "${nombreRifa}"?\n\n` +
                    "Esta acción solo funcionará si la rifa no tiene entregas registradas."
                );


            if (!confirmar) {

                return;

            }


            btnEliminarRifa.disabled =
                true;


            btnEliminarRifa.textContent =
                "Eliminando...";


            mensajeEditarRifa.textContent =
                "Eliminando rifa...";


            const {
                error
            } =
                await supabase.rpc(
                    "eliminar_rifa_admin",
                    {
                        p_rifa_id:
                            rifaId
                    }
                );


            if (error) {

                console.error(
                    "Error eliminando rifa:",
                    error
                );


                mensajeEditarRifa.textContent =
                    error.message ||
                    "No se pudo eliminar la rifa.";


                btnEliminarRifa.disabled =
                    false;


                btnEliminarRifa.textContent =
                    "Eliminar rifa";


                return;

            }


            await cargarRifas();


            mostrarVistaAdmin(
                "rifas"
            );


            alert(
                "Rifa eliminada correctamente."
            );


            btnEliminarRifa.disabled =
                false;


            btnEliminarRifa.textContent =
                "Eliminar rifa";

        }
    );


/* ===================================================
   VOLVER A RIFAS
=================================================== */

btnVolverRifas
    ?.addEventListener(
        "click",
        () => {

            mostrarVistaAdmin(
                "rifas"
            );

        }
    );


/* ===================================================
   CAPITALIZAR
=================================================== */

function capitalizarPrimera(
    texto
) {

    const valor =
        String(
            texto ||
            ""
        );


    if (!valor) {
        return "";
    }


    return (
        valor
            .charAt(0)
            .toUpperCase()
        +
        valor.slice(1)
    );

}


/* ===================================================
   INICIALIZAR FORMULARIO DE RIFA
=================================================== */

if (premiosRifaAdmin) {

    establecerValoresInicialesRifa();

    agregarFilaPremio();

}


/* ===================================================
   CERRAR SESIÓN
=================================================== */

btnCerrar.addEventListener(
    "click",
    async () => {

        await supabase.auth
            .signOut();


        panelAdmin.style.display =
            "none";


        loginAdmin.style.display =
            "flex";


        mensaje.textContent =
            "";


        mensajeLogin.textContent =
            "";

    }
);


/* ===================================================
   CAMBIOS DE AUTENTICACIÓN
=================================================== */

supabase.auth.onAuthStateChange(
    async (
        event,
        session
    ) => {

        if (
            event ===
            "SIGNED_OUT"
        ) {

            panelAdmin.style.display =
                "none";


            loginAdmin.style.display =
                "flex";


            return;
        }


        if (
            event ===
            "SIGNED_IN" &&
            session &&
            !administradorActual
        ) {

            await cargarPanel();

        }

    }
);


/* ===================================================
   SESIÓN EXISTENTE
=================================================== */

const {
    data: sesionInicial,
    error: errorSesion
} =
    await supabase.auth
        .getSession();


if (errorSesion) {

    console.error(
        "Error obteniendo sesión:",
        errorSesion
    );

}


if (
    sesionInicial?.session
) {

    await cargarPanel();

} else {

    loginAdmin.style.display =
        "flex";


    panelAdmin.style.display =
        "none";

}