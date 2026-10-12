import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://auutiadcyhhwxzkeernd.supabase.co";
const SUPABASE_KEY = "sb_publishable_luWCBHYOSUsFbmgPU4GoiQ_9nmBMRHe";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const $ = (id) => document.getElementById(id);
const loginView = $("login-player");
const shell = $("player-shell");
const formLogin = $("form-login-player");
const loginMessage = $("login-message");
const globalMessage = $("global-message");
const navButtons = [...document.querySelectorAll(".nav-btn[data-view]")];
const views = [...document.querySelectorAll(".view")];

let sessionUser = null;
let player = null;
let temporadas = [];
let competiciones = [];
let partidos = [];
let solicitudes = [];
let estadisticasOficiales = [];
let historicoJugador = null;
let estadoVinculoHistorico = "pendiente";
let partidosAutoreportables = new Set();
let autoreporteDisponible = false;

function moneyOrDash(v){ return v ?? "—"; }
function normalize(v){ return String(v || "").trim().toUpperCase(); }
function firstName(name){ return String(name || "Jugador").trim().split(/\s+/)[0] || "Jugador"; }
function formatDate(value){
    if(!value) return "Por confirmar";
    const d = new Date(value);
    if(Number.isNaN(d.getTime())) return "Por confirmar";
    return new Intl.DateTimeFormat("es-CL",{day:"2-digit",month:"short",year:"numeric"}).format(d);
}
function formatDateTime(value){
    if(!value) return "Fecha y hora por confirmar";
    const d = new Date(value);
    if(Number.isNaN(d.getTime())) return "Fecha y hora por confirmar";
    return new Intl.DateTimeFormat("es-CL",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}).format(d);
}
function safe(text){
    return String(text ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
}
function showMessage(message,type="success"){
    globalMessage.textContent = message;
    globalMessage.className = `global-message ${type}`;
    globalMessage.hidden = false;
    clearTimeout(showMessage.timer);
    showMessage.timer = setTimeout(()=> globalMessage.hidden = true, 3800);
}
function setView(name){
    views.forEach(v=>v.classList.toggle("active",v.id===`view-${name}`));
    navButtons.forEach(b=>b.classList.toggle("active",b.dataset.view===name));
    const titles={inicio:"Mi Rayckington",perfil:"Mi perfil",estadisticas:"Mis estadísticas",enviar:"Enviar estadísticas",partidos:"Partidos"};
    $("page-title").textContent=titles[name]||"Portal Deportivo";
    if(window.innerWidth<=860){$("player-sidebar").classList.remove("open");$("sidebar-backdrop").classList.remove("show");}
}
navButtons.forEach(b=>b.addEventListener("click",()=>setView(b.dataset.view)));
$("btn-menu").addEventListener("click",()=>{$("player-sidebar").classList.toggle("open");$("sidebar-backdrop").classList.toggle("show")});
$("sidebar-backdrop").addEventListener("click",()=>{$("player-sidebar").classList.remove("open");$("sidebar-backdrop").classList.remove("show")});

formLogin.addEventListener("submit",async(e)=>{
    e.preventDefault(); loginMessage.textContent="Ingresando...";
    const {error}=await supabase.auth.signInWithPassword({email:$("player-email").value.trim(),password:$("player-password").value});
    if(error){loginMessage.textContent="No se pudo iniciar sesión.";return;}
    loginMessage.textContent=""; await boot();
});
$("btn-logout").addEventListener("click",async()=>{await supabase.auth.signOut();location.reload()});

async function boot(){
    const {data:{session}}=await supabase.auth.getSession();
    if(!session){ loginView.hidden=false; shell.hidden=true; return; }
    sessionUser=session.user;
    const {data,error}=await supabase.from("jugadores").select("id,user_id,nombre,nombre_completo,nombre_deportivo,dorsal,posicion,posicion_secundaria,pierna_habil,foto_path,fecha_ingreso,estado,posiciones_autodefinidas_at").eq("user_id",session.user.id).maybeSingle();
    if(error || !data){
        loginView.hidden=true; shell.hidden=false; showMessage("Tu cuenta no está vinculada a un jugador del plantel.","error"); return;
    }
    player=data;
    loginView.hidden=true; shell.hidden=false;
    applyProfile();
    renderOneTimePositions();
    await loadAll();
}

function playerDisplayName(){return player?.nombre_deportivo || player?.nombre_completo || player?.nombre || "Jugador";}
function photoUrl(){
    if(!player?.foto_path) return "assets/img/logo/logo.png";
    const {data}=supabase.storage.from("fotos-jugadores").getPublicUrl(player.foto_path);
    return data?.publicUrl || "assets/img/logo/logo.png";
}
function applyProfile(){
    const name=playerDisplayName(); const initial=firstName(name)[0]?.toUpperCase()||"R";
    $("top-name").textContent=name; $("top-avatar").textContent=initial; $("welcome-name").textContent=`Hola, ${firstName(name)}`;
    $("card-name").textContent=name; $("card-dorsal").textContent=player.dorsal ? String(player.dorsal) : "--"; $("card-posicion").textContent=normalize(player.posicion||"Jugador"); $("card-subtitle").textContent=player.posicion ? `${player.posicion} · Rayckington FC` : "Rayckington FC";
    $("card-photo").src=photoUrl(); $("profile-photo").src=photoUrl(); $("profile-name").textContent=name; $("profile-role").textContent=player.posicion ? `${player.posicion} · Rayckington FC` : "Rayckington FC";
    $("profile-sport-name").textContent=player.nombre_deportivo||"—";
    $("profile-dorsal").textContent=moneyOrDash(player.dorsal);
    $("profile-position").textContent=normalize(player.posicion||"Jugador");
    $("profile-position-2").textContent=player.posicion_secundaria||"—";
    $("profile-foot").textContent=player.pierna_habil||"—";
    $("profile-entry").textContent=player.fecha_ingreso?formatDate(player.fecha_ingreso):"—";
}

const POSICIONES_VALIDAS=new Set(["ARQ","DFC","LI","LD","MCD","MC","MCO","MI","MD","EI","ED","DC"]);
function defaultPosition(v){
    const key=normalize(v);
    const aliases={PO:"ARQ",POR:"ARQ",EXI:"EI",EXD:"ED"};
    return POSICIONES_VALIDAS.has(key)?key:(aliases[key]||"");
}
function renderOneTimePositions(){
    const locked=Boolean(player?.posiciones_autodefinidas_at);
    const form=$("positions-once-form"),state=$("positions-state");
    form.hidden=locked;
    if(locked){
        state.textContent="Tus posiciones ya quedaron registradas. Para solicitar cambios, contacta a la administración del club.";
        return;
    }
    state.textContent="Elige tu posición principal y, si tienes, una secundaria. Esta elección se puede guardar una sola vez.";
    $("player-position-main").value=defaultPosition(player?.posicion);
    $("player-position-second").value=defaultPosition(player?.posicion_secundaria);
    $("player-position-foot").value=["Derecha","Izquierda","Ambas"].includes(player?.pierna_habil)?player.pierna_habil:"";
    $("player-position-confirm").checked=false;
}
$("positions-once-form").addEventListener("submit",async event=>{
    event.preventDefault();
    const main=$("player-position-main").value;
    const second=$("player-position-second").value;
    const foot=$("player-position-foot").value;
    const msg=$("positions-message"),button=$("player-position-save");
    if(!POSICIONES_VALIDAS.has(main)|| (second&&!POSICIONES_VALIDAS.has(second))){
        msg.textContent="Selecciona una posición válida.";return;
    }
    if(second===main){msg.textContent="La posición secundaria debe ser distinta.";return;}
    if(!$("player-position-confirm").checked){msg.textContent="Confirma que tu elección es definitiva.";return;}
    if(!confirm(`¿Confirmas tu configuración definitiva?\nPrincipal: ${main}\nSecundaria: ${second||"Ninguna"}\n\nNo podrás cambiarla sin autorización del club.`))return;
    button.disabled=true;msg.textContent="Guardando posiciones...";
    try{
        const {data,error}=await supabase.rpc("definir_posiciones_jugador_una_vez",{
            p_posicion:main,p_posicion_secundaria:second||null,p_pierna_habil:foot||null
        });
        if(error)throw error;
        if(!data?.ok)throw new Error("No se confirmó el guardado.");
        Object.assign(player,{posicion:data.posicion,posicion_secundaria:data.posicion_secundaria,
            pierna_habil:data.pierna_habil,posiciones_autodefinidas_at:data.posiciones_autodefinidas_at});
        applyProfile();renderOneTimePositions();
        showMessage("Posiciones registradas. Si necesitas un cambio, habla con el club.");
    }catch(error){msg.textContent=error?.message||"No pudimos guardar tus posiciones.";}
    finally{button.disabled=false;}
});

async function loadAll(){
    await Promise.all([loadCatalogs(),loadMatches(),loadSubmissions(),loadOfficialStats(),loadEligibleMatches(),loadHistoricalStats()]);
    fillFilters();
    prepararFiltrosPartidos();
    await refreshSummary();
    await refreshProfileSummary();
    renderMatches(); renderSubmissions(); await refreshStatsView(); renderNextMatch(); fillSubmitMatches();
}

async function loadCatalogs(){
    const [{data:t,error:te},{data:c,error:ce}]=await Promise.all([
        supabase.from("deportivo_temporadas").select("id,nombre,anio,estado").order("anio",{ascending:false}),
        supabase.from("deportivo_competiciones").select("id,temporada_id,nombre,tipo,estado").order("nombre")
    ]);
    if(te) console.error(te); if(ce) console.error(ce); temporadas=t||[]; competiciones=c||[];
}
async function loadMatches(){
    const {data,error}=await supabase.from("deportivo_partidos").select("id,temporada_id,competicion_id,jornada,rival_nombre,condicion,fecha_hora,lugar,estado,goles_rayckington,goles_rival,periodo_partido,minuto_actual,created_at").order("created_at",{ascending:false});
    if(error){console.error(error);partidos=[];return;} partidos=data||[];
}
// Servidor es la fuente de verdad. Si falla esta consulta, los envíos se bloquean.
async function loadEligibleMatches(){
    const {data,error}=await supabase.rpc("deportivo_partidos_autoreportables");
    if(error){
        console.error("No se pudo consultar la autorización de autoreporte:",error);
        partidosAutoreportables=new Set();
        autoreporteDisponible=false;
        return;
    }
    partidosAutoreportables=new Set((data||[]).map(row=>String(row.partido_id)));
    autoreporteDisponible=true;
}

async function loadSubmissions(){
    const {data,error}=await supabase.from("deportivo_solicitudes_estadisticas").select("id,partido_id,jugador_id,titular,minutos,goles,asistencias,amarillas,rojas,posicion,goles_recibidos,penales_atajados,valla_invicta,observaciones,estado,motivo_rechazo,created_at,revisado_at").eq("jugador_id",player.id).order("created_at",{ascending:false});
    if(error){console.error(error);solicitudes=[];return;} solicitudes=data||[];
}
async function loadOfficialStats(){
    const {data,error}=await supabase.from("deportivo_estadisticas_jugador").select("id,partido_id,jugador_id,jugo,titular,minutos,goles,asistencias,amarillas,rojas,mvp,posicion,goles_recibidos,penales_atajados,valla_invicta,fuente,aprobado_at").eq("jugador_id",player.id).order("aprobado_at",{ascending:false});
    if(error){console.error(error);estadisticasOficiales=[];return;} estadisticasOficiales=data||[];
}


/* ================================================================
   CLAUSURA 2026 · ACUMULADO DE FECHAS 1 Y 2

   La ficha pública utiliza jugador_slug; la cuenta privada utiliza
   jugadores.id. Vinculamos ambos de modo conservador, por nombres
   completos o deportivos exactos y únicos del plantel histórico.
   No adivinamos por nombre de pila ni por dorsal.
   La tabla histórica es SOLO LECTURA; no se crea ningún dato nuevo.
================================================================ */
function claveNombre(valor){
    return String(valor || "").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
        .toLowerCase().replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ");
}
function encontrarJugadorLegacy(cuenta, plantel){
    const lista = Array.isArray(plantel?.jugadores) ? plantel.jugadores : [];
    const nombreCompleto = claveNombre(cuenta?.nombre_completo);
    const nombres = [cuenta?.nombre_completo,cuenta?.nombre,cuenta?.nombre_deportivo]
        .map(claveNombre).filter(n => n.split(" ").length >= 2);
    // Primero identidad legal completa; después solo coincidencias exactas,
    // únicas y de por lo menos dos palabras.
    if (nombreCompleto){
        const legales = lista.filter(j => claveNombre(j.nombreCompleto) === nombreCompleto);
        if (legales.length === 1) return legales[0];
        if (legales.length > 1) return null;
    }
    const candidatas = lista.filter(j => nombres.some(n =>
        n === claveNombre(j.nombre) || n === claveNombre(j.nombreCompleto)
    ));
    return candidatas.length === 1 ? candidatas[0] : null;
}
async function loadHistoricalStats(){
    historicoJugador = null;
    estadoVinculoHistorico = "sin_vincular";
    try{
        const respuesta = await fetch("assets/data/plantel/plantel.json",{cache:"no-store"});
        if (!respuesta.ok) throw new Error("No se pudo cargar plantel.json");
        const legacy = encontrarJugadorLegacy(player, await respuesta.json());
        if (!legacy?.slug){
            console.warn("Histórico sin vínculo inequívoco para esta cuenta:",player?.id);
            return;
        }
        const {data,error} = await supabase.from("deportivo_estadisticas_historicas")
            .select("jugador_slug,partidos,titularidades,suplencias,minutos,goles,asistencias,amarillas,rojas,porterias_invictas,mvp")
            .eq("temporada","Clausura 2026")
            .eq("competicion","Liga Tobalaba Todo Competidor")
            .eq("jugador_slug",legacy.slug).maybeSingle();
        if(error) throw error;
        historicoJugador = data || null;
        estadoVinculoHistorico = data ? "vinculado" : "sin_datos";
    }catch(error){
        estadoVinculoHistorico = "error";
        console.warn("Histórico del Clausura no disponible:",error);
    }
}
function esPartidoClausura2026(p){
    if(!p) return false;
    const t=temporadas.find(x=>String(x.id)===String(p.temporada_id));
    const c=competiciones.find(x=>String(x.id)===String(p.competicion_id));
    const textos=`${t?.nombre||""} ${c?.nombre||""}`.toLowerCase();
    return (Number(t?.anio)===2026 || textos.includes("2026")) && textos.includes("clausura");
}
function mostrarHistoricoEnFiltro(temporadaId,competicionId){
    if(!historicoJugador) return false;
    if(!temporadaId && !competicionId) return true;
    return partidos.some(p => esPartidoClausura2026(p)
        && (!temporadaId || String(p.temporada_id)===String(temporadaId))
        && (!competicionId || String(p.competicion_id)===String(competicionId)));
}
function filaAcumuladoHistorico(){
    if(!historicoJugador) return null;
    return {
        esHistorico: true,
        jugo: Number(historicoJugador.partidos)>0,
        partidos: Number(historicoJugador.partidos)||0,
        titularidades: Number(historicoJugador.titularidades)||0,
        minutos: Number(historicoJugador.minutos)||0,
        goles: Number(historicoJugador.goles)||0,
        asistencias: Number(historicoJugador.asistencias)||0,
        amarillas: Number(historicoJugador.amarillas)||0,
        rojas: Number(historicoJugador.rojas)||0,
        mvp: Number(historicoJugador.mvp)||0
    };
}
function obtenerEstadisticasIntegradas(temporadaId,competicionId){
    const aplicaHistorico=mostrarHistoricoEnFiltro(temporadaId,competicionId);
    // Con acumulado disponible, jamás sumamos cifras oficiales de Fecha 1-2
    // ni registros del Clausura sin jornada verificada: podrían duplicarse.
    const oficiales=filterOfficial(temporadaId,competicionId).filter(s=>{
        if(!aplicaHistorico) return true;
        const p=partidos.find(x=>String(x.id)===String(s.partido_id));
        if(!esPartidoClausura2026(p)) return true;
        return Number(p.jornada) >= 3;
    });
    const filas=aplicaHistorico ? [filaAcumuladoHistorico(),...oficiales] : oficiales;
    const resumen=summarize(oficiales);
    if(aplicaHistorico){
        const h=filaAcumuladoHistorico();
        resumen.pj += h.partidos;
        resumen.minutos += h.minutos;
        resumen.goles += h.goles;
        resumen.asistencias += h.asistencias;
        resumen.amarillas += h.amarillas;
        resumen.rojas += h.rojas;
        resumen.mvp += h.mvp;
        resumen.titularidades += h.titularidades;
    }
    return {resumen,filas};
}
function renderHistoricoStatus(){
    const el=$("historico-status");
    if(!el) return;
    const mensajes={
        vinculado:"Clausura 2026: acumulado de las Fechas 1 y 2 + registros oficiales desde la Fecha 3. No se distribuye el acumulado entre partidos.",
        sin_vincular:"No pudimos asociar tu cuenta a la ficha histórica con certeza. El club debe revisar tu nombre en el plantel; no asignamos estadísticas de otra persona.",
        sin_datos:"Tu ficha está vinculada, pero todavía no existe una fila histórica. Se muestran las estadísticas oficiales disponibles.",
        error:"No fue posible consultar el histórico. Se muestran los datos oficiales disponibles; vuelve a intentarlo más tarde."
    };
    el.textContent=mensajes[estadoVinculoHistorico]||"Consultando históricos del Clausura...";
}

function fillSelect(el,items,allLabel="Todas"){
    const current=el.value; el.innerHTML=`<option value="">${allLabel}</option>`+items.map(i=>`<option value="${i.id}">${safe(i.nombre)}</option>`).join(""); if([...el.options].some(o=>o.value===current))el.value=current;
}
function filterIds(prefix){
    const map={
        inicio:["inicio-temporada","inicio-competicion"],
        perfil:["profile-temporada","profile-competicion"],
        stats:["stats-temporada","stats-competicion"]
    };
    return map[prefix];
}
function fillFilters(){
    fillSelect($("inicio-temporada"),temporadas,"Todas las temporadas");
    fillSelect($("profile-temporada"),temporadas,"Todas las temporadas");
    fillSelect($("stats-temporada"),temporadas,"Todas las temporadas");

    updateCompetitionFilters("inicio");
    updateCompetitionFilters("perfil");
    updateCompetitionFilters("stats");
}
function updateCompetitionFilters(prefix){
    const [seasonId,competitionId]=filterIds(prefix);
    const t=$(seasonId).value;
    const list=t?competiciones.filter(c=>c.temporada_id===t):competiciones;
    fillSelect($(competitionId),list,"Todas las competiciones");
}
$("inicio-temporada").addEventListener("change",async()=>{updateCompetitionFilters("inicio");await refreshSummary()});
$("inicio-competicion").addEventListener("change",refreshSummary);
$("profile-temporada").addEventListener("change",async()=>{updateCompetitionFilters("perfil");await refreshProfileSummary()});
$("profile-competicion").addEventListener("change",refreshProfileSummary);
$("stats-temporada").addEventListener("change",async()=>{updateCompetitionFilters("stats");await refreshStatsView()});
$("stats-competicion").addEventListener("change",refreshStatsView);

function filterOfficial(temporadaId,competicionId){
    return estadisticasOficiales.filter(s=>{const p=partidos.find(x=>x.id===s.partido_id);if(!p)return false;return(!temporadaId||p.temporada_id===temporadaId)&&(!competicionId||p.competicion_id===competicionId)});
}
function summarize(list){
    return list.reduce((a,s)=>({pj:a.pj+(s.jugo?1:0),minutos:a.minutos+(Number(s.minutos)||0),goles:a.goles+(Number(s.goles)||0),asistencias:a.asistencias+(Number(s.asistencias)||0),amarillas:a.amarillas+(Number(s.amarillas)||0),rojas:a.rojas+(Number(s.rojas)||0),mvp:a.mvp+(s.mvp?1:0),titularidades:a.titularidades+(s.titular?1:0)}),{pj:0,minutos:0,goles:0,asistencias:0,amarillas:0,rojas:0,mvp:0,titularidades:0});
}
async function refreshSummary(){
    const {resumen:s}=obtenerEstadisticasIntegradas($("inicio-temporada").value,$("inicio-competicion").value);
    $("stat-pj").textContent=s.pj; $("stat-minutos").textContent=s.minutos; $("stat-goles").textContent=s.goles; $("stat-asistencias").textContent=s.asistencias; $("stat-amarillas").textContent=s.amarillas; $("stat-mvp").textContent=s.mvp; $("card-pj").textContent=s.pj; $("card-goles").textContent=s.goles; $("card-asistencias").textContent=s.asistencias;
}
async function refreshProfileSummary(){
    const temporadaId=$("profile-temporada").value;
    const competicionId=$("profile-competicion").value;
    const {resumen:s}=obtenerEstadisticasIntegradas(temporadaId,competicionId);

    $("profile-stat-pj").textContent=s.pj;
    $("profile-stat-min").textContent=s.minutos;
    $("profile-stat-g").textContent=s.goles;
    $("profile-stat-a").textContent=s.asistencias;
    $("profile-stat-tit").textContent=s.titularidades;
    $("profile-stat-ta").textContent=s.amarillas;
    $("profile-stat-tr").textContent=s.rojas;
    $("profile-stat-mvp").textContent=s.mvp;

    let label="Toda la carrera";
    if(competicionId){
        label=competiciones.find(c=>c.id===competicionId)?.nombre||"Competición";
    }else if(temporadaId){
        label=temporadas.find(t=>t.id===temporadaId)?.nombre||"Temporada";
    }
    $("profile-filter-label").textContent=label;
}
async function refreshStatsView(){
    const {resumen:s,filas}=obtenerEstadisticasIntegradas($("stats-temporada").value,$("stats-competicion").value);
    $("stats-pj").textContent=s.pj; $("stats-min").textContent=s.minutos; $("stats-g").textContent=s.goles; $("stats-a").textContent=s.asistencias; $("stats-ta").textContent=s.amarillas; $("stats-mvp").textContent=s.mvp;
    renderOfficialHistory(filas); renderHistoricoStatus();
}

function competitionName(id){return competiciones.find(c=>c.id===id)?.nombre||"Competición";}
function matchLabel(p){
    const home=normalize(p.condicion)==="LOCAL"; return home?`Rayckington FC vs ${p.rival_nombre}`:`${p.rival_nombre} vs Rayckington FC`;
}
function renderNextMatch(){
    const candidates=partidos.filter(p=>["PROGRAMADO","EN_VIVO","ENTRETIEMPO"].includes(normalize(p.estado))).sort((a,b)=>{
        if(a.estado!==b.estado){if(["EN_VIVO","ENTRETIEMPO"].includes(a.estado))return-1;if(["EN_VIVO","ENTRETIEMPO"].includes(b.estado))return 1;}
        const da=a.fecha_hora?new Date(a.fecha_hora).getTime():Number.MAX_SAFE_INTEGER; const db=b.fecha_hora?new Date(b.fecha_hora).getTime():Number.MAX_SAFE_INTEGER; return da-db || (a.jornada||999)-(b.jornada||999);
    });
    const p=candidates[0]; const el=$("next-match"); if(!p){el.className="empty-state";el.textContent="No hay próximos partidos registrados.";return;}
    el.className="next-match-box"; const live=["EN_VIVO","ENTRETIEMPO"].includes(normalize(p.estado));
    el.innerHTML=`<div class="next-match-title">${live?"🔴 EN VIVO":"PRÓXIMO"}</div><strong>${safe(matchLabel(p))}</strong><span>${safe(competitionName(p.competicion_id))} · ${p.jornada?`Fecha ${p.jornada} · `:""}${safe(formatDateTime(p.fecha_hora))}</span>${live?`<b>${p.goles_rayckington} - ${p.goles_rival}</b>`:""}`;
}
function renderSubmissions(){
    const mini=$("recent-submissions"); const full=$("submission-history"); const html=(solicitudes.length?solicitudes.slice(0,5).map(submissionHtml).join(""):`<div class="empty-state">Aún no has enviado estadísticas.</div>`); mini.innerHTML=html;
    full.innerHTML=solicitudes.length?solicitudes.map(submissionHtml).join(""):`<div class="empty-state">Aún no has enviado estadísticas.</div>`;
}
function submissionHtml(s){const p=partidos.find(x=>x.id===s.partido_id);return `<div class="submission-item"><div style="display:flex;justify-content:space-between;gap:10px;align-items:center"><strong>${safe(p?matchLabel(p):"Partido")}</strong><span class="status-pill status-${safe(s.estado)}">${safe(s.estado)}</span></div><span>${s.minutos} min · ${s.goles} G · ${s.asistencias} A · ${s.amarillas} TA · ${s.rojas} TR</span>${s.estado==="RECHAZADA"&&s.motivo_rechazo?`<span>Motivo: ${safe(s.motivo_rechazo)}</span>`:""}</div>`;}
function renderOfficialHistory(list=estadisticasOficiales){
    const el=$("official-history"); if(!list.length){el.innerHTML=`<div class="empty-state">Todavía no tienes estadísticas oficiales aprobadas.</div>`;return;}
    el.innerHTML=list.map(s=>{
        const p=s.esHistorico?null:partidos.find(x=>x.id===s.partido_id);
        const titulo=s.esHistorico?`Acumulado histórico · Fechas 1 y 2 (${s.partidos} PJ)`:p?matchLabel(p):"Partido";
        const detalle=s.esHistorico?"Clausura 2026 · No separado por partido":p?`${competitionName(p.competicion_id)} · ${formatDate(p.fecha_hora)}`:"";
        return `<div class="official-row"><div><strong>${safe(titulo)}</strong><span>${safe(detalle)}</span></div><div class="metric"><b>${s.minutos}</b><small>MIN</small></div><div class="metric"><b>${s.goles}</b><small>G</small></div><div class="metric"><b>${s.asistencias}</b><small>A</small></div><div class="metric"><b>${s.amarillas}</b><small>TA</small></div><div class="metric"><b>${s.rojas}</b><small>TR</small></div><div class="metric"><b>${s.esHistorico?s.mvp:(s.mvp?"★":"—")}</b><small>MVP</small></div><div class="metric"><b>${s.esHistorico?s.titularidades:(s.titular?1:0)}</b><small>TIT</small></div></div>`;
    }).join("");
}
// El número de jornada se repite entre torneos: nunca ordenar la agenda
// completa solo por jornada. Se agrupa por competición y por estado.
function prepararFiltrosPartidos(){
    const filtro = $("player-match-competition");
    const prev = filtro.value;
    const usadas = competiciones.filter(c=>partidos.some(p=>p.competicion_id===c.id));
    usadas.sort((a,b)=>a.nombre.localeCompare(b.nombre,"es"));
    filtro.innerHTML = '<option value="">Todas las competiciones</option>' +
        usadas.map(c=>`<option value="${safe(c.id)}">${safe(c.nombre)}</option>`).join("");
    if (usadas.some(c=>c.id===prev)) filtro.value=prev;
    else {
        // Apertura, Clausura y amistosos siguen disponibles en el selector.
        const clausura=usadas.find(c=>/clausura/i.test(c.nombre) && /2026/.test(c.nombre));
        if (clausura) filtro.value=clausura.id;
    }
}
const ESTADOS_PROXIMOS = new Set(["PROGRAMADO","EN_VIVO","ENTRETIEMPO"]);
function ordenarCalendario(a,b){
    const prioridad=(p)=>["EN_VIVO","ENTRETIEMPO"].includes(normalize(p.estado)) ? 0 :
        normalize(p.estado)==="PROGRAMADO" ? 1 : normalize(p.estado)==="FINALIZADO" ? 2 : 3;
    const pa=prioridad(a),pb=prioridad(b);
    if(pa!==pb)return pa-pb;
    const da=a.fecha_hora?Date.parse(a.fecha_hora):NaN;
    const db=b.fecha_hora?Date.parse(b.fecha_hora):NaN;
    if(Number.isFinite(da)&&Number.isFinite(db)&&da!==db)return pa===2?db-da:da-db;
    if(Number.isFinite(da)!==Number.isFinite(db))return Number.isFinite(da)?-1:1;
    const j=Number(a.jornada||999)-Number(b.jornada||999);
    return pa===2?-j:j;
}
function renderMatches(){
    const el=$("player-matches"), competenciaId=$("player-match-competition").value;
    const estado=$("player-match-status").value;
    const filtrados=partidos.filter(p=>{
        if(competenciaId && p.competicion_id!==competenciaId)return false;
        const est=normalize(p.estado);
        if(estado==="FINALIZADO" && est!=="FINALIZADO")return false;
        if(estado==="PROXIMOS" && !ESTADOS_PROXIMOS.has(est))return false;
        return true;
    });
    $("player-matches-count").textContent=`${filtrados.length} partido${filtrados.length===1?"":"s"} encontrado${filtrados.length===1?"":"s"}`;
    if(!filtrados.length){el.innerHTML='<div class="empty-state">No hay partidos para estos filtros.</div>';return;}
    const grupos=new Map();
    for(const p of filtrados){
        const clave=p.competicion_id||"sin-competicion";
        if(!grupos.has(clave))grupos.set(clave,[]);
        grupos.get(clave).push(p);
    }
    const torneos=[...grupos.entries()].sort((a,b)=>competitionName(a[0]).localeCompare(competitionName(b[0]),"es"));
    el.innerHTML=torneos.map(([id,lista])=>{
        const tarjetas=lista.sort(ordenarCalendario).map(p=>{
            const est=normalize(p.estado);
            const fin=est==="FINALIZADO";
            const vivo=["EN_VIVO","ENTRETIEMPO"].includes(est);
            const score=fin || vivo?`${vivo?"🔴 ":""}${p.goles_rayckington ?? "–"} - ${p.goles_rival ?? "–"}`:p.estado;
            return `<article class="match-row"><div class="match-date">${p.jornada?`Fecha ${Number(p.jornada)}`:"Sin jornada"}</div>
                <div class="match-main"><strong>${safe(matchLabel(p))}</strong><span>${safe(formatDateTime(p.fecha_hora))}${p.lugar?` · ${safe(p.lugar)}`:""}</span></div>
                <div class="match-score">${safe(score)}</div></article>`;
        }).join("");
        return `<section class="match-competition-group"><h3>${safe(competitionName(id))} <span>${lista.length} partidos</span></h3>${tarjetas}</section>`;
    }).join("");
}
$("player-match-competition").addEventListener("change",renderMatches);
$("player-match-status").addEventListener("change",renderMatches);

function fillSubmitMatches(){
    const select=$("submit-match");
    const note=$("submit-eligibility-note");
    const submitButton=$("stats-submit-form").querySelector('button[type="submit"]');
    const existingApproved=new Set(estadisticasOficiales.map(x=>String(x.partido_id)));
    const list=partidos.filter(p=>partidosAutoreportables.has(String(p.id))
        && normalize(p.estado)==="FINALIZADO" && !existingApproved.has(String(p.id)));
    const previous=select.value;
    select.innerHTML=`<option value="">Selecciona un partido</option>`
        +list.map(p=>`<option value="${safe(p.id)}">${safe(matchLabel(p))} · ${safe(competitionName(p.competicion_id))}</option>`).join("");
    if(list.some(p=>String(p.id)===previous)) select.value=previous;
    select.disabled=!autoreporteDisponible || list.length===0;
    submitButton.disabled=!autoreporteDisponible || list.length===0;
    note.textContent=!autoreporteDisponible
        ? "No se pudo comprobar qué partidos están habilitados. Por seguridad, los envíos están bloqueados. Actualiza la página o verifica la migración de Supabase."
        : list.length===0
        ? "No tienes partidos habilitados para enviar estadísticas. Los históricos hasta la Fecha 2 del Clausura 2026 los registra el club. Los nuevos se habilitan al finalizar."
        : `Partidos habilitados: ${list.length}. Los anteriores a la Fecha 3 del Clausura 2026 no admiten envíos.`;
}

$("stats-submit-form").addEventListener("submit",async(e)=>{
    e.preventDefault(); const msg=$("submit-message"); const partidoId=$("submit-match").value;
    if(!partidoId || !autoreporteDisponible || !partidosAutoreportables.has(String(partidoId))){
        msg.textContent="Este partido no está habilitado para envío de estadísticas. Solo partidos nuevos finalizados.";
        return;
    }
    msg.textContent="Enviando...";
    const payload={
        p_partido_id:partidoId,
        p_titular:$("submit-titular").checked,
        p_minutos:Number($("submit-minutos").value||0),
        p_goles:Number($("submit-goles").value||0),
        p_asistencias:Number($("submit-asistencias").value||0),
        p_amarillas:Number($("submit-amarillas").value||0),
        p_rojas:Number($("submit-rojas").value||0),
        p_posicion:$("submit-posicion").value.trim()||null,
        p_goles_recibidos:Number($("submit-goles-recibidos").value||0),
        p_penales_atajados:Number($("submit-penales-atajados").value||0),
        p_valla_invicta:$("submit-valla").checked,
        p_observaciones:$("submit-observaciones").value.trim()||null
    };
    const {error}=await supabase.rpc("enviar_estadistica_jugador_portal",payload);
    if(error){console.error(error);msg.textContent=error.message||"No se pudo enviar.";return;}
    msg.textContent="Estadísticas enviadas para revisión."; e.target.reset(); await loadSubmissions(); renderSubmissions(); fillSubmitMatches();
});

$("btn-upload-photo").addEventListener("click",async()=>{
    const input=$("profile-photo-input"); const file=input.files?.[0]; const msg=$("photo-message");
    if(!file){msg.textContent="Selecciona una imagen.";return;} if(file.size>5*1024*1024){msg.textContent="La imagen supera los 5 MB.";return;} if(!["image/jpeg","image/png","image/webp"].includes(file.type)){msg.textContent="Formato no permitido.";return;}
    msg.textContent="Subiendo..."; const ext=file.name.split(".").pop()?.toLowerCase()||"jpg"; const path=`${sessionUser.id}/${player.id}/perfil.${ext}`;
    const {error:uploadError}=await supabase.storage.from("fotos-jugadores").upload(path,file,{upsert:true,contentType:file.type});
    if(uploadError){console.error(uploadError);msg.textContent="No se pudo subir la foto.";return;}
    const {error:updateError}=await supabase.rpc("actualizar_foto_jugador_portal",{p_foto_path:path});
    if(updateError){console.error(updateError);msg.textContent="La foto subió, pero no se pudo asociar al perfil.";return;}
    player.foto_path=path; applyProfile();
    const freshUrl = `${photoUrl()}?t=${Date.now()}`;
    $("card-photo").src = freshUrl;
    $("profile-photo").src = freshUrl;
    msg.textContent="Foto actualizada correctamente.";
});

supabase.auth.onAuthStateChange((event)=>{if(event==="SIGNED_OUT")location.reload()});
boot();
