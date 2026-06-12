import type { LandingDictionary } from "@/lib/i18n/types";

const dictionary: LandingDictionary = {
  locale: "pt-BR",
  meta: {
    title: "FLASH — Agendamento e gestão de projetos para estúdios de tatuagem",
    description:
      "Sistema de agendamento para estúdios de tatuagem: menos agendamentos perdidos, menos mensagens repetidas. Centralize pedidos, orçamentos, agenda, sinal e sessões múltiplas.",
    keywords: [
      "agendamento tatuagem",
      "gestão estúdio tatuagem",
      "sistema tatuagem",
      "FLASH",
      "sinal tatuagem",
      "tatuagem várias sessões",
      "gestão projetos tatuagem",
      "clientes tatuagem",
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
    heading: "Agendamento e gestão de projetos para estúdios de tatuagem",
    subtitle:
      "Menos agendamentos perdidos, menos mensagens repetidas,\npara você focar em tatuar",
    description:
      "Sem começar do zero no direct —\nvocê e seus clientes sempre sabem qual é o próximo passo.",
    ctaLogin: "Entrar",
    ctaRegisterStudio: "Cadastrar estúdio",
  },
  about: {
    title: "O que é o FLASH?",
    paragraphs: [
      "Um sistema de agendamento para estúdios de tatuagem.\nDonos e artistas gerenciam os casos no painel; clientes enviam pedidos e acompanham o andamento por conta própria. Fluxos separados, dados sincronizados.",
      "Já passou por isso? O cliente explica metade da ideia, o sinal não bate com a conta, sessões múltiplas se misturam e as mensagens perguntam «e aí, como está?» o tempo todo.\nO FLASH junta tudo num lugar: do pedido ao orçamento, agenda, sinal e várias sessões, com passos claros e registro.",
      "O cliente abre seu link para começar um caso; você abre o painel quando for trabalhar nele.",
    ],
  },
  features: {
    title: "O que economiza tempo do estúdio",
    subtitle:
      "Os passos onde agendamentos se perdem —\nsem depender só da memória",
    items: [
      {
        title: "Entender o que o cliente quer",
        schemaName: "Resumo de pedidos com IA",
        description:
          "Pedidos vagos, pontos claros ao abrir —\nvocê sabe no que está entrando antes de orçar.",
      },
      {
        title: "Orçamentos sem vai e vem eterno",
        schemaName: "Orçamento e agenda",
        description:
          "Novos casos num lugar só, envie horários quando quiser —\no cliente escolhe; você foca na arte.",
      },
      {
        title: "Sinal que fecha certinho",
        schemaName: "Controle de sinal",
        description:
          "Quem pagou, quanto — tudo registrado.\nSem vasculhar o histórico de chat para conciliar.",
      },
      {
        title: "Personalizada vs tatuagem flash",
        schemaName: "Reserva personalizada e flash",
        description:
          "Seja uma consulta personalizada ou escolher uma tatuagem flash,\nvocê e seu cliente podem se preparar facilmente para a próxima sessão.",
      },
    ],
  },
  howItWorks: {
    title: "Como funciona",
    subtitle: "Cliente e estúdio, cada um com seu fluxo —\no andamento fica sincronizado",
    clientTitle: "Para clientes",
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
    studioTitle: "Para o estúdio",
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
    title: "Preços simples por uso",
    subtitle:
      "Sem mensalidade fixa — você só paga quando as reservas são confirmadas pelo FLASH.",
    pricePerBooking: "USD $3 por reserva bem-sucedida a cada mês",
    noMonthlyFee: "Sem taxa mensal fixa",
    freeTier: "As primeiras 30 reservas por estúdio são GRÁTIS",
    footnote:
      "A cobrança é baseada na quantidade de reservas bem-sucedidas do estúdio em cada mês. Projetos com várias sessões contam como uma reserva na confirmação.",
  },
  faq: {
    title: "Perguntas frequentes",
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
