



import calcular_fim_servico from "../utils/calcular_fim_servico.js";
import { conflito_funcionario } from "../utils/conflito_funcionario.js";
import conflito_cliente from "../utils/conflito_cliente.js";


const agendamento_Controller = {








  ////////  //////// //////// ////////  ////////
  //////// 1. fazer novo agendamento ////////
  ////////  //////// ////////  ////////
  async fazer_agendamento(req, res) {
    try {
      const { cliente_id, servico_id, funcionario_id, data_hora_inicio } =
        req.body;

      // 1. Validação de dados obrigatórios
      if (!cliente_id || !servico_id || !funcionario_id || !data_hora_inicio) {
        return res.status(400).json({ erro: "Dados obrigatórios em falta." });
      }

      const inicio = new Date(data_hora_inicio);
      const agora = new Date();

      // 2. Validação: Não permitir agendamentos no passado
      if (inicio <= agora) {
        return res
          .status(400)
          .json({ erro: "Não é possível agendar no passado." });
      }

      // 3. Buscar duração do serviço
      const servico = { id: 1, nome: "Drenagem", duracao: 60 }; // Mock
      if (!servico)
        return res.status(404).json({ erro: "Serviço não encontrado." });

      // Calcula o fim com base na duração do serviço (em minutos)
      const fim = calcular_fim_servico(data_hora_inicio, servico.duracao);

      // 4. Verificar se o funcionário está disponível (Conflito de agenda)
      const conflito_Funcionario = await conflito_funcionario(
        funcionario_id,
        inicio,
        fim
      );
      if (conflito_Funcionario) {
        return res
          .status(409)
          .json({
            erro: "O profissional já possui um agendamento neste horário.",
          });
      }

      // 5. Verificar se o cliente já tem algo marcado no mesmo horário
      // (Evita que o cliente marque duas coisas ao mesmo tempo)
      const conflito_Cliente = await conflito_cliente(cliente_id, inicio, fim);
      if (conflito_Cliente) {
        return res
          .status(409)
          .json({ erro: "Você já possui um agendamento neste horário." });
      }

      // 6. Criar o agendamento (Status inicial: Pendente ou Confirmado dependendo da regra)
      // Extrai data e hora separadas
      const data_servico = inicio.toISOString().split("T")[0]; // '2025-12-29'
      const hora_inicio = inicio.toTimeString().split(" ")[0]; // '15:00:00'

      // Cria o agendamento
      const novoAgendamento = {
        cliente_id,
        servico_id,
        funcionario_id,
        data_hora_inicio: inicio,
        data_hora_fim: fim,
        data_servico, // só a data
        hora_inicio, // só a hora
        status: "pendente", // aguardando confirmação do sistema
        criado_em: new Date(),
      };

      // Salvar no banco...
      // await Agendamento.create(novoAgendamento);

      // 7. Ação do Ator SISTEMA: Gerar Logs e preparar notificações
      console.log(
        `[LOG] Agendamento criado: Cliente ${cliente_id} com Profissional ${funcionario_id}`
      );

      // Aqui dispararia o evento para o SISTEMA enviar WhatsApp/SMS
      

      return res.status(201).json({
        mensagem: "Agendamento realizado com sucesso!",
        detalhes: {
          inicio,
          fim,
          status: novoAgendamento.status,
        },
      });
    } catch (erro) {
      console.error("Erro ao criar agendamento:", erro);
      return res
        .status(500)
        .json({ erro: "Erro interno ao processar agendamento." });
    }
  },





  ////////  //////// //////// ////////  ////////
  //////// 2. Confirmar Agendamento ////////
  ////////  //////// ////////  ////////
  async confirmar(req, res) {
    try {
      const { id } = req.params; // ID do agendamento

      // 1. Buscar o agendamento no banco
      // SELECT * FROM AGENDAMENTO WHERE id = id;

      // 2. Verificar se o status atual permite confirmação
      // if (agendamento.status !== 'pendente') { ... }

      // 3. Atualizar status para 'confirmado'
      // UPDATE AGENDAMENTO SET status = 'confirmado' WHERE id = id;

      return res.json({ mensagem: "Agendamento confirmado com sucesso." });
    } catch (erro) {
      return res.status(500).json({ erro: "Erro ao confirmar agendamento." });
    }
  },

  ////////  //////// //////// ////////  ////////
  //////// 3. Cancelar com Regra das 72h ////////
  ////////  //////// ////////  ////////
  async cancelar(req, res) {
  try {
    const { id } = req.params; // ID do agendamento
    const { usuario_id, perfil } = req.user; 

    // 1. Buscar o agendamento no banco
    const agendamento = await Agendamento.findByPk(id);

    if (!agendamento) {
      return res.status(404).json({ erro: "Agendamento não encontrado." });
    }

    // 2. Verificar se o agendamento já foi cancelado ou concluído
    if (agendamento.status === 'cancelado') {
      return res.status(400).json({ erro: "Este agendamento já está cancelado." });
    }
    if (agendamento.status === 'concluido') {
      return res.status(400).json({ erro: "Não é possível cancelar um serviço já realizado." });
    }

    // 3.  Só aplicar as 72h se o ator for CLIENTE
    if (perfil === 'CLIENTE') {
      
      // Segurança: Verificar se o agendamento pertence a esse cliente
      if (agendamento.cliente_id !== usuario_id) {
        return res.status(403).json({ erro: "Você não tem permissão para cancelar este agendamento." });
      }

      const agora = new Date();
      const inicio_Servico = new Date(agendamento.data_hora_inicio);

      // Diferença em milissegundos
      const limite72h = 72 * 60 * 60 * 1000;
      const diferenca = inicio_Servico - agora;
      if (diferenca < limite72h) {
        return res.status(400).json({
          erro: "Regra das 72h: O cancelamento só é permitido com 3 dias de antecedência. Entre em contato atarves do website.",
        });
      }
    }

    // 4. Se passou pela regra (ou se for ADMIN), atualizar status
    // O Ator ADMIN ou o Ator CLIENTE (dentro do prazo) chegam aqui
    agendamento.status = 'cancelado';
    agendamento.atualizado_em = new Date();
    await agendamento.save();

    // 5. Ator SISTEMA: Gerar Log e Notificação
    console.log(`[LOG] Agendamento ${id} cancelado por ${perfil} (ID: ${usuario_id})`);
    
   

    return res.json({ 
      mensagem: "Agendamento cancelado com sucesso.",
      protocolo: `CAN-${id}-${Date.now()}` 
    });

  } catch (erro) {
    console.error("Erro ao cancelar:", erro);
    return res.status(500).json({ erro: "Erro interno ao processar cancelamento." });
  }
},




 ////////  //////// //////// ////////  ////////
  //////// // 4. Reagendar Agendamento ////////
  ////////  //////// ////////  ////////
  
 async reagendar(req, res) {
  try {
    const { id } = req.params; 
    const { nova_data_hora } = req.body;
    const { usuario_id, perfil } = req.user; // vindo do middleware de autenticação

    // 1. Buscar agendamento atual
    const agendamento = await Agendamento.findByPk(id, {
      include: [{ model: Servico, as: 'servico' }] // Para pegar a duracao_minutos
    });

    if (!agendamento) return res.status(404).json({ erro: "Agendamento não encontrado." });

    // 2. REGRA DAS 72H (Apenas para o Ator CLIENTE)
    if (perfil === 'CLIENTE') {
      if (agendamento.cliente_id !== usuario_id) {
        return res.status(403).json({ erro: "Acesso negado." });
      }

      const agora = new Date();
      const inicioAtual = new Date(agendamento.data_hora_inicio);
      const limite72h = 72 * 60 * 60 * 1000;

      if (inicioAtual - agora < limite72h) {
        return res.status(400).json({ erro: "Reagendamento pelo cliente só é permitido com 72h de antecedência." });
      }
    }

    // 3. Preparar novos horários
    const novo_inicio = new Date(nova_data_hora);
    if (novo_inicio <= new Date()) {
        return res.status(400).json({ erro: "A nova data deve ser no futuro." });
    }
    
    // Usando sua função de calcular fim (supondo que a duração venha do serviço associado)
    const novo_fim = calcular_fim_servico(nova_data_hora, agendamento.servico.duracao_minutos);

    // 4. VERIFICAR CONFLITO (Usando sua função externa)
    // Passamos o ID atual para ele IGNORAR o próprio agendamento na busca de conflitos
    const temConflito = await conflito_funcionario(
      agendamento.funcionario_id, 
      novo_inicio, 
      novo_fim, 
      id 
    );

    if (temConflito) {
      return res.status(409).json({ erro: "O profissional não está disponível neste novo horário." });
    }

    // 5. Atualizar agendamento
    agendamento.data_hora_inicio = novo_inicio;
    agendamento.data_hora_fim = novo_fim;
    agendamento.status = 'pendente'; // Volta para pendente para nova confirmação/pagamento
    await agendamento.save();

    return res.json({ 
      mensagem: "Reagendamento solicitado com sucesso!",
      novo_horario: novo_inicio 
    });

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: "Erro ao reagendar." });
  }
},




 ////////  //////// //////// ////////  ////////
  //////// // 5. Listar Meus Agendamentos ////////
  ////////  //////// ////////  ////////
async listar_agendamentos(req, res) {
  try {
    const { usuario_id, perfil } = req.user;

    let agendamentos;

    if (perfil === "CLIENTE") {
      // Cliente só vê os próprios agendamentos
      agendamentos = await Agendamento.findAll({
        where: { cliente_id: usuario_id },
        order: [["data_hora_inicio", "ASC"]],
      });
    } else if (perfil === "FUNCIONARIO") {
      // Funcionário vê a própria agenda
      agendamentos = await Agendamento.findAll({
        where: { funcionario_id: usuario_id },
        order: [["data_hora_inicio", "ASC"]],
      });
    } else if (perfil === "ADMIN") {
      // Admin vê todos
      agendamentos = await Agendamento.findAll({
        order: [["data_hora_inicio", "ASC"]],
      });
    } else {
      return res.status(403).json({ erro: "Perfil inválido." });
    }

    return res.json({ agendamentos });
  } catch (erro) {
    console.error("Erro ao listar agendamentos:", erro);
    return res.status(500).json({ erro: "Erro interno ao listar agendamentos." });
  }
}






}
export default agendamento_Controller;
