import type { UserProfile, DayPlan, Meal, DietProgram, ShoppingItem } from "@/types";
import { DIET_PROGRAM_LABELS } from "@/types";
import { getFoodImageUrl } from "@/lib/food-images";

function createMeal(
  name: string,
  description: string,
  cal: number,
  prepTime: number,
  ingredients: string[],
  steps: string[],
  tips: string[]
): Meal {
  return {
    name,
    description,
    imageUrl: getFoodImageUrl(name, ingredients),
    prepTimeMinutes: prepTime,
    difficulty: prepTime <= 15 ? "Fácil" : prepTime <= 30 ? "Médio" : "Avançado",
    servings: 1,
    ingredients,
    steps,
    tips,
    nutrition: {
      calories: cal,
      protein: Math.round(cal * 0.28 / 4),
      carbs: Math.round(cal * 0.42 / 4),
      fat: Math.round(cal * 0.30 / 9),
    },
  };
}

const dayNames = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];

/** 7 dias completamente diferentes — 35 receitas únicas */
const WEEKLY_MEALS: DayPlan["meals"][] = [
  // ── DIA 1 ──
  {
    breakfast: createMeal(
      "Omelete Proteico com Espinafre e Queijo Branco",
      "Café da manhã saciante com proteínas de alta qualidade e ferro do espinafre para energia estável até o meio-dia.",
      320, 15,
      ["2 ovos grandes", "30g espinafre fresco", "30g queijo branco ralado", "1 colher (chá) azeite", "Sal e pimenta"],
      [
        "Seque o espinafre com papel-toalha para o omelete não ficar aguado.",
        "Bata os ovos vigorosamente por 30 segundos e tempere com sal e pimenta.",
        "Aqueça o azeite em fogo médio, refogue o espinafre por 1 minuto até murchar.",
        "Despeje os ovos, espalhe o queijo e cozinhe 2-3 min com tampa até firmar nas bordas.",
        "Dobre ao meio com espátula, cozinhe mais 1 minuto e sirva imediatamente.",
      ],
      ["Adicione chia nos ovos para +3g de fibras.", "Substitua espinafre por rúcula ou agrião."]
    ),
    snack1: createMeal(
      "Iogurte Grego com Frutas Vermelhas e Mel",
      "Lanche cremoso rico em proteínas e probióticos — controla a fome entre refeições.",
      180, 5,
      ["170g iogurte grego 0%", "75g frutas vermelhas congeladas", "1 colher (chá) mel", "1 colher (chá) chia"],
      [
        "Retire o iogurte da geladeira 5 min antes para textura mais cremosa.",
        "Monte em camadas: iogurte, frutas, mel e chia por cima.",
        "Se as frutas estiverem congeladas, aguarde 2 min para amolecer levemente.",
        "Consuma na hora ou leve com frutas separadas na marmita.",
      ],
      ["Frutas congeladas são mais econômicas.", "Congele 30 min para textura de sorvete."]
    ),
    lunch: createMeal(
      "Frango Grelhado com Quinoa e Legumes Salteados",
      "Almoço equilibrado: proteína magra, carboidrato complexo e fibras para saciedade prolongada.",
      520, 40,
      ["150g peito de frango", "45g quinoa", "1 xícara brócolis", "1/2 cenoura", "1/2 abobrinha", "2 dentes alho", "Suco de 1/2 limão", "2 colheres azeite"],
      [
        "Marine o frango com alho, limão, sal e pimenta por 10-30 min.",
        "Lave a quinoa até a água sair transparente. Cozinhe 1:2 com água por 15 min tampado.",
        "Grelhe o frango em fogo alto 5-6 min de cada lado até 74°C internos.",
        "Deixe o frango descansar 3 min e fatie em tiras diagonais.",
        "Salteie os legumes no azeite restante por 4-5 min mantendo crocância.",
        "Monte: base de quinoa, legumes e frango fatiado por cima.",
      ],
      ["Quinoa dura 4 dias na geladeira — prepare em batch.", "Corte o frango uniforme para cozinhar por igual."]
    ),
    snack2: createMeal(
      "Mix de Castanhas com Uvas Frescas",
      "Gorduras boas + frutose natural para energia sustentada sem ultraprocessados.",
      160, 3,
      ["2 castanhas-do-pará", "10 amêndoas", "80g uvas verdes sem semente"],
      [
        "Porcione castanhas e amêndoas antes — evita comer em excesso.",
        "Lave e seque as uvas bem.",
        "Combine na hora de consumir para manter crocância.",
      ],
      ["Apenas 2 castanhas-do-pará supre a selenium diária.", "Prefira oleaginosas sem sal."]
    ),
    dinner: createMeal(
      "Salmão Assado com Purê Cremoso de Batata Doce",
      "Jantar leve: ômega-3 do salmão e batata doce de baixo índice glicêmico.",
      450, 35,
      ["120g filé de salmão", "1 batata doce média (200g)", "1 colher azeite", "Endro", "Suco de 1 limão", "1 dente alho"],
      [
        "Pré-aqueça o forno a 200°C. Tempere o salmão com alho, limão, endro e sal.",
        "Cozinhe a batata doce no microondas 8 min até macia.",
        "Asse o salmão regado com azeite por 15-18 min até opaco e lascando.",
        "Amasse a batata com azeite, limão e sal até purê cremoso.",
        "Sirva o salmão sobre o purê ainda quente com endro fresco.",
      ],
      ["Não asse o salmão além de opaco — fica seco.", "Purê com leite de coco fica mais cremoso."]
    ),
  },

  // ── DIA 2 ──
  {
    breakfast: createMeal(
      "Tapioca Recheada com Queijo Branco e Tomate",
      "Clássico brasileiro sem glúten: leve, prático e perfeito para começar o dia com energia.",
      280, 10,
      ["2 colheres (sopa) goma de tapioca", "40g queijo branco", "3 fatias tomate", "Orégano", "Azeite"],
      [
        "Peneire a goma numa frigideira antiaderente fria e espalhe uniformemente.",
        "Leve ao fogo médio até soltar das bordas (2-3 min).",
        "Vire, adicione queijo e tomate, dobre ao meio e doure 1 min.",
        "Finalize com orégano e fio de azeite. Sirva quente.",
      ],
      ["Use tapioca hidratada pronta para resultado mais consistente.", "Adicione ovo mexido para mais proteína."]
    ),
    snack1: createMeal(
      "Banana com Pasta de Amendoim Integral",
      "Combinação clássica de potássio e gorduras boas — lanche rápido e energético.",
      200, 3,
      ["1 banana média madura", "1 colher (sopa) pasta de amendoim 100%"],
      [
        "Corte a banana ao meio no sentido do comprimento.",
        "Espalhe a pasta de amendoim generosamente em cada metade.",
        "Consuma imediatamente para textura ideal.",
      ],
      ["Prefira pasta sem açúcar ou óleo de palma.", "Congele a banana antes para textura de sorvete."]
    ),
    lunch: createMeal(
      "Estrogonofe de Frango Light com Arroz Integral",
      "Versão saudável do clássico brasileiro: cremoso, reconfortante e com menos calorias.",
      480, 35,
      ["150g peito de frango em cubos", "1/2 cebola", "1 colher ketchup", "2 colheres creme de ricota", "100ml caldo de legumes", "1/2 xícara arroz integral", "Sal e páprica"],
      [
        "Cozinhe o arroz integral separadamente (40 min ou panela de pressão 20 min).",
        "Refogue cebola, adicione frango e doure por 5 min.",
        "Acrescente ketchup, caldo e cozinhe 10 min em fogo baixo.",
        "Desligue o fogo, misture a ricota e ajuste sal e páprica.",
        "Sirva sobre o arroz integral com salsinha picada.",
      ],
      ["Substitua ricota por iogurte natural para versão ainda mais leve.", "Congele porções extras para a semana."]
    ),
    snack2: createMeal(
      "Maçã Assada com Canela",
      "Lanche doce natural sem açúcar adicionado — fibras e conforto térmico.",
      120, 15,
      ["1 maçã média", "1 colher (chá) canela em pó", "1 colher (chá) mel"],
      [
        "Retire o miolo da maçã e faça cortes superficiais na casca.",
        "Recheie o centro com mel e polvilhe canela generosamente.",
        "Asse a 180°C por 12-15 min até macia e aromática.",
        "Sirva morna — pode adicionar iogurte por cima.",
      ],
      ["Maçã verde fica mais firme; gala fica mais doce.", "Microondas 3 min funciona no improviso."]
    ),
    dinner: createMeal(
      "Peixe Assado com Legumes ao Forno",
      "Jantar leve e colorido: proteína magra com vegetais assados caramelizados.",
      420, 30,
      ["150g filé de peixe branco", "1 abobrinha", "1 pimentão", "1 cebola roxa", "2 colheres azeite", "Limão", "Ervas"],
      [
        "Pré-aqueça o forno a 200°C. Corte legumes em cubos uniformes.",
        "Tempere legumes com azeite, sal, pimenta e ervas. Asse 15 min.",
        "Tempere o peixe com limão, sal e pimenta.",
        "Adicione o peixe sobre os legumes e asse mais 12-15 min.",
        "Sirva com fio de azeite e raspas de limão.",
      ],
      ["Tilápia, bacalhau ou pescada funcionam bem.", "Não asse demais — peixe cozinha rápido."]
    ),
  },

  // ── DIA 3 ──
  {
    breakfast: createMeal(
      "Panqueca de Aveia com Mel e Frutas",
      "Panqueca nutritiva sem farinha refinada — fibras, proteína e doçura natural.",
      310, 15,
      ["1 ovo", "3 colheres aveia em flocos", "1/2 banana amassada", "1 colher (chá) mel", "1/2 colher (chá) canela", "Frutas para decorar"],
      [
        "Amasse a banana e misture com ovo, aveia, mel e canela.",
        "Deixe a massa descansar 5 min para a aveia hidratar.",
        "Aqueça frigideira antiaderente e despeje porções pequenas.",
        "Cozinhe 2 min de cada lado até dourar.",
        "Sirva empilhadas com frutas frescas por cima.",
      ],
      ["Adicione whey para boost proteico.", "Massa pode ser preparada na noite anterior."]
    ),
    snack1: createMeal(
      "Smoothie Verde Detox",
      "Vitamina refrescante com clorofila, fibras e vitamina C para o meio da manhã.",
      150, 5,
      ["1 folha couve manteiga", "1/2 maçã verde", "Suco de 1/2 limão", "200ml água de coco", "1 colher (chá) gengibre ralado"],
      [
        "Lave bem a couve e retire o talo grosso.",
        "Bata todos os ingredientes no liquidificador por 1 min.",
        "Coe se preferir textura mais lisa.",
        "Sirva gelado imediatamente.",
      ],
      ["Congele cubos de água de coco para textura thicker.", "Adicione hortelã para frescor extra."]
    ),
    lunch: createMeal(
      "Carne Moída Magra com Arroz Integral e Salada",
      "Almoço clássico brasileiro reinventado: proteína, carboidrato complexo e fibras.",
      510, 30,
      ["120g carne moída patinho", "1/2 xícara arroz integral", "Folhas verdes", "Tomate cereja", "1 dente alho", "Cebola", "Azeite"],
      [
        "Cozinhe o arroz integral (1:2,5 água, 35-40 min).",
        "Refogue alho e cebola, adicione carne e desgrude bem em fogo alto.",
        "Tempere com sal, pimenta e cominho. Cozinhe 8 min.",
        "Monte salada com folhas, tomate e azeite.",
        "Sirva carne ao lado do arroz com salada fresca.",
      ],
      ["Escorra gordura excessiva após refogar a carne.", "Substitua por carne de soja para versão vegetariana."]
    ),
    snack2: createMeal(
      "Mix de Oleaginosas e Frutas Secas",
      "Energia portátil com magnésio, fibras e antioxidantes naturais.",
      170, 2,
      ["10g amêndoas", "10g nozes", "10g uvas-passas", "10g damasco seco"],
      [
        "Misture todos os ingredientes em porção única.",
        "Consuma lentamente mastigando bem.",
        "Beba água junto para melhor digestão.",
      ],
      ["Porcione antes — oleaginosas são calóricas.", "Prefira frutas secas sem açúcar adicionado."]
    ),
    dinner: createMeal(
      "Sopa Cremosa de Legumes com Frango Desfiado",
      "Jantar reconfortante e leve — ideal para digestão noturna tranquila.",
      380, 35,
      ["100g peito de frango", "1 batata", "1 cenoura", "1/2 abobrinha", "1 litro caldo de legumes", "Salsinha", "Azeite"],
      [
        "Cozinhe o frango no caldo até ficar macio (20 min). Desfie.",
        "Adicione legumes picados e cozinhe 15 min até amolecer.",
        "Bata metade da sopa no liquidificador para textura cremosa.",
        "Misture com a metade chunky, adicione frango desfiado.",
        "Ajuste sal, finalize com azeite e salsinha.",
      ],
      ["Congele porções para dias corridos.", "Adicione gengibre para imunidade."]
    ),
  },

  // ── DIA 4 ──
  {
    breakfast: createMeal(
      "Crepioca de Atum com Requeijão Light",
      "Café proteico e prático — perfeito para quem tem pressa mas não abre mão de comer bem.",
      290, 12,
      ["2 colheres goma de tapioca", "1 ovo", "1 lata atum em água escorrido", "1 colher requeijão light", "Sal e pimenta"],
      [
        "Misture ovo, goma e sal até formar massa homogênea.",
        "Despeje em frigideira antiaderente e espalhe fino.",
        "Quando firmar, vire e adicione atum e requeijão.",
        "Dobre ao meio, doure 1 min e sirva quente.",
      ],
      ["Escorra bem o atum para reduzir sódio.", "Adicione tomate picado para frescor."]
    ),
    snack1: createMeal(
      "Queijo Cottage com Mamão Picado",
      "Lanche tropical proteico — combinação clássica de proteína e enzimas digestivas.",
      160, 5,
      ["150g queijo cottage", "1/2 mamão papaya picado", "1 colher (chá) mel", "Hortelã"],
      [
        "Corte o mamão em cubos pequenos.",
        "Monte o cottage em uma tigela e distribua o mamão por cima.",
        "Regue com mel e decore com folhas de hortelã.",
        "Sirva gelado.",
      ],
      ["Mamão verde tem menos açúcar.", "Substitua por melão na temporada."]
    ),
    lunch: createMeal(
      "Salada de Grão-de-Bico com Frango e Hortelã",
      "Almoço mediterrâneo refrescante: fibras, proteína e gorduras boas do azeite.",
      490, 25,
      ["150g peito de frango grelhado", "1 xícara grão-de-bico cozido", "Pepino", "Tomate", "Hortelã", "Suco de limão", "Azeite", "Cominho"],
      [
        "Grelhe o frango temperado e corte em cubos.",
        "Misture grão-de-bico, pepino e tomate em cubos.",
        "Adicione frango, hortelã picada e tempere com limão, azeite e cominho.",
        "Deixe descansar 10 min para os sabores se integrarem.",
        "Sirva à temperatura ambiente ou levemente gelada.",
      ],
      ["Grão-de-bico enlatado: enxágue bem para reduzir sódio.", "Adicione tahine para versão mais cremosa."]
    ),
    snack2: createMeal(
      "Pera com Iogurte e Nozes",
      "Lanche elegante e saciante com fibras solúveis e ômega-3.",
      150, 5,
      ["1 pera madura", "100g iogurte natural", "3 nozes picadas", "Canela"],
      [
        "Corte a pera em fatias finas.",
        "Disponha em prato e adicione iogurte no centro.",
        "Polvilhe nozes picadas e canela por cima.",
        "Consuma imediatamente.",
      ],
      ["Pera conference é mais doce; williams mais suculenta.", "Toaste as nozes 2 min para mais sabor."]
    ),
    dinner: createMeal(
      "Omelete de Forno com Vegetais Coloridos",
      "Jantar prático que parece restaurante — proteína completa com mínimo de louça.",
      400, 25,
      ["3 ovos", "1/2 pimentão", "1/2 cebola", "50g queijo muçarela light", "Espinafre", "Azeite", "Orégano"],
      [
        "Pré-aqueça o forno a 180°C. Pique vegetais uniformemente.",
        "Refogue vegetais 3 min em frigideira que vá ao forno.",
        "Bata ovos com sal, pimenta e orégano. Despeje sobre vegetais.",
        "Espalhe queijo e leve ao forno por 15-18 min até firmar.",
        "Deixe descansar 2 min antes de fatiar e servir.",
      ],
      ["Use frigideira de ferro para gratinar melhor.", "Adicione cogumelos para umami extra."]
    ),
  },

  // ── DIA 5 ──
  {
    breakfast: createMeal(
      "Overnight Oats com Chia e Frutas",
      "Prepare na noite anterior — café da manhã pronto ao acordar, sem stress.",
      300, 5,
      ["1/2 xícara aveia em flocos", "200ml leite desnatado", "1 colher chia", "1 colher mel", "Frutas frescas", "Canela"],
      [
        "Misture aveia, leite, chia e mel em pote com tampa.",
        "Refrigere overnight (mínimo 6 horas).",
        "Pela manhã, mexa bem e adicione frutas frescas.",
        "Finalize com canela e consuma frio ou morno.",
      ],
      ["Use leite vegetal para versão vegana.", "Dura 3 dias na geladeira — prepare batch."]
    ),
    snack1: createMeal(
      "Vitamina de Frutas com Leite",
      "Clássico brasileiro nutritivo — vitaminas, cálcio e energia natural.",
      190, 5,
      ["1 banana", "1/2 mamão", "200ml leite desnatado", "1 colher mel", "Gelo"],
      [
        "Descasque e pique as frutas.",
        "Bata no liquidificador com leite, mel e gelo por 1 min.",
        "Sirva imediatamente para máximo de nutrientes.",
      ],
      ["Adicione aveia para mais saciedade.", "Congele frutas maduras para usar quando quiser."]
    ),
    lunch: createMeal(
      "Wrap de Frango com Salada e Homus",
      "Almoço prático para levar — proteína, fibras e gorduras boas em formato portátil.",
      500, 20,
      ["1 wrap integral grande", "120g frango desfiado", "Alface", "Tomate", "Pepino", "2 colheres homus", "Limão"],
      [
        "Aqueça levemente o wrap para ficar flexível.",
        "Espalhe homus no centro, deixando bordas livres.",
        "Distribua frango, alface, tomate e pepino em fatias.",
        "Regue com limão, enrole firme dobrando as laterais.",
        "Corte ao meio na diagonal e sirva ou embale.",
      ],
      ["Homus caseiro: grão-de-bico + tahine + limão.", "Envolva em papel manteiga para não desmontar."]
    ),
    snack2: createMeal(
      "Morangos com Iogurte e Granola",
      "Lanche antioxidante com textura crocante — satisfaz a vontade de doce.",
      140, 5,
      ["10 morangos frescos", "100g iogurte grego", "2 colheres granola sem açúcar"],
      [
        "Lave e seque os morangos. Corte ao meio se grandes.",
        "Monte em camadas: iogurte, morangos, granola.",
        "Consuma imediatamente para granola crocante.",
      ],
      ["Morangos congelados funcionam off-season.", "Faça granola caseira com aveia e mel."]
    ),
    dinner: createMeal(
      "Tilápia Grelhada com Purê de Mandioquinha",
      "Jantar sofisticado e leve — peixe branco suculento com acompanhamento cremoso.",
      430, 30,
      ["150g tilápia", "2 mandioquinhas médias", "1 colher azeite", "Alho", "Endro", "Limão", "Noz-moscada"],
      [
        "Cozinhe mandioquinhas descascadas em água 20 min até macias.",
        "Tempere tilápia com alho, limão, sal e endro.",
        "Grelhe em frigideira ou grill 3-4 min de cada lado.",
        "Amasse mandioquinhas com azeite, sal e noz-moscada.",
        "Sirva tilápia sobre purê com limão e endro fresco.",
      ],
      ["Não grelhe demais — tilápia seca rápido.", "Purê de mandioquinha é mais leve que batata."]
    ),
  },

  // ── DIA 6 ──
  {
    breakfast: createMeal(
      "Ovos Mexidos com Abacate e Torrada Integral",
      "Café da manhã trendy e nutritivo — gorduras boas do abacate com proteína dos ovos.",
      340, 12,
      ["2 ovos", "1/2 abacate maduro", "1 fatia pão integral", "Limão", "Sal", "Pimenta", "Azeite"],
      [
        "Toste o pão integral até dourar.",
        "Amasse abacate com limão, sal e pimenta.",
        "Bata ovos e cozinhe em fogo baixo mexendo suavemente.",
        "Espalhe abacate no pão, coloque ovos por cima.",
        "Finalize com azeite e pimenta-do-reino.",
      ],
      ["Abacate maduro: casca escura e cede levemente à pressão.", "Adicione tomate cereja para cor."]
    ),
    snack1: createMeal(
      "Granola com Iogurte e Mel",
      "Lanche crocante e probiótico — saciedade com prazer.",
      190, 3,
      ["150g iogurte natural", "3 colheres granola", "1 colher mel", "Canela"],
      [
        "Despeje iogurte em tigela.",
        "Adicione granola por cima para manter crocância.",
        "Regue com mel e polvilhe canela.",
      ],
      ["Faça granola: aveia + mel + forno 150°C 20 min.", "Use iogurte grego para mais proteína."]
    ),
    lunch: createMeal(
      "Feijão Tropeiro Light com Couve",
      "Sábado brasileiro saudável — sabor tradicional com menos calorias.",
      530, 35,
      ["1/2 xícara feijão cozido", "80g carne seca dessalgada ou frango desfiado", "Couve manteiga", "1 ovo", "Cebola", "Alho", "Farinha de mandioca", "Azeite"],
      [
        "Refogue alho, cebola e carne/frango picados.",
        "Adicione feijão cozido e cozinhe 5 min.",
        "Refogue couve picada fina separadamente com alho.",
        "Cozinhe ovo mexido ou pochê.",
        "Monte prato com feijão tropeiro, couve refogada e ovo.",
      ],
      ["Carne seca: dessalgue 24h trocando água.", "Versão vegana: use cogumelos no lugar da carne."]
    ),
    snack2: createMeal(
      "Castanha de Caju com Damasco Seco",
      "Lanche funcional com magnésio e vitamina A — energia inteligente.",
      155, 2,
      ["15g castanha de caju", "20g damasco seco"],
      [
        "Porcione castanhas e damascos.",
        "Alterne um e outro mastigando devagar.",
      ],
      ["Castanha de caju tem triptofano — ajuda no humor.", "Damasco seco é rico em ferro."]
    ),
    dinner: createMeal(
      "Hambúrguer de Frango Caseiro com Salada",
      "Jantar de fim de semana sem culpa — sabor de hambúrguer com ingredientes reais.",
      460, 25,
      ["150g peito de frango moído", "1 ovo", "Cebola picada", "Alho", "Pão integral", "Alface", "Tomate", "Mostarda"],
      [
        "Misture frango moído, ovo, cebola, alho e temperos. Forme hambúrguer.",
        "Grelhe 5-6 min de cada lado até cozinhar completamente.",
        "Toste o pão integral levemente.",
        "Monte com alface, tomate e mostarda.",
        "Sirva com salada verde ao lado.",
      ],
      ["Adicione aveia na massa para firmeza.", "Assar no forno 200°C 20 min é alternativa."]
    ),
  },

  // ── DIA 7 ──
  {
    breakfast: createMeal(
      "Açaí Bowl com Granola e Banana",
      "Domingo tropical — antioxidantes, energia e sabor que parece sobremesa.",
      350, 8,
      ["200g polpa de açaí sem açúcar", "1 banana", "2 colheres granola", "1 colher mel", "Frutas para decorar"],
      [
        "Bata a polpa de açaí com metade da banana no liquidificador.",
        "Despeje em tigela — consistência de sorvete espesso.",
        "Fatia a banana restante e decore com granola e frutas.",
        "Regue com mel e sirva imediatamente.",
      ],
      ["Congele a tigela 10 min para textura mais firme.", "Adicione pasta de amendoim para proteína extra."]
    ),
    snack1: createMeal(
      "Barra de Cereal Caseira com Castanhas",
      "Lanche prático de preparo antecipado — sem conservantes industrializados.",
      180, 20,
      ["1 xícara aveia", "2 colheres mel", "1 colher pasta amendoim", "Castanhas picadas", "Canela", "Gotas de chocolate 70%"],
      [
        "Misture aveia, mel, pasta de amendoim e canela.",
        "Adicione castanhas e gotas de chocolate.",
        "Pressione em forma forrada e asse 15 min a 160°C.",
        "Deixe esfriar completamente e corte em barras.",
        "Armazene em pote hermético por até 5 dias.",
      ],
      ["Sem chocolate fica ainda mais saudável.", "Adicione whey para versão proteica."]
    ),
    lunch: createMeal(
      "Risoto de Cogumelos com Parmesão",
      "Almoço de domingo especial — cremoso, aromático e reconfortante.",
      510, 40,
      ["1/2 xícara arroz arbóreo", "150g cogumelos variados", "1 litro caldo quente", "Cebola", "Vinho branco (opcional)", "Parmesão ralado", "Manteiga light"],
      [
        "Refogue cebola na manteiga até transparente.",
        "Adicione cogumelos fatiados e refogue 5 min.",
        "Acrescente arroz e toste 2 min. Adicione vinho e deixe evaporar.",
        "Adicione caldo quente concha a concha, mexendo sempre, por 18-20 min.",
        "Finalize com parmesão, ajuste sal e sirva imediatamente cremoso.",
      ],
      ["Caldo quente é essencial — nunca use frio.", "Shitake + champignon dão sabor profundo."]
    ),
    snack2: createMeal(
      "Uvas e Queijo Minas Frescal",
      "Lanche sofisticado e leve — combinação clássica de fruta e laticínio.",
      130, 3,
      ["1 cacho uvas verdes (80g)", "40g queijo minas frescal"],
      [
        "Lave e seque as uvas.",
        "Corte o queijo em cubos pequenos.",
        "Intercale uvas e queijo no palito ou prato.",
      ],
      ["Uvas congeladas viram 'uvas de sobremesa'.", "Queijo minas tem menos sódio que processados."]
    ),
    dinner: createMeal(
      "Macarrão Integral ao Pesto com Tomate Cereja",
      "Jantar leve de domingo — carboidrato complexo com gorduras boas do pesto.",
      440, 20,
      ["80g macarrão integral", "2 colheres pesto caseiro ou comprado", "Tomate cereja", "Rúcula", "Parmesão", "Azeite"],
      [
        "Cozinhe macarrão integral al dente conforme embalagem.",
        "Reserve 1/2 xícara da água do cozimento.",
        "Misture macarrão escorrido com pesto e água reservada.",
        "Adicione tomate cereja cortado ao meio e rúcula.",
        "Finalize com parmesão e fio de azeite.",
      ],
      ["Pesto caseiro: manjericão + pinoli + azeite + alho.", "Adicione frango grelhado para mais proteína."]
    ),
  },
];

function adjustMealCalories(meal: Meal, delta: number): Meal {
  if (delta === 0) return meal;
  return {
    ...meal,
    nutrition: { ...meal.nutrition, calories: meal.nutrition.calories + delta },
  };
}

function buildDay(dayIndex: number, program: DietProgram): DayPlan {
  const calAdjust =
    program === "emagrecimento_rapido" ? -80
    : program === "proteinas" ? 60
    : 0;

  const base = WEEKLY_MEALS[dayIndex];
  const adjust = (m: Meal) => adjustMealCalories(m, calAdjust);

  return {
    day: dayIndex + 1,
    dayName: dayNames[dayIndex],
    meals: {
      breakfast: adjust(base.breakfast),
      snack1: adjust(base.snack1),
      lunch: adjust(base.lunch),
      snack2: adjust(base.snack2),
      dinner: adjust(base.dinner),
    },
  };
}

const SHOPPING_LIST: ShoppingItem[] = [
  { item: "Ovos brancos grandes", quantity: "18 unidades", category: "Proteínas" },
  { item: "Peito de frango", quantity: "1,2 kg", category: "Proteínas" },
  { item: "Filé de salmão", quantity: "120g", category: "Proteínas" },
  { item: "Filé de peixe branco / tilápia", quantity: "300g", category: "Proteínas" },
  { item: "Carne moída patinho", quantity: "120g", category: "Proteínas" },
  { item: "Carne seca ou frango extra", quantity: "80g", category: "Proteínas" },
  { item: "Atum em lata (água)", quantity: "1 lata", category: "Proteínas" },
  { item: "Iogurte grego / natural 0%", quantity: "6 potes de 170g", category: "Laticínios" },
  { item: "Queijo branco / cottage / minas", quantity: "400g total", category: "Laticínios" },
  { item: "Requeijão light", quantity: "1 pote", category: "Laticínios" },
  { item: "Parmesão ralado", quantity: "50g", category: "Laticínios" },
  { item: "Leite desnatado", quantity: "1 litro", category: "Laticínios" },
  { item: "Quinoa", quantity: "200g", category: "Grãos" },
  { item: "Arroz integral", quantity: "500g", category: "Grãos" },
  { item: "Arroz arbóreo", quantity: "200g", category: "Grãos" },
  { item: "Aveia em flocos", quantity: "500g", category: "Grãos" },
  { item: "Macarrão integral", quantity: "250g", category: "Grãos" },
  { item: "Goma de tapioca", quantity: "500g", category: "Grãos" },
  { item: "Feijão cozido / seco", quantity: "300g cozido", category: "Grãos" },
  { item: "Grão-de-bico cozido", quantity: "200g", category: "Grãos" },
  { item: "Wrap / pão integral", quantity: "4 unidades", category: "Grãos" },
  { item: "Granola sem açúcar", quantity: "200g", category: "Grãos" },
  { item: "Batata doce", quantity: "200g", category: "Vegetais" },
  { item: "Mandioquinha", quantity: "400g", category: "Vegetais" },
  { item: "Espinafre / couve manteiga", quantity: "2 maços", category: "Vegetais" },
  { item: "Brócolis", quantity: "1 cabeça", category: "Vegetais" },
  { item: "Cenoura", quantity: "500g", category: "Vegetais" },
  { item: "Abobrinha", quantity: "3 unidades", category: "Vegetais" },
  { item: "Cogumelos variados", quantity: "300g", category: "Vegetais" },
  { item: "Tomate / tomate cereja", quantity: "500g", category: "Vegetais" },
  { item: "Pimentão", quantity: "2 unidades", category: "Vegetais" },
  { item: "Cebola", quantity: "4 unidades", category: "Vegetais" },
  { item: "Alho", quantity: "1 cabeça", category: "Temperos" },
  { item: "Banana", quantity: "5 unidades", category: "Frutas" },
  { item: "Maçã", quantity: "3 unidades", category: "Frutas" },
  { item: "Mamão", quantity: "1 unidade média", category: "Frutas" },
  { item: "Pera", quantity: "1 unidade", category: "Frutas" },
  { item: "Morango", quantity: "200g", category: "Frutas" },
  { item: "Uvas verdes", quantity: "500g", category: "Frutas" },
  { item: "Frutas vermelhas congeladas", quantity: "200g", category: "Frutas" },
  { item: "Abacate", quantity: "1 unidade", category: "Frutas" },
  { item: "Polpa de açaí sem açúcar", quantity: "200g", category: "Frutas" },
  { item: "Castanha-do-pará / caju / amêndoas / nozes", quantity: "200g total", category: "Oleaginosas" },
  { item: "Pasta de amendoim 100%", quantity: "1 pote", category: "Oleaginosas" },
  { item: "Chia", quantity: "100g", category: "Oleaginosas" },
  { item: "Uvas-passas / damasco seco", quantity: "50g", category: "Frutas" },
  { item: "Mel puro", quantity: "200g", category: "Temperos" },
  { item: "Azeite extra virgem", quantity: "250ml", category: "Temperos" },
  { item: "Pesto", quantity: "1 pote pequeno", category: "Temperos" },
  { item: "Homus", quantity: "1 pote", category: "Temperos" },
  { item: "Limões", quantity: "6 unidades", category: "Temperos" },
];

export function generateDemoMealPlan(profile: UserProfile) {
  const program = profile.diet_program ?? "emagrecimento_moderado";
  const days = dayNames.map((_, i) => buildDay(i, program));

  return {
    days,
    shoppingList: SHOPPING_LIST,
    totalCaloriesPerDay: program === "emagrecimento_rapido" ? 1450 : program === "proteinas" ? 1900 : 1650,
    planSummary: `${profile.name}, seu plano premium tem 35 receitas únicas — uma diferente a cada refeição durante 7 dias! Programa: ${DIET_PROGRAM_LABELS[program]}. Meta: ${profile.current_weight}kg → ${profile.target_weight}kg.`,
    dietProgram: program,
  };
}
