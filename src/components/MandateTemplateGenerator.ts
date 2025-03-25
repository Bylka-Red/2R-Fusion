import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
import type { Mandate } from '../types';
import { generateCivilStatus } from '../utils/civilStatus';
import { formatLotDescription, formatTantiemes, numberToWords } from '../utils/numberToWords';

// Fonction pour formater la surface en format cadastral (XXha XXa XXca)
const formatSurface = (surface: string): string => {
  const num = parseInt(surface) || 0;
  const ha = Math.floor(num / 10000);
  const a = Math.floor((num % 10000) / 100);
  const ca = num % 100;
  return `${ha.toString().padStart(2, '0')}ha ${a.toString().padStart(2, '0')}a ${ca.toString().padStart(2, '0')}ca`;
};

// Nouvelle fonction pour formater les sections cadastrales
const formatCadastralSections = (sections: any[]): string => {
  if (!sections || sections.length === 0) return '';

  let result = '';
  sections.forEach((section) => {
    result += `•\tSection ${section.section || ''} / Numéro ${section.number || ''} / Lieudit : ${section.lieuDit || ''} / Surface : ${formatSurface(section.surface || '0')}\n`;
  });

  // Retirez le dernier saut de ligne
  return result.trim();
};

const getMandateDurationText = (type: string): string => {
  switch (type) {
    case 'simple':
      return "Le présent MANDAT NON EXCLUSIF, qui prendra effet le jour de sa signature, est consenti pour une durée de 3 mois. A l'issue de cette période initiale, il sera prorogé pour une durée de 12 mois, au terme de laquelle il prendra automatiquement fin.\n\nToutefois, passé un délai de trois mois à compter de sa signature, le mandat pourra être dénoncé à tout moment par chacune des parties, à charge pour celle qui entend y mettre fin d'en aviser l'autre partie quinze jours au moins à l'avance, par lettre recommandée avec demande d'avis de réception, conformément aux dispositions du deuxième alinéa de l'article 78 du décret du 20 juillet 1972.\n\nPar dérogation aux dispositions de l'article 2003 du Code civil, le décès du MANDANT n'entrainera pas la résiliation du mandat, lequel se poursuivra avec ses ayants droit.";

    case 'exclusive':
      return "Le présent MANDAT EXCLUSIF, qui prendra effet le jour de sa signature, est consenti pour une durée de 3 mois. A l'issue de cette période initiale, il sera prorogé pour une durée de 12 mois, au terme de laquelle il prendra automatiquement fin.\n\nToutefois, passé un délai de trois mois à compter de sa signature, il pourra être dénoncé à tout moment par chacune des parties avec un préavis de quinze jours, par lettre recommandée avec demande d'avis de réception.\n\nIl est rappelé que passé un délai de trois mois à compter de sa signature, le mandat qui est assorti d'une clause d'exclusivité ou d'une clause pénale, ou qui comporte une clause aux termes de laquelle des honoraires seront dus par le mandant même si l'opération est conclue sans les soins de l'intermédiaire, peut être dénoncé à tout moment par chacune des parties, à charge pour celle qui entend y mettre fin d'en aviser l'autre partie quinze jours au moins à l'avance par lettre recommandée avec demande d'avis de réception, conformément aux dispositions du deuxième alinéa de l'article 78 du décret du 20 juillet 1972.\n\nLe présent mandat ne peut être dénoncé que dans sa totalité et en aucun cas de façon partielle.\n\nPar dérogation aux dispositions de l'article 2003 du Code civil, le décès du MANDANT n'entrainera pas la résiliation du mandat, lequel se poursuivra avec ses ayants droit.";

    case 'semi-exclusive':
      return "Le présent MANDAT SEMI-EXCLUSIF, qui prendra effet le jour de sa signature, est consenti pour une durée de 3 mois. A l'issue de cette période initiale, il sera prorogé pour une durée de 12 mois, au terme de laquelle il prendra automatiquement fin.\n\nToutefois, passé un délai de trois mois à compter de sa signature, il pourra être dénoncé à tout moment par chacune des parties avec un préavis de quinze jours, par lettre recommandée avec demande d'avis de réception.\n\nPassé un délai de trois mois à compter de sa signature, le mandat pourra toutefois être dénoncé à tout moment par chacune des parties, à charge pour celle qui entend y mettre fin d'en aviser l'autre partie quinze jours au moins à l'avance par lettre recommandée avec demande d'avis de réception, conformément aux dispositions du deuxième alinéa de l'article 78 du décret du 20 juillet 1972.\n\nLe présent mandat ne peut être dénoncé que dans sa totalité et en aucun cas de façon partielle.\n\nPar dérogation aux dispositions de l'article 2003 du Code civil, le décès du MANDANT n'entrainera pas la résiliation du mandat, lequel se poursuivra avec ses ayants droit.\n\nLe présent mandat ayant un caractère Semi-exclusif, le MANDANT pourra vendre par lui-même les biens objet des présentes aux conditions du présent mandat, mais il ne pourra pas mandater un intermédiaire autre que le MANDATAIRE pour le faire.\n\nSi toutefois le MANDANT venait à conclure la vente avec un tiers par le biais d'un autre intermédiaire, au mépris du présent mandat, le MANDATAIRE AURA DROIT A UNE INDEMNITE FORFAITAIRE A LA CHARGE DU MANDANT D'UN MONTANT EGAL A CELUI DE LA REMUNERATION TTC DU MANDATAIRE PREVUE AU PRESENT MANDAT.\n\nS'il vend les biens par lui-même, sans l'intermédiaire du MANDATAIRE, le MANDANT ne sera redevable d'aucune commission ou indemnité à l'égard du MANDATAIRE.\n\nLe MANDANT s'oblige cependant à informer immédiatement le MANDATAIRE, s'il accepte une offre d'achat ou s'il signe tout contrat préparatoire à la vente ou s'il vend les biens sans l'intermédiaire du MANDATAIRE. L'information sera obligatoirement effectuée au moyen d'une notification par lettre recommandée avec demande d'avis de réception et précisera les nom et adresse de l'acquéreur et les coordonnées du notaire chargé d'établir l'acte authentique de vente. Le présent mandat prendra fin par la notification régulière de cette vente au MANDATAIRE.\n\nEN CAS DE MANQUEMENT, LE MANDANT S'OBLIGE EXPRESSÉMENT ET DE MANIÈRE IRRÉVOCABLE À VERSER AU MANDATAIRE UNE SOMME ÉGALE AU MONTANT TOTAL, TVA INCLUSE, DE LA RÉMUNÉRATION PRÉVUE AUX PRÉSENTES ET CE, À TITRE D'INDEMNITÉ FORFAITAIRE ET DÉFINITIVE.\n\nLe MANDANT déclare ne pas avoir déjà consenti de mandat de vente non expiré ou dénoncé. Il s'interdit de le faire ultérieurement sans avoir préalablement dénoncé le présent mandat.\n\nLe MANDANT s'interdit pendant la durée du présent mandat et durant les douze (12) mois suivant sa révocation ou son expiration, de traiter, directement ou indirectement, avec une personne à qui ce bien aura été présenté par le MANDATAIRE, ou un MANDATAIRE qu'il se sera substitué, et dont l'identité aura été communiquée au MANDANT. Cette interdiction vise tant la personne de l'acheteur que son conjoint, concubin ou partenaire de Pacs avec lequel il se porterait acquéreur, ou encore toute société dans laquelle ledit acheteur aurait la qualité d'associé.\n\nLe MANDANT s'oblige, s'il vend les biens durant ce même délai de douze (12) mois suivant la révocation ou l'expiration du mandat à communiquer immédiatement au MANDATAIRE la date et le prix de la vente, les nom et adresse de l'acquéreur et, le cas échéant, de l'intermédiaire qui aura permis sa conclusion, ainsi que les coordonnées du notaire rédacteur de l'acte de vente.\n\nEN CAS DE MANQUEMENT À L'UNE OU L'AUTRE DE CES INTERDICTIONS OU OBLIGATIONS, LE MANDANT S'OBLIGE EXPRESSÉMENT ET DE MANIÈRE IRRÉVOCABLE À VERSER AU MANDATAIRE UNE SOMME ÉGALE AU MONTANT TOTAL, TVA INCLUSE, DE LA RÉMUNÉRATION PRÉVUE AUX PRÉSENTES ET CE, À TITRE D'INDEMNITÉ FORFAITAIRE ET DÉFINITIVE.";

    default:
      return '';
  }
};

// Ajouter cette fonction dans le fichier, avant la fonction generateMandateFromTemplate
const getDPEText = (dpeStatus: string): string => {
  switch (dpeStatus) {
    case 'completed':
      return "Le MANDANT déclare qu'un Diagnostic de performance énergétique conforme à la réglementation applicable à compter du 1er juillet 2021 a été établi.";
    case 'in-progress':
      return "Le MANDANT déclare ne pas avoir de Diagnostic de performance énergétique pour le bien, et qu'un Diagnostic de performance énergétique conforme à la réglementation applicable sera établi.";
    case 'not-required':
      return "Le MANDANT déclare que le bien n'est pas soumis à l'obligation de réaliser un Diagnostic de Performance Énergétique conformément aux exceptions prévues par la réglementation en vigueur.";
    default:
      return "Le MANDANT déclare qu'un Diagnostic de performance énergétique conforme à la réglementation applicable à compter du 1er juillet 2021 a été établi.";
  }
};

export async function generateMandateFromTemplate(mandate: Mandate): Promise<boolean> {
  try {
    // Déterminer quel modèle utiliser en fonction du type de propriété
    const isHouseInCopro = mandate.propertyType === 'house' && mandate.isInCopropriete;
    const templatePath = mandate.propertyType === 'apartment' || isHouseInCopro
      ? '/templates/modele_mandat_simple_copro.docx'
      : '/templates/modele_mandat_simple_mono.docx';

    console.log(`Utilisation du modèle : ${templatePath} pour le type de propriété : ${mandate.propertyType}, isInCopropriete : ${mandate.isInCopropriete}`);

    // Charger le modèle Word
    console.log("Tentative de chargement du modèle Word...");
    const response = await fetch(templatePath);
    if (!response.ok) {
      throw new Error(`Impossible de charger le modèle : ${response.statusText}`);
    }
    console.log("Modèle Word chargé avec succès, conversion en ArrayBuffer...");
    const templateContent = await response.arrayBuffer();
    console.log("Taille du fichier chargé :", templateContent.byteLength, "octets");
    if (templateContent.byteLength === 0) {
      throw new Error("Le fichier modèle est vide");
    }

    // Créer un objet PizZip à partir du contenu du modèle
    console.log("Création de l'objet PizZip...");
    const zip = new PizZip(templateContent);

    // Créer un objet Docxtemplater avec des options spécifiques pour gérer les erreurs de balises
    console.log("Création de l'objet Docxtemplater...");
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: { start: '{{', end: '}}' },
    });

    // Formater les données pour l'affichage
    const formatPrice = (price: number | undefined | null): string => {
      if (!price) return '0';
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
      }).format(price).replace('€', '').trim();
    };

    const formatDate = (dateString: string | undefined | null): string => {
      if (!dateString) return '';

      // Vérifiez si la date est au format DD/MM/YYYY
      const parts = dateString.split('/');
      if (parts.length === 3) {
        const day = parts[0];
        const month = parts[1];
        const year = parts[2];
        dateString = `${year}-${month}-${day}`;
      }

      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '';
      }

      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    };

    // Avant d'appeler formatDate
    console.log('Date avant formatage :', mandate.date);

    // Appel de la fonction
    const formattedDate = formatDate(mandate.date);

    // Vérifiez la date formatée
    console.log('Date après formatage :', formattedDate);

    const getConditionText = (condition: string | undefined): string => {
      if (!condition) return 'Bon état';
      const conditions = {
        'new': 'Neuf',
        'excellent': 'Excellent état',
        'good': 'Bon état',
        'needs-work': 'Travaux à prévoir',
        'to-renovate': 'À rénover'
      };
      return conditions[condition as keyof typeof conditions] || condition;
    };

    const getMarketTrendText = (trend: string | undefined): string => {
      if (!trend) return 'Stable';
      const trends = {
        'up': 'À la hausse',
        'down': 'À la baisse',
        'stable': 'Stable'
      };
      return trends[trend as keyof typeof trends] || trend;
    };

    const getBooleanText = (value: boolean | undefined): string => {
      return value ? 'Oui' : 'Non';
    };

    const getOccupationStatusText = (status: string | undefined): string => {
      switch (status) {
        case 'occupied-by-seller':
          return 'Le bien est actuellement occupé par le(s) vendeur(s)';
        case 'vacant':
          return "Le bien est actuellement libre d'occupants";
        case 'rented':
          return "Le bien fait actuellement l'objet d'un bail en cours";
        default:
          return "Le bien est actuellement occupé par le(s) vendeur(s)"; // Valeur par défaut
      }
    };

    // Extraire la ville de l'adresse complète
    const extractCity = (fullAddress: string | undefined): string => {
      if (!fullAddress) return '';
      const codePostalIndex = fullAddress.search(/\d{5}/);
      if (codePostalIndex === -1) return '';
      return fullAddress.substring(codePostalIndex + 5).trim().toUpperCase();
    };

    // Vérification des données criteria
    console.log("Données criteria complètes :", mandate.criteria);

    // Vérification de la valeur de condition
    console.log("Valeur de condition :", mandate.condition);
    const conditionText = getConditionText(mandate.condition);
    console.log("Texte traduit pour condition :", conditionText);

    // S'assurer que les critères existent
    const criteria = mandate.criteria || {};

    // Traduire les valeurs directement avant de les placer dans l'objet data
    let kitchenTypeFrench = '';
    switch (criteria.kitchenType) {
      case 'open-equipped': kitchenTypeFrench = 'ouverte équipée'; break;
      case 'closed-equipped': kitchenTypeFrench = 'fermée équipée'; break;
      case 'open-fitted': kitchenTypeFrench = 'ouverte aménagée'; break;
      case 'closed-fitted': kitchenTypeFrench = 'fermée aménagée'; break;
      case 'to-create': kitchenTypeFrench = 'à créer'; break;
      default: kitchenTypeFrench = criteria.kitchenType || '';
    }

    let heatingSystemFrench = '';
    switch (criteria.heatingSystem) {
      case 'electric': heatingSystemFrench = 'électrique'; break;
      case 'individual-gas': heatingSystemFrench = 'individuel au gaz'; break;
      case 'collective-gas': heatingSystemFrench = 'collectif au gaz'; break;
      case 'heat-pump': heatingSystemFrench = 'pompe à chaleur'; break;
      case 'fuel': heatingSystemFrench = 'fuel'; break;
      case 'collective-geothermal': heatingSystemFrench = 'géothermique collectif'; break;
      default: heatingSystemFrench = criteria.heatingSystem || '';
    }

    let exposureFrench = '';
    switch (criteria.exposure) {
      case 'north': exposureFrench = 'Nord'; break;
      case 'south': exposureFrench = 'Sud'; break;
      case 'east': exposureFrench = 'Est'; break;
      case 'west': exposureFrench = 'Ouest'; break;
      case 'north-east': exposureFrench = 'Nord-Est'; break;
      case 'north-west': exposureFrench = 'Nord-Ouest'; break;
      case 'south-east': exposureFrench = 'Sud-Est'; break;
      case 'south-west': exposureFrench = 'Sud-Ouest'; break;
      default: exposureFrench = criteria.exposure || '';
    }

    let windowsTypeFrench = '';
    switch (criteria.windowsType) {
      case 'single': windowsTypeFrench = 'Simple vitrage'; break;
      case 'double': windowsTypeFrench = 'Double vitrage'; break;
      default: windowsTypeFrench = criteria.windowsType || '';
    }

    let constructionMaterialFrench = '';
    switch (criteria.constructionMaterial) {
      case 'brick': constructionMaterialFrench = 'Briques'; break;
      case 'stone': constructionMaterialFrench = 'Pierre'; break;
      case 'concrete': constructionMaterialFrench = 'Béton'; break;
      case 'wood': constructionMaterialFrench = 'Bois'; break;
      case 'other': constructionMaterialFrench = 'Autre'; break;
      default: constructionMaterialFrench = criteria.constructionMaterial || '';
    }

    let adjacencyFrench = '';
    switch (criteria.adjacency) {
      case 'detached': adjacencyFrench = 'Indépendant'; break;
      case 'semi-detached': adjacencyFrench = 'Mitoyen d\'un côté'; break;
      case 'both-sides': adjacencyFrench = 'Mitoyen des deux côtés'; break;
      default: adjacencyFrench = criteria.adjacency || '';
    }

    // Calcul du prix des diagnostics obligatoires
    const calculateMandatoryPrice = () => {
      const propertyType = mandate.propertyType;
      const constructionYear = criteria.constructionYear;
      const hasGas = criteria.hasGas;
      const currentYear = new Date().getFullYear();
      const isOlderThan15Years = constructionYear ? currentYear - constructionYear > 15 : false;
      const isBeforeAsbestos = constructionYear ? constructionYear < 1998 : false;
      const isBeforeLead = constructionYear ? constructionYear < 1949 : false;
      const isInCoproperty = propertyType === 'apartment' || mandate.isInCopropriete;
      let requiredCount = 0;

      // DPE - toujours obligatoire
      requiredCount++;

      if (isInCoproperty) requiredCount++; // Loi Carrez
      if (isOlderThan15Years) requiredCount++; // Électricité
      if (isOlderThan15Years && hasGas) requiredCount++; // Gaz
      if (isBeforeAsbestos) requiredCount++; // Amiante
      if (isBeforeLead) requiredCount++; // Plomb

      if (requiredCount === 0) return 0;

      const prices = propertyType === 'apartment' || mandate.isInCopropriete
        ? { 1: 90, 2: 160, 3: 220, 4: 270, 5: 320, 6: 370 }
        : { 1: 120, 2: 200, 3: 270, 4: 320, 5: 370, 6: 420 };

      return prices[requiredCount as keyof typeof prices] || 0;
    };

    // Préparer les informations du commercial
    let prenomCommercial = '';
    let nomCommercial = '';
    let telephoneCommercial = '';
    let emailCommercial = '';

    if (mandate.commercial) {
      prenomCommercial = mandate.commercial;
      if (prenomCommercial === 'Redhouane') {
        nomCommercial = 'KABACHE';
        telephoneCommercial = '06 18 24 46 40';
        emailCommercial = 'contact@2r-immobilier.fr';
      } else if (prenomCommercial === 'Audrey') {
        nomCommercial = 'GABRIEL';
        telephoneCommercial = '07 68 88 16 60';
        emailCommercial = 'a.gabriel@2r-immobilier.fr';
      } else if (prenomCommercial === 'Christelle') {
        nomCommercial = 'MULLINGHAUSEN';
        telephoneCommercial = '06 38 22 60 70';
        emailCommercial = 'm.christelle@2r-immobilier.fr';
      } else {
        nomCommercial = '';
        telephoneCommercial = '';
        emailCommercial = prenomCommercial.toLowerCase() + '@2r-immobilier.fr';
      }
    }

    // Formater les points forts et points faibles pour qu'ils s'affichent sur des lignes séparées
    const pointsForts = (mandate.features || [])
      .filter(f => f.type === 'strength')
      .map(f => f.description);

    const pointsFaibles = (mandate.features || [])
      .filter(f => f.type === 'weakness')
      .map(f => f.description);

    const pointsFortsFormatted = pointsForts.join('\n');
    const pointsFaiblesFormatted = pointsFaibles.join('\n');

    // Calculer les totaux des prix au m²
    const calculateAverage = (prices: string[]) => {
      const numericPrices = prices.map(price => parseInt(price.replace(/[^0-9]/g, '')) || 0);
      const sum = numericPrices.reduce((acc, curr) => acc + curr, 0);
      return numericPrices.length ? Math.floor(sum / numericPrices.length) : 0;
    };

    const soldPrices = (mandate.features || [])
      .filter(f => f.type === 'soldPrice')
      .map(f => f.description);

    const forSalePrices = (mandate.features || [])
      .filter(f => f.type === 'forSalePrice')
      .map(f => f.description);

    const soldPricesTotal = calculateAverage(soldPrices);
    const forSalePricesTotal = calculateAverage(forSalePrices);

    // Déterminer les diagnostics obligatoires
    const propertyType = mandate.propertyType;
    const constructionYear = criteria.constructionYear;
    const hasGas = criteria.hasGas;
    const currentYear = new Date().getFullYear();
    const isOlderThan15Years = constructionYear ? currentYear - constructionYear > 15 : false;
    const isBeforeAsbestos = constructionYear ? constructionYear < 1998 : false;
    const isBeforeLead = constructionYear ? constructionYear < 1949 : false;
    const isInCoproperty = propertyType === 'apartment' || mandate.isInCopropriete;

    // Calculer les jours écoulés depuis les dates de vente
    const calculateDaysSince = (dateString: string) => {
      const dateParts = dateString.split('/');
      if (dateParts.length !== 3) return '';
      const [day, month, year] = dateParts.map(Number);
      const date = new Date(year, month - 1, day);
      const today = new Date();

      let diffYears = today.getFullYear() - date.getFullYear();
      let diffMonths = today.getMonth() - date.getMonth();
      let diffDays = today.getDate() - date.getDate();

      // Ajustement pour les années et les mois
      if (diffDays < 0) {
        diffMonths -= 1;
        const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        diffDays += lastMonth.getDate();
      }
      if (diffMonths < 0) {
        diffYears -= 1;
        diffMonths += 12;
      }

      // Construction du résultat
      let result = [];
      if (diffYears > 0) result.push(`${diffYears} an${diffYears > 1 ? 's' : ''}`);
      if (diffMonths > 0) result.push(`${diffMonths} mois`);
      if (diffDays > 0 || result.length === 0) result.push(`${diffDays} jour${diffDays > 1 ? 's' : ''}`);

      return result.join(' et ');
    };

    // Extraire les résultats des dates de vente
    const saleDates = (mandate.features || [])
      .filter(f => f.type === 'saleDate')
      .map(f => calculateDaysSince(f.description));

    // Convertir le titre en format français
    const getTitreFrancais = (title: string | undefined) => {
      console.log("Titre du propriétaire avant traduction:", title);
      switch (title) {
        case 'Mr':
        case 'Monsieur':
          return 'Monsieur';
        case 'Mrs':
        case 'Madame':
          return 'Madame';
        case 'Mr and Mrs':
        case 'Monsieur et Madame':
          return 'Monsieur et Madame';
        default:
          console.warn("Titre inconnu:", title);
          return 'Monsieur';
      }
    };

    // Générer l'état civil complet
    const etatcivilvendeurcomplet = generateCivilStatus(mandate.sellers);
    console.log("État civil généré:", etatcivilvendeurcomplet);

    // Afficher les valeurs des variables clés
    console.log("Type de propriété :", mandate.propertyType);
    console.log("Est en copropriété :", mandate.isInCopropriete);
    console.log("Lots :", mandate.lots);
    console.log("Description officielle :", mandate.officialDesignation);

    // Préparer les données pour remplacer les balises
    const titreProprietaire = getTitreFrancais(mandate.sellers?.[0]?.title);
    console.log("Titre du propriétaire :", titreProprietaire);

    // Générer la description des lots ou la description officielle
    let propertyDescription = '';
    if (mandate.propertyType === 'apartment' || isHouseInCopro) {
      propertyDescription = mandate.lots.map((lot, index) => {
        let description = formatLotDescription(lot);

        // Ajouter la surface Carrez après le premier lot uniquement
        if (index === 0 && lot.carrezSurface) {
          if (lot.carrezGuarantor?.type === 'diagnostician') {
            description += `\n\nSuperficie – Mesurage : ${lot.carrezSurface} m²\n\n`;
            description += `Attestation établie le ${new Date(lot.carrezGuarantor.date).toLocaleDateString('fr-FR')} par ${lot.carrezGuarantor.name}\n\n`;
          } else {
            description += `\n\nLe MANDANT déclare que la superficie du lot ${lot.number} est de ${lot.carrezSurface} m²\n\n`;
            description += "Le MANDANT reconnait avoir reçu du MANDATAIRE le très vif conseil de recourir à un professionnel du métré pour le mesurage dit Carrez, et devoir supporter seul les conséquences d'un refus de suivre ce conseil, notamment celles liées à une action de l'acquéreur en réduction du prix si la superficie réelle est inférieure de plus de 5% à celle exprimée sous la seule et entière responsabilité du MANDANT.";
          }
        }
        return description;
      }).join('\n\n');
    } else {
      propertyDescription = mandate.officialDesignation || '';
    }

    console.log("Description de la propriété :", propertyDescription);

    // Formater les lots et leurs tantièmes
    const formattedLots = mandate.lots.map(lot => ({
      number: lot.number, // Utiliser directement le numéro du lot
      description: lot.description,
      tantiemes: lot.tantiemes.map(tantieme => ({
        numerator: tantieme.numerator,
        denominator: tantieme.denominator,
        type: tantieme.type === 'custom' ? tantieme.customType :
          tantieme.type === 'general' ? 'des parties communes générales' :
            'de la propriété du sol et des parties communes générales'
      }))
    }));

    // Formater les informations de surface Carrez
    const surfaceCarrezInfo = mandate.lots[0]?.carrezSurface ? {
      surfaceCarrez: mandate.lots[0].carrezSurface,
      surfaceCarrezDescription: mandate.lots[0].carrezGuarantor?.type === 'diagnostician' ?
        `Attestation établie le ${new Date(mandate.lots[0].carrezGuarantor.date).toLocaleDateString('fr-FR')} par ${mandate.lots[0].carrezGuarantor.name}` :
        `Le MANDANT déclare que la superficie du lot ${mandate.lots[0].number} est de ${mandate.lots[0].carrezSurface} m²\n\n` +
        "Le MANDANT reconnait avoir reçu du MANDATAIRE le très vif conseil de recourir à un professionnel du métré pour le mesurage dit Carrez, et devoir supporter seul les conséquences d'un refus de suivre ce conseil, notamment celles liées à une action de l'acquéreur en réduction du prix si la superficie réelle est inférieure de plus de 5% à celle exprimée sous la seule et entière responsabilité du MANDANT."
    } : {
      surfaceCarrez: '',
      surfaceCarrezDescription: ''
    };

    // Calculer la surface totale et formater les sections cadastrales
    const totalSurface = (mandate.cadastralSections || []).reduce((total, section) => {
      return total + (parseInt(section.surface) || 0);
    }, 0);

    // Formater la surface totale
    const surfaceTotale = formatSurface(totalSurface.toString());

    // Avant de préparer les données, assurons-nous d'avoir 3 sections cadastrales
    const paddedSections = [...(mandate.cadastralSections || [])];
    while (paddedSections.length < 3) {
      paddedSections.push({
        section: '',
        number: '',
        lieuDit: '',
        surface: ''
      });
    }

    // Calcul du prix FAI (Frais d'Agence Inclus)
    const prixFAI = mandate.netPrice + mandate.fees.ttc;

    // Conversion du prix FAI en lettres
    const prixFAILettres = numberToWords(prixFAI);

    // Conversion des honoraires TTC en lettres
    const honorairesTTCLettres = numberToWords(mandate.fees.ttc);

    const honorairesMontant = mandate.fees.ttc; // Montant des honoraires en euros
    const prixVenteHorsHonoraires = mandate.netPrice; // Prix de vente hors honoraires

    // Texte des honoraires en fonction de qui les supporte
    const honorairesTexte = mandate.feesPayer === 'seller'
      ? `En cas de réalisation de l'opération, les honoraires du MANDATAIRE seront supportés par LE MANDANT d'un montant de ${numberToWords(honorairesMontant)} EUROS (${honorairesMontant.toLocaleString('fr-FR')} €).`
      : `En cas de réalisation de l'opération, les honoraires du MANDATAIRE seront supportés par L'ACQUÉREUR d'un montant de ${numberToWords(honorairesMontant)} EUROS (${honorairesMontant.toLocaleString('fr-FR')} €).
Ces honoraires seront compris dans le prix de vente indiqué ci-dessus, soit un prix de vente hors honoraires de ${prixVenteHorsHonoraires.toLocaleString('fr-FR')} €.`;

    const data = {
      titreProprietaire: titreProprietaire || 'Monsieur',
      prenomProprietaire: mandate.sellers?.[0]?.firstName || '',
      nomProprietaire: mandate.sellers?.[0]?.lastName || '',
      adresseProprietaire: mandate.sellers?.[0]?.address?.fullAddress || '',
      telephoneProprietaire: mandate.sellers?.[0]?.phone || '',
      emailProprietaire: mandate.sellers?.[0]?.email || '',
      adresseBien: mandate.propertyAddress?.fullAddress || '',
      villeBien: extractCity(mandate.propertyAddress?.fullAddress),
      propertyAddress: mandate.propertyAddress?.fullAddress || '',
      coPropertyAddressFormatted: mandate.coPropertyAddress?.fullAddress
        ? `Dans un ensemble immobilier soumis au régime de la copropriété tel que défini par la loi du 10 juillet 1965 situé : ${mandate.coPropertyAddress.fullAddress}`
        : '',
      typeBien: mandate.propertyType === 'house' ? 'Maison' : 'Appartement',
      surface: mandate.surface || '',
      pieces: mandate.rooms || '',
      chambres: mandate.bedrooms || '',
      etatGeneral: conditionText,
      anneeConstruction: criteria.constructionYear || '',
      etage: criteria.floorNumber || criteria.floor || '',
      nombreEtages: criteria.totalFloors || criteria.floorCount || '',
      chargesCopro: criteria.coproFees || criteria.chargesCopro
        ? `${criteria.coproFees || criteria.chargesCopro} €`
        : '',
      pointsForts: pointsForts,
      pointsFaibles: pointsFaibles,
      pointsFortsFormatted: pointsFortsFormatted,
      pointsFaiblesFormatted: pointsFaiblesFormatted,
      prixMoyen: formatPrice(mandate.marketAnalysis?.averagePrice || 0),
      prixMin: formatPrice(mandate.marketAnalysis?.priceRange?.min || 0),
      prixMax: formatPrice(mandate.marketAnalysis?.priceRange?.max || 0),
      tendanceMarche: getMarketTrendText(mandate.marketAnalysis?.marketTrend || ''),
      delaiVente: mandate.marketAnalysis?.averageSaleTime || '',
      prixRecommande: formatPrice(mandate.estimatedPrice?.recommended || 0),
      prixBas: formatPrice(mandate.estimatedPrice?.low || 0),
      prixHaut: formatPrice(mandate.estimatedPrice?.high || 0),
      fourchetteHaute: formatPrice(mandate.estimatedPrice?.high || 0),
      fourchetteHauteChiffre: mandate.estimatedPrice?.high || 0,
      fourchetteBasseChiffre: mandate.estimatedPrice?.low || 0,
      fourchetteBasseFormatted: new Intl.NumberFormat('fr-FR').format(mandate.estimatedPrice?.low || 0),
      fourchetteBasse: new Intl.NumberFormat('fr-FR').format(mandate.estimatedPrice?.low || 0),
      prixM2: formatPrice(mandate.pricePerSqm || 0),
      commentaires: mandate.comments || '',
      dateEstimation: formatDate(mandate.date),
      prenomCommercial: prenomCommercial,
      nomCommercial: nomCommercial,
      telephoneCommercial: telephoneCommercial,
      emailCommercial: emailCommercial,
      kitchenType: kitchenTypeFrench,
      heatingSystem: heatingSystemFrench,
      exposure: exposureFrench,
      windowsType: windowsTypeFrench,
      constructionMaterial: constructionMaterialFrench,
      adjacency: adjacencyFrench,
      basement: getBooleanText(criteria.hasBasement),
      hasCellar: getBooleanText(criteria.hasCellar),
      hasGarden: getBooleanText(criteria.hasGarden),
      hasDoubleGlazing: getBooleanText(criteria.hasDoubleGlazing),
      hasBalcony: getBooleanText(criteria.hasBalcony),
      hasTerrace: getBooleanText(criteria.hasTerrace),
      hasElevator: getBooleanText(criteria.hasElevator),
      hasGarage: getBooleanText(criteria.hasGarage),
      hasFireplace: getBooleanText(criteria.hasFireplace),
      hasWoodStove: getBooleanText(criteria.hasWoodStove),
      hasElectricShutters: getBooleanText(criteria.hasElectricShutters),
      hasParkingBox: getBooleanText(criteria.hasParkingBox),
      hasElectricGate: getBooleanText(criteria.hasElectricGate),
      hasConvertibleAttic: getBooleanText(criteria.hasConvertibleAttic),
      bathrooms: criteria.bathrooms || 0,
      floorNumber: criteria.floorNumber || criteria.floor || '',
      totalFloors: criteria.totalFloors || criteria.floorCount || '',
      propertyTax: criteria.propertyTax || 0,
      livingRoomSurface: criteria.livingRoomSurface || 0,
      landSurface: criteria.landSurface || 0,
      constructionYear: criteria.constructionYear || '',
      calculateMandatoryPrice: calculateMandatoryPrice(),
      diagCarrez: isInCoproperty ? "☑" : "☐",
      diagDPE: "☑",
      diagElectricite: isOlderThan15Years ? "☑" : "☐",
      diagGaz: isOlderThan15Years && hasGas ? "☑" : "☐",
      diagAmiante: isBeforeAsbestos ? "☑" : "☐",
      diagPlomb: isBeforeLead ? "☑" : "☐",
      diagERP: "☑",
      diagAssainissement: "☑",
      diagPreEtatDate: isInCoproperty ? "☑" : "☐",
      texteDiagCarrez: isInCoproperty ? "Obligatoire" : "Non applicable",
      texteDiagDPE: "Obligatoire",
      texteDiagElectricite: isOlderThan15Years ? "Obligatoire (installation > 15 ans)" : "Non obligatoire",
      texteDiagGaz: isOlderThan15Years && hasGas ? "Obligatoire (installation > 15 ans)" : hasGas ? "Non obligatoire" : "Pas de gaz",
      texteDiagAmiante: isBeforeAsbestos ? "Obligatoire (construction avant 1997)" : "Non obligatoire",
      texteDiagPlomb: isBeforeLead ? "Obligatoire (construction avant 1949)" : "Non obligatoire",
      texteDiagERP: "Obligatoire",
      texteDiagAssainissement: "Recommandé",
      texteDiagPreEtatDate: isInCoproperty ? "Recommandé" : "Non applicable",
      isHouse: mandate.propertyType === 'house',
      isApartment: mandate.propertyType === 'apartment',
      isHouseInCopro: isHouseInCopro,
      totalPrixM2Vendus: soldPricesTotal ? formatPrice(soldPricesTotal) : 'N/A',
      totalPrixM2AVendre: forSalePricesTotal ? formatPrice(forSalePricesTotal) : 'N/A',
      enVenteDepuis1: saleDates[0] ? `En vente depuis ${saleDates[0]}` : 'Bien similaire N°1',
      enVenteDepuis2: saleDates[1] ? `En vente depuis ${saleDates[1]}` : 'Bien similaire N°2',
      enVenteDepuis3: saleDates[2] ? `En vente depuis ${saleDates[2]}` : 'Bien similaire N°3',
      enVenteDepuis4: saleDates[3] ? `En vente depuis ${saleDates[3]}` : 'Bien similaire N°4',
      // Informations du mandat
      dateMandat: formattedDate || '',
      numeroMandat: mandate.mandate_number || '',
      typeMandat: mandate.type === 'exclusive' ? 'EXCLUSIF' : mandate.type === 'semi-exclusive' ? 'SEMI-EXCLUSIF' : 'SIMPLE',

      // Prix et honoraires
      prixNetVendeur: formatPrice(mandate.netPrice || 0),
      honorairesTTC: formatPrice(mandate.fees?.ttc || 0),
      honorairesHT: formatPrice(mandate.fees?.ht || 0),
      honorairesTTCLettres: honorairesTTCLettres,
      chargeHonoraires: mandate.feesPayer === 'seller' ? 'VENDEUR' : 'ACQUÉREUR',
      honorairesTexte: honorairesTexte,

      // État civil complet
      etatcivilvendeurcomplet: etatcivilvendeurcomplet || '',

      // Nouvelle propriété ajoutée
      occupationStatus: getOccupationStatusText(mandate.occupationStatus),
      propertyDescription: propertyDescription,
      ...surfaceCarrezInfo,
      lots: formattedLots,

      // Sections cadastrales individuelles
      'cadastralSections.0.section': paddedSections[0].section || '',
      'cadastralSections.0.number': paddedSections[0].number || '',
      'cadastralSections.0.lieuDit': paddedSections[0].lieuDit || '',
      'cadastralSections.0.surface': paddedSections[0].surface || '',

      'cadastralSections.1.section': paddedSections[1].section || '',
      'cadastralSections.1.number': paddedSections[1].number || '',
      'cadastralSections.1.lieuDit': paddedSections[1].lieuDit || '',
      'cadastralSections.1.surface': paddedSections[1].surface || '',

      'cadastralSections.2.section': paddedSections[2].section || '',
      'cadastralSections.2.number': paddedSections[2].number || '',
      'cadastralSections.2.lieuDit': paddedSections[2].lieuDit || '',
      'cadastralSections.2.surface': paddedSections[2].surface || '',

      surfaceTotale: surfaceTotale,
      cadastralSectionsFormatted: formatCadastralSections(mandate.cadastralSections),

      // Ajouter les nouveaux champs
      prixFAI: formatPrice(prixFAI),
      prixFAILettres: prixFAILettres,
      mandateDurationText: getMandateDurationText(mandate.type),

      // Ajouter cette ligne dans l'objet data
      dpeText: getDPEText(mandate.dpeStatus),
    };

    console.log("Valeur de etatGeneral avant rendu :", data.etatGeneral);
    console.log("Données complètes passées à Docxtemplater :", data);

    try {
      console.log("Remplacement des balises...");
      doc.render(data);
    } catch (error: any) {
      console.error(error);
      if (error.properties && error.properties.errors) {
        console.log('Détails des erreurs :', error.properties.errors);
        if (error.properties.errors instanceof Array) {
          error.properties.errors.forEach((e: any) => {
            console.log('Erreur pour la balise :', e.name);
            console.log('Message :', e.message);
          });
        }
      }
      throw error;
    }

    console.log("Génération du document final...");
    const generatedDoc = doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    const city = extractCity(data.adresseBien);
    const fileName = `Mandat ${data.typeMandat} - ${city} - ${formattedDate}.docx`;

    console.log("Téléchargement du document...");
    saveAs(generatedDoc, fileName);
    return true;
  } catch (error) {
    console.error('Erreur lors de la génération du document Word :', error);
    throw error;
  }
}

// Fonction utilitaire pour extraire la ville de l'adresse
function extractCity(address: string): string {
  const match = address.match(/\d{5}\s+([A-Z\s-]+)/);
  return match ? match[1].trim() : '';
}

// Fonction utilitaire pour formater la date
function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}
