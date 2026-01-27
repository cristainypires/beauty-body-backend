import { Op, fn, col, where } from "sequelize";
import { 
  Agendamento, Notificacao, Usuario, Cliente, 
  StatusAgendamento, StatusNotificacao, CanalNotificacao 
} from "../models/index.js";

const sistema_Controller = {

  //////////////////////////////////////////////////////////////
  // 1. LIMPAR PENDENTES (Expira agendamentos não pagos em 1h)
  //////////////////////////////////////////////////////////////
  async rotina_limpar_pendentes() {
    try {
      const limite = new Date(Date.now() - 60 * 60 * 1000); // 1 hora atrás
      
      const statusPendente = await StatusAgendamento.findOne({ where: { nome: 'pendente' } });
      const statusCancelado = await StatusAgendamento.findOne({ where: { nome: 'cancelado' } });

      const [atualizados] = await Agendamento.update(
        { status_id: statusCancelado.id },
        { 
          where: { 
            status_id: statusPendente.id, 
            criado_em: { [Op.lt]: limite } 
          } 
        }
      );
      if (atualizados > 0) console.log(`[SISTEMA] ${atualizados} agendamentos expirados.`);
    } catch (e) { console.error("Erro na rotina de limpeza:", e); }
  },

  //////////////////////////////////////////////////////////////
  // 2. MUDAR STATUS PARA CONCLUÍDO (Após o horário do serviço)
  //////////////////////////////////////////////////////////////
  async rotina_mudar_status_concluido() {
    try {
      const agora = new Date();
      const statusConfirmado = await StatusAgendamento.findOne({ where: { nome: 'confirmado' } });
      // Certifique-se de que 'concluido' existe na tabela status_agendamento
      const statusConcluido = await StatusAgendamento.findOne({ where: { nome: 'concluido' } });

      if (!statusConcluido) return console.log("Status 'concluido' não encontrado no banco.");

      await Agendamento.update(
        { status_id: statusConcluido.id },
        { 
          where: { 
            status_id: statusConfirmado.id, 
            data_hora_fim: { [Op.lt]: agora } 
          } 
        }
      );
    } catch (e) { console.error("Erro ao concluir serviços:", e); }
  },

  //////////////////////////////////////////////////////////////
  // 3. LEMBRETE 24H (Dispara notificações para amanhã)
  //////////////////////////////////////////////////////////////
  async lembrete_24h() {
    try {
      const amanhaInicio = new Date();
      amanhaInicio.setDate(amanhaInicio.getDate() + 1);
      amanhaInicio.setHours(0,0,0,0);
      
      const amanhaFim = new Date(amanhaInicio);
      amanhaFim.setHours(23,59,59,999);

      const statusConfirmado = await StatusAgendamento.findOne({ where: { nome: 'confirmado' } });

      const agendamentos = await Agendamento.findAll({
        where: { 
          status_id: statusConfirmado.id, 
          data_hora_inicio: { [Op.between]: [amanhaInicio, amanhaFim] } 
        },
        include: [{ model: Cliente, include: [Usuario] }]
      });

      for (let ag of agendamentos) {
        const hora = new Date(ag.data_hora_inicio).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
        await sistema_Controller.criar_notificacao(
          ag.cliente.usuario_id, 
          'lembrete', 
          `Olá ${ag.cliente.usuario.nome}! Lembrete do seu agendamento amanhã às ${hora}.`, 
          ag.id
        );
      }
    } catch (e) { console.error("Erro nos lembretes 24h:", e); }
  },

  //////////////////////////////////////////////////////////////
  // 4. ANIVERSARIANTES (Baseado na data_nascimento do usuario)
  //////////////////////////////////////////////////////////////
  async parabens_aniversariantes() {
    try {
      const hoje = new Date();
      const mes = hoje.getMonth() + 1;
      const dia = hoje.getDate();

      // PostgreSQL sintaxe para extrair dia e mês
      const aniversariantes = await Usuario.findAll({
        where: {
          [Op.and]: [
            where(fn('EXTRACT', col('MONTH FROM data_nascimento')), mes),
            where(fn('EXTRACT', col('DAY FROM data_nascimento')), dia)
          ]
        }
      });

      for (let user of aniversariantes) {
        await sistema_Controller.criar_notificacao(
          user.id, 
          'promocao', 
          `Parabéns ${user.nome}! Maddie Beauty Boutique te deseja um dia incrível. Use o cupom NIVER10 hoje!`
        );
      }
    } catch (e) { console.error("Erro nos aniversariantes:", e); }
  },

  //////////////////////////////////////////////////////////////
  // 5. FUNÇÃO INTERNA: CRIAR NOTIFICAÇÃO (Mapeia status e canais)
  //////////////////////////////////////////////////////////////
  async criar_notificacao(usuario_id, tipo, conteudo, agendamento_id = null) {
    try {
      // Busca IDs de configuração baseados no seu SQL
      const statusPendente = await StatusNotificacao.findOne({ where: { nome: 'pendente' } });
      const canalWpp = await CanalNotificacao.findOne({ where: { nome: 'whatsapp' } });

      await Notificacao.create({
        usuario_id,
        agendamento_id,
        tipo, 
        conteudo,
        status_id: statusPendente.id,
        canal_id: canalWpp.id,
        data_hora: new Date()
      });
      
      console.log(`[SISTEMA] Notificação de ${tipo} gerada para o Usuário ${usuario_id}`);
    } catch (e) { console.error("Erro ao criar registro de notificação:", e); }
  },

  async enviar_promocao_geral(titulo, mensagem) {
    try {
      const clientes = await Cliente.findAll();
      for (let c of clientes) {
        await sistema_Controller.criar_notificacao(c.usuario_id, 'promocao', `${titulo}: ${mensagem}`);
      }
    } catch (e) { console.error("Erro na promoção geral:", e); }
  }
};

export default sistema_Controller;