const cron = require("node-cron");
const sistema_Controller = require("./controllers/sistemaController");

// Limpar pendentes a cada 60 minutos
cron.schedule("0 * * * *", async () => {
  console.log("[ROTINA] Limpando agendamentos pendentes...");
  await sistema_Controller.rotina_limpar_pendentes();
});

// Atualizar status concluído diariamente às 00:05
cron.schedule("05 0 * * *", async () => {
  console.log("[ROTINA] Atualizando agendamentos concluídos...");
  await sistema_Controller.rotina_mudar_status_concluido();
});

// Enviar lembretes 24h antes às 09:00
cron.schedule("0 9 * * *", async () => {
  console.log("[ROTINA] Enviando lembretes 24h...");
  await sistema_Controller.lembrete_24h();
});

//  Enviar notificações de aniversário às 12:00
cron.schedule("12 * * *", async () => {
  console.log("[ROTINA] Enviando parabéns aos aniversariantes...");
  await sistema_Controller.parabens_aniversariantes();
});

// Enviar promoções gerais às 10:00
cron.schedule("0 10 * * *", async () => {
  console.log("[ROTINA] Enviando promoções gerais...");
  await sistema_Controller.enviar_promocao_geral("Promoção do Dia", "Confira nossas promoções exclusivas!");
});

console.log("[ROTINAS] Scheduler do sistema iniciado...");
