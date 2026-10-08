/* ===================================================
   RAYCKINGTON FC
   ADMIN TESORERÍA
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

const vistaPagos =
    document.getElementById(
        "vista-pagos"
    );    


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


const detalleTotalPendiente =
    document.getElementById(
        "detalle-total-pendiente"
    );


const detalleCuotasPendientes =
    document.getElementById(
        "detalle-cuotas-pendientes"
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


    if (errorUsuario) {

        console.error(
            "Error usuario:",
            errorUsuario
        );


        return false;
    }


    const usuario =
        usuarioData?.user;


    if (!usuario) {

        return false;
    }


    const {
        data: admin,
        error
    } =
        await supabase
            .from(
                "administradores"
            )
            .select(
                `
                id,
                user_id,
                nombre,
                estado
                `
            )
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


        return false;
    }


    return Boolean(
        admin
    );

}


/* ===================================================
   CARGAR PANEL
=================================================== */

async function cargarPanel() {

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
            "block";


        mensajeLogin.textContent =
            "Esta cuenta no tiene permisos de Tesorería.";


        return;
    }


    loginAdmin.style.display =
        "none";


    panelAdmin.style.display =
        "block";


    mensajeLogin.textContent =
        "";


await cargarAdministradoresTesoreria();


await Promise.all([
    cargarPagos(),
    cargarJugadores()
]);

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

}
/* ===================================================
   MENU ADMIN
=================================================== */

menuBotones.forEach(
    (boton) => {

        boton.addEventListener(
            "click",
            () => {

                const vista =
                    boton.dataset.vista;


                menuBotones.forEach(
                    (item) =>
                        item.classList.remove(
                            "activo"
                        )
                );


                boton.classList.add(
                    "activo"
                );


vistaResumen.classList.remove(
    "activa"
);

vistaJugadores.classList.remove(
    "activa"
);

vistaDetalleJugador.classList.remove(
    "activa"
);

vistaPagos.classList.remove(
    "activa"
);


if (
    vista ===
    "jugadores"
) {

    vistaJugadores.classList.add(
        "activa"
    );

} else if (
    vista ===
    "pagos"
) {

    vistaPagos.classList.add(
        "activa"
    );

} else {

    vistaResumen.classList.add(
        "activa"
    );

}

            }
        );

    }
);


/* ===================================================
   CARGAR JUGADORES
=================================================== */

async function cargarJugadores() {

    const [
        resultadoJugadores,
        resultadoCuotas,
        resultadoPagos
    ] =
        await Promise.all([

            supabase
                .from(
                    "jugadores"
                )
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
                .order(
                    "nombre_completo",
                    {
                        ascending: true
                    }
                ),


            supabase
                .from(
                    "cuotas"
                )
                .select(`
                    id,
                    jugador_id,
                    concepto,
                    periodo,
                    monto,
                    estado
                `),


            supabase
                .from(
                    "pagos"
                )
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


        listaJugadores.innerHTML = `
            <div class="vacio">
                No se pudieron cargar los jugadores.
            </div>
        `;


        return;
    }


    const jugadores =
        resultadoJugadores.data ||
        [];


    const cuotas =
        resultadoCuotas.data ||
        [];


    const pagos =
        resultadoPagos.data ||
        [];


    jugadoresTesoreria =
        jugadores.map(
            (jugador) => {

                const cuotasJugador =
                    cuotas.filter(
                        (cuota) =>
                            cuota.jugador_id ===
                            jugador.id
                    );


                const cuotasMensuales =
                    cuotasJugador.filter(
                        (cuota) =>
                            cuota.concepto ===
                            "MENSUALIDAD"
                    );


                const pendientes =
                    cuotasMensuales.filter(
                        (cuota) =>
                            normalizarEstado(
                                cuota.estado
                            ) ===
                            "PENDIENTE"
                    );


                const deuda =
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


                const pagosAprobados =
                    pagos.filter(
                        (pago) =>
                            pago.jugador_id ===
                                jugador.id &&
                            normalizarEstado(
                                pago.estado
                            ) ===
                                "APROBADO"
                    );


                const pagado =
                    pagosAprobados.reduce(
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


                let estadoFinanciero =
                    "AL DÍA";


                if (
                    normalizarEstado(
                        jugador.estado
                    ) ===
                    "INACTIVO"
                ) {

                    estadoFinanciero =
                        "INACTIVO";

                } else if (
                    jugador.exento_mensualidad
                ) {

                    estadoFinanciero =
                        "EXENTO";

                } else if (
                    cuotasMensuales.length === 0
                ) {

                    estadoFinanciero =
                        "SIN CUOTAS";

                } else if (
                    pendientes.length > 0
                ) {

                    estadoFinanciero =
                        "CON DEUDA";

                }


                return {

                    ...jugador,

                    totalPagado:
                        pagado,

                    totalPendiente:
                        deuda,

                    cuotasPendientes:
                        pendientes.length,

                    estadoFinanciero

                };

            }
        );


    badgeJugadores.textContent =
        `${jugadoresTesoreria.length} jugadores`;


    renderizarJugadores(
        jugadoresTesoreria
    );

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


                            <div
                                class="jugador-finanzas"
                            >

                                <div
                                    class="jugador-finanza"
                                >

                                    <span>
                                        Pagado
                                    </span>

                                    <strong>
                                        ${formatearDinero(
                                            jugador
                                                .totalPagado
                                        )}
                                    </strong>

                                </div>


                                <div
                                    class="jugador-finanza"
                                >

                                    <span>
                                        Pendiente
                                    </span>

                                    <strong>
                                        ${formatearDinero(
                                            jugador
                                                .totalPendiente
                                        )}
                                    </strong>

                                </div>


                                <div
                                    class="jugador-finanza"
                                >

                                    <span>
                                        Cuotas pendientes
                                    </span>

                                    <strong>
                                        ${
                                            jugador
                                                .cuotasPendientes
                                        }
                                    </strong>

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

                boton.addEventListener(
                    "click",
                    async () => {

                        await abrirDetalleJugador(
                            boton.dataset
                                .verJugador
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


    vistaResumen.classList.remove(
        "activa"
    );


    vistaJugadores.classList.remove(
        "activa"
    );

    vistaDetalleJugador.classList.remove(
    "activa"
);


    vistaDetalleJugador.classList.add(
        "activa"
    );


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
        formatearDinero(
            jugador.totalPagado
        );


    detalleTotalPendiente.textContent =
        formatearDinero(
            jugador.totalPendiente
        );


    detalleCuotasPendientes.textContent =
        jugador.cuotasPendientes;


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
            .eq(
                "concepto",
                "MENSUALIDAD"
            )
            .order(
                "periodo",
                {
                    ascending: true
                }
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
                Este jugador no tiene
                mensualidades registradas.
            </div>
        `;


        return;

    }


    detalleListaCuotas.innerHTML =
        cuotas
            .map(
                (cuota) => {

                    const estado =
                        normalizarEstado(
                            cuota.estado
                        );


                    const estaPagada =
                        estado ===
                        "PAGADO";


                    const claseEstado =
                        estaPagada
                            ? "cuota-pagada"
                            : "cuota-pendiente";


                    return `
                        <article
                            class="cuota-detalle"
                        >

                            <div
                                class="cuota-detalle-periodo"
                            >

                                <strong>
                                    ${
                                        formatearMes(
                                            cuota.periodo
                                        )
                                    }
                                </strong>

                                <span>
                                    Mensualidad
                                </span>

                            </div>


                            <div
                                class="cuota-detalle-dato"
                            >

                                <span>
                                    Monto
                                </span>

                                <strong>
                                    ${
                                        formatearDinero(
                                            cuota.monto
                                        )
                                    }
                                </strong>

                            </div>


                            <div
                                class="cuota-detalle-dato"
                            >

                                <span>
                                    Vencimiento
                                </span>

                                <strong>
                                    ${
                                        formatearFecha(
                                            cuota
                                                .fecha_vencimiento
                                        )
                                    }
                                </strong>

                            </div>


                            <div>

                                <span
                                    class="
                                        cuota-estado
                                        ${claseEstado}
                                    "
                                >
                                    ${estado}
                                </span>

                            </div>

                        </article>
                    `;

                }
            )
            .join("");

}


/* ===================================================
   VOLVER A JUGADORES
=================================================== */

btnVolverJugadores.addEventListener(
    "click",
    () => {

        vistaDetalleJugador
            .classList
            .remove(
                "activa"
            );


        vistaJugadores
            .classList
            .add(
                "activa"
            );

    }
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
            "block";


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
                "block";


            return;
        }


        if (
            event ===
            "SIGNED_IN" &&
            session
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
        "block";


    panelAdmin.style.display =
        "none";

}