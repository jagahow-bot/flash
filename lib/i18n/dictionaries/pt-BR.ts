import type { LandingDictionary } from "@/lib/i18n/types";

const dictionary: LandingDictionary = {
  locale: "pt-BR",
  meta: {
    title:
      "FLASH — Sistema Inteligente de Reservas e Gestão de Casos para Estúdios de Tatuagem",
    description:
      "Diga adeus às mensagens diretas caóticas! O FLASH oferece links de reserva personalizados, resumos de requisitos por IA, marca de água automática e painéis de discussão dedicados. Sem taxas mensais fixas: concentre-se na sua arte e gerencie facilmente os seus desenhos personalizados e flash.",
    ogDescription:
      "Diga adeus às mensagens diretas caóticas! O FLASH oferece links de reserva personalizados, resumos por IA, marca de água automática e painéis dedicados.",
    keywords: [
      "agendamento tatuagem",
      "gestão estúdio tatuagem",
      "sistema tatuagem",
      "FLASH",
      "gestão casos tatuagem",
      "resumo inteligente IA",
      "sistema gestão reservas tatuagem",
      "reserva multi-idioma",
    ],
  },
  header: {
    home: "Início",
    login: "Entrar",
    myProjects: "Meus agendamentos",
    studioRegister: "Cadastrar estúdio",
    studioDashboard: "Painel do estúdio",
    language: "Idioma",
    switchToEn: "English",
    switchToZh: "繁體中文",
  },
  hero: {
    eyebrow: "Feito para estúdios de tatuagem",
    brand: "FLASH",
    heading: "Gestão de Casos e Reservas para Estúdios de Tatuagem",
    subtitle: "Cada linha, ponto e sombra merece 100% do seu foco.",
    description: "",
    ctaLogin: "Entrar",
    ctaRegisterStudio: "Cadastrar estúdio",
  },
  about: {
    title: "Por que os tatuadores escolhem o sistema de gestão de reservas FLASH?",
    paragraphs: [
      "Cada linha, ponto e sombra merece 100% do seu foco. Mas a realidade é que responder a mensagens diretas e gerenciar reservas consome a maior parte da sua energia.",
      "O FLASH nasceu para libertar as suas mãos. Automatizamos tarefas tediosas como recolher requisitos, agendar horários e proteger esboços.",
      "Chega de ficar travado à espera das medidas do cliente e de buscar registos em várias aplicações sociais. Reduza a comunicação desnecessária a zero e guarde o seu tempo mais valioso para a próxima obra-prima.",
    ],
  },
  features: {
    title: "Gestão automatizada do estúdio, economizando 80% do tempo de comunicação",
    subtitle: "",
    items: [
      {
        title: "Resumo inteligente de IA: Captura com precisão as necessidades de tatuagem do cliente",
        schemaName: "Resumo inteligente de IA",
        description:
          "Quando o cliente envia o pedido, a IA resume os pontos-chave — complexidade e riscos de relance antes de orçar.",
      },
      {
        title: "Suporte multi-idioma: Aceite reservas de viajantes internacionais sem complicações",
        schemaName: "Suporte multi-idioma",
        description:
          "Interface em nove idiomas para que viajantes internacionais reservem com facilidade — zero barreiras de comunicação.",
      },
      {
        title: "Painel bidirecional independente: O histórico de revisões de esboços nunca se perde",
        schemaName: "Painel bidirecional independente",
        description:
          "Vistas separadas para clientes e estúdio preservam cada revisão do esboço — sem mensagens perdidas no direct.",
      },
      {
        title: "Marca de água inteligente automática: Proteção abrangente para esboços originais",
        schemaName: "Marca de água inteligente automática",
        description:
          "Os uploads recebem marca de água automaticamente para proteger esboços originais de capturas e vazamentos.",
      },
    ],
  },
  howItWorks: {
    title: "Da primeira consulta ao consentimento: o fluxo de reserva de tatuagem mais fluido",
    subtitle: "Cliente e estúdio, cada um com seu fluxo —\no andamento fica sincronizado",
    clientTitle: "Lado cliente: orientação clara, preenchimento fácil",
    clientSteps: [
      {
        title: "Abrir o link de agendamento",
        description: "Já tem uma ideia para a tatuagem que quer fazer?",
      },
      {
        title: "Conte sua ideia",
        description: "Desenho, local, orçamento — fale com suas palavras, fotos também servem",
      },
      {
        title: "Espere o orçamento e escolha o horário",
        description: "Quando o preço chegar, escolha um horário e pague o sinal conforme as instruções",
      },
      {
        title: "Sempre saiba como está indo",
        description: "Sem perguntar «e aí, como está?» toda hora — abre e vê",
      },
    ],
    studioTitle: "Lado estúdio: de relance, arquivo digital",
    studioSteps: [
      {
        title: "Coloque o estúdio no ar",
        description: "Cadastre-se, preencha o básico e compartilhe seu link de agendamento",
      },
      {
        title: "Veja casos novos e decida se encaixam",
        description: "Pedidos de relance — confirma e passa o orçamento",
      },
      {
        title: "Marque horários e receba o sinal",
        description: "Você oferece dias livres; eles escolhem, pagam e o agendamento fica feito",
      },
      {
        title: "Peças grandes em várias visitas",
        description: "Cada sessão, quando é — tudo claro",
      },
    ],
  },
  pricing: {
    title: "Preços flexíveis para tatuadores: sem mensalidade fixa, pague por reserva",
    subtitle:
      "Sem mensalidade fixa — você só paga quando as reservas são confirmadas pelo FLASH.",
    pricePerBooking: "USD $3 por reserva bem-sucedida a cada mês",
    noMonthlyFee: "Sem taxa mensal fixa",
    freeTier: "As primeiras 30 reservas por estúdio são GRÁTIS",
    footnote:
      "A cobrança é baseada na quantidade de reservas bem-sucedidas do estúdio em cada mês. Projetos com várias sessões contam como uma reserva na confirmação.",
  },
  faq: {
    title: "Perguntas frequentes sobre o software de gestão de tatuagens FLASH",
    subtitle: "O que estúdios costumam perguntar, em linguagem direta",
    items: [
      {
        question: "Para quem é o FLASH?",
        answer:
          "Se você é artista ou dono de estúdio — menos passos perdidos, fluxo mais claro.\nSe você é cliente — agendar e acompanhar seu próprio andamento.",
      },
      {
        question: "Como gerenciar peças grandes em várias sessões?",
        answer:
          "Um caso pode ter várias sessões, cada uma registrada.\nVocê e o cliente sempre sabem qual sessão é e quando é a próxima.",
      },
      {
        question: "Como o sistema organiza os pedidos?",
        answer:
          "Quando o cliente envia, vira um resumo com os pontos principais.\nComplexidade, riscos de cover-up — o suficiente para decidir se aceita o caso.",
      },
      {
        question: "Como o cliente agenda e paga o sinal?",
        answer:
          "O cliente começa pelo seu link; depois do orçamento escolhe horário e paga o sinal.\nVocê confirma o pagamento e o agendamento está feito.",
      },
      {
        question: "O que dá para fazer no painel?",
        answer:
          "Primeiro casos pendentes e sinais sem conciliar, depois os próximos horários.\nAbre e sabe o que fazer hoje.",
      },
      {
        question: "Qual a diferença de um software de agendamento genérico?",
        answer:
          "A maioria só cuida de marcar um horário.\nEstúdios de tatuagem também lidam com pedidos, sinal e várias visitas — o FLASH foi feito para isso.",
      },
      {
        question: "Dá para aceitar cover-up?",
        answer:
          "Sim. O cliente pode marcar cover-up e casos com risco são sinalizados.\nVocê também pode dizer de antemão se aceita — evita conversa inútil.",
      },
      {
        question: "O estúdio pode oferecer tatuagens flash?",
        answer:
          "Sim. Envie tatuagens flash nas configurações do painel — preço único ou preço por design, além dos tamanhos que o cliente pode escolher.\nNa página de agendamento, o cliente pode ver o catálogo flash ou iniciar um pedido de tatuagem personalizada.",
      },
      {
        question: "Precisa instalar um app?",
        answer:
          "Não. Cliente e estúdio usam um link no navegador — celular ou computador, tanto faz.",
      },
      {
        question: "E se o sinal não bater com seus registros?",
        answer:
          "Quem pagou e quanto fica registrado. O painel sinaliza sinais sem conciliar — sem vasculhar o direct.",
      },
      {
        question: "O cliente se perde em peças de várias sessões?",
        answer:
          "Cada sessão fica marcada num caso só. O cliente abre seu link e vê qual sessão é e quando é a próxima.",
      },
    ],
  },
  cta: {
    title: "Quer menos agendamentos perdidos e mensagens repetidas?",
    description:
      "Quer agendar? Abra o link.\nQuer gerenciar melhor seus casos? Cadastre-se agora.",
    loginButton: "Entrar",
    studioButton: "Cadastrar estúdio",
  },
  footer: {
    tagline: "Agendamento e gestão de projetos para estúdios de tatuagem",
    product: "Produto",
    account: "Conta",
    legal: "Legal",
    login: "Entrar",
    myProjects: "Meus agendamentos",
    studioRegister: "Cadastrar estúdio",
    privacyPolicy: "Política de Privacidade",
    termsOfService: "Termos de Serviço",
    blog: "Guias para estúdios",
    rights: "Todos os direitos reservados.",
    contactSupportPrefix: "Dúvidas? Envie um e-mail para ",
  },
  legal: {
    privacy: {
      metaTitle: "Política de Privacidade",
      metaDescription:
        "Como a FLASH coleta, usa e protege suas informações pessoais no ink-flash.com.",
    },
    terms: {
      metaTitle: "Termos de Serviço",
      metaDescription:
        "Termos e condições para usar a plataforma de gestão de estúdios de tatuagem FLASH.",
    },
  },
  blog: {
    metaTitle: "Guias para estúdios de tatuagem | FLASH",
    metaDescription:
      "Proteção de direitos autorais, salvaguardas legais e dicas operacionais para tatuadores.",
    title: "Guias para estúdios de tatuagem",
    description:
      "Artigos práticos sobre proteção de arte, defesa jurídica e gestão segura do seu estúdio.",
    backToBlog: "Voltar aos artigos",
    readMore: "Ler artigo",
    categories: {
      ipProtection: "Proteção de IP",
      legalSafeguards: "Salvaguardas legais",
      globalMarketing: "Marketing global",
    },
  },
};

export default dictionary;
