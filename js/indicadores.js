/*
 * Integração opcional de indicadores.
 * DESLIGADA por padrão. Sem analyticsEnabled + HTTPS + aceite explícito,
 * não registra e não transmite eventos, dados pessoais ou identificadores.
 * Não confundir clique em agendamento com agendamento confirmado.
 */
(() => {
  'use strict';
  const cfg = window.EQUILIBRIO_CONFIG || {};
  if (cfg.analyticsEnabled !== true || !cfg.analyticsEndpoint) return;
  let endpoint;
  try {
    endpoint = new URL(cfg.analyticsEndpoint);
    if (endpoint.protocol !== 'https:') return;
  } catch { return; }
  const allowedSources = new Set(['google', 'instagram', 'indicacao', 'outro']);
  const sourceSelect = document.getElementById('referral-source');
  const params = new URLSearchParams(location.search);
  const rawSource = sourceSelect?.value || params.get('utm_source') || '';
  const source = allowedSources.has(rawSource) ? rawSource : 'nao_informada';
  const allowedEvents = new Set(['clique_whatsapp', 'clique_agendar', 'formulario_iniciado', 'formulario_recebido']);
  let permission = null;
  try { permission = sessionStorage.getItem('equilibrio_metrics_consent'); } catch { permission = null; }

  function sendMetric(eventName) {
    if (permission !== 'yes' || !allowedEvents.has(eventName)) return;
    const payload = { event: eventName, source, page: location.pathname.split('/').pop() || 'index.html' };
    // Sem textos livres, telefone, nome, e-mail ou dados de saúde.
    fetch(endpoint.href, {
      method: 'POST', mode: 'cors', credentials: 'omit', keepalive: true,
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    }).catch(() => { /* falhas são tratadas pelo serviço analítico, não afetam o formulário */ });
  }

  if (permission !== 'yes' && permission !== 'no') {
    const banner = document.createElement('section');
    banner.className = 'metrics-consent';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Preferência sobre estatísticas de uso');
    banner.innerHTML = `
      <p><strong>Podemos medir interações do site?</strong> Estatísticas opcionais ajudam a melhorar o atendimento. Nenhum texto do formulário será enviado para análise. <a href="politica-de-privacidade.html">Ver privacidade</a>.</p>
      <div><button type="button" class="btn btn-primary" id="metrics-yes">Aceitar métricas</button><button type="button" class="btn btn-outline" id="metrics-no">Não aceitar</button></div>`;
    document.body.append(banner);
    const choose = value => {
      permission = value;
      try { sessionStorage.setItem('equilibrio_metrics_consent', value); } catch { /* somente sessão atual */ }
      banner.remove();
    };
    banner.querySelector('#metrics-yes').addEventListener('click', () => choose('yes'));
    banner.querySelector('#metrics-no').addEventListener('click', () => choose('no'));
  }

  document.addEventListener('click', event => {
    const a = event.target.closest('a');
    if (!a) return;
    if (a.matches('[data-contact-link="whatsapp"]') && a.href.startsWith('https://wa.me/')) sendMetric('clique_whatsapp');
    if (a.matches('a[href^="agendamento.html"]')) sendMetric('clique_agendar');
  });
  const form = document.getElementById('contact-form');
  if (form) {
    let started = false;
    form.addEventListener('focusin', () => {
      if (!started) { started = true; sendMetric('formulario_iniciado'); }
    });
  }
  document.addEventListener('equilibrio:form_recebido', () => sendMetric('formulario_recebido'));
  document.addEventListener('equilibrio:whatsapp_aberto', () => sendMetric('clique_whatsapp'));
})();
