/* Rayckington FC · pizarra táctica, persistida por partido en Supabase.
   No publica estadísticas ni altera eventos; los roles usan la RPC V3. */
"use strict";

export const FORMACIONES = Object.freeze({
    "4-3-3": [["EI","DC","ED"],["MC-I","MC","MC-D"],["LI","DFC-I","DFC-D","LD"],["POR"]],
    "4-4-2": [["DC-I","DC-D"],["MI","MC-I","MC-D","MD"],["LI","DFC-I","DFC-D","LD"],["POR"]],
    "4-4-1-1": [["DC"],["MCO"],["MI","MC-I","MC-D","MD"],["LI","DFC-I","DFC-D","LD"],["POR"]],
    "4-2-3-1": [["DC"],["EI","MCO","ED"],["MCD-I","MCD-D"],["LI","DFC-I","DFC-D","LD"],["POR"]],
    "3-5-2": [["DC-I","DC-D"],["MI","MC-I","MCO","MC-D","MD"],["DFC-I","DFC","DFC-D"],["POR"]],
    "5-3-2": [["DC-I","DC-D"],["MC-I","MC","MC-D"],["LI","DFC-I","DFC","DFC-D","LD"],["POR"]],
    "4-1-4-1": [["DC"],["MI","MC-I","MC-D","MD"],["MCD"],["LI","DFC-I","DFC-D","LD"],["POR"]]
});

export const PUESTOS = Object.freeze({
    POR:"Arquero", LI:"Lateral izquierdo",LD:"Lateral derecho",DFC:"Defensa central", "DFC-I":"Central izquierdo","DFC-D":"Central derecho",
    MCD:"Volante defensivo", "MCD-I":"Volante defensivo izq.","MCD-D":"Volante defensivo der.",
    MC:"Mediocentro","MC-I":"Volante izquierdo", "MC-D":"Volante derecho",MI:"Volante izquierdo", MD:"Volante derecho",
    MCO:"Mediapunta",EI:"Extremo izquierdo",ED:"Extremo derecho",DC:"Delantero","DC-I":"Delantero izquierdo","DC-D":"Delantero derecho"
});

// El catalogo administrativo utiliza ARQ, DFC, LD, LI, MCD, MC, MCO, ED, EI y DC.
// Las siglas PO, EXI y EXD tambien aparecen en el JSON historico del club.
const ALIAS_PUESTO = Object.freeze({
    ARQ:"ARQ", PO:"ARQ", POR:"ARQ", GK:"ARQ", ARQUERO:"ARQ", PORTERO:"ARQ",
    LI:"LI", "LATERAL IZQUIERDO":"LI", LD:"LD", "LATERAL DERECHO":"LD",
    DFC:"DFC", CENTRAL:"DFC", "DEFENSA CENTRAL":"DFC", "DEFENSOR CENTRAL":"DFC",
    MCD:"MCD", "VOLANTE DEFENSIVO":"MCD", "MEDIOCENTRO DEFENSIVO":"MCD", PIVOTE:"MCD", CONTENCION:"MCD",
    MC:"MC", MEDIOCAMPISTA:"MC", MEDIOCENTRO:"MC", "VOLANTE CENTRAL":"MC",
    MCO:"MCO", ENGANCHE:"MCO", MEDIAPUNTA:"MCO", "MEDIOCENTRO OFENSIVO":"MCO",
    MI:"MI", "VOLANTE IZQUIERDO":"MI", MD:"MD", "VOLANTE DERECHO":"MD",
    EI:"EI", EXI:"EI", "EXTREMO IZQUIERDO":"EI", ED:"ED", EXD:"ED", "EXTREMO DERECHO":"ED",
    DC:"DC", DELANTERO:"DC", "DELANTERO CENTRO":"DC", CENTRODELANTERO:"DC"
});
// En 4-4-2 y 3-5-2, MI/MD son puestos de banda: se admiten extremos del mismo lado.
// NO sugerimos delanteros como defensas, ni mediocentros en todas las posiciones.
const AFINES = Object.freeze({ MI:["EI"], MD:["ED"] });
function normal(s){return String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase().trim();}
function familia(slot){return slot.split("-")[0];}
export function codigoPosicion(valor){
    const txt=normal(valor).replace(/\s+/g," ").trim();
    if(!txt)return "";
    // Permite formatos administrativos antiguos, por ejemplo "ARQ · Arquero".
    const prefijo=txt.split(/\s*[·:|]\s*|\s+[—–-]\s+/)[0];
    return ALIAS_PUESTO[txt] || ALIAS_PUESTO[prefijo] || "";
}
export function compatibilidadPuesto(slot,j){
    const objetivo=familia(slot)==="POR" ? "ARQ" : familia(slot);
    const principal=codigoPosicion(j?.posicion);
    const secundaria=codigoPosicion(j?.posicion_secundaria);
    if(principal===objetivo)return 4;
    if(secundaria===objetivo)return 3;
    if((AFINES[objetivo]||[]).includes(principal))return 2;
    if((AFINES[objetivo]||[]).includes(secundaria))return 1;
    return 0;
}
export function puntajePuesto(slot,j){return compatibilidadPuesto(slot,j);}

export function organizarTitulares(esquema,alineacion,jugadores,guardado={}){
    const slots=FORMACIONES[esquema].flat();
    const titulares=new Set(alineacion.filter(f=>f.rol==="TITULAR").map(f=>f.jugador_id));
    const jugadorById=new Map(jugadores.map(j=>[j.id,j]));
    const resultado={}; const usados=new Set();
    for(const slot of slots){
        const id=guardado?.[slot];
        if(id && titulares.has(id)&&!usados.has(id)){
            resultado[slot]=id;usados.add(id);
        }
    }
    // Primero los puestos específicos (arquero/defensa) para no colocar
    // accidentalmente al portero de delantero cuando faltan titulares.
    const prioridades={POR:0,DFC:1,LI:1,LD:1,MCD:2,MC:3,MI:3,MD:3,MCO:4,EI:5,ED:5,DC:6};
    const pendientes=slots.filter(slot=>!resultado[slot]).sort((a,b)=>
        (prioridades[familia(a)]??9)-(prioridades[familia(b)]??9));
    for(const slot of pendientes){
        // Nunca completar puestos a la fuerza con alguien fuera de su posicion.
        // Si faltan jugadores compatibles, el casillero queda sin asignar.
        const restantes=[...titulares].filter(id=>!usados.has(id) && puntajePuesto(slot,jugadorById.get(id))>0);
        restantes.sort((a,b)=>puntajePuesto(slot,jugadorById.get(b))-puntajePuesto(slot,jugadorById.get(a)) ||
            String(a).localeCompare(String(b)));
        if(restantes.length){resultado[slot]=restantes[0];usados.add(restantes[0]);}
    }
    return resultado;
}

export function crearPizarraTactica({supabase,obtenerPartido,obtenerJugadores,obtenerAlineacion,nombreJugador,escapar,refrescarConvocatoria}){
    const $=id=>document.getElementById(id);
    let partidoId=null, esquema="4-3-3", asignaciones={}, preparado=false, habilitado=false, ocupada=false, vista="cancha";
    let mensajeError="";
    let modoLibre=false, ubicaciones={};
    const limitar=(n,min,max)=>Math.max(min,Math.min(max,n));
    function ubicacionPredeterminada(slot){
        const filas=FORMACIONES[esquema];
        for(let fila=0;fila<filas.length;fila++){
            const indice=filas[fila].indexOf(slot);
            if(indice>=0)return {x:100*(indice+1)/(filas[fila].length+1),y:12+76*fila/(filas.length-1)};
        }
        return {x:50,y:50};
    }
    function ubicacion(slot){
        const guardada=ubicaciones?.[slot];
        return guardada && Number.isFinite(Number(guardada.x)) && Number.isFinite(Number(guardada.y))
            ? {x:limitar(Number(guardada.x),8,92),y:limitar(Number(guardada.y),10,90)}
            : ubicacionPredeterminada(slot);
    }
    let mostrarTodos=false; // Seleccion explicita para improvisar fuera de posicion.
    const selectorTodos=$("mc-pitch-show-all");
    if(selectorTodos)selectorTodos.addEventListener("change",()=>{
        mostrarTodos=selectorTodos.checked;
        render();
    });
    const esPrevia=()=>{const p=obtenerPartido();return !!p&&p.estado==="PROGRAMADO"&&(p.periodo_partido||"PREVIA")==="PREVIA";};
    const nombre=j=>`${nombreJugador(j)}${j.dorsal!=null?` · #${j.dorsal}`:""}`;
    function aviso(text="",tipo=""){$("mc-pitch-message").textContent=text;$("mc-pitch-message").className=`form-message ${tipo}`;}
    function seleccionarModo(modo){
        vista=modo;
        $("mc-pitch-area").hidden=modo!=="cancha";
        $("mc-roster-add-form").hidden=modo!=="lista";
        $("mc-roster-columns").hidden=modo!=="lista";
        $("mc-mode-pitch").setAttribute("aria-pressed",String(modo==="cancha"));
        $("mc-mode-list").setAttribute("aria-pressed",String(modo==="lista"));
    }
    $("mc-mode-pitch").addEventListener("click",()=>seleccionarModo("cancha"));
    $("mc-mode-list").addEventListener("click",()=>seleccionarModo("lista"));
    $("mc-go-roster")?.addEventListener("click",()=>{
        seleccionarModo("lista");
        $("mc-roster-add-form")?.scrollIntoView({behavior:"smooth",block:"center"});
    });

    function render(){
        if(!partidoId||obtenerPartido()?.id!==partidoId)return;
        const filas=obtenerAlineacion();
        const titulares=filas.filter(f=>f.rol==="TITULAR");
        const activos=obtenerJugadores().filter(j=>normal(j.estado)!=="INACTIVO");
        // La pizarra solo permite jugadores que YA esten convocados en Lista.
        const convocadosIds=new Set(filas.map(f=>f.jugador_id));
        const convocados=activos.filter(j=>convocadosIds.has(j.id));
        const suplentes=filas.filter(f=>f.rol==="SUPLENTE");
        const byId=new Map(activos.map(j=>[j.id,j]));
        const canEdit=esPrevia()&&habilitado&&!ocupada;
        const campo=$("mc-pitch-field");
        campo.classList.toggle("mc-pitch-free",modoLibre);
        const mover=$("mc-pitch-move"),reiniciar=$("mc-pitch-reset");
        if(mover){mover.setAttribute("aria-pressed",String(modoLibre));mover.disabled=!canEdit;mover.textContent=modoLibre?"✓ Terminar ajustes":"↔ Mover puestos";}
        if(reiniciar){reiniciar.hidden=!modoLibre;reiniciar.disabled=!canEdit;}
        const esquemaSel=$("mc-formation-select");
        esquemaSel.value=esquema;
        esquemaSel.disabled=!canEdit;
        $("mc-pitch-help").textContent=!esPrevia()?"Partido iniciado o finalizado: la alineación es de solo lectura.":
            !habilitado?"La pizarra se habilitará al instalar su SQL y comprobar Supabase.":
            !activos.length?"No hay fichas de jugadores disponibles en Supabase. Revisa el listado de jugadores.":
            !convocados.length?"Primero convoca a tus jugadores en Lista tradicional. Despues arma el once aqui en la cancha.":
            modoLibre?"Arrastra el círculo rojo de cada puesto con el dedo o mouse. El cambio se guarda al soltarlo. El puesto táctico y su jugador siguen siendo los mismos.":
            "Elige titulares entre los jugadores ya convocados. Filtra por posición principal o secundaria. Usa Mostrar fuera de posición si necesitas improvisar.";
        const mapa=organizarTitulares(esquema,filas,activos,asignaciones);
        asignaciones=mapa; // detectar ajustes al usar modo lista (no grabar automáticamente)
        $("mc-pitch-count").textContent=`${titulares.length}/11 titulares · ${Object.keys(mapa).length} en cancha`;
        $("mc-pitch-field").innerHTML=FORMACIONES[esquema].map((r,ri)=>`<div class="mc-pitch-row" data-row="${ri}">
           ${r.map(slot=>{
               const id=mapa[slot]||"";
               const yaOcupados=new Set(Object.entries(mapa).filter(([key])=>key!==slot).map(([,val])=>val));
               const disponibles=convocados.filter(j=>j.id===id || !yaOcupados.has(j.id));
               const grupos=[
                   {nombre:"Posición principal",valor:4},
                   {nombre:"Posición secundaria",valor:3},
                   {nombre:"Posición afín",valor:2},
                   {nombre:"Posición afín secundaria",valor:1},
                   {nombre:"Fuera de posición",valor:0}
               ];
               const opcionesAgrupadas=grupos.map(g=>{
                   const lista=disponibles.filter(j=>compatibilidadPuesto(slot,j)===g.valor &&
                        (g.valor>0 || mostrarTodos || j.id===id)).sort((a,b)=>nombreJugador(a).localeCompare(nombreJugador(b),"es"));
                   if(!lista.length)return "";
                   const items=lista.map(j=>`<option value="${escapar(j.id)}" ${j.id===id?"selected":""}>${escapar(nombre(j))} · ${escapar(normal(j.posicion)||"Sin posición")}${j.posicion_secundaria?` / ${escapar(normal(j.posicion_secundaria))}`:""}</option>`).join("");
                   return `<optgroup label="${escapar(g.nombre)}">${items}</optgroup>`;
               }).join("");
               const compatibles=disponibles.filter(j=>compatibilidadPuesto(slot,j)>0).length;
               const desubicado=!!id && compatibilidadPuesto(slot,byId.get(id))===0;
               const jugador=byId.get(id);
               const rango=jugador?jugador.dorsal??"✓":"+";
               const xy=ubicacion(slot);
               return `<label class="mc-pitch-slot ${desubicado?"mc-pitch-outside":""}" data-pitch-label="${escapar(slot)}" style="--slot-x:${xy.x}%;--slot-y:${xy.y}%" title="${escapar(PUESTOS[slot]||slot)}${desubicado?" · Jugador fuera de posición":""}">
                   <span class="mc-pitch-marker" data-pitch-drag="${escapar(slot)}" title="${modoLibre?"Arrastrar puesto táctico":"Puesto táctico"}">${escapar(rango)}</span><span class="mc-pitch-position">${escapar(slot)}</span>
                   <select data-pitch-slot="${escapar(slot)}" aria-label="${escapar(PUESTOS[slot]||slot)}" ${canEdit&&convocados.length?"":"disabled"}>
                     <option value="">Sin asignar</option>
                     ${opcionesAgrupadas}
                   </select>
                   ${desubicado?`<small class="mc-pitch-position-warning">Fuera de posición</small>`:""}
                   ${!compatibles && !id?`<small class="mc-pitch-no-candidates">Sin especialistas</small>`:""}
                   </label>`;
           }).join("")}</div>`).join("");
        const banco=$("mc-pitch-bench");
        if(banco){
            banco.innerHTML=suplentes.length
              ? suplentes.map(f=>{
                  const j=byId.get(f.jugador_id);
                  return `<span class="mc-bench-chip">${escapar(j?nombre(j):"Jugador convocado")}<small>${escapar(j?.posicion||"Sin posición")}</small></span>`;
                }).join("")
              : '<p class="mc-bench-empty">Aún no hay suplentes. Agrégalos en Lista tradicional.</p>';
        }
        const irLista=$("mc-go-roster");
        if(irLista) irLista.disabled=!esPrevia();
        $("mc-pitch-save-state").textContent=ocupada?"Guardando...":preparado?"Alineación sincronizada":"Pizarra pendiente";
        if(selectorTodos)selectorTodos.disabled=!canEdit;
        if(mensajeError)aviso(mensajeError,"error");
    }
    async function guardar(){
        const {error}=await supabase.from("deportivo_formaciones_partido").upsert({partido_id:partidoId,esquema,posiciones:asignaciones,ubicaciones},{onConflict:"partido_id"});
        if(error)throw Error(`No se pudo guardar la distribución táctica: ${error.message}`);
    }
    async function cargar(){
        const id=partidoId;
        const {data,error}=await supabase.from("deportivo_formaciones_partido").select("esquema,posiciones,ubicaciones").eq("partido_id",id).maybeSingle();
        if(partidoId!==id)return;
        habilitado=!error;
        if(error){
            mensajeError="La pizarra requiere la migración SQL de formaciones. La lista tradicional sigue disponible. Detalle: "+error.message;
            $("mc-roster-message").textContent=mensajeError;
            seleccionarModo("lista");
        }
        else {mensajeError="";esquema=FORMACIONES[data?.esquema]?data.esquema:"4-3-3";asignaciones=data?.posiciones||{};ubicaciones=data?.ubicaciones||{};}
        preparado=true;
        render();
    }
    const botonMover=$("mc-pitch-move");
    if(botonMover)botonMover.addEventListener("click",()=>{
        if(!esPrevia()||!habilitado||ocupada)return;
        modoLibre=!modoLibre;render();
        aviso(modoLibre?"Arrastra los círculos rojos para personalizar la ubicación. Los jugadores no cambian de puesto.":"Posiciones tácticas guardadas.","success");
    });
    const botonReiniciar=$("mc-pitch-reset");
    if(botonReiniciar)botonReiniciar.addEventListener("click",async()=>{
        if(!esPrevia()||!habilitado||ocupada)return;
        const antes={...ubicaciones};ubicaciones={};ocupada=true;render();
        try{await guardar();aviso("Distribución predeterminada restaurada.","success");}
        catch(e){ubicaciones=antes;aviso(e.message,"error");}
        finally{ocupada=false;render();}
    });
    // Pointer Events: compatible con mouse y pantalla táctil. Solo el círculo se arrastra;
    // los selectores de jugadores continúan siendo accesibles con teclado o touch.
    let arrastre=null;
    const campoMov=$("mc-pitch-field");
    campoMov.addEventListener("pointerdown",event=>{
        const circulo=event.target.closest("[data-pitch-drag]");
        if(!circulo||!modoLibre||!esPrevia()||!habilitado||ocupada)return;
        const slot=circulo.dataset.pitchDrag;
        const label=circulo.closest("[data-pitch-label]");
        if(!label||!FORMACIONES[esquema].flat().includes(slot))return;
        arrastre={id:event.pointerId,slot,label,circulo,antes:{...ubicaciones},original:ubicacion(slot),movio:false};
        circulo.setPointerCapture(event.pointerId);
        event.preventDefault();
    });
    campoMov.addEventListener("pointermove",event=>{
        if(!arrastre||event.pointerId!==arrastre.id)return;
        const rect=campoMov.getBoundingClientRect();
        const rectSlot=arrastre.label.getBoundingClientRect();
        const margenX=limitar(100*(rectSlot.width/2+4)/rect.width,8,35);
        const margenY=limitar(100*(rectSlot.height/2+4)/rect.height,10,32);
        const x=limitar((event.clientX-rect.left)*100/rect.width,margenX,100-margenX);
        const y=limitar((event.clientY-rect.top)*100/rect.height,margenY,100-margenY);
        arrastre.label.style.setProperty("--slot-x",`${x}%`);
        arrastre.label.style.setProperty("--slot-y",`${y}%`);
        ubicaciones[arrastre.slot]={x:Math.round(x*10)/10,y:Math.round(y*10)/10};
        arrastre.movio=true;
        event.preventDefault();
    });
    async function terminarArrastre(event){
        if(!arrastre||event.pointerId!==arrastre.id)return;
        const actual=arrastre;arrastre=null;
        if(!actual.movio){return;}
        if(event.type==="pointercancel"){ubicaciones=actual.antes;render();return;}
        ocupada=true;
        try{await guardar();aviso("Ubicación del puesto guardada.","success");}
        catch(e){ubicaciones=actual.antes;aviso(`No se guardó el movimiento: ${e.message}`,"error");}
        finally{ocupada=false;render();}
    }
    campoMov.addEventListener("pointerup",terminarArrastre);
    campoMov.addEventListener("pointercancel",terminarArrastre);
    $("mc-formation-select").addEventListener("change",async event=>{
        if(!esPrevia()||!habilitado||ocupada)return;
        const nuevo=event.target.value;if(!FORMACIONES[nuevo])return;
        const antes={esquema,asignaciones:{...asignaciones},ubicaciones:{...ubicaciones}};
        esquema=nuevo; ubicaciones={}; asignaciones=organizarTitulares(esquema,obtenerAlineacion(),obtenerJugadores(),{});
        ocupada=true;render();
        try{await guardar();aviso("Esquema guardado correctamente.","success");}
        catch(e){esquema=antes.esquema;asignaciones=antes.asignaciones;ubicaciones=antes.ubicaciones;aviso(e.message,"error");}
        finally{ocupada=false;render();}
    });
    $("mc-pitch-field").addEventListener("change",async event=>{
        const selector=event.target.closest("[data-pitch-slot]");
        if(!selector||!esPrevia()||!habilitado||ocupada)return;
        const slot=selector.dataset.pitchSlot,id=selector.value;
        if(!FORMACIONES[esquema].flat().includes(slot))return;
        const old=asignaciones[slot]||"";
        if(id===old)return;
        if(id && Object.entries(asignaciones).some(([key,val])=>key!==slot&&val===id))return aviso("Este jugador ya ocupa otra posición.","error");
        if(id && !obtenerAlineacion().some(f=>f.jugador_id===id))return aviso("Primero debes convocar al jugador desde Lista tradicional.","error");
        if(id && !obtenerJugadores().some(j=>j.id===id&&normal(j.estado)!=="INACTIVO"))return aviso("Jugador no disponible.","error");
        ocupada=true;render();aviso("Guardando cambio en la formación...");
        let changed=false;
        try{
            // La RPC conserva las mismas reglas del modo Lista (máximo de titulares,
            // estado del partido, etc.). Primero libera el puesto anterior.
            if(old){const r=await supabase.rpc("guardar_convocado_partido_admin",{p_partido_id:partidoId,p_jugador_id:old,p_rol:"SUPLENTE"});if(r.error)throw Error(r.error.message);changed=true;}
            if(id){const r=await supabase.rpc("guardar_convocado_partido_admin",{p_partido_id:partidoId,p_jugador_id:id,p_rol:"TITULAR"});if(r.error)throw Error(r.error.message);changed=true;}
            if(id)asignaciones[slot]=id;else delete asignaciones[slot];
            await guardar();
            aviso("Posición y convocatoria guardadas en Supabase.","success");
        }catch(e){aviso(`No se completó la asignación: ${e.message}. Comprueba la convocatoria antes de continuar.`,"error");}
        finally{
            if(changed)await refrescarConvocatoria();
            ocupada=false;
            // No confiar en el cliente si la segunda operación falló: la fuente
            // real es la alineación, y la pizarra se reconcilia con ella.
            render();
        }
    });
    return {
        async abrir(id){partidoId=id;esquema="4-3-3";asignaciones={};ubicaciones={};modoLibre=false;habilitado=false;ocupada=false;preparado=false;mensajeError="";mostrarTodos=false;if(selectorTodos)selectorTodos.checked=false;seleccionarModo("cancha");render();await cargar();},
        render,
        actualizarDesdePlantel(){if(partidoId)render();}
    };
}
