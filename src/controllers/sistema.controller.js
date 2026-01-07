import { Op, fn, where, col } from "sequelize";
import { Agendamento, Notificacao, Usuario, Cliente } from "../database";


const sistema_Controller = {

  //////////////////////////////////////////////////////////////
  // 1. LIMPAR PENDENTES 
  //////////////////////////////////////////////////////////////
  async rotina_limpar_pendentes() {
    try {
      const limite = new Date(Date.now() - 60 * 60 * 1000); 
      const [cancelados] = await Agendamento.update(
        { status: 'expirado' },
        { where: { status: 'pendente', criado_em: { [Op.lt]: limite } } }
      );
      if (cancelados > 0) console.log(`[SISTEMA] ${cancelados} agendamentos expirados por falta de pagamento.`);
    } catch (e) { console.error("Erro na limpeza:", e); }
  },

  ///////////////////////////////////////////
  // 2. MUDAR STATUS PARA CONCLUÍDO ////////
  /////////////////////////////////////////////
  async rotina_mudar_status_concluido() {
    try {
      const agora = new Date();
      await Agendamento.update(
        { status: 'concluido' },
        { where: { status: 'confirmado', data_hora_fim: { [Op.lt]: agora } } }
      );
    } catch (e) { console.error("Erro ao concluir serviços:", e); }
  },






  //////////////////////////////////////////////////////////////
  // 3. DISPARAR LEMBRETES E NOTIFICAÇÕES 
  //////////////////////////////////////////////////////////////
  
  // A. Lembrete de Agendamento (24h antes)
  async lembrete_24h() {
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    const dataBusca = amanha.toISOString().split('T')[0];

    const agendamentos = await Agendamento.findAll({
      where: { status: 'confirmado', data_servico: dataBusca },
      include: [{ model: Cliente, include: [Usuario] }]
    });

    for (let ag of agendamentos) {
      await this.criar_notificacao(ag.cliente.usuario_id, 'lembrete', 
        `Olá ${ag.cliente.usuario.nome}! Você tem um agendamento amanhã às ${ag.hora_inicio}. no Maddie Beauty Boutique`, ag.id);
    }
  },

  // B. Notificação de Aniversário
  async parabens_aniversariantes() {
    const hoje = new Date();
    const mes = hoje.getMonth() + 1;
    const dia = hoje.getDate();

    // Busca usuários que fazem anos hoje (usando funções do banco que a Raina preparou)
    const aniversariantes = await Usuario.findAll({
      where: [
        where(fn('MONTH', col('data_nascimento')), mes),
        where(fn('DAY', col('data_nascimento')), dia)
      ]
    });

    for (let user of aniversariantes) {
      await this.criar_notificacao(user.id, 'promocao', 
        `Parabéns, ${user.nome}! Ganhe 10% de desconto em qualquer serviço hoje no Maddie beauty boutique!`);
    }
  },

  // C. Notificação de Confirmação de Pagamento
  async confirmar_pagamento_notificar(agendamento_id) {
    const ag = await Agendamento.findByPk(agendamento_id, { include: [Cliente] });
    if (ag) {
      await this.criar_notificacao(ag.cliente_id, 'pagamento', 
        `Pagamento confirmado! Seu serviço de ${ag.servico_id} está garantido.`);
    }
  },

  // D. Enviar Promoções Gerais
  async enviar_promocao_geral(titulo, mensagem) {
    const clientes = await Cliente.findAll();
    for (let c of clientes) {
      await this.criar_notificacao(c.usuario_id, 'promocao', mensagem);
    }
  },

  //////////////////////////////////////////////////////////////
  // FUNÇÃO AUXILIAR: Criar registro na tabela NOTIFICACAO
  //////////////////////////////////////////////////////////////
  async criar_notificacao(usuario_id, tipo, conteudo, agendamento_id = null) {
    try {
      await Notificacao.create({
        usuario_id,
        tipo, // 'pagamento', 'aniversario', 'promocao', 'lembrete'
        conteudo,
        agendamento_id,
        data_hora: new Date(),
        status: 'pendente',
        canal: 'whatsapp' // Definido como padrão do sistema
      });
      // Aqui o Ator SISTEMA chamaria a API do WhatsApp/SMS real
    } catch (e) { console.error("Erro ao criar notificação:", e); }
  }
};

export default sistema_Controller;