import type { Seller } from '../types';

const formatDate = (date: string): string => {
  const d = new Date(date);
  const months = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

const getMaritalStatusText = (seller: Seller): string => {
  switch (seller.maritalStatus) {
    case 'celibataire-non-pacse':
      return 'Célibataire non lié(e) par un PACS';
    case 'celibataire-pacse':
      return 'Célibataire lié(e) par un PACS';
    case 'marie-sans-contrat':
      return 'Marié(e) sans contrat de mariage';
    case 'communaute-acquets':
      return 'Marié(e) sous le régime de la communauté d\'acquêts';
    case 'separation-biens':
      return 'Marié(e) sous le régime de la séparation de biens';
    case 'communaute-universelle':
      return 'Marié(e) sous le régime de la communauté universelle';
    case 'divorce':
      return 'Divorcé(e), non remarié(e)';
    case 'veuf':
      return 'Veuf(ve), non remarié(e)';
    case 'autre':
      return seller.customMaritalStatus || 'Autre situation matrimoniale';
    default:
      return '';
  }
};

const getMarriageRegimeText = (regime: string): string => {
  switch (regime) {
    case 'community':
      return 'communauté de biens réduite aux acquêts';
    case 'separation':
      return 'séparation de biens';
    case 'universal':
      return 'communauté universelle';
    default:
      return regime;
  }
};

export const generateCivilStatus = (sellers: Seller[]): string => {
  let civilStatus = sellers.map((seller, index) => {
    const title = seller.title === 'Mrs' ? 'Madame' : 'Monsieur';
    const gender = seller.title === 'Mrs' ? 'e' : '';

    let text = `${title} ${seller.firstName} ${seller.lastName.toUpperCase()}`;

    // Date et lieu de naissance
    if (seller.birthDate && seller.birthPlace) {
      text += `, né${gender} le ${formatDate(seller.birthDate)} à ${seller.birthPlace.toUpperCase()}`;
      if (seller.birthPostalCode) {
        text += ` (${seller.birthPostalCode})`;
      }
    }

    // Nationalité et profession
    text += `, de nationalité ${seller.nationality || 'française'}`;
    if (seller.profession) {
      text += `, ${seller.profession}`;
    }

    text += `.\n`;

    // Adresse
    if (seller.address) {
      text += `Demeurant ${typeof seller.address === 'string' ? seller.address : seller.address.fullAddress}.\n`;
    }

    // Statut fiscal
    text += `${seller.hasFrenchTaxResidence ? 'Résident' : 'Non résident'} au sens de la réglementation fiscale.\n`;

    // Détails spécifiques selon le statut matrimonial
    if (seller.maritalStatus === 'celibataire-pacse' && seller.pacsDetails) {
      text += `\nAyant conclu un pacte civil de solidarité`;
      if (seller.pacsDetails.partnerName) {
        text += ` avec ${seller.pacsDetails.partnerName}`;
      }
      if (seller.pacsDetails.date) {
        text += `, enregistré le ${formatDate(seller.pacsDetails.date)}`;
      }
      if (seller.pacsDetails.place) {
        text += ` à ${seller.pacsDetails.place}`;
      }
      if (seller.pacsDetails.reference) {
        text += `\nNuméro d'enregistrement : ${seller.pacsDetails.reference}`;
      }
      text += '.\nContrat non modifié depuis lors.\n';
    }

    // Divorce
    if (seller.maritalStatus === 'divorce' && seller.divorceDetails?.exSpouseName) {
      text += `\nDivorcé${gender} de ${seller.divorceDetails.exSpouseName}.\n`;
    }

    // Veuvage
    if (seller.maritalStatus === 'veuf' && seller.widowDetails?.deceasedSpouseName) {
      text += `\nVeuf${gender} de ${seller.widowDetails.deceasedSpouseName}.\n`;
    }

    // Ajouter les détails du mariage pour un seul vendeur
    if (sellers.length === 1 && needsMarriageDetails(seller.maritalStatus) && seller.marriageDetails) {
      let regimeText = '';
      switch (seller.maritalStatus) {
        case 'communaute-acquets':
          regimeText = 'communauté de biens réduite aux acquêts';
          break;
        case 'separation-biens':
          regimeText = 'séparation de biens';
          break;
        case 'communaute-universelle':
          regimeText = 'communauté universelle';
          break;
        default:
          regimeText = 'communauté de biens réduite aux acquêts';
      }

      text += `\nMarié${gender} sous le régime de la ${regimeText}`;
      if (seller.marriageDetails.date && seller.marriageDetails.place) {
        text += ` à leur union célébrée à la mairie de ${seller.marriageDetails.place.toUpperCase()} le ${formatDate(seller.marriageDetails.date)}`;
      }
      text += '.\nStatut matrimonial qui n\'a subi à ce jour aucune modification conventionnelle ou judiciaire.\n';
    }

    // Ajouter le statut "Célibataire, non lié(e) par un PACS" pour un seul vendeur
    if (sellers.length === 1 && seller.maritalStatus === 'celibataire-non-pacse') {
      text += `\nCélibataire, non lié(e) par un PACS.\n`;
    }

    // Informations de contact pour un seul vendeur
    if (sellers.length === 1) {
      text += `\nTéléphone : ${seller.phone} – Adresse électronique : ${seller.email}\n`;
      text += "En application de l'article L.223-2 du code de la consommation, le consommateur a le droit de s'inscrire à la liste Bloctel.\n";
    }

    return text;
  }).join('\n');

  // Ajouter les détails du mariage après les informations des deux vendeurs
  if (sellers.length > 1 && sellers[0].maritalStatus === 'communaute-acquets' && sellers[0].marriageDetails) {
    const gender = sellers[0].title === 'Mrs' ? 'e' : '';
    civilStatus += `\nMarié${gender} sous le régime de la communauté de biens réduite aux acquêts` +
                   ` à leur union célébrée à la mairie de ${sellers[0].marriageDetails.place.toUpperCase()} le ${formatDate(sellers[0].marriageDetails.date)}.` +
                   `\nStatut matrimonial qui n'a subi à ce jour aucune modification conventionnelle ou judiciaire.`;
  }

  return civilStatus;
};

const needsMarriageDetails = (status: string): boolean => {
  return [
    'marie-sans-contrat',
    'communaute-acquets',
    'separation-biens',
    'communaute-universelle'
  ].includes(status);
};
