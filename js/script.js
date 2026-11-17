/* Equilíbrio Ativo — JavaScript sem dependências externas. */
(() => {
  'use strict';
  const config = window.EQUILIBRIO_CONFIG || {};
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const brl = (amount) => Number(amount).toLocaleString('pt-BR', {style:'currency',currency:'BRL'});

  // Informações editáveis sem modificar o HTML.
  $$('[data-config="launchText"]').forEach(el => { el.textContent = config.launchStatus === 'aberto' ? 'Estúdio aberto · venha nos conhecer' : (config.launchText || 'Em breve'); });
  $$('[data-config="statusShort"]').forEach(el => { el.textContent = config.launchStatus === 'aberto' ? 'Estamos abertos' : 'Estamos chegando'; });
  $$('[data-config="address"]').forEach(el => { el.textContent = config.address || `${config.neighborhood || 'Coqueiros'}, ${config.city || 'Florianópolis'}/${config.state || 'SC'}`; });
  $$('[data-config="hoursWeekdays"]').forEach(el => { el.textContent = config.hours?.weekdays || ''; });
  $$('[data-config="hoursSaturday"]').forEach(el => { el.textContent = config.hours?.saturday || ''; });
  $$('[data-price="essencial"]').forEach(el => { el.textContent = brl(config.prices?.essencial ?? 369.90); });
  $$('[data-price="autonomia"]').forEach(el => { el.textContent = brl(config.prices?.autonomia ?? 489.90); });
  const year = $('#copyright-year');
  if (year) year.textContent = new Date().getFullYear();

  // Links de contato visíveis somente se foram realmente configurados.
  const phone = String(config.phoneWhatsApp || '').replace(/\D/g, '');
  const validPhone = /^55\d{10,11}$/.test(phone);
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email || '');
  const validURL = value => { try { return new URL(value).protocol === 'https:'; } catch { return false; } };
  $$('[data-contact-link="whatsapp"]').forEach(el => {
    if (validPhone) {
      el.href = `https://wa.me/${phone}?text=${encodeURIComponent('Olá! Gostaria de saber mais sobre o Estúdio Equilíbrio Ativo.')}`;
      el.hidden = false;
    } else el.hidden = true;
  });
  $$('[data-contact-link="instagram"]').forEach(el => {
    if (validURL(config.instagramUrl)) { el.href = config.instagramUrl; el.hidden = false; }
    else el.hidden = true;
  });
  $$('[data-contact-link="email"]').forEach(el => {
    if (validEmail) { el.href = `mailto:${config.email}`; el.textContent = config.email; el.hidden = false; }
    else el.hidden = true;
  });
  $$('[data-contact-link="maps"]').forEach(el => {
    if (validURL(config.locationUrl)) { el.href = config.locationUrl; el.hidden = false; }
    else el.hidden = true;
  });

  // Menu mobile com navegação por teclado, clique fora e tecla Esc.
  const menuButton = $('.menu-toggle');
  const menu = $('#main-nav');
  function closeMenu(restoreFocus = false) {
    if (!menu || !menuButton) return;
    menu.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir menu');
    menuButton.querySelector('path')?.setAttribute('d', 'M4 7h16M4 12h16M4 17h16');
    document.body.classList.remove('menu-open');
    if (restoreFocus) menuButton.focus();
  }
  if (menu && menuButton) {
    menuButton.addEventListener('click', () => {
      const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
      if (isOpen) closeMenu();
      else {
        menu.classList.add('is-open');
        menuButton.setAttribute('aria-expanded', 'true');
        menuButton.setAttribute('aria-label', 'Fechar menu');
        menuButton.querySelector('path')?.setAttribute('d', 'M6 6l12 12M18 6 6 18');
        document.body.classList.add('menu-open');
        $('#main-nav a')?.focus();
      }
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu.classList.contains('is-open')) closeMenu(true);
    });
    document.addEventListener('click', (event) => {
      if (!menu.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
    });
    $$('#main-nav a').forEach(a => a.addEventListener('click', () => closeMenu()));
    window.matchMedia('(min-width: 1251px)').addEventListener('change', e => { if (e.matches) closeMenu(); });
  }

  // Botão voltar ao topo.
  const backTop = $('.back-to-top');
  if (backTop) {
    const updateTop = () => { backTop.hidden = window.scrollY < 480; };
    window.addEventListener('scroll', updateTop, {passive: true});
    updateTop();
    backTop.addEventListener('click', () => window.scrollTo({top:0,behavior:reducedMotion.matches?'instant':'smooth'}));
  }

  // Ao seguir um CTA de plano ou aula experimental, preencher interesse e mensagem.
  const planParam = new URLSearchParams(window.location.search).get('plano');
  const params = new URLSearchParams(window.location.search);
  const interestParam = params.get('interesse');
  const sourceParam = params.get('utm_source');
  const sourceSelect = $('#referral-source');
  if (sourceSelect && ['google','instagram','indicacao','outro'].includes(sourceParam)) sourceSelect.value = sourceParam;
  const interest = $('#interest');
  const message = $('#message');
  const preset = {essencial:'Movimento Essencial',autonomia:'Autonomia Ativa'};
  if (interest) {
    if (planParam && preset[planParam]) {
      interest.value = planParam;
      if (message && !message.value) message.value = `Olá! Gostaria de saber mais sobre o plano ${preset[planParam]}.`;
    } else if (interestParam === 'experimental') {
      interest.value = 'experimental';
      if (message && !message.value) message.value = 'Olá! Gostaria de agendar uma aula experimental gratuita.';
    }
  }

  // Formulário honesto: sem serviço configurado, prepara a mensagem e não simula envio.
  const form = $('#contact-form');
  if (form) {
    const formButton = $('#form-submit');
    const formAlert = $('#form-feedback');
    const draftBox = $('#message-draft');
    const draftText = $('#draft-text');
    const copyButton = $('#copy-draft');
    const mode = validPhone ? 'whatsapp' : (validURL(config.contactFormEndpoint) ? 'endpoint' : (validEmail ? 'email' : 'preview'));
    if (formButton) formButton.textContent = mode === 'whatsapp' ? 'Abrir conversa no WhatsApp' : mode === 'endpoint' ? 'Enviar mensagem' : mode === 'email' ? 'Abrir e-mail para envio' : 'Preparar mensagem';
    if (mode === 'preview') {
      const note = $('#form-mode-note');
      if (note) note.textContent = 'Os canais de atendimento ainda serão divulgados. Você pode preparar e copiar sua mensagem; nenhum dado será enviado nesta versão.';
    }
    const tell = (txt, kind) => {
      formAlert.textContent = txt;
      formAlert.className = `form-feedback ${kind}`;
      formAlert.hidden = false;
      formAlert.focus();
    };
    let lastDraft = '';
    form.addEventListener('submit', async event => {
      event.preventDefault();
      formAlert.hidden = true;
      if (!form.reportValidity()) return;
      const name = $('#full-name').value.trim();
      const email = $('#email').value.trim();
      const selected = $('#interest').selectedOptions[0]?.textContent || 'Informações gerais';
      const detail = $('#message').value.trim();
      const origin = $('#referral-source')?.value || '';
      const sourceLabels = {google:'Google',instagram:'Instagram',indicacao:'Indicação',outro:'Outro'};
      const originText = sourceLabels[origin] || 'Não informada';
      if (name.length < 2 || detail.length < 10) {
        tell('Confira o nome e descreva sua solicitação com pelo menos 10 caracteres.', 'error');
        return;
      }
      lastDraft = `Olá, Equilíbrio Ativo!\nNome: ${name}\nE-mail: ${email}\nInteresse: ${selected}\nOrigem: ${originText}\nMensagem: ${detail}`;
      if (mode === 'whatsapp') {
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(lastDraft)}`, '_blank', 'noopener,noreferrer');
        document.dispatchEvent(new CustomEvent('equilibrio:whatsapp_aberto'));
        tell('Abrimos uma conversa no WhatsApp. O envio depende da sua confirmação e a visita só estará agendada quando a equipe responder.', 'info');
      } else if (mode === 'email') {
        window.location.href = `mailto:${config.email}?subject=${encodeURIComponent('Contato pelo site — Equilíbrio Ativo')}&body=${encodeURIComponent(lastDraft)}`;
        tell('Abrimos seu aplicativo de e-mail com a mensagem pronta. O envio só ocorre se você confirmar no aplicativo.', 'info');
      } else if (mode === 'endpoint') {
        formButton.disabled = true;
        formButton.textContent = 'Enviando…';
        try {
          const response = await fetch(config.contactFormEndpoint, {
            method:'POST',headers:{'Content-Type':'application/json'},
            body: JSON.stringify({name,email,interest:interest.value,source:origin,message:detail,consent:!!$("#privacy-check")?.checked})
          });
          if (!response.ok) throw new Error('Falha no serviço de envio');
          document.dispatchEvent(new CustomEvent('equilibrio:form_recebido'));
          form.reset();
          tell('O serviço confirmou o recebimento da solicitação. Isso não confirma uma visita ou reserva: aguarde resposta da equipe.', 'success');
        } catch(error) { tell('Não foi possível confirmar o envio. Tente novamente mais tarde ou utilize um canal oficial.', 'error'); }
        finally { formButton.disabled = false; formButton.textContent = 'Enviar mensagem'; }
      } else {
        draftText.textContent = lastDraft;
        draftBox.hidden = false;
        tell('Mensagem preparada no navegador. Ela ainda não foi enviada ao estúdio.', 'info');
        draftBox.scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth',block:'nearest'});
      }
    });
    copyButton?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(lastDraft);
        copyButton.textContent = 'Mensagem copiada ✓';
      } catch {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(draftText);
        selection.removeAllRanges(); selection.addRange(range);
        tell('Selecione e copie a mensagem acima com Ctrl+C.', 'info');
      }
    });
  }
})();
