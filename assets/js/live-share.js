/* Rayckington Live - compartir sin consultar ni modificar Supabase. */
(() => {
  'use strict';
  const whatsapp = document.getElementById('live-share-whatsapp');
  const copiar = document.getElementById('live-share-copy');
  if (!whatsapp || !copiar) return;

  const partidoId = new URLSearchParams(window.location.search).get('partido') || '';
  const uuidValido = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(partidoId);
  if (!uuidValido) {
    whatsapp.hidden = true;
    copiar.hidden = true;
    return;
  }

  // Dominio oficial: evita enviar enlaces localhost al probar con Live Server.
  const url = `https://rayckingtonfc.cl/seguimiento.html?partido=${encodeURIComponent(partidoId)}`;
  const valor = id => (document.getElementById(id)?.textContent || '').trim();

  function mensaje() {
    // Reutiliza lo que YA muestra rayck-live.js; nunca duplica la lectura de la RPC.
    const local = valor('live-local');
    const visita = valor('live-visita');
    const marcador = valor('live-score');
    const etapa = valor('live-stage');
    const reloj = valor('live-clock');
    const fecha = valor('live-date');
    const lineas = [
      '⚽ RAYCKINGTON LIVE',
      `${local} ${marcador} ${visita}`,
      etapa,
      reloj,
      fecha,
      '📲 Sigue el partido y su minuto a minuto:',
      url
    ];
    return lineas.filter(Boolean).join('\n');
  }

  // El href se genera justo antes de compartir para incluir el marcador actualizado.
  whatsapp.addEventListener('click', () => {
    whatsapp.href = `https://wa.me/?text=${encodeURIComponent(mensaje())}`;
  });

  copiar.addEventListener('click', async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API no disponible');
      await navigator.clipboard.writeText(url);
      const original = 'Copiar enlace';
      copiar.textContent = '✓ Enlace copiado';
      window.setTimeout(() => { copiar.textContent = original; }, 1800);
    } catch (_) {
      // Alternativa para navegadores sin permisos de portapapeles.
      window.prompt('Copia este enlace para compartir el partido:', url);
    }
  });
})();
