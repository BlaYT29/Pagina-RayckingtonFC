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

   RIFAS

=================================================== */



const rifasJugadorLista =

    document.getElementById(

        "rifas-jugador-lista"

    );



let rifasPortal = [];



let entregasRifaJugador = [];



let compradoresRifaJugador = [];



let rankingRifasPortal =
    new Map();



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



    await cargarRifasPortal();



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

   CARGAR RIFAS DEL PORTAL

=================================================== */



async function cargarRifasPortal() {



    if (!rifasJugadorLista || !jugadorActual) {

        return;

    }



    rifasJugadorLista.innerHTML = `

        <div class="portal-vacio">

            Cargando rifas...

        </div>

    `;



    const {

        data: rifas,

        error: errorRifas

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

                premios_rifa (

                    id,

                    orden,

                    nombre,

                    descripcion

                )

            `)

            .in(

                "estado",

                [

                    "ACTIVA",

                    "CERRADA"

                ]

            )

            .order(

                "periodo",

                {

                    ascending: false

                }

            )

            .order(

                "numero",

                {

                    ascending: false

                }

            );



    if (errorRifas) {

        console.error(

            "Error cargando rifas:",

            errorRifas

        );



        rifasJugadorLista.innerHTML = `

            <div class="portal-vacio">

                No se pudieron cargar las rifas.

            </div>

        `;



        return;

    }



    rifasPortal =

        rifas || [];



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

                "jugador_id",

                jugadorActual.id

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



        entregasRifaJugador = [];

    } else {

        entregasRifaJugador =

            entregas || [];

    }



    compradoresRifaJugador = [];



    const idsEntregas =

        entregasRifaJugador

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

                "Error cargando compradores:",

                errorCompradores

            );

        } else {

            compradoresRifaJugador =

                compradores || [];

        }

    }



    await cargarRankingsRifasPortal();



    renderizarRifasPortal();

}



/* ===================================================

   CARGAR RANKINGS DE RIFAS

=================================================== */

async function cargarRankingsRifasPortal() {

    rankingRifasPortal =
        new Map();


    if (!rifasPortal.length) {

        return;

    }


    await Promise.all(

        rifasPortal.map(

            async (rifa) => {

                const {
                    data,
                    error
                } =
                    await supabase.rpc(
                        "obtener_ranking_rifa_portal",
                        {
                            p_rifa_id:
                                rifa.id
                        }
                    );


                if (error) {

                    console.error(
                        `Error cargando ranking de rifa ${rifa.id}:`,
                        error
                    );


                    rankingRifasPortal.set(
                        rifa.id,
                        []
                    );


                    return;

                }


                rankingRifasPortal.set(
                    rifa.id,
                    Array.isArray(data)
                        ? data
                        : []
                );

            }

        )

    );

}



/* ===================================================

   RENDERIZAR RIFAS

=================================================== */



function renderizarRifasPortal() {



    if (!rifasJugadorLista) {

        return;

    }



    const activas =

        rifasPortal.filter(

            (rifa) =>

                normalizarEstado(

                    rifa.estado

                ) === "ACTIVA"

        );



    const cerradasConEntregas =

        rifasPortal.filter(

            (rifa) => {



                if (

                    normalizarEstado(

                        rifa.estado

                    ) !== "CERRADA"

                ) {

                    return false;

                }



                return entregasRifaJugador.some(

                    (entrega) =>

                        entrega.rifa_id ===

                        rifa.id

                );



            }

        );



    let contenido =

        "";



    if (!activas.length) {

        contenido += `

            <div class="portal-vacio">

                No hay rifas activas en este momento.

            </div>

        `;

    } else {

        contenido +=

            activas

                .map(

                    (rifa) =>

                        crearTarjetaRifaPortal(

                            rifa,

                            true

                        )

                )

                .join("");

    }



    if (cerradasConEntregas.length > 0) {

        contenido += `

            <div class="rifa-historial-general-titulo">

                <span class="portal-label">

                    Historial

                </span>

                <h3>

                    Rifas anteriores

                </h3>

            </div>

        `;



        contenido +=

            cerradasConEntregas

                .map(

                    (rifa) =>

                        crearTarjetaRifaPortal(

                            rifa,

                            false

                        )

                )

                .join("");

    }



    rifasJugadorLista.innerHTML =

        contenido;



    conectarEventosRifasPortal();

}



/* ===================================================

   TARJETA RIFA

=================================================== */



function crearTarjetaRifaPortal(

    rifa,

    permitirEntrega

) {



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



    const titulo =

        rifa.titulo ||

        `Rifa ${

            rifa.numero

        } · ${

            formatearMesAnio(

                rifa.periodo

            )

        }`;



    const entregas =

        entregasRifaJugador.filter(

            (entrega) =>

                entrega.rifa_id ===

                rifa.id

        );



    const resumen =

        calcularResumenRifaJugador(

            entregas

        );



    const premiosHTML =

        premios.length

            ? premios

                .map(

                    (premio) => `

                        <li>

                            <span class="rifa-premio-orden">

                                ${Number(

                                    premio.orden

                                ) || "-"}

                            </span>

                            <div>

                                <strong>

                                    ${escaparHTML(

                                        premio.nombre

                                    )}

                                </strong>

                                ${

                                    premio.descripcion

                                        ? `

                                            <small>

                                                ${escaparHTML(

                                                    premio.descripcion

                                                )}

                                            </small>

                                          `

                                        : ""

                                }

                            </div>

                        </li>

                    `

                )

                .join("")

            : `

                <li class="rifa-sin-premios">

                    No hay premios informados.

                </li>

              `;



    const rankingHTML =

        crearRankingRifaPortal(

            rifa

        );



    const historialHTML =

        crearHistorialEntregasRifa(

            rifa,

            entregas

        );



    return `

        <article

            class="rifa-jugador-card"

            data-rifa-card="${escaparHTML(

                rifa.id

            )}"

        >



            <div class="rifa-jugador-hero">



                <div>

                    <span class="rifa-estado-badge ${

                        permitirEntrega

                            ? "activa"

                            : "cerrada"

                    }">

                        ${

                            permitirEntrega

                                ? "RIFA ACTIVA"

                                : "RIFA CERRADA"

                        }

                    </span>



                    <h3>

                        ${escaparHTML(

                            titulo

                        )}

                    </h3>



                    ${

                        rifa.descripcion

                            ? `

                                <p>

                                    ${escaparHTML(

                                        rifa.descripcion

                                    )}

                                </p>

                              `

                            : ""

                    }

                </div>



                <div class="rifa-valor-destacado">

                    <span>

                        Cada participación

                    </span>

                    <strong>

                        ${formatearDinero(

                            rifa.valor_participacion

                        )}

                    </strong>

                </div>

            </div>



            <div class="rifa-datos-grid">



                <div>

                    <span>

                        Inicio

                    </span>

                    <strong>

                        ${formatearFecha(

                            rifa.fecha_inicio

                        )}

                    </strong>

                </div>



                <div>

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



                <div>

                    <span>

                        Mis participaciones aprobadas

                    </span>

                    <strong>

                        ${resumen.participacionesAprobadas}

                    </strong>

                </div>



                <div>

                    <span>

                        Recaudación aprobada

                    </span>

                    <strong>

                        ${formatearDinero(

                            resumen.montoAprobado

                        )}

                    </strong>

                </div>



            </div>



            <div class="rifa-premios-bloque">

                <div class="rifa-subtitulo">

                    <span class="portal-label">

                        Premios

                    </span>

                    <h4>

                        Premios de esta rifa

                    </h4>

                </div>



                <ol class="rifa-premios-lista">

                    ${premiosHTML}

                </ol>

            </div>



            ${rankingHTML}



            ${

                permitirEntrega

                    ? crearFormularioEntregaRifa(

                        rifa

                    )

                    : ""

            }



            ${historialHTML}



        </article>

    `;

}



/* ===================================================

   RANKING DE LA RIFA

=================================================== */

function crearRankingRifaPortal(
    rifa
) {

    const ranking =
        rankingRifasPortal.get(
            rifa.id
        ) || [];


    if (!ranking.length) {

        return `
            <section class="rifa-historial-bloque">

                <div class="rifa-subtitulo">

                    <span class="portal-label">
                        Ranking
                    </span>

                    <h4>
                        Ranking de la rifa
                    </h4>

                    <p>
                        Solo se consideran entregas aprobadas por Tesorería.
                    </p>

                </div>

                <div class="portal-vacio rifa-vacio-pequeno">

                    Todavía no hay participaciones aprobadas en esta rifa.

                </div>

            </section>
        `;

    }


    const filas =
        ranking

            .map(

                (fila) => {

                    const posicion =
                        Number(
                            fila.posicion
                        ) || 0;


                    let medalla =
                        "";


                    if (posicion === 1) {

                        medalla =
                            "🥇 ";

                    } else if (posicion === 2) {

                        medalla =
                            "🥈 ";

                    } else if (posicion === 3) {

                        medalla =
                            "🥉 ";

                    }


                    const esJugadorActual =
                        jugadorActual?.id &&
                        fila.jugador_id ===
                            jugadorActual.id;


                    const participaciones =
                        Number(
                            fila.participaciones
                        ) || 0;


                    const entregas =
                        Number(
                            fila.entregas_aprobadas
                        ) || 0;


                    return `
                        <article class="rifa-entrega-card">

                            <div class="rifa-entrega-card-top">

                                <div>

                                    <strong>
                                        ${medalla}#${posicion}
                                        ${escaparHTML(
                                            fila.nombre_jugador ||
                                            "Jugador"
                                        )}
                                        ${
                                            esJugadorActual
                                                ? " · Tú"
                                                : ""
                                        }
                                    </strong>

                                    <span>
                                        ${entregas}
                                        ${
                                            entregas === 1
                                                ? "entrega aprobada"
                                                : "entregas aprobadas"
                                        }
                                    </span>

                                </div>

                                <div class="rifa-entrega-monto">

                                    ${participaciones}
                                    ${
                                        participaciones === 1
                                            ? " participación"
                                            : " participaciones"
                                    }

                                </div>

                            </div>

                            <div class="rifa-entrega-meta">

                                <span>
                                    Recaudado:
                                    ${formatearDinero(
                                        fila.monto_recaudado
                                    )}
                                </span>

                            </div>

                        </article>
                    `;

                }

            )

            .join("");


    return `
        <section class="rifa-historial-bloque">

            <div class="rifa-subtitulo">

                <span class="portal-label">
                    Rendimiento
                </span>

                <h4>
                    Ranking de la rifa
                </h4>

                <p>
                    El ranking considera únicamente entregas aprobadas por Tesorería.
                </p>

            </div>

            <div class="rifa-entregas-lista">

                ${filas}

            </div>

        </section>
    `;

}



/* ===================================================

   FORMULARIO ENTREGA

=================================================== */



function crearFormularioEntregaRifa(

    rifa

) {



    return `

        <section class="rifa-entrega-bloque">



            <div class="rifa-subtitulo rifa-entrega-heading">

                <div>

                    <span class="portal-label">

                        Mi entrega

                    </span>

                    <h4>

                        Registrar recaudación

                    </h4>

                    <p>

                        Ingresa a cada comprador con su cantidad de participaciones.

                    </p>

                </div>



                <button

                    type="button"

                    class="btn btn-secondary btn-toggle-entrega-rifa"

                    data-toggle-entrega-rifa="${escaparHTML(

                        rifa.id

                    )}"

                >

                    Registrar entrega

                </button>

            </div>



            <form

                class="form-entrega-rifa"

                data-form-entrega-rifa="${escaparHTML(

                    rifa.id

                )}"

                hidden

            >



                <div

                    class="compradores-rifa"

                    data-compradores-rifa="${escaparHTML(

                        rifa.id

                    )}"

                >

                    ${crearFilaCompradorRifaHTML()}

                </div>



                <button

                    type="button"

                    class="btn-agregar-comprador"

                    data-agregar-comprador="${escaparHTML(

                        rifa.id

                    )}"

                >

                    + Agregar comprador

                </button>



                <div class="rifa-resumen-entrega">



                    <div>

                        <span>

                            Participaciones

                        </span>

                        <strong

                            data-total-participaciones="${escaparHTML(

                                rifa.id

                            )}"

                        >

                            1

                        </strong>

                    </div>



                    <div>

                        <span>

                            Monto a entregar

                        </span>

                        <strong

                            data-total-monto-rifa="${escaparHTML(

                                rifa.id

                            )}"

                        >

                            ${formatearDinero(

                                rifa.valor_participacion

                            )}

                        </strong>

                    </div>



                </div>



                <div class="form-grid">



                    <div class="form-group">

                        <label>

                            Fecha de transferencia

                        </label>

                        <input

                            type="date"

                            name="fecha_transferencia"

                            max="${obtenerFechaHoy()}"

                            value="${obtenerFechaHoy()}"

                            required

                        >

                    </div>



                    <div class="form-group">

                        <label>

                            Número de operación

                        </label>

                        <input

                            type="text"

                            name="numero_operacion"

                            maxlength="100"

                            placeholder="Opcional"

                        >

                    </div>



                </div>



                <div class="form-grid">



                    <div class="form-group">

                        <label>

                            Comprobante

                        </label>

                        <input

                            type="file"

                            name="comprobante"

                            accept="image/*,.pdf"

                            required

                        >

                    </div>



                    <div class="form-group">

                        <label>

                            Observaciones

                        </label>

                        <input

                            type="text"

                            name="observaciones"

                            maxlength="250"

                            placeholder="Opcional"

                        >

                    </div>



                </div>



                <button

                    type="submit"

                    class="btn btn-primary btn-enviar-entrega-rifa"

                >

                    Enviar entrega

                </button>



                <div

                    class="mensaje-rifa-jugador"

                    data-mensaje-rifa="${escaparHTML(

                        rifa.id

                    )}"

                ></div>



            </form>

        </section>

    `;

}



/* ===================================================

   FILA COMPRADOR

=================================================== */



function crearFilaCompradorRifaHTML() {



    return `

        <div class="comprador-rifa-fila">



            <div class="form-group comprador-nombre-grupo">

                <label>

                    Nombre comprador

                </label>

                <input

                    type="text"

                    class="comprador-rifa-nombre"

                    maxlength="150"

                    placeholder="Ej: Juan Pérez"

                    required

                >

            </div>



            <div class="form-group comprador-cantidad-grupo">

                <label>

                    Participaciones

                </label>

                <input

                    type="number"

                    class="comprador-rifa-cantidad"

                    min="1"

                    max="100"

                    value="1"

                    required

                >

            </div>



            <button

                type="button"

                class="btn-eliminar-comprador"

                aria-label="Eliminar comprador"

                title="Eliminar comprador"

            >

                ×

            </button>



        </div>

    `;

}



/* ===================================================

   EVENTOS RIFAS

=================================================== */



function conectarEventosRifasPortal() {



    document

        .querySelectorAll(

            "[data-toggle-entrega-rifa]"

        )

        .forEach(

            (boton) => {



                boton.addEventListener(

                    "click",

                    () => {



                        const rifaId =

                            boton.dataset

                                .toggleEntregaRifa;



                        const form =

                            document.querySelector(

                                `[data-form-entrega-rifa="${rifaId}"]`

                            );



                        if (!form) {

                            return;

                        }



                        form.hidden =

                            !form.hidden;



                        boton.textContent =

                            form.hidden

                                ? "Registrar entrega"

                                : "Ocultar formulario";



                        if (!form.hidden) {

                            form.scrollIntoView({

                                behavior: "smooth",

                                block: "nearest"

                            });

                        }



                    }

                );



            }

        );



    document

        .querySelectorAll(

            "[data-agregar-comprador]"

        )

        .forEach(

            (boton) => {



                boton.addEventListener(

                    "click",

                    () => {



                        const rifaId =

                            boton.dataset

                                .agregarComprador;



                        const contenedor =

                            document.querySelector(

                                `[data-compradores-rifa="${rifaId}"]`

                            );



                        if (!contenedor) {

                            return;

                        }



                        contenedor.insertAdjacentHTML(

                            "beforeend",

                            crearFilaCompradorRifaHTML()

                        );



                        conectarEventosFilasCompradores(

                            rifaId

                        );



                        actualizarResumenEntregaRifa(

                            rifaId

                        );



                    }

                );



            }

        );



    document

        .querySelectorAll(

            "[data-form-entrega-rifa]"

        )

        .forEach(

            (form) => {



                const rifaId =

                    form.dataset

                        .formEntregaRifa;



                conectarEventosFilasCompradores(

                    rifaId

                );



                form.addEventListener(

                    "submit",

                    async (event) => {



                        event.preventDefault();



                        await registrarEntregaRifa(

                            rifaId,

                            form

                        );



                    }

                );



            }

        );



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

}



/* ===================================================

   EVENTOS FILAS COMPRADORES

=================================================== */



function conectarEventosFilasCompradores(

    rifaId

) {



    const contenedor =

        document.querySelector(

            `[data-compradores-rifa="${rifaId}"]`

        );



    if (!contenedor) {

        return;

    }



    contenedor

        .querySelectorAll(

            ".comprador-rifa-cantidad"

        )

        .forEach(

            (input) => {



                if (

                    input.dataset

                        .eventoResumen ===

                    "1"

                ) {

                    return;

                }



                input.dataset

                    .eventoResumen =

                    "1";



                input.addEventListener(

                    "input",

                    () => {



                        actualizarResumenEntregaRifa(

                            rifaId

                        );



                    }

                );



            }

        );



    contenedor

        .querySelectorAll(

            ".btn-eliminar-comprador"

        )

        .forEach(

            (boton) => {



                if (

                    boton.dataset

                        .eventoEliminar ===

                    "1"

                ) {

                    return;

                }



                boton.dataset

                    .eventoEliminar =

                    "1";



                boton.addEventListener(

                    "click",

                    () => {



                        const filas =

                            contenedor

                                .querySelectorAll(

                                    ".comprador-rifa-fila"

                                );



                        if (filas.length <= 1) {

                            alert(

                                "Debe existir al menos un comprador."

                            );



                            return;

                        }



                        boton

                            .closest(

                                ".comprador-rifa-fila"

                            )

                            ?.remove();



                        actualizarResumenEntregaRifa(

                            rifaId

                        );



                    }

                );



            }

        );

}



/* ===================================================

   RESUMEN ENTREGA

=================================================== */



function actualizarResumenEntregaRifa(

    rifaId

) {



    const rifa =

        rifasPortal.find(

            (item) =>

                item.id ===

                rifaId

        );



    if (!rifa) {

        return;

    }



    const contenedor =

        document.querySelector(

            `[data-compradores-rifa="${rifaId}"]`

        );



    if (!contenedor) {

        return;

    }



    const total =

        Array.from(

            contenedor

                .querySelectorAll(

                    ".comprador-rifa-cantidad"

                )

        )

            .reduce(

                (

                    acumulado,

                    input

                ) =>

                    acumulado +

                    Math.max(

                        0,

                        Number(

                            input.value

                        ) || 0

                    ),

                0

            );



    const monto =

        total *

        (

            Number(

                rifa.valor_participacion

            ) || 0

        );



    const totalElemento =

        document.querySelector(

            `[data-total-participaciones="${rifaId}"]`

        );



    const montoElemento =

        document.querySelector(

            `[data-total-monto-rifa="${rifaId}"]`

        );



    if (totalElemento) {

        totalElemento.textContent =

            total;

    }



    if (montoElemento) {

        montoElemento.textContent =

            formatearDinero(

                monto

            );

    }

}



/* ===================================================

   REGISTRAR ENTREGA RIFA

=================================================== */



async function registrarEntregaRifa(

    rifaId,

    form

) {



    const rifa =

        rifasPortal.find(

            (item) =>

                item.id ===

                rifaId

        );



    if (

        !rifa ||

        normalizarEstado(

            rifa.estado

        ) !== "ACTIVA"

    ) {

        return;

    }



    const mensaje =

        form.querySelector(

            `[data-mensaje-rifa="${rifaId}"]`

        );



    const boton =

        form.querySelector(

            '.btn-enviar-entrega-rifa'

        );



    const filas =

        Array.from(

            form.querySelectorAll(

                ".comprador-rifa-fila"

            )

        );



    const compradores = [];



    for (const fila of filas) {



        const nombre =

            fila

                .querySelector(

                    ".comprador-rifa-nombre"

                )

                ?.value

                ?.trim() ||

            "";



        const cantidad =

            Number(

                fila

                    .querySelector(

                        ".comprador-rifa-cantidad"

                    )

                    ?.value

            );



        if (!nombre) {

            mensaje.textContent =

                "Debes ingresar el nombre de todos los compradores.";



            return;

        }



        if (

            !Number.isInteger(

                cantidad

            ) ||

            cantidad < 1 ||

            cantidad > 100

        ) {

            mensaje.textContent =

                "Cada comprador debe tener entre 1 y 100 participaciones.";



            return;

        }



        compradores.push({

            nombre,

            cantidad

        });



    }



    if (!compradores.length) {

        mensaje.textContent =

            "Debes registrar al menos un comprador.";



        return;

    }



    const fechaTransferencia =

        form.elements

            .fecha_transferencia

            ?.value;



    if (!fechaTransferencia) {

        mensaje.textContent =

            "Debes indicar la fecha de transferencia.";



        return;

    }



    if (

        fechaTransferencia >

        obtenerFechaHoy()

    ) {

        mensaje.textContent =

            "La fecha de transferencia no puede ser futura.";



        return;

    }



    const archivo =

        form.elements

            .comprobante

            ?.files?.[0];



    if (!archivo) {

        mensaje.textContent =

            "Debes adjuntar el comprobante.";



        return;

    }



    if (

        archivo.size >

        10 * 1024 * 1024

    ) {

        mensaje.textContent =

            "El comprobante no puede superar los 10 MB.";



        return;

    }



    if (!usuarioActual) {

        mensaje.textContent =

            "Tu sesión expiró. Vuelve a iniciar sesión.";



        return;

    }



    boton.disabled =

        true;



    boton.textContent =

        "Enviando...";



    mensaje.textContent =

        "Subiendo comprobante...";



    const entregaId =

        crypto.randomUUID();



    const extension =

        obtenerExtensionArchivo(

            archivo.name

        );



    const rutaComprobante =

        `${usuarioActual.id}/${entregaId}/comprobante.${extension}`;



    const {

        error: errorArchivo

    } =

        await supabase.storage

            .from(

                "comprobantes-rifas"

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

            "Error comprobante rifa:",

            errorArchivo

        );



        mensaje.textContent =

            "No se pudo subir el comprobante.";



        restaurarBotonEntregaRifa(

            boton

        );



        return;

    }



    mensaje.textContent =

        "Registrando entrega...";



    const {

        error

    } =

        await supabase.rpc(

            "registrar_entrega_rifa_portal",

            {

                p_entrega_id:

                    entregaId,

                p_rifa_id:

                    rifaId,

                p_fecha_transferencia:

                    fechaTransferencia,

                p_numero_operacion:

                    form.elements

                        .numero_operacion

                        ?.value

                        ?.trim() ||

                    null,

                p_comprobante_path:

                    rutaComprobante,

                p_observaciones:

                    form.elements

                        .observaciones

                        ?.value

                        ?.trim() ||

                    null,

                p_compradores:

                    compradores

            }

        );



    if (error) {

        console.error(

            "Error registrando entrega de rifa:",

            error

        );



        await supabase.storage

            .from(

                "comprobantes-rifas"

            )

            .remove([

                rutaComprobante

            ]);



        mensaje.textContent =

            error.message ||

            "No se pudo registrar la entrega.";



        restaurarBotonEntregaRifa(

            boton

        );



        return;

    }



    mensaje.textContent =

        "Entrega enviada correctamente. Quedó pendiente de revisión.";



    form.reset();



    await cargarRifasPortal();



}



/* ===================================================

   RESTAURAR BOTÓN ENTREGA

=================================================== */



function restaurarBotonEntregaRifa(

    boton

) {



    if (!boton) {

        return;

    }



    boton.disabled =

        false;



    boton.textContent =

        "Enviar entrega";

}



/* ===================================================

   HISTORIAL DE ENTREGAS

=================================================== */



function crearHistorialEntregasRifa(

    rifa,

    entregas

) {



    if (!entregas.length) {

        return `

            <section class="rifa-historial-bloque">

                <div class="rifa-subtitulo">

                    <span class="portal-label">

                        Historial

                    </span>

                    <h4>

                        Mis entregas

                    </h4>

                </div>



                <div class="portal-vacio rifa-vacio-pequeno">

                    Todavía no has registrado entregas para esta rifa.

                </div>

            </section>

        `;

    }



    return `

        <section class="rifa-historial-bloque">



            <div class="rifa-subtitulo">

                <span class="portal-label">

                    Historial

                </span>

                <h4>

                    Mis entregas

                </h4>

            </div>



            <div class="rifa-entregas-lista">

                ${

                    entregas

                        .map(

                            (entrega) =>

                                crearTarjetaEntregaRifa(

                                    rifa,

                                    entrega

                                )

                        )

                        .join("")

                }

            </div>



        </section>

    `;

}



/* ===================================================

   TARJETA ENTREGA

=================================================== */



function crearTarjetaEntregaRifa(

    rifa,

    entrega

) {



    const estado =

        normalizarEstado(

            entrega.estado

        ) ||

        "PENDIENTE";



    const claseEstado =

        estado === "APROBADA" ||

        estado === "APROBADO"

            ? "aprobada"

            : estado === "RECHAZADA" ||

              estado === "RECHAZADO"

                ? "rechazada"

                : "pendiente";



    const compradores =

        compradoresRifaJugador.filter(

            (comprador) =>

                comprador.entrega_id ===

                entrega.id

        );



    const participaciones =

        obtenerParticipacionesEntrega(

            entrega,

            compradores

        );



    const monto =

        obtenerMontoEntrega(

            entrega,

            participaciones,

            rifa

        );



    const compradoresHTML =

        compradores.length

            ? `

                <div class="rifa-compradores-historial">

                    ${

                        compradores

                            .map(

                                (comprador) => `

                                    <span>

                                        ${escaparHTML(

                                            obtenerNombreComprador(

                                                comprador

                                            )

                                        )}

                                        · ${obtenerCantidadComprador(

                                            comprador

                                        )}

                                    </span>

                                `

                            )

                            .join("")

                    }

                </div>

              `

            : "";



    return `

        <article class="rifa-entrega-card">



            <div class="rifa-entrega-card-top">



                <div>

                    <strong>

                        ${participaciones}

                        ${

                            participaciones === 1

                                ? "participación"

                                : "participaciones"

                        }

                    </strong>

                    <span>

                        ${formatearFecha(

                            entrega.fecha_entrega ||

                            entrega.fecha_transferencia ||

                            entrega.created_at

                                ?.slice(

                                    0,

                                    10

                                )

                        )}

                    </span>

                </div>



                <div class="rifa-entrega-monto">

                    ${formatearDinero(

                        monto

                    )}

                </div>



            </div>



            <div class="rifa-entrega-meta">



                <span class="rifa-entrega-estado ${claseEstado}">

                    ${escaparHTML(

                        estado

                    )}

                </span>



                ${

                    entrega.numero_operacion

                        ? `

                            <span>

                                Operación:

                                ${escaparHTML(

                                    entrega.numero_operacion

                                )}

                            </span>

                          `

                        : ""

                }



            </div>



            ${compradoresHTML}



            ${

                entrega.motivo_rechazo

                    ? `

                        <div class="rifa-rechazo-motivo">

                            <strong>

                                Motivo del rechazo:

                            </strong>

                            ${escaparHTML(

                                entrega.motivo_rechazo

                            )}

                        </div>

                      `

                    : ""

            }



            ${

                entrega.observaciones

                    ? `

                        <div class="rifa-entrega-observacion">

                            ${escaparHTML(

                                entrega.observaciones

                            )}

                        </div>

                      `

                    : ""

            }



            ${

                entrega.comprobante_path

                    ? `

                        <button

                            type="button"

                            class="btn btn-secondary btn-comprobante-rifa"

                            data-rifa-comprobante="${escaparHTML(

                                entrega.comprobante_path

                            )}"

                        >

                            Ver comprobante

                        </button>

                      `

                    : ""

            }



        </article>

    `;

}



/* ===================================================

   RESUMEN RIFA JUGADOR

=================================================== */



function calcularResumenRifaJugador(

    entregas

) {



    let participacionesAprobadas =

        0;



    let montoAprobado =

        0;



    entregas.forEach(

        (entrega) => {



            const estado =

                normalizarEstado(

                    entrega.estado

                );



            if (

                estado !== "APROBADA" &&

                estado !== "APROBADO"

            ) {

                return;

            }



            const compradores =

                compradoresRifaJugador.filter(

                    (comprador) =>

                        comprador.entrega_id ===

                        entrega.id

                );



            const cantidad =

                obtenerParticipacionesEntrega(

                    entrega,

                    compradores

                );



            participacionesAprobadas +=

                cantidad;



            montoAprobado +=

                obtenerMontoEntrega(

                    entrega,

                    cantidad,

                    rifasPortal.find(

                        (rifa) =>

                            rifa.id ===

                            entrega.rifa_id

                    )

                );



        }

    );



    return {

        participacionesAprobadas,

        montoAprobado

    };

}



/* ===================================================

   DATOS FLEXIBLES DE RIFA

=================================================== */



function obtenerParticipacionesEntrega(

    entrega,

    compradores = []

) {



    const directo =

        Number(

            entrega

                ?.total_participaciones ??

            entrega

                ?.cantidad_participaciones ??

            entrega

                ?.participaciones ??

            entrega

                ?.cantidad

        );



    if (

        Number.isFinite(

            directo

        ) &&

        directo >= 0

    ) {

        return directo;

    }



    return compradores.reduce(

        (

            total,

            comprador

        ) =>

            total +

            obtenerCantidadComprador(

                comprador

            ),

        0

    );

}



function obtenerMontoEntrega(

    entrega,

    participaciones,

    rifa

) {



    const directo =

        Number(

            entrega

                ?.monto_recaudado ??

            entrega

                ?.monto_total ??

            entrega

                ?.monto

        );



    if (

        Number.isFinite(

            directo

        ) &&

        directo >= 0

    ) {

        return directo;

    }



    return (

        Number(

            participaciones

        ) || 0

    ) *

    (

        Number(

            rifa

                ?.valor_participacion

        ) || 0

    );

}



function obtenerNombreComprador(

    comprador

) {



    return String(

        comprador

            ?.nombre ??

        comprador

            ?.nombre_comprador ??

        comprador

            ?.comprador ??

        "Comprador"

    );

}



function obtenerCantidadComprador(

    comprador

) {



    return Number(

        comprador

            ?.cantidad ??

        comprador

            ?.participaciones ??

        comprador

            ?.cantidad_participaciones ??

        0

    ) || 0;

}



/* ===================================================

   COMPROBANTE RIFA

=================================================== */



async function abrirComprobanteRifa(

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

            "Error comprobante rifa:",

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

   AUTOACTUALIZAR PORTAL

   - Al volver a la pestaña, refresca los datos completos.
   - Mientras "Rifas y aportes" esté abierta, revisa la rifa
     cada 15 segundos para reflejar aprobaciones/rechazos
     sin que el jugador tenga que presionar F5.

=================================================== */

let actualizacionPortalEnCurso =
    false;


let ultimaActualizacionPortal =
    0;


const INTERVALO_MINIMO_ACTUALIZACION_PORTAL =
    2500;


function hayFormularioRifaAbierto() {

    return Boolean(
        document.querySelector(
            '.form-entrega-rifa:not([hidden])'
        )
    );

}


async function actualizarPortalAutomaticamente() {

    if (
        document.visibilityState !== "visible" ||
        !jugadorActual ||
        !usuarioActual ||
        actualizacionPortalEnCurso ||
        hayFormularioRifaAbierto()
    ) {

        return;

    }


    const ahora =
        Date.now();


    if (
        ahora -
        ultimaActualizacionPortal <
        INTERVALO_MINIMO_ACTUALIZACION_PORTAL
    ) {

        return;

    }


    actualizacionPortalEnCurso =
        true;


    try {

        await cargarPortal();


        ultimaActualizacionPortal =
            Date.now();

    } catch (error) {

        console.error(
            "Error actualizando automáticamente el portal:",
            error
        );

    } finally {

        actualizacionPortalEnCurso =
            false;

    }

}


document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.visibilityState ===
            "visible"
        ) {

            actualizarPortalAutomaticamente();

        }

    }
);


window.addEventListener(
    "focus",
    () => {

        actualizarPortalAutomaticamente();

    }
);


window.setInterval(
    async () => {

        if (
            document.visibilityState !==
                "visible" ||
            !jugadorActual ||
            !usuarioActual ||
            actualizacionPortalEnCurso ||
            hayFormularioRifaAbierto() ||
            !vistasPortal.aportes
                ?.classList
                .contains(
                    "activa"
                )
        ) {

            return;

        }


        actualizacionPortalEnCurso =
            true;


        try {

            /*
                Para el refresco periódico solo consultamos
                la sección de rifas. Así evitamos recargar
                todo el portal innecesariamente.
            */

            await cargarRifasPortal();


            ultimaActualizacionPortal =
                Date.now();

        } catch (error) {

            console.error(
                "Error actualizando rifas automáticamente:",
                error
            );

        } finally {

            actualizacionPortalEnCurso =
                false;

        }

    },
    15000
);




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