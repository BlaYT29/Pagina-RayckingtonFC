/* ===================================================
   RAYCKINGTON FC
   ACTIVACIÓN DE CUENTA DEL JUGADOR
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
   ELEMENTOS
=================================================== */

const form =
    document.getElementById(
        "form-activar"
    );


const passwordInput =
    document.getElementById(
        "password"
    );


const confirmacionInput =
    document.getElementById(
        "password-confirmacion"
    );


const boton =
    document.getElementById(
        "btn-activar"
    );


const mensaje =
    document.getElementById(
        "mensaje-activar"
    );


/* ===================================================
   VARIABLES
=================================================== */

let cuentaDisponible =
    false;


/* ===================================================
   MOSTRAR MENSAJE
=================================================== */

function mostrarMensaje(
    texto,
    tipo = "info"
) {

    if (!mensaje) {
        return;
    }


    mensaje.textContent =
        texto;


    mensaje.dataset.tipo =
        tipo;

}


/* ===================================================
   BLOQUEAR FORMULARIO
=================================================== */

function bloquearFormulario(
    bloquear = true
) {

    if (!boton) {
        return;
    }


    boton.disabled =
        bloquear;


    boton.textContent =
        bloquear
            ? "Activando..."
            : "Activar mi cuenta";

}


/* ===================================================
   PROCESAR CALLBACK DE SUPABASE
=================================================== */

async function procesarCallback() {

    /*
        Dependiendo de la configuración de Supabase,
        la invitación puede volver con:

        ?code=...
        o con una sesión detectada automáticamente.
    */


    const parametros =
        new URLSearchParams(
            window.location.search
        );


    const codigo =
        parametros.get(
            "code"
        );


    if (codigo) {

        const {
            error
        } =
            await supabase.auth
                .exchangeCodeForSession(
                    codigo
                );


        if (error) {

            console.error(
                "Error intercambiando código:",
                error
            );

        }

    }

}


/* ===================================================
   ESPERAR SESIÓN
=================================================== */

async function obtenerSesionInvitacion() {

    /*
        Primero procesamos cualquier código
        que venga desde Supabase.
    */

    await procesarCallback();


    /*
        Intentamos obtener la sesión directamente.
    */

    let {
        data,
        error
    } =
        await supabase.auth
            .getSession();


    if (error) {

        console.error(
            "Error obteniendo sesión:",
            error
        );

    }


    if (data?.session) {

        return data.session;

    }


    /*
        A veces Supabase demora un instante
        en procesar el enlace de invitación.
    */

    await new Promise(
        (resolve) => {

            setTimeout(
                resolve,
                800
            );

        }
    );


    const resultado =
        await supabase.auth
            .getSession();


    if (resultado.error) {

        console.error(
            "Error obteniendo sesión:",
            resultado.error
        );

    }


    return (
        resultado.data?.session ||
        null
    );

}


/* ===================================================
   INICIALIZAR PÁGINA
=================================================== */

async function iniciarActivacion() {

    if (!form) {
        return;
    }


    mostrarMensaje(
        "Verificando invitación..."
    );


    const sesion =
        await obtenerSesionInvitacion();


    if (!sesion) {

        cuentaDisponible =
            false;


        form.style.display =
            "none";


        mostrarMensaje(
            "No pudimos validar la invitación. Abre esta página directamente desde el enlace recibido en tu correo.",
            "error"
        );


        return;

    }


    cuentaDisponible =
        true;


    form.style.display =
        "block";


    mostrarMensaje(
        ""
    );


    /*
        Mostramos el correo asociado
        si está disponible.
    */

    const email =
        sesion.user?.email;


    if (email) {

        console.log(
            "Activando cuenta:",
            email
        );

    }

}


/* ===================================================
   ACTIVAR CUENTA
=================================================== */

form?.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        if (!cuentaDisponible) {

            mostrarMensaje(
                "La invitación no está disponible.",
                "error"
            );

            return;

        }


        const password =
            passwordInput
                .value
                .trim();


        const confirmacion =
            confirmacionInput
                .value
                .trim();


        /* ===========================================
           VALIDAR CONTRASEÑAS
        =========================================== */

        if (
            !password ||
            !confirmacion
        ) {

            mostrarMensaje(
                "Completa ambos campos de contraseña.",
                "error"
            );

            return;

        }


        if (
            password.length <
            8
        ) {

            mostrarMensaje(
                "La contraseña debe tener al menos 8 caracteres.",
                "error"
            );

            return;

        }


        if (
            password !==
            confirmacion
        ) {

            mostrarMensaje(
                "Las contraseñas no coinciden.",
                "error"
            );

            return;

        }


        bloquearFormulario(
            true
        );


        mostrarMensaje(
            "Activando tu cuenta..."
        );


        /* ===========================================
           VERIFICAR SESIÓN NUEVAMENTE
        =========================================== */

        const {
            data: sessionData,
            error: sessionError
        } =
            await supabase.auth
                .getSession();


        if (
            sessionError ||
            !sessionData?.session
        ) {

            console.error(
                "Sesión no disponible:",
                sessionError
            );


            mostrarMensaje(
                "La invitación venció o la sesión ya no es válida. Solicita una nueva invitación.",
                "error"
            );


            bloquearFormulario(
                false
            );


            return;

        }


        /* ===========================================
           GUARDAR NUEVA CONTRASEÑA
        =========================================== */

        const {
            data: usuarioActualizado,
            error: errorPassword
        } =
            await supabase.auth
                .updateUser({
                    password:
                        password
                });


        if (errorPassword) {

            console.error(
                "Error guardando contraseña:",
                errorPassword
            );


            mostrarMensaje(
                errorPassword.message ||
                "No se pudo guardar la contraseña.",
                "error"
            );


            bloquearFormulario(
                false
            );


            return;

        }


        if (
            !usuarioActualizado?.user
        ) {

            mostrarMensaje(
                "No se pudo confirmar la cuenta.",
                "error"
            );


            bloquearFormulario(
                false
            );


            return;

        }


/* ===========================================
   COMPROBAR SI ES ADMINISTRADOR
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

    console.error(
        "Error obteniendo usuario:",
        errorUsuario
    );


    mostrarMensaje(
        "No se pudo comprobar la cuenta.",
        "error"
    );


    bloquearFormulario(
        false
    );


    return;

}


const usuario =
    usuarioData.user;


/* ===========================================
   BUSCAR ADMINISTRADOR
=========================================== */

const {
    data: administrador,
    error: errorAdministrador
} =
    await supabase
        .from(
            "administradores"
        )
        .select(`
            id,
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


if (errorAdministrador) {

    console.error(
        "Error comprobando administrador:",
        errorAdministrador
    );

}


/* ===========================================
   SI ES ADMINISTRADOR
=========================================== */

if (administrador) {

    if (form) {

        form.style.display =
            "none";

    }


    mensaje.innerHTML = `
        <strong>
            Cuenta administrativa activada correctamente ✅
        </strong>

        <br><br>

        Bienvenido/a,
        ${administrador.nombre}.

        <br>

        Entrando al panel de Tesorería...
    `;


    setTimeout(
        () => {

            window.location.href =
                "admin-tesoreria.html";

        },
        1800
    );


    return;

}


/* ===========================================
   SI NO ES ADMIN, VINCULAR COMO JUGADOR
=========================================== */

const {
    error: errorVincular
} =
    await supabase.rpc(
        "vincular_mi_cuenta"
    );


if (errorVincular) {

    console.error(
        "Error vinculando jugador:",
        errorVincular
    );


    mostrarMensaje(
        errorVincular.message ||
        "La cuenta fue creada, pero no pudimos vincularla con tu ficha de jugador.",
        "error"
    );


    bloquearFormulario(
        false
    );


    return;

}
        


        /* ===========================================
           ÉXITO
        =========================================== */

        if (form) {

            form.style.display =
                "none";

        }


        mensaje.innerHTML = `
            <strong>
                Cuenta activada correctamente ✅
            </strong>

            <br><br>

            Tu cuenta quedó vinculada
            al Portal del Jugador.

            <br>

            Entrando al portal...
        `;


        /*
            Dejamos la sesión abierta.
            El jugador entrará directamente
            al portal.
        */

        setTimeout(
            () => {

                window.location.href =
                    "portal.html";

            },
            1800
        );

    }
);


/* ===================================================
   CAMBIOS DE AUTENTICACIÓN
=================================================== */

supabase.auth.onAuthStateChange(
    (
        event,
        session
    ) => {

        if (
            event ===
            "SIGNED_IN" &&
            session
        ) {

            cuentaDisponible =
                true;

        }


        if (
            event ===
            "SIGNED_OUT"
        ) {

            cuentaDisponible =
                false;

        }

    }
);


/* ===================================================
   INICIAR
=================================================== */

await iniciarActivacion();