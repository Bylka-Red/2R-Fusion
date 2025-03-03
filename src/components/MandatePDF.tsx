import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import type { Mandate, Seller, PropertyLot, CadastralSection, PropertyAddress } from '../types';

Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
      fontWeight: 'normal'
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
      fontWeight: 'bold'
    }
  ]
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Roboto',
    fontWeight: 'normal',
  },
  header: {
    marginBottom: 20,
    fontSize: 16,
    fontWeight: 'bold',
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    color: '#0b8043',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 15,
  },
  text: {
    marginBottom: 10,
    lineHeight: 1.5,
  },
  bold: {
    fontFamily: 'Roboto',
    fontWeight: 'bold',
  },
  table: {
    marginTop: 10,
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 8,
  },
  tableHeader: {
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 2,
    borderBottomColor: '#D1D5DB',
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 8,
  },
  tableCellHeader: {
    flex: 1,
    paddingHorizontal: 8,
    fontWeight: 'bold',
  },
  signature: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: '45%',
  },
  signatureTitle: {
    marginBottom: 50,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    textAlign: 'center',
    color: '#666',
  },
  coverPage: {
    height: '100%',
    position: 'relative',
  },
  agencyPhoto: {
    width: '100%',
    height: 300,
    objectFit: 'cover',
  },
  centerContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 0',
  },
  bottomContent: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  mandateTitle: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  mandateDate: {
    fontSize: 14,
    textAlign: 'center',
  },
  contentPage: {
    padding: 40,
    fontSize: 11,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#0b8043',
    marginBottom: 15,
    fontWeight: 'bold',
  },
  sellerInfo: {
    marginBottom: 15,
  },
  sellerLine: {
    marginBottom: 8,
  },
  sellerSeparator: {
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    borderBottomStyle: 'dashed',
  },
  separator: {
    fontSize: 14,
    color: '#0b8043',
    marginVertical: 15,
    fontWeight: 'bold',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#0b8043',
    marginLeft: 10,
  },
  lotNumber: {
    marginBottom: 5,
    fontWeight: 'bold',
    color: '#0b8043',
    textDecoration: 'underline',
  },
  lotDescription: {
    marginLeft: 20,
    marginBottom: 5,
  },
  lotTantieme: {
    marginLeft: 20,
    marginBottom: 10,
  },
  cadastralTable: {
    marginTop: 10,
    marginBottom: 15,
  },
  cadastralRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    minHeight: 30,
    alignItems: 'center',
  },
  cadastralHeader: {
    backgroundColor: '#E5E7EB',
    borderBottomWidth: 1,
    borderBottomColor: '#9CA3AF',
  },
  cadastralCell: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    flex: 1,
  },
  cadastralCellHeader: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 8,
    paddingHorizontal: 8,
    flex: 1,
    fontWeight: 'bold',
  },
  legalNotice: {
    fontSize: 10,
    color: '#666666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  checkbox: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: '#0b8043',
    marginRight: 10,
  },
  checked: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: '#0b8043',
    backgroundColor: '#0b8043',
    marginRight: 10,
  },
});

const numberToWords = (num: number): string => {
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

    return (hundred === 1 ? 'cent' : hundreds[hundred]) +
           (remainder === 0 ? '' : ' ' + numberToWords(remainder));
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

const formatSellerText = (seller: Seller, totalSellers: number): string[] => {
  const lines: string[] = [];

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

    lines.push(`${title} ${seller.firstName} ${seller.lastName.toUpperCase()}, né${seller.title === 'Mrs' ? 'e' : ''} le ${birthDate} à ${seller.birthPlace}, de nationalité ${seller.nationality}, ${seller.profession.toLowerCase()}, ${maritalStatusText}.`);
    lines.push(`Demeurant ${seller.address.fullAddress}.`);

    const shouldShowPropertyType = totalSellers === 1 &&
      !['celibataire-non-pacse', 'divorce', 'veuf'].includes(seller.maritalStatus);

    if (shouldShowPropertyType) {
      if (seller.propertyType === 'personal-not-family') {
        lines.push("Et déclarant que les biens à vendre, objet des présentes, lui appartiennent en propre et qu'ils ne constituent pas le logement de la famille, au sens de l'article 215 du Code civil.");
      } else if (seller.propertyType === 'personal-family') {
        lines.push("Et déclarant que les biens à vendre, objet des présentes, lui appartiennent en propre et que, constituant le logement de la famille, au sens de l'article 215 du Code civil, il s'engage à obtenir le consentement de son conjoint à leur vente.");
      }
    }

    lines.push(`${seller.hasFrenchTaxResidence ? 'Résident' : 'Non résident'} au sens de la réglementation fiscale.`);
    lines.push(`Téléphone : ${seller.phone} - Email : ${seller.email}`);
  } else {
    const managerTitle = seller.title === 'Mrs' ? 'Madame' : 'Monsieur';
    lines.push(`La société ${seller.companyName.toUpperCase()}, ${seller.legalForm} au capital de ${seller.capital} euros, RCS ${seller.rcsCity} N° ${seller.rcsNumber}, dont le siège social est situé ${seller.address.fullAddress}, représentée par ${managerTitle} ${seller.managerFirstName} ${seller.managerLastName.toUpperCase()}, en sa qualité de gérant.`);
    lines.push(`Téléphone : ${seller.phone} - Email : ${seller.email}`);
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

    return (hundred === 1 ? 'cent' : hundreds[hundred]) +
           (remainder === 0 ? '' : ' ' + formatPriceToWords(remainder));
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
      return "Le présent MANDAT NON EXCLUSIF, qui prendra effet le jour de sa signature, est consenti pour une durée de 12 mois au-delà de laquelle il prendra automatiquement fin. Passé un délai de trois mois à compter de sa signature, le mandat pourra toutefois être dénoncé à tout moment par chacune des parties, à charge pour celle qui entend y mettre fin d'en aviser l'autre partie quinze jours au moins à l'avance par lettre recommandée avec demande d'avis de réception, conformément aux dispositions du deuxième alinéa de l'article 78 du décret du 20 juillet 1972. Par dérogation aux dispositions de l’article 2003 du Code civil, le décès du MANDANT n’entrainera pas la résiliation du mandat, lequel se poursuivra avec ses ayants droit.";
    case 'exclusive':
      return "Le présent MANDAT EXCLUSIF, qui prendra effet le jour de sa signature, est consenti pour une durée de 3 mois. A l'issue de cette période initiale, il sera prorogé pour une durée de 12 mois, au terme de laquelle il prendra automatiquement fin. Toutefois, passé un délai de trois mois à compter de sa signature, il pourra être dénoncé à tout moment par chacune des parties avec un préavis de quinze jours, par lettre recommandée avec demande d’avis de réception. Il est rappelé que passé un délai de trois mois à compter de sa signature, le mandat qui est assorti d’une clause d’exclusivité ou d’une clause pénale, ou qui comporte une clause aux termes de laquelle des honoraires seront dus par le mandant même si l’opération est conclue sans les soins de l’intermédiaire, peut être dénoncé à tout moment par chacune des parties, à charge pour celle qui entend y mettre fin d’en aviser l’autre partie quinze jours au moins à l’avance par lettre recommandé avec demande d’avis de réception, conformément aux dispositions du deuxième alinéa de l’article 78 du décret du 20 juillet 1972. Le présent mandat ne peut être dénoncé que dans sa totalité et en aucun cas de façon partielle. Par dérogation aux dispositions de l’article 2003 du Code civil, le décès du MANDANT n’entrainera pas la résiliation du mandat, lequel se poursuivra avec ses ayants droit.";
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
    default:
      return '';
  }
};

interface MandatePDFProps {
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

export function MandatePDF({
  mandate,
  sellers = [],
  propertyAddress,
  propertyType,
  coPropertyAddress,
  lots = [],
  officialDesignation,
  cadastralSections,
  occupationStatus,
  dpeStatus
}: MandatePDFProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getMandateTypeText = (type: string) => {
    switch (type) {
      case 'simple':
        return 'SIMPLE';
      case 'exclusive':
        return 'EXCLUSIF';
      case 'semi-exclusive':
        return 'SEMI-EXCLUSIF';
      default:
        return type.toUpperCase();
    }
  };

  const getOccupationStatusText = (status: string) => {
    switch (status) {
      case 'occupied-by-seller':
        return 'Le bien est actuellement occupé par le(s) vendeur(s)';
      case 'vacant':
        return "Le bien est actuellement libre d'occupants";
      case 'rented':
        return "Le bien fait actuellement l'objet d'un bail en cours";
      default:
        return '';
    }
  };

  const getDPEStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'DPE déjà établi';
      case 'in-progress':
        return 'DPE en cours de réalisation';
      case 'not-required':
        return "Le bien n'est pas soumis au DPE";
      default:
        return '';
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

  const formatPrice = (price: number): string => {
    const priceWords = formatPriceToWords(price);
    return `${priceWords} EUROS (${price.toLocaleString('fr-FR')} €)`;
  };

  const formatFees = (fees: number): string => {
    const feesWords = formatPriceToWords(fees);
    return `${feesWords} EUROS (${fees.toLocaleString('fr-FR')} € TTC)`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.coverPage}>
          <Image
            src="https://static.wixstatic.com/media/05581d_90f3d4dd281c4d738284a09ec5b1060e~mv2.jpg"
            style={styles.agencyPhoto}
          />
          <View style={styles.centerContent}>
            <Image
              src="https://i.ibb.co/MfLxym5/Logo-en-jpeg.jpg"
              style={styles.logo}
            />
          </View>

          <View style={styles.bottomContent}>
            <Text style={styles.mandateTitle}>
              MANDAT DE VENTE {getMandateTypeText(mandate.type)} N° {mandate.mandateNumber}
            </Text>
            <Text style={styles.mandateDate}>
              En date du {formatDate(mandate.date)}
            </Text>
          </View>
        </View>
      </Page>

      <Page size="A4" style={styles.contentPage}>
        <Text style={[styles.header, { textAlign: 'center' }]}>
          MANDAT DE VENTE {getMandateTypeText(mandate.type)} N° {mandate.mandateNumber}
        </Text>

        <View style={styles.separatorContainer}>
          <Text style={styles.separator}>ENTRE LES SOUSSIGNÉS</Text>
          <View style={styles.separatorLine} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. {sellers.length > 1 ? 'LES MANDANTS' : 'LE MANDANT'}</Text>
          {sellers.map((seller, index) => (
            <View key={index} style={styles.sellerInfo}>
              {index > 0 && <View style={styles.sellerSeparator} />}
              {formatSellerText(seller, sellers.length).map((line, lineIndex) => (
                <Text key={`${index}-${lineIndex}`} style={styles.sellerLine}>
                  {line}
                  {lineIndex === formatSellerText(seller, sellers.length).length - 1 && (
                    <Text style={styles.legalNotice}>
                      {"\n"}En application de l'article L.223-2 du code de la consommation, le consommateur a le droit de s'inscrire à la liste Bloctel.
                    </Text>
                  )}
                </Text>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. LE MANDATAIRE</Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>2R IMMOBILIER</Text>, ci-après désignée "l'Agence" ou "le Mandataire", exploitée par la société <Text style={styles.bold}>2R IMMOBILIER</Text>, SAS au capital de 5 000 euros, dont le siège social est situé 92 Rue Saint-Denis, 77400 LAGNY-SUR-MARNE, RCS MEAUX N° 823 147 285, titulaire de la carte professionnelle Transactions sur immeubles et fonds de commerce n° CPI 3601 2016 000 013 324 délivrée par Seine et Marne, numéro de TVA FR56823147285, assurée en responsabilité civile professionnelle par GENERALI dont le siège est sis 7, Boulevard Haussmann, 75465 PARIS CEDEX 09, sur le territoire national sous le n° AL591311. Adhérente de la caisse de Garantie Compagnie Européenne de Garanties et de Cautions dont le siège est sis 16, Rue Hoche - Tour Kupka B -TSA 39999 - 92919 La Défense Cedex sous le n° 28308TRA161,{'\n'}
            DECLARANT NE POUVOIR NI RECEVOIR NI DETENIR D’AUTRES FONDS, EFFETS OU VALEURS QUE CEUX REPRESENTATIFS DE SA REMUNERATION{'\n'}
            N'ayant aucun lien capitalistique ou juridique avec une banque ou une société financière,{'\n'}
            Représentée par {mandate.commercial} <Text style={styles.bold}>KABACHE</Text>, agissant en sa qualité de Président, ayant tous pouvoirs à l'effet des présentes,
          </Text>
        </View>

        <View style={styles.separatorContainer}>
          <Text style={styles.separator}>IL A ÉTÉ CONVENU ET ARRÊTÉ CE QUI SUIT</Text>
          <View style={styles.separatorLine} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. OBJET DU MANDAT</Text>
          <Text style={styles.text}>
            {getMandateObjectText(mandate.type)}
          </Text>
        </View>

        <View style={styles.separatorContainer}>
          <Text style={styles.separator}>DÉSIGNATION DES BIENS À VENDRE</Text>
          <View style={styles.separatorLine} />
        </View>

        <View style={styles.section}>
          <View style={styles.text}>
            <Text style={styles.bold}>Adresse postale des biens : </Text>
            <Text>{propertyAddress.fullAddress || 'Non renseignée'}</Text>
          </View>

          <View style={styles.text}>
            <Text style={styles.bold}>DÉSIGNATION :</Text>
            <Text>
              {propertyType === 'copropriete'
                ? `Dans un ensemble immobilier situé : ${coPropertyAddress?.fullAddress}`
                : officialDesignation
              }
            </Text>
          </View>

          <Text style={styles.text}>
            {propertyType === 'copropriete'
              ? "Cet ensemble immobilier est édifié sur une parcelle de terrain cadastrée :"
              : "Ce bien immobilier est édifié sur une parcelle de terrain cadastrée :"
            }
          </Text>

          <View style={styles.cadastralTable}>
            <View style={[styles.cadastralRow, styles.cadastralHeader]}>
              <View style={styles.cadastralCellHeader}>
                <Text>Section</Text>
              </View>
              <View style={styles.cadastralCellHeader}>
                <Text>N°</Text>
              </View>
              <View style={[styles.cadastralCellHeader, { flex: 2 }]}>
                <Text>Lieu-dit</Text>
              </View>
              <View style={styles.cadastralCellHeader}>
                <Text>Surface</Text>
              </View>
            </View>
            {cadastralSections.map((section, index) => (
              <View key={index} style={styles.cadastralRow}>
                <View style={styles.cadastralCell}>
                  <Text>{section.section}</Text>
                </View>
                <View style={styles.cadastralCell}>
                  <Text>{section.number}</Text>
                </View>
                <View style={[styles.cadastralCell, { flex: 2 }]}>
                  <Text>{section.lieuDit}</Text>
                </View>
                <View style={styles.cadastralCell}>
                  <Text>{formatSurface(section.surface)}</Text>
                </View>
              </View>
            ))}
          </View>

          {propertyType === 'copropriete' && (
            <View>
              {lots.length > 0 && (
                <View style={styles.section}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.lotNumber}>
                      LOT NUMERO {numberToWords(parseInt(lots[0].number)).toUpperCase()} ({lots[0].number}) :
                    </Text>
                  </View>
                  <Text style={styles.lotDescription}>
                    {lots[0].description}
                  </Text>
                  {lots[0].tantiemes.map((tantieme, tantiemeIndex) => (
                    <Text key={tantiemeIndex} style={styles.lotTantieme}>
                      {formatTantieme(tantieme)}
                    </Text>
                  ))}

                  <View style={[styles.section, { marginTop: 10 }]}>
                    <Text style={[styles.text, { flexDirection: 'row' }]}>
                      <Text style={styles.bold}>Superficie – Mesurage : </Text>
                      <Text style={styles.bold}>{lots[0].carrezSurface} m²</Text>
                    </Text>

                    {lots[0].carrezGuarantor.type === 'owner' ? (
                      <Text style={styles.text}>
                        Le MANDANT reconnaît avoir reçu du MANDATAIRE le très vif conseil de recourir à un professionnel du métré pour le mesurage dit Carrez, et devoir supporter seul les conséquences d'un refus de suivre ce conseil, notamment celles liées à une action de l'acquéreur en réduction du prix si la superficie réelle est inférieure de plus de 5% à celle exprimée sous la seule et entière responsabilité du MANDANT.
                      </Text>
                    ) : (
                      <Text style={styles.text}>
                        La superficie privative du lot {lots[0].number} est de {lots[0].carrezSurface} m². (Attestation établie le {formatDate(lots[0].carrezGuarantor.date)} par la société {lots[0].carrezGuarantor.name})
                      </Text>
                    )}
                  </View>
                </View>
              )}

              {lots.slice(1).map((lot, index) => (
                <View key={index + 1} style={styles.section}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.lotNumber}>
                      LOT NUMERO {numberToWords(parseInt(lot.number)).toUpperCase()} ({lot.number}) :
                    </Text>
                  </View>
                  <Text style={styles.lotDescription}>
                    {lot.description}
                  </Text>
                  {lot.tantiemes.map((tantieme, tantiemeIndex) => (
                    <Text key={tantiemeIndex} style={styles.lotTantieme}>
                      {formatTantieme(tantieme)}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          )}

          <Text style={[styles.text, { display: 'flex', flexDirection: 'row' }]}>
            <Text style={styles.bold}>ÉTAT D'OCCUPATION :{' '}</Text>
            <Text>{getOccupationStatusText(occupationStatus)}</Text>
          </Text>

          <Text style={styles.text}>
            <Text style={styles.bold}>Diagnostic de Performance Énergétique :{'\u00A0'}</Text>
            {getDPEStatusText(dpeStatus)}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. PRIX DE VENTE - HONORAIRES DU MANDATAIRE</Text>
          <Text style={[styles.text, styles.bold]}>PRIX DE VENTE DES BIENS :</Text>
          <Text style={styles.text}>
            Les biens devront être présentés au prix de <Text style={styles.bold}>{formatPrice(mandate.netPrice)}</Text>, Le prix sera réglé comptant au plus tard le jour de la signature de l’acte authentique de vente. Le prix de mise en vente des biens a été fixé par le MANDANT après avoir pris connaissance de l’estimation qui en a été faite par le MANDATAIRE à partir des connaissances que ce dernier a du marché immobilier local et des prix pratiqués pour des biens présentant des caractéristiques similaires. Le prix de vente ci-dessus indiqué s’entend TTC de la TVA immobilière en vigueur à la charge du MANDANT si elle est due. Le MANDANT est informé qu’il pourra être assujetti le cas échéant à l’impôt sur les plus-values immobilières.
          </Text>
          <Text style={[styles.text, styles.bold]}>HONORAIRES DU MANDATAIRE :</Text>
          <Text style={styles.text}>
            En cas de réalisation de l’opération, les honoraires du MANDATAIRE seront supportés par {mandate.feesPayer === 'seller' ? 'le MANDANT' : 'l\'ACQUEREUR'} d'un montant de <Text style={styles.bold}>{formatFees(mandate.fees.ttc)}</Text>. Ces honoraires seront payés le jour de la signature de l’acte authentique de vente et le taux de TVA appliqué aux honoraires sera le taux en vigueur à la date de leur exigibilité. En cas d’exercice d’un droit de préemption ou d'une faculté de substitution, son bénéficiaire sera subrogé dans tous les droits et obligations de l’acquéreur. A ce titre, il sera notamment tenu de régler ces honoraires si leur paiement lui incombe.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. DURÉE DU MANDAT</Text>
          <Text style={styles.text}>
            {getMandateDurationText(mandate.type)}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. ACTIONS COMMERCIALES QUE LE MANDATAIRE S’ENGAGE À RÉALISER</Text>
          <Text style={styles.text}>
            En conséquence du présent mandat, le MANDATAIRE s'engage à réaliser à ses frais les actions de communication suivantes :
          </Text>
          <View style={styles.text}>
            <Text style={styles.bold}>• Réaliser un dossier de présentation des biens.</Text>
            <Text style={styles.bold}>• Réaliser un reportage photographique pour valoriser la présentation des biens.</Text>
            <Text style={styles.bold}>• Présenter l'annonce et la photo des biens en vitrine pendant une durée minimale de 90 jours, à moins que leur vente intervienne avant.</Text>
            <Text style={styles.bold}>• Diffuser l'annonce concernant les biens sur le site internet de l'Agence accessible au public.</Text>
            <Text style={styles.bold}>• Diffuser l'annonce concernant les biens sur les principaux sites internet immobiliers.</Text>
            <Text style={styles.bold}>• Publier l’annonce sur les réseaux sociaux de l’Agence (Facebook, Instagram, etc.).</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. RÉÉDITION DES COMPTES</Text>
          <Text style={styles.text}>
            Le MANDATAIRE s'engage à tenir informé le MANDANT du suivi de ses actions au moins une fois par semaine, et sous réserve que les biens aient été visités, à lui communiquer un compte-rendu des visites mentionnant les observations éventuelles des prospects.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. ENGAGEMENTS DU MANDANT</Text>
          <Text style={styles.text}>
            {getMandateEngagementsText(mandate.type)}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. COLLECTE ET EXPLOITATION DES DONNÉES PERSONNELLES</Text>
          <Text style={styles.text}>
            Le MANDANT est informé que les données à caractère personnel le concernant collectées par le MANDATAIRE à l’occasion des présentes feront l’objet de traitements informatiques nécessaires à leur exécution.
            Ces données seront conservées pendant toute la durée de l’exécution du présent contrat, augmentée des délais légaux de prescription applicable.
            Dans le cadre de l'exécution du contrat, ces données pourront être transmises à des ﬁns exclusivement techniques par le MANDATAIRE, responsable des traitements, à des prestataires informatiques assurant leur traitement, leur hébergement et leur archivage.
            Le MANDANT est également informé que ces données à caractère personnel pourront être utilisées par le MANDATAIRE dans le cadre de la gestion des ﬁchiers prospects et clients et pour les ﬁnalités associées à cette gestion, pour la réalisation d’opérations de marketing direct, pour la gestion des droits d’accès, de rectiﬁcation et d’opposition, ainsi que dans le cadre de la lutte contre le blanchiment de capitaux et le ﬁnancement du terrorisme.
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
            <View style={styles.checked} />
            <Text style={styles.text}>En cochant cette case, le MANDANT l'accepte expressément.</Text>
          </View>
          <Text style={styles.text}>
            Le MANDANT pourra demander au MANDATAIRE d’accéder aux données à caractère personnel le concernant, de les rectiﬁer, de les modiﬁer, de les supprimer, ou de s’opposer à leur exploitation en lui adressant un courriel en ce sens à contact@2r-immobilier.fr ou un courrier à l'adresse de l'Agence indiquée en tête des présentes.
            Toute réclamation pourra être introduite auprès de la Commission Nationale de l’Informatique et des Libertés.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. ÉLECTION DE DOMICILE</Text>
          <Text style={styles.text}>
            Les parties soussignées font élection de domicile chacune à leur adresse respective stipulée en tête du présent mandat.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. INFORMATION DU MANDANT</Text>
          <Text style={styles.text}>
            En sa qualité de consommateur, le MANDANT reconnaît avoir reçu du MANDATAIRE, avant la signature du présent mandat, toutes les informations utiles au titre de l'obligation d'information précontractuelle.
            Le MANDANT est également informé qu'il peut s'opposer à l'utilisation de ses coordonnées téléphoniques à des ﬁns de prospection commerciale en s'inscrivant sur la liste d'opposition au démarchage téléphonique soit en adressant un courrier à OPPOSETEL (92-98 boulevard Victor Hugo, 92110 CLICHY), soit en s’inscrivant sur la liste rouge disponible sur le site bloctel.gouv.fr.
            En cas de différend, le MANDANT est enﬁn informé qu'il devra adresser une réclamation écrite au MANDATAIRE. Si la réponse à sa réclamation ne le satisfait pas ou en l'absence de réponse dans un délai de 30 jours, le MANDANT pourra saisir le médiateur de la consommation compétent inscrit sur la liste des médiateurs agréés par la Commission d’évaluation et de contrôle de la médiation

            Nom du médiateur : CNPM – MEDIATION – CONSOMMATION
            Adresse Postale du médiateur : 27 Avenue de la Libération, 42400 SAINT-CHAMOND
            Site internet du médiateur : https://cnpm-mediation-consommation.eu
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>13. DÉLÉGATION DE MANDAT</Text>
          <Text style={styles.text}>
            Le MANDANT autorise expressément le MANDATAIRE, aux frais de ce dernier, à se substituer et à faire appel à tout concours en vue de mener à bonne fin la conclusion de la vente des biens objets du mandat de vente.
            Cette autorisation est donnée pour toute la durée du mandat.
            Le MANDATAIRE demeure à l’égard du MANDANT seul responsable de l’exécution de sa mission.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>14. DROIT DE RÉTRACTATION</Text>
          <Text style={styles.text}>
            Le présent mandat étant consenti hors établissement ou à distance, le MANDANT est informé qu'il bénéﬁcie, en application des dispositions des articles L. 221-18 et suivants du Code de la consommation, d’un délai de quatorze jours pour exercer, sans motif, son droit de rétractation. Il reconnaît avoir reçu du MANDATAIRE, préalablement à la conclusion du présent mandat, les informations prévues par l’article L. 221-5 dudit code.
            Le délai commencera à courir le premier jour qui suit la conclusion du présent mandat et prendra ﬁn à l'expiration de la dernière heure du dernier jour du délai. Si ce délai expire un samedi, un dimanche ou un jour férié ou chômé, il sera prorogé jusqu'au premier jour ouvrable suivant.
            S'il souhaite exercer son droit de rétractation, le MANDANT pourra utiliser le formulaire de rétractation annexé aux présentes ou notiﬁer sa décision en adressant au MANDATAIRE une déclaration écrite en ce sens, déclaration claire et dénuée d’ambiguïté. La charge de la preuve de l'exercice régulier du droit de rétractation incombant au MANDANT, il lui est conseillé d'adresser au MANDATAIRE, à l'adresse postale ﬁgurant en tête du présent mandat, une lettre recommandée avec demande d'avis de réception.
            L’exercice du droit de rétractation mettra fin aux obligations réciproques des parties d’exécuter le contrat.
            Le MANDANT est informé que le MANDATAIRE ne commencera à exécuter sa mission qu'à l'issue du délai de rétractation du MANDANT. Cependant, il peut, s'il le souhaite, au moyen d'une demande expresse formulée sur tout support durable, lui demander d'anticiper son intervention sans attendre la ﬁn de ce délai.
            Dans ce cas, il conservera néanmoins son droit de se rétracter, dans les délais et formes décrites ci-dessus.
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
            <View style={styles.checked} />
            <Text style={styles.text}>En cochant cette case, le MANDANT DEMANDE EXPRESSEMENT AU MANDATAIRE de commencer à exécuter le présent mandat dès sa signature, sans attendre la ﬁn du délai de rétractation de quatorze jours.</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
            <View style={styles.checkbox} />
            <Text style={styles.text}>En cochant cette case, le MANDANT INDIQUE QU'IL NE SOUHAITE PAS QUE LE MANDATAIRE commence à exécuter le présent mandat dès sa signature. L'exécution du mandat débutera après la ﬁn du délai de rétractation de quatorze jours, à moins d'une demande expresse ultérieure d'exécution anticipée formulée par le mandant.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>15. DATE ET SIGNATURES</Text>
          <Text style={styles.text}>
            Fait à LAGNY-SUR-MARNE, le {formatDate(mandate.date)} et signé électroniquement par l’ensemble des Parties, chacune d’elles en conservant un exemplaire original sur un support durable garantissant l'intégrité de l'acte.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
