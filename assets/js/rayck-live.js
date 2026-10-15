/* Rayckington LIVE V1: lectura pública exclusivamente por RPC controlada. */
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const db = createClient("https://auutiadcyhhwxzkeernd.supabase.co", "sb_publishable_luWCBHYOSUsFbmgPU4GoiQ_9nmBMRHe", {
  auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}
});
const $ = id => document.getElementById(id);
const esc = text => String(text ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uuid = new URLSearchParams(window.location.search).get('partido') || '';
const validId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
const LOGO = "assets/img/logo/logo.png";
const RIVAL_LOGOS = {
  "la plaza united":"assets/img/logo/rivales/logos-pequenos/plaza-115x128.png",
  "atletico f.c":"assets/img/logo/rivales/logos-pequenos/atletico-fc-1-128x126.png"
};
const FORMACIONES = {
 "4-3-3":[["EI","DC","ED"],["MC-I","MC","MC-D"],["LI","DFC-I","DFC-D","LD"],["POR"]],
 "4-4-2":[["DC-I","DC-D"],["MI","MC-I","MC-D","MD"],["LI","DFC-I","DFC-D","LD"],["POR"]],
 "4-4-1-1":[["DC"],["MCO"],["MI","MC-I","MC-D","MD"],["LI","DFC-I","DFC-D","LD"],["POR"]],
 "4-2-3-1":[["DC"],["EI","MCO","ED"],["MCD-I","MCD-D"],["LI","DFC-I","DFC-D","LD"],["POR"]],
 "3-5-2":[["DC-I","DC-D"],["MI","MC-I","MCO","MC-D","MD"],["DFC-I","DFC","DFC-D"],["POR"]],
 "5-3-2":[["DC-I","DC-D"],["MC-I","MC","MC-D"],["LI","DFC-I","DFC","DFC-D","LD"],["POR"]],
 "4-1-4-1":[["DC"],["MI","MC-I","MC-D","MD"],["MCD"],["LI","DFC-I","DFC-D","LD"],["POR"]]
};
let current=null, cargando=false;
const formatDate = s => { if(!s)return 'Fecha por confirmar'; const d=new Date(s);return Number.isNaN(d.getTime())?'Fecha por confirmar':new Intl.DateTimeFormat('es-CL',{dateStyle:'full',timeStyle:'short',timeZone:'America/Santiago'}).format(d); };
const stateLive = x => ['EN_VIVO','ENTRETIEMPO'].includes(x);
const started = x => ['EN_VIVO','ENTRETIEMPO','FINALIZADO'].includes(x);
function clockText(p){
  if(!p)return '';
  if(p.estado==='PROGRAMADO')return 'Próximamente';
  if(p.estado==='FINALIZADO')return 'Finalizado';
  if(p.estado==='ENTRETIEMPO')return 'Entretiempo';
  if(p.estado==='SUSPENDIDO')return 'Suspendido';
  if(p.estado==='CANCELADO')return 'Cancelado';
  let secs=Number(p.cronometro_segundos_acumulados)||0;
  if(p.cronometro_corriendo&&p.cronometro_inicio_at){
    const dt=Date.now()-new Date(p.cronometro_inicio_at).getTime();
    if(Number.isFinite(dt))secs+=Math.max(0,dt/1000);
  }
  const min=Math.max(Number(p.minuto_actual)||0,Math.floor(secs/60));
  return `${min}' · En vivo`;
}
function players(p){return Array.isArray(p?.alineacion)?p.alineacion:[];}
function renderPitch(p){
  const cancha=$('live-pitch');
  const form=p.formacion;
  const slots=FORMACIONES[form?.esquema];
  const holders=form?.posiciones;
  if(!slots||!holders){cancha.hidden=true;return;}
  const starters=new Map(players(p).filter(x=>x.rol==='TITULAR').map(x=>[x.jugador_id,x]));
  const parts=[];
  for(let i=0;i<slots.length;i++){
    for(let j=0;j<slots[i].length;j++){
      const slot=slots[i][j],row=slots[i];
      const pos=form?.ubicaciones?.[slot];
      const x=Number(pos?.x),y=Number(pos?.y);
      const xx=Number.isFinite(x)?Math.max(8,Math.min(92,x)):100*(j+1)/(row.length+1);
      const yy=Number.isFinite(y)?Math.max(8,Math.min(92,y)):12+76*i/Math.max(1,slots.length-1);
      const pl=starters.get(holders[slot]);
      parts.push(`<div class="live-pitch-player" style="left:${xx}%;top:${yy}%" title="${esc(slot)}"><span class="live-pitch-number">${pl?.dorsal!=null?esc(pl.dorsal):'·'}</span><span class="live-pitch-name">${esc(pl?.nombre||slot)}</span></div>`);
    }
  }
  cancha.innerHTML=parts.join(''); cancha.hidden=false;
}
function renderLineup(p){
  const startedMatch=started(p.estado), todos=players(p);
  if(!startedMatch){
    $('live-scheme').textContent='La alineación se mostrará cuando comience el encuentro.';
    $('live-pitch').hidden=true;
    $('live-starting').innerHTML=''; $('live-bench').innerHTML='';return;
  }
  $('live-scheme').textContent=p.modo_respaldo ? 'La alineación detallada no está disponible temporalmente.' : p.formacion?.esquema?`Formación ${p.formacion.esquema}`:'Once titular';
  const show=items=>items.length?items.map(j=>`<div class="live-player"><span class="live-dorsal">${j.dorsal!=null?esc(j.dorsal):'—'}</span><span>${esc(j.nombre)}</span></div>`).join(''):'<p class="live-empty">Aún no hay jugadores registrados.</p>';
  $('live-starting').innerHTML=show(todos.filter(x=>x.rol==='TITULAR'));
  $('live-bench').innerHTML=show(todos.filter(x=>x.rol==='SUPLENTE'));
  renderPitch(p);
}
const labels={GOL:'⚽ Gol',AUTOGOL:'⚽ Autogol',AMARILLA:'🟨 Amarilla',ROJA:'🟥 Roja',TIRO:'🎯 Tiro',TIRO_AL_ARCO:'🎯 Tiro al arco'};
function renderEvents(p){
  if(!started(p.estado)){$('live-events').innerHTML='<p class="live-empty">El minuto a minuto comenzará cuando arranque el encuentro.</p>';return;}
  const events=(Array.isArray(p.eventos)?p.eventos:[]).map(x=>({min:Math.max(0,Number(x.minuto)||0),ad:Number(x.adicional)||0,html:`<div class="live-event"><span>${esc(x.minuto)}'${x.adicional?`+${esc(x.adicional)}`:''}</span><div><strong>${esc(labels[x.tipo]||String(x.tipo||'Evento').replaceAll('_',' '))} · ${esc(x.equipo==='RAYCKINGTON'?'Rayckington FC':'Rival')}</strong><p>${esc(x.nombre)}${x.asistencia?` · Asistencia: ${esc(x.asistencia)}`:''}${x.detalle?` · ${esc(x.detalle)}`:''}</p></div></div>`}));
  const changes=(Array.isArray(p.cambios)?p.cambios:[]).map(x=>({min:Number(x.minuto)||0,ad:0,html:`<div class="live-event"><span>${esc(x.minuto)}'</span><div><strong>🔁 Sustitución · Rayckington FC</strong><p>Entra ${esc(x.entra)} · Sale ${esc(x.sale)}</p></div></div>`}));
  const list=[...events,...changes].sort((a,b)=>b.min-a.min||b.ad-a.ad);
  $('live-events').innerHTML=list.length?list.map(x=>x.html).join(''):(p.modo_respaldo ? '<p class="live-empty">Las jugadas detalladas no están disponibles temporalmente.</p>' : '<p class="live-empty">Todavía no se han registrado jugadas.</p>');
}
function render(p){
  const rayLocal=p.condicion==='LOCAL', rival=p.rival||'Rival', rScore=p.goles_rayckington, oScore=p.goles_rival;
  $('live-stage').textContent=`FECHA ${p.jornada??'—'} · ${p.estado==='PROGRAMADO'?'PRÓXIMO PARTIDO':stateLive(p.estado)?'● EN VIVO':p.estado==='FINALIZADO'?'RESULTADO FINAL':p.estado}`;
  $('live-local').textContent=rayLocal?'Rayckington FC':rival;
  $('live-visita').textContent=rayLocal?rival:'Rayckington FC';
  $('live-logo-local').src=rayLocal?LOGO:(RIVAL_LOGOS[rival.toLowerCase()]||'assets/img/logo/rivales/rival-default.svg');
  $('live-logo-visita').src=rayLocal?(RIVAL_LOGOS[rival.toLowerCase()]||'assets/img/logo/rivales/rival-default.svg'):LOGO;
  $('live-score').textContent=p.estado==='PROGRAMADO'?'VS':`${rayLocal?(rScore??0):(oScore??0)} - ${rayLocal?(oScore??0):(rScore??0)}`;
  $('live-clock').textContent=clockText(p);
  $('live-date').textContent=formatDate(p.fecha_hora);
  $('live-place').textContent=p.lugar||'Lugar por confirmar';
  $('live-updated').textContent=`Actualizado ${new Date().toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit'})}`;
  $('live-error').hidden=true;$('live-content').hidden=false;
  renderLineup(p); renderEvents(p);
}
// En caso de error de la cronología, mostrar SOLO datos ya públicos del partido.
// No consulta tablas privadas ni inventa alineaciones/eventos.
async function obtenerMarcadorPublicoRespaldo(){
  const {data,error}=await db.rpc('obtener_partidos_rayckington_web');
  if(error)throw error;
  const p=(Array.isArray(data)?data:[]).find(x=>String(x.id)===uuid);
  if(!p)return null;
  return {
    estado:p.estado, rival:p.rival_nombre, condicion:p.condicion,
    goles_rayckington:p.goles_rayckington, goles_rival:p.goles_rival,
    fecha_hora:p.fecha_hora, lugar:p.lugar, jornada:p.jornada,
    minuto_actual:p.minuto_actual, cronometro_corriendo:p.cronometro_corriendo,
    cronometro_inicio_at:p.cronometro_inicio_at,
    cronometro_segundos_acumulados:p.cronometro_segundos_acumulados,
    alineacion:[], cambios:[], eventos:[], formacion:null, modo_respaldo:true
  };
}
async function update(){
  if(cargando||!validId)return;
  cargando=true;
  try{
    const {data,error}=await db.rpc('obtener_seguimiento_partido_web',{p_partido_id:uuid});
    if(error)throw error;
    const detalle=Array.isArray(data)?data[0]:data;
    if(!detalle){
      const respaldo=await obtenerMarcadorPublicoRespaldo();
      if(!respaldo){current=null;$('live-content').hidden=true;$('live-error').hidden=false;$('live-error').textContent='Este partido todavía no está publicado o no se encuentra disponible.';return;}
      current=respaldo;
    }else{current=detalle;}
    render(current);
    if(current.modo_respaldo){
      $('live-error').hidden=false;
      $('live-error').textContent='Marcador público disponible. La alineación y la cronología detallada no están disponibles temporalmente.';
    }
  }catch(e){
    console.warn('Rayckington Live: detalle no disponible',e);
    try{
      const respaldo=await obtenerMarcadorPublicoRespaldo();
      if(respaldo){current=respaldo;render(current);$('live-error').hidden=false;
        $('live-error').textContent='Mostrando el resultado oficial; la cronología detallada no está disponible por ahora.';return;}
    }catch(e2){console.warn('Rayckington Live: resumen público no disponible',e2);}
    if(!current){$('live-error').hidden=false;
      $('live-error').textContent='No se pudo cargar el partido público. Comprueba la conexión o vuelve a intentarlo.';}
  }finally{cargando=false;}
}
if(!validId){$('live-error').textContent='El enlace del partido es incorrecto. Vuelve a la página de Partidos.';}
else{update();setInterval(()=>{if(!document.hidden)update();},10000);setInterval(()=>{if(current&&stateLive(current.estado))$('live-clock').textContent=clockText(current);},1000);}
