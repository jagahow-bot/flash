import type { LandingDictionary } from "@/lib/i18n/types";

const dictionary: LandingDictionary = {
  locale: "es",
  meta: {
    title: "FLASH — Reservas y gestión de proyectos para estudios de tatuaje",
    description:
      "Sistema de reservas para estudios de tatuaje: menos citas perdidas, menos mensajes repetidos. Gestiona solicitudes, presupuestos, agenda, depósitos y citas de varias sesiones.",
    keywords: [
      "reserva tatuaje",
      "gestión estudio tatuaje",
      "software tatuaje",
      "FLASH",
      "depósito tatuaje",
      "tatuaje varias sesiones",
      "gestión proyectos tatuaje",
      "clientes tatuaje",
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
    heading: "Reservas y gestión de proyectos para estudios de tatuaje",
    subtitle:
      "Menos citas perdidas, menos mensajes repetidos,\npara que te centres en tatuar",
    description:
      "Sin empezar de cero en los mensajes —\ntú y tus clientes siempre saben cuál es el siguiente paso.",
    ctaLogin: "Iniciar sesión",
    ctaRegisterStudio: "Registrar estudio",
  },
  about: {
    title: "¿Qué es FLASH?",
    paragraphs: [
      "Un sistema de reservas para estudios de tatuaje.\nDueños y artistas gestionan los casos en el panel; los clientes envían solicitudes y consultan el avance por su cuenta. Flujos separados, datos sincronizados.",
      "¿Te suena? El cliente explica la mitad de la idea, el depósito no cuadra con la cuenta, las sesiones múltiples se mezclan y los mensajes preguntan «¿cómo va?» una y otra vez.\nFLASH lo concentra en un solo sitio: desde la solicitud hasta el presupuesto, la agenda, el depósito y las citas de varias sesiones, con pasos claros y registro.",
      "Los clientes abren tu enlace para empezar un caso; tú abres el panel cuando toque trabajar en él.",
    ],
  },
  features: {
    title: "Lo que ahorra tiempo al estudio",
    subtitle:
      "Los pasos donde se pierden citas —\nsin depender solo de la memoria",
    items: [
      {
        title: "Entender lo que el cliente quiere",
        schemaName: "Resumen de solicitudes con IA",
        description:
          "Solicitudes vagas, puntos claros al abrirlas —\nsabes a qué te enfrentas antes de presupuestar.",
      },
      {
        title: "Presupuestos sin idas y vueltas eternas",
        schemaName: "Presupuesto y agenda",
        description:
          "Casos nuevos en un solo sitio, envías horarios cuando quieras —\nel cliente elige; tú te centras en el arte.",
      },
      {
        title: "Depósitos que cuadran",
        schemaName: "Seguimiento de depósitos",
        description:
          "Quién pagó, cuánto — todo queda registrado.\nSin revisar el historial de chat para conciliar.",
      },
      {
        title: "Personalizado vs diseño flash",
        schemaName: "Reserva personalizada y flash",
        description:
          "Ya sea una consulta personalizada o elegir un diseño flash,\ntú y tu cliente podéis prepararos fácilmente para la próxima sesión de tatuaje.",
      },
    ],
  },
  howItWorks: {
    title: "Cómo funciona",
    subtitle: "Clientes y estudio, cada uno con su flujo —\nel avance se mantiene sincronizado",
    clientTitle: "Para clientes",
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
    studioTitle: "Para el estudio",
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
    title: "Precios simples según uso",
    subtitle:
      "Sin cuota mensual fija: solo pagas cuando las reservas se confirman con FLASH.",
    pricePerBooking: "USD $3 por reserva exitosa cada mes",
    noMonthlyFee: "Sin cuota mensual fija",
    freeTier: "Las primeras 30 reservas por estudio son GRATIS",
    footnote:
      "La facturación se basa en las reservas exitosas del estudio cada mes calendario. Los proyectos de varias sesiones cuentan como una reserva al confirmarse.",
  },
  faq: {
    title: "Preguntas frecuentes",
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
    },
  },
};

export default dictionary;
