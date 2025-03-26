import type { Seller } from '../types';

const formatDate = (date: string): string => {
  const d = new Date(date);
  const months = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

export const generateCivilStatus = (sellers: Seller[]): string => {
  if (sellers.length === 1) {
    const seller = sellers[0];
    const title = seller.title === 'Mrs' ? 'Madame' : 'Monsieur';
    let text = `${title} ${seller.firstName} ${seller.lastName.toUpperCase()}`;

    if (seller.birthDate && seller.birthPlace) {
      text += `, né${seller.title === 'Mrs' ? 'e' : ''} le ${formatDate(seller.birthDate)} à ${seller.birthPlace.toUpperCase()}`;
      if (seller.birthPostalCode) {
        text += ` (${seller.birthPostalCode})`;
      }
    }

    text += `, de nationalité ${seller.nationality || 'Française'}`;
    if (seller.profession) {
      text += `, ${seller.profession}`;
    }
    text += '.\n';

    if (seller.address) {
      text += `Demeurant ${typeof seller.address === 'string' ? seller.address : seller.address.fullAddress}.\n`;
    }

    text += `${seller.hasFrenchTaxResidence ? 'Résident' : 'Non résident'} au sens de la réglementation fiscale.\n\n`;

    switch (seller.maritalStatus) {
      case 'celibataire-non-pacse':
        text += 'Déclarant être célibataire non lié par un Pacte civil de solidarité.';
        break;
      case 'celibataire-pacse':
        text += `Déclarant être célibataire soumis à un Pacte civil de solidarité conclu avec ${seller.pacsDetails?.partnerName || ''} et enregistré le ${seller.pacsDetails?.date ? formatDate(seller.pacsDetails.date) : ''}.`;
        break;
      case 'divorce':
        text += `Divorcé${seller.title === 'Mrs' ? 'e' : ''} de ${seller.divorceDetails?.exSpouseName || ''}, non remarié${seller.title === 'Mrs' ? 'e' : ''}.`;
        break;
      case 'veuf':
        text += `Déclarant être veuf${seller.title === 'Mrs' ? 've' : ''} de ${seller.widowDetails?.deceasedSpouseName || ''}, non remarié${seller.title === 'Mrs' ? 'e' : ''}.`;
        break;
    }

    return text;
  }

  if (sellers.length === 2) {
    let text = '';

    sellers.forEach((seller, index) => {
      const title = seller.title === 'Mrs' ? 'Madame' : 'Monsieur';
      text += `${title} ${seller.firstName} ${seller.lastName.toUpperCase()}`;

      if (seller.birthDate && seller.birthPlace) {
        text += `, né${seller.title === 'Mrs' ? 'e' : ''} le ${formatDate(seller.birthDate)} à ${seller.birthPlace.toUpperCase()}`;
        if (seller.birthPostalCode) {
          text += ` (${seller.birthPostalCode})`;
        }
      }

      text += `, de nationalité ${seller.nationality || 'Française'}`;
      if (seller.profession) {
        text += `, ${seller.profession}`;
      }
      text += '.\n';

      if (seller.address) {
        text += `Demeurant ${typeof seller.address === 'string' ? seller.address : seller.address.fullAddress}.\n`;
      }

      text += `${seller.hasFrenchTaxResidence ? 'Résident' : 'Non résident'} au sens de la réglementation fiscale.\n\n`;
    });

    const marriageDetails = sellers[0].marriageDetails;
    if (marriageDetails?.date && marriageDetails?.place) {
      switch (sellers[0].maritalStatus) {
        case 'communaute-acquets':
          text += `Marié sous le régime de la communauté de biens réduite aux acquêts à leur union célébrée à la mairie de ${marriageDetails.place.toUpperCase()} le ${formatDate(marriageDetails.date)}.\n`;
          break;
        case 'separation-biens':
          text += `Marié sous le régime de la séparation de biens à leur union célébrée à la mairie de ${marriageDetails.place.toUpperCase()} le ${formatDate(marriageDetails.date)}.\n`;
          break;
        case 'communaute-universelle':
          text += `Marié sous le régime de la communauté universelle à leur union célébrée à la mairie de ${marriageDetails.place.toUpperCase()} le ${formatDate(marriageDetails.date)}.\n`;
          break;
        default:
          text += `Marié à leur union célébrée à la mairie de ${marriageDetails.place.toUpperCase()} le ${formatDate(marriageDetails.date)}.\n`;
      }
      text += `Statut matrimonial qui n'a subi à ce jour aucune modification conventionnelle ou judiciaire.`;
    } else if (sellers[0].maritalStatus === 'celibataire-non-pacse' && sellers[1].maritalStatus === 'celibataire-non-pacse') {
      text += 'Célibataires non liés par un Pacte civil de solidarité, ainsi déclaré.';
    } else if (sellers[0].maritalStatus === 'celibataire-pacse' && sellers[1].maritalStatus === 'celibataire-pacse') {
      const pacsDetails = sellers[0].pacsDetails;
      if (pacsDetails?.date) {
        text += `Déclarant être célibataires soumis ensemble à un Pacte civil de solidarité régulièrement enregistré le ${formatDate(pacsDetails.date)}.`;
      }
    }

    return text;
  }

  return '';
};
