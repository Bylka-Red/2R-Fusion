import { Document, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, AlignmentType, BorderStyle, WidthType, Packer, ImageRun } from 'docx';
import { saveAs } from 'file-saver';
import type { Mandate, Seller, PropertyAddress, PropertyLot, CadastralSection } from '../types';

interface MandateWordProps {
  mandate: Mandate;
  sellers: Seller[];
  propertyAddress: PropertyAddress;
  propertyType: 'monopropriete' | 'copropriete';
  coPropertyAddress: PropertyAddress;
  lots: PropertyLot[];
  officialDesignation: string;
  cadastralSections: CadastralSection[];
  occupationStatus: 'occupied-by-seller' | 'vacant' | 'rented';
  dpeStatus: 'completed' | 'in-progress' | 'not-required';
}

const numberToWords = (num: number): string => {
  // Conversion des nombres en mots (implémentation simplifiée)
  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];
  const hundreds = ['', 'cent', 'deux cent', 'trois cent', 'quatre cent', 'cinq cent', 'six cent', 'sept cent', 'huit cent', 'neuf cent'];

  if (num === 0) return 'zéro';
  if (num < 20) return units[num];
  if (num < 100) {
    const digit = num % 10;
    const ten = Math.floor(num / 10);
    if (ten === 7 || ten === 9) {
      return tens[ten] + (digit === 1 ? ' et ' : '-') + units[10 + digit];
    }
    return tens[ten] + (digit === 0 ? '' : (digit === 1 && ten !== 8 ? ' et ' : '-') + units[digit]);
  }
  if (num < 1000) {
    const hundred = Math.floor(num / 100);
    const remainder = num % 100;
    return (hundred === 1 ? 'cent' : hundreds[hundred]) + (remainder === 0 ? '' : ' ' + numberToWords(remainder));
  }
  if (num < 1000000) {
    const thousand = Math.floor(num / 1000);
    const remainder = num % 1000;
    return numberToWords(thousand) + ' mille' + (remainder === 0 ? '' : ' ' + numberToWords(remainder));
  }
  return num.toString();
};

const formatTantieme = (tantieme: { numerator: string; denominator: string; type: string; customType?: string }): string => {
  const num = parseInt(tantieme.numerator);
  const den = parseInt(tantieme.denominator);
  if (!num || !den) return '';

  const numWords = numberToWords(num);
  const denWords = numberToWords(den);

  let typeText = '';
  switch (tantieme.type) {
    case 'general':
      typeText = 'des parties communes générales';
      break;
    case 'soil-and-general':
      typeText = 'de la propriété du sol et des parties communes générales';
      break;
    case 'custom':
      typeText = tantieme.customType || '';
      break;
  }

  return `Et les ${numWords} / ${denWords} (${num}/${den} èmes) ${typeText}`;
};

const formatSurface = (surface: string): string => {
  const num = parseInt(surface) || 0;
  const ha = Math.floor(num / 10000);
  const a = Math.floor((num % 10000) / 100);
  const ca = num % 100;
  return `${ha.toString().padStart(2, '0')}ha ${a.toString().padStart(2, '0')}a ${ca.toString().padStart(2, '0')}ca`;
};

const formatSellerText = (seller: Seller, totalSellers: number): Paragraph[] => {
  const lines: Paragraph[] = [];

  if (seller.type === 'individual') {
    const title = seller.title === 'Mrs' ? 'Madame' : 'Monsieur';
    const birthDate = new Date(seller.birthDate).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    let maritalStatusText = '';
    switch (seller.maritalStatus) {
      case 'celibataire-non-pacse':
        maritalStatusText = `célibataire non lié${seller.title === 'Mrs' ? 'e' : ''} par un PACS`;
        break;
      case 'celibataire-pacse':
        if (seller.pacsDetails) {
          const pacsDate = new Date(seller.pacsDetails.date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          });
          maritalStatusText = `célibataire, lié${seller.title === 'Mrs' ? 'e' : ''} par un PACS enregistré le ${pacsDate} à ${seller.pacsDetails.place}${seller.pacsDetails.partnerName ? `, avec ${seller.pacsDetails.partnerName}` : ''}`;
        }
        break;
      case 'marie-sans-contrat':
      case 'communaute-acquets':
      case 'separation-biens':
      case 'communaute-universelle':
        const marriageDate = new Date(seller.marriageDetails.date).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        const regimeText = {
          'marie-sans-contrat': 'sans contrat de mariage',
          'communaute-acquets': "sous le régime de la communauté d'acquêts",
          'separation-biens': 'sous le régime de la séparation de biens',
          'communaute-universelle': 'sous le régime de la communauté universelle'
        }[seller.maritalStatus];
        maritalStatusText = `marié${seller.title === 'Mrs' ? 'e' : ''} ${regimeText} le ${marriageDate} à ${seller.marriageDetails.place}`;
        break;
      case 'divorce':
        maritalStatusText = `divorcé${seller.title === 'Mrs' ? 'e' : ''}, non remarié${seller.title === 'Mrs' ? 'e' : ''}${seller.divorceDetails?.exSpouseName ? `, de ${seller.divorceDetails.exSpouseName}` : ''}`;
        break;
      case 'veuf':
        maritalStatusText = `veuf${seller.title === 'Mrs' ? 've' : ''}, non remarié${seller.title === 'Mrs' ? 'e' : ''}${seller.widowDetails?.deceasedSpouseName ? `, de ${seller.widowDetails.deceasedSpouseName}` : ''}`;
        break;
    }

    lines.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${title} ${seller.firstName} ${seller.lastName.toUpperCase()}, né${seller.title === 'Mrs' ? 'e' : ''} le ${birthDate} à ${seller.birthPlace}, de nationalité ${seller.nationality}, ${seller.profession.toLowerCase()}, ${maritalStatusText}.`,
            bold: true,
            color: '008000', // Vert
          }),
        ],
      })
    );
    lines.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Demeurant ${seller.address.fullAddress}.`,
            bold: true,
            color: '008000', // Vert
          }),
        ],
      })
    );

    const shouldShowPropertyType = totalSellers === 1 &&
      !['celibataire-non-pacse', 'divorce', 'veuf'].includes(seller.maritalStatus);

    if (shouldShowPropertyType) {
      if (seller.propertyType === 'personal-not-family') {
        lines.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "Et déclarant que les biens à vendre, objet des présentes, lui appartiennent en propre et qu'ils ne constituent pas le logement de la famille, au sens de l'article 215 du Code civil.",
                bold: true,
                color: '008000', // Vert
              }),
            ],
          })
        );
      } else if (seller.propertyType === 'personal-family') {
        lines.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "Et déclarant que les biens à vendre, objet des présentes, lui appartiennent en propre et que, constituant le logement de la famille, au sens de l'article 215 du Code civil, il s'engage à obtenir le consentement de son conjoint à leur vente.",
                bold: true,
                color: '008000', // Vert
              }),
            ],
          })
        );
      }
    }

    lines.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${seller.hasFrenchTaxResidence ? 'Résident' : 'Non résident'} au sens de la réglementation fiscale.`,
            bold: true,
            color: '008000', // Vert
          }),
        ],
      })
    );
    lines.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Téléphone : ${seller.phone} - Email : ${seller.email}`,
            bold: true,
            color: '008000', // Vert
          }),
        ],
      })
    );
  } else {
    const managerTitle = seller.title === 'Mrs' ? 'Madame' : 'Monsieur';
    lines.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `La société ${seller.companyName.toUpperCase()}, ${seller.legalForm} au capital de ${seller.capital} euros, RCS ${seller.rcsCity} N° ${seller.rcsNumber}, dont le siège social est situé ${seller.address.fullAddress}, représentée par ${managerTitle} ${seller.managerFirstName} ${seller.managerLastName.toUpperCase()}, en sa qualité de gérant.`,
            bold: true,
            color: '008000', // Vert
          }),
        ],
      })
    );
    lines.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Téléphone : ${seller.phone} - Email : ${seller.email}`,
            bold: true,
            color: '008000', // Vert
          }),
        ],
      })
    );
  }

  return lines;
};


const formatPriceToWords = (price: number): string => {
  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];
  const hundreds = ['', 'cent', 'deux cent', 'trois cent', 'quatre cent', 'cinq cent', 'six cent', 'sept cent', 'huit cent', 'neuf cent'];

  if (price === 0) return 'zéro';
  if (price < 20) return units[price];
  if (price < 100) {
    const digit = price % 10;
    const ten = Math.floor(price / 10);
    if (ten === 7 || ten === 9) {
      return tens[ten] + (digit === 1 ? ' et ' : '-') + units[10 + digit];
    }
    return tens[ten] + (digit === 0 ? '' : (digit === 1 && ten !== 8 ? ' et ' : '-') + units[digit]);
  }
  if (price < 1000) {
    const hundred = Math.floor(price / 100);
    const remainder = price % 100;
    return (hundred === 1 ? 'cent' : hundreds[hundred]) + (remainder === 0 ? '' : ' ' + formatPriceToWords(remainder));
  }
  if (price < 1000000) {
    const thousand = Math.floor(price / 1000);
    const remainder = price % 1000;
    return formatPriceToWords(thousand) + ' mille' + (remainder === 0 ? '' : ' ' + formatPriceToWords(remainder));
  }
  return price.toString();
};

const getMandateDurationText = (type: string) => {
  switch (type) {
    case 'simple':
      return "Le présent MANDAT NON EXCLUSIF, qui prendra effet le jour de sa signature, est consenti pour une durée de 12 mois au-delà de laquelle il prendra automatiquement fin. Passé un délai de trois mois à compter de sa signature, le mandat pourra toutefois être dénoncé à tout moment par chacune des parties, à charge pour celle qui entend y mettre fin d'en aviser l'autre partie quinze jours au moins à l'avance par lettre recommandée avec demande d'avis de réception, conformément aux dispositions du deuxième alinéa de l'article 78 du décret du 20 juillet 1972. Par dérogation aux dispositions de l'article 2003 du Code civil, le décès du MANDANT n’entrainera pas la résiliation du mandat, lequel se poursuivra avec ses ayants droit.";
    case 'exclusive':
      return "Le présent MANDAT EXCLUSIF, qui prendra effet le jour de sa signature, est consenti pour une durée de 3 mois. A l'issue de cette période initiale, il sera prorogé pour une durée de 12 mois, au terme de laquelle il prendra automatiquement fin. Toutefois, passé un délai de trois mois à compter de sa signature, il pourra être dénoncé à tout moment par chacune des parties avec un préavis de quinze jours, par lettre recommandée avec demande d’avis de réception. Il est rappelé que passé un délai de trois mois à compter de sa signature, le mandat qui est assorti d’une clause d’exclusivité ou d’une clause pénale, ou qui comporte une clause aux termes de laquelle des honoraires seront dus par le mandant même si l’opération est conclue sans les soins de l’intermédiaire, peut être dénoncé à tout moment par chacune des parties, à charge pour celle qui entend y mettre fin d’en aviser l’autre partie quinze jours au moins à l’avance par lettre recommandée avec demande d’avis de réception, conformément aux dispositions du deuxième alinéa de l’article 78 du décret du 20 juillet 1972. Le présent mandat ne peut être dénoncé que dans sa totalité et en aucun cas de façon partielle. Par dérogation aux dispositions de l’article 2003 du Code civil, le décès du MANDANT n’entrainera pas la résiliation du mandat, lequel se poursuivra avec ses ayants droit.";
    case 'semi-exclusive':
      return "Le présent MANDAT SEMI-EXCLUSIF, qui prendra effet le jour de sa signature, est consenti pour une durée de 3 mois. A l'issue de cette période initiale, il sera prorogé pour une durée de 12 mois, au terme de laquelle il prendra automatiquement fin. Toutefois, passé un délai de trois mois à compter de sa signature, il pourra être dénoncé à tout moment par chacune des parties avec un préavis de quinze jours, par lettre recommandée avec demande d’avis de réception. Le présent mandat ne peut être dénoncé que dans sa totalité et en aucun cas de façon partielle. Par dérogation aux dispositions de l’article 2003 du Code civil, le décès du MANDANT n’entrainera pas la résiliation du mandat, lequel se poursuivra avec ses ayants droit.";
    default:
      return '';
  }
};

const getMandateEngagementsText = (type: string) => {
  switch (type) {
    case 'simple':
      return `Le MANDANT s'engage à exécuter le présent mandat de bonne foi.

EN CAS DE REFUS DE VENTE, DÉLOYAL OU DE MAUVAISE FOI DE LA PART DU MANDANT, CELUI-CI S’OBLIGE EXPRESSÉMENT ET DE MANIÈRE IRRÉVOCABLE À VERSER AU MANDATAIRE UNE SOMME ÉGALE AU MONTANT TOTAL, TVA INCLUSE, DE LA RÉMUNÉRATION PRÉVUE AUX PRÉSENTES ET CE, À TITRE D'INDEMNITÉ FORFAITAIRE ET DÉFINITIVE.

Le MANDANT déclare, sous sa propre responsabilité :
• avoir la capacité juridique de disposer desdits biens et ne faire l’objet d’aucune mesure restreignant sa capacité à agir (tutelle, curatelle, etc.),
• que les biens objets du présent mandat sont librement cessibles et ne font l’objet d’aucune procédure de saisie immobilière.

Le MANDANT s'engage :
• à remettre au MANDATAIRE dans les meilleurs délais au plus tard dans les huit (8) jours de la signature du présent mandat tous les documents nécessaires à l'exécution de son mandat, notamment le titre de propriété, les diagnostics, certificats et justificatifs rendus obligatoires,
• à informer le MANDATAIRE de tous les éléments nouveaux, notamment juridiques et matériels, susceptibles de modifier les conditions de la vente,
• à répondre à toute offre d'achat transmise par le MANDATAIRE dans un délai maximum de huit (8) jours,
• S’il accepte une offre d'achat ou s'il signe tout contrat préparatoire à la vente ou s'il vend les biens sans l’intermédiaire du MANDATAIRE, à l’en informer immédiatement et à lui communiquer à première demande les coordonnées de l'offrant ou de l’acquéreur, le prix de la vente, les nom et adresse du notaire chargé d’établir l’acte de vente ainsi que, le cas échéant, les coordonnées de l’intermédiaire qui aura concouru à la réalisation de la vente.

INFORMATION RELATIVE AU DPE :

Le Mandant déclare qu'un Diagnostic de Performance Énergétique conforme à la réglementation applicable à compter du 1er juillet 2021 a été établi.

Le MANDANT est informé que :
Lorsque le niveau de performance d'un bien immobilier à usage d'habitation n'est pas compris entre les classes A et E du diagnostic de performance énergétique :
• À compter du 1er janvier 2022 : l'obligation d'atteindre ce niveau de performance est mentionnée dans les publicités relatives à la vente ou à la location dudit bien, ainsi que dans les actes de vente ou les baux concernant ce bien.
• À compter du 1er janvier 2028 : le non-respect de cette obligation est mentionné dans les publicités relatives à la vente ou à la location dudit bien, ainsi que dans les actes de vente ou les baux concernant ce bien.

Pour les logements de la classe F ou G, lorsque le bail est soumis à la loi n° 89-462 du 6 juillet 1989 :
• Le loyer du contrat de location conclu à compter du 24 août 2022 ne pourra pas excéder le dernier loyer appliqué au précédent locataire.
• Toute augmentation de loyer (y compris en application d'une clause d'indexation) est interdite pour les contrats conclus, renouvelés ou tacitement reconduits à compter du 24 août 2022.

Pour être décent, un logement doit remplir un niveau de performance minimal :
• Pour les baux conclus à compter du 1er janvier 2023 en France métropolitaine : la consommation d’énergie estimée du logement doit être inférieure à 450 kWh d'énergie finale par mètre carré de surface habitable,
• À compter du 1er janvier 2025, entre la classe A et la classe F,
• À compter du 1er janvier 2028, entre la classe A et la classe E,
• À compter du 1er janvier 2034 : entre la classe A et la classe D.

Un audit énergétique doit être réalisé lorsque sont proposés à la vente des bâtiments ou parties de bâtiment à usage d'habitation, qui comprennent un seul logement ou comportent plusieurs logements ne relevant pas de la loi n° 65-557 du 10 juillet 1965 fixant le statut de la copropriété des immeubles bâtis :
• À compter du 1er septembre 2022 pour les logements de la classe F ou G,
• À compter du 1er janvier 2025 pour les logements de la classe E,
• À compter du 1er janvier 2034 pour les logements de la classe D.
Cet audit énergétique formule des propositions de travaux de rénovation énergétique permettant d'atteindre la classe E (pour les logements de la classe F ou G) et/ou la classe B.

Dans le cadre du mandat, le MANDANT autorise le MANDATAIRE :
• à entreprendre toutes les actions de communication qu'il jugera utiles et, dans ce cadre, à diffuser des photographies et/ou vidéos des biens à vendre,
• à réclamer auprès de toutes personnes publiques ou privées toutes les pièces justificatives concernant les biens à vendre,
• à présenter et à faire visiter le bien étant précisé et accepté par le MANDANT que le MANDATAIRE ne pourra, en aucun cas, être considéré comme le gardien juridique des biens à vendre,
• à faire appel, en tant que de besoin et sous sa responsabilité, à tout concours extérieur en vue de réaliser la vente,
• à établir, le cas échéant, tout acte sous seing privé aux clauses et conditions nécessaires à l'accomplissement des présentes, la vente pouvant être assortie d'une condition suspensive d'obtention de prêt, et à recueillir la signature de l’acquéreur,
• en cas d’exercice d’un droit de préemption, à négocier avec le bénéficiaire de ce droit.

Si la vente est réalisée par son intermédiaire, le MANDANT autorise également le MANDATAIRE à apposer sur les biens un panonceau mentionnant "Vendu par" ou toute mention équivalente durant une période que le MANDATAIRE jugera suffisante et expirant au plus tard le jour de la réalisation du contrat préparatoire à la vente par acte authentique.

Le MANDANT s'interdit :
• pendant la durée du mandat, de vendre directement ou indirectement les biens ci-dessus désignés avec une personne présentée par le MANDATAIRE,
• pendant la durée du présent mandat et durant les douze (12) mois suivant sa révocation ou son expiration, de traiter, directement ou indirectement, avec une personne à qui ce bien aura été présenté par le MANDATAIRE, ou un MANDATAIRE qu'il se sera substitué, et dont l'identité aura été communiquée au MANDANT. Cette interdiction vise tant la personne de l’acheteur que son conjoint, concubin ou partenaire de Pacs avec lequel il se porterait acquéreur, ou encore toute société dans laquelle ledit acheteur aurait la qualité d’associé.

Le MANDANT déclare ne pas avoir déjà consenti de mandat de vente non expiré ou dénoncé et il s’interdit d’en consentir un sans avoir préalablement dénoncé le présent mandat.
Pendant toute la durée du mandat, le MANDANT s’engage à transmettre sans délai au MANDATAIRE toutes les demandes qui lui seraient faites personnellement.

Le MANDANT s'oblige, s'il vend les biens pendant la durée du présent mandat ou durant le délai de douze (12) mois suivant la révocation ou l'expiration du mandat, à communiquer immédiatement au MANDATAIRE la date et le prix de la vente, les nom et adresse de l'acquéreur et, le cas échéant, de l'intermédiaire qui aura permis sa conclusion, ainsi que les coordonnées du notaire rédacteur de l'acte de vente.

EN CAS DE MANQUEMENT À L'UNE OU L'AUTRE DE CES INTERDICTIONS OU OBLIGATIONS, LE MANDANT S'OBLIGE EXPRESSÉMENT ET DE MANIÈRE IRRÉVOCABLE À VERSER AU MANDATAIRE UNE SOMME ÉGALE AU MONTANT TOTAL, TVA INCLUSE, DE LA RÉMUNÉRATION PRÉVUE AUX PRÉSENTES ET CE, À TITRE D'INDEMNITÉ FORFAITAIRE ET DÉFINITIVE.

Le MANDANT s’engage, en sa qualité de gardien, à prendre toutes dispositions pour assurer la bonne conservation de ses biens et à souscrire, à cette fin, toutes les assurances requises.

Le MANDANT accepte expressément que le MANDATAIRE lui adresse des offres d'achat par lettres recommandées électroniques avec accusé de réception aux adresses mail indiquées ci-avant et ce, conformément aux dispositions de l’article 1126 du Code civil et de l’article L.100 du Code des postes et des communications électroniques.

Il reconnaît avoir été informé que ces lettres recommandées électroniques seront envoyées par l’intermédiaire d’un tiers de confiance agréé, et qu’il existe une possibilité qu’elles soient classées par sa messagerie dans un dossier de courriers indésirables et qu’il devra donc vérifier le contenu de ce dossier sur sa messagerie.

Le MANDANT :
• reconnaît et garantit qu’il dispose de la maîtrise exclusive du compte e-mail qu'il a indiqué, notamment pour son accès régulier, la confidentialité des identifiants qui lui permettent d'y accéder et la gestion des paramètres de réception et de filtrage de courriers entrants,
• S’engage à signaler immédiatement toute perte ou usage abusif de son compte e-mail,
• Accepte que toute action effectuée au travers de son compte e-mail soit réputée effectuée par lui et relève de sa responsabilité exclusive pour toutes les conséquences légales et réglementaires des notifications.`;
    case 'exclusive':
    case 'semi-exclusive':
      return `Le MANDANT s'engage à exécuter le présent mandat de bonne foi.

EN CAS DE REFUS DE VENTE, DÉLOYAL OU DE MAUVAISE FOI DE LA PART DU MANDANT, CELUI-CI S’OBLIGE EXPRESSÉMENT ET DE MANIÈRE IRRÉVOCABLE À VERSER AU MANDATAIRE UNE SOMME ÉGALE AU MONTANT TOTAL, TVA INCLUSE, DE LA RÉMUNÉRATION PRÉVUE AUX PRÉSENTES ET CE, À TITRE D'INDEMNITÉ FORFAITAIRE ET DÉFINITIVE.

Le MANDANT déclare, sous sa propre responsabilité :
• avoir la capacité juridique de disposer desdits biens et ne faire l’objet d’aucune mesure restreignant sa capacité à agir (tutelle, curatelle, etc.),
• que les biens objets du présent mandat sont librement cessibles et ne font l’objet d’aucune procédure de saisie immobilière.

Le MANDANT s'engage :
• à remettre au MANDATAIRE dans les meilleurs délais au plus tard dans les huit (8) jours de la signature du présent mandat tous les documents nécessaires à l'exécution de son mandat, notamment le titre de propriété, les diagnostics, certificats et justificatifs rendus obligatoires,
• à informer le MANDATAIRE de tous les éléments nouveaux, notamment juridiques et matériels, susceptibles de modifier les conditions de la vente,
• à répondre à toute offre d'achat transmise par le MANDATAIRE dans un délai maximum de huit (8) jours,
• S’il accepte une offre d'achat ou s'il signe tout contrat préparatoire à la vente ou s'il vend les biens sans l’intermédiaire du MANDATAIRE, à l’en informer immédiatement et à lui communiquer à première demande les coordonnées de l'offrant ou de l’acquéreur, le prix de la vente, les nom et adresse du notaire chargé d’établir l’acte de vente ainsi que, le cas échéant, les coordonnées de l’intermédiaire qui aura concouru à la réalisation de la vente.

INFORMATION RELATIVE AU DPE :

Le Mandant déclare qu'un Diagnostic de Performance Énergétique conforme à la réglementation applicable à compter du 1er juillet 2021 a été établi.

Le MANDANT est informé que :
Lorsque le niveau de performance d'un bien immobilier à usage d'habitation n'est pas compris entre les classes A et E du diagnostic de performance énergétique :
• À compter du 1er janvier 2022 : l'obligation d'atteindre ce niveau de performance est mentionnée dans les publicités relatives à la vente ou à la location dudit bien, ainsi que dans les actes de vente ou les baux concernant ce bien.
• À compter du 1er janvier 2028 : le non-respect de cette obligation est mentionné dans les publicités relatives à la vente ou à la location dudit bien, ainsi que dans les actes de vente ou les baux concernant ce bien.

Pour les logements de la classe F ou G, lorsque le bail est soumis à la loi n° 89-462 du 6 juillet 1989 :
• Le loyer du contrat de location conclu à compter du 24 août 2022 ne pourra pas excéder le dernier loyer appliqué au précédent locataire.
• Toute augmentation de loyer (y compris en application d'une clause d'indexation) est interdite pour les contrats conclus, renouvelés ou tacitement reconduits à compter du 24 août 2022.

Pour être décent, un logement doit remplir un niveau de performance minimal :
• Pour les baux conclus à compter du 1er janvier 2023 en France métropolitaine : la consommation d’énergie estimée du logement doit être inférieure à 450 kWh d'énergie finale par mètre carré de surface habitable,
• À compter du 1er janvier 2025, entre la classe A et la classe F,
• À compter du 1er janvier 2028, entre la classe A et la classe E,
• À compter du 1er janvier 2034 : entre la classe A et la classe D.

Un audit énergétique doit être réalisé lorsque sont proposés à la vente des bâtiments ou parties de bâtiment à usage d'habitation, qui comprennent un seul logement ou comportent plusieurs logements ne relevant pas de la loi n° 65-557 du 10 juillet 1965 fixant le statut de la copropriété des immeubles bâtis :
• À compter du 1er septembre 2022 pour les logements de la classe F ou G,
• À compter du 1er janvier 2025 pour les logements de la classe E,
• À compter du 1er janvier 2034 pour les logements de la classe D.
Cet audit énergétique formule des propositions de travaux de rénovation énergétique permettant d'atteindre la classe E (pour les logements de la classe F ou G) et/ou la classe B.

Dans le cadre du mandat, le MANDANT autorise le MANDATAIRE :
• à entreprendre toutes les actions de communication qu'il jugera utiles et, dans ce cadre, à diffuser des photographies et/ou vidéos des biens à vendre,
• à réclamer auprès de toutes personnes publiques ou privées toutes les pièces justificatives concernant les biens à vendre,
• à présenter et à faire visiter le bien étant précisé et accepté par le MANDANT que le MANDATAIRE ne pourra, en aucun cas, être considéré comme le gardien juridique des biens à vendre,
• à faire appel, en tant que de besoin et sous sa responsabilité, à tout concours extérieur en vue de réaliser la vente,
• à établir, le cas échéant, tout acte sous seing privé aux clauses et conditions nécessaires à l'accomplissement des présentes, la vente pouvant être assortie d'une condition suspensive d'obtention de prêt, et à recueillir la signature de l’acquéreur,
• en cas d’exercice d’un droit de préemption, à négocier avec le bénéficiaire de ce droit.

Si la vente est réalisée par son intermédiaire, le MANDANT autorise également le MANDATAIRE à apposer sur les biens un panonceau mentionnant "Vendu par" ou toute mention équivalente durant une période que le MANDATAIRE jugera suffisante et expirant au plus tard le jour de la réalisation du contrat préparatoire à la vente par acte authentique.

Le MANDANT s'interdit :
• pendant la durée du mandat, de vendre directement ou indirectement les biens ci-dessus désignés avec une personne présentée par le MANDATAIRE,
• pendant la durée du présent mandat et durant les douze (12) mois suivant sa révocation ou son expiration, de traiter, directement ou indirectement, avec une personne à qui ce bien aura été présenté par le MANDATAIRE, ou un MANDATAIRE qu'il se sera substitué, et dont l'identité aura été communiquée au MANDANT. Cette interdiction vise tant la personne de l’acheteur que son conjoint, concubin ou partenaire de Pacs avec lequel il se porterait acquéreur, ou encore toute société dans laquelle ledit acheteur aurait la qualité d’associé.

Le MANDANT déclare ne pas avoir déjà consenti de mandat de vente non expiré ou dénoncé et il s’interdit d’en consentir un sans avoir préalablement dénoncé le présent mandat.
Pendant toute la durée du mandat, le MANDANT s’engage à transmettre sans délai au MANDATAIRE toutes les demandes qui lui seraient faites personnellement.

Le MANDANT s'oblige, s'il vend les biens pendant la durée du présent mandat ou durant le délai de douze (12) mois suivant la révocation ou l'expiration du mandat, à communiquer immédiatement au MANDATAIRE la date et le prix de la vente, les nom et adresse de l'acquéreur et, le cas échéant, de l'intermédiaire qui aura permis sa conclusion, ainsi que les coordonnées du notaire rédacteur de l'acte de vente.

EN CAS DE MANQUEMENT À L'UNE OU L'AUTRE DE CES INTERDICTIONS OU OBLIGATIONS, LE MANDANT S'OBLIGE EXPRESSÉMENT ET DE MANIÈRE IRRÉVOCABLE À VERSER AU MANDATAIRE UNE SOMME ÉGALE AU MONTANT TOTAL, TVA INCLUSE, DE LA RÉMUNÉRATION PRÉVUE AUX PRÉSENTES ET CE, À TITRE D'INDEMNITÉ FORFAITAIRE ET DÉFINITIVE.

Le MANDANT s’engage, en sa qualité de gardien, à prendre toutes dispositions pour assurer la bonne conservation de ses biens et à souscrire, à cette fin, toutes les assurances requises.

Le MANDANT accepte expressément que le MANDATAIRE lui adresse des offres d'achat par lettres recommandées électroniques avec accusé de réception aux adresses mail indiquées ci-avant et ce, conformément aux dispositions de l’article 1126 du Code civil et de l’article L.100 du Code des postes et des communications électroniques.

Il reconnaît avoir été informé que ces lettres recommandées électroniques seront envoyées par l’intermédiaire d’un tiers de confiance agréé, et qu’il existe une possibilité qu’elles soient classées par sa messagerie dans un dossier de courriers indésirables et qu’il devra donc vérifier le contenu de ce dossier sur sa messagerie.

Le MANDANT :
• reconnaît et garantit qu’il dispose de la maîtrise exclusive du compte e-mail qu'il a indiqué, notamment pour son accès régulier, la confidentialité des identifiants qui lui permettent d'y accéder et la gestion des paramètres de réception et de filtrage de courriers entrants,
• S’engage à signaler immédiatement toute perte ou usage abusif de son compte e-mail,
• Accepte que toute action effectuée au travers de son compte e-mail soit réputée effectuée par lui et relève de sa responsabilité exclusive pour toutes les conséquences légales et réglementaires des notifications.`;
  }
};

const getMandateObjectText = (type: string) => {
  switch (type) {
    case 'exclusive':
      return "Par le présent contrat, le MANDANT confère au MANDATAIRE, qui l'accepte, le Mandat EXCLUSIF DE RECHERCHER UN ACQUEREUR pour les biens immobiliers dont il est propriétaire et désignés ci-après, aux prix, charges et conditions indiqués ci-après.";
    case 'simple':
      return "Par le présent contrat, le MANDANT confère au MANDATAIRE, qui l'accepte, le Mandat SIMPLE DE RECHERCHER UN ACQUEREUR pour les biens immobiliers dont il est propriétaire et désignés ci-après, aux prix, charges et conditions indiqués ci-après.";
    case 'semi-exclusive':
      return "Par le présent contrat, le MANDANT confère au MANDATAIRE, qui l'accepte, le Mandat SEMI-EXCLUSIF DE RECHERCHER UN ACQUEREUR pour les biens immobiliers dont il est propriétaire et désignés ci-après, aux prix, charges et conditions indiqués ci-après.";
    default:
      return '';
  }
};

export async function generateMandateWord({
  mandate,
  sellers,
  propertyAddress,
  propertyType,
  coPropertyAddress,
  lots,
  officialDesignation,
  cadastralSections,
  occupationStatus,
  dpeStatus,
}: MandateWordProps): Promise<void> {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getSellerName = (seller: Seller) => {
    if (seller.type === 'individual') {
      return `${seller.title === 'Mrs' ? 'Madame' : 'Monsieur'} ${seller.firstName} ${seller.lastName}`;
    }
    return seller.companyName;
  };

  try {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Cover Page
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "MANDAT DE VENTE",
                size: 28,
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `N° ${mandate.mandate_number}`,
                size: 24,
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `En date du ${formatDate(mandate.date)}`,
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new ImageRun({
                data: await fetch("https://i.ibb.co/MfLxym5/Logo-en-jpeg.jpg").then(response => response.blob()).then(blob => blob.arrayBuffer()),
                transformation: {
                  width: 150,
                  height: 150,
                },
              }),
            ],
          }),

          // Sellers Section
          new Paragraph({
            children: [
              new TextRun({
                text: "ENTRE LES SOUSSIGNÉS",
                size: 24,
                bold: true,
              }),
            ],
          }),
          ...sellers.map((seller, index) =>
            formatSellerText(seller, sellers.length).map((line, lineIndex) =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: line,
                    size: 20,
                  }),
                ],
              })
            )
          ).flat(),

          // Mandataire Section
          new Paragraph({
            children: [
              new TextRun({
                text: "LE MANDATAIRE",
                size: 24,
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "2R IMMOBILIER, ci-après désignée \"l'Agence\" ou \"le Mandataire\", exploitée par la société 2R IMMOBILIER...",
                size: 20,
              }),
            ],
          }),

          // Mandate Object
          new Paragraph({
            children: [
              new TextRun({
                text: getMandateObjectText(mandate.type),
                size: 20,
              }),
            ],
          }),

          // Property Designation
          new Paragraph({
            children: [
              new TextRun({
                text: "DÉSIGNATION DES BIENS À VENDRE",
                size: 24,
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Adresse postale des biens : ${propertyAddress.fullAddress || 'Non renseignée'}`,
                size: 20,
              }),
            ],
          }),

          // Cadastral Sections Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Section", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "N°", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Lieu-dit", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Surface", bold: true })] })] }),
                ],
              }),
              ...cadastralSections.map((section) => (
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: section.section })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: section.number })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: section.lieuDit })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formatSurface(section.surface) })] })] }),
                  ],
                })
              )),
            ],
          }),

          // Occupation Status and DPE
          new Paragraph({
            children: [
              new TextRun({
                text: `ÉTAT D'OCCUPATION : ${occupationStatus === 'occupied-by-seller' ? 'Le bien est actuellement occupé par le(s) vendeur(s)' : occupationStatus === 'vacant' ? "Le bien est actuellement libre d'occupants" : "Le bien fait actuellement l'objet d'un bail en cours"}`,
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Diagnostic de Performance Énergétique : ${dpeStatus === 'completed' ? 'DPE déjà établi' : dpeStatus === 'in-progress' ? 'DPE en cours de réalisation' : "Le bien n'est pas soumis au DPE"}`,
                size: 20,
              }),
            ],
          }),

          // Price and Fees
          new Paragraph({
            children: [
              new TextRun({
                text: `PRIX DE VENTE DES BIENS : ${formatPrice(mandate.netPrice)}`,
                size: 20,
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `HONORAIRES DU MANDATAIRE : ${formatPrice(mandate.fees.ttc)} (supportés par ${mandate.feesPayer === 'seller' ? 'le MANDANT' : "l'ACQUEREUR"})`,
                size: 20,
              }),
            ],
          }),

          // Duration and Engagements
          new Paragraph({
            children: [
              new TextRun({
                text: getMandateDurationText(mandate.type),
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: getMandateEngagementsText(mandate.type),
                size: 20,
              }),
            ],
          }),

          // Footer
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 200 },
            children: [
              new TextRun({
                text: "2R IMMOBILIER - 92 Rue Saint-Denis, 77400 LAGNY-SUR-MARNE\nTél : 01.64.30.66.88 - Email : contact@2r-immobilier.fr",
                size: 20,
              }),
            ],
          }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `mandat-${mandate.mandate_number}.docx`);
  } catch (error) {
    console.error('Error generating Word document:', error);
    throw error;
  }
}
