import { pool } from "../database/index.js";

/**
 * Script de Seed para Serviços Beauty
 * Baseado no Catálogo Beauty fornecido
 * Total: 400+ serviços organizados por categoria
 */

const seedServicos = async () => {
  const client = await pool.connect();
  
  try {
    console.log("💄 ========================================");
    console.log("💄 INICIANDO SEED DE SERVIÇOS BEAUTY");
    console.log("💄 ========================================\n");

    // Limpar apenas a tabela de serviços
    console.log("🧹 Limpando tabela de serviços...");
    await client.query(`TRUNCATE TABLE servico RESTART IDENTITY CASCADE;`);
    console.log("✓ Tabela limpa!\n");

    // =====================================================
    // DEFINIÇÃO DE TODOS OS SERVIÇOS POR CATEGORIA
    // =====================================================
    
    const servicos = [];

    // MAQUIAGEM
    servicos.push(
      { cat: 'MAQUIAGEM', nome: 'Maquiagem Simples', dur: 30, preco: 2000, desc: 'Preparação de pele completa, uma sombra ou sem sombra nos olhos, lábios batom ou gloss - Estilo fresco e natural para eventos casuais e diários' },
      { cat: 'MAQUIAGEM', nome: 'Maquiagem Sofisticada', dur: 45, preco: 2500, desc: 'Preparação de pele completa, combinação de sombra, lábios batom ou gloss - Estilo elegante ideal para cerimónias e festas' },
      { cat: 'MAQUIAGEM', nome: 'Maquiagem Artística', dur: 60, preco: 3500, desc: 'Preparação de pele completa, combinação de sombra e técnicas de cut crease, lábios batom ou gloss' },
      { cat: 'MAQUIAGEM', nome: 'Maquiagem Photoshoot Glow', dur: 60, preco: 3000, desc: 'Maquiagem mais elaborada ideal para fotos profissionais' },
      { cat: 'MAQUIAGEM', nome: 'Maquiagem Noiva', dur: 90, preco: 4000, desc: 'Higienização, Hidratação e Preparação de pele completa, combinação de sombra glam - Maquiagem sofisticada e resistente' },
      { cat: 'MAQUIAGEM', nome: 'Maquiagem Noiva + Prova', dur: 120, preco: 6500, desc: 'Maquiagem de noiva com prova prévia incluída' },
      { cat: 'MAQUIAGEM', nome: 'Cílios Postíços', dur: 10, preco: 500, desc: 'Aplicação de cílios postíços' },
      { cat: 'MAQUIAGEM', nome: 'Atendimento Domicílio', dur: 0, preco: 1500, desc: 'Taxa de deslocamento para atendimento a domicílio' },
      { cat: 'MAQUIAGEM', nome: 'Atendimento Fora Horário Laboral', dur: 0, preco: 1000, desc: 'Taxa adicional para atendimento fora do horário normal' }
    );

    // SOBRANCELHAS
    servicos.push(
      { cat: 'SOBRANCELHAS', nome: 'Sobrancelhas Personalizadas', dur: 20, preco: 500, desc: 'Design de sobrancelhas personalizado' },
      { cat: 'SOBRANCELHAS', nome: 'Sobrancelhas Masculinas', dur: 20, preco: 500, desc: 'Design de sobrancelhas para homens' },
      { cat: 'SOBRANCELHAS', nome: 'Sobrancelhas e Henna', dur: 30, preco: 1000, desc: 'Coloração temporária dos pelos e pele, cobrindo falhas e dando volume' },
      { cat: 'SOBRANCELHAS', nome: 'Tintura de Sobrancelhas', dur: 30, preco: 1300, desc: 'Coloração temporária dos pelos (ideal para pelos brancos)' },
      { cat: 'SOBRANCELHAS', nome: 'Brow Lamination / Brow Lifting', dur: 45, preco: 1300, desc: 'Procedimento químico, efeito lifting que estica os fios, tornando a sobrancelha visualmente mais grossa' },
      { cat: 'SOBRANCELHAS', nome: 'Brow Lamination com Tintura ou Henna', dur: 60, preco: 1500, desc: 'Brow Lifting com coloração incluída' }
    );

    // MICROPIGMENTAÇÃO
    servicos.push(
      { cat: 'MICROPIGMENTAÇÃO', nome: 'Micropigmentação Microblading', dur: 120, preco: 15000, desc: 'Desenho de sobrancelhas efeito fio a fio natural (inclui retoque 1 mês)' },
      { cat: 'MICROPIGMENTAÇÃO', nome: 'Micropigmentação Microshading', dur: 120, preco: 18000, desc: 'Desenho de sobrancelhas efeito sombreado sofisticado (inclui retoque 1 mês)' },
      { cat: 'MICROPIGMENTAÇÃO', nome: 'Retoque Micro Pontual', dur: 45, preco: 5000, desc: 'Retoque de pequenas falhas que podem surgir após alguns meses' },
      { cat: 'MICROPIGMENTAÇÃO', nome: 'Retoque Micro Anual', dur: 90, preco: 10000, desc: 'Retoque de manutenção anual' },
      { cat: 'MICROPIGMENTAÇÃO', nome: 'Despigmentação Química', dur: 60, preco: 3000, desc: 'Retirada do pigmento da pele afim de clarear procedimentos de micropigmentação' }
    );

    // PESTANAS
    servicos.push(
      { cat: 'PESTANAS', nome: 'Lash Lifting com Tintura', dur: 60, preco: 1800, desc: 'Procedimento químico, efeito lifting que estica os fios das pestanas' },
      { cat: 'PESTANAS', nome: 'Extensão Pestanas', dur: 120, preco: 4500, desc: 'Colocação fio a fio clássico e fios tecnológicos' },
      { cat: 'PESTANAS', nome: 'Manutenção Extensão Pestanas (até 4 semanas)', dur: 90, preco: 3500, desc: 'Manutenção de extensão de pestanas' },
      { cat: 'PESTANAS', nome: 'Remoção Extensão de Pestanas', dur: 30, preco: 1000, desc: 'Remoção segura de extensão de pestanas' },
      { cat: 'PESTANAS', nome: 'Aplicação Cílios Postíços', dur: 15, preco: 500, desc: 'Aplicação de cílios postíços' },
      { cat: 'PESTANAS', nome: 'Combo Natural Beauty (Lash + Brow)', dur: 90, preco: 3200, desc: 'Combinação Lash Lifting e Brow Lamination' }
    );

    // LIMPEZA DE PELE
    servicos.push(
      { cat: 'LIMPEZA DE PELE', nome: 'Limpeza de Pele Clássica', dur: 60, preco: 3500, desc: 'Aplicação de dermocosméticos específicos, esfoliação, extração, alta frequência, ledterapia' },
      { cat: 'LIMPEZA DE PELE', nome: 'Limpeza Profunda Facial 1H', dur: 60, preco: 4200, desc: 'Limpeza profunda personalizada' },
      { cat: 'LIMPEZA DE PELE', nome: 'Limpeza Profunda Facial, Pescoço e Colo', dur: 90, preco: 5200, desc: 'Limpeza profunda facial completa com pescoço e colo' },
      { cat: 'LIMPEZA DE PELE', nome: 'Limpeza Seborreguladora / Anti Acne', dur: 75, preco: 4700, desc: 'Limpeza específica para peles acneicas, muito oleosas' },
      { cat: 'LIMPEZA DE PELE', nome: 'Limpeza Clareadora', dur: 75, preco: 4700, desc: 'Limpeza específica para peles com manchas' },
      { cat: 'LIMPEZA DE PELE', nome: 'Limpeza Rejuvenescedora / Antiaging', dur: 75, preco: 4700, desc: 'Limpeza para peles desvitalizadas, ação firmadora, antiflacidez, antirrugas' },
      { cat: 'LIMPEZA DE PELE', nome: 'Hidrafacial', dur: 60, preco: 5000, desc: 'Protocolo de limpeza e hidratação profunda com peeling de água' },
      { cat: 'LIMPEZA DE PELE', nome: 'Dermaplaning', dur: 45, preco: 3500, desc: 'Peeling físico da camada mais superficial da pele' },
      { cat: 'LIMPEZA DE PELE', nome: 'Revitalização Facial', dur: 60, preco: 5000, desc: 'Limpeza de pele clássica + Dermaplaning' },
      { cat: 'LIMPEZA DE PELE', nome: 'Detox Facial', dur: 45, preco: 2700, desc: 'Limpeza express para oxigenação e hidratação instantânea' },
      { cat: 'LIMPEZA DE PELE', nome: 'Vagacial', dur: 60, preco: 3500, desc: 'Limpeza de pele na virilha (ação esfoliante e clareadora)' },
      { cat: 'LIMPEZA DE PELE', nome: 'Backfacial', dur: 60, preco: 3500, desc: 'Limpeza de pele nas costas (ação esfoliante e clareadora)' },
      { cat: 'LIMPEZA DE PELE', nome: 'Buttfacial', dur: 60, preco: 3500, desc: 'Limpeza de pele nas nádegas (ação esfoliante e clareadora)' }
    );

    // RADIOFREQUÊNCIA
    servicos.push(
      { cat: 'RADIOFREQUÊNCIA', nome: 'Radiofrequência Facial', dur: 45, preco: 2500, desc: 'Protocolo para estímulo de colágeno, antiflacidez, prevenção de rugas' },
      { cat: 'RADIOFREQUÊNCIA', nome: 'Radiofrequência Facial - Pack 5 Sessões', dur: 45, preco: 10000, desc: 'Pacote de 5 sessões' },
      { cat: 'RADIOFREQUÊNCIA', nome: 'Radiofrequência Facial - Pack 10 Sessões', dur: 45, preco: 20000, desc: 'Pacote de 10 sessões' }
    );

    // MICROAGULHAMENTO
    servicos.push(
      { cat: 'MICROAGULHAMENTO', nome: 'Microagulhamento Facial', dur: 60, preco: 5500, desc: 'Tratamento para rejuvenescimento, rugas, cicatrizes de acne, manchas' },
      { cat: 'MICROAGULHAMENTO', nome: 'Microagulhamento Facial - Pack 3 Sessões', dur: 60, preco: 15000, desc: 'Pacote de 3 sessões' },
      { cat: 'MICROAGULHAMENTO', nome: 'Microagulhamento Facial, Pescoço e Colo', dur: 90, preco: 8000, desc: 'Tratamento para rejuvenescimento, flacidez, rugas' },
      { cat: 'MICROAGULHAMENTO', nome: 'Microagulhamento Facial, Pescoço e Colo - Pack 3', dur: 90, preco: 21000, desc: 'Pacote de 3 sessões' },
      { cat: 'MICROAGULHAMENTO', nome: 'Microagulhamento de Olheiras', dur: 30, preco: 3000, desc: 'Tratamento para clareamento de olheiras' },
      { cat: 'MICROAGULHAMENTO', nome: 'Microagulhamento de Olheiras - Pack 3', dur: 30, preco: 8000, desc: 'Pacote de 3 sessões' },
      { cat: 'MICROAGULHAMENTO', nome: 'Microagulhamento Corporal (Por Zona)', dur: 60, preco: 8000, desc: 'Tratamento para estrias, cicatrizes e flacidez tissular' },
      { cat: 'MICROAGULHAMENTO', nome: 'Microagulhamento Corporal - Pack 3', dur: 60, preco: 21000, desc: 'Pacote de 3 sessões' },
      { cat: 'MICROAGULHAMENTO', nome: 'Microagulhamento de Barba', dur: 45, preco: 5000, desc: 'Tratamento para desenvolvimento de folículos na região de barba' },
      { cat: 'MICROAGULHAMENTO', nome: 'Hidralips - Nanoagulhamento Labial', dur: 30, preco: 2000, desc: 'Tratamento anti-ressecamento e ultra-hidratação de lábios' },
      { cat: 'MICROAGULHAMENTO', nome: 'Hidralips - Pack 3 Sessões', dur: 30, preco: 5000, desc: 'Pacote de 3 sessões' },
      { cat: 'MICROAGULHAMENTO', nome: 'Rebrows - Microagulhamento Sobrancelhas', dur: 30, preco: 2500, desc: 'Tratamento para crescimento dos pêlos das sobrancelhas' },
      { cat: 'MICROAGULHAMENTO', nome: 'Rebrows - Pack 3 Sessões', dur: 30, preco: 6500, desc: 'Pacote de 3 sessões' },
      { cat: 'MICROAGULHAMENTO', nome: 'Limpeza de Pele + Microagulhamento', dur: 120, preco: 8000, desc: 'Combo completo' }
    );

    // PEELINGS
    servicos.push(
      { cat: 'PEELINGS', nome: 'Hollywood - Carbon Laser Peeling', dur: 60, preco: 7500, desc: 'Tratamento para rejuvenescimento, flacidez, rugas' },
      { cat: 'PEELINGS', nome: 'Peeling Despigmentante e Clareador', dur: 45, preco: 5500, desc: 'Peeling para tratamento de manchas' },
      { cat: 'PEELINGS', nome: 'Peeling Anti-Acne', dur: 45, preco: 5500, desc: 'Peeling para tratamento de acne' },
      { cat: 'PEELINGS', nome: 'Peeling Rejuvenecedor Anti-Aging', dur: 45, preco: 5500, desc: 'Peeling anti-envelhecimento' },
      { cat: 'PEELINGS', nome: 'Peeling Orgânico + Hidratação', dur: 75, preco: 10000, desc: 'Peeling 100% natural regenerativo, antienvelhecimento, clareador' },
      { cat: 'PEELINGS', nome: 'Limpeza + Peeling Orgânico + Hidratação', dur: 120, preco: 12000, desc: 'Tratamento completo' }
    );

    // MASSAGENS
    const massagens = [
      { nome: 'Esfoliação Corporal + Banho Terapêutico + Massagem', dur: 90, preco: 6000, desc: 'Ritual relaxante completo (1H30)' },
      { nome: 'Esfoliação e Hidratação Corporal', dur: 60, preco: 3000, desc: 'Esfoliação e finalização com óleos hidratantes' },
      { nome: 'Banho de Lua - Corpo Inteiro', dur: 45, preco: 3000, desc: 'Tratamento completo corpo inteiro' },
      { nome: 'Banho de Lua - Braços e Pernas', dur: 30, preco: 2200, desc: 'Tratamento braços e pernas' },
      { nome: 'Massagem Relaxante - Zonas Específicas 30min', dur: 30, preco: 2200, desc: 'Massagem localizada' },
      { nome: 'Massagem Relaxante - Corpo Inteiro 60min', dur: 60, preco: 3500, desc: 'Massagem relaxante corpo inteiro' },
      { nome: 'Massagem Relaxante Corpo - Pack 5', dur: 60, preco: 9000, desc: 'Pacote de 5 sessões' },
      { nome: 'Massagem Relaxante Corpo - Pack 10', dur: 60, preco: 17000, desc: 'Pacote de 10 sessões' },
      { nome: 'Massagem Relaxante com Pedras Quentes 60min', dur: 60, preco: 4000, desc: 'Massagem com pedras quentes' },
      { nome: 'Massagem Muscular / Desportiva', dur: 60, preco: 4000, desc: 'Massagem terapêutica muscular' },
      { nome: 'Massagem Modeladora - Zona Específica', dur: 45, preco: 2000, desc: 'Massagem modeladora localizada' },
      { nome: 'Massagem Modeladora + Madeiraterapia', dur: 60, preco: 3000, desc: 'Massagem modeladora completa com madeiraterapia' },
      { nome: 'Massagem Modeladora - Pack 5', dur: 60, preco: 13500, desc: 'Pacote de 5 sessões' },
      { nome: 'Massagem Modeladora - Pack 10', dur: 60, preco: 26000, desc: 'Pacote de 10 sessões' },
      { nome: 'Drenagem Linfática - Corpo Inteiro', dur: 60, preco: 2800, desc: 'Drenagem linfática completa' },
      { nome: 'Drenagem Linfática - Pack 5', dur: 60, preco: 12600, desc: 'Pacote de 5 sessões' },
      { nome: 'Drenagem Linfática - Pack 10', dur: 60, preco: 24500, desc: 'Pacote de 10 sessões' },
      { nome: 'Detox Corporal - Termoterapia 1 Sessão', dur: 45, preco: 3000, desc: 'Detox corporal com termoterapia' },
      { nome: 'Detox Corporal - Pack 5', dur: 45, preco: 13000, desc: 'Pacote de 5 sessões' },
      { nome: 'Detox Corporal - Pack 10', dur: 45, preco: 26000, desc: 'Pacote de 10 sessões' }
    ];
    massagens.forEach(m => servicos.push({ cat: 'MASSAGENS', ...m }));

    // BRIDAL CONCEPT
    const bridal = [
      { nome: 'Express Bride', dur: 120, preco: 6000, desc: 'Bridal Make Up, Design Sobrancelha, Penteado' },
      { nome: 'Bride Facial', dur: 180, preco: 9500, desc: 'Limpeza, Depilação Facial, Design, Make Up, Penteado' },
      { nome: 'Especial Noivo', dur: 180, preco: 9000, desc: 'Design, Limpeza, Spa Mãos e Pés, Massagem' },
      { nome: 'PLATINIUM Bride', dur: 240, preco: 10500, desc: 'Make Up, Penteado, Design, Esfoliação, Banho, Massagem' },
      { nome: 'Bridesmaid Glam', dur: 180, preco: 15000, desc: 'Maquiagem Sofisticada + Cílios para 6 Damas' },
      { nome: 'SILVER Bride', dur: 300, preco: 16500, desc: 'PLATINIUM + Limpeza + Manicure/Pedicure Gel' },
      { nome: 'GOLDEN Bride', dur: 360, preco: 18000, desc: 'SILVER + Depilação + Bônus Detox Pós-Casamento' },
      { nome: 'Bridal Crew', dur: 240, preco: 18000, desc: 'Noiva + 6 Damas Completo' },
      { nome: 'QUEEN Bride', dur: 420, preco: 22000, desc: 'Noiva + Madrinha + Mãe + Revitalização Facial + Bônus Detox' }
    ];
    bridal.forEach(b => servicos.push({ cat: 'BRIDAL CONCEPT', ...b }));

    // DEPILAÇÃO CERA - MULHER
    const depilCeraMulher = [
      { nome: 'Buço', dur: 10, preco: 400 },
      { nome: 'Meio Braço', dur: 15, preco: 500 },
      { nome: 'Axilas', dur: 15, preco: 600 },
      { nome: 'Braço Inteiro', dur: 20, preco: 700 },
      { nome: 'Rosto Completo', dur: 20, preco: 700 },
      { nome: 'Meia Perna', dur: 25, preco: 1000 },
      { nome: 'Virilha Cavada', dur: 20, preco: 1000 },
      { nome: 'Perna Inteira', dur: 35, preco: 1200 },
      { nome: 'Virilha Completa', dur: 30, preco: 1500 },
      { nome: 'Região Íntima Completa', dur: 40, preco: 1800 }
    ];
    depilCeraMulher.forEach(d => servicos.push({ cat: 'DEPILAÇÃO CERA - MULHER', nome: d.nome, dur: d.dur, preco: d.preco, desc: `Depilação com cera - ${d.nome}` }));

    // DEPILAÇÃO CERA - HOMEM
    const depilCeraHomem = [
      { nome: 'Meio Braço Masculino', dur: 20, preco: 800 },
      { nome: 'Axilas Masculino', dur: 15, preco: 800 },
      { nome: 'Meia Perna Masculino', dur: 30, preco: 1000 },
      { nome: 'Braço Inteiro Masculino', dur: 30, preco: 1000 },
      { nome: 'Virilha Cavada Masculino', dur: 25, preco: 1000 },
      { nome: 'Peito e Abdomen', dur: 30, preco: 1200 },
      { nome: 'Costa Masculino', dur: 30, preco: 1200 },
      { nome: 'Perna Inteira Masculino', dur: 45, preco: 1500 },
      { nome: 'Virilha Completa Masculino', dur: 35, preco: 1700 },
      { nome: 'Região Íntima Completa Masculino', dur: 45, preco: 2000 }
    ];
    depilCeraHomem.forEach(d => servicos.push({ cat: 'DEPILAÇÃO CERA - HOMEM', nome: d.nome, dur: d.dur, preco: d.preco, desc: `Depilação com cera - ${d.nome}` }));

    // MANICURE E PEDICURE
    const manicure = [
      { nome: 'Pintura com Verniz Normal', dur: 20, preco: 500 },
      { nome: 'Gelinho Pé', dur: 30, preco: 800 },
      { nome: 'Cuticulagem e Pintura com Verniz', dur: 30, preco: 800 },
      { nome: 'Spa das Mãos - Manicure Terapêutico', dur: 45, preco: 800 },
      { nome: 'Remoção Gel', dur: 30, preco: 800 },
      { nome: 'Gelinho Mãos', dur: 40, preco: 1000 },
      { nome: 'Gelinho + Gel 2 Dedos', dur: 45, preco: 1200 },
      { nome: 'Spa dos Pés - Pedicure Terapêutico', dur: 60, preco: 1200 },
      { nome: 'Banho de Gel', dur: 50, preco: 1500 },
      { nome: 'Spa dos Pés com Verniz', dur: 60, preco: 1500 },
      { nome: 'Manutenção Gel - S e M', dur: 45, preco: 1500 },
      { nome: 'Spa dos Pés com Gelinho', dur: 75, preco: 1800 },
      { nome: 'Manutenção Gel - L', dur: 50, preco: 1800 },
      { nome: 'Combo Spa Mãos + Pés', dur: 105, preco: 2000 },
      { nome: 'Manutenção Gel - XL', dur: 60, preco: 2000 },
      { nome: 'Spa Pés Gelinho + Gel 2 Dedos', dur: 90, preco: 2000 },
      { nome: 'Colocação Unha Gel - S e M', dur: 60, preco: 2500 },
      { nome: 'Colocação Unha Gel - L e XL', dur: 75, preco: 3000 },
      { nome: 'Unhas Quebradas (por unha)', dur: 15, preco: 150 }
    ];
    manicure.forEach(m => servicos.push({ cat: 'MANICURE E PEDICURE', nome: m.nome, dur: m.dur, preco: m.preco, desc: m.nome }));

    // BODY REPAIR
    const bodyRepair = [
      { nome: 'Axilas', dur: 60, preco: 12000 },
      { nome: 'Área Interna de Coxas', dur: 60, preco: 12000 },
      { nome: 'Meia Área Virilha', dur: 75, preco: 15000 },
      { nome: 'Meia Perna', dur: 90, preco: 15000 },
      { nome: 'Peito / Colo', dur: 60, preco: 15000 },
      { nome: 'Abdominal', dur: 75, preco: 15000 },
      { nome: 'Área Glúteos', dur: 90, preco: 18000 },
      { nome: 'Virilha Completa', dur: 90, preco: 20000 },
      { nome: 'Área Inteira Costas', dur: 120, preco: 20000 },
      { nome: 'Interno Coxas + Virilha Completa', dur: 120, preco: 25000 }
    ];
    bodyRepair.forEach(b => servicos.push({ cat: 'BODY REPAIR', nome: `Body Repair - ${b.nome}`, dur: b.dur, preco: b.preco, desc: `Clareamento ${b.nome}. Bônus: 1 sessão picolaser` }));

    // PICOLASER
    servicos.push(
      { cat: 'PICOLASER', nome: 'Picolaser - Área Pequena', dur: 30, preco: 4500, desc: 'Lábios, Linha Alba, Pescoço, Cicatrizes' },
      { cat: 'PICOLASER', nome: 'Picolaser - Área Média', dur: 45, preco: 6000, desc: 'Virilha, Interno Coxas, Axilas, Mãos, Peito' },
      { cat: 'PICOLASER', nome: 'Picolaser - Área Grande', dur: 60, preco: 8000, desc: 'Costa, Meia Perna, Glúteos, Virilha + Interno Coxas' }
    );

    // LIPOMODELAGEM
    const lipo = [
      { zona: 1, sessoes: 1, preco: 4000 },
      { zona: 1, sessoes: 3, preco: 10500 },
      { zona: 1, sessoes: 6, preco: 18500 },
      { zona: 1, sessoes: 10, preco: 32000 },
      { zona: 2, sessoes: 1, preco: 4000 },
      { zona: 2, sessoes: 3, preco: 10500 },
      { zona: 2, sessoes: 6, preco: 18500 },
      { zona: 2, sessoes: 10, preco: 32000 }
    ];
    lipo.forEach(l => {
      const zDesc = l.zona === 1 ? 'Abdomen, Dorso, Flancos' : 'Quadril, Culotes, Coxas';
      const sDesc = l.sessoes === 1 ? '1 Sessão' : `${l.sessoes} Sessões`;
      servicos.push({ 
        cat: 'LIPOMODELAGEM', 
        nome: `Lipomodelagem Zona ${l.zona} - ${sDesc}`, 
        dur: 60, 
        preco: l.preco, 
        desc: `${zDesc} - Modeladora + Lipocavitação/Radiofrequência + Lipolaser`
      });
    });

    // APARATOLOGIA
    servicos.push(
      { cat: 'APARATOLOGIA', nome: 'Eletroestimulação', dur: 45, preco: 2000, desc: 'Fortalecimento muscular' },
      { cat: 'APARATOLOGIA', nome: 'Eletroestimulação - Pack 5', dur: 45, preco: 8000, desc: 'Pacote 5 sessões' },
      { cat: 'APARATOLOGIA', nome: 'Microdermoabrasão Estrias', dur: 60, preco: 3000, desc: 'Peeling mecânico para reparação tecidual' },
      { cat: 'APARATOLOGIA', nome: 'Microdermoabrasão Estrias - Pack 3', dur: 60, preco: 8000, desc: 'Pacote 3 sessões' },
      { cat: 'APARATOLOGIA', nome: 'Radiofrequência Corporal', dur: 45, preco: 3000, desc: 'Tratar flacidez, estimular colágeno' },
      { cat: 'APARATOLOGIA', nome: 'Radiofrequência Corporal - Pack 5', dur: 45, preco: 12000, desc: 'Pacote 5 sessões' },
      { cat: 'APARATOLOGIA', nome: 'Radiofrequência Corporal - Pack 10', dur: 45, preco: 25000, desc: 'Pacote 10 sessões' },
      { cat: 'APARATOLOGIA', nome: 'Lipo Cavitação', dur: 45, preco: 3000, desc: 'Quebra de células lipolíticas' },
      { cat: 'APARATOLOGIA', nome: 'Lipo Cavitação - Pack 5', dur: 45, preco: 13000, desc: 'Pacote 5 sessões' },
      { cat: 'APARATOLOGIA', nome: 'Lipo Cavitação - Pack 10', dur: 45, preco: 25000, desc: 'Pacote 10 sessões' }
    );

    // REMOÇÃO LASER
    const remocao = [
      { tipo: 'Micropigmentação', cm: null, s: 1, preco: 4500 },
      { tipo: 'Micropigmentação', cm: null, s: 5, preco: 27500 },
      { tipo: 'Tatuagem Mini', cm: 6, s: 1, preco: 6000 },
      { tipo: 'Tatuagem Mini', cm: 6, s: 5, preco: 39000 },
      { tipo: 'Tatuagem Pequena', cm: 16, s: 1, preco: 8500 },
      { tipo: 'Tatuagem Pequena', cm: 16, s: 5, preco: 45000 },
      { tipo: 'Tatuagem Média', cm: 50, s: 1, preco: 10000 },
      { tipo: 'Tatuagem Média', cm: 50, s: 5, preco: 50000 },
      { tipo: 'Tatuagem Grande', cm: 150, s: 1, preco: 11500 }
    ];
    remocao.forEach(r => {
      const nome = r.s === 1 ? `Remoção ${r.tipo}` : `Remoção ${r.tipo} - Pack 5`;
      const desc = r.cm ? `Até ${r.cm}cm²` : 'Remoção a laser';
      const dur = r.tipo.includes('Micro') ? 30 : r.cm <= 6 ? 20 : r.cm <= 16 ? 30 : r.cm <= 50 ? 45 : 60;
      servicos.push({ cat: 'REMOÇÃO LASER', nome, dur, preco: r.preco, desc });
    });

    // DEPILAÇÃO LASER - MULHER (zonas individuais)
    const laserMulher = [
      { zona: 'Testa', s1: 1500, s5: 6750, s10: 13500, dur: 10 },
      { zona: 'Sobrancelha', s1: 2000, s5: 9000, s10: 18000, dur: 15 },
      { zona: 'Buço', s1: 2000, s5: 9000, s10: 18000, dur: 10 },
      { zona: 'Mãos/Pés', s1: 2000, s5: 9000, s10: 18000, dur: 15 },
      { zona: 'Queixo', s1: 2000, s5: 9000, s10: 18000, dur: 10 },
      { zona: 'Patilhas', s1: 2000, s5: 9000, s10: 18000, dur: 10 },
      { zona: 'Interior Nariz', s1: 2000, s5: 9000, s10: 18000, dur: 10 },
      { zona: 'Nuca', s1: 2000, s5: 9000, s10: 18000, dur: 15 },
      { zona: 'Intermamário', s1: 2000, s5: 9000, s10: 18000, dur: 10 },
      { zona: 'Linha Alba', s1: 2000, s5: 9000, s10: 18000, dur: 10 },
      { zona: 'Pescoço', s1: 2500, s5: 11250, s10: 22500, dur: 15 },
      { zona: 'Axilas', s1: 3000, s5: 13500, s10: 27000, dur: 15 },
      { zona: 'Virilha Linha Bikini', s1: 3000, s5: 13500, s10: 27000, dur: 20 },
      { zona: 'Antebraço', s1: 3500, s5: 15750, s10: 31500, dur: 20 },
      { zona: 'Virilha Cavada', s1: 3700, s5: 16650, s10: 33300, dur: 25 },
      { zona: 'Coxas', s1: 4000, s5: 18000, s10: 36000, dur: 30 },
      { zona: 'Braço Completo', s1: 5000, s5: 22500, s10: 45000, dur: 30 },
      { zona: 'Meia Perna', s1: 5000, s5: 22500, s10: 45000, dur: 30 },
      { zona: 'Virilha Completa', s1: 5000, s5: 22500, s10: 45000, dur: 30 },
      { zona: 'Nádegas Completa', s1: 5000, s5: 22500, s10: 45000, dur: 30 },
      { zona: 'Rosto Completo', s1: 5000, s5: 22500, s10: 45000, dur: 25 },
      { zona: 'Perna Completa', s1: 8000, s5: 36000, s10: 72000, dur: 45 }
    ];
    laserMulher.forEach(z => {
      servicos.push(
        { cat: 'DEPILAÇÃO LASER - MULHER', nome: `Depilação Laser - ${z.zona} (1 Sessão)`, dur: z.dur, preco: z.s1, desc: `Depilação a laser - ${z.zona}` },
        { cat: 'DEPILAÇÃO LASER - MULHER', nome: `Depilação Laser - ${z.zona} (5 Sessões)`, dur: z.dur, preco: z.s5, desc: 'Pacote 5 sessões' },
        { cat: 'DEPILAÇÃO LASER - MULHER', nome: `Depilação Laser - ${z.zona} (10 Sessões)`, dur: z.dur, preco: z.s10, desc: 'Pacote 10 sessões' }
      );
    });

    // DEPILAÇÃO LASER - HOMEM (zonas individuais)
    const laserHomem = [
      { zona: 'Testa', s1: 1500, s5: 6750, s10: 13500, dur: 10 },
      { zona: 'Sobrancelha', s1: 2000, s5: 9000, s10: 18000, dur: 15 },
      { zona: 'Buço', s1: 2000, s5: 9000, s10: 18000, dur: 10 },
      { zona: 'Queixo', s1: 2000, s5: 9000, s10: 18000, dur: 10 },
      { zona: 'Patilhas', s1: 2000, s5: 9000, s10: 18000, dur: 10 },
      { zona: 'Nuca', s1: 2000, s5: 9000, s10: 18000, dur: 15 },
      { zona: 'Nádegas Interna', s1: 3000, s5: 13500, s10: 27000, dur: 20 },
      { zona: 'Pescoço', s1: 3000, s5: 13500, s10: 27000, dur: 15 },
      { zona: 'Peito', s1: 3500, s5: 15750, s10: 31500, dur: 25 },
      { zona: 'Tórax', s1: 3500, s5: 15750, s10: 31500, dur: 25 },
      { zona: 'Axilas', s1: 3500, s5: 15750, s10: 31500, dur: 20 },
      { zona: 'Antebraço', s1: 4000, s5: 18000, s10: 36000, dur: 25 },
      { zona: 'Barba', s1: 4000, s5: 18000, s10: 36000, dur: 25 },
      { zona: 'Nádegas Completa', s1: 4500, s5: 20250, s10: 40500, dur: 30 },
      { zona: 'Coxas', s1: 4500, s5: 20250, s10: 40500, dur: 35 },
      { zona: 'Costa Parcial', s1: 4500, s5: 20250, s10: 40500, dur: 30 },
      { zona: 'Virilha Parcial', s1: 4500, s5: 20250, s10: 40500, dur: 25 },
      { zona: 'Braço Completo', s1: 5500, s5: 24750, s10: 49500, dur: 35 },
      { zona: 'Virilha Completa', s1: 5500, s5: 24750, s10: 49500, dur: 35 },
      { zona: 'Meia Perna', s1: 6000, s5: 27000, s10: 54000, dur: 35 },
      { zona: 'Rosto Completo', s1: 6500, s5: 29250, s10: 58500, dur: 30 },
      { zona: 'Abdomen Completo', s1: 7000, s5: 31500, s10: 63000, dur: 40 },
      { zona: 'Costa Completo', s1: 7000, s5: 31500, s10: 63000, dur: 40 },
      { zona: 'Perna Completa', s1: 9500, s5: 42750, s10: 85500, dur: 55 }
    ];
    laserHomem.forEach(z => {
      servicos.push(
        { cat: 'DEPILAÇÃO LASER - HOMEM', nome: `Depilação Laser Homem - ${z.zona} (1 Sessão)`, dur: z.dur, preco: z.s1, desc: `Depilação a laser - ${z.zona}` },
        { cat: 'DEPILAÇÃO LASER - HOMEM', nome: `Depilação Laser Homem - ${z.zona} (5 Sessões)`, dur: z.dur, preco: z.s5, desc: 'Pacote 5 sessões' },
        { cat: 'DEPILAÇÃO LASER - HOMEM', nome: `Depilação Laser Homem - ${z.zona} (10 Sessões)`, dur: z.dur, preco: z.s10, desc: 'Pacote 10 sessões' }
      );
    });

    // DEPILAÇÃO LASER - PACOTES
    const pacotesMulher = [
      { nome: 'Buço + Axilas', s1: 4000, s5: 18000, s10: 36000, dur: 25 },
      { nome: 'Virilhas + Axilas', s1: 6000, s5: 27000, s10: 54000, dur: 35 },
      { nome: 'Meia Perna + Virilha Completa', s1: 7000, s5: 31500, s10: 63000, dur: 50 },
      { nome: 'Meia Perna + Virilha + Axilas', s1: 10000, s5: 45000, s10: 90000, dur: 60 },
      { nome: 'Perna Completa + Virilha Completa', s1: 10000, s5: 45000, s10: 90000, dur: 70 },
      { nome: 'Corpo Inteiro Mulher', s1: 18000, s5: 81000, s10: 162000, dur: 120 }
    ];
    pacotesMulher.forEach(p => {
      servicos.push(
        { cat: 'DEPILAÇÃO LASER - PACOTES', nome: `Pacote ${p.nome} (1 Sessão)`, dur: p.dur, preco: p.s1, desc: `Pacote Depilação Laser - ${p.nome}` },
        { cat: 'DEPILAÇÃO LASER - PACOTES', nome: `Pacote ${p.nome} (5 Sessões)`, dur: p.dur, preco: p.s5, desc: 'Pacote 5 sessões' },
        { cat: 'DEPILAÇÃO LASER - PACOTES', nome: `Pacote ${p.nome} (10 Sessões)`, dur: p.dur, preco: p.s10, desc: 'Pacote 10 sessões' }
      );
    });

    const pacotesHomem = [
      { nome: 'Abdomen + Axilas', s1: 9000, s5: 40500, s10: 81000, dur: 60 },
      { nome: 'Virilha Completa + Axilas', s1: 8000, s5: 36000, s10: 72000, dur: 50 },
      { nome: 'Perna + Virilha Completa', s1: 12000, s5: 54000, s10: 108000, dur: 90 },
      { nome: 'Perna + Virilha + Abdomen', s1: 19000, s5: 85500, s10: 171000, dur: 120 },
      { nome: 'Corpo Inteiro Homem', s1: 25000, s5: 112000, s10: 225000, dur: 180 }
    ];
    pacotesHomem.forEach(p => {
      servicos.push(
        { cat: 'DEPILAÇÃO LASER - PACOTES HOMEM', nome: `Pacote Homem ${p.nome} (1 Sessão)`, dur: p.dur, preco: p.s1, desc: `Pacote Depilação Laser - ${p.nome}` },
        { cat: 'DEPILAÇÃO LASER - PACOTES HOMEM', nome: `Pacote Homem ${p.nome} (5 Sessões)`, dur: p.dur, preco: p.s5, desc: 'Pacote 5 sessões' },
        { cat: 'DEPILAÇÃO LASER - PACOTES HOMEM', nome: `Pacote Homem ${p.nome} (10 Sessões)`, dur: p.dur, preco: p.s10, desc: 'Pacote 10 sessões' }
      );
    });

    // =====================================================
    // INSERÇÃO NA BASE DE DADOS
    // =====================================================
    
    console.log(`📝 Inserindo ${servicos.length} serviços na base de dados...\n`);
    
    let inseridos = 0;
    let ultimaCategoria = '';
    
    for (const serv of servicos) {
      if (serv.cat !== ultimaCategoria) {
        console.log(`\n📁 Categoria: ${serv.cat}`);
        ultimaCategoria = serv.cat;
      }
      
      await client.query(
        `INSERT INTO servico (categoria, nome_servico, duracao_minutos, preco, descricao, ativo) 
         VALUES ($1, $2, $3, $4, $5, true)`,
        [serv.cat, serv.nome, serv.dur, serv.preco, serv.desc || serv.nome]
      );
      inseridos++;
      
      // Mostrar progresso
      if (inseridos % 20 === 0) {
        process.stdout.write('.');
      }
    }

    console.log("\n\n✅ ========================================");
    console.log(`✅ SEED COMPLETO!`);
    console.log(`✅ ${inseridos} serviços inseridos com sucesso!`);
    console.log("✅ ========================================\n");

    // Estatísticas por categoria
    console.log("📊 RESUMO POR CATEGORIA:\n");
    const categorias = {};
    servicos.forEach(s => {
      categorias[s.cat] = (categorias[s.cat] || 0) + 1;
    });
    
    Object.entries(categorias)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        console.log(`   ${cat.padEnd(35)} ${count.toString().padStart(3)} serviços`);
      });

    console.log("\n💡 Dica: Use SELECT COUNT(*), categoria FROM servico GROUP BY categoria ORDER BY COUNT(*) DESC; para verificar");

  } catch (e) {
    console.error("\n❌ ========================================");
    console.error("❌ ERRO DURANTE O SEED");
    console.error("❌ ========================================");
    console.error(e);
    throw e;
  } finally {
    client.release();
  }
};

// Executar o seed se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedServicos()
    .then(() => {
      console.log("\n🎉 Seed finalizado! Pode fechar a conexão.\n");
      process.exit(0);
    })
    .catch((err) => {
      console.error("\n💥 Erro fatal:", err);
      process.exit(1);
    });
}

export default seedServicos;