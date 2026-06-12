import type { LandingDictionary } from "@/lib/i18n/types";

const dictionary: LandingDictionary = {
  locale: "fr",
  meta: {
    title: "FLASH — Réservation et gestion de projets pour studios de tatouage",
    description:
      "Système de réservation pour studios de tatouage : moins de rendez-vous manqués, moins de messages répétés. Demandes, devis, planning, acomptes et séances multiples en un seul endroit.",
    keywords: [
      "réservation tatouage",
      "gestion studio tatouage",
      "logiciel tatouage",
      "FLASH",
      "acompte tatouage",
      "tatouage plusieurs séances",
      "gestion projets tatouage",
      "clients tatouage",
    ],
  },
  header: {
    home: "Accueil",
    login: "Connexion",
    myProjects: "Mes réservations",
    studioRegister: "Inscrire un studio",
    studioDashboard: "Tableau de bord studio",
    language: "Langue",
    switchToEn: "English",
    switchToZh: "繁體中文",
  },
  hero: {
    eyebrow: "Pour les studios de tatouage",
    brand: "FLASH",
    heading: "Réservation et gestion de projets pour studios de tatouage",
    subtitle:
      "Moins de rendez-vous manqués, moins de messages répétés,\npour vous concentrer sur le tatouage",
    description:
      "Fini de repartir de zéro en message privé —\nvous et vos clients savez toujours quelle est la prochaine étape.",
    ctaLogin: "Connexion",
    ctaRegisterStudio: "Inscrire un studio",
  },
  about: {
    title: "Qu'est-ce que FLASH ?",
    paragraphs: [
      "Un système de réservation pour studios de tatouage.\nGérants et artistes gèrent les dossiers dans le back-office ; les clients envoient leurs demandes et consultent l'avancement de leur côté. Parcours séparés, données synchronisées.",
      "Ça vous parle ? Le client n'explique que la moitié, l'acompte ne colle pas avec la compta, les séances multiples se mélangent et les messages demandent « des nouvelles ? » en boucle.\nFLASH regroupe tout au même endroit : de la demande au devis, au planning, à l'acompte et aux rendez-vous en plusieurs séances — des étapes claires, des traces claires.",
      "Les clients ouvrent votre lien pour démarrer un dossier ; vous ouvrez le back-office quand vous voulez y travailler.",
    ],
  },
  features: {
    title: "Ce qui fait gagner du temps au studio",
    subtitle:
      "Les étapes où les rendez-vous se perdent —\nsans compter uniquement sur la mémoire",
    items: [
      {
        title: "Comprendre ce que veut le client",
        schemaName: "Résumé des demandes par IA",
        description:
          "Demandes floues, points clairs à l'ouverture —\nvous savez à quoi vous engagez avant de deviser.",
      },
      {
        title: "Devis sans allers-retours sans fin",
        schemaName: "Devis et planning",
        description:
          "Nouveaux dossiers au même endroit, envoyez des créneaux quand vous voulez —\nle client choisit ; vous vous concentrez sur l'art.",
      },
      {
        title: "Des acomptes qui tombent juste",
        schemaName: "Suivi des acomptes",
        description:
          "Qui a payé, combien — tout est enregistré.\nPas besoin de remonter l'historique de chat pour rapprocher.",
      },
      {
        title: "Sur mesure vs tatouage flash",
        schemaName: "Réservation sur mesure et flash",
        description:
          "Que ce soit une consultation sur mesure ou le choix d'un tatouage flash,\nvous et votre client préparez facilement la prochaine séance.",
      },
    ],
  },
  howItWorks: {
    title: "Comment ça marche",
    subtitle: "Clients et studio, chacun son parcours —\nl'avancement reste synchronisé",
    clientTitle: "Côté client",
    clientSteps: [
      {
        title: "Ouvrir le lien de réservation",
        description: "Vous avez déjà une idée pour le tatouage que vous voulez ?",
      },
      {
        title: "Partager votre idée",
        description: "Motif, emplacement, budget — dites-le avec vos mots, les photos aussi",
      },
      {
        title: "Attendre le devis, choisir un créneau",
        description: "Quand le prix arrive, choisissez un créneau et payez l'acompte comme indiqué",
      },
      {
        title: "Toujours savoir où ça en est",
        description: "Fini les « des nouvelles ? » — ouvrez et voyez",
      },
    ],
    studioTitle: "Côté studio",
    studioSteps: [
      {
        title: "Mettre le studio en route",
        description: "Inscrivez-vous, remplissez l'essentiel, puis partagez votre lien de réservation",
      },
      {
        title: "Voir les nouveaux dossiers, décider si ça colle",
        description: "Les demandes en un coup d'œil — validez, puis deviser",
      },
      {
        title: "Fixer des créneaux, encaisser l'acompte",
        description: "Vous proposez des jours libres ; ils choisissent, paient, réservation validée",
      },
      {
        title: "Grandes pièces sur plusieurs visites",
        description: "Chaque séance, quand elle a lieu — tout est clair",
      },
    ],
  },
  pricing: {
    title: "Tarification simple à l'usage",
    subtitle:
      "Pas d'abonnement mensuel fixe — vous payez uniquement quand les réservations aboutissent via FLASH.",
    pricePerBooking: "USD 3 $ par réservation réussie chaque mois",
    noMonthlyFee: "Pas de frais mensuels fixes",
    freeTier: "Les 30 premières réservations par studio sont GRATUITES",
    footnote:
      "La facturation repose sur le nombre de réservations réussies du studio chaque mois civil. Les projets en plusieurs séances comptent pour une réservation à la confirmation.",
  },
  faq: {
    title: "Questions fréquentes",
    subtitle: "Ce que les studios demandent souvent, en langage simple",
    items: [
      {
        question: "Pour qui est FLASH ?",
        answer:
          "Artiste ou gérant de studio — moins d'étapes manquées, un flux plus clair.\nClient — réserver et suivre son propre avancement.",
      },
      {
        question: "Comment gérer les grandes pièces en plusieurs séances ?",
        answer:
          "Un dossier peut contenir plusieurs séances, chacune enregistrée.\nVous et votre client savez toujours quelle séance est la prochaine et quand.",
      },
      {
        question: "Comment le système organise-t-il les demandes ?",
        answer:
          "Quand le client envoie, c'est résumé en points clés.\nComplexité, risques de cover-up — assez pour décider si vous acceptez.",
      },
      {
        question: "Comment les clients réservent-ils et paient-ils l'acompte ?",
        answer:
          "Les clients démarrent via votre lien ; après le devis ils choisissent un créneau et paient l'acompte.\nVous confirmez la réception — réservation validée.",
      },
      {
        question: "Que peut-on faire dans le back-office ?",
        answer:
          "D'abord les dossiers en attente et les acomptes non rapprochés, puis les prochains rendez-vous.\nOuvrez et voyez quoi traiter aujourd'hui.",
      },
      {
        question: "En quoi est-ce différent d'un logiciel de réservation classique ?",
        answer:
          "La plupart ne gèrent qu'un créneau à la fois.\nLes studios de tatouage jonglent aussi avec demandes, acomptes et plusieurs visites — FLASH est fait pour ça.",
      },
      {
        question: "Peut-on accepter des cover-ups ?",
        answer:
          "Oui. Le client peut signaler un cover-up et les cas à risque sont mis en évidence.\nVous pouvez aussi dire à l'avance si vous les acceptez — moins de discussions inutiles.",
      },
      {
        question: "Les studios peuvent-ils proposer des tatouages flash ?",
        answer:
          "Oui. Téléversez des tatouages flash dans les paramètres du tableau de bord — prix uniforme ou prix par design, et les tailles que le client peut choisir.\nSur la page de réservation, le client peut parcourir votre catalogue flash ou lancer une demande de tatouage sur mesure.",
      },
      {
        question: "Faut-il installer une application ?",
        answer:
          "Non. Clients et studio utilisent un lien dans le navigateur — mobile ou ordinateur, peu importe.",
      },
      {
        question: "Et si un acompte ne correspond pas à vos registres ?",
        answer:
          "Qui a payé et combien est enregistré. Le back-office signale les acomptes non rapprochés — sans remonter le chat.",
      },
      {
        question: "Les clients se perdent-ils avec les pièces en plusieurs séances ?",
        answer:
          "Chaque séance est indiquée dans un seul dossier. Le client ouvre votre lien et voit quelle séance c'est et quand est la suivante.",
      },
    ],
  },
  cta: {
    title: "Moins de rendez-vous manqués et de messages répétés ?",
    description:
      "Envie de réserver ? Ouvrez le lien.\nEnvie de mieux gérer vos dossiers ? Inscrivez-vous maintenant.",
    loginButton: "Connexion",
    studioButton: "Inscrire un studio",
  },
  footer: {
    tagline: "Réservation et gestion de projets pour studios de tatouage",
    product: "Produit",
    account: "Compte",
    legal: "Mentions légales",
    login: "Connexion",
    myProjects: "Mes réservations",
    studioRegister: "Inscrire un studio",
    privacyPolicy: "Politique de confidentialité",
    termsOfService: "Conditions d'utilisation",
    blog: "Guides studio",
    rights: "Tous droits réservés.",
    contactSupportPrefix: "Des questions ? Écrivez-nous à ",
  },
  legal: {
    privacy: {
      metaTitle: "Politique de confidentialité",
      metaDescription:
        "Comment FLASH collecte, utilise et protège vos données personnelles sur ink-flash.com.",
    },
    terms: {
      metaTitle: "Conditions d'utilisation",
      metaDescription:
        "Conditions générales d'utilisation de la plateforme de gestion de studio de tatouage FLASH.",
    },
  },
  blog: {
    metaTitle: "Guides pour studios de tatouage | FLASH",
    metaDescription:
      "Protection des droits d'auteur, garde-fous juridiques et conseils opérationnels pour tatoueurs.",
    title: "Guides pour studios de tatouage",
    description:
      "Articles pratiques sur la protection des créations, la défense juridique et la gestion de salon.",
    backToBlog: "Retour aux articles",
    readMore: "Lire l'article",
    categories: {
      ipProtection: "Protection de la PI",
      legalSafeguards: "Garde-fous juridiques",
      globalMarketing: "Marketing international",
    },
  },
};

export default dictionary;
