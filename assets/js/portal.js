/* ===================================================
   RAYCKINGTON FC
   PORTAL DEL JUGADOR
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
        SUPABASE_KEY,
        {
            auth: {
                persistSession: true,
                detectSessionInUrl: true
            }
        }
    );


/* ===================================================
   ELEMENTOS GENERALES
=================================================== */

const login =
    document.getElementById(
        "login"
    );


const portal =
    document.getElementById(
        "portal"
    );


const formLogin =
    document.getElementById(
        "form-login"
    );


const mensajeLogin =
    document.getElementById(
        "mensaje-login"
    );


const btnCerrar =
    document.getElementById(
        "btn-cerrar"
    );


/* ===================================================
   MENU
=================================================== */

const menuBotones =
    document.querySelectorAll(
        ".portal-menu-btn"
    );


const portalMenu =
    document.getElementById(
        "portal-menu"
    );


const btnMenuMobile =
    document.getElementById(
        "btn-menu-mobile"
    );


const vistasPortal = {
    inicio:
        document.getElementById(
            "vista-inicio"
        ),

    cuotas:
        document.getElementById(
            "vista-cuotas"
        ),

    pagos:
        document.getElementById(
            "vista-pagos"
        ),

    aportes:
        document.getElementById(
            "vista-aportes"
        ),

    cuenta:
        document.getElementById(
            "vista-cuenta"
        )
};


/* ===================================================
   INICIO
=================================================== */

const saludoJugador =
    document.getElementById(
        "saludo-jugador"
    );


const estadoFinanciero =
    document.getElementById(
        "estado-financiero"
    );


const totalPendiente =
    document.getElementById(
        "total-pendiente"
    );


const totalPagado =
    document.getElementById(
        "total-pagado"
    );


const cantidadPendientes =
    document.getElementById(
        "cantidad-pendientes"
    );


/* ===================================================
   CUOTAS
=================================================== */

const listaCuotas =
    document.getElementById(
        "lista-cuotas"
    );


const cuotasPago =
    document.getElementById(
        "cuotas-pago"
    );


let cuotasJugador = [];

let cuotasPendientesJugador = [];

let cuotasBloqueadasPorRevision =
    new Set();


/* ===================================================
   PAGOS
=================================================== */

const historialPagosJugador =
    document.getElementById(
        "historial-pagos-jugador"
    );


const formPago =
    document.getElementById(
        "form-pago"
    );


const montoTotalInput =
    document.getElementById(
        "monto-total"
    );


const fechaTransferenciaInput =
    document.getElementById(
        "fecha-transferencia"
    );


const numeroOperacionInput =
    document.getElementById(
        "numero-operacion"
    );


const comprobanteInput =
    document.getElementById(
        "comprobante"
    );


const observacionesPagoInput =
    document.getElementById(
        "observaciones-pago"
    );


const mensajePago =
    document.getElementById(
        "mensaje-pago"
    );


let pagosJugador = [];

let relacionesPagoCuota = [];


/* ===================================================
   MI CUENTA
=================================================== */

const nombreJugador =
    document.getElementById(
        "nombre-jugador"
    );


const cuentaEmail =
    document.getElementById(
        "cuenta-email"
    );


const cuentaFechaIngreso =
    document.getElementById(
        "cuenta-fecha-ingreso"
    );


const cuentaEstado =
    document.getElementById(
        "cuenta-estado"
    );


/* ===================================================
   ESTADO GLOBAL
=================================================== */

let jugadorActual =
    null;


let usuarioActual =
    null;


/* ===================================================
   CONFIGURACIÓN INICIAL
=================================================== */

if (montoTotalInput) {

    /*
        El monto lo calcula el sistema según
        las obligaciones seleccionadas.
    */

    montoTotalInput.readOnly =
        true;

}


if (fechaTransferenciaInput) {

    const hoy =
        obtenerFechaHoy();


    fechaTransferenciaInput.max =
        hoy;


    fechaTransferenciaInput.value =
        hoy;

}


/* ===================================================
   LOGIN
=================================================== */

formLogin?.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        mensajeLogin.textContent =
            "Ingresando...";


        const email =
            document
                .getElementById(
                    "email"
                )
                .value
                .trim();


        const password =
            document
                .getElementById(
                    "password"
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
                "Correo o contraseña incorrectos.";


            return;

        }


        mensajeLogin.textContent =
            "";


        await cargarPortal();

    }
);


/* ===================================================
   CARGAR PORTAL
=================================================== */

async function cargarPortal() {

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

        mostrarLogin();

        return;

    }


    usuarioActual =
        usuarioData.user;


    /* ===============================================
       JUGADOR
    =============================================== */

    const {
        data: jugador,
        error: errorJugador
    } =
        await supabase
            .from(
                "jugadores"
            )
            .select(`
                id,
                user_id,
                nombre,
                nombre_completo,
                email,
                estado,
                fecha_ingreso,
                fecha_nacimiento,
                exento_mensualidad
            `)
            .eq(
                "user_id",
                usuarioActual.id
            )
            .single();


    if (
        errorJugador ||
        !jugador
    ) {

        console.error(
            "Jugador no encontrado:",
            errorJugador
        );


        mensajeLogin.textContent =
            "No existe un jugador vinculado a esta cuenta.";


        await supabase.auth
            .signOut();


        mostrarLogin();

        return;

    }


    jugadorActual =
        jugador;


    /* ===============================================
       CUOTAS
    =============================================== */

    const {
        data: cuotas,
        error: errorCuotas
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
                estado,
                created_at
            `)
            .eq(
                "jugador_id",
                jugador.id
            )
            .order(
                "periodo",
                {
                    ascending: false,
                    nullsFirst: false
                }
            );


    if (errorCuotas) {

        console.error(
            "Error cuotas:",
            errorCuotas
        );

    }


    cuotasJugador =
        cuotas || [];


    /* ===============================================
       PAGOS
    =============================================== */

    const {
        data: pagos,
        error: errorPagos
    } =
        await supabase
            .from(
                "pagos"
            )
            .select(`
                id,
                monto_total,
                fecha_transferencia,
                numero_operacion,
                comprobante_path,
                estado,
                observaciones,
                revisado_at,
                motivo_rechazo,
                created_at
            `)
            .eq(
                "jugador_id",
                jugador.id
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (errorPagos) {

        console.error(
            "Error pagos:",
            errorPagos
        );

    }


    pagosJugador =
        pagos || [];


    /* ===============================================
       RELACIONES PAGO / CUOTA
    =============================================== */

    relacionesPagoCuota =
        [];


    const idsPagos =
        pagosJugador
            .map(
                (pago) =>
                    pago.id
            )
            .filter(Boolean);


    if (idsPagos.length > 0) {

        const {
            data: relaciones,
            error: errorRelaciones
        } =
            await supabase
                .from(
                    "pago_cuotas"
                )
                .select(`
                    pago_id,
                    cuota_id,
                    monto_aplicado
                `)
                .in(
                    "pago_id",
                    idsPagos
                );


        if (errorRelaciones) {

            console.error(
                "Error relaciones pago/cuota:",
                errorRelaciones
            );

        } else {

            relacionesPagoCuota =
                relaciones || [];

        }

    }


    /* ===============================================
       CUOTAS PENDIENTES
    =============================================== */

    cuotasPendientesJugador =
        cuotasJugador.filter(
            (cuota) =>
                normalizarEstado(
                    cuota.estado
                ) ===
                "PENDIENTE"
        );


    calcularCuotasEnRevision();


    /* ===============================================
       RENDER
    =============================================== */

    actualizarDatosJugador();

    renderizarResumenFinanciero();

    renderizarCuotas(
        cuotasJugador
    );

    conectarBotonesPagarCuota();

    renderizarCuotasParaPago(
        cuotasPendientesJugador
    );

    renderizarHistorialPagos(
        pagosJugador
    );


    login.style.display =
        "none";


    portal.style.display =
        "block";

}


/* ===================================================
   CUOTAS CON PAGO PENDIENTE DE REVISIÓN
=================================================== */

function calcularCuotasEnRevision() {

    cuotasBloqueadasPorRevision =
        new Set();


    const pagosPendientes =
        new Set(
            pagosJugador
                .filter(
                    (pago) =>
                        normalizarEstado(
                            pago.estado
                        ) ===
                        "PENDIENTE"
                )
                .map(
                    (pago) =>
                        pago.id
                )
        );


    relacionesPagoCuota
        .forEach(
            (relacion) => {

                if (
                    pagosPendientes.has(
                        relacion.pago_id
                    )
                ) {

                    cuotasBloqueadasPorRevision
                        .add(
                            relacion.cuota_id
                        );

                }

            }
        );

}


/* ===================================================
   DATOS DEL JUGADOR
=================================================== */

function actualizarDatosJugador() {

    if (!jugadorActual) {
        return;
    }


    const nombre =
        jugadorActual.nombre_completo ||
        jugadorActual.nombre ||
        "Jugador";


    if (nombreJugador) {

        nombreJugador.textContent =
            nombre;

    }


    if (saludoJugador) {

        saludoJugador.textContent =
            `${obtenerSaludo()}, ${
                obtenerPrimerNombre(
                    jugadorActual.nombre ||
                    nombre
                )
            } 👋`;

    }


    if (cuentaEmail) {

        cuentaEmail.textContent =
            jugadorActual.email ||
            usuarioActual?.email ||
            "No registrado";

    }


    if (cuentaFechaIngreso) {

        cuentaFechaIngreso.textContent =
            jugadorActual.fecha_ingreso
                ? formatearMesAnio(
                    jugadorActual
                        .fecha_ingreso
                )
                : "Jugador antiguo";

    }


    if (cuentaEstado) {

        cuentaEstado.textContent =
            normalizarEstado(
                jugadorActual.estado
            ) ||
            "ACTIVO";

    }

}


/* ===================================================
   RESUMEN FINANCIERO
=================================================== */

function renderizarResumenFinanciero() {

    const pendientes =
        cuotasJugador.filter(
            (cuota) =>
                normalizarEstado(
                    cuota.estado
                ) ===
                "PENDIENTE"
        );


    const pendienteTotal =
        pendientes.reduce(
            (
                total,
                cuota
            ) =>
                total +
                (
                    Number(
                        cuota.monto
                    ) || 0
                ),
            0
        );


    const aprobados =
        pagosJugador.filter(
            (pago) =>
                normalizarEstado(
                    pago.estado
                ) ===
                "APROBADO"
        );


    const pagadoTotal =
        aprobados.reduce(
            (
                total,
                pago
            ) =>
                total +
                (
                    Number(
                        pago.monto_total
                    ) || 0
                ),
            0
        );


    if (totalPendiente) {

        totalPendiente.textContent =
            formatearDinero(
                pendienteTotal
            );

    }


    if (totalPagado) {

        totalPagado.textContent =
            formatearDinero(
                pagadoTotal
            );

    }


    if (cantidadPendientes) {

        cantidadPendientes.textContent =
            pendientes.length;

    }


    if (!estadoFinanciero) {
        return;
    }


    estadoFinanciero.className =
        "estado-financiero";


    if (
        jugadorActual
            ?.exento_mensualidad
    ) {

        estadoFinanciero.textContent =
            "EXENTO";


        estadoFinanciero.classList.add(
            "financiero-exento"
        );


        return;

    }


    if (pendientes.length > 0) {

        estadoFinanciero.textContent =
            "CON DEUDA";


        estadoFinanciero.classList.add(
            "financiero-deuda"
        );

    } else {

        estadoFinanciero.textContent =
            "AL DÍA";


        estadoFinanciero.classList.add(
            "financiero-ok"
        );

    }

}


/* ===================================================
   MOSTRAR CUOTAS
=================================================== */

function renderizarCuotas(
    cuotas
) {

    if (!listaCuotas) {
        return;
    }


    if (!cuotas.length) {

        listaCuotas.innerHTML = `
            <div class="sin-cuotas">
                No tienes obligaciones registradas.
            </div>
        `;


        return;

    }


    listaCuotas.innerHTML =
        cuotas
            .map(
                (cuota) => {

                    const estado =
                        normalizarEstado(
                            cuota.estado
                        ) ||
                        "PENDIENTE";


                    const claseEstado =
                        estado ===
                            "PAGADO"
                            ? "pagado"
                            : "pendiente";


                    const claseCuota =
                        estado ===
                            "PAGADO"
                            ? "cuota-pagada"
                            : "cuota-pendiente";


                    const enRevision =
                        cuotasBloqueadasPorRevision
                            .has(
                                cuota.id
                            );


                    return `
                        <article
                            class="
                                cuota
                                ${claseCuota}
                            "
                        >

                            <h3>
                                ${escaparHTML(
                                    obtenerTituloCuota(
                                        cuota
                                    )
                                )}
                            </h3>


                            <div class="monto">

                                ${formatearDinero(
                                    cuota.monto
                                )}

                            </div>


                            ${
                                cuota
                                    .fecha_vencimiento

                                    ? `
                                        <p>
                                            Vence:
                                            ${formatearFecha(
                                                cuota
                                                    .fecha_vencimiento
                                            )}
                                        </p>
                                      `

                                    : ""
                            }


                            <span
                                class="
                                    estado
                                    ${claseEstado}
                                "
                            >
                                ${escaparHTML(
                                    estado
                                )}
                            </span>


${

    enRevision

        ? `
            <p>
                Pago enviado y
                pendiente de revisión.
            </p>

            <button
                type="button"
                class="btn-pago-revision"
                disabled
            >
                Pago en revisión
            </button>
          `

        : estado === "PENDIENTE"

            ? `
                <button
                    type="button"
                    class="btn-pagar-cuota"
                    data-cuota="${escaparHTML(
                        cuota.id
                    )}"
                >
                    Pagar mensualidad
                </button>
              `

            : ""
}
                        </article>
                    `;

                }
            )
            .join("");

}

/* ===================================================
   BOTÓN PAGAR DESDE MENSUALIDAD
=================================================== */

function conectarBotonesPagarCuota() {

    document
        .querySelectorAll(
            ".btn-pagar-cuota"
        )
        .forEach(
            (boton) => {

                boton.addEventListener(
                    "click",
                    () => {

                        const cuotaId =
                            boton.dataset.cuota;


                        mostrarVista(
                            "pagos"
                        );


                        setTimeout(
                            () => {

                                const checkbox =
                                    document.querySelector(
                                        `.cuota-seleccionada[value="${cuotaId}"]`
                                    );


                                if (checkbox) {

                                    document
                                        .querySelectorAll(
                                            ".cuota-seleccionada"
                                        )
                                        .forEach(
                                            (item) => {

                                                item.checked =
                                                    false;

                                            }
                                        );


                                    checkbox.checked =
                                        true;


                                    actualizarMontoSeleccionado();

                                }


                                document
                                    .querySelector(
                                        ".registrar-pago-card"
                                    )
                                    ?.scrollIntoView({
                                        behavior:
                                            "smooth",

                                        block:
                                            "start"
                                    });

                            },
                            150
                        );

                    }
                );

            }
        );

}


/* ===================================================
   CUOTAS PARA PAGAR
=================================================== */

function renderizarCuotasParaPago(
    cuotas
) {

    if (!cuotasPago) {
        return;
    }


    const disponibles =
        cuotas.filter(
            (cuota) =>
                !cuotasBloqueadasPorRevision
                    .has(
                        cuota.id
                    )
        );


    if (!cuotas.length) {

        cuotasPago.innerHTML = `
            <div class="portal-vacio">
                No tienes obligaciones pendientes.
            </div>
        `;


        actualizarMontoSeleccionado();

        return;

    }


    if (!disponibles.length) {

        cuotasPago.innerHTML = `
            <div class="portal-vacio">
                Tus obligaciones pendientes ya tienen
                un pago enviado y están siendo revisadas
                por Tesorería.
            </div>
        `;


        actualizarMontoSeleccionado();

        return;

    }


    cuotasPago.innerHTML =
        disponibles
            .map(
                (cuota) => {

                    return `
                        <label
                            class="cuota-pago-opcion"
                        >

                            <input
                                type="checkbox"
                                class="cuota-seleccionada"
                                value="${escaparHTML(
                                    cuota.id
                                )}"
                                data-monto="${Number(
                                    cuota.monto
                                ) || 0}"
                            >


                            <span>

                                <strong>
                                    ${escaparHTML(
                                        obtenerTituloCuota(
                                            cuota
                                        )
                                    )}
                                </strong>

                                <span>
                                    ${formatearDinero(
                                        cuota.monto
                                    )}

                                    ${
                                        cuota
                                            .fecha_vencimiento

                                            ? ` · Vence ${
                                                formatearFecha(
                                                    cuota
                                                        .fecha_vencimiento
                                                )
                                            }`

                                            : ""
                                    }
                                </span>

                            </span>

                        </label>
                    `;

                }
            )
            .join("");


    cuotasPago
        .querySelectorAll(
            ".cuota-seleccionada"
        )
        .forEach(
            (checkbox) => {

                checkbox.addEventListener(
                    "change",
                    actualizarMontoSeleccionado
                );

            }
        );


    actualizarMontoSeleccionado();

}


/* ===================================================
   MONTO SELECCIONADO
=================================================== */

function actualizarMontoSeleccionado() {

    if (!montoTotalInput) {
        return;
    }


    const seleccionadas =
        document.querySelectorAll(
            ".cuota-seleccionada:checked"
        );


    let total =
        0;


    seleccionadas.forEach(
        (checkbox) => {

            total +=
                Number(
                    checkbox
                        .dataset
                        .monto
                ) || 0;

        }
    );


    montoTotalInput.value =
        total > 0
            ? total
            : "";

}


/* ===================================================
   HISTORIAL DE PAGOS
=================================================== */

function renderizarHistorialPagos(
    pagos
) {

    if (!historialPagosJugador) {
        return;
    }


    if (!pagos.length) {

        historialPagosJugador.innerHTML = `
            <div class="portal-vacio">
                Todavía no tienes pagos registrados.
            </div>
        `;


        return;

    }


    historialPagosJugador.innerHTML =
        pagos
            .map(
                (pago) => {

                    const estado =
                        normalizarEstado(
                            pago.estado
                        ) ||
                        "PENDIENTE";


                    let claseEstado =
                        "pendiente";


                    if (
                        estado ===
                        "APROBADO"
                    ) {

                        claseEstado =
                            "pagado";

                    } else if (
                        estado ===
                        "RECHAZADO"
                    ) {

                        claseEstado =
                            "rechazado";

                    }


                    let textoEstado =
                        "En revisión por Tesorería";


                    if (
                        estado ===
                        "APROBADO"
                    ) {

                        textoEstado =
                            "Validado por Tesorería";

                    }


                    if (
                        estado ===
                        "RECHAZADO"
                    ) {

                        textoEstado =
                            "Rechazado por Tesorería";

                    }


                    return `
                        <article
                            class="pago-historial"
                        >

                            <div
                                class="pago-historial-top"
                            >

                                <div>

                                    <h4>
                                        Transferencia
                                    </h4>

                                    <span
                                        class="pago-historial-fecha"
                                    >
                                        ${formatearFecha(
                                            pago.fecha_transferencia
                                        )}
                                    </span>

                                </div>


                                <div
                                    class="pago-historial-monto"
                                >
                                    ${formatearDinero(
                                        pago.monto_total
                                    )}
                                </div>

                            </div>


                            <div
                                class="pago-historial-datos"
                            >

                                <span
                                    class="
                                        estado
                                        ${claseEstado}
                                    "
                                >
                                    ${estado}
                                </span>


                                <span
                                    class="pago-historial-fecha"
                                >
                                    ${textoEstado}
                                </span>


                                ${
                                    pago.numero_operacion

                                        ? `
                                            <span
                                                class="pago-historial-fecha"
                                            >
                                                Operación:
                                                ${escaparHTML(
                                                    pago.numero_operacion
                                                )}
                                            </span>
                                          `

                                        : ""
                                }

                            </div>


                            ${
                                estado ===
                                    "RECHAZADO" &&
                                pago.motivo_rechazo

                                    ? `
                                        <div
                                            class="motivo-rechazo-jugador"
                                        >
                                            <strong>
                                                Motivo del rechazo:
                                            </strong>

                                            ${escaparHTML(
                                                pago.motivo_rechazo
                                            )}
                                        </div>
                                      `

                                    : ""
                            }


                            ${
                                pago.observaciones

                                    ? `
                                        <div
                                            class="motivo-rechazo-jugador"
                                            style="
                                                border-left-color:#41566f;
                                                color:#aebccd;
                                                background:#0d1a28;
                                            "
                                        >
                                            <strong>
                                                Observación enviada:
                                            </strong>

                                            ${escaparHTML(
                                                pago.observaciones
                                            )}
                                        </div>
                                      `

                                    : ""
                            }


                            ${
                                pago.comprobante_path

                                    ? `
                                        <div
                                            class="pago-historial-datos"
                                        >

                                            <button
                                                type="button"
                                                class="
                                                    btn
                                                    btn-secondary
                                                    btn-ver-comprobante
                                                "
                                                data-comprobante="${escaparHTML(
                                                    pago.comprobante_path
                                                )}"
                                            >
                                                Ver comprobante
                                            </button>

                                        </div>
                                      `

                                    : ""
                            }

                        </article>
                    `;

                }
            )
            .join("");


    conectarComprobantesJugador();

}


/* ===================================================
   VER COMPROBANTE
=================================================== */

function conectarComprobantesJugador() {

    document
        .querySelectorAll(
            ".btn-ver-comprobante"
        )
        .forEach(
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

}


/* ===================================================
   ABRIR COMPROBANTE
=================================================== */

async function abrirComprobante(
    ruta
) {

    if (!ruta) {
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


    if (
        error ||
        !data?.signedUrl
    ) {

        console.error(
            "Error comprobante:",
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
   REGISTRAR PAGO
=================================================== */

formPago?.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        if (!jugadorActual) {

            mensajePago.textContent =
                "No se pudo identificar al jugador.";

            return;

        }


        const seleccionadas =
            Array.from(
                document.querySelectorAll(
                    ".cuota-seleccionada:checked"
                )
            );


        if (!seleccionadas.length) {

            mensajePago.textContent =
                "Selecciona al menos una obligación.";

            return;

        }


        const montoEsperado =
            seleccionadas.reduce(
                (
                    total,
                    checkbox
                ) =>
                    total +
                    (
                        Number(
                            checkbox
                                .dataset
                                .monto
                        ) || 0
                    ),
                0
            );


        const montoTotal =
            Number(
                montoTotalInput.value
            );


        if (
            !montoTotal ||
            montoTotal <= 0 ||
            montoTotal !==
                montoEsperado
        ) {

            mensajePago.textContent =
                "El monto no coincide con las obligaciones seleccionadas.";

            return;

        }


        const archivo =
            comprobanteInput
                ?.files?.[0];


        if (!archivo) {

            mensajePago.textContent =
                "Debes adjuntar el comprobante.";

            return;

        }


        /*
            Evitamos archivos exageradamente grandes.
            10 MB máximo.
        */

        if (
            archivo.size >
            10 * 1024 * 1024
        ) {

            mensajePago.textContent =
                "El comprobante no puede superar los 10 MB.";

            return;

        }


        const botonSubmit =
            formPago.querySelector(
                'button[type="submit"]'
            );


        if (botonSubmit) {

            botonSubmit.disabled =
                true;


            botonSubmit.textContent =
                "Registrando...";

        }


        mensajePago.textContent =
            "Registrando pago...";


        /* ===========================================
           USUARIO
        =========================================== */

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

            mensajePago.textContent =
                "Tu sesión expiró. Vuelve a iniciar sesión.";


            restaurarBotonPago(
                botonSubmit
            );


            return;

        }


        const usuario =
            usuarioData.user;


        /* ===========================================
           CREAR ID
        =========================================== */

        const pagoId =
            crypto.randomUUID();


        const extension =
            obtenerExtensionArchivo(
                archivo.name
            );


        const nombreArchivo =
            `comprobante.${extension}`;


        const rutaComprobante =
            `${usuario.id}/${pagoId}/${nombreArchivo}`;


        /* ===========================================
           SUBIR COMPROBANTE
        =========================================== */

        const {
            error: errorArchivo
        } =
            await supabase.storage
                .from(
                    "comprobantes-pagos"
                )
                .upload(
                    rutaComprobante,
                    archivo,
                    {
                        upsert: false
                    }
                );


        if (errorArchivo) {

            console.error(
                "Error archivo:",
                errorArchivo
            );


            mensajePago.textContent =
                "No se pudo subir el comprobante.";


            restaurarBotonPago(
                botonSubmit
            );


            return;

        }


        /* ===========================================
           CREAR PAGO
        =========================================== */

        const {
            error: errorPago
        } =
            await supabase
                .from(
                    "pagos"
                )
                .insert({

                    id:
                        pagoId,

                    jugador_id:
                        jugadorActual.id,

                    monto_total:
                        montoTotal,

                    fecha_transferencia:
                        fechaTransferenciaInput.value,

                    numero_operacion:
                        numeroOperacionInput
                            .value
                            .trim() ||
                        null,

                    comprobante_path:
                        rutaComprobante,

                    estado:
                        "PENDIENTE",

                    observaciones:
                        observacionesPagoInput
                            .value
                            .trim() ||
                        null

                });


        if (errorPago) {

            console.error(
                "Error pago:",
                errorPago
            );


            mensajePago.textContent =
                "No se pudo registrar el pago.";


            restaurarBotonPago(
                botonSubmit
            );


            return;

        }


        /* ===========================================
           RELACIONAR CUOTAS
        =========================================== */

        const detalles =
            seleccionadas.map(
                (checkbox) => ({

                    pago_id:
                        pagoId,

                    cuota_id:
                        checkbox.value,

                    monto_aplicado:
                        Number(
                            checkbox
                                .dataset
                                .monto
                        ) || 0

                })
            );


        const {
            error: errorDetalles
        } =
            await supabase
                .from(
                    "pago_cuotas"
                )
                .insert(
                    detalles
                );


        if (errorDetalles) {

            console.error(
                "Error detalle pago:",
                errorDetalles
            );


            mensajePago.textContent =
                "El pago se registró, pero hubo un problema al asociar las obligaciones.";


            restaurarBotonPago(
                botonSubmit
            );


            return;

        }


        /* ===========================================
           ÉXITO
        =========================================== */

        mensajePago.textContent =
            "Pago registrado correctamente. Quedó pendiente de revisión por Tesorería.";


        formPago.reset();


        if (fechaTransferenciaInput) {

            fechaTransferenciaInput.value =
                obtenerFechaHoy();

        }


        actualizarMontoSeleccionado();


        restaurarBotonPago(
            botonSubmit
        );


        /*
            Recargamos para que el pago aparezca
            inmediatamente en el historial y las
            cuotas queden bloqueadas mientras
            Tesorería revisa.
        */

        await cargarPortal();


        mostrarVista(
            "pagos"
        );

    }
);


/* ===================================================
   RESTAURAR BOTÓN PAGO
=================================================== */

function restaurarBotonPago(
    boton
) {

    if (!boton) {
        return;
    }


    boton.disabled =
        false;


    boton.textContent =
        "Registrar pago";

}


/* ===================================================
   MENÚ PRINCIPAL
=================================================== */

menuBotones.forEach(
    (boton) => {

        boton.addEventListener(
            "click",
            () => {

                const vista =
                    boton.dataset.vista;


                mostrarVista(
                    vista
                );


                if (portalMenu) {

                    portalMenu.classList.remove(
                        "abierto"
                    );

                }

            }
        );

    }
);


/* ===================================================
   MOSTRAR VISTA
=================================================== */

function mostrarVista(
    nombreVista
) {

    Object.values(
        vistasPortal
    )
        .forEach(
            (vista) => {

                vista?.classList.remove(
                    "activa"
                );

            }
        );


    menuBotones.forEach(
        (boton) => {

            boton.classList.remove(
                "activo"
            );


            if (
                boton.dataset.vista ===
                nombreVista
            ) {

                boton.classList.add(
                    "activo"
                );

            }

        }
    );


    vistasPortal[
        nombreVista
    ]?.classList.add(
        "activa"
    );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* ===================================================
   MENÚ MOBILE
=================================================== */

btnMenuMobile?.addEventListener(
    "click",
    () => {

        portalMenu?.classList.toggle(
            "abierto"
        );

    }
);


/* ===================================================
   DESPLEGABLES RIFAS / APORTES
=================================================== */

document
    .querySelectorAll(
        ".desplegable-header"
    )
    .forEach(
        (boton) => {

            boton.addEventListener(
                "click",
                () => {

                    const tarjeta =
                        boton.closest(
                            ".desplegable-card"
                        );


                    tarjeta?.classList.toggle(
                        "abierto"
                    );

                }
            );

        }
    );


/* ===================================================
   TITULO DE OBLIGACIÓN
=================================================== */

function obtenerTituloCuota(
    cuota
) {

    const concepto =
        String(
            cuota.concepto ||
            ""
        )
            .trim()
            .toUpperCase();


    if (
        concepto ===
            "MENSUALIDAD" &&
        cuota.periodo
    ) {

        return formatearMesAnio(
            cuota.periodo
        );

    }


    if (
        concepto ===
        "SALDO_ANTERIOR"
    ) {

        return "Saldo anterior";

    }


    return String(
        cuota.concepto ||
        "Obligación"
    )
        .replaceAll(
            "_",
            " "
        );

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
   MES Y AÑO
=================================================== */

function formatearMesAnio(
    fecha
) {

    if (!fecha) {

        return "Sin fecha";

    }


    const objetoFecha =
        new Date(
            `${fecha}T00:00:00`
        );


    const texto =
        new Intl.DateTimeFormat(
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


    return (
        texto
            .charAt(0)
            .toUpperCase()
        +
        texto.slice(1)
    );

}


/* ===================================================
   ESTADO
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
   SALUDO
=================================================== */

function obtenerSaludo() {

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
   PRIMER NOMBRE
=================================================== */

function obtenerPrimerNombre(
    nombre
) {

    return String(
        nombre ||
        "Jugador"
    )
        .trim()
        .split(/\s+/)[0];

}


/* ===================================================
   FECHA HOY
=================================================== */

function obtenerFechaHoy() {

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


/* ===================================================
   EXTENSIÓN ARCHIVO
=================================================== */

function obtenerExtensionArchivo(
    nombre
) {

    const partes =
        String(
            nombre ||
            ""
        )
            .split(".");


    if (partes.length < 2) {

        return "bin";

    }


    return partes
        .pop()
        .toLowerCase()
        .replace(
            /[^a-z0-9]/g,
            ""
        )
        ||
        "bin";

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
   CERRAR SESIÓN
=================================================== */

btnCerrar?.addEventListener(
    "click",
    async () => {

        await supabase.auth
            .signOut();


        jugadorActual =
            null;


        usuarioActual =
            null;


        mostrarLogin();

    }
);


/* ===================================================
   MOSTRAR LOGIN
=================================================== */

function mostrarLogin() {

    if (portal) {

        portal.style.display =
            "none";

    }


    if (login) {

        login.style.display =
            "flex";

    }


    mostrarVista(
        "inicio"
    );

}


/* ===================================================
   CAMBIO DE AUTENTICACIÓN
=================================================== */

supabase.auth.onAuthStateChange(
    (
        event
    ) => {

        if (
            event ===
            "SIGNED_OUT"
        ) {

            mostrarLogin();

        }

    }
);


/* ===================================================
   SESIÓN EXISTENTE
=================================================== */

const {
    data: sesionInicial,
    error: errorSesionInicial
} =
    await supabase.auth
        .getSession();


if (errorSesionInicial) {

    console.error(
        "Error obteniendo sesión:",
        errorSesionInicial
    );

}


if (
    sesionInicial?.session
) {

    await cargarPortal();

} else {

    mostrarLogin();

}