import type { LandingDictionary } from "@/lib/i18n/types";

const dictionary: LandingDictionary = {
  locale: "es",
  meta: {
    title:
      "FLASH — Sistema Inteligente de Reservas y Gestión de Casos para Estudios de Tatuajes",
    description:
      "¡Olvídate de los mensajes directos caóticos! FLASH ofrece enlaces de reserva personalizados, resúmenes de requisitos con IA, marcas de agua automáticas y paneles de discusión dedicados. Sin tarifas mensuales fijas: concéntrate en tu arte y gestiona fácilmente tus diseños personalizados y flash.",
    ogDescription:
      "¡Olvídate de los mensajes directos caóticos! FLASH ofrece enlaces de reserva personalizados, resúmenes con IA, marcas de agua automáticas y paneles dedicados.",
    keywords: [
      "reserva tatuaje",
      "gestión estudio tatuaje",
      "software tatuaje",
      "FLASH",
      "gestión casos tatuaje",
      "resumen inteligente IA",
      "sistema gestión reservas tatuaje",
      "reserva multiidioma",
    ],
  },
  header: {
    home: "Inicio",
    login: "Iniciar sesión",
    myProjects: "Mis reservas",
    studioRegister: "Registrar estudio",
    studioDashboard: "Panel del estudio",
    language: "Idioma",
    switchToEn: "English",
    switchToZh: "繁體中文",
  },
  hero: {
    eyebrow: "Para estudios de tatuaje",
    brand: "FLASH",
    heading: "Gestión de Casos y Reservas para Estudios de Tatuajes",
    subtitle: "Cada línea, punto y sombra merece el 100% de tu enfoque.",
    description: "",
    ctaLogin: "Iniciar sesión",
    ctaRegisterStudio: "Registrar estudio",
  },
  about: {
    title: "¿Por qué los tatuadores eligen el sistema de gestión de reservas FLASH?",
    paragraphs: [
      "Cada línea, punto y sombra merece el 100% de tu enfoque. Pero la realidad es que responder mensajes directos y gestionar reservas consume la mayor parte de tu energía.",
      "FLASH nació para liberar tus manos. Automatizamos tareas tediosas como recopilar requisitos, agendar citas y proteger bocetos.",
      "Se acabó el quedarse atascado esperando las medidas del cliente y el tener que buscar registros en múltiples aplicaciones sociales. Reduce la comunicación innecesaria a cero y reserva tu tiempo más valioso para la próxima obra maestra.",
    ],
  },
  productShowcase: {
    title: "Mira FLASH en acción",
    subtitle:
      "Panel del estudio y vista del proyecto del cliente — dos perspectivas, siempre sincronizadas",
    studioTitle: "Panel del estudio",
    studioDescription:
      "Bandeja de tareas, calendario y estado de proyectos — gestiona tu estudio desde una sola pantalla",
    studioAlt:
      "Panel del estudio FLASH mostrando tareas pendientes y próximas citas",
    clientTitle: "Vista del proyecto del cliente",
    clientDescription:
      "Revisión del presupuesto, selección de horario y progreso del diseño — el cliente siempre sabe qué sigue",
    clientProgressAlt:
      "Página del proyecto del cliente FLASH en la etapa de presupuesto",
    clientArtworkAlt:
      "Página del proyecto del cliente FLASH con diseño y línea de tiempo de progreso",
  },
  features: {
    title: "Gestión automatizada del estudio, ahorrando un 80% del tiempo de comunicación",
    subtitle: "",
    items: [
      {
        title: "Resumen inteligente de IA: Captura con precisión las necesidades de tatuaje del cliente",
        schemaName: "Resumen inteligente de IA",
        description:
          "Cuando el cliente envía su solicitud, la IA resume los puntos clave: complejidad y riesgos de un vistazo antes de presupuestar.",
      },
      {
        title: "Soporte multiidioma: Acepta reservas de viajeros internacionales sin complicaciones",
        schemaName: "Soporte multiidioma",
        description:
          "Interfaz en diez idiomas para que los viajeros internacionales reserven con facilidad — cero barreras de comunicación.",
      },
      {
        title: "Panel bidireccional independiente: El historial de revisiones de bocetos nunca se pierde",
        schemaName: "Panel bidireccional independiente",
        description:
          "Vistas separadas para clientes y estudio conservan cada revisión del boceto — sin mensajes enterrados en el DM.",
      },
      {
        title: "Marca de agua inteligente automática: Protección integral para bocetos originales",
        schemaName: "Marca de agua inteligente automática",
        description:
          "Las subidas se marcan automáticamente con marca de agua para proteger los bocetos originales de capturas y filtraciones.",
      },
    ],
  },
  howItWorks: {
    title: "De la primera consulta al consentimiento: el flujo de reserva de tatuajes más fluido",
    subtitle: "Clientes y estudio, cada uno con su flujo —\nel avance se mantiene sincronizado",
    clientTitle: "Lado cliente: guía clara, formulario sencillo",
    clientSteps: [
      {
        title: "Abrir el enlace de reserva",
        description: "¿Ya tienes una idea para el tatuaje que quieres?",
      },
      {
        title: "Cuenta tu idea",
        description: "Diseño, zona, presupuesto — dilo con tus palabras, las fotos también valen",
      },
      {
        title: "Espera el presupuesto y elige hora",
        description: "Cuando llegue el precio, elige un horario y paga el depósito según las indicaciones",
      },
      {
        title: "Siempre sabes cómo va",
        description: "Sin preguntar «¿cómo va?» una y otra vez — abres y lo ves",
      },
    ],
    studioTitle: "Lado estudio: de un vistazo, archivo digital",
    studioSteps: [
      {
        title: "Pon el estudio en marcha",
        description: "Regístrate, rellena lo básico y comparte tu enlace de reserva",
      },
      {
        title: "Revisa casos nuevos y decide si encajan",
        description: "Las solicitudes de un vistazo — confirmas y das presupuesto",
      },
      {
        title: "Fija horarios y cobra el depósito",
        description: "Ofreces días libres; eligen, pagan y la reserva queda hecha",
      },
      {
        title: "Piezas grandes en varias visitas",
        description: "Cada sesión, cuándo es — todo claro",
      },
    ],
  },
  pricing: {
    title: "Precios flexibles para tatuadores: sin cuota mensual, pago por reserva",
    subtitle:
      "Sin cuota mensual fija: solo pagas cuando las reservas se confirman con FLASH.",
    pricePerBooking: "USD $3 por reserva exitosa cada mes",
    noMonthlyFee: "Sin cuota mensual fija",
    freeTier: "Las primeras 30 reservas por estudio son GRATIS",
    footnote:
      "La facturación se basa en las reservas exitosas del estudio cada mes calendario. Los proyectos de varias sesiones cuentan como una reserva al confirmarse.",
  },
  faq: {
    title: "Preguntas frecuentes sobre el software de gestión de tatuajes FLASH",
    subtitle: "Lo que suelen preguntar los estudios, en lenguaje claro",
    items: [
      {
        question: "¿Para quién es FLASH?",
        answer:
          "Si eres artista o dueño de estudio — menos pasos perdidos, flujo más claro.\nSi eres cliente — reservar y consultar tu propio avance.",
      },
      {
        question: "¿Cómo se gestionan piezas grandes de varias sesiones?",
        answer:
          "Un caso puede tener varias sesiones, cada una registrada.\nTú y tu cliente siempre saben qué sesión es y cuándo es la siguiente.",
      },
      {
        question: "¿Cómo organiza el sistema las solicitudes?",
        answer:
          "Cuando el cliente envía, se resume en puntos clave.\nComplejidad, riesgos de cover-up — suficiente para decidir si aceptas el caso.",
      },
      {
        question: "¿Cómo reservan los clientes y pagan el depósito?",
        answer:
          "Los clientes empiezan desde tu enlace; tras el presupuesto eligen hora y pagan el depósito.\nConfirmas el pago y la reserva queda hecha.",
      },
      {
        question: "¿Qué se puede hacer en el panel?",
        answer:
          "Primero casos pendientes y depósitos sin conciliar, luego las próximas citas.\nAbres y sabes qué toca hoy.",
      },
      {
        question: "¿En qué se diferencia de un software de reservas genérico?",
        answer:
          "La mayoría solo gestiona reservar un horario.\nLos estudios de tatuaje también manejan solicitudes, depósitos y varias visitas — FLASH está hecho para eso.",
      },
      {
        question: "¿Se pueden aceptar cover-ups?",
        answer:
          "Sí. El cliente puede marcar cover-up y los casos con riesgo se señalan.\nTambién puedes decir de antemano si los aceptas — evitas charlas inútiles.",
      },
      {
        question: "¿Pueden los estudios ofrecer diseños flash?",
        answer:
          "Sí. Sube diseños flash en la configuración del panel — precio uniforme o precio por diseño, y los tamaños que el cliente puede elegir.\nEn la página de reserva, el cliente puede explorar tu catálogo flash o pedir un tatuaje personalizado.",
      },
      {
        question: "¿Hay que instalar una app?",
        answer:
          "No. Clientes y estudio usan un enlace en el navegador — móvil o ordenador, da igual.",
      },
      {
        question: "¿Y si un depósito no cuadra con tus registros?",
        answer:
          "Quién pagó y cuánto queda registrado. El panel señala depósitos sin conciliar — sin revisar el chat.",
      },
      {
        question: "¿Los clientes se pierden con piezas de varias sesiones?",
        answer:
          "Cada visita está marcada en un solo caso. El cliente abre tu enlace y ve qué sesión es y cuándo es la siguiente.",
      },
    ],
  },
  cta: {
    title: "¿Quieres menos citas perdidas y mensajes repetidos?",
    description:
      "¿Quieres reservar? Abre el enlace.\n¿Quieres gestionar mejor tus casos? Regístrate ahora.",
    loginButton: "Iniciar sesión",
    studioButton: "Registrar estudio",
  },
  footer: {
    tagline: "Reservas y gestión de proyectos para estudios de tatuaje",
    product: "Producto",
    account: "Cuenta",
    legal: "Legal",
    login: "Iniciar sesión",
    myProjects: "Mis reservas",
    studioRegister: "Registrar estudio",
    privacyPolicy: "Política de privacidad",
    termsOfService: "Términos de servicio",
    blog: "Guías para estudios",
    rights: "Todos los derechos reservados.",
    contactSupportPrefix: "¿Preguntas? Escríbenos a ",
  },
  legal: {
    privacy: {
      metaTitle: "Política de privacidad",
      metaDescription:
        "Cómo FLASH recopila, utiliza y protege tu información personal en ink-flash.com.",
    },
    terms: {
      metaTitle: "Términos de servicio",
      metaDescription:
        "Términos y condiciones para usar la plataforma de gestión de estudios de tatuaje FLASH.",
    },
  },
  blog: {
    metaTitle: "Guías para estudios de tatuaje | FLASH",
    metaDescription:
      "Protección de derechos de autor, salvaguardas legales y consejos operativos para tatuadores.",
    title: "Guías para estudios de tatuaje",
    description:
      "Artículos prácticos sobre protección de diseños, defensa legal y gestión de tu estudio.",
    backToBlog: "Volver a artículos",
    readMore: "Leer artículo",
    categories: {
      ipProtection: "Protección de IP",
      legalSafeguards: "Salvaguardas legales",
      globalMarketing: "Marketing global",
    },
  },
};

export default dictionary;
