// Solo copia datos de transferencia. No modifica cuotas, pagos ni Supabase.
(() => {
  const fields = [
    ['holder', 'Titular'],
    ['rut', 'RUT'],
    ['bank', 'Institución'],
    ['type', 'Tipo de cuenta'],
    ['account', 'Número de cuenta'],
    ['email', 'Correo']
  ];

  function fieldValue(card, key) {
    return card.querySelector(`[data-transfer-field="${key}"]`)?.textContent?.trim() || '';
  }

  function fallbackCopy(value) {
    const input = document.createElement('textarea');
    input.value = value;
    input.setAttribute('readonly', '');
    input.style.position = 'fixed';
    input.style.left = '-9999px';
    input.style.top = '0';
    document.body.appendChild(input);
    input.focus();
    input.select();
    try { input.setSelectionRange(0, value.length); } catch (_) { /* navegador */ }
    let copied = false;
    try { copied = document.execCommand('copy'); } catch (_) { /* navegador */ }
    input.remove();
    return copied;
  }

  async function copyText(value) {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(value);
        return true;
      } catch (_) { /* alternativa para navegadores móviles */ }
    }
    return fallbackCopy(value);
  }

  document.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-transfer-copy]');
    if (!button) return;
    const card = button.closest('.ray-transfer-card');
    if (!card) return;

    const isAccount = button.dataset.transferCopy === 'account';
    const data = isAccount
      ? fieldValue(card, 'account')
      : fields.map(([key, name]) => `${name}: ${fieldValue(card, key)}`).join('\n');
    const feedback = card.querySelector('.ray-transfer-feedback');
    button.disabled = true;
    try {
      const success = await copyText(data);
      if (feedback) {
        feedback.dataset.error = String(!success);
        feedback.textContent = success
          ? (isAccount ? 'Número de cuenta copiado.' : '¡Datos bancarios copiados! Ya puedes pegarlos.')
          : 'No se pudo copiar automáticamente. Mantén presionado el número de cuenta para copiarlo.';
      }
    } finally {
      button.disabled = false;
    }
  });
})();
