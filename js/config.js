/**
 * EQUILÍBRIO ATIVO — CONFIGURAÇÃO CENTRAL
 * Preencha somente informações reais e verificadas antes de publicar.
 * NUNCA preencha aqui os contatos fictícios usados no trabalho acadêmico.
 * Campos vazios escondem recursos que ainda não estão disponíveis.
 * Para atualizar horários, planos e lançamento, altere os valores abaixo.
 */
window.EQUILIBRIO_CONFIG = Object.freeze({
  brand: 'Estúdio Equilíbrio Ativo',
  city: 'Florianópolis',
  neighborhood: 'Coqueiros',
  state: 'SC',
  address: '', // Ex.: Rua ..., 000 — só preencher após confirmar o imóvel.
  locationUrl: '', // URL oficial do local no Google Maps.
  phoneWhatsApp: '', // Só números, incluindo DDI 55 e DDD. Ex.: 5548999999999.
  email: '', // E-mail comercial real.
  instagramUrl: '', // URL do perfil oficial, quando existir.
  domain: '', // Domínio definitivo, incluindo https://.
  analyticsEnabled: false, // Ativar apenas após governança, política publicada e implementação de consentimento.
  analyticsEndpoint: '', // URL HTTPS validada; não fornece acesso ao CRM.
  contactFormEndpoint: '', // Endpoint HTTPS POST/JSON, se configurado.
  launchStatus: 'pre-lancamento', // 'pre-lancamento' ou 'aberto'
  launchText: 'Inauguração prevista para o 1º semestre de 2027',
  hours: {
    weekdays: 'Segunda a sexta · 7h às 11h e 14h às 18h',
    saturday: 'Sábado · 8h às 12h',
    sunday: 'Domingo · fechado'
  },
  prices: {
    essencial: 369.90,
    autonomia: 489.90
  }
});
