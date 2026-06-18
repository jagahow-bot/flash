import type { LandingDictionary } from "@/lib/i18n/types";

const dictionary: LandingDictionary = {
  locale: "fr",
  meta: {
    title:
      "FLASH — Système Intelligent de Réservation et de Gestion pour Studios de Tatouage",
    description:
      "Fini le chaos des messages privés ! FLASH propose des liens de réservation personnalisés, des résumés de demandes par IA, un filigrane automatique et des panneaux de discussion dédiés. Sans abonnement mensuel fixe : concentrez-vous sur votre art et gérez facilement vos projets personnalisés et flashs.",
    ogDescription:
      "Fini le chaos des messages privés ! FLASH propose des liens de réservation personnalisés, des résumés par IA, un filigrane automatique et des panneaux dédiés.",
    keywords: [
      "réservation tatouage",
      "gestion studio tatouage",
      "logiciel tatouage",
      "FLASH",
      "gestion cas tatouage",
      "résumé intelligent IA",
      "système gestion réservations tatouage",
      "réservation multilingue",
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
    heading: "Réservation et Gestion de Cas pour Studios de Tatouage",
    subtitle: "Chaque ligne, point et ombre mérite 100 % de votre attention.",
    description: "",
    ctaLogin: "Connexion",
    ctaRegisterStudio: "Inscrire un studio",
  },
  about: {
    title: "Pourquoi les tatoueurs choisissent-ils le système de gestion de réservations FLASH ?",
    paragraphs: [
      "Chaque ligne, point et ombre mérite 100 % de votre attention. Mais en réalité, répondre aux messages privés et gérer les rendez-vous s'accaparent la majeure partie de votre énergie.",
      "FLASH est né pour libérer vos mains. Nous automatisons les tâches fastidieuses telles que la collecte des besoins, la planification des rendez-vous et la protection des croquis.",
      "Plus besoin de relancer le client pour ses dimensions, ni de jongler entre plusieurs applications pour retrouver un historique. Réduisez les communications inutiles à zéro et consacrez votre temps si précieux à votre prochain chef-d'œuvre.",
    ],
  },
  productShowcase: {
    title: "Voir FLASH en action",
    subtitle:
      "Tableau de bord studio et page projet client — deux perspectives, toujours synchronisées",
    studioTitle: "Tableau de bord studio",
    studioDescription:
      "Boîte de réception, calendrier et statut des projets — gérez votre studio depuis un seul écran",
    studioAlt:
      "Tableau de bord studio FLASH affichant les tâches en attente et les prochains rendez-vous",
    clientTitle: "Page projet client",
    clientDescription:
      "Vérification du devis, choix du créneau et avancement du dessin — le client sait toujours quelle est la prochaine étape",
    clientProgressAlt:
      "Page projet client FLASH à l'étape du devis",
    clientArtworkAlt:
      "Page projet client FLASH avec dessin et chronologie d'avancement",
  },
  features: {
    title: "Gestion automatisée du studio, économisant 80 % du temps de communication",
    subtitle: "",
    items: [
      {
        title: "Résumé intelligent par IA : Capturez avec précision les attentes de tatouage du client",
        schemaName: "Résumé intelligent par IA",
        description:
          "Une fois la demande envoyée, l'IA résume les points clés — complexité et risques en un coup d'œil avant de deviser.",
      },
      {
        title: "Support multilingue : Acceptez les réservations de voyageurs internationaux en toute fluidité",
        schemaName: "Support multilingue",
        description:
          "Interface en dix langues pour que les voyageurs internationaux réservent facilement — zéro barrière de communication.",
      },
      {
        title: "Panneau bidirectionnel indépendant : L'historique des révisions du dessin ne se perd jamais",
        schemaName: "Panneau bidirectionnel indépendant",
        description:
          "Vues séparées pour clients et studio conservent chaque révision du dessin — fini les messages perdus en DM.",
      },
      {
        title: "Filigrane intelligent automatique : Protection intégrale de vos croquis originaux",
        schemaName: "Filigrane intelligent automatique",
        description:
          "Les envois sont automatiquement filigranés pour protéger vos croquis originaux des captures d'écran et fuites.",
      },
    ],
  },
  howItWorks: {
    title: "De la première consultation au consentement : le parcours de réservation tatouage le plus fluide",
    subtitle: "Clients et studio, chacun son parcours —\nl'avancement reste synchronisé",
    clientTitle: "Côté client : guidage clair, saisie facile",
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
    studioTitle: "Côté studio : en un coup d'œil, archivage numérique",
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
    title: "Tarification flexible pour tatoueurs : pas d'abonnement mensuel, paiement par réservation",
    subtitle:
      "Pas d'abonnement mensuel fixe — vous payez uniquement quand les réservations aboutissent via FLASH.",
    pricePerBooking: "USD 3 $ par réservation réussie chaque mois",
    noMonthlyFee: "Pas de frais mensuels fixes",
    freeTier: "Les 30 premières réservations par studio sont GRATUITES",
    footnote:
      "La facturation repose sur le nombre de réservations réussies du studio chaque mois civil. Les projets en plusieurs séances comptent pour une réservation à la confirmation.",
  },
  faq: {
    title: "Questions fréquentes sur le logiciel de gestion de tatouage FLASH",
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
